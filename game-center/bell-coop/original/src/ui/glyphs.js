// ============================================================
//  UI 字形（PASS3 §37）
//
//  背景（这是一个"只填数据没人读"的真实缺陷）：
//  `data.js` 的 ITEMS 里有 `icon` 字段，但 **全项目没有任何消费点**，
//  而且 39 件里只有 3 件填了值。所以"用图标代替纯文字"从未发生，
//  面板只能靠"名称 + 一大段纯文本"表达。
//
//  做法：**不依赖那个残缺字段**，改从完整且一定会填的数据推导 ——
//  道具看 `mods` / `tags`，武器看 `cls`，主动技能看 `hook`/`eff`。
//  这样新增内容时字形自动成立，不会再出现"字段空着"的情况。
//
//  字形是内联 SVG（currentColor），不引外部资源、不增加网络请求，
//  符合"全部美术程序化生成"的项目约定。
// ============================================================

const S = (d, extra = '') =>
  `<svg class="gl" viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" ${extra}/></svg>`;

// 统一 24×24、描边式（stroke-width 2，round 端点），保证缩到 14px 仍可辨认
const STROKE = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const FILL = 'fill="currentColor"';

export const GLYPHS = {
  fist: S('M6 11V7a2 2 0 0 1 4 0v4M10 11V5a2 2 0 0 1 4 0v6M14 11V6a2 2 0 0 1 4 0v7M6 11v4a6 6 0 0 0 12 0v-1', STROKE),
  bolt: S('M13 2 4 14h6l-1 8 9-12h-6l1-8z', FILL),
  boot: S('M7 4v9l-2 3v4h13v-3a5 5 0 0 0-3-4l-3-1V4z', STROKE),
  shield: S('M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z', STROKE),
  target: S('M12 4v3M12 17v3M4 12h3M17 12h3', STROKE) + `<circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/>`,
  heart: S('M12 20S4 14.5 4 9.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 8 3.5C20 14.5 12 20 12 20z', STROKE),
  coin: S('M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', STROKE) + `<path d="M12 8v8M9.5 10h5M9.5 14h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  key: S('M15 3a5 5 0 1 1-4.6 7H8v3H5v3H2v-4l7-7A5 5 0 0 1 15 3z', STROKE),
  ammo: S('M7 4h10v6H7zM7 10l1 10h8l1-10', STROKE),
  arrow: S('M12 20V4M6 10l6-6 6 6', STROKE),
  reload: S('M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5', STROKE),
  star: S('M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-2.9L6.7 19.6l1.1-6L3.4 9.4l6-.8z', STROKE),
  eye: S('M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6z', STROKE) + `<circle cx="12" cy="12" r="2.6" fill="currentColor"/>`,
  flame: S('M12 22c4 0 6-3 6-6 0-5-6-6-4-14-6 3-8 7-8 11 0 4 2 9 6 9z', FILL),
  clock: S('M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', STROKE) + `<path d="M12 7.5V12l3.2 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  skull: S('M12 3c4.4 0 7 2.8 7 6.6 0 2.2-1 3.2-1 4.4V17H6v-3c0-1.2-1-2.2-1-4.4C5 5.8 7.6 3 12 3z', STROKE) + `<circle cx="9.4" cy="10" r="1.3" fill="currentColor"/><circle cx="14.6" cy="10" r="1.3" fill="currentColor"/>`,
  // 武器外形大类（与 PASS2 武器定位表同一套分类口径）
  handgun: S('M4 9h9l3 2h5v2h-6l-2 2H8v-2H4z', STROKE),
  smg: S('M4 9h13v4h-4l-1 5H9l-1-5H4z', STROKE),
  rifle: S('M3 11h16l2 2v2h-6l-3 4H9l2-4H3z', STROKE),
  shotgun: S('M3 10h14v3h-3l-1 3H9l-1-3H3zM18 10h3v3h-3z', STROKE),
  sniper: S('M2 12h20M6 10h6v4H6zM17 9h4v2h-4z', STROKE),
  launcher: S('M3 10h12v4H3zM15 9h4v6h-4zM7 14l-2 5h4l2-5', STROKE),
  beam: S('M3 11h11l3-2h4v6h-4l-3-2H3z', STROKE) + `<path d="M20 12h3" fill="none" stroke="currentColor" stroke-width="2"/>`,
  exotic: S('M12 3l3 6 6 1-4.5 4.4L18 21l-6-3.2L6 21l1.5-6.6L3 10l6-1z', STROKE),
  generic: S('M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z', STROKE),
};

// ---- 推导：道具 / 主动 / 武器 ----
// 规则按"玩家最关心的一眼信息"排序：先看标签，再看具体 mods。
export function glyphKeyForItem(def) {
  if (!def) return 'generic';
  const m = def.mods || {};
  const tags = def.tags || [];
  if (m.damage || tags.includes('offense') && m.crit) return 'fist';
  if (m.rate) return 'bolt';
  if (m.reload) return 'reload';
  if (m.armor || m.barrier || m.maxHp) return 'shield';
  if (m.hpRegen || m.lifesteal || m.heal) return 'heart';
  if (m.crit) return 'target';
  if (m.speed || tags.includes('mobility')) return 'boot';
  if (m.ammoMax || m.magazine || m.ammoPickup) return 'ammo';
  if (m.coins || tags.includes('economy')) return 'coin';
  if (m.keys || tags.includes('utility')) return 'key';
  if (m.pierce) return 'arrow';
  if (m.burn || m.ember || tags.includes('fire')) return 'flame';
  if (m.slow || m.stasis) return 'clock';
  if (m.petPower || m.petHp || tags.includes('pet')) return 'skull';
  if (m.range || m.vision || tags.includes('range')) return 'eye';
  if (tags.includes('offense')) return 'fist';
  if (tags.includes('defense')) return 'shield';
  return 'star';
}

export function glyphKeyForActive(def) {
  if (!def) return 'generic';
  const e = String(def.eff || def.effect || def.id || '');
  if (/heal|ward|regen/.test(e)) return 'heart';
  if (/shield|barrier|guard/.test(e)) return 'shield';
  if (/bomb|blast|nova|meteor|explode/.test(e)) return 'flame';
  if (/time|slow|freeze|stasis/.test(e)) return 'clock';
  if (/shot|burst|volley|gun|turret/.test(e)) return 'ammo';
  if (/scan|reveal|map/.test(e)) return 'eye';
  if (/summon|pet|beast/.test(e)) return 'skull';
  return 'star';
}

export function glyphKeyForWeapon(def) {
  if (!def) return 'generic';
  if (def.special === 'beam') return 'beam';
  if (def.cls === 'launcher' || def.cls === 'rocket') return 'launcher';
  if (def.cls === 'minigun' || def.cls === 'smg' || (def.rate || 0) >= 7) return 'smg';
  if (def.cls === 'shotgun' || (def.pellets || 1) >= 4) return 'shotgun';
  if (def.cls === 'sniper' || ((def.rate || 9) <= 1.0 && (def.damage || 0) >= 8)) return 'sniper';
  if (def.cls === 'rifle') return 'rifle';
  if (def.cls === 'pistol') return 'handgun';
  return 'exotic';
}

export function glyphSvg(key) { return GLYPHS[key] || GLYPHS.generic; }

// ---- 稀有度色带（PASS3 §38：颜色只在这里表达稀有度）----
export const RARITY_CN = { 1: '常见', 2: '稀有', 3: '罕见', 4: '传奇' };
export function rarityClass(n) { return `rar-${Math.max(1, Math.min(4, n | 0 || 1))}`; }
