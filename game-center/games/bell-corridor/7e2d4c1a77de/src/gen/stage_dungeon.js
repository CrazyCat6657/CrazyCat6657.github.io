// Task7/8 —— 阶段地牢的**纯生成器**。
//
// 与旧 `generateDungeon(seed, floor)` 完全独立：旧三层生成器保留给旧档与旧流程，
// 这里按阶段定义生成 3–5 房的紧凑地图（起点 + 出口/Boss + 供给 + 可选支路）。
//
// 约束（批准设计 §4）：
//   · 总房间 3–5（含起点与出口/Boss）；不是"3–5 战斗房外再追加商店/Boss"。
//   · 起点唯一；普通段恰好一个出口，章第五段恰好一个 Boss（二者不同时存在）。
//   · 移除 Boss 节点后，所有普通房仍可从起点到达；供给不得只在 Boss 背后。
//   · 不用"先生成十几房再裁剪"，而是按房间数选模板、由 stageSeed 决定变体。
// 纯函数：不读 DOM / 存档 / 玩家，不消费游戏 RNG。
import { upgradeNewChests, newChest } from '../game/chest_rules.js';
import { planShopVariant, NEW_SHOP_VARIANT } from '../game/economy.js';
import { RNG } from '../core/rng.js';
import { POOL_BY_FLOOR, WEAPONS, ITEMS, ACTIVES, ENEMY_MAP } from '../game/data.js';
import { DIRS, Dungeon } from './dungeon.js';
import { getStageDefinition } from '../game/stage_flow.js';
import {generateExpandedStageDungeon} from './expanded_stage_dungeon.js';

const K = (x, y) => x + ',' + y;
// 房间类型：start / battle / treasure / shop / exit / boss
const TEMPLATES = {
  3: [[[0, 0], 'start'], [[1, 0], 'battle'], [[2, 0], 'tail']],
  4: [[[0, 0], 'start'], [[1, 0], 'battle'], [[2, 0], 'battle'], [[3, 0], 'tail']],
  5: [[[0, 0], 'start'], [[1, 0], 'battle'], [[2, 0], 'battle'], [[2, -1], 'side'], [[3, 0], 'tail']],
};

export function generateStageDungeon(context) {
  if(context?.contentVersion===2||context?.contentVersion===3)return generateExpandedStageDungeon(context);
  if (!context || context.flowVersion !== 2) throw new Error('阶段上下文无效');
  const def = getStageDefinition(context.chapter, context.segment);
  if (!def) throw new Error('未知阶段');
  const rng = new RNG(context.stageSeed >>> 0);
  const d = new Dungeon(context.stageSeed, def.themeId);
  d.flowVersion = 2; d.chapter = context.chapter; d.segment = context.segment;
  d.stageKey = def.stageKey; d.themeId = def.themeId; d.threatProgress = def.threatProgress; d.stageSeed = context.stageSeed;

  const template = TEMPLATES[def.rooms] || TEMPLATES[3];
  const gridSize = Math.max(3, ...template.map(([[x, y]]) => Math.max(Math.abs(x), Math.abs(y)) + 1));
  d.gridSize = gridSize;
  const nodes = [];
  for (const [[gx, gy], role] of template) {
    const type = role === 'tail' ? (def.boss ? 'boss' : 'exit') : role === 'side' ? (rng.chance(0.5) ? 'shop' : 'treasure') : role;
    const room = {
      id: K(gx, gy), uid: `v2:${def.stageKey}:${K(gx, gy)}`, gx, gy, type,
      seed: (context.stageSeed ^ Math.imul(gx + 7, 0x9e3779b9) ^ Math.imul(gy + 13, 0x85ebca6b)) >>> 0,
      radius: 9 + ((gx + gy + context.stageSeed) % 3),
      doors: { n: false, s: false, e: false, w: false },
      secretWallDirs: [], dist: 0,
      isStart: type === 'start', isExit: type === 'exit', isBoss: type === 'boss',
      cleared: type === 'start', visited: type === 'start', discovered: false, entered: false,
      looted: false, locked: false, vaultEntered: false, wavesSpawned: false,
      content: roomContent(def, type, rng),
    };
    nodes.push(room);
  }
  for (const room of nodes) d.rooms.set(room.id, room);
  // 每段至少一个明确可用供给来源：普通战斗房放一个**非锁**宝箱。
  // Boss 段没有出口/商店，这条尤其必要 —— 否则第五段会完全没有补给。
  const firstBattle = nodes.find((r) => r.type === 'battle');
  const hasSupply = nodes.some((r) => r.type === 'shop' || r.type === 'treasure' || r.type === 'exit');
  if (firstBattle && !hasSupply) firstBattle.content.chests.push(newChest(new RNG(firstBattle.seed ^ 0x51c4e57), def.themeId, { unlocked: true }));
  // 门与连通性：只在**相邻格**之间连门，保证拓扑与坐标一致。
  const at = new Map(nodes.map((r) => [K(r.gx, r.gy), r]));
  for (const room of nodes) for (const dir of DIRS) {
    const nb = at.get(K(room.gx + dir.dx, room.gy + dir.dy));
    if (nb) { room.doors[dir.k] = true; nb.doors[dir.opp] = true; }
  }
  const start = nodes.find((r) => r.isStart);
  const dist = bfsFrom(d, start);
  for (const room of nodes) room.dist = dist.get(room.id) ?? 0;
  d.startId = start.id;
  d.maxDist = Math.max(...nodes.map((r) => r.dist));
  d.battleRatio = nodes.filter((r) => r.type === 'battle').length / nodes.length;
  return d;
}

