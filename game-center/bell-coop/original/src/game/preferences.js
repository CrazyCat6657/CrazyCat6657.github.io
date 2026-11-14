// ============================================================
//  显示 / 手感 / 音量 / 键位 偏好
//
//  存储契约：**只写 ember-descent:preferences:v1，绝不碰 Run 或 Meta。**
//  改键位布局这类"设备形态相关"的设置也走这里，因为它们的生命周期与存档不同：
//  存档跟着某一局走，偏好跟着"这台设备 + 这个人"走。
//
//  ★ 加新键时必须同时确认三件事（本项目最大的隐性风险就是漏掉第 2、3 条）★
//    ① 键写进 DEFAULT_PREFERENCES（否则 update() 会因 Object.hasOwn 判假而拒绝写入）；
//    ② 有人**读**它，而且读的地方**在值变化时会被重新调用**；
//    ③ 这个值不会因为初始状态而恒真/恒假（例如"未解锁"被写成 true 就等于白送）。
// ============================================================
export const PREFERENCES_KEY = 'ember-descent:preferences:v1';
export const PREFERENCES_SCHEMA = 1;

/** 倍率的自动档：手机（紧凑档）比平板更靠近，平板 / 桌面维持原本的 46° 视野。 */
export const AUTO_ZOOM_COMPACT = 1.7;
export const ZOOM_MIN = 1.2;
export const ZOOM_MAX = 2.0;
export const BTN_SCALE_MIN = 0.7;
export const BTN_SCALE_MAX = 1.5;

/** 可自定义位置的 7 枚动作键（与 TC_LAYOUT.buttons 的 act 一一对应）。 */
export const LAYOUT_ACTS = Object.freeze(['dash', 'skill', 'active', 'interact', 'swap', 'reload', 'pause','skill1','skill2','ultimate','sprint','build']);
/** 可自定义圆心的两根摇杆。 */
export const LAYOUT_SIDES = Object.freeze(['l', 'r']);

export const DEFAULT_PREFERENCES = Object.freeze({
  // ---- 准星（既有） ----
  size: 28, color: '#f5fbff', outline: true, center: true, lineWidth: 1.8, opacity: 1,
  coinMagnetRadius: 4.5, autoDetachOnReplace: true,
  // ---- 画面（v1.4 新增） ----
  zoom: 0,             // 0 = 自动（手机 1.7 / 平板 1.0）；否则取 1.2–2.0 的手动倍率
  pinCenter: 'auto',   // 'auto' 手机钉住、平板保持前视 | 'on' 一律钉住 | 'off' 一律前视
  minimapZoom: 0,      // 0 = 自动（手机 2 / 平板 1）；否则 1–3
  // ---- 手感（v1.4 新增） ----
  stickFollow: true,   // true = 摇杆圆心落在手指按下处（跟随手）；false = 圆心固定
  btnScale: 1,         // 触摸动作键整体缩放
  // ---- 音量（v1.4 新增） ----
  sfxOn: true, musicOn: true, volumeSfx: 0.7, volumeMusic: 0.34,
  // ---- 键位（v1.4 新增） ----
  layoutCustom: null,  // { base:{buttons:{},sticks:{}}, compact:{...} }；null = 用内置布局
});

const ranges = {
  size: [12, 64], lineWidth: [0.5, 4], opacity: [0.2, 1], coinMagnetRadius: [3.5, 5.5],
  zoom: [0, ZOOM_MAX], minimapZoom: [0, 3], btnScale: [BTN_SCALE_MIN, BTN_SCALE_MAX],
  volumeSfx: [0, 1], volumeMusic: [0, 1],
};
const ENUMS = { pinCenter: ['auto', 'on', 'off'] };
const boolKeys = ['outline', 'center', 'autoDetachOnReplace', 'stickFollow', 'sfxOn', 'musicOn'];
const plain = v => !!v && typeof v === 'object' && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);

/** 位置钳制：键位坐标是视口百分比，永远不允许跑出屏外。 */
const POS_MIN = 2, POS_MAX = 98;
const pos = v => (typeof v === 'number' && Number.isFinite(v) && v >= -50 && v <= 150)
  ? Math.round(Math.min(POS_MAX, Math.max(POS_MIN, v)) * 10) / 10 : null;

/**
 * 键位覆盖表消毒。任何不认识的 act / side、非数值坐标、越界坐标一律丢弃，
 * 而不是整块拒绝 —— 这样旧版本的键位表在新增按键之后仍然可用（新键回落到内置位置）。
 */
