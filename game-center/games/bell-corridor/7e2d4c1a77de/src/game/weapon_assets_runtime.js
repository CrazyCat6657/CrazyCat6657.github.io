import {captureDamageContext, damageSource} from './damage_context.js';
import {consumableModifiers} from '../experimental/consumables/runtime.js';
import {observePayment} from './resource_observation.js';
import { actionHit, actionDown } from '../core/control_actions.js';
import { buildShotContext, validateBuildContext } from './build_effects.js';
import { forgeFeed } from './hero_rules_v3.js';
import { cancelOverdriveReload } from './active_promises.js';
import { isEmber, emberMultiplier } from './hero_p2.js';
import { correctionTargetAllowed, validCorrectionIdentity } from './tracking.js';
import { SPECS, BASE_IDS } from './weapon_assets/specs.js';
import { PrecisionMechanics, PRECISION_IDS, GEOMETRY_IDS } from './weapon_assets/precision.js';
import {EnergyMechanics,ENERGY_IDS} from './weapon_assets/energy.js';
import {MechanicalMechanics,MECHANICAL_IDS} from './weapon_assets/mechanical.js';
import {RevisionsMechanics} from './weapon_assets/revisions.js';
import {supportsInstalledAssetDefinition,validWeaponAssetStateShape} from './weapon_compatibility.js';
import {deploymentUsage,deploymentAdmission} from './weapon_assets/deployment_budget.js';
import {savedWeaponDefinition} from './weapon_versions.js';
import {bindSharedMana,manaRefundCap} from './shared_mana.js';
import {LotteryActions,creationAdmission,creationUsage,validPaidResourceIdentity} from './weapon_assets/lottery_actions.js';
export const SUPPORTED_WEAPON_IDS=[...BASE_IDS,...PRECISION_IDS,...GEOMETRY_IDS,...ENERGY_IDS,...MECHANICAL_IDS];

// ============================================================
//  激光统一视觉语言（试玩反馈：「你所有的激光武器统一设计一下 —— 伤害越高的越粗，
//  攻击频率越快的越紫（波长短、频率高），相反就越红」）
//  · 颜色：写在 weapon_assets_data.js 的 color 上（模型 / 弹道 / 光束共用同一来源）
//  · 宽度：这里按单发伤害分档给出光束半宽的倍率
// ============================================================
export const BEAM_WIDTH_MUL={
  hinge_beam:1.0,      // 伤害 3.5
  thread_beam:1.5,     // 伤害 7.16
  braid_light:1.6,     // 伤害 9.6
  laser_lance:1.4,     // 伤害 8（贯穿脉冲）
  prism_anchor:1.2,    // 伤害 24（时间慢放）
  kiln_ray:2.2,        // 伤害 7 但为重型持续束
  aperture_lamp:2.0,   // 伤害 16（开合锥）
  corner_prism:1.0, line_scribe:1.0, tandem_rail:1.2, door_frame:1.4,   // 折镜：折数越多越粗
  tesla_arc:1.2,
  spark_shuttle:10,    // 伤害 70（熔核：单发最高，必须最粗）
};
export const RELIC_PROJECTILE_IDS=['pistol_rusty','pistol_heavy','shotgun_sapper','sniper_rail','minigun_shredder','bell_sight','escapement_smg','smg_hornet','rifle_carbine','shotgun_dragon','burst_triple','witness_pistol','hourhand_rifle','shatter_optic','patient_relic','last_witness'];
const EPS = 1e-8;
// Room-owned v3 activity is versioned and restored alongside existing room fields.
const ROOM_FIELDS=['lastLotteryShot','marks','target','lastRay','rayUntil','sealUntil','dwell','lost','chainRoots','salvoHits','proofTarget','proofCount','brokenTarget','brokenUntil','flankTarget','pairTarget','pairUntil','peekUntil','portalEdges','portalLocks','rhythmHits','lastWeftOrigin','lastWeftRoot','lastWeftTarget','angleDebt','angleUntil','shieldWear','wallShards','stakePairs','films','acidRoots','polarity','bellMarks','salt','lastSalt','wet','quench','quenchRoots','kilnMarks','acidZones','distinct','touched','capShot','ashPoint','ashShot','ashDamage','capacitor','drawPoint','drawLength','threadTarget','threadDwell','threadHitAt','threadShot','riftTarget','tetherTarget','tetherUntil','mercy','shockRoots','relicBlastRoots','arcStreak','arcHitRoot','arcHitAt','arcPendingRoot','arcHitRoots','kilnLine','kilnShot','kilnDir','kilnPre','kilnActive','kilnTick','kilnCool','kilnRoot','radialFired'];
const clone = v => JSON.parse(JSON.stringify(v));
const length = (a,b) => Math.hypot(a.x-b.x,a.z-b.z);
const unit = (x,z) => { const n=Math.hypot(x,z)||1; return {x:x/n,z:z/n}; };
const key = e => String(e.id);
const source = w => w.def.sourceWeapon || w.def.id;
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
function closest(p,a,b) { const x=b.x-a.x,z=b.z-a.z,t=clamp(((p.x-a.x)*x+(p.z-a.z)*z)/(x*x+z*z||1),0,1); return {x:a.x+x*t,z:a.z+z*t,t}; }
function distance(p,a,b) { return length(p,closest(p,a,b)); }
function cross(a,b,c) { return (b.x-a.x)*(c.z-a.z)-(b.z-a.z)*(c.x-a.x); }
function swept(a,b,c,d,r) {
  if (cross(a,b,c)*cross(a,b,d)<=0 && cross(c,d,a)*cross(c,d,b)<=0 && Math.max(Math.min(a.x,b.x),Math.min(c.x,d.x))<=Math.min(Math.max(a.x,b.x),Math.max(c.x,d.x))+EPS && Math.max(Math.min(a.z,b.z),Math.min(c.z,d.z))<=Math.min(Math.max(a.z,b.z),Math.max(c.z,d.z))+EPS) return true;
  return Math.min(distance(a,c,d),distance(b,c,d),distance(c,a,b),distance(d,a,b))<=r;
}

