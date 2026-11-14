import { pickupPathClear } from './pickup_path.js';
import { ATTACH_MAP } from './attachments.js';
import { preferences } from './preferences.js';

// Positions are capacity slots, distinct from attachment *types* (barrel/core/etc).
// Old weapons have implicit sequential positions; no legacy save is rewritten.
export function attachmentPositions(w) {
  return w.attachmentPositions || (w.attachments || []).map((_, i) => i);
}
export function validAttachmentPositions(w, limit = 3) {
  const a = w.attachmentPositions;
  return a === undefined || Array.isArray(a) && a.length === (w.attachments || []).length &&
    a.every(i => Number.isInteger(i) && i >= 0 && i < limit) && new Set(a).size === a.length;
}

export const EQUIPMENT_DROP_CAP = 1000; // Existing session dynamic-object cap.
const SEPARATION = 1.15;
export function planEquipmentDrops(game, entries, { x = game.player.x, z = game.player.z, direction = game.player.aim } = {}) {
  const existing = [...(game.pickups?.list || []), ...(game._plannedEquipmentDrops || [])].filter(p => !p.collected);
  if (existing.length + entries.length > EQUIPMENT_DROP_CAP) throw Error('地面物品已满，请先腾出位置；全部装备已保留');
  const world = game._equipmentDropWorld || game, scene = world.roomScene;
  const angle = Math.atan2(direction?.x || 0, direction?.z || 1), positions = [];
  // Deterministic geometry search. No RNG, scene objects or live inventory change.
  for (const entry of entries) {
    let found = null;
    for (const radius of [2.9, 2.1, 3.8, 1.4, 4.6, .7]) {
      for (let i = 0; i < 24; i++) {
        const a = angle + i * Math.PI * 2 / 24;
        const raw = { x: x + Math.sin(a) * radius, z: z + Math.cos(a) * radius };
        const pt = scene?.clampToRoom ? scene.clampToRoom(raw.x, raw.z, .8) : raw;
        if (![pt.x, pt.z].every(Number.isFinite) || Math.hypot(pt.x - x, pt.z - z) < .65) continue;
        if (!pickupPathClear(world, x, z, pt.x, pt.z) ||
            scene?.pointBlocked?.(pt.x, pt.z, .55, .9) || scene?.hazardAt?.(pt.x, pt.z, .55)) continue;
        if ([...existing, ...positions].some(p => Math.hypot(p.x - pt.x, p.z - pt.z) < SEPARATION)) continue;
        found = { ...entry, ...pt, armDelay: .9, noReturn: true, y: .9, vx: 0, vz: 0, vy: 0 };
        break;
      }
      if (found) break;
    }
    if (!found) throw Error('附近没有足够的可及落点；全部装备已保留');
    positions.push(found);
  }
  return positions;
}
export function weaponDropEntries(game, w, { whole = false } = {}) {
  if (!w?.def) throw Error('没有这把武器');
  const detach = !whole && (game._equipmentPreferences || preferences.get()).autoDetachOnReplace;
  const gun = { kind: 'weapon', id: w.def.id, mag: w.mag, reserve: w.reserve, dmgMul: w.dmgMul,
    definitionVersion: w.def.weaponAssetVersion || 1, assetInstanceId: w.assetInstanceId,
    assetState: w.assetState ? structuredClone(w.assetState) : undefined,
    attachments: detach ? [] : [...(w.attachments || [])],
    ...(detach ? {} : w.attachmentPositions ? { attachmentPositions: [...w.attachmentPositions] } : {}) };
  return [gun, ...(detach ? (w.attachments || []).map(id => {
    if (!ATTACH_MAP[id]) throw Error('未知配件；全部装备已保留');
    return { kind: 'attachment', id, attId: id };
  }) : [])];
}
export function spawnPlannedEquipment(game, plan) {
  return plan.map(({ kind, x, z, ...opts }) => game.pickups.spawn(kind, x, z, opts));
}
