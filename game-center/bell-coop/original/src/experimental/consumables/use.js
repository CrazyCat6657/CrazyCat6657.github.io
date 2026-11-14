// ============================================================
// 四格消耗品 · 使用判定与效果查询
// ------------------------------------------------------------
// prepareUse 是**唯一**的使用入口：先判定、再扣数量、最后登记效果。
// 失败路径不写数量、不写效果、不增加 revision（失败零扣费）。
// requestId 幂等：同一 ID 重复调用返回原结果，不会二次消耗。
// ============================================================
import {
  DEFAULT_CONFIG, CLEANSABLE_STATUS_IDS, getItemDef, isKnownItem, normalizeConfig,
} from './items.js';
import { cloneState } from './state.js';

// 拒绝原因 -> 玩家可读文案（UI 直接显示，不自行拼字符串）。
export const REASON_TEXT = Object.freeze({
  empty_slot: '这个格子是空的',
  paused: '暂停中不能使用',
  dead: '已经倒下了',
  wrong_mode: '只能在远征中使用',
  hp_full: '生命已满，没有可恢复的',
  heal_blocked: '当前规则不允许治疗',
  stamina_unavailable: '当前版本尚未接入体力',
  stamina_full: '体力已满',
  nothing_to_cleanse: '没有可清除的负面状态',
  armor_full: '临时护甲已满',
  unknown_item: '未知物品',
  bad_context: '使用条件不完整',
  duplicate_request: '这次操作已经处理过了',
  invalid_slot: '槽位无效',
  invalid_request: '使用请求无效',
  unknown_resolution: '未知的满栏处理方式',
  not_full: '背包未满，不需要替换',
  invalid_choice: '选择无效',
});

export function reasonText(reason, context = {}) {
  if (reason === 'heal_blocked' && context.healBlockedReason) return context.healBlockedReason;
  return REASON_TEXT[reason] || '无法使用';
}

function feedback(kind, text, extra = {}) {
  return { kind, text, ...extra };
}

function refuse(reason, state, context = {}) {
  return {
    ok: false,
    reason,
    duplicate: false,
    next: state,
    commands: [],
    feedback: feedback('error', reasonText(reason, context)),
  };
}

// 环境闸门：生死 / 暂停 / 模式。模块不缓存任何"待触发"输入。
function gateOf(context) {
  if (!context || typeof context !== 'object') return 'bad_context';
  if (context.alive === false) return 'dead';
  if (context.paused === true) return 'paused';
  if (context.mode !== undefined && context.mode !== 'run') return 'wrong_mode';
  return null;
}

function pushRequest(next, entry, cfg) {
  next.requests.push(entry);
  if (next.requests.length > cfg.requestLogMax) next.requests.splice(0, next.requests.length - cfg.requestLogMax);
}

function findDuplicate(state, requestId) {
  if (typeof requestId !== 'string' || !requestId) return null;
  return state.requests.find((r) => r.id === requestId) || null;
}

function duplicateResult(state, prev) {
  if (prev.ok) {
    return {
      ok: true,
      duplicate: true,
      reason: null,
      next: state,
      commands: [],
      feedback: feedback('neutral', '这次操作已经处理过了'),
    };
  }
  return {
    ok: false,
    duplicate: true,
    reason: prev.reason || 'duplicate_request',
    next: state,
    commands: [],
    feedback: feedback('error', reasonText(prev.reason || 'duplicate_request')),
  };
}

