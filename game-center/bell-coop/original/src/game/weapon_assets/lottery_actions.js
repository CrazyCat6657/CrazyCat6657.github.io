import {WEAPONS} from '../data.js';
import {savedWeaponDefinition} from '../weapon_versions.js';
import {WEAPON_REVISIONS} from '../weapon_revisions_data.js';
import {SPECS} from './specs.js';

const BASIC='pistol_rusty pistol_heavy smg_hornet rifle_carbine shotgun_sapper shotgun_dragon sniper_rail minigun_shredder plasma_repeater gauss_lancer flame_belcher shuriken_launcher burst_triple spike_nailer tox_sprayer crystal_caster pyroclast bell_sight hourhand_rifle patient_relic counterweight last_witness escapement_smg ratchet_repeater double_bell seam_sweeper breach_bucket grit_reloader shield_chisel polygon_oath quench_chalice split_escapement yama_call rocket_hammer orb_sling grenade_lobber echo_shell'.split(' ');
const BEAMS='laser_lance aegis_lance hinge_beam thread_beam braid_light kiln_ray spark_shuttle'.split(' ');
const REFLECT='line_scribe tandem_rail door_frame corner_prism'.split(' ');
export const LOTTERY_ADAPTERS=Object.freeze(Object.fromEntries([
  ...BASIC.map(id=>[id,'projectile']),...BEAMS.map(id=>[id,'beam']),...REFLECT.map(id=>[id,'reflect']),
  ['ring_shot','radial'],['witness_pistol','nails'],['boomerang_fork','boomerang'],['flywheel_vow','wave'],
  ['aperture_lamp','cone'],['stake_keeper','meteor'],['clap_mortar','meteor'],['hive_scepter','spider'],
  ['pressure_mine','mine'],['thunder_cask','cask'],['clock_bomb','clock'],
]));
export const LOTTERY_POOL=Object.freeze(WEAPONS.filter(w=>Object.hasOwn(LOTTERY_ADAPTERS,w.id)));
const UNIT_ZONES=['mine','clock-bomb','rod'];
const EXPLOSIVE_IDS=['rocket_hammer','grenade_lobber','orb_sling','charge_nova','pyroclast','echo_shell','fuse_lantern','quarry_splitter'];
const ZONE_SHELLS=Object.freeze({pressure_mine:1,thunder_cask:1,clap_mortar:2,frost_tile:1,acid_sieve:1,mist_pendulum:1,kiln_seal:1,return_post:1,void_ripper:1,nail_collapse:1,ash_invoice:1,quarry_splitter:2});
const EPS=1e-7,finite=(o,ks)=>o&&ks.every(k=>Number.isFinite(o[k]));
const unit=(x,z)=>{const n=Math.hypot(x,z)||1;return {x:x/n,z:z/n};};
const alive=e=>!e.ended&&e.ttl>0;
const effective=e=>e.shot?.lottery?.borrowId||e.shot?.weaponId;
const futureZones=e=>{
  if(e.kind==='delayed'&&(e.blast>0||e.mechanic==='meteor'))return 1;
  if(['mine','cask','clock-bomb','clap-point'].includes(e.mechanic))return 1;
  if(e.kind!=='projectile')return 0;
  const id=effective(e);
  if(id==='echo_shell')return 2;
  if(id==='return_post'&&e.mechanic==='post-letter')return 0;
  if(Object.hasOwn(ZONE_SHELLS,id))return ZONE_SHELLS[id];
  if(e.blast>0||e.relicExplosive>0)return 1;
  return 0;
};
/** Actual FX groups plus bounded future explosion slots; old records need no edits. */
export function creationUsage(entities,{consumeSource=null,states={},nativeLines=0}={}) {
  const out={projectile:0,line:nativeLines,zone:0,meteor:0},chains=new Set(),rods=new Map();
  for(const e of entities){if(!alive(e))continue;
    if(e.kind==='projectile')out.projectile++;
    if(e.kind==='line')out.line++;
    if(e.kind==='zone'&&!UNIT_ZONES.includes(e.mechanic))out.zone++;
    if(e.kind==='delayed'&&e.mechanic==='meteor')out.meteor++;
    if(e.id!==consumeSource)out.zone+=futureZones(e);
    if(e.futureLineSlots)out.line+=e.futureLineSlots;
    if(e.mechanic==='rod'||e.kind==='projectile'&&effective(e)==='grounding_rod'){const v=rods.get(e.owner)||{live:0,pending:0};v[e.kind==='projectile'?'pending':'live']++;rods.set(e.owner,v);}
    const shot=e.shot;
    // A traveling wave is a delayed primary hit just like a projectile. Keep
    // one reservation per paid root until its first hit consumes it or it ends.
    if(shot?.lottery&&!e.secondary&&(e.kind==='projectile'||e.mechanic==='v3:traveling_wave')&&(shot.chain>0||shot.arcCore)&&!states[e.owner]?.chainRoots?.[shot.rootShotId])chains.add(shot.rootShotId);
  }
  out.line+=chains.size*2;
  for(const v of rods.values())out.zone+=Math.max(0,v.pending-(v.live?0:1));
  for(const state of Object.values(states)){if(state.weaponId==='nail_collapse')out.zone+=(state.marks||[]).length;if(state.weaponId==='ash_invoice'&&state.ashDamage>0)out.zone++;}
  return out;
}
export function creationAdmission(entities,additions=[],options={}) {
  const usage=creationUsage([...entities,...additions.map(e=>({ttl:1,...e}))],options);
  for(const [kind,cap] of Object.entries({projectile:420,line:24,zone:64,meteor:10}))if(usage[kind]>cap)return {ok:false,reason:'creation-'+kind,usage};
  return {ok:true,reason:null,usage};
}

