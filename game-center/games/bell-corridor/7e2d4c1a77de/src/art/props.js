import { chestRules, chestFields } from '../game/chest_rules.js';
import { makePilotChestVisual } from './chest_asset.js';
import { applyPropAsset, makePropVisual } from './prop_assets.js';
// ============================================================
//  场景道具 / 装饰 / 机关 —— 低多边形手工建模
//  每个工厂返回 { object, collider, ... , update }
// ============================================================
import * as THREE from '../../vendor/three.module.js';
import {
  PAL,
  getMaterial, getTexture,
  boxGeo, cylGeo, coneGeo, icoGeo, sphereGeo, torusGeo, ringGeo,
} from './materials.js';

function M(color, emissive, ei = 1.4, opts = {}) {
  return getMaterial(color, { emissive, emissiveIntensity: ei, flat: true, roughness: opts.rough ?? 0.86, metalness: opts.metal ?? 0.06, ...opts });
}
function MG(color, opts = {}) {
  return getMaterial(color, { flat: true, roughness: opts.rough ?? 0.45, metalness: opts.metal ?? 0.8, ...opts });
}
function GL(color, i = 2.6) { return getMaterial('#0c0c0c', { emissive: color, emissiveIntensity: i, flat: true }); }

function put(p, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z); m.rotation.set(rx, ry, rz);
  m.castShadow = true; m.receiveShadow = true;
  p.add(m);
  return m;
}
// 几何体全部走共享缓存 —— 换房时不再重复分配 / 释放
const B = boxGeo;
const C = cylGeo;
const CO = coneGeo;
const I = icoGeo;
const S = sphereGeo;
const T = torusGeo;
const RING = ringGeo;

// ============================================================
//  基础道具
// ============================================================
// ------------------------------------------------------------
//  道具配色按层（PASS3 §4）
//
//  旧实现里大量道具用 `theme >= 2 ? 暖色 : 冷色` 一刀切，于是**第三层沿用第二层的
//  暖棕与炉火橙**。结果是：即使地板/墙体/环境光都改成冷石+青铜，
//  整帧画面仍被橙红占满（实测截图确认），"王座"读不出来。
//  这里给第三层单独一套"冷石 + 青铜 + 铜锈"的替代色，第一/二层保持原值不变。
// ------------------------------------------------------------
const T3 = {
  // 金属/石构：熔炉棕 → 冷石
  '#5a3a24': '#4a4238', '#4b2c1e': '#4a463e', '#2a1710': '#2a2620',
  '#5a6570': '#6a6258',
  // 火焰/发光：炉火橙 → 青铜金
  '#ff9a3c': '#f0c86a', '#ff6a20': '#e0b45a', '#ff7a2e': '#d8a03c',
  // 容器/木作：暖陶棕 → 冷褐
  '#6b3a20': '#5a5244', '#3d1e10': '#332e26',
  '#4a2a1a': '#4a463e', '#2a150c': '#2a2620',
  '#43261a': '#3a3428', '#4a2a18': '#3a3428',
  '#5e3820': '#4a4234', '#33200f': '#26221a',
  // 次要道具（门框 / 门栅 / 楼梯 / 瓦砾 / 管线 / 齿轮 / 木箱桌）
  '#3a2118': '#3a3630', '#26140d': '#26221a',
  '#7a3a12': '#8a6a34', '#6a3a1a': '#4a4238', '#8a5a2a': '#6a6058',
};
// 取该层该道具的颜色：第一/二层原样，第三层走替代表（未登记的值原样保留）
const pc3 = (theme, warm) => {
  if (theme !== 3) return warm;
  if (Array.isArray(warm)) return warm.map((c) => T3[c] || c);
  return T3[warm] || warm;
};

export function makeCrate(rng, theme) {
  const g = new THREE.Group();
  const woodC = theme >= 2 ? pc3(theme, ['#4a2a18', '#5e3820', '#33200f']) : ['#6b4a2e', '#835c37', '#54371f'];
  const mW = M(woodC[rng.int(0, 2)]), mW2 = M(woodC[rng.int(0, 2)]), mM = MG('#8a8f96');
  const s = rng.float(1.1, 1.5);
  put(g, B(s, s, s), mW, 0, s / 2, 0);
  for (const [ax, ay] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    put(g, B(0.12 * s, s * 1.02, 0.12 * s), mW2, ax * s * 0.46, s / 2, ay * s * 0.46);
    put(g, B(0.16, 0.06, 0.16), mM, ax * s * 0.46, s * 0.94, ay * s * 0.46);
  }
  put(g, B(s * 1.02, 0.10, s * 1.02), mW2, 0, s * 0.62, 0);
  applyPropAsset(g,'crate',{theme,scale:[s,s,s]});
  return {
    object: g, kind: 'crate', destructible: true, hp: 26, blocksMove: true, blocksBullet: true,
    collider: { hw: s / 2, hd: s / 2, y: s / 2, h: s },
    debris: { color: woodC[0], n: 10 },
  };
}

export function makeTable(rng, theme) {
  const g = new THREE.Group();
  const woodC = theme >= 2 ? pc3(theme, ['#4a2a18', '#5e3820']) : ['#6b4a2e', '#835c37'];
  const mW = M(woodC[0]), mW2 = M(woodC[1]), mM = MG('#6a6f76');
  const w = rng.float(2.4, 3.4), d = rng.float(1.5, 2.0), h = 1.0;
  let top = put(g, B(w, 0.16, d), mW, 0, h, 0);
  put(g, B(w * 0.94, 0.06, d * 0.94), mW2, 0, h + 0.10, 0);
  for (const [ax, az] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    put(g, B(0.14, h, 0.14), mW2, ax * (w / 2 - 0.16), h / 2, az * (d / 2 - 0.16));
    put(g, B(0.20, 0.08, 0.20), mM, ax * (w / 2 - 0.16), 0.04, az * (d / 2 - 0.16));
  }
  // 桌上杂物
  put(g, B(0.30, 0.30, 0.22), M('#9aa2a8'), (rng.float(-0.6, 0.6)), h + 0.22, 0.1, 0, rng.float(0, 3), 0);
  put(g, B(0.22, 0.26, 0.20), M('#7a5a3a'), (rng.float(-0.7, 0.7)), h + 0.20, -0.2, 0, rng.float(0, 3), 0);
  const topArt=makePropVisual('table_top',{theme,scale:[w,1,d]});
  if(topArt){g.remove(top);topArt.position.copy(top.position);top=topArt;g.add(top);applyPropAsset(g,'table_base',{theme,scale:[w,1,d],keep:[top]});}
  return {
    object: g, kind: 'table', destructible: true, hp: 34, blocksMove: true, blocksBullet: true, cover: true,
    collider: { hw: w / 2, hd: d / 2, y: h, h: h + 0.2 },
    flipped: false, flip: 0, top, w, d, h,
    debris: { color: woodC[0], n: 12 },
    update(dt, t) {
      const target = this.flipped ? 1 : 0;
      if (this.flip !== target) {
        this.flip += Math.sign(target - this.flip) * dt * 5.5;
        this.flip = Math.max(0, Math.min(1, this.flip));
        this.top.rotation.x = -this.flip * Math.PI / 2;
        this.top.position.set(0, this.h + this.flip * (this.d / 2), -this.flip * (this.d / 4));
      }
    },
  };
}

