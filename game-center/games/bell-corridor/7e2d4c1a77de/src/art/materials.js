// ============================================================
//  程序化像素贴图 + 材质库
//  全部纹理由 Canvas 逐像素绘制，无外部素材；色板经过量化以贴合 NDS 质感
// ============================================================
import * as THREE from '../../vendor/three.module.js';
import { RNG } from '../core/rng.js';
import { gamePlatform } from '../runtime/game_platform.js';

// 贴图变化种子。
// 关键：**不能**用"每个房间各自的 RNG 种子"作为贴图缓存键 ——
// 那样每个房间都会 cache miss，重新逐像素绘制 + 重新上传 GPU 贴图，
// 直接造成"换房明显卡顿"。这里改为每局一个固定种子，
// 于是同一层所有房间共享同一套贴图，缓存命中率 100%，同时保留跨局的变化。
let TEX_SEED = 0x5eed1234;

export function setTextureSeed(seed) {
  const v = (seed >>> 0) || 0x5eed1234;
  if (v === TEX_SEED) return;
  TEX_SEED = v;
  // 旧贴图/平铺贴图与旧种子绑定，直接丢弃（材质键包含 map.uuid，会自动跟着换新）
  CACHE.tex.clear();
  CACHE.tile.clear();
}

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// ---------------- 色板 ----------------
export const PAL = {
  keep: {
    floor: ['#42545f', '#4c5f6a', '#566974', '#3c4d58', '#5f7278', '#36454f'],
    wall: ['#50646f', '#5d737c', '#465a64', '#6c8489', '#3f5058', '#7d9494'],
    accent: ['#5fe0ff', '#2ea8c9', '#a8f2ff', '#1c6c86'],
    wood: ['#8f6a44', '#a4784a', '#6f4c2e', '#bd9060'],
    moss: ['#5b8f5f', '#6fa972', '#457648'],
  },
  abyss: {
    floor: ['#553524', '#63402a', '#734c31', '#462a1c', '#855a36', '#3a2114'],
    wall: ['#5a3a2a', '#6b4832', '#4a2e20', '#836046', '#38241c', '#94714f'],
    accent: ['#ff8a3c', '#ffc861', '#ff5522', '#a83308'],
    wood: ['#6d4022', '#835230', '#4e2f16', '#986038'],
    moss: ['#7a3a1c', '#9c4a1a', '#5a2812'],
  },
  // 第三层：熔心王座 —— 黑曜石 + 青铜 + 暗金（PASS3 §4 修订）
  //
  // 旧值的地板/墙体都是暖棕（#3d2a20 / #453026），与第二层的熔渣棕几乎同族，
  // 加上同色系环境光 ⇒ 两层看起来是同一层。现在地板改**冷灰黑曜石**，
  // 墙体改**冷石 + 青铜边**，只在高光处保留金铜色：
  // 对比关系从"整体暖"变成"冷底 + 金高光"，与第二层形成结构差异而不是明度差异。
  // 注意：这里的"冷"必须是**真的偏冷**（蓝分量 > 红分量）。
  // 第一版写成暖灰（#3a3630 之类 R>B）看似"去掉了棕色"，但在第三层
  // 的金色灯光（sun 0xf0d8a8 + torch 0xd8a03c）下会被整体染成棕 ——
  // 实测截图确认墙带仍然发红褐。黑曜石要把色相真正推到蓝紫一侧。
  // 亮度修订（有量化依据）：改前三层战场区平均灰度 F1 59 / F2 38.4 / **F3 18.8**，
  // 第三层只有第二层的 49%。而且**改前就已经是 21.7**（本来就比第二层暗 43%）——
  // 也就是说"第三层偏暗"是既有问题，我上一轮把环境光转冷时又顺手压低了 13%。
  // 对照 F2 改前/改后（38.0 → 38.4，几乎不变）可以确认：差距不是截图偏暗造成的。
  // 现在保留冷色相，只把明度提上来（目标：战场区 ≈ 30–34，约为第二层的 80–88%）。
  throne: {
    floor: ['#363643', '#404054', '#4c4c62', '#2c2c38', '#5a5a72', '#25252e'],
    wall: ['#454158', '#524d66', '#373342', '#635e74', '#2d2a38', '#7a7488'],
    accent: ['#d8a03c', '#f0c86a', '#a87a1e', '#8a5a10'],
    wood: ['#4a3c28', '#5a4a32', '#33281a', '#6a5a3c'],
    // "苔藓"槽位在第三层读作**氧化铜锈**（王庭金属的年头），而不是植物绿
    moss: ['#3a6a68', '#4a8a86', '#2a4a48'],
  },
};

