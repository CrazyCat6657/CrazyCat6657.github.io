import { e2Copy } from './text_e2_data.js';
import {revisedWeaponDefinition} from './weapon_revisions_data.js';
import { trackingDescription } from './tracking.js';
import { BUILD_RELICS, BUILD_SYNERGIES } from './build_content_data.js';
// ============================================================
//  游戏数据表：武器 / 被动 / 主动技能 / 协同 / 敌人 / 关卡内容
// ============================================================

// ---------------- 武器 ----------------
// special: null|'beam'|'flame'|'chain'|'charge'|'arc'|'spinup'|'burst'
import { ASSET_WEAPON_DEFINITIONS } from './weapon_assets_data.js';
import { ENABLED_ASSET_IDS } from './weapon_assets_enabled.js';

export const LEGACY_WEAPONS = [
  {
    id: 'pistol_rusty', cn: '锈蚀手枪', en: 'Pitted Sidearm', tier: 1, cls: 'pistol', model: 'pistol',
    damage: 4.6, rate: 3.4, pellets: 1, spread: 2.0, speed: 30, mag: 12, reload: 0.95, auto: false,
    pierce: 0, bounce: 0, explosive: 0, homing: 0, size: 0.20, life: 1.6, color: '#ffd27a', shake: 0.05,
    knock: 1.2, sfx: 'pistol', desc: '可靠的老伙计，弹药无限。', tags: ['gun', 'basic'],
  },
  {
    id: 'pistol_heavy', cn: '重锤手枪', en: 'Heavy Sidearm', tier: 2, cls: 'pistol', model: 'pistol',
    damage: 7.8, rate: 2.5, pellets: 1, spread: 1.6, speed: 32, mag: 8, reload: 1.15, auto: false,
    pierce: 0, bounce: 0, explosive: 0, homing: 0, size: 0.24, life: 1.7, color: '#ff9a3c', shake: 0.10,
    knock: 2.2, sfx: 'pistol', desc: '一击沉重，弹容偏小。', tags: ['gun', 'basic'],
  },
  {
    id: 'smg_hornet', cn: '蜂刺冲锋枪', en: 'Hornet SMG', tier: 1, cls: 'smg', model: 'smg',
    damage: 2.7, rate: 9.5, pellets: 1, spread: 7.5, speed: 27, mag: 34, reload: 1.55, auto: true,
    pierce: 0, bounce: 0, explosive: 0, homing: 0, size: 0.16, life: 1.3, color: '#fff0a0', shake: 0.035,
    knock: 0.6, sfx: 'smg', desc: '泼洒弹雨，精度换射速。', tags: ['gun', 'rapid'],
  },
  {
    id: 'rifle_carbine', cn: '游侠卡宾枪', en: 'Ranger Carbine', tier: 2, cls: 'rifle', model: 'rifle',
    damage: 4.8, rate: 5.2, pellets: 1, spread: 4.0, speed: 34, mag: 26, reload: 1.45, auto: true,
    pierce: 0, bounce: 0, explosive: 0, homing: 0, size: 0.19, life: 1.8, color: '#9fe8ff', shake: 0.05,
    knock: 1.0, sfx: 'rifle', desc: '全能型中距离主力。', tags: ['gun', 'rapid'],
  },
  {
    id: 'shotgun_sapper', cn: '工兵霰弹枪', en: 'Sapper Shotgun', tier: 1, cls: 'shotgun', model: 'shotgun',
    damage: 3.6, rate: 1.45, pellets: 8, spread: 17, speed: 24, mag: 6, reload: 1.95, auto: false,
    pierce: 0, bounce: 0, explosive: 0, homing: 0, size: 0.19, life: 0.85, color: '#ffb347', shake: 0.22,
    knock: 3.0, sfx: 'shotgun', desc: '贴脸毁灭，远处无力。', tags: ['gun', 'spread', 'close'],
  },
  {
    id: 'shotgun_dragon', cn: '龙息霰弹枪', en: 'Dragonbreath', tier: 3, cls: 'shotgun', model: 'shotgun',
    damage: 3.1, rate: 1.7, pellets: 7, spread: 15, speed: 22, mag: 6, reload: 1.9, auto: false,
    pierce: 0, bounce: 0, explosive: 0, homing: 0, size: 0.26, life: 0.7, color: '#ff5a10', shake: 0.24,
    knock: 2.6, sfx: 'shotgun', burn: 3.2, desc: '弹丸附带灼烧，持续燃烧。', tags: ['gun', 'spread', 'fire'],
  },
  {
    id: 'sniper_rail', cn: '磁轨狙击枪', en: 'Railshot', tier: 3, cls: 'sniper', model: 'sniper',
    damage: 27, rate: 0.85, pellets: 1, spread: 0.4, speed: 70, mag: 1, reload: 1.75, auto: false,
    pierce: 6, bounce: 0, explosive: 0, homing: 0, size: 0.22, life: 2.4, color: '#8af0ff', shake: 0.35,
    knock: 4.0, sfx: 'sniper', desc: '贯穿一整排敌人的电磁长钉。', tags: ['gun', 'pierce', 'single'],
  },
  {
    id: 'rocket_hammer', cn: '铁锤火箭筒', en: 'Sledge Rocket', tier: 3, cls: 'rocket', model: 'rocket',
    damage: 16, rate: 0.72, pellets: 1, spread: 2, speed: 21, mag: 2, reload: 2.5, auto: false,
    pierce: 0, bounce: 0, explosive: 34, homing: 0, size: 0.34, life: 3.2, color: '#ff8a2a', shake: 0.42,
    knock: 6.0, sfx: 'rocket', ammoType: 'rocket', ammoMax: 16, ammoPickup: 4, desc: '大范围爆炸，注意自伤。', tags: ['gun', 'explosive', 'heavy'],
  },
  {
    id: 'grenade_lobber', cn: '榴弹抛射器', en: 'Lobber', tier: 2, cls: 'launcher', model: 'grenade',
    damage: 8, rate: 1.25, pellets: 1, spread: 3, speed: 17, mag: 5, reload: 2.0, auto: false,
    pierce: 0, bounce: 0, explosive: 24, homing: 0, size: 0.30, life: 3.0, color: '#9dff5a', shake: 0.3,
    knock: 4.5, sfx: 'grenade', special: 'arc', ammoType: 'rocket', ammoMax: 26, ammoPickup: 6,
    desc: '抛物线弹道，撞墙反弹后引爆。', tags: ['gun', 'explosive'],
  },
  {
    id: 'minigun_shredder', cn: '撕裂者转轮机枪', en: 'Shredder', tier: 4, cls: 'minigun', model: 'minigun',
    damage: 2.32, rate: 15, pellets: 1, spread: 9, speed: 30, mag: 140, reload: 3.4, auto: true,
    pierce: 0, bounce: 0, explosive: 0, homing: 0, size: 0.17, life: 1.4, color: '#ffcf6a', shake: 0.05,
    knock: 0.5, sfx: 'smg', special: 'spinup', spinTime: 0.55, desc: '需要预热，预热后是金属风暴。', tags: ['gun', 'rapid', 'heavy'],
  },
  {
    id: 'laser_lance', cn: '光矛步枪', en: 'Lance Laser', tier: 3, cls: 'energy', model: 'laser',
    damage: 8, rate: 3.2, pellets: 1, spread: 0.6, speed: 90, mag: 20, reload: 1.7, auto: true,
    pierce: 99, bounce: 0, explosive: 0, homing: 0, size: 0.16, life: 0.5, color: '#3ad2ff', shake: 0.09,
    knock: 1.6, sfx: 'laser', special: 'beam', ammoType: 'energy', ammoMax: 999, desc: '瞬发贯穿光束，无视大部分掩体。', tags: ['energy', 'pierce', 'beam'],
  },
  {
    id: 'plasma_repeater', cn: '等离子连发枪', en: 'Plasma Repeater', tier: 2, cls: 'energy', model: 'plasma',
    damage: 4.32, rate: 6.2, pellets: 1, spread: 4, speed: 26, mag: 22, reload: 1.5, auto: true,
    pierce: 1, bounce: 0, explosive: 0, homing: 0, size: 0.26, life: 1.8, color: '#c07af0', shake: 0.07,
    knock: 1.4, sfx: 'plasma', desc: '紫色等离子团，轻微穿透。', tags: ['energy'],
  },
  {
    id: 'gauss_lancer', cn: '磁暴长枪', en: 'Gauss Lancer', tier: 3, cls: 'energy', model: 'gauss',
    damage: 16, rate: 1.7, pellets: 1, spread: 1.2, speed: 52, mag: 5, reload: 2.15, auto: false,
    pierce: 4, bounce: 0, explosive: 0, homing: 0, size: 0.26, life: 2.2, color: '#5ad8ff', shake: 0.30,
    knock: 4.5, sfx: 'gauss', desc: '蓄力电磁弹，穿透多个目标。', tags: ['energy', 'pierce'],
  },
  {
    id: 'flame_belcher', cn: '烈焰喷洒器', en: 'Belcher', tier: 2, cls: 'flame', model: 'flame',
    damage: 1.5, rate: 20, pellets: 1, spread: 22, speed: 13, mag: 110, reload: 2.6, auto: true,
    pierce: 99, bounce: 0, explosive: 0, homing: 0, size: 0.42, life: 0.30, color: '#ff7a1a', shake: 0.04,
    knock: 0.2, sfx: 'flame', special: 'flame', burn: 2.0, desc: '短距离火舌，点燃一切。', tags: ['fire', 'close', 'spread'],
  },
  {
    id: 'orb_sling', cn: '虚空球座', en: 'Void Sling', tier: 3, cls: 'energy', model: 'orb',
    damage: 9, rate: 1.6, pellets: 1, spread: 3, speed: 13, mag: 12, reload: 1.8, auto: false,
    pierce: 0, bounce: 0, explosive: 12, homing: 2.4, size: 0.36, life: 3.4, color: '#7affd2', shake: 0.18,
    knock: 3.2, sfx: 'orb', desc: '缓慢追踪的虚空球，命中后引爆。', tags: ['energy', 'homing', 'explosive'],
  },
  {
    id: 'charge_nova', cn: '聚能新星炮', en: 'Nova Cannon', tier: 4, cls: 'energy', model: 'charge',
    damage: 14, rate: 0.85, pellets: 1, spread: 1.2, speed: 24, mag: 6, reload: 2.3, auto: false,
    pierce: 2, bounce: 0, explosive: 22, homing: 0, size: 0.34, life: 2.6, color: '#ffd06a', shake: 0.34,
    knock: 5.5, sfx: 'charge', special: 'charge', chargeTime: 0.85, chargeMul: 4.2,
    desc: '按住蓄力，蓄满后释放毁灭新星。', tags: ['energy', 'explosive', 'charge'],
  },
  {
    id: 'shuriken_launcher', cn: '风刃发射器', en: 'Gale Shuriken', tier: 2, cls: 'special', model: 'shuriken',
    damage: 4.16, rate: 4.4, pellets: 1, spread: 6, speed: 26, mag: 18, reload: 1.4, auto: true,
    pierce: 0, bounce: 5, speedRetain: 0.92, homing: 0, size: 0.24, life: 4.0, color: '#b8f0ff', shake: 0.06,
    knock: 1.0, sfx: 'pistol', desc: '会在墙壁上反复弹射的锋刃。', tags: ['gun', 'bounce'],
  },
  {
    id: 'arc_coil', cn: '电弧线圈', en: 'Arc Coil', tier: 3, cls: 'energy', model: 'plasma',
    damage: 7, rate: 2.6, pellets: 1, spread: 3, speed: 40, mag: 14, reload: 1.6, auto: true,
    pierce: 0, bounce: 0, explosive: 0, homing: 0, size: 0.2, life: 1.4, color: '#a0f0ff', shake: 0.08,
    knock: 1.0, sfx: 'energy', special: 'chain', chainCount: 4, chainRange: 7,
    desc: '命中后电弧跳跃到附近敌人。', tags: ['energy', 'chain'],
  },
  {
    id: 'burst_triple', cn: '三叉连发枪', en: 'Trident Burst', tier: 2, cls: 'pistol', model: 'smg',
    damage: 4.4, rate: 3.6, pellets: 1, spread: 3, speed: 30, mag: 21, reload: 1.35, auto: true,
    pierce: 0, bounce: 0, explosive: 0, homing: 0, size: 0.18, life: 1.6, color: '#ffe08a', shake: 0.06,
    knock: 1.0, sfx: 'rifle', special: 'burst', burstCount: 3, burstGap: 0.055,
    desc: '一次扣动三连发，覆盖扇形。', tags: ['gun', 'rapid'],
  },
  {
    id: 'spike_nailer', cn: '穿甲钉枪', en: 'Spike Nailer', tier: 2, cls: 'special', model: 'gauss',
    damage: 6.8, rate: 2.9, pellets: 1, spread: 2.5, speed: 44, mag: 10, reload: 1.5, auto: true,
    pierce: 3, bounce: 1, explosive: 0, homing: 0, size: 0.17, life: 2.0, color: '#ffd0a0', shake: 0.10,
    knock: 2.4, sfx: 'sniper', desc: '高速钢钉，穿透并弹跳。', tags: ['gun', 'pierce'],
  },
  {
    id: 'tox_sprayer', cn: '酸液喷洒器', en: 'Tox Sprayer', tier: 3, cls: 'flame', model: 'flame',
    damage: 2.2, rate: 11, pellets: 1, spread: 18, speed: 15, mag: 70, reload: 2.2, auto: true,
    pierce: 99, bounce: 0, explosive: 0, homing: 0, size: 0.36, life: 0.5, color: '#9dff5a', shake: 0.04,
    knock: 0.3, sfx: 'flame', special: 'flame', poison: 3.0, desc: '腐蚀性酸雾，持续中毒。', tags: ['poison', 'close', 'spread'],
  },
  {
    id: 'crystal_caster', cn: '晶簇法杖', en: 'Prism Staff', tier: 3, cls: 'special', model: 'staff',
    damage: 6.5, rate: 2.4, pellets: 3, spread: 11, speed: 24, mag: 12, reload: 1.7, auto: false,
    pierce: 1, bounce: 2, explosive: 0, homing: 0, size: 0.26, life: 2.4, color: '#7affd2', shake: 0.10,
    knock: 1.2, sfx: 'energy', desc: '散射晶体，弹跳穿透。', tags: ['energy', 'spread', 'bounce'],
  },
  // ---- V2.0 新增（质量优先：每把都改变打法）----
  {
    id: 'pyroclast', cn: '火成碎屑炮', en: 'Pyroclast', tier: 3, cls: 'shotgun', model: 'pyroclast',
    damage: 3.4, rate: 1.55, pellets: 9, spread: 16, speed: 23, mag: 5, reload: 2.0, auto: false,
    pierce: 0, bounce: 0, explosive: 13, homing: 0, size: 0.24, life: 1.1, color: '#ff7a1a', shake: 0.26,
    knock: 3.2, sfx: 'shotgun', burn: 2.6, ammoType: 'rocket', ammoMax: 20, ammoPickup: 5,
    desc: '贴脸轰出九颗爆裂熔渣，命中即爆并点燃。', tags: ['gun', 'spread', 'explosive', 'fire', 'close'],
  },
  {
    id: 'void_ripper', cn: '虚空撕裂者', en: 'Void Ripper', tier: 4, cls: 'energy', model: 'void_ripper',
    damage: 11, rate: 1.9, pellets: 1, spread: 3, speed: 18, mag: 10, reload: 2.05, auto: true,
    pierce: 0, bounce: 0, explosive: 20, homing: 3.0, size: 0.34, life: 3.6, color: '#b07aff', shake: 0.16,
    knock: 3.4, sfx: 'orb', ammoType: 'energy', ammoMax: 999,
    desc: '自行追猎的虚空裂球，命中后撕开小范围内爆。', tags: ['energy', 'homing', 'explosive'],
  },
  {
    id: 'aegis_lance', cn: '神盾长矛', en: 'Aegis Lance', tier: 4, cls: 'energy', model: 'aegis_lance',
    damage: 13, rate: 2.6, pellets: 1, spread: 0.3, speed: 110, mag: 16, reload: 1.6, auto: true,
    pierce: 99, bounce: 0, explosive: 0, homing: 0, size: 0.20, life: 0.6, color: '#8affd0', shake: 0.11,
    knock: 2.0, sfx: 'laser', special: 'beam', ammoType: 'energy', ammoMax: 999,
    desc: '贯穿一切的光矛，射程内不衰减。', tags: ['energy', 'pierce', 'beam'],
  },
];

