import {captureDamageContext,damageSource,resolveDamageActor} from './damage_context.js';
import { applyBuildFreeze, triggerBuildCritExplosion, statusBuildSource, captureBuildKillContext } from './build_hit_effects.js';
// ============================================================
//  敌人 —— 模型构建 / 行为 AI / 状态效果 / 掉落
// ============================================================
import * as THREE from '../../vendor/three.module.js';
import { TEAM } from '../core/constants.js';
import { ENEMY_MAP } from './data.js';
import {
  buildHumanoid, buildQuadruped, buildFloater, buildBug, buildTurret, buildDrone, buildBlob, walkHumanoid
} from '../art/models.js';
import { buildGunModel } from '../art/guns.js';
import { applyBlenderActorVisual,disposeActorVisual,syncActorPulseMaterials } from '../art/actor_assets.js';
import { audio } from '../core/audio.js';
import { reportStatusDamage, statusFeedbackSource } from './damage_feedback.js';
import { emberStatusMultiplier } from './hero_p2.js';
import { applyAsh, tickAsh } from './ash_status.js';
import { suppressesNewPlayerLocks, selectPlayerTarget, playerLockTarget, combatPlayers } from '../experimental/consumables/visibility.js';
import { resolveEnemyMovement } from './collide.js';

let _idSeq = 1;
// A complete runtime checkpoint also reserves IDs of defeated and sleeping
// enemies. Active-room reconstruction alone cannot recover that watermark.
export function captureEnemySequence() { return _idSeq; }
export function restoreEnemySequence(value) {
  if (!Number.isSafeInteger(value) || value < 1) throw TypeError('Invalid enemy sequence');
  _idSeq = value;
}

// 精英轮廓层的共享资源（PASS3 §26）：只建一次，不随敌人数增长
let ELITE_RING_GEO = null;
const ELITE_RING_MAT = new THREE.MeshBasicMaterial({
  color: 0xffc247, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide, toneMapped: false,
});
// 精英血条**不再用 3D 平面**（用户第二轮反馈：细到 1/3~1/2、且"不要继承 3D 效果"）。
// 透视投影会把离屏中心稍远的四边形压成梯形，看起来像"斜的、跟着怪物转" ——
// 改材质/改朝向都解决不了，因为那是投影本身造成的。
// 现在改为：把头顶锚点投影成屏幕坐标，由 src/ui/worldbars.js 用 DOM 画一条水平直线。
// 本文件只负责给出**挂点高度**（barAnchorY）与轮廓层（地环 + 光柱）。
const ELITE_BEAM_GEO = new THREE.CylinderGeometry(0.28, 0.44, 3.0, 10, 1, true);
const ELITE_BEAM_MAT = new THREE.MeshBasicMaterial({
  color: 0xffb347, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide,
  blending: THREE.AdditiveBlending, toneMapped: false,
});

export class Enemy {
  constructor(game, defId, x, z, opts = {}) {
    this.game = game;
    this.def = ENEMY_MAP[defId];
    if (!this.def) throw new Error('unknown enemy ' + defId);
    this.id = opts.id || ('e' + (_idSeq++));
    if (/^e\d+$/.test(this.id)) _idSeq = Math.max(_idSeq, Number(this.id.slice(1)) + 1);
    this.kind = defId;
    this.x = x; this.z = z;
    this.vx = 0; this.vz = 0;
    // 初始朝向 / 首次开火 / 特殊技能计时这三个都是**会影响结果**的量，
    // 必须走 gameplay 种子流（gr），否则"同 Seed + 同输入 → 同结果"（§52）不成立：
    // 旧实现用 vr()（内部就是 Math.random），于是同一颗种子的同一场战斗，
    // 敌人第一次开火的时机每次都不一样 —— 伤害落点因此浮动。
    // 注：下面的 animT 纯装饰，继续用 vr() 没问题。
    this.yaw = game.gr() * Math.PI * 2;
    this.radius = this.def.radius * (this.def.scale || 1) * 0.95;
    this.r = this.radius;
    this.minY = 0;
    this.elite = !!opts.elite;
    // 难度档的生命倍率（standard = 1.0，与改动前完全一致）
    const hpMul = (this.elite ? 1.85 : 1) * (opts.hpMul || 1) * ((game && game.mod_ && game.mod_.enemyHpMul) || 1);
    this.maxHp = Math.round(this.def.hp * hpMul);
    this.hp = this.maxHp;
    this.alive = true;
    this.team = TEAM.ENEMY;
    this.status = { burn: 0, burnDps: 0, poison: 0, poisonDps: 0, slow: 0, freeze: 0 };
    this.state = 'idle';
    this.stateT = 0;
    this.fireT = game.gr() * 1.2;      // gameplay 种子流，见 yaw 处注释
    this.burstLeft = 0; this.burstT = 0;
    this.contactCd = 0;
    this.hitFlash = 0;
    this.deathT = 0;
    this.deathDone = false;
    // Several movement patterns also consume animT. Fixed-step authority needs
    // a stable phase for newly spawned actors after a cold checkpoint.
    this.animT = game.platform?.entityPhase ? game.platform.entityPhase(this.id,game.seed) : game.vr() * 10;
    this.aimYaw = this.yaw;
    this.spawnT = 0.45;
    this.stunT = 0;
    // 护盾耐久（仅 def.shield 的敌人使用）：正面格挡会消耗它，打崩后永久破防
    this.shieldHp = this.def.shieldHp || 18;
    this.shieldMax = this.shieldHp;
    this.shieldBroken = false;
    this.shieldFlash = 0;
    this.shieldDropT = 0;
    this.specialT = game.gr() * 3;     // gameplay 种子流，见 yaw 处注释
    this.face = { x: Math.sin(this.yaw), z: Math.cos(this.yaw) };
    this.speedMul = 1;
    this.buildModel();
    this.group.position.set(x, 0, z);
  }

  buildModel() {
    const p = this.def.palette || {};
    const s = this.def.scale || 1;
    // def.build 用于给同一套基础骨架追加"变体部件"（盔冠 / 长戟 / 鎏金甲 / 双联炮 / 光环），
    // 让第三层敌人即使在共用骨架上也能一眼区分。
    const v = this.def.build || {};
    switch (this.def.model) {
      case 'quadruped': this.rig = buildQuadruped({ ...p, scale: s, ...v }); break;
      case 'floater': this.rig = buildFloater({ ...p, scale: s, hover: p.hover || 1.55, ...v }); break;
      case 'bug': this.rig = buildBug({ ...p, scale: s, fly: this.def.fly, ...v }); break;
      case 'turret': this.rig = buildTurret({ ...p, scale: s, ...v }); break;
      case 'drone': this.rig = buildDrone({ ...p, scale: s, hover: 1.55, ...v }); break;
      case 'blob': this.rig = buildBlob({ ...p, scale: s, ...v }); break;
      default: this.rig = buildHumanoid({ ...p, scale: s, ...v }); break;
    }
    applyBlenderActorVisual(this.rig,this.def.id);
    this.group = this.rig.group;
    this.game.scene.add(this.group);
    if (this.def.weapon && this.rig.weaponMount) {
      const gun = buildGunModel(ENEMY_MAP[this.def.id] ? (this.def.weaponModel || this._weaponModel()) : 'pistol');
      this.gunModel = gun;
      this.rig.weaponMount.add(gun);
    }
    if (this.elite) this.applyEliteTint();
  }

