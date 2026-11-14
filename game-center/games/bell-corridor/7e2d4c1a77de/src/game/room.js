import {bossChestLoot} from './chapter_rewards.js';
import {combatPlayers} from '../experimental/consumables/visibility.js';
// ============================================================
//  房间场景构建 —— 地板 / 墙体 / 门 / 道具 / 灯光 / 危险区
//  所有房间的几何都构建在原点，进出房间时整体重建
// ============================================================
import * as THREE from '../../vendor/three.module.js';
import { TILE, WALL_T, WALL_H, DOOR_W, FLOOR_THEME } from '../core/constants.js';
import {
  getTexture, getMaterial, getTileTex, getTiledMaterial, PAL, palFor,
  boxGeo, planeGeo, cylGeo, coneGeo, torusGeo, ringGeo,
} from '../art/materials.js';
import { RNG } from '../core/rng.js';
import { pushOutOfBoxes } from './collide.js';
import * as P from '../art/props.js';
import { chestRules, chestFields, rollTierLoot } from './chest_rules.js';
import { makeDoorFrame, makeDoorBarrier, makeChest, makeStairs, makePedestal, makeAltar, makeSecretWall } from '../art/props.js';
import { buildNPC } from '../art/models.js';
import { audio } from '../core/audio.js';
import { SHOP_SERVICES } from './economy.js';

const SIDES = [
  { k: 'n', nx: 0, nz: -1, ax: 1, az: 0 },
  { k: 's', nx: 0, nz: 1, ax: 1, az: 0 },
  { k: 'e', nx: 1, nz: 0, ax: 0, az: 1 },
  { k: 'w', nx: -1, nz: 0, ax: 0, az: 1 },
];

export class RoomScene {
  constructor(game, room, ox = 0, oz = 0) {
    this.game = game;
    this.room = room;
    this.rng = new RNG(room.seed);
    // 世界偏移：房间内部的建造仍然全部在**局部坐标**（以房间中心为原点）完成，
    // 只把整个 group 平移过去，并在"世界坐标 ↔ 局部坐标"的查询入口做一次换算。
    // 这样做的收益是房间之间可以**真实相邻**：走廊是真正存在于世界里的几何，
    // 玩家走过去没有任何坐标跳变（V3.0 无缝连接的基础）。
    this.ox = ox;
    this.oz = oz;
    this.group = new THREE.Group();
    this.group.position.set(ox, 0, oz);
    game.scene.add(this.group);
    this.colliders = [];
    this.props = [];
    this.hazards = [];
    this.doorways = {};
    this.secretDoors = {};
    this.secretFrames = {};
    this.secretOpen = new Set();
    this.destroyedProps = new Set();
    this.npcs = [];
    this.lightSpecs = [];
    this.half = room.radius;
    this.inner = this.half - WALL_T / 2;
    this.theme = FLOOR_THEME[game.floor];
    this.t = game.platform?.entityPhase ? game.platform.entityPhase('room:'+room.uid,game.seed)*10 : Math.random()*100;
    this.build();
  }

  // ================= 基础工具 =================
  // ---------- 世界 / 局部坐标换算 ----------
  // 所有对外查询（碰撞、夹取、危险区）都接收**世界坐标**；
  // 内部一律在局部坐标里计算，避免给每个碰撞盒都存一份偏移版本。
  toLocal(x, z) { return { x: x - this.ox, z: z - this.oz }; }
  toWorld(x, z) { return { x: x + this.ox, z: z + this.oz }; }
  // 本房间在世界中的矩形（用于"房间 ∪ 走廊"的可行走区域求并集）
  rectWorld() {
    return { x0: -this.inner + this.ox, x1: this.inner + this.ox, z0: -this.inner + this.oz, z1: this.inner + this.oz, kind: 'room', ref: this };
  }
  // 点是否落在本房间的可行走矩形内（含门洞外延）
  containsWorld(x, z, r = 0) {
    const l = this.toLocal(x, z);
    return Math.abs(l.x) <= this.inner + r && Math.abs(l.z) <= this.inner + r;
  }

  addCollider(minx, maxx, minz, maxz, top, opts = {}) {
    const c = {
      minx, maxx, minz, maxz, top,
      bullet: opts.bullet !== false, move: opts.move !== false, ref: opts.ref || null,
    };
    this.colliders.push(c);
    return c;
  }

  addBox(w, h, d, x, y, z, mat, ry = 0) {
    const m = new THREE.Mesh(boxGeo(w, h, d), mat);
    m.position.set(x, y, z);
    m.rotation.y = ry;
    m.castShadow = true; m.receiveShadow = true;
    this.group.add(m);
    return m;
  }

  // ================= 构建 =================
  build() {
    const r = this.room;
    const theme = this.theme;
    this.buildFloor();
    this.buildWalls();
    this.buildDoors();
    this.buildDecor();
    const newBoss=r.type==='boss'&&this.game.stage?.contentVersion===3;
    if(newBoss){
      this.buildBossArena();
      for(const p of this.props)if(p.object){p.worldX=p.object.position.x+this.ox;p.worldZ=p.object.position.z+this.oz;}
    }
    this.buildContent();
    this.buildLights();
    if (r.type === 'boss'&&!newBoss) this.buildBossArena();

    // 归一化道具世界坐标。
    // 部分道具（阶梯 stairs / 祭坛 altar / 熔岩池 lava / 商品台 pedestal 等）是直接
    // props.push 入列的，未经过 place()，因而没有 worldX/worldZ。而交互判定
    // (Game.nearestInteractable) 与危险判定 (RoomScene 危险区) 都依赖这两个字段，
    // 缺失时 Math.hypot 会得到 NaN、判定恒为 false，导致"楼梯永远无法下楼、
    // 祭坛永远无法使用、熔岩池永远不烫人"。这里统一从 object.position 补齐。
    for (const p of this.props) {
      if (!p || !p.object || !p.object.position) continue;
      if (!Number.isFinite(p.worldX)) p.worldX = p.object.position.x + this.ox;
      if (!Number.isFinite(p.worldZ)) p.worldZ = p.object.position.z + this.oz;
    }
    this.propCatalog = new Map(this.props.map((p, i) => {
      p.saveId = `${this.room.uid || this.room.id}:prop:${i}`;
      return [p.saveId, p];
    }));
  }

  // 根据楼层与房间类型选地板贴图（返回名字，贴图本身走全局缓存）
  floorTexName() {
    const f = this.game.floor;
    if (f === 3) return this.room.type === 'boss' ? 'floor_ritual' : (this.rng.chance(0.4) ? 'floor_obsidian' : 'floor_throne');
    if (f === 2) {
      if (this.room.type === 'boss') return 'floor_ritual';
      if (this.rng.chance(0.35)) return 'floor_obsidian';
      return 'floor_basalt';
    }
    if (this.room.type === 'hidden') return 'floor_moss';
    if (this.rng.chance(0.3)) return 'floor_moss';
    if (this.rng.chance(0.18)) return 'floor_metal';
    return 'floor_stone';
  }

  buildFloor() {
    const half = this.half;
    const size = half * 2 + 0.6;
    const rep = Math.round(size / (TILE * 2));
    this._floorTex = this.floorTexName();
    // 关键性能点：不再每房间 clone 贴图 / 新建材质，全部走缓存
    const m = getTiledMaterial(this._floorTex, this.rng, rep, rep, { roughness: 0.94, metalness: 0.02 });
    const floor = new THREE.Mesh(planeGeo(size, size), m);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    this.group.add(floor);
    this.floorMesh = floor;

    // 边缘压条
    const edgeMat = this.edgeMat();
    for (const s of SIDES) {
      const w = s.k === 'n' || s.k === 's' ? size : 0.8;
      const d = s.k === 'n' || s.k === 's' ? 0.8 : size;
      this.addBox(w, 0.22, d, s.nx * (half - 0.4), 0.11, s.nz * (half - 0.4), edgeMat);
    }
  }

