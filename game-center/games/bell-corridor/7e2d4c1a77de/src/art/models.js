// ============================================================
//  低多边形角色建模 —— 全部由基础几何体手工构建，带可动关节
//  返回 { group, head, armL, armR, legL, legR, torso, weaponMount, ... }
// ============================================================
import * as THREE from '../../vendor/three.module.js';
import { getMaterial } from './materials.js';

// 几何体共享缓存：角色 / 敌人 / 机关大量复用同样尺寸的基础几何，
// 缓存后每局少分配数千个 BufferGeometry。
const GC = new Map();
function geo(key, make) {
  let g = GC.get(key);
  if (g) return g;
  g = make();
  g.userData.shared = true;
  GC.set(key, g);
  return g;
}
export function box(w, h, d) { return geo(`b${w},${h},${d}`, () => new THREE.BoxGeometry(w, h, d)); }
export function cyl(rt, rb, h, seg = 6, open = false) { return geo(`c${rt},${rb},${h},${seg},${open ? 1 : 0}`, () => new THREE.CylinderGeometry(rt, rb, h, seg, 1, open)); }
export function cone(r, h, seg = 6) { return geo(`k${r},${h},${seg}`, () => new THREE.ConeGeometry(r, h, seg)); }
export function ico(r, d = 0) { return geo(`i${r},${d}`, () => new THREE.IcosahedronGeometry(r, d)); }
export function sph(r, ws = 7, hs = 5) { return geo(`s${r},${ws},${hs}`, () => new THREE.SphereGeometry(r, ws, hs)); }
export function torus(r, t, rs = 6, ts = 8) { return geo(`t${r},${t},${rs},${ts}`, () => new THREE.TorusGeometry(r, t, rs, ts)); }

export function M(color, emissive, ei = 1.4, opts = {}) {
  return getMaterial(color, { emissive, emissiveIntensity: ei, flat: true, roughness: opts.rough ?? 0.78, metalness: opts.metal ?? 0.12, ...opts });
}
export function ME(color, ei = 2.2, opts = {}) {
  return getMaterial('#0a0a0a', { emissive: color, emissiveIntensity: ei, flat: true, roughness: 1.0, metalness: 0, ...opts });
}
export function MG(color, opts = {}) {
  return getMaterial(color, { flat: true, roughness: opts.rough ?? 0.42, metalness: opts.metal ?? 0.85, ...opts });
}

export function put(parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1, shadow = true) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  m.scale.set(sx, sy, sz);
  m.castShadow = shadow; m.receiveShadow = true;
  parent.add(m);
  return m;
}

export function group(parent, x = 0, y = 0, z = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);
  return g;
}

// 分享面片：所有角色共用几何体以降低内存
const G = {
  unit: box(1, 1, 1),
  quad: box(1, 1, 1),
  joint: ico(1, 0),
  joint1: ico(1, 1),
};
for (const k in G) G[k].userData.shared = true;

function pc(parent, mat, x, y, z, w, h, d, rx = 0, ry = 0, rz = 0) {
  const m = new THREE.Mesh(G.unit, mat);
  m.position.set(x, y, z); m.scale.set(w, h, d); m.rotation.set(rx, ry, rz);
  m.castShadow = true; m.receiveShadow = true;
  parent.add(m);
  return m;
}

// ============================================================
//  玩家：深渊游侠
// ============================================================
export function buildPlayer(pal = {}, build = null) {
  const c = {
    coat: pal.coat || '#2f6f84', coatDark: pal.coatDark || '#1d4a5c',
    skin: pal.skin || '#e5b48c', hood: pal.hood || '#3f8ea6',
    boot: pal.boot || '#2b2b34', accent: pal.accent || '#67e8ff',
    belt: pal.belt || '#8a5a2b',
  };
  const root = new THREE.Group();
  const body = group(root, 0, 0, 0);
  const mCoat = M(c.coat), mCoatD = M(c.coatDark), mSkin = M(c.skin), mHood = M(c.hood),
    mBoot = M(c.boot), mBelt = M(c.belt), mAcc = ME(c.accent, 2.6), mEye = ME('#9ffcff', 3.2);

  const hips = group(body, 0, 0.85, 0);
  pc(hips, mCoatD, 0, 0, 0, 0.66, 0.30, 0.42);
  // 腰包
  pc(hips, mBelt, 0, 0.10, 0, 0.70, 0.13, 0.46);
  pc(hips, M('#6d4527'), 0.30, -0.04, 0.24, 0.20, 0.20, 0.14);
  pc(hips, M('#6d4527'), -0.30, -0.04, 0.24, 0.20, 0.20, 0.14);

  const torso = group(body, 0, 1.18, 0);
  pc(torso, mCoat, 0, 0.02, 0, 0.72, 0.62, 0.46);
  pc(torso, mCoat, 0, 0.30, 0, 0.80, 0.18, 0.50);
  // 胸甲片
  pc(torso, M('#27606f'), 0, 0.10, 0.24, 0.52, 0.42, 0.06);
  pc(torso, M(c.accent, null, 0, { rough: 0.5 }), 0.16, 0.16, 0.27, 0.10, 0.10, 0.03);
  pc(torso, mAcc, -0.16, 0.16, 0.27, 0.10, 0.10, 0.03, 0, 0, Math.PI / 4);
  // 肩甲
  pc(torso, mCoatD, 0.44, 0.28, 0, 0.26, 0.22, 0.44);
  pc(torso, mCoatD, -0.44, 0.28, 0, 0.26, 0.22, 0.44);
  // 大衣下摆
  const capePivot = group(torso, 0, -0.28, -0.02);
  pc(capePivot, mCoatD, 0, -0.26, -0.16, 0.78, 0.60, 0.10, 0.24, 0, 0);
  pc(capePivot, mCoat, 0.24, -0.30, 0.16, 0.28, 0.66, 0.10, 0.16, 0, 0);
  pc(capePivot, mCoat, -0.24, -0.30, 0.16, 0.28, 0.66, 0.10, 0.16, 0, 0);

  // 头
  const neck = group(torso, 0, 0.46, 0);
  pc(neck, mSkin, 0, 0.02, 0, 0.24, 0.14, 0.24);
  const head = group(neck, 0, 0.16, 0);
  pc(head, mSkin, 0, 0, 0.02, 0.40, 0.38, 0.36);
  // 兜帽（结构开关 hood：关掉时隐藏兜帽，露出下面的头部轮廓）
  const hoodMain = pc(head, mHood, 0, 0.08, -0.05, 0.52, 0.44, 0.48);
  const hoodBack = put(head, cone(0.30, 0.42, 5), mHood, 0, 0.02, -0.26, -1.35, 0, 0);
  pc(head, mHood, 0, -0.16, 0.14, 0.50, 0.18, 0.30);
  // 面罩与发光眼
  pc(head, M('#1c2b33'), 0, -0.06, 0.20, 0.34, 0.24, 0.06);
  const eyeL = put(head, box(0.08, 0.055, 0.03), mEye, -0.09, 0.0, 0.235);
  const eyeR = put(head, box(0.08, 0.055, 0.03), mEye, 0.09, 0.0, 0.235);
  // 后飘带
  const tail = put(head, box(0.10, 0.46, 0.05), mCoat, 0.0, 0.06, -0.34, 0.5, 0, 0);

  // 手臂
  const mkArm = (side) => {
    const sh = group(torso, side * 0.48, 0.24, 0);
    pc(sh, mCoat, 0, -0.14, 0, 0.22, 0.34, 0.24);
    const el = group(sh, 0, -0.32, 0);
    pc(el, mSkin, 0, -0.16, 0, 0.19, 0.30, 0.20);
    const hand = group(el, 0, -0.32, 0);
    pc(hand, M('#25424d'), 0, -0.06, 0, 0.19, 0.16, 0.20);
    return { sh, el, hand };
  };
  const armR = mkArm(1), armL = mkArm(-1);
  const wm = group(armR.hand, 0.02, -0.10, 0.18);

  // 腿
  const mkLeg = (side) => {
    const hip = group(hips, side * 0.20, -0.12, 0);
    pc(hip, mCoatD, 0, -0.20, 0, 0.24, 0.40, 0.26);
    const knee = group(hip, 0, -0.40, 0);
    pc(knee, mBoot, 0, -0.18, 0, 0.22, 0.36, 0.24);
    const foot = group(knee, 0, -0.38, 0);
    pc(foot, mBoot, 0, -0.05, 0.06, 0.24, 0.14, 0.34);
    return { hip, knee, foot };
  };
  const legR = mkLeg(1), legL = mkLeg(-1);

  // 背后的披风（大件，摆动）
  const cloakPivot = group(body, 0, 1.42, -0.24);
  const cloakM = M(c.coatDark);
  const cloak = put(cloakPivot, box(0.86, 1.15, 0.09), cloakM, 0, -0.5, -0.08, 0.14, 0, 0);
  const cloak2 = put(cloakPivot, box(0.66, 0.5, 0.08), mCoat, 0, -1.02, -0.22, 0.3, 0, 0);

  // ---------- 英雄结构层（任务书 §36）----------
  // build 是一组**结构开关**，不是 if (hero.id)。
  // 它决定肩部 / 背部 / 头部轮廓 / 大型装备 / 腰部附件 / 发光部件，
  // 目标：把模型涂成纯黑以后，仍能靠 Silhouette 分辨职业（§36 / §37）。
  const rig = {
    group: root, body, hips, torso, neck, head, tail, capePivot, cloakPivot, cloak, cloak2,
    armR, armL, legR, legL, weaponMount: wm, eyes: [eyeL, eyeR], hoodBack,
    height: 2.05,
    hoodMain,
  };
  applyHeroBuild(rig, normalizeBuild(build), {
    mCoat, mCoatD, mHood, mSkin, mAcc,
    chestArmor: M('#27606f'), visorDark: M('#1c2b33'), c,
  });
  return rig;
}