  _weaponModel() {
    const map = { pistol_rusty: 'pistol', rifle_carbine: 'rifle', smg_hornet: 'smg', shotgun_sapper: 'shotgun' };
    return map[this.def.weapon] || 'rifle';
  }

  applyEliteTint() {
    this.group.traverse((o) => {
      if (o.isMesh && o.material && o.material.color) {
        o.material = o.material.clone();
        o.material.emissive = new THREE.Color('#ffb347');
        o.material.emissiveIntensity = 0.35;
      }
    });
    syncActorPulseMaterials(this.group);
    // ------------------------------------------------------------
    //  精英轮廓层（PASS3 §26）
    //
    //  只做 emissive 染色是不够的：在拥挤房间里"发光的橙"与火把、熔岩、
    //  玩家弹幕混在一起，玩家认不出"这只比别的硬"。
    //  这里补**形状层**（地面环 + 竖直光柱），形状在混战里比颜色更快被识别 ——
    //  而且它一眼就能回答"这只值不值得先打"。
    //  地面环用共享几何（RingGeometry 只建一次），不随敌人数增加几何体。
    // ------------------------------------------------------------
    if (!ELITE_RING_GEO) ELITE_RING_GEO = new THREE.RingGeometry(0.86, 1.0, 20);
    const rr = (this.radius || 0.5) * 1.75;
    const ring = new THREE.Mesh(ELITE_RING_GEO, ELITE_RING_MAT);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.07;
    ring.scale.setScalar(rr);
    ring.renderOrder = 2;
    ring.userData.aura = true;      // 受击闪白必须跳过它（共享材质不能克隆）
    this.group.add(ring);
    this._eliteRing = ring;
    // 竖直光柱：细长、半透明，指示"精英在这"，不遮挡它自己
    const beam = new THREE.Mesh(ELITE_BEAM_GEO, ELITE_BEAM_MAT);
    beam.position.y = 1.5;
    beam.scale.setScalar((this.radius || 0.5) * 0.9);
    beam.renderOrder = 2;
    beam.userData.aura = true;
    this.group.add(beam);
    this._eliteBeam = beam;

  }


  // 血条挂点：**敌人真实包围盒顶部**（排除光环层），算一次并缓存。
  // 踩过的坑：曾用 radius*2.4+0.7 估出 1.9，而身体顶部是 2.25 —— 血条压在身体里，
  // 金色血条贴金色身体等于看不见。必须按包围盒算。
  barAnchorY() {
    if (this._barTopY !== undefined) return this._barTopY;
    let top = -1e9;
    const box = new THREE.Box3();
    for (const c of this.group.children) {
      if (c.userData.aura) continue;
      box.setFromObject(c);
      if (!box.isEmpty() && isFinite(box.max.y)) top = Math.max(top, box.max.y - this.group.position.y);
    }
    this._barTopY = (top > -1e8) ? top : (this.radius || 0.5) * 2.2;
    return this._barTopY;
  }

  get isFrozen() { return this.status.freeze > 0; }

  // ---------------- 受伤 ----------------
  takeDamage(n, opts = {}) {
    if (!this.alive) return;
    // 盾牌正面格挡 —— 但护盾有耐久，会被打崩（见 breakShield）。
    // 旧实现是"正面永久免疫"，配合 7rad/s 的转向速度与冲锋 AI，
    // 会让铁壁卫兵/守界棱卫变成**无法击杀**的敌人，
    // 而被封锁的战斗房因此永远无法开门（死局）。
    if (this.def.shield && !this.shieldBroken && opts.dir && !opts.ignoreShield) {
      const fx = Math.sin(this.yaw), fz = Math.cos(this.yaw);
      const dot = fx * opts.dir.x + fz * opts.dir.z;
      if (dot < -0.55) {
        this.shieldFlash = 1;
        this.shieldHp -= Math.max(1, n * 0.6);
        this.game.particles.impact(this.x + opts.dir.x * -0.6, 0.9, this.z + opts.dir.z * -0.6, '#9aa4ae', 8, 1.2);
        audio.impact(true);
        if (this.shieldHp <= 0) this.breakShield();
        else this.game.popText(this.x, 1.4, this.z, '格挡', '#9aa4ae');
        return;
      }
    }
    this.hp -= n;
    this.hitFlash = 1;
    audio.hitEnemy(!!opts.crit);
    const feedbackY = 1.3 + (this.def.scale || 1) * 0.4;
    if (!this.game.recordDamageFeedback?.(this,n,opts,{y:feedbackY}))
      this.game.popText(this.x, feedbackY, this.z, Math.round(n), opts.crit ? '#ffd24a' : '#ffffff', !!opts.crit);
    this.game.particles.bloodburst(this.x, 0.95, this.z, this.def.model === 'blob' ? '#4fbf5a' : '#c0303a', 6, 0.9);
    if (opts.statuses) {
      if (opts.statuses.burn) this.applyStatus('burn', opts.statuses.burn, opts);
      if (opts.statuses.poison) this.applyStatus('poison', opts.statuses.poison, opts);
      if (opts.statuses.ash) applyAsh(this, opts.statuses.ash, opts);
      if (opts.statuses.slow) this.applyStatus('slow',2.2,{strength:opts.statuses.slow});
    }
    applyBuildFreeze(this,opts);
    if (this.hp <= 0) this.die(opts);
    else {
      const kb = (opts.knock ?? 1) * 3.0 ?? 0;
      this.vx += (opts.dir?.x || 0) * kb;
      this.vz += (opts.dir?.z || 0) * kb;
    }
    triggerBuildCritExplosion(this,opts);
  }