  edgeMat() {
    const f = this.game.floor;
    return getMaterial(f === 3 ? '#1c1008' : f === 2 ? '#20120c' : '#1c262e', { flat: true, roughness: 0.95 });
  }

  wallTexName() {
    const f = this.game.floor;
    const base = f === 3 ? 'wall_throne' : f === 2 ? 'wall_abyss' : 'wall_brick';
    if (this.rng.chance(0.45)) return base + '_carved';
    return base;
  }

  buildWalls() {
    const half = this.half;
    const mat = getTiledMaterial(this.wallTexName(), this.rng, 1, 2, { roughness: 0.92, metalness: 0.03 });
    const matDark = getMaterial(this.game.floor === 3 ? '#1a0f07' : this.game.floor === 2 ? '#1e1009' : '#141d24', { flat: true, roughness: 0.95 });
    const seg = 3.0;
    const len = half * 2 + WALL_T;
    const n = Math.round(len / seg);
    const step = len / n;

    for (const s of SIDES) {
      const door = this.room.doors[s.k];
      const secret = this.room.secretWallDirs.find((x) => x.dir === s.k);
      const hasOpening = door || secret;
      const gapHalf = door ? DOOR_W / 2 : (secret ? 3.2 : 0);
      const dirAxis = s.ax;   // 沿墙方向
      for (let i = 0; i < n; i++) {
        const u = -len / 2 + step * (i + 0.5);
        if (hasOpening && Math.abs(u) < gapHalf + step * 0.5) continue;
        const w = dirAxis ? step : WALL_T;
        const d = dirAxis ? WALL_T : step;
        const px = dirAxis ? u : s.nx * half;
        const pz = dirAxis ? s.nz * half : u;
        this.addBox(w, WALL_H, d, px, WALL_H / 2, pz, mat);
      }
      // 墙体碰撞
      if (dirAxis) {
        this.addCollider(-len / 2, len / 2, s.nz * half - WALL_T / 2, s.nz * half + WALL_T / 2, WALL_H);
        if (hasOpening) {
          // 门洞两侧的碰撞
          const c1 = this.colliders[this.colliders.length - 1];
          c1.minx = -len / 2; c1.maxx = -gapHalf;
          this.addCollider(gapHalf, len / 2, s.nz * half - WALL_T / 2, s.nz * half + WALL_T / 2, WALL_H);
        }
      } else {
        this.addCollider(s.nx * half - WALL_T / 2, s.nx * half + WALL_T / 2, -len / 2, gapHalf * 0 + len / 2, WALL_H);
        if (hasOpening) {
          const c1 = this.colliders[this.colliders.length - 1];
          c1.maxz = -gapHalf;
          this.addCollider(s.nx * half - WALL_T / 2, s.nx * half + WALL_T / 2, gapHalf, len / 2, WALL_H);
        }
      }
      // 压顶装饰
      const capW = dirAxis ? len : WALL_T + 0.4;
      const capD = dirAxis ? WALL_T + 0.4 : len;
      this.addBox(capW, 0.4, capD, dirAxis ? 0 : s.nx * half, WALL_H + 0.2, dirAxis ? s.nz * half : 0, matDark);

      if (secret && !secret.isEntry) {
        const sw = makeSecretWall(this.game.floor, gapHalf * 2, WALL_H);
        const ang = Math.atan2(s.nx, s.nz);
        sw.object.position.set(s.nx * half, 0, s.nz * half);
        sw.object.rotation.y = dirAxis ? 0 : Math.PI / 2;
        this.group.add(sw.object);
        sw.collider.world = {
          minx: (dirAxis ? -gapHalf : s.nx * half - WALL_T / 2),
          maxx: (dirAxis ? gapHalf : s.nx * half + WALL_T / 2),
          minz: (dirAxis ? s.nz * half - WALL_T / 2 : -gapHalf),
          maxz: (dirAxis ? s.nz * half + WALL_T / 2 : gapHalf),
        };
        const col = this.addCollider(sw.collider.world.minx, sw.collider.world.maxx, sw.collider.world.minz, sw.collider.world.maxz, WALL_H, { ref: sw });
        sw.colliderRef = col;
        this.props.push(sw);
        this.secretDoors[s.k] = sw;
      }
    }
  }

