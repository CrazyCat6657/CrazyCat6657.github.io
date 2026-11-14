import {playerLockTarget,suppressesNewPlayerLocks} from '../experimental/consumables/visibility.js';
// ============================================================
//  缚钟兽 · THE BELL BEAST（PASS2 §22）
//
//  核心体验：**被束缚的巨兽 → 被猎食者追逐**。
//
//  一阶段：它被四条锁链拴在场地中心附近（leash）。冲撞会在链子绷直时被拽停，
//          扑击只能覆盖有限半径 —— 玩家读得懂"它够不到我"。
//  转阶段：**锁链断裂**（不是粒子爆一下就算了：链具消失、巨钟前移、形体变化）。
//  二阶段：解除束缚，移动自由化，改为持续追猎 + 断链鞭击。
//
//  每条危险动作都走 Pose → Telegraph → Attack，不做"红圈直接出现"。
// ============================================================
import * as THREE from '../../vendor/three.module.js';
import { TEAM } from '../core/constants.js';
import { buildBellBeast } from '../art/models.js';
import { applyBlenderActorVisual,disposeActorVisual } from '../art/actor_assets.js';
import { audio } from '../core/audio.js';
import { reportStatusDamage } from './damage_feedback.js';
import { tickAsh } from './ash_status.js';
import {
  aimedAngle, bossRing, bossArc, bossTakeDamage, bossApplyStatus, bossDie, bossRemove,
  bossContact, bossUpdateDeath, moveToward, facePlayer,
} from './boss_helpers.js';

export const BELL_BEAST_PHASES = [
  { hp: 1.00, cn: '缚钟', color: '#8ad8ff', rate: 1.00 },
  { hp: 0.66, cn: '断链', color: '#c8f0ff', rate: 1.30 },
];

export class BellBeast {
  static ID = 'bell_beast';
  static CN = '缚钟兽';
  static EN = 'THE BELL BEAST';

  constructor(game, x, z) {
    this.bossType = BellBeast.ID;
    this.cn = BellBeast.CN;
    this.game = game;
    this.id = 'boss';              // 实体 id 保留给弹丸 owner / 命中判定
    this.isBoss = true;
    this.x = x; this.z = z;
    this.anchorX = x; this.anchorZ = z;   // 锁链的锚点（一阶段的束缚中心）
    this.vx = 0; this.vz = 0;
    this.yaw = Math.PI;
    this.radius = 1.9;
    this.r = 1.9;
    this.minY = 0;
    this.team = TEAM.ENEMY;
    this.alive = true;
    this.maxHp = 900;
    this.hp = this.maxHp;
    this.phase = 0;
    this.state = 'intro';
    this.stateT = 2.4;
    this.animT = 0;
    this.hitFlash = 0;
    this.cooldown = 1.8;
    this.pattern = null;
    this.patternT = 0;
    this.patternStep = 0;
    this.contactCd = 0;
    this.deadT = 0;
    this.chargeDir = { x: 0, z: 1 };
    this.leapFrom = null;
    this.leapTo = null;
    this.hitColor = '#8ad8ff';
    this.status = { burn: 0, burnDps: 0, poison: 0, poisonDps: 0, slow: 0, freeze: 0 };
    this.rig = buildBellBeast();
    applyBlenderActorVisual(this.rig,'bell_beast');
    this.group = this.rig.group;
    this.group.position.set(x, 0, z);
    game.scene.add(this.group);
    this.baseScale = 1.5;
    this.rig.group.scale.setScalar(this.baseScale);
    this.telegraphs = [];
    this.lastPattern = '';
    this._oneVec = new THREE.Vector3(1, 1, 1);
  }

  get phaseData() { return BELL_BEAST_PHASES[this.phase]; }
  // 一阶段被锁链拴住；二阶段自由
  get leash() { return this.phase === 0 ? 6.2 : 999; }

