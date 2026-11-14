// ============================================================
//  地牢随机生成 —— 图拓扑 / 房间类型 / 秘密房 / 内容预算
//
//  设计目标（V2.0）：
//   - 普通战斗房必须仍是主体（目标占可探索内容 55%–70%）
//   - 特殊内容（商店/宝箱/祭坛/支线）是"惊喜与路线选择"，不是常态
//   - 同一敌人允许重复出现；内容池 > 单局内容（Roguelike 重复游玩的基础）
//   - Boss 不固定在终点，随机落在某一房间
// ============================================================
import { upgradeNewChests } from '../game/chest_rules.js';
import { planShopVariant, NEW_SHOP_VARIANT } from '../game/economy.js';
import { RNG } from '../core/rng.js';
import { pickWeaponByFamily } from '../game/weapon_assets_pool.js';
import { WEAPONS, LEGACY_WEAPONS, ITEMS, ACTIVES, ENEMIES, ENEMY_MAP, POOL_BY_FLOOR, SPECIAL_EVENTS } from '../game/data.js';
import { planEncounter } from './encounters.js';

export const DIRS = [
  { k: 'n', dx: 0, dy: -1, opp: 's', ang: 0 },
  { k: 's', dx: 0, dy: 1, opp: 'n', ang: Math.PI },
  { k: 'e', dx: 1, dy: 0, opp: 'w', ang: Math.PI / 2 },
  { k: 'w', dx: -1, dy: 0, opp: 'e', ang: -Math.PI / 2 },
];
export const DIR_MAP = Object.fromEntries(DIRS.map((d) => [d.k, d]));

const K = (x, y) => x + ',' + y;

// 每层规模与内容预算
const FLOOR_CFG = {
  1: { size: [8, 10], rooms: [12, 14], threat: 3.1, shop: 1, treasure: 1, treasureExtra: 0.35, special: 1, specialExtra: 0.25, vault: 0, hasExit: true, boss: false },
  2: { size: [9, 11], rooms: [13, 15], threat: 6.0, shop: 1, treasure: 1, treasureExtra: 0.45, special: 1, specialExtra: 0.30, vault: 0.50, hasExit: true, boss: false },
  3: { size: [9, 11], rooms: [13, 16], threat: 9.0, shop: 1, treasure: 1, treasureExtra: 0.50, special: 1, specialExtra: 0.30, vault: 0.45, hasExit: false, boss: true },
};

export class Dungeon {
  constructor(seed, floor) {
    this.seed = seed;
    this.floor = floor;
    this.rooms = new Map();
    this.gridSize = 0;
  }
  key(x, y) { return K(x, y); }
  get(x, y) { return this.rooms.get(K(x, y)); }
  get list() { return [...this.rooms.values()]; }
  neighborsOf(r) {
    const out = [];
    for (const d of DIRS) {
      if (!r.doors[d.k]) continue;
      const n = this.get(r.gx + d.dx, r.gy + d.dy);
      if (n) out.push({ dir: d, room: n });
    }
    return out;
  }
  // 从起点出发的最短步数（用于提示玩家 / 测试寻路）
  bfsFrom(start) {
    const dist = new Map([[start.id, 0]]);
    const q = [start];
    while (q.length) {
      const cur = q.shift();
      for (const d of DIRS) {
        if (!cur.doors[d.k]) continue;
        const n = this.get(cur.gx + d.dx, cur.gy + d.dy);
        if (!n || dist.has(n.id)) continue;
        dist.set(n.id, dist.get(cur.id) + 1);
        q.push(n);
      }
    }
    return dist;
  }
}

