import { weaponCapabilities } from '../build_effects.js';
// Runtime capability rules supplement the approved per-definition restrictions.
const RAYS=new Set(['laser_lance','kiln_ray','braid_light','prism_anchor','corner_prism','aegis_lance','hinge_beam','thread_beam','aperture_lamp','ember_seam']);
export function weaponAssetAttachmentCompatibility(def,attachmentId) {
  if(![2,3].includes(def?.weaponAssetVersion))return {ok:true};
  const id=def.sourceWeapon||def.id;
  if(def.weaponAssetVersion===3&&def.form){
    const need={heavy_barrel:['primary-damage','variable-rate'],cooling_fin:['variable-rate'],choke:['random-spread','projectile-speed'],long_barrel:['projectile-speed'],muzzle_brake:['random-spread','projectile-speed'],ricochet_plate:['wall-bounce'],phase_lining:['extra-pierce','projectile-speed'],micro_gyro:['projectile-speed'],arc_core:['hit-chain'],ember_core:['direct-primary-status'],frost_core:['direct-primary-status'],last_spring:['paid-primary-kill','magazine'],overpressure:['paid-primary-kill','magazine'],reclaim_mag:['paid-primary-kill','magazine']}[attachmentId];
    if(need&&need.some(c=>!weaponCapabilities(def).has(c)))return {ok:false,why:'这把武器无法使用该配件的全部效果'};
    return {ok:true};
  }
  if(['choke','long_barrel'].includes(attachmentId)&&['orb_sling','grenade_lobber','retrieval_saw','frost_tile','door_frame','boomerang_fork','skipping_stone','spiral_winch','mirror_slug','polygon_oath','return_post','orbit_guard','recall_censer'].includes(id))return {ok:false,why:'这把武器的弹道或引信时间固定，无法用该配件延长射程'};
  if(def.assetRestrictions?.includes(attachmentId))return {ok:false,why:'这把武器无法安装该配件'};
  if(['kiln_ray','braid_light','hinge_beam','thread_beam'].includes(id)&&attachmentId==='heavy_barrel')return {ok:false,why:'这把武器的射击间隔固定，无法安装重压枪管'};
  if(RAYS.has(id)&&['long_barrel','choke'].includes(attachmentId))return {ok:false,why:'该配件无法延长光束的射程'};
  if(['ring_satellite','spark_shuttle','pressure_mine','thunder_cask','grounding_rod','beacon_furnace'].includes(id)&&['long_barrel','choke'].includes(attachmentId))return {ok:false,why:'这把武器的轨道或部署时间固定，无法用该配件延长射程'};
  if(RAYS.has(id)&&['ricochet_plate','phase_lining','micro_gyro','arc_core'].includes(attachmentId))return {ok:false,why:'这把武器无法使用该配件的反弹、穿透、追踪或连锁效果'};
  if(['kiln_ray','braid_light','hinge_beam','thread_beam'].includes(id)&&attachmentId==='cooling_fin')return {ok:false,why:'这把武器的伤害间隔固定，冷却片无法提高射速'};
  if(['ring_satellite','spark_shuttle'].includes(id)&&['micro_gyro','phase_lining','ricochet_plate'].includes(attachmentId))return {ok:false,why:'固定轨道或指定双目标的轨迹不接受通用追踪、穿透或墙反弹'};
  if(id==='arc_coil'&&attachmentId==='arc_core')return {ok:false,why:'电弧线圈固定最多两次原生跳链，不叠加额外链数'};
  if(id==='prism_anchor'&&['last_spring','overpressure','choke','muzzle_brake','long_barrel'].includes(attachmentId))return {ok:false,why:'停摆棱镜的弹道固定，无法使用该配件的效果'};
  if(RAYS.has(id)&&['choke','muzzle_brake'].includes(attachmentId))return {ok:false,why:'该配件无法改变光束的散布或弹速'};
  return {ok:true};
}
