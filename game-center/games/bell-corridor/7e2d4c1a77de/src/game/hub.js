// ============================================================
//  钟炉前厅 —— 冒险者大厅（任务书第五、六节）
//
//  它不是一个"UI 菜单房"，而是一个**可以自由走动的 3D 安全区**：
//  玩家用与地牢里完全相同的移动 / 瞄准 / 射击操作在里面活动。
//
//  设计约束（第六节）：
//    · 路线短、功能清楚、一眼能找到出征入口
//    · 不能做成迷宫，也不能每次花一分钟跑路
//    · 功能点沿着大厅两侧排开，出征台放在正中央的抬升台上
//
//  它放在世界坐标的远端（远离地牢），与房间共用同一套查询接口，
//  因此 Player 的移动 / 碰撞 / 相机代码一行都不用改。
// ============================================================
import * as THREE from '../../vendor/three.module.js';
import { WALL_H } from '../core/constants.js';
import { getTiledMaterial, getMaterial, boxGeo, cylGeo, torusGeo, ringGeo, planeGeo } from '../art/materials.js';
import { RNG } from '../core/rng.js';
import { pushOutOfBoxes } from './collide.js';
import { buildGunModel } from '../art/guns.js';
import { WEAPON_MAP } from './data.js';
import * as P from '../art/props.js';
import { BOSS_IDS } from './bosses.js';
import {applyPropAsset,makePropVisual} from '../art/prop_assets.js';

export const HUB_ORIGIN = { x: 0, z: 1500 };   // 远离地牢，避免与世界坐标冲突

// 功能点定义：位置 + 标签 + 动作标识
export const HUB_STATIONS = [
  { id: 'expedition', kind: 'hub', cn: '出征台', act: '开始远征', x: 0, z: -5.6, r: 3.2, label: '' },
  { id: 'readout', kind: 'hub', cn: '出征准备', act: '准备', x: -4.2, z: -8.0, r: 2.6, label: '' },
  { id: 'merchant', kind: 'hub', cn: '钟魂商人', act: '交易', x: -11.2, z: -4, r: 2.6, label: '解锁英雄与装备' },
  { id: 'wall', kind: 'hub', cn: '功勋墙', act: '查看', x: -11, z: 6, r: 2.6, label: '成就与统计' },
  { id: 'codex', kind: 'hub', cn: '档案馆', act: '查阅', x: 11, z: 6, r: 2.6, label: '武器、遗物与见闻' },
  { id: 'trophy', kind: 'hub', cn: '远征战果', act: '查看', x: 5, z: 3, r: 3.2, label: '' },
  { id: 'training', kind: 'hub', cn: '训练房', act: '试用装备', x: -6, z: 18, r: 2.6, label: '' },
];

export class HubScene {
  constructor(game) {
    this.game = game;
    this.ox = HUB_ORIGIN.x;
    this.oz = HUB_ORIGIN.z;
    this.half = 22;                    // 大厅进深的一半
    this.inner = 20;
    this.hw = 15;                      // 大厅宽度的一半
    this.rng = new RNG(0x5b011);
    this.colliders = [];
    this.props = [];
    this.npcs = [];
    this.hazards = [];
    this.lightSpecs = [];
    this.t = 0;
    this.ritual = 0;                  // 0 = 安静，1 = 出征仪式完成
    this.lightByTag = {};             // 由 Game._hubLights 回填（灯光池条目）
    this._anim = [];
    this.room = { type: 'hub', cleared: true, locked: false, uid: 'hub', doors: {}, secretWallDirs: [] };
    this.group = new THREE.Group();
    this.group.position.set(this.ox, 0, this.oz);
    game.scene.add(this.group);
    this.build();
    this.makeStations();
    this.buildClutter();
  }

  // ---------- 查询接口（与 RoomScene / ConnectorScene 同签名） ----------
  toLocal(x, z) { return { x: x - this.ox, z: z - this.oz }; }
  toWorld(x, z) { return { x: x + this.ox, z: z + this.oz }; }
  rectWorld() { return { x0: this.ox - this.inner, x1: this.ox + this.inner, z0: this.oz - this.inner, z1: this.oz + this.inner, kind: 'hub', ref: this }; }
  containsWorld(x, z, r = 0) {
    const l = this.toLocal(x, z);
    return Math.abs(l.x) <= this.inner + r && Math.abs(l.z) <= this.inner + r;
  }
  pointBlocked(wx, wz, r, y = 0.9) {
    const l = this.toLocal(wx, wz);
    if (Math.abs(l.x) > this.inner + 0.2 || Math.abs(l.z) > this.inner + 0.2) return true;
    for (const c of this.colliders) {
      if (!c.move || c.top < y) continue;
      if (l.x > c.minx - r && l.x < c.maxx + r && l.z > c.minz - r && l.z < c.maxz + r) return true;
    }
    return false;
  }
  pointBlockedBullet(wx, wz, r, y) {
    const l = this.toLocal(wx, wz);
    if (Math.abs(l.x) > this.inner || Math.abs(l.z) > this.inner) return true;
    for (const c of this.colliders) {
      if (!c.bullet || c.top < y - 0.05) continue;
      if (l.x > c.minx - r && l.x < c.maxx + r && l.z > c.minz - r && l.z < c.maxz + r) return true;
    }
    return false;
  }
  propHit() { return null; }
  hazardAt() { return false; }
  clampToRoom(wx, wz, pad) {
    const lim = this.inner - pad;
    const l = this.toLocal(wx, wz);
    return { x: Math.max(-lim, Math.min(lim, l.x)) + this.ox, z: Math.max(-lim, Math.min(lim, l.z)) + this.oz };
  }
  resolveColliders(e, r) {
    e.x -= this.ox; e.z -= this.oz;
    pushOutOfBoxes(e, r, this.colliders, 0.5);
    e.x += this.ox; e.z += this.oz;
  }
  resolveCircle(e, r) { this.resolveColliders(e, r); return false; }
  entryPoint() { return { x: this.ox, z: this.oz + 12 }; }
  addCollider(minx, maxx, minz, maxz, top, opts = {}) {
    const c = { minx, maxx, minz, maxz, top, bullet: opts.bullet !== false, move: opts.move !== false, ref: opts.ref || null };
    this.colliders.push(c);
    return c;
  }