  // 护盾被打崩：永久破防 + 硬直 + 掉盾演出，给玩家明确的正反馈与破局点
  breakShield() {
    if (this.shieldBroken) return;
    this.shieldBroken = true;
    this.shieldHp = 0;
    this.shieldDropT = 0.9;
    this.stunT = Math.max(this.stunT, 1.0);
    this.state = 'recover';
    this.stateT = 1.0;
    this.hitFlash = 1;
    const g = this.game;
    g.popText(this.x, 1.7, this.z, '破盾！', '#ffd24a', true);
    g.particles.bloodburst(this.x, 1.0, this.z, '#9aa4ae', 12, 1.5);
    g.particles.ring(this.x, 0.4, this.z, '#ffd24a', 22, 0.75, 5.5);
    g.debris.burst(this.x, 0.9, this.z, this.def.palette?.shieldColor || '#9aa4ae', 12, 1.5);
    g.shake(0.14);
    audio.impact(false);
  }

  applyStatus(kind, dur, opts = {}) {
    if (kind === 'burn' || kind === 'poison') {this.status[`${kind}FeedbackSource`]=statusFeedbackSource(opts);this.status[`${kind}BuildSource`]=statusBuildSource(opts);}
    if (kind === 'burn') { this.status.burn = Math.max(this.status.burn, dur); this.status.burnDps = 3.6 * emberStatusMultiplier(this,opts); }
    if (kind === 'poison') { this.status.poison = Math.max(this.status.poison, dur + 1.6); this.status.poisonDps = 2.6 * emberStatusMultiplier(this,opts); }
    if(kind==='slow'){this.status.slow=Math.max(this.status.slow,dur);this.status.slowStrength=Math.max(this.status.slowStrength||0,Math.min(.75,opts.strength??.5));}
    if (kind === 'freeze') { this.status.freeze = Math.max(this.status.freeze, dur); }
  }

  die(opts = {}) {
    if (!this.alive) return;
    opts={...opts,...captureDamageContext(this.game,opts)};this.lethalContext=damageSource(opts);
    this.assetLastSourceInstanceId=opts.sourceInstanceId||null;this.assetLastRootShotId=opts.rootShotId||null;this.assetLastNoRefund=!!opts.assetNoRefund;
    const killer=resolveDamageActor(this.game,opts)?.player;
    if(opts.assetSecondary&&!opts.primaryExplosion&&opts.source!=='secondaryEcho')this.c2Lethal=null;
    this.buildBurnKill=!!opts.burnKill||this.status.burn>0;
    if(opts.buildContext)captureBuildKillContext(this,opts);
    if(opts.assetSecondary){this.assetLastNoRefund=true;this.buildKillContext={...this.buildKillContext,lifesteal:this.buildKillContext?.relicLifesteal??killer?.stats.lifesteal??0};}
    this.alive = false;
    audio.enemyDie();
    const p = this.game.particles;
    p.bloodburst(this.x, 1.0, this.z, this.def.model === 'blob' ? '#4fbf5a' : '#c0303a', 18, 1.4);
    p.smoke(this.x, 0.6, this.z, 4, '#2a2a2a', 0.7, 0.7);
    this.game.debris.burst(this.x, 0.7, this.z, this.def.palette?.armor || '#5a5a5a', 8, 1.1);
    this.game.spawnDeathBurst(this.x, 0.9, this.z, this.def.palette?.visor || '#ff8a3c');
    // 分裂
    if (!this.dummy && this.game.mode === 'run' && this.def.splitInto) {
      for (let i = 0; i < this.def.splitCount; i++) {
        const a = (i / this.def.splitCount) * Math.PI * 2 + this.game.gr();
        this.game.spawnEnemy(this.def.splitInto, this.x + Math.cos(a) * 1.0, this.z + Math.sin(a) * 1.0, { delay: 0.1 });
      }
    }
    // 掉落
    const coinN = Math.round(this.def.coins * (this.elite ? 2.2 : 1) * this.game.coinMul());
    if (!this.dummy && this.game.mode === 'run') this.game.spawnCoins(this.x, this.z, coinN,{rewardSource:'enemy-drop'});
    this.game.onEnemyKilled(this,opts);
    // 不再让模型瞬间消失：交给 updateDeath() 播一段按体型/移动方式区分的死亡演出。
    this.deathT = 0;
    this.deathDone = false;
    // 高价值击杀顿帧，强调打击终点
    if (this.elite || (this.def.tier || 1) >= 3) this.game.hitStop(0.075);
  }

  // 死亡演出（0.42s）。不同 model 表现不同：
  //   humanoid/quadruped 向后倒地、blob 塌缩、floater 坠落、turret 塌陷并减速停转。
  // 逻辑层早已按 alive 过滤，因此这段演出不影响房间解锁与命中判定。
  updateDeath(dt) {
    this.deathT += dt;
    const k = Math.min(1, this.deathT / 0.42);
    const g = this.rig.group, bs = this.def.scale || 1, m = this.def.model;
    if (m === 'blob') {
      g.scale.set(bs * (1 + k * 0.5), Math.max(0.05, bs * (1 - k * 0.94)), bs * (1 + k * 0.5));
    } else if (m === 'floater') {
      g.position.y = -k * 1.7;
      g.rotation.z = k * 1.9;
      g.scale.setScalar(Math.max(0.05, bs * (1 - k * 0.55)));
    } else if (m === 'turret') {
      g.rotation.y += dt * (1 - k) * 7;
      g.scale.set(bs * (1 - k * 0.22), Math.max(0.05, bs * (1 - k * 0.72)), bs * (1 - k * 0.22));
    } else {
      g.rotation.x = -k * 1.45;
      g.position.y = Math.sin(k * Math.PI) * 0.22;
      g.scale.setScalar(Math.max(0.05, bs * (1 - k * 0.32)));
    }
    if (k >= 1) this.deathDone = true;
  }

  remove() {
    disposeActorVisual(this.group);
    if (this.group.parent) this.group.parent.remove(this.group);
  }

  tickStatuses(dt) {
    if(!this.alive)return true;
    // 状态
    const st = this.status;
    if (st.burn > 0) {
      st.burn = Math.max(0,st.burn-dt);
      this.hp -= st.burnDps * dt;
      reportStatusDamage(this,'burn',st.burnDps * dt,1.3 + (this.def.scale || 1) * .4);
      if (Math.random() < 0.3) this.game.particles.sparkle(this.x, 0.9, this.z, '#ff7a1a', 1, 2);   // visual-rng: 纯粒子表现
      if (this.hp <= 0) { this.die({...st.burnBuildSource,burnKill:true}); return true; }
    }
    if (st.poison > 0) {
      st.poison = Math.max(0,st.poison-dt);
      this.hp -= st.poisonDps * dt;
      reportStatusDamage(this,'poison',st.poisonDps * dt,1.3 + (this.def.scale || 1) * .4);
      if (Math.random() < 0.3) this.game.particles.sparkle(this.x, 0.9, this.z, '#9dff5a', 1, 1.4);   // visual-rng: 纯粒子表现
      if (this.hp <= 0) { this.die(st.poisonBuildSource||{}); return true; }
    }
    if (tickAsh(this, dt, 1.3 + (this.def.scale || 1) * .4)) return true;
    if(st.slow>0){st.slow=Math.max(0,st.slow-dt);if(st.slow<=0)st.slowStrength=0;}
    if (st.freeze > 0) st.freeze = Math.max(0,st.freeze-dt);

    return !this.alive;
  }

