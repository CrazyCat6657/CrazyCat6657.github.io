import { normalizeTelemetry, summarize } from '../../game/telemetry.js';

// A deliberately small local report, never a session/save export. All collections
// are bounded; invalid measurements become null rather than invented zeroes.
const MAX_NUMBER = Number.MAX_SAFE_INTEGER;
const ACTIONS = ['move_up', 'move_down', 'move_left', 'move_right', 'fire', 'dodge', 'reload',
  'weapon_1', 'weapon_2', 'weapon_3', 'next_weapon', 'active', 'cycle_active', 'hero_skill',
  'interact', 'build', 'minimap', 'sprint', 'skill_1', 'skill_2', 'skill_3', 'ultimate',
  'item_1', 'item_2', 'item_3', 'item_4'];
const BAG_FIELDS = ['timeByFloor', 'dmgBy', 'healBy', 'healWasted', 'coinsIn', 'coinsOut'];
const number = value => Number.isFinite(value) && value >= 0 && value <= MAX_NUMBER ? value : null;
const integer = value => Number.isInteger(value) ? number(value) : null;
const id = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(value) ? value : null;
const object = value => !!value && typeof value === 'object' &&
  [Object.prototype, null].includes(Object.getPrototypeOf(value));
const list = (value, limit, fn) => Array.isArray(value) ? Array.from(value.slice(0, limit), fn) : [];
const token = value => typeof value === 'string' && /^(?:[a-z0-9]|Arrow(?:Up|Down|Left|Right)|Shift|Space|Tab|Mouse[012]|Wheel(?:Up|Down))$/.test(value);

function numericBag(value) {
  if (!object(value)) return null;
  const keys = Object.keys(value);
  if (keys.length > 64 || keys.some(key => !id(key) || number(value[key]) === null)) return null;
  return Object.fromEntries(keys.map(key => [key, value[key]]));
}

function fixtureReport(value) {
  if (!object(value)) return null;
  return {
    version: integer(value.version),
    variant: ['classic', 'fixed', 'mixed', 'foldshadow'].includes(value.variant) ? value.variant : null,
    seed: Number.isInteger(value.seed) && value.seed >= 1 && value.seed <= 0xffffffff ? value.seed : null,
    hero: id(value.hero), weapon: id(value.weapon), definitionVersion: integer(value.definitionVersion),
    difficulty: value.difficulty === 'standard' ? 'standard' : null,
    flowVersion: integer(value.flowVersion),
    layoutHash: typeof value.layoutHash === 'string' && /^[a-f0-9]{8}$/.test(value.layoutHash) ? value.layoutHash : null,
  };
}

function controlsReport(input) {
  const bindings = {}, labels = {};
  for (const action of ACTIONS) {
    const values = input?.bindings?.[action];
    if (!Array.isArray(values) || values.length > 3 || !Array.from(values).every(token)) continue;
    bindings[action] = [...values];
    let label;
    try { label = input.label?.(action); } catch { /* A missing display label never blocks a report. */ }
    // Input.label is the actual current preset label. Reject paths/URLs and
    // unexpected display data; raw tokens still document the real binding.
    labels[action] = typeof label === 'string' && label.length <= 128 &&
      !/[\\:\r\n\t]/.test(label) && !/(?:\S\/|\/\S)/.test(label) ? label : values.join(' / ');
  }
  return { profile: ['classic', 'experimental'].includes(input?.profile) ? input.profile : null, bindings, labels };
}

/** Read existing measurements only. No storage, network, wall clock or gameplay mutations. */
export function comparisonReport(g) {
  const run = g?.run, player = g?.player, tel = g?.tel, consumables = g?.consumables;
  const bags = Object.fromEntries(BAG_FIELDS.map(key => [key, numericBag(tel?.[key])]));
  const normalized = normalizeTelemetry(Object.fromEntries(BAG_FIELDS.filter(key => bags[key] !== null).map(key => [key, bags[key]])));
  const summary = summarize(normalized);
  const total = (bag, field) => bags[bag] === null ? null : number(summary[field]);
  // An empty map has no clock sample, unlike a recorded floor with time zero.
  const telemetryTime = bags.timeByFloor && Object.keys(bags.timeByFloor).length ? total('timeByFloor', 'time') : null;
  const runTime = number(run?.time);
  const stats = consumables?.stats;
  return {
    version: 1,
    scope: '本地同 Seed 对照事实记录；人类手感未验收；不代表平衡或偏好结论。',
    humanFeelAccepted: false,
    delivery: 'local-download-only',
    fixture: fixtureReport(g?.comparison),
    current: {
      floor: integer(run?.floor),
      hero: id(player?.hero?.id), heroRuleVersion: integer(player?.hero?.ruleVersion),
      alive: typeof player?.alive === 'boolean' ? player.alive : null,
      hp: number(player?.hp), maxHp: number(player?.maxHp), armor: number(player?.armor),
      coins: number(player?.coins), keys: number(player?.keys),
      weaponIndex: integer(player?.weaponIndex),
      weapons: list(player?.weapons, 8, weapon => ({ id: id(weapon?.def?.id),
        definitionVersion: integer(weapon?.def?.weaponAssetVersion ?? (weapon?.def ? 1 : undefined)) })),
      activeIndex: integer(player?.activeIndex), actives: list(player?.actives, 8, id),
      items: list(player?.items, 64, id),
      consumableSlots: list(consumables?.slots, 4, slot => slot === null ? null :
        { itemId: id(slot?.itemId), count: integer(slot?.count) }),
    },
    metrics: {
      durationSeconds: telemetryTime ?? runTime,
      durationSource: telemetryTime !== null ? 'tel.timeByFloor' : runTime !== null ? 'run.time' : 'unavailable',
      timeByFloor: bags.timeByFloor,
      kills: integer(run?.kills), killsSource: 'run.kills',
      damageTaken: total('dmgBy', 'damage'), damageTakenBy: bags.dmgBy,
      healingReceived: total('healBy', 'heal'), healingReceivedBy: bags.healBy,
      healingWasted: total('healWasted', 'healWasted'), healingWastedBy: bags.healWasted,
      coinsReceived: total('coinsIn', 'coinsIn'), coinsReceivedBy: bags.coinsIn,
      coinsSpent: total('coinsOut', 'coinsOut'), coinsSpentBy: bags.coinsOut,
      consumablesPicked: integer(stats?.picked), consumablesUsed: integer(stats?.used),
    },
    controls: controlsReport(g?.input),
    unavailable: {
      shotsFired: 'unavailable: no run-wide shot counter',
      skillUsageShare: 'unavailable: no run-wide skill usage telemetry',
      satisfaction: 'unavailable: no human feedback collected',
    },
    measurementNotes: 'null 表示来源缺失或数据无效；不估算。时长为模拟秒数，承伤来自 tel.dmgBy；有界集合仅展示当前配置。',
  };
}
