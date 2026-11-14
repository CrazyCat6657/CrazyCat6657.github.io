// Development evidence lives outside save/RNG/game state. Snapshot reads never repair or clear rooms.
const traces = new WeakMap();
const overlayEnabled = typeof location !== 'undefined' && new URLSearchParams(location.search).get('diagnostics') === '1';
export function beginRoomDiagnostic(game, room, entryDir, opts = {}) {
  const prior = traces.get(game);
  traces.set(game, { roomUID: room.uid, priorCleared: !!room.cleared,
    entry: game._restoringRoom ? 'save-restore' : opts.keepPos ? 'portal' : entryDir ? 'door' : 'direct',
    direction: entryDir || null, restored: !!game._restoringRoom || !!game.roomStates?.has(room.uid),
    spawned: 0, errors: [], events: [...(prior?.events || []).slice(-47), { event: 'enter', roomUID: room.uid }] });
}
export function recordRoomDiagnostic(game, event, detail = {}) {
  const trace = traces.get(game);
  if (!trace) return;
  if (event === 'spawn') trace.spawned++;
  if (event === 'error') trace.errors.push(String(detail.message).slice(0, 240));
  trace.events.push({ event, roomUID: detail.roomUID || game.room?.uid || null, ...detail });
  if (trace.events.length > 48) trace.events.shift();
}
export function roomPurpose(room) {
  if (!room) return '暂无房间';
  if ((room.content?.enemies || []).length || room.type === 'boss') return room.cleared ? '战斗已结束 · 可继续探索' : '战斗区域';
  return ({ start: '安全前厅 · 整理装备后出发', shop: '安全商栈 · 交易与补给', treasure: '宝藏遗迹 · 搜寻宝箱', hidden: '隐藏遗迹 · 搜寻补给', special: '秘仪遗迹 · 交互查看事件', exit: '安全阶梯 · 前往下一层' })[room.type] || '空遗迹 · 探索通路';
}
export function roomDiagnostics(game) {
  const r = game.room, c = r?.content || {}, trace = traces.get(game), activeTrace = trace?.roomUID === r?.uid ? trace : null;
  const pending = (game.pendingSpawns || []).filter(q => q.room === r);
  const entities = [...(game.enemies || []), ...(game.boss ? [game.boss] : [])];
  const plannedInitial = (c.enemies || []).length + (r?.type === 'boss' ? 1 : 0);
  const plannedReinforcements = (c.waves || []).reduce((n,w) => n + (w.enemies || []).length, 0);
  const spawned = Math.max(activeTrace?.spawned || 0, entities.length);
  const errors = [...(activeTrace?.errors || [])];
  if (r && !r.cleared && plannedInitial > 0 && spawned === 0 && pending.length === 0 && !game.attract) errors.push('planned-initial-without-spawn-or-pending');
  const sc = game.roomScene;
  if (sc?.room && sc.room.uid !== r?.uid) errors.push('scene-room-mismatch');
  return { seed: game.seed ?? null, floor: game.floor ?? null, roomUID: r?.uid ?? null, type: r?.type ?? null,
    colorRole: r?.colorRole || (r?.cleared ? 'cleared' : ['battle','vault','boss'].includes(r?.type) ? 'combat' : r?.type || 'none'),
    purpose: roomPurpose(r), entry: activeTrace?.entry ?? 'unknown', entryDirection: activeTrace?.direction ?? null,
    priorCleared: activeTrace?.priorCleared ?? null, cleared: !!r?.cleared, encounter: c.archetype || null,
    planned: plannedInitial + plannedReinforcements, plannedInitial, plannedReinforcements, spawned,
    spawnedScope: 'current activation; restored entities included; not a lifetime kill counter',
    pending: pending.length, alive: entities.filter(e => e.alive).length, locked: !!r?.locked, doorLock: !!game._doorsLocked,
    reinforcements: { scheduled: !!r?.wavesSpawned, pending: pending.filter(q => q.fromWave).length, delays: pending.map(q => ({kind:q.kind,seconds:q.t,fromWave:!!q.fromWave})) },
    scene: { instance: sc?.group?.uuid || null, roomUID: sc?.room?.uid || null, resident: !!game._residentRooms?.has(r?.uid), previewRoomUID: game.previewRoom?.uid || null },
    errors, rewards: { plannedChests: (c.chests || []).length, sceneChests: (sc?.props || sc?.chests || []).filter(ch=>!ch.kind||ch.kind==='chest').map(ch => ({opened:!!ch.opened,quality:ch.quality || null})), pickups: (game.pickups?.list || []).filter(p=>!p.shopSlot).map(p=>({kind:p.kind,id:p.id || null})), pendingLoot:(game.pendingLoot || []).filter(q=>q.roomId===r?.uid).length },
    special: { event: c.event || r?.event || null, optional: !!r?.optional, secretOpen: sc?.secretOpen?.size || 0 },
    restore: { applying: !!game._restoring || !!game._restoringRoom, source: activeTrace?.restored ? 'room-snapshot' : 'generated', savedRoom: !!game.roomStates?.has(r?.uid) },
    events: (activeTrace?.events || []).map(e=>({...e})) };
}
export function updateRoomDiagnosticOverlay(game) {
  if (typeof document === 'undefined' || !overlayEnabled) return;
  let el = document.getElementById('room-diagnostics');
  if (!el) { el=document.createElement('pre');el.id='room-diagnostics';el.style.cssText='position:fixed;left:8px;top:76px;max-width:420px;max-height:50vh;overflow:hidden;padding:8px;background:#07121fe8;color:#cde9ff;font:11px monospace;z-index:10000;pointer-events:none;white-space:pre-wrap';document.body.appendChild(el); }
  const s=roomDiagnostics(game);
  el.textContent=`Seed ${s.seed} / F${s.floor} / ${s.roomUID}\n${s.type} / ${s.colorRole} / ${s.purpose}\nentry ${s.entry} ${s.entryDirection || ''} / priorClear ${s.priorCleared} / cleared ${s.cleared}\nencounter ${s.encounter} / planned ${s.planned} / spawned ${s.spawned}\npending ${s.pending} / alive ${s.alive} / lock ${s.locked}\nreinforcements ${s.reinforcements.pending} / scene ${s.scene.instance}\nrestore ${s.restore.source} / chests ${s.rewards.plannedChests} / loot ${s.rewards.pendingLoot}\nspecial ${s.special.event || '-'} / errors ${s.errors.join(', ') || 'none'}`;
}
