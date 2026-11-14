import {SPECS} from './specs.js';
import {ARCHIVED_MECHANICAL_IDS} from '../weapon_compatibility.js';
export const MECHANICAL_IDS=["hive_scepter","void_ripper","orbit_guard","ring_satellite","tripod_caster","shield_lantern","spring_nest","stake_keeper","flywheel_vow","chamber_lottery","split_escapement","spiral_winch"];
const INSTALLED_MECHANICAL_IDS=[...MECHANICAL_IDS,...ARCHIVED_MECHANICAL_IDS];
const id=w=>w.def.sourceWeapon||w.def.id,key=e=>String(e.id),dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z),unit=(x,z)=>{const n=Math.hypot(x,z)||1;return {x:x/n,z:z/n};};
// PASS B Hive Scepter spiders. 'blocks' is the user's fallback rule: the spider soaks N enemy hits.
const kStatusDur=5;
const SPIDER={
  small:{life:10,blocks:2,speed:9,damage:20,interval:1,color:'#c9b8a0'},
  poison:{life:15,blocks:3,speed:6,damage:40,interval:1,status:'poison',color:'#5fd39a'},
  fire:{life:15,blocks:3,speed:6,damage:40,interval:1,status:'burn',color:'#ff6b4a'},
  queen:{life:30,blocks:5,speed:4,damage:50,interval:2,color:'#b06bff'},
};
export class MechanicalMechanics {
  constructor(r){this.r=r;}
  nearest(at,range=12){return this.r._enemies().filter(t=>dist(at,t)<=range&&this.r._los(at,t)).sort((a,b)=>dist(at,a)-dist(at,b))[0];}
  owned(w,mechanic){return this.r._owned(w.assetInstanceId).filter(e=>e.mechanic===mechanic);}
  track(p,w,s,dt,{down,pressed,released}){if(this.r.revisions.claims(w))return false;
    const name=id(w),r=this.r;
    if(name==='procession_drum')s.drumOrigin??={x:p.x,z:p.z};
    if(name==='flywheel_vow'){
      if((s.wheelHp!==undefined&&p.hp<s.wheelHp)||(s.wheelArmor!==undefined&&(p.armor||0)<s.wheelArmor)){s.wheel=0;s.wheelReleased=null;}
      s.wheelHp=p.hp;s.wheelArmor=p.armor||0;
      if(released)s.wheelReleased=r.time;
      if(s.wheelReleased!==null&&s.wheelReleased!==undefined&&r.time-s.wheelReleased>1)s.wheel=0;
      if(down&&!pressed)s.wheel=Math.min(.8,(s.wheel||0)+dt);
    }
  }
  input(p,w,s,dt,{down,pressed,released,clicked}){if(this.r.revisions.claims(w))return false;
    const name=id(w),r=this.r;
    if(name==='empty_chamber'&&w.mag===0&&(down||clicked)&&!s.reload){s.reload={remaining:1,start:0,service:true};p.reloading=true;p.reloadT=1;return true;}
    if(['folding_pike','reserve_mill'].includes(name)){
      if(down&&s.cooldown<=1e-8)s.charge=Math.min(1,(s.charge||0)+dt/(name==='folding_pike'?.45:.35));p.charging=down;p.charge=s.charge||0;
      if((released||(clicked&&!down))&&s.cooldown<=1e-8){r._fire(p,w,s,s.charge||0);s.charge=0;p.charge=0;}
      if(down&&w.mag<=0)r.beginReload(p,w);return true;
    }
    return false;
  }
  prepare(p,w,s,charge){if(this.r.revisions.claims(w))return null;
    const name=id(w),r=this.r;if(!INSTALLED_MECHANICAL_IDS.includes(name))return null;const c={};
    // void_ripper：保持"第二次命中即锁定"的原语义（PASS A 的追踪回归覆盖它）。
    // 两阶段直飞只给**强追踪**武器（血证者 homing 16），见 precision.projectile 的 homingAfter。
    if(name==='void_ripper'){const t=r._enemy(s.riftTarget);if(t&&r._los(p,t))c.target=key(t);}
    if(name==='orbit_guard'){if(this.owned(w,'orbit-stored').length>=3)return {reject:true};c.heavy=true;}
    if(name==='ring_satellite'){
      const guards=this.owned(w,'satellite').filter(e=>e.guard&&!e.ended&&e.ttl>0&&e.guardT>0&&e.blocks>0),needed=2-guards.length;
      if(needed<=0||r._globalCount('projectile')+needed>420)return {reject:true};
      const requests=Array.from({length:needed},()=>({kind:'projectile',owner:w.assetInstanceId,ttl:8,shot:{weaponId:name,definitionVersion:2}}));
      if(!r.deploymentAdmission(requests).ok)return {reject:true};
      c.count=needed;c.guardAngle=guards.length?guards[0].angle+Math.PI:0;c.heavy=true;
    }
    if(name==='chain_harpoon'){c.hook=!s.harpoonPhase;c.damage=c.hook?4:16;if(!c.hook){const t=r._enemy(s.tetherTarget);if(t&&s.tetherUntil>=r.time&&dist(p,t)<=5&&r._los(p,t))c.target=key(t);c.heavy=true;}}
    if(name==='return_post'){const post=this.owned(w,'post')[0];if(post){c.post={x:post.x,z:post.z};c.postId=post.id;c.damage=14;c.heavy=true;}else c.station=true;}
    if(['tripod_caster','shield_lantern','recall_censer'].includes(name)){const mechanic={tripod_caster:'tripod',shield_lantern:'lantern',recall_censer:'censer'}[name];if(!this.owned(w,mechanic).length){c.deploy=mechanic;c.life={tripod:6,lantern:10,censer:12}[mechanic];}if(name==='tripod_caster'&&c.deploy){const fee=r._cost(w,1,false,true);if(w.reserve<8+(r._mana(w)?fee:0))return {reject:true};}}
    if(name==='spring_nest'){if(this.owned(w,'nest').length>=2)return {reject:true};c.deploy='nest';c.life=8;}
    // PASS B: Calamity Stave (artifact) - the stake/patrol setup requirement is gone; each shot summons 3 meteors.
    if(name==='stake_keeper'){c.meteors=3;c.heavy=true;}
    // PASS B Hive Scepter: at most 20 spiders alive at once (a very loose cap - it only stops off-field stockpiling).
    if(name==='hive_scepter'){if(!r.deploymentAdmission(Array.from({length:3},()=>({kind:'unit',mechanic:'spider',owner:w.assetInstanceId,ttl:1}))).ok)return {reject:true};c.spiders=true;c.heavy=false;}
    if(name==='bell_hound'&&!this.owned(w,'hound').length)c.summon='hound';
    if(name==='procession_drum'&&!this.owned(w,'drum').length&&dist(s.drumOrigin||p,p)>=4)c.summon='drum';
    if(c.deploy||name==='return_post'&&c.station){if(!p.aimPoint||dist(p,p.aimPoint)>14||r._blocked(p.aimPoint.x,p.aimPoint.z)||!r._los(p,p.aimPoint))return {reject:true};}
    if(name==='recall_censer'&&s.censerAmmo>0){c.count=3;c.damage=3;c.spread=18;c.range=7;c.censerBoost=true;c.heavy=true;c.deploy=null;}
    if(name==='escrow_cannon'){c.damage=(s.escrow||0)>=2?18:4;c.cash=(s.escrow||0)>=2;c.heavy=c.cash;}
    if(name==='empty_chamber')c.shock=!!s.serviceReady;
    if(name==='balance_ledger'){
      const ratio=weapon=>{const spec=SPECS[weapon.def.sourceWeapon||weapon.def.id];if(weapon.def.ammoType==='mana')return Math.max(0,Math.min(1,weapon.reserve/(weapon.def.ammoMax||120)));if(!spec?.reserve)return Math.max(0,Math.min(1,weapon.mag/(p.magSize?.(weapon)||weapon.def.mag||1)));return Math.max(0,Math.min(1,(weapon.mag+weapon.reserve)/(spec.mag+spec.reserve)));};
      const other=(p.weapons||[]).find(v=>v!==w);c.wide=other&&ratio(w)>ratio(other);c.count=c.wide?2:1;c.damage=c.wide?6:12;c.spread=c.wide?14:0;
    }
    if(name==='flywheel_vow'){c.wheel=!!(s.inputPressed&&s.wheel>=.8-1e-8&&s.wheelReleased!==null&&s.wheelReleased!==undefined&&r.time-s.wheelReleased>=.25&&r.time-s.wheelReleased<=1);c.damage=c.wheel?16:2.5;c.cost=c.wheel?2:1;c.heavy=c.wheel;}
    if(name==='folding_pike'){c.stab=charge>=1-1e-8;c.damage=c.stab?14:7;c.cost=c.stab?2:1;c.heavy=c.stab;if(c.stab)c.fixedCooldown=.25;if(!c.stab&&s.pikeReady)c.pierce=1;}
    // Finite executable adapters; eligibility is pure and precedes both draws.
    if(name==='chamber_lottery'){
      return r.lottery.prepare(p,w);
    }
    if(name==='reserve_mill'){c.milled=charge>=1-1e-8&&s.millToken;c.damage=c.milled?17:6;c.cost=c.milled?2:1;c.heavy=!!c.milled;}
    // PASS B: Bullet Monsoon (artifact) - high rate, three pellets, high per-shot; cycling is just flavour.
    // 盘索绞盘（试玩反馈："弄上 10 个小位移在你周围，高速旋转，能挡子弹，然后能有伤害"）
    // 复用护身卫星的结算路径（环绕 / 割敌 / 挡弹），数量从 2 提到 10。
    if(name==='spiral_winch'){if(this.owned(w,'satellite').length)return {reject:true};c.barrage=true;c.heavy=true;}
    if(name==='split_escapement'){c.wide=(s.splitIndex||0)>=6;c.count=5;c.damage=c.wide?SPECS[name].damage*.7:SPECS[name].damage;c.spread=c.wide?20:11;c.pierce=1;c.heavy=false;}
    const requests=[c.deploy,c.patrol&&'patrol',c.summon].filter(Boolean).map(mechanic=>({kind:'unit',mechanic,owner:w.assetInstanceId,ttl:1}));if(!r.deploymentAdmission(requests).ok)return {reject:true};
    return c;
  }
  paid(p,w,s,shot,c){if(this.r.revisions.claims(w))return false;
    const name=id(w);if(!INSTALLED_MECHANICAL_IDS.includes(name))return;shot.mechanical=c;if(c.damage!==undefined)shot.damage=c.damage*shot.mul;
    if(c.lottery)this.r.lottery.paid(p,w,s,shot,c);
    if(name==='chain_harpoon')s.harpoonPhase=c.hook;
    if(name==='escrow_cannon'){s.escrow=c.cash?0:(s.escrow||0)+1;s.escrowRoot=shot.rootShotId;}
    if(name==='empty_chamber')s.serviceReady=false;
    if(c.wheel){s.wheel=0;s.wheelReleased=null;}
    if(name==='folding_pike'){s.pikeReady=!!c.stab;}   // PASS B：刺后的强化直弹不再限时，什么时候打都算
    if(c.censerBoost)s.censerAmmo--;
    if(c.milled)s.millToken=false;
    if(name==='split_escapement')s.splitIndex=((s.splitIndex||0)+1)%8;
  }
  bullet(at,d,shot,damage,secondary=true,extra={}){return this.r._add({kind:'projectile',owner:shot.owner,x:at.x,z:at.z,dx:d.x,dz:d.z,speed:24*(shot.speedMul||1),ttl:(shot.lifeMul||1)/(shot.speedMul||1),maxTTL:(shot.lifeMul||1)/(shot.speedMul||1),range:24,traveled:0,radius:.13,pierce:secondary?0:(shot.pierce||0),bounce:secondary?0:(shot.bounce||0),homing:secondary?0:(shot.homing||0),hit:[],secondary,...(at.kind==='unit'?{feedbackContext:this.r.unitDamageFeedback(at)}:{}),shot:{...shot,damage:damage*shot.mul},...extra});}
  fire(p,w,s,shot,c){if(this.r.revisions.claims(w))return false;
    const name=id(w),r=this.r;
    if(shot.lottery)return r.lottery.fire(p,w,s,shot);
    if(c.spiders){
      // Off-field (not in a run) summons only the small spiders, so the queen cannot be farmed outside.
      const inRun=r.game?.mode==='run';
      const roll=r.game?.gr?.()??.5;
      let kind='small';
      if(inRun){if(roll<.005)kind='queen';else if(roll<.045)kind='fire';else if(roll<.095)kind='poison';}
      const n=kind==='small'?3:1;
      for(let i=0;i<n;i++){
        const a=(i/3)*Math.PI*2, P=SPIDER[kind];
        r._add({kind:'unit',mechanic:'spider',spider:kind,owner:shot.owner,x:p.x+Math.cos(a)*.8,z:p.z+Math.sin(a)*.8,
          ttl:P.life,maxTTL:P.life,blocks:P.blocks,biteAcc:0,breedAcc:5,shot,radius:.28,color:P.color});
      }
      return true;
    }
    if(c.meteors){const aim=p.aimPoint||{x:p.x+p.aim.x*14,z:p.z+p.aim.z*14};for(let i=0;i<c.meteors;i++){const roll=r.game?.gr?.()??.5,a=(roll+i/3)*Math.PI*2,rad=1.2+i*1.7;r._add({kind:'delayed',mechanic:'meteor',owner:shot.owner,x:aim.x+Math.cos(a)*rad,z:aim.z+Math.sin(a)*rad,ttl:.4+i*.14,maxTTL:.4+i*.14,shot,blast:22*shot.mul,radius:2.8,color:'#ff8a3c'});}return true;}
    if(c.deploy){
      const modelId=name==='stake_keeper'?'stake_keeper':name;
      const e=r._add({kind:'unit',mechanic:c.deploy,owner:shot.owner,x:p.aimPoint.x,z:p.aimPoint.z,ttl:c.life,maxTTL:c.life,shot,radius:.4,remaining:c.deploy==='tripod'?8:c.deploy==='lantern'?6:c.deploy==='nest'?3:0,ash:0,nextShot:r.time});
      if(!e)return true;
      if(c.deploy==='tripod'){w.reserve-=8;e.prepaid=8;}
      if(c.patrol){const d=unit(e.x-c.patrol.x,e.z-c.patrol.z);r._add({kind:'unit',mechanic:'patrol',owner:shot.owner,x:c.patrol.x,z:c.patrol.z,dx:d.x,dz:d.z,a:c.patrol.id,b:e.id,goal:{x:e.x,z:e.z},length:dist(c.patrol,e),progress:0,fired:0,ttl:10,maxTTL:10,shot});}return true;
    }
    if(c.summon){const life=c.summon==='hound'?12:8;r._add({kind:'unit',mechanic:c.summon,owner:shot.owner,x:p.x,z:p.z,ttl:life,maxTTL:life,remaining:4,nextCommand:0,phase:'idle',shot,radius:.3});if(c.summon==='drum')s.drumOrigin={x:p.x,z:p.z};}
    if(name==='procession_drum'){const drum=this.owned(w,'drum')[0];if(drum&&drum.remaining>0&&w.reserve>=1){const b=this.bullet(drum,p.aim,shot,4);if(b){w.reserve--;drum.remaining--;if(drum.remaining===0)r._remove(drum.id);}}}
    if(name==='orbit_guard'){this.bullet(p,p.aim,shot,12,false,{mechanic:'orbit-stored',angle:((s.sequence||0)%3)*Math.PI*2/3,ttl:6,maxTTL:6,range:22});return true;}
    if(c.barrage){
      for(let i=0;i<10;i++){const a=i/10*Math.PI*2;
        this.bullet({x:p.x+Math.cos(a)*1.7,z:p.z+Math.sin(a)*1.7},p.aim,shot,5,false,
          {mechanic:'satellite',guard:true,center:{x:p.x,z:p.z},angle:a,arc:0,speed:16*shot.speedMul,ttl:8,maxTTL:8,
           range:Math.PI*8,pierce:999,blocks:3,guardT:8,hitAt:{},radius:.22,color:w.def.color});}
      return true;
    }
    if(name==='ring_satellite'){
      // PASS B：由"先落点再绕圈"改为**直接护身** —— 一扣就在玩家两侧各挂一颗，看得见、按下去就有用。
      for(let i=0;i<c.count;i++){
        const a=c.guardAngle+i*Math.PI;
        this.bullet({x:p.x+Math.cos(a)*1.7,z:p.z+Math.sin(a)*1.7},p.aim,shot,8,false,{mechanic:'satellite',guard:true,center:{x:p.x,z:p.z},angle:a,arc:0,speed:16*shot.speedMul,ttl:8,maxTTL:8,range:Math.PI*8,pierce:999,blocks:3,guardT:8,hitAt:{}});
      }
      return true;
    }
    if(c.postId)r._remove(c.postId);
    if(c.stab){r._beam(p,p.aim,3,shot,w.def.color,Infinity);return true;}
    return false;
  }
  projectile(e,p,w,s,c){if(this.r.revisions.isShot(e?.shot))return false;const name=id(w);if(!INSTALLED_MECHANICAL_IDS.includes(name))return;
    if(c.range)e.range=c.range;
    if(['void_ripper','chain_harpoon'].includes(name)){e.homing=0;if(c.target){e.targetId=c.target;e.targetUntil=this.r.time+3;e.homing=(name==='void_ripper'?5:4)+e.shot.homing;}}
    if(name==='chase_comet')e.homing=0;
    if(name==='return_post'){e.mechanic=c.station?'post-flight':'post-letter';e.stationPoint={...(c.post||p.aimPoint)};e.phase=c.station?'station':'to-post';e.range=Math.min(e.range,dist(p,e.stationPoint));const d=unit(e.stationPoint.x-p.x,e.stationPoint.z-p.z);e.dx=d.x;e.dz=d.z;e.pierce=999;if(c.station)e.shot.damage=3*e.shot.mul;else{e.speed=30;e.ttl=2;e.maxTTL=2;}}
    if(name==='chamber_lottery'){
      e.card=c.card;                      // 弹道形态跟随所抽武器（原来这里从没被赋值过）
      if(c.lotteryColor){e.color=c.lotteryColor;e.shot.color=c.lotteryColor;}
      if(c.card===2)e.bounce=1;
    }
  }
  beforeDamage(t,damage,shot,s){if(this.r.revisions.isShot(shot))return damage;const r=this.r;
    if(shot.weaponId==='mercy_invoice'){const m=s.mercy?.[key(t)];if(m?.proved&&!m.used){damage+=13*(shot.baseSecondaryMul||1);shot.mercyCash=key(t);}}
    return damage;
  }
  afterDamage(t,applied,shot,s){if(this.r.revisions.isShot(shot))return undefined;const name=shot.weaponId,r=this.r,c=shot.mechanical||{};
    if(name==='void_ripper'){if(c.target===key(t)&&s.riftTarget===key(t)){r._add({kind:'delayed',owner:shot.owner,x:t.x,z:t.z,ttl:.5,maxTTL:.5,shot,blast:20,radius:3});s.riftTarget=null;}else s.riftTarget=key(t);}
    if(name==='chain_harpoon'&&c.hook){s.tetherTarget=key(t);s.tetherUntil=r.time+1;}
    if(name==='bell_hound'&&r.active===shot.owner){const h=r._owned(shot.owner).find(e=>e.mechanic==='hound'),w=r.weapons.get(shot.owner);if(h&&w&&w.reserve>=1&&h.nextCommand<=r.time&&dist(h,t)<=8&&r._los(h,t)){h.phase='attack';h.target=key(t);h.attackShot=shot;h.nextCommand=r.time+1;w.reserve--;}}
    if(name==='recall_censer'&&!c.censerBoost){const censer=r._owned(shot.owner).find(e=>e.mechanic==='censer');if(censer)censer.ash=Math.min(4,censer.ash+1);}
    if(name==='empty_chamber'&&c.shock&&!s.shockRoots?.[shot.rootShotId]){s.shockRoots??={};s.shockRoots[shot.rootShotId]=true;r._beam(shot.origin,shot.direction,3,{...shot,damage:8*shot.mul,statuses:{},intrinsicStatuses:{}},undefined,Infinity,true);}
    if(name==='mercy_invoice'&&shot.mercyCash){const m=s.mercy?.[shot.mercyCash];if(m)m.used=true;}
  }
  observeActualDamage(t,applied,opts,beforeHp){
    if(!(applied>0)||opts?.assetSecondary||opts?.source==='status'||opts?.source==='summon'||opts?.source==='dot')return;
    // PASS B: Bloodwrit (artifact) - every 3 kills restores 1 HP.
    {const s0=opts?.assetShot||opts?.bullet?.assetShot,o0=opts?.sourceInstanceId||s0?.owner;
      if(s0?.weaponId==='last_witness'&&o0&&!t.alive&&t.hp<=0){const st=this.r.states[o0];if(st){st.blood=(st.blood||0)+1;if(st.blood>=3){st.blood=0;const pl=this.r.player;if(pl&&typeof pl.heal==='function')pl.heal(1,'vampire');}}}}
    const r=this.r,shot=opts?.assetShot||opts?.bullet?.assetShot,owner=opts?.sourceInstanceId||shot?.owner;
    if(!owner)return;
    for(const [instance,s] of Object.entries(r.states)){if(s.weaponId!=='mercy_invoice')continue;const mark=s.mercy?.[key(t)];if(mark&&owner!==instance)mark.proved=true;
      if(owner===instance&&shot?.weaponId==='mercy_invoice'&&!mark&&beforeHp>0&&beforeHp>=(t.maxHp??t.def?.hp??beforeHp)){s.mercy??={};s.mercy[key(t)]={proved:false,used:false};}}
  }
  end(e){if(this.r.revisions.isShot(e?.shot))return false;if(e.mechanic==='post-flight'){this.r._add({kind:'zone',mechanic:'post',owner:e.owner,x:e.x,z:e.z,radius:.3,ttl:6,maxTTL:6,shot:e.shot});}}
  travel(e){if(this.r.revisions.isShot(e?.shot))return false;if(e.shot.weaponId!=='chase_comet'||e.cometChecked||e.traveled<6)return;e.cometChecked=true;const r=this.r,t=r._enemies().filter(t=>{const d=unit(t.x-e.x,t.z-e.z);return d.x*e.dx+d.z*e.dz>=Math.cos(Math.PI/6)&&r._los(e,t);}).sort((a,b)=>dist(e,a)-dist(e,b))[0];if(t){e.targetId=key(t);e.targetUntil=r.time+3;e.homing=2+(e.shot.homing||0);}}
  // PASS B：护身卫星替玩家挡下敌弹（每颗有 3 发耐久，挡满即消失）。
  interceptProjectile(e){if(this.r.revisions.isShot(e?.shot))return false;const r=this.r;
    // PASS B Hive Scepter: spiders soak enemy bullets (each has a small block budget).
    for(const sp of r.entities.filter(v=>v.mechanic==='spider'&&(v.blocks|0)>0)){
      if(dist(sp,e)>.55+(e.radius||.1))continue;
      sp.blocks=(sp.blocks|0)-1;if(sp.blocks<=0)r._remove(sp.id);
      return true;
    }
    for(const sat of r.entities.filter(v=>v.mechanic==='satellite'&&v.guard&&(v.blocks|0)>0)){
      if(dist(sat,e)>.8+(e.radius||.1))continue;
      sat.blocks=(sat.blocks|0)-1;if(sat.blocks<=0)r._remove(sat.id);
      return true;
    }
    return false;
  }
  intercept(e){if(this.r.revisions.isShot(e?.shot))return false;if(e.secondary||e.shot.weaponId!=='shield_lantern'||e.converted)return false;const r=this.r,lamp=r._owned(e.owner).find(v=>v.mechanic==='lantern'&&v.remaining>0);if(!lamp||dist(lamp,e)>.5)return false;const d=unit((r.player?.aimPoint?.x??lamp.x+e.dx)-lamp.x,(r.player?.aimPoint?.z??lamp.z+e.dz)-lamp.z),u=Math.hypot(d.x,d.z)>0?d:{x:e.dx,z:e.dz};const b=this.bullet(lamp,u,e.shot,10,true,{radius:.35,converted:true});if(!b)return false;lamp.remaining--;if(!lamp.remaining)r._remove(lamp.id);return true;}
  step(e,dt){if(this.r.revisions.isShot(e?.shot))return false;const r=this.r,p=r.player,s=r.states[e.owner];
    if(e.mechanic==='orbit-stored'){
      if(e.releaseAt!==undefined&&r.time>=e.releaseAt&&s.lastOrbitFrame!==r.time){s.lastOrbitFrame=r.time;e.mechanic='released-orbit';e.dx=e.releaseAim.x;e.dz=e.releaseAim.z;e.ttl=e.range/e.speed;e.maxTTL=e.ttl;return true;}
      e.angle+=dt*3.2;if(p){e.x=p.x+Math.cos(e.angle)*2;e.z=p.z+Math.sin(e.angle)*2;}
      // PASS B：绕身弹原来**完全无害**（只做存储），这正是"没资格替代普通枪"的根因。
      // 现在它贴着敌人就割一刀（同一目标 0.45 秒一次），贴脸时是真实的持续输出。
      if(p&&e.shot){e.hitAt??={};for(const t of r._enemies()){if(dist(t,e)>(t.r||.5)+e.radius)continue;const kk=key(t);if((e.hitAt[kk]||-9)>r.time-.45)continue;e.hitAt[kk]=r.time;r._damage(t,e.shot,e.shot.damage*.8,false,unit(t.x-p.x,t.z-p.z));}}
      return true;
    }
    if(e.mechanic==='satellite'&&e.guard){
      // PASS B：护身卫星 —— 绕着**玩家**转，替玩家挡下敌弹（每颗挡 3 发），同时割近身敌人。
      if(!p){e.ended=true;return true;}
      e.center={x:p.x,z:p.z};e.angle+=dt*2.2;e.arc+=dt*2.2;
      e.x=p.x+Math.cos(e.angle)*1.7;e.z=p.z+Math.sin(e.angle)*1.7;
      e.hitAt??={};
      for(const t of r._enemies()){if(dist(t,e)>(t.r||.5)+e.radius)continue;const kk=key(t);if((e.hitAt[kk]||-9)>r.time-.45)continue;e.hitAt[kk]=r.time;r._damage(t,e.shot,e.shot.damage*.8,false,unit(t.x-e.x,t.z-e.z));}
      e.guardT=(e.guardT??8)-dt;
      if(e.guardT<=0||(e.blocks|0)<=0)e.ended=true;
      return true;
    }
    if(e.mechanic==='satellite'){
      if(!r.entities.some(v=>v.id===e.center.id)){e.ended=true;return true;}const step=dt*e.speed/3,n=Math.max(1,Math.ceil(step*3/.1));for(let i=0;i<n&&!e.ended;i++){const angle=e.angle+step/n,to={x:e.center.x+Math.cos(angle)*3,z:e.center.z+Math.sin(angle)*3};const prop=r.world.propHit?.(to.x,to.z,e.radius,.8);if(prop){r.world.onPropHit?.(prop,e.shot.damage,to.x,.8,to.z,{assetShot:e.shot});e.ended=true;break;}if(r._blocked(to.x,to.z)){e.ended=true;break;}e.x=to.x;e.z=to.z;e.angle=angle;e.arc+=step/n;for(const t of r._enemies())if(!e.hit.includes(key(t))&&dist(t,e)<=(t.r||.5)+e.radius){e.hit.push(key(t));r._damage(t,e.shot,e.shot.damage,false,unit(t.x-e.center.x,t.z-e.center.z));}}if(e.arc>=Math.PI*2)e.ended=true;return true;
    }
    return false;
  }
  atRange(e){if(this.r.revisions.isShot(e?.shot))return false;if(e.mechanic!=='post-letter'||e.phase!=='to-post')return false;const r=this.r,target=this.nearest(e);if(!target){e.ended=true;return true;}e.phase='after-post';e.hit=[];e.traveled=0;e.range=22;const d=unit(target.x-e.x,target.z-e.z);e.dx=d.x;e.dz=d.z;e.pierce=0;return true;}
  beginReload(p,w,s){if(this.r.revisions.claims(w))return false;const name=id(w),r=this.r;if(s.reload)return false;
    if(name==='orbit_guard'&&this.owned(w,'orbit-stored').length){s.forceReload=true;this.owned(w,'orbit-stored').forEach((e,i)=>{e.releaseAt=r.time+i*.12;e.releaseAim={...p.aim};});}
    if(name==='ring_satellite'){for(const e of r._owned(w.assetInstanceId))r._remove(e.id);}
    if(name==='spiral_winch'){for(const e of r._owned(w.assetInstanceId))r._remove(e.id);}
    if(name==='tripod_caster'){for(const e of this.owned(w,'tripod')){this.refundTurret(e);r._remove(e.id);}}
    if(name==='empty_chamber'&&w.mag===0)return true;
    return false;
  }
  finishReload(p,w,s,take){if(this.r.revisions.claims(w))return false;const name=id(w),r=this.r;
    if(name==='empty_chamber'&&s.reload?.service&&take>0)s.serviceReady=true;
    if(name==='escrow_cannon'&&take>0&&s.escrow){const amount=r.claimRefund(w.assetInstanceId,s.escrowRoot,Math.min(1,Math.max(0,this.reserveCap(w)-w.reserve)));w.reserve+=amount;s.escrowRefundCredited=amount;s.escrow=0;}
    if(name==='reserve_mill'&&take>=4)s.millToken=true;
    if(name==='recall_censer'&&take>0){const e=this.owned(w,'censer')[0];if(e&&dist(p,e)<=8&&r._los(p,e)){s.censerAmmo=Math.min(2,Math.floor(e.ash/2));r._remove(e.id);}}
  }
  reserveCap(w){return this.r._mana(w)?manaRefundCap(this.r.player,w):(w.def.ammoMax||SPECS[id(w)].reserve)*(this.r.player?.stats?.ammoMaxMul||1);}
  refundTurret(e){if(e.refunded)return;e.refunded=true;const w=this.r.weapons.get(e.owner),amount=w?Math.min(Math.floor(e.remaining*.5),Math.max(0,this.reserveCap(w)-w.reserve)):0;e.refundCredited=amount;if(w)w.reserve+=amount;e.remaining=0;}
  entity(e,dt){if(this.r.revisions.isShot(e?.shot))return false;const r=this.r,p=r.player;if(!['tripod','lantern','nest','hound','drum','stake','patrol','censer','orbit-center','post','tesla','spider'].includes(e.mechanic))return false;e.ttl-=dt;
    const active=r.active===e.owner;
    // 三足架炮（试玩反馈："炮来打伤害你自己不打伤害了…要么你就架一个炮，这个炮自动发射炮弹"）：
    // 炮台改为自动索敌开火，玩家同时可以正常使用本枪输出。
    if(e.mechanic==='tripod'&&active&&e.remaining>0&&(e.nextShot??0)<=r.time){const t=this.nearest(e,12);
      if(t){const b=this.bullet(e,unit(t.x-e.x,t.z-e.z),e.shot,12,false);if(b){e.remaining--;e.nextShot=r.time+.5;}}
      if(e.remaining<=0)e.ended=true;
    }
    // 护灯炮座（试玩反馈："护灯炮座…也没看出有什么好用的东西来…这个炮的不攻不击"）：
    // 保持"把敌弹转化回来"的防守特性，同时让它主动朝最近敌人开火，不再只挨打。
    if(e.mechanic==='lantern'&&active&&e.remaining>0&&(e.nextShot??0)<=r.time){const t=this.nearest(e,10);
      // converted:true —— 炮座自己的子弹不得再被自己的「转化」接口吃回去（否则会自喂、额度瞬间耗光）
      if(t){const b=this.bullet(e,unit(t.x-e.x,t.z-e.z),e.shot,10,false,{converted:true});if(b)e.nextShot=r.time+.8;}
    }
    if(e.mechanic==='nest'&&active&&e.remaining>0&&e.nextShot<=r.time){const t=this.nearest(e,3);if(t){const b=this.bullet(e,unit(t.x-e.x,t.z-e.z),e.shot,12);if(b){e.remaining--;e.nextShot=r.time+.6;if(!e.remaining)e.ended=true;}}}
    if(e.mechanic==='spider'){
      const P=SPIDER[e.spider]||SPIDER.small;
      const target=this.nearest(e);
      if(target){const d=unit(target.x-e.x,target.z-e.z),n=Math.min(dist(e,target),dt*P.speed);e.x+=d.x*n;e.z+=d.z*n;}
      e.biteAcc=(e.biteAcc||0)-dt;
      if(e.biteAcc<=0&&target&&dist(e,target)<=(e.radius||.28)+(target.r||.5)+.25){
        e.biteAcc+=P.interval;
        r._damage(target,e.shot,P.damage*e.shot.mul,true,unit(target.x-e.x,target.z-e.z),r.unitDamageFeedback(e));
        if(P.status&&typeof target.applyStatus==='function')target.applyStatus(P.status,kStatusDur,P.status==='burn'?{strength:10}:{strength:10});
      }
      if(e.spider==='queen'){
        e.breedAcc=(e.breedAcc||0)-dt;
        if(e.breedAcc<=0){e.breedAcc+=5;
          if(r.deploymentAdmission(Array.from({length:2},()=>({kind:'unit',mechanic:'spider',owner:e.owner,ttl:1}))).ok){const spawnElite=(r.game?.gr?.()??.5)<.1;
            if(spawnElite)r._add({kind:'unit',mechanic:'spider',spider:'poison',owner:e.owner,x:e.x,z:e.z,ttl:SPIDER.poison.life,maxTTL:SPIDER.poison.life,blocks:SPIDER.poison.blocks,biteAcc:0,shot:e.shot,radius:.28,color:SPIDER.poison.color});
            else for(let i=0;i<2;i++)r._add({kind:'unit',mechanic:'spider',spider:'small',owner:e.owner,x:e.x,y:0,z:e.z,ttl:SPIDER.small.life,maxTTL:SPIDER.small.life,blocks:SPIDER.small.blocks,biteAcc:0,shot:e.shot,radius:.28,color:SPIDER.small.color});
          }
        }
      }
      return true;
    }
    if(e.mechanic==='hound'&&active&&p){const target=e.phase==='attack'?r._enemy(e.target):p;if(!target||!r._los(e,target))e.phase='return';else{const d=unit(target.x-e.x,target.z-e.z),n=Math.min(dist(e,target),dt*9);e.x+=d.x*n;e.z+=d.z*n;if(dist(e,target)<.4){if(e.phase==='attack'){r._damage(target,e.attackShot,5*e.attackShot.mul,true,d,r.unitDamageFeedback(e));e.phase='return';}else e.phase='idle';}}}
    if(e.mechanic==='drum'&&p){e.x=p.x-.4;e.z=p.z+.4;}
    if(e.mechanic==='patrol'&&active){if(!r._los(e,e.goal)){e.ended=true;}else{const n=Math.min(dt*4,dist(e,e.goal));e.x+=e.dx*n;e.z+=e.dz*n;e.progress+=n;const threshold=e.fired===0?e.length*.25:e.length*.75;if(e.fired<2&&e.progress>=threshold){const target=this.nearest(e);if(target){const b=this.bullet(e,unit(target.x-e.x,target.z-e.z),e.shot,9);if(b)e.fired++;}else e.fired++;}if(e.progress>=e.length)e.ended=true;}}
    if(e.ttl<=0){if(e.mechanic==='tripod')this.refundTurret(e);e.ended=true;}return true;
  }
  suspend(restoring=false){const r=this.r;for(const s of Object.values(r.states)){if(s.definitionVersion!==3&&s.weaponId==='flywheel_vow'){s.wheel=0;s.wheelReleased=null;}}for(const e of [...r.entities])if(!restoring&&e.mechanic==='orbit-stored'&&e.releaseAt!==undefined)r._remove(e.id);}
  clearCombat(){for(const s of Object.values(this.r.states))for(const f of ['riftTarget','tetherTarget','tetherUntil','mercy','shockRoots'])delete s[f];}
  visual(){const list=[];for(const [owner,s]of Object.entries(this.r.states)){for(const target of [s.riftTarget,s.tetherTarget,...Object.keys(s.mercy||{})]){const t=this.r._enemy(target);if(t)list.push({id:`mechanic:${owner}:${target}`,kind:'mark',owner,x:t.x,z:t.z,y:1.3,ttl:1,maxTTL:1});}}return list;}
  validateEntity(e){if(this.r.revisions.isShot(e?.shot))return false;const f=(o,ks)=>o&&ks.every(k=>Number.isFinite(o[k]));if(['post-flight','post-letter'].includes(e.mechanic)&&(!f(e.stationPoint,['x','z'])||!['station','to-post','after-post'].includes(e.phase)))throw Error('Invalid station flight');if(e.mechanic==='orbit-stored'&&(!f(e,['angle'])||(e.releaseAt!==undefined&&(!f(e,['releaseAt'])||!f(e.releaseAim,['x','z'])))))throw Error('Invalid orbit');if(e.mechanic==='satellite'&&(!f(e.center,['x','z'])||(!e.guard&&typeof e.center.id!=='string')||!f(e,['angle','arc'])||(e.guard&&!(Number.isInteger(e.blocks)&&e.blocks>=0&&e.blocks<=3))))throw Error('Invalid satellite');if(e.mechanic==='nest'&&!f(e,['nextShot']))throw Error('Invalid nest timing');const budget={tripod:8,lantern:6,nest:3,drum:4}[e.mechanic];if(budget!==undefined&&(!Number.isInteger(e.remaining)||e.remaining<0||e.remaining>budget))throw Error('Invalid unit budget');if(e.mechanic==='tripod'&&(e.prepaid!==8||e.remaining>e.prepaid||(e.refunded!==undefined&&typeof e.refunded!=='boolean')||(e.refunded===true&&(e.remaining!==0||!Number.isFinite(e.refundCredited)||e.refundCredited<0||e.refundCredited>e.prepaid*.5))||(e.refunded!==true&&e.refundCredited!==undefined&&e.refundCredited!==0)))throw Error('Invalid prepaid maintenance');if(e.mechanic==='hound'&&(!f(e,['nextCommand'])||!['idle','attack','return'].includes(e.phase)||e.phase==='attack'&&(typeof e.target!=='string'||!e.attackShot)))throw Error('Invalid hound');if(e.mechanic==='patrol'&&(!f(e.goal,['x','z'])||!f(e,['dx','dz','length','progress','fired'])||!Number.isInteger(e.fired)||e.fired<0||e.fired>2||e.length<=0||e.progress<0||e.progress>e.length+1e-8||typeof e.a!=='string'||typeof e.b!=='string'))throw Error('Invalid patrol');if(e.mechanic==='censer'&&(!f(e,['ash'])||e.ash<0||e.ash>4))throw Error('Invalid censer');}
}
import {manaRefundCap} from '../shared_mana.js';