/** Owned, serializable weapon mechanics. All clocks are unscaled player logic seconds. */
export class WeaponAssetsRuntime {
  constructor(game) { this.game=game; this.world=game; this.time=0; this.serial=0; this.prismField=null; this.entities=[]; this.queue=[]; this.states={}; this.weapons=new Map(); this.positions={}; this.history=[]; this.ledger={}; this.paidActions={};this.active=null; this.held=false; this.blockHeld=false; this.diagnostics=[];this.visualEvents=[];this.visualSerial=0;this.precision=new PrecisionMechanics(this);this.energy=new EnergyMechanics(this);this.mechanical=new MechanicalMechanics(this);this.revisions=new RevisionsMechanics(this);this.lottery=new LotteryActions(this); }
  supports(def) { return supportsInstalledAssetDefinition(def); }
  observeShot(event) {this.precision.observeShot(event);}
  observeEnemyAttack(enemy){this.energy.observeEnemyAttack(enemy);}
  interceptNativeProjectile(b){return this.energy.interceptProjectile(b)||this.mechanical.interceptProjectile(b);}
  observeActualDamage(...args){this.mechanical.observeActualDamage(...args);}
  _id(prefix) {
    const allocator=this.game.weaponSerialAllocator;
    if(allocator){allocator.reserve(this.serial);const id=allocator.next(prefix);this.serial=allocator.serial;return id;}
    return `${prefix}:${++this.serial}`;
  }
  _metrics() { return this.game.weaponMetrics?.()||{entities:this.entities,states:this.states,nativeLines:this._nativeLineCount()}; }
  _reserve() {this.game.reserveWeaponReferences?.();if(this.game.weaponSerialAllocator){this.game.weaponSerialAllocator.reserve(this.serial);this.serial=this.game.weaponSerialAllocator.serial;}}
  _refreshGroundSlow() {
    if(this.game.refreshGroundSlow)return this.game.refreshGroundSlow();
    for(const t of this._enemies())t.assetGroundSlow=!t.isBoss&&t.constructor?.name!=='Boss'&&this.entities.some(e=>e.mechanic==='frost'&&!e.ended&&e.ttl>0&&length(e,t)<=e.radius+(t.r||t.radius||.5));
  }
  _bind(p,w) {
    if(!validWeaponAssetStateShape(w.assetState))throw Error('Weapon instance state must be a plain record');
    this.lottery.validateRaw(w.assetState,w.def);
    this.lottery.validateRaw(this.states[w.assetInstanceId],w.def);
    this.game.claimWeaponInstance?.(this,w);
    const carriedSerial = /^weapon:(\d+)$/.exec(w.assetInstanceId || '');
    if (carriedSerial) this.serial = Math.max(this.serial, Number(carriedSerial[1]));
    if(!this.weapons.has(w.assetInstanceId))this._reserve();
    if(!w.assetInstanceId) w.assetInstanceId=this._id('weapon');
    const id=w.assetInstanceId;
    if(!this.states[id]) this.states[id]=w.assetState ?? {version:2,weaponId:source(w),cooldown:0,shots:0,marks:[],sequence:0,mode:0,heat:0,lock:0,spin:0,quiet:1,charge:0,burstRemaining:0};
    if(this.states[id].weaponId!==source(w)||this.states[id].version!==2)throw Error('Weapon instance state/definition mismatch');
    if(this.states[id].definitionVersion!==undefined&&this.states[id].definitionVersion!==w.def.weaponAssetVersion)throw Error('Weapon instance definition version mismatch');
    // Older states may lack these idle fields; normalize before the first save,
    // rather than adding them as a side effect of pausing or leaving the page.
    if(!Object.hasOwn(this.states[id],'charge'))this.states[id].charge=0;
    if(!Object.hasOwn(this.states[id],'burstRemaining'))this.states[id].burstRemaining=0;
    if(this.revisions.claims(w))this.states[id].definitionVersion=3;
    if(w.assetState&&Object.hasOwn(w.assetState,'lastLotteryShot')&&(source(w)!=='chamber_lottery'||w.assetState.lastLotteryShot.owner!==id))throw Error('Invalid incoming lottery trace owner');
    if(Object.hasOwn(this.states[id],'lastLotteryShot')){
      const shot=this.states[id].lastLotteryShot;if(source(w)!=='chamber_lottery'||shot?.owner!==id||!this.lottery.validShot(shot))throw Error('Invalid carried lottery trace');validateBuildContext(shot.buildContext,id);
      const txn=this.paidActions[shot.rootShotId];if(!txn||txn.end<this.time)delete this.states[id].lastLotteryShot;else if(txn.owner!==id||txn.cost!==shot.paidCost)throw Error('Invalid carried lottery trace root');
    }
    w.assetState=this.states[id]; this.weapons.set(id,w); this.player=p; return w.assetState;
  }
  _enemies() { return (this.world.hitboxes||[]).filter(e=>e.alive && e.team===1); }
  bindInventory(player) {
    bindSharedMana(player);
    const inventory=player?.weapons||[player?.weapon].filter(Boolean);
    for(const w of inventory)if(!validWeaponAssetStateShape(w.assetState))throw Error('Weapon instance state must be a plain record');
    for(const w of inventory)this.game.claimWeaponInstance?.(this,w);
    this._reserve();
    this.player=player;this.weapons.clear();
    // A stage reset removes room state but keeps held weapon identities. Reserve
    // all carried IDs before allocating any new one, regardless of slot order.
    for(const w of inventory){const match=/^weapon:(\d+)$/.exec(w.assetInstanceId||'');if(match)this.serial=Math.max(this.serial,Number(match[1]));}
    for(const w of inventory)if(this.supports(w?.def))this._bind(player,w);
  }
  claimRefund(owner,root,amount=1) { const txn=this.paidActions[root];if(!txn||txn.owner!==owner||!Number.isFinite(amount)||amount<=0)return 0;const take=Math.min(amount,Math.max(0,txn.cost-txn.refunded));txn.refunded+=take;return take; }
  _enemy(id) { return this._enemies().find(e=>key(e)===String(id)); }
  _blocked(x,z,r=.03,y=.8) { const fn=this.world.bulletBlocked||this.world.pointBlocked; return !!fn?.call(this.world,x,z,r,y); }
  _los(a,b) { const n=Math.max(1,Math.ceil(length(a,b)/.12)); for(let i=0;i<=n;i++) if(this._blocked(a.x+(b.x-a.x)*i/n,a.z+(b.z-a.z)*i/n)) return false; return true; }
  _feedback(event,payload) { this.world.weaponAssetFeedback?.(event,payload); }
  projectileCount(){return this.entities.filter(e=>e.kind==='projectile'&&!e.ended).length;}
  lineCount(){return this.entities.filter(e=>e.kind==='line'&&!e.ended&&e.ttl>0).length;}
  _nativeLineCount(){return (this.world.projectiles?.beams||[]).filter(b=>b.life>0).length;}
  lineAdmission(count=1){return creationUsage(this._metrics().entities,this._metrics()).line+count<=24;}
  creationAdmission(additions=[],options={}){return creationAdmission(this._metrics().entities,additions,{...this._metrics(),...options});}
  _relicZoneCount(){const {entities,states}=this._metrics(),roots=new Set(entities.filter(e=>!e.ended&&(e.mechanic==='relic-blast'||(e.relicExplosive&&!states[e.owner]?.relicBlastRoots?.[e.shot.rootShotId]))).map(e=>e.shot.rootShotId));return entities.filter(e=>e.kind==='zone'&&!e.ended&&e.ttl>0).length+roots.size;}
  _globalCount(kind){const m=this._metrics();return kind==='projectile'?m.entities.filter(e=>e.kind==='projectile'&&!e.ended).length+(this.world.projectiles?.pool||[]).filter(b=>b.alive).length:m.entities.filter(e=>e.kind==='line'&&!e.ended&&e.ttl>0).length+m.nativeLines;}
  unitCount(){return deploymentUsage(this._metrics().entities.filter(e=>e.kind!=='projectile')).total;}
  deploymentCount(){return deploymentUsage(this._metrics().entities).total;}
  deploymentAdmission(additions=[]){return deploymentAdmission(this._metrics().entities,additions);}
  _add(e,{consumeSource=null}={}) { if(!this.deploymentAdmission([{ttl:1,...e}]).ok)return null;if(e.kind==='projectile'&&this._globalCount('projectile')>=420)return null;if(e.kind==='line'&&!this.lineAdmission())return null;if(e.shot?.lottery&&!this.creationAdmission([e],{consumeSource}).ok)throw Error('Lottery creation reservation violated');const v={id:this._id(e.kind),created:this.time,y:.8,ttl:1,maxTTL:1,...e}; this.entities.push(v); return v; }
  _owned(id,kind) { return this.entities.filter(e=>e.owner===id && (!kind||e.kind===kind)); }
  _remove(id) { this.entities=this.entities.filter(e=>e.id!==id && e.a!==id && e.b!==id); }
  suspend({restoring=false}={}) { this.held=false; this.blockHeld=true;this.energy.suspend();this.mechanical.suspend(restoring);this.revisions.suspend(restoring); if(this.active && this.states[this.active]){this.states[this.active].charge=0;this.states[this.active].burstRemaining=0;} if(this.player){this.player.charging=false;this.player.charge=0;this.player.assetMoveSpeedMul=1;} }
  clearPrismField({refresh=true}={}) {
    this.prismField=null;
    // Remove only this source; other slow/HitStop sources retain their channels.
    if(refresh)this._refreshTimeEffectChannels();
  }
  _refreshTimeEffectChannels() {if(this.game.refreshWeaponTimeChannels)return this.game.refreshWeaponTimeChannels();if(this.game.computeTimeScales){const scales=this.game.computeTimeScales(0);this.game.enemyBulletTimeScale=scales.enemyBullet;this.game.hazardTimeScale=scales.hazard;}}
  clear() { this.clearPrismField();this.entities=[];this._refreshGroundSlow();this.queue=[];this.history=[];this.positions={};this.ledger={};this.paidActions={};this.visualEvents=[];this.energy.clearCombat();this.mechanical.clearCombat();for(const s of Object.values(this.states)){for(const f of ROOM_FIELDS)delete s[f];s.marks=[];s.target=null;s.lastRay=null;} this.suspend(); }
  reset() { this.clear();Object.assign(this,new WeaponAssetsRuntime(this.game));this.precision=new PrecisionMechanics(this);this.energy=new EnergyMechanics(this);this.mechanical=new MechanicalMechanics(this);this.revisions=new RevisionsMechanics(this);this.lottery=new LotteryActions(this); }
  drop(id) { if(this.prismField?.owner===id)this.clearPrismField();this.entities=this.entities.filter(e=>e.owner!==id);this.queue=this.queue.filter(e=>e.owner!==id); delete this.ledger[id];for(const [root,txn]of Object.entries(this.paidActions))if(txn.owner===id)delete this.paidActions[root];if(this.states[id]){for(const f of ROOM_FIELDS)delete this.states[id][f];this.states[id].marks=[];this.states[id].target=null;this.states[id].charge=0;}this.weapons.delete(id);this._refreshGroundSlow(); }
  _cap(p,w) { return p.magSize?.(w)||Math.max(1,Math.round((w.def.mag||SPECS[source(w)].mag)*(p.stats?.magazine||1))); }
  _mana(w) {return w.def.ammoType==='mana';}
  // 无弹匣（法杖类 + 四级神器）：不消耗弹匣、永不换弹。
  // 注意：法力类武器仍然照扣法力（所以法师不会无限开火），
  // 战士类角色拿法杖时因不走上层法力，就是纯无限子弹 —— 与设计一致。
  _freeMag(w) {return SPECS[source(w)]?.noReload===true;}
  _cost(w,n=1,heavy=false,deploy=false,action=null) {const revision=this.revisions.claims(w);if(action!==null){if(action!=='ownerShot'||revision?.form!=='following_turret'||n!==1||heavy||deploy)throw Error('Invalid resource action');return this._mana(w)?2:1;}if(revision&&this._mana(w))return revision.manaCost;return this._mana(w)?(deploy?8:source(w)==='prism_anchor'?6:heavy?6:2):n;}
  _resources(w,n=1,heavy=false,deploy=false,action=null) {
    const amount=this._cost(w,n,heavy,deploy,action),direct=this.player?.overdrive>0,free=this._freeMag(w);
    const magCost=free?0:direct?Math.min(Math.max(0,w.mag),n):n,manaCost=this._mana(w)?amount:0;
    const reserveCost=direct&&!free&&!this._mana(w)&&SPECS[source(w)].reserve>0?n-magCost:0;
    const reason=w.mag<magCost?'magazine':w.reserve<manaCost?'mana':w.reserve<reserveCost?'reserve':null;
    return {ok:!reason,reason,amount,magCost,manaCost,reserveCost};
  }
  _pay(w,n,heavy=false,deploy=false,action=null) {const fee=this._resources(w,n,heavy,deploy,action);if(!fee.ok)return false;if(fee.magCost)w.mag-=fee.magCost;if(fee.manaCost||fee.reserveCost)w.reserve-=fee.manaCost+fee.reserveCost;observePayment(this.game,w,fee.manaCost||fee.magCost+fee.reserveCost);return fee.amount;}
  moveSpeedMultiplier(p) {const w=p?.weapon;if(!this.supports(w?.def))return 1;return this.precision.moveSpeedMultiplier(p,w,this.states[w.assetInstanceId]||{});}
  beginReload(p,w) {
    if(!this.supports(w?.def))return false;
    if(p.hero?.ruleVersion===3&&p.hero.id==='forgewright'&&p.c2.forgeT>0){forgeFeed(p,w,0);return true;}
    const s=this._bind(p,w),id=source(w);
    if(p.overdrive>0){
      this.precision.beginReload(p,w,s,{actionsOnly:true});this.mechanical.beginReload(p,w,s);
      if(id==='beacon_furnace')for(const e of this._owned(w.assetInstanceId,'unit'))this._remove(e.id);
      cancelOverdriveReload(p,w,this);return true;
    }
    if(this._freeMag(w))return true;   // 无弹匣：按 R 或打空都不进入装填流程
    if(this.precision.beginReload(p,w,s)||this.mechanical.beginReload(p,w,s))return true;
    if(id==='beacon_furnace'){for(const e of this._owned(w.assetInstanceId,'unit'))this._remove(e.id);}
    if(s.reload || (w.mag>=this._cap(p,w)&&!s.forceReload) || (!this._mana(w)&&SPECS[id].reserve>0&&w.reserve<=0))return true;
    s.forceReload=false;s.reload={remaining:Math.max(id==='fuse_rail'&&s.railWear>=6?1:0,(w.def.reload||SPECS[id].reload)*(p.stats?.reloadMul||1)),start:w.mag};
    s.cooldown=Math.max(0,s.cooldown);p.reloading=true;p.reloadT=s.reload.remaining;this._feedback('reload',{phase:'start',weapon:w});return true;
  }
  _finishReload(p,w,s) {
    s.cooldown=Math.max(0,s.cooldown);
    const cap=this._cap(p,w),need=cap-w.mag;
    const take=this._mana(w)||SPECS[source(w)].reserve===0?need:Math.min(need,w.reserve);
    w.mag+=take;if(!this._mana(w)&&SPECS[source(w)].reserve>0)w.reserve-=take;
    if(take>0){s.shots=0;s.buildReloaded=true;if(source(w)==='reversible_breech'&&w.mag===cap)s.mode=1-s.mode;
      if(source(w)==='nail_collapse'){const marks=s.marks.splice(0);marks.forEach((m,i)=>{const t=this._enemy(m.target);if(t)this._add({kind:'delayed',owner:w.assetInstanceId,x:t.x,z:t.z,ttl:.01+i*.08,maxTTL:.01+i*.08,shot:m.shot,blast:12,radius:1.8});});}}
    this.precision.finishReload(p,w,s,take);this.energy.finishReload(p,w,s,take);this.mechanical.finishReload(p,w,s,take);s.reload=null;p.reloading=false;p.reloadT=0;p._shotsSinceReload=s.shots;this._feedback('reload',{phase:'complete',weapon:w});
  }
  _mods(p,w,s,base,rootId,magSpent=1) {
    const g=p.stats||{},a=p.attachMods?.()||{},h=p.hero?.hook;
    const correctionOnly=a.correctionOnly && !(g.homing || w.def.homing) ? true : undefined;
    let baseSecondaryMul=(g.damage??1)*(w.dmgMul??1)*consumableModifiers(this.game).damageMult,mul=baseSecondaryMul*(1+(a.damage||0));
    if(g.standstill>0&&p.standT>.5)mul*=1+g.standstill;
    if(g.berserk>0)mul*=1+Math.min(.6,g.berserk*Math.max(0,p.maxHp-p.hp));
    if(h?.damageMul){const heroMul=h.damageMul(p,this.game);mul*=heroMul;baseSecondaryMul*=heroMul;}
    const anchorMul=mul;
    const crit=!!this.game.grc?.((g.crit||0)+(h?.critAdd?.(p,this.game)||0));if(crit)mul*=g.critMul||2;
    if(a.mechs?.lastShot&&w.mag<=0&&magSpent>0)mul*=2.2;if(a.mechs?.afterReload&&s.buildReloaded&&s.shots<3)mul*=1.4;
    const statuses={},intrinsicStatuses={};for(const k of ['burn','poison','slow']){if(w.def[k])intrinsicStatuses[k]=w.def[k];const v=Math.max(a[k]||0,g[k]||0,w.def[k]||0);if(v)statuses[k]=v;}
    if(p.hero?.ruleVersion===3&&h?.shotMods){
      const opt={statuses};h?.shotMods?.(p,opt);Object.assign(statuses,opt.statuses);
      if(isEmber(p)&&statuses.ash)intrinsicStatuses.ash=statuses.ash;
    }
    const context=buildShotContext(p,w,a);
    if(w.attachments?.includes('arc_core')){if(s.arcPendingRoot)s.arcStreak=0;s.arcPendingRoot=rootId;}
    const rawBounce=Math.max(0,(g.bounce||0)+(a.bounce||0));
    return {...captureDamageContext(this.game,{owner:p,sourceInstanceId:w.assetInstanceId,rootShotId:rootId,buildContext:context}),correctionOnly,buildContext:context,arcCore:w.attachments?.includes('arc_core')||false,weaponId:source(w),definitionVersion:w.def.weaponAssetVersion,owner:w.assetInstanceId,rootShotId:rootId,damage:base*mul,...(isEmber(p)?{c2DamageApplied:emberMultiplier(p)}:{}),echoBaseDamage:base*anchorMul,mul,primaryMul:mul,baseSecondaryMul,anchorMul,explosiveMul:g.explosiveMul??1,blastRadiusMul:g.blastRadius??1,crit,statuses,intrinsicStatuses,beamWidth:clamp(Number.isFinite(g.beamWidth)?g.beamWidth:1,.25,4),origin:{x:p.x,z:p.z},direction:{...p.aim},pierce:Math.max(0,(g.pierce||0)+(a.pierce||0)+(h?.pierceAdd?.(p,this.game)||0)),bounce:Math.min(12,context.bounceDouble?rawBounce*2:rawBounce),chain:Math.min(2,Math.max(0,(g.chain||0)+(a.chain||0)-(w.attachments?.includes('arc_core')?1:0))),homing:Math.min(3,(g.homing||0)+(a.homing||0)),speedMul:1+(a.speed||0),lifeMul:1+(a.life||0),spreadMul:(g.spreadMul||1)*(1+(a.spread||0)),paidCost:0,sequence:s.sequence};
  }
  _placement(p,w) {
    const point=p.aimPoint||{x:p.x+p.aim.x*8,z:p.z+p.aim.z*8},id=w.assetInstanceId;
    const anchors=this._owned(id,'anchor').sort((a,b)=>a.created-b.created||a.sequence-b.sequence);
    const last=anchors.at(-1),prev=last&&this.time-last.created<=5+EPS?last:null;
    let reason='';if(!Number.isFinite(point.x)||!Number.isFinite(point.z))reason='invalid-point';else if(length(p,point)>14+EPS)reason='placement-range';else if(this._blocked(point.x,point.z)||!this._los(p,point))reason='placement-wall';else if(prev&&length(prev,point)<.75-EPS)reason='segment-too-short';else if(prev&&length(prev,point)>8+EPS)reason='segment-too-long';else if(prev&&!this._los(prev,point))reason='segment-wall';
    const evict=anchors.length>=4?anchors[0]:null;
    const retained=this._owned(id,'line').filter(e=>e.mechanic==='anchor'&&(!evict||(e.a!==evict.id&&e.b!==evict.id)));
    if(!reason&&prev&&retained.length>=3)reason='segment-cap';
    return {point,prev,evict,valid:!reason,reason};
  }
  updateWeapon(p,dt,input,world) {
    const w=p.weapon;if(!this.supports(w?.def)){if(this.active){this.suspend();this.active=null;}return false;}
    this.world=world||this.game;const s=this._bind(p,w),id=source(w),spec=SPECS[id];
    forgeFeed(p,w,0);
    cancelOverdriveReload(p,w,this);
    if(this.cancelEpoch!==undefined&&this.cancelEpoch!==input?.cancelEpoch)this.suspend();this.cancelEpoch=input?.cancelEpoch;
    if(this.active!==w.assetInstanceId){if(this.active)this.suspend();this.active=w.assetInstanceId;p.reloading=!!s.reload;p.reloadT=s.reload?.remaining||0;p._shotsSinceReload=s.shots;}
    if(this.game.paused||this.game.buildOpen||(this.game.state&&this.game.state!=='play')||p.alive===false||input?.blocked||input?.focused===false){this.suspend();return true;}
    dt=Math.max(0,dt);s.cooldown-=dt;this.fireFrameEnd=this.time+dt;
    const down=actionDown(input,'fire');
    if(!down)s.quiet+=dt;
    if(this.blockHeld){if(!down)this.blockHeld=false;this.held=false;return true;}
    const clicked=actionHit(input,'fire'),pressed=clicked||(down&&!this.held),released=!down&&this.held;this.held=down;
    if(pressed||!down)s.cooldown=Math.max(0,s.cooldown);
    // 全武器自动换弹（试玩反馈："所有武器那个换弹都应该变成自动换弹，也就是我子弹为0，那它就自动换，
    // 不需要我再点一点，因为玩家一般是看到到 0 了，就会等它自动换"）。
    // 放在输入判定之前：打空的每一帧都会尝试进入装填；无备弹/法力时 beginReload 自身会拒绝。
    // 注意：不能用 reserve>0 作为前置条件 —— 备弹为 0 表示"无限备弹"，那样会把大多数枪排除掉。
    // 有备弹/法力的判断交给 beginReload 自己（有限备弹打空时它会直接拒绝，不会空转）。
    if(!this._freeMag(w)&&!(p.overdrive>0)&&w.mag<=0&&!s.reload){
      if(down||clicked)forgeFeed(p,w,1);
      if(w.mag<=0)this.beginReload(p,w);
    }
    if(actionHit(input,'reload'))this.beginReload(p,w);
    s.inputPressed=pressed;this.revisions.track(p,w,s,dt,{down,pressed,released});this.precision.track(p,w,s,dt,{down,pressed,released});
    this.energy.track(p,w,s,dt,{down,pressed,released});this.mechanical.track(p,w,s,dt,{down,pressed,released});
    if(s.reload&&this.precision.reloadStep(p,w,s,dt,{down,pressed}))return true;
    if(s.reload){s.cooldown=Math.max(0,s.cooldown);s.reload.remaining-=dt;p.reloadT=Math.max(0,s.reload.remaining);if(s.reload.remaining<=EPS)this._finishReload(p,w,s);return true;}
    if(this.revisions.input(p,w,s,dt,{down,pressed,released,clicked})||this.precision.input(p,w,s,dt,{down,pressed,released,clicked})||this.energy.input(p,w,s,dt,{down,pressed,released,clicked})||this.mechanical.input(p,w,s,dt,{down,pressed,released,clicked}))return true;
    s.spin=clamp((s.spin||0)+(down?dt/.55:-dt*1.6),0,1);
    if(id==='bell_sight'){
      const end=p.aimPoint||{x:p.x+p.aim.x*24,z:p.z+p.aim.z*24};const e=this._enemies().filter(e=>distance(e,p,end)<(e.r||e.radius||.5)+.1&&this._los(p,e)).sort((a,b)=>length(p,a)-length(p,b))[0];
      if(e){if(s.target!==key(e)){s.target=key(e);s.dwell=0;}s.dwell=(s.dwell||0)+dt;s.lost=0;}else{s.lost=(s.lost||0)+dt;if(s.lost>=.15){s.target=null;s.dwell=0;}}
    }
    if(id==='charge_nova'||id==='funnel_shotgun'){
      if((down||clicked)&&w.mag<=0&&!this._freeMag(w)&&!(p.overdrive>0)){this.beginReload(p,w);return true;}
      if(clicked&&!down&&!released&&s.cooldown<=EPS&&(w.mag>0||p.overdrive>0)){this._fire(p,w,s,0);s.charge=0;p.charge=0;return true;}
      if(down&&s.cooldown<=EPS&&(w.mag>0||p.overdrive>0))s.charge=clamp((s.charge||0)+dt*(p.hero?.ruleVersion===3&&p.hero.id==='forgewright'&&p.c2.forgeT>0?2:1)/(id==='charge_nova'?.85:.5),0,1);
      p.charging=down&&s.cooldown<=EPS;p.charge=s.charge||0;
      if(released&&s.cooldown<=EPS&&s.charge>0){this._fire(p,w,s,s.charge);s.charge=0;p.charge=0;}return true;
    }
    for(let action=0;action<4&&(down||clicked)&&s.cooldown<=EPS&&!(s.lock>EPS);action++){
      const need=id==='retrieval_saw'||(id==='reversible_breech'&&s.mode)?2:1;
      if(!this._freeMag(w)&&!(p.overdrive>0)&&w.mag<need){if(id==='braid_light')this._feed(p,w,s);else this.beginReload(p,w);}
      if(this._freeMag(w)||p.overdrive>0||w.mag>=need){if(!this._fire(p,w,s,0)){s.cooldown=Math.max(0,s.cooldown);break;}}else break;
      if(clicked&&!down)break;
    }
    return true;
  }
  _feed(p,w,s) { const cap=this._cap(p,w),take=this._mana(w)?cap:Math.min(cap,w.reserve);if(take<=0)return false;w.mag+=take;if(!this._mana(w))w.reserve-=take;s.cellIndex=(s.cellIndex||0)+1;this._feedback('feed',{weapon:w,cellIndex:s.cellIndex});return true; }
  _fire(p,w,s,charge) {
    if(!this.supports(w?.def)||p.alive===false)return false;
    const id=source(w),spec=SPECS[id],owner=w.assetInstanceId;
    const cooldownDebt=this.held&&!s.inputPressed?Math.min(0,s.cooldown):0;
    // v3 形态**优先于**旧机制： 链会在第一个非 null 处短路，
  // 而 precision 对 ring_shot 仍返回 v2 的 {count:6,spread:2} —— 放在链尾就永远轮不到。
  // revisions 只对 WEAPON_REVISIONS 里带 form 的武器作答，其余返回 null，因此放在链首是安全的。
  const config=this.revisions.prepare(p,w,s,charge)??this.precision.prepare(p,w,s,charge)??this.energy.prepare(p,w,s,charge)??this.mechanical.prepare(p,w,s,charge);if(config?.reject)return false;
    const relicAllowed=RELIC_PROJECTILE_IDS.includes(id),twinPossible=relicAllowed&&(p.stats?.twin||0)>0,flatExplosive=relicAllowed?Math.max(0,p.stats?.explosive||0):0;
    if(flatExplosive&&this._relicZoneCount()>=24)return false;
    const predicted=config?.count??(id==='shotgun_sapper'?8:id==='funnel_shotgun'?6:id==='reversible_breech'&&s.mode?3:1);
    if(!config?.lottery&&spec.cap>0&&this._globalCount('projectile')+predicted+(twinPossible?1:0)>420)return false;
    if((['laser_lance','kiln_ray','braid_light','prism_anchor','corner_prism','hinge_beam','thread_beam','aegis_lance','aperture_lamp','ember_seam'].includes(id))&&!this.lineAdmission(['corner_prism','aperture_lamp'].includes(id)?2:1))return false;
    const deploy=id==='beacon_furnace'&&!this._owned(owner,'unit').length;
    if(deploy){if(!this.deploymentAdmission([{kind:'unit',owner,ttl:12}]).ok)return false;const pt=p.aimPoint;if(!pt||length(p,pt)>16||!this._los(p,pt)||this._blocked(pt.x,pt.z))return false;}
    const heavy=['charge_nova','funnel_shotgun','shotgun_sapper','sniper_rail','laser_lance','arc_coil','orb_sling','line_scribe','rocket_hammer','grenade_lobber','retrieval_saw','prism_anchor','shuriken_launcher','frost_tile','conductive_sign','nail_collapse'].includes(id)||(id==='reversible_breech'&&s.mode===1);
    const need=config?.cost??(id==='retrieval_saw'||(id==='reversible_breech'&&s.mode)?2:1);
    if(!config?.lottery&&spec.cap>0&&this._owned(owner,'projectile').length+predicted+(twinPossible?1:0)>spec.cap)return false;
    const nativeRequests=!config?.lottery&&this.lottery.nativeRequests(id,config||{},charge,owner,{relicExplosive:flatExplosive});
    if(nativeRequests&&!this.creationAdmission(nativeRequests).ok)return false;
    const resourceAction=config?.ownerShot?'ownerShot':null;
    forgeFeed(p,w,need);
    const magBefore=w.mag,paid=this._pay(w,need,resourceAction?false:heavy||config?.heavy||predicted>1||(config?.pierce||0)>0,resourceAction?false:deploy||config?.deploy||config?.summon||config?.manaDeploy,resourceAction);if(!paid)return false;
    const twinBonus=twinPossible&&!!this.game.grc?.(Math.min(1,p.stats.twin));
    s.sequence++;const root=this._id('shot'),shot=this._mods(p,w,s,spec.damage,root,magBefore-w.mag);shot.paidCost=paid;if(this.revisions.claims(w))shot.manaPaid=this._mana(w);if(resourceAction){shot.followingAction=resourceAction;shot.bulletSize=p.stats?.bulletSize||1;}this.paidActions[root]={owner,cost:paid,refunded:0,end:this.time+20};
    // Fired form is presentation metadata: later reloads/hero damage mods cannot recolor a paid projectile.
    if(id==='reversible_breech')shot.visualForm=s.mode?'scatter':'straight';
    if(id==='funnel_shotgun')shot.visualForm=charge>=1-EPS?'focused':'scatter';
    this.precision.paid(p,w,s,shot,config||{},charge);
    this.energy.paid(p,w,s,shot,config||{},charge);this.mechanical.paid(p,w,s,shot,config||{},charge);
    const am=p.attachMods?.()||{},rate=(p.stats?.rate||1)*consumableModifiers(this.game).fireRateMult*(p.overdrive>0?2:1)*(1+(am.rate||0))*(id==='minigun_shredder'?.28+.72*s.spin:1);
    s.cooldown=(id==='reversible_breech'&&s.mode?.65:spec.cd)/Math.max(.05,rate);
    if(id==='kiln_ray')s.cooldown=spec.cd;
    if(id==='braid_light')s.cooldown=spec.cd/(p.overdrive>0?2:1);
    if(config?.fixedCooldown)s.cooldown=config.fixedCooldown;
    if(config?.minCooldown)s.cooldown=Math.max(s.cooldown,config.minCooldown);
    if(p.hero?.ruleVersion===3&&p.hero.id==='forgewright'&&p.c2.forgeT>0&&
        (id==='kiln_ray'||id==='braid_light'||config?.fixedCooldown||config?.minCooldown))s.cooldown*=.5;
    s.cooldown+=cooldownDebt;
    if(id==='escapement_smg'&&s.sequence%3===0)s.cooldown=Math.max(s.cooldown,(p.c2?.forgeT>0&&p.hero?.id==='forgewright')?.09:.18);
    if(id==='kiln_ray'){s.heat=(s.heat||0)+.2;if(s.heat>=1.2-EPS){s.lock=(p.c2?.forgeT>0&&p.hero?.id==='forgewright')?.4:.8;s.heat=1.2;}}
    if(id==='bell_sight'&&s.dwell>=.45){shot.dwellTarget=s.target;s.dwell=0;}
    if(id==='wax_seal'){shot.letter=!!s.phase;shot.target=s.target;shot.targetUntil=s.sealUntil;s.phase=1-(s.phase||0);if(shot.letter&&shot.target&&this.time<s.sealUntil)shot.damage=15*shot.mul;}
    if(id==='pistol_rusty'&&s.quiet>=.25)shot.accurate=true;
    if(id==='escapement_smg'&&s.sequence%3===1)shot.accurate=true;
    s.quiet=0;s.shots++;p._shotsSinceReload=s.shots;p.fireT=s.cooldown;
    this.game.emit?.('onShotFired',{weapon:w,def:w.def,paid:true,rootShotId:root});this._feedback('shot',{weapon:w,def:w.def,rootShotId:root,charge});
    if(this.revisions.fire(p,w,s,shot,config||{},charge)||this.precision.fire(p,w,s,shot,config||{},charge)||this.energy.fire(p,w,s,shot,config||{},charge)||this.mechanical.fire(p,w,s,shot,config||{},charge))return true;
    if(deploy){this._add({kind:'unit',owner,x:p.aimPoint.x,z:p.aimPoint.z,ttl:12,maxTTL:12,lastCommand:-1,color:w.def.color,shot});return true;}
    if(['laser_lance','kiln_ray','braid_light'].includes(id)){
      let start={x:p.x,z:p.z},d={...p.aim};
      if(id==='braid_light'){s.sideIndex=1-(s.sideIndex||0);s.phase=(s.phase||0)+.45;const side=s.sideIndex?1:-1,offset=side*(.35+.12*Math.sin(s.phase));start={x:p.x+p.aim.z*offset,z:p.z-p.aim.x*offset};}
      // 贯穿：激光束的"贯穿"= 同一条束最多结算几个目标。
      // 编辫光仪原来传 1 → 隔着一个敌人打后面那个不受伤（试玩实测反馈）。现给 4。
      this._beam(start,d,id==='kiln_ray'?14:spec.range,shot,w.def.color,
        id==='laser_lance'?Infinity:id==='braid_light'?4:1);return true;
    }
    let count=config?.count??(id==='shotgun_sapper'?8:id==='funnel_shotgun'?(charge>=1-EPS?3:6):id==='reversible_breech'&&s.mode?3:1);
    if(id==='funnel_shotgun'&&charge>=1-EPS)shot.damage*=2;
    if(id==='reversible_breech'&&s.mode)shot.damage=3*shot.mul;
    if(id==='charge_nova')shot.damage*=1+3.2*charge;
    // Echo snapshots one paid physical volley, not the final pellet's damage.
    // anchorMul excludes critical and last-shot multipliers; each pellet shares
    // this same immutable normalized root value after the count is known.
    shot.echoBaseDamage=(shot.damage/shot.mul)*shot.anchorMul*count;
    let spread=shot.accurate?0:(id==='funnel_shotgun'&&charge>=1-EPS?3:spec.spread)*shot.spreadMul*(.75+(p.moveAmount||0)*.55);
    if(id==='reversible_breech'&&s.mode)spread=15*shot.spreadMul;
    if(config?.spread!==undefined)spread=config.spread*shot.spreadMul;
    let pierce=id==='sniper_rail'?6:id==='line_scribe'?1:id==='shuriken_launcher'?32:0;
    if(id==='line_scribe'&&s.lastRay&&s.rayUntil>this.time){const d=s.lastRay;if(d.x*p.aim.x+d.z*p.aim.z>=Math.cos(4*Math.PI/180))pierce++;}
    if(config?.pierce!==undefined)pierce=config.pierce;
    let firstPrimary;
    for(let i=0;i<count;i++){
      const ang=Math.atan2(p.aim.x,p.aim.z)+(count>1?(i/(count-1)-.5)*2:(this.game.gr?.()??.5)-.5)*spread*Math.PI/180;
      const d={x:Math.sin(ang),z:Math.cos(ang)},base={kind:'projectile',owner,x:p.x,z:p.z,dx:d.x,dz:d.z,speed:spec.speed*shot.speedMul,ttl:spec.range/Math.max(.01,spec.speed),maxTTL:spec.range/Math.max(.01,spec.speed),range:spec.range*Math.min(2,Math.max(.25,shot.lifeMul)),traveled:0,radius:.13,hit:[],pierce:pierce+shot.pierce,bounce:Math.min(24,((id==='shuriken_launcher'?5:id==='grenade_lobber'?1:0)*(shot.buildContext?.bounceDouble?2:1))+shot.bounce),shot:{...shot,rootShotId:root,unitId:i},color:w.def.color};
      if(id==='rocket_hammer')Object.assign(base,{blast:34*shot.mul,blastRadius:3.2});
      // PASS B：orb_sling 原本 homing 2，是玩家看不出在追人的轻微修正。
      // 现在给到 3.5 的真转向；代价维持原样（弹速 13 很慢、伤害依赖爆炸）。
      if(id==='orb_sling')Object.assign(base,{blast:12*shot.mul,blastRadius:3.2,homing:6});
      // PASS B Bloodwrit: strong homing, it seeks by itself.
      if(id==='last_witness')Object.assign(base,{homing:4.5});
      if(id==='grenade_lobber')Object.assign(base,{blast:24*shot.mul,blastRadius:3.2,vy:5,arc:true,fuseOnly:true});
      if(id==='charge_nova')Object.assign(base,{blast:36*charge*shot.mul,blastRadius:3.2+(charge>=1-EPS?1.6:0)});
      if(id==='retrieval_saw')Object.assign(base,{ttl:4,maxTTL:4,range:24,turnAt:this.time+.5,target:{...(p.aimPoint||{x:p.x+d.x*10,z:p.z+d.z*10})},phase:'out',pierce:99});
      if(id==='frost_tile'){const dist=Math.min(14,length(p,p.aimPoint||{x:p.x+d.x*14,z:p.z+d.z*14}));base.range=dist;base.ttl=dist/base.speed;base.maxTTL=base.ttl;}
      if(shot.homing)base.homing=shot.homing;
      if(id==='wax_seal'&&shot.letter){base.targetId=shot.target;base.targetUntil=shot.targetUntil;base.homing=2;base.speed=12;}
      const heroOpt={damage:base.shot.damage,pierce:base.pierce,bounce:base.bounce,speed:base.speed,statuses:base.shot.statuses,color:base.color,homing:base.homing};p.hero?.hook?.shotMods?.(p,heroOpt,i===0);base.shot.damage=heroOpt.damage;base.pierce=heroOpt.pierce;base.bounce=heroOpt.bounce;base.speed=heroOpt.speed;base.shot.statuses=heroOpt.statuses;base.resonant=!!heroOpt.resonant;base.color=heroOpt.color;base.homing=heroOpt.homing;base.radius*=p.stats?.bulletSize||1;
      if(!base.fuseOnly&&id!=='retrieval_saw'){base.ttl=Math.min(10,base.range/Math.max(.01,base.speed)*shot.lifeMul);base.maxTTL=base.ttl;}
      this.precision.projectile(base,p,w,s,config||{},i,count);
      this.energy.projectile(base,p,w,s,config||{},i,count);this.mechanical.projectile(base,p,w,s,config||{},i,count);
      if(flatExplosive&&!base.blast)base.relicExplosive=flatExplosive*shot.mul;
      if(!firstPrimary)firstPrimary=base;this._add(base);
    }
    if(twinBonus&&firstPrimary){const b=firstPrimary;this._add({kind:'projectile',owner,x:b.x,y:b.y??.8,z:b.z,dx:b.dx,dz:b.dz,speed:b.speed,ttl:b.ttl,maxTTL:b.maxTTL,range:b.range,traveled:0,radius:b.radius,hit:[],pierce:0,bounce:0,secondary:true,relicBonus:true,color:b.color,shot:{...shot,damage:spec.damage*shot.mul,crit:false,statuses:{},intrinsicStatuses:{},chain:0,noRefund:true,unitId:count}});}
    return true;
  }
  unitDamageFeedback(entity) {
    return {feedbackCategory:'unit',feedbackSourceInstanceId:`weapon-unit:${entity.owner}:${entity.id}`,feedbackRootShotId:null};
  }
  _damage(target,shot,damage=shot.damage,secondary=false,dir=shot.direction,feedback={}) {
    if(!target?.alive||damage<=0)return 0;
    if(Object.keys(feedback).length)shot={...shot,feedbackContext:{...(shot.feedbackContext||{}),...feedback}};
    if(secondary)damage*=((shot.baseSecondaryMul??shot.mul)/(shot.mul||1));
    const continuous=!secondary&&['kiln_ray','braid_light','hinge_beam','thread_beam'].includes(shot.weaponId);
    const shieldBefore=!!target.shieldBroken,applied=this.world.onDamage(target,damage,{...damageSource(shot),source:'weapon_asset',sourceInstanceId:shot.owner,rootShotId:shot.rootShotId,...(continuous?{feedbackRootShotId:null}:{}),...(shot.feedbackContext||{}),...feedback,buildContext:shot.buildContext?{...shot.buildContext,lifesteal:secondary?shot.buildContext.relicLifesteal??0:shot.buildContext.lifesteal}:undefined,buildChain:!!feedback.buildChain,assetSecondary:secondary,assetNoRefund:!!shot.noRefund,assetShot:shot,statuses:secondary?(feedback.buildChain&&shot.buildContext?.chainPoison?{poison:Math.max(2,shot.statuses?.poison||0)}:shot.intrinsicStatuses||{}):shot.statuses,crit:!secondary&&shot.crit,dir,ignoreShield:!!shot.explosion,knock:target.isBoss?0:shot.knock});this.precision.outcome(target,applied,shot,secondary,shieldBefore);
    if(applied>0){
      if(this.visualEvents.length>=64)this.visualEvents.shift();
      this.visualEvents.push({id:`impact:${++this.visualSerial}`,kind:'impact',owner:shot.owner,weaponId:shot.weaponId,x:target.x,y:target.y??.85,z:target.z,created:this.time,end:this.time+.22,maxTTL:.22,color:this.weapons.get(shot.owner)?.def.color});
    }
    return applied;
  }
  beforeDamage(target,damage,opts={}) {
    const shot=opts.assetShot||opts.bullet?.assetShot;if(!shot||opts.assetSecondary)return {damage,opts};
    const s=this.states[shot.owner];if(!s)return {damage,opts};
    damage=this.precision.beforeDamage(target,damage,shot,s,opts);
    damage=this.energy.beforeDamage(target,damage,shot,s,opts);damage=this.mechanical.beforeDamage(target,damage,shot,s,opts);
    // 重锤手枪（PASS B）：裂口印**不再限时、不再要求横移** —— 打中同一只就兑现，间隔一拍即读得懂。
    if(shot.weaponId==='pistol_heavy'){const mark=s.marks[0];if(mark&&mark.target===key(target)){damage+=5*shot.mul;opts={...opts,assetCash:true};}}
    if(shot.weaponId==='bell_sight'&&shot.dwellTarget===key(target))damage+=8*shot.mul;
    return {damage,opts};
  }
  afterDamage(target,applied,opts={}) {
    const shot=opts.assetShot||opts.bullet?.assetShot;if(!shot||opts.assetSecondary||!(applied>0))return;
    const s=this.states[shot.owner];if(!s)return;const id=shot.weaponId,t=key(target);
    this.precision.afterDamage(target,applied,shot,s,opts);
    this.energy.afterDamage(target,applied,shot,s,opts);this.mechanical.afterDamage(target,applied,shot,s,opts);
    let arcChain=0;
    if(shot.arcCore){
      const roots=s.arcHitRoots||(s.arcHitRoots={});
      if(!roots[shot.rootShotId]){
        roots[shot.rootShotId]=this.time+10;
        if(s.arcPendingRoot&&s.arcPendingRoot!==shot.rootShotId||this.time-(s.arcHitAt??-10)>.6)s.arcStreak=0;
        s.arcPendingRoot=null;s.arcHitAt=this.time;s.arcStreak=(s.arcStreak||0)+1;
        if(s.arcStreak>=2){arcChain=1;s.arcStreak=0;}
      }
    }
    if((shot.chain>0||arcChain)&&id!=='arc_coil'){
      const roots=s.chainRoots||(s.chainRoots={});
      if(!roots[shot.rootShotId]){roots[shot.rootShotId]=this.time+10;let from=target;const used=new Set([t]);for(let i=0;i<Math.min(2,shot.chain+arcChain);i++){const e=this._enemies().filter(e=>!used.has(key(e))&&length(from,e)<=6&&this._los(from,e)).sort((a,b)=>length(from,a)-length(from,b))[0];if(!e)break;used.add(key(e));if(this._beamVisual(from,e,shot.owner))this._damage(e,shot,shot.damage*.72,true,unit(e.x-from.x,e.z-from.z),{buildChain:true});from=e;}}
    }
    if(id==='pistol_heavy')s.marks=opts.assetCash?[]:[{target:t}];
    // Room-owned Halt Prism: the next frame reads this source before world updates.
    if(id==='prism_anchor'){
      this.prismField={owner:shot.owner,remaining:3,at:{x:target.x,z:target.z},hit:key(target)};
    }
    if(id==='line_scribe'){s.lastRay=shot.direction;s.rayUntil=this.time+.7;this._add({kind:'line',owner:shot.owner,x:shot.origin.x,z:shot.origin.z,dx:shot.direction.x,dz:shot.direction.z,length:length(shot.origin,target),ttl:.7,maxTTL:.7,phase:'afterimage'});}
    if(id==='nail_collapse'&&!s.marks.some(m=>m.target===t)){if(s.marks.length>=4)s.marks.shift();s.marks.push({target:t,shot});}
    if(id==='conductive_sign'){
      if(shot.sequence%4===0&&s.marks.some(m=>m.target===t)){const marks=s.marks.splice(0);let from=target;for(const m of marks){const e=this._enemy(m.target);if(e&&this._los(from,e)){this._damage(e,shot,8*shot.mul,true,unit(e.x-from.x,e.z-from.z),{buildChain:true});from=e;}}}
      else if(!s.marks.some(m=>m.target===t)){if(s.marks.length>=3)s.marks.shift();s.marks.push({target:t});}
    }
    if(id==='wax_seal'&&!shot.letter){s.target=t;s.sealUntil=this.time+4;}
    if(id==='arc_coil'){
      let from=target;const used=new Set([t]);for(let i=0;i<2;i++){const e=this._enemies().filter(e=>!used.has(key(e))&&length(from,e)<=6&&this._los(from,e)).sort((a,b)=>length(from,a)-length(from,b))[0];if(!e)break;used.add(key(e));if(this._beamVisual(from,e,shot.owner))this._damage(e,shot,5.04*shot.mul,true,unit(e.x-from.x,e.z-from.z),{buildChain:true});from=e;}
    }
    if(id==='beacon_furnace'&&this.active===shot.owner){const beacon=this._owned(shot.owner,'unit')[0],w=this.weapons.get(shot.owner);if(beacon&&w&&this.time-beacon.lastCommand>=.5-EPS&&w.reserve>=1&&this._los(beacon,target)){
      const d=unit(target.x-beacon.x,target.z-beacon.z),child=this._add({kind:'projectile',owner:shot.owner,x:beacon.x,z:beacon.z,dx:d.x,dz:d.z,speed:24,ttl:16/24,maxTTL:16/24,range:16,traveled:0,radius:.12,hit:[],pierce:0,bounce:0,secondary:true,feedbackContext:this.unitDamageFeedback(beacon),shot:{...shot,damage:3*shot.mul},color:beacon.color});if(child){w.reserve--;beacon.lastCommand=this.time;}}}
  }
  _beamVisual(a,b,owner,color,width=.135,metadata={}) {const d=length(a,b)>EPS?unit(b.x-a.x,b.z-a.z):{x:1,z:0};return this._add({kind:'line',owner,x:a.x,z:a.z,dx:d.x,dz:d.z,length:length(a,b),ttl:.12,maxTTL:.12,color,width,...metadata});}
  _beamHalfWidth(shot){return .09*(shot.beamWidth??1)*(BEAM_WIDTH_MUL[shot.lottery?.borrowId??shot.weaponId]??1);}
  _beam(start,d,range,shot,color,maxHits,secondary=false,width=null) {
    let len=0;while(len<range){const n=Math.min(range,len+.1),x=start.x+d.x*n,z=start.z+d.z*n,prop=this.world.propHit?.(x,z,.12,.8);if(prop){this.world.onPropHit?.(prop,shot.damage,x,.8,z,{assetShot:shot});break;}if(this._blocked(x,z))break;len=n;}
    const halfWidth=width??this._beamHalfWidth(shot),end={x:start.x+d.x*len,z:start.z+d.z*len};if(!this._beamVisual(start,end,shot.owner,color,halfWidth,shot.lottery?{shot,mechanic:'lottery:beam'}:{}))return;
    const hits=this._enemies().filter(e=>distance(e,start,end)<=(e.r||e.radius||.5)+halfWidth&&this._los(start,e)).sort((a,b)=>length(start,a)-length(start,b)).slice(0,maxHits);
    for(const e of hits)this._damage(e,shot,shot.damage,secondary,d);
  }
  _explode(e,damage=e.blast,radius=e.blastRadius) {
    damage*=e.shot.explosiveMul??1;radius*=e.shot.blastRadiusMul??1;
    if(!(damage>0))return;const killsBefore=this.game.run?.kills||0;this._add({kind:'zone',phase:'explosion',owner:e.owner,x:e.x,z:e.z,radius,ttl:.25,maxTTL:.25,color:e.color,...(e.shot.lottery?{shot:e.shot}:{})},{consumeSource:e.id});
    const state=this.states[e.owner],salvo=state&&(state.salvoHits||(state.salvoHits={})),used=e.salvoBlast?(salvo[e.shot.rootShotId]||(salvo[e.shot.rootShotId]=[])):null;
    for(const t of this._enemies()){const dist=length(e,t),r=radius+(t.r||t.radius||.5);if(dist<=r&&(!e.wallOcclusion||this._los(e,t))&&(!used||!used.includes(key(t)))){used?.push(key(t));this._damage(t,{...e.shot,explosion:true},damage*(1-Math.min(1,dist/r)*.65),true,unit(t.x-e.x,t.z-e.z),e.feedbackContext||(e.kind==='unit'?this.unitDamageFeedback(e):{}));}}
    const info={x:e.x,y:e.y||.8,z:e.z,radius,damage:damage*((e.shot.baseSecondaryMul??e.shot.mul)/(e.shot.mul||1)),sourceInstanceId:e.owner,rootShotId:e.shot.rootShotId,owner:this.player,shot:e.shot,killsBefore,secondaryOnly:!!e.shot.secondaryExplosion,mechanic:e.mechanic};
    if(this.world.weaponAssetExplosionFeedback)this.world.weaponAssetExplosionFeedback(info);else if(!e.shot.secondaryExplosion)this.game.emit?.('onExplosion',{...info,team:0});
  }
  _endProjectile(e) {if(e.ended)return;e.ended=true;if(!e.relicBonus){this.precision.end(e);this.energy.end(e);this.mechanical.end(e);this.lottery.end(e);}if(e.relicExplosive&&(e.hit.length||e.propHits?.length||e.hitWall)){const s=this.states[e.owner];s.relicBlastRoots??={};if(!s.relicBlastRoots[e.shot.rootShotId]){s.relicBlastRoots[e.shot.rootShotId]=this.time+30;this._add({kind:'delayed',mechanic:'relic-blast',owner:e.owner,x:e.x,y:e.y,z:e.z,ttl:30,maxTTL:30,shot:{...e.shot,statuses:{},intrinsicStatuses:{},crit:false},blast:e.relicExplosive,radius:3.2});}}if(e.shot.arcCore){const state=this.states[e.owner];if(state&&!state.arcHitRoots?.[e.shot.rootShotId]&&!this.entities.some(q=>q!==e&&!q.ended&&q.shot?.rootShotId===e.shot.rootShotId))state.arcStreak=0;}if(e.blast)this._explode(e);if(e.shot.weaponId==='frost_tile'){const tiles=this._owned(e.owner,'zone').filter(t=>t.mechanic==='frost');void tiles;   /* 无上限（试玩要求）：不再挤掉最早的霜砖 */ this._add({kind:'zone',mechanic:'frost',owner:e.owner,x:e.x,z:e.z,radius:3,ttl:2.5,maxTTL:2.5,nextTick:this.time+.5,end:this.time+2.5,shot:e.shot,color:e.color});}}
  _stepProjectile(e,dt) {
    if(!e.relicBonus&&(this.precision.step(e,dt)||this.energy.step(e,dt)||this.mechanical.step(e,dt)))return;
    const id=e.shot.weaponId,p=this.player;
    if(id==='retrieval_saw'){
      if(e.phase==='out'&&(this.time>=e.turnAt||length(e,e.target)<.3||e.traveled>=10)){e.phase='return';e.hit=[];e.shot={...e.shot,damage:5*e.shot.mul};}
      if(e.phase==='return'&&p){if(length(e,p)<=.8){const w=this.weapons.get(e.owner);if(w&&!e.refunded){const refund=this.claimRefund(e.owner,e.shot.rootShotId,1);if(this._mana(w))w.reserve=Math.min(manaRefundCap(p,w),w.reserve+refund);else w.mag=Math.min(this._cap(p,w),w.mag+refund);e.refunded=true;}e.ended=true;return;}const d=unit(p.x-e.x,p.z-e.z);e.dx=d.x;e.dz=d.z;}
    }
    // 两阶段追踪（试玩要求）：先沿准星直飞 `homingAfter` 距离（例如血证者 5 个地砖＝10 单位），
    // 之后才进入吸附；避免"锁到不是玩家想打的那只"。
    // `correctionTargetAllowed` 来自 PASS A（tracking.js）的追踪目标合法性过滤 —— 合并后保留。
    if(e.homing&&e.traveled>=(e.homingAfter??0)){const target=e.targetId?(this.time<e.targetUntil?this._enemy(e.targetId):null):this._enemies().filter(t=>length(t,e)<=(e.homingRange??14)&&this._los(e,t)&&correctionTargetAllowed(e,t)).sort((a,b)=>length(a,e)-length(b,e))[0];if(target&&correctionTargetAllowed(e,target)){const d=unit(target.x-e.x,target.z-e.z),u=unit(e.dx+(d.x-e.dx)*Math.min(1,dt*e.homing),e.dz+(d.z-e.dz)*Math.min(1,dt*e.homing));e.dx=u.x;e.dz=u.z;}}
    if(e.arc){e.vy-=9.8*dt;e.y=Math.max(.15,e.y+e.vy*dt);if(e.y<=.15)e.vy=Math.abs(e.vy)*.55;}
    const travel=Math.min(e.speed*dt,Math.max(0,e.range-e.traveled)),steps=Math.max(1,Math.ceil(travel/.12)),step=travel/steps;
    for(let i=0;i<steps&&!e.ended;i++){
      const from={x:e.x,z:e.z},to={x:e.x+e.dx*step,z:e.z+e.dz*step};
      const prop=this.world.propHit?.(to.x,to.z,e.radius,e.y);
      if(prop&&!e.propHits?.includes(prop.id||`${to.x}:${to.z}`)){const propKey=prop.id||`${to.x}:${to.z}`;(e.propHits||(e.propHits=[])).push(propKey);this.world.onPropHit?.(prop,e.shot.damage,to.x,e.y,to.z,{assetShot:e.shot});}
      if(prop||this._blocked(to.x,to.z,e.radius*.6,e.y)){
        e.hitWall=true;if(!e.relicBonus)this.precision.wall(e,from,to,{prop,solid:!prop&&this._blocked(to.x,to.z,e.radius*.6,e.y)});
        this.energy.wall(e,from,to,{prop,solid:!prop&&this._blocked(to.x,to.z,e.radius*.6,e.y)});
        if(e.bounce>0){e.bounce--;e.bounceCount=(e.bounceCount||0)+1;const bx=this._blocked(to.x,from.z,e.radius*.6,e.y),bz=this._blocked(from.x,to.z,e.radius*.6,e.y);if(bx&&!bz)e.dx=-e.dx;else if(bz&&!bx)e.dz=-e.dz;else{e.dx=-e.dx;e.dz=-e.dz;}if(!e.relicBonus)this.precision.bounce(e,bx,bz);if(e.resonant&&e.bounceCount===1)e.shot.damage*=1.18;else if(id==='shuriken_launcher'&&!e.shot.buildContext?.noBounceSlow)e.speed*=.92;if(!e.secondary)this.game.emit?.('onProjectileBounce',{bullet:e,x:e.x,z:e.z});}
        else if(e.fuseOnly)e.speed=0;else this._endProjectile(e);
      }else{
        e.x=to.x;e.z=to.z;
        if(this.energy.interceptProjectile(e)||this.mechanical.intercept(e)){e.ended=true;break;}
        const hits=this._enemies().filter(t=>!e.hit.includes(key(t))&&distance(t,from,to)<=(t.r||t.radius||.5)+e.radius&&(!(t.minY!==undefined)||e.y>=t.minY)).sort((a,b)=>closest(a,from,to).t-closest(b,from,to).t);
        for(const t of hits){if(['fuse_lantern','grenade_lobber'].includes(id)&&e.hit.length)break;if(!e.relicBonus&&this.precision.preHit(e,t)===false)break;e.hit.push(key(t));this._damage(t,{...e.shot,hitIndex:e.hit.length-1},id==='line_scribe'&&e.hit.length>1?8*e.shot.mul:e.shot.damage,!!e.secondary,{x:e.dx,z:e.dz},e.feedbackContext);if(!e.relicBonus)this.precision.postHit(e,t);if(!e.secondary)this.game.emit?.('onProjectileHit',{bullet:e,target:t,bounced:!!e.bounceCount,bounceCount:e.bounceCount||0});if(!e.fuseOnly&&e.hit.length>e.pierce){this._endProjectile(e);break;}}
      }
      e.traveled+=step;
      if(!e.relicBonus){this.precision.travel(e);this.mechanical.travel(e);}
    }
    if(e.traveled>=e.range-EPS&&!e.fuseOnly&&!this.mechanical.atRange(e))this._endProjectile(e);
  }
  _anchorHits(e,start,end) {
    const a={x:e.x,z:e.z},b={x:e.x+e.dx*e.length,z:e.z+e.dz*e.length},hits=[],halfWidth=e.width??.09;
    const contact=(p,q)=>{
      const pairs=[[closest(p,a,b),p],[closest(q,a,b),q],[a,closest(a,p,q)],[b,closest(b,p,q)]];
      const ax=b.x-a.x,az=b.z-a.z,bx=q.x-p.x,bz=q.z-p.z,den=ax*bz-az*bx;
      if(Math.abs(den)>EPS){const dx=p.x-a.x,dz=p.z-a.z,u=(dx*bz-dz*bx)/den,v=(dx*az-dz*ax)/den;if(u>=0&&u<=1&&v>=0&&v<=1){const at={x:a.x+u*ax,z:a.z+u*az};pairs.push([at,at]);}}
      return pairs.sort((u,v)=>length(u[0],u[1])-length(v[0],v[1]))[0];
    };
    for(const t of this._enemies()){
      let hit=false;const paths=this.history.filter(h=>h.target===key(t)&&h.end>start+EPS&&h.start<end+EPS);
      for(const h of paths){const den=h.end-h.start||1,lo=clamp((Math.max(start,h.start)-h.start)/den,0,1),hi=clamp((Math.min(end,h.end)-h.start)/den,0,1),p={x:h.a.x+(h.b.x-h.a.x)*lo,z:h.a.z+(h.b.z-h.a.z)*lo},q={x:h.a.x+(h.b.x-h.a.x)*hi,z:h.a.z+(h.b.z-h.a.z)*hi};const [foot,center]=contact(p,q);if(length(foot,center)<=(t.r||t.radius||.5)+halfWidth&&this._los(foot,center)){hit=true;break;}}
      if(!paths.length)hit=distance(t,a,b)<=(t.r||t.radius||.5)+halfWidth&&this._los(closest(t,a,b),t);
      if(hit){const foot=closest(t,a,b),normal=unit(t.x-foot.x,t.z-foot.z);if(Math.abs(normal.x)+Math.abs(normal.z)<EPS){normal.x=-e.dz;normal.z=e.dx;}hits.push({target:key(t),dir:normal});}
    }return hits;
  }
  prepareTimeEffects(dt) {
    if(this._timeEffectsBlocked(dt))return 1;
    const F=this.prismField;if(!F)return 1;
    // The source active at frame start covers that frame. Its remaining clock
    // advances once in unscaled play seconds, never while the room is dormant.
    for(const t of this._enemies()){let strength=length(t,F.at)<=4.5?.5:.3;
      if(key(t)===F.hit)strength=.7;
      if(t.isBoss)strength=Math.min(strength,.3);else if(t.elite)strength=Math.min(strength,.5);
      t.applyStatus?.('slow',.15,{strength});}
    F.remaining=Math.max(0,F.remaining-dt);if(F.remaining<=EPS)this.clearPrismField({refresh:false});
    return .7;
  }
  _timeEffectsBlocked(dt) {return this.game.paused||this.game.buildOpen||this.game.panelOpen?.()||this.game.revivalPending||this.game._stageBossPending||this.game.storageFrozen?.()||(this.game.state&&this.game.state!=='play')||!Number.isFinite(dt)||dt<0;}
  update(dt,{timeEffectsPrepared=false}={}) {
    if(this._timeEffectsBlocked(dt))return;
    if(!timeEffectsPrepared){const active=!!this.prismField;this.prepareTimeEffects(dt);if(active&&!this.prismField)this._refreshTimeEffectChannels();}
    const old=this.time;this.time+=dt;
    for(const t of this._enemies()){const id=key(t),a=this.positions[id]||{x:t.x,z:t.z};this.history.push({target:id,start:old,end:this.time,a,b:{x:t.x,z:t.z}});this.positions[id]={x:t.x,z:t.z};}
    for(const s of Object.values(this.states)){if(s.kilnCool>0)s.kilnCool=Math.max(0,s.kilnCool-dt);s.lock=Math.max(0,(s.lock||0)-dt);if(!(this.active&&s===this.states[this.active]&&this.held))s.heat=Math.max(0,(s.heat||0)-dt);if(s.lock<=EPS&&s.heat>=1.2-EPS)s.heat=0;s.marks=(s.marks||[]).filter(m=>this._enemy(m.target)&&(!m.until||m.until>=this.time));for(const ledger of [s.chainRoots,s.arcHitRoots])for(const [root,end]of Object.entries(ledger||{}))if(end<this.time)delete ledger[root];for(const [root,end]of Object.entries(s.relicBlastRoots||{}))if(end<this.time)delete s.relicBlastRoots[root];}
    for(const e of [...this.entities]){
      if(!this.entities.includes(e))continue;
      if(e.mechanic==='relic-blast'){if(this._metrics().entities.filter(v=>v.kind==='zone'&&!v.ended&&v.ttl>0).length<24){this._explode(e,e.blast,e.radius);e.ended=true;}else{e.ttl-=dt;if(e.ttl<=EPS){e.ended=true;this.diagnostics.push('Relic blast visual capacity timeout');}}continue;}
      if(this.revisions.entity(e,dt)||this.precision.entity(e,dt)||this.energy.entity(e,dt)||this.mechanical.entity(e,dt))continue;
      if(e.kind==='projectile'){this._stepProjectile(e,Math.min(dt,Math.max(0,e.ttl)));e.ttl-=dt;if(e.ttl<=EPS)this._endProjectile(e);continue;}
      if(e.mechanic==='anchor'){
        const end={x:e.x+e.dx*e.length,z:e.z+e.dz*e.length};if(!this._los(e,end)){this._remove(e.id);continue;}
        while(e.nextTick<=Math.min(this.time,e.end)+EPS){this.queue.push({time:e.nextTick,owner:e.owner,shot:e.shot,hits:this._anchorHits(e,e.lastTick,e.nextTick),damage:e.shot.damage,anchor:true});e.lastTick=e.nextTick;e.nextTick+=.25;}
      }
      if(e.mechanic==='frost')while(e.nextTick<=Math.min(this.time,e.end)+EPS){this.queue.push({time:e.nextTick,owner:e.owner,shot:e.shot,hits:this._enemies().filter(t=>length(e,t)<=e.radius+(t.r||t.radius||.5)).map(t=>({target:key(t),dir:unit(t.x-e.x,t.z-e.z)})),damage:.75*e.shot.mul,frost:true,interval:.5,ledgerPrefix:'frost:'});e.nextTick+=.5;}
      if(e.kind==='anchor')continue;
      e.ttl-=dt;if(e.kind==='delayed'&&e.ttl<=EPS)this._explode(e,e.blast*e.shot.mul,e.radius);
    }
    this.queue.sort((a,b)=>a.time-b.time);let batches=0;
    while(this.queue.length&&batches<4){const stamp=this.queue[0].time,batch=[];while(this.queue.length&&Math.abs(this.queue[0].time-stamp)<EPS)batch.push(this.queue.shift());batches++;
      batch.sort((a,b)=>b.damage-a.damage);
      for(const job of batch)for(const h of job.hits){const t=this._enemy(h.target);if(!t)continue;const ledger=this.ledger[job.owner]||(this.ledger[job.owner]={}),ledgerKey=(job.ledgerPrefix||'')+h.target,interval=job.anchor?.25:job.interval;if(interval&&ledger[ledgerKey]!==undefined&&stamp-ledger[ledgerKey]<interval-EPS)continue;if(interval)ledger[ledgerKey]=stamp;
        let tickShot=job.shot,tickDamage=job.damage;if(job.frost){for(const tile of this.entities.filter(e=>e.mechanic==='frost'&&e.owner===job.owner&&e.created<=stamp&&e.end>=stamp&&length(e,t)<=e.radius+(t.r||t.radius||.5))){if((tile.shot.baseSecondaryMul??tile.shot.mul)>(tickShot.baseSecondaryMul??tickShot.mul)){tickShot=tile.shot;tickDamage=.75*tickShot.mul;}}}this._damage(t,tickShot,tickDamage,true,h.dir);
      }
    }
    this.entities=this.entities.filter(e=>!e.ended&&(e.kind==='anchor'||e.ttl>EPS));
    this._refreshGroundSlow();
    this.entities=this.entities.filter(e=>e.kind!=='anchor'||this.time-e.created<5-EPS||this.entities.some(l=>l.mechanic==='anchor'&&(l.a===e.id||l.b===e.id)));
    for(const a of this.entities.filter(e=>e.kind==='anchor'))a.ttl=Math.max(0,5-(this.time-a.created),...this.entities.filter(l=>l.mechanic==='anchor'&&(l.a===a.id||l.b===a.id)).map(l=>l.ttl));
    this.history=this.history.filter(h=>h.end>=this.time-.5);
    for(const [root,txn] of Object.entries(this.paidActions))if(txn.end<this.time){if(this.states[txn.owner]?.lastLotteryShot?.rootShotId===root)delete this.states[txn.owner].lastLotteryShot;delete this.paidActions[root];}
  }
  visualState() {
    const result=this.entities.filter(e=>e.kind!=='delayed').map(e=>({...e,sourceInstanceId:e.owner}));
    result.push(...this.precision.visual(),...this.energy.visual(),...this.mechanical.visual());
    for(const [owner,s] of Object.entries(this.states)){for(const m of s.marks||[]){const e=this._enemy(m.target);if(e)result.push({id:`mark:${owner}:${m.target}`,kind:'mark',x:e.x,z:e.z,y:1.3,ttl:m.until?m.until-this.time:1,maxTTL:1,sourceInstanceId:owner});}if(s.weaponId==='bell_sight'&&s.target){const e=this._enemy(s.target);if(e)result.push({id:`dwell:${owner}`,kind:'mark',x:e.x,z:e.z,y:1.3,phase:Math.min(1,(s.dwell||0)/.45),ttl:1,maxTTL:1});}}
    // 蓄力反馈（试玩反馈：蓄力类武器“玩家不知道在蓄力、断节奏”）：
    // 资产武器只写 p.charging / p.charge，却没有任何可见反馈 —— 与 bell_sight 的 dwell 属同一类“数据有、消费点没写”。
    // 这里把蓄力进度作为一个 mark 图元交给渲染层，由 weapon_assets_fx 的 mark 分支画成随进度涨满的环。
    {const pw=this.weapons.get(this.active),pl=this.player;
      if(pw&&pl&&pl.charging&&pl.charge>0&&this.supports(pw.def)){
        const aim=pl.aim||{x:0,z:1};
        result.push({id:`charge:${this.active}`,kind:'mark',x:pl.x+aim.x*1.15,z:pl.z+aim.z*1.15,y:.9,phase:Math.max(0,Math.min(1,pl.charge)),ttl:1,maxTTL:1,sourceInstanceId:this.active});
      }}
    // 陨石可见飞行（美术缺口）：`kind:'delayed'` 的陨石此前被整体过滤掉，
    // 于是灾厄法杖/陨星迫击炮的陨石只有落地那一下、天花板到地面之间什么都没有。
    // 这里把它作为独立的 `meteor` 图元交给渲染层，带下落进度。
    for(const e of this.entities){if(e.kind!=='delayed'||e.mechanic!=='meteor'||e.ended)continue;
      const total=e.maxTTL||1,prog=1-Math.max(0,Math.min(1,e.ttl/total));
      result.push({id:`meteor:${e.id}`,kind:'meteor',owner:e.owner,sourceInstanceId:e.owner,x:e.x,z:e.z,y:e.y??0,
        radius:e.radius||2,progress:prog,color:e.color||'#ff8a3c',ttl:e.ttl,maxTTL:total});}
    this.visualEvents=this.visualEvents.filter(e=>e.end>this.time);
    result.push(...this.visualEvents.map(e=>({...e,ttl:e.end-this.time})));
    return result.map(e=>{
      const owner=e.owner||e.sourceInstanceId,state=this.states[owner],weapon=this.weapons.get(owner);
      return {...e,weaponId:e.shot?.weaponId||e.weaponId||state?.weaponId,sourceInstanceId:owner,visualTime:this.time,isSpell:weapon?.def.ammoType==='mana'};
    });
  }
  capture() { return clone({version:2,time:this.time,serial:this.serial,entities:this.entities,queue:this.queue,states:this.states,positions:this.positions,history:this.history,ledger:this.ledger,paidActions:this.paidActions,prismField:this.prismField}); }
  restore(snapshot,{preserveWeaponState=false,resumeRuntime=false}={}) {
    const fields=['version','time','serial','entities','queue','states','positions','history','ledger','paidActions','prismField'];
    if(!snapshot||typeof snapshot!=='object'||Object.keys(snapshot).some(k=>!fields.includes(k)))throw Error('Unknown weapon runtime snapshot field');
    this.lottery.validateRaw(snapshot);
    const s=clone(snapshot);
    s.paidActions ||= {};
    function valid(v,depth=0){if(depth>30)return false;if(typeof v==='number')return Number.isFinite(v);if(Array.isArray(v))return v.length<=20000&&v.every(x=>valid(x,depth+1));if(v&&typeof v==='object')return Object.keys(v).length<=20000&&Object.entries(v).every(([k,x])=>!['__proto__','constructor','prototype'].includes(k)&&(k!=='correctionOnly'||validCorrectionIdentity(x))&&valid(x,depth+1));return ['string','boolean','undefined'].includes(typeof v)||v===null;}
    if(!valid(s)||s.version!==2||!(s.time>=0)||!Number.isSafeInteger(s.serial)||s.serial<0||!Array.isArray(s.entities)||!Array.isArray(s.queue)||!s.states||!s.positions||!Array.isArray(s.history)||!s.ledger)throw Error('Invalid weapon runtime snapshot');
    const ids=new Set();for(const e of s.entities){if(typeof e.id!=='string'||!e.id||ids.has(e.id)||typeof e.owner!=='string'||!Object.hasOwn(s.states,e.owner)||!['projectile','line','anchor','zone','unit','mark','preview','delayed'].includes(e.kind)||!Number.isFinite(e.x)||!Number.isFinite(e.z)||!(e.ttl>=0))throw Error('Invalid weapon entity');ids.add(e.id);}
    for(const state of Object.values(s.states)){
      if(state.version!==2||typeof state.weaponId!=='string'||!Object.hasOwn(SPECS,state.weaponId)||!Array.isArray(state.marks)||!Number.isFinite(state.cooldown)||state.cooldown< -60)throw Error('Invalid weapon state');
      if(!this.supports(savedWeaponDefinition({id:state.weaponId,definitionVersion:state.definitionVersion===undefined?2:state.definitionVersion})))throw Error('Invalid installed weapon state');
      for(const field of ['sequence','shots','heat','spin','lock','mode','quiet'])if(!Number.isFinite(state[field])||state[field]<0)throw Error('Invalid weapon state number');
      if(state.charge!==undefined&&(!Number.isFinite(state.charge)||state.charge<0))throw Error('Invalid weapon charge');
      if(state.reload&&(!Number.isFinite(state.reload.remaining)||state.reload.remaining<0))throw Error('Invalid weapon reload');
    }
    if(Object.hasOwn(snapshot,'prismField')&&snapshot.prismField!==null){
      // Validate before JSON normalization too: present undefined/unknown keys
      // must not disappear and turn a malformed new field into a legacy default.
      const F=snapshot.prismField,owner=s.states[F?.owner];
      if(!F||typeof F!=='object'||Object.getPrototypeOf(F)!==Object.prototype||Object.keys(F).length!==4||Object.keys(F).some(k=>!['owner','remaining','at','hit'].includes(k))||typeof F.owner!=='string'||owner?.weaponId!=='prism_anchor'||!this.supports(savedWeaponDefinition({id:owner.weaponId,definitionVersion:owner.definitionVersion===undefined?2:owner.definitionVersion}))||!Number.isFinite(F.remaining)||F.remaining<=0||F.remaining>3||typeof F.hit!=='string'||!F.hit||!F.at||Object.getPrototypeOf(F.at)!==Object.prototype||Object.keys(F.at).length!==2||Object.keys(F.at).some(k=>!['x','z'].includes(k))||!Number.isFinite(F.at.x)||!Number.isFinite(F.at.z))throw Error('Invalid prism field');
    }
    s.prismField ??= null;
    for(const job of s.queue)if(!s.states[job.owner]||!Number.isFinite(job.time)||!Number.isFinite(job.damage)||job.damage<0||!Array.isArray(job.hits)||!job.shot)throw Error('Invalid queued weapon tick');
    const finite=(obj,fields)=>fields.every(f=>Number.isFinite(obj[f]));
    const validShot=(shot,owner)=>shot&&validPaidResourceIdentity(shot,this.weapons.get(owner)?.def)&&shot.owner===owner&&s.states[owner]?.weaponId===shot.weaponId&&this.supports(savedWeaponDefinition({id:shot.weaponId,definitionVersion:shot.definitionVersion===undefined?2:shot.definitionVersion}))&&typeof shot.rootShotId==='string'&&finite(shot,['damage','mul','paidCost'])&&shot.damage>=0&&(shot.c2DamageApplied===undefined||Number.isFinite(shot.c2DamageApplied)&&shot.c2DamageApplied>=1&&shot.c2DamageApplied<=3)&&shot.mul>0&&shot.paidCost>0&&shot.origin&&finite(shot.origin,['x','z'])&&shot.direction&&finite(shot.direction,['x','z']);
    const relicBonusRoots=new Set(),relicPendingRoots=new Set();
    for(const e of s.entities){
      if(!finite(e,['x','y','z','created','ttl','maxTTL'])||e.maxTTL<e.ttl-EPS||e.maxTTL>60||e.created>s.time+EPS)throw Error('Invalid weapon entity clock/position');
      if((e.mechanic||['unit','anchor','delayed'].includes(e.kind))&&!e.shot)throw Error('Missing required weapon shot');
      if(e.shot&&!validShot(e.shot,e.owner))throw Error('Invalid weapon shot');
      if(e.shot)validateBuildContext(e.shot.buildContext,e.owner);
      const revision=this.revisions.isShot(e.shot);
      if(revision)this.revisions.validateEntity(e,s);
      if((e.relicBonus||e.shot?.noRefund&&!revision&&!e.shot?.lottery)&&(e.kind!=='projectile'||!RELIC_PROJECTILE_IDS.includes(e.shot.weaponId)||e.relicBonus!==true||e.secondary!==true||e.shot.noRefund!==true||e.pierce!==0||e.bounce!==0||e.blast||e.relicExplosive))throw Error('Invalid relic bonus budget');
      if(e.relicBonus){const root=JSON.stringify([e.owner,e.shot.rootShotId]);if(relicBonusRoots.has(root))throw Error('Duplicate relic bonus root');relicBonusRoots.add(root);}
      if(e.mechanic==='relic-blast'){
        const root=JSON.stringify([e.owner,e.shot.rootShotId]),ledger=s.states[e.owner].relicBlastRoots,end=ledger?.[e.shot.rootShotId];
        if(e.kind!=='delayed'||!RELIC_PROJECTILE_IDS.includes(e.shot.weaponId)||e.radius!==3.2||!(e.blast>0)||e.maxTTL!==30||!(e.ttl>0&&e.ttl<=30)||e.secondary||e.relicBonus||e.shot.noRefund||!ledger||!Object.hasOwn(ledger,e.shot.rootShotId)||!Number.isFinite(end)||Math.abs(end-e.created-30)>EPS||end<s.time-EPS||Math.abs(end-s.time-e.ttl)>1e-6)throw Error('Invalid pending relic blast budget');
        if(relicPendingRoots.has(root))throw Error('Duplicate pending relic blast root');relicPendingRoots.add(root);
      }
      if(e.relicExplosive!==undefined&&(!Number.isFinite(e.relicExplosive)||e.relicExplosive<=0||!RELIC_PROJECTILE_IDS.includes(e.shot.weaponId)||e.secondary))throw Error('Invalid relic explosive snapshot');
      if(e.kind==='projectile'&&(!Array.isArray(e.hit)||!finite(e,['dx','dz','speed','range','traveled','radius','pierce','bounce'])||Math.abs(Math.hypot(e.dx,e.dz)-1)>.01||e.speed<0||e.range<0||e.traveled<0||!e.shot))throw Error('Invalid weapon projectile');
      if(e.kind==='delayed'&&(!e.mechanic||e.mechanic==='relic-blast')&&(!finite(e,['blast','radius'])||e.blast<0||e.radius<=0))throw Error('Invalid delayed explosion');
      if(e.kind==='zone'&&(!finite(e,['radius'])||e.radius<0))throw Error('Invalid zone radius');
      if(e.kind==='line'&&(!finite(e,['dx','dz','length'])||e.length<0||Math.abs(Math.hypot(e.dx,e.dz)-1)>.01))throw Error('Invalid weapon line');
      if(e.mechanic==='frost'&&!finite(e,['nextTick','end']))throw Error('Invalid frost tick');
      if(e.mechanic==='anchor'&&(!finite(e,['nextTick','lastTick','end'])||e.end-e.created>5+EPS||e.length>8+EPS||e.length<.75-EPS))throw Error('Invalid anchor segment');
      if(e.kind==='projectile')this.precision.validateEntity(e);this.energy.validateEntity(e);this.mechanical.validateEntity(e);this.lottery.validateEntity(e,s);
    }
    const checkNested=(obj,owner)=>{if(!obj||typeof obj!=='object')return;if(Object.hasOwn(obj,'rootShotId')){if(!validShot(obj,owner))throw Error('Invalid nested weapon shot');validateBuildContext(obj.buildContext,owner);}for(const [field,v] of Object.entries(obj)){if(['shot','attackShot','threadShot','capShot','ashShot'].includes(field)&&!validShot(v,owner))throw Error('Invalid named weapon shot');if(v&&typeof v==='object')checkNested(v,owner);}};for(const [owner,state]of Object.entries(s.states)){checkNested(state,owner);for(const name of ['bellMarks','kilnMarks'])for(const m of Object.values(state[name]||{}))if(!validShot(m.shot,owner)||!Number.isFinite(m.until)||(name==='bellMarks'&&!Number.isFinite(m.armedAt)))throw Error('Invalid timed mark');if(state.weaponId==='nail_collapse'&&state.marks.some(m=>!validShot(m.shot,owner)))throw Error('Invalid nail snapshot');if(state.threadDwell>0&&state.threadTarget&&!validShot(state.threadShot,owner))throw Error('Invalid thread beam snapshot');if(state.capacitor>0&&!validShot(state.capShot,owner))throw Error('Invalid capacitor');if(state.ashDamage>0&&(!validShot(state.ashShot,owner)||!state.ashPoint||!finite(state.ashPoint,['x','z'])))throw Error('Invalid ash ledger');}for(const e of s.entities){checkNested(e,e.owner);if(e.mechanic==='hound'&&e.phase==='attack'&&!validShot(e.attackShot,e.owner))throw Error('Invalid hound attack snapshot');}
    for(const q of s.queue)if(!validShot(q.shot,q.owner)||q.hits.some(h=>typeof h.target!=='string'||!h.dir||!finite(h.dir,['x','z'])))throw Error('Invalid queued weapon shot');
    for(const h of s.history)if(typeof h.target!=='string'||!finite(h,['start','end'])||h.end<h.start||!h.a||!h.b||!finite(h.a,['x','z'])||!finite(h.b,['x','z']))throw Error('Invalid motion history');
    for(const txn of Object.values(s.paidActions))if(!s.states[txn.owner]||!finite(txn,['cost','refunded','end'])||txn.cost<=0||txn.refunded<0||txn.refunded>txn.cost)throw Error('Invalid refund ledger');
    const missing=s.entities.filter(e=>e.mechanic==='anchor'&&(!ids.has(e.a)||!ids.has(e.b))).map(e=>e.id);s.entities=s.entities.filter(e=>!missing.includes(e.id));
    this.revisions.validateSnapshot(s);
    this.lottery.validateSnapshot(s);
    for(const owner of Object.keys(s.states)){const own=s.entities.filter(e=>e.owner===owner);for(const [mechanic,cap]of Object.entries({'orbit-stored':3,satellite:10,tripod:1,hound:1,lantern:1,nest:2,drum:1,stake:2,patrol:1,censer:1,cask:16,mine:24,rod:24,'rod-corridor':8,'orbit-center':1,post:1})){if(own.filter(e=>e.mechanic===mechanic).length>cap)throw Error('Owned mechanic cap exceeded: '+mechanic);}if(own.filter(e=>e.kind==='anchor').length>4||own.filter(e=>e.mechanic==='anchor').length>3||own.filter(e=>e.kind==='projectile').length>(s.states[owner].definitionVersion===3?this.revisions.budget(s.states[owner].weaponId,'projectileCap'):SPECS[s.states[owner].weaponId].cap))throw Error('Weapon entity cap exceeded');}
    if(preserveWeaponState){
      const delta=this.time-s.time,currentWeapons=this.player?.weapons||[this.player?.weapon].filter(Boolean),owned=new Set(currentWeapons.map(w=>w.assetInstanceId));
      // Shift absolute room timestamps together; room-offline time never advances effects.
      const shift=(obj,fields)=>{for(const f of fields)if(Number.isFinite(obj[f]))obj[f]+=delta;};
      for(const e of s.entities){shift(e,['created','end','nextTick','lastTick','turnAt','targetUntil','lastCommand','armedAt','igniteAt','returnDue','releaseAt','nextShot','nextCommand']);if(e.shot)shift(e.shot,['targetUntil']);}
      for(const q of s.queue)shift(q,['time']);for(const h of s.history)shift(h,['start','end']);for(const ledger of Object.values(s.ledger))for(const k of Object.keys(ledger))ledger[k]+=delta;
      for(const [root,txn]of Object.entries(s.paidActions)){txn.end+=delta;if(!owned.has(txn.owner))delete s.paidActions[root];}
      const absoluteFields=new Set(['sealUntil','rayUntil','until','armedAt','brokenUntil','pairUntil','peekUntil','angleUntil','threadHitAt','tetherUntil','pikeUntil','lastAttack','edgeTime','arcHitAt']);
      const shiftState=(obj,parent='')=>{if(!obj||typeof obj!=='object')return;for(const [field,value]of Object.entries(obj)){if(typeof value==='number'&&(absoluteFields.has(field)||['films','wet','salt','quench','chainRoots','arcHitRoots','portalLocks','relicBlastRoots'].includes(parent)))obj[field]+=delta;else if(value&&typeof value==='object')shiftState(value,field);}};for(const state of Object.values(s.states))shiftState(state);
      // A room-resident continuous beam cannot resume without its held input state.
      s.entities=s.entities.filter(e=>owned.has(e.owner)&&e.mechanic!=='v3:heavy_sustained_beam');s.queue=s.queue.filter(e=>owned.has(e.owner));
      if(s.prismField&&!owned.has(s.prismField.owner))s.prismField=null;
      for(const w of currentWeapons){const current=this.states[w.assetInstanceId]||w.assetState;if(!current)continue;const room=s.states[w.assetInstanceId]||{},restored=clone(current);for(const f of ROOM_FIELDS){if(room[f]!==undefined)restored[f]=clone(room[f]);else delete restored[f];}if(restored.definitionVersion===3&&restored.weaponId==='kiln_ray'){if(restored.kilnActive>0||restored.kilnLine)restored.kilnCool=Math.max(restored.kilnCool||0,current.kilnCool||0,.8);for(const f of ['kilnLine','kilnShot','kilnDir','kilnPre','kilnActive','kilnTick','kilnRoot','kilnTicks'])delete restored[f];}restored.marks ||= [];restored.charge=0;s.states[w.assetInstanceId]=restored;}
      s.time=this.time;s.serial=Math.max(s.serial,this.serial);
    }
    for(const state of Object.values(s.states)){if(!Object.hasOwn(state,'charge'))state.charge=0;if(!Object.hasOwn(state,'burstRemaining'))state.burstRemaining=0;}
    this.game.validateWeaponRuntimeRestore?.(this,s);
    this.time=s.time;this.serial=s.serial;this.prismField=s.prismField;this.entities=s.entities;this.queue=s.queue;this.states=s.states;this.positions=s.positions;this.history=s.history;this.ledger=s.ledger;this.paidActions=s.paidActions;this.visualEvents=[];this.diagnostics=missing.map(id=>`Dropped segment with missing endpoint: ${id}`);this.active=null;
    if(!resumeRuntime){for(const state of Object.values(this.states))if(state.charge>0)state.charge=0;this.suspend({restoring:true});}
    for(const [id,w] of this.weapons)if(this.states[id])w.assetState=this.states[id];this._reserve();this._refreshGroundSlow();this._refreshTimeEffectChannels();return true;
  }
}
