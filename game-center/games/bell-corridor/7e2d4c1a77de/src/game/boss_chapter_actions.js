import {combatPlayers} from '../experimental/consumables/visibility.js';
// Expedition-only additions. Data stays plain so room snapshots resume warnings exactly.
export const BOSS_SUMMON_CAP = 4;
const ownerKey = b => `chapter-boss:${b.bossType}`;

export function chapterBossEnabled(game) {
  return game.stage?.contentVersion === 3 || game.dungeon?.contentVersion === 3;
}

export function bossWarning(b, x, z, radius, delay, damage = 1, color = '#ff9a62') {
  const p = b.game.clampToRoom(x, z, radius + 0.3);
  const index = b.game.hazards.items.length;
  b.game.hazards.add(p.x, p.z, radius, delay, damage, color);
  const h = b.game.hazards.items[index];
  if (!h) return null;
  h.bossOwner = ownerKey(b);
  return p;
}

export function queueBossSummons(b, kinds = ['grunt', 'grunt']) {
  if (!b.alive || !b.chapterActions) return 0;
  const g = b.game;
  const pending = g.pendingSpawns.filter(q => q.room === g.room && q.bossOwner === ownerKey(b)).length;
  // Boss arenas have no ambient waves; counting all live adds also covers old hero rules.
  const living = g.enemies.filter(e => e.alive).length;
  const count = Math.min(kinds.length, Math.max(0, BOSS_SUMMON_CAP - pending - living));
  const sc = g.roomScene;
  if (!sc) return 0;
  const cx = sc.ox, cz = sc.oz;
  const radius = Math.min(10, sc.inner * 0.65);
  const chosen = g.pendingSpawns.filter(q => q.room === g.room && q.bossOwner === ownerKey(b)).map(q => ({ x: q.x, z: q.z }));
  for (let i = 0; i < count; i++) {
    const a = b.chapterActions.sequence * 1.7 + i * Math.PI;
    // Pick the farthest of four corners after clamping, including edge cases near walls.
    const candidates = Array.from({ length: 4 }, (_, j) => g.clampToRoom(
      cx + Math.cos(a + j * Math.PI / 2) * radius,
      cz + Math.sin(a + j * Math.PI / 2) * radius, 1.8));
    const players=combatPlayers(g),distance=p=>Math.min(...players.map(pl=>Math.hypot(p.x-pl.x,p.z-pl.z)));
    candidates.sort((p, q) => distance(q)-distance(p));
    const p = candidates.find(p => distance(p) >= 5.5 &&
      !sc.pointBlocked(p.x, p.z, 1.3, 0.9) && !sc.hazardAt(p.x, p.z, 1.3) &&
      !g.hazards.items.some(h => h.alive && h.damage > 0 && Math.hypot(h.x - p.x, h.z - p.z) < h.radius + 1.3) &&
      chosen.every(q => Math.hypot(q.x - p.x, q.z - p.z) > 3));
    if (!p) continue;
    chosen.push(p);
    if (!bossWarning(b, p.x, p.z, 1.5, 1.35, 0, '#8ad8ff')) continue;
    g.spawnEnemy(kinds[i], p.x, p.z, { delay: 1.35, fromSummon: true });
    g.pendingSpawns.at(-1).bossOwner = ownerKey(b);
  }
  b.chapterActions.sequence++;
  return g.pendingSpawns.filter(q => q.room === g.room && q.bossOwner === ownerKey(b)).length - pending;
}

export function cancelBossChapterActions(b) {
  const g = b.game, key = ownerKey(b);
  for (let i = g.pendingSpawns.length - 1; i >= 0; i--) {
    if (g.pendingSpawns[i].bossOwner === key) g._dropPending(i);
  }
  for (const h of [...g.hazards.items]) if (h.bossOwner === key) g.hazards.remove(h);
}

// Instance methods are non-enumerable: persistence captures data, never bound functions.
export function attachBossChapterActions(b) {
  b.chapterActions = { cooldown: 7, sequence: 0 };
  const update = b.update.bind(b), die = b.die.bind(b), remove = b.remove.bind(b);
  Object.defineProperties(b, {
    update: { value(dt, world) {
      if (!b.alive) { cancelBossChapterActions(b); b.updateDeath(dt); return; }
      update(dt, world);
      if (!b.alive) { cancelBossChapterActions(b); return; }
      // Six new bosses schedule summons as part of their own move sequence.
      if (b.variantState || b.state === 'intro' || b.state === 'phase') return;
      b.chapterActions.cooldown -= dt;
      if (b.chapterActions.cooldown <= 0) {
        const kinds = b.bossType === 'bell_beast' ? ['grunt', 'shielder'] : b.bossType === 'silent_hierophant' ? ['abyss_grunt', 'hound'] : ['hound', 'abyss_grunt'];
        queueBossSummons(b, kinds);
        b.chapterActions.cooldown = 12;
      }
    } },
    die: { value(opts) { cancelBossChapterActions(b); die(opts); } },
    remove: { value() { cancelBossChapterActions(b); remove(); } },
  });
  return b;
}
