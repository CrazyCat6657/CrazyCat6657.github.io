import {FOLD_RULES,newFoldState,validateFoldState,tickFold,tryFoldAction} from './fold_shadow.js';
import { TEAM } from '../../core/constants.js';

const FIELDS = ['version', 'scheme', 'stamina', 'regenDelay', 'exhausted', 'cdStep', 'cdTactic', 'energy', 'ultLeft'];
const MAX_STAMINA = 100, SPRINT_COST = 25, REGEN_DELAY = .8, REGEN_RATE = 20, RESTART_STAMINA = 20;
const EPS = 1e-9;

export function newCombatState(scheme = 'fixed') {
  if (!['fixed','mixed','foldshadow'].includes(scheme)) throw new Error('未知战斗实验方案');
  return { version: scheme==='foldshadow'?2:1, scheme, ...(scheme==='foldshadow'?{fold:newFoldState()}:{}), stamina: MAX_STAMINA, regenDelay: 0, exhausted: false,
    cdStep: 0, cdTactic: 0, energy: 0, ultLeft: 0 };
}

// Save boundaries call this before attaching state to a live Game. Never repair
// malformed snapshots silently: the classic/experiment reader must reject them.
export function validateCombatState(state) {
  const folded=state?.scheme==='foldshadow', keys=folded?[...FIELDS,'fold']:FIELDS;
  if (!state || typeof state !== 'object' || Array.isArray(state) ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(state)) ||
      Reflect.ownKeys(state).length !== keys.length || keys.some(k => !Object.hasOwn(state, k)) ||
      state.version !== (folded?2:1) || !['fixed', 'mixed','foldshadow'].includes(state.scheme) || typeof state.exhausted !== 'boolean') {
    throw new Error('战斗实验状态结构无效');
  }
  const limits = { stamina: MAX_STAMINA, regenDelay: REGEN_DELAY, cdStep: 6,
    cdTactic: state.scheme === 'mixed' ? 18 : 12, energy: 100, ultLeft: 5 };
  for (const [key, max] of Object.entries(limits)) {
    if (!Number.isFinite(state[key]) || state[key] < 0 || state[key] > max) throw new Error(`战斗实验 ${key} 无效`);
  }
  if ((state.exhausted && state.stamina >= RESTART_STAMINA) || (!state.exhausted && state.stamina === 0) ||
      (state.ultLeft > 0 && state.energy > 0)) throw new Error('战斗实验状态互相冲突');
  const result=Object.fromEntries(FIELDS.map(k => [k, state[k]]));
  if (folded) {
    result.fold=validateFoldState(state.fold);
    if (state.cdStep!==0 || state.cdTactic!==0 || result.fold.images.some(i=>i.kind==='burst'&&i.left>state.ultLeft+1e-8)) throw Error('折影者状态与公共计时冲突');
  }
  return result;
}

function playable(g) {
  return !!(g?.experiment && g.mode === 'run' && g.state === 'play' && !g.paused &&
    !g.panelOpen?.() && !g.buildOpen && !g._restoring && !g._importing && !g.revivalPending &&
    g.player?.alive && (g.hero || g.player.hero)?.id === (g.experiment.scheme==='foldshadow'?'foldshadow':'warden'));
}

export function tickCombat(g, dt, context = {}) {
  if (!playable(g) || !Number.isFinite(dt) || dt <= 0) {
    if (g?.experiment?.fold) tickFold(g,0);
    return { speedMul: 1, sprinting: false };
  }
  const s = g.experiment;
  s.cdStep = Math.max(0, s.cdStep - dt);
  s.cdTactic = Math.max(0, s.cdTactic - dt);
  const ultActiveFor=Math.min(dt,s.ultLeft);
  s.ultLeft = Math.max(0, s.ultLeft - dt);
  if (s.fold) tickFold(g,dt,{ultActiveFor});
  const wantsSprint = context.sprintHeld && context.moving && !context.firing && !context.reloading && !context.dashing;
  let left = dt, sprintTime = 0;
  // Integrate transitions within a frame, including delay and exhaustion. A
  // stutter frame therefore travels the same distance as many short frames.
  while (left > EPS) {
    if (wantsSprint && !s.exhausted && s.stamina > EPS) {
      const spent = Math.min(left, s.stamina / SPRINT_COST);
      s.stamina = Math.max(0, s.stamina - spent * SPRINT_COST);
      s.regenDelay = REGEN_DELAY;
      sprintTime += spent;
      left = Math.max(0, left - spent);
      if (s.stamina < EPS) { s.stamina = 0; s.exhausted = true; }
      continue;
    }
    if (s.regenDelay > 0) {
      const waited = Math.min(left, s.regenDelay);
      s.regenDelay = Math.max(0, s.regenDelay - waited);
      left = Math.max(0, left - waited);
      continue;
    }
    const recovering = s.exhausted ? RESTART_STAMINA : MAX_STAMINA;
    const regained = Math.min(left, Math.max(0, recovering - s.stamina) / REGEN_RATE);
    s.stamina = Math.min(recovering, s.stamina + regained * REGEN_RATE);
    left = Math.max(0, left - regained);
    if (s.exhausted && s.stamina >= RESTART_STAMINA - EPS) {
      s.stamina = RESTART_STAMINA;
      s.exhausted = false;
    } else break;
    // Once unlocked, an idle player continues restoring toward 100; a held
    // sprint can resume immediately, without requiring another key edge.
  }
  return { speedMul: 1 + .5 * sprintTime / dt, sprinting: sprintTime > EPS };
}

