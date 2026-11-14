import {validDamageContext} from './damage_context.js';
// All C2 run state is plain data. Timers use simulated seconds; room-bound
// events carry stable IDs so later batches can discard them on room changes.
export function newHeroStateV3() {
  return {
    forgeT: 0, forgeCooldownAfter: 20, heatLock: 0, forgeHeatBudget: 0,
    echoT: 0, echoQueue: [], echoSequence: 0, bells: [],
    rangerWindow: 0, rangerGap: 0, rangerRecovery: 0, rangerUsed: 0,
    rangerMoveLeft: 0, rangerDir: { x: 0, z: 1 },
    escrowHp: 0, escrowT: 0,
    doctrineFloors: [], doctrinePending: null,
  };
}

const plainObject = v => v !== null && typeof v === 'object' && !Array.isArray(v) && Object.getPrototypeOf(v) === Object.prototype;
const finite = (v, max) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= max;
const id = v => typeof v === 'string' && v.length > 0 && v.length <= 128;
const unique = list => new Set(list).size === list.length;

function validEvent(event) {
  return plainObject(event) &&
    Object.keys(event).every(k => ['id', 'x', 'z', 'delay', 'remaining', 'roomUid', 'damage', 'rootShotId','damageContext'].includes(k)) &&
    (!Object.hasOwn(event,'damageContext')||validDamageContext(event.damageContext)) &&
    id(event.id) && id(event.roomUid) && id(event.rootShotId) &&
    typeof event.x === 'number' && Number.isFinite(event.x) && Math.abs(event.x) <= 1000 &&
    typeof event.z === 'number' && Number.isFinite(event.z) && Math.abs(event.z) <= 1000 &&
    finite(event.delay, 60) && finite(event.remaining, 60) && finite(event.damage, 100000);
}

export function validateHeroStateV3(p, heroId) {
  const s = p?.c2;
  const defaults = newHeroStateV3();
  if (!plainObject(s) || Object.keys(s).length !== Object.keys(defaults).length ||
      Object.keys(s).some(k => !Object.hasOwn(defaults, k))) throw new Error('职业 v3 状态无效：字段缺失或多余');
  for (const key of ['forgeT','forgeCooldownAfter','heatLock','echoT','rangerWindow','rangerGap','rangerRecovery','rangerMoveLeft','escrowT']) {
    if (!finite(s[key], 3600)) throw new Error(`职业 v3 状态无效：${key}`);
  }
  if (s.rangerWindow > 1.8 || s.rangerGap > .15 || s.rangerRecovery > 8 ||
      s.rangerMoveLeft > 26*.19*1.65*2 || !plainObject(s.rangerDir) ||
      Object.keys(s.rangerDir).length !== 2 || !Number.isFinite(s.rangerDir.x) ||
      !Number.isFinite(s.rangerDir.z) || Math.abs(s.rangerDir.x) > 1 || Math.abs(s.rangerDir.z) > 1 ||
      Math.hypot(s.rangerDir.x,s.rangerDir.z) > 1.001 ||
      (s.rangerMoveLeft > 0 && Math.hypot(s.rangerDir.x,s.rangerDir.z) < .999) ||
      (s.rangerUsed === 0 && (s.rangerWindow || s.rangerMoveLeft)) ||
      (s.rangerUsed === 2 && s.rangerWindow)) throw new Error('职业 v3 游侠状态无效');
  if (!Number.isSafeInteger(s.echoSequence) || s.echoSequence < 0 ||
      !Number.isInteger(s.rangerUsed) || s.rangerUsed < 0 || s.rangerUsed > 2 ||
      !finite(s.escrowHp, Math.min(3,p.maxHp ?? 1000)) ||
      (s.escrowHp === 0) !== (s.escrowT === 0) ||
      (s.escrowHp > 0 && (heroId !== 'emberoath' || s.escrowT > 7 || p.hp <= 0 || !p.alive || p.hp > p.maxHp - s.escrowHp + 1e-8))) throw new Error('职业 v3 资源状态无效');
  if (!finite(p.heat, 100)) throw new Error('职业 v3 炉热无效');
  if (!finite(s.forgeHeatBudget, 7.5)) throw new Error('职业 v3 积热预算无效');
  if (!Array.isArray(s.echoQueue) || s.echoQueue.length > 128 || !s.echoQueue.every(validEvent) ||
      !Array.isArray(s.bells) || s.bells.length > 3 || !s.bells.every(validEvent) ||
      !unique([...s.echoQueue, ...s.bells].map(e => e.id))) throw new Error('职业 v3 事件队列无效');
  if (!Array.isArray(s.doctrineFloors) || s.doctrineFloors.length > 3 ||
      !s.doctrineFloors.every(f => Number.isInteger(f) && f >= 1 && f <= 3) ||
      !unique(s.doctrineFloors)) throw new Error('职业 v3 教条楼层无效');
  const pending = s.doctrinePending;
  if (pending !== null && (!plainObject(pending) ||
      Object.keys(pending).length !== 3 || !['floor','candidates','picked'].every(k => Object.hasOwn(pending,k)) ||
      !Number.isInteger(pending.floor) || pending.floor < 1 || pending.floor > 3 ||
      s.doctrineFloors.includes(pending.floor) ||
      !Array.isArray(pending.candidates) || pending.candidates.length !== 5 ||
      !pending.candidates.every(id) || !unique(pending.candidates) ||
      !Array.isArray(pending.picked) || pending.picked.length > 2 ||
      !pending.picked.every(x => id(x) && pending.candidates.includes(x)) || !unique(pending.picked))) {
    throw new Error('职业 v3 教条选择无效');
  }
  // Hero-specific effects are dormant in P0, but every hero starts with the
  // same complete shape so a later hero change cannot inherit a stale queue.
  if (typeof heroId !== 'string' || !heroId) throw new Error('职业 v3 身份无效');
  return true;
}
