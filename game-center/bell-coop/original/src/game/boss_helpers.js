import {damageSource} from './damage_context.js';
import { triggerBuildCritExplosion, statusBuildSource } from './build_hit_effects.js';
import {playerLockTarget,combatPlayers} from '../experimental/consumables/visibility.js';
// ============================================================
//  Boss 共享工具（PASS2 §20–§23）
//
//  熔核总督（boss.js）是 PASS1 已验证的实现，**本轮不动它**。
//  新增的缚钟兽 / 哑钟主祭不想再抄一遍"弹幕 / 受击 / 死亡演出"，
//  所以把纯逻辑抽到这里，用自由函数（传入 boss 实例）而不是继承 ——
//  继承会强迫三个 Boss 共享同一套状态机，而任务书要求它们机制独立。
// ============================================================
import { TEAM } from '../core/constants.js';
import { audio } from '../core/audio.js';
import { statusFeedbackSource } from './damage_feedback.js';
import { emberStatusMultiplier } from './hero_p2.js';
import { applyAsh } from './ash_status.js';

export function aimedAngle(b) {
  const p = playerLockTarget(b);
  return Math.atan2(p.x - b.x, p.z - b.z);
}

// 环形弹幕
export function bossRing(b, n, speed, dmg, offset = 0, color = '#ff8a3c', size = 0.3, radius = 1.5) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + offset;
    b.game.projectiles.spawn({
      x: b.x + Math.cos(a) * radius, y: 1.5, z: b.z + Math.sin(a) * radius,
      dx: Math.cos(a), dz: Math.sin(a), speed, damage: dmg, life: 6.5,
      color, team: TEAM.ENEMY, size, radius: 0.34, kind: 'orb', owner: b,
    });
  }
}

// 扇形弹幕
export function bossArc(b, n, spread, targetAng, speed, dmg, color = '#ffcf6a', size = 0.34, radius = 1.8) {
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : (i / (n - 1)) - 0.5;
    const a = targetAng + t * spread;
    b.game.projectiles.spawn({
      x: b.x + Math.cos(a) * radius, y: 1.6, z: b.z + Math.sin(a) * radius,
      dx: Math.cos(a), dz: Math.sin(a), speed, damage: dmg, life: 6.0,
      color, team: TEAM.ENEMY, size, radius: 0.32, kind: 'bolt', owner: b,
    });
  }
}

// 受击结算（含阶段推进）。thresholds 形如 [{at:0.66, phase:1}, {at:0.33, phase:2}]
// 返回 'died' | 'phase' | 'hit'
export function bossTakeDamage(b, n, opts = {}, thresholds = []) {
  if (!b.alive) return 'hit';
  b.hp -= n;
  b.hitFlash = 1;
  audio.hitEnemy(!!opts.crit);
  if (!b.game.recordDamageFeedback?.(b,n,opts,{y:3.8}))
    b.game.popText(b.x + (b.game.vr() - 0.5) * 1.6, 3.4 + b.game.vr() * 0.8, b.z, Math.round(n),
      opts.crit ? '#ffd24a' : '#ffd9c0', !!opts.crit);
  b.game.particles.bloodburst(b.x + (Math.random() - 0.5) * 1.2, 2.2, b.z + (Math.random() - 0.5) * 1.2, b.hitColor || '#ff8a3c', 6, 1.2);   // visual-rng: 纯粒子表现
  if (opts.statuses) {
    if (opts.statuses.burn) b.applyStatus('burn', opts.statuses.burn * 0.5, opts);
    if (opts.statuses.poison) b.applyStatus('poison', opts.statuses.poison * 0.5, opts);
    if (opts.statuses.ash) applyAsh(b, opts.statuses.ash, opts);
  }
  if(b.hp<=0){b.hp=0;b.die(opts);triggerBuildCritExplosion(b,opts);return 'died';}
  triggerBuildCritExplosion(b,opts);if(!b.alive)return 'died';
  const nh = b.hp / b.maxHp;
  for (const t of thresholds) {
    if (b.phase < t.phase && nh <= t.at) { b.enterPhase(t.phase); return 'phase'; }
  }
  return 'hit';
}