// 兼容旧写法：build: 'hood' / 'tanks' / 'visor' / 'scrap'
function normalizeBuild(b) {
  if (!b) return {};
  if (typeof b !== 'string') return b;
  return {
    hood: b === 'hood', backTank: b === 'tanks', visor: b === 'visor', scrapPack: b === 'scrap',
  };
}

// 把结构开关落成真实几何。
// 全部使用 pc()（共享单位盒 + 缩放）与 geo() 缓存的 cyl/cone/ico ——
// **不新增任何 BufferGeometry**，符合 §56「高频模型不制造大量新 Geometry」。
function applyHeroBuild(rig, B, mats) {
  const { body, torso, head, hips, armR, armL, cloakPivot, cloak, cloak2 } = rig;
  const { mCoat, mCoatD, mHood, mSkin, mAcc, chestArmor, visorDark, c } = mats;
  const acc = ME(c.accent, 2.4);
  const dark = M(c.coatDark || '#1d4a5c');

  // hood：唯一一个"默认开启"的结构开关 —— 显式给 false 时隐藏兜帽，
  // 让这个字段**真的被消费**，而不是永远为 true 的装饰性数据。
  if (B.hood === false) {
    if (rig.hoodMain) rig.hoodMain.visible = false;
    if (rig.hoodBack) rig.hoodBack.visible = false;
  }

  // ---- 体型比例：俯视角下最容易读到的差异 ----
  const bulk = B.bulk || 1, tall = B.tall || 1;
  if (bulk !== 1) { torso.scale.x = bulk; torso.scale.z = bulk; hips.scale.x = bulk; hips.scale.z = bulk; }
  if (tall !== 1) { body.scale.y = tall; }

  // ---- 守钟人：一侧钟形肩甲 + 小钟锤 ----
  if (B.bellPauldron) {
    rig.bellPauldron = pc(torso, mAcc, 0.50, 0.34, 0, 0.34, 0.34, 0.46);   // 垫高右肩
    const bell = put(torso, cone(0.26, 0.34, 6), mAcc, 0.52, 0.52, 0, 0, 0, 0);
    bell.rotation.z = Math.PI;                                    // 倒扣的钟形
    put(torso, box(0.10, 0.28, 0.10), dark, 0.52, 0.30, 0.16);    // 小钟锤垂挂
    pc(torso, acc, 0.52, 0.30, 0.16, 0.09, 0.09, 0.09);
  }
  // ---- 熔铸匠：双炉罐 + 厚手套 + 粗肩 ----
  if (B.backTank) {
    rig.backTank = group(torso, 0, 0, 0);                       // 双炉罐（具名，便于断言）
    for (const sx of [-1, 1]) {
      put(rig.backTank, cyl(0.19, 0.19, 0.78, 6), M('#6a5230'), sx * 0.22, -0.02, -0.34);
      put(rig.backTank, cyl(0.09, 0.09, 0.10, 6), ME('#ff8a3c', 2.2), sx * 0.22, 0.42, -0.34);
    }
    pc(torso, M('#4a4a52'), 0, 0.22, -0.30, 0.66, 0.24, 0.26);     // 罐体支架
    pc(torso, M('#4a4a52'), -0.56, 0.30, 0, 0.32, 0.24, 0.44);     // 加粗双肩
    pc(torso, M('#4a4a52'), 0.56, 0.30, 0, 0.32, 0.24, 0.44);
    for (const arm of [armR, armL]) pc(arm.hand, M('#5a3a22'), 0, -0.08, 0, 0.26, 0.24, 0.28);  // 厚手套
  }
  // ---- 余烬游侠：目镜 + 长围巾 ----
  if (B.visor) {
    pc(head, visorDark, 0, 0.02, 0.21, 0.46, 0.14, 0.06);
    pc(head, acc, 0, 0.02, 0.235, 0.34, 0.05, 0.03);               // 发光目镜条
    const scarf = put(torso, box(0.30, 1.5, 0.10), mCoat, 0.0, -0.55, -0.20, 0.22, 0, 0);
    rig.scarf = scarf;                                            // 长围巾（可摆动）
    pc(torso, mCoatD, 0, 0.26, 0.24, 0.42, 0.20, 0.10);           // 围巾结
  }
  // ---- 拾荒客：大废料背包 + 外挂零件（不对称） ----
  if (B.scrapPack) {
    pc(torso, M('#3a3f46'), 0, 0.06, -0.40, 0.72, 0.72, 0.34);
    put(torso, box(0.24, 0.24, 0.22), M('#6a5230'), -0.30, 0.34, -0.34);
    put(torso, cyl(0.10, 0.10, 0.34, 6), M('#8a6a2a'), 0.30, 0.26, -0.36);
    pc(hips, M('#5a4a34'), 0.30, -0.02, 0.22, 0.24, 0.24, 0.16);   // 侧挂袋（不对称）
    pc(hips, M('#5a4a34'), -0.28, -0.10, 0.24, 0.20, 0.18, 0.14);
  }
  // ---- 回响师：环形共鸣装置 + 音叉 ----
  if (B.resonanceRig) {
    const ring = put(torso, ico(0.42, 0), mAcc, 0, 0.10, -0.36);
    ring.scale.set(1.0, 1.0, 0.18);
    rig.resonanceRing = ring;
    for (const sx of [-1, 1]) {
      put(torso, cyl(0.035, 0.035, 0.66, 4), M('#8ad8ff'), sx * 0.44, 0.34, -0.30);   // 音叉
      pc(torso, acc, sx * 0.44, 0.02, -0.30, 0.07, 0.07, 0.07);
    }
    pc(torso, M('#2a3a44'), 0, -0.34, -0.30, 0.52, 0.16, 0.20);     // 背部空心结构
  }
  // ---- 烬誓者：胸口炉裂纹 + 熔痕 + 部分护甲缺失 ----
  if (B.oathCore) {
    pc(torso, chestArmor, -0.20, 0.10, 0.24, 0.34, 0.42, 0.05);     // 只留一半护甲
    const core = pc(torso, ME('#ff5a10', 2.6), 0.16, 0.06, 0.25, 0.20, 0.20, 0.06);
    rig.oathCore = core;
    put(torso, box(0.05, 0.34, 0.04), ME('#ff7a2e', 1.6), 0.10, -0.10, 0.26, 0, 0, 0.5);   // 裂纹
    pc(torso, M('#3a2a22'), 0.42, 0.24, 0.18, 0.22, 0.20, 0.06);    // 熔痕
  }
  // ---- 铸枪师：枪架 + 工具臂 ----
  if (B.gunsmithRack) {
    pc(torso, M('#3a4048'), 0, 0.30, -0.36, 0.84, 0.12, 0.20);      // 背架横杆
    put(torso, box(0.12, 0.86, 0.12), M('#5a626c'), -0.34, 0.34, -0.36, 0, 0, 0.22);
    put(torso, box(0.12, 0.72, 0.12), M('#5a626c'), 0.34, 0.34, -0.36, 0, 0, -0.22);
    const tool = pc(armL.sh, M('#6a7280'), 0, -0.20, 0.14, 0.16, 0.44, 0.16);   // 左臂工具臂
    pc(armL.sh, acc, 0, -0.40, 0.14, 0.10, 0.10, 0.10);
    rig.toolArm = tool;
  }
  // ---- 远征老兵：旧战斗披风（更宽）+ 勋章 ----
  if (B.veteranMantle) {
    if (cloak) { cloak.scale.set(1.35, 0.92, 1.1); }
    if (cloak2) { cloak2.scale.set(1.3, 1.0, 1.1); }
    for (let i = 0; i < 3; i++) pc(torso, mAcc, -0.14 + i * 0.14, 0.04, 0.25, 0.09, 0.09, 0.04);  // 勋章
    pc(torso, M('#4a4a52'), 0, 0.30, 0, 0.78, 0.14, 0.52);          // 多层护具
    put(torso, cyl(0.08, 0.08, 0.5, 6), M('#6a5230'), 0.40, -0.10, 0.22, 0.4, 0, 0);  // 地图筒
  }
  // ---- 驯炉人：哨器 + 兽具挂环 ----
  if (B.petHarness) {
    put(hips, cyl(0.03, 0.03, 0.5, 6), M('#8a6a2a'), -0.34, 0.10, -0.24, 0, 0, 0.5);  // 兽具挂环
    pc(hips, M('#6a5230'), 0.30, 0.04, -0.22, 0.14, 0.14, 0.12);    // 腰间哨器
    pc(head, acc, 0, 0.16, -0.06, 0.40, 0.06, 0.30);                // 头顶哨具
    pc(torso, M('#4a3a2a'), 0, 0.30, -0.30, 0.34, 0.20, 0.18);      // 小行囊
  }
  // ---- 钟术师：环形法器 + 悬浮钟片 + 袍状下摆 ----
  if (B.arcanistHalo) {
    const halo = put(head, ico(0.40, 0), mAcc, 0, 0.44, -0.04);
    halo.scale.set(1.0, 0.16, 1.0);
    rig.halo = halo;
    for (const sx of [-1, 1]) {
      const shard = put(torso, box(0.14, 0.30, 0.06), ME(c.accent, 1.8), sx * 0.46, 0.20, -0.20);
      shard.rotation.z = sx * 0.3;
    }
    pc(body, mCoatD, 0, 0.34, 0, 0.86, 0.60, 0.56);                 // 袍状下摆
    put(body, box(0.70, 0.9, 0.10), mCoat, 0, 0.28, -0.26, 0.12, 0, 0);
  }
}

