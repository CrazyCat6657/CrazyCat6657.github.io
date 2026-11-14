// ============================================================
//  阵营配色契约（PASS3 §31）
//
//  要求原文：「建立颜色与形状语言。敌弹与玩家弹：**任何楼层都不能混**。
//            Boss 危险攻击：必须明显高优先级。」
//
//  改动前的实测（从真实源码抽取色值，不是人工列举）：
//   · 武器 color 22 种、敌人/Boss 侧 32 种
//   · **8 个色值完全相同**：#ffb347 #ff5a10 #8af0ff #9dff5a #ffcf6a #c07af0 #ff7a1a #ffd06a
//   · **44 组近乎同色**（色相差 <12° 且明度差 <0.08）
//  也就是说同一帧里可能出现"与我方子弹同色的敌方子弹"。
//
//  做法：不逐个改 26 把枪（那会留下 44 组近色、而且以后加内容还会再犯），
//  而是在**唯一的出弹口**（Projectiles.spawn / fireBeam）按 team 强制归一：
//  落到错阵营色带的颜色会被**贴到最近的合法色带边界**（保持饱和度与明度）。
//
//  色带刻意**互不重叠且留 ≥18° 的缝**——色相差太小的两色在实际画面里
//  依然分不清（这正是原来 44 组近色的成因）。
//
//  玩家：暖白金 46–70° · 毒绿 78–106° · 能量青 150–188° · 品红 312–340°
//  敌侧：熔红橙 0–26° · 深渊蓝 206–234° · 仪式紫 254–292°
//
//  边界之间的缝：26→46 = 20° · 188→206 = 18° · 234→254 = 20° · 292→312 = 20°
//  **缝必须 ≥18°**：第一版只留了 6–8° 的缝，贴边之后两色仍只差 9–10°，
//  在缩放到 288p 的画面里依旧分不清（探针当场抓到 38 组）。
//  色相距离在低分辨率 + 抖动的画面里会被进一步压缩，所以按"看起来完全不同"取值。
// ============================================================

export const PLAYER_BANDS = [[46, 70], [78, 106], [150, 188], [312, 340]];
export const ENEMY_BANDS = [[0, 26], [206, 234], [254, 292]];

// 近白/近灰只允许玩家使用：
// "亮到发白"是玩家子弹的签名色，而敌弹一旦也发白就彻底无法区分。
const GRAY_SAT = 0.15;
const PLAYER_MIN_L = 0.55;
// 敌侧上限：超过这个明度就"糊成白弹"，与玩家弹签名色冲突
const ENEMY_MAX_L = 0.84;

function hexToRgb(hex) {
  const h = String(hex || '').replace('#', '');
  if (h.length !== 6) return [255, 224, 138];
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function rgbToHex(r, g, b) {
  const f = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return '#' + f(r) + f(g) + f(b);
}
export function rgbToHsl(hex) {
  const [r0, g0, b0] = hexToRgb(hex).map((v) => v / 255);
  const mx = Math.max(r0, g0, b0), mn = Math.min(r0, g0, b0);
  const l = (mx + mn) / 2;
  const d = mx - mn;
  let h = 0, s = 0;
  if (d > 0.0001) {
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    if (mx === r0) h = ((g0 - b0) / d + (g0 < b0 ? 6 : 0));
    else if (mx === g0) h = (b0 - r0) / d + 2;
    else h = (r0 - g0) / d + 4;
    h *= 60;
  }
  return [h, s, l];
}
export function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

// 到色带集合的最小角距离；返回 {dist, hue}（hue = 贴边后的色相）
export function bandDistance(h, bands) {
  let best = null;
  for (const [a, b] of bands) {
    let d = 0, hh = h;
    if (h < a) { d = a - h; hh = a; }
    else if (h > b) { d = h - b; hh = b; }
    else { d = 0; hh = h; }
    if (!best || d < best.dist) best = { dist: d, hue: hh };
  }
  return best || { dist: 999, hue: h };
}

// 把色相贴到最近色带的边界，并**向内收 2°**。
// 不内收的话浮点/抗锯齿会让它看起来仍压在边界上；
// 两条贴边路径（纯色相贴边、亮度钳制）必须共用它，否则会出现"差 0.1°"的漏网配对。
function snapHue(h, bands) {
  const fit = bandDistance(h, bands);
  if (fit.dist <= 0.5) return { hue: h, dist: 0, inside: true };
  const [a, b] = bands.find(([x, y]) => fit.hue >= x - 0.001 && fit.hue <= y + 0.001) || bands[0];
  const inward = h < a ? 2 : -2;
  return { hue: Math.min(b, Math.max(a, fit.hue + inward)), dist: fit.dist, inside: false };
}

// ------------------------------------------------------------
//  归一化：返回该 team 的合法颜色
//   · 已是合法色 → 原样返回（不改变绝大多数内容的外观）
//   · 落在对面色带 → 贴到本阵营最近的色带边界
//   · 近白/灰 → 玩家保留；敌侧强制上色（否则"白子弹"两边混）
// ------------------------------------------------------------
export function teamSafeColor(hex, team, { isPlayer = true } = {}) {
  const input = typeof hex === 'string' && /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : '#ffe08a';
  const [h, s, l] = rgbToHsl(input);
  const bands = isPlayer ? PLAYER_BANDS : ENEMY_BANDS;

  // 近白/近灰：只有玩家可以"亮到发白"
  if (s < GRAY_SAT) {
    if (isPlayer) return input;
    // 敌侧：给一个熔红橙的色调，保持原有明度（别把 Boss 的危险弹压暗）
    return hslToHex(16, 0.85, Math.min(0.72, Math.max(0.45, l)));
  }

  // **糊成白色**的敌侧颜色也要压回去。
  // 实测截图发现：浅青 #dff0ff（L≈0.94）在 288p 内部渲染 + 泛光之后
  // 看起来就是一颗白弹 —— 而"亮到发白"正是玩家弹的签名色。
  // 只按色相分带管不住这一类，必须同时约束明度与饱和度。
  if (!isPlayer && l > ENEMY_MAX_L) {
    return hslToHex(snapHue(h, bands).hue, Math.max(s, 0.55), ENEMY_MAX_L);
  }

  const fit = snapHue(h, bands);
  if (fit.inside) {
    if (isPlayer && l < PLAYER_MIN_L) return hslToHex(h, s, PLAYER_MIN_L);
    return input;
  }
  const outL = isPlayer ? Math.max(l, PLAYER_MIN_L) : l;
  return hslToHex(fit.hue, s, outL);
}

// 便于断言/报表：某个颜色属于哪个阵营（或"都不属于"）
export function classifyColor(hex) {
  const [h, s, l] = rgbToHsl(hex);
  if (s < GRAY_SAT) return l > 0.7 ? 'neutral-bright' : 'neutral-dark';
  const p = bandDistance(h, PLAYER_BANDS).dist;
  const e = bandDistance(h, ENEMY_BANDS).dist;
  if (p <= 0.5 && e <= 0.5) return 'ambiguous';
  if (p <= 0.5) return 'player';
  if (e <= 0.5) return 'enemy';
  return 'outside';
}