export const LEGACY_WEAPON_MAP = Object.fromEntries(LEGACY_WEAPONS.map((w) => [w.id, w]));
// Original native v1 from freeze-2026-10-11. Historical restore only; adding it
// to LEGACY_WEAPONS would also enlarge the current new-generation catalog.
export const ARCHIVED_NATIVE_WEAPON_MAP = {
  storm_battery: {
    id: 'storm_battery', cn: '风暴电池', en: 'Storm Battery', tier: 4, cls: 'energy', model: 'storm_battery',
    damage: 6.2, rate: 3.4, pellets: 1, spread: 4.5, speed: 44, mag: 24, reload: 1.9, auto: true,
    pierce: 0, bounce: 0, explosive: 0, homing: 0, size: 0.22, life: 1.8, color: '#a0f0ff', shake: 0.10,
    knock: 1.2, sfx: 'energy', special: 'chain', chainCount: 6, chainRange: 8.5, ammoType: 'energy', ammoMax: 999,
    desc: '每次命中都会向 6 个目标跳跃，场上敌人越多越强。', tags: ['energy', 'chain'],
  },
};
export const V2_WEAPON_MAP = Object.fromEntries(ASSET_WEAPON_DEFINITIONS.map(w=>[w.id,w]));
const assetMap = Object.fromEntries(ASSET_WEAPON_DEFINITIONS.map(w=>[w.id,revisedWeaponDefinition(w)]));
// Installed historical definitions are distinct from the new-generation catalog.
export const INSTALLED_WEAPON_MAP = Object.fromEntries(Object.entries({...LEGACY_WEAPON_MAP,...assetMap}).map(([id, def]) => [id, e2Copy('weapon', def)]));
export const WEAPONS = [...LEGACY_WEAPONS.map(w=>ENABLED_ASSET_IDS.has(w.id)?assetMap[w.id]:w),...ASSET_WEAPON_DEFINITIONS.filter(w=>!LEGACY_WEAPON_MAP[w.id] && ENABLED_ASSET_IDS.has(w.id)).map(revisedWeaponDefinition)].map(o => INSTALLED_WEAPON_MAP[o.id] || e2Copy('weapon', o));
export const WEAPON_MAP = Object.fromEntries(WEAPONS.map((w) => [w.id, w]));