  buildDoors() {
    const half = this.half;
    for (const s of SIDES) {
      const door = this.room.doors[s.k];
      const secret = this.room.secretWallDirs.find((x) => x.dir === s.k);
      if (!door && !secret) continue;
      const dirAxis = s.ax;
      const cx = s.nx * half, cz = s.nz * half;
      // 门框
      const frame = makeDoorFrame(this.rng, this.game.floor);
      frame.object.position.set(cx, 0, cz);
      frame.object.rotation.y = dirAxis ? 0 : Math.PI / 2;
      this.group.add(frame.object);
      if (secret && !secret.isEntry) { frame.object.visible = false; this.secretFrames[s.k] = frame.object; }
      // 走廊
      if (door) {
        const corrLen = 12;
        const fmat = getTiledMaterial(this._floorTex || this.floorTexName(), this.rng, 4, Math.round(corrLen / 4), { roughness: 0.95 });
        const floor = new THREE.Mesh(planeGeo(DOOR_W, corrLen), fmat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(cx + s.nx * corrLen / 2, -0.02, cz + s.nz * corrLen / 2);
        this.group.add(floor);
        const wm = getMaterial(this.game.floor === 3 ? '#241408' : this.game.floor === 2 ? '#2a1710' : '#26333b', { flat: true, roughness: 0.95 });
        // 走廊侧墙
        for (let i = 0; i < 3; i++) {
          const d0 = 2 + i * 4;
          for (const side of [-1, 1]) {
            const offx = dirAxis ? side * (DOOR_W / 2 + WALL_T / 2) : 0;
            const offz = dirAxis ? 0 : side * (DOOR_W / 2 + WALL_T / 2);
            this.addBox(dirAxis ? WALL_T : corrLen / 3, WALL_H, dirAxis ? corrLen / 3 : WALL_T,
              cx + s.nx * d0 + offx, WALL_H / 2, cz + s.nz * d0 + offz, wm);
          }
        }
        // 尽头暗门
        this.addBox(dirAxis ? DOOR_W + WALL_T * 2 : WALL_T, WALL_H, dirAxis ? WALL_T : DOOR_W + WALL_T * 2,
          cx + s.nx * corrLen, WALL_H / 2, cz + s.nz * corrLen, wm);
        // 障碍门
        const barrier = makeDoorBarrier(this.game.floor);
        barrier.object.position.set(cx + s.nx * 1.0, 0, cz + s.nz * 1.0);
        barrier.object.rotation.y = dirAxis ? 0 : Math.PI / 2;
        barrier.object.visible = false;
        this.group.add(barrier.object);
        const bc = this.addCollider(
          cx + s.nx * 1.0 - (dirAxis ? DOOR_W / 2 : 0.3), cx + s.nx * 1.0 + (dirAxis ? DOOR_W / 2 : 0.3),
          cz + s.nz * 1.0 - (dirAxis ? 0.3 : DOOR_W / 2), cz + s.nz * 1.0 + (dirAxis ? 0.3 : DOOR_W / 2),
          WALL_H, { ref: barrier }
        );
        this.doorways[s.k] = { barrier, collider: bc, dir: s, open: true };
      }
    }
  }

  buildDecor() {
    const r = this.room;
    const half = this.inner;
    const theme = this.theme;
    // 墙饰
    const wallSlots = [];
    for (const s of SIDES) {
      const n = s.ax ? Math.floor(half / 4) : Math.floor(half / 4);
      for (let i = 0; i < n; i++) {
        const u = -half + 2.5 + i * (half * 2 - 5) / Math.max(1, n - 1);
        if (this.room.doors[s.k] && Math.abs(u) < DOOR_W) continue;
        const px = s.ax ? u : s.nx * (this.half - 0.9);
        const pz = s.ax ? s.nz * (this.half - 0.9) : u;
        wallSlots.push({ x: px, z: pz, s });
      }
    }
    this.rng.shuffle(wallSlots);
    let torches = Math.min(wallSlots.length, r.type === 'boss' ? 4 : 4);
    for (let i = 0; i < torches; i++) {
      const slot = wallSlots[i];
      const torch = P.makeTorch(this.rng, this.game.floor);
      torch.object.position.set(slot.x, 2.4, slot.z);
      torch.object.rotation.y = Math.atan2(-slot.s.nx, -slot.s.nz);
      this.group.add(torch.object);
      this.props.push(torch);
      if (!this.game._warming) this.game.particles.smoke(slot.x + slot.s.nx * -0.2, 2.9, slot.z + slot.s.nz * -0.2, 1, '#2a2a2a', 0.4, 1.4);
    }
    // 旗帜
    const bannerN = this.rng.int(0, 2);
    for (let i = 0; i < bannerN; i++) {
      const slot = wallSlots[torches + i];
      if (!slot) break;
      const b = P.makeBanner(this.game.floor);
      b.object.position.set(slot.x + slot.s.nx * -0.15, 3.4, slot.z + slot.s.nz * -0.15);
      b.object.rotation.y = Math.atan2(-slot.s.nx, -slot.s.nz);
      this.group.add(b.object);
      this.props.push(b);
    }
    // 蛛网 / 锁链 / 管道
    if (this.rng.chance(0.5)) { const c = P.makeCobweb(this.rng); c.object.position.set(this.rng.float(-half * 0.7, half * 0.7), 0, this.rng.float(-half * 0.7, half * 0.7)); this.group.add(c.object); this.props.push(c); }
    if (this.rng.chance(this.game.floor >= 2 ? 0.7 : 0.35)) { const c = P.makeChains(this.rng, this.game.floor); this.group.add(c.object); this.props.push(c); }
    if (this.rng.chance(this.game.floor >= 2 ? 0.6 : 0.3)) { const c = P.makePipes(this.rng, this.game.floor); this.group.add(c.object); this.props.push(c); }
    // ---- 三层结构语言（PASS3 §4）----
    // 只负责"剪影与节奏"，全部**不参与碰撞**（§48：美术轮不改平衡）。
    const F = this.game.floor;
    let used = torches + bannerN;
    if (F === 1 && this.rng.chance(0.6)) {
      const slot = wallSlots[used++];
      if (slot) {
        const a = P.makeArch(this.rng, F);
        a.object.position.set(slot.x + slot.s.nx * -0.35, 0, slot.z + slot.s.nz * -0.35);
        a.object.rotation.y = Math.atan2(-slot.s.nx, -slot.s.nz);
        this.group.add(a.object); this.props.push(a);
      }
    }
    if (F === 2 && this.rng.chance(0.65)) {
      const b = P.makeRivetBeam(this.rng, F);
      b.object.position.set(this.rng.float(-half * 0.3, half * 0.3), this.rng.float(4.4, 5.2), this.rng.float(-half * 0.5, half * 0.5));
      b.object.rotation.y = this.rng.chance(0.5) ? 0 : Math.PI / 2;
      this.group.add(b.object); this.props.push(b);
    }
    if (F === 3) {
      const n = r.type === 'boss' ? 4 : 2;
      for (let i = 0; i < n; i++) {
        const slot = wallSlots[used + i];
        if (!slot) break;
        const c = P.makeGrandColumn(this.rng, F);
        c.object.position.set(slot.x + slot.s.nx * -1.0, 0, slot.z + slot.s.nz * -1.0);
        this.group.add(c.object); this.props.push(c);
      }
      if (r.type === 'boss') { const d = P.makeDais(this.rng, F); this.group.add(d.object); this.props.push(d); }
    }
    if (this.game.floor >= 2 && this.rng.chance(0.4)) { const c = P.makeCog(this.rng, this.game.floor); c.object.position.set(this.rng.float(-half * 0.7, half * 0.7), 0, this.rng.float(-half * 0.7, half * 0.7)); this.group.add(c.object); this.props.push(c); }
    if (this.game.floor >= 2 && this.rng.chance(0.55)) {
      const c = P.makeCrystal(this.rng, this.game.floor === 3 ? '#ffd06a' : '#ff8a3c');
      c.object.position.set(this.rng.float(-half * 0.75, half * 0.75), 0, this.rng.float(-half * 0.75, half * 0.75));
      this.group.add(c.object); this.props.push(c);
    }
    // 地面杂物
    for (let i = 0; i < this.rng.int(2, 5); i++) {
      const b = P.makeBones(this.rng);
      b.object.position.set(this.rng.float(-half * 0.85, half * 0.85), 0, this.rng.float(-half * 0.85, half * 0.85));
      this.group.add(b.object); this.props.push(b);
    }
    for (let i = 0; i < this.rng.int(2, 4); i++) {
      const b = P.makeRubble(this.rng, this.game.floor);
      b.object.position.set(this.rng.float(-half * 0.9, half * 0.9), 0, this.rng.float(-half * 0.9, half * 0.9));
      this.group.add(b.object); this.props.push(b);
    }
  }

  // ================= 内容与布局 =================
  freeSpot(minDist, placed, avoidCenter, avoidDoors, extra = []) {
    for (let attempt = 0; attempt < 60; attempt++) {
      const m = this.inner - 1.4;
      const x = this.rng.float(-m, m), z = this.rng.float(-m, m);
      if (avoidCenter && Math.hypot(x, z) < 5.0) continue;
      let ok = true;
      for (const p of placed) { if (Math.hypot(p.x - x, p.z - z) < p.r + minDist) { ok = false; break; } }
      if (!ok) continue;
      for (const e of extra) { if (Math.hypot(e.x - x, e.z - z) < e.r + minDist) { ok = false; break; } }
      if (!ok) continue;
      if (avoidDoors) {
        let bad = false;
        for (const s of SIDES) {
          if (!this.room.doors[s.k]) continue;
          const dx = s.nx * this.half, dz = s.nz * this.half;
          if (Math.hypot(dx - x, dz - z) < 6.0) { bad = true; break; }
        }
        if (bad) continue;
      }
      return { x, z };
    }
    return null;
  }

  place(prop, x, z, opts = {}) {
    prop.object.position.set(x, 0, z);
    if (opts.rot) prop.object.rotation.y = opts.rot;
    else prop.object.rotation.y = this.rng.float(0, Math.PI * 2) * (prop.kind === 'crate' || prop.kind === 'pot' ? 1 : 0.15);
    this.group.add(prop.object);
    if (prop.collider) {
      const hw = prop.collider.hw, hd = prop.collider.hd;
      const rot = prop.object.rotation.y;
      let minx, maxx, minz, maxz;
      if (Math.abs(Math.sin(rot)) > 0.5) { minx = x - hd; maxx = x + hd; minz = z - hw; maxz = z + hw; }
      else { minx = x - hw; maxx = x + hw; minz = z - hd; maxz = z + hd; }
      const c = this.addCollider(minx, maxx, minz, maxz, prop.collider.h + (prop.collider.y || 0), {
        ref: prop, bullet: prop.blocksBullet !== false, move: prop.blocksMove !== false,
      });
      prop.colliderRef = c;
    }
    prop.worldX = x + this.ox; prop.worldZ = z + this.oz;
    prop.localX = x; prop.localZ = z;
    this.props.push(prop);
    return prop;
  }

  // 战斗房布局变体 —— 让每间战斗房的空间结构明显不同
  placeArenaLayout(layout, placed, isArena) {
    const R = (p) => { placed.push({ x: p.worldX, z: p.worldZ, r: (p.collider ? Math.max(p.collider.hw, p.collider.hd) : 0.6) + 0.4 }); };
    const putCover = (x, z, kind) => {
      const k = kind || this.rng.pick(['table', 'table', 'crate', 'crate', 'shelf']);
      let prop;
      if (k === 'table') prop = P.makeTable(this.rng, this.game.floor);
      else if (k === 'crate') prop = P.makeCrate(this.rng, this.game.floor);
      else if (k === 'barrel') prop = P.makeBarrel(this.rng, true);
      else prop = P.makeShelf(this.rng, this.game.floor);
      if (this.pointBlocked(x, z, 0.7, 0.9)) return false;
      this.place(prop, x, z);
      R(prop);
      return true;
    };
    const putPillar = (x, z, rot = 0) => {
      if (this.pointBlocked(x, z, 1.0, 0.9)) return false;
      const prop = P.makePillar(this.rng, this.game.floor);
      this.place(prop, x, z, { rot });
      R(prop);
      return true;
    };

    if (!isArena) {
      const n = this.room.type === 'hidden' ? this.rng.int(0, 2) : this.rng.int(1, 2);
      for (let i = 0; i < n; i++) {
        const s = this.freeSpot(2.4, placed, true, true);
        if (s) putCover(s.x, s.z);
      }
      return;
    }

    const m = this.inner - 3.0;
    switch (layout) {
      case 'pillars':
        for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) putPillar(sx * m * 0.62, sz * m * 0.62);
        for (let i = 0; i < 2; i++) { const s = this.freeSpot(2.6, placed, true, true); if (s) putCover(s.x, s.z); }
        break;
      case 'corners':
        for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) putCover(sx * m * 0.78, sz * m * 0.78, this.rng.pick(['crate', 'crate', 'barrel']));
        for (let i = 0; i < this.rng.int(1, 2); i++) { const s = this.freeSpot(3.0, placed, true, true); if (s) putCover(s.x, s.z); }
        break;
      case 'ring': {
        const k = this.rng.int(5, 6);
        for (let i = 0; i < k; i++) {
          const a = (i / k) * Math.PI * 2 + this.rng.float(-0.2, 0.2);
          putPillar(Math.cos(a) * m * 0.66, Math.sin(a) * m * 0.66);
        }
        break;
      }
      case 'barrels': {
        // 桶阵：原本在 (±3.4,0)/(0,±3.4) 摆成十字，但若该轴上正好有门，
        // 桶就堵在门正前方 —— 玩家"看得见门却走不过去"。这里按门所在轴让开。
        const off = 2.7;
        const bx = this.room.doors.n || this.room.doors.s ? off : 0;
        const bz = this.room.doors.e || this.room.doors.w ? off : 0;
        for (const [sx, sz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const px = sx * 3.4 + (sx === 0 ? bx * (this.rng.chance(0.5) ? 1 : -1) : this.rng.float(-0.5, 0.5));
          const pz = sz * 3.4 + (sz === 0 ? bz * (this.rng.chance(0.5) ? 1 : -1) : this.rng.float(-0.5, 0.5));
          putCover(px, pz, 'barrel');
        }
        for (let i = 0; i < this.rng.int(2, 3); i++) { const s = this.freeSpot(2.6, placed, true, true); if (s) putCover(s.x, s.z, this.rng.pick(['crate', 'table'])); }
        break;
      }
      case 'duel': {
        // 对垒：两根柱子沿主轴对峙。同样要避开"门前正位"，否则南北向房间会被堵死。
        const off = 2.9;
        const shift = this.room.doors.n || this.room.doors.s ? off : 0;
        putPillar(shift, -m * 0.55); putPillar(-shift, m * 0.55);
        for (const [sx, sz] of [[1, 1], [-1, -1]]) putCover(sx * m * 0.7, sz * m * 0.7, 'crate');
        break;
      }
      default: {  // scatter
        const n = this.rng.int(2, 4);
        for (let i = 0; i < n; i++) {
          const s = this.freeSpot(2.4, placed, true, true);
          if (s) putCover(s.x, s.z);
        }
        if (this.rng.chance(0.35)) { const s = this.freeSpot(3.2, placed, true, true); if (s) putCover(s.x, s.z, 'barrel'); }
        break;
      }
    }
  }