// 导出仅供**只读**性能统计（PASS3 §54：几何/材质/贴图缓存规模）。
// 任何外部代码都不得写入这个缓存 —— 写入会让"缓存键空间无界"的老问题复发。
export const CACHE = { tex: new Map(), mat: new Map(), tile: new Map(), geo: new Map() };

export function palFor(floor) { return floor === 2 ? PAL.abyss : floor === 3 ? PAL.throne : PAL.keep; }

// ---------------- 像素画布工具 ----------------
class Pix {
  constructor(w, h) {
    this.w = w; this.h = h;
    this.canvas = document.createElement('canvas');
    this.canvas.width = w; this.canvas.height = h;
    this.g = this.canvas.getContext('2d', { willReadFrequently: true });
    this.g.imageSmoothingEnabled = false;
  }
  fill(c) { this.g.fillStyle = c; this.g.fillRect(0, 0, this.w, this.h); }
  rect(x, y, w, h, c) { this.g.fillStyle = c; this.g.fillRect(x | 0, y | 0, w | 0, h | 0); }
  dot(x, y, c) { this.g.fillStyle = c; this.g.fillRect(x | 0, y | 0, 1, 1); }
  line(x0, y0, x1, y1, c, t = 1) {
    x0 |= 0; y0 |= 0; x1 |= 0; y1 |= 0;
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (let i = 0; i < 4096; i++) {
      this.rect(x0, y0, t, t, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }
  circle(cx, cy, r, c, filled = true) {
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
      const d = Math.hypot(x, y);
      if (filled ? d <= r : Math.abs(d - r) < 0.8) this.dot(cx + x, cy + y, c);
    }
  }
  noise(rng, colors, amount = 0.5, alphaMin = 0.08) {
    const img = this.g.getImageData(0, 0, this.w, this.h);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      if (rng.next() < amount) {
        const c = colors[Math.floor(rng.next() * colors.length)];
        const rgb = hexToRgb(c);
        const a = alphaMin + rng.next() * (1 - alphaMin);
        d[i] = d[i] * (1 - a) + rgb[0] * a;
        d[i + 1] = d[i + 1] * (1 - a) + rgb[1] * a;
        d[i + 2] = d[i + 2] * (1 - a) + rgb[2] * a;
      }
    }
    this.g.putImageData(img, 0, 0);
  }
  speckle(rng, colors, count) {
    for (let i = 0; i < count; i++) {
      this.dot(rng.int(0, this.w - 1), rng.int(0, this.h - 1), colors[rng.int(0, colors.length - 1)]);
    }
  }
  toTexture(repeat = 1, isData = false, srgb = true) {
    const t = new THREE.CanvasTexture(this.canvas);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestMipmapNearestFilter;
    t.generateMipmaps = true;
    t.repeat.set(repeat, repeat);
    t.anisotropy = 1;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  }
}