export function makeBarrel(rng, explosive = true) {
  const g = new THREE.Group();
  const body = explosive ? '#8a2a22' : '#4a5a34';
  const mB = MG(body), mR = MG('#3a3f45'), mM = MG('#9aa2a8');
  put(g, C(0.56, 0.56, 1.30, 10), mB, 0, 0.65, 0);
  for (const y of [0.28, 1.02]) put(g, T(0.575, 0.055, 4, 10), mR, 0, y, 0, Math.PI / 2);
  put(g, C(0.58, 0.58, 0.10, 10), mM, 0, 1.32, 0);
  put(g, C(0.44, 0.44, 0.08, 8), mM, 0, 1.38, 0);
  put(g, B(0.22, 0.10, 0.22), mM, 0, 1.45, 0.16);
  if (explosive) {
    put(g, B(0.34, 0.16, 0.02), M('#e8c84a'), 0, 0.85, 0.565);
    put(g, CO(0.10, 0.18, 4), M('#e8c84a'), 0, 0.30, 0.60, Math.PI / 2);
  }
  applyPropAsset(g,'barrel',{explosive});
  return {
    object: g, kind: explosive ? 'barrel' : 'barrel_green', destructible: true, hp: 14,
    explosive, blocksMove: true, blocksBullet: true,
    collider: { hw: 0.56, hd: 0.56, y: 0.65, h: 1.3 },
    debris: { color: body, n: 10 },
  };
}

export function makePillar(rng, theme) {
  const g = new THREE.Group();
  const c = theme >= 2 ? pc3(theme, '#4b2c1e') : '#3f5560';
  const mS = M(c, null, 0, { rough: 0.92 }), mS2 = M(theme >= 2 ? pc3(theme, '#2a1710') : '#2a3a44', null, 0, { rough: 0.92 });
  const h = rng.float(4.4, 5.0);
  const broken = rng.chance(0.25);
  const H = broken ? rng.float(1.4, 2.4) : h;
  put(g, B(1.9, 0.30, 1.9), mS2, 0, 0.15, 0);
  put(g, C(0.72, 0.80, H, 8), mS, 0, 0.30 + H / 2, 0);
  if (!broken) {
    put(g, B(1.5, 0.28, 1.5), mS2, 0, H + 0.42, 0);
    put(g, B(1.8, 0.30, 1.8), mS, 0, H + 0.68, 0);
    for (const [ax, az] of [[1, 1], [-1, 1], [1, -1], [-1, -1]])
      put(g, B(0.5, 0.5, 0.5), mS2, ax * 0.72, H + 0.95, az * 0.72);
  } else {
    put(g, CO(0.72, 0.5, 8), mS, 0, H + 0.50, 0);
  }
  applyPropAsset(g,broken?'pillar_broken':'pillar',{theme,scale:[1,H/(broken?1.9:4.6),1]});
  return {
    object: g, kind: 'pillar', destructible: false, blocksMove: true, blocksBullet: true,
    collider: { hw: 0.80, hd: 0.80, y: H / 2, h: H + 0.3 },
  };
}

export function makeBrazier(rng, theme) {
  const g = new THREE.Group();
  const mS = MG(theme >= 2 ? pc3(theme, '#5a3a24') : '#5a6570'), mS2 = MG('#2f363c');
  const flame = GL(theme >= 2 ? pc3(theme, '#ff9a3c') : '#6fe4ff', 3.2);
  put(g, C(0.22, 0.42, 0.90, 6), mS2, 0, 0.45, 0);
  put(g, C(0.62, 0.62, 0.12, 8), mS2, 0, 0.06, 0);
  put(g, C(0.50, 0.30, 0.42, 8), mS, 0, 1.10, 0);
  const f1 = put(g, CO(0.32, 0.85, 5), flame, 0, 1.65, 0);
  const f2 = put(g, CO(0.18, 0.52, 5), GL('#fff0b0', 3.4), 0, 1.55, 0);
  for (let i = 0; i < 3; i++) put(g, B(0.55, 0.07, 0.07), mS2, 0, 0.16 + i * 0.32, 0, 0, i * 1.05, 0);
  applyPropAsset(g,'brazier',{theme,keep:[f1,f2]});
  return {
    object: g, kind: 'brazier', destructible: false, blocksMove: true, blocksBullet: false,
    collider: { hw: 0.5, hd: 0.5, y: 0.5, h: 0.9 },
    lightSpec: { color: theme >= 2 ? (theme === 3 ? 0xd8a03c : 0xff7a2e) : 0x67e8ff, intensity: theme >= 2 ? 9 : 7, distance: 14, y: 1.7, flicker: 0.25 },
    update(dt, t) {
      const s = 1 + Math.sin(t * 11.3) * 0.14 + Math.sin(t * 23.7) * 0.07;
      f1.scale.set(1 + Math.sin(t * 9) * 0.08, s, 1 + Math.cos(t * 7) * 0.08);
      f2.scale.setScalar(0.8 + Math.sin(t * 17) * 0.16);
    },
  };
}

export function makePot(rng, theme) {
  const g = new THREE.Group();
  const c = theme >= 2 ? pc3(theme, '#6b3a20') : '#5a6f7a';
  const m = M(c), m2 = M(theme >= 2 ? pc3(theme, '#3d1e10') : '#3a4a52');
  put(g, C(0.34, 0.22, 0.62, 7), m, 0, 0.31, 0);
  put(g, C(0.38, 0.34, 0.10, 7), m2, 0, 0.66, 0);
  put(g, C(0.20, 0.38, 0.22, 7), m, 0, 0.78, 0);
  applyPropAsset(g,'pot',{theme});
  return {
    object: g, kind: 'pot', destructible: true, hp: 8, blocksMove: false, blocksBullet: false,
    collider: { hw: 0.34, hd: 0.34, y: 0.35, h: 0.7 }, debris: { color: c, n: 6 }, small: true,
  };
}

