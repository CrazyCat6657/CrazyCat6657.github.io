// ============================================================
//  武器 3D 模型 —— 每把武器独立建模，指向 +Z 方向
// ============================================================
import * as THREE from '../../vendor/three.module.js';
import { getMaterial } from './materials.js';
import { buildWeaponAssetModel } from './weapon_assets_models.js';

const gunCache = new Map();

function mat(color, opts = {}) {
  return getMaterial(color, { flat: true, roughness: opts.rough ?? 0.5, metalness: opts.metal ?? 0.72, ...opts });
}
function glow(color, i = 3) {
  return getMaterial('#101010', { emissive: color, emissiveIntensity: i, flat: true, roughness: 1, metalness: 0 });
}
function bx(parent, c, x, y, z, w, h, d, rx = 0, ry = 0, rz = 0, m = null) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m || mat(c));
  mesh.position.set(x, y, z); mesh.rotation.set(rx, ry, rz);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}
function cy(parent, c, x, y, z, r1, r2, h, seg = 8, rx = 0, ry = 0, rz = 0, m = null) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), m || mat(c));
  mesh.position.set(x, y, z); mesh.rotation.set(rx, ry, rz);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}
function co(parent, c, x, y, z, r, h, seg = 6, rx = 0, ry = 0, rz = 0, m = null) {
  const mesh = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), m || mat(c));
  mesh.position.set(x, y, z); mesh.rotation.set(rx, ry, rz);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

export function buildGunModel(id) {
  if(id?.startsWith('asset:'))return buildWeaponAssetModel(id.slice(6));
  let base = gunCache.get(id);
  if (!base) { base = _build(id); gunCache.set(id, base); }
  const c = base.clone(true);
  // Object3D.clone 会把 userData 序列化成纯对象，这里按名字重新绑定引用
  c.userData = {};
  base.traverse((o) => { if (o.name) c.userData[o.name] = c.getObjectByName(o.name) || null; });
  c.userData.muzzle = c.getObjectByName('muzzle') || null;
  return c;
}

function finish(g, muzzleZ, opts = {}) {
  const mz = new THREE.Object3D();
  mz.name = 'muzzle';
  mz.position.set(0, opts.muzzleY || 0, muzzleZ);
  g.add(mz);
  g.userData.muzzle = mz;
  return g;
}