// ---------------- 使用核心 ----------------
// 不依赖槽位：prepareUse（从槽位扣 1）与 resolvePickup 的"立即使用"共用。
// consumeFromSlot = 槽位下标或 null（null 表示物品不来自库存，不扣数量）。
function useItemCore(state, itemId, context, requestId, consumeFromSlot, cfg) {
  const def = getItemDef(itemId);
  if (!def) return refuse('unknown_item', state, context);

  const commands = [];
  let active = null;

  if (itemId === 'heal_draught') {
    const hp = Number(context.hp);
    const hpMax = Number(context.hpMax);
    if (!Number.isFinite(hp) || !Number.isFinite(hpMax) || hpMax <= 0) return refuse('bad_context', state, context);
    if (hp >= hpMax) return refuse('hp_full', state, context);
    if (context.canHeal === false) return refuse('heal_blocked', state, context);
    const amount = Math.min(cfg.healAmount, hpMax - hp);
    commands.push({ type: 'heal', amount });
    active = 'instant';
  } else if (itemId === 'stamina_tonic') {
    const st = Number(context.stamina);
    const stMax = Number(context.staminaMax);
    if (context.stamina === undefined || context.staminaMax === undefined || !Number.isFinite(st) || !Number.isFinite(stMax) || stMax <= 0) {
      return refuse('stamina_unavailable', state, context);
    }
    if (st >= stMax) return refuse('stamina_full', state, context);
    commands.push({ type: 'restoreStamina', ratio: cfg.staminaRatio });
    active = 'instant';
  } else if (itemId === 'cleanse_tonic') {
    const list = Array.isArray(context.statuses) ? context.statuses : [];
    const ids = [];
    for (const s of list) {
      if (!s || typeof s.id !== 'string') continue;
      if (s.kind === 'class') continue;                       // 职业资源永不清
      if (!CLEANSABLE_STATUS_IDS.includes(s.id)) continue;    // 只清白名单
      if (!ids.includes(s.id)) ids.push(s.id);
    }
    if (!ids.length) return refuse('nothing_to_cleanse', state, context);
    commands.push({ type: 'cleanse', statusIds: ids });
    active = 'instant';
  } else if (itemId === 'rage_tonic') {
    active = 'rage';
  } else if (itemId === 'veil_tonic') {
    active = 'veil';
  } else if (itemId === 'ward_tonic') {
    if (state.armor.points >= cfg.armorPointsMax && state.armor.remaining > 0) return refuse('armor_full', state, context);
    active = 'ward';
  } else {
    return refuse('unknown_item', state, context);
  }

  const next = cloneState(state);
  next.revision += 1;

  // 扣数量（只有来自库存时才扣）
  let remaining = null;
  if (consumeFromSlot !== null) {
    const slot = next.slots[consumeFromSlot];
    if (!slot || slot.itemId !== itemId) return refuse('empty_slot', state, context);
    slot.count -= 1;
    remaining = slot.count;
    if (slot.count <= 0) next.slots[consumeFromSlot] = null;
  }

  // 效果登记（刷新，不叠加）
  if (active === 'rage') {
    next.effects.rage = { itemId, remaining: cfg.rageDuration, duration: cfg.rageDuration };
  } else if (active === 'veil') {
    next.effects.veil = { itemId, remaining: cfg.veilDuration, duration: cfg.veilDuration };
  } else if (active === 'ward') {
    next.armor = {
      points: Math.min(cfg.armorPointsMax, Math.max(next.armor.points, cfg.wardPoints)),
      remaining: cfg.wardDuration,
      duration: cfg.wardDuration,
    };
  }

  next.stats.used += 1;
  pushRequest(next, { id: requestId, itemId, slot: consumeFromSlot, ok: true, reason: null, at: next.clock }, cfg);

  let text;
  if (active === 'instant') text = `使用 ${def.name}`;
  else if (active === 'ward') text = `临时护甲 ${next.armor.points} 点，${cfg.wardDuration} 秒`;
  else text = `${def.name}生效 ${next.effects[active].duration} 秒`;

  return {
    ok: true,
    duplicate: false,
    reason: null,
    next,
    commands,
    feedback: feedback('ok', text, {
      remaining,
      active,
      effect: active === 'instant' ? null : { id: active, remaining: next.effects[active]?.remaining ?? next.armor.remaining },
    }),
  };
}

