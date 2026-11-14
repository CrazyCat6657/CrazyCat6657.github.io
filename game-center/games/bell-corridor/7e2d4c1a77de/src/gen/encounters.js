// ============================================================
//  Encounter Director（PASS2 §16–§19）
//
//  解决的问题：普通战斗房此前是"按威胁预算随机抽敌人"，
//  抽出来的组合彼此没有战术关系 —— 玩家感知就是"随机怪物汤"。
//
//  本模块用**现有 29 个敌人**组织战术关系，不新增任何怪：
//    Archetype（战术原型） + Threat Budget（威胁预算）
//    + Layout（房间形态） + Random Variation（随机变体）
//
//  三条硬约束：
//   1. **只用 seed**。同一输入必须深相等；不同 Seed 必须产生不同编成。
//      内部只消费自己的 RNG，不碰 Dungeon 的 RNG 流。
//   2. **不照单生成固定编队**。原型决定"关系"，数量和具体成员仍随机。
//   3. **预算不越界**，且开局低威胁（高 tier 敌人优先放进增援波）。
//
//  这个模块是**纯函数**：不读 game、不碰 Three.js、无副作用。
//  因此可以在 Node 里直接跑统计探针（tools/probe_encounters.mjs）。
// ============================================================
import { RNG } from '../core/rng.js';
import { ENEMY_MAP } from '../game/data.js';

// 战术角色：由敌人的 ai 字段推导，**不按 id 硬编码**。
// 这样以后加新敌人时，只要它的 ai 合理就会自动进入对应原型。
const ROLE_BY_AI = {
  charger: 'anchor',   // 近战逼位：冲脸、压缩走位空间
  brute: 'anchor',
  shooter: 'suppress', // 远程压制：持续火力、逼你换掩体
  turret: 'suppress',
  drone: 'suppress',
  sniper: 'sniper',    // 狙击火线：远距离高威胁单点
  shield: 'guard',     // 护盾推进：正面开路
  caster: 'caster',    // 后排施法：弹幕来源
  summoner: 'caster',
  swarm: 'harass',     // 骚扰：低血高速、逼你分心
  bomber: 'harass',    // 爆破：地面危险区
  blob: 'split',       // 分裂：清场压力
};

export function roleOf(enemyId) {
  const ai = ENEMY_MAP[enemyId] && ENEMY_MAP[enemyId].ai;
  return ROLE_BY_AI[ai] || null;
}

// ------------------------------------------------------------
//  战术原型
//  roles       : 各角色希望的数量（会按预算与实际可用敌人裁剪）
//  layoutBias  : 房间形态权重（tight = 掩体多/半径小；open = 开阔多门）
//  wave        : 是否允许第二波增援，以及增援的角色构成
//  maxSniper   : 该原型的狙击手上限（防止一击线过多变成"看不见就死"）
// ------------------------------------------------------------
export const ARCHETYPES = [
  {
    id: 'press', cn: '逼位压制', roles: { anchor: 2, suppress: 2 },
    layoutBias: { tight: 1.3, open: 1.0 }, wave: { chance: 0.35, roles: { anchor: 1, suppress: 1 } },
    maxSniper: 0, note: '近战逼位 + 远程压制：被推到墙角就会被火线吃掉',
  },
  {
    id: 'snipe', cn: '狙击骚扰', roles: { sniper: 1, harass: 2, suppress: 1 },
    layoutBias: { tight: 0.8, open: 1.35 }, wave: { chance: 0.2, roles: { harass: 2 } },
    maxSniper: 1, note: '远程火线 + 小怪骚扰：先清骚扰，再绕线',
  },
  {
    id: 'shieldwall', cn: '盾阵推进', roles: { guard: 2, caster: 1, suppress: 1 },
    layoutBias: { tight: 1.15, open: 0.95 }, wave: { chance: 0.3, roles: { guard: 1, caster: 1 } },
    maxSniper: 0, note: '盾牌开路 + 后排火力：正面上不去，得绕后或破盾',
  },
  {
    id: 'summon_core', cn: '召唤护卫', roles: { caster: 1, anchor: 2 },
    layoutBias: { tight: 1.0, open: 1.1 }, wave: { chance: 0.45, roles: { anchor: 2 } },
    maxSniper: 0, note: '召唤核心 + 护卫：不切核心就会被人海拖住',
  },
  {
    id: 'demo_mobile', cn: '爆破机动', roles: { harass: 2, anchor: 1, suppress: 1 },
    layoutBias: { tight: 0.9, open: 1.2 }, wave: { chance: 0.25, roles: { harass: 2 } },
    maxSniper: 0, note: '爆破区 + 机动敌：地面危险与高速单位同时施压',
  },
  {
    id: 'elite_hub', cn: '精英中枢', roles: { anchor: 1, suppress: 1 },
    layoutBias: { tight: 1.0, open: 1.0 }, wave: { chance: 0.5, roles: { suppress: 1, harass: 1 } },
    maxSniper: 1, elite: true, note: '精英核心 + 支援：一个硬点加两翼',
  },
];