  // ---------- 建造 ----------
  build() {
    const g = this.group;
    const hw = this.hw, hl = this.half;
    const PAL = { floor: '#3a4450', wall: '#2b333d', trim: '#c8a24a', glow: '#8af0ff', dark: '#1b222a' };
    // 地板
    const fmat = getTiledMaterial('floor_stone', this.rng, Math.round(hw), Math.round(hl), { roughness: 0.93, metalness: 0.04 });
    const floor = new THREE.Mesh(boxGeo(hw * 2, 0.5, hl * 2), fmat);
    floor.position.y = -0.25; floor.receiveShadow = true;
    g.add(floor);
    // 中央罗盘纹（钟面）—— 直接给"这里是指挥中枢"的视觉锚点
    for (const [rad, w, col, emis] of [[6.2, 0.30, PAL.trim, 1.2], [3.4, 0.16, PAL.glow, 1.8], [1.2, 0.10, PAL.trim, 1.4]]) {
      const ring = new THREE.Mesh(torusGeo(rad, w, 3, 28), getMaterial(col, { emissive: emissive(emis), emissiveIntensity: emis, flat: true, metalness: 0.6, roughness: 0.35 }));
      ring.rotation.x = Math.PI / 2; ring.position.y = 0.03;
      g.add(ring); this._anim.push({ m: ring, k: 0, sp: 0.05 + rad * 0.01 });
    }
    // 八根刻度柱（钟点）
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const p = new THREE.Mesh(boxGeo(0.5, 0.24, 2.0), getMaterial(PAL.trim, { metalness: 0.7, roughness: 0.38, flat: true }));
      p.position.set(Math.cos(a) * 5.2, 0.12, Math.sin(a) * 5.2);
      p.rotation.y = -a;
      g.add(p);
    }
    // 四周墙
    const wmat = getTiledMaterial('wall_brick', this.rng, Math.max(2, Math.round(hw / 2)), 2, { roughness: 0.9, metalness: 0.05 });
    for (const [w, d, x, z] of [[hw * 2 + 1.6, 1.6, 0, -hl], [hw * 2 + 1.6, 1.6, 0, hl], [1.6, hl * 2 + 1.6, -hw, 0], [1.6, hl * 2 + 1.6, hw, 0]]) {
      const m = new THREE.Mesh(boxGeo(w, WALL_H, d), wmat);
      m.position.set(x, WALL_H / 2, z);
      m.castShadow = true; m.receiveShadow = true;
      g.add(m);
      this.addCollider(x - w / 2, x + w / 2, z - d / 2, z + d / 2, WALL_H);
    }
    // 立柱（沿两侧）
    for (let i = 0; i < 6; i++) {
      const z = -hl + 4.5 + i * ((hl * 2 - 9) / 5);
      for (const sx of [-1, 1]) {
        const x = sx * hw * 0.62;
        const col = new THREE.Mesh(cylGeo(0.62, 0.78, WALL_H - 0.4, 8), getMaterial(PAL.wall, { roughness: 0.86, metalness: 0.1, flat: true }));
        col.position.set(x, (WALL_H - 0.4) / 2, z); col.castShadow = true;
        g.add(col);
        const cap = new THREE.Mesh(boxGeo(1.7, 0.30, 1.7), getMaterial(PAL.trim, { metalness: 0.75, roughness: 0.34, flat: true }));
        cap.position.set(x, WALL_H - 0.35, z); g.add(cap);
        const base = new THREE.Mesh(boxGeo(1.8, 0.34, 1.8), getMaterial(PAL.dark, { flat: true }));
        base.position.set(x, 0.17, z); g.add(base);
        const columnArt=makePropVisual('hub_column',{scale:[1,(WALL_H-.4)/4.8,1]});
        if(columnArt){g.remove(col,cap,base);columnArt.position.set(x,0,z);g.add(columnArt);}
        this.addCollider(x - 0.85, x + 0.85, z - 0.85, z + 0.85, WALL_H);
      }
    }
    // 中央视觉锚点：残破巨钟 + 熄灭炉井（任务书第 4 节）
    this.buildCenterpiece(g, PAL, hl);
    // 随长期进度变化的实物：武器展示柜 + 封闭侧廊（任务书第 6 节）
    this.buildProgressPieces(g, PAL, hl);
    // 训练区（§5.6）与中央信息碑（§5.1）
    this.buildTraining(g);
    this.buildReadout(g);
    // 火盆（沿中轴）
    // 火盆沿中轴，但避开中央炉井。
    // 只有前 2 座带灯光规格（灯光池 roomSlots 只有 8，超了会**回绕覆盖**），
    // 后面的火盆靠自发光表现；它们初始是熄灭的，会随长期进度"恢复使用"（任务书第 6 节）。
    this.braziers = [];
    for (let bi = 0; bi < 3; bi++) {
      const z = [-2.5, 3.5, 9][bi];
      const bowl = new THREE.Mesh(cylGeo(0.52, 0.34, 0.46, 8), getMaterial('#4a4a52', { metalness: 0.7, roughness: 0.45, flat: true }));
      bowl.position.set(0, 1.05, z); g.add(bowl);
      const stem = new THREE.Mesh(cylGeo(0.14, 0.14, 1.05, 6), getMaterial('#3a3a42', { metalness: 0.6, roughness: 0.5, flat: true }));
      stem.position.set(0, 0.53, z); g.add(stem);
      const flame = new THREE.Mesh(cylGeo(0.28, 0.10, 0.7, 6), getMaterial('#ffb347', { emissive: 0xff8a3c, emissiveIntensity: 2.4, flat: true, transparent: true, opacity: 0.9 }));
      flame.position.set(0, 1.45, z); g.add(flame);
      const bowlArt=makePropVisual('hub_brazier');
      if(bowlArt){g.remove(bowl,stem);bowlArt.position.set(0,0,z);g.add(bowlArt);}
      this._anim.push({ m: flame, k: 3, ph: z * 0.7 });
      this.addCollider(-0.6, 0.6, z - 0.6, z + 0.6, 1.3);
      const hasLight = bi < 2;
      if (hasLight) {
        this.lightSpecs.push({ x: 0, y: 1.9, z, color: 0xffb347, intensity: 4.2, distance: 12, flicker: 0.22, tag: 'brazier' + bi });
      }
      this.braziers.push({ flame, lit: hasLight, z });
    }
    // 顶梁
    for (const x of [-hw * 0.62, hw * 0.62]) {
      const beam = new THREE.Mesh(boxGeo(0.9, 0.55, hl * 2 - 2), getMaterial(PAL.dark, { flat: true }));
      beam.position.set(x, WALL_H - 1.1, 0); g.add(beam);
    }
    // 时代徽记（墙上）
    for (const sx of [-1, 1]) {
      const emb = new THREE.Mesh(torusGeo(1.5, 0.18, 4, 16), getMaterial(PAL.trim, { metalness: 0.8, roughness: 0.28, flat: true }));
      emb.position.set(sx * (hw - 0.9), 3.6, 0); emb.rotation.y = Math.PI / 2;
      g.add(emb);
      const core = new THREE.Mesh(cylGeo(0.5, 0.5, 0.2, 8), getMaterial(PAL.glow, { emissive: 0x67e8ff, emissiveIntensity: 1.8, flat: true }));
      core.position.set(sx * (hw - 0.9), 3.6, 0); core.rotation.z = Math.PI / 2;
      g.add(core);
    }
    // 灯光：侧灯 4 条 + 火盆 2 条 + 中央 2 条 = 8 条，**正好等于灯光池的 roomSlots**。
    // （旧版写了 12 条，灯光池会按 head % roomSlots 回绕覆盖，前几条被后几条顶掉。）
    // 这 4 条侧灯会随长期进度从冷青变暖（任务书第 6 节）。
    this.sideLampTags = [];
    for (let i = 0; i < 2; i++) {
      const z = -7 + i * 14;
      for (const sx of [-1, 1]) {
        const tag = 'lamp' + this.sideLampTags.length;
        this.sideLampTags.push(tag);
        this.lightSpecs.push({ x: sx * hw * 0.6, y: 4.2, z, color: 0x8af0ff, intensity: 3.4, distance: 17, flicker: 0.05, tag });
      }
    }
    this.lightSpecs.push({ x: 0, y: 3.0, z: -11, color: 0x67e8ff, intensity: 6.0, distance: 16, flicker: 0.08 });