  buildContent() {
    const r = this.room;
    const content = r.content || {};
    const placed = [];
    const R = (p) => { placed.push({ x: p.worldX, z: p.worldZ, r: (p.collider ? Math.max(p.collider.hw, p.collider.hd) : 0.6) + 0.4 }); };

    // ---- 战斗房 / 通用：掩体与可破坏物（战斗房使用布局变体）----
    const isArena = r.type === 'battle' || r.type === 'exit' || r.type === 'vault';
    const layout = isArena ? this.rng.pick(['scatter', 'pillars', 'corners', 'ring', 'barrels', 'duel']) : 'scatter';
    this.arenaLayout = isArena ? layout : null;
    this.placeArenaLayout(layout, placed, isArena);
    // 柱子（非布局化房间的零散柱子）
    const pillarN = r.type === 'boss' || layout === 'pillars' || layout === 'ring' ? 0 : this.rng.int(0, 3);
    for (let i = 0; i < pillarN; i++) {
      const prop = P.makePillar(this.rng, this.game.floor);
      const s = this.freeSpot(3.6, placed, true, true);
      if (!s) continue;
      this.place(prop, s.x, s.z, { rot: 0 });
      R(prop);
    }
    // 罐子 / 小物
    for (let i = 0; i < this.rng.int(0, 4); i++) {
      const prop = P.makePot(this.rng, this.game.floor);
      const s = this.freeSpot(1.4, placed, false, false);
      if (!s) continue;
      this.place(prop, s.x, s.z);
      R(prop);
    }
    // 危险机关
    const hazN = content.hazards || 0;
    for (let i = 0; i < hazN; i++) {
      const kind = this.game.floor === 2 ? this.rng.pick(['spike', 'flame', 'spike', 'lava']) : this.rng.pick(['spike', 'flame', 'arrow']);
      let prop;
      if (kind === 'spike') prop = P.makeSpikeTrap(this.rng, this.game.floor);
      else if (kind === 'flame') prop = P.makeFlameVent(this.rng, this.game.floor);
      else if (kind === 'lava') prop = P.makeLavaPool(this.rng);
      else prop = P.makeArrowWall(this.rng, this.game.floor);
      const s = this.freeSpot(4.0, placed, true, true);
      if (!s) continue;
      if (kind === 'arrow') {
        // 贴墙放置并朝向室内
        const side = SIDES[this.rng.int(0, 3)];
        const px = side.ax ? s.x : side.nx * (this.half - 1.0);
        const pz = side.ax ? side.nz * (this.half - 1.0) : s.z;
        this.place(prop, px, pz, { rot: Math.atan2(-side.nx, -side.nz) });
      } else this.place(prop, s.x, s.z);
      R(prop);
    }
    // 蜡烛柱（氛围）
    for (let i = 0; i < this.rng.int(1, 3); i++) {
      const prop = P.makeBrazier(this.rng, this.game.floor);
      const s = this.freeSpot(3.0, placed, true, true);
      if (!s) continue;
      this.place(prop, s.x, s.z);
      R(prop);
    }
    // 雕像
    if (r.type === 'battle' && this.rng.chance(0.3)) {
      const prop = P.makeStatue(this.rng, this.game.floor);
      const s = this.freeSpot(4.0, placed, true, true);
      if (s) { this.place(prop, s.x, s.z, { rot: this.rng.float(-0.6, 0.6) + Math.PI }); R(prop); }
    }

    // ---- 宝箱 ----
    // chestIndex = content.chests 的原数组序号，作为路线供给的稳定 sourceOrdinal
    // （不用 props 索引、不用坐标 —— 换房/恢复后必须不变）。
    const chestList = content.chests || [];
    for (let ci = 0; ci < chestList.length; ci++) {
      const ch = chestList[ci];
      const chest = makeChest(this.rng, ch);
      let s = this.freeSpot(4.0, placed, true, true);
      if (r.type === 'treasure') s = { x: this.rng.float(-this.inner * 0.6, this.inner * 0.6), z: this.rng.float(-this.inner * 0.6, this.inner * 0.6) };
      if(ch.bossReward){
        const candidates=[];
        for(const z of [this.inner*.20,0,-this.inner*.20])for(const x of [(ci%2?1:-1)*3.2,(ci%2?1:-1)*5.2,0])candidates.push({x,z});
        for(let x=-this.inner+2;x<=this.inner-2;x+=1.2)for(let z=-this.inner+2;z<=this.inner-2;z+=1.2)candidates.push({x,z});
        s=candidates.find(p=>!this.pointBlocked(p.x+this.ox,p.z+this.oz,1.1,.9)&&!this.hazardAt(p.x+this.ox,p.z+this.oz,1.1)&&placed.every(q=>Math.hypot(p.x-q.x,p.z-q.z)>2));
        if(!s)throw Error('首领奖励箱没有安全落点');
      }
      if (!s) continue;
      this.place(chest, s.x, s.z, { rot: this.rng.float(0, 6.28) });
      R(chest);
      chest.chestIndex = ci;
      // 宝箱灯
      this.lightSpecs = this.lightSpecs || [];
      this.lightSpecs.push({ x: s.x, y: 1.6, z: s.z, color: chestRules(ch).color, intensity: 4.5, distance: 8, flicker: 0.12 });
      chest.loot = ch.bossReward?bossChestLoot(this.rollLoot(ch),this.rng):this.rollLoot(ch);
      chest.bossReward=!!ch.bossReward;
      if(chest.bossReward){chest.object.visible=!!this.room.cleared;if(chest.colliderRef){chest.colliderRef.move=!!this.room.cleared;chest.colliderRef.bullet=!!this.room.cleared;}}
    }

    // ---- 商店 ----
    if (r.type === 'shop') this.buildShop(content, placed);
    // ---- 特殊房 ----
    if (r.type === 'special') this.buildSpecial(content, placed);
    // ---- 出口 ----
    // 旧流程：exit 房有阶梯。章节流程（flowVersion 2）：章末的 Boss 房在首领倒下后就是出口，
    // 所以那里也要生成阶梯（交互时由 useStageStairs 检查房间是否已清理）。
    if (r.type === 'exit' || (r.type === 'boss' && this.game.flowVersion === 2)) {
      const stairs = makeStairs(this.game.floor);
      stairs.object.position.set(0, 0, -this.inner * 0.45);
      this.group.add(stairs.object);
      this.props.push(stairs);
      this.exitProp = stairs;
    }
    // ---- 隐藏房 ----
    if (r.type === 'hidden') {
      const c = P.makeCrystal(this.rng, '#7affd2');
      c.object.position.set(0, 0, -this.inner * 0.5);
      this.group.add(c.object);
    }
    // ---- 风险支线：宝库 ----
    if (r.type === 'vault') {
      const z0 = -this.inner * 0.52;
      const vault = makeChest(this.rng, content.vaultChest || 'gold');
      this.place(vault, 0, z0, { rot: 0 });
      R(vault);
      vault.loot = this.rollLoot(content.vaultChest || { quality: 'gold' });
      const altar = makeAltar(this.game.floor);
      this.place(altar, -this.inner * 0.55, this.inner * 0.42, { rot: 0.4 });
      R(altar);
      this.altarProp = altar;
      // 熔金池：高风险标识
      for (let i = 0; i < 2; i++) {
        const lv = P.makeLavaPool(this.rng);
        const px = (i ? 1 : -1) * this.inner * 0.5, pz = this.inner * 0.05;
        lv.object.position.set(px, 0, pz);
        this.group.add(lv.object);
        this.props.push(lv);
        // 注意：**不要**手工写 worldX/worldZ —— px/pz 是局部坐标。
        // build() 末尾会统一从 object.position（局部）加上房间偏移补齐世界坐标；
        // 这里若写死局部值，反而会让"有限值"通过检查、把危险区钉到房间外面的错误位置。
      }
      this.lightSpecs = this.lightSpecs || [];
      this.lightSpecs.push({ x: 0, y: 2.0, z: z0, color: 0xffd24a, intensity: 6.5, distance: 13, flicker: 0.12 });
    }
    // ---- 散落拾取 ----
    // ---- 散落拾取 ----
    // 坐标一律**世界坐标**：消费方是 game.spawnRoomContent → pickups.spawn(world)，
    // 而 freeSpot() 返回的是房间局部坐标。曾经直接把局部值当世界值用，
    // 在带偏移的房间里道具会被生成到房间外面（墙里）——看不见也捡不到。
    this.pickupSpots = [];
    for (const pk of (content.pickups || [])) {
      const s = this.freeSpot(1.8, [], false, false);
      if (s) this.pickupSpots.push({ kind: pk, x: s.x + this.ox, z: s.z + this.oz });
    }
    this.enemySpots = this.computeEnemySpots(content.enemies?.length || 0);
  }