export function makeStatue(rng, theme) {
  const g = new THREE.Group();
  const c = theme >= 2 ? pc3(theme, '#4a2a1a') : '#46545e';
  const m = M(c), m2 = M(theme >= 2 ? pc3(theme, '#2a150c') : '#2b363d'), e = GL(theme >= 2 ? pc3(theme, '#ff6a20') : '#6fd8ff', 2.2);
  put(g, B(1.6, 0.36, 1.6), m2, 0, 0.18, 0);
  put(g, B(1.20, 0.5, 1.20), m, 0, 0.60, 0);
  put(g, B(0.86, 1.5, 0.72), m, 0, 1.60, 0);
  put(g, B(1.05, 0.28, 0.85), m2, 0, 2.40, 0);
  put(g, B(0.56, 0.60, 0.56), m, 0, 2.82, 0);
  put(g, CO(0.30, 0.5, 5), m, 0, 3.30, 0);
  put(g, B(0.16, 0.09, 0.05), e, -0.13, 2.90, 0.29);
  put(g, B(0.16, 0.09, 0.05), e, 0.13, 2.90, 0.29);
  for (const s of [-1, 1]) put(g, B(0.24, 1.10, 0.24), m2, s * 0.62, 1.70, 0, 0, 0, s * 0.14);
  applyPropAsset(g,'statue',{theme});
  return {
    object: g, kind: 'statue', destructible: false, blocksMove: true, blocksBullet: true,
    collider: { hw: 0.82, hd: 0.82, y: 1.4, h: 3.0 },
  };
}

export function makeShelf(rng, theme) {
  const g = new THREE.Group();
  const wood = theme >= 2 ? pc3(theme, '#43261a') : '#61432a';
  const m = M(wood), m2 = M(theme >= 2 ? pc3(theme, '#2a1710') : '#3d2b1c');
  const w = [1.8, 2.1, 2.4, 2.6][rng.int(0, 3)], h = [2.6, 2.9, 3.2, 3.4][rng.int(0, 3)], d = 0.7;
  put(g, B(w, h, d), m2, 0, h / 2, 0);
  for (let i = 0; i < 3; i++) put(g, B(w - 0.1, 0.10, d - 0.06), m, 0, 0.5 + i * (h / 3.2), 0.06);
  for (let i = 0; i < 5; i++) {
    const hh = [0.35, 0.44, 0.53, 0.62][rng.int(0, 3)];
    put(g, B([0.10, 0.13, 0.16, 0.18][rng.int(0, 3)], hh, [0.42, 0.48, 0.55][rng.int(0, 2)]),
      M(['#8a3a2a', '#2a5a6a', '#6a5a2a', '#4a2a5a'][rng.int(0, 3)]),
      rng.float(-w / 2 + 0.2, w / 2 - 0.2), 0.5 + rng.int(0, 2) * (h / 3.2) + hh / 2 + 0.05, 0.06, 0, rng.float(-0.15, 0.15), 0);
  }
  applyPropAsset(g,'shelf',{theme,scale:[w,h,d]});
  return {
    object: g, kind: 'shelf', destructible: true, hp: 20, blocksMove: true, blocksBullet: true,
    collider: { hw: w / 2, hd: d / 2 + 0.1, y: h / 2, h },
    debris: { color: wood, n: 10 },
  };
}

export function makeBones(rng) {
  const g = new THREE.Group();
  const m = M('#cfc6ad');
  const n = rng.int(3, 6);
  for (let i = 0; i < n; i++) {
    const skull = rng.chance(0.35);
    const x = rng.float(-0.9, 0.9), z = rng.float(-0.9, 0.9), r = rng.float(0, 6.28);
    if (skull) {
      put(g, S(0.19, 6, 4), m, x, 0.17, z, 0, r, 0);
      put(g, B(0.24, 0.14, 0.16), m, x, 0.10, z + 0.10, 0, r, 0);
    } else {
      put(g, C(0.055, 0.055, rng.float(0.5, 0.9), 5), m, x, 0.07, z, Math.PI / 2, r, 0);
      put(g, S(0.075, 5, 4), m, x + 0.28, 0.07, z, 0, 0, 0);
    }
  }
  applyPropAsset(g,'bones');
  return { object: g, kind: 'bones', destructible: false, blocksMove: false, blocksBullet: false, collider: null };
}

export function makeRubble(rng, theme) {
  const g = new THREE.Group();
  const m = M(theme >= 2 ? pc3(theme, '#3a2118') : '#384750');
  const m2 = M(theme >= 2 ? pc3(theme, '#26140d') : '#2a353c');
  for (let i = 0; i < rng.int(4, 8); i++) {
    put(g, I(rng.float(0.16, 0.42), 0), rng.chance(0.5) ? m : m2,
      rng.float(-1.1, 1.1), rng.float(0.08, 0.3), rng.float(-1.1, 1.1), rng.float(0, 6), rng.float(0, 6), rng.float(0, 6));
  }
  applyPropAsset(g,'rubble',{theme});
  return { object: g, kind: 'rubble', destructible: false, blocksMove: false, blocksBullet: false, collider: null };
}

export function makeCrystal(rng, color = '#5ad8ff') {
  const g = new THREE.Group();
  const m = getMaterial(color, { emissive: color, emissiveIntensity: 0.75, flat: true, roughness: 0.25, metalness: 0.1, transparent: true, opacity: 0.92 });
  const n = rng.int(3, 6);
  for (let i = 0; i < n; i++) {
    const h = rng.float(0.7, 1.8), r = rng.float(0.11, 0.22);
    put(g, CO(r, h, 5), m, rng.float(-0.7, 0.7), h / 2, rng.float(-0.7, 0.7), rng.float(-0.25, 0.25), rng.float(0, 6), rng.float(-0.25, 0.25));
  }
  // 灯光不再自建（自建点光会让场景灯数随房间内容浮动 → 着色器反复重编译）。
  // 改为向 RoomScene 声明一条光规格，由 FixedLightPool 统一分配。
  const lightSpec = { y: 1.0, color, intensity: 3.0, distance: 9, flicker: 0.10 };
  applyPropAsset(g,'crystal',{color});
  return {
    object: g, kind: 'crystal', destructible: false, blocksMove: true, blocksBullet: true,
    collider: { hw: 0.5, hd: 0.5, y: 0.6, h: 1.2 },
  };
}

