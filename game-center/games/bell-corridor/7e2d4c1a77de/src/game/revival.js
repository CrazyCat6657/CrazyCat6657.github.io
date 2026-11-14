// Task6 —— 每局一次的复苏（纯状态机）。
// 本模块不依赖 DOM / Meta 单例 / RNG / Player / localStorage：只做状态转换。
// 关键的"先存后发布"与战斗现场保留由 Game 负责，这里只保证状态本身合法且幂等。

export const REVIVAL_VERSION = 1;
// 原型参数（集中在这里，便于后续调平衡）。
export const REVIVAL = Object.freeze({
  version: REVIVAL_VERSION,
  healFraction: 0.5,     // 恢复最大生命的 50%
  minHeal: 1,            // 至少 1 点
  protectSeconds: 2,     // 接受后的保护时间
  maxHpCap: 1,           // maxHp 必须有限且至少 1
});

const plainRecord = (v) => !!v && Object.getPrototypeOf(v) === Object.prototype;

export function revivalHpAfter(maxHp) {
  if (!Number.isFinite(maxHp)) return REVIVAL.minHeal;
  return Math.max(REVIVAL.minHeal, maxHp * REVIVAL.healFraction);
}

// 本局策略：难度 + 是否允许复苏。开局冻结，之后不读后来改过的 Meta。
export function runPolicyFor(difficultyId, pref) {
  const difficulty = ['casual', 'standard', 'challenge'].includes(difficultyId) ? difficultyId : 'standard';
  if (difficulty === 'challenge') return { version: 1, difficulty, revivalAllowed: false, revivalChoice: 'disabled' };
  if (difficulty === 'casual') return { version: 1, difficulty, revivalAllowed: true, revivalChoice: 'default' };
  const on = pref !== 'off';
  return { version: 1, difficulty, revivalAllowed: on, revivalChoice: on ? 'explicit-on' : 'explicit-off' };
}

export function newRevivalState(runId, allowed) {
  return {
    version: REVIVAL_VERSION, runId,
    status: allowed ? 'ready' : 'disabled',
    pendingId: null, receipt: null, settlement: null,
  };
}

// 一次致命伤：ready → pending；disabled/used → final。
export function lethalTransition(revival, runId) {
  if (!revival || revival.runId !== runId) return { outcome: 'final' };
  if (revival.status === 'ready') {
    return {
      outcome: 'pending',
      next: { ...revival, status: 'pending', pendingId: `${runId}:revival:1`, receipt: null, settlement: null },
    };
  }
  if (revival.status === 'pending') return { outcome: 'pending', next: revival };  // 重入不新建 pendingId
  return { outcome: 'final' };
}

// 接受：只在合法 pending 上生效；同 requestId 重发只返回原结果，不再加血。
export function acceptRevival(revival, requestId, maxHp, runId) {
  if (!revival || revival.runId !== runId) return { ok: false, reason: '没有待复苏状态' };
  if (typeof requestId !== 'string' || !requestId || requestId.length > 120) return { ok: false, reason: '请求编号无效' };
  if (revival.status === 'used' && revival.receipt?.requestId === requestId) return { ok: true, replay: true, revival, hp: revival.receipt.hpAfter };
  if (revival.status === 'used') return { ok: false, reason: '复苏已经用过' };
  if (revival.status !== 'pending') return { ok: false, reason: '当前不可复苏' };
  const hp = revivalHpAfter(maxHp);
  return {
    ok: true, replay: false, hp,
    next: { ...revival, status: 'used', receipt: { requestId, pendingId: revival.pendingId, ok: true, hpAfter: hp } },
  };
}

// 拒绝 / 最终结算：只有 pending 可以；重复调用返回 false，不重复结算。
export function declineRevival(revival, runId) {
  if (!revival || revival.runId !== runId) return { ok: false };
  if (revival.status !== 'pending') return { ok: false };
  return { ok: true, next: { ...revival, status: 'ended', settlement: { key: `${runId}:settlement:dead`, result: 'dead' }, pendingId: null } };
}

// 最终结算门：记录一次死亡结算键，重复回调不再重复计数。
export function markSettled(revival, runId) {
  const base = revival && revival.runId === runId ? revival : newRevivalState(runId, false);
  if (base.settlement) return { already: true, next: base };
  return { already: false, next: { ...base, status: base.status === 'pending' ? 'ended' : base.status, pendingId: null, settlement: { key: `${runId}:settlement:dead`, result: 'dead' } } };
}

export function validateRevival(revival, runId) {
  if (revival === undefined || revival === null) return true;
  if (!plainRecord(revival) || revival.version !== REVIVAL_VERSION) throw new Error('复苏状态版本无效');
  if (typeof revival.runId !== 'string' || !revival.runId || revival.runId !== runId) throw new Error('复苏状态远征身份无效');
  if (!['ready', 'disabled', 'pending', 'used', 'ended'].includes(revival.status)) throw new Error('复苏状态无效');
  if (revival.status === 'pending' && (typeof revival.pendingId !== 'string' || !revival.pendingId || revival.receipt)) throw new Error('待复苏状态无效');
  if (revival.status === 'used' && (!plainRecord(revival.receipt) || revival.receipt.pendingId === undefined || typeof revival.receipt.requestId !== 'string')) throw new Error('复苏回执无效');
  if (revival.receipt !== null && revival.receipt !== undefined && !Number.isFinite(revival.receipt.hpAfter)) throw new Error('复苏回执数值无效');
  if (revival.settlement !== null && revival.settlement !== undefined && (typeof revival.settlement.key !== 'string' || revival.settlement.result !== 'dead')) throw new Error('复苏结算记录无效');
  return true;
}