// ============================================================
//  通用人形（卫兵 / 盾卫 / 狙击手 / 重甲 / 祭司 等）
// ============================================================
export function buildHumanoid(o = {}) {
  const col = {
    armor: o.armor || '#4f6b7a', armorDark: o.armorDark || '#33454f',
    trim: o.trim || '#c9a227', skin: o.skin || '#8d9aa3',
    visor: o.visor || '#ff5a2a', cloth: o.cloth || '#2a3138',
  };
  const root = new THREE.Group();
  const body = group(root, 0, 0, 0);
  const s = o.scale || 1;
  body.scale.setScalar(s);
  const mA = M(col.armor), mAD = M(col.armorDark), mT = M(col.trim, o.trimEmissive ? col.trim : null, 1.6),
    mS = M(col.skin), mC = M(col.cloth), mV = ME(col.visor, 2.8);

  const hips = group(body, 0, 0.82, 0);
  pc(hips, mAD, 0, 0, 0, 0.68, 0.30, 0.44);
  const torso = group(body, 0, 1.14, 0);
  pc(torso, mA, 0, 0.04, 0, 0.76, 0.60, 0.48);
  pc(torso, mAD, 0, 0.12, 0.24, 0.58, 0.42, 0.06);
  if (o.chestLight) pc(torso, ME(o.chestLight, 2.4), 0, 0.10, 0.28, 0.16, 0.16, 0.04);
  pc(torso, mAD, 0.46, 0.26, 0, 0.30, 0.28, 0.46);
  pc(torso, mAD, -0.46, 0.26, 0, 0.30, 0.28, 0.46);
  pc(torso, mT, 0.20, 0.30, 0.20, 0.10, 0.08, 0.10);
  pc(torso, mT, -0.20, 0.30, 0.20, 0.10, 0.08, 0.10);

  const neck = group(torso, 0, 0.42, 0);
  pc(neck, mS, 0, 0.02, 0, 0.22, 0.12, 0.22);
  const head = group(neck, 0, 0.14, 0);
  if (o.headShape === 'helm') {
    pc(head, mA, 0, 0.02, 0, 0.44, 0.40, 0.42);
    pc(head, mAD, 0, 0.20, 0.02, 0.46, 0.14, 0.44);
    pc(head, mV, 0, -0.02, 0.22, 0.32, 0.09, 0.04, 0.2, 0, 0);
    put(head, cone(0.07, 0.30, 4), mT, 0, 0.34, 0, 0, 0, 0);
    if (o.horns) {
      for (const sg of [-1, 1]) {
        put(head, cone(0.08, 0.42, 4), M('#e8ddc8'), sg * 0.24, 0.26, -0.02, 0.2, 0, sg * 0.9);
      }
    }
  } else if (o.headShape === 'hood') {
    pc(head, mC, 0, 0.06, -0.04, 0.50, 0.42, 0.46);
    put(head, cone(0.30, 0.44, 5), mC, 0, 0.0, -0.26, -1.3, 0, 0);
    pc(head, M('#05060a'), 0, -0.04, 0.20, 0.34, 0.28, 0.06);
    put(head, box(0.09, 0.06, 0.03), mV, -0.09, -0.02, 0.235);
    put(head, box(0.09, 0.06, 0.03), mV, 0.09, -0.02, 0.235);
  } else {
    pc(head, mS, 0, 0, 0.02, 0.42, 0.40, 0.38);
    pc(head, mAD, 0, 0.22, 0, 0.44, 0.12, 0.40);
    pc(head, mV, 0, 0.0, 0.21, 0.34, 0.08, 0.03);
    pc(head, mAD, 0, 0.04, -0.19, 0.34, 0.24, 0.06);
  }

  const mkArm = (side, big) => {
    const sh = group(torso, side * (big ? 0.56 : 0.46), 0.22, 0);
    pc(sh, mA, 0, -0.14, 0, big ? 0.30 : 0.22, 0.36, big ? 0.32 : 0.24);
    // 巨型单位：加宽肩甲 + 肩刺，剪影明显区别于普通兵
    if (o.hulk) {
      pc(sh, mAD, side * 0.05, 0.08, 0, 0.42, 0.34, 0.46);
      put(sh, cone(0.10, 0.34, 4), mT, side * 0.12, 0.30, -0.06, -0.5, 0, side * 0.7);
    }
    const el = group(sh, 0, -0.34, 0);
    pc(el, mAD, 0, -0.16, 0, big ? 0.26 : 0.19, 0.32, big ? 0.28 : 0.21);
    const hand = group(el, 0, -0.33, 0);
    pc(hand, mT, 0, -0.06, 0, big ? 0.24 : 0.19, 0.16, big ? 0.24 : 0.20);
    return { sh, el, hand };
  };
  const armR = mkArm(1, o.bigArms || o.hulk), armL = mkArm(-1, o.bigArms || o.hulk);
  const wm = group(armR.hand, 0.02, -0.10, 0.16);

  // 盔冠（王座禁卫的王冠状盔顶）
  let crest = null;
  if (o.crest) {
    crest = group(head, 0, 0.22, 0);
    pc(crest, mT, 0, 0, 0, 0.34, 0.10, 0.30);
    for (let i = -2; i <= 2; i++) {
      const h = 0.46 - Math.abs(i) * 0.09;
      put(crest, cone(0.05, h, 4), mT, i * 0.075, h * 0.45, 0.0, 0, 0, i * 0.16);
    }
    put(crest, cone(0.07, 0.34, 4), mV, 0, 0.10, 0.16, 0.35, 0, 0);
  }

  // 长戟（左臂持握，形成人形之外的"长杆剪影"）
  let halberd = null;
  if (o.halberd) {
    halberd = group(armL.hand, 0, -0.1, 0);
    pc(halberd, M('#4a3a28'), 0, -0.2, 0, 0.075, 2.30, 0.075);
    const blade = group(halberd, 0, 0.94, 0);
    put(blade, box(0.06, 0.62, 0.30), M(o.bladeColor || '#c8d4dc'), 0, 0, 0.14);
    put(blade, cone(0.10, 0.34, 4), ME(o.bladeGlow || '#ff6a2a', 2.4), 0, 0.44, 0.02, 0, 0, 0);
    put(blade, box(0.05, 0.22, 0.16), M(o.bladeColor || '#c8d4dc'), 0, -0.20, 0.18, 0.6, 0, 0);
    put(halberd, cone(0.07, 0.26, 4), mT, 0, -1.42, 0, Math.PI, 0, 0);
  }

  // 悬浮法印环（学徒）
  let sigil = null;
  if (o.sigil) {
    sigil = group(torso, 0, 0.34, -0.55);
    const ring = new THREE.Mesh(torus(0.42, 0.035, 5, 14), ME(o.sigilColor || '#ffab4a', 2.6));
    sigil.add(ring);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      put(sigil, box(0.05, 0.22, 0.03), ME(o.sigilColor || '#ffab4a', 2.2), Math.cos(a) * 0.42, Math.sin(a) * 0.42, 0, 0, 0, a + Math.PI / 2);
    }
  }

  // 盾牌（左臂）
  let shield = null;
  if (o.shield) {
    shield = group(armL.el, 0, -0.20, 0.22);
    pc(shield, M(o.shieldColor || '#7d8791'), 0, 0, 0, 0.14, 0.95, 0.75);
    pc(shield, mT, 0, 0.24, 0.02, 0.10, 0.20, 0.55);
    pc(shield, mV, 0, 0, 0.40, 0.06, 0.22, 0.14);
  }

  const mkLeg = (side) => {
    const hip = group(hips, side * 0.21, -0.12, 0);
    pc(hip, mAD, 0, -0.20, 0, 0.25, 0.40, 0.27);
    const knee = group(hip, 0, -0.40, 0);
    pc(knee, mA, 0, -0.18, 0, 0.23, 0.36, 0.25);
    const foot = group(knee, 0, -0.38, 0);
    pc(foot, mAD, 0, -0.05, 0.05, 0.26, 0.14, 0.36);
    return { hip, knee, foot };
  };
  const legR = mkLeg(1), legL = mkLeg(-1);

  // 长袍下摆
  let robe = null;
  if (o.robe) {
    robe = group(hips, 0, -0.05, 0);
    pc(robe, mC, 0, -0.42, 0, 0.86, 0.86, 0.72);
    pc(robe, M(o.robeTrim || '#c9882a'), 0, -0.80, 0, 0.90, 0.10, 0.76);
  }
  // 背部装饰（尖刺 / 骨翼 / 排气口）
  let back = null;
  if (o.spines) {
    back = group(torso, 0, 0.30, -0.26);
    for (let i = 0; i < 4; i++) put(back, cone(0.09, 0.46 - i * 0.06, 4), M('#d8cfae'), 0, 0, -i * 0.16, -0.9 + i * 0.12, 0, 0);
  }
  if (o.wings) {
    back = group(torso, 0, 0.30, -0.26);
    for (const sg of [-1, 1]) {
      const w = put(back, box(0.62, 0.75, 0.06), M(o.wingColor || '#2b2233'), sg * 0.42, -0.18, -0.16, 0.25, sg * 0.5, sg * 0.35);
      w.userData.wing = true;
    }
  }
  if (o.tanks) {
    back = group(torso, 0, 0.10, -0.32);
    pc(back, M('#5a6570'), 0.14, 0, 0, 0.22, 0.52, 0.22);
    pc(back, M('#5a6570'), -0.14, 0, 0, 0.22, 0.52, 0.22);
    pc(back, ME(o.tanks, 2.0), 0, 0.28, 0, 0.30, 0.06, 0.20);
  }
  return { group: root, body, hips, torso, neck, head, armR, armL, legR, legL, weaponMount: wm, shield, robe, back, crest, halberd, sigil, height: 1.95 * s };
}

