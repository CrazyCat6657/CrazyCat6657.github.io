import { TEAM } from '../../core/constants.js';

const EPS = 1e-9;
export const FOLD_RULES = Object.freeze({ anchorLife: 12, returnRange: 40, energyPerDamage: .5 });
const FIELDS = ['qCharges', 'qRecharge', 'echoCd', 'swapCd', 'actionGap', 'echoGap', 'sequence', 'roomUid', 'images'];
const IMAGE_FIELDS = ['id', 'roomUid', 'x', 'z', 'left', 'kind'];
// Pending input belongs to this live Game, never to its save snapshot.
const runtimes = new WeakMap();
const finitePoint = p => p && Number.isFinite(p.x) && Number.isFinite(p.z);
const point = p => ({ x: p.x, z: p.z });
const exactObject = (v, fields) => v && typeof v === 'object' && !Array.isArray(v) &&
  [Object.prototype, null].includes(Object.getPrototypeOf(v)) && Reflect.ownKeys(v).length === fields.length &&
  fields.every(k => Object.hasOwn(v, k) && Object.getOwnPropertyDescriptor(v, k)?.get === undefined &&
    Object.getOwnPropertyDescriptor(v, k)?.set === undefined);

export function newFoldState() {
  return { qCharges: 2, qRecharge: 0, echoCd: 0, swapCd: 0, actionGap: 0, echoGap: 0,
    sequence: 0, roomUid: '', images: [] };
}

export function validateFoldState(s) {
  if (!exactObject(s, FIELDS) || !Number.isInteger(s.qCharges) || s.qCharges < 0 || s.qCharges > 2 ||
      !Number.isSafeInteger(s.sequence) || s.sequence < 0 || typeof s.roomUid !== 'string' || s.roomUid.length > 256 ||
      !Array.isArray(s.images) || s.images.length > 3) throw Error('折影状态结构无效');
  for (const [k, max] of Object.entries({ qRecharge: 3, echoCd: 8, swapCd: 2, actionGap: .12, echoGap: .25 })) {
    if (!Number.isFinite(s[k]) || s[k] < 0 || s[k] > max) throw Error(`折影 ${k} 无效`);
  }
  if (s.qCharges === 2 ? s.qRecharge !== 0 : s.qRecharge <= 0) throw Error('折影充能状态冲突');
  const ids = new Set(); let anchors = 0, bursts = 0;
  const images = Array.from(s.images, image => {
    if (!exactObject(image, IMAGE_FIELDS) || typeof image.id !== 'string' || !image.id || image.id.length > 128 ||
        ids.has(image.id) || !s.roomUid || image.roomUid !== s.roomUid || !finitePoint(image) ||
        !['anchor', 'burst'].includes(image.kind) || !Number.isFinite(image.left) || image.left <= 0 ||
        image.left > (image.kind === 'anchor' ? FOLD_RULES.anchorLife : 5)) throw Error('折影影像无效');
    ids.add(image.id); if (image.kind === 'anchor') anchors++; else bursts++;
    return Object.fromEntries(IMAGE_FIELDS.map(k => [k, image[k]]));
  });
  if (anchors > 1 || bursts > 2) throw Error('折影影像数量无效');
  return { ...Object.fromEntries(FIELDS.map(k => [k, s[k]])), images };
}

function enabled(g) {
  return g?.experiment?.version === 2 && g.experiment.scheme === 'foldshadow' && g.experiment.fold &&
    (g.hero || g.player?.hero)?.id === 'foldshadow';
}
function playable(g) {
  return enabled(g) && g.mode === 'run' && g.state === 'play' && !g.paused && !g.input?.blocked &&
    !g.input?.capturing && !g.panelOpen?.() && !g.buildOpen && !g._restoring && !g._importing &&
    !g.revivalPending && g.player?.alive;
}
function runtime(g) {
  let r = runtimes.get(g);
  if (!r || r.state !== g.experiment.fold) {
    r = { state: g.experiment.fold, epoch: g.input?.cancelEpoch, pending: null };
    runtimes.set(g, r);
  }
  if (r.epoch !== g.input?.cancelEpoch) { r.pending = null; r.epoch = g.input?.cancelEpoch; }
  return r;
}

export function clearFoldRoom(g) {
  if (!enabled(g)) return;
  g.experiment.fold.images = [];
  g.experiment.fold.roomUid = String(g.room?.uid || '');
  g.experiment.ultLeft = 0;
  runtime(g).pending = null;
}

