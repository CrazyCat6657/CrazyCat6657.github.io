// Runtime checkpoints restore a live actor, including fields the browser's
// active-save validator historically did not check. Keep this schema tied to
// the versioned source identity; these are original actor fields, not a second
// implementation of movement/combat rules.
const PLAYER_NUMBERS=`buildEffectsVersion radius x z vx vz yaw aimDist assetMoveSpeedMul dashBuffer hp maxHp armor coins keys weaponIndex activeIndex activeCd dashCharges dashMax mana dashCd dashTime heroSkillCd heroSkillCdMax bellCharges bellFlash bellWindow heat scrap resonance phrase momentum tuningT overloadT _shotsSinceReload overclockT momentumT swapT spellEchoT overheatT iframes reloadT fireT spin charge burstLeft burstT walkPhase moveAmount standT kills soulCount overdrive barrier deadAnim hitFlash slowT recoil drinks r team minY _hpPenalty _bossHitCount _hzCd _hazCd _trapCd pdChain _ammoT`.split(' ');
const ACTOR_NUMBERS=`x y z vx vy vz yaw radius r minY team maxHp hp phase stateT animT hitFlash fireT burstLeft burstT contactCd deathT spawnT stunT shieldHp shieldMax shieldFlash shieldDropT specialT speedMul attackIdx cooldown patternT patternStep orbitAngle laserAngle deadT baseScale aimYaw chargeT summonT dashT warnT recoveryT attackT introT`.split(' ');
const DYNAMIC_NUMBER=/(?:T|Cd|Until|Timer|Sequence)$/;
const BOOLS=['alive','elite','deathDone','shieldBroken','dummy','immortal','invulnerable','fromSummon','isBoss','assetGroundSlow'];
function error(field){throw TypeError('Invalid runtime actor field: '+field);}
function number(value,field){if(typeof value!=='number'||!Number.isFinite(value)||Math.abs(value)>1e15)error(field);}
function numeric(record,names,path){
  for(const name of new Set([...names,...Object.keys(record).filter(k=>DYNAMIC_NUMBER.test(k))]))if(Object.hasOwn(record,name))number(record[name],path+'.'+name);
}
function vector(v,path,{direction=false,len=false}={}){
  if(!v||Object.getPrototypeOf(v)!==Object.prototype||Object.keys(v).sort().join()!==(len?'len,x,z':'x,z'))error(path);
  number(v.x,path+'.x');number(v.z,path+'.z');
  if(direction&&Math.abs(Math.hypot(v.x,v.z)-1)>1e-6)error(path+' unit direction');
  if(len){number(v.len,path+'.len');if(v.len<0||v.len>1+1e-8||Math.hypot(v.x,v.z)>1+1e-8)error(path+' movement range');}
}
function actor(record,path){
  numeric(record,ACTOR_NUMBERS,path);
  for(const name of BOOLS)if(Object.hasOwn(record,name)&&typeof record[name]!=='boolean')error(path+'.'+name);
  for(const name of ['state','id','kind','bossType','lastPattern'])if(Object.hasOwn(record,name)&&typeof record[name]!=='string')error(path+'.'+name);
  for(const name of ['face','chargeDir'])if(Object.hasOwn(record,name))vector(record[name],path+'.'+name,{direction:true});
  if(record.status){for(const name of ['burn','burnDps','poison','poisonDps','slow','freeze'])if(Object.hasOwn(record.status,name)){number(record.status[name],path+'.status.'+name);if(record.status[name]<0)error(path+'.status.'+name);}}
}
export function validateRuntimeActors(world){
  validateRuntimePlayer(world.player);
  for(const [room,st]of Object.entries(world.roomStates)){
    for(const e of st.enemies)actor(e,room+'.enemy');
    if(st.boss)actor(st.boss,room+'.boss');
    for(const b of st.projectiles){
      numeric(b,['x','y','z','dx','dz','vx','vy','vz','speed','damage','life','maxLife','radius','size','pierce','bounce','homing','explosive','gravity','chain','knock','chainRange','blastRadius','bounceCount','speedRetain'],room+'.projectile');
      if(b.echoBaseDamage!==null&&b.echoBaseDamage!==undefined)number(b.echoBaseDamage,room+'.projectile.echoBaseDamage');
      for(const k of ['alive','crit','resonant','arc','noSlow'])if(Object.hasOwn(b,k)&&typeof b[k]!=='boolean')error(room+'.projectile.'+k);
      if(b.hitSet!==null&&(!(b.hitSet instanceof Set)||b.hitSet.size>1000||[...b.hitSet].some(x=>typeof x!=='string')))error(room+'.projectile.hitSet');
    }
    for(const d of [...st.pickups,...st.hazards,...st.turrets,...st.drones,...st.pending])numeric(d,['x','y','z','vx','vy','vz','radius','delay','damage','born','ttl','baseY','phase','armT','power','life','t'],room+'.dynamic');
  }
  return true;
}

export function validateRuntimePlayer(p,playerId='player'){
  if(p.id!==playerId||p.team!==0)error('player identity/team');
  numeric(p,PLAYER_NUMBERS,'player');
  for(const k of ['alive','reloading','charging','forcedFire'])if(typeof p[k]!=='boolean')error('player.'+k);
  for(const k of ['iframes','dashBuffer','deadAnim','hitFlash','dashCharges','dashMax','heroSkillCdMax','mana','aimDist'])if(p[k]<0)error('player.'+k);
  vector(p.aim,'player.aim',{direction:true});vector(p.aimPoint,'player.aimPoint');vector(p.dashDir,'player.dashDir',{direction:true});vector(p.moveVec,'player.moveVec',{len:true});
  for(const k of ['items','actives','spareAttachments','doctrines'])if(!Array.isArray(p[k])||p[k].length>1000||p[k].some(x=>typeof x!=='string'))error('player.'+k);
  return true;
}
