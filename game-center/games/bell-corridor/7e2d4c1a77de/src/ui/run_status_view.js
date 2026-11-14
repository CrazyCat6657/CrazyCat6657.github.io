// 局内状态展示 —— 纯函数模块（WB-1 / 2026-10-14）。
//
// 这里回答两个玩家实测评判过的问题：
//   1) "我手上这把枪到底吃的是法力还是普通备弹？"（试玩反馈：每把枪独立法力池，
//      切枪像'回满'，而 HUD 完全不说明。）
//   2) "这一局到底还有没有复苏？为什么没有？"（试玩反馈：Boss 前死亡没有复苏提示，
//      玩家误以为是 bug；实际是难度/本局策略关闭，HUD 没有指示。）
//
// 契约（被 status_view.test.mjs 与文档共同锁定）：
//   - 只做"翻译"：输入是调用方从实际消费者（player / game.runPolicy / game.revival）
//     读到的快照，输出是文案与等级；不读 DOM、不读 meta 偏好、不做任何写入。
//   - 数值来源必须是实例上的真实字段：武器 def.ammoType / reserve / ammoMax（法力上限），
//     复苏 runPolicy / revival.status / revival.runId（本局身份）。
//   - 没有可信任的本局状态时不显示、不捏造（例如"剩余 1 次"这类凭偏好猜出来的话术）。
//   - 本模块不 import 任何东西（可以在 Node 里裸跑纯函数测试）。

// 法力说明里的一句人话：为什么切枪看起来'法力满了'。
export const MANA_NOTE = '每把法力枪独立，当前手持枪会回复';

// "低法力"只是显示阈值（用于提醒，不影响任何玩法判定）：
// 当前法力低于上限的这个比例时，HUD 把法力标记改成提醒色。
export const LOW_MANA_FRACTION = 0.25;

// 与 src/game/revival.js 的 validateRevival 枚举保持一致（只读镜像）。
export const REVIVAL_STATUSES = ['ready', 'pending', 'used', 'disabled', 'ended'];

const isPlainObject = (v) => !!v && typeof v === 'object';

// 展示用数字：法力会随回复变成小数（reserve 是浮点累加），显示取整会更好读。
// 对有限备弹（本来就是整数）无影响。∞ 保持原样。
export function displayNumber(v) {
  if (v === Infinity || v === Number.POSITIVE_INFINITY) return '∞';
  if (!Number.isFinite(v)) return '?';
  return String(Math.floor(v));
}

// ------------------------------------------------------------
//  武器资源：普通备弹 / 法力 / 无限备弹
//
//  分类只看实例上的真实字段（与任务书口径一致）：
//    - def.ammoType === 'mana'           → 法力（池=reserve，上限=manaCap 或 ammoMax）
//    - def.ammoType 存在且 reserve 有限   → 普通备弹（开火/换弹真的从 reserve 里扣）
//    - 其余（无 ammoType / reserve=∞）    → 无限备弹（不会打空）
//  注意：noReload（无弹匣机制）刻意不参与这个分类 —— 它是机制标记
//  （由测量工具与审计清单单独记录），HUD 只需要回答"吃不吃备弹、看不看得到池"。
// ------------------------------------------------------------
export function weaponResourceView(input = {}) {
  const ammoType = input.ammoType;
  const reserve = input.reserve;
  const mag = input.mag;
  const finiteReserve = Number.isFinite(reserve);
  // 后缀与旧 HUD 行为一致：有 ammoType 才显示 "/ 备弹或∞"，否则只显示弹匣数。
  const suffix = ammoType ? ` / ${displayNumber(reserve)}` : '';
  const ammoText = `${Number.isFinite(mag) ? mag : 0}${suffix}`;

  if (ammoType === 'mana') {
    // 上限优先取真实消费者 player.manaCap()（手持枪时由 HUD 传入）；
    // 非手持槽没有该消费者，退回该枪自己的 ammoMax，再退回 manaCap 的默认 120。
    const cap = Number.isFinite(input.manaCap) && input.manaCap > 0
      ? input.manaCap
      : (Number.isFinite(input.ammoMax) && input.ammoMax > 0 ? input.ammoMax : 120);
    const low = finiteReserve && cap > 0 && reserve < cap * LOW_MANA_FRACTION;
    return {
      kind: 'mana',
      label: '法力',
      ammoText,
      low,
      manaNote: input.sharedMana ? `角色共享法力 ${displayNumber(reserve)}/${cap} · 所有法术与治疗共用，自动回复` : `当前枪法力 ${displayNumber(reserve)}/${cap} · ${MANA_NOTE}`,
    };
  }
  // 没有 ammoType 的武器在两条开火路径里都不会扣 reserve（换弹直接填满），
  // 无论 reserve 字段是数是∞，对玩家都是"不会打空"。
  if (!ammoType || !finiteReserve) {
    return { kind: 'infinite', label: '无限备弹', ammoText, low: false, manaNote: null };
  }
  return { kind: 'reserve', label: '普通备弹', ammoText, low: false, manaNote: null };
}