// ============================================================
//  四足兽（冲锋兽 / 猎犬）
// ============================================================
export function buildQuadruped(o = {}) {
  const col = { hide: o.hide || '#8a2436', hideDark: o.hideDark || '#5b1622', horn: o.horn || '#e2d9bd', eye: o.eye || '#ffcf3a', claw: o.claw || '#2b2b2b' };
  const root = new THREE.Group();
  const body = group(root, 0, 0.86, 0);
  const s = o.scale || 1;
  body.scale.setScalar(s);
  const mH = M(col.hide), mHD = M(col.hideDark), mHo = M(col.horn), mC = M(col.claw), mE = ME(col.eye, 3);

  // 躯干（分段，前粗后细）
  pc(body, mH, 0, 0, 0.0, 0.86, 0.78, 1.32);
  pc(body, mHD, 0, -0.14, 0.0, 0.90, 0.40, 1.10);
  for (let i = 0; i < 5; i++) pc(body, mHD, 0, 0.40 - i * 0.02, -0.4 + i * 0.22, 0.30 + (i % 2) * 0.06, 0.22, 0.16);
  // 尾
  const tail = group(body, 0, 0.16, -0.72);
  pc(tail, mHD, 0, 0, -0.22, 0.14, 0.14, 0.48);
  put(tail, cone(0.14, 0.30, 4), mHo, 0, 0, -0.52, -Math.PI / 2, 0, 0);

  // 颈与头
  const neck = group(body, 0, 0.22, 0.66);
  pc(neck, mH, 0, 0.02, 0.18, 0.46, 0.44, 0.50);
  const head = group(neck, 0, 0.04, 0.44);
  pc(head, mH, 0, 0, 0.06, 0.44, 0.40, 0.44);
  pc(head, mHD, 0, -0.10, 0.26, 0.34, 0.24, 0.34);       // 吻部
  pc(head, M('#2a1216'), 0, -0.12, 0.42, 0.26, 0.14, 0.06);
  for (let i = 0; i < 4; i++) pc(head, M('#f4ecd6'), -0.10 + i * 0.07, -0.06, 0.44, 0.035, 0.10, 0.03);
  put(head, box(0.11, 0.07, 0.05), mE, -0.14, 0.08, 0.26);
  put(head, box(0.11, 0.07, 0.05), mE, 0.14, 0.08, 0.26);
  // 犄角
  for (const sg of [-1, 1]) {
    put(head, cone(0.10, 0.52, 4), mHo, sg * 0.20, 0.24, -0.04, -0.35, 0, sg * 0.55);
    put(head, cone(0.06, 0.24, 4), mHo, sg * 0.26, 0.06, 0.14, 0.3, 0, sg * 1.0);
  }
  // 背刺
  for (let i = 0; i < 3; i++) put(body, cone(0.08, 0.34, 4), mHo, 0, 0.52, 0.28 - i * 0.32, -0.3, 0, 0);

  // 鎏金护甲板（第三层猎犬）：让四足兽从"皮毛兽"变成"披甲猎兽"
  let plated = null;
  if (o.plated) {
    const mP = M(o.plateColor || '#d8a83c', o.plateGlow || null, 1.5);
    plated = group(body, 0, 0.30, 0.05);
    pc(plated, mP, 0, 0.16, 0, 0.66, 0.14, 1.02);
    pc(plated, mP, 0, 0.14, 0.52, 0.72, 0.16, 0.30);
    for (const sg of [-1, 1]) {
      pc(plated, mP, sg * 0.34, 0.02, 0, 0.14, 0.42, 0.86);
      put(plated, cone(0.06, 0.30, 4), ME(o.plateGlow || '#ff8a3c', 2.0), sg * 0.34, 0.24, -0.18, -0.4, 0, sg * 0.5);
    }
    pc(plated, mP, 0, 0.16, -0.62, 0.46, 0.14, 0.26);
  }

  // 四肢
  const legs = [];
  for (const [side, zoff] of [[1, 0.42], [-1, 0.42], [1, -0.42], [-1, -0.42]]) {
    const hip = group(body, side * 0.40, -0.28, zoff);
    pc(hip, mHD, 0, -0.16, 0, 0.24, 0.36, 0.26);
    const knee = group(hip, 0, -0.34, 0);
    pc(knee, mH, 0, -0.16, 0, 0.20, 0.34, 0.21);
    const paw = group(knee, 0, -0.34, 0);
    pc(paw, mC, 0, -0.04, 0.04, 0.24, 0.12, 0.30);
    for (let i = 0; i < 3; i++) put(paw, cone(0.035, 0.16, 4), M('#e8e2cc'), -0.07 + i * 0.07, -0.04, 0.20, Math.PI / 2, 0, 0);
    legs.push({ hip, knee, paw });
  }
  return { group: root, body, neck, head, tail, legs, legFL: legs[0], legFR: legs[1], legBL: legs[2], legBR: legs[3], plated, weaponMount: group(head, 0, 0, 0.4), height: 1.5 * s };
}

