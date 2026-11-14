import {SPECS} from './specs.js';
import {ARCHIVED_ENERGY_IDS} from '../weapon_compatibility.js';
export const ENERGY_IDS=["tesla_arc","flame_belcher","tox_sprayer","aegis_lance","fuse_lantern","clap_mortar","pressure_mine","echo_shell","quarry_splitter","clock_bomb","ash_invoice","thunder_cask","ladder_coil","capacitor_sieve","grounding_rod","bell_switch","spark_shuttle","storm_receipt","hinge_beam","thread_beam","aperture_lamp","acid_sieve","steam_valve","mist_pendulum","quench_chalice"];
const INSTALLED_ENERGY_IDS=[...ENERGY_IDS,...ARCHIVED_ENERGY_IDS];
const id=w=>w.def.sourceWeapon||w.def.id,key=e=>String(e.id),dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const unit=(x,z)=>{const n=Math.hypot(x,z)||1;return {x:x/n,z:z/n};};
const segdist=(p,a,b)=>{const x=b.x-a.x,z=b.z-a.z,t=Math.max(0,Math.min(1,((p.x-a.x)*x+(p.z-a.z)*z)/(x*x+z*z||1)));return Math.hypot(p.x-a.x-x*t,p.z-a.z-z*t);};
export class EnergyMechanics {
  constructor(r){this.r=r;}
  state(owner){return this.r.states[owner];}
  pruneQuench(s){for(const [root,entry] of Object.entries(s.quenchRoots||{}))if(entry.until<=this.r.time)delete s.quenchRoots[root];}
  nearest(at,exclude=[],range=8){return this.r._enemies().filter(t=>!exclude.includes(key(t))&&dist(at,t)<=range&&this.r._los(at,t)).sort((a,b)=>dist(at,a)-dist(at,b))[0];}
  track(p,w,s,dt,{down,pressed,released}){if(this.r.revisions.claims(w))return false;
    const name=id(w),r=this.r;
    if(name==='quench_chalice')this.pruneQuench(s);
    if(name==='hinge_beam'){
      const aim=Math.atan2(p.aim.x,p.aim.z);if(pressed){s.beamYaw=aim;s.warmup=0;}if(down){s.warmup=(s.warmup||0)+dt;const difference=Math.atan2(Math.sin(aim-s.beamYaw),Math.cos(aim-s.beamYaw));s.beamYaw+=Math.max(-1.2*dt,Math.min(1.2*dt,difference));}else s.warmup=0;
    }
    if(name==='thread_beam'){
      if(p.dashTime>0){s.threadTarget=null;s.threadDwell=0;}
      if(down){const end={x:p.x+p.aim.x*18,z:p.z+p.aim.z*18},target=r._enemies().filter(t=>segdist(t,p,end)<=(t.r||t.radius||.5)+.09*Math.max(.25,Math.min(4,p.stats?.beamWidth??1))&&r._los(p,t)).sort((a,b)=>dist(p,a)-dist(p,b))[0];
        if(target&&s.threadTarget===key(target)&&r.time-(s.threadHitAt??-99)<.2){s.threadDwell=(s.threadDwell||0)+dt;s.threadLost=0;}else{s.threadLost=(s.threadLost||0)+dt;if(s.threadLost>=.15){s.threadDwell=0;s.threadTarget=target?key(target):null;}}
      }
    }
    if(name==='steam_valve'&&released){s.ventUntil=r.time+.4;s.steamPending=true;}
  }
  input(p,w,s,dt,{down,pressed,released,clicked}){if(this.r.revisions.claims(w))return false;
    const name=id(w),r=this.r,chargeTime={storm_battery:.65,aegis_lance:.45,fuse_lantern:.5,aperture_lamp:.3}[name];
    if(chargeTime){
      if(name==='aegis_lance'&&(p.moveAmount||0)>.05)s.charge=0;
      else if(down&&s.cooldown<=1e-8)s.charge=Math.min(1,(s.charge||0)+dt/chargeTime);p.charging=down;p.charge=s.charge||0;
      if((released||(clicked&&!down))&&s.cooldown<=1e-8){if(name!=='aegis_lance'||s.charge>=1-1e-8)r._fire(p,w,s,s.charge||0);s.charge=0;p.charge=0;}
      if(down&&w.mag<=0)r.beginReload(p,w);return true;
    }
    if(name==='clock_bomb'){
      if(pressed&&s.cooldown<=1e-8){const bomb=r._owned(w.assetInstanceId).find(e=>e.mechanic==='clock-bomb');if(bomb){r._explode(bomb,26*bomb.shot.mul,3);r._remove(bomb.id);s.cooldown=SPECS[name].cd;r.game.emit?.('onShotFired',{weapon:w,def:w.def,paid:false});}else r._fire(p,w,s,0);}return true;
    }
    if(name==='hinge_beam'&&down&&(s.warmup||0)<.25)return true;
    if(name==='thread_beam'&&released){const target=r._enemy(s.threadTarget);if(target&&s.threadDwell>=.6&&s.threadShot)r._damage(target,{...s.threadShot,statuses:{},intrinsicStatuses:{}},12*s.threadShot.mul,true);s.threadDwell=0;s.threadTarget=null;}
    if(name==='ember_seam'&&released){for(const line of r._owned(w.assetInstanceId).filter(e=>e.mechanic==='ember-drawing')){line.mechanic='ember-seam';line.igniteAt=r.time+.5;line.nextTick=r.time+1;line.end=r.time+2.5;line.ttl=2.5;line.maxTTL=2.5;}s.drawPoint=null;s.drawLength=0;}
    return false;
  }
  prepare(p,w,s,charge){if(this.r.revisions.claims(w))return null;
    const name=id(w),r=this.r;if(!INSTALLED_ENERGY_IDS.includes(name))return null;const c={heavy:!['salt_cracker','quench_chalice'].includes(name),manaDeploy:['pressure_mine','thunder_cask','grounding_rod'].includes(name)};
    if(['pressure_mine','thunder_cask','grounding_rod','clock_bomb'].includes(name)){const request=name==='clock_bomb'?{kind:'zone',mechanic:'clock-bomb'}:{kind:'projectile',shot:{weaponId:name,definitionVersion:2}};if(!r.deploymentAdmission([{...request,owner:w.assetInstanceId,ttl:1}]).ok)return {reject:true};}
    if(['flame_belcher','tox_sprayer'].includes(name)){c.pierce=4;c.spread=name==='flame_belcher'?18:15;}
    if(name==='storm_battery'){c.fork=charge>=1-1e-8;c.heavy=true;c.minCooldown=.8;}
    if(name==='aegis_lance'){c.beam=24;c.beamHits=Infinity;c.heavy=true;c.minCooldown=.8;}
    if(name==='fuse_lantern'){c.fuse=Math.max(.2,charge);c.heavy=true;}
    if(name==='pressure_mine'){if(dist(p,p.aimPoint)>8||!r._los(p,p.aimPoint))return {reject:true};}   // Shared bounded deployment admission above.
    if(name==='clock_bomb'&&(dist(p,p.aimPoint)>SPECS[name].range||!r._los(p,p.aimPoint)))return {reject:true};
    // Cask shells reserve their eventual deployment before payment.
    if(name==='grounding_rod'){const last=r._owned(w.assetInstanceId).filter(e=>e.mechanic==='rod'&&!e.ended&&e.ttl>0).at(-1);if(last&&(dist(last,p.aimPoint)>8||!r._los(last,p.aimPoint)))return {reject:true};}
    // PASS B: Fusion Lance (artifact) - the two-target shuttle is replaced by one 70-damage piercing beam.
    if(name==='spark_shuttle'){c.beam=true;c.pierce=99;c.heavy=true;}
    // PASS B Tesla: forward 120-degree cone, auto-acquired. No projectile - it spawns a ticking arc field.
    if(name==='tesla_arc'){c.tesla=true;c.heavy=false;}
    if(name==='hinge_beam'){c.beam=18;c.beamHits=3;c.aim={x:Math.sin(s.beamYaw),z:Math.cos(s.beamYaw)};c.fixedCooldown=.2;}
    if(name==='thread_beam'){c.beam=18;c.beamHits=1;c.fixedCooldown=.15;}
    if(name==='aperture_lamp'){c.aperture=16+34*charge;c.damage=16-6*charge;c.heavy=true;}
    if(name==='ember_seam'){
      const point=p.aimPoint;if(!point||dist(p,point)>14||!r._los(p,point))return {reject:true};
      if(s.drawPoint){const add=dist(s.drawPoint,point);if((s.drawLength||0)+add>8||!r._los(s.drawPoint,point)||r._owned(w.assetInstanceId).filter(e=>e.mechanic==='ember-drawing').length>=3)return {reject:true};}c.point={...point};
    }
    // 梯级线圈（试玩反馈："不如改成霰弹枪，一次发5颗，这5颗子弹都能导电…猛烈的电击会比较有打击感"）
    if(name==='ladder_coil'){c.count=5;c.spread=13;}
    // 风暴回执（试玩反馈："可以改成我之前说的那个带电的霰弹枪"）
    if(name==='storm_receipt'){c.count=5;c.spread=14;c.damage=5;c.charged=true;}
    if(name==='acid_sieve'){c.count=3;c.spread=12;}
    if(name==='steam_valve'){c.steam=s.steamPending&&r.time>=s.ventUntil;c.pierce=3;}
    if(name==='tox_sprayer')c.acid=s.quiet>=.4;
    return c;
  }
  paid(p,w,s,shot,c){if(this.r.revisions.claims(w))return false;if(!INSTALLED_ENERGY_IDS.includes(id(w)))return;shot.energy=c;if(c.damage!==undefined)shot.damage=c.damage*shot.mul;if(id(w)==='flame_belcher'){shot.statuses.burn=2;(shot.intrinsicStatuses||={}).burn=2;}if(id(w)==='tox_sprayer'){shot.statuses.poison=3;(shot.intrinsicStatuses||={}).poison=3;}if(c.steam)s.steamPending=false;}
  fire(p,w,s,shot,c){if(this.r.revisions.claims(w))return false;
    if(c.beam&&id(w)==='spark_shuttle'){
      // 熔核激光炮的「加粗」现在统一由 weapon_assets_runtime 的 BEAM_WIDTH_MUL 负责（spark_shuttle:10）。
      this.r._beam(p,p.aim,SPECS.spark_shuttle.range,shot,w.def.color,Infinity);return true;}
    if(c.tesla){
      // 特斯拉（试玩反馈："应该是我的武器、我这个枪直接去放电去攻击"）：
      // 不再召唤炮台、也不再存在任何部署物 —— 一扣当场放电。
      // 正面 120° 扇面自动索敌 → 最多 3 条主链（全额伤害）→ 主链再向 6 米内敌人延伸最多 3 条次链（60%）。
      const aim=p.aim, seen=this.r._enemies().filter(t=>{
        const d=unit(t.x-p.x,t.z-p.z);
        return d.x*aim.x+d.z*aim.z>=Math.cos(Math.PI/3)&&dist(p,t)<=SPECS.tesla_arc.range&&this.r._los(p,t);
      }).sort((a,b)=>dist(p,a)-dist(p,b));
      const mains=seen.slice(0,3);
      if(!mains.length)return true;
      const mainKeys=mains.map(key);
      for(const t of mains){
        if(this.r._beamVisual)this.r._beamVisual(p,t,shot.owner,w.def.color,.11);
        this.r._damage(t,shot,shot.damage,false,unit(t.x-p.x,t.z-p.z));
      }
      let subs=0;
      for(const m of mains)for(const t of this.r._enemies()){
        if(subs>=3)break;if(mainKeys.includes(key(t)))continue;
        if(dist(t,m)<=6&&this.r._los(m,t)){subs++;this.link(m,t,shot,Math.round(SPECS.tesla_arc.damage*.6));}
      }
      return true;
    }
    const name=id(w),r=this.r;

    if(c.beam){r._beam(p,c.aim||p.aim,c.beam,shot,w.def.color,c.beamHits);return true;}
    if(c.aperture){const half=c.aperture*Math.PI/360;for(const d of [-half,half]){const a=Math.atan2(p.aim.x,p.aim.z)+d;r._beamVisual(p,{x:p.x+Math.sin(a)*12,z:p.z+Math.cos(a)*12},shot.owner,w.def.color);}for(const target of r._enemies()){const d=unit(target.x-p.x,target.z-p.z);if(dist(p,target)<=12&&d.x*p.aim.x+d.z*p.aim.z>=Math.cos(half)&&r._los(p,target))r._damage(target,shot,shot.damage,false,d);}return true;}
    if(name==='clock_bomb'){r._add({kind:'zone',mechanic:'clock-bomb',owner:shot.owner,x:p.aimPoint.x,z:p.aimPoint.z,radius:.4,ttl:5,maxTTL:5,shot});return true;}
    if(name==='ember_seam'){
      if(s.drawPoint&&dist(s.drawPoint,c.point)>.02){const d=unit(c.point.x-s.drawPoint.x,c.point.z-s.drawPoint.z),len=dist(s.drawPoint,c.point);r._add({kind:'line',mechanic:'ember-drawing',width:.15*(shot.beamWidth??1),owner:shot.owner,x:s.drawPoint.x,z:s.drawPoint.z,dx:d.x,dz:d.z,length:len,ttl:12,maxTTL:12,shot:{...shot,statuses:{},intrinsicStatuses:{},damage:2*shot.mul}});s.drawLength=(s.drawLength||0)+len;}s.drawPoint=c.point;return true;
    }
    if(c.exit)r._remove(c.exit);
    return false;
  }
  projectile(e,p,w,s,c){if(this.r.revisions.isShot(e?.shot))return false;
    const name=id(w);if(!INSTALLED_ENERGY_IDS.includes(name))return;
    if(c.origin){e.x=c.origin.x;e.z=c.origin.z;const d=unit(p.aimPoint.x-e.x,p.aimPoint.z-e.z);e.dx=d.x;e.dz=d.z;}
    // Keep the irregular flame speed, but let the formal range govern its flight.
    if(name==='flame_belcher'){const random=this.r.game.gr?.()??.5;e.speed*=.7+random*.5;}
    if(['flame_belcher','tox_sprayer'].includes(name)){e.ttl=e.range/Math.max(.01,e.speed);e.maxTTL=e.ttl;}
    if(c.fuse){e.ttl=c.fuse;e.maxTTL=c.fuse;e.fuseOnly=true;e.bounce=1;e.pierce=0;e.blast=30*e.shot.mul;e.blastRadius=3.6;}
    if(['clap_mortar','pressure_mine','thunder_cask','grounding_rod','acid_sieve','mist_pendulum','kiln_seal'].includes(name)){e.range=Math.min(e.range,dist(p,p.aimPoint));e.ttl=e.range/Math.max(.1,e.speed);e.maxTTL=e.ttl;}
    if(name==='pressure_mine')e.shot.damage=0;
    if(name==='echo_shell'){e.blast=16*e.shot.mul;e.blastRadius=3;}
  }
  beforeDamage(t,damage,shot,s){if(this.r.revisions.isShot(shot))return damage;
    const name=shot.weaponId,r=this.r;
    if(name==='tox_sprayer'&&shot.energy?.acid&&s.films?.[key(t)]>r.time&&!s.acidRoots?.[shot.rootShotId]){damage+=4*(shot.baseSecondaryMul||1);delete s.films[key(t)];s.acidRoots??={};s.acidRoots[shot.rootShotId]=true;}
    if(name==='steam_valve'&&shot.energy?.steam&&s.wet?.[key(t)]>r.time&&!t.isBoss&&t.constructor?.name!=='Boss'){damage+=6*(shot.baseSecondaryMul||1);delete s.wet[key(t)];shot.steamConsumed=key(t);shot.knock=3;}
    if(name==='salt_cracker'&&s.salt?.[key(t)]>r.time&&s.lastSalt!==key(t)){damage+=10*(shot.baseSecondaryMul||1);shot.saltCash=true;}
    if(name==='quench_chalice'){
      // A conversion belongs to this accepted primary hit, never to a reused hit marker.
      delete shot.quenchTarget;this.pruneQuench(s);
      if(t.status?.burn>0&&(s.quench?.[key(t)]||0)<=r.time&&!s.quenchRoots?.[shot.rootShotId]?.targets[key(t)]){damage+=9*(shot.baseSecondaryMul||1);shot.quenchTarget=key(t);}
    }
    return damage;
  }
  afterDamage(t,applied,shot,s){if(this.r.revisions.isShot(shot))return undefined;
    const name=shot.weaponId,r=this.r;if(!INSTALLED_ENERGY_IDS.includes(name))return;
    if(name==='tox_sprayer'){s.films??={};s.films[key(t)]=r.time+4.6;}
    if(name==='storm_battery'&&shot.energy?.fork&&s.forkRoot!==shot.rootShotId){s.forkRoot=shot.rootShotId;for(const other of r._enemies().filter(e=>e!==t&&dist(e,t)<=6&&r._los(t,e)).sort((a,b)=>dist(t,a)-dist(t,b)).slice(0,4))this.link(t,other,shot,6);}
    if(name==='ash_invoice'){s.ashDamage=Math.min(20,(s.ashDamage||0)+applied);s.ashPoint={x:t.x,z:t.z};s.ashShot=shot;}
    if(name==='ladder_coil'){let from=t;const used=[key(t)];for(let i=0;i<3;i++){const next=r._enemies().filter(e=>!used.includes(key(e))&&dist(shot.origin,e)>=dist(shot.origin,from)+.5&&dist(e,from)<=6&&r._los(from,e)).sort((a,b)=>dist(from,a)-dist(from,b))[0];if(!next)break;used.push(key(next));this.link(from,next,shot,4);from=next;}}
    if(name==='capacitor_sieve'){s.distinct??=[];if(!s.distinct.includes(key(t)))s.distinct.push(key(t));if(s.distinct.length>=3){s.capacitor=Math.min(2,(s.capacitor||0)+1);s.distinct=[];}s.capShot=shot;}
    if(name==='ion_abacus'){s.polarity??={};if(s.polarity[key(t)]){s.polarity[key(t)]=false;const next=r._enemies().filter(e=>e!==t&&s.polarity[key(e)]&&dist(t,e)<=6&&r._los(t,e)).sort((a,b)=>dist(t,a)-dist(t,b))[0];if(next){s.polarity[key(next)]=false;this.link(t,next,shot,8);}else r._damage(t,shot,4*shot.mul,true);}else s.polarity[key(t)]=true;}
    if(name==='bell_switch'){s.bellMarks??={};s.bellMarks[key(t)]={armedAt:r.time+.4,until:r.time+12,shot};}
    if(name==='storm_receipt'){s.touched??=[];const prior=s.touched.filter(v=>v!==key(t));if(!s.touched.includes(key(t)))s.touched.push(key(t));if(!t.alive)for(const v of prior.slice(-2)){const next=r._enemy(v);if(next&&r._los(t,next))this.link(t,next,{...shot,crit:false},7);}}
    if(name==='thread_beam'){if(s.threadTarget!==key(t)){s.threadTarget=key(t);s.threadDwell=0;}s.threadHitAt=r.time;s.threadShot=shot;}
    if(name==='quench_chalice'&&shot.quenchTarget===key(t)){
      delete shot.quenchTarget;t.status.burn=0;s.quench??={};s.quench[key(t)]=r.time+1;
      // Ordinary projectile lifetime is capped at ten seconds by the runtime.
      s.quenchRoots??={};const root=s.quenchRoots[shot.rootShotId]??={until:r.time+10,targets:{}};root.targets[key(t)]=true;
      if(!t.isBoss&&t.constructor?.name!=='Boss')t.applyStatus?.('freeze',1);
    }
    if(name==='steam_valve'&&shot.steamConsumed!==key(t)){s.wet??={};s.wet[key(t)]=r.time+4;}
    if(name==='salt_cracker'){s.salt??={};if(shot.saltCash)delete s.salt[key(t)];else{s.salt[key(t)]=r.time+3;while(Object.keys(s.salt).length>2)delete s.salt[Object.keys(s.salt)[0]];}s.lastSalt=key(t);}
    if(name==='kiln_seal'){s.kilnMarks??={};s.kilnMarks[key(t)]={root:shot.rootShotId,shot,until:r.time+12};while(Object.keys(s.kilnMarks).length>3)delete s.kilnMarks[Object.keys(s.kilnMarks)[0]];}
  }
  link(from,target,shot,damage){const r=this.r;if(r._beamVisual(from,target,shot.owner))r._damage(target,shot,damage*shot.mul,true,unit(target.x-from.x,target.z-from.z));}
  observeEnemyAttack(target){const r=this.r;for(const s of Object.values(r.states)){const m=s.bellMarks?.[key(target)];if(m&&m.armedAt<=r.time&&m.until>=r.time){delete s.bellMarks[key(target)];r._damage(target,m.shot,6*m.shot.mul,true);const next=this.nearest(target,[key(target)],6);if(next)this.link(target,next,m.shot,6);}}}
  // PASS B thunder_cask: one shared detonation path (bullet hit / contact), with burn + stun on survivors.
  detonateCask(cask){
    const r=this.r,shot=cask.shot;
    r._explode(cask,52*shot.mul,3.9);
    for(const t of r._enemies()){
      if(dist(t,cask)>3.9+(t.r||.5))continue;
      if(typeof t.applyStatus==='function')t.applyStatus('burn',4,{strength:10});
      if(!t.isBoss&&!t.elite)t.stunT=Math.max(t.stunT||0,.5);
    }
    cask.ended=true;r._remove(cask.id);
  }
  interceptProjectile(e){if(this.r.revisions.isShot(e?.shot))return false;const r=this.r;for(const cask of r.entities.filter(v=>v.mechanic==='cask')){if(dist(cask,e)>.6+(e.radius||.1))continue;if(e.team===1){r._remove(cask.id);return true;}if(r.time<cask.armedAt)continue;this.detonateCask(cask);return true;}return false;}
  wall(e,from,to,collision){if(this.r.revisions.isShot(e?.shot))return false;if(e.shot.weaponId==='quarry_splitter'&&collision?.solid){e.quarryWall=true;const r=this.r,d=unit(to.x-from.x,to.z-from.z),side={x:d.z,z:-d.x};for(const sign of [-1,1])r._explode({...e,x:from.x+side.x*sign,z:from.z+side.z*sign,wallOcclusion:true},13*e.shot.mul,1.9);}}
  end(e){if(this.r.revisions.isShot(e?.shot))return false;
    const name=e.shot.weaponId,r=this.r,s=this.state(e.owner);if(!s)return;
    const zone=(mechanic,ttl,more={})=>r._add({kind:'zone',mechanic,owner:e.owner,x:e.x,z:e.z,ttl,maxTTL:ttl,shot:e.shot,...more});
    if(name==='clap_mortar'){
      const first=r._owned(e.owner).find(v=>v.mechanic==='clap-point');if(first&&r.time-first.created<=2&&dist(first,e)<=6){r._remove(first.id);r._add({kind:'delayed',owner:e.owner,x:(e.x+first.x)/2,z:(e.z+first.z)/2,ttl:.4,maxTTL:.4,shot:e.shot,blast:28,radius:3});}else zone('clap-point',2,{radius:.3});
    }
    if(name==='pressure_mine')zone('mine',8,{radius:.35,armedAt:r.time+.6});
    if(name==='echo_shell')r._add({kind:'delayed',owner:e.owner,x:e.x,z:e.z,ttl:.7,maxTTL:.7,shot:{...e.shot,statuses:{},intrinsicStatuses:{},crit:false,secondaryExplosion:true},blast:14,radius:2.2});
    if(name==='quarry_splitter'&&!e.quarryWall)r._explode(e,10*e.shot.mul,1.9);
    if(name==='thunder_cask')r._add({kind:'unit',mechanic:'cask',owner:e.owner,x:e.x,z:e.z,ttl:8,maxTTL:8,shot:e.shot,armedAt:r.time+.6,radius:.5});
    if(name==='grounding_rod'){
      const rods=r._owned(e.owner).filter(v=>v.mechanic==='rod'&&!v.ended&&v.ttl>0);const prior=rods.at(-1),current=zone('rod',3,{radius:.15});if(current&&prior&&dist(prior,e)>1e-8&&dist(prior,e)<=8&&r._los(prior,e)){const d=unit(e.x-prior.x,e.z-prior.z);zone('rod-corridor',3,{a:prior.id,b:current.id,x:prior.x,z:prior.z,dx:d.x,dz:d.z,length:dist(prior,e),radius:2,nextTick:r.time+.4,ticks:0});}
    }
    if(name==='acid_sieve'){s.acidZones??={};if(!s.acidZones[e.shot.rootShotId]){s.acidZones[e.shot.rootShotId]=true;zone('acid-zone',4,{radius:3,nextTick:r.time+.5,shot:{...e.shot,statuses:{},intrinsicStatuses:{}}});}}
    if(name==='mist_pendulum'){// 无上限（试玩要求）：不再挤掉最早的圈，支持铺圈/阵地战。
      zone('mist',3,{radius:3,dx:e.dx,dz:e.dz,nextTick:r.time+.5,shot:{...e.shot,statuses:{poison:.4},intrinsicStatuses:{poison:.4}}});}
    if(name==='kiln_seal'&&!e.hit.length){for(const old of r._owned(e.owner).filter(v=>v.mechanic==='kiln-ground'))r._remove(old.id);zone('kiln-ground',3,{radius:2});}
  }
  step(e,dt){if(this.r.revisions.isShot(e?.shot))return false;
    if(e.mechanic!=='shuttle')return false;const r=this.r,target=r._enemy(e.pair[e.toIndex]);if(!target||!r._los(e,target)){e.ended=true;return true;}const d=unit(target.x-e.x,target.z-e.z),travel=Math.min(dist(e,target),e.speed*dt);e.dx=d.x;e.dz=d.z;e.x+=d.x*travel;e.z+=d.z*travel;
    if(dist(e,target)<=.1){r._damage(target,e.shot,e.shot.damage,true,d);e.pass++;if(e.pass>=4)e.ended=true;else e.toIndex=1-e.toIndex;}return true;
  }
  entity(e,dt){if(this.r.revisions.isShot(e?.shot))return false;
    const names=['clock-bomb','clap-point','mine','cask','rod','rod-corridor','acid-zone','mist','kiln-ground','ember-drawing','ember-seam'];if(!names.includes(e.mechanic))return false;const r=this.r,endTime=r.time+Math.max(0,e.ttl-dt);e.ttl-=dt;
    if(e.mechanic==='clock-bomb'&&e.ttl<=1e-8)r._explode(e,10*e.shot.mul,3);
    if(e.mechanic==='clap-point'&&e.ttl<=0)r._explode(e,6*e.shot.mul,2);
    if(e.mechanic==='mine'&&r.time>=e.armedAt&&r._enemies().some(t=>dist(t,e)<=1+(t.r||t.radius||.5))){r._explode(e,18*e.shot.mul,2.5);e.ended=true;}
    // PASS B thunder_cask: contact detonation - an enemy touching the cask (or the cask touching an enemy) sets it off.
    if(e.mechanic==='cask'&&r.time>=e.armedAt&&r._enemies().some(t=>dist(t,e)<=.5+(t.r||t.radius||.5))){this.detonateCask(e);return true;}
    if(e.mechanic==='rod-corridor'&&(!r.entities.some(v=>v.id===e.a)||!r.entities.some(v=>v.id===e.b))){e.ended=true;return true;}
    if(e.mechanic==='mist'){const next={x:e.x+e.dx*dt,z:e.z+e.dz*dt};if(r._los(e,next)){e.x=next.x;e.z=next.z;}}
    if(e.mechanic==='acid-zone')e.radius=3*Math.min(1,Math.max(.1,e.ttl/.5));
    if(e.nextTick!==undefined){
      const until=e.end??(e.created+e.maxTTL);while(e.nextTick<=Math.min(r.time,until)+1e-8){const time=e.nextTick;let eligible=[],damage=0,interval=.5;
        if(e.mechanic==='rod-corridor'){interval=.4;if((e.ticks||0)<6&&r._los(e,{x:e.x+e.dx*e.length,z:e.z+e.dz*e.length})){eligible=r._enemies().filter(t=>segdist(t,e,{x:e.x+e.dx*e.length,z:e.z+e.dz*e.length})<=2+(t.r||t.radius||.5));damage=4;}e.ticks=(e.ticks||0)+1;}
        if(e.mechanic==='acid-zone'||e.mechanic==='mist'){eligible=r._enemies().filter(t=>dist(t,e)<=e.radius+(t.r||t.radius||.5));damage=e.mechanic==='mist'?1:1.5;}
        if(e.mechanic==='ember-seam'){eligible=r._enemies().filter(t=>{
          const along=Math.max(0,Math.min(e.length,(t.x-e.x)*e.dx+(t.z-e.z)*e.dz)),foot={x:e.x+e.dx*along,z:e.z+e.dz*along};
          return dist(t,foot)<=(t.r||t.radius||.5)+(e.width??.15)&&r._los(foot,t);
        });damage=2;}
        if(damage)r.queue.push({time,owner:e.owner,shot:e.shot,hits:eligible.map(t=>({target:key(t),dir:unit(t.x-e.x,t.z-e.z)})),damage:damage*e.shot.mul,interval,ledgerPrefix:e.mechanic+':'});e.nextTick+=interval;
      }
    }
    if(e.mechanic==='acid-zone'&&e.ttl<=0)for(const t of r._enemies().filter(t=>dist(t,e)<.6+(t.r||t.radius||.5)))r._damage(t,e.shot,4*e.shot.mul,true);
    if(e.mechanic==='kiln-ground'){const s=this.state(e.owner);for(const [target,m]of Object.entries(s.kilnMarks||{})){const t=r._enemy(target);if(t&&m.root!==e.shot.rootShotId&&m.until>r.time&&dist(t,e)<=2){r._damage(t,m.shot,12*m.shot.mul,true);delete s.kilnMarks[target];}}}
    if(e.ttl<=0)e.ended=true;return true;
  }
  finishReload(p,w,s,take){if(this.r.revisions.claims(w))return false;
    if(take<=0)return;const name=id(w),r=this.r;
    if(name==='ash_invoice'&&s.ashDamage>0&&s.ashPoint){r._explode({...s.ashPoint,owner:w.assetInstanceId,shot:{...s.ashShot,mul:1,baseSecondaryMul:1}},s.ashDamage*.5,2);s.ashDamage=0;s.ashPoint=null;}
    if(name==='capacitor_sieve'&&s.capacitor){const count=s.capacitor;s.capacitor=0;for(let i=0;i<count;i++){const target=this.nearest(p.aimPoint,[],12);if(!target)continue;this.link(p,target,s.capShot,8);const other=this.nearest(target,[key(target)],6);if(other)this.link(target,other,s.capShot,4);}}
  }
  suspend(){for(const s of Object.values(this.r.states)){if(s.weaponId==='thread_beam'){s.threadDwell=0;s.threadTarget=null;}if(s.weaponId==='hinge_beam')s.warmup=0;}}
  clearCombat(){for(const s of Object.values(this.r.states))for(const field of ['films','acidRoots','polarity','bellMarks','salt','lastSalt','wet','quench','quenchRoots','kilnMarks','acidZones','distinct','touched','capShot','ashPoint','ashShot','ashDamage','capacitor','drawPoint','drawLength'])delete s[field];}
  visual(){const list=[];for(const [owner,s] of Object.entries(this.r.states))for(const field of ['bellMarks','salt','polarity','kilnMarks'])for(const [id,value]of Object.entries(s[field]||{})){const target=this.r._enemy(id);if(target&&value)list.push({id:`${field}:${owner}:${id}`,kind:'mark',owner,x:target.x,z:target.z,y:1.3,ttl:1,maxTTL:1});}return list;}
  validateEntity(e){if(this.r.revisions.isShot(e?.shot))return false;const finite=(o,keys)=>o&&keys.every(k=>Number.isFinite(o[k]));if(['clock-bomb','clap-point','rod','acid-zone','mist','kiln-ground'].includes(e.mechanic)&&!finite(e,['radius']))throw Error('Invalid energy radius');if(e.mechanic==='ember-seam'&&!finite(e,['end','igniteAt','length']))throw Error('Invalid fire seam');if(e.mechanic==='shuttle'&&(!Array.isArray(e.pair)||e.pair.length!==2||!e.pair.every(v=>typeof v==='string')||!finite(e,['pass','toIndex'])||![0,1].includes(e.toIndex)))throw Error('Invalid shuttle');if(['mine','cask'].includes(e.mechanic)&&!finite(e,['armedAt','radius']))throw Error('Invalid armed deployment');if(['rod-corridor','acid-zone','mist','ember-seam'].includes(e.mechanic)&&!finite(e,['nextTick']))throw Error('Invalid energy tick');if(['mist','ember-seam','ember-drawing','rod-corridor'].includes(e.mechanic)&&(!finite(e,['dx','dz'])||Math.abs(Math.hypot(e.dx,e.dz)-1)>.01))throw Error('Invalid energy direction');if(e.mechanic==='rod-corridor'&&(typeof e.a!=='string'||typeof e.b!=='string'||!finite(e,['length','ticks'])))throw Error('Invalid rod corridor');}

}
