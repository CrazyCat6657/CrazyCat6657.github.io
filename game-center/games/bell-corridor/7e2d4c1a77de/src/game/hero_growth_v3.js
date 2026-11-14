import { TEAM } from '../core/constants.js';
export const isVeteran = p => p?.hero?.ruleVersion===3 && p.hero.id==='veteran';
export const isTamer = g => g?.hero?.ruleVersion===3 && g.hero.id==='tamer';
export const hasDoctrine = (p,id) => p.doctrines?.includes(id);
const uid = g => String(g.room?.uid || '');
export function realHostiles(g) { return [...new Set([...(g.enemies||[]),g.boss])].filter(e=>e?.alive&&!e.dummy&&!e.immortal&&!e.invulnerable&&(e.team===TEAM.ENEMY||e.isBoss)&&!e.fromSummon); }
export function effectiveCombat(g) { return g.mode==='run'&&g.state==='play'&&!g.practice&&!g.bossPractice&&!g.paused&&!g.buildOpen&&!g.hud?.choiceOpen&&!g.hud?.hubOpen&&!g.room?.cleared&&realHostiles(g).length>0; }
export function tactics(p) { return p.veteranTactics ??= {hitLock:0,combat:0,silence:0,rollShots:0,loaded:false,shots:0,eliteHits:[],supplied:[]}; }
export function gainMomentum(p,n) { const old=p.momentum;p.momentum=Math.min(10,p.momentum+n);p.momentumT=0;
  if(old<6&&p.momentum>=6){p.game.particles?.ring?.(p.x,.5,p.z,'#ffd24a',24,.6,3);p.game.hud?.toast?.('战意昂扬','战意达到 6 · 压阵已蓄势','#ffd24a','quick');}p.recompute(); }
export function veteranTick(p,dt) { const t=tactics(p);t.hitLock=Math.max(0,t.hitLock-dt);t.silence=Math.min(60,t.silence+dt);
  if(t.silence>1.5&&t.combat){t.combat=0;p.recompute();}
  if(effectiveCombat(p.game)&&p.momentum>0){p.momentumT+=dt;if(p.momentumT>5){p.momentum=Math.max(0,p.momentum-dt*.35);p.recompute();}} }
export function veteranDamage(p,d,g) { if(d.owner!=='player'||d.amount<=0||!effectiveCombat(g))return;const t=tactics(p);
  t.silence=0;if(t.hitLock<=0){gainMomentum(p,1);t.hitLock=.5;t.combat=Math.min(2,t.combat+.5);p.recompute();}else p.momentumT=0;
}
export function veteranTarget(p,target,g) {if(!hasDoctrine(p,'elite_breach')||(!target.elite&&!target.isBoss)||target.dummy||target.team===TEAM.PLAYER)return;
  const t=tactics(p),key=uid(g)+':'+target.id;if(t.eliteHits.includes(key)||t.eliteHits.length>=1024)return;t.eliteHits.push(key);
  g.onDamage(target,4,{source:'heroSkill',owner:p,assetSecondary:true,feedbackCategory:'skill',feedbackSourceInstanceId:'hero:veteran'}); }
export function veteranShot(p,d,g) {if(d.paid===false)return;const t=tactics(p);t.shots++;
  if(hasDoctrine(p,'high_spirits')&&p.momentum>=6&&t.shots%4===0){const a=p.aim||{x:0,z:1};g.projectiles.spawn({x:p.x,y:.9,z:p.z,dx:a.x,dz:a.z,speed:22,damage:3,life:1.1,team:TEAM.PLAYER,owner:p,source:'heroSkill',feedbackCategory:'skill',feedbackSourceInstanceId:'hero:veteran',feedbackContext:{source:'heroSkill',feedbackCategory:'skill',feedbackSourceInstanceId:'hero:veteran'},kind:'bullet',color:'#ffd24a',size:.12,radius:.13});}}
export function supplyAmmo(p,fraction) {const w=p.weapon;if(!w||!Number.isFinite(w.reserve))return;const cap=w.def.ammoMax?Math.round(w.def.ammoMax*(p.stats.ammoMaxMul||1)):120;w.reserve=Math.min(cap,w.reserve+Math.max(1,Math.ceil(cap*fraction)));}
export function veteranRoom(p,d,g) {const t=tactics(p),key=uid(g);if(g.mode!=='run'||g.practice||!g.room?.c2CombatStarted||t.supplied.includes(key))return;t.supplied.push(key);
  if(hasDoctrine(p,'room_breath')){p.dashCharges=Math.min(p.dashMax,p.dashCharges+1);p.armor=Math.min(5,p.armor+1);}
  if(hasDoctrine(p,'room_supply'))supplyAmmo(p,.12);}

// Lifetime thresholds; bounded additive growth, independent of evolution.
export const PET_XP = [0,35,90,165,265,390,540,720];
export function newPetGrowth(){return {level:1,xp:0,effectiveRecovery:0,downedAtRoomUid:null,eligibleNewRoomUID:null,clearedNewRoomWithoutPet:false,rooms:{}};}
export function petMaxHp(c){return 6+(c.growth.level-1)+({horn:2,shell:4,sac:1}[c.evo]||0)+(c.stage===2?({horn:4,shell:6,sac:3}[c.evo]||0):0);}
export const petDamageMul = c => (c.growth ? 1+.12*(c.growth.level-1) : 1) * (c.growth && c.alive && c.rageT>0 ? 1.5 : 1);
export const petInterval = c => (c.evo==='sac'?1.5:2.1)*(c.growth?Math.max(.72,1-.04*(c.growth.level-1)):1)*(c.growth && c.alive && c.rageT>0 ? .5 : 1);
export function petRoomEnter(c,g){if(!c.growth||g.mode!=='run'||g.practice||g.bossPractice||g.room?.cleared||!realHostiles(g).length)return;const started=!!g.room.c2CombatStarted;g.room.c2CombatStarted=true;
  if(!c.alive&&!started&&uid(g)!==c.growth.downedAtRoomUid&&!g.room.cleared)c.growth.eligibleNewRoomUID=uid(g);}
