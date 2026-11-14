// ============================================================
// 四格消耗品 · 物品定义与可调参数（第七轮 / Pass D 实验模块）
// ------------------------------------------------------------
// 这里是**唯一**的参数来源：槽位数、堆叠上限、时长、上限、净化白名单。
// 美术图标不在此层（UI 按 itemId 取 SVG），此层只给色调与短标签。
// 数值全部是**实验初值**，不代表已获准进入标准掉落池。
// ============================================================

export const MODULE_ID = 'consumables';
export const FORMAT_VERSION = 1;

// 默认配置。宿主可整体替换（例如 Codex 想试 5 格或上限 5），
// 但模块内部所有判据都必须读 config，不允许写死数字。
export const DEFAULT_CONFIG = Object.freeze({
  slotCount: 4,
  stackMax: 3,
  armorPointsMax: 2,
  requestLogMax: 32,
  // 效果参数
  healAmount: 1,
  staminaRatio: 0.5,
  rageDuration: 6,
  rageDamageMult: 1.25,
  rageFireRateMult: 1.15,
  veilDuration: 4,
  wardDuration: 8,
  wardPoints: 2,
});

// 可净化的负面状态白名单。
// 只列"状态层"的负面效果：burn/poison/slow/ash。
// **不含**：法力、积热、souls、誓约封存、关卡事件、正常冷却、职业资源。
export const CLEANSABLE_STATUS_IDS = Object.freeze(['burn', 'poison', 'slow', 'ash']);

// 物品定义。
// kind: 'instant'（立即生效，产生命令）| 'effect'（写进模块状态，由 getModifiers 查询）
// icon: UI 层据此画 SVG；tone: 边框/图标主色。
export const ITEM_DEFS = Object.freeze({
  heal_draught: {
    id: 'heal_draught',
    name: '恢复药剂',
    short: '回复 1 点生命',
    detail: '立刻回复 1 点生命。满血或治疗被封锁时不会消耗。',
    kind: 'instant',
    icon: 'heal',
    tone: '#ff6b6b',
  },
  rage_tonic: {
    id: 'rage_tonic',
    name: '狂暴药剂',
    short: '6 秒：伤害 +25%、射速 +15%',
    detail: '持续 6 秒。重复使用只刷新时长，不叠加倍率。',
    kind: 'effect',
    effectId: 'rage',
    duration: 'rageDuration',
    icon: 'rage',
    tone: '#ff9a3c',
  },
  veil_tonic: {
    id: 'veil_tonic',
    name: '隐身药剂',
    short: '4 秒：抑制新的锁定',
    detail: '持续 4 秒，抑制新的锁定；已发射弹丸与首领范围危险仍可命中。主动攻击立即破隐。',
    kind: 'effect',
    effectId: 'veil',
    duration: 'veilDuration',
    icon: 'veil',
    tone: '#9d8cff',
  },
  ward_tonic: {
    id: 'ward_tonic',
    name: '临时护甲药剂',
    short: '吸收 2 点伤害，最长 8 秒',
    detail: '临时护甲最多 2 点，8 秒后未用完的额度直接消失，不会转成永久护甲。',
    kind: 'effect',
    effectId: 'ward',
    duration: 'wardDuration',
    icon: 'ward',
    tone: '#6fd0ff',
  },
  stamina_tonic: {
    id: 'stamina_tonic',
    name: '体力药剂',
    short: '恢复体力上限的 50%',
    detail: '体力不足时，补回体力上限的 50%；当前模式没有体力时不能使用，且不消耗。',
    kind: 'instant',
    icon: 'stamina',
    tone: '#8ce27a',
  },
  cleanse_tonic: {
    id: 'cleanse_tonic',
    name: '净化药剂',
    short: '清除灼烧、中毒、减速和余烬',
    detail: '清除灼烧、中毒、减速和余烬；没有对应状态时无法使用，也不会消耗。',
    kind: 'instant',
    icon: 'cleanse',
    tone: '#f2f0c8',
  },
});

export const ITEM_IDS = Object.freeze(Object.keys(ITEM_DEFS));

export function getItemDef(itemId) {
  return Object.prototype.hasOwnProperty.call(ITEM_DEFS, itemId) ? ITEM_DEFS[itemId] : null;
}

export function isKnownItem(itemId) {
  return getItemDef(itemId) !== null;
}

// 配置归一：只接受有限正数/正整数，其余回落到默认值。
// 目的：宿主传错参数时不至于让整个模块停在 NaN 上。
export function normalizeConfig(patch) {
  const out = { ...DEFAULT_CONFIG };
  if (patch && typeof patch === 'object') {
    const intIn = (v, min, max, fallback) => (Number.isInteger(v) && v >= min && v <= max ? v : fallback);
    const numIn = (v, min, max, fallback) => (Number.isFinite(v) && v >= min && v <= max ? v : fallback);
    out.slotCount = intIn(patch.slotCount, 1, 8, out.slotCount);
    out.stackMax = intIn(patch.stackMax, 1, 99, out.stackMax);
    out.armorPointsMax = intIn(patch.armorPointsMax, 1, 20, out.armorPointsMax);
    out.requestLogMax = intIn(patch.requestLogMax, 4, 256, out.requestLogMax);
    out.healAmount = intIn(patch.healAmount, 1, 20, out.healAmount);
    out.staminaRatio = numIn(patch.staminaRatio, 0.1, 1, out.staminaRatio);
    out.rageDuration = numIn(patch.rageDuration, 0.5, 60, out.rageDuration);
    out.rageDamageMult = numIn(patch.rageDamageMult, 1, 4, out.rageDamageMult);
    out.rageFireRateMult = numIn(patch.rageFireRateMult, 1, 4, out.rageFireRateMult);
    out.veilDuration = numIn(patch.veilDuration, 0.5, 60, out.veilDuration);
    out.wardDuration = numIn(patch.wardDuration, 0.5, 60, out.wardDuration);
    out.wardPoints = intIn(patch.wardPoints, 1, 20, out.wardPoints);
  }
  return out;
}