function _build(id) {
  const g = new THREE.Group();
  const STEEL = '#5a636b', DARK = '#2b3138', BLACK = '#1a1e22', WOOD = '#7a4a24', BRASS = '#c08a3e';
  switch (id) {
    case 'pistol': {
      bx(g, STEEL, 0, 0.05, 0.16, 0.13, 0.15, 0.44);
      bx(g, DARK, 0, 0.05, 0.40, 0.10, 0.10, 0.14);
      bx(g, BLACK, 0, -0.11, 0.06, 0.11, 0.28, 0.15, 0.28);
      bx(g, DARK, 0, 0.14, 0.14, 0.09, 0.05, 0.30);
      bx(g, glow('#67e8ff', 2.4), 0, 0.18, 0.20, 0.04, 0.025, 0.10);
      cy(g, DARK, 0, 0.05, 0.46, 0.035, 0.035, 0.06, 6, Math.PI / 2, 0, 0);
      return finish(g, 0.52, { muzzleY: 0.05 });
    }
    case 'smg': {
      bx(g, STEEL, 0, 0.06, 0.20, 0.15, 0.19, 0.50);
      bx(g, DARK, 0, 0.06, 0.50, 0.11, 0.11, 0.22);
      bx(g, BLACK, 0, -0.13, 0.04, 0.12, 0.30, 0.16, 0.24);
      bx(g, DARK, 0, -0.10, 0.26, 0.10, 0.34, 0.14, -0.12);
      bx(g, BLACK, 0, 0.19, 0.10, 0.07, 0.06, 0.44);
      cy(g, DARK, 0, 0.06, 0.62, 0.04, 0.04, 0.10, 6, Math.PI / 2, 0, 0);
      bx(g, glow('#67e8ff', 2), 0, 0.20, 0.24, 0.05, 0.03, 0.14);
      return finish(g, 0.66, { muzzleY: 0.06 });
    }
    case 'shotgun': {
      cy(g, STEEL, 0.055, 0.07, 0.34, 0.065, 0.065, 0.80, 8, Math.PI / 2, 0, 0);
      cy(g, STEEL, -0.055, 0.07, 0.34, 0.065, 0.065, 0.80, 8, Math.PI / 2, 0, 0);
      bx(g, DARK, 0, 0.07, 0.00, 0.24, 0.22, 0.30);
      bx(g, WOOD, 0, -0.10, -0.20, 0.14, 0.24, 0.42);
      bx(g, WOOD, 0, 0.10, 0.26, 0.20, 0.14, 0.22);
      bx(g, BLACK, 0, -0.14, 0.30, 0.20, 0.12, 0.24);
      cy(g, BRASS, 0, 0.07, 0.74, 0.045, 0.045, 0.08, 6, Math.PI / 2, 0, 0);
      return finish(g, 0.80, { muzzleY: 0.07 });
    }
    case 'rifle': {
      bx(g, STEEL, 0, 0.06, 0.22, 0.14, 0.18, 0.60);
      cy(g, DARK, 0, 0.06, 0.60, 0.045, 0.045, 0.44, 8, Math.PI / 2, 0, 0);
      bx(g, DARK, 0, 0.06, 0.82, 0.09, 0.09, 0.16);
      bx(g, BLACK, 0, -0.14, 0.06, 0.11, 0.30, 0.16, 0.24);
      bx(g, DARK, 0, -0.12, 0.28, 0.11, 0.36, 0.14, -0.14);
      bx(g, BLACK, 0, -0.10, -0.22, 0.09, 0.26, 0.14, -0.2);
      bx(g, BLACK, 0, 0.20, 0.20, 0.06, 0.06, 0.50);
      cy(g, glow('#67e8ff', 1.6), 0, 0.24, 0.34, 0.035, 0.035, 0.12, 6, Math.PI / 2, 0, 0);
      return finish(g, 0.92, { muzzleY: 0.06 });
    }
    case 'sniper': {
      cy(g, STEEL, 0, 0.06, 0.62, 0.045, 0.045, 1.20, 8, Math.PI / 2, 0, 0);
      bx(g, DARK, 0, 0.06, 0.16, 0.15, 0.18, 0.42);
      bx(g, DARK, 0, 0.04, 1.20, 0.11, 0.11, 0.22);
      cy(g, STEEL, 0, 0.06, 1.30, 0.07, 0.07, 0.10, 6, Math.PI / 2, 0, 0);
      bx(g, BLACK, 0, -0.14, 0.02, 0.11, 0.30, 0.16, 0.24);
      bx(g, WOOD, 0, -0.10, -0.26, 0.13, 0.22, 0.44);
      cy(g, BLACK, 0, 0.26, 0.28, 0.065, 0.065, 0.44, 8, Math.PI / 2, 0, 0);
      cy(g, glow('#ff5a3a', 2.2), 0, 0.26, 0.51, 0.05, 0.05, 0.05, 8, Math.PI / 2, 0, 0);
      bx(g, DARK, 0, 0.30, 0.10, 0.05, 0.10, 0.05);
      for (const s of [-1, 1]) cy(g, DARK, s * 0.10, -0.10, 0.92, 0.02, 0.02, 0.36, 5, 0.4, 0, s * 0.3);
      return finish(g, 1.38, { muzzleY: 0.06 });
    }
    case 'rocket': {
      cy(g, DARK, 0, 0.06, 0.30, 0.14, 0.14, 1.10, 8, Math.PI / 2, 0, 0);
      cy(g, STEEL, 0, 0.06, 0.86, 0.17, 0.17, 0.14, 8, Math.PI / 2, 0, 0);
      cy(g, STEEL, 0, 0.06, -0.26, 0.17, 0.17, 0.14, 8, Math.PI / 2, 0, 0);
      bx(g, BLACK, 0, -0.18, 0.06, 0.11, 0.30, 0.16, 0.24);
      bx(g, DARK, 0, 0.24, 0.18, 0.06, 0.06, 0.60);
      // 装填的火箭弹头
      co(g, glow('#ff7a2a', 2.6), 0, 0.06, 1.00, 0.11, 0.26, 6, Math.PI / 2, 0, 0);
      cy(g, '#8a3a1a', 0, 0.06, 0.84, 0.11, 0.11, 0.20, 8, Math.PI / 2, 0, 0);
      return finish(g, 1.16, { muzzleY: 0.06 });
    }
    case 'grenade': {
      cy(g, DARK, 0, 0.06, 0.14, 0.15, 0.15, 0.44, 8, Math.PI / 2, 0, 0);
      cy(g, STEEL, 0, -0.03, -0.02, 0.19, 0.19, 0.20, 8, Math.PI / 2, 0, 0);   // 弹鼓
      cy(g, '#3f4a52', 0, -0.03, 0.08, 0.19, 0.19, 0.04, 8, Math.PI / 2, 0, 0);
      bx(g, BLACK, 0, -0.22, -0.06, 0.11, 0.30, 0.16, 0.24);
      cy(g, DARK, 0, 0.06, 0.42, 0.09, 0.09, 0.42, 8, Math.PI / 2, 0, 0);
      cy(g, glow('#9dff5a', 1.8), 0, 0.16, 0.30, 0.03, 0.03, 0.05, 6, Math.PI / 2, 0, 0);
      return finish(g, 0.66, { muzzleY: 0.06 });
    }
    case 'minigun': {
      bx(g, DARK, 0, 0.06, 0.06, 0.22, 0.24, 0.40);
      cy(g, STEEL, 0, -0.16, 0.00, 0.20, 0.20, 0.26, 10, Math.PI / 2, 0, 0); // 弹链鼓
      const barrelGrp = new THREE.Group();
      barrelGrp.position.set(0, 0.06, 0.30);
      g.add(barrelGrp);
      cy(barrelGrp, DARK, 0, 0, 0.14, 0.10, 0.10, 0.30, 8, Math.PI / 2, 0, 0);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        cy(barrelGrp, STEEL, Math.cos(a) * 0.085, Math.sin(a) * 0.085, 0.40, 0.028, 0.028, 0.80, 6, Math.PI / 2, 0, 0);
      }
      cy(barrelGrp, STEEL, 0, 0, 0.76, 0.13, 0.13, 0.08, 8, Math.PI / 2, 0, 0);
      bx(g, BLACK, 0, -0.20, -0.12, 0.11, 0.30, 0.16, 0.24);
      bx(g, DARK, 0, 0.24, -0.10, 0.06, 0.06, 0.30);
      barrelGrp.name = 'spin';
      g.userData.spin = barrelGrp;
      return finish(g, 0.86, { muzzleY: 0.06 });
    }
    case 'laser': {
      bx(g, '#2e4a58', 0, 0.06, 0.20, 0.15, 0.20, 0.62);
      bx(g, DARK, 0, 0.06, 0.56, 0.10, 0.10, 0.22);
      cy(g, glow('#3ad2ff', 3), 0, 0.06, 0.68, 0.06, 0.06, 0.08, 8, Math.PI / 2, 0, 0);
      bx(g, BLACK, 0, -0.14, 0.04, 0.11, 0.30, 0.16, 0.24);
      cy(g, '#4a7a8a', 0, 0.10, -0.02, 0.09, 0.09, 0.24, 8, Math.PI / 2, 0, 0);
      bx(g, glow('#3ad2ff', 2.4), 0, 0.20, 0.20, 0.06, 0.05, 0.36);
      for (let i = 0; i < 3; i++) cy(g, glow('#9df0ff', 2), 0, 0.06, 0.34 + i * 0.10, 0.085, 0.085, 0.025, 8, Math.PI / 2, 0, 0);
      return finish(g, 0.74, { muzzleY: 0.06 });
    }
    case 'plasma': {
      bx(g, '#3a2a52', 0, 0.06, 0.18, 0.16, 0.20, 0.54);
      for (let i = 0; i < 3; i++) {
        const t = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.035, 5, 10), glow('#c07af0', 2.6));
        t.position.set(0, 0.06, 0.34 + i * 0.14); t.rotation.y = Math.PI / 2; t.rotation.x = Math.PI / 2;
        g.add(t);
      }
      cy(g, '#4a3568', 0, 0.06, 0.52, 0.07, 0.07, 0.22, 8, Math.PI / 2, 0, 0);
      bx(g, BLACK, 0, -0.14, 0.02, 0.11, 0.30, 0.16, 0.24);
      const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.09, 0), glow('#e0b0ff', 3.2));
      core.position.set(0, 0.06, 0.64); g.add(core);
      return finish(g, 0.70, { muzzleY: 0.06 });
    }
    case 'flame': {
      cy(g, '#4a3a2a', 0, 0.04, -0.14, 0.16, 0.16, 0.44, 8, Math.PI / 2, 0, 0);  // 燃料罐
      cy(g, '#6a5a3a', 0, 0.04, -0.14, 0.17, 0.17, 0.03, 8, Math.PI / 2, 0, 0);
      cy(g, DARK, 0, 0.06, 0.28, 0.06, 0.06, 0.60, 8, Math.PI / 2, 0, 0);
      bx(g, STEEL, 0, 0.06, 0.52, 0.14, 0.14, 0.27);
      cy(g, STEEL, 0, 0.06, 0.68, 0.10, 0.13, 0.12, 8, Math.PI / 2, 0, 0);
      const pilot = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.16, 6), glow('#ffb03a', 3.4));
      pilot.position.set(0, 0.06, 0.76); pilot.rotation.x = Math.PI / 2; g.add(pilot);
      bx(g, BLACK, 0, -0.14, 0.10, 0.11, 0.30, 0.16, 0.24);
      return finish(g, 0.80, { muzzleY: 0.06 });
    }
    case 'gauss': {
      bx(g, '#2a3a46', 0, 0.06, 0.16, 0.17, 0.19, 0.52);
      for (let i = 0; i < 5; i++) {
        cy(g, STEEL, 0, 0.06, 0.36 + i * 0.15, 0.10, 0.10, 0.05, 8, Math.PI / 2, 0, 0);
        cy(g, glow('#5ad8ff', 2.6), 0, 0.06, 0.36 + i * 0.15, 0.115, 0.115, 0.02, 8, Math.PI / 2, 0, 0);
      }
      cy(g, DARK, 0, 0.06, 0.42, 0.045, 0.045, 0.86, 6, Math.PI / 2, 0, 0);
      bx(g, BLACK, 0, -0.14, 0.00, 0.11, 0.30, 0.16, 0.24);
      bx(g, glow('#5ad8ff', 2), 0, 0.20, 0.16, 0.06, 0.05, 0.30);
      return finish(g, 0.90, { muzzleY: 0.06 });
    }
    case 'orb': {
      cy(g, '#3a2a52', 0, 0.06, 0.10, 0.13, 0.13, 0.40, 8, Math.PI / 2, 0, 0);
      bx(g, BLACK, 0, -0.14, 0.00, 0.11, 0.30, 0.16, 0.24);
      const cage = new THREE.Group(); g.add(cage);
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        cy(cage, BRASS, Math.cos(a) * 0.16, 0.06 + Math.sin(a) * 0.16, 0.40, 0.025, 0.025, 0.44, 5, Math.PI / 2, 0, 0);
      }
      const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.14, 0), glow('#7affd2', 3.4));
      core.position.set(0, 0.06, 0.44); g.add(core);
      core.name = 'core';
      g.userData.core = core;
      return finish(g, 0.62, { muzzleY: 0.06 });
    }
    case 'charge': {
      cy(g, DARK, 0, 0.06, 0.24, 0.20, 0.20, 0.70, 10, Math.PI / 2, 0, 0);
      cy(g, STEEL, 0, 0.06, 0.62, 0.22, 0.22, 0.10, 10, Math.PI / 2, 0, 0);
      for (let i = 0; i < 3; i++) {
        const t = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.05, 5, 12), mat(BRASS));
        t.position.set(0, 0.06, 0.02 + i * 0.22); t.rotation.x = Math.PI / 2;
        g.add(t);
        const r = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.02, 4, 12), glow('#ff8a3c', 2.6));
        r.position.set(0, 0.06, 0.02 + i * 0.22); r.rotation.x = Math.PI / 2;
        g.add(r);
      }
      const c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 1), glow('#ffd06a', 3.6));
      c.position.set(0, 0.06, 0.68); g.add(c);
      c.name = 'core';
      g.userData.core = c;
      bx(g, BLACK, 0, -0.18, 0.02, 0.12, 0.32, 0.18, 0.24);
      return finish(g, 0.76, { muzzleY: 0.06 });
    }
    case 'shuriken': {
      bx(g, '#2b3a44', 0, 0.06, 0.14, 0.15, 0.18, 0.44);
      bx(g, BLACK, 0, -0.13, 0.02, 0.11, 0.28, 0.15, 0.24);
      const sp = new THREE.Group(); sp.position.set(0, 0.06, 0.40); g.add(sp);
      for (let i = 0; i < 3; i++) {
        const b = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.04, 0.10), mat('#b8c4cc'));
        b.position.set(0, 0, 0); b.rotation.set(0, (i / 3) * Math.PI * 2, 0.0);
        b.translateX(0.14);
        sp.add(b);
      }
      const hub = new THREE.Mesh(new THREE.IcosahedronGeometry(0.07, 0), glow('#67e8ff', 2.4));
      sp.add(hub);
      sp.name = 'spin';
      g.userData.spin = sp;
      return finish(g, 0.50, { muzzleY: 0.06 });
    }
    case 'staff': {
      cy(g, WOOD, 0, 0.00, 0.30, 0.045, 0.045, 1.50, 6, Math.PI / 2, 0, 0);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.04, 6, 12), mat(BRASS));
      ring.position.set(0, 0.00, 1.06); g.add(ring);
      const gem = new THREE.Mesh(new THREE.IcosahedronGeometry(0.11, 0), glow('#8a3cff', 3.4));
      gem.position.set(0, 0, 1.06); g.add(gem);
      cy(g, glow('#8a3cff', 2), 0, 0.00, 1.22, 0.05, 0.05, 0.06, 6, Math.PI / 2, 0, 0);
      gem.name = 'core';
      g.userData.core = gem;
      return finish(g, 1.20, { muzzleY: 0 });
    }
    // ---------- 第三层新增武器：轮廓刻意与既有武器区分 ----------
    case 'storm_battery': {
      // 宽扁电容箱 + 四根向上放电针 + 前端双叉电极（明显的"竖刺"轮廓）
      bx(g, '#2c3a4e', 0, 0.06, 0.20, 0.30, 0.22, 0.56);
      bx(g, DARK, 0, 0.06, 0.08, 0.34, 0.10, 0.18);
      bx(g, BLACK, 0, -0.15, 0.02, 0.12, 0.30, 0.17, 0.26);
      for (let i = 0; i < 4; i++) {
        const x = -0.10 + i * 0.068;
        cy(g, STEEL, x, 0.26, 0.16, 0.022, 0.022, 0.24, 5);
        cy(g, glow('#7cf6ff', 2.6), x, 0.38, 0.16, 0.030, 0.030, 0.035, 5);
      }
      for (let i = 0; i < 3; i++) cy(g, glow('#5ad8ff', 2.2), 0, 0.06, 0.08 + i * 0.14, 0.155, 0.155, 0.018, 8, Math.PI / 2, 0, 0);
      for (const sg of [-1, 1]) {
        cy(g, STEEL, sg * 0.09, 0.06, 0.60, 0.038, 0.038, 0.46, 6, Math.PI / 2, 0, 0);
        cy(g, glow('#9ff6ff', 3), sg * 0.09, 0.06, 0.83, 0.055, 0.055, 0.05, 6, Math.PI / 2, 0, 0);
      }
      co(g, glow('#e8fbff', 3.4), 0, 0.06, 0.80, 0.05, 0.20, 5, Math.PI / 2, 0, 0);
      return finish(g, 0.90, { muzzleY: 0.06 });
    }
    case 'pyroclast': {
      // 上下双联粗炮口 + 背部熔炉罐（区别于左右并列的霰弹枪）
      bx(g, '#3a2a22', 0, 0.06, 0.22, 0.26, 0.26, 0.50);
      cy(g, '#5a3a26', 0, 0.06, -0.16, 0.17, 0.17, 0.34, 8, Math.PI / 2, 0, 0);
      cy(g, glow('#ff7a2a', 2.8), 0, 0.06, -0.33, 0.13, 0.13, 0.03, 8, Math.PI / 2, 0, 0);
      cy(g, DARK, 0, 0.20, 0.46, 0.115, 0.115, 0.72, 8, Math.PI / 2, 0, 0);
      cy(g, DARK, 0, -0.10, 0.46, 0.095, 0.095, 0.72, 8, Math.PI / 2, 0, 0);
      for (const y of [0.20, -0.10]) {
        cy(g, STEEL, 0, y, 0.78, 0.135, 0.135, 0.09, 8, Math.PI / 2, 0, 0);
        cy(g, glow('#ffb03a', 3), 0, y, 0.83, 0.085, 0.085, 0.04, 8, Math.PI / 2, 0, 0);
      }
      bx(g, BLACK, 0, -0.20, 0.06, 0.12, 0.30, 0.18, 0.26);
      bx(g, '#7a4a24', 0, 0.06, 0.10, 0.20, 0.10, 0.24);
      cy(g, glow('#ff5a10', 2.2), 0, 0.26, 0.30, 0.032, 0.032, 0.22, 5, 0, 0, 0);
      return finish(g, 0.88, { muzzleY: 0.06 });
    }
    case 'void_ripper': {
      // 细长骨链枪身 + 环绕悬浮菱形晶体（旋转部件），前端开口呈"撕裂"状
      bx(g, '#241a34', 0, 0.06, 0.14, 0.11, 0.14, 0.46);
      bx(g, BLACK, 0, -0.13, 0.00, 0.10, 0.28, 0.15, 0.26);
      cy(g, '#3a2a52', 0, 0.06, 0.46, 0.05, 0.05, 0.40, 6, Math.PI / 2, 0, 0);
      const ring = new THREE.Group(); ring.position.set(0, 0.06, 0.46); g.add(ring);
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2;
        const sh = new THREE.Mesh(new THREE.OctahedronGeometry(0.075, 0), glow('#c07af0', 3.2));
        sh.position.set(Math.cos(a) * 0.20, Math.sin(a) * 0.20, 0); sh.rotation.set(a, a * 0.5, 0);
        ring.add(sh);
      }
      const tR = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.018, 5, 12), mat('#8a6ad0'));
      tR.position.set(0, 0.06, 0.46); ring.add(tR);
      ring.name = 'spin';
      g.userData.spin = ring;
      for (const sg of [-1, 1]) {
        co(g, '#d8c0ff', sg * 0.085, 0.06, 0.70, 0.045, 0.24, 4, Math.PI / 2, 0, sg * 0.28);
      }
      const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.085, 0), glow('#e8d8ff', 3.6));
      core.position.set(0, 0.06, 0.66); g.add(core);
      core.name = 'core';
      g.userData.core = core;
      return finish(g, 0.80, { muzzleY: 0.06 });
    }
    case 'aegis_lance': {
      // 长矛 + 盾形护手 + 贯穿光刃
      cy(g, '#26343c', 0, 0.06, 0.30, 0.06, 0.06, 1.32, 8, Math.PI / 2, 0, 0);
      bx(g, STEEL, 0, 0.06, 0.10, 0.16, 0.20, 0.26);
      bx(g, BLACK, 0, -0.14, 0.00, 0.10, 0.28, 0.15, 0.26);
      // 盾形护手
      const guard = new THREE.Group(); guard.position.set(0, 0.06, 0.30); g.add(guard);
      for (const sg of [-1, 1]) {
        const fin = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.30, 0.16), mat(BRASS));
        fin.position.set(sg * 0.14, 0, 0); fin.rotation.z = sg * 0.22;
        fin.castShadow = true; guard.add(fin);
      }
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.035, 6), mat('#2e4a58'));
      plate.position.set(0, 0.06, 0.22); plate.rotation.x = Math.PI / 2; g.add(plate);
      // 光刃
      cy(g, STEEL, 0, 0.06, 0.86, 0.055, 0.055, 0.34, 6, Math.PI / 2, 0, 0);
      cy(g, glow('#5ad8ff', 3), 0, 0.06, 1.16, 0.085, 0.085, 0.26, 6, Math.PI / 2, 0, 0);
      co(g, glow('#d8f6ff', 4), 0, 0.06, 1.36, 0.085, 0.30, 5, Math.PI / 2, 0, 0);
      for (let i = 0; i < 4; i++) cy(g, glow('#9df0ff', 2.2), 0, 0.06, 0.94 + i * 0.12, 0.075, 0.075, 0.02, 6, Math.PI / 2, 0, 0);
      return finish(g, 1.46, { muzzleY: 0.06 });
    }
    default: {
      bx(g, STEEL, 0, 0.05, 0.16, 0.13, 0.15, 0.44);
      bx(g, BLACK, 0, -0.11, 0.06, 0.11, 0.28, 0.15, 0.28);
      return finish(g, 0.52, { muzzleY: 0.05 });
    }
  }
}