// ---------------- 被动道具 ----------------
export const ITEMS = [
  ...BUILD_RELICS,
  { id: 'dmg_up', cn: '战斗激素', en: 'Adrenal Vial', rarity: 2, desc: '伤害 +22%', icon: 'fist', mods: { damage: 0.22 }, tags: ['offense'] },
  { id: 'rate_up', cn: '过载扳机', en: 'Overclock Trigger', rarity: 2, desc: '射速 +20%', icon: 'bolt', mods: { rate: 0.20 }, tags: ['offense'] },
  { id: 'speed_up', cn: '疾行靴', en: 'Striders', rarity: 1, desc: '移动速度 +14%', icon: 'boot', mods: { speed: 0.14 }, tags: ['mobility'] },
  { id: 'hp_up', cn: '生命结晶', en: 'Vital Shard', rarity: 2, desc: '生命上限 +1 并回复 1', mods: { maxHp: 1, heal: 1 }, tags: ['defense'] },
  { id: 'armor_up', cn: '护甲板', en: 'Plating', rarity: 2, desc: '护甲 +1（抵挡一次伤害）', mods: { armor: 1 }, tags: ['defense'] },
  { id: 'crit_up', cn: '弱点透镜', en: 'Weakpoint Lens', rarity: 2, desc: '暴击率 +14%，暴击伤害倍率 +0.3（可叠加）', mods: { crit: 0.14, critMul: 0.3 }, tags: ['offense'] },
  { id: 'pierce_up', cn: '贯穿弹头', en: 'Penetrator', rarity: 3, desc: '子弹穿透 +1', mods: { pierce: 1 }, tags: ['bullet'] },
  { id: 'bounce_up', cn: '橡胶衬层', en: 'Rubber Lining', rarity: 2, desc: '子弹弹跳 +2', mods: { bounce: 2 }, tags: ['bullet'] },
  { id: 'homing_up', cn: '导引芯片', en: 'Seeker Chip', rarity: 3, desc: trackingDescription(2.2).description, mods: { homing: 2.2 }, tags: ['bullet'] },
  { id: 'explosive_rounds', cn: '爆裂装药', en: 'Demo Rounds', rarity: 3, desc: '适配普通弹命中产生一次小爆炸；新版武器兼容范围见工坊，固有爆弹不叠加', mods: { explosive: 11 }, tags: ['bullet', 'explosive'] },
  { id: 'ice_rounds', cn: '霜冻弹头', en: 'Cryo Tips', rarity: 3, desc: '命中减速敌人', mods: { slow: 0.45 }, tags: ['bullet', 'elemental'] },
  { id: 'poison_rounds', cn: '腐蚀弹头', en: 'Corrosive Tips', rarity: 3, desc: '命中造成持续中毒', mods: { poison: 2.4 }, tags: ['bullet', 'elemental'] },
  { id: 'burn_rounds', cn: '燃烧弹头', en: 'Incendiary Tips', rarity: 3, desc: '命中造成灼烧', mods: { burn: 2.4 }, tags: ['bullet', 'elemental'] },
  { id: 'lifesteal', cn: '吸血獠牙', en: 'Vampire Fang', rarity: 3, desc: '击杀有 22% 几率回复 1 生命', mods: { lifesteal: 0.22 }, tags: ['sustain'] },
  { id: 'dash_plus', cn: '回旋核心', en: 'Gyro Core', rarity: 2, desc: '冲刺次数 +1，冷却 -15%', mods: { dashMax: 1, dashCd: -0.15 }, tags: ['mobility'] },
  { id: 'reload_up', cn: '快速装填器', en: 'Speedloader', rarity: 1, desc: '装填时间 -25%', mods: { reload: -0.25 }, tags: ['utility'] },
  { id: 'mag_up', cn: '扩容弹匣', en: 'Extended Mag', rarity: 2, desc: '弹匣容量 +35%', mods: { magazine: 0.35 }, tags: ['utility'] },
  { id: 'thorns', cn: '尖刺外壳', en: 'Barbed Hide', rarity: 2, desc: '受到接触伤害时反击', mods: { thorns: 6 }, tags: ['defense'] },
  { id: 'coin_magnet', cn: '磁化徽记', en: 'Magnet Sigil', rarity: 1, desc: '拾取范围 +80%，金币 +25%', mods: { pickup: 0.8, coins: 0.25 }, tags: ['utility'] },
  { id: 'key_ring', cn: '百钥环', en: 'Keyring', rarity: 2, desc: '钥匙掉落率大幅提升', mods: { keys: 1 }, tags: ['utility'] },
  { id: 'glass_cannon', cn: '玻璃炮', en: 'Glass Cannon', rarity: 4, desc: '伤害 +50%，生命上限 -1', mods: { damage: 0.5, maxHp: -1 }, tags: ['offense', 'risk'] },
  { id: 'spell_power', cn: '秘术回路', en: 'Arcane Circuit', rarity: 3, desc: '主动技能威力 +40%，冷却 -18%', mods: { skillPower: 0.4, skillCd: -0.18 }, tags: ['skill'] },
  { id: 'soul_harvest', cn: '灵魂收割', en: 'Soul Reaper', rarity: 3, desc: '每击杀 10 个敌人回复 1 生命', mods: { souls: 10 }, tags: ['sustain'] },
  { id: 'swift_hands', cn: '疾风手', en: 'Swift Hands', rarity: 2, desc: '射速 +14%，装填 -18%', mods: { rate: 0.14, reload: -0.18 }, tags: ['offense', 'utility'] },
  { id: 'big_bullets', cn: '巨型弹头', en: 'Siege Rounds', rarity: 3, desc: '子弹体积 +50%，伤害 +14%', mods: { bulletSize: 0.5, damage: 0.14 }, tags: ['bullet'] },
  { id: 'shield_gen', cn: '力场发生器', en: 'Field Generator', rarity: 3, desc: '每清空一个房间获得 1 护甲（上限 3）', mods: { regenArmor: 1 }, tags: ['defense'] },
  { id: 'sniper_nest', cn: '静默射击', en: 'Steady Aim', rarity: 3, desc: '静止 0.5 秒后伤害 +55%', mods: { standstill: 0.55 }, tags: ['offense'] },
  { id: 'berserker', cn: '狂战血脉', en: 'Berserker Blood', rarity: 3, desc: '每损失 1 生命，伤害 +8%', mods: { berserk: 0.08 }, tags: ['offense', 'risk'] },
  { id: 'twin_link', cn: '双生链接', en: 'Twin Link', rarity: 4, desc: '适配普通弹25%几率追加一发次级弹；新版兼容范围见工坊，不复制锚/束/部署/特殊轨迹', mods: { twin: 0.25 }, tags: ['offense'] },
  { id: 'overcharge', cn: '超载火花', en: 'Overcharge', rarity: 4, desc: '暴击引发额外爆炸', mods: { critBoom: 14 }, tags: ['offense', 'explosive'] },
  { id: 'tesla_coil', cn: '特斯拉线圈', en: 'Tesla Coil', rarity: 4, desc: '定期电击附近的敌人', mods: { tesla: 1 }, tags: ['offense', 'elemental'] },
  { id: 'drone_buddy', cn: '伴生浮游炮', en: 'Companion Drone', rarity: 4, desc: '召唤一架自动开火的浮游炮', mods: { drone: 1 }, tags: ['summon'] },
  { id: 'ammo_belt', cn: '弹链背包', en: 'Ammo Belt', rarity: 2, desc: '特殊弹药上限 +50%，提高击杀时弹药掉落概率；每包补给量不变', mods: { ammoMax: 0.5, ammoFind: 1 }, tags: ['utility'] },
  // ---- V2.0 新增 ----
  { id: 'ricochet_core', cn: '反弹核心', en: 'Ricochet Core', rarity: 3, desc: '子弹弹跳 +3，跳弹不再减速', mods: { bounce: 3, noSlow: 1 }, tags: ['bullet'] },
  { id: 'hollow_point', cn: '空尖弹头', en: 'Hollow Point', rarity: 3, desc: '暴击率 +10%，暴击伤害倍率 +0.6（可叠加）', mods: { crit: 0.10, critMul: 0.6 }, tags: ['offense'] },
  { id: 'ember_heart', cn: '余烬之心', en: 'Ember Heart', rarity: 3, desc: '命中灼烧敌人，伤害 +12%', mods: { burn: 3.0, damage: 0.12 }, tags: ['elemental', 'offense'] },
  { id: 'phase_dash', cn: '相位核心', en: 'Phase Core', rarity: 3, desc: '冲刺冷却 -30%，冲刺距离更远', mods: { dashCd: -0.30 }, tags: ['mobility'] },
  { id: 'scavenger', cn: '拾荒者背包', en: 'Scavenger Pack', rarity: 2, desc: '拾取范围 +60%，金币 +40%', mods: { pickup: 0.6, coins: 0.4 }, tags: ['utility'] },
  { id: 'adrenal_surge', cn: '肾上腺素泵', en: 'Adrenal Surge', rarity: 4, desc: '射速 +26%，移速 +10%，生命上限 -1', mods: { rate: 0.26, speed: 0.10, maxHp: -1 }, tags: ['offense', 'risk'] },
].map(o => e2Copy('item', o));

