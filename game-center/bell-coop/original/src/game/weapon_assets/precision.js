import {SPECS} from './specs.js';
import {manaRefundCap} from '../shared_mana.js';
import {ARCHIVED_PRECISION_IDS,ARCHIVED_GEOMETRY_IDS} from '../weapon_compatibility.js';
import {GeometryMechanics,GEOMETRY_IDS} from './geometry.js';
export {GEOMETRY_IDS};
export const PRECISION_IDS=["yama_call","smg_hornet","rifle_carbine","shotgun_dragon","plasma_repeater","gauss_lancer","burst_triple","spike_nailer","crystal_caster","pyroclast","witness_pistol","hourhand_rifle","shatter_optic","patient_relic","counterweight","last_witness","ratchet_repeater","relay_carbine"];
const INSTALLED_PRECISION_IDS=[...PRECISION_IDS,...ARCHIVED_PRECISION_IDS];
const id=w=>w.def.sourceWeapon||w.def.id;
const k=t=>String(t.id);
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const unit=(x,z)=>{const n=Math.hypot(x,z)||1;return {x:x/n,z:z/n};};
export class PrecisionMechanics {
  constructor(runtime){this.r=runtime;this.geometry=new GeometryMechanics(runtime);}
  moveSpeedMultiplier(p,w,s){
    if(!w||p.weapon!==w||id(w)!=='last_witness')return 1;
    return p.hp<=1||this.r.time-(s?.lastHurt??-999)<=10?2:1;
  }
  observeShot({weapon,paid}){if(!weapon||paid===false)return;const owner=weapon.assetInstanceId;for(const [instance,s]of Object.entries(this.r.states))if(instance!==owner&&s.definitionVersion!==3&&s.weaponId==='relay_carbine'&&s.relayToken)s.otherShotProof=true;}
  track(p,w,s,dt,{down,pressed}){if(this.r.revisions.claims(w))return false;
    const name=id(w),r=this.r;if(!INSTALLED_PRECISION_IDS.includes(name))return this.geometry.track(p,w,s,dt,{down,pressed});
    s.previousHp??=p.hp;s.previousArmor??=p.armor||0;if((p.hp<s.previousHp||(p.armor||0)<s.previousArmor)&&name==='counterweight'){s.charge=0;s.hurtCharge=true;}s.previousHp=p.hp;s.previousArmor=p.armor||0;
    if(!s.moveOrigin)s.moveOrigin={x:p.x,z:p.z};
    if(name==='smg_hornet'){if(!down&&s.quiet>=.35)s.spray=0;else if(down)s.spray=Math.min(.6,(s.spray||0)+dt);}
    if(name==='rifle_carbine'&&s.quiet>=.4)s.cadenceCount=0;
    if(name==='ratchet_repeater'&&s.quiet>=2)s.ratchet=0;
    if(name==='vent_rifle'&&s.quiet>=.5)s.ventHeat=Math.max(0,(s.ventHeat||0)-40*dt);
    if(name==='window_keeper'){
      // PASS B：原来是"准星扫过门框边缘后 0.5 秒内下一发强化" —— 既要计时又要扫边缘，属真暗号。
      // 改为**持续状态**：只要准星当前正压着门户边缘，本枪就处于强化态（看得见、按得住、可保持）。
      const aim=p.aimPoint||{x:p.x+p.aim.x*16,z:p.z+p.aim.z*16};
      let onEdge=false;
      for(const door of r.world.weaponAssetOpenPortals?.()||[]){
        const a={x:door.ax,z:door.az},b={x:door.bx,z:door.bz};const ax=aim.x-p.x,az=aim.z-p.z,bx=b.x-a.x,bz=b.z-a.z,den=ax*bz-az*bx;
        if(Math.abs(den)<1e-8)continue;const t=((a.x-p.x)*bz-(a.z-p.z)*bx)/den,u=((a.x-p.x)*az-(a.z-p.z)*ax)/den;
        if(t>=0&&t<=1&&u>=0&&u<=1&&(u<.2||u>.8)){onEdge=true;break;}
      }
      s.peek=onEdge;
    }
    if(name==='patient_relic')s.moving=Math.hypot(p.vx||0,p.vz||0)>.5;
    // 血证者（试玩："神器但偏弱…自身血量越少，这把枪的伤害和属性也会增加"）：记录掉血时刻，用于 10 秒狂暴窗口。
    if(name==='last_witness'){if(p.hp<(s.lwHp??p.hp))s.lastHurt=r.time;s.lwHp=p.hp;}
    if(pressed)s.edgeTime=r.time;
  }
  input(p,w,s,dt,{down,pressed,released,clicked}){if(this.r.revisions.claims(w))return false;
    const name=id(w),r=this.r;
    const chargeTime={gauss_lancer:.4,counterweight:.35}[name];
    if(chargeTime){
      if(name==='counterweight')p.assetMoveSpeedMul=down?.9:1;
      if(pressed)s.hurtCharge=false;
      if(down&&s.cooldown<=1e-8&&!s.hurtCharge&&(w.mag>0||p.overdrive>0))s.charge=Math.min(1,(s.charge||0)+dt/chargeTime);
      p.charging=down&&!s.hurtCharge;p.charge=s.charge||0;
      if((released||(clicked&&!down))&&s.cooldown<=1e-8&&!s.hurtCharge){r._fire(p,w,s,s.charge||0);s.charge=0;p.charge=0;}
      if(down&&w.mag<=0)r.beginReload(p,w);return true;
    }
    if(name==='burst_triple'){
      if(pressed&&!(s.burstRemaining>0)&&s.cooldown<=1e-8){s.burstRemaining=3;s.burstClock=0;s.burstStart=r.time;}
      if(s.burstRemaining>0){s.burstClock-=dt;if(s.burstClock<=1e-8){
        // Internal cadence is fixed; held-fire debt must not shorten tail recovery.
        s.cooldown=Math.max(0,s.cooldown);
        if(r._fire(p,w,s,0)){s.burstRemaining--;s.burstClock+=.055;}
        else{s.burstRemaining=0;if(w.mag<=0)r.beginReload(p,w);}
      }}return true;
    }
    if(['hourhand_rifle','metronome_carbine'].includes(name)){if(pressed&&s.cooldown<=1e-8)r._fire(p,w,s,0);return true;}
    return this.geometry.input(p,w,s,dt,{down,pressed,released,clicked});
  }
  prepare(p,w,s,charge){if(this.r.revisions.claims(w))return null;
    const name=id(w);if(!INSTALLED_PRECISION_IDS.includes(name))return this.geometry.prepare(p,w,s,charge);const r=this.r,age=r.time-(s.lastAttack??-99);const c={};
    switch(name){
      case 'smg_hornet':c.spread=SPECS[name].spread*(.25+.75*(s.spray||0)/.6);break;
      case 'rifle_carbine':c.pierce=(s.cadenceCount||0)%6===5?1:0;break;
      case 'shotgun_dragon':c.count=7;c.burn=3.2;c.heavy=true;break;
      case 'plasma_repeater':c.pierce=1;c.falloff=.5;break;
      case 'gauss_lancer':c.damage=12+10*charge;c.pierce=4;c.minCooldown=.59;c.heavy=charge>=1;break;
      case 'burst_triple':break;
      case 'spike_nailer':c.pierce=3;c.bounce=1;break;
      case 'crystal_caster':c.count=3;c.pierce=1;c.bounce=2;c.heavy=true;break;
      case 'pyroclast':c.count=9;c.burn=2.6;c.blast=13;c.heavy=true;break;
      case 'witness_pistol':case 'offset_duelist':case 'shatter_optic':case 'split_decision':break;
      case 'hourhand_rifle':c.damage=SPECS[name].damage+(age>=.35-1e-8&&age<=.55+1e-8&&s.inputPressed?5:0);c.minCooldown=SPECS[name].cd;break;
      case 'patient_relic':c.damage=SPECS[name].damage+(s.moving?8:0);break;
      case 'window_keeper':if(s.peek){c.damage=SPECS[name].damage*1.5;c.range=16;c.spread=0;}break;
      case 'counterweight':c.second=charge>=1-1e-8;c.heavy=true;break;
      // PASS B: Bloodwrit (artifact) - the triple-proof auto-aim is gone; it now heals on kills.
      case 'yama_call':break;   // PASS B Yama's Call: 纯数值重型狙击，无额外机制
      case 'last_witness':{
        // 每损失 1 点生命：伤害 +20%（上限 +200%）；狂暴状态再 ×2；
        // 狂暴 = 只剩 1 血（永久）或 10 秒内刚受过伤，期间射速提升到约 3 倍。
        const maxHp=p.maxHp||6,missing=Math.max(0,maxHp-p.hp);
        const berserk=p.hp<=1||(r.time-(s.lastHurt??-999))<=10;
        c.damage=SPECS[name].damage*Math.min(3,1+0.2*missing)*(berserk?2:1);
        if(berserk)c.fixedCooldown=SPECS[name].cd/3;
        c.berserk=berserk;break;}
      case 'ratchet_repeater':if((s.ratchet||0)%3===2){c.count=3;c.damage=2.5;c.spread=15;}break;
      case 'vent_rifle':c.spread=SPECS[name].spread*((s.ventHeat||0)>=70?2.5:1);break;
      case 'relay_carbine':if(s.relayToken&&s.otherShotProof){c.count=3;c.damage=3;c.relay=true;c.spread=6;}break;
      case 'metronome_carbine':c.rhythm=Math.abs(age-.2)<=.06+1e-8;c.damage=(c.rhythm&&(s.rhythmHits||0)>=2)?7:5;c.spread=c.damage===7?0:SPECS[name].spread;break;
      default:throw Error(`Unimplemented precision mechanic ${name}`);
    }return c;
  }
  paid(p,w,s,shot,c){if(this.r.revisions.claims(w))return false;
    const name=id(w);if(!INSTALLED_PRECISION_IDS.includes(name))return this.geometry.paid(p,w,s,shot,c);
    if(c.damage!==undefined)shot.damage=c.damage*shot.mul;if(c.burn){shot.statuses.burn=c.burn;(shot.intrinsicStatuses||={}).burn=c.burn;}
    shot.precision=c;shot.previousAttack=s.lastAttack;s.lastAttack=this.r.time;
    if(name==='rifle_carbine')s.cadenceCount=(s.cadenceCount||0)+1;
    if(name==='ratchet_repeater')s.ratchet=(s.ratchet||0)+1;
    if(name==='vent_rifle'){s.ventHeat=Math.min(100,(s.ventHeat||0)+10);if(s.ventHeat>=100)s.lock=.8;}
    if(name==='relay_carbine'){if(c.relay){s.relayToken=false;s.otherShotProof=false;s.ownCount=0;}else{s.ownCount=(s.ownCount||0)+1;if(s.ownCount>=6)s.relayToken=true;}}
    if(name==='metronome_carbine'&&!c.rhythm)s.rhythmHits=0;
  }
  fire(p,w,s,shot,c){if(this.r.revisions.claims(w))return false;
    if([...GEOMETRY_IDS,...ARCHIVED_GEOMETRY_IDS].includes(id(w)))return this.geometry.fire(p,w,s,shot,c);
    if(id(w)==='counterweight'&&c.second)this.r._add({kind:'delayed',mechanic:'precision-ray',owner:shot.owner,x:p.x,z:p.z,dx:p.aim.x,dz:p.aim.z,ttl:.12,maxTTL:.12,shot:{...shot,damage:12*shot.mul},range:SPECS.counterweight.range});return false;
  }
  projectile(e,p,w,s,c){if(this.r.revisions.isShot(e?.shot))return false;
    if(!INSTALLED_PRECISION_IDS.includes(id(w)))return this.geometry.projectile(e,p,w,s,c);
    if(c.bounce)e.bounce+=c.bounce;
    if(c.range){e.range=Math.min(e.range,c.range);e.ttl=e.range/e.speed;e.maxTTL=e.ttl;}
    if(c.aim){e.dx=c.aim.x;e.dz=c.aim.z;e.shot.direction=c.aim;}
    if(c.blast){e.blast=c.blast*e.shot.mul;e.blastRadius=2;e.salvoBlast=true;}
    // 血证者强追踪（试玩反馈："我要的是强追踪…实时刷新它和敌人的坐标、建立直线、沿直线算导数，
    // 每隔很小间隔就刷新去追踪，直到命中"）。运行时每帧都会重新选最近的可见敌人并朝它转向，
    // 这里把转向速率拉到很高 → 实际表现就是"钉着敌人飞"。
    // homingAfter：先沿准星直飞 10 单位（大厅地砖 TILE=2，5 格＝10）再开始吸附。
    if(id(w)==='last_witness'){e.homing=Math.max(e.homing||0,16);e.homingRange=26;e.homingAfter=10;}
    if(id(w)==='crystal_caster')e.originalAim={...p.aim};
  }
  beforeDamage(t,damage,shot,s,opts={}){if(this.r.revisions.isShot(shot))return damage;
    const name=shot.weaponId,r=this.r;if(!INSTALLED_PRECISION_IDS.includes(name))return this.geometry.beforeDamage(t,damage,shot,s);
    const base=shot.baseSecondaryMul??1;
    if(name==='plasma_repeater'&&shot.hitIndex>0)damage*=.5;
    if(name==='witness_pistol'&&!(shot.hitIndex>0)&&s.proofTarget===k(t)&&s.proofCount===3)damage+=12*base;
    if(name==='offset_duelist'&&(shot.definitionVersion===3||s.flankTarget===k(t))){const facing={x:Math.sin(t.yaw||0),z:Math.cos(t.yaw||0)},arrival=shot.definitionVersion===3?(opts.dir||shot.direction):shot.direction;if(facing.x*arrival.x+facing.z*arrival.z>-.25)damage+=9*base;}
    if(name==='shatter_optic'&&s.brokenTarget===k(t)){damage+=14*base;s.brokenTarget=null;s.shatterConsumed=shot.rootShotId;}
    if(name==='split_decision'&&s.pairTarget===k(t))damage+=SPECS[name].damage*base;
    return damage;
  }
  afterDamage(t,applied,shot,s){if(this.r.revisions.isShot(shot))return undefined;
    const name=shot.weaponId,r=this.r;if(!INSTALLED_PRECISION_IDS.includes(name))return this.geometry.afterDamage(t,applied,shot,s);
    if(name==='witness_pistol'&&!(shot.hitIndex>0)){s.proofCount=s.proofTarget===k(t)?((s.proofCount||0)+1)%4:1;s.proofTarget=k(t);}
    if(name==='offset_duelist'){s.flankTarget=k(t);s.lastFacing=t.yaw||0;}
    if(name==='split_decision'){if(s.pairTarget){if(s.pairTarget!==k(t)){const w=r.weapons.get(shot.owner),refund=r.claimRefund(shot.owner,shot.rootShotId,1);if(w){if(r._mana(w))w.reserve=Math.min(manaRefundCap(r.player,w),w.reserve+refund);else w.mag=Math.min(r._cap(r.player,w),w.mag+refund);}}s.pairTarget=null;}else{s.pairTarget=k(t);}}
    if(name==='metronome_carbine')s.rhythmHits=(s.rhythmHits||0)+1;
  }
  outcome(t,applied,shot,secondary,shieldBefore){if(this.r.revisions.isShot(shot))return undefined;
    this.geometry.outcome(t,applied,shot,secondary,shieldBefore);
    if(secondary)return;const s=this.r.states[shot.owner];if(!s)return;
    if(shot.weaponId==='shatter_optic'&&s.shatterConsumed!==shot.rootShotId)s.brokenTarget=k(t);
    if(shot.weaponId==='witness_pistol'&&!(shot.hitIndex>0)&&!(applied>0)){s.proofCount=0;s.proofTarget=null;}
  }
  end(e){if(this.r.revisions.isShot(e?.shot))return false;
    this.geometry.end(e);
    const s=this.r.states[e.owner];if(!s)return;
    if(!e.hit.length&&['witness_pistol','metronome_carbine'].includes(e.shot.weaponId)){s.proofCount=0;s.proofTarget=null;s.rhythmHits=0;}
  }
  bounce(e,bx,bz){if(this.r.revisions.isShot(e?.shot))return false;this.geometry.bounce(e,bx,bz);if(e.shot.weaponId==='crystal_caster'&&e.bounceCount===1){const a=e.originalAim||e.shot.direction;e.dx=bx&&!bz?-a.x:a.x;e.dz=bz&&!bx?-a.z:a.z;if(bx===bz){e.dx=-a.x;e.dz=-a.z;}}}
  entity(e,dt){if(this.r.revisions.isShot(e?.shot))return false;if(e.mechanic!=='precision-ray')return this.geometry.entity(e,dt);e.ttl-=dt;if(e.ttl<=0){this.r._beam(e,{x:e.dx,z:e.dz},e.range,e.shot,e.color,1,true);e.ended=true;}return true;}
  beginReload(...args){if(this.r.revisions.claims(args[1]))return false;return this.geometry.beginReload(...args);}
  reloadStep(...args){if(this.r.revisions.claims(args[1]))return false;return this.geometry.reloadStep(...args);}
  finishReload(p,w,s,take){if(this.r.revisions.claims(w))return false;this.geometry.finishReload(p,w,s,take);if(take>0&&id(w)==='witness_pistol'){s.proofCount=0;s.proofTarget=null;}}
  step(...args){if(this.r.revisions.isShot(args[0]?.shot))return false;return this.geometry.step(...args);}
  wall(...args){if(this.r.revisions.isShot(args[0]?.shot))return false;return this.geometry.wall(...args);}
  travel(...args){if(this.r.revisions.isShot(args[0]?.shot))return false;return this.geometry.travel(...args);}
  preHit(...args){if(this.r.revisions.isShot(args[0]?.shot))return undefined;return this.geometry.preHit(...args);}
  postHit(...args){if(this.r.revisions.isShot(args[0]?.shot))return false;return this.geometry.postHit(...args);}
  visual(){return this.geometry.visual();}
  validateEntity(e){if(this.r.revisions.isShot(e?.shot))return false;this.geometry.validateEntity(e);}
}