  computeEnemySpots(n) {
    const spots = [];
    const inner = this.inner;
    for (let i = 0; i < n; i++) {
      for (let a = 0; a < 40; a++) {
        const ang = this.rng.float(0, Math.PI * 2);
        const rad = this.rng.float(inner * 0.25, inner * 0.82);
        const x = Math.cos(ang) * rad, z = Math.sin(ang) * rad;
        if (Math.hypot(x, z) < 4.2) continue;
        let ok = true;
        for (const s of SIDES) {
          if (!this.room.doors[s.k]) continue;
          if (Math.hypot(s.nx * this.half - x, s.nz * this.half - z) < 5.0) { ok = false; break; }
        }
        if (!ok) continue;
        for (const c of this.colliders) {
          if (x > c.minx - 0.9 && x < c.maxx + 0.9 && z > c.minz - 0.9 && z < c.maxz + 0.9 && c.top > 0.6) { ok = false; break; }
        }
        if (!ok) continue;
        for (const sp of spots) { if (Math.hypot(sp.x - x, sp.z - z) < 2.6) { ok = false; break; } }
        if (!ok) continue;
        // 对外暴露**世界坐标**（消费方 game.spawnEnemy 走世界空间 + clampToRoom）。
        // 曾经这里返回局部值：clampToRoom 会把越界的局部值钳到房间边缘，
        // 结果是"敌人全部被钉在同一面墙上"，而不会报任何错。
        spots.push({ x: x + this.ox, z: z + this.oz });
        break;
      }
    }
    return spots;
  }

  rollLoot(chest) {
    if (!chestRules(chest).legacy) return rollTierLoot(chest, this.rng, this.game.floor, this.game.mod_ || {}, this.game.player?.items || []);
    const rng = this.rng;
    const floor = this.game.floor;
    const md = this.game.mod_ || {};
    // 挑战词条「余烬诅咒 · lootUp」：战利品品质提升 ——
    // 普通箱按概率升格为鎏金箱（鎏金箱多一次掉落），这是真实可验证的规则变化。
    let q = chest.quality;
    if (md.lootUp && q === 'normal' && rng.chance(0.35 * md.lootUp)) q = 'gold';
    const gold = q === 'gold';
    const locked = q === 'locked';
    const rolls = gold ? 2 : 1;
    const out = [];
    for (let i = 0; i < rolls; i++) {
      const p = rng.next();
      if (p < 0.5) {
        out.push({ kind: 'weapon', id: this.game.rollWeaponId(gold ? 1 : 0).id });
      } else if (p < 0.82) {
        const it = this.game.rollItemId(out.filter(l => l.kind === 'item').map(l => l.id));
        // 挑战词条「铁粮」：回复类物品（带 heal 的遗物）不再产出，改为金币。
        // 先前这条词条指向一个并不存在的"食物"系统 —— 属于"有数据没玩法"。
        // 现在指向真实存在的回复类遗物，规则可被断言验证。
        if (!it) out.push({ kind: 'coins', amount: 15 });
        else if (md.noFood && it.mods && it.mods.heal) {
          out.push({ kind: 'coins', amount: 18 });
        } else {
          out.push({ kind: 'item', id: it.id });
        }
      } else {
        out.push({ kind: 'active', id: this.game.rollActiveId().id });
      }
    }
    if (gold || locked) out.push({ kind: 'coins', amount: rng.int(12, 26) + floor * 6 });
    if (rng.chance(0.5)) out.push({ kind: 'heal', amount: 1 });
    return out;
  }