  // ---------------- 主循环 ----------------
  update(dt, world) {
    if (!this.alive) return;
    if (!this.dummy) resolveEnemyMovement(this, world);
    if ((world.experiment||world.actorCount>1&&[...world.actors.values()].some(a=>!!a.experiment))&&this.combatStunT > 0) {
      const frozen = Math.min(dt, this.combatStunT);
      this.combatStunT = Math.max(0, this.combatStunT - frozen);
      this.stunT = Math.max(0, this.stunT - frozen);
      dt -= frozen;
      if (dt <= 1e-9) return;
    }
    // 训练区木桩：站着不动、不攻击、不索敌，只负责挨打与受击反馈
    // （复用整条战斗链路 —— 命中判定 / 伤害数字 / 特效全都是真的）
    if (this.dummy) {
      this.animT += dt;
      this.hitFlash = Math.max(0, this.hitFlash - dt * 4);
      this.animate(dt, 0);
      // 训练用**射击靶**：不移动，但按节奏向玩家开火。
      // 存在的意义是让"需要敌弹才能练"的机制（Perfect Dodge / 静火 / 钟波偏转 / 钟域）可测（§42）。
      if (this.dummyFire) {
        this.fireT = (this.fireT || 0) - dt;
        const pl = world.actors?.size>1?selectPlayerTarget(this):world.player;
        if (this.fireT <= 0 && pl && pl.alive && !suppressesNewPlayerLocks(world)) {
          const dx = pl.x - this.x, dz = pl.z - this.z;
          const d = Math.hypot(dx, dz);
          if (d < 15 && d > 0.5) {
            this.fireT = 1.7;
            this.fireAt(dx / d, dz / d, world, { speed: 6.5, damage: 1, color: '#ff6a3a', scatter: 5, size: 0.26 });
            // 计数器：弹丸存活很短，靠"某时刻还活着几发"很难断言它开过火
            world._dummyShots = (world._dummyShots | 0) + 1;
          }
        }
      }
      return;
    }
    if (this.spawnT > 0) {
      this.spawnT -= dt;
      const k = 1 - Math.max(0, this.spawnT) / 0.45;
      this.group.scale.setScalar(0.2 + 0.8 * k);
      this.group.position.y = (1 - k) * 0.8;
      if (this.spawnT <= 0) this.group.scale.setScalar(this.def.scale || 1);
      return;
    }
    this.animT += dt;
    this.hitFlash = Math.max(0, this.hitFlash - dt * 3);
    this.stunT = Math.max(0, this.stunT - dt);
    this.contactCd = Math.max(0, this.contactCd - dt);
    // PASS B 停摆棱镜：缓速同样拉长「开火间隔」与「技能节奏」。
    // 移动走 speedMul，这里只补计时器，二者共同构成"动作/技能变慢"。
    const cadMul = this.status.slow > 0 ? 1 - (this.status.slowStrength ?? .5) : 1;
    this.fireT -= dt * cadMul;
    this.specialT += dt * cadMul;

    if(this.tickStatuses(dt))return;
    const st=this.status;

    const perceived=world.actors?.size>1?playerLockTarget(this):world.player;
    const player = perceived || {x:this.x,z:this.z,alive:false};
    const canLock = world.actors?.size>1?!!selectPlayerTarget(this,{retain:!['idle','recover'].includes(this.state)||this.burstLeft>0}):!suppressesNewPlayerLocks(world);
    const dx = player.x - this.x, dz = player.z - this.z;
    const dist = Math.hypot(dx, dz) || 0.001;
    // aimYaw already belongs to the actor snapshot (session.fields). Keep the
    // last visible direction across room sleep/save; no new perception cache.
    if (canLock) this.aimYaw = Math.atan2(dx, dz);
    const ux = canLock ? dx / dist : Math.sin(this.aimYaw);
    const uz = canLock ? dz / dist : Math.cos(this.aimYaw);
    this.face = { x: Math.sin(this.yaw), z: Math.cos(this.yaw) };

    let speedMul = this.speedMul;
    if (this.assetGroundSlow) speedMul *= 0.5;
    if(st.slow>0)speedMul*=1-(st.slowStrength??.5);
    if (st.freeze > 0) speedMul *= 0.0;
    if (this.stunT > 0) speedMul *= 0.15;
    if (this.game.timeScale < 1) speedMul *= this.game.timeScale;
    // Stop target-driven acceleration, while existing inertia/separation and
    // committed charge velocity still run through the normal physics below.
    if (!canLock) speedMul = 0;

    const pAlive = combatPlayers(world).length>0;
    switch (this.def.ai) {
      case 'shooter': this.aiShooter(dt, ux, uz, dist, speedMul, pAlive, canLock); break;
      case 'charger': this.aiCharger(dt, ux, uz, dist, speedMul, world, canLock); break;
      case 'bomber': this.aiBomber(dt, ux, uz, dist, speedMul, world, canLock); break;
      case 'turret': this.aiTurret(dt, ux, uz, dist, world, canLock); break;
      case 'caster': this.aiCaster(dt, ux, uz, dist, speedMul, world, canLock); break;
      case 'shield': this.aiShield(dt, ux, uz, dist, speedMul, canLock); break;
      case 'sniper': this.aiSniper(dt, ux, uz, dist, world, canLock); break;
      case 'drone': this.aiDrone(dt, ux, uz, dist, world, canLock); break;
      case 'swarm': this.aiSwarm(dt, ux, uz, dist, speedMul); break;
      case 'brute': this.aiBrute(dt, ux, uz, dist, speedMul, world, canLock); break;
      case 'blob': this.aiBlob(dt, ux, uz, dist, speedMul); break;
      case 'summoner': this.aiSummoner(dt, ux, uz, dist, speedMul, world, canLock); break;
      default: this.aiShooter(dt, ux, uz, dist, speedMul, pAlive, canLock);
    }

    // 面向
    if (player.alive && canLock) {
      const targetYaw = Math.atan2(dx, dz);
      let d = targetYaw - this.yaw;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      this.yaw += d * Math.min(1, dt * 7);
    }

    // 物理
    const beforeMove = { x: this.x, z: this.z };
    this.x += this.vx * dt;
    this.z += this.vz * dt;
    resolveEnemyMovement(this, world, beforeMove);
    const fr = Math.max(0, 1 - 9 * dt);
    this.vx *= fr; this.vz *= fr;
    this.separate(dt, world);

    // 接触伤害
    if (this.def.contact > 0 && this.contactCd <= 0) {
      let touched=false;
      for(const pl of combatPlayers(world)){
        const dx=pl.x-this.x,dz=pl.z-this.z,d2=Math.hypot(dx,dz);
        if(d2<this.radius+pl.radius+.2){touched=true;pl.takeDamage(this.def.contact,{source:'contact',attacker:this,dir:world.actors?.size>1?{x:-dx/(d2||1),z:-dz/(d2||1)}:{x:-ux,z:-uz}});}
      }
      if(touched)this.contactCd=1;
    }
    this.animate(dt, dist);
    this.group.position.set(this.x, this.group.position.y === 0 ? 0 : this.group.position.y, this.z);
    if (this.spawnT <= 0) this.group.position.y = (this.def.fly || this.def.model === 'floater' || this.def.model === 'drone') ? 0 : 0;
    // 朝向约定同玩家（见 player.animate）：模型正面为本地 +Z，yaw 即指向角度 ⇒ 直接赋值。
    this.group.rotation.y = this.yaw;
  }

