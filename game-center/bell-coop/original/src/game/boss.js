import {damageSource} from './damage_context.js';
import {playerLockTarget,suppressesNewPlayerLocks,combatPlayers} from '../experimental/consumables/visibility.js';
import { triggerBuildCritExplosion, statusBuildSource } from './build_hit_effects.js';
// ============================================================
//  熔核总督 · THE EMBER WARDEN —— 三阶段多弹幕首领
// ============================================================
import * as THREE from '../../vendor/three.module.js';
import { TEAM } from '../core/constants.js';
import { buildBoss } from '../art/models.js';
import {applyBlenderActorVisual,disposeActorVisual} from '../art/actor_assets.js';
import { audio } from '../core/audio.js';
import { reportStatusDamage, statusFeedbackSource } from './damage_feedback.js';
import { emberStatusMultiplier } from './hero_p2.js';
import { applyAsh, tickAsh } from './ash_status.js';
import { queueBossSummons, bossWarning } from './boss_chapter_actions.js';

const PHASES = [
  { hp: 1.00, name: '熔炉苏醒', rate: 1.00, color: '#ff8a3c' },
  { hp: 0.66, name: '炉心过载', rate: 1.22, color: '#ff5a10' },
  { hp: 0.33, name: '终焉熔毁', rate: 1.45, color: '#ff2a2a' },
];

export class Boss {
  // Boss 身份标识：Codex / 战利品陈列 / 未来的 Boss Pool 都靠它索引。
  // 任务书 §18 要求不要硬编码成三个名字，所以这里从第一天就留成数据字段。
  static ID = 'ember_warden';
  constructor(game, x, z) {
    this.bossType = Boss.ID;
    this.cn = '熔核总督';
    this.game = game;
    this.id = 'boss';
    this.isBoss = true;
    this.x = x; this.z = z;
    this.vx = 0; this.vz = 0;
    this.yaw = Math.PI;
    this.radius = 1.55;
    this.r = 1.55;
    this.minY = 0;
    this.team = TEAM.ENEMY;
    this.alive = true;
    this.maxHp = 820;
    this.hp = this.maxHp;
    this.phase = 0;
    this.state = 'intro';
    this.stateT = 2.6;
    this.animT = 0;
    this.hitFlash = 0;
    this.attackIdx = 0;
    this.cooldown = 1.6;
    this.pattern = null;
    this.patternT = 0;
    this.patternStep = 0;
    this.orbitAngle = 0;
    this.laserAngle = 0;
    this.chargeDir = { x: 0, z: 1 };
    this.contactCd = 0;
    this.deadT = 0;
    this.status = { burn: 0, burnDps: 0, poison: 0, poisonDps: 0, slow: 0, freeze: 0 };
    this.rig = buildBoss();
    applyBlenderActorVisual(this.rig,'ember_warden');
    this.group = this.rig.group;
    this.group.position.set(x, 0, z);
    game.scene.add(this.group);
    this.baseScale = 1.28;
    this.rig.group.scale.setScalar(this.baseScale);
    this.telegraphs = [];
    this.lastPattern = '';
  }

  get phaseData() { return PHASES[this.phase]; }

  takeDamage(n, opts = {}) {
    if (!this.alive) return;
    this.hp -= n;
    this.hitFlash = 1;
    audio.hitEnemy(!!opts.crit);
    if (!this.game.recordDamageFeedback?.(this,n,opts,{y:3.8}))
      this.game.popText(this.x + (this.game.vr() - 0.5) * 1.6, 3.4 + this.game.vr() * 0.8, this.z, Math.round(n), opts.crit ? '#ffd24a' : '#ffd9c0', !!opts.crit);
    this.game.particles.bloodburst(this.x + (Math.random() - 0.5) * 1.2, 2.2, this.z + (Math.random() - 0.5) * 1.2, '#ff8a3c', 6, 1.2);   // visual-rng: 纯粒子表现
    if (opts.statuses) {
      if (opts.statuses.burn) this.applyStatus('burn', opts.statuses.burn * 0.5, opts);
      if (opts.statuses.poison) this.applyStatus('poison', opts.statuses.poison * 0.5, opts);
      if (opts.statuses.ash) applyAsh(this, opts.statuses.ash, opts);
    }
    if(this.hp<=0){this.hp=0;this.die(opts);triggerBuildCritExplosion(this,opts);return;}
    triggerBuildCritExplosion(this,opts);
    if(!this.alive)return;
    const nh = this.hp / this.maxHp;
    if (this.phase === 0 && nh <= 0.66) this.enterPhase(1);
    else if (this.phase === 1 && nh <= 0.33) this.enterPhase(2);
  }

