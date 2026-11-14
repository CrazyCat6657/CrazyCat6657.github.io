// ============================================================
//  法术核心 / Spell Core Adapter（任务书 §27–§32 + §48 安全规则）
//
//  钟术师的核心动词是「把枪翻译成法术」。§28 的关键要求：
//  拾取普通武器时**不显示"无法使用"**，而是自动转换成法术核心。
//
//  §48 的安全规则是本文件的设计约束：**普通内容不能因为选了法师就作废**。
//  做法是把法术核心**合成为一件武器实例**，共用原来的整套系统：
//    · 保留源武器的 tags        → Synergy 照常触发
//    · 保留源武器的伤害结构      → 宝箱 / 商店 / 武器掉落仍然有意义
//    · 用 ammoType:'mana' 承载法力 → 弹药掉落自动变成"法力补充"，不是垃圾
//    · 配件仍然装在这件"武器"上   → 只把显示名换成符文（§31），底层数据不变
//
//  这样"枪 → 法术"是一次**适配**（Adapter），而不是另起一套系统（§29 明令）。
// ============================================================

// 形态表：按 cls 或 tags 决定法术形态（§29 的示意）
//   pierce / 单发  → 钟矢
//   spread         → 扇形符文爆发
//   rapid          → 连续余烬弹
//   explosive      → 炉火爆破
//   beam / energy  → 共鸣光束
//   flame          → 余烬喷流
//   其它           → 特殊法术核心
export const FORMS = [
  { id: 'bell_arrow', cn: '钟矢', color: '#8ad8ff', model: 'orb',
    match: (d) => d.cls === 'pistol' || d.cls === 'sniper' || (d.tags || []).includes('pierce'),
    desc: '单发穿刺钟矢' },
  { id: 'rune_burst', cn: '扇形符文', color: '#c07af0', model: 'orb',
    match: (d) => d.cls === 'shotgun' || (d.tags || []).includes('spread'),
    desc: '扇形展开的符文爆发' },
  { id: 'ember_stream', cn: '余烬弹', color: '#ff8a3c', model: 'orb',
    match: (d) => d.cls === 'smg' || d.cls === 'minigun' || d.cls === 'rifle' || (d.tags || []).includes('rapid'),
    desc: '连续吐出的余烬弹' },
  { id: 'forge_blast', cn: '炉火爆破', color: '#ff5a10', model: 'grenade',
    match: (d) => d.cls === 'rocket' || d.cls === 'launcher' || (d.tags || []).includes('explosive'),
    desc: '炉火爆破与陨火' },
  { id: 'resonant_beam', cn: '共鸣光束', color: '#8ad8ff', model: 'laser',
    match: (d) => d.cls === 'energy' || (d.tags || []).includes('beam'),
    desc: '共鸣光束与电弧' },
  { id: 'ember_jet', cn: '余烬喷流', color: '#ffb347', model: 'flame',
    match: (d) => d.cls === 'flame' || (d.tags || []).includes('fire'),
    desc: '火器化成的炉焰喷流' },
  { id: 'spell_core', cn: '特殊法术核心', color: '#c07af0', model: 'staff', match: () => true, desc: '无法归类的法术核心' },
];

export function formFor(def) {
  if (!def) return null;
  for (const f of FORMS) if (f.match(def)) return f;
  return { id: 'spell_core', cn: '特殊法术核心', color: '#c07af0', model: 'staff', desc: '无法归类的法术核心' };
}