// ============================================================
//  功能性道具
// ============================================================
// 火把按**层的身份**配色（PASS3 §4）。
// 旧实现用 `theme >= 2` 一刀切，把第二层与第三层的火把都做成炉火橙 ——
// 于是第三层即使把地板改成冷石，整帧画面仍被橙红占满，"王座"读不出来。
// 现在：二层 = 炉火橙（熔炼），三层 = 青铜金（照明），一层 = 冷青（回声）。
const TORCH_STYLE = {
  1: { metal: '#4a5560', flame: '#7ae8ff', light: 0x74e0ff, intensity: 8 },
  2: { metal: '#5a3a24', flame: '#ff9a3c', light: 0xff7a2e, intensity: 10 },
  3: { metal: '#4a4238', flame: '#f0c86a', light: 0xd8a03c, intensity: 8 },
};

export function makeTorch(rng, theme) {
  const g = new THREE.Group();
  const st = TORCH_STYLE[theme] || TORCH_STYLE[2];
  const m = MG(st.metal);
  const flame = GL(st.flame, 3.4);
  const m2 = MG('#2b3138');
  put(g, B(0.34, 0.30, 0.34), m2, 0, 0, 0);
  put(g, B(0.14, 0.55, 0.14), m, 0, -0.05, 0.30, 0.5);
  put(g, C(0.20, 0.13, 0.34, 6), m, 0, 0.24, 0.14);
  const f1 = put(g, CO(0.22, 0.62, 5), flame, 0, 0.68, 0.12);
  const f2 = put(g, CO(0.12, 0.36, 5), GL('#fff4c0', 3.6), 0, 0.62, 0.12);
  applyPropAsset(g,'torch',{theme,keep:[f1,f2]});
  return {
    object: g, kind: 'torch', destructible: false, blocksMove: false, blocksBullet: false, collider: null,
    lightSpec: { color: st.light, intensity: st.intensity, distance: 15, y: 1.1, flicker: 0.3 },
    update(dt, t) {
      const s = 1 + Math.sin(t * 13.1) * 0.15 + Math.sin(t * 27.3) * 0.08;
      f1.scale.set(1 + Math.sin(t * 8) * 0.1, s, 1 + Math.cos(t * 9) * 0.1);
      f2.scale.setScalar(0.8 + Math.sin(t * 19) * 0.18);
    },
  };
}

export function makeChest(rng, spec = 'normal') {
  const chest = typeof spec === 'string' ? {quality:spec} : spec;
  const rules = chestRules(chest), quality = chest.quality;
  const { g, lid, lock } = makePilotChestVisual(rules) || makeLegacyChestVisual(rules, quality);
  return {
    ...chestFields(chest), object: g, kind: 'chest' , chest: true, quality, destructible: false, blocksMove: true, blocksBullet: true,
    collider: { hw: 0.68, hd: 0.48, y: 0.4, h: 0.8 }, opened: false, opening: 0, lid, lock, glint: null,
    update(dt, t) {
      if (this.opened) {
        this.opening = Math.min(1, this.opening + dt * 1.8);
        this.lid.rotation.x = -this.opening * 1.55;
      } else { this.opening = 0; this.lid.rotation.x = 0; }
      if (!this.opened && this.lid) this.lid.position.y = 0.78 + Math.sin(t * 2.2) * 0.012;
    },
  };
}

function makeLegacyChestVisual(rules, quality) {
  const g = new THREE.Group();
  const bodyC = !rules.legacy ? '#253541' : quality === 'gold' ? '#8a6a20' : quality === 'locked' ? '#3a4a58' : '#6b4a2e';
  const trimC = !rules.legacy ? rules.color : quality === 'gold' ? '#e8c84a' : quality === 'locked' ? '#7d8f9c' : '#b08a3a';
  const mB = M(bodyC), mT = MG(trimC), mT2 = MG(trimC);
  put(g, B(1.30, 0.78, 0.92), mB, 0, 0.39, 0);
  put(g, B(1.36, 0.10, 0.98), mT, 0, 0.72, 0);
  put(g, B(0.18, 0.80, 0.14), mT2, 0, 0.40, 0.47);
  put(g, B(0.24, 0.26, 0.14), mT, 0, 0.42, 0.50);
  const lid = new THREE.Group();
  lid.position.set(0, 0.78, -0.46);
  g.add(lid);
  put(lid, B(1.34, 0.34, 0.94), mB, 0, 0.17, 0.46);
  put(lid, B(1.40, 0.09, 1.00), mT, 0, 0.32, 0.46);
  put(lid, B(1.20, 0.10, 0.16), mT2, 0, 0.20, 0.46);
  const lock = put(g, B(0.34, 0.34, 0.16), rules.locked ? M('#c04a3a','#c04a3a',.15) : mT, 0, 0.50, 0.70);
  lock.scale.set(rules.locked ? 1 : .65, rules.locked ? 1 : .28, 1);
  if (rules.locked) {
    for (const side of [-1,1]) put(g,B(.055,.22,.08),mT,side*.115,.75,.70);
    put(g,B(.28,.055,.08),mT,0,.85,.70);
  }
  if (!rules.legacy) {
    // Tier silhouette: bars, diamond, wings and crown. Lock remains independent.
    const tier = rules.rarityTier;
    const emblem = M(trimC,trimC,.30,{metal:.15});
    if (tier === 1) put(lid, B(.88,.14,.18), emblem, 0,.46,.50);
    if (tier === 2) for (const side of [-1,1]) put(lid,B(.20,.55,.20),emblem,side*.28,.70,.50);
    if (tier === 3) put(lid,B(.52,.52,.18),emblem,0,.74,.50,0,0,Math.PI/4);
    if (tier === 4) for (const side of [-1,1]) put(lid,B(.62,.20,.20),emblem,side*.65,.62,.50,0,0,side*.40);
    if (tier === 5) {
      put(lid,B(1.22,.16,.20),emblem,0,.80,.50);
      for(let i=0;i<5;i++) put(lid,B(.15,.60+(i%2)*.20,.20),emblem,(i-2)*.25,1.14,.50);
    }
  }
  return { g, lid, lock };
}

