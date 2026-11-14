import { ITEM_MAP, ITEMS, SYNERGIES } from './data.js';
import { synergyMatches } from './build_effects.js';
import { BUILD_EFFECT_REGISTRY } from './build_effects.js';

const names = { standstill:'站定伤害', ammoFind:'弹药掉落增量（每点为5个百分点）', crit:'暴击率', critMul:'暴击倍率', dashMax:'冲刺次数', berserk:'缺血增伤（每缺1生命）',lifesteal:'击杀回血概率',twin:'追加普通弹概率',critBoom:'暴击爆炸强度', damage:'主攻击伤害', rate:'射速', speed:'移速', coins:'金币收入', maxHp:'生命上限', armor:'首次护甲', reload:'装填时间', dashCd:'冲刺回充时间', skillCd:'技能冷却时间', pickup:'拾取倍率' };
const lowerIsBetter = new Set(['reload', 'dashCd', 'skillCd']);
export function modifierCost(key, value) {
  return Number.isFinite(value) && (lowerIsBetter.has(key) ? value > 0 : value < 0);
}
function label(key, value) {
  const amount = ['maxHp','armor','dashMax','critMul','critBoom','ammoFind'].includes(key) ? value : Math.round(value * 100) + '%';
  return `${names[key] || key} ${value >= 0 ? '+' : ''}${amount}`;
}

// Static audit records every potential synergy penalty. Live pickup asks for
// consent only if this acquisition activates that penalty for the current build.
export function relicRisk(id, player = null) {
  const item = ITEM_MAP[id];
  if (!item) return { risky:false, benefits:[], costs:[], conditional:[] };
  const costs = Object.entries(item.mods).filter(([k,v]) => modifierCost(k,v)).map(([k,v]) => label(k,v));
  const potential = SYNERGIES.filter(s => s.req.some(r => r.item === id) && Object.entries(s.mods).some(([k,v]) => modifierCost(k,v)));
  const candidate = player ? Object.assign(Object.create(player), {items:[...player.items,id]}) : null;
  const active = potential.filter(s => !candidate || synergyMatches(s,candidate) && !synergyMatches(s,player));
  const conditional = potential.map(s => `${s.cn}（${player && active.includes(s) ? '当前新触发' : '满足装备/遗物条件时'}）：${s.desc}`);
  if (item.mods.maxHp < 0) costs.push(player ? `当前生命 ${player.hp}/${player.maxHp}；上限最低保留 1，超过新上限的生命会降到新上限` : '上限最低保留 1，超过新上限的生命会降到新上限');
  const benefits = Object.entries(item.mods).filter(([k,v]) => !modifierCost(k,v)).map(([k,v]) => label(k,v));
  return { risky:costs.length > 0 || active.length > 0, benefits, costs, conditional, activeConditional:active.map(s=>s.id), description:item.desc,
    context:player?.hero?.id === 'emberoath' && item.mods.heal ? '职业效果：满血且誓火未满时，治疗焚为誓火；缺血时仍回复生命。' : '' };
}

export function relicAudit() {
  return ITEMS.map(item => ({ id:item.id, name:item.cn, mods:item.mods, consumers:Object.keys(item.mods).map(k => `${k}→${BUILD_EFFECT_REGISTRY[k]?.destination}`), ...relicRisk(item.id) }));
}