export const ITEM_MAP = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

// ---------------- 主动技能 ----------------
export const ACTIVES = [
  { id: 'time_freeze', cn: '时之滞', en: 'Chronostasis', cd: 16, rarity: 3, desc: '4 秒内敌人与敌弹流速降至 32%（减速 68%），玩家不减速。', color: '#8af0ff' },
  { id: 'grenade_toss', cn: '投掷手雷', en: 'Frag Toss', cd: 7, rarity: 1, desc: '向瞄准方向投出高爆手雷。', color: '#9dff5a' },
  { id: 'blink', cn: '瞬影闪', en: 'Blink', cd: 6, rarity: 2, desc: '瞬间向瞄准方向位移并留下冲击波。', color: '#c07af0' },
  { id: 'barrier', cn: '力场壁垒', en: 'Bulwark', cd: 18, rarity: 3, desc: '生成 4 秒无敌力场。', color: '#ffd06a' },
  { id: 'heal_pulse', cn: '治愈脉冲', en: 'Mend Pulse', cd: 22, rarity: 3, desc: '回复 1 生命并击退周围敌人。', color: '#7affd2' },
  { id: 'shockwave', cn: '震荡波', en: 'Shockwave', cd: 8, rarity: 2, desc: '环形冲击，造成伤害并击退。', color: '#ff8a3c' },
  { id: 'chain_blast', cn: '链式放电', en: 'Chain Discharge', cd: 10, rarity: 3, desc: '释放跳跃电弧电击多个敌人。', color: '#5ad8ff' },
  { id: 'overdrive', cn: '超载模式', en: 'Overdrive', cd: 20, rarity: 3, desc: '6 秒内射速翻倍、无需等待装填；有限弹药和共享法力仍照常消耗。', color: '#ff5a10' },
  { id: 'turret', cn: '部署炮台', en: 'Deploy Turret', cd: 24, rarity: 4, desc: '放置一座自动射击的哨戒炮台。', color: '#ffb347' },
  { id: 'drone_summon', cn: '浮游炮召唤', en: 'Drone Summon', cd: 26, rarity: 4, desc: '召唤两架浮游炮协同作战 30 秒。', color: '#a0f0ff' },
  // ---- V2.0 新增 ----
  { id: 'meteor_rain', cn: '陨星雨', en: 'Meteor Rain', cd: 14, rarity: 4, desc: '向瞄准方向降下 5 颗熔岩陨石。', color: '#ff7a2e' },
  { id: 'ward_pulse', cn: '圣佑脉冲', en: 'Ward Pulse', cd: 20, rarity: 3, desc: '回复 1 生命，使力场至少持续 3 秒，并推开当前房间内可被击退的非首领敌人；身周半径 6.5 内另有爆炸伤害。', color: '#7affd2' },
].map(o => e2Copy('active', o));

