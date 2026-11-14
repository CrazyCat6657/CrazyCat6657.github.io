// ============================================================
// 四格消耗品 · 状态与生命周期
// ------------------------------------------------------------
// 设计要点：
//   - 状态是**纯数据**（可 structuredClone / JSON 往返），不含函数、DOM、计时器。
//   - 所有变更函数返回新状态；本文件只提供 create / validate / capture / restore。
//   - 存档失败只返回错误，不修改传入对象（错误不污染原状态）。
// ============================================================
import {
  DEFAULT_CONFIG, FORMAT_VERSION, MODULE_ID, getItemDef, isKnownItem, normalizeConfig,
} from './items.js';

export function cloneState(state) {
  return structuredClone(state);
}

export function createState(config = DEFAULT_CONFIG) {
  const cfg = normalizeConfig(config);
  return {
    formatVersion: FORMAT_VERSION,
    moduleId: MODULE_ID,
    revision: 0,
    clock: 0,
    slots: new Array(cfg.slotCount).fill(null),
    effects: {},
    armor: { points: 0, remaining: 0, duration: cfg.wardDuration },
    requests: [],
    stats: { picked: 0, used: 0, refused: 0, dropped: 0 },
  };
}

const isPlainObject = (v) => !!v && typeof v === 'object' && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);

// 状态校验：只描述问题，不修复。
export function validateState(state, config = DEFAULT_CONFIG) {
  const cfg = normalizeConfig(config);
  const errors = [];
  const push = (msg) => errors.push(msg);
  if (!isPlainObject(state)) return { ok: false, errors: ['状态不是对象'] };
  if (state.formatVersion !== FORMAT_VERSION) push(`formatVersion 应为 ${FORMAT_VERSION}，实际 ${JSON.stringify(state.formatVersion)}`);
  if (state.moduleId !== MODULE_ID) push(`moduleId 应为 ${MODULE_ID}，实际 ${JSON.stringify(state.moduleId)}`);
  if (!Number.isInteger(state.revision) || state.revision < 0) push('revision 必须是 ≥0 的整数');
  if (!Number.isFinite(state.clock) || state.clock < 0) push('clock 必须是 ≥0 的有限数');
  if (!Array.isArray(state.slots)) push('slots 必须是数组');
  else if (state.slots.length !== cfg.slotCount) push(`slots 长度应为 ${cfg.slotCount}，实际 ${state.slots.length}`);
  if (Array.isArray(state.slots)) {
    Array.from(state.slots).forEach((slot, i) => {
      if (slot === null) return;
      if (!isPlainObject(slot)) { push(`slots[${i}] 不是 null 也不是对象`); return; }
      if (!isKnownItem(slot.itemId)) push(`slots[${i}] 未知 itemId：${JSON.stringify(slot.itemId)}`);
      if (!Number.isInteger(slot.count) || slot.count < 1) push(`slots[${i}] count 必须是 ≥1 的整数`);
      else if (slot.count > cfg.stackMax) push(`slots[${i}] count ${slot.count} 超过上限 ${cfg.stackMax}`);
    });
  }
  if (!isPlainObject(state.effects)) push('effects 必须是对象');
  else {
    for (const [key, eff] of Object.entries(state.effects)) {
      if (!isPlainObject(eff)) { push(`effects.${key} 不是对象`); continue; }
      const def = getItemDef(eff.itemId);
      if (!['rage', 'veil'].includes(key) || !def || def.effectId !== key) {
        push(`effects.${key} 未知效果或 itemId 不匹配`);
        continue;
      }
      if (!Number.isFinite(eff.remaining) || eff.remaining < 0) push(`effects.${key}.remaining 必须是 ≥0 的有限数`);
      if (!Number.isFinite(eff.duration) || eff.duration <= 0 || eff.duration > cfg[def.duration]) push(`effects.${key}.duration 必须在物品配置时长内`);
      if (Number.isFinite(eff.remaining) && Number.isFinite(eff.duration) && eff.remaining > eff.duration + 1e-9) {
        push(`effects.${key}.remaining 不能大于 duration`);
      }
    }
  }
  if (!isPlainObject(state.armor)) push('armor 必须是对象');
  else {
    const a = state.armor;
    // Real damage multipliers can leave fractional absorption capacity.
    if (!Number.isFinite(a.points) || a.points < 0 || a.points > cfg.armorPointsMax) push(`armor.points 必须是 0..${cfg.armorPointsMax} 的有限数`);
    if (!Number.isFinite(a.remaining) || a.remaining < 0 || a.remaining > cfg.wardDuration + 1e-9) push(`armor.remaining 必须是 0..${cfg.wardDuration} 的有限数`);
    if (!Number.isFinite(a.duration) || a.duration <= 0 || a.duration > cfg.wardDuration) push('armor.duration 必须在护甲配置时长内');
    if (a.remaining > a.duration + 1e-9) push('armor.remaining 不能大于 duration');
    if (a.points > 0 && a.remaining <= 0) push('armor.points > 0 但 remaining 为 0');
  }
  if (!Array.isArray(state.requests)) push('requests 必须是数组');
  else {
    if (state.requests.length > cfg.requestLogMax) push(`requests 超过上限 ${cfg.requestLogMax}`);
    const ids = new Set();
    Array.from(state.requests).forEach((r, i) => {
      if (!isPlainObject(r)) { push(`requests[${i}] 不是对象`); return; }
      if (typeof r.id !== 'string' || !r.id) push(`requests[${i}].id 必须是非空字符串`);
      else if (ids.has(r.id)) push(`requests[${i}].id 重复`);
      ids.add(r.id);
      if (typeof r.ok !== 'boolean') push(`requests[${i}].ok 必须是布尔`);
      if (r.itemId !== null && !isKnownItem(r.itemId)) push(`requests[${i}].itemId 未知`);
      if (r.slot !== null && (!Number.isInteger(r.slot) || r.slot < 0 || r.slot >= cfg.slotCount)) push(`requests[${i}].slot 非法`);
      if (r.reason !== null && typeof r.reason !== 'string') push(`requests[${i}].reason 非法`);
      if (!Number.isFinite(r.at) || r.at < 0 || r.at > state.clock + 1e-9) push(`requests[${i}].at 非法`);
    });
  }
  if (!isPlainObject(state.stats)) push('stats 必须是对象');
  else for (const k of ['picked', 'used', 'refused', 'dropped']) {
    if (!Number.isInteger(state.stats[k]) || state.stats[k] < 0) push(`stats.${k} 必须是 ≥0 的整数`);
  }
  return { ok: errors.length === 0, errors };
}