export function generateDungeon(seed, floor, { legacyContent = false } = {}) {
  const cfg = FLOOR_CFG[floor] || FLOOR_CFG[1];
  const rng = new RNG(seed ^ (floor * 7919));
  const d = new Dungeon(seed, floor);
  const size = rng.int(cfg.size[0], cfg.size[1]);
  d.gridSize = size;
  const targetRooms = rng.int(cfg.rooms[0], cfg.rooms[1]);
  const loopChance = rng.float(0.14, 0.34);
  const bias = DIRS[rng.int(0, 3)];
  const shapeStraight = rng.chance(0.5);

  const half = Math.floor(size / 2);
  const start = { gx: half + rng.int(-1, 1), gy: half + rng.int(-1, 1) };

  const mkRoom = (gx, gy, type) => {
    const r = {
      gx, gy, type: type || 'battle', id: K(gx, gy),
      // 全局唯一房间标识。id 只用 gx,gy 编码，跨楼层会重复
      // （各层的坐标格子是独立生成的），因此**不能**用它做"本局持久"的状态键：
      // 二层 (4,5) 的祭坛会继承一层 (4,5) 祭坛的"已使用"标记。
      uid: floor + ':' + K(gx, gy),
      doors: { n: false, s: false, e: false, w: false },
      secret: {},
      dist: 0, cleared: false, visited: false, discovered: false, entered: false, pendingCombat: 0,
      wavesSpawned: false,      // Encounter Director 的增援波是否已经排过（只排一次）
      radius: 13, isStart: false, isExit: false, isBoss: false,
      seed: (seed ^ (gx * 73856093) ^ (gy * 19349663) ^ (floor * 83492791)) >>> 0,
      content: null,
      secretWallDirs: [],
    };
    d.rooms.set(r.id, r);
    return r;
  };

  const startRoom = mkRoom(start.gx, start.gy, 'start');
  startRoom.isStart = true;
  startRoom.cleared = true;

  const inBounds = (x, y) => x >= 0 && y >= 0 && x < size && y < size;
  const neighborCount = (x, y) => DIRS.reduce((n, dd) => n + (d.rooms.has(K(x + dd.dx, y + dd.dy)) ? 1 : 0), 0);

  // ---- 生长 ----
  let attempts = 0;
  while (d.rooms.size < targetRooms && attempts < 9000) {
    attempts++;
    const list = d.list;
    const base = list[Math.floor(rng.next() * list.length)];
    const dirs = rng.shuffle(DIRS.slice());
    if (shapeStraight && rng.chance(0.55)) {
      if (legacyContent) {
        // Exact historic comparator for explicit legacy compatibility checks only.
        dirs.sort((a,b) => (a.k===bias.k?-2:0)+(rng.next()-.5)-((b.k===bias.k?-2:0)+(rng.next()-.5)));
      } else {
        const scores = new Map(dirs.map(d => [d.k, (d.k === bias.k ? -2 : 0) + rng.next() - .5]));
        dirs.sort((a,b) => scores.get(a.k) - scores.get(b.k));
      }
    }
    for (const dd of dirs) {
      const nx = base.gx + dd.dx, ny = base.gy + dd.dy;
      if (!inBounds(nx, ny)) continue;
      if (d.rooms.has(K(nx, ny))) continue;
      const nc = neighborCount(nx, ny);
      if (nc > 1) continue;
      if (nc === 1 && rng.chance(shapeStraight ? 0.5 : 0.22)) continue;
      const nr = mkRoom(nx, ny);
      base.doors[dd.k] = true;
      nr.doors[dd.opp] = true;
      break;
    }
  }
  // 保证起点至少两个出口
  if (DIRS.reduce((n, dd) => n + (startRoom.doors[dd.k] ? 1 : 0), 0) < 2) {
    for (const dd of rng.shuffle(DIRS.slice())) {
      const nx = start.gx + dd.dx, ny = start.gy + dd.dy;
      if (!inBounds(nx, ny) || d.rooms.has(K(nx, ny))) continue;
      if (neighborCount(nx, ny) > 1) continue;
      const nr = mkRoom(nx, ny);
      startRoom.doors[dd.k] = true; nr.doors[dd.opp] = true;
      if (DIRS.reduce((n, q) => n + (startRoom.doors[q.k] ? 1 : 0), 0) >= 3) break;
    }
  }

  // ---- 额外环路 ----
  for (const r of d.list) {
    for (const dd of DIRS) {
      if (r.doors[dd.k]) continue;
      const nx = r.gx + dd.dx, ny = r.gy + dd.dy;
      if (!d.rooms.has(K(nx, ny))) continue;
      const n = d.get(nx, ny);
      if (n.doors[dd.opp]) continue;
      if (rng.chance(loopChance)) {
        r.doors[dd.k] = true;
        n.doors[dd.opp] = true;
      }
    }
  }

  // ---- BFS 距离 ----
  const bfs = () => {
    for (const r of d.list) r.dist = -1;
    startRoom.dist = 0;
    const q = [startRoom];
    while (q.length) {
      const cur = q.shift();
      for (const dd of DIRS) {
        if (!cur.doors[dd.k]) continue;
        const n = d.get(cur.gx + dd.dx, cur.gy + dd.dy);
        if (!n || n.dist >= 0) continue;
        n.dist = cur.dist + 1;
        q.push(n);
      }
    }
  };
  bfs();

  const degree = (r) => DIRS.reduce((n, dd) => n + (r.doors[dd.k] ? 1 : 0), 0);
  const sortedByDist = d.list.slice().sort((a, b) => b.dist - a.dist);
  const maxDist = sortedByDist[0].dist;
  const used = new Set();
  const pickRoom = (filter, prefer) => {
    let pool = d.list.filter((r) => !used.has(r.id) && r.dist > 0 && filter(r));
    if (!pool.length) pool = d.list.filter((r) => !used.has(r.id) && r.dist > 0);
    if (!pool.length) return null;
    if (prefer) {
      const p2 = pool.filter(prefer);
      if (p2.length) pool = p2;
    }
    const r = pool[Math.floor(rng.next() * pool.length)];
    used.add(r.id);
    return r;
  };

  // ---- 分配类型 ----
  const far = (r) => r.dist >= Math.max(2, maxDist * 0.55);
  const deadEnd = (r) => degree(r) === 1;

  // ------------------------------------------------------------
  //  Boss 房放置（PASS2 终局规则修订）
  //
  //  **旧规则**：随机落在中后段房间（degree<=3，不强制最深处）。
  //  问题（实测）：第 3 层 200 个 Seed 里有 **102 个**存在"必须穿过 Boss 房才能到达"
  //  的房间，共 246 间，被挡住的包括商店与宝藏房 —— 玩家会遇到
  //  "刚打赢 Boss 就通关了，但那边还有个房间没去"的终局断裂。
  //
  //  **新规则**：Boss 房必须是**死路房（degree == 1）**，并在死路房里取 BFS 最远的那个。
  //  死路房在图上天然是端点，移除它不会切断任何其他房间 —— 这是"后面没有房间"的结构保证，
  //  不是碰运气。实测 200/200 Seed 都有可用死路房，采用后 **0 例**被挡；
  //  被选中的距离落在 3–8（平均 5.3），因此"不固定在最深处、路线每次不同"依然成立。
  //
  //  注意：**不消费 rng**（旧实现经 pickRoom 消费两次）。这样同 Seed 的其他房间类型
  //  与内容完全不变，改动面最小；而 legacy 迁移仍走旧分支，旧档逐房间可复现。
  // ------------------------------------------------------------
  if (cfg.boss) {
    if (legacyContent) {
      const bo = pickRoom((r) => r.dist >= 2 && degree(r) <= 3) || pickRoom(() => true);
      bo.type = 'boss'; bo.isBoss = true; bo.radius = 19;
    } else {
      const leaves = d.list.filter((r) => r.dist >= 2 && degree(r) === 1);
      const pool = leaves.length ? leaves : d.list.filter((r) => r.dist >= 2 && degree(r) <= 3);
      pool.sort((a, b) => (b.dist - a.dist) || (a.id < b.id ? -1 : 1));
      const bo = pool[0] || d.list.find((r) => r.type === 'start');
      bo.type = 'boss'; bo.isBoss = true; bo.radius = 19;
      // **必须占位**：pickRoom 靠 `used` 防止同一间房被重复分配。
      // 旧实现通过 pickRoom 取房，天然进了 used；新实现自己挑房，
      // 漏了这一步就会被后面的商店/宝藏/特殊房重新选中并**覆盖掉类型**
      // （实测 200 个 Seed 里有 106 个的 Boss 房被改写 —— 断言当场抓到）。
      used.add(bo.id);
    }
  }
  // 出口
  if (cfg.hasExit) {
    const ex = pickRoom(far, deadEnd) || pickRoom(() => true);
    ex.type = 'exit'; ex.isExit = true;
  }
  // 商店
  for (let i = 0; i < cfg.shop; i++) {
    const s = pickRoom((r) => r.dist >= 2);
    if (s) s.type = 'shop';
  }
  // 宝箱房
  let treasureN = cfg.treasure + (rng.chance(cfg.treasureExtra) ? 1 : 0);
  for (let i = 0; i < treasureN; i++) {
    const t = pickRoom((r) => r.dist >= 1, deadEnd);
    if (t) t.type = 'treasure';
  }
  // 特殊房（祭坛 / 铁匠 / 先知）
  let specialN = cfg.special + (rng.chance(cfg.specialExtra) ? 1 : 0);
  const events = rng.sample(SPECIAL_EVENTS, SPECIAL_EVENTS.length);
  for (let i = 0; i < specialN; i++) {
    const s = pickRoom((r) => r.dist >= 1);
    if (s) { s.type = 'special'; s.event = events[i % events.length]; }
  }
  // 风险支线：宝库（可选死路，精英 + 高额奖励）
  if (rng.chance(cfg.vault)) {
    const v = pickRoom((r) => r.dist >= 2, deadEnd);
    if (v) { v.type = 'vault'; v.optional = true; }
  }

  // ---- 隐藏房 ----
  const hiddenN = rng.int(1, 2);
  let hiddenMade = 0;
  for (const r of rng.shuffle(d.list.slice())) {
    if (hiddenMade >= hiddenN) break;
    if (r.type === 'exit' || r.type === 'boss' || r.type === 'vault') continue;
    for (const dd of rng.shuffle(DIRS.slice())) {
      if (r.doors[dd.k]) continue;
      const nx = r.gx + dd.dx, ny = r.gy + dd.dy;
      if (!inBounds(nx, ny) || d.rooms.has(K(nx, ny))) continue;
      if (neighborCount(nx, ny) !== 1) continue;
      const hr = mkRoom(nx, ny, 'hidden');
      hr.dist = r.dist + 1;
      hr.radius = 13;
      r.secretWallDirs.push({ dir: dd.k, to: hr.id });
      hr.secretWallDirs.push({ dir: dd.opp, from: r.id, isEntry: true });
      hiddenMade++;
      break;
    }
  }

  // ---- 内容生成 ----
  for (const r of d.list) r.content = buildContent(d, r, floor, rng, cfg, legacyContent);

  d.startId = startRoom.id;
  d.maxDist = maxDist;
  d.battleRatio = d.list.filter((x) => x.type === 'battle').length / d.list.length;
  return d;
}

