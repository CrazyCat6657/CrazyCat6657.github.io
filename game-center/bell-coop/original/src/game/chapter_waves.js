import { RNG } from '../core/rng.js';
import { ENEMY_MAP } from './data.js';

// Store on the room and in room snapshots, alongside the existing pendingSpawns.
// next counts waves already transferred to that persistent pending-spawn queue.
export function createChapterWaveState(waves = []) {
  return {
    version: 1,
    next: 0,
    waves: waves.map(w => ({
      enemies: [...w.enemies], delay: Math.max(1.2, Number(w.delay) || 1.6),
      elite: !!w.elite, eliteIndices: [...(w.eliteIndices || [])],
    })),
  };
}

// Validate before cloning/migration so malformed explicit fields cannot vanish
// in JSON encoding. Return a detached state; saved snapshots must stay immutable.
export function validateChapterWaveState(state) {
  const plain = x => x && Object.getPrototypeOf(x) === Object.prototype;
  const exact = (x, keys) => plain(x) && Object.keys(x).length === keys.length && keys.every(k => Object.hasOwn(x, k));
  if (!exact(state, ['version', 'next', 'waves']) || state.version !== 1 ||
      !Array.isArray(state.waves) || state.waves.length > 4 ||
      !Number.isSafeInteger(state.next) || state.next < 0 || state.next > state.waves.length) throw Error('章节波次状态无效');
  let total = 0;
  for (const w of state.waves) {
    if (!exact(w, ['enemies', 'delay', 'elite', 'eliteIndices']) || !Array.isArray(w.enemies) ||
        w.enemies.length < 1 || w.enemies.length > 40 || w.enemies.some(id => typeof id !== 'string' || !Object.hasOwn(ENEMY_MAP, id)) ||
        !Number.isFinite(w.delay) || w.delay < 1.2 || w.delay > 20 || typeof w.elite !== 'boolean' ||
        !Array.isArray(w.eliteIndices) || new Set(w.eliteIndices).size !== w.eliteIndices.length ||
        w.eliteIndices.some(i => !Number.isSafeInteger(i) || i < 0 || i >= w.enemies.length)) throw Error('章节波次编成无效');
    total += w.enemies.length;
  }
  if (total > 80) throw Error('章节波次总数无效');
  return structuredClone(state);
}

export function chapterWavesPending(state) {
  if (!state) return 0;
  return state.waves.slice(state.next).reduce((n, w) => n + w.enemies.length, 0);
}

// Call after updatePendingSpawns and before room-clear checks. `pending` is the
// PHYSICAL queue count, excluding chapterWavesPending (which is for door locks).
// spawnWave must schedule the entire wave with wave.delay warning, or return
// false without scheduling anything when safe positions are not yet available.
export function tickChapterWaves(state, { alive = 0, pending = 0, spawnWave } = {}) {
  if (!state || state.next >= state.waves.length || alive > 0 || pending > 0) return false;
  const index = state.next;
  if (spawnWave(state.waves[index], index) === false) return false;
  state.next++;
  return true;
}

// World coordinates throughout. Grid sampling avoids the old fallback that
// piled every enemy beyond enemySpots.length onto a single location. Accept
// enemies to use real scaled body radii, particularly the large chapter brutes.
// A short result is a retry signal; never substitute a blocked or unsafe point.
export function findChapterSpawnPoints({ scene, player, players=player?[player]:[], count, seed = 1, enemies = [], radius = 0.75, minPlayerDistance = 5.5 } = {}) {
  const n = Math.max(0, Math.trunc(count ?? enemies.length));
  if (!scene || !n || typeof scene.pointBlocked !== 'function' || typeof scene.hazardAt !== 'function') return [];
  const ox = scene.ox || 0, oz = scene.oz || 0;
  const radii = Array.from({ length: n }, (_, i) => {
    const d = ENEMY_MAP[enemies[i]];
    return d ? d.radius * (d.scale || 1) * 0.95 : radius;
  });
  const largest = Math.max(...radii);
  const lim = scene.inner - Math.max(1.4, largest + 0.2);
  if (!(lim > 0)) return [];
  const candidates = [];
  const steps = Math.max(1, Math.floor(lim * 2 / 0.7));
  for (let ix = 0; ix <= steps; ix++) for (let iz = 0; iz <= steps; iz++) {
    candidates.push({ x: ox - lim + ix * lim * 2 / steps, z: oz - lim + iz * lim * 2 / steps });
  }
  new RNG((seed ^ 0x1635af31) >>> 0).shuffle(candidates);
  const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => radii[b] - radii[a]);
  const placed = [];
  for (const index of order) {
    const r = radii[index];
    const pos = candidates.find(p => {
      if (players.some(pl=>Math.hypot(p.x-pl.x,p.z-pl.z)<minPlayerDistance)) return false;
      if (scene.pointBlocked(p.x, p.z, r + 0.15, 0.9) || scene.hazardAt(p.x, p.z, r + 0.15)) return false;
      return placed.every(q => Math.hypot(p.x - q.x, p.z - q.z) >= r + q.radius + 0.15);
    });
    if (!pos) return placed.map(({ x, z }) => ({ x, z }));
    placed.push({ ...pos, index, radius: r });
  }
  return placed.sort((a, b) => a.index - b.index).map(({ x, z }) => ({ x, z }));
}