    function emissive(v) { return v > 1 ? 0x8af0ff : 0xc8a24a; }
  }

  // ------------------------------------------------------------
  //  大厅生活感（PASS3 §21 / §45）
  //
  //  §45 要求"Hub 要像一个**被使用过的**地方"。原来的大厅只有站点与中央锚点 ——
  //  干净、但那不是"有人在这里生活"，而是一间展品厅。
  //  这里补的是"使用痕迹"：货架与木箱贴着工作台那面墙、两口陶罐与一尊雕像
  //  立在北墙两侧、几挂铁链从暗处垂下来。
  //  摆放刻意避开主通道（|x| ≤ 7 的纵向带），不挡路。
  // ------------------------------------------------------------
  buildClutter() {
    const rng = this.rng;
    const place = (prop, x, z, rotY = 0) => {
      if (!prop || !prop.object) return;
      prop.object.position.set(x, 0, z);
      prop.object.rotation.y = rotY;
      this.group.add(prop.object);
      this.props.push(prop);
      if (prop.collider && prop.blocksMove) {
        // **必须用大厅自己的 addCollider**：碰撞体的规范字段是
        // {minx,maxx,minz,maxz,top,bullet,move,ref}。
        // 第一版我自己拼了 {x0,x1,z0,z1,h} —— 字段名全错，读出来是 undefined，
        // 推出计算直接产生 NaN，玩家坐标变成 null（probe_hub 实测 walk timeout、
        // pz=null）。这类错误不会抛异常，只会"莫名其妙走不动"。
        const c = prop.collider;
        this.addCollider(
          x - c.hw, x + c.hw, z - c.hd, z + c.hd,
          (c.y || 0) + (c.h || 1.0),
          { ref: prop, bullet: prop.blocksBullet !== false, move: true },
        );
      }
    };
    // 工作台一侧（东墙）：货架 + 木箱 + 木箱叠起来的那一堆
    place(P.makeShelf(rng, 1), 12.2, -17, -Math.PI / 2);
    place(P.makeShelf(rng, 1), 12.2, 10, -Math.PI / 2);
    place(P.makeCrate(rng, 1), 11.4, 12.6, 0.2);
    place(P.makeCrate(rng, 1), 12.0, 14.2, -0.15);
    place(P.makeBarrel(rng, false), 11.2, 15.6);
    // 熔炉一侧（西墙）：铁链 + 管线 + 一口井盖边的陶罐
    place(P.makeChains(rng, 1), -12.4, -17);
    place(P.makePipes(rng, 1), -12.4, 10);
    place(P.makePot(rng, 1), -11.0, 12.8);
    place(P.makePot(rng, 1), -12.0, 13.6);
    // 北墙两侧：两尊雕像把视线收向中央的巨钟
    const L = P.makeStatue(rng, 1), R = P.makeStatue(rng, 1);
    place(L, -9.0, -18.4, 0);
    place(R, 9.0, -18.4, 0);
    // 地面上的碎屑：不参与碰撞，只是"这里有人走动"
    place(P.makeRubble(rng, 1), 9.4, -14.0);
    place(P.makeRubble(rng, 1), -8.2, -8.6);
    place(P.makeRubble(rng, 1), 6.6, 16.2);
  }

  // ---------- 中央视觉锚点：残破巨钟 + 炉井 ----------
  // 任务书第 4 节：大厅需要一个极强的核心标志，并承担"出征仪式"。
  // 平时巨钟安静、炉井只剩微弱余烬；出征时炉井重新亮起、机械开始运转、
  // 巨钟缓慢鸣响一次、远征门打开 —— 全程数秒，给每次 Run 一个固定仪式。
  buildCenterpiece(g, PAL, hl) {
    const trim = getMaterial('#c8a24a', { metalness: 0.8, roughness: 0.3, flat: true });
    const bronze = getMaterial('#8a6a2a', { metalness: 0.78, roughness: 0.36, flat: true });
    const verd = getMaterial('#3f7a63', { metalness: 0.5, roughness: 0.62, flat: true });   // 青铜绿锈
    const ironDark = getMaterial('#22282e', { metalness: 0.55, roughness: 0.6, flat: true });
    const stone = getMaterial('#39434e', { roughness: 0.86, metalness: 0.1, flat: true });
    const CZ = -11;                       // 中央锚点的 z（正对北墙远征门）

    // ---- 炉井 ----
    const well = new THREE.Group();
    well.position.set(0, 0, CZ);
    g.add(well);
    const rim = new THREE.Mesh(torusGeo(3.7, 0.42, 4, 22), stone);
    rim.rotation.x = Math.PI / 2; rim.position.y = 0.16;
    well.add(rim);
    const shaft = new THREE.Mesh(cylGeo(3.3, 2.7, 3.4, 14, true), ironDark);
    shaft.position.y = -1.7;                     // 井筒向下沉，暗示通往地下
    well.add(shaft);
    const shaftBottom = new THREE.Mesh(cylGeo(2.6, 2.6, 0.3, 14), getMaterial('#120c08', { emissive: 0x1a0a04, emissiveIntensity: 0.6, flat: true }));
    shaftBottom.position.y = -3.3;
    well.add(shaftBottom);
    // 井口栅栏
    for (let i = 0; i < 4; i++) {
      const bar = new THREE.Mesh(boxGeo(6.4, 0.14, 0.18), ironDark);
      bar.position.y = 0.30; bar.rotation.y = (i / 4) * Math.PI;
      well.add(bar);
    }
    // 余烬（平时只有微弱余烬，仪式时变亮变多）
    this.embers = [];
    for (let i = 0; i < 14; i++) {
      const a = this.rng.float(0, Math.PI * 2), r = this.rng.float(0.4, 2.6);
      const em = new THREE.Mesh(boxGeo(0.22, 0.09, 0.22), getMaterial('#ff7a2e', { emissive: 0xff5a10, emissiveIntensity: 0.5, flat: true, transparent: true, opacity: 0.85 }));
      em.position.set(Math.cos(a) * r, this.rng.float(-2.6, 0.1), Math.sin(a) * r);
      em.rotation.y = a;
      well.add(em);
      this.embers.push({ m: em, base: em.position.y, ph: this.rng.float(0, 6.28), r: Math.hypot(em.position.x, em.position.z), a });
    }
    // 四台机械臂（平时静止，仪式时运转）
    this.arms = [];
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      const pivot = new THREE.Group();
      pivot.position.set(Math.cos(a) * 4.5, 1.25, Math.sin(a) * 4.5);
      pivot.rotation.y = -a;
      well.add(pivot);
      const post = new THREE.Mesh(cylGeo(0.26, 0.34, 2.5, 6), ironDark);
      post.position.y = 1.25; pivot.add(post);
      const arm = new THREE.Mesh(boxGeo(2.1, 0.22, 0.34), bronze);
      arm.position.set(-1.0, 1.5, 0); pivot.add(arm);
      const head = new THREE.Mesh(cylGeo(0.30, 0.30, 0.36, 6), trim);
      head.position.set(-2.0, 1.5, 0); head.rotation.z = Math.PI / 2; pivot.add(head);
      const lens = new THREE.Mesh(boxGeo(0.16, 0.16, 0.16), getMaterial('#67e8ff', { emissive: 0x67e8ff, emissiveIntensity: 0.8, flat: true }));
      lens.position.set(-2.2, 1.5, 0); pivot.add(lens);
      this.arms.push({ pivot, head, lens, a });
    }
    // 远征光柱（仪式时升起）
    this.gateColumn = new THREE.Mesh(cylGeo(2.1, 2.5, 9, 12, true),
      getMaterial('#8af0ff', { emissive: 0x67e8ff, emissiveIntensity: 0.0, flat: true, transparent: true, opacity: 0.0, side: true }));
    this.gateColumn.position.set(0, 4.5, CZ);
    g.add(this.gateColumn);
    this.wellPos = { x: 0, z: CZ };
    this.addCollider(-3.9, 3.9, CZ - 3.9, CZ + 3.9, 0.5);   // 井口不可踩进去

    // ---- 残破巨钟 ----
    const bellPivot = new THREE.Group();
    bellPivot.position.set(0, 8.6, CZ);          // 悬挂点
    g.add(bellPivot);
    const bell = new THREE.Mesh(cylGeo(1.1, 3.3, 3.6, 10, true), bronze);
    bell.position.y = -1.9;                       // 钟体在悬挂点下方
    bellPivot.add(bell);
    // 钟口加厚 + 缺口（"残破"）：用几块错位的板拼出缺口
    const rimBell = new THREE.Mesh(torusGeo(3.3, 0.34, 4, 20), verd);
    rimBell.rotation.x = Math.PI / 2; rimBell.position.y = -3.62;
    bellPivot.add(rimBell);
    const gap = new THREE.Mesh(boxGeo(1.4, 1.6, 0.5), ironDark);      // 缺失的一块
    gap.position.set(2.6, -3.0, 1.2); gap.rotation.y = 0.5;
    bellPivot.add(gap);
    const crack = new THREE.Mesh(boxGeo(0.10, 2.2, 0.12), getMaterial('#0d0a06', { flat: true }));
    crack.position.set(-1.7, -2.2, 2.5); crack.rotation.z = 0.24;
    bellPivot.add(crack);
    // 钟钮与横梁
    const crown = new THREE.Mesh(torusGeo(0.42, 0.13, 4, 12), trim);
    crown.position.y = 0.0; bellPivot.add(crown);
    const yoke = new THREE.Mesh(boxGeo(4.6, 0.42, 0.42), ironDark);
    yoke.position.y = 0.25; g.add(yoke);
    // 悬链
    for (const sx of [-1, 1]) {
      const chain = new THREE.Mesh(cylGeo(0.07, 0.07, WALL_H - 11.2, 4), ironDark);
      chain.position.set(sx * 1.6, 11.2 + (WALL_H - 11.2) / 2 - 8.6 + 3.4, CZ - 0.6);
      g.add(chain);
    }
    // 钟舌
    const clapper = new THREE.Mesh(cylGeo(0.30, 0.22, 1.5, 6), getMaterial('#6a6a72', { metalness: 0.7, roughness: 0.45, flat: true }));
    clapper.position.y = -3.2;
    bellPivot.add(clapper);
    this.bell = { pivot: bellPivot, body: bell, clapper, gap, rim: rimBell };

    // ---- 灯光：巨钟轮廓光 + 炉井余烬光（走定长灯光池）----
    this.lightSpecs.push({ x: 0, y: 6.4, z: CZ, color: 0xc8a24a, intensity: 2.4, distance: 14, flicker: 0.05 });
    // 注意：井口光是"仪式驱动"的，用 tag 让 Game 回填池条目后本场景可直接改强度
    this.lightSpecs.push({ x: 0, y: 1.4, z: CZ, color: 0xff7a2e, intensity: 0.7, distance: 13, flicker: 0.18, tag: 'well' });
  }

  // 按"击败过的 Boss"点亮陈列台（任务书 5.5）
  refreshTrophies(bossIds) {
    const got = new Set(bossIds || []);
    if (!this.trophySlots) return;
    for (const s of this.trophySlots) {
      const on = got.has(s.id);
      s.bust.visible = on;
      s.core.visible = on;
    }
  }

  // 按"已达成成就"点亮功勋墙（任务书 5.5）
  refreshWall(earnedIds) {
    // 传入的是 "成就id|类别" —— 类别用于决定战利品颜色
    const list = Array.from(new Set(earnedIds || []));
    if (!this.wallSlots) return;
    this.wallSlots.forEach((slot, i) => {
      const id = list[i];
      const on = !!id;
      slot.plate.visible = on;
      slot.trophy.visible = on;
      if (on) {
        // 不同类别用不同色：战斗=炽橙 / 探索=冷青 / Build=紫 / 武器=金 / 挑战=红
        const cat = String(id).split('|')[1] || '';
        const col = cat === '战斗' ? '#ff8a3c' : cat === '探索' ? '#67e8ff'
          : cat === 'Build' ? '#c07af0' : cat === '武器' ? '#ffd24a' : '#ff6a5a';
        slot.plate.material = getMaterial('#5a6570', { roughness: 0.6, metalness: 0.4, flat: true });
        slot.trophy.material = getMaterial(col, { emissive: col, emissiveIntensity: 2.0, flat: true, metalness: 0.8, roughness: 0.3 });
      }
    });
  }

  // 出征仪式驱动：k 从 0 → 1（由 Game 按时间推进）
  playRitual(k) {
    this.ritual = Math.max(0, Math.min(1, k));
  }

  // ============================================================
  //  英雄配置入口已统一；旧刷新调用只清理遗留实体。
  // Legacy refresh hooks retain this API; hero choices now live in preparation.
  spawnHeroes() {
    for (const hero of this.heroNpcs || []) {
      hero.rig.group.removeFromParent();
      hero.ring?.removeFromParent();
    }
    this.heroNpcs = [];
    this.props = this.props.filter(prop => !String(prop.hub || '').startsWith('hero:'));
  }

  buildProgressPieces(g) {
    const stone = getMaterial('#39434e', { roughness: 0.86, metalness: 0.1, flat: true });
    const gold = getMaterial('#c8a24a', { metalness: 0.78, roughness: 0.32, flat: true });
    // ---- 武器展示柜：两侧各一座，只做收藏陈列 ----
    this.cases = [];
    const HX = this.hw - 1.9;
    for (let i = 0; i < 2; i++) {
      const sx = i === 0 ? -1 : 1;
      const z = -13;
      const holder = new THREE.Group();
      holder.position.set(sx * HX, 0, z);
      holder.rotation.y = sx > 0 ? -Math.PI / 2 : Math.PI / 2;
      g.add(holder);
      const plinth = new THREE.Mesh(boxGeo(0.9, 1.5, 0.9), stone);
      plinth.position.y = 0.75; plinth.castShadow = true; holder.add(plinth);
      const cap = new THREE.Mesh(boxGeo(1.06, 0.12, 1.06), gold);
      cap.position.y = 1.55; holder.add(cap);
      const socket = new THREE.Mesh(boxGeo(0.74, 0.3, 0.74), getMaterial('#1a2026', { roughness: 0.9, metalness: 0.2, flat: true }));
      socket.position.y = 1.75; holder.add(socket);
      const glow = new THREE.Mesh(boxGeo(0.8, 0.05, 0.8), getMaterial('#8af0ff', { emissive: 0x67e8ff, emissiveIntensity: 1.8, flat: true, transparent: true, opacity: 0.9 }));
      glow.position.y = 1.66; glow.visible = false; holder.add(glow);
      this.cases.push({ holder, glow, gun: null, gunId: null, y: 2.0 });
      applyPropAsset(holder,'hub_weaponstand',{keep:[glow]});
      this.addCollider(sx * HX - 0.55, sx * HX + 0.55, z - 0.55, z + 0.55, 1.7);
      // Decorative weapon models; the archive is the single collection browser.
    }

  }

  // 应用长期进度（由 Game 在进入大厅时调用）
  //   tier 0 = 第一次来（人少 / 灯冷 / 柜空 / 角落封闭）
  //   tier 3 = 长期远征者（灯暖 / 柜满 / 侧廊恢复）
  applyProgress(tier, discoveredWeapons) {
    const k = Math.max(0, Math.min(3, tier | 0)) / 3;
    this.tier = tier | 0;
    const lerp = (a, b, t) => a + (b - a) * t;
    const mixCol = (c1, c2, t) => new THREE.Color(c1).lerp(new THREE.Color(c2), t).getHex();
    // 灯光：冷青 → 暖金
    const warm = mixCol(0xc4e4ff, 0xffb347, k);
    for (const tag of (this.sideLampTags || [])) {
      const it = this.lightByTag[tag];
      if (!it || !it.light) continue;
      it.light.color.set(warm);
      it.base = lerp(3.0, 4.8, k);
      it.flicker = 0.05 + k * 0.10;
    }
    // 角落恢复使用：后两座火盆
    if (this.braziers) {
      for (let i = 2; i < this.braziers.length; i++) {
        const b = this.braziers[i];
        const on = (this.tier >= 1);
        b.lit = on;
        b.flame.visible = on;
      }
      // 前两座也随进度更旺
      for (let i = 0; i < 2; i++) {
        const b = this.braziers[i];
        if (b && b.flame) b.flame.scale.setScalar(lerp(0.9, 1.25, k));
        const it = this.lightByTag['brazier' + i];
        if (it) it.base = lerp(3.4, 5.0, k);
      }
    }
    // 武器展示柜：图鉴里已发现的武器以**真实模型**陈列
    const list = (discoveredWeapons || []).filter((id) => WEAPON_MAP[id]);
    if (this.cases) {
      for (let i = 0; i < this.cases.length; i++) {
        const c = this.cases[i];
        const id = list[i];
        if (!id) { c.glow.visible = false; if (c.gun) c.gun.visible = false; continue; }
        if (c.gunId !== id) {
          if (c.gun) c.holder.remove(c.gun);
          const def = WEAPON_MAP[id];
          let m = null;
          try { m = buildGunModel(def.model); } catch (e) { m = null; }
          if (m) {
            m.position.set(0, c.y, 0);
            m.scale.setScalar(1.5);
            m.rotation.set(0, 0, 0.18);
            c.holder.add(m);
          }
          c.gun = m; c.gunId = id;
        } else if (c.gun) c.gun.visible = true;
        c.glow.visible = true;
      }
    }
    // 封闭侧廊：tier ≥ 2 时"恢复使用"
    if (this.sealedAlcove) {
      const open = this.tier >= 2;
      this.sealedAlcove.bars.forEach((b) => { b.visible = !open; });
      this.sealedAlcove.lamp.visible = open;
      this.sealedAlcove.group.visible = true;
    }
    // 巨钟修补：tier ≥ 2 时缺口被补上
    if (this.bell && this.bell.gap) this.bell.gap.visible = this.tier < 2;
  }

  // ---------- 训练区（任务书 §5.6） ----------
  buildTraining(g) {
    const stone = getMaterial('#39434e', { roughness: 0.86, metalness: 0.1, flat: true });
    const iron = getMaterial('#2a3036', { metalness: 0.6, roughness: 0.5, flat: true });
    const warn = getMaterial('#8a3a1a', { emissive: 0x5a1a08, emissiveIntensity: 0.7, flat: true });
    // 场地边界：两条黄黑警戒条 + 一块说明牌
    for (const sx of [-11.5, 11.5]) {
      const rail = new THREE.Mesh(boxGeo(0.4, 0.5, 11), warn);
      rail.position.set(sx, 0.25, 15.5); g.add(rail);
      this.addCollider(sx - 0.3, sx + 0.3, 10, 21, 0.6);
    }
    const board = new THREE.Mesh(boxGeo(3.0, 1.7, 0.3), stone);
    board.position.set(-9.2, 1.5, 20.2); board.rotation.y = 0.6; g.add(board);
    const mark = new THREE.Mesh(boxGeo(2.2, 0.16, 0.06), iron);
    mark.position.set(-9.2, 1.9, 20.4); mark.rotation.y = 0.6; g.add(mark);
    // 移动靶的滑轨
    const rail = new THREE.Mesh(boxGeo(19, 0.18, 0.3), iron);
    rail.position.set(0, 0.42, 17.5); g.add(rail);
    // 摆动刀（翻滚练习）：底座 + 摆臂 + 刀刃
    const base = new THREE.Mesh(cylGeo(0.5, 0.7, 0.5, 8), stone);
    base.position.set(PENDULUM.x, 0.25, PENDULUM.z); g.add(base);
    const armPivot = new THREE.Group();
    armPivot.position.set(PENDULUM.x, 5.0, PENDULUM.z);
    g.add(armPivot);
    const arm = new THREE.Mesh(boxGeo(0.18, PENDULUM.len, 0.26), iron);
    arm.position.y = -PENDULUM.len / 2; armPivot.add(arm);
    const blade = new THREE.Mesh(boxGeo(0.9, 0.5, 0.22), getMaterial('#c8ccd2', { metalness: 0.85, roughness: 0.3, flat: true }));
    blade.position.y = -PENDULUM.len; armPivot.add(blade);
    const edge = new THREE.Mesh(boxGeo(0.94, 0.1, 0.06), getMaterial('#ffd24a', { emissive: 0xffb347, emissiveIntensity: 1.6, flat: true }));
    edge.position.set(0, -PENDULUM.len - 0.28, 0); armPivot.add(edge);
    this.pendulum = { pivot: armPivot, blade, edge, ph: 0 };
  }

  // ---------- 中央信息碑（任务书 §5.1：当前英雄 / 本局准备状态） ----------
  buildReadout(g) {
    const stone = getMaterial('#39434e', { roughness: 0.86, metalness: 0.1, flat: true });
    const gold = getMaterial('#c8a24a', { metalness: 0.78, roughness: 0.32, flat: true });
    const grp = new THREE.Group();
    grp.position.set(-4.2, 0, this.wellPos.z + 3.0);
    grp.rotation.y = 0.55;
    g.add(grp);
    const slab = new THREE.Mesh(boxGeo(2.0, 2.6, 0.34), stone);
    slab.position.y = 1.3; slab.castShadow = true; grp.add(slab);
    const cap = new THREE.Mesh(boxGeo(2.2, 0.2, 0.44), gold);
    cap.position.y = 2.7; grp.add(cap);
    // 字条（用发光条表示"碑文"）
    this.readoutLines = [];
    for (let i = 0; i < 5; i++) {
      const line = new THREE.Mesh(boxGeo(1.5, 0.10, 0.06), getMaterial('#8af0ff', { emissive: 0x67e8ff, emissiveIntensity: 1.8, flat: true, transparent: true, opacity: 0.9 }));
      line.position.set(0, 2.25 - i * 0.34, 0.20);
      grp.add(line);
      this.readoutLines.push(line);
    }
    applyPropAsset(grp,'hub_readout',{keep:this.readoutLines});
    this.addCollider(-5.6, -2.8, this.wellPos.z + 2.4, this.wellPos.z + 3.6, 2.9);
  }

  // 档案台进度：桌上典籍的亮度 + 一排档案格随发现数填满
  setCodexProgress(seen, total) {
    const k = total > 0 ? seen / total : 0;
    if (this.codexBook && this.codexBook.material) {
      this.codexBook.material.emissiveIntensity = 0.9 + k * 2.4;
    }
    if (this.codexSlots) {
      const lit = Math.round(this.codexSlots.length * k);
      this.codexSlots.forEach((m, i) => { m.visible = i < lit; });
    }
  }

  // 中央信息碑碑文：用亮度表示"当前准备"}（只看形状，具体文本在面板里）
  setReadout(level) {
    const L = Math.max(0, Math.min(this.readoutLines ? this.readoutLines.length : 0, level | 0));
    if (!this.readoutLines) return;
    this.readoutLines.forEach((m, i) => {
      m.visible = i < L;
      m.material.emissiveIntensity = 1.4 + (i === 0 ? 0.8 : 0);
    });
  }

  // 当前出征英雄在前厅里的标记（任务书 §5.1：当前选择英雄展示）
  markSelectedHero(id) {
    if (!this.heroNpcs) return;
    for (const n of this.heroNpcs) {
      if (!n.ring) {
        const ring = new THREE.Mesh(torusGeo(0.75, 0.06, 3, 18), getMaterial('#67e8ff', { emissive: 0x67e8ff, emissiveIntensity: 2.2, flat: true }));
        ring.rotation.x = Math.PI / 2;
        ring.position.set(n.spot.x, 0.06, n.spot.z);
        this.group.add(ring);
        n.ring = ring;
      }
      n.ring.visible = (n.id === id);
    }
    this.selectedHero = id;
  }

  // ---------- 功能点 ----------
  makeStations() {
    for (const st of HUB_STATIONS) {
      const g = new THREE.Group();
      const keepArt=[];
      const gold = getMaterial('#c8a24a', { metalness: 0.78, roughness: 0.32, flat: true });
      const glow = getMaterial('#8af0ff', { emissive: 0x67e8ff, emissiveIntensity: 2.0, flat: true });
      const stone = getMaterial('#39434e', { roughness: 0.86, metalness: 0.1, flat: true });
      if (st.id === 'training') {
        const box = new THREE.Mesh(boxGeo(1.5, .8, 1.1), stone); box.position.y = .4; g.add(box);
        const lid = new THREE.Mesh(boxGeo(1.6, .15, 1.2), gold); lid.position.y = .88; g.add(lid);
        const core = new THREE.Mesh(boxGeo(.35, .15, .35), glow); core.position.y = .98; g.add(core);
        keepArt.push(core);
      } else if (st.id === 'expedition') {
        // 出征台：一圈悬浮铭牌
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          const pl = new THREE.Mesh(boxGeo(1.5, 0.14, 0.7), i % 2 ? gold : glow);
          pl.position.set(Math.cos(a) * 2.7, 0.95 + (i % 2) * 0.22, Math.sin(a) * 2.7);
          pl.rotation.y = -a;
          g.add(pl); this._anim.push({ m: pl, k: 4, ph: i });
        }
      } else if (st.id === 'hero') {
        const pillar = new THREE.Mesh(cylGeo(0.7, 0.9, 2.2, 6), stone);
        pillar.position.y = 1.1; pillar.castShadow = true; g.add(pillar);
        const bust = new THREE.Mesh(boxGeo(0.7, 0.8, 0.5), gold);
        bust.position.y = 2.3; g.add(bust);
        this.addCollider(st.x - 0.9, st.x + 0.9, st.z - 0.9, st.z + 0.9, 2.6);
      } else if (st.id === 'armory') {
        const table = new THREE.Mesh(boxGeo(3.2, 0.9, 1.6), stone);
        table.position.y = 0.45; table.castShadow = true; g.add(table);
        for (let i = 0; i < 3; i++) {
          const gun = new THREE.Mesh(boxGeo(1.1, 0.16, 0.2), i === 1 ? glow : gold);
          gun.position.set(-1 + i, 1.0, 0.1); gun.rotation.y = 0.3 * (i - 1);
          g.add(gun); this._anim.push({ m: gun, k: 5, ph: i * 1.4 });
        }
        this.addCollider(st.x - 1.7, st.x + 1.7, st.z - 0.9, st.z + 0.9, 1.0);
      } else if (st.id === 'merchant') {
        const stall = new THREE.Mesh(boxGeo(3.0, 1.0, 1.8), stone);
        stall.position.y = 0.5; g.add(stall);
        const hood = new THREE.Mesh(cylGeo(0.36, 0.5, 1.5, 6), getMaterial('#5a4a6a', { flat: true }));
        hood.position.set(0, 1.6, 0); g.add(hood);
        const eye = new THREE.Mesh(boxGeo(0.36, 0.08, 0.08), getMaterial('#c07af0', { emissive: 0x9b5ad0, emissiveIntensity: 2.2, flat: true }));
        eye.position.set(0, 1.72, 0.42); g.add(eye);
        keepArt.push(hood,eye);
        this.addCollider(st.x - 1.6, st.x + 1.6, st.z - 1.0, st.z + 1.0, 1.2);
      } else if (st.id === 'wall') {
        // 功勋墙（任务书 5.5）：不要做成普通菜单列表 ——
        // 每个成就对应一块**实物牌位**，未达成时是暗格（有轮廓、无光），
        // 达成后才亮起并长出对应类别的战利品。玩家能"看见"自己的进度。
        const slab = new THREE.Mesh(boxGeo(6.2, 4.2, 0.5), stone);
        slab.position.set(0, 2.1, -0.4); g.add(slab);
        const frame = new THREE.Mesh(boxGeo(6.6, 0.22, 0.7), gold);
        frame.position.set(0, 4.25, -0.3); g.add(frame);
        this.wallSlots = [];
        const COLS = 5, ROWS = 3;                    // 15 个牌位（成就 14 个 + 1 个总牌）
        for (let i = 0; i < COLS * ROWS; i++) {
          const cx = (i % COLS - (COLS - 1) / 2) * 1.16;
          const cy = 3.5 - Math.floor(i / COLS) * 1.12;
          const socket = new THREE.Mesh(boxGeo(0.98, 0.92, 0.10),
            getMaterial('#1a2026', { roughness: 0.9, metalness: 0.2, flat: true }));
          socket.position.set(cx, cy, -0.10);
          g.add(socket);
          const plate = new THREE.Mesh(boxGeo(0.82, 0.74, 0.14),
            getMaterial('#4a5560', { roughness: 0.7, metalness: 0.35, flat: true }));
          plate.position.set(cx, cy, -0.02);
          plate.visible = false;                     // 未达成 → 只有暗格
          g.add(plate);
          const trophy = new THREE.Mesh(boxGeo(0.34, 0.34, 0.20),
            getMaterial('#c8a24a', { emissive: 0xc8a24a, emissiveIntensity: 1.6, flat: true, metalness: 0.8, roughness: 0.28 }));
          trophy.position.set(cx, cy, 0.08);
          trophy.visible = false;                    // 达成 → 亮起 + 战利品
          g.add(trophy);
          this.wallSlots.push({ plate, trophy, socket, x: cx, y: cy });
          keepArt.push(plate,trophy,socket);
        }
        this.addCollider(st.x - 3.1, st.x + 3.1, st.z - 0.7, st.z + 0.1, 4.4);
      } else if (st.id === 'codex') {
        const desk = new THREE.Mesh(boxGeo(2.6, 1.0, 1.4), stone);
        desk.position.y = 0.5; g.add(desk);
        const book = new THREE.Mesh(boxGeo(1.4, 0.22, 1.0),
          getMaterial('#8af0ff', { emissive: 0x67e8ff, emissiveIntensity: 0.9, flat: true }));
        book.position.y = 1.12; book.rotation.y = 0.2; g.add(book);
        this.codexBook = book;
        keepArt.push(book);
        // 档案格：随发现条目数填满（进度是看得见的，不是一行文字）
        this.codexSlots = [];
        for (let i = 0; i < 10; i++) {
          const slot = new THREE.Mesh(boxGeo(0.34, 0.5, 0.1), getMaterial('#ffd24a', { emissive: 0xc8a24a, emissiveIntensity: 1.8, flat: true }));
          slot.position.set(st.x - 1.8 + i * 0.4 - st.x, 1.75, -0.35);
          slot.visible = false;
          g.add(slot);
          this.codexSlots.push(slot);
          keepArt.push(slot);
        }
        this.addCollider(st.x - 1.4, st.x + 1.4, st.z - 0.8, st.z + 0.8, 1.2);
      } else if (st.id === 'practice') {
        const arch = new THREE.Mesh(torusGeo(2.0, 0.24, 4, 18), gold);
        arch.position.set(0, 2.0, 0); g.add(arch);
        const inner = new THREE.Mesh(planeGeo(3.4, 3.6), getMaterial('#0d1518', { emissive: 0x2a6d7a, emissiveIntensity: 0.7, flat: true, transparent: true, opacity: 0.8 }));
        inner.position.set(0, 2.0, 0.02); g.add(inner);
        this._anim.push({ m: inner, k: 2 });
      } else if (st.id === 'trophy') {
        // Boss Trophy 台（任务书 5.5）：三个槽位对应 Boss Pool，
        // 击败过的 Boss 才会出现在台上 —— 用"陈列"代替一行统计数字。
        const plinth = new THREE.Mesh(cylGeo(1.9, 2.3, 1.4, 8), stone);
        plinth.position.y = 0.7; plinth.castShadow = true; g.add(plinth);
        this.trophySlots = [];
        for (let i = 0; i < 3; i++) {
          const a = (i / 3) * Math.PI * 2 + 0.5;
          const px = Math.cos(a) * 1.05, pz = Math.sin(a) * 1.05;
          const seat = new THREE.Mesh(cylGeo(0.42, 0.5, 0.5, 6), getMaterial('#2a3036', { roughness: 0.8, metalness: 0.3, flat: true }));
          seat.position.set(px, 1.62, pz); g.add(seat);
          const bust = new THREE.Mesh(cylGeo(0.26, 0.42, 0.9, 6), getMaterial('#6a2a1a', { emissive: 0x3a1008, emissiveIntensity: 0.7, flat: true }));
          bust.position.set(px, 2.2, pz); bust.visible = false; g.add(bust);
          const core = new THREE.Mesh(cylGeo(0.14, 0.14, 0.2, 6), getMaterial('#ff7a2e', { emissive: 0xff5a10, emissiveIntensity: 2.2, flat: true }));
          core.position.set(px, 2.2, pz + 0.3); core.rotation.x = Math.PI / 2; core.visible = false; g.add(core);
          this.trophySlots.push({ bust, core, id: BOSS_IDS[i] });
          keepArt.push(seat,bust,core);
        }
        this.addCollider(st.x - 2.2, st.x + 2.2, st.z - 2.2, st.z + 2.2, 4.4);
      }
      const artId={training:'hub_training',merchant:'hub_merchant',wall:'hub_wall',codex:'hub_codex',trophy:'hub_trophy'}[st.id];
      if(artId)applyPropAsset(g,artId,{keep:keepArt});
      g.position.set(st.x, 0, st.z);
      this.group.add(g);
      // 注册为可交互物（与房间道具同一套字段，Game.interactables 直接可用）
      this.props.push({
        kind: 'hub', hub: st.id, object: g,
        worldX: st.x + this.ox, worldZ: st.z + this.oz, localX: st.x, localZ: st.z,
        label: st.cn, act: st.act, hint: st.label, radius: st.r,
      });
    }
  }

  update(dt) {
    this.t += dt;
    const R = this.ritual;
    // ---- 炉井：余烬呼吸；仪式时变亮、上浮、转速拉满 ----
    if (this.embers) {
      for (const e of this.embers) {
        const lift = R * 1.2;
        e.m.position.y = e.base + Math.sin(this.t * (1.6 + R * 2.2) + e.ph) * (0.10 + R * 0.22) + lift * Math.max(0, Math.sin(this.t * 1.4 + e.ph));
        e.m.material.emissiveIntensity = 0.35 + R * 2.6 + Math.sin(this.t * 3 + e.ph) * 0.25;
        e.m.material.opacity = 0.5 + R * 0.5;
      }
    }
    if (this.arms) {
      for (const a of this.arms) {
        a.pivot.rotation.y = -a.a + this.t * (0.05 + R * 1.5) * (a.a % 2 < 1 ? 1 : -1) * 0.35;
        a.head.rotation.z += dt * (0.2 + R * 5);
        a.lens.material.emissiveIntensity = 0.5 + R * 2.4;
      }
    }
    // ---- 巨钟：平时极缓慢摆动；仪式时摆幅放大并"鸣响" ----
    if (this.bell) {
      const amp = 0.010 + R * 0.085;
      const rate = 0.55 + R * 0.9;
      this.bell.pivot.rotation.z = Math.sin(this.t * rate) * amp;
      this.bell.clapper.rotation.z = Math.sin(this.t * rate - 0.5) * amp * 2.2;
    }
    // ---- 远征光柱：仪式推进时升起 ----
    if (this.gateColumn) {
      this.gateColumn.material.opacity = Math.max(0, R - 0.35) * 0.85;
      this.gateColumn.material.emissiveIntensity = Math.max(0, R - 0.35) * 3.0;
      this.gateColumn.scale.y = 0.25 + Math.max(0, R - 0.35) * 0.95;
    }
    // ---- 翻滚练习：摆动刀扫动（真实危险源，伤害判定在 Game 侧）----
    if (this.pendulum) {
      const a = Math.sin(this.t * (Math.PI * 2 / PENDULUM.period) + this.pendulum.ph) * 1.15;
      this.pendulum.pivot.rotation.z = a;
      this.pendulum.edge.material.emissiveIntensity = 1.2 + Math.abs(Math.cos(this.t * 2.2)) * 1.2;
    }
    // ---- 井口光强度（池条目由 Game 回填）----
    const wl = this.lightByTag.well;
    if (wl && wl.light) { wl.base = 0.7 + R * 5.6; wl.light.intensity = wl.base; }
    for (const a of this._anim) {
      const m = a.m;
      if (a.k === 0) m.rotation.z += dt * a.sp;
      else if (a.k === 1) m.material.emissiveIntensity = 1.6 + Math.sin(this.t * 2.2) * 0.5;
      else if (a.k === 2) m.material.opacity = 0.6 + Math.sin(this.t * 1.6) * 0.2;
      else if (a.k === 3) { m.material.opacity = 0.7 + Math.sin(this.t * 6 + a.ph) * 0.25; m.scale.y = 0.9 + Math.sin(this.t * 5 + a.ph) * 0.12; }
      else if (a.k === 4) { m.position.y = 0.95 + (a.ph % 2) * 0.22 + Math.sin(this.t * 1.8 + a.ph) * 0.12; }
      else if (a.k === 5) { m.position.y = 1.0 + Math.sin(this.t * 2.0 + a.ph) * 0.05; }
    }
  }

  dispose() {
    if (this.group.parent) this.group.parent.remove(this.group);
    this.group.traverse((o) => { if (o.isMesh && o.geometry && o.userData.ownGeo) o.geometry.dispose(); });
    this.colliders.length = 0;
    this.props.length = 0;
    this.heroNpcs = [];
    this.lightSpecs.length = 0;
    this._anim.length = 0;
  }
}