// ============================================================
//  浮空囊体（喷吐者 / 织咒者）
// ============================================================
export function buildFloater(o = {}) {
  const col = { sac: o.sac || '#7a3fa8', sacDark: o.sacDark || '#4a2468', eye: o.eye || '#ffe23d', core: o.core || '#c07af0' };
  const root = new THREE.Group();
  const body = group(root, 0, o.hover ?? 1.55, 0);
  body.scale.setScalar(o.scale || 1);
  const mS = M(col.sac), mSD = M(col.sacDark), mE = ME(col.eye, 3);
  const coreMat = ME(col.core, 2.6);

  pc(body, mS, 0, 0.06, 0, 0.96, 0.94, 0.96);
  pc(body, mSD, 0, 0.34, 0, 0.72, 0.40, 0.72);
  pc(body, mSD, 0, -0.34, 0, 0.72, 0.34, 0.72);
  const core = pc(body, coreMat, 0, 0.02, 0.44, 0.30, 0.30, 0.12);
  // 触须
  const tent = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const seg = group(body, Math.cos(a) * 0.34, -0.40, Math.sin(a) * 0.34);
    pc(seg, mSD, 0, -0.16, 0, 0.12, 0.34, 0.12);
    const s2 = group(seg, 0, -0.32, 0);
    pc(s2, mSD, 0, -0.14, 0, 0.10, 0.30, 0.10);
    put(s2, cone(0.07, 0.24, 4), mE, 0, -0.32, 0, Math.PI, 0, 0);
    tent.push({ seg, s2, a });
  }
  // 眼
  const eyes = [];
  for (const [x, y, z] of [[-0.24, 0.10, 0.42], [0.24, 0.10, 0.42], [0, -0.16, 0.46], [0, 0.28, 0.40]]) {
    eyes.push(put(body, box(0.13, 0.13, 0.06), mE, x, y, z));
  }
  // 余烬环星变体：两条交叉光环 + 环绕的余烬卫星
  let rings = null, orbs = null;
  if (o.orbiters) {
    rings = [];
    for (const tilt of [0.0, Math.PI / 2.4]) {
      const r = new THREE.Mesh(torus(0.72, 0.028, 5, 18), ME(o.ringColor || '#ff8a3c', 2.6));
      r.rotation.set(tilt, 0, tilt * 0.5);
      r.position.y = 0.06;
      body.add(r);
      rings.push(r);
    }
    orbs = [];
    for (let i = 0; i < 4; i++) {
      const o2 = new THREE.Mesh(ico(0.10, 0), ME(o.orbColor || '#ffd06a', 3.0));
      body.add(o2);
      orbs.push({ mesh: o2, a: (i / 4) * Math.PI * 2, r: 0.86, y: (i % 2 ? 0.3 : -0.22) });
    }
  }
  return { group: root, body, tentacles: tent, eyes, core, rings, orbs, weaponMount: group(body, 0, -0.2, 0.6), height: 2.0 };
}

// ============================================================
//  虫型（自爆虫 / 火蜂）
// ============================================================
export function buildBug(o = {}) {
  const col = { shell: o.shell || '#c85a1e', shellDark: o.shellDark || '#7a3410', leg: o.leg || '#2b1c12', eye: o.eye || '#ffe14d' };
  const root = new THREE.Group();
  const body = group(root, 0, o.fly ? 1.15 : 0.62, 0);
  body.scale.setScalar(o.scale || 1);
  const mS = M(col.shell), mSD = M(col.shellDark), mL = M(col.leg), mE = ME(col.eye, 3);
  const coreMat = ME(o.core || '#ff8a2a', 3.0);

  pc(body, mS, 0, 0.04, 0, 0.72, 0.62, 0.86);
  pc(body, mSD, 0, -0.22, 0, 0.78, 0.24, 0.80);
  const core = pc(body, coreMat, 0, 0.22, 0.10, 0.50, 0.28, 0.60);
  // 甲片
  for (let i = 0; i < 3; i++) pc(body, mSD, 0, 0.34 - i * 0.03, -0.24 + i * 0.26, 0.60 - i * 0.08, 0.12, 0.20);
  // 头
  const head = group(body, 0, -0.02, 0.48);
  pc(head, mSD, 0, 0, 0, 0.44, 0.36, 0.30);
  put(head, cone(0.06, 0.30, 4), mL, -0.14, -0.06, 0.16, Math.PI / 2, 0, 0.3);
  put(head, cone(0.06, 0.30, 4), mL, 0.14, -0.06, 0.16, Math.PI / 2, 0, -0.3);
  put(head, box(0.12, 0.09, 0.05), mE, -0.13, 0.08, 0.16);
  put(head, box(0.12, 0.09, 0.05), mE, 0.13, 0.08, 0.16);

  const legs = [];
  for (const sg of [-1, 1]) for (let i = 0; i < 3; i++) {
    const hip = group(body, sg * 0.34, -0.20, 0.24 - i * 0.26);
    pc(hip, mL, 0, -0.16, 0, 0.10, 0.32, 0.10, 0, 0, sg * -0.4);
    const knee = group(hip, sg * 0.14, -0.30, 0);
    pc(knee, mL, 0, -0.14, 0, 0.09, 0.30, 0.09);
    legs.push({ hip, knee, sg });
  }
  // 翅
  let wings = null;
  if (o.fly) {
    wings = [];
    for (const sg of [-1, 1]) {
      const w = put(body, box(0.62, 0.5, 0.03), getMaterial(col.shell, { transparent: true, opacity: 0.5, emissive: col.eye, emissiveIntensity: 0.4 }),
        sg * 0.42, 0.30, -0.1, 0.1, 0, sg * 0.5);
      wings.push(w);
    }
  }
  return { group: root, body, head, legs, wings, core, weaponMount: group(head, 0, 0, 0.3), height: 1.0 };
}

// ============================================================
//  哨戒炮塔
// ============================================================
export function buildTurret(o = {}) {
  const col = { base: o.base || '#48545c', metal: o.metal || '#6d7880', lens: o.lens || '#ff3a2a' };
  const root = new THREE.Group();
  const body = group(root, 0, 0, 0);
  body.scale.setScalar(o.scale || 1);
  const mB = M(col.base), mM = MG(col.metal), mL = ME(col.lens, 3.2);

  pc(body, mB, 0, 0.09, 0, 1.10, 0.18, 1.10);
  pc(body, MG('#3a444b'), 0, 0.24, 0, 0.82, 0.16, 0.82);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    pc(body, mB, Math.cos(a) * 0.34, 0.46, Math.sin(a) * 0.34, 0.14, 0.46, 0.14, 0.18 * Math.sin(a), 0, -0.18 * Math.cos(a));
  }
  const turret = group(body, 0, 0.86, 0);   // 可旋转
  pc(turret, mM, 0, 0, 0, 0.66, 0.56, 0.66);
  pc(turret, mB, 0, 0.32, 0, 0.52, 0.14, 0.52);
  const barrel = group(turret, 0, 0.02, 0.30);
  pc(barrel, MG('#4a555d'), 0, 0, 0.34, 0.20, 0.20, 0.72);
  pc(barrel, MG('#313a40'), 0, 0, 0.74, 0.26, 0.26, 0.16);
  const lens = put(turret, box(0.24, 0.16, 0.05), mL, 0, 0.06, 0.34);
  for (const sg of [-1, 1]) pc(turret, mB, sg * 0.36, -0.14, 0, 0.14, 0.30, 0.30);

  // 焚焰炮塔变体：上下双联炮管 + 熔炉储罐 + 更复杂的顶部结构
  let pyre = null;
  if (o.twin) {
    pc(turret, mB, 0, 0.14, -0.40, 0.34, 0.36, 0.34);
    put(turret, cyl(0.16, 0.16, 0.30, 8), ME(o.core || '#ff7a2a', 2.6), 0, 0.30, -0.40, Math.PI / 2, 0, 0);
    pyre = group(turret, 0, 0.02, 0.30);
    for (const y of [0.18, -0.14]) {
      pc(pyre, MG('#4a555d'), 0, y, 0.34, 0.15, 0.15, 0.74);
      pc(pyre, MG('#313a40'), 0, y, 0.74, 0.19, 0.19, 0.14);
      put(pyre, cyl(0.085, 0.085, 0.05, 8), ME(o.lens || '#ff5a10', 3.0), 0, y, 0.82, Math.PI / 2, 0, 0);
    }
    for (let i = 0; i < 3; i++) {
      put(turret, box(0.10, 0.22, 0.10), mM, -0.30 + i * 0.30, 0.42, -0.14);
    }
  }
  return { group: root, body, turret, barrel, lens, pyre, weaponMount: group(pyre || barrel, 0, 0, 0.8), head: turret, height: 1.4 };
}

