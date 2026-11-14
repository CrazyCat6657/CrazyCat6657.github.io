import {emberHitContext} from './hero_p2.js';
import {combatPlayers} from '../experimental/consumables/visibility.js';
// ============================================================
//  弹幕系统 —— 子弹池 / 命中判定 / 穿透 / 弹跳 / 追踪 / 爆炸 / 电弧 / 光束
// ============================================================
import {captureDamageContext, damageSource, emitDamageEvent, resolveDamageActor} from './damage_context.js';
import * as THREE from '../../vendor/three.module.js';
import { teamSafeColor } from './team_colors.js';
import { BULLET, TEAM } from '../core/constants.js';
import { correctionTargetAllowed, validCorrectionIdentity } from './tracking.js';
import { EnemyProjectileOutline } from '../fx/enemy_projectile_outline.js';

const BULLET_GEO = {
  bolt: new THREE.OctahedronGeometry(1, 0),
  orb: new THREE.IcosahedronGeometry(1, 0),
  spike: new THREE.ConeGeometry(0.55, 2.0, 4),
};

const matCache = new Map();
function bulletMat(color) {
  if (matCache.has(color)) return matCache.get(color);
  const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(color), toneMapped: false });
  matCache.set(color, m);
  return m;
}

export class Projectiles {
  constructor(scene, max = 460) {
    this.scene = scene;
    this.max = max;
    this.head = 0;
    this.pool = [];
    this.active = [];
    this.geo = BULLET_GEO;
    for (let i = 0; i < max; i++) {
      const mesh = new THREE.Mesh(BULLET_GEO.bolt, matCache.get('#ffffff') || bulletMat('#ffffff'));
      mesh.visible = false;
      mesh.frustumCulled = false;
      scene.add(mesh);
      this.pool.push({
        mesh, alive: false,
        x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0,
        dx: 0, dz: 0, speed: 0, damage: 0, life: 0, maxLife: 1,
        pierce: 0, bounce: 0, explosive: 0, homing: 0, radius: 0.28, size: 0.2,
        team: 0, crit: false, statuses: null, chain: 0, chainRange: 0, hitSet: null,
        arc: false, gravity: 0, spin: 0, ownerRef: null, kind: 'bolt', blastRadius: 0,
        speedRetain: 1, noSlow: false, wave: 0, playerShot: false,
      });
    }
    // 光束池（激光 / 电弧视觉）
    this.beams = [];
    for (let i = 0; i < 24; i++) {
      const g = new THREE.CylinderGeometry(0.06, 0.06, 1, 6, 1, true);
      g.translate(0, 0.5, 0);
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, toneMapped: false, blending: THREE.AdditiveBlending, depthWrite: false }));
      m.visible = false; m.frustumCulled = false;
      this.scene.add(m);
      this.beams.push({ mesh: m, life: 0, maxLife: 0.1 });
    }
    this.beamHead = 0;
    this.tmp = new THREE.Vector3();
    this.enemyOutline = new EnemyProjectileOutline(scene, BULLET_GEO, max);
  }

  reset() {
    for (const b of this.pool) { b.alive = false; b.mesh.visible = false; }
    for (const b of this.beams) { b.life = 0; b.mesh.visible = false; }
    this.active.length = 0;
    this.enemyOutline.clear();
  }

  syncVisuals() { this.enemyOutline.sync(this.pool); }

  spawn(o) {
    if(this.game?.weaponAssets && this.pool.filter(b=>b.alive).length+(this.game.weaponMetrics?this.game.weaponMetrics().entities.filter(e=>e.kind==='projectile'&&!e.ended).length:(this.game.weaponAssets.projectileCount?.()||0))>=this.pool.length)return null;
    if (!o || !validCorrectionIdentity(o.correctionOnly) || !['x','z','dx','dz'].every(k => Number.isFinite(o[k])) ||
        ['y','speed','damage','life','vy','radius','size','pierce','bounce','homing','explosive','gravity'].some(k => o[k] !== undefined && !Number.isFinite(o[k]))) return null;
    if(o.team===TEAM.ENEMY&&!Object.hasOwn(o,'ownerPlayerId')&&!o.damageContext)o={...o,ownerPlayerId:null};
    const actor=resolveDamageActor(this.game||o.owner?.game||{},o,{initiating:true});
    if(actor){const hit=emberHitContext(actor.view,{team:TEAM.ENEMY},o.damage??4,{...o,...o.feedbackContext,source:o.source||'bullet'});o={...o,...hit.opts,damage:hit.damage};}
    // 挑战词条「急钟」：己方子弹 +10%、敌方子弹 +25%。
    // 放在这里而不是逐个发射点，是因为敌弹有敌人/Boss/召唤物/技能四条来源，
    // 逐个改必然漏。阵营判据只有一处，改一处即可。
    if (o && o.speed !== undefined && this.game) {
      const m = this.game.mod_ || {};
      // 注意 TEAM.PLAYER = 0 / TEAM.ENEMY = 1（constants.js）——写反会让
      // 「急钟」把增益发给敌人。这里用常量比较，不写数字字面量。
      const k = (o.team === TEAM.PLAYER) ? (m.bulletSpeed || 1) : (m.enemyBulletSpeed || 1);
      if (k !== 1) o.speed *= k;
    }
    let b = null;
    for (let i = 0; i < this.pool.length; i++) {
      const cand = this.pool[(this.head = (this.head + 1) % this.pool.length)];
      if (!cand.alive) { b = cand; break; }
    }
    if (!b) return null;
    b.alive = true;
    b.x = o.x; b.y = o.y ?? 0.85; b.z = o.z;
    const dx = o.dx, dz = o.dz;
    const len = Math.hypot(dx, dz) || 1;
    b.dx = dx / len; b.dz = dz / len;
    b.speed = o.speed ?? 30;
    b.vx = b.dx * b.speed; b.vz = b.dz * b.speed;
    b.vy = o.vy ?? 0;
    b.damage = o.damage ?? 4;
    b.life = b.maxLife = o.life ?? 2;
    b.pierce = o.pierce ?? 0;
    b.bounce = o.bounce ?? 0;
    // 回响师的「回响弹」标记必须被复制到弹丸上 ——
    // 否则"首次反弹不衰减且略增伤害"这一整段永远不会生效（断言抓到过）。
    b.resonant = !!o.resonant;
    b.bounceCount = 0;
    b.explosive = o.explosive ?? 0;
    b.blastRadius = o.blastRadius ?? (b.explosive > 0 ? 3.2 : 0);
    b.homing = o.homing ?? 0;
    b.correctionOnly = o.correctionOnly;
    b.radius = o.radius ?? BULLET.radius;
    b.size = o.size ?? 0.2;
    b.team = o.team ?? TEAM.PLAYER;
    b.crit = !!o.crit;
    b.statuses = o.statuses || null;
    b.chain = o.chain ?? 0;
    b.buildContext=o.buildContext||null;b.intrinsicStatuses=o.intrinsicStatuses||null;b.arcCore=!!o.arcCore;
    b.chainRange = o.chainRange ?? 6;
    b.hitSet = (b.pierce > 0 || b.chain > 0) ? new Set() : null;
    b.arc = !!o.arc;
    b.gravity = o.gravity ?? (b.arc ? 22 : 0);
    b.spin = o.spin ?? 0;
    b.ownerRef = o.owner || null;
    b.pdPlayerIds=Array.isArray(o.pdPlayerIds)?o.pdPlayerIds.slice():o._pd?[this.game?.player?.id||'player']:[];
    b.damageContext=captureDamageContext(this.game||o.owner?.game||{},{...o.damageContext,...o,...o.feedbackContext});
    b.buildContext=b.damageContext.buildContext||null;
    b.sourceInstanceId = o.sourceInstanceId || null;
    // A historical in-flight pellet has no known paid-shot identity. Preserve
    // that absence so old saves aggregate by source, rather than inventing a
    // different root for each pellet restored through spawn().
    b.rootShotId = o.rootShotId || null;
    b.echoBaseDamage = o.echoBaseDamage || null;
    b.c2DamageApplied = o.c2DamageApplied;
    b.feedbackContext = o.feedbackContext || null;
    b.kind = o.kind || (o.arc ? 'orb' : 'bolt');
    b.speedRetain = o.speedRetain ?? 1;
    b.noSlow = !!o.noSlow;
    b.playerShot = b.team === TEAM.PLAYER;
    b.knock = o.knock ?? 1;

    const mesh = b.mesh;
    mesh.geometry = BULLET_GEO[b.kind] || BULLET_GEO.bolt;
    // 阵营配色契约（PASS3 §31）：**这是全项目唯一的出弹口**，
    // 在这里按 team 归一化，保证敌我子弹在任何楼层、任何内容下都不可能同色。
    // 已合法的颜色原样返回（绝大多数内容外观不变），只有落在对面色带的才会被贴边。
    mesh.material = bulletMat(teamSafeColor(o.color || '#ffe08a', b.team, { isPlayer: b.team === TEAM.PLAYER }));
    mesh.visible = true;
    if (b.kind === 'spike') { mesh.scale.set(b.size * 1.1, b.size * 2.4, b.size * 1.1); mesh.rotation.set(Math.PI / 2, 0, 0); mesh.rotation.y = Math.atan2(b.dx, b.dz); }
    else { mesh.scale.setScalar(b.size * (b.kind === 'orb' ? 1.15 : 1.0)); }
    this._place(b);
    return b;
  }

  _place(b) {
    const m = b.mesh;
    m.position.set(b.x, b.y, b.z);
    if (b.kind === 'bolt') {
      m.rotation.y = Math.atan2(b.dx, b.dz);
      m.rotation.z += b.spin * 0.02;
      m.scale.set(b.size * (b.arc ? 0.9 : 0.72), b.size * (b.arc ? 1.6 : 2.3), b.size * (b.arc ? 0.9 : 0.72));
    } else if (b.kind === 'orb' || b.kind === 'spike') {
      m.rotation.y = Math.atan2(b.dx, b.dz);
      m.rotation.x += b.spin ? 0.25 : 0;
      m.rotation.z += b.spin ? 0.2 : 0;
    }
  }

  // 光束：从 (x,y,z) 沿方向射出的瞬时判定线段
  fireBeam(x, y, z, dx, dz, opt, world) {
    if(!this.beamAvailable())return false;
    opt={...opt,...captureDamageContext(world,opt)};
    const rootShotId = opt.rootShotId || world.createDamageRootId?.() || null;
    const len0 = Math.hypot(dx, dz) || 1;
    const ux = dx / len0, uz = dz / len0;
    let len = opt.range ?? 40;
    // 被墙挡住
    const hitWall = this._rayCollideWall(x, z, ux, uz, len, world, y);
    if (hitWall < len) len = hitWall;
    const prop = world.propsBlocking ? world.propHit(x + ux * len, z + uz * len, .2, y) : null;
    if (prop) world.onPropHit(prop, opt.damage, x + ux * len, y, z + uz * len, null);
    // 命中所有敌人（贯穿）
    const hits = [];
    for (const e of world.hitboxes) {
      if (!e.alive || e.team === TEAM.PLAYER) continue;
      const rx = e.x - x, rz = e.z - z;
      const t = rx * ux + rz * uz;
      if (t < 0 || t > len) continue;
      const px = x + ux * t, pz = z + uz * t;
      const d = Math.hypot(e.x - px, e.z - pz);
      if (d <= (e.r ?? e.radius ?? 0.5) + (opt.width ?? 0.5)) hits.push(e);
    }
    for (const e of hits) world.onDamage(e, opt.damage, { ...damageSource(opt),crit: opt.crit, dir: { x: ux, z: uz }, statuses: opt.statuses, knock: opt.knock, source: 'beam', sourceInstanceId:opt.sourceInstanceId,rootShotId,buildContext:opt.buildContext,echoBaseDamage:opt.echoBaseDamage,c2DamageApplied:opt.c2DamageApplied });
    this._addBeam(x, y, z, ux, uz, len, teamSafeColor(opt.color || '#3ad2ff', opt.team ?? TEAM.PLAYER, { isPlayer: (opt.team ?? TEAM.PLAYER) === TEAM.PLAYER }), opt.width ?? 0.16, opt.life ?? 0.10);
    return { len, hits: hits.length };
  }

  beamAvailable() {
    if(this.game?.weaponAssets?.lineAdmission)return this.game.weaponAssets.lineAdmission();
    return this.beams.filter(b=>b.life>0).length+(this.game?.weaponAssets?.lineCount?.()||0)<this.beams.length;
  }

  _addBeam(x, y, z, ux, uz, len, color, w, life) {
    if(!this.beamAvailable())return false;
    const b = this.beams[this.beamHead];
    this.beamHead = (this.beamHead + 1) % this.beams.length;
    b.mesh.visible = true;
    b.mesh.material.color.set(color);
    b.mesh.material.opacity = 0.95;
    b.mesh.scale.set(w / 0.06, len, w / 0.06);
    b.mesh.position.set(x, y, z);
    b.mesh.quaternion.setFromUnitVectors(this.tmp.set(0, 1, 0), this.tmp.clone().set(ux, 0, uz).normalize());
    b.life = b.maxLife = life;
  }

  _rayCollideWall(x, z, ux, uz, maxLen, world, y = 1.0) {
    let best = maxLen;
    const step = 0.45;
    for (let t = 0; t < maxLen; t += step) {
      const px = x + ux * t, pz = z + uz * t;
      if (world.pointBlocked(px, pz, 0.2, y)) { best = t; break; }
    }
    return best;
  }

  update(dt, world) {
    // 光束寿命
    for (const b of this.beams) {
      if (b.life <= 0) continue;
      b.life -= dt;
      b.mesh.material.opacity = 0.95 * Math.max(0, b.life / b.maxLife);
      if (b.life <= 0) b.mesh.visible = false;
    }

    const colliders = world.colliders;
    for (let i = 0; i < this.pool.length; i++) {
      const b = this.pool[i];
      if (!b.alive) continue;
      // 玩家弹按真实时间；敌弹走**独立**的 enemyBulletTimeScale 通道（§10.3），
      // 缺省回退到 enemyTimeScale 以保持旧行为。
      const bdt = (b.team === 0 ? dt : dt * (world.enemyBulletTimeScale ?? world.enemyTimeScale ?? 1));

      // 子步进：限制单步位移，避免低帧率 / 高速弹丸穿模
      const dist = Math.hypot(b.vx, b.vz) * bdt;
      const steps = Math.max(1, Math.min(12, Math.ceil(dist / 0.4)));
      const sdt = bdt / steps;
      for (let s = 0; s < steps; s++) {
        if (!b.alive) break;
        this._step(b, sdt, world, colliders);
      }
      if (b.alive) this._place(b);
    }
  }

  // 单个子步：推进一枚子弹并处理全部碰撞
  _step(b, bdt, world, colliders) {
    b.life -= bdt;

    // 追踪
    if (b.homing > 0) {
      const tgt = world.findNearest(b.x, b.z, b.team === TEAM.PLAYER ? TEAM.ENEMY : TEAM.PLAYER, 14, b.ownerRef);
      if (tgt && correctionTargetAllowed(b, tgt)) {
        const ax = tgt.x - b.x, az = tgt.z - b.z;
        const al = Math.hypot(ax, az) || 1;
        const turn = b.homing * bdt;
        b.dx += (ax / al) * turn; b.dz += (az / al) * turn;
        const nl = Math.hypot(b.dx, b.dz) || 1;
        b.dx /= nl; b.dz /= nl;
        b.vx = b.dx * b.speed; b.vz = b.dz * b.speed;
      }
    }

    const px = b.x, pz = b.z;
    // 弧线弹（手雷）重力
    if (b.gravity > 0) {
      b.vy -= b.gravity * bdt;
      b.y += b.vy * bdt;
      if (b.y < 0.35 && b.vy < 0) { b.y = 0.35; b.vy = -b.vy * 0.42; if (Math.abs(b.vy) < 2) b.vy = 0; }
    }
    b.x += b.vx * bdt;
    b.z += b.vz * bdt;
    if((world.interceptNativeProjectile?world.interceptNativeProjectile(b):world.weaponAssets?.interceptNativeProjectile?.(b))) {b.alive=false;b.mesh.visible=false;return;}

    let dead = false;

    // 道具也会阻挡子弹，必须先给它伤害，不能先按普通墙结束弹丸。
    const prop = world.propsBlocking ? world.propHit(b.x, b.z, b.radius, b.y) : null;
    if (prop) {
      if (prop.hp !== undefined) world.onPropHit(prop, b.damage, b.x, b.y, b.z, b);
      if (b.bounce > 0) {
        b.bounce--;
        b.vx = -b.vx; b.vz = -b.vz; b.x = px; b.z = pz;
        const nl = Math.hypot(b.vx, b.vz) || 1;
        b.dx = b.vx / nl; b.dz = b.vz / nl;
        b.vx = b.dx * b.speed; b.vz = b.dz * b.speed;
      } else dead = true;
    }

    // 墙壁碰撞
    if (!prop && world.pointBlocked(b.x, b.z, b.radius * 0.6, b.y)) {
      // 尝试分轴滑动 / 反弹
      const blockedX = world.pointBlocked(b.x, pz, b.radius * 0.6, b.y);
      const blockedZ = world.pointBlocked(px, b.z, b.radius * 0.6, b.y);
      if (b.bounce > 0) {
        b.bounce--;
        if (blockedX && !blockedZ) { b.vx = -b.vx; b.x = px; }
        else if (blockedZ && !blockedX) { b.vz = -b.vz; b.z = pz; }
        else { b.vx = -b.vx; b.vz = -b.vz; b.x = px; b.z = pz; }
        const nl = Math.hypot(b.vx, b.vz) || 1;
        b.dx = b.vx / nl; b.dz = b.vz / nl;
        if (!b.noSlow) b.speed *= b.speedRetain;
        b.vx = b.dx * b.speed; b.vz = b.dz * b.speed;
        b._bounced = true;
        b.bounceCount = (b.bounceCount || 0) + 1;
        // 回响师：**第一次**反弹不衰减、并略增伤害（§12.2）。
        // 只作用于首次，避免"全程无脑射墙"。
        if (b.resonant && b.bounceCount === 1 && !b._bounceBonus) {
          b._bounceBonus = true;
          b.damage *= 1.18;
          b.noSlow = true;
        }
        world.onRicochet(b.x, b.y, b.z, b);
        if (world.emit) emitDamageEvent(world,'onProjectileBounce', { bullet: b, x: b.x, z: b.z },b.damageContext);
      } else {
        dead = true;
      }
    }

    // ---- Perfect Dodge（任务书 §7）----
    // 定义：玩家处于**翻滚无敌帧**期间，一发敌弹"本来会命中"（或贴脸经过）即为完美闪避。
    // 放在这里的原因：这是唯一的"弹丸 × 角色"判定点，四条发射来源都汇到此处，不会漏。
    // 约束：一发弹丸只触发一次（b._pd），且依赖翻滚窗口 ——
    // 站在持续危险里无法刷取（翻滚只有极短无敌帧）。
    if (!dead && !b.playerShot) {
      const players=combatPlayers(world);
      for(const pl of players)if(pl?.alive&&pl.dashTime>0&&!b.pdPlayerIds.includes(pl.id)){
        const dx=pl.x-b.x,dz=pl.z-b.z,near=(pl.r??pl.radius??.62)+b.radius+.34;
        if(dx*dx+dz*dz<=near*near){b._pd=true;b.pdPlayerIds.push(pl.id);if(world.emitActor)world.emitActor(pl.id,'onPerfectDodge',{bullet:b});else pl.game?.emit?.('onPerfectDodge',{bullet:b});}
      }
    }

    // 命中角色
    if (!dead) {
      const target = world.hitTest(b.x, b.z, b.radius, b.team, b.ownerRef, b.hitSet, b.y);
      if (target) {
        if (b.hitSet) b.hitSet.add(target.id);
        const buildApplied=world.onDamage(target, b.damage, { ...b.damageContext,crit: b.crit, dir: { x: b.dx, z: b.dz }, statuses: b.statuses, knock: b.knock, bullet: b, source: 'bullet', sourceInstanceId: b.sourceInstanceId, rootShotId: b.rootShotId,echoBaseDamage:b.echoBaseDamage,buildContext:b.buildContext,...(b.feedbackContext||{}) });
        // 电弧连锁
        let arc=0;
        if(b.arcCore&&buildApplied>0){
          const w=b.ownerRef?.weapons?.find(w=>w.assetInstanceId===b.sourceInstanceId),s=w?.buildArc;
          if(s&&!s.roots.includes(b.rootShotId)){
            if((world.time||0)-(s.hitAt??-10)>.6)s.streak=0;
            s.roots.push(b.rootShotId);if(s.roots.length>32)s.roots.shift();
            s.hitAt=world.time||0;s.pending=null;s.streak++;
            if(s.streak>=2){arc=1;s.streak=0;}
          }
        }
        if(b.chain>0||arc){
          let from = target;
          const used = new Set([target.id]);
          for (let c = 0; c < Math.min(2,b.chain+arc); c++) {
            const nx = world.findNearest(from.x, from.z, TEAM.ENEMY, b.chainRange, null, used);
            if (!nx) break;
            if(!this.beamAvailable())break;
            used.add(nx.id);
            this._addBeam(from.x, 0.9, from.z, nx.x - from.x, nx.z - from.z, Math.hypot(nx.x - from.x, nx.z - from.z), '#a0f0ff', 0.09, 0.12);
            world.onDamage(nx, b.damage * 0.72, {...b.damageContext,statuses:b.buildContext?.chainPoison?{poison:Math.max(2,b.statuses?.poison||0)}:b.intrinsicStatuses,assetSecondary:true,assetNoRefund:true,buildChain:true,buildContext:b.buildContext?{...b.buildContext,lifesteal:b.buildContext.relicLifesteal,secondary:true}:null,source:'chain', c2DamageApplied:b.c2DamageApplied, sourceInstanceId:b.sourceInstanceId, rootShotId:b.rootShotId, owner:b.ownerRef,...(b.feedbackContext||{}) });
            from = nx;
          }
        }
        if (world.emit && b.team === 0) {
          emitDamageEvent(world,'onProjectileHit', { bullet: b, target, bounced: !!b._bounced, bounceCount: b.bounceCount || 0 },b.damageContext);
        }
        // 「一弹双响」：同一发子弹反弹后连续击杀 2 个（回响师成就）
        if (b._bounced) {
          b._bounceKills = (b._bounceKills | 0) + 1;
          const actor=resolveDamageActor(world,b.damageContext||{}),view=actor?.view||(!world.actors?world:null);
          if(view)view._bounceDouble = Math.max(view._bounceDouble | 0, b._bounceKills);
        }
        if (b.pierce > 0) b.pierce--;
        else dead = true;
      }
    }

    if (b.life <= 0) dead = true;

    if (dead) {
      if (b.explosive > 0) {
        world.explode(b.x, b.y, b.z, b.blastRadius, b.explosive, b.team, b.ownerRef, b.intrinsicStatuses, {...b.damageContext,c2DamageApplied:b.c2DamageApplied,sourceInstanceId:b.sourceInstanceId,rootShotId:b.rootShotId,echoBaseDamage:b.echoBaseDamage,assetSecondary:true,primaryExplosion:true,assetNoRefund:true,buildContext:b.buildContext?{...b.buildContext,lifesteal:b.buildContext.relicLifesteal,secondary:true}:null,...(b.feedbackContext||{})});
      } else if (b.playerShot) {
        world.onBulletEnd(b.x, b.y, b.z, b);
      }
      b.alive = false;
      b.mesh.visible = false;
    }
  }

  countAlive() { let n = 0; for (const b of this.pool) if (b.alive) n++; return n; }
}