export function sanitizeLayoutCustom(v) {
  if (v === null || v === undefined) return null;
  if (!plain(v)) return undefined;                  // undefined = 非法，调用方应回退到默认
  const out = {};
  for (const slot of ['base', 'compact']) {
    const src = v[slot];
    if (!plain(src)) continue;
    const item = {};
    const bs = plain(src.buttons) ? src.buttons : {};
    const buttons = {};
    for (const act of LAYOUT_ACTS) {
      const p = bs[act];
      if (!plain(p)) continue;
      const x = pos(p.x), y = pos(p.y);
      if (x === null || y === null) continue;
      buttons[act] = { x, y };
    }
    if (Object.keys(buttons).length) item.buttons = buttons;
    const ss = plain(src.sticks) ? src.sticks : {};
    const sticks = {};
    for (const side of LAYOUT_SIDES) {
      const p = ss[side];
      if (!plain(p)) continue;
      const x = pos(p.x), y = pos(p.y);
      if (x === null || y === null) continue;
      sticks[side] = { x, y };
    }
    if (Object.keys(sticks).length) item.sticks = sticks;
    if (Object.keys(item).length) out[slot] = item;
  }
  return Object.keys(out).length ? out : null;
}

function valid(key, value) {
  if (ranges[key]) return typeof value === 'number' && Number.isFinite(value) && value >= ranges[key][0] && value <= ranges[key][1];
  if (ENUMS[key]) return typeof value === 'string' && ENUMS[key].includes(value);
  if (boolKeys.includes(key)) return typeof value === 'boolean';
  if (key === 'color') return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
  if (key === 'layoutCustom') return sanitizeLayoutCustom(value) !== undefined;
  return typeof value === 'boolean';
}

export function normalizePreferences(data) {
  const out = { ...DEFAULT_PREFERENCES };
  for (const key of Object.keys(out)) if (valid(key, data?.[key])) out[key] = key === 'color' ? data[key].toLowerCase() : data[key];
  // layoutCustom 的默认值是 null，而 valid() 对 null 判真（见 sanitizeLayoutCustom 首行），
  // 所以这里必须再走一次消毒，把"结构合法但内容越界"的表压回可用值。
  out.layoutCustom = sanitizeLayoutCustom(out.layoutCustom) || null;
  return out;
}

// ---- 生效值换算：**唯一来源**。设置面板、触摸层、HUD 都调这三个，不许各自再写一份默认。 ----

// 下面三个是**每帧都可能被调**的换算，所以刻意不调 normalizePreferences
// （那个会整对象重建，60fps 下是纯浪费）。存储层的值在读出来时已经消毒过，
// 这里只做一次廉价兜底。三个函数都必须与 DEFAULT_PREFERENCES 里的语义逐字对应。

/** 实际使用的画面放大倍率（相对平板 / 桌面的 46° 基准视野）。 */
export function resolveZoom(prefs, compact) {
  const z = Number(prefs?.zoom);
  if (Number.isFinite(z) && z > 0) return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));
  return compact ? AUTO_ZOOM_COMPACT : 1;
}

/** 角色是否钉在屏幕正中（= 关掉"瞄准前视"）。auto = 手机钉住、平板保持前视。 */
export function resolvePinCenter(prefs, compact) {
  const m = prefs?.pinCenter;
  if (m === 'on') return true;
  if (m === 'off') return false;
  return !!compact;
}

/** 小地图内容放大倍数：1 = 画整层（总览），2 = 只看当前房间附近的半个楼层。 */
export function resolveMinimapZoom(prefs, compact) {
  const z = Number(prefs?.minimapZoom);
  if (Number.isFinite(z) && z > 0) return Math.min(3, Math.max(1, z));
  return compact ? 2 : 1;
}

/** 键位覆盖：按当前是基准档还是紧凑档取一份（没有自定义时返回 null）。 */
export function resolveLayoutOverride(prefs, compact) {
  const custom = sanitizeLayoutCustom(prefs?.layoutCustom);
  if (!custom) return null;
  return custom[compact ? 'compact' : 'base'] || null;
}