export function hexToRgb(h) {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function shade(hex, f) {
  const [r, g, b] = hexToRgb(hex);
  const cl = (v) => Math.max(0, Math.min(255, Math.round(v * f)));
  return `rgb(${cl(r)},${cl(g)},${cl(b)})`;
}

// ---------------- 贴图生成 ----------------
function texKey(name, seed) { return name + '|' + seed; }

export function getTexture(name, rng, opts = {}) {
  const variant = (opts.variant || 0) | 0;
  const key = texKey(name, TEX_SEED ^ variant * 7771);
  if (CACHE.tex.has(key)) return CACHE.tex.get(key);
  // 用「会话种子 + 贴图名」派生确定性 RNG，保证同名贴图永远一致
  const rr = new RNG((TEX_SEED ^ hashStr(name) ^ (variant * 2654435761)) >>> 0);
  let t;
  if (gamePlatform().kind === 'headless') {
    t = new THREE.DataTexture(new Uint8Array([255,255,255,255]),1,1,THREE.RGBAFormat);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestMipmapNearestFilter;
    t.colorSpace = THREE.SRGBColorSpace;
    t.name = name;
    t.needsUpdate = true;
  } else t = buildTexture(name, rr, opts);
  CACHE.tex.set(key, t);
  return t;
}

function buildTexture(name, rng, opts) {
  switch (name) {
    case 'floor_stone': return floorStone(rng, PAL.keep);
    case 'floor_moss': return floorMoss(rng, PAL.keep);
    case 'floor_basalt': return floorBasalt(rng);
    case 'floor_obsidian': return floorObsidian(rng);
    case 'floor_ritual': return floorRitual(rng);
    case 'floor_metal': return floorMetal(rng, PAL.keep);
    case 'floor_throne': return floorThrone(rng);
    case 'wall_brick': return wallBrick(rng, PAL.keep);
    case 'wall_carved': return wallCarved(rng, PAL.keep);
    case 'wall_abyss': return wallBrick(rng, PAL.abyss);
    case 'wall_abyss_carved': return wallCarved(rng, PAL.abyss);
    case 'wall_throne': return wallBrick(rng, PAL.throne);
    case 'wall_throne_carved': return wallCarved(rng, PAL.throne);
    case 'wood': return woodTex(rng, PAL.keep.wood);
    case 'wood_abyss': return woodTex(rng, PAL.abyss.wood);
    case 'metal_plate': return metalPlate(rng, opts.color || PAL.keep.accent);
    case 'stone_generic': return stoneTex(rng, PAL.keep.wall);
    case 'stone_abyss': return stoneTex(rng, PAL.abyss.wall);
    case 'cloth': return clothTex(rng, opts.color || '#7a2130');
    case 'banner': return bannerTex(rng);
    case 'banner_abyss': return bannerTexAbyss(rng);
    case 'banner_throne': return bannerTexThrone(rng);
    case 'crystal': return crystalTex(rng);
    default: return floorStone(rng, PAL.keep);
  }
}

function floorStone(rng, p) {
  const px = new Pix(32, 32);
  px.fill(p.floor[0]);
  // 16x16 石砖
  for (let ty = 0; ty < 2; ty++) for (let tx = 0; tx < 2; tx++) {
    const off = ty % 2 === 1 ? 8 : 0;
    const x = tx * 16 + off * 0;
    const y = ty * 16;
    px.rect(x + 1, y + 1, 14, 14, p.floor[rng.int(1, 2)]);
    px.rect(x + 1, y + 1, 14, 1, p.floor[4]);
    px.rect(x + 1, y + 1, 1, 14, p.floor[4]);
    px.rect(x + 1, y + 14, 14, 1, p.floor[3]);
    px.rect(x + 14, y + 1, 1, 14, p.floor[3]);
    // 砖面细节
    for (let i = 0; i < 5; i++) px.dot(x + rng.int(2, 13), y + rng.int(2, 13), p.floor[rng.int(3, 4)]);
  }
  px.noise(rng, p.floor, 0.30, 0.10);
  px.speckle(rng, p.floor, 26);
  return px.toTexture(1);
}

function floorMoss(rng, p) {
  const px = new Pix(32, 32);
  px.fill(p.floor[0]);
  for (let ty = 0; ty < 2; ty++) for (let tx = 0; tx < 2; tx++) {
    const x = tx * 16, y = ty * 16;
    px.rect(x + 1, y + 1, 14, 14, p.floor[rng.int(1, 2)]);
    px.rect(x + 1, y + 1, 14, 1, p.floor[4]);
    px.rect(x + 1, y + 14, 14, 1, p.floor[3]);
    px.rect(x + 14, y + 1, 1, 14, p.floor[3]);
  }
  const g = px.g;
  for (let i = 0; i < 5; i++) {
    const cx = rng.int(2, 29), cy = rng.int(2, 29), r = rng.int(2, 5);
    g.fillStyle = p.moss[rng.int(0, 2)];
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
      if (Math.hypot(x, y) <= r && rng.chance(0.8)) g.fillRect(cx + x, cy + y, 1, 1);
    }
  }
  px.noise(rng, p.floor, 0.28, 0.10);
  px.speckle(rng, p.moss, 22);
  return px.toTexture(1);
}

