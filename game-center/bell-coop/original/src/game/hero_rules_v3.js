import {damageSource} from './damage_context.js';
import { tactics, hasDoctrine, gainMomentum, veteranTick, veteranDamage, veteranShot, veteranRoom, supplyAmmo, petActualDamage, petRoomClear } from './hero_growth_v3.js';
import * as THREE from '../../vendor/three.module.js';
import { audio } from '../core/audio.js';
import { TEAM } from '../core/constants.js';
import { heroWaveTargets } from './hero_rules.js';
import { scavengeSkill, scavengeTick, integrationState, integrationDamage } from './hero_integration_v3.js';
import { emberMultiplier, emberTick, rangerTick } from './hero_p2.js';
import { addForgeHeat, FORGE_HEAT_RATE, PET_RAGE_COOLDOWN } from './hero_feedback.js';

const roomId = g => String(g.room?.uid || g.mode || 'world');
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const blocked = (g, x, z) => !!(g.bulletBlocked || g.pointBlocked)?.call(g, x, z, .03, .8);
function los(g, a, b) {
  const n = Math.max(1, Math.ceil(Math.hypot(a.x-b.x,a.z-b.z)/.12));
  for (let i=0;i<=n;i++) if (blocked(g,a.x+(b.x-a.x)*i/n,a.z+(b.z-a.z)*i/n)) return false;
  return true;
}
function feedback(g,x,z,color,radius) {
  g.particles?.ring?.(x,.55,z,color,26,.8,radius);
  g.flashSmall?.(x,.9,z,color,12,.16); audio.bell(true);
}

// Discrete hostile shots only. Never invoke end/explosion handlers on a clear.
export function clearVisibleEnemyProjectiles(g) {
  const v=new THREE.Vector3(), sc=g.roomScene, cam=g.camera;
  const visible=b=>{
    if(!Number.isFinite(b.x)||!Number.isFinite(b.z))return false;
    if(sc?.half&&(Math.abs(b.x-(sc.ox||0))>sc.half+2||Math.abs(b.z-(sc.oz||0))>sc.half+2))return false;
    if(!cam?.projectionMatrix)return true;
    v.set(b.x,b.y??.8,b.z).project(cam);
    return v.z>=-1&&v.z<=1&&Math.abs(v.x)<=1.08&&Math.abs(v.y)<=1.08;
  };
  let count=0;
  for(const b of g.projectiles?.pool||[])if(b.alive&&b.team===TEAM.ENEMY&&visible(b)){
    b.alive=false;if(b.mesh)b.mesh.visible=false;count++;
  }
  const rt=g.weaponAssets;
  if(rt?.entities){for(const e of rt.entities)if(e.kind==='projectile'&&e.team===TEAM.ENEMY&&!e.ended&&visible(e)){e.ended=true;count++;}
    rt.entities=rt.entities.filter(e=>!e.ended);}
  return count;
}

// Feed at the payment boundary. Only actual reserve is transferred; finite
// ammunition is never synthesized by changing magazine capacity.
export function forgeFeed(p,w,need=1) {
  if(p.hero?.ruleVersion!==3||p.hero.id!=='forgewright'||p.c2.forgeT<=0||!w)return false;
  const rt=p.game.weaponAssets, cap=p.magSize(w);
  p.reloading=false;p.reloadT=0;
  const state=rt?.states?.[w.assetInstanceId];if(state)state.reload=null;
  if(need<=0)return true;
  if(w.mag>=need)return true;
  const infinite=!w.def.ammoType&&(!Number.isFinite(w.reserve)||rt?.supports(w.def)&&rt._freeMag?.(w));
  const take=infinite?cap-w.mag:Math.min(cap-w.mag,Math.max(0,w.reserve||0));
  if(take<=0)return false;
  w.mag+=take;if(!infinite)w.reserve-=take;
  return w.mag>=need;
}

