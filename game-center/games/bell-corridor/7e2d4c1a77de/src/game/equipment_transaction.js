import { captureSessionDraft, validateSession, fields } from './session.js';
import { acquisitionProjection, publishAcquisition, publishDrops } from './acquisition_projection.js';
import { saveStore } from './save.js';
import { meta } from './meta.js';
import { commitSupplyClaim } from './build_supply_bridge.js';
import { audio } from '../core/audio.js';
import { pickupReady, pickupPathClear } from './pickup_path.js';
import {validWeaponAssetStateShape} from './weapon_compatibility.js';
import { ammoTargets } from './shared_mana.js';
import {observeResource,resourceSnapshot} from './resource_observation.js';

// Presentation-only memory: repeated collision attempts must not flood the HUD
// or persist an artificial pickup state. A changed reason can be reported again.
const pickupBlocks = new WeakMap();
export function reportPickupBlock(game, pickup, why) {
  if (pickupBlocks.get(pickup) !== why) {
    pickupBlocks.set(pickup, why);
    game.toast('未领取', why, '#ff6a3a', 'fail');
  }
  return false;
}

// Both ordinary drops and durable supply grants execute the same ammo rules.
// ammoTargets keeps the Arcanist's shared pool from receiving multiple refills.
export function applyAmmoPickup(player) {
  let before=null,pools=[];
  try{before=resourceSnapshot(player);pools=ammoTargets(player).filter(w=>w.def.ammoType).map(w=>({w,reserve:w.reserve,requested:w.def.ammoPickup||5}));}catch{/* Optional sampling only. */}
  let refilled = false;
  for (const w of ammoTargets(player)) {
    if (w.def.ammoType) {
      const max = Math.round(w.def.ammoMax * player.stats.ammoMaxMul);
      if (w.reserve < max) { w.reserve = Math.min(max, w.reserve + (w.def.ammoPickup || 5)); refilled = true; }
    }
  }
  const record=()=>{try{observeResource(player.game,'ammo-pickup',{converted:!refilled,pools:pools.map(({w,reserve,requested})=>({weapon:w.def.id,unit:w.def.ammoType,requested,applied:Math.max(0,w.reserve-reserve),unapplied:Math.max(0,requested-Math.max(0,w.reserve-reserve))}))},before);}catch{/* Optional sampling only. */}};
  if (refilled) {record();return { ok: true, refilled };}
  player.heal(0);
  const ok=player.addCoins(3,'pickup');if(ok)record();return {ok,refilled};
}