// ============================================================
//  浮游机（无人机）
// ============================================================
export function buildDrone(o = {}) {
  const col = { hull: o.hull || '#c8d2da', dark: o.dark || '#3c464e', glow: o.glow || '#3ad2ff' };
  const root = new THREE.Group();
  const body = group(root, 0, o.hover ?? 1.5, 0);
  body.scale.setScalar(o.scale || 1);
  const mH = MG(col.hull), mD = MG(col.dark), mG = ME(col.glow, 3);

  pc(body, mH, 0, 0, 0, 0.70, 0.42, 0.86);
  pc(body, mD, 0, -0.20, 0, 0.56, 0.20, 0.70);
  pc(body, mG, 0, 0.02, 0.45, 0.34, 0.20, 0.06);
  const rotors = [];
  for (const sg of [-1, 1]) {
    pc(body, mD, sg * 0.44, 0.06, 0, 0.30, 0.10, 0.14);
    const r = group(body, sg * 0.62, 0.16, 0);
    pc(r, mD, 0, 0, 0, 0.14, 0.12, 0.14);
    const blades = group(r, 0, 0.10, 0);
    for (let i = 0; i < 3; i++) {
      const b = put(blades, box(0.62, 0.02, 0.08), MG('#9aa6ad'), 0, 0, 0, 0, (i / 3) * Math.PI * 2, 0);
      b.userData.spin = true;
    }
    put(r, box(0.34, 0.03, 0.34), ME(col.glow, 1.6), 0, 0.08, 0);
    rotors.push({ r, blades });
  }
  const gun = group(body, 0, -0.22, 0.36);
  pc(gun, mD, 0, 0, 0.14, 0.16, 0.16, 0.44);
  pc(gun, mG, 0, 0, 0.34, 0.13, 0.13, 0.06);
  return { group: root, body, rotors, gun, head: body, weaponMount: group(gun, 0, 0, 0.4), height: 1.0 };
}

// ============================================================
//  裂变软体（史莱姆）
// ============================================================
export function buildBlob(o = {}) {
  const col = { gel: o.gel || '#4fbf5a', gelDark: o.gelDark || '#2d7a37', eye: o.eye || '#ffe23d' };
  const root = new THREE.Group();
  const body = group(root, 0, 0.5, 0);
  body.scale.setScalar(o.scale || 1);
  const mG = getMaterial(col.gel, { emissive: col.gelDark, emissiveIntensity: 0.5, flat: true, transparent: true, opacity: 0.92, roughness: 0.25 });
  const mGD = M(col.gelDark), mE = ME(col.eye, 3);
  const blobs = [];
  pc(body, mG, 0, 0, 0, 1.06, 0.86, 1.06);
  pc(body, mGD, 0, 0.20, 0, 0.62, 0.30, 0.62);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    const b = group(body, Math.cos(a) * 0.42, -0.28, Math.sin(a) * 0.42);
    pc(b, mG, 0, -0.14, 0, 0.46, 0.46, 0.46);
    blobs.push(b);
  }
  const eyes = [
    put(body, box(0.14, 0.16, 0.06), mE, -0.18, 0.14, 0.42),
    put(body, box(0.14, 0.16, 0.06), mE, 0.18, 0.14, 0.42),
  ];
  return { group: root, body, blobs, eyes, head: body, weaponMount: group(body, 0, 0.1, 0.5), height: 1.0 };
}

// ============================================================
//  熔核总督 BOSS —— 多阶段巨械化祭司
// ============================================================
export function buildBoss() {
  const root = new THREE.Group();
  const body = group(root, 0, 0, 0);
  const mIron = M('#77656f'), mIronD = M('#4c3d47'), mBrass = MG('#cf9a44'), mTrim = M('#e8c34a'),
    mRobe = M('#8f2136'), mGlow = ME('#ff7a20', 3.2), mGlowCore = ME('#ffd06a', 3.6), mVoid = ME('#8a3cff', 2.4);

  // 悬浮下半身（长袍）
  const lower = group(body, 0, 0, 0);
  pc(lower, mRobe, 0, 1.05, 0, 1.9, 1.3, 1.5);
  pc(lower, M('#a82a48'), 0, 0.55, 0, 2.1, 0.6, 1.7);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    pc(lower, mRobe, Math.cos(a) * 0.8, 0.55, Math.sin(a) * 0.8, 0.34, 1.4, 0.34, Math.cos(a) * 0.25, 0, Math.sin(a) * -0.25);
  }
  pc(lower, mIronD, 0, 0.28, 0, 1.2, 0.5, 1.1);
  const core = put(lower, ico(0.46, 1), mGlowCore, 0, 0.95, 0.75);
  const coreRing = put(lower, torus(0.58, 0.07, 6, 10), mIron, 0, 0.95, 0.72, 0, 0, 0);

  // 躯干
  const torso = group(body, 0, 1.95, 0);
  pc(torso, mIron, 0, 0.30, 0, 1.75, 1.35, 1.25);
  pc(torso, mIronD, 0, 0.75, 0, 1.95, 0.42, 1.40);
  // 熔炉胸口
  pc(torso, mIronD, 0, 0.32, 0.62, 1.05, 0.95, 0.16);
  const furnace = put(torso, box(0.7, 0.62, 0.10), mGlow, 0, 0.32, 0.70);
  for (let i = 0; i < 4; i++) pc(torso, mBrass, 0, -0.42 + i * 0.30, 0.68, 0.96, 0.10, 0.14);
  // 肩甲
  for (const sg of [-1, 1]) {
    const sh = group(torso, sg * 1.12, 0.78, 0);
    pc(sh, mIronD, 0, 0.05, 0, 0.86, 0.62, 1.05);
    pc(sh, mBrass, sg * 0.32, 0.24, 0, 0.40, 0.38, 0.86);
    for (let i = 0; i < 3; i++) put(sh, cone(0.12, 0.5, 4), mIron, sg * 0.36, 0.5, -0.28 + i * 0.28, -0.2, 0, sg * 0.5);
    pc(sh, mGlow, sg * 0.42, 0.06, 0.42, 0.14, 0.14, 0.06);
  }
  // 背部熔炉烟囱
  const chim = group(torso, 0, 0.9, -0.6);
  for (const x of [-0.4, 0.4]) {
    pc(chim, mIronD, x, 0.30, 0, 0.30, 1.0, 0.30);
    pc(chim, mBrass, x, 0.82, 0, 0.38, 0.14, 0.38);
    put(chim, box(0.24, 0.06, 0.24), mGlow, x, 0.90, 0);
  }
  // 头
  const neck = group(torso, 0, 1.05, 0.05);
  pc(neck, mIronD, 0, 0.06, 0, 0.44, 0.22, 0.44);
  const head = group(neck, 0, 0.34, 0);
  pc(head, mIron, 0, 0.06, 0, 0.85, 0.72, 0.80);
  pc(head, mIronD, 0, 0.44, 0, 0.92, 0.24, 0.86);
  // 面甲 + 三眼
  pc(head, mIronD, 0, 0.0, 0.42, 0.66, 0.52, 0.10);
  const eyeC = put(head, box(0.18, 0.14, 0.06), mGlowCore, 0, 0.10, 0.48);
  const eyeL = put(head, box(0.13, 0.09, 0.05), mGlow, -0.24, 0.06, 0.47);
  const eyeR = put(head, box(0.13, 0.09, 0.05), mGlow, 0.24, 0.06, 0.47);
  for (let i = 0; i < 5; i++) pc(head, mBrass, -0.28 + i * 0.14, -0.28, 0.44, 0.09, 0.16, 0.08);
  // 巨角
  for (const sg of [-1, 1]) {
    put(head, cone(0.16, 1.15, 5), mBrass, sg * 0.52, 0.52, -0.05, -0.28, 0, sg * 0.72);
    put(head, cone(0.09, 0.52, 5), mIron, sg * 0.66, 0.24, 0.12, 0.25, 0, sg * 1.15);
  }
  // 头顶悬浮冠冕
  const crown = group(head, 0, 0.75, 0);
  put(crown, torus(0.42, 0.05, 5, 8), mBrass, 0, 0, 0, Math.PI / 2, 0, 0);
  const crownGem = put(crown, ico(0.16, 0), mVoid, 0, 0.06, 0);

  // 右臂：巨炮
  const armR = group(torso, 1.28, 0.55, 0);
  pc(armR, mIronD, 0, -0.30, 0, 0.55, 0.70, 0.55);
  const armREl = group(armR, 0, -0.62, 0);
  pc(armREl, mIron, 0, -0.34, 0, 0.50, 0.72, 0.50);
  const cannon = group(armREl, 0, -0.78, 0.10);
  pc(cannon, mIronD, 0, 0, 0.28, 0.70, 0.78, 1.05);
  pc(cannon, mBrass, 0, 0, 0.90, 0.52, 0.56, 0.42);
  pc(cannon, mIronD, 0, 0, 1.20, 0.42, 0.44, 0.34);
  const muzzle = put(cannon, ico(0.26, 0), mGlow, 0, 0, 1.40);
  for (let i = 0; i < 4; i++) pc(cannon, mBrass, 0, 0, 0.5 + i * 0.18, 0.82, 0.10, 0.10);

  // 左臂：裂地爪
  const armL = group(torso, -1.28, 0.55, 0);
  pc(armL, mIronD, 0, -0.30, 0, 0.55, 0.70, 0.55);
  const armLEl = group(armL, 0, -0.62, 0);
  pc(armLEl, mIron, 0, -0.34, 0, 0.50, 0.72, 0.50);
  const claw = group(armLEl, 0, -0.78, 0);
  pc(claw, mBrass, 0, 0, 0, 0.46, 0.46, 0.46);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    put(claw, cone(0.10, 0.70, 4), mIron, Math.cos(a) * 0.24, -0.36, Math.sin(a) * 0.24, 0.5 * Math.sin(a), 0, -0.5 * Math.cos(a));
  }

  // 环绕的余烬球
  const orbs = [];
  for (let i = 0; i < 3; i++) {
    const o = group(body, 0, 2.4, 0);
    const s = put(o, ico(0.22, 0), mGlow, 0, 0, 0);
    put(o, torus(0.30, 0.04, 4, 8), mBrass, 0, 0, 0, 0, 0, 0);
    orbs.push({ g: o, mesh: s, phase: (i / 3) * Math.PI * 2 });
  }

  return {
    group: root, body, lower, torso, head, neck, armR, armREl, armL, armLEl, cannon, muzzle,
    claw, core, coreRing, furnace, crown, crownGem, orbs, eyes: [eyeC, eyeL, eyeR],
    weaponMount: group(cannon, 0, 0, 1.5), height: 6.5,
  };
}

