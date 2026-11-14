import { e2Copy } from './text_e2_data.js';
// ============================================================
//  武器改装 / Attachment System（任务书 §14–§20 / §40 / §49）
//
//  四层关系必须保持清楚（§40）：
//    Weapon      —— 我用什么射击
//    Attachment  —— **这把具体的枪**怎样变化
//    Relic       —— 我的角色规则发生什么变化
//    Synergy     —— 多个系统组合以后产生什么质变
//
//  所以本文件里的东西**一律挂在武器实例上**，不进入 player.stats。
//
//  设计约束：
//  · 普通角色 2 个槽、铸枪师 3 个（槽位数由 hero.attachSlots 决定，见 §16）
//  · **同一槽类型不能重复** —— 目标是形成选择，不是把 8 个配件堆在一把枪上
//  · 第一版只做 14 个，且**每一个都必须真的有效果**（不做"只写数据"的配件）
// ============================================================
import * as THREE from '../../vendor/three.module.js';
import { BUILD_ATTACHMENTS } from './build_content_data.js';
import { buildAttachmentCompatibility, applyBuildModifiers } from './build_effects.js';
import { weaponAssetAttachmentCompatibility } from './weapon_assets/attachment_rules.js';
import { MICRO_GYRO, trackingDescription } from './tracking.js';
import { boxGeo, cylGeo, torusGeo, getMaterial } from '../art/materials.js';

// 槽类型：枪管 / 弹仓 / 核心 / 结构
export const SLOTS = ['barrel', 'mag', 'core', 'struct'];
export const SLOT_CN = { barrel: '枪管', mag: '弹仓', core: '核心', struct: '结构' };

// mods 的键与 player 的武器计算对齐：
//   damage/rate/spread/life/speed/pierce/bounce/homing 为"增量"（乘区用小数、加法用整数）
//   burn/slow/chain 直接写进弹丸状态
export const ATTACHMENTS = [
  ...BUILD_ATTACHMENTS,
  // ---------------- 枪管 ----------------
  { id: 'heavy_barrel', cn: '重压枪管', slot: 'barrel', mats: ['barrel'],
    desc: '伤害 +35%，射速 -18%，镜头震动增强', mods: { damage: 0.35, rate: -0.18, shake: 0.6 } },
  { id: 'choke', cn: '收束器', slot: 'barrel', mats: ['muzzle'],
    desc: '散布 -40%，弹丸存活 +25%', mods: { spread: -0.40, life: 0.25 } },
  { id: 'muzzle_brake', cn: '制退器', slot: 'barrel', mats: ['muzzle'],
    desc: '散布 -25%，弹速 +15%', mods: { spread: -0.25, speed: 0.15 } },
  { id: 'long_barrel', cn: '长管套件', slot: 'barrel', mats: ['barrel', 'muzzle'],
    desc: '弹速 +30%，伤害 +10%；飞行时长加成 +35%（部分武器按射程加成处理，实际距离随机制变化）', mods: { speed: 0.30, life: 0.35, damage: 0.10 } },

  // ---------------- 弹仓 ----------------
  { id: 'last_spring', cn: '最后一发弹簧', slot: 'mag', mats: ['mag'], mech: 'lastShot',
    desc: '弹匣最后一发伤害 ×2.2' },
  { id: 'reclaim_mag', cn: '回收弹仓', slot: 'mag', mats: ['mag'], mech: 'reclaim',
    desc: '合格击杀有 30% 概率返还 1 弹入匣，法术返还 1 法力；次级伤害不触发，同次攻击返还不超过实付资源' },
  { id: 'overpressure', cn: '过压弹仓', slot: 'mag', mats: ['mag'], mech: 'afterReload',
    desc: '装填完成后的前 3 发伤害 +40%' },

  // ---------------- 核心 ----------------
  { id: 'ember_core', cn: '余烬核心', slot: 'core', color: '#ff7a2e', mats: ['core'],
    desc: '弹丸附带燃烧', mods: { burn: 2 } },
  { id: 'frost_core', cn: '冷凝核心', slot: 'core', color: '#8ad8ff', mats: ['core'],
    desc: '弹丸附带冰霜（大幅减速）', mods: { slow: 0.35 } },
  { id: 'arc_core', cn: '电弧核心', slot: 'core', color: '#c07af0', mats: ['core'],
    desc: '连续命中触发弱电弧连锁', mods: { chain: 1 } },

  // ---------------- 结构 ----------------
  { id: 'ricochet_plate', cn: '跳弹板', slot: 'struct', mats: ['plate'],
    desc: '弹射 +1', mods: { bounce: 1 } },
  { id: 'phase_lining', cn: '相位衬层', slot: 'struct', mats: ['plate'],
    desc: '穿透 +1，但弹速 -12%', mods: { pierce: 1, speed: -0.12 } },
  { id: 'micro_gyro', cn: MICRO_GYRO.name, slot: 'struct', mats: ['ring'],
    desc: trackingDescription(MICRO_GYRO.strength).description, mods: { homing: MICRO_GYRO.strength } },
  { id: 'cooling_fin', cn: '冷却片', slot: 'struct', mats: ['fin'],
    desc: '射速 +22%', mods: { rate: 0.22 } },
].map(o => e2Copy('attachment', o));

