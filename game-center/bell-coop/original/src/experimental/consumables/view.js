// ============================================================
// 四格消耗品 · 只读视图
// ------------------------------------------------------------
// 给 UI 的扁平数据：不含 DOM、不含选择状态（选择属于界面）。
// 这里把"为什么不可用"翻译成玩家可读文案，避免每个界面各写一套。
// ============================================================
import { DEFAULT_CONFIG, getItemDef, normalizeConfig } from './items.js';
import { canUseSlot, getModifiers, reasonText } from './use.js';

export function getView(state, context = {}, config = DEFAULT_CONFIG) {
  const cfg = normalizeConfig(config);
  const mods = getModifiers(state, cfg);
  const slots = [];
  for (let i = 0; i < cfg.slotCount; i++) {
    const held = state.slots[i];
    const def = held ? getItemDef(held.itemId) : null;
    const check = held ? canUseSlot(state, i, context, cfg) : { ok: false, reason: 'empty_slot' };
    slots.push({
      index: i,
      key: String(i + 1),
      empty: !held,
      itemId: held ? held.itemId : null,
      name: def ? def.name : null,
      short: def ? def.short : '',
      detail: def ? def.detail : '',
      icon: def ? def.icon : null,
      tone: def ? def.tone : null,
      count: held ? held.count : 0,
      stackMax: cfg.stackMax,
      usable: !!check.ok,
      disabledReason: check.ok ? null : check.reason,
      disabledText: check.ok ? '' : reasonText(check.reason, context),
    });
  }

  const effects = [];
  for (const [effectId, eff] of Object.entries(state.effects)) {
    effects.push({
      effectId,
      name: effectId === 'rage' ? '狂暴' : effectId === 'veil' ? '隐身' : effectId,
      remaining: eff.remaining,
      duration: eff.duration,
      ratio: eff.duration > 0 ? Math.max(0, Math.min(1, eff.remaining / eff.duration)) : 0,
    });
  }

  return {
    revision: state.revision,
    clock: state.clock,
    slotCount: cfg.slotCount,
    stackMax: cfg.stackMax,
    slots,
    effects,
    armor: {
      points: state.armor.points,
      max: cfg.armorPointsMax,
      remaining: state.armor.remaining,
      duration: state.armor.duration,
    },
    modifiers: mods,
    stats: { ...state.stats },
  };
}