export const ARCH_MAP = Object.fromEntries(ARCHETYPES.map((a) => [a.id, a]));

const COST = (def) => (def.tier || 1) + 0.4;
const MAX_ENEMIES = 12;

// ------------------------------------------------------------
//  主入口：纯函数
//    floor  1..3
//    seed   房间种子（稳定、可复现）
//    budget 威胁预算（由 dungeon 传入，已经过楼层/距离修正）
//    layout { doors, radius, open }
//    pool   该层可用的敌人 id 数组
//  返回 { archetype, archetypeCn, note, budget, spent, enemies, waves, elite }
//  其中 waves = [] 表示单波（大多数房间）；否则 waves[i] 是第 i 个增援波的敌人数组。
// ------------------------------------------------------------
export function planEncounter({ floor = 1, seed = 1, budget = 4, layout = {}, pool = [] }) {
  const rng = new RNG((seed ^ 0x9e3779b9 ^ (floor * 2654435761)) >>> 0);

  // 该层每个角色可用的敌人（按 tier 升序，便于预算内优先选便宜的）
  const byRole = {};
  for (const id of pool) {
    const r = roleOf(id);
    if (!r) continue;
    if (!ENEMY_MAP[id]) continue;
    (byRole[r] = byRole[r] || []).push(id);
  }
  for (const k of Object.keys(byRole)) byRole[k].sort((a, b) => ENEMY_MAP[a].tier - ENEMY_MAP[b].tier);

  const open = !!layout.open;
  const usable = ARCHETYPES.filter((a) =>
    Object.keys(a.roles).some((r) => (byRole[r] || []).length > 0));

  // 按房间形态给原型加权（开阔房更可能出狙击/机动，狭长房更可能出逼位/盾阵）
  const weights = usable.map((a) => {
    const w = open ? (a.layoutBias.open ?? 1) : (a.layoutBias.tight ?? 1);
    return Math.max(0.05, w);
  });
  const total = weights.reduce((x, y) => x + y, 0);
  let roll = rng.next() * total;
  let arch = usable[usable.length - 1];
  for (let i = 0; i < usable.length; i++) { roll -= weights[i]; if (roll <= 0) { arch = usable[i]; break; } }

  // 第二波：只有一部分房间有，而且先掷骰决定，保证"复杂房必须少"（§19）
  const useWave = !!arch.wave && rng.chance(arch.wave.chance && floor > 1 ? arch.wave.chance : arch.wave.chance * 0.6);

  // 预算分配：主力波拿大头；有增援波时主动波更小、更难的那批留到第二波
  const waveFrac = useWave ? 0.62 : 1;
  const mainBudget = budget * waveFrac;
  const waveBudget = budget - mainBudget;

  const elite = !!arch.elite;

  const compose = (roleSpec, budgetLeft, { cheap = false, allowElite = false } = {}) => {
    const out = [];
    const slots = [];
    for (const [role, n] of Object.entries(roleSpec)) {
      const list = byRole[role] || [];
      if (!list.length) continue;
      for (let i = 0; i < n; i++) slots.push(role);
    }
    // 打散顺序：避免原型表里的书写顺序变成生成顺序（否则"永远是先近战后远程"）
    for (let i = slots.length - 1; i > 0; i--) { const j = rng.int(0, i); [slots[i], slots[j]] = [slots[j], slots[i]]; }
    let spent = 0;
    let snipers = 0;
    for (const role of slots) {
      if (out.length >= MAX_ENEMIES) break;
      const list = byRole[role] || [];
      if (!list.length) continue;
      // 开局低威胁：主力波偏向便宜的档位，把重单位留给增援
      const bias = cheap ? 0.55 : 1;
      const cand = list.filter((id) => {
        const def = ENEMY_MAP[id];
        if (role === 'sniper' && snipers >= (arch.maxSniper ?? 1)) return false;
        if (!allowElite && !elite && def.tier >= 4 && out.length < 2) return false;
        return true;
      });
      if (!cand.length) continue;
      // 加权：tier 越低越可能（再乘 cheap 偏向），保证"先易后难"
      const ws = cand.map((id) => { const t = ENEMY_MAP[id].tier; const base = t <= 1 ? 3 : t === 2 ? 2 : t === 3 ? 1 : 0.5; return base * (cheap && t >= 3 ? bias : 1); });
      const wt = ws.reduce((a, b) => a + b, 0);
      let r2 = rng.next() * wt, pick = cand[cand.length - 1];
      for (let i = 0; i < cand.length; i++) { r2 -= ws[i]; if (r2 <= 0) { pick = cand[i]; break; } }
      const cost = COST(ENEMY_MAP[pick]);
      if (cost > budgetLeft - spent + 1.2) continue;   // 与旧实现相同的宽容度
      out.push(pick);
      if (role === 'sniper') snipers++;
      spent += cost;
    }
    return { out, spent };
  };

  const main = compose(arch.roles, mainBudget, { cheap: useWave });
  let enemies = main.out;
  let spent = main.spent;

  const waves = [];
  if (useWave) {
    const w = compose(arch.wave.roles, waveBudget, { cheap: false, allowElite: true });
    if (w.out.length) { waves.push({ enemies: w.out, delay: 1.6 + rng.float(0, 0.8) }); spent += w.spent; }
  }

  // ------------------------------------------------------------
  //  对抗性下限：一间房如果**全是固定炮台**，玩家只需要站着点射，
  //  既没有走位压力也没有战术关系 —— 那就等于没有战斗。
  //  强制至少混入一个会移动的敌人（预算允许时用替换，否则追加最便宜的）。
  // ------------------------------------------------------------
  const isStatic = (id) => !!ENEMY_MAP[id] && ENEMY_MAP[id].ai === 'turret';
  if (enemies.length && enemies.every(isStatic)) {
    const mobile = pool.filter((id) => ENEMY_MAP[id] && !isStatic(id))
      .sort((a, b) => ENEMY_MAP[a].tier - ENEMY_MAP[b].tier);
    if (mobile.length) {
      const rep = mobile[0];
      const repCost = COST(ENEMY_MAP[rep]);
      const dropCost = COST(ENEMY_MAP[enemies[0]]);
      if (spent - dropCost + repCost <= budget + 1.2) {
        enemies = [rep, ...enemies.slice(1)];
        spent = spent - dropCost + repCost;
      } else {
        enemies = [...enemies, rep];
        spent += repCost;
      }
    }
  }

  // 兜底：任何房间都必须至少有一个敌人，否则"清房"立刻成立、房间没有意义
  if (!enemies.length) {
    const fallback = pool.filter((id) => ENEMY_MAP[id]).sort((a, b) => ENEMY_MAP[a].tier - ENEMY_MAP[b].tier)[0];
    if (fallback) { enemies = [fallback]; spent = COST(ENEMY_MAP[fallback]); }
  }

  return {
    archetype: arch.id, archetypeCn: arch.cn, note: arch.note,
    budget: +budget.toFixed(2), spent: +spent.toFixed(2),
    enemies, waves, elite, open,
  };
}