function pickEnemyPool(floor) { return POOL_BY_FLOOR[floor] || POOL_BY_FLOOR[1]; }

// 加权抽取：tier 越低越常见 —— 让玩家先熟悉核心敌人，再逐渐遇到高威胁单位
function pickEnemyWeighted(rr, pool) {
  const w = pool.map((id) => {
    const t = ENEMY_MAP[id]?.tier ?? 1;
    return t <= 1 ? 3.0 : t === 2 ? 2.0 : t === 3 ? 1.0 : 0.55;
  });
  const total = w.reduce((a, b) => a + b, 0);
  let r = rr.next() * total;
  for (let i = 0; i < pool.length; i++) { r -= w[i]; if (r <= 0) return pool[i]; }
  return pool[pool.length - 1];
}

function buildContent(d, r, floor, rng, cfg, legacyContent) {
  const c = {
    enemies: [], chests: [], shopStock: [], event: r.event || null,
    hazards: 0, lockedDoors: false, props: [], pickups: [], elite: false,
    // Encounter Director（PASS2 §16）：archetype 记录战术原型身份，
    // waves 记录延迟增援波；单波房间 waves 为空数组。
    archetype: null, waves: [],
  };
  const rr = new RNG(r.seed);
  const distB = cfg.threat + r.dist * (0.5 + floor * 0.06);

  if (r.type === 'battle') {
    const budget0 = distB * rr.float(0.85, 1.3);
    const pool = pickEnemyPool(floor);
    // ------------------------------------------------------------
    //  **保留旧算法的 rr 消费节奏**。
    //  legacy 迁移要求"逐房间可复现"，而 chest / hazard 的抽签紧跟在敌人抽取之后 ——
    //  一旦这里少抽几次，后面所有房间的随机流都会整体错位，旧档就无法再匹配。
    //  所以照旧跑一遍旧的加权抽取，只用来推进 rr；实际编成改由 Encounter Director 决定。
    // ------------------------------------------------------------
    let legacyBudget = budget0, guard = 0;
    const legacyEnemies = [];
    while (legacyBudget > 0.9 && guard++ < 26) {
      const kind = pickEnemyWeighted(rr, pool);
      const cost = ENEMY_MAP[kind].tier + 0.4;
      if (cost > legacyBudget + 1.2) continue;
      legacyEnemies.push(kind);
      legacyBudget -= cost;
    }
    if (legacyEnemies.length === 0) legacyEnemies.push(pool[0]);
    if (legacyContent) {
      c.enemies = legacyEnemies;
    } else {
      const deg = DIRS.reduce((n, dd) => n + (r.doors[dd.k] ? 1 : 0), 0);
      const plan = planEncounter({
        floor, seed: r.seed, budget: budget0, pool,
        layout: { doors: deg, radius: r.radius, open: deg >= 3 && r.radius >= 13 },
      });
      c.enemies = plan.enemies;
      c.archetype = plan.archetype;
      c.waves = plan.waves;          // [] = 单波；只有少数房间有增援
      if (plan.elite) c.elite = true;
    }
    // 战斗房奖励（不是每间都给，保持"偶尔惊喜"）
    if (rr.chance(0.26 + floor * 0.02)) {
      // 上锁概率下调（0.20 → 0.12）：玩家实测反馈"需要钥匙的宝箱明显比钥匙多"
      c.chests.push({ quality: rr.chance(0.12) ? 'locked' : 'normal' });
    }
    c.hazards = rr.int(0, floor === 1 ? 1 : 2);
  } else if (r.type === 'start') {
    c.props = ['brazier', 'brazier'];
  } else if (r.type === 'treasure') {
    const n = rr.int(1, 2);
    for (let i = 0; i < n; i++) c.chests.push({ quality: rr.chance(floor >= 2 ? 0.20 : 0.10) ? 'locked' : (rr.chance(0.35) ? 'gold' : 'normal') });
    // 宝藏房固定治疗：确定性来源保留（玩家能预期），第三层额外 +1（§1.2 深层补给不足）
    c.pickups.push('heal');
    if (floor >= 3) c.pickups.push('heal');
    if (rr.chance(0.4)) c.enemies.push(...rr.sample(pickEnemyPool(floor), rr.int(1, 2)));
  } else if (r.type === 'shop') {
    // 第三层使用高级库存（§28）：优先 tier>=3，让"钱到终局仍有用途"。
    // 仍然只抽**一次**（rr 抽取次数不变），保证与旧算法/旧档的随机流对齐。
    const weaponDefinitions = legacyContent ? LEGACY_WEAPONS : WEAPONS;
    const premium = !legacyContent && floor >= 3 && weaponDefinitions.some((w2) => w2.tier >= 3);
    const wPool = premium ? weaponDefinitions.filter((w2) => w2.tier >= 3) : weaponDefinitions.filter((w2) => (floor === 1 ? w2.tier <= 3 : w2.tier >= 2));
    const w = legacyContent ? rr.pick(wPool) : pickWeaponByFamily(rr,wPool);
    const it = rr.pick(ITEMS);
    const act = rr.pick(ACTIVES);
    // §28：至少 1 件资源商品；第三层必给治疗（深层"治疗不足"是明确反馈）
    const basics = premium ? ['heal', rr.pick(['key', 'ammo', 'armor'])] : rr.sample(['heal', 'key', 'ammo', 'armor'], 2);
    // Keep the historic random draw schedule, but bind identity to the same choice.
    // Legacy generation is used only for explicit schema migration; never reroll stock.
    c.shopStock = [
      { kind: 'weapon', id: w.id, price: Math.round((18 + w.tier * 16) * (1 + (floor - 1) * 0.22) * rr.float(0.9, 1.15)) },
      (() => { const item = rr.chance(0.6), oldId = rr.chance(0.6) ? it.id : act.id;
        return { kind: item ? 'item' : 'active', id: legacyContent ? oldId : (item ? it.id : act.id), price: Math.round((22 + rr.int(0, 10)) * (1 + (floor - 1) * 0.2)) }; })(),
      ...basics.map((b) => ({ kind: b, id: b, price: { heal: 12, key: 16, ammo: 10, armor: 26 }[b] + (floor - 1) * 4 })),
    ];
  } else if (r.type === 'special') {
    c.chests.push({ quality: rr.chance(0.70) ? 'normal' : 'locked' });
  } else if (r.type === 'hidden') {
    // 隐藏房是"探索奖励"，不该再用钥匙卡住：金色或普通，绝不上锁
    c.chests.push({ quality: rr.chance(0.55) ? 'gold' : 'normal' });
    c.pickups = ['key', 'heal'];
    if (rr.chance(0.5)) c.pickups.push('weapon_crate');
  } else if (r.type === 'vault') {
    // 精英战斗 + 必出高额奖励（宝箱与祭坛由 RoomScene 放置）
    const pool = pickEnemyPool(floor);
    const n = rr.int(3, 5);
    for (let i = 0; i < n; i++) c.enemies.push(rr.pick(pool.filter((x) => (ENEMY_MAP[x]?.tier ?? 1) >= 2)) || pool[0]);
    c.elite = true;
    c.hazards = 2;
  } else if (r.type === 'boss') {
    c.enemies = [];
  } else if (r.type === 'exit') {
    // 下楼前的补给：一/二层收到 1（原本 2 —— 实测一/二层偏宽裕），第三层保持 2
    c.pickups = floor >= 3 ? ['heal', 'heal'] : ['heal'];
    c.enemies = rr.sample(pickEnemyPool(floor), rr.int(2, 3));
  }
  // 通用散落物
  if (r.type !== 'start' && r.type !== 'shop') {
    const extra = rr.int(0, 2);
    // 散落治疗权重按层分流（PASS2 §1.1/§1.2）：一/二层 1 票，第三层 2 票。
    // 注意是**按来源**调整，不是把所有治疗统一乘一个系数。
    const pool = floor >= 3 ? ['coin', 'coin', 'heal', 'heal', 'ammo', 'key'] : ['coin', 'coin', 'heal', 'ammo', 'key'];
    for (let i = 0; i < extra; i++) c.pickups.push(rr.pick(pool));
  }
  if (!legacyContent) {
    upgradeNewChests(c, r.seed, floor, r.type);
    if (r.type === 'shop') {
      c.shopStock = planShopVariant(c.shopStock, r.seed, floor, NEW_SHOP_VARIANT);
      c.shopVariant = NEW_SHOP_VARIANT;
    }
  }
  return c;
}

export function roomRadius(r) { return r.radius; }

export function enemyListForFloor(floor) {
  return ENEMIES.filter((e) => e.floor === floor);
}

export { FLOOR_CFG };
