// ============================================================
//  Portal —— 房间之间“门”的唯一语义真源
//
//  在此之前，"门"被四套逻辑各自理解：
//    · gen/dungeon.js 的 room.doors        （地图连通性）
//    · RoomScene.secretWallDirs/secretOpen （隐藏房暗门）
//    · Game.updateConnectors               （走廊生成）
//    · tools/harness.mjs 的路径规划        （自动化导航）
//  结果是"地图认为这里能过、运行时却过不去"这类不一致，难以定位。
//
//  现在改为：房间构建完成后生成 Portal 列表，
//  Connector 生成 / 可行走并集 / 换房判定 / 战斗锁门 / 自动导航 全部从它读。
//
//  注意：Portal 只描述"通过关系"，不持有几何。
//  真正的走廊几何仍由 ConnectorScene 负责。
// ============================================================
import { DOOR_W } from '../core/constants.js';

const DIRV = {
  n: { x: 0, z: -1, ax: true },
  s: { x: 0, z: 1, ax: true },
  e: { x: 1, z: 0, ax: false },
  w: { x: -1, z: 0, ax: false },
};

/**
 * 为某个房间生成 Portal 列表。
 * @param game
 * @param room     当前 Room 数据
 * @param scene    已构建的 RoomScene（用于取门洞位置与规避障碍）
 */
export function buildPortals(game, room, scene) {
  const out = [];
  if (!room || !scene) return out;
  const o = game.roomOffset(room);
  const half = scene.half;          // 房间外墙平面到中心的距离
  const inner = scene.inner;        // 内墙面
  for (const dir of ['n', 's', 'e', 'w']) {
    const v = DIRV[dir];
    const secret = (room.secretWallDirs || []).find((x) => x.dir === dir);
    const isSecret = !!secret;
    const hasDoor = !!room.doors[dir] || isSecret;
    if (!hasDoor) continue;

    const nb = game.dungeon.get(room.gx + v.x, room.gy + v.z);
    // 门洞中心：沿该方向推到内墙面
    const cx = o.ox + v.x * inner;
    const cz = o.oz + v.z * inner;
    const threshold = { x: o.ox + v.x * half, z: o.oz + v.z * half };
    // 当前房侧的安全接近点：门洞中心再往房内退 2.8，并做一次障碍规避
    let af = { x: o.ox + v.x * (inner - 2.8), z: o.oz + v.z * (inner - 2.8) };
    af = safeNear(scene, af, o, v, inner);

    // 隔壁侧的安全点：隔壁此刻可能还没建，无法探测障碍，
    // 因此退到"隔壁房内离门 3.2"的直线点上（玩家实际落点由走廊穿越决定，这里只服务回走）
    let at = null;
    if (nb) {
      const no = game.roomOffset(nb);
      const ni = (nb.radius || 13) - 0.8;
      at = { x: no.ox - v.x * (ni - 3.2), z: no.oz - v.z * (ni - 3.2) };
    }

    const combatLocked = false;      // 由 Game.syncDoorLocks 统一刷新
    out.push({
      id: `${room.uid || room.id}:${dir}`,
      dir,
      fromUid: room.uid || room.id,
      toUid: nb ? (nb.uid || nb.id) : null,
      neighbor: nb,
      secret: isSecret,
      get revealed() { return !isSecret || !!secret.isEntry || !!scene.secretOpen?.has(dir); },
      center: { x: cx, z: cz },
      threshold,
      normal: { x: v.x, z: v.z },
      axis: v.ax ? 'z' : 'x',
      halfWidth: DOOR_W / 2,
      approachFrom: af,
      approachTo: at,
      combatLocked,
      // 现在能不能真的走过去
      get traversable() {
        if (!this.toUid) return false;
        if (this.secret && !this.revealed) return false;
        if (this.combatLocked) return false;
        return true;
      },
    });
  }
  return out;
}

/**
 * 把接近点挪到一个不压障碍的位置：优先原位置，其次沿门法线再退、再横向偏移。
 * 这里用 RoomScene.pointBlocked（真实移动碰撞）判定，语义与玩家一致。
 */
function safeNear(scene, pt, o, v, inner) {
  const center = { x: o.ox, z: o.oz };
  // 候选顺序：先"门正前方、离门近"，再"侧向让开"，最后"整体退向房间中心"。
  // 关键判据不只是"这个点本身是否通畅"，而是**从房间中心到它的连线是否通畅** ——
  // 出口房的楼梯正好挡在北门之前时，门前的点本身是合法的，
  // 但玩家从房间中心根本走不过去（会被楼梯挡住），于是导航必然超时。
  // 这类点必须被排除。
  const cand = [];
  for (const lat of [0, 1.8, -1.8, 3.2, -3.2]) {
    cand.push({ x: o.ox + v.x * (inner - 2.8) + v.z * lat, z: o.oz + v.z * (inner - 2.8) + v.x * lat });
  }
  for (const back of [1.2, 2.2, 3.2, 4.4, 5.6]) {
    const d = inner - 2.8 - back;
    if (d < 2.4) break;
    cand.push({ x: o.ox + v.x * d, z: o.oz + v.z * d });
    cand.push({ x: o.ox + v.x * d + v.z * 2.0, z: o.oz + v.z * d + v.x * 2.0 });
    cand.push({ x: o.ox + v.x * d - v.z * 2.0, z: o.oz + v.z * d - v.x * 2.0 });
  }
  for (const c of cand) {
    if (scene.pointBlocked(c.x, c.z, 0.75, 0.9)) continue;
    if (scene.hazardAt(c.x, c.z, 0.9)) continue;
    if (!segmentClear(scene, center, c, 0.7)) continue;
    return c;
  }
  return pt;
}

// 中心 → 目标 的连线是否全程通畅（粗采样即可，只用于排除"被大障碍截断"的点）
function segmentClear(scene, a, b, r) {
  const dx = b.x - a.x, dz = b.z - a.z;
  const steps = Math.max(2, Math.ceil(Math.hypot(dx, dz) / 0.6));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    if (scene.pointBlocked(a.x + dx * t, a.z + dz * t, r, 0.9)) return false;
  }
  return true;
}