export const ACTIVE_MAP = Object.fromEntries(ACTIVES.map((a) => [a.id, a]));

// ---------------- 协同 ----------------
// 条件：拥有指定武器 tag 与道具的组合 → 额外效果与提示
export const SYNERGIES = [
  ...BUILD_SYNERGIES,
  { id: 'crack_charge', cn: '碎裂装药', req: [{ item: 'explosive_rounds' }, { tag: 'spread' }], desc: '爆炸范围与伤害大幅提升', mods: { explosiveMul: 0.9, blastRadius: 0.5 } },
  { id: 'absolute_zero', cn: '绝对零度', req: [{ item: 'ice_rounds' }, { tag: 'rapid' }], desc: '高射速冻结：命中累积可瞬间冰封', mods: { freezeChance: 0.08 } },
  { id: 'piercing_lance', cn: '贯穿光矛', req: [{ tag: 'pierce' }, { tag: 'beam' }], desc: '光束加粗且伤害提升', mods: { beamWidth: 0.7, damage: 0.25 } },
  { id: 'blade_storm', cn: '万刃回旋', req: [{ tag: 'bounce' }, { item: 'bounce_up' }], desc: '弹跳次数翻倍且速度不衰减', mods: { bounce: 3, noSlow: 1 } },
  { id: 'volatile_crit', cn: '超载暴击', req: [{ item: 'overcharge' }, { item: 'crit_up' }], desc: '暴击爆炸范围翻倍，暴击率 +8%', mods: { critBoomMul: 1.0, crit: 0.08 } },
  { id: 'blood_fire', cn: '焚血', req: [{ tag: 'fire' }, { item: 'lifesteal' }], desc: '灼烧中的敌人死亡必定回血', mods: { burnLife: 1 } },
  { id: 'toxic_chain', cn: '毒电共振', req: [{ tag: 'chain' }, { tag: 'poison' }], desc: '电弧附加中毒效果', mods: { chainPoison: 1 } },
  { id: 'hmg_belt', cn: '永动弹链', req: [{ tag: 'rapid' }, { item: 'mag_up' }], desc: '弹匣再 +40%，装填 -20%', mods: { magazine: 0.4, reload: -0.2 } },
  { id: 'blast_radius', cn: '内爆核心', req: [{ tag: 'explosive' }, { item: 'big_bullets' }], desc: '爆炸伤害 +45%', mods: { explosiveMul: 0.45 } },
  { id: 'cold_steel', cn: '凛冬重击', req: [{ item: 'ice_rounds' }, { tag: 'single' }], desc: '单发武器命中必冻结', mods: { freezeChance: 0.35 } },
  { id: 'arc_harvest', cn: '电弧收割', req: [{ tag: 'chain' }, { item: 'soul_harvest' }], desc: '连锁击杀计数翻倍', mods: { soulsMul: 2 } },
  { id: 'gun_fu', cn: '枪斗术', req: [{ tag: 'rapid' }, { item: 'speed_up' }], desc: '射速 +10%', mods: { rate: 0.1, moveShoot: 1 } },
  // ---- V2.0 新增 ----
  { id: 'storm_front', cn: '风暴锋面', req: [{ tag: 'chain' }, { tag: 'rapid' }], desc: '伤害 +30%，射速 +12%；跳链由主伤害派生', mods: { damage: 0.30, rate: 0.12 } },
  { id: 'overkill', cn: '过量击杀', req: [{ tag: 'explosive' }, { item: 'hollow_point' }], desc: '暴击爆炸，爆炸伤害 +50%', mods: { critBoomMul: 1.0, explosiveMul: 0.5 } },
  { id: 'icarus', cn: '伊卡洛斯', req: [{ item: 'glass_cannon' }, { item: 'adrenal_surge' }], desc: '极限输出：伤害 +25%，暴击率 +10%', mods: { damage: 0.25, crit: 0.10 } },
  { id: 'frost_edge', cn: '霜刃', req: [{ tag: 'beam' }, { item: 'ice_rounds' }], desc: '光束加粗且必定冻结', mods: { beamWidth: 0.8, freezeChance: 0.5 } },
  { id: 'reaper', cn: '死神契约', req: [{ item: 'soul_harvest' }, { item: 'lifesteal' }], desc: '击杀计数翻倍，吸血几率提升', mods: { soulsMul: 2, damage: 0.10 } },
].map(o => e2Copy('synergy', o));