  separate(dt, world) {
    const others = world.enemies;
    for (const o of others) {
      if (o === this || !o.alive) continue;
      const dx = this.x - o.x, dz = this.z - o.z;
      const d = Math.hypot(dx, dz);
      const minD = this.radius + o.radius;
      if (d < minD && d > 0.001) {
        const push = (minD - d) * 5.5;
        this.vx += (dx / d) * push * dt * 6;
        this.vz += (dz / d) * push * dt * 6;
      }
    }
  }

  // ---------------- AI ----------------
  fireAt(ux, uz, world, opts = {}) {
    if (!this.alive) return;
    const spread = ((opts.scatter ?? 0) * Math.PI / 180);
    const ang = Math.atan2(ux, uz) + (this.game.gr() - 0.5) * spread * 2;
    const p = world.player;
    world.projectiles.spawn({
      x: this.x + Math.sin(ang) * (this.radius + 0.3),
      y: opts.high ? 1.15 : 0.85,
      z: this.z + Math.cos(ang) * (this.radius + 0.3),
      dx: Math.sin(ang), dz: Math.cos(ang),
      speed: opts.speed ?? 12,
      // 难度档的伤害倍率在这里统一乘一次（敌人与 Boss 的所有弹幕都走 fireAt）
      damage: (opts.damage ?? 1) * ((this.game && this.game.mod_ && this.game.mod_.enemyDmgMul) || 1),
      life: opts.life ?? 3.4, color: opts.color || '#ff6a3a', team: TEAM.ENEMY,
      size: opts.size ?? 0.26, radius: 0.3, homing: opts.homing || 0,
      kind: opts.kind || 'orb', owner: this, explodeOnHit: false, knock: 0.6,
    });
  }

  telegraph(kind, colors) {
    if(this.game.notifyEnemyAttack)this.game.notifyEnemyAttack(this);else this.game.weaponAssets?.observeEnemyAttack?.(this);
    const c = colors || this.def.palette?.visor || '#ff6a3a';
    this.game.particles.ring(this.x, 0.35, this.z, c, 10, this.radius + 0.5, 3.0);
  }

  aiShooter(dt, ux, uz, dist, speedMul, pAlive, canLock = true) {
    const d = this.def;
    const want = d.keepDist || 8;
    let mv = 0;
    if (dist > want + 2) mv = 1;
    else if (dist < want - 2) mv = -1;
    const strafe = Math.sin(this.animT * 1.3) * 0.8;
    const sp = d.speed * speedMul;
    this.vx += (ux * mv - uz * strafe) * sp * dt * 5;
    this.vz += (uz * mv + ux * strafe) * sp * dt * 5;
    if (!pAlive) return;
    if (canLock && this.fireT <= 0.42 && this.fireT > 0.36) {
      this.telegraph('aim');
      if (this.game.experiment) this.state = 'aim';
    }
    if (this.fireT <= 0 && (canLock || this.state === 'aim')) {
      if (this.state === 'aim') this.state = 'idle';
      this.burstLeft = d.burst || 1;
      if(this.game.notifyEnemyAttack)this.game.notifyEnemyAttack(this);else this.game.weaponAssets?.observeEnemyAttack?.(this);
      this.burstT = 0;
      this.fireT = d.fireCd;
    }
    if (this.burstLeft > 0) {
      this.burstT -= dt;
      if (this.burstT <= 0) {
        this.burstT = d.burstGap || 0.12;
        this.burstLeft--;
        const spread = this.burstLeft === 0 ? 2 : 6;
        this.fireAt(ux, uz, this.game, { speed: 15, damage: d.projDamage || 1, color: this.def.palette?.visor || '#ff8a3a', scatter: spread, size: 0.24 });
        audio.gun('pistol', 0.5);
        this.muzzleFx();
      }
    }
  }

  aiCharger(dt, ux, uz, dist, speedMul, world, canLock = true) {
    const d = this.def;
    if (this.state === 'idle') {
      const sp = d.speed * speedMul;
      this.vx += ux * sp * dt * 5;
      this.vz += uz * sp * dt * 5;
      if (canLock && dist < 9 && this.fireT <= 0) {
        this.state = 'wind'; this.stateT = d.telegraph;
        this.telegraph('wind', '#ffcf3a');
        audio.gun('charge', 0.4);
      }
    } else if (this.state === 'wind') {
      this.stateT -= dt;
      this.vx *= 0.85; this.vz *= 0.85;
      this.lungeDir = { x: ux, z: uz };
      if (this.stateT <= 0) {
        this.state = 'charge'; this.stateT = d.chargeTime;
        audio.gun('rocket', 0.4);
        this.game.particles.ring(this.x, 0.3, this.z, '#ffcf3a', 16, this.radius + 0.4, 6);
      }
    } else if (this.state === 'charge') {
      this.stateT -= dt;
      this.vx = this.lungeDir.x * d.dashSpeed * (this.game.timeScale);
      this.vz = this.lungeDir.z * d.dashSpeed * (this.game.timeScale);
      if (Math.random() < 0.6) this.game.particles.sparkle(this.x, 0.5, this.z, '#ffcf3a', 1, 0.5);   // visual-rng: 纯粒子表现
      if (this.stateT <= 0) { this.state = 'recover'; this.stateT = 0.85; }
      // 撞墙眩晕
      if (world.pointBlocked(this.x + this.lungeDir.x * this.radius, this.z + this.lungeDir.z * this.radius, 0.1)) {
        this.state = 'recover'; this.stateT = 1.1; this.stunT = 1.1;
        this.game.particles.impact(this.x + this.lungeDir.x * 0.6, 0.8, this.z + this.lungeDir.z * 0.6, '#ffcf3a', 14, 1.4);
        this.game.shake(0.12);
      }
    } else {
      this.stateT -= dt;
      if (this.stateT <= 0) { this.state = 'idle'; this.fireT = d.chargeCd; }
    }
  }