  applyStatus(kind, dur, opts = {}) {
    if(kind==='burn'||kind==='poison'){this.status[`${kind}FeedbackSource`]=statusFeedbackSource(opts);this.status[`${kind}BuildSource`]=statusBuildSource(opts);}
    if (kind === 'burn') { this.status.burn = Math.max(this.status.burn, dur); this.status.burnDps = 4 * emberStatusMultiplier(this,opts); }
    if (kind === 'poison') { this.status.poison = Math.max(this.status.poison, dur); this.status.poisonDps = 3 * emberStatusMultiplier(this,opts); }
  }

  enterPhase(p) {
    this.phase = p;
    this.state = 'phase';
    this.stateT = 2.2;
    this.rig.group.scale.setScalar(this.baseScale);
    audio.bossRoar();
    audio.phaseChange();
    this.game.shake(0.9);
    this.game.hitStop(0.14);           // 阶段转换顿帧：强调形态切换
    this.game.damageFlash(0.6);
    this.game.particles.ring(this.x, 0.4, this.z, PHASES[p].color, 60, 2.0, 12);
    this.game.explodeVisual(this.x, 1.0, this.z, 6.4, PHASES[p].color);
    this.game.toast(`总督 · ${PHASES[p].name}`, p === 1 ? '炉心过载，攻击更加狂暴！' : '终焉熔毁，注意熔岩与激光！', PHASES[p].color);
    this.game.setBossPhase(p);
  }

  die(opts = {}) {
    if (!this.alive) return;
    this.lethalContext=damageSource(opts);
    this.alive = false;
    this.deadT = 0;
    audio.bossRoar();
    audio.explosion(2.0);
    this.game.shake(1.2);
    this.game.hitStop(0.20);           // 陨落顿帧
    this.game.setBossPhase(-1);
  }

  remove() { disposeActorVisual(this.group);if (this.group.parent) this.group.parent.remove(this.group); }