  takeDamage(n, opts = {}) {
    return bossTakeDamage(this, n, opts, [{ at: 0.66, phase: 1 }]);
  }
  applyStatus(kind, dur, opts = {}) { bossApplyStatus(this, kind, dur, opts); }

  enterPhase(p) {
    this.phase = p;
    this.state = 'phase';
    this.stateT = 2.0;
    audio.bossRoar();
    audio.phaseChange();
    this.game.shake(1.0);
    this.game.hitStop(0.16);
    this.game.damageFlash(0.6);
    this.game.particles.ring(this.x, 0.4, this.z, '#c8f0ff', 64, 2.2, 13);
    this.game.explodeVisual(this.x, 1.2, this.z, 6.0, '#8ad8ff');
    // 断链：链具真的从模型上消失，巨钟前移 —— silhouette 必须变
    this.syncPhaseVisual();
    this.game.toast('缚钟兽 · 锁链断裂', '它不再被拴住了 —— 现在它在追你。', '#c8f0ff');
    this.game.setBossPhase(p);
  }

  // 阶段外观同步（恢复存档时也要调用，否则读档后链子会"长回来"）
  syncPhaseVisual() {
    const r = this.rig;
    const freed = this.phase >= 1;
    for (const c of r.chains || []) c.visible = !freed;
    if (r.bellMount) r.bellMount.position.set(0, freed ? 1.25 : 0.95, freed ? 0.35 : -0.1);
    if (r.bellYoke) r.bellYoke.visible = !freed;
    if (r.jaw) r.jaw.rotation.x = freed ? -0.34 : 0;
    if (r.group) r.group.scale.setScalar(this.baseScale * (freed ? 1.08 : 1));
  }

  die(opts = {}) { bossDie(this,opts); }
  remove() { disposeActorVisual(this.group);bossRemove(this); }

  // ---------------- 动作 ----------------
  // 冲撞：先下压蓄力（Pose），地面扬起尘土（Telegraph），再冲出
  startCharge() {
    this.state = 'chargePrep';
    this.stateT = 0.72;
    this.patternStep = 1;
    const p = playerLockTarget(this);
    const a = Math.atan2(p.x - this.x, p.z - this.z);
    this.chargeDir = { x: Math.sin(a), z: Math.cos(a) };
    audio.gun('charge', 0.7);
  }

  // 扑击：跃起到玩家附近（一阶段受锁链限制，落点会被拉回半径内）
  startPounce() {
    this.state = 'pouncePrep';
    this.stateT = 0.66;
    this.patternStep = 1;
    const p = playerLockTarget(this);
    const a = Math.atan2(p.x - this.x, p.z - this.z);
    const dist = Math.min(9.0, Math.hypot(p.x - this.x, p.z - this.z) + 1.2);
    let tx = this.x + Math.sin(a) * dist, tz = this.z + Math.cos(a) * dist;
    // 锁链约束：落点必须还在锚点半径内
    const ad = Math.hypot(tx - this.anchorX, tz - this.anchorZ);
    if (ad > this.leash) {
      const k = this.leash / ad;
      tx = this.anchorX + (tx - this.anchorX) * k;
      tz = this.anchorZ + (tz - this.anchorZ) * k;
    }
    const cl = this.game.clampToRoom(tx, tz, this.radius + 0.4);
    this.leapFrom = { x: this.x, z: this.z };
    this.leapTo = { x: cl.x, z: cl.z, h: 1.0 };
    this.leapT = 0;
    audio.gun('charge', 0.8);
  }