// Old generic/v2 shots predate these explicit action markers. Only new paid
// actions claim a resource identity; use the actual owner's definition when known.
export function validPaidResourceIdentity(shot,def=null){
  if(!shot||!Object.hasOwn(shot,'lottery')&&shot.followingAction!=='ownerShot')return true;
  return typeof shot.manaPaid==='boolean'&&(!def||shot.manaPaid===(def.ammoType==='mana'));
}

export class LotteryActions {
  constructor(runtime){this.r=runtime;}
  lineAdmission(count=1){return this.r.lineAdmission(count);}
  descriptor(pick){
    const spec=SPECS[pick.id],rev=WEAPON_REVISIONS[pick.id],action=LOTTERY_ADAPTERS[pick.id];
    const revision=['radial','nails','boomerang','wave','reflect'].includes(action)||pick.id==='kiln_ray';
    return {pick,action,damage:revision?rev.damage:pick.id==='clap_mortar'?28:spec.damage,count:action==='radial'?rev.count:action==='nails'?rev.count:action==='boomerang'?2:Math.min(9,spec.pellets||1),spec,rev};
  }
  requests(d,owner){
    const shot={weaponId:'chamber_lottery',lottery:{version:1,borrowId:d.pick.id,borrowVersion:d.pick.weaponAssetVersion,action:d.action}},base={owner,ttl:1,shot};
    if(['projectile','radial','nails','boomerang','mine','cask'].includes(d.action))return Array.from({length:d.action==='mine'||d.action==='cask'?1:d.count},()=>({...base,kind:'projectile',...(['rocket_hammer','orb_sling','grenade_lobber','echo_shell'].includes(d.pick.id)?{blast:1}:{})}));
    if(d.action==='beam'||d.action==='reflect'||d.action==='cone'||d.action==='wave')return Array.from({length:d.action==='reflect'?d.rev.reflections+1:d.action==='cone'?2:1},()=>({...base,kind:'line'}));
    if(d.action==='meteor')return Array.from({length:d.pick.id==='stake_keeper'?3:1},()=>({...base,kind:'delayed',mechanic:'meteor',blast:1}));
    if(d.action==='spider')return Array.from({length:3},()=>({...base,kind:'unit',mechanic:'spider'}));
    return [{...base,kind:'zone',mechanic:'clock-bomb'}];
  }
  resources(d){return {heavy:d.count>1||['beam','reflect','cone','meteor','boomerang','wave'].includes(d.action)||['rocket_hammer','orb_sling','grenade_lobber','echo_shell'].includes(d.pick.id),deploy:['spider','mine','cask','clock'].includes(d.action)};}
  admissible(p,w,d){
    const r=this.r,req=this.requests(d,w.assetInstanceId),fee=this.resources(d);
    const mods=p.attachMods?.()||{};if(!['spider','meteor','mine','cask','clock'].includes(d.action)&&((p.stats?.chain||0)+(mods.chain||0)>0||w.attachments?.includes('arc_core')))req.push({kind:'reservation',futureLineSlots:2,ttl:1});
    if(!r._resources(w,1,fee.heavy,fee.deploy).ok||!r.deploymentAdmission(req).ok||!r.creationAdmission(req).ok)return false;
    const shots=req.filter(e=>e.kind==='projectile').length,lines=req.filter(e=>e.kind==='line').length;
    if(shots&&(r._globalCount('projectile')+shots>420||r._owned(w.assetInstanceId,'projectile').filter(alive).length+shots>SPECS.chamber_lottery.cap))return false;
    if(lines&&r._globalCount('line')+lines>24)return false;
    if(['meteor','mine','cask','clock'].includes(d.action)){
      const point=p.aimPoint;if(!finite(point,['x','z'])||Math.hypot(point.x-p.x,point.z-p.z)>(d.action==='mine'?8:14)||r._blocked(point.x,point.z)||!r._los(p,point))return false;
      if(d.pick.id==='stake_keeper'&&!Array.from({length:3},(_,i)=>({x:point.x+Math.cos(i*Math.PI*2/3)*1.2,z:point.z+Math.sin(i*Math.PI*2/3)*1.2})).every(at=>Math.hypot(at.x-p.x,at.z-p.z)<=14&&!r._blocked(at.x,at.z)&&r._los(p,at)))return false;
    }
    if(d.action==='radial'||d.action==='nails'){
      const aim=unit(p.aim.x,p.aim.z),body=Math.max(d.action==='radial'?.2:.25,p.radius||.45);
      const points=d.action==='radial'?Array.from({length:d.count},(_,i)=>{const a=Math.atan2(aim.x,aim.z)+i*Math.PI*2/d.count;return {x:p.x+Math.sin(a)*body,z:p.z+Math.cos(a)*body};}):d.rev.offsets.map(offset=>({x:p.x+aim.x*body-aim.z*offset,z:p.z+aim.z*body+aim.x*offset}));
      if(!points.some(at=>!r._blocked(at.x,at.z,d.rev.radius*(d.action==='radial'?.5:.6))&&(d.action==='radial'||r._los(p,at))))return false;
    }
    return true;
  }
  candidates(p,w){const pools={1:[],2:[],3:[],4:[]};for(const pick of LOTTERY_POOL)if(this.admissible(p,w,this.descriptor(pick)))pools[pick.tier].push(pick);return pools;}
  prepare(p,w){
    if(!this.r.supports(w.def)||!finite(p,['x','z'])||!finite(p.aim,['x','z'])||Math.abs(Math.hypot(p.aim.x,p.aim.z)-1)>.01)return {reject:true};
    const pools=this.candidates(p,w);if(Object.values(pools).some(pool=>!pool.length))return {reject:true};
    const roll=this.r.game.gr?.()??.5,tier=roll<.4?4:roll<.7?3:roll<.9?2:1,pool=pools[tier];
    const pick=pool[Math.min(pool.length-1,Math.floor((this.r.game.gr?.()??.5)*pool.length))],d=this.descriptor(pick),fee=this.resources(d);
    return {lottery:{version:1,borrowId:pick.id,borrowVersion:pick.weaponAssetVersion,action:d.action},heavy:fee.heavy,manaDeploy:fee.deploy,cost:1,count:0};
  }
  paid(p,w,s,shot,c){
    shot.lottery={...c.lottery};shot.manaPaid=this.r._mana(w);shot.bulletSize=p.stats?.bulletSize||1;
    const d=this.descriptor(LOTTERY_POOL.find(w=>w.id===c.lottery.borrowId));shot.damage=d.damage*shot.mul;
    if(['meteor','mine','cask','clock'].includes(d.action))shot.lotteryPoint={...p.aimPoint};
    s.lastLotteryShot=JSON.parse(JSON.stringify(shot));
  }
  fire(p,w,s,shot){
    const r=this.r,d=this.descriptor(LOTTERY_POOL.find(w=>w.id===shot.lottery.borrowId)),{action,spec,rev,pick}=d,owner=shot.owner,color=pick.color;
    const local={cooldown:0},proxy={assetInstanceId:owner,def:pick};
    if(['radial','nails','boomerang','wave'].includes(action)){
      const method={radial:'radial',nails:'parallel_nails',boomerang:'auto_boomerang',wave:'traveling_wave'}[action];
      const serial=r.serial;r.revisions['_fire_'+method](p,proxy,local,shot,{count:d.count});
      for(const e of r.entities)if(e.shot?.rootShotId===shot.rootShotId&&Number(e.id.split(':').at(-1))>serial&&['radial','nails'].includes(action))e.mechanic='lottery:'+action;
      return true;
    }
    if(action==='reflect'){
      r.revisions._fire_multi_reflect_beam(p,proxy,local,shot,{segments:rev.reflections+1});return true;
    }
    if(action==='beam'){
      const range=pick.id==='kiln_ray'?rev.range:pick.id==='aegis_lance'?24:['hinge_beam','thread_beam'].includes(pick.id)?18:spec.range;
      const width=pick.id==='kiln_ray'?rev.width*shot.beamWidth/2:undefined;
      r._beam(p,p.aim,range,shot,color,Infinity,false,width);return true;
    }
    if(action==='cone'){
      const angle=Math.atan2(p.aim.x,p.aim.z),half=16*Math.PI/360;
      for(const sign of [-1,1]){const a=angle+sign*half;r._beamVisual(p,{x:p.x+Math.sin(a)*12,z:p.z+Math.cos(a)*12},owner,color,.135,{shot:{...shot,unitId:(sign+1)/2},mechanic:'lottery:cone'});}
      for(const t of r._enemies()){const aim=unit(t.x-p.x,t.z-p.z);if(Math.hypot(t.x-p.x,t.z-p.z)<=12&&aim.x*p.aim.x+aim.z*p.aim.z>=Math.cos(half)&&r._los(p,t))r._damage(t,shot,shot.damage,false,aim);}return true;
    }
    if(action==='meteor'){
      const count=pick.id==='stake_keeper'?3:1;
      for(let i=0;i<count;i++){const a=i*Math.PI*2/3,offset=count===1?0:1.2;r._add({kind:'delayed',mechanic:'meteor',owner,x:p.aimPoint.x+Math.cos(a)*offset,z:p.aimPoint.z+Math.sin(a)*offset,ttl:.8+i*.14,maxTTL:.8+i*.14,shot:{...shot,unitId:i},blast:pick.id==='stake_keeper'?22:28,radius:pick.id==='stake_keeper'?2.8:2.5,color});}return true;
    }
    if(action==='spider'){
      for(let i=0;i<3;i++){const a=i*Math.PI*2/3;r._add({kind:'unit',mechanic:'spider',spider:'small',owner,x:p.x+Math.cos(a)*.8,z:p.z+Math.sin(a)*.8,ttl:10,maxTTL:10,blocks:2,biteAcc:0,breedAcc:5,radius:.28,color,shot:{...shot,unitId:i}});}return true;
    }
    if(action==='clock'){r._add({kind:'zone',mechanic:'clock-bomb',owner,x:p.aimPoint.x,z:p.aimPoint.z,radius:.4,ttl:5,maxTTL:5,color,shot});return true;}
    const placed=['mine','cask'].includes(action),count=placed?1:d.count,aim=placed?unit(p.aimPoint.x-p.x,p.aimPoint.z-p.z):unit(p.aim.x,p.aim.z),base=Math.atan2(aim.x,aim.z),spread=placed?0:spec.spread*shot.spreadMul;
    for(let i=0;i<count;i++){
      const a=base+(count>1?(i/(count-1)-.5)*2:0)*spread*Math.PI/180,dir={x:Math.sin(a),z:Math.cos(a)},speed=spec.speed*shot.speedMul;
      const range=['mine','cask'].includes(action)?Math.hypot(p.aimPoint.x-p.x,p.aimPoint.z-p.z):spec.range*Math.min(2,Math.max(.25,shot.lifeMul)),ttl=Math.min(10,range/Math.max(.01,speed));
      const e={kind:'projectile',mechanic:'lottery:'+action,owner,x:p.x,z:p.z,dx:dir.x,dz:dir.z,speed,ttl,maxTTL:ttl,range,traveled:0,radius:.13*shot.bulletSize,hit:[],pierce:Math.max(0,pick.pierce||0)+shot.pierce,bounce:Math.min(24,(pick.bounce||0)+shot.bounce),homing:shot.homing,shot:{...shot,unitId:i},color,card:pick.tier===4?5:pick.cls==='shotgun'?1:pick.cls==='energy'?3:0};
      if(pick.id==='last_witness')Object.assign(e,{homing:16,homingRange:26,homingAfter:10});
      if(['rocket_hammer','orb_sling','grenade_lobber','echo_shell'].includes(pick.id))Object.assign(e,{blast:({rocket_hammer:34,orb_sling:12,grenade_lobber:24,echo_shell:16}[pick.id])*shot.mul,blastRadius:pick.id==='echo_shell'?3:3.2});
      if(pick.id==='orb_sling')e.homing=6;
      if(pick.id==='grenade_lobber')Object.assign(e,{vy:5,arc:true,fuseOnly:true});
      if(action==='mine')e.shot.damage=0;
      if(placed){e.homing=0;e.pierce=0;e.bounce=0;}
      r._add(e);
    }return true;
  }
  end(e){
    const action=e.shot?.lottery?.action;if(!action)return;
    const r=this.r,base={owner:e.owner,x:e.x,z:e.z,color:e.color,shot:e.shot};
    if(action==='mine')r._add({...base,kind:'zone',mechanic:'mine',radius:.35,ttl:8,maxTTL:8,armedAt:r.time+.6});
    if(action==='cask')r._add({...base,kind:'unit',mechanic:'cask',radius:.5,ttl:8,maxTTL:8,armedAt:r.time+.6});
    if(e.shot.lottery.borrowId==='echo_shell')r._add({...base,kind:'delayed',ttl:.7,maxTTL:.7,radius:2.2,blast:14,shot:{...e.shot,statuses:{},intrinsicStatuses:{},crit:false,secondaryExplosion:true}});
  }
  /** Only these finite ordinary producers share the new pending explosion/meteor query. */
  nativeRequests(id,config,charge,owner,{relicExplosive=0}={}){
    const base={owner,ttl:1,shot:{weaponId:id}},form=config?.form;
    if(id==='stake_keeper')return Array.from({length:config.meteors||3},()=>({...base,kind:'delayed',mechanic:'meteor',blast:1}));
    if(form==='meteor')return [{...base,kind:'zone',mechanic:'v3:meteor'}];
    if(form==='multi_reflect_beam')return Array.from({length:config.segments},()=>({...base,kind:'line'}));
    if(form==='traveling_wave')return [{...base,kind:'line'}];
    if(config.fold||id==='corner_prism')return Array.from({length:config.fold?config.fold+1:2},()=>({...base,kind:'line'}));
    if(config.beam||['laser_lance','braid_light','kiln_ray'].includes(id)||config.aperture||config.tesla)return Array.from({length:config.aperture?2:config.tesla?6:1},()=>({...base,kind:'line'}));
    if(['pressure_mine','thunder_cask'].includes(id))return [{...base,kind:'projectile'}];
    if(id==='clock_bomb')return [{...base,kind:'zone',mechanic:'clock-bomb'}];
    if(Object.hasOwn(ZONE_SHELLS,id)||id==='grounding_rod')return Array.from({length:config?.count||SPECS[id].pellets||1},()=>({...base,kind:'projectile',...(id==='return_post'?{mechanic:config.station?'post-flight':'post-letter'}:{})}));
    if(EXPLOSIVE_IDS.includes(id)&&!(id==='charge_nova'&&charge<=0))return Array.from({length:config?.count||SPECS[id].pellets||1},()=>({...base,kind:'projectile',blast:1}));
    if(relicExplosive)return Array.from({length:config?.count||SPECS[id].pellets||1},()=>({...base,kind:'projectile',relicExplosive}));
    return null;
  }
  validShot(shot){
    if(!shot||Object.getPrototypeOf(shot)!==Object.prototype)return false;
    const b=shot?.lottery;if(!b||Object.getPrototypeOf(b)!==Object.prototype||Object.keys(b).length!==4||Object.keys(b).some(k=>!['version','borrowId','borrowVersion','action'].includes(k))||b.version!==1||shot.weaponId!=='chamber_lottery'||shot.definitionVersion!==2||!Object.hasOwn(LOTTERY_ADAPTERS,b.borrowId)||b.action!==LOTTERY_ADAPTERS[b.borrowId])return false;
    const pick=LOTTERY_POOL.find(w=>w.id===b.borrowId);if(!pick||pick.weaponAssetVersion!==b.borrowVersion)return false;
    try{savedWeaponDefinition({id:b.borrowId,definitionVersion:b.borrowVersion});}catch{return false;}
    const fee=this.resources(this.descriptor(pick)),cost=shot.manaPaid?(fee.deploy?8:fee.heavy?6:2):1;
    if(['meteor','mine','cask','clock'].includes(b.action)){const point=shot.lotteryPoint;if(!finite(point,['x','z'])||Object.keys(point).length!==2||Object.keys(point).some(k=>!['x','z'].includes(k)))return false;}
    else if(Object.hasOwn(shot,'lotteryPoint'))return false;
    return typeof shot.manaPaid==='boolean'&&shot.paidCost===cost&&finite(shot,['damage','mul','speedMul','lifeMul','beamWidth','bulletSize','explosiveMul','blastRadiusMul'])&&shot.damage>=0&&shot.mul>0&&shot.speedMul>0&&shot.lifeMul>0&&shot.explosiveMul>0&&shot.blastRadiusMul>0&&shot.beamWidth>=.25&&shot.beamWidth<=4&&shot.bulletSize>0&&finite(shot.origin,['x','z'])&&finite(shot.direction,['x','z'])&&Math.abs(Math.hypot(shot.direction.x,shot.direction.z)-1)<.01&&typeof shot.rootShotId==='string'&&/^shot:[1-9]\d*$/.test(shot.rootShotId);
  }
  validateRaw(value,def=null){if(!value||typeof value!=='object')return;if(Object.hasOwn(value,'lastLotteryShot')&&!this.validShot(value.lastLotteryShot))throw Error('Invalid lottery readonly trace');if(Object.hasOwn(value,'rootShotId')){if(!validPaidResourceIdentity(value,def))throw Error('Invalid paid action resource identity');if(Object.hasOwn(value,'lottery')&&!this.validShot(value))throw Error('Invalid lottery source metadata');}for(const v of Object.values(value))if(v&&typeof v==='object')this.validateRaw(v,def);}
  validateEntity(e,snapshot){
    const shot=e.shot;if(!Object.hasOwn(shot||{},'lottery')){
      if(String(e.mechanic||'').startsWith('lottery:')||shot?.weaponId==='chamber_lottery'&&(e.kind!=='projectile'||e.mechanic!==undefined||Object.hasOwn(shot.mechanical||{},'lottery')||['bulletSize','manaPaid','lotteryPoint'].some(k=>Object.hasOwn(shot,k))))throw Error('Missing lottery action');
      return;
    }
    const fail=()=>{throw Error('Invalid lottery action entity');},txn=snapshot.paidActions[shot.rootShotId];
    if(!this.validShot(shot)||!txn||txn.owner!==e.owner||txn.cost!==shot.paidCost||txn.end<snapshot.time)fail();
    const d=this.descriptor(LOTTERY_POOL.find(w=>w.id===shot.lottery.borrowId)),{action,spec,rev}=d;
    if(e.kind==='zone'&&e.phase==='explosion'){
      const radius={rocket_hammer:3.2,orb_sling:3.2,grenade_lobber:3.2,echo_shell:e.shot.secondaryExplosion?2.2:3,stake_keeper:2.8,clap_mortar:2.5,pressure_mine:2.5,thunder_cask:3.9,clock_bomb:3}[d.pick.id];
      if(!radius||e.maxTTL!==.25||Math.abs(e.radius-radius*shot.blastRadiusMul)>EPS||e.relicBonus||e.relicExplosive||e.secondary)fail();return;
    }
    const expected={projectile:['projectile','lottery:projectile'],beam:['line','lottery:beam'],reflect:['line','v3:multi_reflect_beam'],cone:['line','lottery:cone'],radial:['projectile','lottery:radial'],nails:['projectile','lottery:nails'],boomerang:['projectile','v3:auto_boomerang'],wave:['line','v3:traveling_wave'],meteor:['delayed','meteor'],spider:['unit','spider'],mine:e.kind==='projectile'?['projectile','lottery:mine']:['zone','mine'],cask:e.kind==='projectile'?['projectile','lottery:cask']:['unit','cask'],clock:['zone','clock-bomb']}[action];
    if(d.pick.id==='echo_shell'&&e.kind==='delayed'){if(e.mechanic!==undefined||e.maxTTL!==.7||e.blast!==14||e.radius!==2.2)fail();return;}
    if(e.kind!==expected[0]||e.mechanic!==expected[1]||e.relicBonus||e.relicExplosive)fail();
    if(e.kind==='projectile'){
      const radius=['radial','nails','boomerang'].includes(action)?rev.radius:.13*shot.bulletSize;
      const speed=['radial','nails','boomerang'].includes(action)?rev.speed:spec.speed*shot.speedMul;
      if(Math.abs(e.radius-radius)>EPS||Math.abs(e.speed-speed)>EPS&&!(d.pick.id==='grenade_lobber'&&e.fuseOnly&&e.speed===0)||e.secondary||!Number.isInteger(shot.unitId)&&action!=='boomerang')fail();
      if(['radial','nails'].includes(action)&&(e.pierce!==0||e.bounce!==0||e.range!==rev.range||e.maxTTL!==rev.range/rev.speed||shot.unitId<0||shot.unitId>=rev.count))fail();
      if(action==='boomerang'&&(!['out','return'].includes(e.phase)||e.turn!==rev.range||e.maxTTL!==rev.duration||!!shot.noRefund!==(e.phase==='return')))fail();
      if(['mine','cask'].includes(action)){const range=Math.hypot(shot.lotteryPoint.x-shot.origin.x,shot.lotteryPoint.z-shot.origin.z);if(Math.abs(e.range-range)>EPS||e.range>(action==='mine'?8:14)+EPS||e.pierce!==0||e.bounce!==0||e.homing!==0||e.maxTTL!==Math.min(10,range/speed))fail();}
      if(action==='projectile'){
        const range=spec.range*Math.min(2,Math.max(.25,shot.lifeMul));if(shot.unitId<0||shot.unitId>=d.count||Math.abs(e.range-range)>EPS||Math.abs(e.maxTTL-Math.min(10,range/speed))>EPS||e.pierce!==Math.max(0,d.pick.pierce||0)+shot.pierce||e.bounce>Math.min(24,(d.pick.bounce||0)+shot.bounce))fail();
        const blast={rocket_hammer:34,orb_sling:12,grenade_lobber:24,echo_shell:16}[d.pick.id];if(blast?(e.blast!==blast*shot.mul||e.blastRadius!==(d.pick.id==='echo_shell'?3:3.2)):e.blast!==undefined)fail();
      }
    }
    if(action==='meteor'){const count=d.pick.id==='stake_keeper'?3:1,index=shot.unitId,offset=count===1?0:1.2,a=index*Math.PI*2/3;if(!Number.isInteger(index)||index<0||index>=count||e.blast!==(count===3?22:28)||e.radius!==(count===3?2.8:2.5)||Math.abs(e.maxTTL-(.8+index*.14))>EPS||Math.abs(e.x-shot.lotteryPoint.x-Math.cos(a)*offset)>EPS||Math.abs(e.z-shot.lotteryPoint.z-Math.sin(a)*offset)>EPS)fail();}
    if(action==='spider'&&(e.spider!=='small'||e.maxTTL!==10||!Number.isInteger(e.blocks)||e.blocks<0||e.blocks>2||e.radius!==.28||!Number.isInteger(shot.unitId)||shot.unitId<0||shot.unitId>=3||!finite(e,['biteAcc','breedAcc'])))fail();
    if(['mine','cask'].includes(action)&&e.kind!=='projectile'&&(e.maxTTL!==8||e.radius!==(action==='mine'?.35:.5)||!finite(e,['armedAt'])))fail();
    if(action==='clock'&&(e.maxTTL!==5||e.radius!==.4))fail();
    if(action==='wave'&&(e.width!==rev.thickness||e.length!==rev.width||e.speed!==rev.speed||e.range!==rev.range||!finite(e.axis,['x','z'])||Math.abs(e.axis.x+e.dz)>EPS||Math.abs(e.axis.z-e.dx)>EPS))fail();
    if(action==='reflect'&&(e.maxTTL!==rev.duration||e.length>rev.range+EPS||e.width!==rev.width*shot.beamWidth||!Number.isInteger(shot.unitId)||shot.unitId<0||shot.unitId>rev.reflections))fail();
    if(action==='beam'&&(e.maxTTL!==.12||e.length>(d.pick.id==='kiln_ray'?rev.range:d.pick.id==='aegis_lance'?24:['hinge_beam','thread_beam'].includes(d.pick.id)?18:spec.range)+EPS||Math.abs(e.width-(d.pick.id==='kiln_ray'?rev.width*shot.beamWidth/2:this.r._beamHalfWidth(shot)))>EPS))fail();
    if(action==='cone'&&(e.maxTTL!==.12||Math.abs(e.length-12)>EPS||e.width!==.135||![0,1].includes(shot.unitId)))fail();
  }
  validateSnapshot(snapshot,{traceRoots=true}={}){
    let current=false;const groups=new Map();
    for(const [owner,state] of Object.entries(snapshot.states))if(Object.hasOwn(state,'lastLotteryShot')){
      const shot=state.lastLotteryShot;if(state.weaponId!=='chamber_lottery'||shot?.owner!==owner||!this.validShot(shot))throw Error('Invalid lottery readonly trace');
      if(traceRoots){const txn=snapshot.paidActions[shot.rootShotId];if(!txn||txn.owner!==owner||txn.cost!==shot.paidCost||txn.end<snapshot.time)throw Error('Invalid lottery trace root');}
    }
    for(const e of snapshot.entities)if(e.shot?.lottery){current=true;if(!alive(e))continue;const root=e.shot.rootShotId,list=groups.get(root)||[];list.push(e);groups.set(root,list);}
    for(const list of groups.values()){
      const first=list[0],d=this.descriptor(LOTTERY_POOL.find(w=>w.id===first.shot.lottery.borrowId)),visual=list.filter(e=>e.phase==='explosion'),members=list.filter(e=>e.phase!=='explosion');
      const limit=d.action==='spider'?3:d.action==='meteor'?(d.pick.id==='stake_keeper'?3:1):d.action==='reflect'?d.rev.reflections+1:d.action==='cone'?2:['projectile','radial','nails','boomerang'].includes(d.action)?d.count:1;
      if(list.some(e=>['version','borrowId','borrowVersion','action'].some(k=>e.shot.lottery[k]!==first.shot.lottery[k])||e.owner!==first.owner)||visual.length>limit)throw Error('Invalid lottery action group');
      const echo=d.pick.id==='echo_shell',active=echo?members.filter(e=>e.kind==='projectile'):members;
      if(active.length>limit||d.action==='meteor'&&members.length+visual.length>limit||echo&&members.filter(e=>e.kind==='delayed').length>1||echo&&active.length&&(members.length>active.length||visual.length)||!echo&&['mine','cask','clock','projectile'].includes(d.action)&&active.length&&visual.length)throw Error('Duplicate lottery action group');
      const indexed=members.filter(e=>['radial','nails','meteor','spider','projectile','mine','cask','reflect','cone','boomerang'].includes(d.action)&&Number.isInteger(e.shot.unitId));
      if(new Set(indexed.map(e=>e.shot.unitId)).size!==indexed.length)throw Error('Duplicate lottery action child');
      if(d.action==='meteor'&&new Set(list.map(e=>e.shot.unitId)).size!==list.length)throw Error('Duplicate lottery meteor stage');
    }
    for(const q of snapshot.queue)if(q.shot?.lottery)throw Error('Unexpected lottery tick queue');
    if(current&&!creationAdmission(snapshot.entities,[],{states:snapshot.states}).ok)throw Error('Lottery creation budget exceeded');
  }
}
