import {validateDeploymentBudget} from './deployment_budget.js';
// ============================================================
//  版本 3 形态机制（Task 3 / C5+W4）
//
//  为什么单独一个模块：运行时 `WeaponAssetsRuntime` 把机制委托给
//  `precision / energy / mechanical` 三个模块，接口统一为
//  `track / input / prepare / paid / fire / projectile / entity / step /
//   beforeDamage / afterDamage / outcome`。
//  本模块是这条链上的第四个，按计划 Task 3 的接口约定：
//  「版本 3 独立 prepare/fire/update 实现」。
//
//  三条关键约定（与既有三个模块一致，改动前先确认）：
//  1. `prepare()` 返回 `{reject:true, reason}` ⇒ **整次动作被拒**，运行时在 `_pay` 之前
//     就返回 false ⇒ 零资源变化、零 RNG 变化（合同里反复要求的"原子拒绝"）。
//  2. `fire()` 返回 `true` ⇒ 本形态**整体接管**，运行时的通用发射循环不再执行。
//  3. `entity(e, dt)` 返回 `true` ⇒ 该实体本帧由本模块处理，运行时跳过通用推进。
//     本模块自有的实体一律带 `mechanic:'v3:<form>'`，不会与既有实体混淆。
//
//  ⚠ 必须按**每实例定义版本**分派（合同："旧 v1/v2 行为必须保留"）：
//    同一个 id 可能是 v2 存档里的旧实例，那必须继续走 v2 行为。
//    实测踩到过：weapon_assets_catalog 的夹具把 weaponAssetVersion 写死为 2，
//    若不做这道判断，v2 实例会被 v3 接管，既有断言立刻失败。
//
//  参数来源：`WEAPON_REVISIONS[id]`（武器设计师合同落成的数值原型）。
//  原弹匣/备弹/换弹上限保持不动 —— 本模块只读取，不覆写资源字段。
//
//  不做的事（合同明确禁止）：不新增装饰粒子/点光源（保持 17 点光与粒子池不变）、
//  不提高 420 投射物 / 24 光束 / 40 部署 / 24 区域硬池，次级伤害不递归。
// ============================================================

import { WEAPON_REVISIONS, WEAPON_REVISION_VERSION } from '../weapon_revisions_data.js';
import {SPECS} from './specs.js';