// 训练区（任务书 §5.6）：Dummy / 移动靶 / 耐久靶（测主动技能）+ 翻滚练习（摆动刀）。
// 全部复用真实战斗链路 —— 真实弹丸、真实伤害、真实命中反馈。
// 训练区靶位。
// **坐标必须落在内区之内**：大厅 inner = 20（可走范围）而 half = 22（含墙），
// 落在 20~22 之间的东西会被南墙挡住 —— 玩家只看到"墙后面好像有东西"。
// 旧值 tank z=20.5 / 陈列枪 z=21.5 正好卡在墙体里，实测被反馈"最下方的枪完全看不见"。
export const TRAINING = [
  { kind: 'dummy', x: -6.0, z: 13.0, cn: '木桩', hp: 120 },
  { kind: 'dummy', x: 0.0, z: 14.5, cn: '木桩', hp: 120 },
  { kind: 'dummy', x: 6.0, z: 13.0, cn: '木桩', hp: 120 },
  { kind: 'mover', x: 0.0, z: 15.8, cn: '移动靶', from: -9.0, to: 9.0, speed: 3.4 },
  { kind: 'tank', x: 0.0, z: 19.0, cn: '耐久靶', hp: 900 },
  // 射击靶：会向玩家开火，用来练 Perfect Dodge / 静火 / 弹道偏转（§42）
  { kind: 'shooter', x: 0.0, z: 6.5, cn: '射击靶', hp: 260 },
];
// 摆动钟（翻滚练习用）。大厅是**安全区**：它只会把玩家推开、不会真的扣血 ——
// 玩家实测反馈"在大厅里会被钟摆打伤"，那既不合理也让人不敢靠近训练区。
// 真实受击流程仍然会走（受击反馈 / 无敌帧 / 击退都在），只是伤害记 0。
export const PENDULUM = { x: 0, z: 10.2, len: 3.4, period: 2.6 };