// ---------------- 存档 ----------------
// capture：返回可 JSON 化的副本（切断与运行态的引用）。
export function capture(state) {
  const copy = cloneState(state);
  return { kind: 'consumables-capture', capturedAtClock: copy.clock, state: copy };
}

// restore：只读入参，返回全新状态。任何非法值都拒绝，且不修改 raw。
export function restore(raw, config = DEFAULT_CONFIG) {
  const cfg = normalizeConfig(config);
  const fail = (reason, errors = [reason]) => ({ ok: false, reason, errors, state: createState(cfg) });
  if (!isPlainObject(raw)) return fail('not_object', ['存档不是对象']);

  // 兼容两种入参：capture() 的外壳，或直接的状态对象。
  const payload = raw.kind === 'consumables-capture' ? raw.state : raw;
  if (!isPlainObject(payload)) return fail('not_object', ['capture.state 不是对象']);
  if (payload.formatVersion !== FORMAT_VERSION) {
    return fail('unknown_version', [`未知 formatVersion：${JSON.stringify(payload.formatVersion)}（本模块为 ${FORMAT_VERSION}）`]);
  }
  if (!Array.isArray(payload.slots) || payload.slots.length !== cfg.slotCount) {
    return fail('bad_slots', [`slots 必须是长度 ${cfg.slotCount} 的数组`]);
  }

  // 不先修复或过滤坏字段：运行态与存档共用同一校验合同。
  const check = validateState(payload, cfg);
  if (!check.ok) return fail('invalid_state', check.errors);
  if (raw.kind === 'consumables-capture' && (!Number.isFinite(raw.capturedAtClock) || raw.capturedAtClock < 0)) {
    return fail('invalid_state', ['capturedAtClock 必须是 ≥0 的有限数']);
  }
  return { ok: true, state: cloneState(payload) };
}

// ---------------- 生命周期 ----------------
// 换层：保留库存，清空战斗临时态（效果/临甲/去重记录）。
// 理由：跨层保留 4 秒隐身或 2 点临甲等于免费收益，且时间在过场中被暂停会失真。
export function onFloorTransition(state) {
  const next = cloneState(state);
  next.effects = {};
  next.armor = { points: 0, remaining: 0, duration: next.armor.duration };
  next.requests = [];
  next.revision += 1;
  return next;
}

// 换模式：离开 run 时清空战斗临时态；库存保留（大厅允许展示/整理）。
export function onModeChange(state, mode) {
  if (mode === 'run') return state;
  const next = cloneState(state);
  next.effects = {};
  next.armor = { points: 0, remaining: 0, duration: next.armor.duration };
  next.requests = [];
  next.revision += 1;
  return next;
}

// 结束本局：清空效果与临甲，库存保留供结算界面展示。
export function endRun(state) {
  return onFloorTransition(state);
}