  // 尾扫：近距离扇形（读得懂"贴脸会挨扫"）
  sweep() {
    const a0 = this.yaw - 1.1;
    for (let row = 0; row < 2; row++) {
      const n = 9;
      for (let i = 0; i < n; i++) {
        const a = a0 + (i / (n - 1)) * 2.2;
        this.game.projectiles.spawn({
          x: this.x + Math.sin(a) * (2.0 + row * 0.6), y: 1.0, z: this.z + Math.cos(a) * (2.0 + row * 0.6),
          dx: Math.sin(a), dz: Math.cos(a), speed: 9 + row * 1.5, damage: 1, life: 1.5,
          color: '#c8f0ff', team: TEAM.ENEMY, size: 0.30, radius: 0.32, kind: 'bolt', owner: this,
        });
      }
    }
    this.game.particles.ring(this.x, 0.6, this.z, '#8ad8ff', 26, 2.4, 6);
    this.game.shake(0.22);
    audio.impact(true);
  }

  // 钟震：把背上的钟砸向地面 → 扩散环
  quake() {
    const color = '#8ad8ff';
    bossRing(this, 26, 7.0, 1, this.animT * 0.4, color, 0.3, 1.9);
    bossRing(this, 26, 10.5, 1, this.animT * 0.4 + 0.11, '#dff0ff', 0.26, 1.9);
    this.game.shake(0.5);
    this.game.hitStop(0.06);
    this.game.particles.ring(this.x, 0.3, this.z, color, 40, 2.0, 11);
    this.game.flashSmall(this.x, 1.6, this.z, color, 20, 0.25);
    audio.bell(true);
    audio.bossShoot(2);
  }

  // 二阶段：追猎（贴上来 + 三段快扫）
  huntStrike() {
    const a = this.yaw;
    for (let k = 0; k < 3; k++) {
      const ang = a - 0.42 + k * 0.42;
      this.game.projectiles.spawn({
        x: this.x + Math.sin(ang) * 2.2, y: 1.1, z: this.z + Math.cos(ang) * 2.2,
        dx: Math.sin(ang), dz: Math.cos(ang), speed: 13, damage: 1, life: 1.2,
        color: '#dff0ff', team: TEAM.ENEMY, size: 0.30, radius: 0.32, kind: 'bolt', owner: this,
      });
    }
    this.game.particles.ring(this.x, 1.0, this.z, '#c8f0ff', 18, 2.6, 7);
    audio.impact(false);
    this.game.shake(0.14);
  }

  // 二阶段：断链鞭击（用断掉的链条扫出一整圈，覆盖"绕后"这条路）
  chainWhip() {
    const n = 30;
    const gapAt = this.game.gri(0, n - 1);
    for (let i = 0; i < n; i++) {
      const d = Math.abs(i - gapAt);
      if (Math.min(d, n - d) <= 1) continue;      // 留一个可读的缺口
      const a = (i / n) * Math.PI * 2 + this.animT * 0.6;
      this.game.projectiles.spawn({
        x: this.x + Math.sin(a) * 2.4, y: 1.1, z: this.z + Math.cos(a) * 2.4,
        dx: Math.sin(a), dz: Math.cos(a), speed: 8.5, damage: 1, life: 4.0,
        color: '#9a7434', team: TEAM.ENEMY, size: 0.28, radius: 0.30, kind: 'bolt', owner: this,
      });
    }
    this.game.shake(0.26);
    audio.impact(true);
  }

  pickPattern() {
    const p = playerLockTarget(this);
    const dist = Math.hypot(p.x - this.x, p.z - this.z);
    const pool1 = ['charge', 'pounce', 'sweep', 'quake'];
    const pool2 = ['charge', 'pounce', 'sweep', 'quake', 'hunt', 'whip'];
    const choices = this.phase === 0 ? pool1 : pool2;
    const pool = suppressesNewPlayerLocks(this.game)?choices.filter(p=>!['charge','pounce','hunt'].includes(p)):choices;
    let pick = this.game.grPick(pool);
    if (pick === this.lastPattern && pool.length > 1) pick = this.game.grPick(pool);
    // 近距离不做冲撞（会变成"贴脸无解"），改成近战可读的尾扫
    if ((pick === 'charge' || pick === 'pounce') && dist < 5) pick = 'sweep';
    this.lastPattern = pick;
    this.pattern = pick;
    if(this.game.notifyEnemyAttack)this.game.notifyEnemyAttack(this);else this.game.weaponAssets?.observeEnemyAttack?.(this);
    this.state = 'pattern';
    this.patternT = 0;
    this.patternStep = 0;
  }

