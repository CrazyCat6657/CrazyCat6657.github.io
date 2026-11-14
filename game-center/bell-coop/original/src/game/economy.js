// ============================================================
//  Economy —— 商店服务与金币出口（PASS2 §4 / §28 / §29）
//
//  解决的问题：
//   · 中后期"钱很多但没地方花"
//   · 商店四件商品可能对当前 Build 全都没用
//   · 好枪缺弹 → "得到奖励但不敢玩"
//
//  设计约束（任务书原文）：
//   · 每种服务必须有**次数上限**，不能变成无限付费回血
//   · 费用与收益必须原子（扣了钱就一定拿到东西，反之不扣）
//   · 缺钱 / 弹满 / 满血 / 取消时**不得扣费**
//   · 次数与库存要随存档保存，恢复后不重复计费
// ============================================================
import { RNG } from '../core/rng.js';
import { WEAPONS, LEGACY_WEAPONS, ITEMS, ACTIVES } from './data.js';
import { pickWeaponByFamily } from './weapon_assets_pool.js';

// 每间商店的服务：基础价按楼层上浮，次数按楼层略放宽（第三层是"资源选择真正重要"的一层）
export const SHOP_SERVICES = [
  {
    id: 'ammo', cn: '补弹', act: '付费补满备弹', basePrice: 14, baseUses: 2,
    desc: '把当前手持枪的备弹补满；对火箭、能量等有限弹药尤其有用',
  },
  {
    id: 'heal', cn: '急救', act: '购买急救', basePrice: 26, baseUses: 1, heal: 2,
    desc: '立刻回复 2 点生命；每间商店可购买次数有限，不能无限回血',
  },
  {
    id: 'reroll', cn: '刷新库存', act: '刷新库存', basePrice: 18, baseUses: 1,
    desc: '重新抽取本店商品；四件都不需要时再考虑',
  },
];
export const SERVICE_MAP = Object.fromEntries(SHOP_SERVICES.map((s) => [s.id, s]));

export function servicePrice(id, floor = 1) {
  const s = SERVICE_MAP[id];
  if (!s) return 0;
  return Math.round(s.basePrice * (1 + (floor - 1) * 0.35));
}
export function serviceUses(id, floor = 1) {
  const s = SERVICE_MAP[id];
  if (!s) return 0;
  // 第三层多给一次补弹与急救：那里"治疗不足 / 商店不一定在路线上"是最突出的反馈
  const bonus = floor >= 3 && (id === 'ammo' || id === 'heal') ? 1 : 0;
  return s.baseUses + bonus;
}

// 每间商店剩余次数（存在 room.content.servicesUsed 里，随存档走）
export function serviceLeft(content, id, floor = 1) {
  const used = (content && content.servicesUsed && content.servicesUsed[id]) || 0;
  return Math.max(0, serviceUses(id, floor) - used);
}
export function markServiceUsed(content, id) {
  if (!content) return;
  if (!content.servicesUsed) content.servicesUsed = {};
  content.servicesUsed[id] = (content.servicesUsed[id] || 0) + 1;
}

// Bounded development candidates. Newly generated shops use expanded shelves;
// stored shops keep their explicit variant (or historic four-shelf default).
export const NEW_SHOP_VARIANT = 'expanded';
export function planShopVariant(stock, seed, floor, variant = 'four-service', category = 'key') {
  if (!['four-service','expanded','directed'].includes(variant)) throw Error('未知商店候选');
  if (!['key','heal','ammo','armor'].includes(category)) throw Error('未知定向类目');
  if (!Array.isArray(stock) || stock.length !== 4) throw Error('候选商店需要四个原始货位');
  const out = stock.map(x => ({...x}));
  if (variant === 'expanded') {
    const rr = new RNG((seed ^ 0x670a) >>> 0);
    const extras = rr.sample(['key','heal','ammo','armor'], floor >= 2 ? 2 : 1);
    for (const kind of extras) out.push({kind,id:kind,price:BASIC_PRICE[kind]+(floor-1)*4});
  }
  if (variant === 'directed') out.push({kind:category,id:category,price:BASIC_PRICE[category]+(floor-1)*4+6});
  return out;
}

// ------------------------------------------------------------
//  刷新库存：纯函数（同 seed + 同次数 → 同结果，可复现、可存档）
//  仍然保证"至少 1 件资源 + 至少 1 件 Build"（§28）
// ------------------------------------------------------------
const BASIC_PRICE = { heal: 12, key: 16, ammo: 10, armor: 26 };

export function rerollStock(roomSeed, times, floor, { legacyContent = false, variant = 'four-service', category = 'key' } = {}) {
  const rr = new RNG((roomSeed ^ Math.imul(times + 1, 0x9e3779b9)) >>> 0);
  // 第三层使用高级池：优先 tier>=3 的枪（"第三层高级库存"）
  const definitions=legacyContent?LEGACY_WEAPONS:WEAPONS;
  const wPool = floor >= 3
    ? definitions.filter((w) => w.tier >= 3)
    : definitions.filter((w) => (floor === 1 ? w.tier <= 3 : w.tier >= 2));
  const pool = wPool.length ? wPool : definitions;
  const w = legacyContent?rr.pick(pool):pickWeaponByFamily(rr,pool);
  const it = rr.pick(ITEMS);
  const act = rr.pick(ACTIVES);
  // 资源位：第三层必给治疗（深层"治疗不足"是明确反馈），低层随机两件
  const basics = floor >= 3 ? ['heal', rr.pick(['key', 'ammo', 'armor'])] : rr.sample(['heal', 'key', 'ammo', 'armor'], 2);
  const item = rr.chance(0.6);
  return planShopVariant([
    { kind: 'weapon', id: w.id, price: Math.round((18 + w.tier * 16) * (1 + (floor - 1) * 0.22) * rr.float(0.9, 1.15)) },
    { kind: item ? 'item' : 'active', id: item ? it.id : act.id, price: Math.round((22 + rr.int(0, 10)) * (1 + (floor - 1) * 0.2)) },
    ...basics.map((b) => ({ kind: b, id: b, price: BASIC_PRICE[b] + (floor - 1) * 4 })),
  ], roomSeed ^ times, floor, variant, category);
}

// ------------------------------------------------------------
//  补给/服务的可行性判定：**先判定再扣钱**，任何一条不满足都不扣费
// ------------------------------------------------------------
export function ammoServiceCheck(player) {
  const w = player && player.weapon;
  if (!w) return { ok: false, why: '没有可补弹的武器' };
  const def = w.def || {};
  if (!def.ammoType) return { ok: false, why: '当前武器不需要弹药' };
  const max = Math.round((def.ammoMax || 0) * (player.stats.ammoMaxMul || 1));
  if (!(w.reserve < max)) return { ok: false, why: '备弹已满' };
  return { ok: true, gain: max - w.reserve, max };
}
export function healServiceCheck(player) {
  if (!player) return { ok: false, why: '无法治疗' };
  if (player.hp >= player.maxHp) return { ok: false, why: '生命已满' };
  return { ok: true, gain: Math.min(2, player.maxHp - player.hp) };
}