// ============================================================
//  NPC：商店主 / 神秘祭坛守护者 / 老铁匠
// ============================================================
export function buildNPC(kind) {
  if (kind === 'shop') {
    const rig = buildHumanoid({ armor: '#6b4a9c', armorDark: '#3d2a5e', trim: '#e8c84a', skin: '#c98f5a', visor: '#ffe23d', headShape: 'plain', robe: true, robeTrim: '#e8c84a', chestLight: '#ffd24a' });
    // 商人：大帽子 + 面具 + 挎包
    const hat = group(rig.head, 0, 0.24, 0);
    pc(hat, M('#4a3470'), 0, 0, 0, 0.72, 0.30, 0.72);
    pc(hat, M('#3a2758'), 0, 0.10, 0, 0.40, 0.28, 0.40);
    put(hat, cone(0.52, 0.5, 6), M('#4a3470'), 0, 0.34, 0);
    put(hat, box(0.10, 0.06, 0.06), ME('#e8c84a', 2.2), 0, 0.16, 0.38);
    const bag = group(rig.torso, 0.44, -0.20, -0.28);
    pc(bag, M('#6b4a2e'), 0, 0, 0, 0.44, 0.42, 0.30);
    pc(bag, M('#e8c84a'), 0, 0.16, 0, 0.44, 0.06, 0.30);
    return rig;
  }
  if (kind === 'forge') {
    const rig = buildHumanoid({ armor: '#7a4a2a', armorDark: '#4a2a16', trim: '#d8b45a', skin: '#d8a06a', visor: '#ffb347', headShape: 'plain', bigArms: true });
    pc(rig.head, M('#2b2b2b'), 0, 0.26, 0.02, 0.56, 0.30, 0.58);   // 护目镜
    put(rig.head, box(0.16, 0.10, 0.05), ME('#ffb347', 2.4), 0, 0.26, 0.30);
    return rig;
  }
  // 祭坛守护者
  const rig = buildHumanoid({ armor: '#2e4a54', armorDark: '#1a2c33', trim: '#67e8ff', skin: '#7d97a3', visor: '#67e8ff', headShape: 'hood', robe: true, robeTrim: '#67e8ff' });
  const halo = group(rig.head, 0, 0.42, -0.1);
  put(halo, torus(0.34, 0.035, 5, 10), ME('#67e8ff', 2.6), 0, 0, 0, Math.PI / 2, 0, 0);
  return rig;
}

// ============================================================
//  动画工具
// ============================================================
export function walkHumanoid(rig, phase, amp = 1, speed = 1) {
  const s = Math.sin(phase), c = Math.cos(phase);
  if (rig.legR) { rig.legR.hip.rotation.x = s * 0.62 * amp; rig.legR.knee.rotation.x = Math.max(0, -s) * 0.75 * amp; }
  if (rig.legL) { rig.legL.hip.rotation.x = -s * 0.62 * amp; rig.legL.knee.rotation.x = Math.max(0, s) * 0.75 * amp; }
  if (rig.legs) {
    rig.legs.forEach((l, i) => { l.hip.rotation.x = Math.sin(phase * 1.0 + i * 1.7) * 0.55 * amp; });
  }
  if (rig.armL && !rig.armL.aiming) rig.armL.sh.rotation.x = -s * 0.38 * amp;
  if (rig.torso) rig.torso.rotation.z = s * 0.035 * amp;
  if (rig.body) rig.body.position.y = Math.abs(Math.sin(phase)) * 0.075 * amp * speed;
}

export function aimArm(rig, pitch) {
  if (!rig.armR) return;
  rig.armR.sh.rotation.x = -Math.PI / 2 + pitch;
  rig.armR.el.rotation.x = 0.12;
}

export function disposeTree(obj) {
  obj.traverse((o) => {
    if (o.isMesh && o.geometry && o.geometry.userData && o.geometry.userData.shared) return;
  });
}