export const ATTACH_MAP = Object.fromEntries(ATTACHMENTS.map((a) => [a.id, a]));
export function attachById(id) { return ATTACH_MAP[id] || null; }

// 汇总一把枪上所有配件的效果。
// 返回的是一份**只对该武器生效**的增量表（绝不写进 player.stats）。
export function attachMods(list) {
  const m = {
    damage: 0, rate: 0, spread: 0, life: 0, speed: 0, pierce: 0, bounce: 0, homing: 0,
    burn: 0, slow: 0, chain: 0, shake: 0,
  };
  const mechs = {};
  for (const id of (list || [])) {
    const a = ATTACH_MAP[id];
    if (!a) continue;
    if(a.mods)applyBuildModifiers(m,a.mods,'attachment');
    if (a.mech) mechs[a.mech] = true;
  }
  m.speed=m.projectileSpeedDelta||0;
  // Record the source before Player's overclock changes its effective strength.
  m.correctionOnly = (list || []).includes('micro_gyro') && !(list || []).some(id => id !== 'micro_gyro' && ATTACH_MAP[id]?.mods?.homing > 0);
  m.mechs = mechs;
  return m;
}

// 能不能装：① 槽位没满 ② 同槽类型不重复 ③ 没装过同一个
// allowSameSlot：铸枪师"高级配件兼容性略高"（§21.1）—— 允许重复一个槽类型。
// 仍然受槽位总数限制，所以不会退化成"无脑堆叠"。
export function canInstall(list, attId, slotCount, allowSameSlot = false, weaponDef = null) {
  return attachmentCompatibility(weaponDef, attId, { installed:list, slotCount, allowSameSlot });
}

// Pure query for build cards, drag/drop and Player.installAttachment. No inventory mutation.
export function attachmentCompatibility(weaponDef, attId, { installed=[], slotCount=2, allowSameSlot=false } = {}) {
  const result=checkInstall(installed,attId,slotCount,allowSameSlot,weaponDef);
  return {...result, code:result.ok?'compatible':result.code||'installation-rule', attachmentId:attId,
    weaponId:weaponDef?.sourceWeapon||weaponDef?.id||null, tracking:trackingDescription(ATTACH_MAP[attId]?.mods?.homing||0)};
}
function checkInstall(list, attId, slotCount, allowSameSlot, weaponDef) {
  const a = ATTACH_MAP[attId];
  if (!a) return { ok: false, why: '未知配件' };
  if(attId==='micro_gyro'&&weaponDef){
    if(weaponDef.cls==='sniper'||weaponDef.tags?.includes('precise'))return {ok:false,code:'manual-precision',why:'精准枪保留手动瞄准，不接受自动弹道微调'};
    if(weaponDef.form)return {ok:false,code:'fixed-form',why:'这种武器的弹道固定，无法安装弹道微调环'};
    if(weaponDef.special==='beam'||weaponDef.special==='flame')return {ok:false,code:'no-projectile-steering',why:'光束或火焰没有可转向弹丸'};
    if(weaponDef.assetRestrictions?.includes(attId))return {ok:false,code:'definition-restriction',why:'这把枪保留固定或精确弹道，不接受自动弹道微调'};
  }
  const buildCapability=buildAttachmentCompatibility(weaponDef,attId);if(!buildCapability.ok)return buildCapability;
  const capability=weaponAssetAttachmentCompatibility(weaponDef,attId);if(!capability.ok)return capability;
  if (weaponDef?.assetRestrictions?.includes(attId)) return {ok:false,why:'这把武器无法安装该配件'};
  const cur = list || [];
  if (cur.includes(attId)) return { ok: false, why: '已经装在这把枪上了' };
  const conflict = cur.find(id => a.conflicts?.includes(id) || ATTACH_MAP[id]?.conflicts?.includes(attId));
  if (conflict) return { ok: false, why: `无法与${ATTACH_MAP[conflict]?.cn || conflict}同时安装` };
  if (cur.length >= slotCount) return { ok: false, why: `没有空槽（${cur.length}/${slotCount}）` };
  if (!allowSameSlot && cur.some((id) => ATTACH_MAP[id] && ATTACH_MAP[id].slot === a.slot)) {
    return { ok: false, why: `已经装了${SLOT_CN[a.slot]}类配件` };
  }
  return { ok: true, why: '' };
}