  aiBomber(dt, ux, uz, dist, speedMul, world, canLock = true) {
    const d = this.def;
    if (this.state === 'idle') {
      const sp = d.speed * speedMul;
      this.vx += ux * sp * dt * 6;
      this.vz += uz * sp * dt * 6;
      if (canLock && dist < d.fuseRange) { this.state = 'fuse'; this.stateT = d.fuse;if(this.game.notifyEnemyAttack)this.game.notifyEnemyAttack(this);else this.game.weaponAssets?.observeEnemyAttack?.(this); audio.gun('charge', 0.5); }
    } else {
      this.stateT -= dt;
      this.vx *= 0.9; this.vz *= 0.9;
      const blink = Math.sin(this.animT * 32) > 0;
      this.group.visible = true;
      this.group.scale.setScalar((this.def.scale || 1) * (1 + (blink ? 0.18 : 0)));
      if (this.stateT <= 0) {
        world.explode(this.x, 0.6, this.z, d.blastRadius, d.blastDamage, TEAM.ENEMY, this, null);
        this.group.scale.setScalar(this.def.scale || 1);
        this.die({suicide:true,ownerPlayerId:null,sourceEntityId:this.id,source:'suicide'});
      }
    }
  }

  aiTurret(dt, ux, uz, dist, world, canLock = true) {
    const d = this.def;
    if (!combatPlayers(world).length) return;
    if (canLock && dist > (d.range || 20)) return;
    if (canLock && this.fireT <= 0.35 && this.fireT > 0.30) {
      this.telegraph('aim');
      if (this.game.experiment) this.state = 'aim';
    }
    if (this.fireT <= 0 && (canLock || this.state === 'aim')) {
      if (this.state === 'aim') this.state = 'idle';
      this.burstLeft = d.burst || 1; this.burstT = 0; this.fireT = d.fireCd;
    }
    if (this.burstLeft > 0) {
      this.burstT -= dt;
      if (this.burstT <= 0) {
        this.burstT = d.burstGap || 0.09;
        this.burstLeft--;
        this.fireAt(ux, uz, world, { speed: d.projSpeed || 17, damage: d.projDamage || 1, color: d.projColor || '#ff6a3a', scatter: d.spread || 6, size: 0.24 });
        audio.gun('smg', 0.45);
        this.muzzleFx();
      }
    }
  }

  aiCaster(dt, ux, uz, dist, speedMul, world, canLock = true) {
    const d = this.def;
    const want = 11;
    const mv = dist > want + 2 ? 1 : (dist < want - 2 ? -1 : 0);
    const sp = d.speed * speedMul;
    this.vx += (ux * mv) * sp * dt * 4;
    this.vz += (uz * mv) * sp * dt * 4;
    this.vx += -uz * Math.sin(this.animT * 0.9) * sp * dt * 2;
    this.vz += ux * Math.sin(this.animT * 0.9) * sp * dt * 2;
    if (!combatPlayers(world).length) return;
    if (canLock && this.fireT <= 0.45 && this.fireT > 0.38) {
      this.telegraph('aim', d.projColor);
      if (this.game.experiment) this.state = 'aim';
    }
    if (this.fireT <= 0 && (canLock || this.state === 'aim')) {
      if (this.state === 'aim') this.state = 'idle';
      this.burstLeft = d.burst || 3; this.burstT = 0; this.fireT = d.fireCd;
    }
    if (this.burstLeft > 0) {
      this.burstT -= dt;
      if (this.burstT <= 0) {
        this.burstT = d.burstGap || 0.15;
        this.burstLeft--;
        this.fireAt(ux, uz, world, {
          speed: d.projSpeed || 10, damage: d.projDamage || 1, color: d.projColor || '#c07af0',
          scatter: d.scatter || 14, homing: d.homing || 0, size: 0.28, life: 4.2, high: true,
        });
        audio.gun('orb', 0.5);
        this.muzzleFx();
      }
    }
    if (canLock && d.teleport && this.specialT > d.teleport && dist < 7) {
      this.specialT = 0;
      this.game.particles.ring(this.x, 0.6, this.z, d.projColor || '#c07af0', 18, 0.8, 5);
      // 瞬移落点会影响战斗走向 → 属于 gameplay 随机，必须走 seeded RNG（任务书 §1.3）。
      const a = this.game.gr() * Math.PI * 2;
      const nx = this.x + Math.cos(a) * 9, nz = this.z + Math.sin(a) * 9;
      const pos = world.clampToRoom(nx, nz, this.radius + 0.6);
      this.x = pos.x; this.z = pos.z;
      this.game.particles.ring(this.x, 0.6, this.z, d.projColor || '#c07af0', 18, 0.8, 5);
      audio.teleport();
    }
  }

  aiShield(dt, ux, uz, dist, speedMul, canLock = true) {
    const sp = this.def.speed * speedMul;
    this.vx += ux * sp * dt * 4;
    this.vz += uz * sp * dt * 4;
    if (canLock && this.fireT <= 0 && dist < (this.def.range || 14)) {
      if(this.game.notifyEnemyAttack)this.game.notifyEnemyAttack(this);else this.game.weaponAssets?.observeEnemyAttack?.(this);
      this.burstLeft = this.def.burst || 2; this.burstT = 0; this.fireT = this.def.fireCd;
    }
    if (this.burstLeft > 0) {
      this.burstT -= dt;
      if (this.burstT <= 0) {
        this.burstT = this.def.burstGap || 0.2; this.burstLeft--;
        this.fireAt(ux, uz, this.game, { speed: this.def.projSpeed || 14, damage: 1, color: this.def.projColor, scatter: 5 });
        this.muzzleFx();
      }
    }
  }

