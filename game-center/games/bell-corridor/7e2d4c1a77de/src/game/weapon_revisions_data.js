import { WEAPON_TEXT_REPAIRS } from './weapon_text_repair.js';
// v2 generated definitions remain immutable. Only current definitions use overlays.
export const WEAPON_REVISION_VERSION=3;
export const WEAPON_REVISIONS={
  plasma_repeater:{desc:'直观双相穿透：一发可穿透两个目标，第二次命中伤害减半。'},
  offset_duelist:{desc:'从敌人当前侧后方命中造成额外伤害；不需要先打标记或记录上一次面向。'},
  // 八项形态之一（合同见 docs/持续开发_2026-10-09/设计/武器近似玩法分组.md §ring_shot）。
  // 只加形态参数与描述，**不覆写弹匣/备弹/换弹**（合同要求原上限保持）。
  clap_mortar:{
    desc:WEAPON_TEXT_REPAIRS.clap_mortar.desc,
    form:'meteor',label:'天降陨石',damage:28,cost:1,cd:0.45,charge:0,warning:0.6,
    fall:0.2,duration:0.8,tick:0,radius:2.5,width:0,reflections:0,count:1,speed:0,
    range:14,deployTTL:0,projectileCap:2,beamCap:0,zoneCap:6,unitCap:0,manaCost:3,
  },
  line_scribe:{
    desc:WEAPON_TEXT_REPAIRS.line_scribe.desc,
    form:'multi_reflect_beam',label:'折线光束',damage:12,cost:1,cd:0.55,charge:0,
    duration:0.18,tick:0,radius:0,width:0.16,reflections:1,reflectionFalloff:0.8,
    count:1,speed:0,range:140,deployTTL:0,projectileCap:0,beamCap:6,zoneCap:0,unitCap:0,manaCost:6,
  },
  tandem_rail:{
    desc:'瞬时折线束：最多折墙三次，每折伤害衰减 20%，适合在柱群与拐角里打满。',
    form:'multi_reflect_beam',label:'折线光束',damage:10,cost:1,cd:0.75,charge:0,
    duration:0.18,tick:0,radius:0,width:0.18,reflections:3,reflectionFalloff:0.8,
    count:1,speed:0,range:140,deployTTL:0,projectileCap:0,beamCap:6,zoneCap:0,unitCap:0,manaCost:6,
  },
  door_frame:{
    desc:WEAPON_TEXT_REPAIRS.door_frame.desc,
    form:'multi_reflect_beam',label:'折线光束',damage:8,cost:1,cd:0.80,charge:0,
    duration:0.18,tick:0,radius:0,width:0.18,reflections:5,reflectionFalloff:0.8,
    count:1,speed:0,range:140,deployTTL:0,projectileCap:0,beamCap:6,zoneCap:0,unitCap:0,manaCost:6,
  },
  corner_prism:{
    desc:WEAPON_TEXT_REPAIRS.corner_prism.desc,
    form:'multi_reflect_beam',label:'多折光束',damage:10,cost:1,cd:0.75,charge:0,
    duration:0.18,tick:0,radius:0,width:0.18,reflections:3,reflectionFalloff:0.8,
    count:1,speed:0,range:140,deployTTL:0,projectileCap:0,beamCap:4,zoneCap:0,unitCap:0,manaCost:6,
  },
  kiln_ray:{
    desc:'长按预热后发射粗束：可慢转向持续照射，基础每 0.2 秒结算一次，松手强制冷却。',
    form:'heavy_sustained_beam',label:'重型持续束',damage:7,cost:2,cd:0.2,charge:0.35,
    duration:1.2,tick:0.2,radius:0,width:0.75,reflections:0,count:1,speed:0,range:16,
    deployTTL:0,turnRate:0.9,releaseCooldown:0.8,projectileCap:0,beamCap:1,zoneCap:0,unitCap:0,manaCost:2,
  },
  boomerang_fork:{
    desc:'左右双刃飞出，到程末端自动折返玩家当前位置，返程扫中敌人再造成一次次级伤害。',
    form:'auto_boomerang',label:'自动回旋双刃',damage:5,returnDamage:4,cost:1,cd:0.9,
    charge:0,duration:1.5,tick:0,radius:0.18,width:0,reflections:0,count:2,speed:22,
    range:12,deployTTL:0,spreadRadians:0.44,projectileCap:4,beamCap:0,zoneCap:0,unitCap:0,manaCost:6,
  },
  flywheel_vow:{
    desc:WEAPON_TEXT_REPAIRS.flywheel_vow.desc,
    form:'traveling_wave',label:'推进冲击波',damage:12,cost:3,cd:0.75,charge:0,
    duration:0.8333333333333334,tick:0,radius:0,width:4,thickness:0.4,reflections:0,
    count:1,speed:12,range:10,deployTTL:0,projectileCap:2,beamCap:0,zoneCap:0,unitCap:0,manaCost:6,
  },
  relay_carbine:{
    desc:'无炮时一扣召出一门跟随炮，8 发或 6 秒后消散；炮在场时持有者可按普通卡宾自射，不增加或刷新炮。',
    form:'following_turret',label:'一扣跟随炮',damage:4,cost:6,cd:0.8,charge:0,
    duration:6,tick:0.5,radius:0.13,width:0,reflections:0,count:1,speed:24,range:12,
    deployTTL:6,shots:8,followDistance:1.2,projectileCap:8,beamCap:0,zoneCap:0,unitCap:1,manaCost:8,
  },
  witness_pistol:{
    desc:'一扣打出横排五根平行钉：固定宽度、钉间留空隙，近处并排命中、远处缝隙可能漏小敌。',
    form:'parallel_nails',label:'平行钉排',damage:3,cost:1,cd:0.45,charge:0,
    duration:0.4166666666666667,tick:0,radius:0.12,width:2.4,reflections:0,count:5,
    speed:24,range:10,deployTTL:0,offsets:[-1.2,-0.6,0,0.6,1.2],
    projectileCap:10,beamCap:0,zoneCap:0,unitCap:0,manaCost:6,
  },
  ring_shot:{
    desc:'以角色为中心同时向十二方向发弹；近身解围，远处单体只吃相交方向。',
    form:'radial',label:'角色环射',damage:3,cost:1,cd:0.85,charge:0,
    duration:0.4444444444444444,tick:0,radius:0.14,width:0,reflections:0,
    count:12,speed:18,range:8,deployTTL:0,projectileCap:24,beamCap:0,
    zoneCap:0,unitCap:0,manaCost:6,
  },
};
export function revisedWeaponDefinition(def){
  const patch=WEAPON_REVISIONS[def.id];
  const current=patch?{...def,...patch,weaponAssetVersion:WEAPON_REVISION_VERSION}:def;
  const text=WEAPON_TEXT_REPAIRS[def.id];
  return text?{...current,...text}:current;
}