// ---------------- 敌人 ----------------
export const ENEMIES = [
  // ---- 第一层 ----
  {
    id: 'grunt', cn: '沉钟卫兵', floor: 1, model: 'humanoid', ai: 'shooter',
    hp: 16, speed: 2.4, radius: 0.62, contact: 0, tier: 1, coins: 2, souls: 1,
    weapon: 'pistol_rusty', fireCd: 1.55, burst: 1, range: 17, keepDist: 8, telegraph: 0.42,
    palette: { armor: '#4a6f7d', armorDark: '#2c444f', trim: '#c9a227', skin: '#7d8a92', visor: '#ff7a2a', headShape: 'helm' },
  },
  {
    id: 'rusher', cn: '血角冲锋兽', floor: 1, model: 'quadruped', ai: 'charger',
    hp: 20, speed: 4.2, dashSpeed: 12, radius: 0.72, contact: 1, tier: 1, coins: 2, souls: 1,
    chargeCd: 1.5, telegraph: 0.55, chargeTime: 0.55,
    palette: { hide: '#8a2436', hideDark: '#521320', horn: '#e2d9bd', eye: '#ffcf3a' },
  },
  {
    id: 'spitter', cn: '腐殖喷吐者', floor: 1, model: 'floater', ai: 'caster',
    hp: 14, speed: 2.0, radius: 0.66, contact: 0, tier: 1, coins: 3, souls: 1,
    fireCd: 2.1, burst: 3, burstGap: 0.16, range: 20, projSpeed: 11, projDamage: 1, projColor: '#b46ad0', scatter: 12,
    palette: { sac: '#7a3fa8', sacDark: '#46255f', eye: '#ffe23d', core: '#c07af0' },
  },
  {
    id: 'bomber', cn: '爆裂甲虫', floor: 1, model: 'bug', ai: 'bomber',
    hp: 12, speed: 4.6, radius: 0.56, contact: 0, tier: 1, coins: 2, souls: 1,
    fuseRange: 2.3, fuse: 0.85, blastDamage: 2, blastRadius: 3.6,
    palette: { shell: '#c85a1e', shellDark: '#7a3410', leg: '#2b1c12', eye: '#ffe14d', core: '#ff8a2a' },
  },
  {
    id: 'turret', cn: '哨戒机炮', floor: 1, model: 'turret', ai: 'turret',
    hp: 26, speed: 0, radius: 0.72, contact: 0, tier: 2, coins: 4, souls: 1,
    fireCd: 1.9, burst: 5, burstGap: 0.085, range: 22, projSpeed: 17, projDamage: 1, projColor: '#ff6a3a',
    palette: { base: '#48545c', metal: '#6d7880', lens: '#ff3a2a' },
  },
  {
    id: 'mage', cn: '织咒者', floor: 1, model: 'humanoid', ai: 'caster',
    hp: 18, speed: 1.7, radius: 0.6, contact: 0, tier: 2, coins: 4, souls: 1,
    fireCd: 2.6, burst: 4, burstGap: 0.14, range: 22, projSpeed: 9, projDamage: 1, projColor: '#c07af0', homing: 1.6,
    teleport: 5.5,
    palette: { armor: '#4a3568', armorDark: '#2b1e42', trim: '#c07af0', skin: '#7d6f92', visor: '#e0b0ff', headShape: 'hood', robe: true, robeTrim: '#c07af0', chestLight: '#c07af0' },
  },
  {
    id: 'shielder', cn: '铁壁卫兵', floor: 1, model: 'humanoid', ai: 'shield',
    hp: 32, speed: 1.9, radius: 0.68, contact: 1, tier: 2, coins: 4, souls: 2,
    fireCd: 2.4, burst: 2, burstGap: 0.18, range: 14, projSpeed: 14, projDamage: 1, projColor: '#ffd27a',
    shield: true, shieldHp: 14,   // 正面格挡有耐久，打崩后永久破防（否则与冲锋+快速转向组合成死局）
    palette: { armor: '#8a7a4a', armorDark: '#5a4f2c', trim: '#e8d8a0', skin: '#a08f6a', visor: '#ffd76a', headShape: 'helm', shield: true, shieldColor: '#9aa4ae' },
  },
  {
    id: 'splitter', cn: '裂变软体', floor: 1, model: 'blob', ai: 'blob',
    hp: 22, speed: 1.6, radius: 0.72, contact: 1, tier: 2, coins: 3, souls: 2,
    splitInto: 'splitter_small', splitCount: 2,
    palette: { gel: '#4fbf5a', gelDark: '#2d7a37', eye: '#ffe23d' },
  },
  {
    id: 'splitter_small', cn: '裂变幼体', floor: 1, model: 'blob', ai: 'blob',
    hp: 7, speed: 3.0, radius: 0.36, contact: 1, tier: 1, coins: 1, souls: 1, scale: 0.55,
    palette: { gel: '#7ae08a', gelDark: '#3d9a4a', eye: '#fff0a0' },
  },
  {
    id: 'sniper', cn: '冷眼射手', floor: 1, model: 'humanoid', ai: 'sniper',
    hp: 15, speed: 1.8, radius: 0.6, contact: 0, tier: 2, coins: 4, souls: 2,
    fireCd: 3.1, aimTime: 1.15, range: 30, projSpeed: 40, projDamage: 1, projColor: '#ff5a3a',
    palette: { armor: '#2f4a3a', armorDark: '#1c2f24', trim: '#8adf6a', skin: '#9aa89a', visor: '#ff5a3a', headShape: 'helm' },
  },
  {
    id: 'wasp', cn: '铁翼火蜂', floor: 1, model: 'bug', ai: 'swarm',
    hp: 9, speed: 3.6, radius: 0.4, contact: 1, tier: 1, coins: 1, souls: 1, fly: true,
    palette: { shell: '#e0b020', shellDark: '#3a2c10', leg: '#1c1408', eye: '#ff4a2a', core: '#ff8a2a' },
  },
  // ---- 第二层 ----
  {
    id: 'abyss_grunt', cn: '熔铁军团兵', floor: 2, model: 'humanoid', ai: 'shooter',
    hp: 28, speed: 2.9, radius: 0.64, contact: 0, tier: 2, coins: 4, souls: 2,
    weapon: 'rifle_carbine', fireCd: 1.25, burst: 3, burstGap: 0.10, range: 20, keepDist: 9, telegraph: 0.34,
    palette: { armor: '#5a3a2a', armorDark: '#332016', trim: '#d8a04a', skin: '#8a6a55', visor: '#ff8a2a', headShape: 'helm', horns: true },
  },
  {
    id: 'forge_brute', cn: '熔炉重甲', floor: 2, model: 'humanoid', ai: 'brute',
    hp: 90, speed: 1.7, radius: 0.95, contact: 2, tier: 3, coins: 8, souls: 4,
    scale: 1.45, slamCd: 2.6, slamRadius: 5.0, slamDamage: 2, telegraph: 0.75, bigArms: true,
    palette: { armor: '#3a3038', armorDark: '#241d24', trim: '#a8763a', skin: '#5a4a44', visor: '#ff6a20', headShape: 'helm', chestLight: '#ff7a20', spines: true },
  },
  {
    id: 'abyss_spitter', cn: '深渊吐脓者', floor: 2, model: 'floater', ai: 'caster',
    hp: 26, speed: 2.3, radius: 0.7, contact: 0, tier: 2, coins: 5, souls: 2,
    fireCd: 1.8, burst: 5, burstGap: 0.12, range: 24, projSpeed: 13, projDamage: 1, projColor: '#ff6a20', scatter: 20,
    palette: { sac: '#8a3a1a', sacDark: '#4a1c0c', eye: '#ffd06a', core: '#ff8a2a' },
  },
  {
    id: 'lava_turret', cn: '熔岩炮台', floor: 2, model: 'turret', ai: 'turret',
    hp: 44, speed: 0, radius: 0.78, contact: 0, tier: 3, coins: 6, souls: 3,
    fireCd: 2.4, burst: 8, burstGap: 0.07, range: 26, projSpeed: 19, projDamage: 1, projColor: '#ff8a2a', spread: 22,
    palette: { base: '#3a2118', metal: '#7a4a2a', lens: '#ff5a10' },
  },
  {
    id: 'hound', cn: '焦炭猎犬', floor: 2, model: 'quadruped', ai: 'charger',
    hp: 30, speed: 5.0, dashSpeed: 15, radius: 0.7, contact: 1, tier: 2, coins: 4, souls: 2,
    chargeCd: 1.1, telegraph: 0.42, chargeTime: 0.5,
    palette: { hide: '#5a2a1a', hideDark: '#301408', horn: '#c8a070', eye: '#ff8a2a' },
  },
  {
    id: 'summoner', cn: '深渊祭司', floor: 2, model: 'humanoid', ai: 'summoner',
    hp: 52, speed: 1.9, radius: 0.68, contact: 0, tier: 3, coins: 8, souls: 4,
    fireCd: 2.2, burst: 3, burstGap: 0.16, range: 22, projSpeed: 10, projDamage: 1, projColor: '#8a3cff', homing: 2.2,
    summonCd: 6.5, summonKind: 'wasp', summonCount: 3, teleport: 6.0,
    palette: { armor: '#241a2e', armorDark: '#140f1c', trim: '#c9a227', skin: '#6a5a7a', visor: '#c07af0', headShape: 'hood', robe: true, robeTrim: '#c9a227', chestLight: '#8a3cff', wings: true, wingColor: '#1c1426' },
  },
  {
    id: 'drone_mk2', cn: '猎杀浮游机', floor: 2, model: 'drone', ai: 'drone',
    hp: 26, speed: 3.4, radius: 0.6, contact: 0, tier: 2, coins: 5, souls: 2,
    fireCd: 1.6, burst: 4, burstGap: 0.09, range: 22, projSpeed: 20, projDamage: 1, projColor: '#3ad2ff',
    palette: { hull: '#8a9aa4', dark: '#2c343c', glow: '#ff4a2a' },
  },
  {
    id: 'orb_guard', cn: '守界棱卫', floor: 2, model: 'humanoid', ai: 'shield',
    hp: 46, speed: 2.2, radius: 0.7, contact: 1, tier: 3, coins: 6, souls: 3,
    fireCd: 2.0, burst: 3, burstGap: 0.14, range: 16, projSpeed: 15, projDamage: 1, projColor: '#8a3cff',
    shield: true, shieldHp: 20,
    palette: { armor: '#4a3a6a', armorDark: '#2a1f42', trim: '#c9a227', skin: '#7a6a9a', visor: '#c07af0', headShape: 'helm', shield: true, shieldColor: '#5a4a8a' },
  },
  {
    id: 'maw', cn: '裂口巨虫', floor: 2, model: 'blob', ai: 'blob',
    hp: 40, speed: 2.2, radius: 0.85, contact: 2, tier: 3, coins: 6, souls: 3,
    splitInto: 'maw_small', splitCount: 3,
    palette: { gel: '#8a2a3a', gelDark: '#4a1020', eye: '#ffd06a' },
  },
  {
    id: 'maw_small', cn: '裂口幼体', floor: 2, model: 'blob', ai: 'blob',
    hp: 12, speed: 3.6, radius: 0.42, contact: 1, tier: 2, coins: 2, souls: 1, scale: 0.6,
    palette: { gel: '#c04a5a', gelDark: '#6a2030', eye: '#fff0a0' },
  },
  // ---- 第三层：熔心王座 ----
  {
    id: 'throne_sentinel', cn: '王座禁卫', floor: 3, model: 'humanoid', ai: 'shooter',
    hp: 40, speed: 3.1, radius: 0.66, contact: 0, tier: 2, coins: 5, souls: 2,
    weapon: 'rifle_carbine', fireCd: 1.05, burst: 4, burstGap: 0.09, range: 22, keepDist: 9.5, telegraph: 0.30,
    build: { crest: true, shield: true, shieldColor: '#6a5426' },
    palette: { armor: '#4a3a22', armorDark: '#2a2012', trim: '#e8c84a', skin: '#9a8a6a', visor: '#ffb347', headShape: 'helm', horns: true, chestLight: '#ffab4a' },
  },
  {
    id: 'cinder_lancer', cn: '烬矛骑士', floor: 3, model: 'humanoid', ai: 'brute',
    hp: 66, speed: 2.3, radius: 0.78, contact: 2, tier: 3, coins: 7, souls: 3,
    slamCd: 2.1, slamRadius: 4.4, slamDamage: 2, telegraph: 0.62, bigArms: true,
    build: { halberd: true, bladeColor: '#c8d4dc', bladeGlow: '#ff6a20' },
    palette: { armor: '#3a2418', armorDark: '#22150c', trim: '#ff9a3c', skin: '#6a4a34', visor: '#ff6a20', headShape: 'helm', chestLight: '#ff7a20' },
  },
  {
    id: 'gilded_hound', cn: '鎏金猎犬', floor: 3, model: 'quadruped', ai: 'charger',
    hp: 40, speed: 5.4, dashSpeed: 17, radius: 0.72, contact: 1, tier: 2, coins: 5, souls: 2,
    chargeCd: 1.0, telegraph: 0.38, chargeTime: 0.46,
    build: { plated: true, plateColor: '#d8a83c', plateGlow: '#ff9a3c' },
    palette: { hide: '#6a4a18', hideDark: '#3a2808', horn: '#ffd98a', eye: '#ff9a3c' },
  },
  {
    id: 'pyre_turret', cn: '焚焰炮塔', floor: 3, model: 'turret', ai: 'turret',
    hp: 56, speed: 0, radius: 0.8, contact: 0, tier: 3, coins: 7, souls: 3,
    fireCd: 2.1, burst: 10, burstGap: 0.065, range: 28, projSpeed: 21, projDamage: 1, projColor: '#ffab4a', spread: 26,
    build: { twin: true, core: '#ff7a2a', lens: '#ff5a10' },
    palette: { base: '#3a2a1a', metal: '#8a6a2a', lens: '#ff7a10' },
  },
  {
    id: 'ash_swarm', cn: '灰烬蜂群', floor: 3, model: 'bug', ai: 'swarm',
    hp: 14, speed: 4.2, radius: 0.4, contact: 1, tier: 1, coins: 2, souls: 1, fly: true,
    palette: { shell: '#b07a30', shellDark: '#3a2a10', leg: '#1c1408', eye: '#ffab4a', core: '#ff7a20' },
  },
  {
    id: 'warden_adept', cn: '总督学徒', floor: 3, model: 'humanoid', ai: 'summoner',
    hp: 70, speed: 2.1, radius: 0.7, contact: 0, tier: 3, coins: 9, souls: 4,
    fireCd: 1.9, burst: 4, burstGap: 0.14, range: 24, projSpeed: 12, projDamage: 1, projColor: '#ffd06a', homing: 2.4,
    summonCd: 5.6, summonKind: 'ash_swarm', summonCount: 3, teleport: 5.2,
    build: { sigil: true, sigilColor: '#ffab4a' },
    palette: { armor: '#2e2214', armorDark: '#1a1208', trim: '#e8c84a', skin: '#7a6a52', visor: '#ffab4a', headShape: 'hood', robe: true, robeTrim: '#e8c84a', chestLight: '#ff8a2a', wings: true, wingColor: '#241a10' },
  },
  {
    id: 'obsidian_brute', cn: '黑曜巨像', floor: 3, model: 'humanoid', ai: 'brute',
    hp: 130, speed: 1.5, radius: 1.0, contact: 2, tier: 4, coins: 12, souls: 6,
    scale: 1.55, slamCd: 2.9, slamRadius: 5.6, slamDamage: 2, telegraph: 0.85, bigArms: true,
    build: { hulk: true },
    palette: { armor: '#2a2622', armorDark: '#161310', trim: '#c9a227', skin: '#4a423a', visor: '#ff9a3c', headShape: 'helm', chestLight: '#ffab4a', spines: true },
  },
  {
    id: 'ember_orbiter', cn: '余烬环星', floor: 3, model: 'floater', ai: 'caster',
    hp: 34, speed: 2.6, radius: 0.7, contact: 0, tier: 2, coins: 5, souls: 2,
    fireCd: 1.6, burst: 6, burstGap: 0.11, range: 26, projSpeed: 15, projDamage: 1, projColor: '#ffd06a', scatter: 26,
    build: { orbiters: true, ringColor: '#ff8a3c', orbColor: '#ffd06a' },
    palette: { sac: '#8a3a12', sacDark: '#4a1c06', eye: '#ffe9a8', core: '#ffab4a' },
  },
];