export function makeDoorFrame(rng, theme) {
  const g = new THREE.Group();
  const c = theme >= 2 ? pc3(theme, '#4b2c1e') : '#46545e';
  const m = M(c), m2 = M(theme >= 2 ? pc3(theme, '#2a1710') : '#2b363d');
  const W = 6.4, H = 4.6, T = 0.9;
  put(g, B(T, H, T), m2, -W / 2, H / 2, 0);
  put(g, B(T, H, T), m2, W / 2, H / 2, 0);
  put(g, B(W + T, 0.9, T), m2, 0, H + 0.3, 0);
  put(g, B(W * 0.92, 0.34, 0.5), m, 0, 3.55, 0);
  for (let i = 0; i < 5; i++) {
    const x = -W * 0.36 + (i / 4) * W * 0.72;
    put(g, B(0.34, 0.5, 0.45), M(theme >= 2 ? pc3(theme, '#7a3a12') : '#3f7d94'), x, 3.55, 0.2);
    put(g, B(0.22, 0.22, 0.10), GL(theme >= 2 ? pc3(theme, '#ff8a3c') : '#67e8ff', 2.0), x, 3.72, 0.44);
  }
  applyPropAsset(g,'doorframe',{theme});
  return { object: g, kind: 'doorframe', destructible: false, blocksMove: false, blocksBullet: false, collider: null };
}

export function makeDoorBarrier(theme) {
  const g = new THREE.Group();
  const m = MG(theme >= 2 ? pc3(theme, '#6a3a1a') : '#4a6a7a');
  const e = GL(theme >= 2 ? pc3(theme, '#ff7a2e') : '#67e8ff', 2.4);
  for (let i = 0; i < 5; i++) put(g, B(0.22, 4.2, 0.22), m, 0, 2.1, -2.2 + i * 1.1);
  put(g, B(6.2, 0.24, 0.30), m, 0, 1.0, 0);
  put(g, B(6.2, 0.24, 0.30), m, 0, 3.2, 0);
  for (let i = 0; i < 6; i++) put(g, B(0.9, 0.10, 0.14), e, -2.6 + i * 1.05, 2.1, 0, 0, 0, 0);
  applyPropAsset(g,'doorbarrier',{theme});
  return { object: g, kind: 'doorbarrier', destructible: false, blocksMove: false, blocksBullet: false, collider: null, visible: false };
}

export function makeStairs(theme) {
  const g = new THREE.Group();
  const m = M(theme >= 2 ? pc3(theme, '#3a2118') : '#3a4a54'), m2 = M(theme >= 2 ? pc3(theme, '#26140d') : '#243039');
  put(g, B(4.0, 0.34, 4.0), m2, 0, 0.17, 0);
  for (let i = 0; i < 5; i++) {
    put(g, B(3.2 - i * 0.34, 0.30, 0.66), m, 0, 0.46 + i * 0.28, -1.2 + i * 0.62);
  }
  const gate = new THREE.Group();
  gate.position.set(0, 0, -2.2);
  g.add(gate);
  put(gate, B(4.6, 5.0, 0.5), m2, 0, 2.5, 0);
  put(gate, B(2.4, 0.36, 0.10), GL(theme >= 2 ? pc3(theme, '#ffb347') : '#8af0ff', 2.6), 0, 1.6, 0.3);
  for (const s of [-1, 1]) put(gate, C(0.3, 0.3, 5.2, 8), MG('#9aa2a8'), s * 2.0, 2.6, 0.3);
  const beam = put(g, B(3.0, 4.2, 0.12), getMaterial('#3ad2ff', { emissive: '#3ad2ff', emissiveIntensity: 1.4, transparent: true, opacity: 0.30, flat: true }), 0, 2.2, 2.6);
  const lightSpec = { y: 2.4, dz: 1.6, color: 0x67e8ff, intensity: 8, distance: 18, flicker: 0 };
  applyPropAsset(g,'stairs',{theme,keep:[beam]});
  return {
    object: g, kind: 'stairs', stairs: true, destructible: false, blocksMove: false, blocksBullet: false,
    collider: { hw: 2.0, hd: 2.0, y: 0.3, h: 1.2 }, beam, lightSpec,
    update(dt, t) {
      beam.material.opacity = 0.22 + Math.sin(t * 2.6) * 0.10;
      // 灯光由 FixedLightPool 持有，RoomScene 建灯后会把池内条目挂回 _poolLight
      if (this._poolLight) this._poolLight.light.intensity = 7 + Math.sin(t * 3.1) * 2.2;
    },
  };
}

export function makePedestal(theme) {
  const g = new THREE.Group();
  const m = M(theme >= 2 ? pc3(theme, '#4a2a1a') : '#43525c'), m2 = MG(theme >= 2 ? '#a8763a' : '#c9a227');
  put(g, B(1.10, 0.24, 1.10), m, 0, 0.12, 0);
  put(g, C(0.36, 0.48, 0.86, 6), m, 0, 0.62, 0);
  put(g, B(0.86, 0.14, 0.86), m2, 0, 1.10, 0);
  put(g, B(0.92, 0.08, 0.92), m, 0, 1.20, 0);
  const lightSpec = { y: 1.9, color: theme >= 2 ? 0xffb347 : 0x8af0ff, intensity: 4.2, distance: 9, flicker: 0.06 };
  applyPropAsset(g,'pedestal',{theme});
  return {
    object: g, kind: 'pedestal', destructible: false, blocksMove: true, blocksBullet: true,
    collider: { hw: 0.48, hd: 0.48, y: 0.6, h: 1.2 }, itemAnchor: { x: 0, y: 1.55, z: 0 }, lightSpec,
    update(dt, t) { this.object.rotation.y = Math.sin(t * 0.35) * 0.16; },
  };
}

