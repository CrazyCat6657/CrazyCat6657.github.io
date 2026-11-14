// Control preferences are deliberately independent from expedition/meta saves.
export const CONTROLS_KEY = 'ember-descent:controls:v1';
const BOTH = ['classic', 'experimental'];
const classic = ['classic'], experimental = ['experimental'];
export const ACTIONS = Object.freeze([
  ['move_up', '向上移动', BOTH], ['move_down', '向下移动', BOTH],
  ['move_left', '向左移动', BOTH], ['move_right', '向右移动', BOTH],
  ['fire', '射击', BOTH], ['dodge', '闪避', BOTH], ['reload', '装填', BOTH],
  ['weapon_1', '武器 1', classic], ['weapon_2', '武器 2', classic], ['weapon_3', '武器 3', classic],
  ['next_weapon', '下一把武器', BOTH], ['active', '使用主动道具', BOTH],
  ['cycle_active', '轮换主动道具', BOTH, true], ['hero_skill', '职业技能', classic],
  ['interact', '交互', BOTH], ['build', '查看构筑', BOTH, true], ['minimap', '地图', BOTH, true],
  ['sprint', '疾跑', experimental], ['skill_1', '技能 1', experimental],
  ['skill_2', '技能 2', experimental], ['skill_3', '技能 3', experimental],
  ['ultimate', '大招', experimental], ['item_1', '消耗品 1', experimental],
  ['item_2', '消耗品 2', experimental], ['item_3', '消耗品 3', experimental], ['item_4', '消耗品 4', experimental],
].map(([id, label, profiles, keyboardOnly = false]) => Object.freeze({ id, label, profiles: Object.freeze([...profiles]), keyboardOnly })));

