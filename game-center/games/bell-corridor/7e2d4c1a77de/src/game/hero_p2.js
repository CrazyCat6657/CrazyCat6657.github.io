import {resolveDamageActor} from './damage_context.js';
import { integrationState } from './hero_integration_v3.js';
import { PLAYER, TEAM } from '../core/constants.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const isEmber = p => p?.hero?.ruleVersion === 3 && p.hero.id === 'emberoath';
export const isRanger = p => p?.hero?.ruleVersion === 3 && p.hero.id === 'ranger';

export function emberMultiplier(p) {
  if (!isEmber(p)) return 1;
  const base = Math.min(2, 1 + .2 * Math.max(0, p.maxHp - p.hp));
  return p.c2.escrowHp > 0 ? (base + .2 * p.c2.escrowHp) * 1.1 : base;
}

function playerOutput(p, opts) {
  return opts.owner === p || opts.bullet?.ownerRef === p || opts.feedbackCategory === 'unit' ||
    p.weapons?.some(w => w.assetInstanceId === opts.sourceInstanceId) ||
    ['tesla','thorns','heroSkill','skill'].includes(opts.source);
}
export function emberStatusMultiplier(target, opts = {}) {
  const p = resolveDamageActor(target.game||{},opts)?.player||(!target.game?.actors?target.game?.player:null);
  if (!isEmber(p)) return 1;
  return opts.c2StatusMul ?? opts.c2DamageApplied ?? opts.assetShot?.c2DamageApplied ??
    opts.bullet?.c2DamageApplied ?? (playerOutput(p, opts) ? emberMultiplier(p) : 1);
}
// Weapon roots already carry their firing-time multiplier. Relic/unit attacks
// entering the common damage path receive it here, exactly once; status DPS
// is frozen separately when applied and never multiplied on later ticks.
export function emberHitContext(g, target, damage, opts = {}) {
  const p = g.player;
  if (!isEmber(p) || target === p || target.team === TEAM.PLAYER ||
      !playerOutput(p, opts) || ['burn','poison','ash','statusDot'].includes(opts.source)) return { damage, opts };
  const applied = opts.c2DamageApplied ?? opts.assetShot?.c2DamageApplied ?? opts.bullet?.c2DamageApplied;
  const factor = applied ?? emberMultiplier(p);
  const out = { ...opts, c2DamageApplied: factor, c2StatusMul: factor };
  if (applied === undefined && p.hp <= 2 && !out.statuses?.ash) out.statuses = { ...out.statuses,
    ash: { duration: 2.5, dps: 2.4 * factor, sourceInstanceId: 'hero:emberoath' } };
  return { damage: applied === undefined ? damage * factor : damage, opts: out };
}

export function endEmberEscrow(p, returnHp = true) {
  const amount = p.c2.escrowHp;
  p.c2.escrowHp = 0;
  p.c2.escrowT = 0;
  if (amount && returnHp && p.alive && p.hp > 0) {
    p.hp = Math.min(p.maxHp, p.hp + amount);
    p.game?.particles?.ring?.(p.x, .5, p.z, '#ff745a', 18, .5, 2.4);
  }
  return amount;
}

export function emberTick(p, dt) {
  if (p.c2.escrowT <= 0) return;
  p.c2.escrowT = Math.max(0, p.c2.escrowT - dt);
  if (p.c2.escrowT === 0) endEmberEscrow(p);
}

export function rangerDirection(p) {
  const v = p.game?.input?.moveVec?.() || p.moveVec || { x: 0, z: 0, len: 0 };
  const raw = v.len > .05 ? v : p.aim;
  const len = Math.hypot(raw?.x || 0, raw?.z || 0);
  return len > .01 ? { x: raw.x / len, z: raw.z / len } : { x: 0, z: 1 };
}