export function bossApplyStatus(b, kind, dur, opts = {}) {
  if(kind==='burn'||kind==='poison'){b.status[`${kind}FeedbackSource`]=statusFeedbackSource(opts);b.status[`${kind}BuildSource`]=statusBuildSource(opts);}
  if (kind === 'burn') { b.status.burn = Math.max(b.status.burn, dur); b.status.burnDps = 4 * emberStatusMultiplier(b,opts); }
  if (kind === 'poison') { b.status.poison = Math.max(b.status.poison, dur); b.status.poisonDps = 3 * emberStatusMultiplier(b,opts); }
}

export function bossDie(b,opts = {}) {
  if (!b.alive) return;
  b.lethalContext=damageSource(opts);
  b.alive = false;
  b.deadT = 0;
  audio.bossRoar();
  audio.explosion(2.0);
  b.game.shake(1.2);
  b.game.hitStop(0.20);
  b.game.setBossPhase(-1);
}

export function bossRemove(b) { if (b.group.parent) b.group.parent.remove(b.group); }

// 接触伤害（所有 Boss 共用同一套"贴身就有代价"的规则）
export function bossContact(b, dt) {
  b.contactCd = Math.max(0, (b.contactCd || 0) - dt);
  if (b.contactCd > 0) return;
  for(const player of combatPlayers(b.game)){
    const d = Math.hypot(player.x - b.x, player.z - b.z);
    if (d < b.radius + player.radius + 0.3) {
      b.contactCd = 0.9;
      const nx = (player.x - b.x) / Math.max(0.01, d), nz = (player.z - b.z) / Math.max(0.01, d);
      player.takeDamage(1, { source: 'contact', attacker: b, dir: { x: -nx, z: -nz } });
    }
  }
}

// 通用死亡演出：倒地 + 连环爆
export function bossUpdateDeath(b, dt, opts = {}) {
  b.deadT += dt;
  b.vx *= 0.9; b.vz *= 0.9;
  b.x += b.vx * dt; b.z += b.vz * dt;
  b.group.position.set(b.x, 0, b.z);
  b.group.rotation.z = Math.min(1.4, b.deadT * (opts.tiltRate || 0.45));
  b.group.position.y = -Math.min(1.6, b.deadT * 0.35);
  const rate = b.deadT < 2.2 ? 14 : 3;
  b._expT = (b._expT || 0) + dt;
  if (b._expT > 1 / rate && b.deadT < 3.0) {
    b._expT = 0;
    const a = b.game.vr() * Math.PI * 2, r = b.game.vr() * 2.2;
    b.game.explodeVisual(b.x + Math.cos(a) * r, 1.0 + b.game.vr() * 2.2, b.z + Math.sin(a) * r, 3.2,
      b.game.vr() < 0.5 ? opts.colorA || '#ff8a3c' : opts.colorB || '#ffd06a');
    audio.explosion(0.9);
    b.game.shake(0.22);
  }
  b.animT += dt;
}

// 平缓朝目标移动（Boss 的机动统一走这里，便于统一限速与减速）
export function moveToward(b, dt, tx, tz, speed, accel = 4) {
  const dx = tx - b.x, dz = tz - b.z;
  const d = Math.hypot(dx, dz) || 1;
  const ux = dx / d, uz = dz / d;
  b.vx += (ux * speed - b.vx) * Math.min(1, accel * dt);
  b.vz += (uz * speed - b.vz) * Math.min(1, accel * dt);
  return { ux, uz, d };
}

// 转向玩家
export function facePlayer(b, dt, rate = 3.4) {
  const t = aimedAngle(b);
  let dy = t - b.yaw;
  while (dy > Math.PI) dy -= Math.PI * 2;
  while (dy < -Math.PI) dy += Math.PI * 2;
  b.yaw += dy * Math.min(1, dt * rate);
}