// This runs before synchronous takeDamage -> die -> onEnemyKilled.
export function captureC2Lethal(g,target,opts={}) {
  if(g.hero?.ruleVersion!==3||g.hero.id!=='resonant'||!target||target.isBoss)return;
  const p=g.player, echo=opts.source==='secondaryEcho'&&typeof opts.echoRootId==='string';
  const primaryExplosion=opts.source==='explosion'&&(opts.primaryExplosion||opts.assetShot?.explosion&&!opts.assetShot?.secondaryExplosion);
  const direct=(!opts.assetSecondary||primaryExplosion)&&!opts.buildChain&&['bullet','beam','weapon_asset','explosion'].includes(opts.source)&&
    (opts.owner===p||opts.bullet?.ownerRef===p||p.weapons?.some(w=>w.assetInstanceId===opts.sourceInstanceId));
  if(!echo&&!direct){target.c2Lethal=null;return;}
  const w=p.weapons?.find(w=>w.assetInstanceId===opts.sourceInstanceId);
  const base=echo?opts.echoDamage:opts.echoBaseDamage||opts.bullet?.echoBaseDamage||opts.assetShot?.echoBaseDamage||
    (w?.def?.damage||opts.assetShot?.damage||opts.bullet?.damage||1)*(p.stats?.damage||1)*(w?.dmgMul||1);
  target.c2Lethal={...damageSource(opts),source:echo?'echo':'weapon',damage:clamp(base,1,100000),
    rootShotId:String(opts.echoRootId||opts.rootShotId||g.createDamageRootId()),roomUid:roomId(g)};
}
export function enqueueC2Echo(g,e) {
  const p=g.player,s=p?.c2,k=e?.c2Lethal;
  if(g.hero?.ruleVersion!==3||g.hero.id!=='resonant'||!s||!k||e.c2EchoConsumed||k.roomUid!==roomId(g)||
      (k.source!=='echo'&&s.echoT<=0))return;
  e.c2EchoConsumed=true;
  if(s.echoQueue.length>=Math.min(128,Math.max(1,g.enemies?.length||0)))return;
  s.echoSequence++;
  s.echoQueue.push({damageContext:damageSource(k),id:`echo:${s.echoSequence}`,x:e.x,z:e.z,delay:.2,remaining:0,
    roomUid:k.roomUid,damage:k.damage,rootShotId:k.rootShotId});
}
function echoTick(p,dt){
  const g=p.game,s=p.c2,wasActive=s.echoT>0;s.echoT=Math.max(0,s.echoT-dt);
  if(wasActive&&s.echoT===0)p.recompute();
  s.echoQueue=s.echoQueue.filter(e=>e.roomUid===roomId(g));
  for(const e of s.echoQueue)e.delay=Math.max(0,e.delay-dt);
  let budget=8;
  while(budget--){const i=s.echoQueue.findIndex(e=>e.delay<=0);if(i<0)break;
    const [e]=s.echoQueue.splice(i,1);feedback(g,e.x,e.z,'#8ad8ff',3.2);
    for(const {enemy} of heroWaveTargets(g,e.x,e.z,3.2)){
      if((!enemy.isBoss&&enemy.c2EchoConsumed)||!enemy.alive)continue;
      g.onDamage(enemy,e.damage,{...damageSource(e),source:'secondaryEcho',owner:p,assetSecondary:true,assetNoRefund:true,
        rootShotId:e.rootShotId,echoRootId:e.rootShotId,echoDamage:e.damage,
        feedbackCategory:'skill',feedbackSourceInstanceId:'hero:resonant'});
    }
  }
}
function bellTick(p,dt){
  const g=p.game,s=p.c2;s.bells=s.bells.filter(e=>e.roomUid===roomId(g));
  for(const e of s.bells)e.delay=Math.max(0,e.delay-dt);
  const ready=s.bells.filter(e=>e.delay<=0);s.bells=s.bells.filter(e=>e.delay>0);
  for(const e of ready){feedback(g,e.x,e.z,'#c07af0',3.2);
    if(blocked(g,e.x,e.z)||!los(g,p,e))continue;
    for(const {enemy} of heroWaveTargets(g,e.x,e.z,3.2))g.onDamage(enemy,e.damage,{
      source:'heroSkill',owner:p,rootShotId:e.rootShotId,assetSecondary:true,assetNoRefund:true,
      knock:enemy.isBoss?0:1,feedbackCategory:'skill',feedbackSourceInstanceId:'hero:arcanist'});
  }
}