function floorBasalt(rng) {
  const p = PAL.abyss;
  const px = new Pix(32, 32);
  px.fill(p.floor[0]);
  for (let i = 0; i < 9; i++) {
    const x = rng.int(0, 31), y = rng.int(0, 31);
    px.circle(x, y, rng.int(2, 5), p.floor[rng.int(1, 3)]);
  }
  // 熔岩裂缝
  for (let i = 0; i < 3; i++) {
    let x = rng.int(0, 31), y = rng.int(0, 31);
    for (let s = 0; s < 14; s++) {
      px.dot(x, y, p.accent[1]);
      px.dot(x, y + 1, p.accent[3]);
      x += rng.int(-1, 1); y += rng.int(-1, 1);
      x = (x + 32) % 32; y = (y + 32) % 32;
    }
  }
  px.noise(rng, p.floor, 0.42, 0.10);
  return px.toTexture(1);
}

// 黑曜石地板（第三层专属，40% 的房间用它）
// **旧实现硬编码暖棕（#3a231b/#4e3126/#5c3a2b）并且引用 PAL.abyss** ——
// 名字叫 obsidian（黑曜石）却画成了熔渣棕。这是"第三层看起来像第二层"的主要来源之一：
// 即使墙、灯、道具都换成冷石青铜，四成房间的地面本身还是暖棕。
// 现在改成真正的黑曜石：冷灰紫底 + 裂纹高光，与第二层的熔渣棕彻底分开。
function floorObsidian(rng) {
  const px = new Pix(32, 32);
  px.fill('#20202a');
  for (let i = 0; i < 20; i++) {
    const x = rng.int(0, 31), y = rng.int(0, 31), l = rng.int(3, 9);
    const ang = rng.float(0, Math.PI);
    px.line(x, y, x + Math.cos(ang) * l, y + Math.sin(ang) * l, rng.chance(0.5) ? '#2e2e3a' : '#2a2a34', 1);
  }
  for (let i = 0; i < 6; i++) px.circle(rng.int(0, 31), rng.int(0, 31), rng.int(1, 3), '#3a3a48');
  px.noise(rng, ['#1a1a22', '#2a2a34', '#34343f'], 0.35, 0.12);
  return px.toTexture(1);
}

// 仪式地板（第三层 Boss 房）：**几何保留、颜色改成王庭青铜**
// 旧值与 floorObsidian 同一个毛病：硬编码熔渣棕 + 引用 PAL.abyss。
// 符文环 / 放射线是"仪式"的形状语言（ART_BIBLE §11 要求保留），
// 只把载体从"熔岩岩床"换成"冷石 + 青铜嵌线"。
function floorRitual(rng) {
  const p = PAL.throne;
  const px = new Pix(64, 64);
  px.fill('#242429');
  for (let i = 0; i < 24; i++) px.circle(rng.int(0, 63), rng.int(0, 63), rng.int(2, 6), '#2e2e36');
  // 符文环 —— **必须是"刻痕"而不是"发光"**。
  // 实测截图：这一层 64×64 的贴图会铺满整个 Boss 房，若用 accent[0]/[1]（亮金），
  // 全场会变成一面金色花纹墙，与 Boss 本体和弹幕抢注意力（违反 §31：
  // 氛围层必须明显弱于玩法层）。所以刻纹只用**暗铜**，只有中央徽记保留一点金。
  // 第二版仍不够：暗铜（#a87a1e）饱和度偏高，在第三层的金色强光
  // （sun 0xf0d8a8 ×1.38 + torch 0xd8a03c ×6.0）叠加 bloom 之后**依旧泛成亮金**。
  // 结论：大面材料不能靠"用暗一点的品牌色"，必须把**对比度本身**压到接近零 ——
  // 刻痕只比底色亮一档，读作"隐约的浮雕"而不是"发光纹样"。
  const cx = 32, cy = 32;
  for (let r = 8; r <= 30; r += 11) px.circle(cx, cy, r, '#33333d', false);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    px.line(cx + Math.cos(a) * 8, cy + Math.sin(a) * 8, cx + Math.cos(a) * 30, cy + Math.sin(a) * 30, '#3c3c47', 1);
  }
  // 中央徽记保留一点点青铜（唯一的焦点），范围小、不参与重复
  px.circle(cx, cy, 5, '#4a4230', false);
  px.circle(cx, cy, 3, '#6a5836');
  px.noise(rng, ['#1e1e24', '#2e2e36'], 0.28, 0.10);
  return px.toTexture(1);
}

