// Task5 —— 原子商店事务。
//
// 目标（批准设计）：
//   * 拒绝 / 失败路径**可证明零变化**：不扣费、不抽 RNG、不改玩家、库存、账本、遥测。
//   * **先提交后发布**：完整候选快照（active+meta+回执）保存成功之后才改可见状态。
//   * 成功请求**先查回执**（同 requestId 同内容 → 返回原结果），再查版本/库存 —— 因此
//     玩家走远后重放仍返回成功，而不会二次扣款。
//   * 回执有界；满了拒新请求，但**不淘汰旧成功请求**（否则旧请求可被重发再次扣款）。
//
// 本模块只做"校验 → 纯计划 → 应用到纯 draft"。真正的写入/发布由 Game 执行，
// 因为只有 Game 拥有 SaveStore、场景对象与真实 Player 入口。
import { WEAPON_MAP, ITEM_MAP, ACTIVE_MAP } from './data.js';
import {pregeneratedWeaponDefinition,validWeaponAssetStateShape} from './weapon_compatibility.js';
import { spellFromWeapon } from './spells.js';
import { ATTACH_MAP } from './attachments.js';
import {validAttachmentPositions} from './equipment_drops.js';
import {WeaponAssetsRuntime} from './weapon_assets_runtime.js';
import { acquisitionProjection } from './acquisition_projection.js';
import {ammoTargets} from './shared_mana.js';
import {observeResource,resourceSnapshot} from './resource_observation.js';
import { commitSupplyClaim } from './build_supply_bridge.js';

export const SHOP_TX_VERSION = 1;
export const SHOP_JOURNAL_MAX = 256;

const fingerprintOf = (shopId, revision, offerId, replaceIndex) => `${shopId}|${revision}|${offerId}${replaceIndex === undefined || replaceIndex === null ? '' : `|r${replaceIndex}`}`;
const clone = (v) => JSON.parse(JSON.stringify(v));
function validStockWeaponCarry(record,def){
  if(!validWeaponAssetStateShape(record.assetState))return false;
  if(record.assetInstanceId!==undefined&&(typeof record.assetInstanceId!=='string'||!record.assetInstanceId))return false;
  if(record.mag!==undefined&&(!Number.isFinite(record.mag)||record.mag<0))return false;
  if(record.reserve!==undefined&&(!(record.reserve>=0)||!Number.isFinite(record.reserve)&&!(record.reserve===Infinity&&!def.ammoType&&!def.isSpell)))return false;
  if(record.dmgMul!==undefined&&(!Number.isFinite(record.dmgMul)||record.dmgMul<=0))return false;
  if(record.attachments!==undefined&&(!Array.isArray(record.attachments)||record.attachments.some(id=>!Object.hasOwn(ATTACH_MAP,id))))return false;
  if(!validAttachmentPositions({...record,attachments:record.attachments||[]}))return false;
  if(record.assetState!==undefined&&record.assetState!==null){
    try{
      const runtime=new WeaponAssetsRuntime({});if(!runtime.supports(def))return false;
      runtime.bindInventory({weapons:[{...structuredClone(record),def}]});runtime.restore(runtime.capture());
    }catch{return false;}
  }
  return true;
}

export function newShopJournal(runId) {
  return { version: SHOP_TX_VERSION, runId, sequence: 0, shops: {}, receipts: [] };
}
export function shopIdFor(game) { return `${game.runId}:${game.floor}:${game.room.uid}:shop`; }
export function shopRevision(journal, shopId) { return (journal && journal.shops && journal.shops[shopId]) || 0; }

// 不可变只读模型：UI 只读它，拿不到 Three / Player / 可变引用。
export function getShopView(game) {
  const scene = game.roomScene;
  const content = game.room?.content;
  if (!scene || !content) return null;
  const p = game.player;
  const offers = (scene.shopSlots || []).map((slot, i) => {
    const it = slot.item || {};
    const id = it.id || it.kind;
    const def = it.kind==='weapon'?pregeneratedWeaponDefinition(it):({item:ITEM_MAP,active:ACTIVE_MAP})[it.kind]?.[id];
    return {
      offerId: `slot:${i}`, slotIndex: i, kind: it.kind, id, price: it.price | 0,
      cn: def?.cn || id, desc: def?.desc || '',
      stock: slot.sold ? 0 : 1, sold: !!slot.sold,
      eligible: null,                                 // 由 purchaseOffer 复检，不在此抽样
    };
  });
  return { shopId: shopIdFor(game), revision: shopRevision(game.shopTx, shopIdFor(game)), coins: p ? p.coins : 0, offers, services: serviceView(game) };
}