function stepForward(g) {
  const p = g.player, s = g.experiment;
  if (s.cdStep > 0 || p.dashTime > 0 || typeof g.moveBlocked !== 'function' || typeof g.resolveCircle !== 'function') return false;
  const move = g.input?.moveVec?.() || p.moveVec;
  const moveLength = Math.hypot(move?.x || 0, move?.z || 0);
  const dir = moveLength > .01 ? move : p.aim;
  const length = Math.hypot(dir?.x || 0, dir?.z || 0);
  if (!Number.isFinite(length) || length <= .01) return false;
  const dx = dir.x / length * .2, dz = dir.z / length * .2;
  const startX = p.x, startZ = p.z;
  for (let i = 0; i < 20; i++) {
    const oldX = p.x, oldZ = p.z, x = oldX + dx, z = oldZ + dz;
    if (g.moveBlocked(x, z, p.radius, .9)) break;
    p.x = x; p.z = z;
    g.resolveCircle(p, p.radius, true);
    if (!Number.isFinite(p.x) || !Number.isFinite(p.z) || Math.hypot(p.x - x, p.z - z) > .02 ||
        Math.hypot(p.x - oldX, p.z - oldZ) > .2 + EPS) {
      p.x = oldX; p.z = oldZ;
      break;
    }
  }
  if (Math.hypot(p.x - startX, p.z - startZ) <= 1e-4) return false;
  p.vx = 0; p.vz = 0;
  s.cdStep = 6;
  g.updateCamera?.(0);
  g.solveAim?.();
  return true;
}

function tactic(g) {
  const s = g.experiment, p = g.player;
  if (s.cdTactic > 0) return false;
  if (s.scheme === 'mixed') {
    if (p.barrier >= 2) return false;
    p.barrier = Math.max(p.barrier || 0, 2);
    s.cdTactic = 18;
    return true;
  }
  const targets = new Set([...(g.enemies || []), g.boss].filter(e => e?.alive && !e.dummy &&
    e.team === TEAM.ENEMY && Math.hypot(e.x - p.x, e.z - p.z) <= 5));
  if (!targets.size) return false;
  for (const e of targets) {
    e.stunT = Math.max(e.stunT || 0, e.isBoss ? .15 : .7);
    // Classic stunT is only a movement penalty. The experiment's suppression
    // explicitly pauses ordinary enemy actions instead of changing that rule.
    if (!e.isBoss) e.combatStunT = Math.max(e.combatStunT || 0, .7);
  }
  s.cdTactic = 12;
  return true;
}

export function tryCombatAction(g, action) {
  if (!playable(g)) return false;
  if (g.experiment.scheme==='foldshadow') return tryFoldAction(g,action);
  if (action === 'skill_1') return stepForward(g);
  if (action === 'skill_2') return tactic(g);
  if (action === 'skill_3') return g.heroSkill?.(g.player) === true;
  if (action !== 'ultimate' || g.experiment.energy < 100 || g.experiment.ultLeft > 0) return false;
  g.experiment.energy = 0;
  g.experiment.ultLeft = 5;
  g.player.overdrive = Math.max(g.player.overdrive || 0, 5);
  return true;
}

export function creditUltimate(g, payload) {
  if (!playable(g) || g.experiment.ultLeft > 0 || payload?.progressionEligible !== true || payload.owner !== 'player' ||
      !['directWeapon', 'explosion'].includes(payload.category) || !Number.isFinite(payload.amount) || payload.amount <= 0) return 0;
  const before = g.experiment.energy;
  g.experiment.energy = Math.min(100, before + payload.amount * (g.experiment.fold ? FOLD_RULES.energyPerDamage : .1));
  return g.experiment.energy - before;
}