function floorMetal(rng, p) {
  const px = new Pix(32, 32);
  px.fill('#4c5f6b');
  for (let y = 0; y < 32; y += 16) for (let x = 0; x < 32; x += 16) {
    px.rect(x + 1, y + 1, 14, 14, rng.chance(0.5) ? '#5a7080' : '#485a66');
    px.rect(x + 1, y + 1, 14, 1, '#6f8794');
    px.rect(x + 1, y + 14, 14, 1, '#3a4a54');
    for (let i = 0; i < 4; i++) px.dot(x + rng.int(2, 13), y + rng.int(2, 13), '#63798a');
  }
  px.noise(rng, ['#4c5f6b', '#62808f', '#3d4c56'], 0.3, 0.1);
  return px.toTexture(1);
}

function floorThrone(rng) {
  const p = PAL.throne;
  const px = new Pix(32, 32);
  px.fill(p.floor[0]);
  // 大块黑曜石地砖 + 青铜嵌线
  for (let ty = 0; ty < 2; ty++) for (let tx = 0; tx < 2; tx++) {
    const x = tx * 16, y = ty * 16;
    px.rect(x + 1, y + 1, 14, 14, p.floor[rng.int(1, 2)]);
    px.rect(x + 1, y + 1, 14, 1, '#8a6034');
    px.rect(x + 1, y + 1, 1, 14, '#8a6034');
    px.rect(x + 1, y + 14, 14, 1, p.floor[3]);
    px.rect(x + 14, y + 1, 1, 14, p.floor[3]);
    for (let i = 0; i < 4; i++) px.dot(x + rng.int(2, 13), y + rng.int(2, 13), p.floor[rng.int(4, 5)]);
  }
  // 熔金裂缝
  for (let i = 0; i < 2; i++) {
    let x = rng.int(0, 31), y = rng.int(0, 31);
    for (let s = 0; s < 10; s++) {
      px.dot(x, y, '#d88a2a');
      x = (x + rng.int(-1, 1) + 32) % 32; y = (y + rng.int(-1, 1) + 32) % 32;
    }
  }
  px.noise(rng, p.floor, 0.32, 0.10);
  return px.toTexture(1);
}

function wallBrick(rng, p) {
  const px = new Pix(32, 32);
  px.fill(p.wall[2]);
  const bw = 16, bh = 8;
  for (let row = 0; row < 4; row++) {
    const off = row % 2 ? -8 : 0;
    for (let col = -1; col < 3; col++) {
      const x = col * bw + off, y = row * bh;
      px.rect(x + 1, y + 1, bw - 2, bh - 2, p.wall[rng.int(0, 1)]);
      px.rect(x + 1, y + 1, bw - 2, 1, p.wall[3]);
      px.rect(x + 1, y + bh - 2, bw - 2, 1, p.wall[5]);
      px.rect(x + 1, y + 1, 1, bh - 2, p.wall[5]);
    }
  }
  px.noise(rng, p.wall, 0.34, 0.1);
  px.speckle(rng, p.wall, 30);
  return px.toTexture(1);
}

function wallCarved(rng, p) {
  const px = new Pix(32, 32);
  px.fill(p.wall[2]);
  px.rect(0, 0, 32, 32, p.wall[0]);
  // 勾勒浮雕
  px.rect(3, 3, 26, 26, p.wall[1]);
  px.rect(5, 5, 22, 22, p.wall[2]);
  px.rect(7, 7, 18, 18, p.wall[1]);
  for (let i = 0; i < 8; i++) {
    px.rect(9 + i * 2, 9, 1, 14, p.wall[5]);
  }
  px.rect(3, 3, 26, 1, p.wall[5]);
  px.rect(3, 28, 26, 1, p.wall[3]);
  px.noise(rng, p.wall, 0.28, 0.1);
  return px.toTexture(1);
}