  aiSniper(dt, ux, uz, dist, world, canLock = true) {
    const d = this.def;
    if (this.state === 'idle') {
      this.vx *= 0.9; this.vz *= 0.9;
      if (canLock && this.fireT <= 0) { this.state = 'aim'; this.stateT = d.aimTime; if(this.game.notifyEnemyAttack)this.game.notifyEnemyAttack(this);else this.game.weaponAssets?.observeEnemyAttack?.(this);this.laser = true; audio.gun('charge', 0.35); }
    } else {
      this.stateT -= dt;
      this.lockDir = { x: ux, z: uz };
      if (this.stateT <= 0) {
        this.state = 'idle'; this.laser = false;
        this.fireT = d.fireCd;
        this.fireAt(ux, uz, world, { speed: d.projSpeed || 40, damage: d.projDamage || 1, color: d.projColor, size: 0.22, life: 3 });
        audio.gun('sniper', 0.6);
        this.muzzleFx();
        this.game.particles.beam(this.x, 1.0, this.z, ux, uz, d.projColor || '#ff5a3a', 8, 8);
      }
    }
  }

  aiDrone(dt, ux, uz, dist, world, canLock = true) {
    const d = this.def;
    const want = 9;
    const mv = dist > want + 2 ? 1 : (dist < want - 2 ? -1 : 0);
    const sp = canLock ? d.speed * (this.game.timeScale) : 0;
    this.vx += (ux * mv - uz * 0.9) * sp * dt * 5;
    this.vz += (uz * mv + ux * 0.9) * sp * dt * 5;
    if (this.burstLeft > 0) {
      this.burstT -= dt;
      if (this.burstT <= 0) {
        this.burstT = d.burstGap || 0.09; this.burstLeft--;
        this.fireAt(ux, uz, world, { speed: d.projSpeed || 20, damage: 1, color: d.projColor, scatter: 6, size: 0.2 });
        audio.gun('energy', 0.4);
        this.muzzleFx();
      }
    } else if (canLock && this.fireT <= 0 && dist < (d.range || 22)) {
      this.fireT = d.fireCd; this.burstLeft = d.burst || 4; this.burstT = 0.25;
      this.telegraph('aim', d.projColor);
    }
  }

  aiSwarm(dt, ux, uz, dist, speedMul) {
    const sp = this.def.speed * speedMul * 1.15;
    const wob = Math.sin(this.animT * 6) * 0.45;
    this.vx += (ux - uz * wob) * sp * dt * 6;
    this.vz += (uz + ux * wob) * sp * dt * 6;
  }

  aiBrute(dt, ux, uz, dist, speedMul, world, canLock = true) {
    const d = this.def;
    if (this.state === 'idle') {
      const sp = d.speed * speedMul;
      this.vx += ux * sp * dt * 4;
      this.vz += uz * sp * dt * 4;
      if (canLock && dist < 5.5 && this.fireT <= 0) { this.state = 'wind'; this.stateT = d.telegraph; this.telegraph('wind', '#ff6a20'); audio.gun('charge', 0.5); }
    } else if (this.state === 'wind') {
      this.stateT -= dt;
      this.vx *= 0.86; this.vz *= 0.86;
      if (this.stateT <= 0) {
        this.state = 'slam'; this.stateT = 0.3;
        world.explode(this.x + ux * 2.0, 0.3, this.z + uz * 2.0, d.slamRadius, d.slamDamage, TEAM.ENEMY, this, null);
        audio.explosion(1.1);
        this.game.shake(0.3);
        this.fireT = d.slamCd;
      }
    } else {
      this.stateT -= dt;
      if (this.stateT <= 0) this.state = 'idle';
    }
  }

  aiBlob(dt, ux, uz, dist, speedMul) {
    const sp = this.def.speed * speedMul;
    this.hopT = (this.hopT || 0) + dt;
    const hop = Math.max(0, Math.sin(this.hopT * 3.4));
    this.vx += ux * sp * dt * 7 * hop * 2.0;
    this.vz += uz * sp * dt * 7 * hop * 2.0;
    this.hopAmt = hop;
  }