const rules={
  scavenger:{hp:5,mods:{pickup:.60,coins:.35},desc:'背着废料包的拾荒客，能带 3 把枪，把地面废枪拆成应急资源。',
    verb:'带 3 把枪；E 拾取，连续两次 C 确认拆枪',passiveName:'拾荒',skillName:'现场拆解 / 拼装',
    talent:'能携带 3 把枪，每枪 2 个配件槽；拾取范围 +60%、金币 +35%，真实击杀有 55% 机会额外掉 1 金币。拆枪得 2–3 废料，3 废料拼装物资。',
    costNote:'清房后可拆解 / 拼装；首次 C 预览目标，3 秒内再次 C 确认。',hook:{
      skillStatus(p,g){if(g.mode==='run'&&g.aliveEnemyCount()>0)return {ready:false,reason:'交战中不能拆解或拼装，先清空房间'};
        return g.nearestGroundWeapon(p)||p.scrap>=3?{ready:true}:{ready:false,reason:'附近没有可拆武器；拼装需要 3 废料'};},
      onKill(p,d,g){if(g.grc(.55))g.spawnCoins(p.x,p.z,1,{rewardSource:'event-reward'});},onHeroSkill:scavengeSkill,tick:scavengeTick,
      onRoomClear(p,d,g){if(!p.scavengeTaught){p.scavengeTaught=true;g.hud?.toast?.('废枪也有用','能携带 3 把枪；使用职业技能预览拆枪，再次使用确认。3 份废料可以拼装弹药、护甲或临时配件。','#c07af0','story');}},
      resource(p){return {txt:`3 枪槽 · 废料 ${p.scrap|0}${p.c2Integration?.preview?' · 再按 C 确认拆枪':''}`};}}},
  gunsmith:{hp:5,desc:'每把枪有 3 个配件槽；跨层再选配件，逐步改出自己的武器。',
    talent:'每枪 3 个配件槽（普通 2）；每下一层获得一次配件三选一。可装多个同槽类型的不同配件，仍受总槽位与互斥限制，同一配件不能重复。',
    verb:'每把枪安装 3 个配件，按 C 超频强化',costNote:'超频 5 秒，结束后过热 2.5 秒；至少安装 1 个配件。'},
  veteran:{hp:6,desc:'实战命中与击杀维持战意，每层五选二教条积累战术。',verb:'实战命中维持战意，每层从五条教条选两条',
    talent:'伤害与击杀积累战意；每层五选二教条，三层形成六条战术路线。',costNote:'安全区保留战意；交战中连续 5 秒没有有效伤害或战意获取后缓慢衰减，空射不能续时。',hook:{
      tick:veteranTick,onActualDamage:veteranDamage,onShotFired:veteranShot,
      onDashEnd(p){tactics(p).rollShots=3;},
      onWeaponSwap(p){if(hasDoctrine(p,'loaded_response'))tactics(p).loaded=!!p.weapon?.mag;},
      onArmorBreak(p){if(hasDoctrine(p,'broken_guard')){p.instantReload(1);gainMomentum(p,2);}},
      onKill(p,d,g){gainMomentum(p,hasDoctrine(p,'killchain')?2:1);const e=d.enemy;
        if(hasDoctrine(p,'butcher')&&e?.elite){g.spawnCoins(p.x,p.z,1,{rewardSource:'event-reward'});supplyAmmo(p,.06);}
        if(hasDoctrine(p,'last_stand')&&p.weapon?.mag<=0&&e&&Math.hypot(e.x-p.x,e.z-p.z)<4)p.instantReload(.30);},
      recompute(p,s){const m=Math.max(0,Math.min(10,p.momentum));s.speed+=m*(hasDoctrine(p,'veteran_march')?.012:.006);s.rate+=m*.005;s.reloadMul-=m*.006;
        if(hasDoctrine(p,'swap_drill')&&p.swapT>0)s.rate+=.35;
        if(hasDoctrine(p,'steady_fire')&&tactics(p).combat>=2&&tactics(p).silence<=1.5)s.rate+=.2;},
      damageMul(p){const t=tactics(p);let mul=hasDoctrine(p,'opening_volley')&&(p._shotsSinceReload|0)<3?1.5:1;
        if(hasDoctrine(p,'roll_counter')&&t.rollShots>0){mul*=1.35;t.rollShots--;}
        if(hasDoctrine(p,'loaded_response')&&t.loaded){mul*=1.6;t.loaded=false;}return mul;},
      onFloorStart(p){if(hasDoctrine(p,'field_repair'))p.heal(1,'hero');},onRoomClear:veteranRoom,
      onHeroSkill(p,g){const m=p.momentum,got=p.instantReload(m>0?1:.34);if(m>0)p.armor=Math.min(5,p.armor+1);p.momentum=Math.max(0,m-4);p.recompute();
        g.particles?.ring?.(p.x,.6,p.z,'#ffd24a',20,.6,3);g.hud?.toast?.('压阵',`装填 ${got} 发${m>0?' · 护甲 +1':''}`,'#ffd24a','quick');return m>0?10:16;},
      resource(p){return {txt:`战意 ${Math.floor(p.momentum)}/10 · 教条 ${p.doctrines.length}/6`};}}},
  tamer:{hp:5,desc:'与异兽一起造成伤害、升级和进化，按 C 激怒异兽，短时间强化作战。',verb:'按 C 让异兽变大暴走，强化攻击、移动与生存',skillName:'异兽暴走',skillCd:PET_RAGE_COOLDOWN,
    talent:'异兽与玩家造成的真实伤害共同积累经验，等级 1–8；角、甲、共鸣囊改变战斗方式。',
    costNote:'暴走 8 秒，冷却 24 秒；倒地后需有效作战 60 秒，并独自完整清掉一间新战斗房，在安全时恢复。',hook:{
      onHeroSkill(p,g){return g.companion?.command(g)?PET_RAGE_COOLDOWN:false;},
      skillStatus(p,g){const c=g.companion;return c?.rageT>0?{ready:false,reason:'异兽暴走中',remaining:c.rageT,total:8}:c?.alive?{ready:true}:{ready:false,reason:c?`恢复 ${Math.floor(c.growth?.effectiveRecovery||0)}/60 秒 · 独自清空新房间 ${c.growth?.clearedNewRoomWithoutPet?1:0}/1`:'异兽未就位'};},
      onActualDamage(p,d,g){petActualDamage(g.companion,d,g);},onRoomClear(p,d,g){petRoomClear(g.companion,g);},
      resource(p){const c=p.game.companion;if(!c)return {txt:'异兽未就位'};return {txt:c.alive?`异兽 ${c.growth?.level||1} 级 · ${{horn:'角',shell:'甲',sac:'共鸣囊'}[c.evo]||'幼兽'} · 生命 ${Math.ceil(c.hp)}/${c.maxHp}${c.rageT>0?` · 暴走 ${c.rageT.toFixed(1)} 秒 · 临时护甲 ${c.rageArmor.toFixed(1)}`:''}`:`异兽 ${c.growth?.level||1} 级 · 作战恢复 ${Math.floor(c.growth?.effectiveRecovery||0)}/60 秒 · 独自清空新房间 ${c.growth?.clearedNewRoomWithoutPet?1:0}/1`};}}},
  ranger:{hp:4,desc:'擅长快速穿梭的猎手，可储存两段长距离游闪。',mods:{dashMax:1},passiveName:'游影',skillName:'游影长闪',skillCd:0,skillInput:'dodge',
    verb:'右键 / Shift / 空格长闪，方向由移动键决定',
    talent:'初始储存两段长闪；距离为普通翻滚的 1.65 倍，耗时仍为 0.19 秒。装备可继续增加段数。',
    costNote:'基础回充 1.35 秒，装备仍可改变次数、距离与回充。',hook:{
      skillStatus(p){return p.dashTime>0||p.c2.rangerMoveLeft>0?{ready:false,reason:'闪现中'}:
        p.dashCharges>0?{ready:true}:{ready:false,reason:'闪现恢复中',remaining:p.dashCd,total:p.dashCdTotal};},
      onActualDamage:integrationDamage,tick:rangerTick,
      resource(p){return {txt:''};}}},
  emberoath:{hp:6,desc:'伤势越重火力越强；临时封存生命，把风险化作爆发。',mods:{},passiveName:'余烬血誓',skillName:'焚誓',skillCd:24,
    verb:'失去生命会增伤；按 C 临时封存最多 3 生命爆发',
    talent:'每损失 1 生命，攻击伤害 +20%，上限 2 倍；生命不高于 2 时攻击附独立灰烬。',
    costNote:'封存最多 3 生命 7 秒，结束只返还封存部分；冷却 24 秒。',hook:{
      damageMul:emberMultiplier,
      shotMods(p,o){if(p.hp<=2)o.statuses={...o.statuses,ash:{duration:2.5,dps:2.4*emberMultiplier(p),sourceInstanceId:'hero:emberoath'}};},
      skillStatus(p){return p.c2.escrowHp>0?{ready:false,reason:'焚誓进行中',remaining:p.c2.escrowT,total:7}:
        p.hp<=1?{ready:false,reason:'至少需要 1 点可封存生命'}:{ready:true};},
      onHeroSkill(p,g){if(p.hp<=1||p.c2.escrowHp>0)return {ready:false,reason:'生命不足或焚誓进行中'};
        const amount=Math.min(3,p.hp-1);p.hp-=amount;p.c2.escrowHp=amount;p.c2.escrowT=7;
        if(g.mode==='run'&&!g.practice&&!g.bossPractice&&!g._restoring){g._oathPower=Math.max(g._oathPower||0,amount);g.checkAchievements();}
        g.particles?.ring?.(p.x,.5,p.z,'#b42c30',20,.5,3);
        g.hud?.toast?.('焚誓',`封存 ${amount} 生命 · 7 秒爆发`,'#ff745a','story');return 24;},
      tick:emberTick,
      resource(p){const s=p.c2;return {txt:`生命 ${p.hp.toFixed(1)}/${p.maxHp} · 封存 ${s.escrowHp.toFixed(1)} · ${emberMultiplier(p).toFixed(2)}×${s.escrowHp?` · ${s.escrowT.toFixed(1)}s`:''}`};}}},
  warden:{hp:5,desc:'沉钟回廊的看守者，以钟鸣震散交战房间中处于当前视野内的敌弹。',skillName:'钟鸣',skillCd:15,passiveName:'守望',verb:'使用职业技能，震碎交战房间内当前可见的敌弹',
    talent:'职业技能清除交战房间内、同时处于当前视野中的敌方弹丸，包括首领普通弹幕。',costNote:'冷却 15 秒；持续激光与场地危险不受影响。',
    hook:{onHeroSkill(p,g){const n=clearVisibleEnemyProjectiles(g);feedback(g,p.x,p.z,'#67e8ff',5);
      g.hud?.toast?.('钟鸣',`震散 ${n} 发敌弹`,'#67e8ff','quick');return 15;},
      resource(){return {txt:''};}}},
  forgewright:{hp:6,desc:'实付开火和己方爆炸为熔炉蓄热，狂暴时枪械持续灼烧。',mods:{explosiveMul:.4,blastRadius:.2},skillName:'熔铸狂暴',skillCd:20,
    verb:'实付开火蓄热，满 60 热按 C 狂暴 10 秒',
    talent:'实际开火与己方爆炸蓄热；爆炸伤害 +40%、范围 +20%。满 60 热按 C，10 秒射速翻倍、免装填并灼烧敌人。',
    costNote:'开火与爆炸共用每秒 7.5 的入热预算，每秒散热 1.1；积热速度随实付开火、爆炸与装填空档变化。消耗 60 热，狂暴结束后冷却 20 秒。',hook:{
      onActualDamage:integrationDamage,
      onShotFired(p,d){if(p.c2.forgeT>0||d.paid===false||p.c2.heatLock>0)return;
        const rate=Number.isFinite(d.def?.rate)&&d.def.rate>0?d.def.rate:2;
        addForgeHeat(p,clamp(12/Math.sqrt(rate),3,12));
        p.c2.heatLock=.25;},
      onExplosion(p,d){if(p.c2.forgeT>0||d.team!==TEAM.PLAYER||d.owner!==p||d.secondaryOnly||
        Math.hypot(d.x-p.x,d.z-p.z)>15)return;addForgeHeat(p,clamp(8+(d.radius||0)*2,8,16));},
      recompute(p,s){if(p.c2.forgeT>0)s.rate*=2;},
      shotMods(p,o){if(p.c2.forgeT>0)o.statuses={...o.statuses,burn:Math.max(3,o.statuses?.burn||0)};},
      tick(p,dt){p.c2.heatLock=Math.max(0,p.c2.heatLock-dt);
        p.c2.forgeHeatBudget=p.c2.forgeT>0?0:Math.min(FORGE_HEAT_RATE,p.c2.forgeHeatBudget+dt*FORGE_HEAT_RATE);
        if(p.c2.forgeT>0){p.c2.forgeT=Math.max(0,p.c2.forgeT-dt);forgeFeed(p,p.weapon,0);
          if(p.c2.forgeT===0){p.heroSkillCd=p.c2.forgeCooldownAfter;p.heroSkillCdMax=p.heroSkillCd;p.recompute();audio.bell(false);}}
        else p.heat=Math.max(0,p.heat-dt*1.1);},
      skillStatus(p){return p.c2.forgeT>0?{ready:false,reason:'狂暴进行中',remaining:p.c2.forgeT,total:10}:
        p.heat<60?{ready:false,reason:`炉热不足（${Math.floor(p.heat)}/60）`,progress:p.heat/60}:{ready:true};},
      onHeroSkill(p,g){if(p.heat<60||p.c2.forgeT>0)return {ready:false,reason:'需要 60 炉热'};
        p.heat-=60;integrationState(p).forgeTargets=[];p.c2.forgeT=10;p.recompute();forgeFeed(p,p.weapon,0);feedback(g,p.x,p.z,'#ff8a3c',4);
        g.hud?.toast?.('熔铸狂暴','10 秒内射速翻倍，无需等待装填，攻击附带灼烧效果。','#ff8a3c','story');return {cooldown:0};},
      resource(p){return {txt:p.c2.forgeT>0?`狂暴 ${p.c2.forgeT.toFixed(1)}s · 炉热 ${Math.floor(p.heat)}`:`炉热 ${Math.floor(p.heat)}/60`};}}},
  resonant:{hp:4,desc:'让实体弹丸多反弹一次，回响期间击杀引发连锁震荡。',passiveName:'反弹',skillName:'回响',skillCd:18,verb:'子弹多反弹一次；按 C 加强反弹并连锁震荡',
    talent:'实体弹丸常驻额外反弹 1 次；按 C 后 10 秒总额外反弹 2 次，武器击杀引发可传递的回响震荡。',
    costNote:'回响持续 10 秒，冷却 18 秒；光束和召唤物不获得反弹。',hook:{
      recompute(p,s){s.bounce+=p.c2.echoT>0?2:1;},
      onHeroSkill(p,g){if(p.c2.echoT>0)return {ready:false,reason:'回响进行中'};
        p.c2.echoT=10;p.recompute();feedback(g,p.x,p.z,'#8ad8ff',4);
        g.hud?.toast?.('回响','10 秒弹丸总额外反弹 2 次 · 击杀连锁','#8ad8ff','story');return 18;},
      skillStatus(p){return p.c2.echoT>0?{ready:false,reason:'回响进行中',remaining:p.c2.echoT,total:10}:{ready:true};},
      tick:echoTick,resource(p){return {txt:p.c2.echoT>0?`回响 ${p.c2.echoT.toFixed(1)}s · 反弹 +2`:'反弹 +1'};}}},
  arcanist:{hp:4,desc:'把火器译成法术核心，用治愈钟声维持远征续航。',skillName:'愈合钟声',skillCd:35,verb:'按 C 回复 1 点生命',
    talent:'所有法术共用角色法力并自动恢复；按 C 消耗法力上限的 20%，回复 1 生命。',costNote:'冷却 35 秒；满血或法力不足时不消耗技能。',hook:{
      skillStatus(p){return p.hp>=p.maxHp?{ready:false,reason:'生命已满'}:p.mana<p.manaCap()/5?{ready:false,reason:`法力不足（需要 ${p.manaCap()/5}）`,progress:p.mana/(p.manaCap()/5)}:{ready:true};},
      onHeroSkill(p,g){const status=this.skillStatus(p,g);if(!status.ready)return status;
        const before=p.hp;if(!p.heal(1,'hero')||p.hp<=before)return {ready:false,reason:'当前无法恢复生命'};
        p.mana -= p.manaCap()/5;
        feedback(g,p.x,p.z,'#9dffb0',3);audio.heal();
        g.hud?.toast?.('愈合钟声',`回复 ${(p.hp-before).toFixed(1)} 生命`,'#9dffb0','quick');return 35;},
      tick:bellTick,resource(p){return {txt:`消耗 ${p.manaCap()/5} 点法力`};}}},

};

export function heroRuleV3(v2){const r=rules[v2.id];return {...v2,...r,ruleVersion:3,
  hook:r?.hook?{...r.hook}:{...v2.hook},mods:r?.mods?{...r.mods}:v2.mods?{...v2.mods}:v2.mods,
  pal:v2.pal?{...v2.pal}:v2.pal,build:v2.build?{...v2.build}:v2.build,
  unlock:v2.unlock?{...v2.unlock}:v2.unlock};}