function woodTex(rng, wood) {
  const px = new Pix(32, 32);
  px.fill(wood[0]);
  for (let y = 0; y < 32; y += 8) {
    px.rect(0, y, 32, 1, wood[2]);
    px.rect(0, y + 1, 32, 1, wood[1]);
  }
  for (let i = 0; i < 40; i++) {
    const y = rng.int(0, 31), x = rng.int(0, 26), l = rng.int(2, 6);
    px.rect(x, y, l, 1, rng.chance(0.5) ? wood[3] : wood[2]);
  }
  px.noise(rng, wood, 0.24, 0.1);
  return px.toTexture(1);
}

function metalPlate(rng, accent) {
  const px = new Pix(32, 32);
  px.fill('#3a444c');
  px.rect(2, 2, 28, 28, '#48555e');
  px.rect(4, 4, 24, 24, '#3f4b54');
  for (const [x, y] of [[4, 4], [27, 4], [4, 27], [27, 27]]) px.circle(x, y, 1, '#8fa3ad');
  px.rect(4, 15, 24, 2, '#2c353c');
  px.noise(rng, ['#3a444c', '#4d5b64', '#2a3238'], 0.3, 0.1);
  return px.toTexture(1);
}

function stoneTex(rng, wall) {
  const px = new Pix(32, 32);
  px.fill(wall[0]);
  for (let i = 0; i < 14; i++) {
    const x = rng.int(0, 29), y = rng.int(0, 29), w = rng.int(3, 10), h = rng.int(3, 10);
    px.rect(x, y, w, h, wall[rng.int(0, 2)]);
    px.rect(x, y, w, 1, wall[3]);
  }
  px.noise(rng, wall, 0.4, 0.1);
  return px.toTexture(1);
}

function clothTex(rng, color) {
  const px = new Pix(16, 16);
  px.fill(color);
  for (let i = 0; i < 40; i++) px.dot(rng.int(0, 15), rng.int(0, 15), shade(color, rng.float(0.7, 1.3)));
  return px.toTexture(1);
}

function bannerTex(rng) {
  const px = new Pix(16, 32);
  const a = PAL.keep.accent;
  px.fill('#1f3542');
  px.rect(0, 0, 16, 32, '#25414f');
  px.rect(1, 1, 14, 4, a[1]);
  px.circle(8, 14, 4, a[0]);
  px.circle(8, 14, 2, '#0e2029');
  px.rect(7, 18, 2, 12, a[2]);
  px.rect(0, 30, 16, 2, '#16303c');
  px.noise(rng, ['#25414f', '#1b333f'], 0.25, 0.1);
  return px.toTexture(1);
}

function bannerTexAbyss(rng) {
  const px = new Pix(16, 32);
  const a = PAL.abyss.accent;
  px.fill('#2a1109');
  px.rect(0, 0, 16, 32, '#38170b');
  px.rect(1, 1, 14, 4, a[3]);
  px.circle(8, 14, 4, a[0]);
  px.circle(8, 14, 2, '#1a0805');
  px.rect(7, 18, 2, 12, a[1]);
  px.rect(0, 30, 16, 2, '#1d0b05');
  px.noise(rng, ['#38170b', '#241007'], 0.25, 0.1);
  return px.toTexture(1);
}

// 第三层的王庭旗（PASS3 §4）。
// 旧实现让第三层复用第二层的 `banner_abyss`（暗红布旗），
// 于是即使墙、地、灯都换成冷石青铜，画面上仍挂着一排排**红旗** ——
// 这是实测截图里"墙面残留红棕"的主要来源之一。
// 王庭旗用青铜 + 暗金 + 仪式几何，与"熔炉血旗"区分开。
function bannerTexThrone(rng) {
  const px = new Pix(16, 32);
  const a = PAL.throne.accent;
  px.fill('#1c1c22');
  px.rect(0, 0, 16, 32, '#26262e');
  px.rect(1, 1, 14, 4, a[3]);
  // 钟形拱 + 中央徽记（王庭的仪式几何）
  px.circle(8, 13, 4, a[0]);
  px.circle(8, 13, 2, '#15151a');
  px.rect(7, 17, 2, 13, a[1]);
  px.rect(4, 6, 8, 1, a[2]);
  px.rect(0, 30, 16, 2, '#141418');
  px.noise(rng, ['#26262e', '#1a1a20'], 0.25, 0.1);
  return px.toTexture(1);
}

