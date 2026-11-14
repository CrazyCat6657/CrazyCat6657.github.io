// ============================================================
//  连接走廊（ConnectorScene）
//
//  V3.0 的核心结构改造：相邻房间之间不再"靠近门 → 瞬时传送"，而是
//  真正存在于世界坐标里的短走廊。房间各自拥有自己的世界偏移，
//  走廊放在两者之间，玩家是**真的走过去**的 —— 全程没有任何坐标跳变。
//
//  走廊同时承担第二个职责：Streaming Buffer。
//  走过它的这几秒被用来分帧预热下一房间的贴图 / 材质 / 几何 / 模型，
//  避免"跨过最后一道门槛的那一帧同步构建整间房"造成首访尖峰。
//
//  几何风格按楼层主题分化：
//    1F 沉钟回廊 → 石拱肋廊 + 悬链 + 冷青光
//    2F 熔核深渊 → 工业管线通道 + 地面熔缝 + 暖橙光
//    3F 熔心王座 → 青铜列柱仪仗廊 + 火盆 + 鎏金光
// ============================================================
import * as THREE from '../../vendor/three.module.js';
import { WALL_H, DOOR_W } from '../core/constants.js';
import { getTiledMaterial, getMaterial, boxGeo, cylGeo, torusGeo } from '../art/materials.js';
import { RNG } from '../core/rng.js';
import { pushOutOfBoxes } from './collide.js';

const FLOOR_TEX = { 1: ['floor_stone', 'floor_moss'], 2: ['floor_basalt', 'floor_metal'], 3: ['floor_obsidian', 'floor_throne'] };
const WALL_TEX = { 1: ['wall_brick', 'wall_carved'], 2: ['wall_abyss', 'wall_abyss_carved'], 3: ['wall_throne', 'wall_throne_carved'] };
const THEME_LIGHT = {
  1: { a: 0x74e0ff, b: 0x8af0ff, trim: '#8af0ff' },
  2: { a: 0xff7a2e, b: 0xffb347, trim: '#ffb347' },
  3: { a: 0xffb347, b: 0xffd24a, trim: '#ffd24a' },
};

export class ConnectorScene {
  /**
   * @param axis  'z' = 南北向走廊（沿 z 延伸）；'x' = 东西向
   * @param ox,oz 走廊中心的世界坐标
   * @param len   走廊长度（世界单位，= 房间间距 - 两间房各半个进深）
   */
  constructor(game, { axis, ox, oz, len, floor, rngSeed }) {
    this.game = game;
    this.axis = axis === 'x' ? 'x' : 'z';
    this.ox = ox;
    this.oz = oz;
    this.hl = Math.max(2, len / 2);
    this.hw = DOOR_W / 2;              // 走廊宽度与门洞同宽 → 视觉上就是"门的延伸"
    this.floor = floor;
    this.rng = new RNG(rngSeed || 1);
    this.colliders = [];
    this.props = [];                   // 走廊里不放可交互物，保持通行顺畅
    this.npcs = [];
    this.hazards = [];
    this.lightSpecs = [];
    this.room = { type: 'connector', cleared: true, locked: false, uid: 'conn:' + ox + ',' + oz, combatCleared: true };
    this.group = new THREE.Group();
    this.group.position.set(ox, 0, oz);
    game.scene.add(this.group);
    this.t = this.rng.float(0, 10);
    this._anim = [];
    this.build();
  }

  // ---------- 局部/世界换算 ----------
  toLocal(x, z) { return { x: x - this.ox, z: z - this.oz }; }
  toWorld(x, z) { return { x: x + this.ox, z: z + this.oz }; }
  // 沿走廊方向的半长、横向半宽（按轴区分）
  get alongHL() { return this.hl; }
  get lateralHW() { return this.hw; }

  rectWorld() {
    const hx = this.axis === 'z' ? this.hw : this.hl;
    const hz = this.axis === 'z' ? this.hl : this.hw;
    return { x0: this.ox - hx, x1: this.ox + hx, z0: this.oz - hz, z1: this.oz + hz, kind: 'connector', ref: this };
  }
  containsWorld(x, z, r = 0) {
    const l = this.toLocal(x, z);
    const a = this.axis === 'z' ? l.z : l.x;
    const b = this.axis === 'z' ? l.x : l.z;
    return Math.abs(a) <= this.hl + r && Math.abs(b) <= this.hw + r;
  }