export const ENEMY_MAP = Object.fromEntries(ENEMIES.map((e) => [e.id, e]));

export const FLOOR1_POOL = ['grunt', 'rusher', 'spitter', 'bomber', 'turret', 'mage', 'shielder', 'splitter', 'sniper', 'wasp'];
export const FLOOR2_POOL = ['abyss_grunt', 'forge_brute', 'abyss_spitter', 'lava_turret', 'hound', 'summoner', 'drone_mk2', 'orb_guard', 'maw', 'wasp'];
export const FLOOR3_POOL = [
  'ash_swarm', 'ember_orbiter', 'throne_sentinel', 'gilded_hound', 'pyre_turret',
  'cinder_lancer', 'warden_adept', 'obsidian_brute', 'summoner', 'drone_mk2', 'maw',
];
export const POOL_BY_FLOOR = { 1: FLOOR1_POOL, 2: FLOOR2_POOL, 3: FLOOR3_POOL };

// ---------------- 特殊房间事件 ----------------
export const SPECIAL_EVENTS = [
  { id: 'shrine_blood', cn: '血之祭坛', desc: '本局生命上限 −1，获得「战斗激素」与「弱点透镜」；当前生命随新上限降低。上限须大于 1，每间祭坛限用一次。', color: '#c0303a' },
  { id: 'shrine_gold', cn: '贪欲祭坛', desc: '支付 25 金币，地面掉落一把随机武器，需自行拾取；每间祭坛限用一次。', color: '#e8c84a' },
  { id: 'shrine_armor', cn: '铁誓祭坛', desc: '本局生命上限 −1，获得最多 2 护甲（上限 5）；当前生命随新上限降低。上限须大于 1 且护甲未满，每间祭坛限用一次。', color: '#9aa4ae' },
  { id: 'forge', cn: '深渊铁匠', desc: '免费将当前武器的伤害强化 30%。', color: '#ff8a3c' },
  { id: 'oracle', cn: '迷雾先知', desc: '揭示本层普通房间的位置；隐藏房仍需寻找并打破暗墙。', color: '#8af0ff' },
];

export const FLOOR_NAMES = { 1: '沉钟回廊', 2: '熔核深渊', 3: '熔心王座' };
