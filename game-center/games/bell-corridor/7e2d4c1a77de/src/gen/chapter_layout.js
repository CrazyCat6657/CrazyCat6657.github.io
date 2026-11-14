// Runtime topology port of WorkBuddy round 10 (1f6c0fe). Content is planned separately.
import { RNG } from '../core/rng.js';
import { getStageDefinition } from '../game/stage_flow.js';
import {getStageProfile as getProfile,isShopSegment} from '../game/stage_profiles.js';

export const SCHEMA = 'chapter-layout/v2';
const BOUND_MIN = 0;
const BOUND_MAX = 10;
const ORIGIN = 5; // 0 基网格，避开小地图与存档对负坐标的假设
const DIRS = [
  { k: 'n', dx: 0, dy: -1, opp: 's' },
  { k: 's', dx: 0, dy: 1, opp: 'n' },
  { k: 'e', dx: 1, dy: 0, opp: 'w' },
  { k: 'w', dx: -1, dy: 0, opp: 'e' },
];
const key = (x, y) => `${x},${y}`;

function fnv1a(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619) >>> 0;
  return h >>> 0;
}

export function generateChapterLayout({ seed, chapter, segment, profile, hidden = false }) {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw new Error('seed 必须是 0–0xffffffff 的整数');
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > 3) throw new Error('chapter 必须是 1–3');
  if (!Number.isInteger(segment) || segment < 1 || segment > 5) throw new Error('segment 必须是 1–5');
  const prof = getProfile(profile);if(prof.contentVersion!==2&&prof.contentVersion!==3)throw Error('Expanded layout requires an expanded profile');
  const def = getStageDefinition(chapter, segment);
  if (!def) throw new Error('未知阶段');

  const baseSeed = (seed ^ fnv1a(`chapter-layout-v${prof.contentVersion}:${prof.id}`)) >>> 0;
  for (let attempt = 0; attempt < 80; attempt++) {
    const rng = new RNG((baseSeed + Math.imul(attempt, 0x9e3779b9)) >>> 0);
    const built = tryBuild(rng, prof, chapter, segment, def);
    if(built&&prof.contentVersion===3&&hidden&&!appendHidden(built,rng))continue;
    if (built) {
      return {
        schema: prof.contentVersion===3?'chapter-layout/v3':SCHEMA,
        profile: prof.id,
        seed,
        chapter,
        segment,
        stageKey: def.stageKey,
        themeId: def.themeId,
        
        rooms: built.rooms,
        edges: built.edges,
        ...(prof.contentVersion===3?{secretEdges:built.secretEdges||[]}:{}),
        
      };
    }
  }
  throw new Error(`原型生成失败: ${prof.id} c${chapter}s${segment} seed=${seed}`);
}

