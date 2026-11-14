import { BUILD_ATTACHMENTS, BUILD_RELICS, BUILD_SYNERGIES } from './build_content_data.js';

export const BUILD_EFFECTS_VERSION = 2;
// Unit, destination and clamp belong to the source contract, rather than truthy merges.
const entry=(destination,min=-Infinity,max=Infinity,merge='add')=>Object.freeze({destination,min,max,merge});
export const BUILD_EFFECT_REGISTRY = Object.freeze({
  damage:entry('damage',.1,4), rate:entry('rate',.25,3), speed:Object.freeze({...entry('speed',.25,3),bySource:Object.freeze({attachment:entry('projectileSpeedDelta',-.75,2)})}),
  crit:entry('crit',0,1),critMul:entry('critMul',1,5),pierce:entry('pierce',0,6),bounce:entry('bounce',0,6),
  homing:entry('homing',0,3),explosive:entry('explosive',0,40),slow:entry('slow',0,.75,'max'),
  poison:entry('poison',0,6,'max'),burn:entry('burn',0,6,'max'),lifesteal:entry('lifesteal',0,1),
  maxHp:entry('maxHp',1,12),armor:entry('armor',0,5,'acquisition'),heal:entry('heal',0,12,'acquisition'),
  reload:entry('reloadMul',.25,3),magazine:entry('magazine',.25,3),pickup:entry('pickup',1,4),
  coins:entry('coins',.25,3),keys:entry('keyBonus',0,5),skillPower:entry('skillPower',.25,3),skillCd:entry('skillCd',.25,3),
  bulletSize:entry('bulletSize',.25,3),dashMax:entry('dashMax',1,4),dashCd:entry('dashCdMul',.25,3),
  thorns:entry('thorns',0,8),souls:entry('souls',0,100,'set'),regenArmor:entry('regenArmor',0,3),
  standstill:entry('standstill',0,.75),berserk:entry('berserk',0,.6),twin:entry('twin',0,1),
  critBoom:entry('critBoom',0,40,'max'),tesla:entry('tesla',0,1,'max'),drone:entry('droneCount',0,2),
  ammoMax:entry('ammoMaxMul',.25,3),ammoFind:entry('ammoFind',0,6.1),
  explosiveMul:entry('explosiveMul',.25,4),blastRadius:entry('blastRadius',.25,3),beamWidth:entry('beamWidth',.25,4),
  freezeChance:entry('freezeChance',0,1),chainPoison:entry('chainPoison',0,1,'max'),
  noSlow:entry('noBounceSlow',0,1,'flag'),burnLife:entry('burnLife',0,1,'max'),moveShoot:entry('moveShoot',0,1,'max'),
  soulsMul:entry('soulsMul',1,4,'max'),critBoomMul:entry('critBoomRadiusMul',1,3),teslaDamage:entry('teslaDamage',.25,3),
});
export const ATTACHMENT_EFFECT_REGISTRY=Object.freeze({...BUILD_EFFECT_REGISTRY,speed:entry('projectileSpeedDelta',-.75,2),spread:entry('spread',-.75,2),life:entry('life',-.75,2),chain:entry('chain',0,2),shake:entry('shake',0,3)});
export const BUILD_DEFINITIONS = Object.freeze({attachment:BUILD_ATTACHMENTS,relic:BUILD_RELICS,synergy:BUILD_SYNERGIES});
export function applyBuildModifiers(stats,mods={},source='relic') {
  if(!Object.hasOwn(BUILD_DEFINITIONS,source))throw Error('Unknown build source');
  for(const [key,value]of Object.entries(mods)){
    const rule=(source==='attachment'?ATTACHMENT_EFFECT_REGISTRY:BUILD_EFFECT_REGISTRY)[key];if(!rule||!Number.isFinite(value))throw Error(`Unknown/invalid ${source} effect ${key}`);
    if(rule.merge==='acquisition')continue;
    const current=stats[rule.destination]??(rule.min>=1?1:0);
    stats[rule.destination]=rule.merge==='max'?Math.max(current,value):rule.merge==='set'?value:rule.merge==='flag'?!!value:current+value;
  }
  return stats;
}
export function clampBuildStats(stats){
  for(const rule of Object.values(BUILD_EFFECT_REGISTRY))if(rule.merge!=='acquisition'&&typeof stats[rule.destination]==='number')stats[rule.destination]=Math.max(rule.min,Math.min(rule.max,stats[rule.destination]));
  return stats;
}
const BEAMS=new Set(['laser_lance','kiln_ray','braid_light','prism_anchor','corner_prism','aegis_lance','hinge_beam','thread_beam','aperture_lamp']);
const FIXED=new Set(['kiln_ray','braid_light','hinge_beam','thread_beam']);
const FIXED_PATH=new Set(['ring_satellite','spark_shuttle']);
const DEPLOY=new Set(['prism_anchor','beacon_furnace','pressure_mine','thunder_cask','grounding_rod']);
// These are consumers, not tags or the old ID's attack type. V3 fixed shapes
// explicitly reject projectile alterations that their serialized form never reads.
const V3_CAPS = Object.freeze({
  radial:['direct-primary','direct-primary-status','primary-damage','paid-primary-kill','magazine','variable-rate','hit-chain'],
  parallel_nails:['direct-primary','direct-primary-status','primary-damage','paid-primary-kill','magazine','variable-rate','hit-chain'],
  auto_boomerang:['direct-primary','direct-primary-status','primary-damage','paid-primary-kill','magazine','variable-rate'],
  multi_reflect_beam:['direct-primary','direct-primary-status','primary-damage','paid-primary-kill','magazine','variable-rate'],
  heavy_sustained_beam:['direct-primary','direct-primary-status','primary-damage','paid-primary-kill','magazine'],
  meteor:['primary-damage','magazine','variable-rate'],
  traveling_wave:['direct-primary','direct-primary-status','primary-damage','paid-primary-kill','magazine','variable-rate'],
  following_turret:['magazine','variable-rate'],
});
export function weaponCapabilities(def){
  if(def?.weaponAssetVersion===3&&def.form)return new Set([...(V3_CAPS[def.form]||[]),...(def.ammoType&&def.ammoMax>0?['finite-reserve']:[])]);
  const id=def?.sourceWeapon||def?.id,ray=BEAMS.has(id)||def?.special==='beam',fixed=FIXED.has(id),deploy=DEPLOY.has(id);
  return new Set([
    ...(!deploy?['direct-primary','direct-primary-status','primary-damage','paid-primary-kill']:[]),
    ...(def?.mag>0?['magazine']:[]),...(!fixed?['variable-rate']:[]),
    ...(!ray&&!deploy?['projectile-speed']:[]),
    ...(!ray&&!deploy&&!FIXED_PATH.has(id)?['wall-bounce','extra-pierce','hit-chain']:[]),
    ...(!ray&&!deploy&&(def?.spread>0||id==='smg_hornet')?['random-spread']:[]),
    ...(def?.ammoType?['finite-reserve']:[]),
  ]);
}
export function buildAttachmentCompatibility(def,id){
  const item=BUILD_ATTACHMENTS.find(a=>a.id===id);if(!item)return {ok:true};
  const caps=weaponCapabilities(def),missing=item.requiredCapabilities.filter(c=>!caps.has(c));
  return missing.length?{ok:false,why:`当前形态不支持：${missing.join('、')}`}:{ok:true};
}
export function synergyMatches(sy,player){
  if(sy.buildVersion===2&&(sy.requiredCapabilities||[]).some(c=>!weaponCapabilities(player.weapon?.def).has(c)))return false;
  const tags=new Set(sy.buildVersion===2?(player.weapon?.def.tags||[]):player.weapons.flatMap(w=>w.def.tags||[]));
  return sy.req.every(r=>(!r.item||player.items.includes(r.item))&&(!r.tag||tags.has(r.tag)));
}
export function buildShotContext(player,weapon,attachments={},secondary=false){
  const s=player.stats||{},ids=new Set((s.synergies||[]).map(x=>x.id)),tags=weapon.def.tags||[];
  return {version:2,relicLifesteal:s.lifesteal||0,lifesteal:Math.min(1,Math.max(0,(s.lifesteal||0)+(secondary?0:attachments.lifesteal||0))),
    burnLife:!!s.burnLife,soulNeed:s.souls,soulsMul:ids.has('reaper')?2:1,chainSoulsMul:ids.has('arc_harvest')?2:1,
    chainPoison:!!s.chainPoison,noBounceSlow:!!s.noBounceSlow,bounceDouble:ids.has('blade_storm'),
    freezeHits:ids.has('absolute_zero')&&tags.includes('rapid')?3:0,
    forceFreeze:ids.has('cold_steel')&&tags.includes('single')||ids.has('frost_edge')&&tags.includes('beam'),
    critBoom:s.critBoom,critBoomRadiusMul:s.critBoomRadiusMul||1,critBoomDamageMul:s.explosiveMul||1,
    sourceInstanceId:weapon.assetInstanceId||null,secondary};
}

// Optional on historical paid shots; if present it must be a bounded v2 snapshot.
export function validateBuildContext(c,owner){
  if(c===undefined||c===null)return true;
  const bounds={lifesteal:[0,1],relicLifesteal:[0,1],soulNeed:[0,100],soulsMul:[1,4],chainSoulsMul:[1,4],freezeHits:[0,3],critBoom:[0,40],critBoomRadiusMul:[1,3],critBoomDamageMul:[.25,4]};
  if(!c||c.version!==2||c.sourceInstanceId!==null&&c.sourceInstanceId!==owner)throw Error('Invalid build shot identity');
  for(const [k,[min,max]]of Object.entries(bounds))if(c[k]!==undefined&&(!Number.isFinite(c[k])||c[k]<min||c[k]>max))throw Error('Invalid build shot value '+k);
  for(const k of ['burnLife','chainPoison','noBounceSlow','bounceDouble','forceFreeze','secondary'])if(typeof c[k]!=='boolean')throw Error('Invalid build shot flag '+k);
  return true;
}