export function rangerSkill(p, g) {
  const s = p.c2, second = s.rangerUsed === 1;
  if (p.dashTime > 0) return { ready: false, reason: '翻滚结束后再游闪' };
  if (s.rangerMoveLeft > 0) return { ready: false, reason: '游闪进行中' };
  if (second && (s.rangerWindow <= 0 || s.rangerGap > 0)) return { ready: false, reason: '等待第二段衔接' };
  if (!second && (s.rangerUsed !== 0 || s.rangerRecovery > 0)) return { ready: false, reason: '游闪恢复中' };
  const d = rangerDirection(p);
  s.rangerDir = d;
  s.rangerMoveLeft = PLAYER.dashSpeed * PLAYER.dashTime * 1.65;
  s.rangerUsed = second ? 2 : 1;
  if (!second) { const a=integrationState(p);a.rangerT=8;a.rangerTargets=[];s.rangerWindow = 1.8; s.rangerGap = .15; s.rangerRecovery = 8; }
  else s.rangerWindow = 0;
  p.vx = 0; p.vz = 0;
  p.iframes = Math.max(p.iframes, .12);
  g.spawnAfterimage?.(p.x, p.z, p.yaw);
  g.particles?.ring?.(p.x, .12, p.z, '#ffad69', 12, .3, 2);
  g.hud?.toast?.('游影双闪', second ? '第二段变向！' : '1.8 秒内可按 C 再闪一次', '#ffad69', 'quick');
  return { cooldown: 0 };
}

export function rangerTick(p, dt) {
  const a=integrationState(p);a.rangerT=Math.max(0,a.rangerT-dt);
  const s = p.c2;
  s.rangerGap = Math.max(0, s.rangerGap - dt);
  s.rangerWindow = Math.max(0, s.rangerWindow - dt);
  s.rangerRecovery = Math.max(0, s.rangerRecovery - dt);
  if (s.rangerWindow === 0 && s.rangerMoveLeft === 0 && s.rangerUsed === 1) s.rangerUsed = 2;
  if (s.rangerRecovery === 0 && s.rangerMoveLeft === 0) s.rangerUsed = 0;
}

// Sweep in radius/2 increments. The room scene, active collision geometry and
// walk rectangles must all accept a step; a blocked step ends the dash there.
export function rangerMove(p, dt, world) {
  const s = p.c2, distance = Math.min(s.rangerMoveLeft, PLAYER.dashSpeed * 1.65 * (p.stats.dashDistanceMul || 1) * dt);
  const steps = Math.max(1, Math.ceil(distance / Math.max(.05, p.radius / 2)));
  for (let i = 0; i < steps; i++) {
    const x = p.x + s.rangerDir.x * distance / steps;
    const z = p.z + s.rangerDir.z * distance / steps;
    // The actual walkable union includes legal connectors. A C dash may use
    // them, but it stops at the adjacent room's activation threshold.
    const nextRoom = (world.portals || []).some(po => {
      if (!po?.neighbor || po.combatLocked) return false;
      const o = world.roomOffset?.(po.neighbor);
      const lim = (po.neighbor.radius || 13) - 1.2;
      return o && Math.abs(x - o.ox) < lim && Math.abs(z - o.oz) < lim;
    });
    if (nextRoom || world.moveBlocked?.(x, z, p.radius, .9)) { s.rangerMoveLeft = 0; break; }
    const oldX = p.x, oldZ = p.z;
    p.x = x; p.z = z;
    world.resolveCircle?.(p, p.radius, true);
    if (Math.hypot(p.x - x, p.z - z) > .02 ||
        Math.hypot(p.x - oldX, p.z - oldZ) > distance / steps + .02) {
      p.x = oldX; p.z = oldZ; s.rangerMoveLeft = 0; break;
    }
    s.rangerMoveLeft = clamp(s.rangerMoveLeft - distance / steps, 0, 20);
  }
  if (s.rangerMoveLeft < 1e-6) s.rangerMoveLeft = 0;
  p.vx = 0; p.vz = 0;
  if (s.rangerMoveLeft > 0 && p.game?.vr?.() < .35) world.spawnAfterimage?.(p.x, p.z, p.yaw);
}