function syncLife(g) {
  const s = g.experiment.fold, r = runtime(g), uid = String(g.room?.uid || '');
  if (s.roomUid !== uid) clearFoldRoom(g);
  if (!g.player?.alive) { s.images = []; r.pending = null; }
  if (!playable(g)) r.pending = null;
  return r;
}

function legalPoint(g, at, radius = g.player.radius) {
  if (!finitePoint(at) || typeof g.moveBlocked !== 'function' || typeof g.resolveCircle !== 'function' ||
      g.moveBlocked(at.x, at.z, radius, .9)) return false;
  const probe = { ...point(at), vx: 0, vz: 0 };
  g.resolveCircle(probe, radius, true);
  return finitePoint(probe) && Math.hypot(probe.x - at.x, probe.z - at.z) <= 1e-5;
}
function legalPath(g, from, to) {
  if (!finitePoint(from) || !finitePoint(to)) return false;
  const n = Math.max(1, Math.ceil(Math.hypot(to.x - from.x, to.z - from.z) / .2));
  for (let i = 0; i <= n; i++) {
    if (!legalPoint(g, { x: from.x + (to.x - from.x) * i / n, z: from.z + (to.z - from.z) * i / n })) return false;
  }
  return true;
}
function direction(g) {
  const move = g.input?.moveVec?.() || g.player.moveVec;
  const dir = finitePoint(move) && Math.hypot(move.x, move.z) > .01 ? move : g.player.aim;
  const length = finitePoint(dir) ? Math.hypot(dir.x, dir.z) : 0;
  return length > .01 ? { x: dir.x / length, z: dir.z / length } : null;
}
function event(g, type, payload) { g.foldVisuals?.event?.(type, payload); }
function moved(g, type, from) {
  g.player.vx = 0; g.player.vz = 0;
  g.updateCamera?.(0); g.solveAim?.();
  event(g, type, { from, to: point(g.player) });
}
function enemies(g) { return [...new Set([...(g.enemies || []), g.boss])].filter(e => e?.alive && !e.dummy && e.team === TEAM.ENEMY && finitePoint(e)); }
function imageAt(g, at, left, kind) {
  const s = g.experiment.fold;
  let id;
  do {
    s.sequence = s.sequence === Number.MAX_SAFE_INTEGER ? 0 : s.sequence + 1;
    id = `fold:${s.sequence}`;
  } while (s.images.some(i => i.id === id));
  return { id, roomUid: s.roomUid, ...point(at), left, kind };
}

// Readiness is cheap enough for the HUD; collision is checked only on use.
export function foldReturnInfo(g) {
  const s = g?.experiment?.fold, p = g?.player;
  const anchor = enabled(g) ? s.images.find(i => i.kind === 'anchor' && i.left > 0 &&
    i.roomUid === String(g.room?.uid || '') && i.roomUid === s.roomUid) || null : null;
  const distance = anchor && finitePoint(p) ? Math.hypot(anchor.x - p.x, anchor.z - p.z) : null;
  const ready = !!anchor && distance !== null && distance <= FOLD_RULES.returnRange + EPS && s.swapCd <= EPS && !(p.dashTime > 0);
  const reason = !anchor ? '先掠影自动留影，或手动留影' :
    distance === null ? '当前无法折返' : distance > FOLD_RULES.returnRange + EPS ? `距离 ${distance.toFixed(1)} 米，折返上限 ${FOLD_RULES.returnRange} 米` :
    p.dashTime > 0 ? '等待闪避结束后折返' : s.swapCd > EPS ? `折返冷却 ${s.swapCd.toFixed(1)} 秒` : '';
  return { anchor, distance, range: FOLD_RULES.returnRange, remaining: anchor?.left || 0, ready, reason };
}

export function foldActionFailure(g, action) {
  if (!enabled(g)) return '当前无法施放';
  const s = g.experiment.fold;
  if (action === 'ultimate') return g.experiment.ultLeft > 0 ? '万象折镜正在持续，结束后才能再次充能' :
    `万象折镜能量 ${Math.floor(g.experiment.energy)}/100：射击或爆炸命中真实敌人充能；满后按大招键开启`;
  if (action === 'skill_3') return foldReturnInfo(g).reason || '折返路径被墙体或锁门挡住，或落点不安全';
  if (action === 'skill_2') return s.echoCd > EPS ? `手动留影冷却 ${s.echoCd.toFixed(1)} 秒；没有影像时掠影仍会自动留影` : '当前落点不安全，无法留影';
  return s.qCharges < 1 ? '掠影充能中' : g.player.dashTime > 0 ? '等待闪避结束后掠影' : '前方没有安全落点';
}

