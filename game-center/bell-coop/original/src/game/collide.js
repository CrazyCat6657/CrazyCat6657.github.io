// ============================================================
//  共用碰撞解算（房间 / 走廊 / 枢纽共用同一套语义）
//
//  V3.0 起，"可行走区域"不再等于"一个房间的矩形"，而是
//     房间矩形 ∪ 若干走廊矩形
//  的并集。这里把两件事抽出来共用：
//    1) 圆 vs 轴对齐盒的推出（含速度投影，保证贴墙滑行手感）
//    2) 把点夹回矩形并集（不在任何矩形里时，夹到最近的那个）
//  房间内部仍然只做局部坐标解算，由调用方负责世界/局部换算。
// ============================================================

/** 圆 vs 轴对齐盒的推出，并抹掉指向墙内的法向速度（所以贴墙滑行是顺的）。 */
export function pushOutOfBoxes(e, r, colliders, minTop = 0.5) {
  for (const c of colliders) {
    if (!c.move || c.top < minTop) continue;
    const cx = Math.max(c.minx, Math.min(e.x, c.maxx));
    const cz = Math.max(c.minz, Math.min(e.z, c.maxz));
    const dx = e.x - cx, dz = e.z - cz;
    const d2 = dx * dx + dz * dz;
    if (d2 > r * r) continue;
    if (d2 > 0.0001) {
      const d = Math.sqrt(d2);
      e.x = cx + (dx / d) * r;
      e.z = cz + (dz / d) * r;
      if (e.vx !== undefined) {
        const ndx = dx / d, ndz = dz / d;
        const vn = e.vx * ndx + e.vz * ndz;
        if (vn < 0) { e.vx -= vn * ndx; e.vz -= vn * ndz; }
      }
    } else {
      // 圆心在盒内 → 推向最近的那条边
      const dl = e.x - c.minx, dr = c.maxx - e.x, dt2 = e.z - c.minz, db = c.maxz - e.z;
      const m = Math.min(dl, dr, dt2, db);
      if (m === dl) e.x = c.minx - r;
      else if (m === dr) e.x = c.maxx + r;
      else if (m === dt2) e.z = c.minz - r;
      else e.z = c.maxz + r;
    }
  }
}

export function insideRect(rect, x, z, pad = 0) {
  return x >= rect.x0 - pad && x <= rect.x1 + pad && z >= rect.z0 - pad && z <= rect.z1 + pad;
}

/** 点到矩形的"夹取后距离"（点在内部时为 0）。 */
function rectDist(rect, x, z) {
  const cx = Math.max(rect.x0, Math.min(x, rect.x1));
  const cz = Math.max(rect.z0, Math.min(z, rect.z1));
  return Math.hypot(x - cx, z - cz);
}

/**
 * 把 (x,z) 夹进矩形并集。
 *  - 已经在某个矩形内（按半径 r 收缩后）→ 返回 null，表示"位置本身没问题"。
 *  - 否则夹到**最近**的矩形边缘，返回 {x,z}。
 * 并集里相邻矩形之间用"门洞矩形"衔接，所以最近矩形夹取不会把人瞬移穿墙。
 */
export function clampToRects(x, z, r, rects) {
  if (!rects.length) return null;
  // NaN 防御：非有限坐标会让 rectDist 全部返回 NaN ⇒ best 保持 null ⇒ 读 lim.x0 直接抛异常。
  // 这一抛发生在主渲染循环里（loop() 没有 try/catch），会把整局卡死。
  // 所以这里安静返回 null（= 不做夹取），把"为什么会有 NaN"交给探针在源头抓。
  if (!Number.isFinite(x) || !Number.isFinite(z) || !Number.isFinite(r)) return null;
  for (const rc of rects) if (insideRect(rc, x, z, -r)) return null;
  let best = null, bestD = Infinity;
  for (const rc of rects) {
    const d = rectDist(rc, x, z);
    if (d < bestD) { bestD = d; best = rc; }
  }
  const lim = best;
  return {
    x: Math.max(lim.x0 + r, Math.min(lim.x1 - r, x)),
    z: Math.max(lim.z0 + r, Math.min(lim.z1 - r, z)),
  };
}

