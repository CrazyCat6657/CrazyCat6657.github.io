// ============================================================
//  Run Telemetry（PASS2 §38 / §30 / §31）
//
//  用途只有一个：**给调平衡提供真实数据**。
//   · 只在本地，随活跃 Run 一起保存（存档里的 tel 字段），不联网、不上传
//   · 只记录数字与字符串，保证能被 session 的 plain() 序列化
//   · 不参与任何玩法判定 —— 读不到它游戏也照常跑
//
//  关键设计：治疗按**来源**分账（§1.1 明确要求先拆贡献再决定改哪一层），
//  同时区分"获得"与"浪费"（满血时捡到的治疗是浪费，这一项以前完全看不见）。
// ============================================================
import {normalizeResources} from './resource_observation.js';
export const HEAL_SOURCES = ['drop', 'chest', 'breakable', 'shop', 'altar', 'relic', 'hero', 'event'];
export const DMG_SOURCES = ['bullet', 'contact', 'hazard', 'explosion', 'self', 'other'];
export const COIN_SOURCES = ['kill', 'chest', 'pickup', 'shop_sell', 'modifier'];

const KEYS = ['timeByFloor', 'hpIn', 'hpOut', 'dmgBy', 'healBy', 'healWasted', 'coinsIn', 'coinsOut',
  'ammoIn', 'ammoOut', 'chests', 'attachmentsBySrc', 'synergyTime', 'firstOf'];

export function emptyTelemetry() {
  return {
    v: 1,
    timeByFloor: { 1: 0, 2: 0, 3: 0 },
    rooms: 0,
    hpIn: {},            // 进入某层时的 HP（用于"进层→离层"曲线）
    hpOut: {},
    dmgBy: {},           // 受伤点数按来源
    healBy: {},          // 治疗获得按来源
    healWasted: {},      // 治疗浪费按来源（满血被拒 / 超出上限）
    coinsIn: {}, coinsOut: {},
    ammoIn: {}, ammoOut: {},
    shops: 0, purchases: 0, services: {},
    chests: { normal: 0, gold: 0, locked: 0 },
    weaponPickups: 0,
    attachmentsBySrc: {},
    synergyTime: {},     // 协同 → 累计生效秒数
    firstOf: {},         // 里程碑 → 首次发生在第几秒（firstRelic / secondWeapon / firstAttachment / firstSynergy / firstHeroGrowth）
    boss: null, bossTime: 0,
    hero: null, deathBy: null, ended: null,
  };
}

export function normalizeTelemetry(t) {
  const base = emptyTelemetry();
  if (!t || typeof t !== 'object') return base;
  const out = { ...base };
  for (const k of KEYS) if (t[k] && typeof t[k] === 'object') out[k] = { ...t[k] };
  if (Number.isFinite(t.rooms)) out.rooms = t.rooms;
  if (Number.isFinite(t.shops)) out.shops = t.shops;
  if (Number.isFinite(t.purchases)) out.purchases = t.purchases;
  if (Number.isFinite(t.bossTime)) out.bossTime = t.bossTime;
  if (t.chests && typeof t.chests === 'object') out.chests = { ...base.chests, ...t.chests };
  if (typeof t.hero === 'string') out.hero = t.hero;
  if (typeof t.boss === 'string') out.boss = t.boss;
  if (typeof t.deathBy === 'string') out.deathBy = t.deathBy;
  if (typeof t.ended === 'string') out.ended = t.ended;
  if (t.resources) out.resources = normalizeResources(t.resources);
  return out;
}

// 记账：任何一处都用它，保证不会出现 NaN 污染快照
export function bump(bag, key, n) {
  if (!bag || key === undefined || key === null) return;
  if (!Number.isFinite(n) || n === 0) return;
  const k = String(key);
  bag[k] = (bag[k] || 0) + n;
}

// 人类可读摘要：报告与探针都读它，避免各处重复推导口径
export function summarize(tel) {
  const t = normalizeTelemetry(tel);
  const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);
  const totalHeal = sum(t.healBy);
  const totalWaste = sum(t.healWasted);
  return {
    time: Object.values(t.timeByFloor).reduce((a, b) => a + b, 0),
    timeByFloor: t.timeByFloor,
    rooms: t.rooms,
    damage: sum(t.dmgBy), damageBy: t.dmgBy,
    heal: totalHeal, healBy: t.healBy,
    healWasted: totalWaste, healWastedBy: t.healWasted,
    healEfficiency: totalHeal + totalWaste > 0 ? +(totalHeal / (totalHeal + totalWaste)).toFixed(3) : 1,
    coinsIn: sum(t.coinsIn), coinsOut: sum(t.coinsOut), coinsInBy: t.coinsIn, coinsOutBy: t.coinsOut,
    ammoIn: sum(t.ammoIn), ammoOut: sum(t.ammoOut),
    shops: t.shops, purchases: t.purchases, services: t.services,
    chests: t.chests, weaponPickups: t.weaponPickups, attachmentsBySrc: t.attachmentsBySrc,
    synergyTime: t.synergyTime, firstOf: t.firstOf,
    hpIn: t.hpIn, hpOut: t.hpOut,
    boss: t.boss, bossTime: t.bossTime, hero: t.hero, deathBy: t.deathBy, ended: t.ended,
    ...(t.resources?{resources:t.resources}:{}),
  };
}