function execute(g, action, dir) {
  const p = g.player, s = g.experiment.fold;
  if (action === 'skill_1') {
    if (s.qCharges < 1 || p.dashTime > 0 || !dir || !legalPoint(g, p)) return false;
    const from = point(p); let to = from;
    for (let i = 1; i <= 25; i++) {
      const next = { x: from.x + dir.x * .2 * i, z: from.z + dir.z * .2 * i };
      if (!legalPoint(g, next)) break;
      to = next;
    }
    if (Math.hypot(to.x - from.x, to.z - from.z) < 1e-4) return false;
    p.x = to.x; p.z = to.z;
    // A normal Q→shoot→C loop needs no preparatory E. Never replace an
    // existing retreat point, and never create one for a rejected movement.
    if (!s.images.some(i => i.kind === 'anchor' && i.left > 0 && i.roomUid === s.roomUid)) {
      s.images = s.images.filter(i => i.kind !== 'anchor');
      s.images.push(imageAt(g, from, FOLD_RULES.anchorLife, 'anchor'));
      event(g, 'anchor', { from, to: from });
    }
    if (s.qCharges === 2) s.qRecharge = 3;
    s.qCharges--; s.actionGap = .12;
    moved(g, 'step', from); return true;
  }
  if (action === 'skill_2') {
    if (s.echoCd > EPS || !s.roomUid || !legalPoint(g, p)) return false;
    s.images = s.images.filter(i => i.kind !== 'anchor');
    s.images.push(imageAt(g, p, FOLD_RULES.anchorLife, 'anchor')); s.echoCd = 8;
    event(g, 'anchor', { from: point(p), to: point(p) }); return true;
  }
  if (action === 'skill_3') {
    const { anchor, ready } = foldReturnInfo(g);
    if (!ready || !anchor ||
        !legalPath(g, p, anchor)) return false;
    const from = point(p), to = point(anchor);
    p.x = to.x; p.z = to.z; anchor.x = from.x; anchor.z = from.z;
    s.swapCd = 2; s.actionGap = .12;
    g.notifyConsumableAttack?.();
    for (const e of enemies(g).filter(e => Math.hypot(e.x - p.x, e.z - p.z) <= 2.3).slice(0, 8)) {
      g.onDamage?.(e, 8, { source: 'foldSlash', owner: p, assetSecondary: true, assetNoRefund: true });
    }
    moved(g, 'swap', from); return true;
  }
  if (action !== 'ultimate' || g.experiment.energy < 100 || g.experiment.ultLeft > 0 || !s.roomUid || !legalPoint(g, p)) return false;
  g.experiment.energy = 0; g.experiment.ultLeft = 5;
  s.qCharges = 2; s.qRecharge = 0;
  s.images = s.images.filter(i => i.kind === 'anchor');
  if (!s.images.length) s.images.push(imageAt(g, p, 5, 'anchor'));
  for (const radius of [1.5, .75]) {
    for (let i = 0; i < 8 && s.images.filter(v => v.kind === 'burst').length < 2; i++) {
      const at = { x: p.x + Math.cos(i * Math.PI / 4) * radius, z: p.z + Math.sin(i * Math.PI / 4) * radius };
      if (s.images.some(v => Math.hypot(v.x - at.x, v.z - at.z) < .5) || !legalPath(g, p, at)) continue;
      s.images.push(imageAt(g, at, 5, 'burst'));
    }
  }
  event(g, 'ultimate', { from: point(p), to: point(p) }); return true;
}

export function tryFoldAction(g, action) {
  if (!enabled(g)) return false;
  const r = syncLife(g);
  if (!playable(g)) return false;
  if (action === 'skill_1' || action === 'skill_3') {
    const dir = action === 'skill_1' ? direction(g) : null;
    if (action === 'skill_1' && !dir) return false;
    if (g.experiment.fold.actionGap > EPS) {
      if (r.pending) return false;
      r.pending = { action, dir, left: .15 }; return true;
    }
    return execute(g, action, dir);
  }
  return execute(g, action);
}