// Ordinary enemies share the real room/corridor geometry. Resolve the complete
// displacement in radius-sized steps, including instantaneous hero knockback;
// a final-position push alone lets a fast actor cross a thin wall entirely.
// Boss movement deliberately retains its own resolver and teleport rules.
export function resolveEnemyMovement(e, world, previous) {
  if (!e || e.isBoss || e.boss) return false;
  const r = e.r ?? e.radius ?? .5;
  if (!Number.isFinite(r) || r <= 0) return false;
  const scenes = world.activeScenes?.() || (world.roomScene ? [world.roomScene] : []);
  const rects = world.walkRects?.() || scenes.flatMap(sc => sc.rectWorld ? [sc.rectWorld()] : []);
  if (!rects.length) return false;
  // Flying bodies pass low cover, but still collide with walls and tall pillars.
  const minTop = e.def?.fly || ['floater', 'drone'].includes(e.def?.model) ? 1.8 : .5;
  const safe = p => rects.some(rc => insideRect(rc, p.x, p.z, -r + 1e-7)) && scenes.every(sc => {
    const ox = sc.room?.type === 'connector' ? 0 : sc.ox || 0;
    const oz = sc.room?.type === 'connector' ? 0 : sc.oz || 0;
    for (const c of sc.colliders || []) {
      if (!c.move || c.top < minTop) continue;
      const x = p.x - ox, z = p.z - oz;
      const dx = x - Math.max(c.minx, Math.min(x, c.maxx));
      const dz = z - Math.max(c.minz, Math.min(z, c.maxz));
      if (dx * dx + dz * dz < r * r - 1e-7) return false;
    }
    return true;
  });
  const project = p => {
    for (let pass = 0; pass < 4; pass++) {
      const cl = clampToRects(p.x, p.z, r, rects);
      if (cl) { p.x = cl.x; p.z = cl.z; }
      for (const sc of scenes) {
        const ox = sc.room?.type === 'connector' ? 0 : sc.ox || 0;
        const oz = sc.room?.type === 'connector' ? 0 : sc.oz || 0;
        p.x -= ox; p.z -= oz;
        pushOutOfBoxes(p, r, sc.colliders || [], minTop);
        p.x += ox; p.z += oz;
      }
      if (safe(p)) return true;
    }
    return false;
  };
  const desired = { x: e.x, z: e.z };
  let start = { x: previous?.x ?? e.x, z: previous?.z ?? e.z };
  if (![start.x, start.z, desired.x, desired.z].every(Number.isFinite)) return false;
  if (!safe(start)) {
    if (!project(start)) {
      // Restore an already displaced/saved actor to nearby real floor, without
      // killing it, moving the player, or changing the room's combat state.
      let found = null;
      for (const rc of rects) {
        const cx = Math.max(rc.x0 + r, Math.min(rc.x1 - r, start.x));
        const cz = Math.max(rc.z0 + r, Math.min(rc.z1 - r, start.z));
        for (const radius of [0, r, 2 * r, 4 * r, 8 * r, 16 * r, 32 * r]) {
          for (let i = 0; i < (radius ? 24 : 1); i++) {
            const p = { x: cx + Math.cos(i * Math.PI / 12) * radius, z: cz + Math.sin(i * Math.PI / 12) * radius };
            if (safe(p)) { found = p; break; }
          }
          if (found) break;
        }
        if (found) break;
      }
      if (!found) return false;
      start = found;
    }
    e.x = start.x; e.z = start.z;
    if (e.vx !== undefined) { e.vx = 0; e.vz = 0; }
    // Recovery has no trusted pre-collision path; don't replay an invalid saved
    // displacement after placing the actor back onto playable floor.
    if (!previous) { syncEnemyPosition(e); return true; }
  }
  e.x = start.x; e.z = start.z;
  const dx = desired.x - start.x, dz = desired.z - start.z;
  const stride = Math.max(.04, Math.min(.3, r * .5));
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / stride));
  // Bounded work for malformed extreme impulses; partial travel still obeys
  // continuous collision rather than making a single unsafe giant step.
  const count = Math.min(steps, 4096), sx = dx / steps, sz = dz / steps;
  for (let i = 0; i < count; i++) {
    const before = { x: e.x, z: e.z }, candidate = { x: e.x + sx, z: e.z + sz, vx: e.vx, vz: e.vz };
    if (!project(candidate)) break;
    e.x = candidate.x; e.z = candidate.z;
    if (e.vx !== undefined) {
      e.vx = candidate.vx; e.vz = candidate.vz;
      if (Math.abs(candidate.x - before.x - sx) > 1e-6) e.vx = 0;
      if (Math.abs(candidate.z - before.z - sz) > 1e-6) e.vz = 0;
    }
    if (Math.hypot(e.x - before.x, e.z - before.z) < 1e-8) break;
  }
  syncEnemyPosition(e);
  return Math.hypot(e.x - desired.x, e.z - desired.z) > 1e-6;
}

function syncEnemyPosition(e) {
  if (e.group?.position) { e.group.position.x = e.x; e.group.position.z = e.z; }
}