  buildShop(content, placed) {
    const inner = this.inner;
    // 柜台
    const counterMat = getMaterial('#5a4030', { flat: true, roughness: 0.85 });
    const counter = new THREE.Group();
    const top = new THREE.Mesh(new THREE.BoxGeometry(11, 0.28, 2.0), getMaterial('#7a5a34', { flat: true, roughness: 0.7 }));
    top.position.set(0, 1.05, 0); top.castShadow = true; top.receiveShadow = true; counter.add(top);
    for (let i = 0; i < 5; i++) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.05, 1.7), counterMat);
      leg.position.set(-4.4 + i * 2.2, 0.52, 0); leg.castShadow = true; counter.add(leg);
    }
    for (let i = 0; i < 4; i++) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.5), getMaterial('#8a6a3a', { flat: true }));
      b.position.set(-3 + i * 2, 1.45, this.rng.float(-0.4, 0.4)); b.rotation.y = this.rng.float(-0.5, 0.5); counter.add(b);
    }
    counter.position.set(0, 0, -inner * 0.62);
    this.group.add(counter);
    const cz = -inner * 0.62;
    this.addCollider(-5.5, 5.5, cz - 1.0, cz + 1.0, 1.2, { ref: null });

    // 店主
    const npc = buildNPC('shop');
    npc.group.position.set(0, 0, cz - 2.2);
    npc.group.rotation.y = 0;
    this.group.add(npc.group);
    // x/z 存**世界坐标**（消费方是粒子、交互距离等世界空间系统）；rig 挂在带偏移的 group 上，位置仍用局部。
    this.npcs.push({ rig: npc, kind: 'shop', x: this.ox, z: cz - 2.2 + this.oz, r: 0.75, animT: 0, baseY: 0 });

    // 商品台
    this.shopSlots = [];
    const stock = content.shopStock || [];
    stock.forEach((item, i) => {
      const px = stock.length <= 4 ? -6.0 + i * 4.0 : (i - (stock.length - 1) / 2) * 2.6;
      const pz = this.inner * 0.30;
      const ped = makePedestal(this.game.floor);
      ped.object.position.set(px, 0, pz);
      this.group.add(ped.object);
      this.props.push(ped);
      this.lightSpecs = this.lightSpecs || [];
      this.lightSpecs.push({ x: px, y: 2.0, z: pz, color: this.game.floor === 1 ? 0x8af0ff : 0xffb347, intensity: 3.6, distance: 7, flicker: 0.08 });
      // x/z 存**世界坐标**：既被 pickups.spawn 用来摆商品，也被 Game.interactables()
      // 用来做"E 购买"的距离判定 —— 两者都是世界空间。旧实现存局部值，
      // 导致商品被生成到房间外、且玩家永远走不进 2.5 的交互半径（实测：所有商店都没有商品）。
      this.shopSlots.push({ item, x: px + this.ox, z: pz + this.oz, y: 1.5, prop: ped, sold: false, bob: Math.random() * 6 });   // visual-rng: 展示浮动相位
    });
    // ---- 服务台（PASS2 §29 金币出口）----
    // 三件有次数上限的服务：补弹 / 急救 / 刷新库存。
    // 位置放在柜台一侧，与商品台分开，避免"想买商品却点到服务"。
    this.serviceSlots = [];
    for (let i = 0; i < SHOP_SERVICES.length; i++) {
      const sx = -7.5 + i * 0.0;
      const sz = -inner * 0.62 + 3.2 - i * 1.6;
      const sx2 = -inner * 0.55;
      const ped = makePedestal(this.game.floor);
      ped.object.position.set(sx2, 0, sz);
      this.group.add(ped.object);
      this.props.push(ped);
      this.lightSpecs.push({ x: sx2, y: 2.0, z: sz, color: 0xffd24a, intensity: 2.6, distance: 6, flicker: 0.06 });
      this.serviceSlots.push({ id: SHOP_SERVICES[i].id, x: sx2 + this.ox, z: sz + this.oz, prop: ped });
      void sx;
    }
    // 商店氛围灯
    this.lightSpecs = this.lightSpecs || [];
    this.lightSpecs.push({ x: 0, y: 3.0, z: this.inner * 0.30, color: 0xffd24a, intensity: 5, distance: 14, flicker: 0.1 });
  }

  buildSpecial(content, placed) {
    const inner = this.inner;
    const ev = this.room.event;
    const kindMap = { forge: 'forge', oracle: 'oracle' };
    let npcKind = kindMap[ev?.id] || 'altar';
    if (ev && ev.id === 'forge') npcKind = 'forge';
    else if (ev && ev.id === 'oracle') npcKind = 'altar';

    const altar = makeAltar(this.game.floor);
    altar.object.position.set(0, 0, -inner * 0.55);
    this.group.add(altar.object);
    this.props.push(altar);
    this.addCollider(-1.2, 1.2, -inner * 0.55 - 0.9, -inner * 0.55 + 0.9, 1.4, { ref: altar });
    this.altarProp = altar;

    const npc = buildNPC(npcKind === 'forge' ? 'forge' : 'altar');
    npc.group.position.set(2.6, 0, -inner * 0.45);
    npc.group.rotation.y = -0.6;
    this.group.add(npc.group);
    this.npcs.push({ rig: npc, kind: npcKind, x: 2.6 + this.ox, z: -inner * 0.45 + this.oz, r: 0.7, animT: 1, baseY: 0 });

    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const c = P.makeCrystal(this.rng, ev?.color || '#67e8ff');
      c.object.position.set(Math.cos(a) * 4.6, 0, -inner * 0.5 + Math.sin(a) * 3.4);
      this.group.add(c.object);
    }
    this.lightSpecs = this.lightSpecs || [];
    this.lightSpecs.push({ x: 0, y: 2.4, z: -inner * 0.5, color: this.game.floor === 2 ? 0xff7a2e : 0x67e8ff, intensity: 7, distance: 16, flicker: 0.2 });
  }

  buildBossArena() {
    const inner = this.inner;
    // 四角巨柱
    for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
      const px = sx * inner * 0.72, pz = sz * inner * 0.72;
      const col = new THREE.Group();
      const m = getMaterial('#3a2018', { flat: true, roughness: 0.9 });
      const m2 = getMaterial('#5a3018', { flat: true, roughness: 0.85 });
      const c1 = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.4, 8.5, 7), m); c1.position.y = 4.25; c1.castShadow = true;
      const c2 = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.6, 3.0), m2); c2.position.y = 8.6;
      const c3 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 2.2), m2); c3.position.y = 0.25;
      col.add(c1, c2, c3);
      const runes = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.09, 4, 10), getMaterial('#0a0a0a', { emissive: '#ff6a20', emissiveIntensity: 2.4, flat: true }));
      runes.position.y = 2.6; runes.rotation.x = Math.PI / 2;
      col.add(runes);
      col.position.set(px, 0, pz);
      this.group.add(col);
      this.addCollider(px - 1.3, px + 1.3, pz - 1.3, pz + 1.3, 8.5);
      this.lightSpecs = this.lightSpecs || [];
      this.lightSpecs.push({ x: px, y: 3.0, z: pz, color: 0xff6a20, intensity: 6, distance: 14, flicker: 0.3 });
    }
    // 熔岩池
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const lv = P.makeLavaPool(this.rng);
      const px = Math.cos(a) * inner * 0.55, pz = Math.sin(a) * inner * 0.55;
      lv.object.position.set(px, 0, pz);
      lv.object.scale.setScalar(1.5);
      this.group.add(lv.object);
      this.props.push(lv);
      lv.radius = 3.0;
    }
    // 中央符文
    const ring = new THREE.Mesh(new THREE.RingGeometry(6.2, 7.0, 40), getMaterial('#0a0a0a', { emissive: '#ff5a10', emissiveIntensity: 1.5, flat: true, transparent: true, opacity: 0.85, side: true }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.05;
    this.group.add(ring);
    this.bossRing = ring;
    // 锁链
    for (let i = 0; i < 3; i++) { const c = P.makeChains(this.rng, 2); c.object.position.set(this.rng.float(-inner * .7, inner * .7), 0, this.rng.float(-inner * .7, inner * .7)); this.group.add(c.object); }
  }

  buildLights() {
    // 预热阶段（Game.warmRoomTypeCaches）不改动全局灯光池，
    // 否则会把玩家当前所在房间的灯光覆盖掉。
    if (this.game._warming) return;
    const propSpecs = [];
    for (const p of this.props) {
      const sp = p && p.lightSpec;
      if (!sp || !p.object) continue;
      const pos = p.object.position;
      propSpecs.push({
        x: pos.x + (sp.dx || 0), y: sp.y ?? 1.6, z: pos.z + (sp.dz || 0),
        color: sp.color, intensity: sp.intensity ?? 3, distance: sp.distance ?? 12,
        flicker: sp.flicker ?? 0, prop: p,
      });
    }
    // 保证房间基本照明（放在最前，优先级最高）
    const amb = this.game.floor === 3 ? 0x8a4a18 : this.game.floor === 2 ? 0x8a3a18 : 0x3a6a86;
    // 优先级：环境光 → 场景光源道具（火盆/炬火/水晶…）→ 其余（宝箱等）
    const specs = [
      { x: 0, y: 4.5, z: 0, color: amb, intensity: this.room.type === 'boss' ? 3.2 : 2.1, distance: this.half * 2.6, flicker: 0.06 },
      ...propSpecs,
      ...(this.lightSpecs || []),
    ];
    const pool = this.game.roomLights;
    pool.clear();
    const use = specs.slice(0, pool.roomSlots);
    for (const s of use) {
      // 光规格统一按**局部坐标**书写，这里一次性加上房间的世界偏移
      const it = pool.add(s.x + this.ox, s.y, s.z + this.oz, s.color, s.intensity, s.distance, s.flicker);
      // 把池内条目挂回道具，让道具的 update() 仍能驱动自己的辉光（地刺告警、熔岩脉动…）
      if (s.prop) s.prop._poolLight = it;
    }
  }

  // ================= 运行时 =================
  updateVisuals(dt) {
    this.t += dt;
    for(const p of this.props)if(p.bossReward){p.object.visible=!!this.room.cleared;for(const c of this.colliders)if(c.ref===p){c.move=!!this.room.cleared;c.bullet=!!this.room.cleared;}}
    for (const p of this.props) {
      if (p.update) p.update(dt, this.t);
    }
    for (const n of this.npcs) {
      n.animT += dt;
      n.rig.group.position.y = Math.sin(n.animT * 1.8) * 0.05;
      n.rig.body.position.y = Math.sin(n.animT * 3.1) * 0.03;
      if (n.rig.armR) { n.rig.armR.sh.rotation.x = -0.4 + Math.sin(n.animT * 1.4) * 0.14; n.rig.armL.sh.rotation.x = -0.3 + Math.sin(n.animT * 1.4 + 1) * 0.12; }
      if (n.rig.head) n.rig.head.rotation.y = Math.sin(n.animT * 0.6) * 0.2;
    }
    if (this.bossRing) this.bossRing.material.emissiveIntensity = 1.2 + Math.sin(this.t * 3) * 0.5;
  }

  update(dt) {
    this.updateVisuals(dt);
    // 危险区伤害
    for(const pl of combatPlayers(this.game)) {
      for (const p of this.props) {
        if (p.hazard && Math.hypot(pl.x - p.worldX, pl.z - p.worldZ) < (p.radius || 1)) {
          if ((pl._hazCd || 0) <= 0) { pl._hazCd = 0.7; pl.takeDamage(p.damage || 1, { source: 'hazard' }); }
        }
        if (p.trap && p.object) {
          const dx = pl.x - p.worldX, dz = pl.z - p.worldZ;
          const inZone = Math.hypot(dx, dz) < 1.2;
          if (inZone) {
            if (p.kind === 'spiketrap' && p.extended && (pl._trapCd || 0) <= 0) { pl._trapCd = 0.8; pl.takeDamage(1, { source: 'trap' }); }
            if (p.kind === 'flamevent' && p.active && (pl._trapCd || 0) <= 0) { pl._trapCd = 0.6; pl.takeDamage(1, { source: 'trap' }); }
            if (p.kind === 'arrowwall' && p.dart.visible && (pl._trapCd || 0) <= 0) { pl._trapCd = 0.8; pl.takeDamage(1, { source: 'trap' }); }
          }
        }
      }
      pl._hazCd = Math.max(0, (pl._hazCd || 0) - dt); pl._trapCd = Math.max(0, (pl._trapCd || 0) - dt);
    }
  }

  // ---- 碰撞查询 ----
  pointBlocked(wx, wz, r, y = 0.9) {
    const x = wx - this.ox, z = wz - this.oz;
    if (Math.abs(x) > this.inner + 0.2 || Math.abs(z) > this.inner + 0.2) {
      // 允许在门洞处离开
      return !this.inDoorGap(x, z, r);
    }
    for (const c of this.colliders) {
      if (!c.move || c.top < y) continue;
      if (x > c.minx - r && x < c.maxx + r && z > c.minz - r && z < c.maxz + r) return true;
    }
    return false;
  }

  pointBlockedBullet(wx, wz, r, y) {
    const x = wx - this.ox, z = wz - this.oz;
    for (const c of this.colliders) {
      if (!c.bullet) continue;
      if (c.top < y - 0.05) continue;
      if (x > c.minx - r && x < c.maxx + r && z > c.minz - r && z < c.maxz + r) return true;
    }
    return false;
  }

  inDoorGap(x, z, r) {
    for (const s of SIDES) {
      const isSecret = this.secretOpen && this.secretOpen.has(s.k);
      const isEntry = this.room.secretWallDirs.some((x2) => x2.dir === s.k && x2.isEntry);
      if (!this.room.doors[s.k] && !isSecret && !isEntry) continue;
      if (s.ax) { // 南北墙，门沿 x 方向
        if (Math.abs(x) < DOOR_W / 2 - r && Math.abs(z - s.nz * this.half) < (WALL_T / 2 + 9)) return true;
      } else {
        if (Math.abs(z) < DOOR_W / 2 - r && Math.abs(x - s.nx * this.half) < (WALL_T / 2 + 9)) return true;
      }
    }
    return false;
  }

  // 可通行的方向（含已打通的秘门）


  propHit(wx, wz, r, y = 0.9) {
    const x = wx - this.ox, z = wz - this.oz;
    for (const c of this.colliders) {
      if (!c.bullet) continue;
      if (c.top < y - 0.05) continue;
      if (!c.ref || c.ref.hp === undefined) continue;
      if (x > c.minx - r && x < c.maxx + r && z > c.minz - r && z < c.maxz + r) return c.ref;
    }
    return null;
  }

  // 只做障碍物推出，不做房间边界夹取（并集行走时边界由 Game 统一处理）
  resolveColliders(e, r, y = 0.5) {
    if (this.ox || this.oz) {
      e.x -= this.ox; e.z -= this.oz;
      pushOutOfBoxes(e, r, this.colliders, y);
      e.x += this.ox; e.z += this.oz;
      return;
    }
    pushOutOfBoxes(e, r, this.colliders, y);
  }

  resolveCircle(e, r, clampToRoom) {
    if (this.ox || this.oz) {
      e.x -= this.ox; e.z -= this.oz;
      const res = this._resolveLocal(e, r, clampToRoom);
      e.x += this.ox; e.z += this.oz;
      return res;
    }
    return this._resolveLocal(e, r, clampToRoom);
  }

  _resolveLocal(e, r, clampToRoom) {
    // 房间边界
    const lim = this.inner;
    let escaped = false;
    if (Math.abs(e.x) > lim - r || Math.abs(e.z) > lim - r) {
      if (!this.inDoorGap(e.x, e.z, r)) {
        if (e.x > lim - r) e.x = lim - r;
        if (e.x < -lim + r) e.x = -lim + r;
        if (e.z > lim - r) e.z = lim - r;
        if (e.z < -lim + r) e.z = -lim + r;
        if (e.vx) { if (Math.abs(e.x) >= lim - r - 0.01) e.vx = 0; if (Math.abs(e.z) >= lim - r - 0.01) e.vz = 0; }
      } else escaped = true;
    }
    // 碰撞盒（共用实现，语义与走廊 / 枢纽一致）
    pushOutOfBoxes(e, r, this.colliders, 0.5);
    return escaped;
  }

  clampToRoom(wx, wz, pad) {
    const lim = this.inner - pad;
    const x = wx - this.ox, z = wz - this.oz;
    return { x: Math.max(-lim, Math.min(lim, x)) + this.ox, z: Math.max(-lim, Math.min(lim, z)) + this.oz };
  }

  // 该点是否落在危险区（熔岩池 / 地刺 / 喷火口 等）
  hazardAt(x, z, r = 1.0) {
    for (const p of this.props) {
      if (!p.hazard && !p.trap) continue;
      const rad = p.radius || (p.trap ? 1.3 : 1.0);
      if (Math.hypot(x - p.worldX, z - p.worldZ) < rad + r) return true;
    }
    return false;
  }

  // 某个方向的入口点：从门进来以后玩家应站的位置。
  // dirKey 表示"玩家是从该方向的门进入本房间的"（east 门 = 房间东侧）。
  // 返回一个安全点：位于房间内部、不卡墙、不压在机关或危险地板上。
  entryPoint(dirKey) {
    const d = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[dirKey] || [0, 0];
    const deep = this.inner - 3.2;          // 往房间里再走一段，避免卡在门框里
    const cand = [
      { x: d[0] * deep, z: d[1] * deep },
      { x: d[0] * (deep - 1.2), z: d[1] * (deep - 1.2) },
      { x: d[0] * (deep - 2.4) + d[1] * 1.6, z: d[1] * (deep - 2.4) + d[0] * 1.6 },
      { x: d[0] * (deep - 2.4) - d[1] * 1.6, z: d[1] * (deep - 2.4) - d[0] * 1.6 },
      { x: d[0] * (this.inner * 0.45), z: d[1] * (this.inner * 0.45) },
      { x: 0, z: 0 },
    ];
    for (const c of cand) {
      // 全部在局部坐标里判定，最后再统一加上偏移
      const lim = this.inner - 1.1;
      const pt = { x: Math.max(-lim, Math.min(lim, c.x)), z: Math.max(-lim, Math.min(lim, c.z)) };
      if (this.pointBlocked(pt.x + this.ox, pt.z + this.oz, 0.8, 0.9)) continue;
      if (this.hazardAt(pt.x + this.ox, pt.z + this.oz, 0.9)) continue;
      return { x: pt.x + this.ox, z: pt.z + this.oz };
    }
    return { x: this.ox, z: this.oz };
  }

  setDoorsOpen(open) {
    for (const k in this.doorways) {
      const d = this.doorways[k];
      d.open = open;
      d.barrier.object.visible = !open;
      d.collider.move = !open;
      d.collider.bullet = !open;
    }
  }

  // 破坏道具
  destroyProp(prop) {
    if (prop.saveId) this.destroyedProps.add(prop.saveId);
    const i = this.props.indexOf(prop);
    if (i >= 0) this.props.splice(i, 1);
    if (prop.colliderRef) {
      prop.colliderRef.bullet = false;
      prop.colliderRef.move = false;
      prop.colliderRef.ref = null;
    }
    if (prop.secret && prop.colliderRef) {
      prop.colliderRef.bullet = false; prop.colliderRef.move = false;
      for (const s of SIDES) {
        const sd = this.room.secretWallDirs.find((x2) => x2.dir === s.k && !x2.isEntry);
        if (sd && this.secretDoors[s.k] === prop) this.secretOpen.add(s.k);
      }
      this.game.particles.explosion(prop.worldX, 1.2, prop.worldZ, 1.4, '#8af0ff');
      audio.secretFound();
      this.game.run.secrets = (this.game.run.secrets || 0) + 1;
      this.game.toast('发现隐藏房间！', '秘门已开启 —— 里面有额外奖励', '#8af0ff', 'story');
    }
    // 碎片
    const d = prop.debris || { color: '#5a5a5a', n: 8 };
    const pos = prop.object.position;
    this.game.debris.burst(pos.x + this.ox, 0.6, pos.z + this.oz, d.color, d.n, 1.0);
    this.game.particles.smoke(pos.x + this.ox, 0.5, pos.z + this.oz, 4, '#4a4a4a', 0.6, 0.6);
    if (prop.explosive) {
      const rng = this.rng;
      this.game.explode(pos.x + this.ox, 0.7, pos.z + this.oz, 4.6, 2, 2, null, null);
    }
    if (prop.object.parent) prop.object.parent.remove(prop.object);
  }

  exportState() {
    return { destroyed: [...this.destroyedProps], secretOpen: [...this.secretOpen], t: this.t,
      props: this.props.map(p => ({ id: p.saveId, ...(p.kind === 'chest' ? { quality: p.quality, ...chestFields(p) } : {}), hp: p.hp, opened: !!p.opened, opening: p.opening, flipped: p.flipped, flip: p.flip,
        loot: (p.loot || []).map(x => ({ ...x })) })),
      sold: (this.shopSlots || []).map(s => !!s.sold), shopStock: (this.shopSlots || []).map(s => ({ ...s.item })), rng: this.rng.s };
  }

  importState(data) {
    if (!data) return;
    this.destroyedProps = new Set(data.destroyed || []);
    this.secretOpen = new Set(data.secretOpen || []);
    if (Number.isFinite(data.t)) this.t = data.t;
    for (const id of this.destroyedProps) {
      const p = this.propCatalog.get(id);
      if (!p) continue;
      this.props = this.props.filter(x => x !== p);
      p.object.removeFromParent();
      if (p.colliderRef) { p.colliderRef.move = false; p.colliderRef.bullet = false; p.colliderRef.ref = null; }
    }
    for (const d of data.props || []) {
      const p = this.propCatalog.get(d.id);
      if (!p || this.destroyedProps.has(d.id)) continue;
      if (typeof d.hp === 'number') p.hp = d.hp;
      if (p.kind === 'chest') { if (d.quality) Object.assign(p, { quality: d.quality }, chestFields(d)); p.loot = d.loot.map(x => ({ ...x })); p.opened = !!d.opened; p.opening = d.opening || 0; if (p.update) p.update(0, this.t); }
      if (p.kind === 'table') { p.flipped = !!d.flipped; p.flip = d.flip || 0; if (p.update) p.update(0, this.t); }
    }
    (this.shopSlots || []).forEach((s, i) => { s.sold = !!data.sold?.[i]; if (data.shopStock?.[i]) s.item = { ...data.shopStock[i] }; });
    if (Number.isFinite(data.rng)) this.rng.s = data.rng;
  }

  dispose() {
    this.game.scene.remove(this.group);
    this.group.traverse((o) => {
      if (o.isMesh && o.geometry && !o.geometry.userData.shared) {
        if (!o.geometry.__keep) o.geometry.dispose();
      }
    });
    this.props.length = 0;
    this.colliders.length = 0;
    for (const n of this.npcs) { if (n.rig.group.parent) n.rig.group.parent.remove(n.rig.group); }
    this.npcs.length = 0;
  }
}