// 把一把枪翻译成法术核心（返回一个**合成的武器定义**）。
// 保留 id 的溯源关系，避免两条不同的枪翻译出完全一样的法术。
export function spellFromWeapon(def) {
  const f = formFor(def);
  if (!def) return null;
  if([2,3].includes(def.weaponAssetVersion)) return {
    ...def,id:'spell_'+def.id,cn:`${f.cn}（${def.cn}）`,isSpell:true,
    sourceWeapon:def.sourceWeapon||def.id,fromWeapon:def.id,spellForm:f.id,
    ammoType:'mana',ammoMax:120,model:def.model,
    tags:Array.from(new Set([...(def.tags||[]),'spell'])),
    desc:`${def.desc} · 攻击消耗法力，装填不消耗法力`,
  };
  const heavy = (def.tags || []).includes('heavy') || (def.tags || []).includes('explosive');
  const spd = def.speed || 20;
  return {
    id: 'spell_' + def.id,
    cn: `${f.cn}（${def.cn}）`,          // §29：保留源武器的一部分身份
    en: f.cn,
    cls: 'energy',
    model: f.model,
    // 法力：借用现有的 ammoType 机制承载 —— 弹药掉落自然变成法力补充（§30 / §48）
    ammoType: 'mana',
    mag: heavy ? 4 : 8,                  // 一次"吟唱"能连发的次数
    ammoMax: 120,                        // 法力上限（由 reserve 承载）
    reload: heavy ? 1.9 : 1.2,
    auto: !!def.auto,
    // 伤害结构：略低于原枪（法术换来的是不受弹药类型限制与更稳定的形态），
    // 但保留原枪的比例关系，让"这把枪翻译成什么法术"仍然可辨
    damage: Math.max(0.4, (def.damage || 1) * 0.92),
    rate: Math.max(0.6, (def.rate || 2) * 0.95),
    pellets: (def.pellets || 1) > 1 ? Math.max(2, (def.pellets || 1) - 1) : 1,
    spread: (def.spread || 4) * 0.85,
    speed: f.id === 'ember_jet' ? spd * 0.75 : spd * 0.9,
    pierce: (def.pierce || 0) + 1,       // 法术天然更容易穿透
    bounce: def.bounce || 0,
    explosive: def.explosive || 0,
    homing: f.id === 'bell_arrow' ? 0.25 : (def.homing || 0),
    size: (def.size || 0.2) * (f.id === 'rune_burst' ? 0.9 : 1.1),
    life: (def.life || 1.4) * 1.1,
    color: f.color,
    // ---- 手感字段：**必须显式给出，不能依赖"源武器一定有"** ----
    // 这是本项目反反复复踩到的同一类坑：合成定义表（这个对象）和消费点（player.fireWeapon）
    // 分离，漏一个字段不会有任何报错，只会在运行时变成 NaN。
    // 实测事故：漏了 knock ⇒ `this.vx -= aim.x * undefined * 0.55` ⇒ 玩家速度 NaN
    // ⇒ 下一帧坐标 NaN ⇒ clampToRects 抛异常 ⇒ **钟术师开第一枪游戏即崩**（P0）。
    // 因此这里把开火路径真正读取的手感字段全部补齐。
    knock: Math.max(0.4, (def.knock || 1) * 0.7),   // 法术后坐略小于原枪
    shake: Math.max(0.03, (def.shake || 0.05) * 0.9),
    sfx: def.sfx || 'pistol',
    special: def.special === 'flame' ? 'flame' : undefined,
    // §48：**保留源武器的 tags**（再加 spell）—— Synergy 因此照常工作
    tags: Array.from(new Set([...(def.tags || []), 'spell', 'energy'])),
    desc: `${f.desc} · 由「${def.cn}」翻译而来`,
    fromWeapon: def.id,
    isSpell: true,
    spellForm: f.id,
  };
}

// §31 配件 → 符文（同一个底层数据，换一层表现语言）
const RUNE_MAP = {
  ricochet_plate: '回响符文', ember_core: '余烬符文', phase_lining: '穿界符文',
  micro_gyro: '引导符文', arc_core: '电弧符文', frost_core: '凝霜符文',
  heavy_barrel: '重压法杖', choke: '收束环', muzzle_brake: '镇定环', long_barrel: '延展法杖',
  last_spring: '终末符', reclaim_mag: '回响囊', overpressure: '过载囊', cooling_fin: '冷却环',
};
export function runeName(attId, fallback) { return RUNE_MAP[attId] || fallback; }

// §48：普通武器至少都有可转换结果 —— 这条断言靠的就是"formFor 永不返回 null"
export function hasConversion(def) { return !!formFor(def); }