// 法力说明只跟随"当前手持"的那把枪：切枪后旧枪不该继续挂着说明，
// 否则玩家会以为两把都在回复。held=true 且视图带说明时才返回文案。
export function weaponHeldNote(view, held) {
  return held && view && view.manaNote ? view.manaNote : null;
}

// ------------------------------------------------------------
//  本局复苏状态
//
//  权威字段（全部来自本局，不读 meta 偏好）：
//    game.mode / game.state       —— 是否处于"局内可操作"语境
//    game.runId + revival.runId   —— 本局身份，必须一致
//    revival.status               —— ready / pending / used / disabled / ended
//    runPolicy.difficulty / revivalChoice / revivalAllowed —— disabled 的原因来源
//
//  为什么必须按存档策略而不是当前 Meta：冷恢复（读档继续）时玩家可能已经改过
//  难度偏好；UI 若按当前偏好描述，就会把"这一局本来就没有复苏"说成"有"。
// ------------------------------------------------------------
export function runRevivalView(input = {}) {
  const { mode, state, runId, runPolicy, revival } = input;
  // 只在大厅之外的局内语境显示：大厅 / 标题 / 死亡结算 / 胜利演出都不保留。
  if (mode !== 'run' || state !== 'play') return null;
  if (typeof runId !== 'string' || !runId) return null;
  if (!isPlainObject(revival)) return null;           // 旧档缺字段：不显示，不捏造
  if (revival.runId !== runId) return null;           // 不是本局的残留：不显示
  const status = revival.status;
  if (!REVIVAL_STATUSES.includes(status)) return null; // 未知枚举：不显示

  switch (status) {
    case 'ready':
      return { status, tone: 'ready', label: '本局复苏 · 可用', detail: '倒下时可接受一次复苏' };
    case 'pending':
      return { status, tone: 'pending', label: '本局复苏 · 待确认', detail: '正在确认是否接受复苏' };
    case 'used':
      return { status, tone: 'used', label: '本局复苏 · 已使用', detail: '本局已接受过一次复苏' };
    case 'ended':
      return { status, tone: 'used', label: '本局复苏 · 已结束', detail: '本局已按结束结算' };
    case 'disabled':
      return { status, tone: 'off', label: '本局复苏 · 不可用', detail: disabledReason(runPolicy) };
    default:
      return null;
  }
}

// disabled 的原因必须区分三种来源（任务书 WB-1.4）：
//   挑战难度强制关闭 / 标准难度本局未开启 / 历史策略未启用。
// 只根据本局 runPolicy 判断；策略缺失时如实说"未记录"，不猜。
export function disabledReason(runPolicy) {
  if (!isPlainObject(runPolicy)) return '这局没有记录复苏设置，按不可用处理';
  const choice = runPolicy.revivalChoice;
  if (runPolicy.difficulty === 'challenge' || choice === 'disabled') return '挑战难度强制关闭';
  if (choice === 'legacy-off') return '这局沿用了旧规则，没有启用复苏';
  if (choice === 'explicit-off' || runPolicy.revivalAllowed === false) return '本局未开启（标准难度 · 出征前可设置）';
  return '本局未启用复苏';
}