// 把配件装成**看得见的东西**（§19）：不能只在数据里装配件。
// 玩家应该能一眼看出"这把枪已经改过"。
// 与 §56 的性能边界一致：只复用共享几何 + 缓存材质，不新增 BufferGeometry。
export function attachGunParts(gunObj, list) {
  if (!gunObj) return;
  const ids = list || [];
  // 每次重装都先清掉旧零件（避免重复堆叠或残留）
  for (const name of ['p_barrel', 'p_muzzle', 'p_mag', 'p_core', 'p_plate', 'p_ring', 'p_fin']) {
    const old = gunObj.getObjectByName(name);
    if (old) gunObj.remove(old);
  }
  const dark = getMaterial('#2a3036', { metalness: 0.6, roughness: 0.5, flat: true });
  const steel = getMaterial('#5a626c', { metalness: 0.75, roughness: 0.42, flat: true });
  const brass = getMaterial('#8a6a2a', { metalness: 0.78, roughness: 0.36, flat: true });
  const mk = (name, geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.name = name;
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    gunObj.add(m);
    return m;
  };
  for (const id of ids) {
    const a = ATTACH_MAP[id];
    if (!a || !a.mats) continue;
    if (a.mats.includes('barrel') && !gunObj.getObjectByName('p_barrel')) {
      // 枪管套件：加粗并前伸
      mk('p_barrel', cylGeo(0.055, 0.05, 0.46, 6), steel, 0, 0.01, 0.34, Math.PI / 2, 0, 0);
    }
    if (a.mats.includes('muzzle') && !gunObj.getObjectByName('p_muzzle')) {
      mk('p_muzzle', cylGeo(0.075, 0.065, 0.12, 6), brass, 0, 0.01, 0.56, Math.PI / 2, 0, 0);
    }
    if (a.mats.includes('mag') && !gunObj.getObjectByName('p_mag')) {
      mk('p_mag', boxGeo(0.11, 0.22, 0.14), steel, 0, -0.16, 0.02);
    }
    if (a.mats.includes('core') && !gunObj.getObjectByName('p_core')) {
      const col = a.color || '#ff7a2e';
      mk('p_core', cylGeo(0.06, 0.06, 0.10, 6), getMaterial(col, { emissive: col, emissiveIntensity: 2.4, flat: true }), 0, 0.09, 0.10);
    }
    if (a.mats.includes('plate') && !gunObj.getObjectByName('p_plate')) {
      mk('p_plate', boxGeo(0.10, 0.05, 0.30), dark, 0.09, 0.02, 0.06);
    }
    if (a.mats.includes('ring') && !gunObj.getObjectByName('p_ring')) {
      mk('p_ring', torusGeo(0.085, 0.018, 3, 12), brass, 0, 0.02, 0.16, 0, 0, 0);
    }
    if (a.mats.includes('fin') && !gunObj.getObjectByName('p_fin')) {
      for (let i = 0; i < 3; i++) {
        mk('p_fin', boxGeo(0.02, 0.07, 0.10), steel, -0.06, 0.08, 0.02 + i * 0.09);
      }
    }
  }
}