export function createPreferences(storage = () => globalThis.localStorage) {
  let current = { ...DEFAULT_PREFERENCES }, extras = {}, refusal = '', loaded = false;
  const getStorage = () => typeof storage === 'function' ? storage() : storage;
  function read() {
    if (loaded) return;
    loaded = true;
    try {
      const raw = getStorage()?.getItem(PREFERENCES_KEY);
      if (!raw) return;
      const record = JSON.parse(raw);
      if (!plain(record) || (record.schema !== undefined && record.schema !== 1 && record.schema !== 0)) {
        refusal = '偏好版本无法识别，已使用默认显示；未覆盖原记录。'; return;
      }
      const values = record.schema === undefined ? record : record.values;
      if (!plain(values)) { refusal = '偏好记录损坏，已使用默认显示；未覆盖原记录。'; return; }
      current = normalizePreferences(values);
      // Preserve newer optional fields within this schema for future consumers.
      extras = Object.fromEntries(Object.entries(values).filter(([k]) => !Object.hasOwn(DEFAULT_PREFERENCES, k)));
    } catch { refusal = '无法读取偏好记录，已使用默认显示；未覆盖原记录。'; }
  }
  function persist(next) {
    read();
    if (refusal) return { ok: false, error: refusal, values: { ...current } };
    try {
      const target = getStorage();
      if (!target) throw Error('浏览器存储不可用');
      target.setItem(PREFERENCES_KEY, JSON.stringify({ schema: PREFERENCES_SCHEMA, values: { ...extras, ...next } }));
      current = { ...next };
      return { ok: true, values: { ...current } };
    } catch (error) { return { ok: false, error: `偏好保存失败：${error.message || error}`, values: { ...current } }; }
  }
  return {
    get() { read(); return { ...current }; },
    update(patch) {
      read();
      if (!plain(patch) || Object.entries(patch).some(([k, v]) => !Object.hasOwn(DEFAULT_PREFERENCES, k) || !valid(k, v)))
        return { ok: false, error: '偏好值无效，请检查范围或 HEX 颜色。', values: { ...current } };
      return persist(normalizePreferences({ ...current, ...patch }));
    },
    reset() { return persist({ ...DEFAULT_PREFERENCES }); },
  };
}
export const preferences = createPreferences();

export function applyReticlePreferences(element, values) {
  const p = normalizePreferences(values);
  element.style.width = element.style.height = `${p.size}px`;
  element.style.opacity = String(p.opacity);
  element.style.setProperty('--reticle-color', p.color);
  element.style.setProperty('--reticle-line', String(p.lineWidth));
  const rgb = p.color.match(/\w\w/g).map(v => parseInt(v, 16));
  element.style.setProperty('--reticle-edge', rgb[0] * .299 + rgb[1] * .587 + rgb[2] * .114 < 90 ? '#ffffff' : '#081018');
  element.classList.toggle('no-outline', !p.outline);
  element.classList.toggle('no-center', !p.center);
}
export function reticleSVG() {
  const path = 'M12 2v5M12 17v5M2 12h5M17 12h5';
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><g class="reticle-edge"><path d="${path}"/><circle cx="12" cy="12" r="1.6"/></g><g class="reticle-ink"><path d="${path}"/><circle cx="12" cy="12" r="1.6"/></g></svg>`;
}

// ============================================================
//  键位模板（与偏好分开存）
//
//  为什么不用 PREFERENCES_KEY：模板是**一组可选方案**，而偏好是"当前生效的那一份"。
//  混在一个键里，一旦玩家把模板列表写坏就会连累当前键位一起回退默认；
//  分开之后"当前键位"永远只依赖一条记录。
// ============================================================
export const LAYOUT_PRESETS_KEY = 'ember-descent:layouts:v1';
export const PRESET_MAX = 12;

export function createLayoutPresets(storage = () => globalThis.localStorage) {
  const getStorage = () => typeof storage === 'function' ? storage() : storage;
  function list() {
    try {
      const raw = getStorage()?.getItem(LAYOUT_PRESETS_KEY);
      if (!raw) return [];
      const record = JSON.parse(raw);
      if (!plain(record) || !Array.isArray(record.presets)) return [];
      return record.presets
        .filter(p => plain(p) && typeof p.name === 'string' && p.name.trim() && sanitizeLayoutCustom(p.layout))
        .slice(0, PRESET_MAX)
        .map(p => ({ name: p.name.slice(0, 20), layout: sanitizeLayoutCustom(p.layout) }));
    } catch { return []; }
  }
  function save(list_) {
    try {
      const target = getStorage();
      if (!target) throw Error('浏览器存储不可用');
      target.setItem(LAYOUT_PRESETS_KEY, JSON.stringify({ schema: 1, presets: list_ }));
      return { ok: true };
    } catch (error) { return { ok: false, error: `模板保存失败：${error.message || error}` }; }
  }
  return {
    list,
    /** 同名覆盖；超过上限则拒绝（不静默丢掉最早的模板 —— 玩家会以为存上了）。 */
    add(name, layout) {
      const clean = String(name || '').trim().slice(0, 20);
      if (!clean) return { ok: false, error: '请先给模板起个名字。' };
      const cleanLayout = sanitizeLayoutCustom(layout);
      if (!cleanLayout) return { ok: false, error: '当前布局是空的，先在编辑模式里拖动按键。' };
      const items = list().filter(p => p.name !== clean);
      if (items.length >= PRESET_MAX) return { ok: false, error: `最多保存 ${PRESET_MAX} 套模板，请先删掉一套。` };
      items.push({ name: clean, layout: cleanLayout });
      const r = save(items); return r.ok ? { ok: true, presets: items } : r;
    },
    remove(name) { const items = list().filter(p => p.name !== name); const r = save(items); return r.ok ? { ok: true, presets: items } : r; },
  };
}
export const layoutPresets = createLayoutPresets();