function serviceView(game) {
  const content = game.room?.content;
  const p = game.player;
  if (!content) return [];
  return ['ammo', 'heal', 'reroll'].map((id) => ({
    offerId: `service:${id}`, id, price: servicePriceFor(id, game.floor),
    left: serviceLeftFor(content, id, game.floor),
    usable: id === 'ammo' ? ammoUsable(p) : id === 'heal' ? p && p.hp < p.maxHp : true,
  }));
}
// 与 economy.js 保持一致（避免在此重复 import 造成循环；数值来自批准合同）。
const SERVICE_PRICE = { ammo: 14, heal: 26, reroll: 18 };
const SERVICE_USES = { ammo: 2, heal: 1, reroll: 1 };
function servicePriceFor(id, floor) { return Math.round((SERVICE_PRICE[id] || 0) * (1 + (floor - 1) * 0.35)); }
function serviceUsesFor(id, floor) { return (SERVICE_USES[id] || 0) + (floor >= 3 && (id === 'ammo' || id === 'heal') ? 1 : 0); }
function serviceLeftFor(content, id, floor) { return Math.max(0, serviceUsesFor(id, floor) - ((content?.servicesUsed?.[id]) || 0)); }
function ammoUsable(p) { const w = p && p.weapon; if (!w || !w.def?.ammoType) return false; const max = Math.round((w.def.ammoMax || 0) * (p.stats.ammoMaxMul || 1)); return w.reserve < max; }