// ---------------- 公开接口 ----------------
// prepareUse(state, slot, context, requestId)
export function prepareUse(state, slot, context, requestId, config = DEFAULT_CONFIG) {
  const cfg = normalizeConfig(config);
  if (typeof requestId !== 'string' || !requestId) return refuse('invalid_request', state, context);
  if (!Number.isInteger(slot) || slot < 0 || slot >= cfg.slotCount) return refuse('invalid_slot', state, context);

  const prev = findDuplicate(state, requestId);
  if (prev) return duplicateResult(state, prev);

  const gate = gateOf(context);
  if (gate) {
    // 环境拒绝也记录，避免"暂停时按了一下，恢复后突然生效"。
    const next = cloneState(state);
    pushRequest(next, { id: typeof requestId === 'string' ? requestId : null, itemId: null, slot, ok: false, reason: gate, at: next.clock }, cfg);
    next.stats.refused += 1;
    return refuse(gate, next, context);
  }

  const held = state.slots[slot];
  if (!held) {
    const next = cloneState(state);
    pushRequest(next, { id: typeof requestId === 'string' ? requestId : null, itemId: null, slot, ok: false, reason: 'empty_slot', at: next.clock }, cfg);
    next.stats.refused += 1;
    return refuse('empty_slot', next, context);
  }

  const result = useItemCore(state, held.itemId, context, requestId, slot, cfg);
  if (!result.ok) {
    const next = cloneState(result.next);
    pushRequest(next, { id: typeof requestId === 'string' ? requestId : null, itemId: held.itemId, slot, ok: false, reason: result.reason, at: next.clock }, cfg);
    next.stats.refused += 1;
    return { ...result, next };
  }
  return result;
}

// 满栏"立即使用"：物品不进入库存，因此不扣库存数量。
export function useImmediately(state, itemId, context, requestId, config = DEFAULT_CONFIG) {
  const cfg = normalizeConfig(config);
  if (typeof requestId !== 'string' || !requestId) return refuse('invalid_request', state, context);
  const prev = findDuplicate(state, requestId);
  if (prev) return duplicateResult(state, prev);

  const gate = gateOf(context);
  const result = gate ? refuse(gate, state, context) : useItemCore(state, itemId, context, requestId, null, cfg);
  if (result.ok) return result;
  const next = cloneState(result.next);
  pushRequest(next, { id: requestId, itemId: isKnownItem(itemId) ? itemId : null, slot: null, ok: false, reason: result.reason, at: next.clock }, cfg);
  next.stats.refused += 1;
  return { ...result, next };
}

// ---------------- 查询 ----------------
export function getModifiers(state, config = DEFAULT_CONFIG) {
  const cfg = normalizeConfig(config);
  const rage = state.effects.rage;
  const veil = state.effects.veil;
  const active = [];
  for (const [effectId, eff] of Object.entries(state.effects)) {
    active.push({ effectId, remaining: eff.remaining, duration: eff.duration, ratio: eff.duration > 0 ? eff.remaining / eff.duration : 0 });
  }
  return {
    damageMult: rage ? cfg.rageDamageMult : 1,
    fireRateMult: rage ? cfg.rageFireRateMult : 1,
    invisible: !!veil,
    suppressNewLocks: !!veil,
    armorPoints: state.armor.points,
    armorRemaining: state.armor.remaining,
    active,
  };
}

// 受伤入口：先吃临甲，再交给调用方扣血。
export function absorbDamage(state, amount, config = DEFAULT_CONFIG) {
  if (!Number.isFinite(amount) || amount < 0) throw new TypeError('absorbDamage: amount 必须是 ≥0 的有限数');
  if (state.armor.points <= 0 || amount === 0) {
    return { absorbed: 0, remainder: amount, next: state, feedback: null };
  }
  const absorbed = Math.min(state.armor.points, amount);
  const next = cloneState(state);
  next.armor.points -= absorbed;
  if (next.armor.points <= 0) {
    next.armor.points = 0;
    next.armor.remaining = 0;
  }
  next.revision += 1;
  return {
    absorbed,
    remainder: amount - absorbed,
    next,
    feedback: feedback('ok', `临时护甲吸收 ${absorbed} 点`, { armorPoints: next.armor.points }),
  };
}

