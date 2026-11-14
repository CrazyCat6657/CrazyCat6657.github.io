import {validateCombatState} from './controller.js';
import {comparisonVariant} from '../comparison/config.js';
// A full page navigation selects the mode before Meta/SaveStore are constructed.
export function combatPageMode(search = '') {
  const params = new URLSearchParams(search);
  const comparison=comparisonVariant(search);
  if(comparison)return comparison==='classic'?'classic':'experimental';
  return params.get('weaponLab') !== '1' && params.get('combatExperiment') === 'pass-d' ? 'experimental' : 'classic';
}
export const PAGE_COMBAT_MODE = combatPageMode(globalThis.location?.search || '');
export const EXPERIMENT_STORAGE_PREFIX = 'ember-descent:experiment:pass-d:v1';

export function validateCombatEnvelopeIdentity(envelope, mode = PAGE_COMBAT_MODE) {
  if (mode === 'experimental') {
    if (envelope?.combatMode !== 'pass-d') throw Error('实验入口仅接受独立实验存档，不能导入经典进度');
  } else if (envelope?.combatMode !== undefined && envelope.combatMode !== 'classic') throw Error('经典入口不能读取实验存档');
}
export function validateCombatSessionIdentity(session, mode = PAGE_COMBAT_MODE) {
  validateCombatEnvelopeIdentity(session, mode);
  if (mode === 'experimental') {
    const s=session.experiment;
    const supported=session.hero==='warden'&&s?.version===1&&['fixed','mixed'].includes(s.scheme) || session.hero==='foldshadow'&&s?.version===2&&s.scheme==='foldshadow';
    if (!supported || session.heroRuleVersion !== 3) throw Error('实验远征身份无效（仅支持守钟人规则1与折影者规则2）');
    validateCombatState(s);
  } else if (session.hero === 'foldshadow') {
    if (session.combatMode !== 'classic' || session.heroRuleVersion !== 3 || session.experiment?.scheme !== 'foldshadow') throw Error('正式折影者远征身份无效');
    validateCombatState(session.experiment);
  } else {
    if (Object.hasOwn(session, 'experiment')) throw Error('经典远征不能携带实验技能状态');
    if (Object.hasOwn(session, 'consumables')) throw Error('经典远征不能携带实验消耗品');
  }
}
