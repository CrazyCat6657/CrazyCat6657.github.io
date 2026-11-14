// ============================================================
// 四格消耗品 · 库存（拾取 / 堆叠 / 满栏裁决）
// ------------------------------------------------------------
// 铁律：任何分支都不允许"新物品和旧物品同时消失"。
//   - 被替换的旧堆 -> dropped（调用方在世界里生成掉落）
//   - 放不下的新物品余量 -> dropped
//   - 放弃新物品 -> dropped
// 模块只产出 dropped 描述，不碰世界对象。
// ============================================================
import { DEFAULT_CONFIG, getItemDef, isKnownItem, normalizeConfig } from './items.js';
import { cloneState } from './state.js';
import { useImmediately } from './use.js';

function slotEntry(index, slot) {
  const def = slot ? getItemDef(slot.itemId) : null;
  return {
    index,
    empty: !slot,
    itemId: slot ? slot.itemId : null,
    name: def ? def.name : null,
    count: slot ? slot.count : 0,
  };
}

export function slotSummary(state, config = DEFAULT_CONFIG) {
  const cfg = normalizeConfig(config);
  const out = [];
  for (let i = 0; i < cfg.slotCount; i++) out.push(slotEntry(i, state.slots[i]));
  return out;
}

// 拾取预览 + 直接并入（不改变外部世界）。
export function offerPickup(state, itemId, count = 1, config = DEFAULT_CONFIG) {
  const cfg = normalizeConfig(config);
  if (!isKnownItem(itemId)) return { ok: false, reason: 'unknown_item' };
  if (!Number.isInteger(count) || count < 1) return { ok: false, reason: 'invalid_count' };
  if (!getItemDef(itemId)) return { ok: false, reason: 'unknown_item' };

  // 1) 先补同类未满堆叠
  for (let i = 0; i < cfg.slotCount; i++) {
    const slot = state.slots[i];
    if (!slot || slot.itemId !== itemId || slot.count >= cfg.stackMax) continue;
    const space = cfg.stackMax - slot.count;
    const accepted = Math.min(space, count);
    const next = cloneState(state);
    next.slots[i] = { itemId, count: slot.count + accepted };
    next.revision += 1;
    next.stats.picked += accepted;
    return {
      ok: true,
      kind: 'stack',
      slot: i,
      accepted,
      overflow: count - accepted > 0 ? { itemId, count: count - accepted } : null,
      state: next,
      slots: slotSummary(next, cfg),
      options: [],
    };
  }

  // 2) 再用空槽
  for (let i = 0; i < cfg.slotCount; i++) {
    if (state.slots[i]) continue;
    const accepted = Math.min(cfg.stackMax, count);
    const next = cloneState(state);
    next.slots[i] = { itemId, count: accepted };
    next.revision += 1;
    next.stats.picked += accepted;
    return {
      ok: true,
      kind: 'empty',
      slot: i,
      accepted,
      overflow: count - accepted > 0 ? { itemId, count: count - accepted } : null,
      state: next,
      slots: slotSummary(next, cfg),
      options: [],
    };
  }

  // 3) 满栏：不改状态，交给调用方裁决
  return {
    ok: true,
    kind: 'full',
    state,
    incoming: { itemId, count, name: getItemDef(itemId).name },
    slots: slotSummary(state, cfg),
    options: ['replace', 'discard', 'useNow'],
  };
}

// 满栏裁决。
// resolution = { choice, slot?, requestId? }
export function resolvePickup(state, resolution, context = {}, config = DEFAULT_CONFIG) {
  const cfg = normalizeConfig(config);
  const choice = resolution && resolution.choice;
  const incoming = resolution && resolution.incoming;

  if (!incoming || !isKnownItem(incoming.itemId) || !Number.isInteger(incoming.count) || incoming.count < 1) {
    return { ok: false, reason: 'unknown_item', next: state, dropped: [], commands: [], feedback: { kind: 'error', text: '物品信息无效' } };
  }

  if (choice === 'replace') {
    const slot = resolution.slot;
    if (!Number.isInteger(slot) || slot < 0 || slot >= cfg.slotCount) {
      return { ok: false, reason: 'invalid_slot', next: state, dropped: [], commands: [], feedback: { kind: 'error', text: '槽位无效' } };
    }
    const held = state.slots[slot];
    if (!held) {
      return { ok: false, reason: 'empty_slot', next: state, dropped: [], commands: [], feedback: { kind: 'error', text: '这个格子是空的，不需要替换' } };
    }
    const accepted = Math.min(cfg.stackMax, incoming.count);
    const next = cloneState(state);
    next.slots[slot] = { itemId: incoming.itemId, count: accepted };
    next.revision += 1;
    next.stats.picked += accepted;
    const dropped = [{ itemId: held.itemId, count: held.count }];
    if (incoming.count > accepted) dropped.push({ itemId: incoming.itemId, count: incoming.count - accepted });
    next.stats.dropped += dropped.reduce((n, d) => n + d.count, 0);
    return {
      ok: true,
      next,
      dropped,
      commands: [],
      feedback: {
        kind: 'ok',
        text: `替换 ${getItemDef(held.itemId)?.name || held.itemId}，旧物品已放回地面`,
        replaced: { itemId: held.itemId, count: held.count },
      },
    };
  }

  if (choice === 'discard') {
    const next = cloneState(state);
    next.revision += 1;
    next.stats.dropped += incoming.count;
    return {
      ok: true,
      next,
      dropped: [{ itemId: incoming.itemId, count: incoming.count }],
      commands: [],
      feedback: { kind: 'neutral', text: `放弃 ${getItemDef(incoming.itemId)?.name || incoming.itemId}` },
    };
  }

  if (choice === 'useNow') {
    const requestId = resolution.requestId || `pickup-use:${incoming.itemId}:${state.clock}`;
    const used = useImmediately(state, incoming.itemId, context, requestId, cfg);
    if (!used.ok) {
      // 使用被拒绝：库存不变、也不掉落；玩家可以改选替换/放弃。
      return { ok: false, duplicate: used.duplicate, reason: used.reason, next: used.next, dropped: [], commands: [], feedback: used.feedback };
    }
    if (used.duplicate) return { ...used, dropped: [] };
    const dropped = incoming.count > 1 ? [{ itemId: incoming.itemId, count: incoming.count - 1 }] : [];
    const next = cloneState(used.next);
    if (dropped.length) {
      next.stats.dropped += dropped[0].count;
      next.revision += 1;
    }
    return { ok: true, next, dropped, commands: used.commands, feedback: used.feedback };
  }

  return { ok: false, reason: 'unknown_resolution', next: state, dropped: [], commands: [], feedback: { kind: 'error', text: '未知的满栏处理方式' } };
}