function available(game) {
  return game.state === 'play' && game.player?.alive && !game.revivalPending && !game.storageFrozen();
}
// A failed or indeterminate write cannot publish or retry the business operation.
// The existing live loop/recoverStorage restores the persisted candidate exactly.
export function commitEquipmentOperation(game, operation, success, { source = null, refresh = true, consumeChoice = null, sourceAudio = true } = {}) {
  if (!available(game)) return false;
  if (consumeChoice && game.hud._choice !== consumeChoice) return false;
  try {
    let projection, draft, metaDraft;
    if (game.mode === 'run') {
      draft = captureSessionDraft(game); metaDraft = structuredClone(meta.data);
      if (source) {
        const at = game.pickups.list.indexOf(source);
        if (at < 0 || source.collected) return false;
        draft.roomStates[game.room.uid].pickups.splice(at, 1);
      }
      projection = acquisitionProjection(game, draft, metaDraft);
    }
    // Training in the hub never overwrites an existing expedition.
    const result = operation(projection?.player || game.player);
    if (!result?.ok) {
      game.hud.equipment?.message?.(result?.why || '条件不满足，原物品已保留');
      game.toast('未更改装备', result?.why || '条件不满足，原物品已保留', '#ff6a3a', 'fail');
      return false;
    }
    if (projection) {
      if (source?.supplyKey) {
        const ledger = { buildSupply: draft.buildSupply };
        if (!commitSupplyClaim(ledger, source.supplyKey).ok) throw Error('领取身份无效');
        draft.buildSupply = ledger.buildSupply;
      }
      projection.finish();
      // The reward and its consumed pending choice are one durable outcome.
      // Live choice stays intact until a confirmed write has been published.
      if (consumeChoice) draft.choice = null;
      validateSession(draft);
      const saved = saveStore.write(metaDraft, draft);
      if (saved.committed !== true) {
        if (saveStore.blocked) game.openStorageRecovery();
        game.hud.equipment?.message?.(saved.error || '保存失败，原物品已保留');
        game.toast('装备尚未保存', saved.error || '原物品已保留，请重试', '#ff6a3a', 'fail');
        return false;
      }
      try {
        publishAcquisition(game, draft); publishDrops(game, projection.drops);
        game.roomStates.set(game.room.uid, structuredClone(draft.roomStates[game.room.uid]));
        if (source) { source.collected = true; game.pickups.remove(source); }
        game.buildSupply = structuredClone(draft.buildSupply);
        meta.data = metaDraft; meta._dirty = false; meta._clearActive = false;
      } catch (error) { saveStore.blockWrites(); game.openStorageRecovery(); return false; }
    }
    if (source && !projection) { source.collected = true; game.pickups.remove(source); }
    if (source && sourceAudio) audio.pickup();
    if (!projection) game.player.refreshGunModel();
    game.hud.equipment?.message?.(success);
    if (refresh && game.hud.buildOpen) game.hud.renderBuild();
    return true;
  } catch (error) {
    game.hud.equipment?.message?.(error.message);
    game.toast('装备未更改', error.message, '#ff6a3a', 'fail'); return false;
  }
}
export function collectEquipmentPickup(game, pickup) {
  if (!pickup || !pickupReady(pickup) || !game.pickups.list.includes(pickup) ||
      game.panelOpen?.() || Math.hypot(game.player.x-pickup.x, game.player.z-pickup.z) > 2.2 ||
      !pickupPathClear(game, game.player.x, game.player.z, pickup.x, pickup.z)) return false;
  if(pickup.kind==='weapon'&&!validWeaponAssetStateShape(pickup.assetState))return false;
  return commitEquipmentOperation(game, p => {
    const ctx = p.game, coins = p.coins;
    const def = pickup.kind === 'weapon_crate' ? ctx.rollWeaponId(1) : null;
    const ok = p.giveWeapon(def?.id || pickup.id, -1, def ? null : {...fields(pickup, ['mesh', 'shopSlot']),source:pickup.source});
    if (!ok && p.coins === coins) return { ok: false, why: '无法拾取这把武器，原实例保留' };
    if (def && !ok) p.addCoins(10);
    if (ctx.tel) ctx.tel.weaponPickups = (ctx.tel.weaponPickups || 0) + 1;
    return { ok: true };
  }, '武器已领取', { source: pickup, refresh: false });
}

// Supplied non-weapon drops consume their ledger identity in the same write as
// the real Player grant. Risk relics still enter their existing confirmation UI.
export function collectSupplyPickup(game, pickup) {
  if (!pickup?.supplyKey || !game.pickups.list.includes(pickup) || pickup.collected) return false;
  if (pickup.kind === 'item' && game.player.items.includes(pickup.id)) {
    return reportPickupBlock(game, pickup, '已拥有此遗物');
  }
  if (pickup.kind === 'heal' && game.player.hp >= game.player.maxHp && !game.player.hero?.hook?.onHeal) {
    return reportPickupBlock(game, pickup, '生命已满');
  }
  pickupBlocks.delete(pickup);
  if (pickup.kind === 'attachment' && game.player.spareAttachments.length >= game.player.spareCap()) {
    game.offerAttachmentReplacement(pickup); return false;
  }
  let ammo;
  const taken = commitEquipmentOperation(game, p => {
    let ok = false;
    if (pickup.kind === 'coin') ok = p.addCoins(pickup.amount, pickup.coinSrc || 'chest');
    else if (pickup.kind === 'ammo') { ammo = applyAmmoPickup(p); ok = ammo.ok; }
    else if (pickup.kind === 'item') ok = p.addItem(pickup.id);
    else if (pickup.kind === 'attachment') ok = p.addAttachment(pickup.attId || pickup.id);
    else if (pickup.kind === 'active') { const coins = p.coins; ok = p.giveActive(pickup.id) || p.coins > coins; }
    else if (pickup.kind === 'heal' && (p.hp < p.maxHp || p.hero?.hook?.onHeal)) { p.heal(pickup.amount, pickup.healSrc || 'chest'); ok = true; }
    else if (pickup.kind === 'key') { p.keys++; ok = true; }
    else if (pickup.kind === 'armor') { p.armor = Math.min(5,p.armor+1); ok = true; }
    return {ok,why:'当前无法领取，物品保留在地面'};
  }, '供给已领取', {source:pickup,refresh:false,sourceAudio:pickup.kind !== 'coin'});
  if (taken && ammo) game.toast('弹药补给', ammo.refilled ? '特殊弹药已补充' : '无需弹药，转化为 3 金币', '#9dff5a');
  return taken;
}