const shared = {
  move_up: ['w', 'ArrowUp'], move_down: ['s', 'ArrowDown'],
  move_left: ['a', 'ArrowLeft'], move_right: ['d', 'ArrowRight'],
  fire: ['Mouse0'], reload: ['r'], build: ['Tab'], minimap: ['m'],
};
function freezeBindings(bindings) {
  return Object.freeze(Object.fromEntries(Object.entries(bindings).map(([id, tokens]) => [id, Object.freeze([...tokens])])));
}
export const DEFAULT_BINDINGS = Object.freeze({
  classic: freezeBindings({ ...shared, dodge: ['Mouse2', 'Shift', 'Space'], weapon_1: ['1'], weapon_2: ['2'], weapon_3: ['3'],
    next_weapon: ['q', 'WheelUp', 'WheelDown'], active: ['f'], cycle_active: ['x'], hero_skill: ['c'], interact: ['e'] }),
  experimental: freezeBindings({ ...shared, dodge: ['Mouse2', 'Space'], sprint: ['Shift'],
    next_weapon: ['WheelUp', 'WheelDown'], active: ['g'], cycle_active: ['v'], interact: ['f'],
    skill_1: ['q'], skill_2: ['e'], skill_3: ['c'], ultimate: ['x'], item_1: ['1'], item_2: ['2'], item_3: ['3'], item_4: ['4'] }),
});
const PROFILES = Object.keys(DEFAULT_BINDINGS);
const KEYBOARD = new Set([... 'abcdefghijklmnopqrstuvwxyz0123456789', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Shift', 'Space', 'Tab']);
const TOKENS = new Set([...KEYBOARD, 'Mouse0', 'Mouse1', 'Mouse2', 'Mouse3', 'Mouse4', 'WheelUp', 'WheelDown']);
const plainObject = value => value !== null && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
const copy = bindings => Object.fromEntries(Object.entries(bindings).map(([id, tokens]) => [id, [...tokens]]));
const allDefaults = () => Object.fromEntries(PROFILES.map(profile => [profile, copy(DEFAULT_BINDINGS[profile])]));

function validate(profile, bindings) {
  if (!PROFILES.includes(profile)) return '未知控制预设。';
  if (!plainObject(bindings)) return '绑定记录格式损坏。';
  const actions = ACTIONS.filter(action => action.profiles.includes(profile));
  if (Object.keys(bindings).length !== actions.length || Object.keys(bindings).some(id => !actions.some(action => action.id === id))) return '动作目录不完整或包含未知动作。';
  const used = new Map();
  for (const action of actions) {
    const tokens = bindings[action.id];
    if (!Array.isArray(tokens) || tokens.length < 1 || tokens.length > 3) return `${action.label}必须保留 1–3 个绑定。`;
    if (new Set(tokens).size !== tokens.length) return `${action.label}有重复绑定。`;
    for (const token of tokens) {
      if (!TOKENS.has(token)) return '不支持此按键；Esc 和 Enter 为菜单保留键，仅支持普通字母、数字、方向键、Shift、空格、Tab 和鼠标。';
      if (action.keyboardOnly && !KEYBOARD.has(token)) return `${action.label}仅支持键盘。`;
      if (token.startsWith('Wheel') && action.id !== 'next_weapon') return '滚轮仅可绑定“下一把武器”。';
      if (token === 'Tab' && action.id !== 'build') return 'Tab 仅可绑定“查看构筑”。';
      if (action.id === 'build' && (/^[0-9]$/.test(token) || token.startsWith('Arrow') || token === 'Space')) return '构筑面板的数字、方向键和空格用于固定菜单选择，请为“查看构筑”选择其他按键。';
      if (used.has(token)) return `${bindingLabel(token)}已绑定“${used.get(token)}”，原绑定未改变。`;
      used.set(token, action.label);
    }
  }
  return '';
}

function decode(raw) {
  if (raw === null) return allDefaults();
  const record = JSON.parse(raw);
  if (!plainObject(record) || record.schema !== 1 || !plainObject(record.profiles)
    || Object.keys(record.profiles).length !== PROFILES.length || Object.keys(record.profiles).some(profile => !PROFILES.includes(profile))) throw Error('控制记录损坏或版本不受支持，已保留原记录。');
  for (const profile of PROFILES) {
    const error = validate(profile, record.profiles[profile]);
    if (error) throw Error(`控制记录损坏：${error}`);
  }
  return Object.fromEntries(PROFILES.map(profile => [profile, copy(record.profiles[profile])]));
}

export function createControls(storage = () => globalThis.localStorage) {
  let profiles = allDefaults(), readError = '';
  const listeners = new Set();
  const resolveStorage = () => typeof storage === 'function' ? storage() : storage;
  try { profiles = decode(resolveStorage().getItem(CONTROLS_KEY)); }
  catch (error) { readError = `无法读取控制设置：${error.message}`; }
  function get(profile = 'classic') { return profiles[profile] ? copy(profiles[profile]) : {}; }
  function failure(profile, error) { return { ok: false, error, bindings: get(profile) }; }
  function save(profile, bindings) {
    if (readError) return failure(profile, readError);
    const error = validate(profile, bindings);
    if (error) return failure(profile, error);
    let next;
    try {
      const target = resolveStorage();
      // Validate again before overwriting: another tab may have written a newer schema.
      next = decode(target.getItem(CONTROLS_KEY));
      next[profile] = copy(bindings);
      target.setItem(CONTROLS_KEY, JSON.stringify({ schema: 1, profiles: next }));
    } catch (error) { return failure(profile, `控制设置未保存：${error.message}`); }
    profiles = next;
    for (const listener of listeners) {
      try { listener(profile, get(profile)); } catch (error) { console.error('控制设置订阅回调失败', error); }
    }
    return { ok: true, bindings: get(profile) };
  }
  return {
    get,
    rebind(profile, action, tokens) {
      if (!PROFILES.includes(profile)) return failure(profile, '未知控制预设。');
      if (!Object.hasOwn(profiles[profile], action)) return failure(profile, '此预设没有该动作。');
      return save(profile, { ...get(profile), [action]: Array.isArray(tokens) ? [...tokens] : tokens });
    },
    reset(profile = 'classic') {
      if (!PROFILES.includes(profile)) return failure(profile, '未知控制预设。');
      return save(profile, DEFAULT_BINDINGS[profile]);
    },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };
}

export const controls = createControls();

export function eventToken(event) {
  if (!event || event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return null;
  if (event.type === 'wheel') return event.deltaY < 0 ? 'WheelUp' : event.deltaY > 0 ? 'WheelDown' : null;
  if (event.type === 'mousedown' || event.type === 'mouseup' || event.type === 'pointerdown' || event.type === 'pointerup') return [0, 1, 2, 3, 4].includes(event.button) ? `Mouse${event.button}` : null;
  let token = event.key;
  if (token === ' ') token = 'Space';
  if (typeof token !== 'string') return null;
  if (token.length === 1) token = token.toLowerCase();
  if (/^Digit[0-9]$/.test(event.code || '')) token = event.code.slice(-1);
  // Menus retain fixed confirm/cancel keys; validation still forbids binding them.
  return KEYBOARD.has(token) || token === 'Escape' || token === 'Enter' ? token : null;
}

export function bindingLabel(token) {
  return ({ Mouse0: '鼠标左键', Mouse1: '鼠标中键', Mouse2: '鼠标右键', Mouse3: '鼠标侧键 1', Mouse4: '鼠标侧键 2', WheelUp: '滚轮↑', WheelDown: '滚轮↓',
    ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', Space: '空格', Tab: 'Tab', Shift: 'Shift' })[token] || String(token).toUpperCase();
}
export function actionLabel(action, profile = 'classic', store = controls) {
  return (store.get(profile)[action] || []).map(bindingLabel).join(' / ') || '未绑定';
}