function advance(g, dt, boosted) {
  const s = g.experiment.fold;
  for (const k of ['echoCd', 'swapCd', 'actionGap', 'echoGap']) s[k] = Math.max(0, s[k] - dt);
  let recharge = dt * (boosted ? 1.5 : 1);
  while (s.qCharges < 2 && recharge > 0) {
    if (recharge + EPS < s.qRecharge) { s.qRecharge -= recharge; break; }
    recharge = Math.max(0, recharge - s.qRecharge); s.qCharges++;
    s.qRecharge = s.qCharges === 2 ? 0 : 3;
  }
  s.images = s.images.map(i => ({ ...i, left: i.left - dt })).filter(i => i.left > EPS);
}

export function tickFold(g, dt, { ultActiveFor = 0 } = {}) {
  if (!enabled(g)) return;
  const roomChanged = g.experiment.fold.roomUid !== String(g.room?.uid || '');
  const r = syncLife(g);
  if (!playable(g) || !Number.isFinite(dt) || dt <= 0) return;
  const active = roomChanged ? 0 : Math.min(dt, Math.max(0, Number.isFinite(ultActiveFor) ? ultActiveFor : 0));
  let elapsed = 0;
  // Integrate the input deadline, action interval and ultimate boundary inside
  // the frame, so one long frame spends/recharges exactly like smaller frames.
  while (elapsed < dt - EPS) {
    let step = dt - elapsed;
    if (elapsed < active - EPS) step = Math.min(step, active - elapsed);
    if (r.pending) step = Math.min(step, r.pending.left, Math.max(0, g.experiment.fold.actionGap));
    if (step > EPS) {
      advance(g, step, elapsed < active - EPS); elapsed += step;
      if (r.pending) r.pending.left = Math.max(0, r.pending.left - step);
    }
    if (r.pending && g.experiment.fold.actionGap <= EPS && r.pending.left >= -EPS) {
      const queued = r.pending; r.pending = null; execute(g, queued.action, queued.dir);
    } else if (r.pending && r.pending.left <= EPS) r.pending = null;
    else if (step <= EPS) break;
  }
  // The shared controller already advanced ultLeft before this call.
  g.experiment.fold.images = g.experiment.fold.images.filter(i => i.kind !== 'burst' || g.experiment.ultLeft > EPS)
    .map(i => i.kind === 'burst' ? { ...i, left: Math.min(i.left, g.experiment.ultLeft) } : i);
}

export function foldOnPaidShot(g, payload) {
  if (!enabled(g)) return false;
  syncLife(g);
  const s = g.experiment.fold, p = g.player;
  if (!playable(g) || payload?.paid !== true || payload.assetSecondary || s.echoGap > EPS ||
      typeof g.pointBlocked !== 'function' || typeof g.onDamage !== 'function') return false;
  const images = s.images.filter(i => i.left > 0 && i.roomUid === s.roomUid);
  const damage = Math.min(12, payload.def?.damage * (p.stats?.damage ?? 1) * .25);
  if (!images.length || !Number.isFinite(damage) || damage <= 0) return false;
  s.echoGap = .25;
  const targets = enemies(g), segments = [];
  for (const image of images) {
    const aim = finitePoint(p.aimPoint) ? { x: p.aimPoint.x - image.x, z: p.aimPoint.z - image.z } : p.aim;
    const len = finitePoint(aim) ? Math.hypot(aim.x, aim.z) : 0;
    if (len <= EPS) continue;
    const dir = { x: aim.x / len, z: aim.z / len }; let wall = 14;
    for (let d = 0; d <= 14 + EPS; d += .1) {
      if (g.pointBlocked(image.x + dir.x * d, image.z + dir.z * d, .05, .85)) { wall = Math.max(0, d - .1); break; }
    }
    let target = null, distance = wall;
    for (const e of targets) {
      const dx = e.x - image.x, dz = e.z - image.z, projection = dx * dir.x + dz * dir.z;
      const radius = .4 + Math.max(0, e.radius ?? e.r ?? .5), side2 = dx * dx + dz * dz - projection * projection;
      if (projection < 0 || projection > 14 || side2 > radius * radius) continue;
      const hit = Math.max(0, projection - Math.sqrt(Math.max(0, radius * radius - side2)));
      // A center behind the sampled wall must not receive an edge hit through it.
      if (projection > wall + EPS || hit > distance) continue;
      distance = hit; target = e;
    }
    const to = { x: image.x + dir.x * distance, z: image.z + dir.z * distance };
    segments.push({ from: point(image), to });
    if (target) g.onDamage(target, damage / images.length, { source: 'foldEcho', owner: p,
      assetSecondary: true, assetNoRefund: true, dir });
  }
  event(g, 'shot', { segments });
  return true;
}