export function makeAltar(theme) {
  const g = new THREE.Group();
  const m = M(theme >= 2 ? pc3(theme, '#43261a') : '#3d4a54'), m2 = MG('#a8763a'), e = GL(theme >= 2 ? pc3(theme, '#ff6a20') : '#67e8ff', 2.6);
  put(g, B(1.9, 0.34, 1.5), m, 0, 0.17, 0);
  put(g, B(1.5, 0.9, 1.1), m, 0, 0.78, 0);
  put(g, B(2.0, 0.20, 1.6), m2, 0, 1.32, 0);
  put(g, C(0.30, 0.42, 0.5, 6), m2, 0, 1.66, 0);
  const orb = put(g, I(0.28, 1), e, 0, 2.06, 0);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    put(g, B(0.16, 0.9, 0.16), m2, Math.cos(a) * 0.72, 0.90, Math.sin(a) * 0.72, 0, 0, Math.cos(a) * 0.12);
  }
  const lightSpec = { y: 2.2, color: theme >= 2 ? 0xff7a2e : 0x67e8ff, intensity: 7, distance: 12, flicker: 0.16 };
  applyPropAsset(g,'altar',{theme,keep:[orb]});
  return {
    object: g, kind: 'altar', altar: true, destructible: false, blocksMove: true, blocksBullet: true,
    collider: { hw: 0.95, hd: 0.75, y: 0.7, h: 1.4 }, lightSpec, orb,
    update(dt, t) { orb.rotation.y += dt * 1.2; orb.rotation.x += dt * 0.6; orb.position.y = 2.06 + Math.sin(t * 2) * 0.09; },
  };
}

export function makeLavaPool(rng) {
  const g = new THREE.Group();
  const r = rng.float(1.3, 2.4);
  const m = getMaterial('#ff5a10', { emissive: '#ff7a20', emissiveIntensity: 1.7, flat: true, roughness: 0.3, transparent: true, opacity: 0.94 });
  const pool = put(g, C(r, r * 0.86, 0.12, 10), m, 0, 0.05, 0);
  const rim = put(g, T(r * 1.04, 0.14, 5, 12), M('#2a140c'), 0, 0.04, 0);
  const lightSpec = { y: 0.7, color: 0xff6a20, intensity: 6, distance: 11, flicker: 0.22 };
  return {
    object: g, kind: 'lava', hazard: true, damage: 1, radius: r * 0.86, destructible: false,
    blocksMove: false, blocksBullet: false, collider: null, lightSpec, pool,
    update(dt, t) {
      pool.position.y = 0.05 + Math.sin(t * 1.6) * 0.02;
      if (this._poolLight) this._poolLight.light.intensity = 5 + Math.sin(t * 2.3) * 1.6;
    },
  };
}

// 地刺：必须一眼看出是"危险"。做法 = 危险配色（铁锈红）+ 警示条纹外框 +
// 深陷的黑洞孔位 + 探出时的高光尖刺 + 临近触发时的红色脉动。
export function makeSpikeTrap(rng, theme) {
  const g = new THREE.Group();
  const mIron = MG('#6e757c'), mRust = M('#7a2418');
  const mWarn = M('#e8c84a');
  const mHole = M('#07090b', null, 0, { rough: 1 });
  const mSpike = MG('#b8c2ca');
  const mSpikeTip = M('#d8e0e6', '#ff5a3a', 0.55);

  // 外框（警示条纹）
  put(g, B(1.66, 0.12, 1.66), mRust, 0, 0.06, 0);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    for (let k = -1; k <= 1; k += 2) {
      const px = Math.cos(a) * 0.74 - Math.sin(a) * 0.16 * k;
      const pz = Math.sin(a) * 0.74 + Math.cos(a) * 0.16 * k;
      put(g, B(0.30, 0.05, 0.14), mWarn, px, 0.135, pz, 0, a, 0);
    }
  }
  // 凹槽
  put(g, B(1.34, 0.06, 1.34), mHole, 0, 0.10, 0);
  const spikes = new THREE.Group();
  g.add(spikes);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    const x = -0.54 + i * 0.36, z = -0.54 + j * 0.36;
    put(spikes, CO(0.10, 0.62, 4), mSpike, x, 0.31, z);
    put(spikes, CO(0.035, 0.20, 4), mSpikeTip, x, 0.66, z);
  }
  spikes.position.y = -0.60;
  // 地刺的告警辉光：走灯光池，初始强度 0，由 update() 通过 _poolLight 驱动
  const lightSpec = { y: 0.5, color: 0xff4a2a, intensity: 0, distance: 3.4, flicker: 0 };

  applyPropAsset(g,'spike_base',{theme,keep:[spikes]});
  return {
    object: g, kind: 'spiketrap', trap: true, destructible: false, blocksMove: false, blocksBullet: false,
    collider: null, spikes, lightSpec, timer: rng.float(0, 2.4), period: 2.4, extended: false, damage: 1,
    update(dt) {
      this.timer += dt;
      if (this.timer > this.period) this.timer = 0;
      const t = this.timer / this.period;
      const out = t < 0.12 ? t / 0.12 : t > 0.82 ? Math.max(0, (1 - t) / 0.18) : 1;
      this.extended = out > 0.6;
      this.spikes.position.y = -0.60 + out * 0.62;
      // 临近弹出时脉动（0.82→1.0 为收回段，此前为预警）
      const warn = t > 0.60 && t <= 0.86 ? (t - 0.60) / 0.26 : 0;
      const pulse = warn > 0 ? 0.5 + 0.5 * Math.sin(this.timer * 26) : 0;
      if (this._poolLight) this._poolLight.light.intensity = out * 3.2 + warn * pulse * 5.0;
    },
  };
}

export function makeFlameVent(rng, theme) {
  const g = new THREE.Group();
  const m = MG('#4a555d');
  put(g, B(1.1, 0.14, 1.1), m, 0, 0.07, 0);
  put(g, T(0.36, 0.07, 4, 10), m, 0, 0.14, 0, Math.PI / 2);
  const flame = put(g, C(0.30, 0.16, 4.2, 7), GL('#ff8a2a', 2.2), 0, 2.0, 0);
  flame.visible = false;
  applyPropAsset(g,'flame_base',{theme,keep:[flame]});
  return {
    object: g, kind: 'flamevent', trap: true, destructible: false, blocksMove: false, blocksBullet: false,
    collider: null, flame, timer: rng.float(0, 3), period: 3.0, warning: null, active: false, damage: 1, burnT: 0,
    update(dt) {
      this.timer += dt;
      if (this.timer > this.period) this.timer = 0;
      const t = this.timer / this.period;
      this.active = t > 0.4 && t < 0.72;
      flame.visible = t > 0.3 && t < 0.78;
      if (flame.visible) {
        flame.material.opacity = 1;
        flame.scale.set(1 + Math.sin(this.timer * 22) * 0.16, 1, 1 + Math.cos(this.timer * 19) * 0.16);
      }
    },
  };
}