export function petDown(c){Object.assign(c.growth,{effectiveRecovery:0,downedAtRoomUid:uid(c.game),eligibleNewRoomUID:null,clearedNewRoomWithoutPet:false});}
export function petTick(c,dt,g){const s=c.growth;if(c.alive)return;
  if(effectiveCombat(g))s.effectiveRecovery=Math.min(60,s.effectiveRecovery+dt);
  if(s.effectiveRecovery>=60&&s.clearedNewRoomWithoutPet&&g.mode==='run'&&!g.practice&&g.room?.cleared&&realHostiles(g).length===0){c.hp=Math.ceil(c.maxHp*.6);c.alive=true;s.eligibleNewRoomUID=null;g.hud?.toast?.(c.name,'异兽重新站起 · 生命恢复六成','#9dff5a','quick');}}
function roomBudget(c,g){const key=uid(g),s=c.growth;if(!key)return null;if(!s.rooms[key]){if(Object.keys(s.rooms).length>=256)return null;s.rooms[key]={used:0,bonus:0,cleared:false,enemies:{}};}return s.rooms[key];}
export function petAddXP(c,n){const s=c.growth;if(n<=0)return;s.xp=Math.min(720,s.xp+n);let level=1;while(level<8&&s.xp>=PET_XP[level])level++;
  if(level!==s.level){const delta=level-s.level;s.level=level;c.maxHp=petMaxHp(c);if(c.alive)c.hp=Math.min(c.maxHp,c.hp+delta);c.game.particles?.ring?.(c.x,.6,c.z,'#ffb347',22,.6,2);c.game.hud?.toast?.('异兽升级',`等级 ${level} · 生命与攻击成长`,'#ffb347','quick');}}
export function petActualDamage(c,d,g){if(!c?.growth||g.mode!=='run'||g.practice||g.bossPractice||d.amount<=0||!['player','unit'].includes(d.owner)||!d.progressionEligible||!d.targetId)return;
 const b=roomBudget(c,g);if(!b)return;const s=c.growth,cap=600*Math.max(1,g.floor||1),id=d.targetId;
 if(!Object.hasOwn(b.enemies,id)){if(Object.keys(b.enemies).length>=256)return;b.enemies[id]={used:0,cap:Math.min(d.targetMaxHp,250*Math.max(1,g.floor||1))};}
 const e=b.enemies[id],n=Math.max(0,Math.min(d.amount,e.cap-e.used,cap-b.used));e.used+=n;b.used+=n;petAddXP(c,n);}
export function petRoomClear(c,g){if(!c?.growth||g.mode!=='run'||g.practice||g.bossPractice||!g.room?.c2CombatStarted)return;const s=c.growth,b=roomBudget(c,g);
 if(b&&!b.cleared){b.cleared=true;b.bonus=10*Math.max(1,g.floor||1);petAddXP(c,b.bonus);}
 if(!c.alive&&s.eligibleNewRoomUID===uid(g)&&uid(g)!==s.downedAtRoomUid)s.clearedNewRoomWithoutPet=true;
 petTick(c,0,g);}
export function validatePetGrowth(c){const s=c?.growth;if(s===undefined)return true;const finite=(n,max)=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=max;
 if(!s||typeof s!=='object'||Object.getPrototypeOf(s)!==Object.prototype||Object.keys(s).length!==7||!Number.isInteger(s.level)||s.level<1||s.level>8||!finite(s.xp,720)||s.xp<PET_XP[s.level-1]||(s.level<8&&s.xp>=PET_XP[s.level])||!finite(s.effectiveRecovery,60)||typeof s.clearedNewRoomWithoutPet!=='boolean'||![s.downedAtRoomUid,s.eligibleNewRoomUID].every(v=>v===null||typeof v==='string'&&v.length>0&&v.length<129)||typeof c.alive!=='boolean'||(c.alive&&c.hp<=0)||s.clearedNewRoomWithoutPet&&!s.downedAtRoomUid||!finite(c.hp,petMaxHp(c))||c.maxHp!==petMaxHp(c)||(!c.alive&&(c.hp!==0||!s.downedAtRoomUid))||s.eligibleNewRoomUID===s.downedAtRoomUid&&s.eligibleNewRoomUID!==null)throw Error('异兽成长状态无效');
 if(!s.rooms||Object.getPrototypeOf(s.rooms)!==Object.prototype||Object.keys(s.rooms).length>256)throw Error('异兽经验房间无效');
 let earned=0;for(const [key,b]of Object.entries(s.rooms)){if(!key||key.length>128||!b||typeof b.cleared!=='boolean'||!finite(b.used,1800)||!finite(b.bonus,30)||(b.cleared?![10,20,30].includes(b.bonus):b.bonus!==0)||Object.keys(b).length!==4||!b.enemies||Object.getPrototypeOf(b.enemies)!==Object.prototype||Object.keys(b.enemies).length>256)throw Error('异兽经验预算无效');let sum=0;for(const e of Object.values(b.enemies)){if(!e||Object.keys(e).length!==2||!finite(e.cap,750)||!finite(e.used,e.cap))throw Error('异兽目标预算无效');sum+=e.used;}if(Math.abs(sum-b.used)>1e-6)throw Error('异兽经验账目不一致');earned+=sum+b.bonus;}if(Math.abs(s.xp-Math.min(720,earned))>1e-6)throw Error('异兽终身经验不一致');return true;}