// 纯规划：不触碰 live 对象、不抽 RNG。
export function planPurchase(game, { offerId, kind, replaceIndex = undefined }) {
  const p = game.player, scene = game.roomScene, content = game.room?.content;
  if (!p || !scene || !content) return { ok: false, reason: '商店状态不可用' };
  if (replaceIndex !== undefined && replaceIndex !== null && !Number.isInteger(replaceIndex)) return { ok: false, reason: '替换目标无效' };

  if (kind === 'service') {
    const id = offerId.slice('service:'.length);
    if (!Object.hasOwn(SERVICE_PRICE, id)) return { ok: false, reason: '未知服务' };
    const left = serviceLeftFor(content, id, game.floor);
    if (left <= 0) return { ok: false, reason: '本店该服务已用尽' };
    const price = servicePriceFor(id, game.floor);
    if (p.coins < price) return { ok: false, reason: '金币不足' };
    if (id === 'ammo') {
      if (!ammoUsable(p)) return { ok: false, reason: p.weapon?.def?.ammoType ? '备弹已满' : '当前武器不需要弹药' };
      const max = Math.round((p.weapon.def.ammoMax || 0) * (p.stats.ammoMaxMul || 1));
      return { ok: true, service: id, price, plan: { coinDelta: -price, ammo: max, serviceUsed: id } };
    }
    if (id === 'heal') {
      if (p.hp >= p.maxHp) return { ok: false, reason: '生命已满' };
      const gain = Math.min(2, p.maxHp - p.hp);
      return { ok: true, service: id, price, plan: { coinDelta: -price, heal: gain, serviceUsed: id } };
    }
    // reroll：纯库存替换，由 Game 用 room.seed + 已用次数决定（不消费 gameplay RNG）
    return { ok: true, service: id, price, plan: { coinDelta: -price, serviceUsed: id, reroll: true } };
  }

  // 商品
  const slotIndex = Number(String(offerId).slice('slot:'.length));
  const slot = (scene.shopSlots || [])[slotIndex];
  if (!Number.isInteger(slotIndex) || !slot) return { ok: false, reason: '货架不存在' };
  if (slot.sold) return { ok: false, reason: '已售出' };
  const it = slot.item || {};
  const id = it.id || it.kind;
  const price = it.price | 0;
  if (!Number.isInteger(price) || price < 0) return { ok: false, reason: '价格无效' };
  if (p.coins < price) return { ok: false, reason: '金币不足' };

  const plan = { coinDelta: -price, soldSlot: slotIndex };
  switch (it.kind) {
    case 'weapon': {
      let def;try{def=pregeneratedWeaponDefinition(it);}catch{return {ok:false,reason:'未知武器'};}
      if (!def) return { ok: false, reason: '未知武器' };
      // 钟术师：普通武器会被转成法术核心。draft 必须与 live 得到同一个定义，否则先存的
      // 快照与随后发布的实例会分叉。
      if (p.hero?.augment === 'spellcore' && !def.isSpell) def = spellFromWeapon(def) || def;
      if(!validStockWeaponCarry(it,def))return {ok:false,reason:'武器库存实例无效'};
      const carry={...structuredClone(it),definitionVersion:def.weaponAssetVersion||1};
      const ownsSame = p.weapons.some((w) => w.def.id === def.id);
      if (ownsSame && ![2, 3].includes(def.weaponAssetVersion) && def.id === id) return { ok: true, kind: 'weapon', price, delivery: 'recycle', credit: 8, plan: { coinDelta: -price + 8, soldSlot: slotIndex } };
      const slots = p.weaponSlots();
      if (p.weapons.length >= slots) {
        // 满槽：只有玩家**显式指定**要换掉哪一把才允许（不静默替换）。
        if (replaceIndex === undefined || replaceIndex === null) return { ok: false, reason: `武器槽已满（${slots}）`, needReplace: true, slots };
        if (replaceIndex < 0 || replaceIndex >= p.weapons.length) return { ok: false, reason: '替换目标无效' };
        plan.weapon = { id: def.isSpell ? def.id : id, def, carry, replaceIndex };
        plan.droppedWeapon = replaceIndex;
        return { ok: true, kind: 'weapon', price, delivery: 'replace', plan };
      }
      plan.weapon = { id: def.isSpell ? def.id : id, def, carry, replaceIndex: undefined };
      return { ok: true, kind: 'weapon', price, delivery: 'acquire', plan };
    }
    case 'item':
      if (p.items.includes(id)) return { ok: false, reason: '已拥有该遗物（不重复购买）' };
      plan.item = id; return { ok: true, kind: 'item', price, delivery: 'acquire', plan };
    case 'active':
      if (p.actives.includes(id)) return { ok: true, kind: 'active', price, delivery: 'recycle', credit: 10, plan: { coinDelta: -price + 10, soldSlot: slotIndex } };
      plan.active = id; return { ok: true, kind: 'active', price, delivery: 'acquire', plan };
    case 'attachment':
      if ((p.spareAttachments || []).length >= p.spareCap()) return { ok: false, reason: `备用配件库已满（${p.spareCap()}）` };
      plan.attachment = id; return { ok: true, kind: 'attachment', price, delivery: 'acquire', plan };
    case 'heal': {
      if (p.hp >= p.maxHp && !hasHealHook(p)) return { ok: false, reason: '生命已满' };
      if (p.hp >= p.maxHp) { plan.phrase = 1; return { ok: true, kind: 'heal', price, delivery: 'acquire', plan }; }
      plan.heal = 1; return { ok: true, kind: 'heal', price, delivery: 'acquire', plan };
    }
    case 'key': plan.keys = 1; return { ok: true, kind: 'key', price, delivery: 'acquire', plan };
    case 'armor': plan.armor = 1; return { ok: true, kind: 'armor', price, delivery: 'acquire', plan };
    case 'ammo': {
      let gain = 0;
      for (const w of ammoTargets(p)) if (w.def.ammoType) { const cap = Math.round(w.def.ammoMax * (p.stats.ammoMaxMul || 1)); if (w.reserve < cap) gain++; }
      if (!gain) return { ok: false, reason: '无需弹药' };
      plan.ammoAll = true; return { ok: true, kind: 'ammo', price, delivery: 'acquire', plan };
    }
    default: return { ok: false, reason: '未知商品' };
  }
}
function hasHealHook(p) { return !!(p.hero && p.hero.hook && p.hero.hook.onHeal); }