export function makeArrowWall(rng, theme) {
  const g = new THREE.Group();
  const m = MG('#5a6570');
  put(g, B(1.5, 1.5, 0.4), m, 0, 1.6, 0);
  put(g, B(0.26, 0.26, 0.30), M('#1a1f24'), 0, 1.6, 0.22);
  const dart = put(g, B(0.10, 0.10, 0.9), MG('#c8ccd0'), 0, 1.6, 0.6);
  dart.visible = false;
  applyPropAsset(g,'arrow_base',{theme,keep:[dart]});
  return {
    object: g, kind: 'arrowwall', trap: true, destructible: false, blocksMove: false, blocksBullet: false,
    collider: null, dart, timer: rng.float(0, 2.6), period: 2.6, damage: 1, fireT: 0,
    update(dt) {
      this.timer += dt;
      if (this.timer > this.period) { this.timer = 0; this.fireT = 0.45; }
      if (this.fireT > 0) { this.fireT -= dt; this.dart.visible = true; this.dart.position.z = 0.6 + (0.45 - this.fireT) * 12; }
      else this.dart.visible = false;
    },
  };
}

// 秘门（隐藏房间的可破坏墙体）
export function makeSecretWall(theme, w = 6, h = 4.6) {
  const g = new THREE.Group();
  const m = M(theme >= 2 ? pc3(theme, '#3a2118') : '#37464f', null, 0, { rough: 0.9 });
  put(g, B(w, h, 0.9), m, 0, h / 2, 0);
  for (let i = 0; i < 3; i++) put(g, B(w * 0.96, 0.06, 1.0), M(theme >= 2 ? '#2a1710' : '#26333b'), 0, h * (0.25 + i * 0.25), 0);
  return {
    object: g, kind: 'secretwall', secret: true, destructible: true, hp: 44, blocksMove: true, blocksBullet: true,
    collider: { hw: w / 2, hd: 0.45, y: h / 2, h }, debris: { color: theme >= 2 ? '#3a2118' : '#37464f', n: 14 },
    revealed: false,
    update(dt, t) {
      if (this.revealed) {
        const s = 0.5 + Math.sin(t * 18) * 0.35;
        this.object.children.forEach((c) => { if (c.material && c.material.emissive) c.material.emissiveIntensity = s; });
      }
    },
  };
}

export function makeCobweb(rng) {
  const g = new THREE.Group();
  const m = getMaterial('#c8d8e0', { transparent: true, opacity: 0.20, flat: true, roughness: 1, side: true });
  // 尺寸取离散档位：网片的随机感来自位置/旋转，尺寸不必连续，
  // 否则几何缓存键会随房间数持续膨胀。
  const CW = [1.6, 2.0, 2.5, 2.9];
  for (let i = 0; i < 4; i++) {
    put(g, B(CW[rng.int(0, 3)], CW[rng.int(0, 3)], 0.02), m, rng.float(-3, 3), rng.float(2.4, 4.2), rng.float(-3, 3), 0, rng.float(0, 6), rng.float(0, 0.4));
  }
  return { object: g, kind: 'cobweb', destructible: false, blocksMove: false, blocksBullet: false, collider: null };
}

export function makeChains(rng, theme) {
  const g = new THREE.Group();
  const m = MG('#7a828a');
  const n = rng.int(2, 4);
  for (let i = 0; i < n; i++) {
    const x = rng.float(-3, 3), z = rng.float(-3, 3), len = rng.int(4, 8);
    for (let k = 0; k < len; k++) put(g, T(0.10, 0.035, 4, 6), m, x, 5.0 - k * 0.22, z, Math.PI / 2, k % 2 ? 0 : Math.PI / 2, 0);
  }
  applyPropAsset(g,'chains',{theme});
  return { object: g, kind: 'chains', destructible: false, blocksMove: false, blocksBullet: false, collider: null };
}

// ============================================================
//  三层结构语言（PASS3 §4 / §10）
//
//  任务书禁止"第三层只是第二层加亮版"，而"换配色"只解决了一半 ——
//  真正的区分在于**建筑结构的节奏**：
//    · 第一层 沉钟回廊 = **垂直对称的钟拱**（回声、仪式、向上的垂线）
//    · 第二层 熔核深渊 = **水平粗管与铆钉**（工业、横向、压力容器）
//    · 第三层 熔心王座 = **高柱与王座台阶**（宫廷、垂直但更疏、更强的光影层次）
//  这三件是"结构"而不是"装饰"：它们改变房间的剪影与光照落点，
//  因此即使把三层都调成同一套色，玩家仍能凭轮廓分辨自己在哪一层。
// ============================================================
export function makeArch(rng, theme) {
  const g = new THREE.Group();
  const st = TORCH_STYLE[theme] || TORCH_STYLE[2];
  const p = PAL_SAFE(theme);
  const m = M(p.wall[3], null, 0, { rough: 0.9 });
  const m2 = M(p.wall[5], null, 0, { rough: 0.85 });
  const W = theme === 3 ? 6.2 : 5.2;
  // 两根立柱 + 一道半圆拱券（对称是"钟拱"的关键：一眼看出与横向工业件不同）
  put(g, B(0.6, 4.2, 0.7), m, -W / 2, 2.1, 0);
  put(g, B(0.6, 4.2, 0.7), m, W / 2, 2.1, 0);
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI * (i / 10);
    put(g, B(0.55, 0.5, 0.7), m2, -Math.cos(a) * W / 2, 4.2 + Math.sin(a) * (W * 0.34), 0);
  }
  // 拱心石
  put(g, B(0.9, 0.7, 0.85), M(p.accent[2], null, 0, { rough: 0.7 }), 0, 4.2 + W * 0.34, 0);
  // 悬挂的钟（第一层的签名：钟拱上真的挂一口钟）
  put(g, C(0.42, 0.62, 0.9, 8), MG(p.accent[1]), 0, 3.5, 0);
  put(g, B(0.14, 0.5, 0.14), MG('#2b3138'), 0, 4.05, 0);
  void st; void rng;
  applyPropAsset(g,'arch',{theme,scale:[W/5.2,1,1]});
  return { object: g, kind: 'arch', destructible: false, blocksMove: false, blocksBullet: false, collider: null };
}