  addCollider(minx, maxx, minz, maxz, top, opts = {}) {
    const c = { minx, maxx, minz, maxz, top, bullet: opts.bullet !== false, move: opts.move !== false, ref: opts.ref || null };
    this.colliders.push(c);
    return c;
  }

  // ---------- 建造 ----------
  build() {
    const g = this.group;
    const hl = this.hl, hw = this.hw;
    const tex = FLOOR_TEX[this.floor] || FLOOR_TEX[1];
    const wtex = WALL_TEX[this.floor] || WALL_TEX[1];
    const L = THEME_LIGHT[this.floor] || THEME_LIGHT[1];
    // 走廊总是沿"局部 z"建造，东西向时整体旋转 90°；碰撞盒另行按世界轴登记。
    const rot = this.axis === 'x';
    const holder = new THREE.Group();
    holder.rotation.y = rot ? Math.PI / 2 : 0;
    g.add(holder);

    // 地板
    const fmat = getTiledMaterial(tex[0], this.rng, Math.max(2, Math.round(hw * 2 / 2)), Math.max(3, Math.round(hl * 2 / 2)), { roughness: 0.95, metalness: 0.02 });
    const floor = new THREE.Mesh(boxGeo(hw * 2 + 0.4, 0.4, hl * 2 + 0.4), fmat);
    floor.position.y = -0.2; floor.receiveShadow = true;
    holder.add(floor);

    // 中央导引光带（帮玩家一眼看清"这是一条路"）
    const strip = new THREE.Mesh(boxGeo(0.55, 0.06, hl * 2 - 0.6), getMaterial(L.b, { emissive: L.b, emissiveIntensity: 1.5, flat: true }));
    strip.position.y = 0.035;
    holder.add(strip);
    this._anim.push({ m: strip, k: 0 });

    // 侧墙
    const wmat = getTiledMaterial(tex[1] === 'floor_moss' ? wtex[0] : wtex[1], this.rng, Math.max(2, Math.round(hl * 2 / 2)), 2, { roughness: 0.9, metalness: 0.04 });
    for (const s of [-1, 1]) {
      const w = new THREE.Mesh(boxGeo(0.5, WALL_H, hl * 2), wmat);
      w.position.set(s * (hw + 0.25), WALL_H / 2, 0);
      w.castShadow = true; w.receiveShadow = true;
      holder.add(w);
      // 壁灯
      const lamp = new THREE.Mesh(boxGeo(0.16, 0.5, 0.34), getMaterial(L.a, { emissive: L.a, emissiveIntensity: 2.0, flat: true }));
      lamp.position.set(s * (hw - 0.06), 2.5, 0);
      holder.add(lamp);
      this._anim.push({ m: lamp, k: 1 });
    }

    // 主题装饰
    this.buildDecor(holder, L, hl, hw);

    // 碰撞：两道侧墙 + 端部两侧的"翼墙"（把门洞以外封住，避免从走廊斜穿进房间墙体）
    const cy = WALL_H;
    if (this.axis === 'z') {
      this.addCollider(this.ox - hw - 0.5, this.ox - hw, this.oz - hl, this.oz + hl, cy);
      this.addCollider(this.ox + hw, this.ox + hw + 0.5, this.oz - hl, this.oz + hl, cy);
    } else {
      this.addCollider(this.ox - hl, this.ox + hl, this.oz - hw - 0.5, this.oz - hw, cy);
      this.addCollider(this.ox - hl, this.ox + hl, this.oz + hw, this.oz + hw + 0.5, cy);
    }

    // 灯光（走定长灯光池）
    const n = 3;
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n;
      const along = (u - 0.5) * (hl * 2 - 2);
      const wx = this.axis === 'z' ? this.ox : this.ox + along;
      const wz = this.axis === 'z' ? this.oz + along : this.oz;
      this.lightSpecs.push({
        x: wx, y: 2.9, z: wz, color: i % 2 ? L.b : L.a,
        intensity: this.floor === 2 ? 4.4 : 3.8, distance: 10, flicker: 0.16,
      });
    }
  }

  buildDecor(holder, L, hl, hw) {
    const n = Math.max(2, Math.round(hl / 2.4));
    if (this.floor === 1) {
      // 石拱肋廊：成对的拱肋 + 悬链
      for (let i = 0; i < n; i++) {
        const z = -hl + 1.2 + i * ((hl * 2 - 2.4) / Math.max(1, n - 1));
        const rib = new THREE.Mesh(torusGeo(hw * 0.98, 0.17, 4, 12), getMaterial('#4a5a66', { roughness: 0.9, metalness: 0.08, flat: true }));
        rib.position.set(0, 2.5, z);
        holder.add(rib);
        if (i % 2 === 0) {
          const ch = new THREE.Mesh(cylGeo(0.045, 0.045, 1.1, 4), getMaterial('#6a7480', { metalness: 0.7, roughness: 0.5, flat: true }));
          ch.position.set(this.rng.float(-1.6, 1.6), 3.5, z); holder.add(ch);
        }
      }
    } else if (this.floor === 2) {
      // 工业管线通道：两侧管线 + 地面熔缝
      for (const s of [-1, 1]) {
        for (let i = 0; i < 3; i++) {
          const p = new THREE.Mesh(cylGeo(0.16, 0.16, hl * 2, 6), getMaterial(i === 0 ? '#7a5230' : '#4a5258', { metalness: 0.85, roughness: 0.42, flat: true }));
          p.rotation.x = Math.PI / 2;
          p.position.set(s * (hw - 0.35), 1.0 + i * 0.55, 0);
          holder.add(p);
        }
      }
      for (let i = 0; i < n; i++) {
        const z = -hl + 1.4 + i * ((hl * 2 - 2.8) / Math.max(1, n - 1));
        const seam = new THREE.Mesh(boxGeo(hw * 1.5, 0.08, 0.34), getMaterial('#ff5a10', { emissive: '#ff7a20', emissiveIntensity: 2.2, flat: true, transparent: true, opacity: 0.9 }));
        seam.position.set(0, 0.05, z);
        holder.add(seam);
        this._anim.push({ m: seam, k: 2, ph: i * 1.7 });
      }
    } else {
      // 青铜列柱仪仗廊：成对柱 + 火盆 + 徽记
      for (const s of [-1, 1]) {
        for (let i = 0; i < n; i++) {
          const z = -hl + 1.4 + i * ((hl * 2 - 2.8) / Math.max(1, n - 1));
          const col = new THREE.Mesh(cylGeo(0.26, 0.34, 3.4, 8), getMaterial('#8a6a2a', { metalness: 0.8, roughness: 0.35, flat: true }));
          col.position.set(s * (hw - 0.42), 1.7, z);
          col.castShadow = true;
          holder.add(col);
          const cap = new THREE.Mesh(boxGeo(0.72, 0.22, 0.72), getMaterial('#c8a24a', { metalness: 0.85, roughness: 0.3, flat: true }));
          cap.position.set(s * (hw - 0.42), 3.5, z);
          holder.add(cap);
        }
      }
      const emblem = new THREE.Mesh(torusGeo(0.6, 0.09, 4, 12), getMaterial(L.b, { emissive: L.b, emissiveIntensity: 2.0, flat: true }));
      emblem.position.set(0, 3.1, 0); emblem.rotation.x = Math.PI / 2;
      holder.add(emblem);
      this._anim.push({ m: emblem, k: 3 });
    }
  }

  // ---------- 查询（语义与 RoomScene 一致） ----------
  pointBlocked(wx, wz, r, y = 0.9) {
    const l = this.toLocal(wx, wz);
    const along = this.axis === 'z' ? l.z : l.x;
    const lat = this.axis === 'z' ? l.x : l.z;
    // **先判断"这是不是我的地盘"**：只有当查询点落在本走廊的矩形范围内（沿轴向也在范围内），
    // 本场景才有资格回答"是否阻挡"。
    //
    // 这里曾经只判断横向偏移、完全不看纵向范围 —— 后果是：只要某条走廊被激活，
    // 整条"沿轴向无限长的条带"都会对外宣称"不可通行"。房间宽 24、走廊只有 6 宽，
    // 于是房间绝大部分区域的 moveBlocked 都被误判为 true（玩家在房间中央也会被判"卡住"），
    // 表现为寻路反复触发脱困、跨房随机超时。这是**游戏侧**的真实缺陷，不只是测试问题。
    if (Math.abs(along) > this.hl + 0.5) return false;
    if (Math.abs(lat) > this.hw - r) return true;
    for (const c of this.colliders) {
      if (!c.move || c.top < y) continue;
      if (wx > c.minx - r && wx < c.maxx + r && wz > c.minz - r && wz < c.maxz + r) return true;
    }
    return false;
  }
  pointBlockedBullet(wx, wz, r, y) {
    const l = this.toLocal(wx, wz);
    const along = this.axis === 'z' ? l.z : l.x;
    const lat = this.axis === 'z' ? l.x : l.z;
    // 同 pointBlocked：先确认查询点在走廊范围内，否则一律"与我无关"。
    // 旧写法会让子弹在房间大半区域被误判为撞墙。
    if (Math.abs(along) > this.hl + 0.1) return false;
    if (Math.abs(lat) > this.hw) return true;
    for (const c of this.colliders) {
      if (!c.bullet || c.top < y - 0.05) continue;
      if (wx > c.minx - r && wx < c.maxx + r && wz > c.minz - r && wz < c.maxz + r) return true;
    }
    return false;
  }
  propHit() { return null; }
  hazardAt() { return false; }
  clampToRoom(wx, wz, pad) {
    const l = this.toLocal(wx, wz);
    const lat = this.axis === 'z' ? l.x : l.z;
    const lim = this.hw - pad;
    const cl = Math.max(-lim, Math.min(lim, lat));
    const along = Math.max(-this.hl, Math.min(this.hl, this.axis === 'z' ? l.z : l.x));
    if (this.axis === 'z') return { x: cl + this.ox, z: along + this.oz };
    return { x: along + this.ox, z: cl + this.oz };
  }
  resolveColliders(e, r) { pushOutOfBoxes(e, r, this.colliders, 0.5); }
  resolveCircle(e, r) {
    // 侧墙夹取 + 障碍推出（两端开放，由相邻房间的矩形接续）
    const lat = this.axis === 'z' ? e.x - this.ox : e.z - this.oz;
    const lim = this.hw - r;
    if (lat > lim) { if (this.axis === 'z') { e.x = this.ox + lim; if (e.vx > 0) e.vx = 0; } else { e.z = this.oz + lim; if (e.vz > 0) e.vz = 0; } }
    if (lat < -lim) { if (this.axis === 'z') { e.x = this.ox - lim; if (e.vx < 0) e.vx = 0; } else { e.z = this.oz - lim; if (e.vz < 0) e.vz = 0; } }
    pushOutOfBoxes(e, r, this.colliders, 0.5);
    return false;
  }
  entryPoint(dirKey) {
    // 从走廊某一端"走向相邻房间"的落点（用于回走时把玩家放进走廊）
    const d = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[dirKey] || [0, 1];
    const a = this.hl - 1.6;
    const w = this.toWorld(d[0] * (this.axis === 'z' ? 0 : a), d[1] * (this.axis === 'z' ? a : 0));
    return w;
  }

  update(dt) {
    this.t += dt;
    for (const a of this._anim) {
      if (a.k === 0) a.m.material.opacity = 1;
      else if (a.k === 1) a.m.material.emissiveIntensity = 1.7 + Math.sin(this.t * 3.1 + a.m.position.z) * 0.5;
      else if (a.k === 2) a.m.material.opacity = 0.55 + Math.sin(this.t * 2.4 + a.ph) * 0.35;
      else if (a.k === 3) a.m.rotation.z += dt * 0.35;
    }
  }

  dispose() {
    this.group.traverse((o) => { if (o.isMesh && o.geometry && o.geometry.dispose && o.userData.ownGeo) o.geometry.dispose(); });
    if (this.group.parent) this.group.parent.remove(this.group);
    this.colliders.length = 0;
    this.lightSpecs.length = 0;
    this._anim.length = 0;
  }
}