function tryBuild(rng, prof, chapter, segment, def) {
  const targetRooms = rng.int(prof.rooms[0], prof.rooms[1]);
  const maxBranchTotal = prof.branchCount[1] * prof.branchLen[1];
  const minBranchTotal = prof.branchCount[0] * prof.branchLen[0];
  const lo = Math.max(prof.spine[0], targetRooms - maxBranchTotal);
  const hi = Math.min(prof.spine[1], targetRooms - minBranchTotal);
  if (lo > hi) return null;
  const spineLen = rng.int(lo, hi);
  const remaining = targetRooms - spineLen;
  const plans = planBranches(rng, remaining, prof);
  if (!plans) return null;

  const rooms = [];
  const byKey = new Map();
  const edges = [];

  const canPlace = (x, y, parent) => {
    if (x < BOUND_MIN || x > BOUND_MAX || y < BOUND_MIN || y > BOUND_MAX) return false;
    if (byKey.has(key(x, y))) return false;
    for (const d of DIRS) {
      const n = byKey.get(key(x + d.dx, y + d.dy));
      if (n && n.id !== parent.id) return false;
    }
    return true;
  };

  const add = (x, y, role, parent) => {
    const r = {
      id: key(x, y), x, y, role, type: 'battle',
      
    };
    rooms.push(r);
    byKey.set(r.id, r);
    if (parent) edges.push([parent.id, r.id]);
    return r;
  };

  // ---- 主线 ----
  let cur = add(ORIGIN, ORIGIN, 'spine', null);
  let dir = DIRS[rng.int(0, 3)];
  const spine = [cur];
  let guard = 0;
  while (spine.length < spineLen && guard++ < 200) {
    const options = DIRS.filter((d) => d.k !== dir.opp);
    let chosen = null;
    // 55% 继续同向，其余转向；都能放才生效
    if (rng.chance(0.55) && canPlace(cur.x + dir.dx, cur.y + dir.dy, cur)) chosen = dir;
    else {
      for (const d of rng.shuffle(options.slice())) {
        if (canPlace(cur.x + d.dx, cur.y + d.dy, cur)) { chosen = d; break; }
      }
    }
    if (!chosen) {
      for (const d of rng.shuffle(DIRS.slice())) {
        if (canPlace(cur.x + d.dx, cur.y + d.dy, cur)) { chosen = d; break; }
      }
    }
    if (!chosen) return null;
    dir = chosen;
    cur = add(cur.x + dir.dx, cur.y + dir.dy, 'spine', cur);
    spine.push(cur);
  }
  if (spine.length !== spineLen) return null;

  // ---- 支路 ----
  const branchPoints = [];
  for (const len of plans) {
    let placed = false;
    const candidates = rng.shuffle(spine.slice(1, -1).filter((r) => !branchPoints.includes(r)));
    for (const base of candidates) {
      const dirs = rng.shuffle(DIRS.slice());
      for (const d of dirs) {
        if (!canPlace(base.x + d.dx, base.y + d.dy, base)) continue;
        // 半途失败必须回滚：否则残留房间会让总房数超出档位（实测 large 出现 16 房）
        const mark = { rooms: rooms.length, edges: edges.length };
        let node = add(base.x + d.dx, base.y + d.dy, 'branch', base);
        let dd = d;
        let ok = true;
        for (let i = 1; i < len; i++) {
          const opts = DIRS.filter((x) => x.k !== dd.opp);
          let next = null;
          for (const t of rng.shuffle(opts.slice())) {
            if (canPlace(node.x + t.dx, node.y + t.dy, node)) { next = t; break; }
          }
          if (!next) { ok = false; break; }
          dd = next;
          node = add(node.x + dd.dx, node.y + dd.dy, 'branch', node);
        }
        if (ok) { branchPoints.push(base); placed = true; break; }
        for (const r of rooms.splice(mark.rooms)) byKey.delete(r.id);
        edges.length = mark.edges;
      }
      if (placed) break;
    }
    if (!placed) return null;
  }

  // ---- 类型与预算 ----
  
  spine[0].type = 'start';
  const end = spine[spine.length - 1];
  end.type = def.boss ? 'boss' : 'exit';

  const spineInner = spine.slice(1, -1);
  // 免费补给：主线上、终点之前，位置随 seed 在 40%–75% 处摆动
  const supplySlots = Math.max(1, Math.min(prof.freeChests[1], Math.floor(spineInner.length / 2)));
  const used = new Set();
  for (let i = 0; i < supplySlots; i++) {
    const bandLo = Math.floor(spineInner.length * (0.35 + i * 0.2));
    const bandHi = Math.max(bandLo, Math.min(spineInner.length - 1, Math.floor(spineInner.length * (0.6 + i * 0.2))));
    let idx = rng.int(bandLo, bandHi);
    let tries = 0;
    while (used.has(idx) && tries++ < 20) idx = rng.int(bandLo, bandHi);
    if (used.has(idx)) continue;
    used.add(idx);
    spineInner[idx].type = 'treasure';
  }
  if (!spineInner.some((r) => r.type === 'treasure')) spineInner[Math.floor(spineInner.length * 0.5)].type = 'treasure';

  // 支路内容：商店段必须有一条支路是商店，其余按 seed 分配
  const branchRooms = rooms.filter((r) => r.role === 'branch');
  const firstOfBranch = branchRooms.filter((r) => {
    const parentInSpine = edges.some(([a, b]) => b === r.id && spine.some((s) => s.id === a));
    return parentInSpine;
  });
  const shopNeeded = isShopSegment(chapter, segment,prof.contentVersion);
  let shopPlaced = false;
  // 只用生产里已有消费者的房型：treasure / shop / special / vault。
  // 不再自造 elite 房型，避免接线时多一个 RoomScene 分支。
  const optionalPool = ['treasure', 'special', 'vault'];
  // New expeditions reward the actual branch terminal, rather than its entry.
  const branchTerminals=branchRooms.filter(r=>!edges.some(([a])=>a===r.id));
  for (const r of prof.contentVersion===3?branchTerminals:firstOfBranch) {
    if (prof.contentVersion!==3&&shopNeeded && !shopPlaced) { r.type = 'shop'; shopPlaced = true; continue; }
    r.type = prof.contentVersion===3&&!rng.chance(.85)?'battle':rng.pick(optionalPool);
  }
  if(prof.contentVersion===3&&shopNeeded){
    const specialTerminals=branchTerminals.filter(r=>r.type!=='battle');
    const shop=specialTerminals.length?rng.pick(specialTerminals):spineInner.find(r=>r.type==='battle');
    if(shop){shop.type='shop';shopPlaced=true;}
  }
  if (shopNeeded && !shopPlaced && spineInner.length) {
    // 兜底：商店放在主线中段，仍不越过终点
    spineInner[Math.floor(spineInner.length / 2)].type = 'shop';
  }
  for (const r of rooms) {
    if (r.type === 'start' || r.type === 'battle') continue;
    if (r.type === 'exit' || r.type === 'boss') continue;
    if (r.type === 'treasure' || r.type === 'shop' || r.type === 'special' || r.type === 'vault') continue;
    r.type = 'battle';
  }

  

  
  return { rooms, edges };
}

function appendHidden(built,rng){
  const byKey=new Map(built.rooms.map(r=>[r.id,r]));
  for(const parent of rng.shuffle(built.rooms.filter(r=>!['boss','exit','vault'].includes(r.type)))){
    for(const dir of rng.shuffle(DIRS.slice())){
      const x=parent.x+dir.dx,y=parent.y+dir.dy;
      if(x<BOUND_MIN||x>BOUND_MAX||y<BOUND_MIN||y>BOUND_MAX||byKey.has(key(x,y)))continue;
      if(DIRS.filter(d=>byKey.has(key(x+d.dx,y+d.dy))).length!==1)continue;
      built.rooms.push({id:key(x,y),x,y,role:'hidden',type:'hidden'});
      built.secretEdges=[[parent.id,key(x,y)]];
      return true;
    }
  }
  return false;
}

function planBranches(rng, remaining, prof) {
  if (remaining <= 0) return null;
  const out = [];
  let rem = remaining;
  let guard = 0;
  while (rem > 0 && guard++ < 20) {
    const maxLen = Math.min(prof.branchLen[1], rem);
    const minLen = Math.min(prof.branchLen[0], maxLen);
    const len = rng.int(minLen, maxLen);
    out.push(len);
    rem -= len;
  }
  if (rem !== 0) return null;
  if (out.length < prof.branchCount[0] || out.length > prof.branchCount[1]) return null;
  return out;
}