function crystalTex(rng) {
  const px = new Pix(16, 16);
  px.fill('#1d4a63');
  px.circle(8, 8, 6, '#2f7fa3');
  px.circle(8, 8, 4, '#67d7f0');
  px.circle(7, 7, 2, '#d3f7ff');
  return px.toTexture(1);
}

// ---------------- 材质库 ----------------
export function getMaterial(color, opts = {}) {
  const key = JSON.stringify([color, opts.map?.uuid || opts.mapName || '', opts.emissive || 0, opts.emissiveIntensity || 0,
    opts.roughness ?? 0.85, opts.metalness ?? 0.05, !!opts.flat, !!opts.transparent, opts.opacity ?? 1,
    !!opts.side, !!opts.vertexColors, !!opts.fog]);
  if (CACHE.mat.has(key)) return CACHE.mat.get(key);
  const params = {
    color: new THREE.Color(color),
    roughness: opts.roughness ?? 0.85,
    metalness: opts.metalness ?? 0.05,
  };
  if (opts.map) params.map = opts.map;
  if (opts.emissive) {
    params.emissive = new THREE.Color(opts.emissive);
    params.emissiveIntensity = opts.emissiveIntensity ?? 1;
  }
  if (opts.flat) params.flatShading = true;
  if (opts.transparent) { params.transparent = true; params.opacity = opts.opacity ?? 1; }
  if (opts.side) params.side = THREE.DoubleSide;
  if (opts.vertexColors) params.vertexColors = true;
  const m = new THREE.MeshStandardMaterial(params);
  if (opts.emissiveMap) { m.emissiveMap = opts.emissiveMap; m.emissive = new THREE.Color(opts.emissive || '#ffffff'); m.emissiveIntensity = opts.emissiveIntensity ?? 1; }
  CACHE.mat.set(key, m);
  return m;
}

// ---------------- 平铺贴图缓存 ----------------
// 换房卡顿的主要来源之一：每个房间都对贴图做 clone 并新建材质。
// 这里按 (贴图名 + 会话种子 + repeat) 缓存，全游戏只保留有限几个组合。
export function getTileTex(name, rng, rx, ry, opts = {}) {
  const key = texKey(name, TEX_SEED ^ (opts.variant || 0) * 7771) + '|' + rx + 'x' + ry;
  if (CACHE.tile.has(key)) return CACHE.tile.get(key);
  const base = getTexture(name, rng, opts);
  const t = base.clone();
  t.needsUpdate = true;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  CACHE.tile.set(key, t);
  return t;
}

/** 预热：在楼层开始时就创建该层会用到的地板 / 墙体平铺材质，避免"第一次进房"才现做。 */
export function warmFloorTexture(name, rx, ry, opts = {}) {
  return getTileTex(name, null, rx, ry, opts);
}

export function tileCacheSize() { return CACHE.tile.size; }
export function matCacheSize() { return CACHE.mat.size; }

// 即取即用的平铺材质（缓存命中后零分配）
export function getTiledMaterial(name, rng, rx, ry, opts = {}) {
  const tex = getTileTex(name, rng, rx, ry, opts);
  return getMaterial('#ffffff', { map: tex, flat: false, roughness: opts.roughness ?? 0.93, metalness: opts.metalness ?? 0.03 });
}