function bfsFrom(d, start) {
  const seen = new Map([[start.id, 0]]), q = [start];
  while (q.length) {
    const cur = q.shift();
    for (const dir of DIRS) {
      if (!cur.doors[dir.k]) continue;
      const nb = d.get(cur.gx + dir.dx, cur.gy + dir.dy);
      if (!nb || seen.has(nb.id)) continue;
      seen.set(nb.id, seen.get(cur.id) + 1);
      q.push(nb);
    }
  }
  return seen;
}

function roomContent(def, type, rng) {
  const pool = POOL_BY_FLOOR[def.themeId] || POOL_BY_FLOOR[1];
  const threat = def.threatProgress;
  const content = { enemies: [], chests: [], shopStock: [], event: null, hazards: [], lockedDoors: [], props: [], pickups: [] };
  if (type === 'battle') {
    const count = Math.max(1, Math.min(6, 2 + Math.round(threat * 4) + rng.int(0, 1)));
    for (let i = 0; i < count; i++) content.enemies.push(rng.pick(pool));
  } else if (type === 'boss') {
    content.enemies = [];
  } else if (type === 'treasure') {
    content.chests.push({ quality: rng.chance(0.3) ? 'gold' : 'normal' });
  } else if (type === 'shop') {
    for (let i = 0; i < 4; i++) content.shopStock.push(stockEntry(rng, def.themeId));
  } else if (type === 'exit') {
    content.chests.push({ quality: 'normal' });   // 每段至少一个明确可用供给来源
  } else if (type === 'start') {
    content.pickups.push('coin');
  }
  if (content.enemies.some((id) => !ENEMY_MAP[id])) throw new Error('阶段敌人不在定义表中');
  const variantSeed = rng.seed ^ rng.s;
  if (type === 'shop') {
    content.shopStock = planShopVariant(content.shopStock, variantSeed, def.themeId, NEW_SHOP_VARIANT);
    content.shopVariant = NEW_SHOP_VARIANT;
  }
  return upgradeNewChests(content, variantSeed, def.themeId, type);
}

function stockEntry(rng, themeId) {
  const basics = ['heal', 'key', 'ammo', 'armor'];
  const roll = rng.next();
  if (roll < 0.4) { const w = rng.pick(WEAPONS.filter((x) => x.tier <= themeId + 1)) || WEAPONS[0]; return { kind: 'weapon', id: w.id, price: 18 + w.tier * 16 }; }
  if (roll < 0.7) { const it = rng.pick(ITEMS); return { kind: 'item', id: it.id, price: 22 + (it.rarity || 1) * 4 }; }
  if (roll < 0.85) { const a = rng.pick(ACTIVES); return { kind: 'active', id: a.id, price: 24 }; }
  const b = rng.pick(basics);
  return { kind: b, id: b, price: { heal: 12, key: 16, ammo: 10, armor: 26 }[b] };
}
