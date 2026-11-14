import {SPECS} from './specs.js';
import {ARCHIVED_GEOMETRY_IDS} from '../weapon_compatibility.js';
export const GEOMETRY_IDS=["double_bell","seam_sweeper","breach_bucket","ring_shot","grit_reloader","shield_chisel","fuse_rail","corner_prism","boomerang_fork","polygon_oath","line_scribe","tandem_rail","door_frame"];
const INSTALLED_GEOMETRY_IDS=[...GEOMETRY_IDS,...ARCHIVED_GEOMETRY_IDS];
const id=w=>w.def.sourceWeapon||w.def.id,key=e=>String(e.id),dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const unit=(x,z)=>{const n=Math.hypot(x,z)||1;return {x:x/n,z:z/n};};
const pointDistance=(p,a,b)=>{const x=b.x-a.x,z=b.z-a.z,t=Math.max(0,Math.min(1,((p.x-a.x)*x+(p.z-a.z)*z)/(x*x+z*z||1)));return Math.hypot(p.x-a.x-x*t,p.z-a.z-z*t);};
export class GeometryMechanics {
  constructor(r){this.r=r;}
  track(){}
  input(p,w,s,dt,{down,pressed,released,clicked}){
    const name=id(w),r=this.r,seconds={tandem_rail:.5,polygon_oath:.6}[name];if(!seconds)return false;
    // 折线誓铳（试玩反馈："前期摁的这个蓄力的激光就是攻击…相当于是实时的一个机关枪"）：
    // 不再要求"蓄满后松手才发射"，而是按住期间就先蓄力、蓄满立刻发射并立刻重新蓄力，形成持续输出。
    if(name==='polygon_oath'){
      if(down&&s.cooldown<=1e-8){s.charge=Math.min(1,(s.charge||0)+dt/seconds);p.charging=down;p.charge=s.charge||0;
        if(s.charge>=1-1e-8&&r._fire(p,w,s,1)){s.charge=0;p.charge=0;}}
      if(!down){p.charging=false;p.charge=0;s.charge=0;}
      if(down&&w.mag<=0)r.beginReload(p,w);return true;
    }
    if(down&&s.cooldown<=1e-8)s.charge=Math.min(1,(s.charge||0)+dt/seconds);p.charging=down;p.charge=s.charge||0;
    if(released&&s.cooldown<=1e-8){if(s.charge>=1-1e-8)r._fire(p,w,s,1);s.charge=0;p.charge=0;}
    if(down&&w.mag<=0)r.beginReload(p,w);return true;
  }
  trace(start,d,max,shot=null){let len=0,prop=null;while(len<max){const n=Math.min(max,len+.08),x=start.x+d.x*n,z=start.z+d.z*n;prop=this.r.world.propHit?.(x,z,.1,.8);if(prop){if(shot)this.r.world.onPropHit?.(prop,shot.damage,x,.8,z,{assetShot:shot});break;}if(this.r._blocked(x,z))break;len=n;}return {x:start.x+d.x*len,z:start.z+d.z*len,length:len,wall:!prop&&len<max-1e-8,prop:!!prop};}
  reflected(at,d){const bx=this.r._blocked(at.x+d.x*.12,at.z),bz=this.r._blocked(at.x,at.z+d.z*.12);return {x:bx&&!bz?-d.x:bz&&!bx?d.x:-d.x,z:bz&&!bx?-d.z:bx&&!bz?d.z:-d.z};}
  prepare(p,w,s,charge){
    const name=id(w),r=this.r;if(!INSTALLED_GEOMETRY_IDS.includes(name))return null;const c={};
    switch(name){
      case 'double_bell':c.count=4;c.spread=s.barrel===1?4:18;break;
      case 'backstep_bellows':c.count=5;c.spread=10;c.retreat=!!s.backOrigin&&((p.x-s.backOrigin.x)*s.backDirection.x+(p.z-s.backOrigin.z)*s.backDirection.z)<=-2;break;
      case 'seam_sweeper':c.count=7;c.spread=0;c.side=s.sideHits>=2?1-(s.fanSide||0):(s.fanSide||0);break;
      case 'breach_bucket':c.count=5;c.spread=15;break;
      case 'ring_shot':c.count=6;c.spread=2;break;
      case 'grit_reloader':c.count=4;c.spread=17;break;
      case 'shield_chisel':break;
      case 'tandem_rail':c.fold=3;c.heavy=true;break;      // 2026-10-13 改造成「三折棱镜」
      case 'stopper_rail':c.pierce=99;break;
      case 'weft_needle':c.pierce=2;break;
      case 'fuse_rail':if(s.railWear>=6)return {reject:true};c.pierce=4;break;
      case 'door_frame':c.fold=5;c.heavy=true;break;       // 2026-10-13 改造成「五折棱镜」
      case 'line_scribe':c.fold=1;c.heavy=true;break;      // 2026-10-13 改造成「单折棱镜」
      case 'corner_prism':c.heavy=true;break;
      case 'bank_stamp':c.bounce=1;break;
      case 'boomerang_fork':c.count=2;c.spread=20;c.pierce=99;break;
      case 'wall_clock':{const mark=r._owned(w.assetInstanceId,'mark').find(e=>e.mechanic==='wall-clock');if(mark){c.mark=mark.id;c.origin={x:mark.x,z:mark.z};c.aim=unit(p.aimPoint.x-mark.x,p.aimPoint.z-mark.z);c.damage=18;}else c.damage=this.trace(p,p.aim,SPECS[name].range).wall?2:8;break;}
      case 'skipping_stone':c.pierce=99;break;
      case 'angle_debt':if(s.angleUntil>=r.time&&s.angleDebt){c.aim=s.angleDebt;c.bounce=1;c.debt=true;}break;
      case 'mirror_slug':c.pierce=99;break;
      case 'polygon_oath':c.bounce=2;c.spread=0;c.pierce=99;c.heavy=true;break;
      default:throw Error(`Missing geometry consumer ${name}`);
    }return c;
  }
  paid(p,w,s,shot,c){
    const name=id(w);if(!INSTALLED_GEOMETRY_IDS.includes(name))return;shot.geometry=c;if(c.damage!==undefined)shot.damage=c.damage*shot.mul;
    if(name==='double_bell'){s.barrel=1-(s.barrel||0);s.lastBarrel=this.r.time;}
    if(name==='backstep_bellows'){s.backOrigin={x:p.x,z:p.z};s.backDirection={...p.aim};}
    if(name==='seam_sweeper'&&s.sideHits>=2){s.fanSide=1-(s.fanSide||0);s.sideHits=0;}
    if(name==='fuse_rail')s.railWear=(s.railWear||0)+1;
    if(c.mark)this.r._remove(c.mark);if(c.debt){s.angleDebt=null;s.angleUntil=0;}
  }
  fire(p,w,s,shot,c){
    const name=id(w),r=this.r;
    if(name==='corner_prism'){
      let start={x:p.x,z:p.z},d={...p.aim},remain=24;
      // 2026-10-13：逐段结算（首段 + 反射段可对同一敌人各造成一次伤害）
      for(let i=0;i<2;i++){const used=new Set();const end=this.trace(start,d,remain,{...shot,damage:shot.damage*(i?.7:1)});if(!r._beamVisual(start,end,shot.owner,w.def.color,.09*(shot.beamWidth??1)))break;for(const t of r._enemies())if(!used.has(key(t))&&pointDistance(t,start,end)<=(t.r||t.radius||.5)+.09*(shot.beamWidth??1)&&r._los(start,t)){used.add(key(t));r._damage(t,shot,shot.damage*(i?.7:1),false,d);}remain-=end.length;if(!end.wall)break;d=this.reflected(end,d);start={x:end.x+d.x*.02,z:end.z+d.z*.02};}return true;
    }
    if(c.fold){
      // 折镜（v2 实例路径）：反弹 N 次 = N+1 段；每折伤害 ×0.8；同一次攻击对同一敌人只结算一次。
      const hw=.09*(shot.beamWidth??1)*(1+.12*c.fold);let start={x:p.x,z:p.z},dir={...p.aim},remain=26;
      // 2026-10-13：逐段结算（直射 + 每个反弹段都可对同一敌人各造成一次伤害）
      let used=new Set();
      for(let i=0;i<=c.fold;i++){
        used=new Set();
        const dmg=shot.damage*Math.pow(.8,i);
        const end=this.trace(start,dir,remain,{...shot,damage:dmg});
        if(!r._beamVisual(start,end,shot.owner,w.def.color,hw))break;
        for(const t of r._enemies())if(!used.has(key(t))&&pointDistance(t,start,end)<=(t.r||t.radius||.5)+hw&&r._los(start,t)){used.add(key(t));r._damage(t,shot,dmg,false,dir);}
        remain-=end.length;if(!end.wall)break;
        dir=this.reflected(end,dir);start={x:end.x+dir.x*.02,z:end.z+dir.z*.02};
      }
      return true;
    }
    return false;
  }
  projectile(e,p,w,s,c){
    const name=id(w);if(!INSTALLED_GEOMETRY_IDS.includes(name))return;
    if(c.bounce)e.bounce+=c.bounce;
    if(c.origin){e.x=c.origin.x;e.z=c.origin.z;}
    if(c.aim){e.dx=c.aim.x;e.dz=c.aim.z;e.shot.direction={...c.aim};}
    if(name==='backstep_bellows'&&c.retreat&&(e.shot.unitId===0||e.shot.unitId===4)){e.shot.damage=2*e.shot.mul;e.shot.knock=3;e.range=Math.min(3,e.range);}
    if(name==='seam_sweeper'){const i=e.shot.unitId,left=i<(c.side?3:4),n=left?(c.side?3:4):(c.side?4:3),j=left?i:i-(c.side?3:4),offset=(left?-1:1)*(.16+j/Math.max(1,n-1)*.3);const yaw=Math.atan2(p.aim.x,p.aim.z)+offset;e.dx=Math.sin(yaw);e.dz=Math.cos(yaw);e.shot.fanSide=left?0:1;}
    if(name==='ring_shot')e.ringAngle=Math.atan2(p.aim.x,p.aim.z)+(e.shot.unitId/5-.5)*1.2;
    if(name==='tandem_rail'){const sign=e.shot.unitId?1:-1;e.x+=p.aim.z*.6*sign;e.z-=p.aim.x*.6*sign;}
    if(name==='door_frame'){const sign=e.shot.unitId?1:-1,target={x:p.aimPoint.x+p.aim.z*2*sign,z:p.aimPoint.z-p.aim.x*2*sign},d=unit(target.x-e.x,target.z-e.z);e.dx=d.x;e.dz=d.z;e.range=dist(e,target);e.ttl=e.range/e.speed;e.maxTTL=e.ttl;}
    if(name==='boomerang_fork'){e.originalOrigin={x:p.x,z:p.z};e.phase='out';e.range=20;e.ttl=3;e.maxTTL=3;}
    if(name==='skipping_stone'){e.range=5.4;e.ttl=5.4/e.speed;e.maxTTL=e.ttl;e.y=.35;}
    if(name==='mirror_slug'){e.phase='out';e.ttl+=.2;e.maxTTL=e.ttl;e.range+=4;}
    if(name==='polygon_oath'){e.bounce=2;e.range=30;e.ttl=30/e.speed;e.maxTTL=e.ttl;}
  }
  beforeDamage(t,damage,shot,s){
    if(shot.weaponId==='fuse_rail')damage*=.8**(shot.hitIndex||0);
    if(shot.weaponId==='shield_chisel'&&s.shieldWear?.includes(key(t))){const d=shot.direction,dot=Math.sin(t.yaw||0)*d.x+Math.cos(t.yaw||0)*d.z;if(dot<-.55)damage+=2/.6;}
    return damage;
  }
  afterDamage(t,applied,shot,s){
    const r=this.r;
    if(shot.weaponId==='seam_sweeper'){s.sideHits=s.lastSideHit===shot.fanSide?(s.sideHits||0)+1:1;s.lastSideHit=shot.fanSide;}
    if(shot.weaponId==='weft_needle'){
      if(s.lastWeftTarget===key(t)&&s.lastWeftRoot!==shot.rootShotId&&s.lastWeftOrigin){const dx=shot.origin.x-s.lastWeftOrigin.x,dz=shot.origin.z-s.lastWeftOrigin.z,d=shot.direction;if(Math.hypot(dx,dz)>=.8&&Math.hypot(dx,dz)<=8&&r._los(s.lastWeftOrigin,shot.origin))r._beam(s.lastWeftOrigin,unit(dx,dz),Math.hypot(dx,dz),{...shot,damage:7*shot.mul},null,Infinity,true);}
      s.lastWeftTarget=key(t);s.lastWeftOrigin=shot.origin;s.lastWeftRoot=shot.rootShotId;
    }
  }
  outcome(t,applied,shot,secondary){if(secondary)return;if(shot.weaponId==='shield_chisel'){const s=this.r.states[shot.owner];s.shieldWear??=[];if(!s.shieldWear.includes(key(t)))s.shieldWear.push(key(t));}}
  shards(e,damage,count,angles){const r=this.r;for(let i=0;i<count;i++){const yaw=angles[i];r._add({kind:'projectile',owner:e.owner,x:e.x,z:e.z,dx:Math.sin(yaw),dz:Math.cos(yaw),speed:25,ttl:.2,maxTTL:.2,range:5,traveled:0,radius:.1,hit:[],pierce:0,bounce:0,secondary:true,shot:{...e.shot,damage:damage*e.shot.mul},color:e.color});}}
  wall(e,from,to,collision={solid:true}){
    const name=e.shot.weaponId,r=this.r,s=r.states[e.owner];if(!s||e.secondary)return;
    const bx=r._blocked(to.x,from.z),bz=r._blocked(from.x,to.z),normal=bx&&!bz?{x:-Math.sign(e.dx),z:0}:bz&&!bx?{x:0,z:-Math.sign(e.dz)}:unit(-e.dx,-e.dz);
    if(name==='breach_bucket'){s.wallShards??={};if(!s.wallShards[e.shot.rootShotId]){s.wallShards[e.shot.rootShotId]=true;const yaw=Math.atan2(normal.z,-normal.x);this.shards(e,2,3,[yaw-.15,yaw+.15,yaw+Math.PI]);}}
    if(name==='bank_stamp'&&e.shot.sequence%4===0&&!e.splitDone){e.splitDone=true;const yaw=Math.atan2(normal.x,normal.z);this.shards(e,2,2,[yaw-.12,yaw+.12]);}
    if(name==='stopper_rail')this.stake(e);
    if(name==='wall_clock'&&!e.shot.geometry?.mark){for(const old of r._owned(e.owner,'mark').filter(v=>v.mechanic==='wall-clock'))r._remove(old.id);r._add({kind:'mark',mechanic:'wall-clock',owner:e.owner,x:from.x,z:from.z,ttl:12,maxTTL:12,shot:e.shot});}
    if(name==='angle_debt'&&collision.solid&&!e.shot.geometry?.debt){s.angleDebt=this.reflected(from,{x:e.dx,z:e.dz});s.angleUntil=r.time+2;}
  }
  stake(e){if(e.stakeDone)return;e.stakeDone=true;this.r._add({kind:'delayed',mechanic:'terminal-stake',owner:e.owner,x:e.x,z:e.z,dx:e.dx,dz:e.dz,ttl:.4,maxTTL:.4,shot:{...e.shot,damage:8*e.shot.mul}});e.ended=true;}
  preHit(e){if(e.shot.weaponId==='stopper_rail'&&e.hit.length>=2){this.stake(e);return false;}return true;}
  postHit(e){if(e.shot.weaponId==='mirror_slug'&&e.phase==='out'){e.phase='wait';e.returnDue=this.r.time+.2;e.originalSpeed=e.speed;e.speed=0;e.fuseOnly=true;}}
  bounce(){}
  travel(e){
    if(e.shot.weaponId==='ring_shot'&&e.traveled>=5&&!e.transformed){e.transformed=true;e.dx=Math.sin(e.ringAngle);e.dz=Math.cos(e.ringAngle);}
    if(e.shot.weaponId==='skipping_stone')e.y=.35+.65*Math.sin(Math.PI*(e.traveled%1.8)/1.8);
  }
  step(e,dt){
    const name=e.shot.weaponId,r=this.r;
    if(name==='boomerang_fork'){
      if(e.phase==='out'&&(e.traveled>=8||e.recall)){e.phase='return';e.hit=[];e.shot={...e.shot,damage:4*e.shot.mul};}
      if(e.phase==='return'){if(dist(e,e.originalOrigin)<.3){e.ended=true;return true;}const d=unit(e.originalOrigin.x-e.x,e.originalOrigin.z-e.z);e.dx=d.x;e.dz=d.z;}
    }
    if(name==='mirror_slug'&&e.phase==='wait'){if(r.time<e.returnDue)return true;e.phase='return';e.dx=-e.dx;e.dz=-e.dz;e.speed=e.originalSpeed;e.range=e.traveled+4;e.shot={...e.shot,damage:7*e.shot.mul};}
return false;
  }
  end(e){
    const name=e.shot.weaponId,r=this.r,s=r.states[e.owner];if(!s)return;
    if(name==='door_frame'){s.stakePairs??={};s.stakePairs[e.shot.rootShotId]??=[];s.stakePairs[e.shot.rootShotId][e.shot.unitId]={x:e.x,z:e.z};}
    if(name==='skipping_stone'&&e.traveled>=5.4-.13){const targets=r._enemies().filter(t=>!e.hit.includes(key(t))&&dist(e,t)<2&&r._los(e,t)).slice(0,2);for(const t of targets)r._damage(t,e.shot,4*e.shot.mul,true,unit(t.x-e.x,t.z-e.z));}
  }
  entity(e,dt){
    if(!['terminal-stake','door-frame'].includes(e.mechanic))return false;e.ttl-=dt;if(e.ttl>0)return true;
    const r=this.r;if(e.mechanic==='terminal-stake')r._beam(e,{x:e.dx,z:e.dz},8,e.shot,e.color,2,true);
    else {const points=this.r.states[e.owner]?.stakePairs?.[e.shot.rootShotId]||[],flying=r.entities.filter(p=>p.kind==='projectile'&&p.shot.rootShotId===e.shot.rootShotId);for(const p of flying)points[p.shot.unitId]={x:p.x,z:p.z};if(points[0]&&points[1]){const [a,b]=points;r._beam(a,unit(b.x-a.x,b.z-a.z),dist(a,b),{...e.shot,damage:16*e.shot.mul},null,4,true);}if(this.r.states[e.owner]?.stakePairs)delete this.r.states[e.owner].stakePairs[e.shot.rootShotId];}
    e.ended=true;return true;
  }
  beginReload(p,w,s,{actionsOnly=false}={}){
    const name=id(w),r=this.r;
    if(name==='boomerang_fork')for(const e of r._owned(w.assetInstanceId,'projectile'))e.recall=true;
    if(name==='grit_reloader'&&!actionsOnly){
      if(s.reload||w.mag>=r._cap(p,w)||(!r._mana(w)&&SPECS[name].reserve>0&&w.reserve<=0))return true;
      s.forceReload=false;s.reload={remaining:.45*(p.stats?.reloadMul||1),start:w.mag,grit:true};
      s.cooldown=Math.max(0,s.cooldown);p.reloading=true;p.reloadT=s.reload.remaining;
      r._feedback('reload',{phase:'start',weapon:w});return true;
    }
    return false;
  }
  reloadStep(p,w,s,dt,{pressed}){
    if(id(w)!=='grit_reloader'||!s.reload)return false;
    const r=this.r,cap=r._cap(p,w),finite=!r._mana(w)&&SPECS.grit_reloader.reserve>0;
    s.cooldown=Math.max(0,s.cooldown);
    // A new edge can use an already loaded shell immediately. Holding fire
    // while empty must still let the sequential reload make progress.
    if(pressed&&w.mag>0){s.reload=null;p.reloading=false;p.reloadT=0;return false;}
    const interval=.45*(p.stats?.reloadMul||1),reload=s.reload;
    // Old carried countdowns have no sequential marker. Resume at the next
    // shell without treating their remaining full-mag time as paid inserts.
    if(!reload.grit){reload.remaining=Math.min(interval,reload.remaining);reload.grit=true;}
    reload.remaining-=dt;
    while(reload.remaining<=1e-8&&w.mag<cap&&(!finite||w.reserve>0)){
      w.mag++;if(finite)w.reserve--;
      s.shots=0;s.buildReloaded=true;p._shotsSinceReload=0;
      r._feedback('reload',{phase:'shell',weapon:w});reload.remaining+=interval;
    }
    if(w.mag>=cap||(finite&&w.reserve<=0)){
      s.reload=null;p.reloading=false;p.reloadT=0;
      // A shell or a depleted reserve is not a full-mag completion event.
      if(w.mag>=cap)r._feedback('reload',{phase:'complete',weapon:w});
    }else{reload.remaining=Math.max(0,reload.remaining);p.reloading=true;p.reloadT=reload.remaining;}
    return true;
  }
  finishReload(p,w,s,take){if(id(w)==='fuse_rail'&&take>0)s.railWear=0;}
  visual(){
    const r=this.r,p=r.player,w=p?.weapon;if(!w||id(w)!=='polygon_oath'||!p.charging)return [];const out=[];let start={x:p.x,z:p.z},d={...p.aim},remain=30;
    for(let i=0;i<3;i++){const end=this.trace(start,d,remain);out.push({id:`polygon-preview-${i}`,kind:'line',phase:'preview',x:start.x,z:start.z,dx:d.x,dz:d.z,length:end.length,ttl:1,maxTTL:1});remain-=end.length;if(!end.wall)break;d=this.reflected(end,d);start={x:end.x+d.x*.02,z:end.z+d.z*.02};}return out;
  }
  validateEntity(e){
    const name=e.shot?.weaponId,finite=(o,fields)=>o&&fields.every(k=>Number.isFinite(o[k]));
    if(name==='boomerang_fork'&&(!finite(e.originalOrigin,['x','z'])||!['out','return'].includes(e.phase)))throw Error('Invalid return origin');
    if(name==='mirror_slug'&&(!['out','wait','return'].includes(e.phase)||(e.phase!=='out'&&!finite(e,['originalSpeed','returnDue']))))throw Error('Invalid mirror return');
    if(name==='ring_shot'&&!finite(e,['ringAngle']))throw Error('Invalid ring transform');
    if(name==='crystal_caster'&&!finite(e.originalAim,['x','z']))throw Error('Invalid crystal bank');
    if(name==='retrieval_saw'&&(!finite(e.target,['x','z'])||!finite(e,['turnAt'])||!['out','return'].includes(e.phase)))throw Error('Invalid returning saw');
    if(name==='polygon_oath'&&e.bounce>2)throw Error('Invalid polygon bank budget');
  }
}
