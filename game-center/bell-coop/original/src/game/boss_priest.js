import {playerLockTarget,suppressesNewPlayerLocks,combatPlayers} from '../experimental/consumables/visibility.js';
// ============================================================
//  哑钟主祭 · THE SILENT HIEROPHANT（PASS2 §23）
//
//  核心体验：**钟声控场 → 声音被抽走后的静默压制**。
//
//  一阶段（钟声）：所有危险动作都由"声音"预告 —— 钟波、延迟钟击、仪式弹幕，
//          每一次出手都伴随钟鸣与姿态（举钟 / 落钟），玩家靠听觉 + 姿态读招。
//  转阶段：**声音被抽走**（不是把音量调小）：钟面翻转、光晕收紧、环境变暗，
//          预告改为纯视觉（地面波纹 + 灯光脉冲）。
//  二阶段（静默）：地面波纹推进 + 静默区域压缩走位空间。
//
//  公平性（§26）：静默区域**只减速与标记落点**，不禁用任何职业的核心玩法 ——
//  不会出现"某个职业在这个 Boss 面前不能用技能"。
// ============================================================
import * as THREE from '../../vendor/three.module.js';
import { TEAM } from '../core/constants.js';
import { buildSilentHierophant } from '../art/models.js';
import {applyBlenderActorVisual,disposeActorVisual} from '../art/actor_assets.js';
import { audio } from '../core/audio.js';
import { reportStatusDamage } from './damage_feedback.js';
import { tickAsh } from './ash_status.js';
import { bossWarning } from './boss_chapter_actions.js';
import {
  aimedAngle, bossRing, bossArc, bossTakeDamage, bossApplyStatus, bossDie, bossRemove,
  bossContact, bossUpdateDeath, facePlayer,
} from './boss_helpers.js';

export const HIEROPHANT_PHASES = [
  { hp: 1.00, cn: '钟声', color: '#dff0ff', rate: 1.00 },
  { hp: 0.50, cn: '静默', color: '#7a5aff', rate: 1.28 },
];

export class SilentHierophant {
  static ID = 'silent_hierophant';
  static CN = '哑钟主祭';
  static EN = 'THE SILENT HIEROPHANT';

  constructor(game, x, z) {
    this.bossType = SilentHierophant.ID;
    this.cn = SilentHierophant.CN;
    this.game = game;
    this.id = 'boss';
    this.isBoss = true;
    this.x = x; this.z = z;
    this.vx = 0; this.vz = 0;
    this.yaw = Math.PI;
    this.radius = 1.35;
    this.r = 1.35;
    this.minY = 0;
    this.team = TEAM.ENEMY;
    this.alive = true;
    this.maxHp = 780;
    this.hp = this.maxHp;
    this.phase = 0;
    this.state = 'intro';
    this.stateT = 2.6;
    this.animT = 0;
    this.hitFlash = 0;
    this.cooldown = 1.9;
    this.pattern = null;
    this.patternT = 0;
    this.patternStep = 0;
    this.contactCd = 0;
    this.deadT = 0;
    this.spiralAngle = 0;
    this.hitColor = '#dff0ff';
    this.status = { burn: 0, burnDps: 0, poison: 0, poisonDps: 0, slow: 0, freeze: 0 };
    this.rig = buildSilentHierophant();
    applyBlenderActorVisual(this.rig,'silent_hierophant');
    this.group = this.rig.group;
    this.group.position.set(x, 0, z);
    game.scene.add(this.group);
    this.baseScale = 1.35;
    this.rig.group.scale.setScalar(this.baseScale);
    this.telegraphs = [];
    this.lastPattern = '';
    this._muteT = 0;
    this._oneVec = new THREE.Vector3(1, 1, 1);
  }

  get phaseData() { return HIEROPHANT_PHASES[this.phase]; }

  takeDamage(n, opts = {}) {
    return bossTakeDamage(this, n, opts, [{ at: 0.50, phase: 1 }]);
  }
  applyStatus(kind, dur, opts = {}) { bossApplyStatus(this, kind, dur, opts); }