// 主动攻击破隐。
export function notifyAttack(state) {
  if (!state.effects.veil) return { next: state, brokeInvisibility: false };
  const next = cloneState(state);
  delete next.effects.veil;
  next.revision += 1;
  return { next, brokeInvisibility: true };
}

// ---------------- 时间推进 ----------------
export function tick(state, dt, context = {}, config = DEFAULT_CONFIG) {
  const cfg = normalizeConfig(config);
  if (!Number.isFinite(dt) || dt < 0) throw new TypeError('tick: dt 必须是 ≥0 的有限数');

  if (context && context.paused === true) return state;

  // 死亡：清空战斗临时态（不残留），库存保留给结算界面。
  if (context && context.alive === false) {
    if (!Object.keys(state.effects).length && state.armor.points === 0 && state.armor.remaining === 0) return state;
    const cleared = cloneState(state);
    cleared.effects = {};
    cleared.armor = { points: 0, remaining: 0, duration: cleared.armor.duration };
    cleared.revision += 1;
    return cleared;
  }

  if (dt === 0) return state;
  if (!Object.keys(state.effects).length && state.armor.remaining <= 0) {
    // 没有计时内容时只推进时钟（仍需保留时钟连续性）。
    const next = cloneState(state);
    next.clock += dt;
    return next;
  }

  const next = cloneState(state);
  next.clock += dt;
  let changed = false;
  for (const [key, eff] of Object.entries(next.effects)) {
    const rem = eff.remaining - dt;
    if (rem <= 0) { delete next.effects[key]; changed = true; }
    else if (rem !== eff.remaining) { eff.remaining = rem; changed = true; }
  }
  if (next.armor.remaining > 0) {
    const rem = next.armor.remaining - dt;
    if (rem <= 0) {
      next.armor.remaining = 0;
      next.armor.points = 0;
      changed = true;
    } else if (rem !== next.armor.remaining) {
      next.armor.remaining = rem;
      changed = true;
    }
  }
  if (changed) next.revision += 1;
  return next;
}

// 判断某格当前是否可用（UI 灰显与"为什么不能用"共用同一判据）。
export function canUseSlot(state, slot, context, config = DEFAULT_CONFIG) {
  const cfg = normalizeConfig(config);
  if (!Number.isInteger(slot) || slot < 0 || slot >= cfg.slotCount) return { ok: false, reason: 'invalid_slot' };
  const held = state.slots[slot];
  if (!held) return { ok: false, reason: 'empty_slot' };
  const gate = gateOf(context);
  if (gate) return { ok: false, reason: gate };
  const def = getItemDef(held.itemId);
  if (!def) return { ok: false, reason: 'unknown_item' };

  if (held.itemId === 'heal_draught') {
    const hp = Number(context.hp);
    const hpMax = Number(context.hpMax);
    if (Number.isFinite(hp) && Number.isFinite(hpMax) && hp >= hpMax) return { ok: false, reason: 'hp_full' };
    if (context.canHeal === false) return { ok: false, reason: 'heal_blocked' };
  }
  if (held.itemId === 'stamina_tonic') {
    if (context.stamina === undefined || !Number.isFinite(Number(context.staminaMax))) return { ok: false, reason: 'stamina_unavailable' };
    if (Number(context.stamina) >= Number(context.staminaMax)) return { ok: false, reason: 'stamina_full' };
  }
  if (held.itemId === 'cleanse_tonic') {
    const list = Array.isArray(context.statuses) ? context.statuses : [];
    const hit = list.some((s) => s && s.kind !== 'class' && CLEANSABLE_STATUS_IDS.includes(s.id));
    if (!hit) return { ok: false, reason: 'nothing_to_cleanse' };
  }
  if (held.itemId === 'ward_tonic') {
    if (state.armor.points >= cfg.armorPointsMax && state.armor.remaining > 0) return { ok: false, reason: 'armor_full' };
  }
  return { ok: true, reason: null };
}