  update(dt, world) {
    this.animT += dt;
    this.hitFlash = Math.max(0, this.hitFlash - dt * 3);
    const st = this.status;
    if (st.burn > 0) { st.burn -= dt; this.hp -= st.burnDps * dt; reportStatusDamage(this,'burn',st.burnDps * dt,3.8); if (this.hp <= 0 && this.alive) { this.hp = 0; this.die(st.burnBuildSource||{}); return; } }
    if (st.poison > 0) { st.poison -= dt; this.hp -= st.poisonDps * dt; reportStatusDamage(this,'poison',st.poisonDps * dt,3.8); if (this.hp <= 0 && this.alive) { this.hp = 0; this.die(st.poisonBuildSource||{}); return; } }
    if (tickAsh(this, dt, 3.8)) return;

    if (!this.alive) { this.updateDeath(dt); return; }

    facePlayer(this, dt, this.phase === 0 ? 2.6 : 4.2);
    const ts = this.game.timeScale;
    const pr = this.phaseData.rate;
    const p = playerLockTarget(this);

    switch (this.state) {
      case 'intro':
        this.stateT -= dt;
        this.vx *= 0.9; this.vz *= 0.9;
        if (this.stateT <= 0) { this.state = 'idle'; this.cooldown = 0.9; }
        break;
      case 'phase':
        this.stateT -= dt;
        this.vx *= 0.86; this.vz *= 0.86;
        if (this.stateT <= 0) { this.state = 'idle'; this.cooldown = 0.4; }
        break;
      case 'idle': {
        const dist = Math.hypot(p.x - this.x, p.z - this.z);
        // 一阶段：被拴住时只在半径内来回踱步；二阶段：真的追人
        const want = this.phase === 0 ? 6.0 : 3.2;
        const sp = this.phase === 0 ? 2.4 : 6.4;
        const toward = dist > want ? 1 : (dist < want - 2.2 ? -1 : 0);
        const a = Math.atan2(p.x - this.x, p.z - this.z);
        this.vx += (Math.sin(a) * toward * sp - this.vx) * Math.min(1, dt * 3.6);
        this.vz += (Math.cos(a) * toward * sp - this.vz) * Math.min(1, dt * 3.6);
        // 轻微绕圈，避免"贴脸僵持"
        this.vx += Math.cos(a) * 1.6 * dt * 2;
        this.vz += -Math.sin(a) * 1.6 * dt * 2;
        this.cooldown -= dt;
        if (this.cooldown <= 0) this.pickPattern();
        break;
      }
      case 'chargePrep': {
        this.vx *= 0.82; this.vz *= 0.82;
        this.stateT -= dt;
        const k = Math.max(0, 1 - this.stateT / 0.72);
        // Pose：压低重心；Telegraph：蹄下扬尘（视觉前摇，而不是只画个红圈）
        this.rig.body.position.y = -0.22 * k;
        if (this.game.vr() < 0.5) this.game.particles.smoke(this.x + (this.game.vr() - 0.5) * 1.6, 0.3, this.z + (this.game.vr() - 0.5) * 1.6, 1, '#6a6a74', 0.4, 0.5);
        if (this.stateT <= 0) {
          this.state = 'charge'; this.stateT = 0.9;
          this.game.shake(0.34);
          audio.gun('rocket', 0.6);
        }
        break;
      }
      case 'charge': {
        this.stateT -= dt;
        const sp = (this.phase === 0 ? 15 : 20) * ts;
        this.vx = this.chargeDir.x * sp;
        this.vz = this.chargeDir.z * sp;
        if (this.game.vr() < 0.5) this.game.particles.sparkle(this.x, 0.7, this.z, '#8ad8ff', 2, 0.6);
        const hitWall = world.pointBlocked(this.x + this.chargeDir.x * this.radius, this.z + this.chargeDir.z * this.radius, 0.1);
        // 锁链绷直：一阶段冲出一段就会被拽停（这是"被束缚"最直观的读法）
        const tooFar = Math.hypot(this.x - this.anchorX, this.z - this.anchorZ) > this.leash;
        if (hitWall || tooFar || this.stateT <= 0) {
          this.state = 'idle'; this.cooldown = this.phase === 0 ? 0.9 : 0.6;
          this.game.shake(0.4);
          this.game.particles.ring(this.x, 0.5, this.z, tooFar ? '#6a6a74' : '#8ad8ff', 24, 1.6, 8);
          if (tooFar) {
            this.game.toast('锁链绷直', '它冲不远 —— 但链子迟早会断', '#c8f0ff', 'quick');
            audio.impact(true);
          }
        }
        break;
      }
      case 'pouncePrep': {
        this.vx *= 0.8; this.vz *= 0.8;
        this.stateT -= dt;
        this.rig.body.position.y = -0.3 * Math.max(0, 1 - this.stateT / 0.66);
        if (this.stateT <= 0) { this.state = 'pounce'; this.patternT = 0; this.game.shake(0.22); }
        break;
      }
      case 'pounce': {
        // 抛物线扑击：高度走 sin，落点震波
        this.patternT += dt * ts * pr;
        const dur = 0.55;
        const k = Math.min(1, this.patternT / dur);
        this.x = this.leapFrom.x + (this.leapTo.x - this.leapFrom.x) * k;
        this.z = this.leapFrom.z + (this.leapTo.z - this.leapFrom.z) * k;
        this.rig.body.position.y = Math.sin(k * Math.PI) * 1.6;
        if (k >= 1) {
          this.state = 'idle'; this.cooldown = 0.6;
          this.rig.body.position.y = 0;
          bossRing(this, 18, 6.5, 1, this.animT, '#8ad8ff', 0.28, 1.6);
          this.game.particles.ring(this.x, 0.3, this.z, '#c8f0ff', 30, 1.8, 9);
          this.game.shake(0.42);
          audio.impact(true);
        }
        break;
      }
      case 'pattern': {
        this.patternT += dt * ts * pr;
        const P = this.pattern;
        if (P === 'sweep') {
          this.vx *= 0.85; this.vz *= 0.85;
          const step = Math.floor(this.patternT / 0.30);
          if (step !== this.patternStep && step <= 2) { this.patternStep = step; this.sweep(); }
          if (this.patternT >= 1.0) this.endPattern(0.7);
        } else if (P === 'quake') {
          this.vx *= 0.9; this.vz *= 0.9;
          if (this.patternStep === 0) { this.patternStep = 1; this.quake(); }
          if (this.patternT >= 1.5) this.endPattern(0.85);
        } else if (P === 'charge') {
          if (this.patternStep === 0) { this.startCharge(); return; }
        } else if (P === 'pounce') {
          if (this.patternStep === 0) { this.startPounce(); return; }
        } else if (P === 'hunt') {
          // 追猎：贴近并连打三段
          this.patternStep = Math.max(this.patternStep, 1);
          const a = Math.atan2(p.x - this.x, p.z - this.z);
          const d = Math.hypot(p.x - this.x, p.z - this.z);
          const sp = d > 3.2 ? 8.2 : 1.4;
          this.vx += (Math.sin(a) * sp - this.vx) * Math.min(1, dt * 5);
          this.vz += (Math.cos(a) * sp - this.vz) * Math.min(1, dt * 5);
          const step = Math.floor(this.patternT / 0.34);
          if (step !== this._huntStep && step <= 3) { this._huntStep = step; this.huntStrike(); }
          if (this.patternT >= 1.5) { this._huntStep = -1; this.endPattern(0.55); }
        } else if (P === 'whip') {
          this.vx *= 0.9; this.vz *= 0.9;
          if (this.patternStep === 0) { this.patternStep = 1; this.chainWhip(); }
          if (this.patternT >= 1.4) this.endPattern(0.8);
        }
        break;
      }
    }

    bossContact(this, dt);

    // 锁链约束（一阶段）：位置被钳在锚点半径内，而不是靠速度硬拦
    this.x += this.vx * dt;
    this.z += this.vz * dt;
    const lx = this.x - this.anchorX, lz = this.z - this.anchorZ;
    const ld = Math.hypot(lx, lz);
    if (ld > this.leash) {
      const k = this.leash / ld;
      this.x = this.anchorX + lx * k;
      this.z = this.anchorZ + lz * k;
      const dot = this.vx * (lx / ld) + this.vz * (lz / ld);
      if (dot > 0) { this.vx -= (lx / ld) * dot; this.vz -= (lz / ld) * dot; }   // 沿链方向的速度分量被吃掉
    }
    const fr = Math.max(0, 1 - 6 * dt);
    this.vx *= fr; this.vz *= fr;
    world.resolveCircle(this, this.radius, true);

    this.group.position.set(this.x, 0, this.z);
    this.group.rotation.y = this.yaw;
    this.animate(dt);
  }