// Shared original Player effects for single-player and PartyDraft.
export function applyPurchaseToProjection(projection,plan,{price=0}={}) {
  const p = projection.player, ctx = projection.game;
  if (plan.coinDelta) p.coins = Math.max(0, p.coins + plan.coinDelta);
  if (plan.keys) p.keys += plan.keys;
  if (plan.armor) p.armor = Math.min(5, p.armor + plan.armor);
  if (plan.phrase) { p.phrase = Math.min(5, (p.phrase | 0) + plan.phrase); p.recompute(); }
  if (plan.heal) p.heal(plan.heal, 'shop');
  if (plan.item && !p.addItem(plan.item)) throw new Error('遗物获取失败');
  if (plan.active && !p.giveActive(plan.active)) throw new Error('主动技能获取失败');
  if (plan.attachment && !p.addAttachment(plan.attachment)) throw new Error('配件获取失败');
  if (plan.ammo) p.weapon.reserve = plan.ammo;
  if (plan.ammoAll) {
    let gain = 0;
    for (const w of ammoTargets(p)) if (w.def.ammoType) {
      const cap = Math.round(w.def.ammoMax * (p.stats.ammoMaxMul || 1));
      const next = Math.min(cap, w.reserve + (w.def.ammoPickup || 5));
      gain += Math.max(0, next - w.reserve); w.reserve = next;
    }
    if (gain) ctx.telAmmo('in', gain);
  }
  if (plan.weapon && !p.giveWeapon(plan.weapon.id, plan.weapon.replaceIndex ?? -1,plan.weapon.carry)) throw new Error('武器获取失败');
  ctx._shopBought = true;
  ctx.telCoins('out', 'shop', price);
  ctx.tel.purchases = (ctx.tel.purchases || 0) + 1;
  if (plan.serviceUsed) ctx.telService(plan.serviceUsed);
}

// 把计划写进纯 draft（active 会话）。返回 draft（新对象）。
export function applyPlanToDraft(draft, liveGame, plan, { journal, rerollStock = null, metaDraft = {}, price = 0 } = {}) {
  const projection = acquisitionProjection(liveGame, draft, metaDraft);
  const ctx=projection.game;
  applyPurchaseToProjection(projection,plan,{price});
  const receipt=journal?.receipts?.at(-1);
  observeResource(ctx,'shop',{price,offerId:receipt?.offerId||'',receipt:receipt?.id||''},resourceSnapshot(liveGame.player),receipt?.id||'');
  projection.finish();
  const uid = liveGame.room.uid;
  if (plan.soldSlot !== undefined) {
    for (const sc of [draft.roomStates[uid].scene, draft.scenes[uid]]) if (sc) sc.sold[plan.soldSlot] = true;
    draft.roomStates[uid].pickups = draft.roomStates[uid].pickups.filter(x => x.shopIndex !== plan.soldSlot);
    const ref = liveGame.roomScene.shopSlots[plan.soldSlot]?.supplyRef;
    if (ref && draft.buildSupply) {
      const ledger = { buildSupply: draft.buildSupply };
      if (!commitSupplyClaim(ledger, ref).ok) throw new Error('路线领取账无效');
      draft.buildSupply = ledger.buildSupply;
    }
  }
  if (plan.serviceUsed) {
    const room = draft.dungeon.rooms.find((r) => r.uid === liveGame.room.uid);
    if (room) room.content.servicesUsed = { ...(room.content.servicesUsed || {}), [plan.serviceUsed]: ((room.content.servicesUsed?.[plan.serviceUsed]) || 0) + 1 };
  }
  if (plan.reroll && Array.isArray(rerollStock)) {
    const uid = liveGame.room.uid;
    const room = draft.dungeon.rooms.find((r) => r.uid === uid);
    if (room) room.content.shopStock = rerollStock.map((x) => ({ ...x }));
    // 场景快照保存的是 sold[] + shopStock[]（importState 会据此重建货架），
    // 刷新必须同时改这两处，否则冷恢复会把旧商品带回来。
    for (const sc of [draft.roomStates?.[uid]?.scene, draft.scenes?.[uid]]) {
      if (!sc) continue;
      sc.shopStock = rerollStock.map((x) => ({ ...x }));
      sc.sold = rerollStock.map(() => false);
    }
  }
  if (journal) draft.shopTx = journal;
  return projection;
}

// 组装一份完整回执。
export function makeReceipt(journal, { requestId, shopId, revision, offerId, kind, price, credit, replaceIndex, result }) {
  const next = clone(journal);
  next.sequence = (next.sequence || 0) + 1;
  next.shops = { ...next.shops, [shopId]: revision + 1 };
  const receipt = { id: `${next.runId}:tx:${next.sequence}`, sequence: next.sequence, requestId, shopId, revision, fingerprint: fingerprintOf(shopId, revision, offerId, replaceIndex), offerId, kind, price, credit: credit || 0, ...(replaceIndex !== undefined && replaceIndex !== null ? { replaceIndex } : {}), result };
  next.receipts = [...next.receipts, receipt];
  return { journal: next, receipt };
}

export function hasReceipt(receipts, requestId) { return (receipts || []).find((r) => r.requestId === requestId) || null; }
export { fingerprintOf };