export function makeRivetBeam(rng, theme) {
  const g = new THREE.Group();
  const p = PAL_SAFE(theme);
  const m = MG(p.wall[2]);
  const m2 = MG(p.wall[4]);
  const L = rng.float(9, 13);
  // 横向主管 + 上下翼板 + 一排铆钉：横向线条是第二层的签名
  put(g, C(0.34, 0.34, L, 8), m, 0, 0, 0).rotation.z = Math.PI / 2;
  put(g, B(L, 0.16, 0.62), m2, 0, 0, 0);
  const n = Math.floor(L / 0.9);
  for (let i = 0; i < n; i++) {
    const x = -L / 2 + 0.5 + i * (L - 1) / Math.max(1, n - 1);
    put(g, B(0.14, 0.14, 0.14), MG(p.accent[3]), x, 0.18, 0.24);
    put(g, B(0.14, 0.14, 0.14), MG(p.accent[3]), x, -0.18, -0.24);
  }
  applyPropAsset(g,'rivet_beam',{theme,scale:[L,1,1]});
  return { object: g, kind: 'beam', destructible: false, blocksMove: false, blocksBullet: false, collider: null };
}

export function makeGrandColumn(rng, theme) {
  const g = new THREE.Group();
  const p = PAL_SAFE(theme);
  const m = M(p.wall[3], null, 0, { rough: 0.92 });
  const m2 = M(p.wall[5], null, 0, { rough: 0.88 });
  const H = rng.float(6.2, 8.0);
  put(g, B(1.5, 0.5, 1.5), m2, 0, 0.25, 0);                 // 柱础
  put(g, C(0.52, 0.62, H, 10), m, 0, H / 2, 0);              // 柱身
  put(g, B(1.35, 0.42, 1.35), m2, 0, H + 0.2, 0);            // 柱头
  put(g, B(1.9, 0.36, 1.9), m, 0, H + 0.55, 0);              // 顶板
  // 柱身上的青铜箍（王庭的金属年头）
  for (let i = 1; i <= 2; i++) put(g, C(0.66, 0.66, 0.22, 10), MG(p.accent[2]), 0, H * (i / 3), 0);
  // **不阻挡**：柱子若能挡子弹/移动就变成了掩体，那是战斗平衡改动，
  // 而 PASS3 §48 明确要求美术轮不改平衡。它只承担"结构语言"的职责。
  applyPropAsset(g,'grand_column',{theme,scale:[1,H/7,1]});
  return { object: g, kind: 'column', destructible: false, blocksMove: false, blocksBullet: false, collider: null };
}

export function makeDais(rng, theme) {
  const g = new THREE.Group();
  const p = PAL_SAFE(theme);
  const m = M(p.wall[2], null, 0, { rough: 0.9 });
  const m2 = MG(p.accent[2]);
  // 王座台阶：三级收进的方台（第三层 Boss 房的"舞台"）
  for (let i = 0; i < 3; i++) {
    const w = 9 - i * 2.1;
    put(g, B(w, 0.34, w), m, 0, 0.17 + i * 0.34, 0);
    put(g, B(w * 0.96, 0.06, w * 0.96), m2, 0, 0.36 + i * 0.34, 0);
  }
  applyPropAsset(g,'dais',{theme});
  return { object: g, kind: 'dais', destructible: false, blocksMove: false, blocksBullet: false, collider: null };
}

// 调色板取用（按层）——结构件也要跟随层的材质家族
function PAL_SAFE(theme) {
  return theme === 3 ? PAL.throne : theme === 2 ? PAL.abyss : PAL.keep;
}

export function makeBanner(theme) {
  const g = new THREE.Group();
  const tex = getTexture(theme === 3 ? 'banner_throne' : theme === 2 ? 'banner_abyss' : 'banner',
    { seed: 7, next: () => 0.5, int: () => 0, chance: () => false, float: () => 0 });
  const m = getMaterial('#ffffff', { map: tex, flat: false, roughness: 0.95 });
  put(g, B(1.5, 3.0, 0.10), m, 0, 0, 0);
  put(g, C(0.06, 0.06, 2.2, 6), MG('#8a6a3a'), 0, 1.5, 0, 0, 0, Math.PI / 2);
  applyPropAsset(g,'banner',{theme});
  return { object: g, kind: 'banner', destructible: false, blocksMove: false, blocksBullet: false, collider: null };
}

export function makePipes(rng, theme) {
  const g = new THREE.Group();
  const m = MG(theme >= 2 ? pc3(theme, '#6a3a1a') : '#5a6570'), m2 = MG('#3a444c');
  const n = rng.int(2, 4);
  for (let i = 0; i < n; i++) {
    const horiz = rng.chance(0.5);
    const len = 6 + rng.int(0, 6);          // 离散档位，避免几何缓存键无界膨胀
    const y = rng.float(2.6, 4.4);
    put(g, C(0.20, 0.20, len, 7), m, horiz ? 0 : rng.float(-4, 4), y, horiz ? rng.float(-4, 4) : 0, horiz ? 0 : 0, 0, horiz ? Math.PI / 2 : 0);
    put(g, C(0.26, 0.26, 0.20, 7), m2, horiz ? -len / 2 : rng.float(-4, 4), y, horiz ? rng.float(-4, 4) : -len / 2, 0, 0, horiz ? Math.PI / 2 : 0);
  }
  applyPropAsset(g,'pipes',{theme});
  return { object: g, kind: 'pipes', destructible: false, blocksMove: false, blocksBullet: false, collider: null };
}

export function makeCog(rng, theme) {
  const g = new THREE.Group();
  const m = MG(theme >= 2 ? pc3(theme, '#8a5a2a') : '#6a747d');
  const r = rng.float(1.2, 2.2);
  put(g, C(r, r, 0.30, 12), m, 0, r, 0, 0, 0, Math.PI / 2);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    put(g, B(0.28, 0.28, 0.42), m, Math.cos(a) * (r + 0.14), r + Math.sin(a) * (r + 0.14), 0, 0, 0, a);
  }
  put(g, C(r * 0.28, r * 0.28, 0.5, 8), MG('#3a444c'), 0, r, 0, 0, 0, Math.PI / 2);
  const grp = new THREE.Group(); grp.add(g);
  applyPropAsset(g,'cog',{theme,scale:[r,r,r]});
  return {
    object: g, kind: 'cog', destructible: false, blocksMove: true, blocksBullet: true,
    collider: { hw: r * 0.6, hd: 0.3, y: r, h: r * 1.2 },
    update(dt) { g.rotation.y += dt * 0.35; },
  };
}