  endPattern(cd) {
    this.state = 'idle';
    this.cooldown = cd;
    this.patternT = 0;
    this.patternStep = 0;
  }

  updateDeath(dt) {
    bossUpdateDeath(this, dt, { tiltRate: 0.5, colorA: '#8ad8ff', colorB: '#dff0ff' });
    if (this.rig.bellCore) this.rig.bellCore.material.emissiveIntensity = 3 + Math.sin(this.animT * 30) * 2;
  }

  animate(dt) {
    const r = this.rig, t = this.animT;
    const breathe = Math.sin(t * 1.4) * 0.09;
    r.torso.position.y = 1.05 + breathe;
    if (r.bellMount) r.bellMount.rotation.z = Math.sin(t * 0.9) * 0.06;
    if (r.tail) { r.tail.rotation.y = Math.sin(t * 0.8) * 0.22; r.tail.rotation.x = Math.sin(t * 1.1) * 0.08; }
    if (r.jaw) r.jaw.rotation.x = (this.phase >= 1 ? -0.34 : 0) + Math.sin(t * 1.7) * 0.06;
    // 四足交替（有重量感：前后腿反相）
    for (const L of r.legs || []) {
      const ph = (L.front ? 0 : Math.PI) + (L.side > 0 ? 0 : Math.PI * 0.5);
      L.leg.rotation.x = Math.sin(t * 3.2 + ph) * 0.22;
      L.knee.position.y = -(L.front ? 1.0 : 1.2) + Math.abs(Math.sin(t * 3.2 + ph)) * 0.1;
    }
    // 链具摆动（一阶段）
    if (this.phase === 0) for (let i = 0; i < (r.chains || []).length; i++) {
      r.chains[i].rotation.z = Math.sin(t * 2.1 + i) * 0.16;
    }
    const glow = 1.8 + Math.sin(t * (this.phase === 1 ? 8 : 3.2)) * 0.7;
    if (r.bellCore) r.bellCore.material.emissiveIntensity = glow;
    const ei = 2.4 + Math.sin(t * (this.phase === 1 ? 10 : 4)) * 1.1;
    for (const e of r.eyes || []) if (e.material) e.material.emissiveIntensity = ei;
    if (this.hitFlash > 0.02) {
      r.group.traverse((o) => { if (o.isMesh && o.material && o.material.emissive) o.material.emissiveIntensity = Math.max(o.material.emissiveIntensity || 0, this.hitFlash * 1.4); });
    }
  }
}