  // ---------------- 弹幕 ----------------
  ring(n, speed, dmg, offset = 0, color = '#ff8a3c', size = 0.3) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + offset;
      this.game.projectiles.spawn({
        x: this.x + Math.cos(a) * 1.5, y: 1.5, z: this.z + Math.sin(a) * 1.5,
        dx: Math.cos(a), dz: Math.sin(a), speed, damage: dmg, life: 6.5,
        color, team: TEAM.ENEMY, size, radius: 0.34, kind: 'orb', owner: this,
      });
    }
    audio.bossShoot(0);
  }

  arc(n, spread, targetAng, speed, dmg, color = '#ffcf6a', size = 0.34, gap = 0) {
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0 : (i / (n - 1)) - 0.5;
      const a = targetAng + t * spread + gap;
      this.game.projectiles.spawn({
        x: this.x + Math.cos(a) * 1.8, y: 1.6, z: this.z + Math.sin(a) * 1.8,
        dx: Math.cos(a), dz: Math.sin(a), speed, damage: dmg, life: 6.0,
        color, team: TEAM.ENEMY, size, radius: 0.32, kind: 'bolt', owner: this,
      });
    }
    audio.bossShoot(1);
  }

  aimedAngle() {
    const p = playerLockTarget(this);
    return Math.atan2(p.x - this.x, p.z - this.z);
  }

  // ---------------- 主循环 ----------------
  update(dt, world) {
    this.animT += dt;
    this.hitFlash = Math.max(0, this.hitFlash - dt * 3);
    this.contactCd = Math.max(0, this.contactCd - dt);
    const st = this.status;
    if (st.burn > 0) { st.burn -= dt; this.hp -= st.burnDps * dt; reportStatusDamage(this,'burn',st.burnDps * dt,3.8); if (this.hp <= 0 && this.alive) { this.hp = 0; this.die(st.burnBuildSource||{}); return; } }
    if (st.poison > 0) { st.poison -= dt; this.hp -= st.poisonDps * dt; reportStatusDamage(this,'poison',st.poisonDps * dt,3.8); if (this.hp <= 0 && this.alive) { this.hp = 0; this.die(st.poisonBuildSource||{}); return; } }
    if (tickAsh(this, dt, 3.8)) return;

    if (!this.alive) { this.updateDeath(dt); return; }

    const perceived=playerLockTarget(this);
    const dx = perceived.x - this.x, dz = perceived.z - this.z;
    const dist = Math.hypot(dx, dz) || 1;
    const ux = dx / dist, uz = dz / dist;

    // 基本朝玩家
    const targetYaw = Math.atan2(dx, dz);
    let dy = targetYaw - this.yaw;
    while (dy > Math.PI) dy -= Math.PI * 2;
    while (dy < -Math.PI) dy += Math.PI * 2;
    this.yaw += dy * Math.min(1, dt * 3.4);

    const ts = this.game.timeScale;
    const pr = this.phaseData.rate;

    switch (this.state) {
      case 'intro':
        this.stateT -= dt;
        this.vx *= 0.9; this.vz *= 0.9;
        if (this.stateT <= 0) { this.state = 'idle'; this.cooldown = 0.8; }
        break;
      case 'phase':
        this.stateT -= dt;
        this.vx *= 0.86; this.vz *= 0.86;
        if (this.stateT <= 0) { this.state = 'idle'; this.cooldown = 0.35; }
        break;
      case 'idle': {
        // 缓慢环绕玩家
        const want = 9.5;
        const mv = dist > want + 2.5 ? 1 : (dist < want - 3 ? -1 : 0);
        const sp = (2.3 + this.phase * 0.55) * ts;
        this.vx += (ux * mv - uz * 0.55) * sp * dt * 4;
        this.vz += (uz * mv + ux * 0.55) * sp * dt * 4;
        this.cooldown -= dt;
        if (this.cooldown <= 0) this.pickPattern();
        break;
      }
      case 'pattern':
        this.runPattern(dt, world, ux, uz, dist, ts, pr);
        break;
      case 'chargePrep': {
        this.vx *= 0.86; this.vz *= 0.86;
        this.stateT -= dt;
        const k = Math.max(0, 1 - this.stateT / 0.75);
        this.game.particles.ring(this.x, 0.5, this.z, '#ff5a10', 6, 2.4 - k * 1.6, 7 * k);
        this.rig.body.position.y = 1.1 * k;
        if (this.stateT <= 0) {
          this.state = 'charge'; this.stateT = 0.85;
          this.cooldown = 0.7;
          this.game.shake(0.34);
          audio.gun('rocket', 0.6);
        }
        break;
      }
      case 'charge':
        this.stateT -= dt;
        this.vx = this.chargeDir.x * 17 * ts;
        this.vz = this.chargeDir.z * 17 * ts;
        if (Math.random() < 0.9) this.game.particles.sparkle(this.x, 0.9, this.z, '#ff7a1a', 2, 0.6);   // visual-rng: 纯粒子表现
        if (this.stateT <= 0) { this.state = 'idle'; this.cooldown = 0.5; }
        if (world.pointBlocked(this.x + this.chargeDir.x * this.radius, this.z + this.chargeDir.z * this.radius, 0.1)) {
          this.state = 'idle'; this.cooldown = 0.7;
          this.game.shake(0.5);
          this.game.particles.ring(this.x + this.chargeDir.x * 1.4, 0.4, this.z + this.chargeDir.z * 1.4, '#ff8a3c', 30, 1.6, 9);
        }
        break;
    }

    // 接触伤害
    if (this.contactCd <= 0) for(const player of combatPlayers(world)) {
      const d = Math.hypot(player.x - this.x, player.z - this.z);
      if (d < this.radius + player.radius + 0.3) {
        this.contactCd = 0.9;
        player.takeDamage(1, { source: 'contact', attacker: this, dir: world.actors?.size>1?{x:-(player.x-this.x)/(d||1),z:-(player.z-this.z)/(d||1)}:{x:-ux,z:-uz} });
      }
    }

    this.x += this.vx * dt;
    this.z += this.vz * dt;
    const fr = Math.max(0, 1 - 7 * dt);
    this.vx *= fr; this.vz *= fr;
    world.resolveCircle(this, this.radius, true);

    this.group.position.set(this.x, 0, this.z);
    // 朝向约定同玩家/敌人：模型正面为本地 +Z，yaw 即指向角度。
    this.group.rotation.y = this.yaw;
    this.animate(dt);
  }

  pickPattern() {
    const p = playerLockTarget(this);
    const dist = Math.hypot(p.x - this.x, p.z - this.z);
    const pool1 = ['ring', 'aimed', 'wall', 'charge'];
    const pool2 = ['ring', 'aimed', 'wall', 'charge', 'spiral', 'summon', 'lava'];
    const pool3 = ['ring', 'aimed', 'charge', 'spiral', 'summon', 'lava', 'laser', 'hell'];
    const choices = this.phase === 0 ? pool1 : this.phase === 1 ? pool2 : pool3;
    const pool = suppressesNewPlayerLocks(this.game)?choices.filter(p=>!['aimed','charge','laser'].includes(p)):choices;
    let pick = this.game.grPick(pool);
    if (pick === this.lastPattern && pool.length > 1) pick = this.game.grPick(pool);
    if (pick === 'charge' && dist < 6) pick = 'aimed';
    this.lastPattern = pick;
    this.pattern = pick;
    if(this.game.notifyEnemyAttack)this.game.notifyEnemyAttack(this);else this.game.weaponAssets?.observeEnemyAttack?.(this);
    this.state = 'pattern';
    this.patternT = 0;
    this.patternStep = 0;
    this.spiralAngle = this.game.gr() * Math.PI * 2;
    this.chargeDir = null;
  }

  runPattern(dt, world, ux, uz, dist, ts, pr) {
    const p = playerLockTarget(this);
    this.patternT += dt * ts * pr;
    const P = this.pattern;
    const adv = (d) => this.patternT >= d;

    if (P === 'ring') {
      this.vx *= 0.9; this.vz *= 0.9;
      const total = this.phase === 2 ? 3 : 2;
      const step = Math.floor(this.patternT / 0.55);
      if (step > this.patternStep - 1 && step !== this.patternStep && step <= total) {
        this.patternStep = step;
        const n = 12 + this.phase * 4;
        this.ring(n, 8.5, 1, this.animT * 0.5 + step * 0.26, PHASES[this.phase].color, 0.32);
        this.game.shake(0.1);
        this.rig.cannon.scale.setScalar(1.25);
      }
      if (adv(0.55 * total + 0.4)) this.endPattern(0.75);
    } else if (P === 'aimed') {
      this.vx *= 0.88; this.vz *= 0.88;
      const step = Math.floor(this.patternT / 0.42);
      if (step !== this.patternStep && step <= 4) {
        this.patternStep = step;
        const ang = this.aimedAngle();
        const n = this.phase === 0 ? 3 : 5;
        this.arc(n, 0.30 + this.phase * 0.08, ang, 15 + this.phase * 2, 1, '#ffcf6a', 0.3);
        this.game.particles.muzzle(this.x + Math.sin(ang) * 2, 1.9, this.z + Math.cos(ang) * 2, Math.sin(ang), Math.cos(ang), '#ffb347', 1.4);
        this.game.flashSmall(this.x + Math.sin(ang) * 2, 1.9, this.z + Math.cos(ang) * 2, '#ffb347', 16, 0.1);
        this.rig.cannon.scale.setScalar(1.3);
        this.game.shake(0.12);
      }
      if (adv(0.42 * 5)) this.endPattern(0.6);
    } else if (P === 'wall') {
      this.vx *= 0.9; this.vz *= 0.9;
      if (this.patternStep === 0) {
        this.patternStep = 1;
        const baseAng = this.aimedAngle();
        const n = 22;
        let gapAt = this.game.gri(0, n - 1);
        for (let i = 0; i < n; i++) {
          const d1 = Math.abs(i - gapAt);
          if (Math.min(d1, n - d1) <= 1) continue;
          const a = (i / n) * Math.PI * 2 + baseAng;
          this.game.projectiles.spawn({
            x: this.x + Math.cos(a) * 1.4, y: 1.5, z: this.z + Math.sin(a) * 1.4,
            dx: Math.cos(a), dz: Math.sin(a),
            speed: 9.5, damage: 1, life: 7, color: '#ff5a10', team: TEAM.ENEMY, size: 0.34, radius: 0.34, kind: 'orb', owner: this,
          });
        }
        this.ring(14, 6.5, 1, 0.3, '#ff8a3c', 0.3);
        this.game.shake(0.24);
        audio.bossShoot(2);
      }
      if (adv(0.85)) this.endPattern(0.7);
    } else if (P === 'spiral') {
      this.vx *= 0.94; this.vz *= 0.94;
      this.spiralAngle += dt * 3.1 * ts;
      const interval = 0.085;
      if (this.patternT - (this._lastSpiral || 0) > interval) {
        this._lastSpiral = this.patternT;
        const arms = 3;
        for (let i = 0; i < arms; i++) {
          const a = this.spiralAngle + (i / arms) * Math.PI * 2;
          this.game.projectiles.spawn({
            x: this.x + Math.cos(a) * 1.4, y: 1.5, z: this.z + Math.sin(a) * 1.4,
            dx: Math.cos(a), dz: Math.sin(a), speed: 7.5, damage: 1, life: 6,
            color: '#ffcf6a', team: TEAM.ENEMY, size: 0.28, radius: 0.3, kind: 'orb', owner: this,
          });
        }
        if (this.game.vr() < 0.35) audio.bossShoot(0);
      }
      if (adv(2.6)) { this._lastSpiral = 0; this.endPattern(0.7); }
    } else if (P === 'charge') {
      if (this.patternStep === 0) {
        this.patternStep = 1;
        this.chargeDir = { x: ux, z: uz };
        this.state = 'chargePrep';
        this.stateT = 0.75;
        this.rig.body.position.y = 0;
        audio.gun('charge', 0.7);
      }
      return;
    } else if (P === 'laser') {
      this.vx *= 0.9; this.vz *= 0.9;
      if (this.patternStep === 0) {
        this.patternStep = 1;
        this.laserAngle = this.aimedAngle();
        this.laserTarget = this.laserAngle;
        audio.gun('charge', 0.8);
      }
      const sweepT = 2.4;
      if (this.patternT < 0.9) {
        // 蓄力提示
        this.laserAngle = this.aimedAngle();
        this.game.particles.beam(this.x, 1.6, this.z, Math.sin(this.laserAngle), Math.cos(this.laserAngle), '#ff2a2a', 30, 3);
      } else {
        const k = (this.patternT - 0.9) / sweepT;
        this.laserAngle = this.laserTarget + Math.sin(k * Math.PI * 1.2) * 0.7;
        const res = this.game.projectiles.fireBeam(this.x, 1.5, this.z, Math.sin(this.laserAngle), Math.cos(this.laserAngle), {
          damage: 1.35, range: 40, color: '#ff2a2a', width: 0.85, life: 0.06,
        }, world);
        this.game.particles.beam(this.x, 1.5, this.z, Math.sin(this.laserAngle), Math.cos(this.laserAngle), '#ff8a3c', res.len, 6);
        if (this.game.vr() < 0.5) this.game.shake(0.06);
      }
      if (adv(0.9 + sweepT)) this.endPattern(1.0);
    } else if (P === 'summon') {
      this.vx *= 0.9; this.vz *= 0.9;
      if (this.patternStep === 0) {
        this.patternStep = 1;
        const n = this.phase === 1 ? 2 : 3;
        if (this.chapterActions) queueBossSummons(this, Array(n).fill(this.phase === 2 ? 'hound' : 'abyss_grunt'));
        else for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + this.animT;
          const pos = world.clampToRoom(this.x + Math.cos(a) * 4, this.z + Math.sin(a) * 4, 1.2);
          world.spawnEnemy(this.phase === 2 ? 'hound' : 'abyss_grunt', pos.x, pos.z);
          this.game.particles.ring(pos.x, 0.4, pos.z, '#8a3cff', 18, 0.7, 5);
        }
        audio.teleport();
        this.game.shake(0.2);
      }
      if (adv(0.9)) this.endPattern(0.9);
    } else if (P === 'lava') {
      this.vx *= 0.92; this.vz *= 0.92;
      const count = 7;
      if (this.patternStep === 0) {
        this.patternStep = 1;
        const spots = [];
        for (let i = 0; i < count; i++) {
          const a = this.game.gr() * Math.PI * 2;
          const r = 3 + this.game.gr() * 11;
          const pos = world.clampToRoom(p.x + Math.cos(a) * r * 0.55 + (this.game.gr() - 0.5) * 6, p.z + Math.sin(a) * r * 0.55 + (this.game.gr() - 0.5) * 6, 1.4);
          spots.push(pos);
          if (this.chapterActions) bossWarning(this, pos.x, pos.z, 2.6, 1.15, 1, '#ff5a10');
          else world.addHazard(pos.x, pos.z, 2.6, 1.15, 1, '#ff5a10');
        }
        this.game.shake(0.2);
      }
      if (adv(2.4)) this.endPattern(0.8);
    } else if (P === 'hell') {
      this.vx *= 0.88; this.vz *= 0.88;
      this.spiralAngle += dt * 5.2 * ts;
      if (this.patternT - (this._lastSpiral || 0) > 0.075) {
        this._lastSpiral = this.patternT;
        for (let i = 0; i < 4; i++) {
          const a = this.spiralAngle + (i / 4) * Math.PI * 2;
          this.game.projectiles.spawn({
            x: this.x, y: 1.5, z: this.z, dx: Math.cos(a), dz: Math.sin(a),
            speed: 8.5, damage: 1, life: 6.5, color: '#ff2a2a', team: TEAM.ENEMY, size: 0.3, radius: 0.32, kind: 'orb', owner: this,
          });
        }
      }
      if (this.patternT > 1.6 && this.patternStep < 2) {
        this.patternStep = 2;
        this.ring(22, 7.5, 1, this.animT, '#ff8a3c', 0.3);
        this.ring(22, 11.5, 1, this.animT + 0.12, '#ffcf6a', 0.28);
        this.game.shake(0.3);
      }
      if (adv(3.2)) { this._lastSpiral = 0; this.endPattern(1.0); }
    }
  }

  endPattern(cd) {
    this.state = 'idle';
    this.cooldown = cd;
    this.patternT = 0;
    this.patternStep = 0;
  }

  updateDeath(dt) {
    this.deadT += dt;
    this.vx *= 0.9; this.vz *= 0.9;
    this.x += this.vx * dt; this.z += this.vz * dt;
    this.group.position.set(this.x, 0, this.z);
    this.group.rotation.z = Math.min(1.4, this.deadT * 0.45);
    this.group.rotation.x = Math.min(0.6, this.deadT * 0.2);
    this.group.position.y = -Math.min(1.6, this.deadT * 0.35);
    const rate = this.deadT < 2.2 ? 14 : 3;
    this._expT = (this._expT || 0) + dt;
    if (this._expT > 1 / rate && this.deadT < 3.0) {
      this._expT = 0;
      const a = this.game.vr() * Math.PI * 2, r = this.game.vr() * 2.2;
      this.game.explodeVisual(this.x + Math.cos(a) * r, 1.0 + this.game.vr() * 2.2, this.z + Math.sin(a) * r, 3.2, this.game.vr() < 0.5 ? '#ff8a3c' : '#ffd06a');
      audio.explosion(0.9);
      this.game.shake(0.22);
    }
    this.rig.core.material.emissiveIntensity = 3 + Math.sin(this.animT * 30) * 2;
    this.animT += dt;
  }

  animate(dt) {
    const r = this.rig;
    const t = this.animT;
    const bob = Math.sin(t * 1.6) * 0.16;
    r.body.position.y = bob + (this.state === 'charge' ? 0.4 : 0);
    r.lower.rotation.y = Math.sin(t * 0.7) * 0.10;
    r.torso.rotation.z = Math.sin(t * 0.9) * 0.045;
    r.torso.rotation.x = Math.sin(t * 1.3) * 0.03;
    r.head.rotation.y = Math.sin(t * 0.6) * 0.14;
    r.head.rotation.x = Math.sin(t * 1.1) * 0.05;
    // 炮口缩放回弹
    r.cannon.scale.lerp(this._oneVec || (this._oneVec = new THREE.Vector3(1, 1, 1)), Math.min(1, dt * 8));
    // 手臂姿态
    r.armR.rotation.x = -0.55 + Math.sin(t * 1.2) * 0.14;
    r.armREl.rotation.x = 0.35 + Math.sin(t * 1.5 + 1) * 0.12;
    r.armL.rotation.x = -0.42 + Math.sin(t * 1.1 + 2) * 0.16;
    r.armLEl.rotation.x = 0.5 + Math.sin(t * 1.4) * 0.14;
    // 胸口熔炉
    const glow = 1.4 + Math.sin(t * (this.phase === 2 ? 9 : 3.4)) * 0.6;
    r.furnace.material.emissiveIntensity = glow;
    r.core.material.emissiveIntensity = glow * 1.4;
    r.core.rotation.y += dt * 1.4;
    r.coreRing.rotation.z += dt * 0.9;
    // 眼
    const eyeI = 2 + Math.sin(t * (this.phase === 2 ? 12 : 4)) * 1.2;
    r.eyes.forEach((e) => { if (e.material) e.material.emissiveIntensity = eyeI; });
    // 冠冕
    r.crown.rotation.y += dt * 0.7;
    r.crownGem.rotation.x += dt * 1.6;
    r.crown.position.y = 0.75 + Math.sin(t * 2.2) * 0.06;
    // 余烬球环绕
    this.orbitAngle += dt * (1.1 + this.phase * 0.5);
    r.orbs.forEach((o, i) => {
      const a = this.orbitAngle + o.phase;
      const rad = 1.9 + Math.sin(t * 1.7 + i) * 0.25;
      o.g.position.set(Math.cos(a) * rad, 2.4 + Math.sin(t * 2.4 + i * 2) * 0.3, Math.sin(a) * rad);
      o.mesh.rotation.y += dt * 2;
      o.mesh.scale.setScalar(1 + Math.sin(t * 4 + i) * 0.12);
    });
    // 受击闪白
    if (this.hitFlash > 0.02) {
      r.group.traverse((o) => {
        if (o.isMesh && o.material && o.material.emissive) o.material.emissiveIntensity = Math.max(o.material.emissiveIntensity || 0, this.hitFlash * 1.6);
      });
    }
  }
}