// ---------------- 共享几何缓存 ----------------
// 所有房间/道具/机关的几何体都从这里取，避免每次换房重新分配 + GC。
const GEO_CAP = 1400;   // 安全上限：即使尺寸量化后被绕过，也不会无界膨胀
function memo(cache, key, make) {
  let g = cache.get(key);
  if (g) return g;
  g = make();
  g.userData.shared = true;
  cache.set(key, g);
  if (cache === CACHE.geo && cache.size > GEO_CAP) {
    // FIFO 淘汰：只解除缓存引用，绝不 dispose —— 仍被场景引用的几何体必须保活
    let n = 0;
    for (const k of cache.keys()) {
      if (k === key) continue;
      cache.delete(k);
      if (++n >= 96) break;
    }
  }
  return g;
}
// 尺寸量化：道具会传入 rng 生成的随机尺寸，若按精确浮点做缓存键，
// 几何缓存会随房间数**无界增长**（实测 1758 条并持续上涨）。
// 这里把尺寸吸附到"自适应阶梯"——
//   极小件保留 0.01 精度（0.035 的细环不能被抹成 0），
//   常用件 0.05，中大件 0.1，超大件 0.5（26 / 12 / 5.2 / 1.6 等工程常数精确命中）。
// 结果是键空间变成**有限集合**：缓存会饱和而不会随房间数线性膨胀，
// 而 288p 渲染下这点差异不可分辨。
export function qd(v) {
  if (typeof v !== 'number' || !Number.isFinite(v)) return v;
  const a = Math.abs(v);
  let s;
  if (a < 0.12) s = 0.01;
  else if (a < 0.7) s = 0.05;
  else if (a < 8) s = 0.1;
  else s = 0.5;
  return +(Math.round(v / s) * s).toFixed(4);
}
const qi = (n) => Math.max(3, Math.round(n));

export function boxGeo(w, h, d) { const W = qd(w), H = qd(h), D = qd(d); return memo(CACHE.geo, `b${W}|${H}|${D}`, () => new THREE.BoxGeometry(W, H, D)); }
export function planeGeo(w, h) { const W = qd(w), H = qd(h); return memo(CACHE.geo, `p${W}|${H}`, () => new THREE.PlaneGeometry(W, H)); }
export function cylGeo(rt, rb, h, s = 8, open = false) {
  const RT = qd(rt), RB = qd(rb), H = qd(h), S = qi(s);
  return memo(CACHE.geo, `c${RT}|${RB}|${H}|${S}|${open ? 1 : 0}`, () => new THREE.CylinderGeometry(RT, RB, H, S, 1, open));
}
export function coneGeo(r, h, s = 6) { const R = qd(r), H = qd(h), S = qi(s); return memo(CACHE.geo, `k${R}|${H}|${S}`, () => new THREE.ConeGeometry(R, H, S)); }
export function icoGeo(r, d = 0) { const R = qd(r), D = Math.max(0, Math.round(d)); return memo(CACHE.geo, `i${R}|${D}`, () => new THREE.IcosahedronGeometry(R, D)); }
export function sphereGeo(r, ws = 7, hs = 5) { const R = qd(r), WS = qi(ws), HS = qi(hs); return memo(CACHE.geo, `s${R}|${WS}|${HS}`, () => new THREE.SphereGeometry(R, WS, HS)); }
export function torusGeo(r, t, rs = 5, ts = 10) { const R = qd(r), T = qd(t), RS = qi(rs), TS = qi(ts); return memo(CACHE.geo, `t${R}|${T}|${RS}|${TS}`, () => new THREE.TorusGeometry(R, T, RS, TS)); }
export function ringGeo(inner, outer, seg = 40) { const I = qd(inner), O = qd(outer), S = qi(seg); return memo(CACHE.geo, `r${I}|${O}|${S}`, () => new THREE.RingGeometry(I, O, S)); }

export function geoCacheSize() { return CACHE.geo.size; }
export function texCacheSize() { return CACHE.tile.size; }

export function clearCaches() { CACHE.tex.clear(); CACHE.mat.clear(); CACHE.tile.clear(); CACHE.geo.clear(); }

// ---------------- 简易近似几何（低多边形圆角/锥台）----------------
export function bevelBox(w, h, d, mat) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  return m;
}

export function lathe(points, segments, mat) {
  const g = new THREE.LatheGeometry(points.map((p) => new THREE.Vector2(p[0], p[1])), segments);
  return new THREE.Mesh(g, mat);
}