// ============================================================
//  缚钟兽 · THE BELL BEAST（PASS2 §22 / §18）
//
//  形状语言刻意与熔核总督相反：
//   总督 = 垂直 / 对称 / 长比例 / 权力感（王庭）
//   缚钟兽 = 低重心 / 不对称 / 骨角 / 肉体 + 人工束具（异兽）
//  负重是它的身份：脊背驮着巨钟，四肢拖着粗链 —— 一阶段这些链子把它拴住，
//  二阶段链断之后 silhouette 必须真的变化（链具消失 / 巨钟前移）。
// ============================================================
export function buildBellBeast() {
  const root = new THREE.Group();
  const body = group(root, 0, 0, 0);
  const mFlesh = M('#4a2f2a', null, 1.0, { rough: 0.95 });
  const mFleshD = M('#2c1b19', null, 1.0, { rough: 0.98 });
  const mBone = M('#cbb08a', null, 1.0, { rough: 0.7, metal: 0.05 });
  const mIron = MG('#3a3a42');
  const mChain = MG('#6a6a74');
  const mBronze = MG('#9a7434');
  const mGlow = ME('#8ad8ff', 2.6);      // 钟炉的冷光（与总督的炉火形成对照）
  const mEye = ME('#c8f0ff', 3.0);

  // 低重心躯干：横向长、纵向扁
  const torso = group(body, 0, 1.05, 0);
  pc(torso, mFlesh, 0, 0, 0, 2.5, 1.15, 3.3);
  pc(torso, mFleshD, 0, 0.42, -0.25, 2.1, 0.55, 2.6);
  // 脊背骨刺
  const spine = [];
  for (let i = 0; i < 5; i++) {
    const z = -1.25 + i * 0.62;
    const sp = put(torso, cone(0.17 - i * 0.012, 0.72 - i * 0.05, 4), mBone, 0, 0.72, z, -0.22, 0, 0);
    spine.push(sp);
  }
  // 背上的巨钟（它的"负担"）
  const bellMount = group(torso, 0, 0.95, -0.1);
  const bell = put(bellMount, cyl(0.42, 1.05, 1.15, 8, true), mBronze, 0, 0.5, 0);
  const bellLip = put(bellMount, torus(1.02, 0.10, 6, 12), mBronze, 0, -0.05, 0, Math.PI / 2, 0, 0);
  const bellCore = put(bellMount, ico(0.3, 0), mGlow, 0, 0.55, 0);
  const bellYoke = group(torso, 0, 1.2, -0.1);
  put(bellYoke, box(2.0, 0.16, 0.3), mIron, 0, 0, 0);
  put(bellYoke, box(0.28, 0.7, 0.28), mIron, -0.9, -0.32, 0);
  put(bellYoke, box(0.28, 0.7, 0.28), mIron, 0.9, -0.32, 0);

  // 四项束具 + 拖地锁链（一阶段的"被束缚"读法）
  const chains = [];
  for (let i = 0; i < 4; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const front = i < 2 ? 1 : -1;
    const anchor = group(torso, side * 1.15, 0.15, front * 1.1);
    pc(anchor, mIron, 0, 0, 0, 0.42, 0.42, 0.42);
    const ch = group(anchor, side * 0.35, -0.1, 0);
    for (let k = 0; k < 5; k++) put(ch, torus(0.17, 0.055, 4, 6), mChain, 0, -0.22 - k * 0.30, 0, Math.PI / 2, 0, 0);
    chains.push(ch);
  }

  // 四足：前后腿结构不同（前腿粗、后腿长，形成不对称重心）
  const legs = [];
  for (let i = 0; i < 4; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const front = i < 2;
    const leg = group(torso, side * 1.0, -0.4, front ? 1.15 : -1.05);
    const upper = put(leg, cyl(0.26, 0.20, front ? 0.95 : 1.15, 5), mFlesh, 0, -(front ? 0.48 : 0.58), 0, front ? 0.28 : -0.24, 0, side * 0.10);
    const knee = put(leg, ico(0.24, 0), mFleshD, 0, -(front ? 1.0 : 1.2), front ? 0.14 : -0.12);
    const claw = put(leg, cone(0.22, 0.5, 5), mBone, 0, -(front ? 1.28 : 1.48), front ? 0.28 : -0.24, Math.PI, 0, 0);
    legs.push({ leg, upper, knee, claw, front, side });
  }

  // 头：低垂、加长的下颚 + 骨角（不对称 —— 左角断了一半）
  const neck = group(torso, 0, 0.15, 1.7);
  pc(neck, mFlesh, 0, 0.05, 0.5, 1.05, 0.9, 1.4, -0.14, 0, 0);
  const head = group(neck, 0, 0.05, 1.25);
  pc(head, mFlesh, 0, 0.08, 0.1, 1.0, 0.82, 1.15);
  const jaw = group(head, 0, -0.32, 0.35);
  pc(jaw, mFleshD, 0, 0, 0.15, 0.86, 0.34, 1.0);
  for (let i = 0; i < 5; i++) put(jaw, cone(0.07, 0.3, 4), mBone, -0.3 + i * 0.15, 0.2, 0.42, 0, 0, 0);
  const eyeL = put(head, box(0.17, 0.12, 0.06), mEye, -0.26, 0.18, 0.66);
  const eyeR = put(head, box(0.17, 0.12, 0.06), mEye, 0.26, 0.18, 0.66);
  put(head, cone(0.16, 1.35, 5), mBone, -0.46, 0.5, -0.1, -0.35, 0, -0.55);   // 完整左角
  put(head, cone(0.14, 0.55, 5), mBone, 0.48, 0.42, -0.05, -0.25, 0, 0.5);    // 断掉的右角

  // 尾：粗、拖地、末端带链锤
  const tailRoot = group(torso, 0, 0.1, -1.6);
  const tail = group(tailRoot, 0, 0, 0);
  for (let i = 0; i < 4; i++) pc(tail, mFlesh, 0, -0.06 * i, -0.35 - i * 0.42, 0.62 - i * 0.09, 0.52 - i * 0.07, 0.5);
  const tailFlail = put(tail, ico(0.32, 0), mIron, 0, -0.2, -1.95);
  const flailSpike = put(tail, cone(0.14, 0.5, 4), mBone, 0, -0.2, -2.3, Math.PI / 2, 0, 0);

  return {
    group: root, body, torso, neck, head, jaw, legs, tail, tailFlail, flailSpike,
    bellMount, bell, bellCore, bellLip, bellYoke, chains, spine,
    core: bellCore, eyes: [eyeL, eyeR],
    weaponMount: group(head, 0, 0, 1.6), height: 3.4,
  };
}

// ============================================================
//  哑钟主祭 · THE SILENT HIEROPHANT（PASS2 §23 / §19）
//
//  形状语言 = 王庭的"垂直 / 对称 / 长比例"推到极端：
//  高瘦身形 + 倒扣钟面兜帽 + 悬在身前的钟 + 仪式法器。
//  与所有枪手形成明显断层（没有手臂持枪、整体更窄更高）。
//  二阶段"静默"要靠形体读出来：悬钟上浮前移、钟面翻转、光晕收紧。
// ============================================================
export function buildSilentHierophant() {
  const root = new THREE.Group();
  const body = group(root, 0, 0, 0);
  const mRobe = M('#20242e', null, 1.0, { rough: 0.92 });
  const mRobeD = M('#141821', null, 1.0, { rough: 0.95 });
  const mTrim = MG('#8f7a3a');
  const mBronze = MG('#a8863c');
  const mVoid = ME('#7a5aff', 2.4);
  const mSilent = ME('#dff0ff', 2.2);
  const eye = ME('#e8f4ff', 2.6);

  // 长袍：极窄极高，下摆展开成钟形
  const lower = group(body, 0, 0, 0);
  pc(lower, mRobeD, 0, 1.2, 0, 1.55, 2.4, 1.55);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    pc(lower, mRobe, Math.cos(a) * 0.72, 0.5, Math.sin(a) * 0.72, 0.34, 1.2, 0.34);
  }
  const hem = put(lower, torus(1.05, 0.09, 6, 14), mTrim, 0, 0.08, 0, Math.PI / 2, 0, 0);

  const torso = group(body, 0, 2.45, 0);
  pc(torso, mRobe, 0, 0.3, 0, 1.15, 1.5, 0.92);
  pc(torso, mTrim, 0, 0.42, 0.48, 0.9, 0.14, 0.10);
  // 肩：窄而尖（王庭肩线）
  for (const sg of [-1, 1]) {
    const sh = group(torso, sg * 0.66, 0.72, 0);
    pc(sh, mRobeD, sg * 0.1, 0.1, 0, 0.5, 0.34, 0.7);
    put(sh, cone(0.13, 0.62, 4), mBronze, sg * 0.26, 0.38, 0, 0, 0, sg * 0.5);
  }

  // 头 + 倒扣钟面兜帽（核心轮廓记忆点）
  const neck = group(torso, 0, 0.95, 0);
  const head = group(neck, 0, 0.3, 0);
  const hood = put(head, cyl(1.15, 0.42, 0.95, 8, true), mRobeD, 0, 0.18, 0);
  const hoodRim = put(head, torus(1.12, 0.07, 6, 14), mBronze, 0, -0.28, 0, Math.PI / 2, 0, 0);
  const bellFace = put(head, cyl(0.62, 0.62, 0.12, 10), mTrim, 0, -0.2, 0);
  const face = put(head, ico(0.40, 0), mVoid, 0, -0.18, 0.06);
  const eyeL = put(head, box(0.1, 0.2, 0.05), eye, -0.16, -0.1, 0.4);
  const eyeR = put(head, box(0.1, 0.2, 0.05), eye, 0.16, -0.1, 0.4);
  const veil = group(head, 0, -0.3, -0.5);
  for (let i = 0; i < 5; i++) pc(veil, mRobe, -0.4 + i * 0.2, -0.5, 0, 0.16, 1.3, 0.06);

  // 悬在身前的钟：二阶段会浮起并翻转
  const bellPivot = group(torso, 0, 1.15, 0.95);
  const bell = put(bellPivot, cyl(0.52, 0.78, 0.72, 8, true), mBronze, 0, 0, 0);
  const bellRing = put(bellPivot, torus(0.76, 0.06, 5, 12), mTrim, 0, -0.34, 0, Math.PI / 2, 0, 0);
  const bellInner = put(bellPivot, ico(0.20, 0), mSilent, 0, 0.02, 0);
  const clapper = put(bellPivot, cyl(0.06, 0.10, 0.44, 5), mBronze, 0, -0.42, 0);

  // 法器：一根竖杖（不持枪）
  const staff = group(torso, 0.55, 0.1, 0.2);
  put(staff, cyl(0.06, 0.06, 2.6, 5), mBronze, 0, 0.4, 0);
  const staffHead = put(staff, torus(0.24, 0.05, 5, 10), mSilent, 0, 1.75, 0, 0, 0, 0);
  const staffGem = put(staff, ico(0.14, 0), mVoid, 0, 1.75, 0);

  // 悬浮钟片环（王庭几何感；二阶段收紧并变暗）
  const orbs = [];
  for (let i = 0; i < 6; i++) {
    const g = group(torso, 0, 0.9, 0);
    const m = put(g, box(0.34, 0.05, 0.22), mSilent, 0, 0, 0.95);
    orbs.push({ g, mesh: m, phase: (i / 6) * Math.PI * 2 });
  }

  return {
    group: root, body, lower, torso, neck, head, hood, hoodRim, bellFace, veil,
    bellPivot, bell, bellRing, bellInner, clapper, staff, staffHead, staffGem, orbs,
    core: bellInner, eyes: [eyeL, eyeR], gem: face, hem,
    weaponMount: group(bellPivot, 0, 0, 0.9), height: 4.6,
  };
}