  enterPhase(p) {
    this.phase = p;
    this.state = 'phase';
    this.stateT = 2.2;
    audio.bossRoar();
    audio.phaseChange();
    this.game.shake(0.7);
    this.game.hitStop(0.16);
    this.game.damageFlash(0.5);
    this.game.particles.ring(this.x, 0.5, this.z, '#7a5aff', 56, 2.2, 12);
    this.game.explodeVisual(this.x, 1.6, this.z, 5.2, '#7a5aff');
    // "声音被抽走"：真的把音乐/环境音压低一段时间，再恢复 —— 玩家听得见这件事
    this._muteT = 2.4;
    try {
      // 记录原音量再压低，恢复时按原值还原（不要写死默认值 —— 暂停界面也会改 music 音量）
      if (audio.getDuck && audio.duck) {
        this._volSave = { music: audio.getDuck('music'), sfx: audio.getDuck('sfx') };
        audio.duck('music', 0.12);
        audio.duck('sfx', 0.28);
      }
    } catch (e) { /* 音量接口缺失不影响玩法 */ }
    this.syncPhaseVisual();
    this.game.toast('哑钟主祭 · 声音被抽走', '钟面翻转，预警改为地面波纹与灯光。', '#7a5aff');
    this.game.setBossPhase(p);
  }

  syncPhaseVisual() {
    const r = this.rig;
    const silent = this.phase >= 1;
    if (r.bellPivot) {
      r.bellPivot.position.set(0, silent ? 1.5 : 1.15, silent ? 1.25 : 0.95);
      r.bellPivot.rotation.x = silent ? Math.PI : 0;      // 钟面翻转
    }
    if (r.hoodRim) r.hoodRim.material = silent ? r.hoodRim.material : r.hoodRim.material;
    if (r.gem && r.gem.material) r.gem.material.emissiveIntensity = silent ? 3.4 : 2.4;
    if (r.group) r.group.scale.setScalar(this.baseScale * (silent ? 1.06 : 1));
  }

  restoreAudioDuck(){if(this._volSave){audio.duck('music',this._volSave.music);audio.duck('sfx',this._volSave.sfx);this._volSave=null;this._muteT=0;}}
  die(opts = {}) { this.restoreAudioDuck();bossDie(this,opts); }
  remove() { this.restoreAudioDuck();disposeActorVisual(this.group);bossRemove(this); }

  // ---------------- 招式 ----------------
  // 钟波：以钟为圆心扩散的多层环（节奏感来自速度差，而不是弹数）
  bellWave() {
    bossRing(this, 20, 6.0, 1, this.animT * 0.5, '#dff0ff', 0.30, 1.2);
    bossRing(this, 20, 9.2, 1, this.animT * 0.5 + 0.13, '#9fd8ff', 0.26, 1.2);
    audio.bell(true);
    this.game.shake(0.18);
    this.game.particles.ring(this.x, 1.0, this.z, '#dff0ff', 26, 1.6, 8);
  }