  aiSummoner(dt, ux, uz, dist, speedMul, world, canLock = true) {
    const d = this.def;
    const want = 12;
    const mv = dist > want + 3 ? 1 : (dist < want - 3 ? -1 : 0);
    const sp = d.speed * speedMul;
    this.vx += (ux * mv) * sp * dt * 4;
    this.vz += (uz * mv) * sp * dt * 4;
    if (canLock && this.fireT <= 0.5 && this.fireT > 0.4) {
      this.telegraph('aim', d.projColor);
      if (this.game.experiment) this.state = 'aim';
    }
    if (this.fireT <= 0 && (canLock || this.state === 'aim')) {
      if (this.state === 'aim') this.state = 'idle';
      this.burstLeft = d.burst || 3; this.burstT = 0; this.fireT = d.fireCd;
    }
    if (this.burstLeft > 0) {
      this.burstT -= dt;
      if (this.burstT <= 0) {
        this.burstT = d.burstGap || 0.16; this.burstLeft--;
        this.fireAt(ux, uz, world, { speed: d.projSpeed || 10, damage: 1, color: d.projColor, scatter: 18, homing: d.homing || 2, size: 0.3, high: true });
        audio.gun('orb', 0.5);
        this.muzzleFx();
      }
    }
    if (this.specialT > (d.summonCd || 6)) {
      this.specialT = 0;
      const n = d.summonCount || 3;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        world.spawnEnemy(d.summonKind, this.x + Math.cos(a) * 2.4, this.z + Math.sin(a) * 2.4);
      }
      this.game.particles.ring(this.x, 0.6, this.z, '#8a3cff', 26, 1.0, 6);
      audio.teleport();
      this.game.shake(0.14);
    }
    if (canLock && d.teleport && this.specialT > 0.6 && this.specialT < 0.75 && dist < 7) {
      // 瞬移落点会影响战斗走向 → 属于 gameplay 随机，必须走 seeded RNG（任务书 §1.3）。
      const a = this.game.gr() * Math.PI * 2;
      const pos = world.clampToRoom(this.x + Math.cos(a) * 10, this.z + Math.sin(a) * 10, this.radius + 0.6);
      this.x = pos.x; this.z = pos.z;
      this.game.particles.ring(this.x, 0.6, this.z, '#8a3cff', 18, 0.8, 5);
      this.specialT = 0.9;
      audio.teleport();
    }
  }

  muzzleFx() {
    if (this.rig.weaponMount) {
      if (!this._wp) this._wp = new THREE.Vector3();
      const wp = this._wp;               // 复用：每次开火都新建 Vector3 会持续制造 GC 压力
      const mz = this.gunModel?.userData?.muzzle || this.rig.weaponMount;
      mz.getWorldPosition(wp);
      this.game.particles.muzzle(wp.x, wp.y, wp.z, Math.sin(this.yaw), Math.cos(this.yaw), this.def.projColor || '#ff8a3a', 0.8);
      this.game.flashSmall(wp.x, wp.y, wp.z, this.def.projColor || '#ff8a3a', 6, 0.06);
    }
  }

  animate(dt, dist) {
    const rig = this.rig;
    const moving = Math.hypot(this.vx, this.vz) > 0.4;
    const spd = Math.min(1, Math.hypot(this.vx, this.vz) / 4);
    switch (this.def.model) {
      case 'humanoid': {
        rig.group.position.y = 0;
        walkHumanoid(rig, this.animT * (moving ? 9 : 3), moving ? spd : 0.12, spd);
        if (rig.armR) {
          rig.armR.sh.rotation.x = -Math.PI / 2 + 0.05;
          rig.armR.sh.rotation.z = -0.2;
          rig.armR.el.rotation.x = 0.15;
        }
        if (this.state === 'wind') rig.body.rotation.x = -0.3;
        else if (this.state === 'slam') rig.body.rotation.x = 0.5;
        else rig.body.rotation.x *= 0.85;
        if (this.laser) rig.head.rotation.x = -0.1;
        // 破盾演出：盾牌脱手掉落并消失
        if (rig.shield) {
          if (this.shieldDropT > 0) {
            this.shieldDropT -= dt;
            const k = 1 - Math.max(0, this.shieldDropT) / 0.9;
            rig.shield.rotation.z = -k * 2.5;
            rig.shield.position.y = -0.20 - k * 1.5;
            rig.shield.position.z = 0.22 + k * 0.5;
            if (this.shieldDropT <= 0) rig.shield.visible = false;
          }
          if (this.shieldFlash > 0) {
            this.shieldFlash = Math.max(0, this.shieldFlash - dt * 5);
            rig.shield.scale.setScalar(1 + this.shieldFlash * 0.10);
          }
        }
        break;
      }
      case 'quadruped': {
        rig.group.position.y = 0;
        const ph = this.animT * (this.state === 'charge' ? 22 : 9);
        rig.body.position.y = 0.86 + Math.abs(Math.sin(ph)) * 0.09;
        for (let i = 0; i < rig.legs.length; i++) {
          rig.legs[i].hip.rotation.x = Math.sin(ph + i * 1.6) * 0.7 * (moving || this.state === 'charge' ? 1 : 0.25);
        }
        rig.head.rotation.x = this.state === 'wind' ? 0.35 : Math.sin(this.animT * 3) * 0.05;
        rig.tail.rotation.y = Math.sin(this.animT * 4) * 0.35;
        break;
      }
      case 'floater': {
        rig.group.position.y = 0;
        rig.body.position.y = (this.def.palette?.hover || 1.55) + Math.sin(this.animT * 2.2) * 0.16;
        rig.body.rotation.y = Math.sin(this.animT * 1.1) * 0.16;
        rig.tentacles.forEach((t, i) => {
          t.seg.rotation.x = Math.sin(this.animT * 2.6 + i) * 0.28;
          t.s2.rotation.x = Math.sin(this.animT * 3.1 + i * 0.8) * 0.36;
        });
        const pulse = 1 + Math.sin(this.animT * (this.fireT < 0.5 ? 14 : 3)) * 0.06;
        rig.body.scale.setScalar((this.def.scale || 1) * pulse);
        if (rig.rings) rig.rings.forEach((r, i) => { r.rotation.z += dt * (0.6 + i * 0.25); r.rotation.y += dt * 0.35; });
        if (rig.orbs) rig.orbs.forEach((o) => {
          o.a += dt * 1.35;
          o.mesh.position.set(Math.cos(o.a) * o.r, o.y + Math.sin(this.animT * 2 + o.a) * 0.12, Math.sin(o.a) * o.r);
          o.mesh.rotation.set(o.a, o.a * 0.7, 0);
        });
        break;
      }
      case 'bug': {
        rig.group.position.y = 0;
        if (this.def.fly) {
          rig.body.position.y = 1.15 + Math.sin(this.animT * 7) * 0.14;
          rig.wings?.forEach((w, i) => { w.rotation.y = Math.sin(this.animT * 55 + i * 3) * 0.7; });
        } else {
          rig.body.position.y = 0.62 + Math.abs(Math.sin(this.animT * 8)) * 0.06;
          rig.legs.forEach((l, i) => { l.hip.rotation.x = Math.sin(this.animT * 14 + i) * 0.55; });
        }
        if (this.state === 'fuse' && rig.core && rig.core.material) {
          rig.core.material.emissiveIntensity = 2 + Math.abs(Math.sin(this.animT * 26)) * 4;
        }
        break;
      }
      case 'turret': {
        // 炮塔的 `this.yaw` 已经平滑地跟随玩家（见 update 的面向段），而 group.rotation.y 就等于它，
        // 因此炮塔头部只需保持本地 0 即可让炮管（本地 +Z）指向玩家。
        // 旧写法先算了一个含 (group.rotation.y - π) 的角度、紧接着又赋 0 —— 前者是死代码，
        // 而且它是按错误的 +π 朝向约定写出来的。
        rig.turret.rotation.y = 0;
        break;
      }
      case 'drone': {
        rig.group.position.y = 0;
        rig.body.position.y = 1.55 + Math.sin(this.animT * 3.4) * 0.10;
        rig.rotors.forEach((r) => { r.blades.rotation.y += dt * 34; });
        rig.body.rotation.z = Math.sin(this.animT * 2.2) * 0.06;
        break;
      }
      case 'blob': {
        rig.group.position.y = 0;
        const hop = this.hopAmt || 0;
        rig.body.position.y = 0.5 + hop * 0.42;
        const sq = 1 + (1 - hop) * 0.18;
        rig.body.scale.set(1 + (1 - sq) * 0.4, sq, 1 + (1 - sq) * 0.4);
        break;
      }
    }
    // 受击闪白
    if (this.hitFlash > 0.02) {
      this.group.traverse((o) => {
        // 精英轮廓层用的是**共享**材质：闪白若走到这里会 clone 出一份新材质
        // （每受击一次一份 ⇒ 材质缓存无界增长），而且因为共享，所有精英会一起变白。
        if (o.userData.aura) return;
        if (o.isMesh && o.material && o.material.color) {
          if (!o.userData._hitMat) {
            o.userData._hitMat = o.material;
            o.material = o.material.clone();
          }
          o.material.emissive = new THREE.Color('#ffffff');
          o.material.emissiveIntensity = this.hitFlash * 0.75;
        }
      });
    } else if (this.hitFlash === 0) {
      this.group.traverse((o) => {
        if (o.userData.aura) return;
        if (o.isMesh && o.userData._hitMat) {
          o.material.dispose?.();
          o.material = o.userData._hitMat;
          delete o.userData._hitMat;
        }
      });
    }
  }
}