const TAU = Math.PI * 2;
const EPS = 1e-8;
const MECH = (form) => `v3:${form}`;
const key = (e) => String(e.id);
const len = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const unit = (x, z) => { const n = Math.hypot(x, z) || 1; return { x: x / n, z: z / n }; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sourceOf = (w) => w.def.sourceWeapon || w.def.id;

export class RevisionsMechanics {
  constructor(runtime) {
    this.r = runtime;
  }

  form(id) {
    const rev = WEAPON_REVISIONS[id];
    return rev && rev.form ? rev.form : null;
  }

  /** 本模块是否接管这把枪（版本 + 形态双重判断；不满足返回 null） */
  claims(w) {
    if (!w || w.def?.weaponAssetVersion !== WEAPON_REVISION_VERSION) return null;
    const rev = WEAPON_REVISIONS[sourceOf(w)];
    return rev && rev.form ? rev : null;
  }

  isShot(shot) { return shot?.definitionVersion === WEAPON_REVISION_VERSION && !!this.form(shot.weaponId); }
  budget(id, field) { return WEAPON_REVISIONS[id]?.[field] ?? 0; }

  validateEntity(e, snapshot) {
    const rev=WEAPON_REVISIONS[e.shot.weaponId], form=rev.form;
    const fail=()=>{throw Error('Invalid v3 '+form+' entity');};
    const finite=(o,ks)=>o&&ks.every(k=>Number.isFinite(o[k]));
    const txn=snapshot.paidActions[e.shot.rootShotId];
    const ownerShot=form==='following_turret'&&e.shot.followingAction==='ownerShot';
    if(e.shot.followingAction!==undefined&&!ownerShot)fail();
    if(ownerShot){
      if(typeof e.shot.manaPaid!=='boolean')fail();
      const spec=SPECS[e.shot.weaponId],shot=e.shot,range=spec.range*Math.min(2,Math.max(.25,shot.lifeMul)),speed=spec.speed*shot.speedMul;
      if(snapshot.states[e.owner].definitionVersion!==3||!txn||txn.owner!==e.owner||txn.cost!==shot.paidCost||txn.end<snapshot.time||shot.paidCost!==(shot.manaPaid?2:1)||e.kind!=='projectile'||e.mechanic!=='v3:owner-shot'||e.secondary!==false||shot.noRefund||e.relicBonus||e.relicExplosive||e.blast||!Number.isFinite(shot.bulletSize)||shot.bulletSize<=0||Math.abs(e.radius-.13*shot.bulletSize)>EPS||Math.abs(e.speed-speed)>EPS||Math.abs(e.range-range)>EPS||Math.abs(e.maxTTL-Math.min(10,range/Math.max(.01,speed)))>EPS||e.pierce!==shot.pierce||e.bounce>shot.bounce||Math.abs(shot.damage-spec.damage*shot.mul)>EPS)fail();
      return;
    }
    if(snapshot.states[e.owner].definitionVersion!==3||!txn||txn.owner!==e.owner||e.shot.paidCost!==txn.cost||e.relicBonus||e.relicExplosive||e.blast||e.shot.paidCost!==(e.shot.manaPaid?rev.manaCost:rev.cost))fail();
    const expected={radial:'projectile',meteor:'zone',multi_reflect_beam:'line',heavy_sustained_beam:'line',auto_boomerang:'projectile',traveling_wave:'line',following_turret:e.secondary?'projectile':'unit',parallel_nails:'projectile'}[form];
    if(e.kind!==expected)fail();
    const secondary= form==='following_turret'&&e.kind==='projectile';
    if(!!e.secondary!==secondary||!!e.shot.noRefund!==(['meteor','heavy_sustained_beam','traveling_wave'].includes(form)||secondary||form==='auto_boomerang'&&e.phase==='return')||e.mechanic!==(secondary?'v3:turret-bullet':['radial','parallel_nails'].includes(form)?undefined:MECH(form)))fail();
    if(e.kind==='projectile'&&(e.pierce!==0||e.bounce!==0||e.radius!==rev.radius||e.speed!==rev.speed||e.maxTTL>rev.duration+EPS&&form!=='following_turret'))fail();
    if(form==='radial'||form==='parallel_nails'){if(!Number.isInteger(e.shot.unitId)||e.shot.unitId<0||e.shot.unitId>=rev.count||e.shot.homing!==0)fail();}
    if(form==='meteor'&&(!['warning','falling'].includes(e.phase)||!finite(e,['stage','fall'])||e.stage<0||e.stage>(e.phase==='warning'?rev.warning:rev.fall)+EPS||e.fall!==rev.fall||e.radius!==rev.radius||e.maxTTL!==rev.warning+rev.fall+.01))fail();
    if(form==='auto_boomerang'&&(!['out','return'].includes(e.phase)||e.turn!==rev.range||e.maxTTL!==rev.duration))fail();
    if(['multi_reflect_beam','heavy_sustained_beam','traveling_wave'].includes(form)&&(!finite(e,['width','length'])||Math.abs(e.width-(form==='traveling_wave'?rev.thickness:rev.width*e.shot.beamWidth))>EPS))fail();
    if(form==='multi_reflect_beam'&&(e.length>rev.range+EPS||e.maxTTL!==rev.duration))fail();
    if(form==='heavy_sustained_beam'&&(e.length>rev.range+EPS||e.maxTTL!==rev.duration))fail();
    if(form==='traveling_wave'&&(!finite(e.axis,['x','z'])||Math.abs(e.axis.x+e.dz)>EPS||Math.abs(e.axis.z-e.dx)>EPS||e.length!==rev.width||!finite(e,['traveled','range','speed'])||e.traveled>rev.range+EPS||e.range!==rev.range||e.speed!==rev.speed))fail();
    if(form==='following_turret'&&e.kind==='unit'&&(!Number.isInteger(e.shotsLeft)||e.shotsLeft<0||e.shotsLeft>rev.shots||!finite(e,['nextTick'])||e.maxTTL!==rev.deployTTL))fail();
    if(form==='following_turret'&&secondary&&(e.range!==rev.range||e.maxTTL!==rev.range/rev.speed||Math.abs(e.shot.damage-rev.damage*e.shot.mul)>EPS))fail();
  }

  validateSnapshot(snapshot) {
    validateDeploymentBudget(snapshot.entities);
    if(snapshot.entities.filter(e=>e.kind==='projectile').length>420||snapshot.entities.filter(e=>e.kind==='line').length>24)throw Error('Global weapon entity cap exceeded');
    for(const [owner,state] of Object.entries(snapshot.states)) {
      if(state.definitionVersion===3&&!this.form(state.weaponId))throw Error('Invalid v3 state definition');
      if(state.definitionVersion!==3)continue;
      const rev=WEAPON_REVISIONS[state.weaponId],own=snapshot.entities.filter(e=>e.owner===owner);
      for(const [kind,field] of [['projectile','projectileCap'],['zone','zoneCap'],['line','beamCap'],['unit','unitCap']]) {
        const cap=rev.form==='traveling_wave'&&kind==='line'?rev.projectileCap:rev[field];
        if(own.filter(e=>e.kind===kind).length>cap)throw Error('V3 owned entity cap exceeded');
      }
      if(rev.form==='following_turret'){
        const roots=new Map();for(const e of own.filter(e=>!e.ended&&e.ttl>0)){const root=e.shot?.rootShotId,list=roots.get(root)||[];list.push(e);roots.set(root,list);}
        for(const list of roots.values()){
          const primaries=list.filter(e=>e.shot.followingAction==='ownerShot');
          if(primaries.length&&(primaries.length!==1||list.length!==1))throw Error('Duplicate v3 owner-shot root');
          if(!primaries.length){const units=list.filter(e=>e.kind==='unit'),bullets=list.filter(e=>e.kind==='projectile');if(units.length>1||bullets.length>rev.shots-(units[0]?.shotsLeft??0))throw Error('Invalid v3 prepaid turret group');}
        }
      }
      if(state.kilnTicks!==undefined&&(!Number.isInteger(state.kilnTicks)||state.kilnTicks<0||state.kilnTicks>Math.ceil(rev.duration/(rev.tick/2)-EPS)))throw Error('Invalid v3 beam tick count');
      for(const f of ['kilnPre','kilnActive','kilnTick','kilnCool'])if(state[f]!==undefined&&(!Number.isFinite(state[f])||state[f]<0||state[f]>(f==='kilnCool'?rev.releaseCooldown:f==='kilnPre'?rev.charge:f==='kilnTick'?rev.tick:rev.duration)+EPS))throw Error('Invalid v3 beam clock');
      if(state.kilnLine!==undefined&&state.kilnLine!==null) {
        const line=own.find(e=>e.id===state.kilnLine);
        if(!line||line.mechanic!==MECH('heavy_sustained_beam')||!state.kilnShot||line.shot.rootShotId!==state.kilnShot.rootShotId)throw Error('Invalid v3 beam reference');
      }
    }
  }

  // ---- 与既有模块同签名的空实现 ----
  paid() {}
  projectile() {}
  afterDamage() {}
  outcome() {}
  beforeDamage(target, damage) { return damage; }
  step() { return false; }

  // ============================================================
  //  track：逐帧状态推进（预热 / 持续束 / 跟随炮计时）
  // ============================================================
  track(p, w, s, dt, { down }) {
    const rev = this.claims(w);
    if (!rev) return;
    if (rev.form === 'heavy_sustained_beam') this._trackKiln(p, w, s, dt, rev, down);
  }

  // ============================================================
  //  input：接管输入（返回 true 表示这次输入已被本模块消费）
  // ============================================================
  input(p, w, s, dt, io) {
    const rev = this.claims(w);
    if (!rev) return false;
    if (rev.form === 'heavy_sustained_beam') return this._inputKiln(p, w, s, dt, rev, io);
    return false;
  }

  // ============================================================
  //  prepare：原子预检。null = 不管这把枪；{reject:true} = 整次拒绝
  // ============================================================
  prepare(p, w, s, charge) {
    const rev = this.claims(w);
    if (!rev) return null;
    const handler = this[`_prepare_${rev.form}`];
    return handler ? handler.call(this, p, w, s, rev, charge) : null;
  }

  fire(p, w, s, shot, config, charge) {
    if (!config || !config.form) return false;
    if (!this.claims(w)) return false;
    const handler = this[`_fire_${config.form}`];
    return handler ? !!handler.call(this, p, w, s, shot, config, charge) : false;
  }

  // ============================================================
  //  entity：本模块自有实体的逐帧推进
  // ============================================================
  entity(e, dt) {
    if (!e.mechanic || !String(e.mechanic).startsWith('v3:')) return false;
    const handler = this[`_entity_${String(e.mechanic).slice(3)}`];
    if (handler) { handler.call(this, e, dt); return true; }
    return false;
  }

  /**
   * 挂起：把长生命周期的形态状态收干净。
   *
   * ⚠ **只删不加**：这个函数会遍历**所有**武器状态，一旦用赋值去"清零"，
   *   就会给从没用过该形态的武器也添上这些键，而运行时快照会把这些键序列化进去 ——
   *   直接违反两条既有不变量（"新绑定的武器快照不得悄悄长出新字段"）。
   *   实测：写成赋值版时 weapon_assets_runtime 与 weapon_mainline 各挂一条。
   *   正确做法是"存在才删"，让快照回到原有字段集合。
   */
  suspend(restoring=false) {
    if(restoring)return;
    for (const s of Object.values(this.r.states || {})) {
      const line=this.r.entities.find(e=>e.id===s.kilnLine);if(line)line.ended=true;
      if(s.kilnActive>0||line)s.kilnCool=Math.max(s.kilnCool||0,WEAPON_REVISIONS[s.weaponId]?.releaseCooldown||0);   // 实体要显式收掉，不能只删引用
      for (const f of ['kilnLine', 'kilnShot', 'kilnDir', 'kilnPre', 'kilnActive', 'kilnTick', 'kilnRoot', 'kilnTicks', 'radialFired']) {
        if (f in s) delete s[f];
      }
    }
  }

  // ============================================================
  //  公共工具
  // ============================================================
  /** 沿射线找第一个被墙挡住的点；法线用两轴探测近似（运行时不提供求交法线） */
  _rayToWall(from, d, maxLen, radius = 0.12, y = 0.8) {
    const step=.05;
    let t=0;
    while(t<maxLen-EPS) {
      const nt=Math.min(maxLen,t+step), px=from.x+d.x*nt,pz=from.z+d.z*nt;
      const prop=this.r.world.propHit?.(px,pz,radius,y);
      if(prop||this.r._blocked(px,pz,radius,y)) {
        let lo=t,hi=nt;
        for(let j=0;j<14;j++){const mid=(lo+hi)/2;if(this.r._blocked(from.x+d.x*mid,from.z+d.z*mid,radius,y))hi=mid;else lo=mid;}
        const last={x:from.x+d.x*lo,z:from.z+d.z*lo};
        // Compare the blocked trial against the last free point on each axis.
        const bx=this.r._blocked(px,last.z,radius,y),bz=this.r._blocked(last.x,pz,radius,y);
        const normal=bx&&!bz?{x:-Math.sign(d.x),z:0}:bz&&!bx?{x:0,z:-Math.sign(d.z)}:unit(-d.x,-d.z);
        return {hit:true,point:last,normal,length:lo,prop};
      }
      t=nt;
    }
    return {hit:false,point:{x:from.x+d.x*maxLen,z:from.z+d.z*maxLen},normal:{x:0,z:0},length:maxLen};
  }

  /** 线段扫掠命中：返回 [{target, t, dir}]，按沿线段距离排序；exclude 为已命中集合 */
  _segmentHits(a, b, halfWidth, exclude) {
    const d = unit(b.x - a.x, b.z - a.z), total = len(a, b);
    const out = [];
    for (const t of this.r._enemies()) {
      if (exclude && exclude.has(key(t))) continue;
      const r = (t.r || t.radius || 0.5) + halfWidth;
      const vx = t.x - a.x, vz = t.z - a.z;
      const proj = clamp(vx * d.x + vz * d.z, 0, total);
      const cx = a.x + d.x * proj, cz = a.z + d.z * proj;
      if (Math.hypot(t.x - cx, t.z - cz) > r) continue;
      // 合同："落地伤害圆心到目标也检查遮挡"
      if (!this.r._los({ x: cx, z: cz }, t)) continue;
      out.push({ target: key(t), t: proj, dir: { x: d.x, z: d.z } });
    }
    return out.sort((x, y) => x.t - y.t);
  }

  _segHit(t, from, to, r) {
    const d = unit(to.x - from.x, to.z - from.z), total = len(from, to);
    const vx = t.x - from.x, vz = t.z - from.z;
    const proj = clamp(vx * d.x + vz * d.z, 0, total);
    const cx = from.x + d.x * proj, cz = from.z + d.z * proj;
    return Math.hypot(t.x - cx, t.z - cz) <= (t.r || t.radius || 0.5) + r;
  }

  _cool(s, rev, p) {
    const am = (p.attachMods && p.attachMods()) || {};
    const rate = (p.stats?.rate || 1) * (p.overdrive > 0 ? 2 : 1) * (1 + (am.rate || 0));
    s.cooldown = (rev.cd ?? 0.8) / Math.max(0.05, rate);
  }

  // ============================================================
  //  1) ring_shot：角色环射   form=radial
  //  合同：十二方向、从角色边缘发出、禁追踪/散布、靠墙不发、
  //        池差 1 整次拒绝、每颗弹每敌一次。
  // ============================================================
  _prepare_radial(p, w, s, rev) {
    const count = rev.count ?? 12;
    const owner = w.assetInstanceId;
    if (this.r._globalCount('projectile') + count > 420) return { reject: true, reason: 'projectile-pool' };
    const cap = rev.projectileCap ?? 0;
    if (cap > 0 && this.r._owned(owner, 'projectile').length + count > cap) return { reject: true, reason: 'weapon-pool' };
    const fee=this.r._resources(w,rev.cost);if(!fee.ok)return {reject:true,reason:fee.reason};
    const body=Math.max(.2,p.radius||.45),base=Math.atan2(p.aim?.x??0,p.aim?.z??1);
    if(!Array.from({length:count},(_,i)=>base+i*TAU/count).some(angle=>!this.r._blocked(p.x+Math.sin(angle)*body,p.z+Math.cos(angle)*body,(rev.radius??.14)*.5)))return {reject:true,reason:'spawn-wall'};
    return { form: 'radial', count, cost: rev.cost ?? 1, spread: 0 };
  }

  _fire_radial(p, w, s, shot, c) {
    const rev = WEAPON_REVISIONS[sourceOf(w)];
    const count = c.count;
    const dmg = rev.damage ?? 3, speed = rev.speed ?? 18, range = rev.range ?? 8, radius = rev.radius ?? 0.14;
    const base = Number.isFinite(p.aim?.x) && Number.isFinite(p.aim?.z) ? Math.atan2(p.aim.x, p.aim.z) : 0;
    const body = Math.max(0.2, p.radius || 0.45);
    let fired = 0;
    for (let i = 0; i < count; i++) {
      const ang = base + (i * TAU) / count;
      const d = { x: Math.sin(ang), z: Math.cos(ang) };
      const ox = p.x + d.x * body, oz = p.z + d.z * body;
      if (this.r._blocked(ox, oz, radius * 0.5)) continue;
      const ttl = range / Math.max(0.01, speed);
      const made = this.r._add({
        kind: 'projectile', owner: w.assetInstanceId, x: ox, z: oz, dx: d.x, dz: d.z,
        speed, ttl, maxTTL: ttl, range, traveled: 0, radius, hit: [], pierce: 0, bounce: 0,
        shot: { ...shot, damage: dmg * shot.mul, rootShotId: shot.rootShotId, unitId: i, homing: 0, spreadMul: 0 },
        color: w.def.color,
      });
      if (made) fired++;
    }
    s.radialFired = fired;
    this._cool(s, rev, p);
    return fired > 0;
  }

  // ============================================================
  //  2) clap_mortar：天降陨石   form=meteor
  //  合同：合法落点 → 0.6 秒预告 → 0.2 秒下落 → 一次圆形爆破；
  //        落点本房间/14 内/非墙/通视；28 为最大伤、边缘衰减至 35%；
  //        共用区域额度 2；切枪后仍继续；墙内/跨房/超 14/只剩 1 弹一律拒绝。
  // ============================================================
  _placement(p, rev) {
    const pt = p.aimPoint;
    if (!pt || !Number.isFinite(pt.x) || !Number.isFinite(pt.z)) return { valid: false, reason: 'placement-range' };
    if (len(p, pt) > (rev.range ?? 14)) return { valid: false, reason: 'placement-range' };
    if (this.r._blocked(pt.x, pt.z, 0.3)) return { valid: false, reason: 'placement-wall' };
    if (!this.r._los(p, pt)) return { valid: false, reason: 'placement-wall' };
    return { valid: true, point: { x: pt.x, z: pt.z } };
  }

  _prepare_meteor(p, w, s, rev) {
    if (this.r._globalCount('projectile') >= 420) return { reject: true, reason: 'projectile-pool' };
    const owned = this.r._owned(w.assetInstanceId, 'zone').filter((e) => e.ttl > 0).length;
    if (owned + 1 > (rev.zoneCap ?? 2)) return { reject: true, reason: 'zone-cap' };
    const fee=this.r._resources(w,rev.cost);if(!fee.ok)return {reject:true,reason:fee.reason};
    const place = this._placement(p, rev);
    if (!place.valid) return { reject: true, reason: place.reason };
    return { form: 'meteor', cost: rev.cost ?? 2, point: place.point, spread: 0 };
  }

  _fire_meteor(p, w, s, shot, c) {
    const rev = WEAPON_REVISIONS[sourceOf(w)];
    // ⚠ 费用由运行时按 config.cost 在调用本方法**之前**扣过了（ 里的 _pay）。
    // 这里若再扣一次就是双倍扣费（实测踩到：陨石一次动作扣了 4 弹而不是 2）。
    // 本方法只登记退款账本。
    // Keep the actual paid ledger established by the runtime, including mana payment.
    const total = (rev.warning ?? 0.6) + (rev.fall ?? 0.2) + 0.01;
    this.r._add({
      kind: 'zone', mechanic: MECH('meteor'), owner: w.assetInstanceId,
      x: c.point.x, z: c.point.z, radius: rev.radius ?? 2.5,
      phase: 'warning', stage: rev.warning ?? 0.6, fall: rev.fall ?? 0.2,
      ttl: total, maxTTL: total, y: 0.12, color: w.def.color,
      shot: { ...shot, damage: (rev.damage ?? 28) * shot.mul, weaponId: sourceOf(w), explosion: true, noRefund: true },
    });
    // 陨石预告声（美术/音效）：0.6 秒预告窗口里给玩家一个低频风切，落地再补专用撞击声。
    this.r._feedback('meteor-warning', { weapon: w, def: w.def, x: c.point.x, z: c.point.z });
    this._cool(s, rev, p);
    return true;
  }

  _entity_meteor(e,dt) {
    e.ttl=Math.max(0,e.ttl-dt);
    if(e.phase==='warning') {
      const used=Math.min(dt,Math.max(0,e.stage));e.stage-=used;dt-=used;
      if(e.stage>EPS)return;
      e.phase='falling';e.stage=e.fall;
    }
    if(e.phase!=='falling')return;
    e.stage=Math.max(0,e.stage-dt);e.y=Math.max(.12,6*e.stage/e.fall);
    if(e.stage>EPS)return;
    const R=e.radius;
    for(const h of this._segmentHits(e,e,R,null)) {
      const t=this.r._enemy(h.target);if(!t)continue;
      const falloff=clamp(1-len(e,t)/R*.65,.35,1);
      this.r._damage(t,e.shot,e.shot.damage*falloff,false,unit(t.x-e.x,t.z-e.z));
    }
    e.ended=true;
  }

  // ============================================================
  //  3) corner_prism：多折光束   form=multi_reflect_beam
  //  合同：最多折墙三次（4 段）、总路程 24、整条可见、同敌只伤一次、
  //        首次相交 10×0.8^段序、预留 4 条线后才扣费、容量不足整次拒绝。
  // ============================================================
  _prepare_multi_reflect_beam(p, w, s, rev) {
    const need = (rev.reflections ?? 3) + 1;
    if (this.r._globalCount('line') + need > 24) return { reject: true, reason: 'line-pool' };
    const owned = this.r._owned(w.assetInstanceId, 'line').filter((e) => e.ttl > 0).length;
    if (owned + need > (rev.beamCap ?? 4)) return { reject: true, reason: 'beam-cap' };
    const fee=this.r._resources(w,rev.cost);if(!fee.ok)return {reject:true,reason:fee.reason};
    return { form: 'multi_reflect_beam', cost: rev.cost ?? 1, segments: need, spread: 0 };
  }

  _fire_multi_reflect_beam(p, w, s, shot, c) {
    const rev = WEAPON_REVISIONS[sourceOf(w)];
    // 同上：运行时已扣费，这里只登记账本，不得重复扣。

    const width = (rev.width ?? 0.18) * (shot.beamWidth || 1);
    const half = width / 2;
    const falloff = rev.reflectionFalloff ?? 0.8;
    const life = Math.max(0.18, rev.duration ?? 0.18);
    let from = { x: p.x, z: p.z };
    let d = unit(p.aim?.x ?? 0, p.aim?.z ?? 1);
    let left = rev.range ?? 24;
    // 2026-10-13 设计变更（试玩要求）：不再"整次攻击对同一敌人只结算一次"，
    // 改为**逐段**结算 —— 直射段命中一次、之后的每个反弹段若再扫到同一敌人，可再次造成伤害并累计。
    // 段内仍去重（避免同一段重复结算同一敌人）。
    let hitOnce = new Set();
    const segments = c.segments ?? 4;
    for (let i = 0; i < segments && left > EPS; i++) {
      const r = this._rayToWall(from, d, left, half * 0.6);
      const segLen = Math.max(0.01, len(from, r.point));
      hitOnce = new Set();
      for (const h of this._segmentHits(from, r.point, half, hitOnce)) {
        const t = this.r._enemy(h.target);
        if (!t) continue;
        hitOnce.add(h.target);
        const dmg = (rev.damage ?? 10) * Math.pow(falloff, i) * shot.mul;
        this.r._damage(t, { ...shot, damage: dmg, weaponId: shot.lottery?shot.weaponId:sourceOf(w) }, dmg, i > 0, h.dir);
      }
      this.r._add({
        kind: 'line', mechanic: MECH('multi_reflect_beam'), owner: w.assetInstanceId,
        x: from.x, z: from.z, dx: d.x, dz: d.z, length: segLen, width,
        ttl: life, maxTTL: life,
        shot: { ...shot, damage: (rev.damage ?? 10) * Math.pow(falloff, i) * (shot.lottery?shot.mul:1),...(shot.lottery?{unitId:i}:{}) }, color: w.def.color,
      });
      left -= segLen;
      if (!r.hit||r.prop) {if(r.prop)this.r.world.onPropHit?.(r.prop,shot.damage,r.point.x,.8,r.point.z,{assetShot:shot});break;}
      const dn = d.x * r.normal.x + d.z * r.normal.z;
      d = unit(d.x - 2 * dn * r.normal.x, d.z - 2 * dn * r.normal.z);
      const separation=Math.min(.05,left);left-=separation;
      from = { x: r.point.x + d.x * separation, z: r.point.z + d.z * separation };
    }
    this._cool(s, rev, p);
    return true;
  }

  // ============================================================
  //  4) kiln_ray：重型持续束   form=heavy_sustained_beam
  //  合同：长按预热 0.35 秒 → 粗束慢转向（0.9 rad/s）最多 1.2 秒 → 强制冷却 0.8 秒；
  //        每 0.2 秒一 tick、伤 7、扣 2 弹或 2 法力、共 6 tick；
  //        预热零伤零扣费；松手/切枪/失焦取消；超载将付费tick间隔减半，其他射速不改固定节拍；最多穿3敌。
  // ============================================================
  _prepare_heavy_sustained_beam(p, w, s, rev) {
    if (this.r._globalCount('line') + 1 > 24) return { reject: true, reason: 'line-pool' };
    return { form: 'heavy_sustained_beam', cost: 0, spread: 0, fixedCooldown: 0 };
  }

  /**
   * 持续束的"发射"只是一个声明：真正的伤害由 track/input 逐帧驱动。
   * 必须返回 true，否则运行时的通用路径会给 kiln_ray 发射 v2 的老式光束
   * （它有一条  的专用分支）。
   * 正常情况下  已经先一步返回 true 挡住这里，本方法只作兜底。
   */
  _fire_heavy_sustained_beam() { return true; }

  _trackKiln(p,w,s,dt,rev,down) {
    if(!down||!this.r.held||s.reload) {
      if(s.kilnActive){s.kilnCool=rev.releaseCooldown;this._endKilnLine(s);}
      s.kilnPre=0;p.charging=false;p.charge=0;return;
    }
    if(s.kilnCool>0)return;
    let elapsed=dt;
    if(!s.kilnActive) {
      const needed=Math.max(0,rev.charge-(s.kilnPre||0));
      s.kilnPre=Math.min(rev.charge,(s.kilnPre||0)+dt);
      if(dt<needed-EPS){p.charging=true;p.charge=s.kilnPre/rev.charge;return;}
      elapsed=Math.max(0,dt-needed);s.kilnActive=EPS;s.kilnTick=rev.tick/(p.overdrive>0?2:1);s.kilnTicks=0;s.kilnDir=null;
      p.charging=false;p.charge=0;
    }
    const want=unit(p.aim?.x??0,p.aim?.z??1),cur=s.kilnDir||want;
    const angle=Math.atan2(want.x,want.z)-Math.atan2(cur.x,cur.z),wrapped=Math.atan2(Math.sin(angle),Math.cos(angle));
    const at=Math.atan2(cur.x,cur.z)+clamp(wrapped,-rev.turnRate*elapsed,rev.turnRate*elapsed);
    const d={x:Math.sin(at),z:Math.cos(at)};s.kilnDir=d;
    const remaining=Math.max(0,rev.duration-s.kilnActive),advance=Math.min(remaining,elapsed);
    const interval=rev.tick/(p.overdrive>0?2:1);
    // Ordinary six, overdrive twelve; neither emits at the end boundary.
    s.kilnTick+=advance>=remaining-EPS?Math.max(0,advance-2*EPS):advance;
    let ticks=Math.min(Math.floor((s.kilnTick+EPS)/interval),Math.max(0,Math.ceil(rev.duration/(rev.tick/2)-EPS)-(s.kilnTicks||0)));
    while(ticks-->0) {
      const line=this.r.entities.find(e=>e.id===s.kilnLine&&!e.ended);
      if((!line&&this.r._globalCount('line')>=24)||!this.r.lottery.lineAdmission(line?0:1)||!this.r._resources(w,rev.cost).ok) {s.kilnCool=rev.releaseCooldown;this._endKilnLine(s);return;}
      // Pay before allocating a shot ID or drawing critical-hit RNG.
      const magBefore=w.mag,paid=this.r._pay(w,rev.cost);
      if(!paid){s.kilnCool=rev.releaseCooldown;this._endKilnLine(s);return;}
      const root=this.r._id('shot'),shot=this.r._mods(p,w,s,rev.damage,root,magBefore-w.mag);
      shot.paidCost=paid;shot.manaPaid=this.r._mana(w);shot.noRefund=true;shot.feedbackRootShotId=null;
      this.r.paidActions[root]={owner:w.assetInstanceId,cost:paid,refunded:0,end:this.r.time+20};
      s.kilnRoot=root;s.kilnShot=shot;s.kilnTicks=(s.kilnTicks||0)+1;s.kilnTick=Math.max(0,s.kilnTick-interval);
      this._refreshKilnLine(p,w,s,rev,d);this._kilnTick(p,w,s,rev,d);
    }
    s.kilnActive+=advance;
    if(s.kilnActive>=rev.duration-EPS){s.kilnCool=rev.releaseCooldown;this._endKilnLine(s);return;}
    if(s.kilnShot)this._refreshKilnLine(p,w,s,rev,d);
  }

  _kilnTick(p, w, s, rev, d) {
    const half = ((rev.width ?? 0.75) * (s.kilnShot?.beamWidth || 1)) / 2;
    const r = this._rayToWall({ x: p.x, z: p.z }, d, rev.range ?? 16, half);
    for (const h of this._segmentHits({ x: p.x, z: p.z }, r.point, half, null).slice(0, 3)) {
      const t = this.r._enemy(h.target);
      if (!t) continue;
      this.r._damage(t, s.kilnShot, (rev.damage ?? 7) * (s.kilnShot?.mul || 1), false, d);
    }
  }

  _refreshKilnLine(p,w,s,rev,d) {
    const width=rev.width*(s.kilnShot?.beamWidth||1),ray=this._rayToWall(p,d,rev.range,width/2);
    let line=this.r.entities.find(e=>e.id===s.kilnLine&&!e.ended);
    const values={x:p.x,z:p.z,dx:d.x,dz:d.z,length:ray.length,width,ttl:rev.duration,maxTTL:rev.duration,shot:{...s.kilnShot},color:w.def.color};
    if(!line){line=this.r._add({kind:'line',mechanic:MECH('heavy_sustained_beam'),owner:w.assetInstanceId,...values});s.kilnLine=line?.id??null;}
    else Object.assign(line,values);
  }

  _endKilnLine(s) {
    const line=this.r.entities.find(e=>e.id===s.kilnLine);if(line)line.ended=true;
    s.kilnLine=null;delete s.kilnShot;s.kilnDir=null;s.kilnTick=0;s.kilnActive=0;s.kilnPre=0;
  }

  _inputKiln(p, w, s, dt, rev, { down }) {
    // 持按（或正在预热/照射）期间完全由本模块接管，避免走通用自动射击
    if (s.kilnActive || s.kilnPre || (down && (!s.kilnCool || s.kilnCool <= EPS))) return true;
    return true;
  }

  // ============================================================
  //  5) boomerang_fork：自动回旋双刃   form=auto_boomerang
  //  合同：准星 ±0.22 弧度双刃、出程 7 单位后朝**玩家当前位置**返、
  //        距玩家 0.6 消失；每刃每阶段每敌一次；返程 4 伤为次级；
  //        TTL 1.5 秒、同实例 4 刃；撞墙即终止，不能穿墙返航。
  // ============================================================
  _prepare_auto_boomerang(p, w, s, rev) {
    const count = rev.count ?? 2;
    if (this.r._globalCount('projectile') + count > 420) return { reject: true, reason: 'projectile-pool' };
    const owned = this.r._owned(w.assetInstanceId, 'projectile').length;
    if (owned + count > (rev.projectileCap ?? 4)) return { reject: true, reason: 'weapon-pool' };
    const fee=this.r._resources(w,rev.cost);if(!fee.ok)return {reject:true,reason:fee.reason};
    return { form: 'auto_boomerang', count, cost: rev.cost ?? 1, spread: 0 };
  }

  _fire_auto_boomerang(p, w, s, shot, c) {
    const rev = WEAPON_REVISIONS[sourceOf(w)];
    // 合同文字写"准星 ±0.22 弧度"，参数表里 spreadRadians=0.44 是**总张角** ⇒ 单侧取一半
    const half = (rev.spreadRadians ?? 0.44) / 2;
    const base = Math.atan2(p.aim?.x ?? 0, p.aim?.z ?? 1);
    for (const side of [-1, 1]) {
      const ang = base + side * half;
      const d = { x: Math.sin(ang), z: Math.cos(ang) };
      this.r._add({
        kind: 'projectile', mechanic: MECH('auto_boomerang'), owner: w.assetInstanceId,
        x: p.x, z: p.z, dx: d.x, dz: d.z, speed: rev.speed ?? 18,
        ttl: rev.duration ?? 1.5, maxTTL: rev.duration ?? 1.5,
        range: 999, traveled: 0, radius: rev.radius ?? 0.18, hit: [], pierce: 0, bounce: 0,
        phase: 'out', turn: rev.range ?? 7,
        shot: { ...shot, damage: (rev.damage ?? 5) * shot.mul, rootShotId: shot.rootShotId, homing: 0, spreadMul: 0,...(shot.lottery?{unitId:(side+1)/2}:{}) },
        color: w.def.color,
      });
    }
    this._cool(s, rev, p);
    return true;
  }

  _entity_auto_boomerang(e,dt) {
    const p=this.r.player;if(!p){e.ended=true;return;}
    const rev=WEAPON_REVISIONS[e.shot.lottery?.borrowId??e.shot.weaponId];
    const travel=e.speed*Math.min(dt,e.ttl),steps=Math.max(1,Math.ceil(travel/.05)),step=travel/steps;
    for(let i=0;i<steps&&!e.ended;i++) {
      if(e.phase==='out'&&e.traveled>=e.turn-EPS) {
        e.phase='return';e.hit=[];e.shot={...e.shot,damage:rev.returnDamage*e.shot.mul,noRefund:true};
      }
      if(e.phase==='return') {
        if(len(e,p)<=.6){e.ended=true;break;}
        const d=unit(p.x-e.x,p.z-e.z);e.dx=d.x;e.dz=d.z;
      }
      const move=e.phase==='out'?Math.min(step,e.turn-e.traveled):step;
      const from={x:e.x,z:e.z},to={x:e.x+e.dx*move,z:e.z+e.dz*move};
      if(this.r._blocked(to.x,to.z,e.radius*.6,.8)){e.ended=true;break;}
      e.x=to.x;e.z=to.z;e.traveled+=move;
      for(const t of this.r._enemies().filter(t=>!e.hit.includes(key(t))&&this._segHit(t,from,to,e.radius)).sort((a,b)=>len(a,from)-len(b,from))) {
        e.hit.push(key(t));this.r._damage(t,e.shot,e.shot.damage,e.phase==='return',{x:e.dx,z:e.dz});
      }
    }
    e.ttl-=dt;if(e.ttl<=EPS)e.ended=true;
  }

  // ============================================================
  //  6) flywheel_vow：推进冲击波   form=traveling_wave
  //  合同：宽 4、厚 0.4 的连续波面，速度 12、路程 10；
  //        连续扫掠防低帧穿漏；每 root 每 target 一次；
  //        整波在首阻挡停（不能透墙）；表现须连续波面而非离散钉。
  // ============================================================
  _prepare_traveling_wave(p, w, s, rev) {
    if (this.r._globalCount('line') + 1 > 24) return { reject: true, reason: 'line-pool' };
    const owned = this.r._owned(w.assetInstanceId, 'line').length + this.r._owned(w.assetInstanceId, 'projectile').length;
    if (owned + 1 > (rev.projectileCap ?? 2)) return { reject: true, reason: 'weapon-pool' };
    const fee=this.r._resources(w,rev.cost);if(!fee.ok)return {reject:true,reason:fee.reason};
    return { form: 'traveling_wave', cost: rev.cost ?? 3, spread: 0 };
  }

  _fire_traveling_wave(p, w, s, shot, c) {
    const rev = WEAPON_REVISIONS[sourceOf(w)];
    const d = unit(p.aim?.x ?? 0, p.aim?.z ?? 1);
    const life = (rev.range ?? 10) / Math.max(0.01, rev.speed ?? 12) + 0.05;
    this.r._add({
      kind: 'line', mechanic: MECH('traveling_wave'), owner: w.assetInstanceId,
      x: p.x, z: p.z, dx: d.x, dz: d.z,
      length: rev.width ?? 4, width: rev.thickness ?? 0.4,
      axis: { x: -d.z, z: d.x },
      speed: rev.speed ?? 12, range: rev.range ?? 10, traveled: 0,
      ttl: life, maxTTL: life, hit: [],
      shot: { ...shot, damage: (rev.damage ?? 12) * shot.mul, rootShotId: shot.rootShotId, noRefund: true },
      color: w.def.color,
    });
    this._cool(s, rev, p);
    return true;
  }

  _entity_traveling_wave(e,dt) {
    const half=e.length/2,thickness=e.width/2,from={x:e.x,z:e.z};
    const requested=Math.min(e.speed*Math.min(dt,e.ttl),Math.max(0,e.range-e.traveled));
    let legal=requested,blocked=false;
    // First crop the entire transverse wave against the earliest obstruction.
    const lanes=Math.max(1,Math.ceil(e.length/.05));
    for(let i=0;i<=lanes;i++) {
      const offset=-half+e.length*i/lanes,start={x:from.x+e.axis.x*offset,z:from.z+e.axis.z*offset};
      const ray=this._rayToWall(start,{x:e.dx,z:e.dz},requested,thickness);
      if(ray.hit&&ray.length<=legal){legal=ray.length;blocked=true;}
    }
    const to={x:from.x+e.dx*legal,z:from.z+e.dz*legal};
    for(const target of this.r._enemies()) {
      if(e.hit.includes(key(target)))continue;
      const vx=target.x-from.x,vz=target.z-from.z;
      const forward=clamp(vx*e.dx+vz*e.dz,0,legal),lateral=clamp(vx*e.axis.x+vz*e.axis.z,-half,half);
      const foot={x:from.x+e.dx*forward+e.axis.x*lateral,z:from.z+e.dz*forward+e.axis.z*lateral};
      if(len(foot,target)>(target.r||target.radius||.5)+thickness||!this.r._los(foot,target))continue;
      e.hit.push(key(target));this.r._damage(target,e.shot,e.shot.damage,false,{x:e.dx,z:e.dz});
    }
    e.x=to.x;e.z=to.z;e.traveled+=legal;e.ttl-=dt;
    if(blocked||e.traveled>=e.range-EPS||e.ttl<=EPS)e.ended=true;
  }

  // ============================================================
  //  7) relay_carbine：一扣跟随炮   form=following_turret
  //  合同：一扣召出跟随炮；持本枪时自动打最近可见敌；
  //        8 发或 6 秒消散；后侧 1.2 跟随；每 0.5 秒至多一弹；
  //        切枪仍计 TTL 但不射、不积压补射；每实例 1 炮、共享部署 40；
  //        已有炮时普通自射，不替换刷新；自动弹为次级、不递归配件。
  // ============================================================
  _prepare_following_turret(p, w, s, rev) {
    if(this.r._owned(w.assetInstanceId,'unit').some(e=>!e.ended&&e.ttl>0&&e.mechanic===MECH('following_turret'))){
      if(this.r._globalCount('projectile')+1>420||this.r._owned(w.assetInstanceId,'projectile').filter(e=>!e.ended&&e.ttl>0).length+1>rev.projectileCap)return {reject:true,reason:'owner-projectile-pool'};
      const fee=this.r._resources(w,1,false,false,'ownerShot');if(!fee.ok)return {reject:true,reason:fee.reason};
      if(this.r._blocked(p.x,p.z,.13*.5)||!Number.isFinite(p.aim?.x)||!Number.isFinite(p.aim?.z)||Math.abs(Math.hypot(p.aim.x,p.aim.z)-1)>.01)return {reject:true,reason:'owner-geometry'};
      return {form:'following_turret',ownerShot:true,cost:1,spread:SPECS[sourceOf(w)].spread};
    }
    if (!this.r.deploymentAdmission([{kind:'unit',mechanic:MECH('following_turret'),owner:w.assetInstanceId,ttl:1}]).ok) return { reject: true, reason: 'unit-pool' };
    if (this.r._owned(w.assetInstanceId, 'unit').length + 1 > (rev.unitCap ?? 1)) return { reject: true, reason: 'unit-cap' };
    const fee=this.r._resources(w,rev.cost);if(!fee.ok)return {reject:true,reason:fee.reason};
    return { form: 'following_turret', cost: rev.cost ?? 6, spread: 0 };
  }

  _fire_following_turret(p, w, s, shot, c) {
    const rev = WEAPON_REVISIONS[sourceOf(w)];
    if(c.ownerShot){
      const spec=SPECS[sourceOf(w)],angle=Math.atan2(p.aim.x,p.aim.z)+((this.r.game.gr?.()??.5)-.5)*spec.spread*shot.spreadMul*Math.PI/180;
      const d={x:Math.sin(angle),z:Math.cos(angle)},speed=spec.speed*shot.speedMul,range=spec.range*Math.min(2,Math.max(.25,shot.lifeMul)),ttl=Math.min(10,range/Math.max(.01,speed));
      shot.damage=spec.damage*shot.mul;
      this.r._add({kind:'projectile',mechanic:'v3:owner-shot',owner:w.assetInstanceId,x:p.x,z:p.z,dx:d.x,dz:d.z,speed,range,ttl,maxTTL:ttl,traveled:0,radius:.13*shot.bulletSize,hit:[],pierce:shot.pierce,bounce:shot.bounce,homing:shot.homing,secondary:false,shot,color:w.def.color});
      return true;
    }
    const back = unit(-(p.aim?.x ?? 0), -(p.aim?.z ?? 1));
    const dist = rev.followDistance ?? 1.2;
    this.r._add({
      kind: 'unit', mechanic: MECH('following_turret'), owner: w.assetInstanceId,
      x: p.x + back.x * dist, z: p.z + back.z * dist,
      ttl: rev.deployTTL ?? 6, maxTTL: rev.deployTTL ?? 6,
      shotsLeft: rev.shots ?? 8, nextTick: this.r.time + (rev.tick ?? 0.5),
      color: w.def.color,
      shot: { ...shot, damage: (rev.damage ?? 4) * shot.mul, rootShotId: shot.rootShotId, weaponId: sourceOf(w) },
    });
    this._cool(s, rev, p);
    return true;
  }

  _entity_following_turret(e, dt) {
    const rev = WEAPON_REVISIONS[e.shot.weaponId] || {};
    const p = this.r.player;
    if (!p) { e.ended = true; return; }
    const back = unit(-(p.aim?.x ?? 0), -(p.aim?.z ?? 1));
    const dist = rev.followDistance ?? 1.2;
    e.x = p.x + back.x * dist; e.z = p.z + back.z * dist;
    e.ttl -= dt;
    if (e.ttl <= EPS || e.shotsLeft <= 0) { e.ended = true; return; }
    // 只在"持本枪"且房间活跃时开火；切枪仍计 TTL 但不射、不补射
    if (this.r.active !== e.owner) return;
    if (this.r.time < e.nextTick) return;
    e.nextTick = this.r.time + (rev.tick ?? 0.5);
    const target = this.r._enemies()
      .filter((t) => len(t, e) <= (rev.range ?? 12) && this.r._los(e, t))
      .sort((a, b) => (len(a, e) - len(b, e)) || (key(a) < key(b) ? -1 : 1))[0];
    if (!target) return;
    const d = unit(target.x - e.x, target.z - e.z);
    if(this.r._owned(e.owner,'projectile').filter(e=>!e.ended&&e.ttl>0).length>=(rev.projectileCap??8))return;
    const speed = rev.speed ?? 24, range = rev.range ?? 12;
    const made=this.r._add({
      kind: 'projectile', mechanic:'v3:turret-bullet', owner: e.owner, x: e.x, z: e.z, dx: d.x, dz: d.z,
      speed, ttl: range / speed, maxTTL: range / speed, range, traveled: 0,
      radius: rev.radius ?? 0.13, hit: [], pierce: 0, bounce: 0, secondary: true, noRefund: true,
      shot: { ...e.shot, damage: (rev.damage ?? 4) * (e.shot.mul || 1), crit: false, noRefund: true },
      color: e.color,
    });
    if(made)e.shotsLeft -= 1;
  }

  // ============================================================
  //  8) witness_pistol：平行钉排   form=parallel_nails
  //  合同：五根**平行**钉、固定宽度 2.4、钉间留空隙；
  //        偏移 [-1.2,-0.6,0,0.6,1.2]；枪口与角色之间有墙的钉不生成；
  //        每钉分别判伤而同一根攻击；排宽不受散布改变。
  // ============================================================
  _prepare_parallel_nails(p, w, s, rev) {
    const count = (rev.offsets || []).length || (rev.count ?? 5);
    if (this.r._globalCount('projectile') + count > 420) return { reject: true, reason: 'projectile-pool' };
    const owned = this.r._owned(w.assetInstanceId, 'projectile').length;
    if (owned + count > (rev.projectileCap ?? 10)) return { reject: true, reason: 'weapon-pool' };
    const fee=this.r._resources(w,rev.cost);if(!fee.ok)return {reject:true,reason:fee.reason};
    const d=unit(p.aim?.x??0,p.aim?.z??1),muzzle=Math.max(.25,p.radius||.45);
    if(!(rev.offsets||[]).some(offset=>{const at={x:p.x+d.x*muzzle-d.z*offset,z:p.z+d.z*muzzle+d.x*offset};return !this.r._blocked(at.x,at.z,(rev.radius??.12)*.5)&&this.r._los(p,at);}))return {reject:true,reason:'spawn-wall'};
    return { form: 'parallel_nails', count, cost: rev.cost ?? 1, spread: 0 };
  }

  _fire_parallel_nails(p, w, s, shot, c) {
    const rev = WEAPON_REVISIONS[sourceOf(w)];
    const offsets = rev.offsets || [-1.2, -0.6, 0, 0.6, 1.2];
    const d = unit(p.aim?.x ?? 0, p.aim?.z ?? 1);
    const nx = -d.z, nz = d.x;
    const speed = rev.speed ?? 24, range = rev.range ?? 10, radius = rev.radius ?? 0.12;
    const muzzle = Math.max(0.25, p.radius || 0.45);
    let fired = 0;
    offsets.forEach((off, i) => {
      const ox = p.x + d.x * muzzle + nx * off;
      const oz = p.z + d.z * muzzle + nz * off;
      if (this.r._blocked(ox, oz, radius * 0.6)) return;
      if (!this.r._los(p, { x: ox, z: oz })) return;
      const ttl = range / speed;
      const made = this.r._add({
        kind: 'projectile', owner: w.assetInstanceId, x: ox, z: oz, dx: d.x, dz: d.z,
        speed, ttl, maxTTL: ttl, range, traveled: 0, radius, hit: [], pierce: 0, bounce: 0,
        shot: { ...shot, damage: (rev.damage ?? 3) * shot.mul, rootShotId: shot.rootShotId, unitId: i, homing: 0, spreadMul: 0 },
        color: w.def.color,
      });
      if (made) fired++;
    });
    this._cool(s, rev, p);
    return fired > 0;
  }
}

export const REVISION_FORMS = [
  'radial', 'meteor', 'multi_reflect_beam', 'heavy_sustained_beam',
  'auto_boomerang', 'traveling_wave', 'following_turret', 'parallel_nails',
];