  // 延迟钟击：先在**可读的位置**标出落点（带节拍的序列），再依次爆发
  delayedStrikes() {
    const p = playerLockTarget(this);
    const n = this.phase === 0 ? 5 : 7;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + this.animT * 0.35;
      const r = 3.0 + (i % 2) * 2.4;
      const pos = this.game.clampToRoom(p.x + Math.cos(a) * r, p.z + Math.sin(a) * r, 1.5);
      // 预警用现有危险区表现：持续显示 + 延迟爆发（damage 1）
      if (this.chapterActions) bossWarning(this, pos.x, pos.z, 1.6, 0.9 + i * 0.12, 1, '#7a5aff');
      else this.game.hazards.add(pos.x, pos.z, 1.6, 0.9 + i * 0.12, 1, '#7a5aff');
    }
    audio.bell(false);
    this.game.shake(0.14);
  }

  // 仪式弹幕：四向对称的几何弹（王庭仪式感：可预测的图形，而不是乱喷）
  ritualBarrage() {
    this.spiralAngle += 0.42;
    for (let arm = 0; arm < 4; arm++) {
      const a = this.spiralAngle + (arm / 4) * Math.PI * 2;
      bossArc(this, 3, 0.10, a, 11, 1, '#c8d8ff', 0.28, 1.4);
    }
    audio.bossShoot(1);
  }

  // 地面波纹：低平推进的波前（逼你横向走位；高度低、速度快，读得清）
  groundRipple() {
    const n = 26;
    const gapAt = this.game.gri(0, n - 1);
    for (let i = 0; i < n; i++) {
      const d = Math.abs(i - gapAt);
      if (Math.min(d, n - d) <= 1) continue;
      const a = (i / n) * Math.PI * 2 + this.animT * 0.3;
      this.game.projectiles.spawn({
        x: this.x + Math.sin(a) * 2.2, y: 0.35, z: this.z + Math.cos(a) * 2.2,
        dx: Math.sin(a), dz: Math.cos(a), speed: 7.2, damage: 1, life: 5.0,
        color: '#7a5aff', team: TEAM.ENEMY, size: 0.34, radius: 0.34, kind: 'orb', owner: this,
      });
    }
    this.game.particles.ring(this.x, 0.25, this.z, '#7a5aff', 30, 1.8, 7);
    this.game.shake(0.2);
  }

  // 静默区域：大范围、长延迟的**区域封锁**（逼你离开脚下这块地）。
  // 刻意不用"禁用技能 / 沉默玩家"这类机制 —— 那会让某些职业在这个 Boss 面前失效（§26）。
  // 这里只做走位压力：地面先亮起静默环，随后整片区域一起爆发。
  silentZones() {
    const p = playerLockTarget(this);
    for (let i = 0; i < 2; i++) {
      const a = this.game.gr() * Math.PI * 2;
      const r = 4.5 + i * 2.2;
      const pos = this.game.clampToRoom(p.x + Math.cos(a) * r, p.z + Math.sin(a) * r, 2.0);
      if (this.chapterActions) bossWarning(this, pos.x, pos.z, 3.0, 1.5 + i * 0.35, 1, '#7a5aff');
      else this.game.hazards.add(pos.x, pos.z, 3.0, 1.5 + i * 0.35, 1, '#7a5aff');
      this.game.particles.ring(pos.x, 0.15, pos.z, '#7a5aff', 26, 2.4, 4);
    }
    audio.teleport();
    this.game.toast('静默区域', '脚下的环形印记会爆发 —— 先离开那里', '#7a5aff', 'quick');
  }

  pickPattern() {
    const pool1 = ['wave', 'delayed', 'barrage', 'toll'];
    const pool2 = ['wave', 'delayed', 'ripple', 'silence'];
    const pool = this.phase === 0 ? pool1 : pool2;
    let pick = this.game.grPick(pool);
    if (pick === this.lastPattern && pool.length > 1) pick = this.game.grPick(pool);
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
    // 转阶段后的短暂"静默"：把音量恢复
    if (this._muteT > 0) {
      this._muteT -= dt;
      if (this._muteT <= 0) {
        try {
          const v = this._volSave || { music: 1, sfx: 1 };
          if (audio.duck) { audio.duck('music', v.music); audio.duck('sfx', v.sfx); }
        } catch (e) { /* ignore */ }
        this._volSave = null;
      }
    }
    const st = this.status;
    if (st.burn > 0) { st.burn -= dt; this.hp -= st.burnDps * dt; reportStatusDamage(this,'burn',st.burnDps * dt,3.8); if (this.hp <= 0 && this.alive) { this.hp = 0; this.die(st.burnBuildSource||{}); return; } }
    if (st.poison > 0) { st.poison -= dt; this.hp -= st.poisonDps * dt; reportStatusDamage(this,'poison',st.poisonDps * dt,3.8); if (this.hp <= 0 && this.alive) { this.hp = 0; this.die(st.poisonBuildSource||{}); return; } }
    if (tickAsh(this, dt, 3.8)) return;

    if (!this.alive) { this.updateDeath(dt); return; }

    facePlayer(this, dt, 2.4);
    const ts = this.game.timeScale;
    const pr = this.phaseData.rate;

    switch (this.state) {
      case 'intro':
        this.stateT -= dt;
        this.vx *= 0.9; this.vz *= 0.9;
        if (this.stateT <= 0) { this.state = 'idle'; this.cooldown = 1.0; }
        break;
      case 'phase':
        this.stateT -= dt;
        this.vx *= 0.86; this.vz *= 0.86;
        if (this.stateT <= 0) { this.state = 'idle'; this.cooldown = 0.4; }
        break;
      case 'idle': {
        const perceived=playerLockTarget(this);
        // 保持中距离：它是控场者，不是贴身战士
        const dist = Math.hypot(perceived.x - this.x, perceived.z - this.z);
        const want = 8.5;
        const mv = dist > want + 2 ? 1 : (dist < want - 3 ? -1 : 0);
        const a = Math.atan2(perceived.x - this.x, perceived.z - this.z);
        const sp = 2.6 * ts;
        this.vx += (Math.sin(a) * mv * sp - this.vx) * Math.min(1, dt * 3.4);
        this.vz += (Math.cos(a) * mv * sp - this.vz) * Math.min(1, dt * 3.4);
        // 缓慢环绕
        this.vx += Math.cos(a) * 1.4 * dt * 2;
        this.vz += -Math.sin(a) * 1.4 * dt * 2;
        this.cooldown -= dt;
        if (this.cooldown <= 0) this.pickPattern();
        break;
      }
      case 'pattern': {
        this.patternT += dt * ts * pr;
        const P = this.pattern;
        this.vx *= 0.9; this.vz *= 0.9;
        if (P === 'wave' || P === 'toll') {
          const total = P === 'toll' ? 3 : 2;
          const step = Math.floor(this.patternT / 0.5);
          if (step !== this.patternStep && step < total) {
            this.patternStep = step;
            this.bellWave();
            if (P === 'toll') {
              // 钟鸣额外把玩家推开（控场而不是伤害）
              for(const p of combatPlayers(this.game)){
                const dx = p.x - this.x, dz = p.z - this.z;
                const d = Math.hypot(dx, dz) || 1;
                if (d < 7) { p.vx += (dx / d) * 6.5; p.vz += (dz / d) * 6.5; }
              }
            }
          }
          if (this.patternT >= 0.5 * total + 0.35) this.endPattern(0.75);
        } else if (P === 'delayed') {
          if (this.patternStep === 0) { this.patternStep = 1; this.delayedStrikes(); }
          if (this.patternT >= 1.5) this.endPattern(0.8);
        } else if (P === 'barrage') {
          const step = Math.floor(this.patternT / 0.26);
          if (step !== this.patternStep && step <= 7) { this.patternStep = step; this.ritualBarrage(); }
          if (this.patternT >= 2.2) this.endPattern(0.85);
        } else if (P === 'ripple') {
          if (this.patternStep === 0) { this.patternStep = 1; this.groundRipple(); }
          if (this.patternT >= 1.6) this.endPattern(0.8);
        } else if (P === 'silence') {
          if (this.patternStep === 0) { this.patternStep = 1; this.silentZones(); }
          if (this.patternT >= 1.2) this.endPattern(0.7);
        }
        break;
      }
    }

    bossContact(this, dt);

    this.x += this.vx * dt;
    this.z += this.vz * dt;
    const fr = Math.max(0, 1 - 7 * dt);
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
    bossUpdateDeath(this, dt, { tiltRate: 0.38, colorA: '#7a5aff', colorB: '#dff0ff' });
    if (this.rig.bellInner) this.rig.bellInner.material.emissiveIntensity = 3 + Math.sin(this.animT * 26) * 2;
  }

  animate(dt) {
    const r = this.rig, t = this.animT;
    const float = Math.sin(t * 1.1) * 0.10;             // 悬浮感：整体上下浮动
    r.body.position.y = float + (this.phase >= 1 ? 0.22 : 0);
    if (r.veil) r.veil.rotation.x = Math.sin(t * 1.6) * 0.10 - 0.06;
    if (r.hood) r.hood.rotation.y = Math.sin(t * 0.5) * 0.10;
    if (r.bellPivot) {
      // 一阶段钟身轻摆（钟声的来源）；二阶段翻转后只微颤（声音已失去）
      r.bellPivot.rotation.z = this.phase === 0 ? Math.sin(t * 2.6) * 0.16 : Math.sin(t * 9) * 0.03;
      r.bellPivot.position.y = (this.phase >= 1 ? 1.5 : 1.15) + Math.sin(t * 1.4) * 0.06;
    }
    if (r.clapper) r.clapper.rotation.z = Math.sin(t * 3.1) * (this.phase === 0 ? 0.42 : 0.06);
    if (r.staffGem) r.staffGem.rotation.y += dt * 1.2;
    if (r.staffHead) r.staffHead.rotation.z += dt * 0.7;
    const glow = 1.6 + Math.sin(t * (this.phase === 1 ? 7.5 : 3.0)) * 0.6;
    if (r.bellInner) r.bellInner.material.emissiveIntensity = glow;
    if (r.gem) r.gem.material.emissiveIntensity = glow * 1.3;
    const ei = 2.2 + Math.sin(t * (this.phase === 1 ? 9 : 4)) * 1.0;
    for (const e of r.eyes || []) if (e.material) e.material.emissiveIntensity = ei;
    // 悬浮钟片环：一阶段缓慢环绕，二阶段收紧（视觉语言随阶段改变）
    const rad = this.phase >= 1 ? 0.95 : 1.25;
    for (let i = 0; i < (r.orbs || []).length; i++) {
      const o = r.orbs[i];
      const a = t * (this.phase === 0 ? 0.6 : 1.4) + o.phase;
      o.g.position.set(Math.cos(a) * 0.0, 0, 0);
      o.mesh.position.set(Math.cos(a) * rad, Math.sin(a * 2) * 0.12, Math.sin(a) * rad);
      o.mesh.rotation.y = -a;
    }
    if (this.hitFlash > 0.02) {
      r.group.traverse((o) => { if (o.isMesh && o.material && o.material.emissive) o.material.emissiveIntensity = Math.max(o.material.emissiveIntensity || 0, this.hitFlash * 1.4); });
    }
  }
}
