// Candidate-only presentation; never reads or writes gameplay resources or saves.
import {E2_DETAILS} from '../game/text_e2_data.js';
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function e2KeyText(text,input){
  const actions={C:'hero_skill',E:'interact',F:'active',Q:'next_weapon',R:'reload',Tab:'build',TAB:'build',Shift:'dodge'};
  // Fixed menu E/Enter is intentionally untouched. Only explicit in-world instructions.
  return String(text??'').replace(/按(住)?\s*(TAB|Tab|Shift|C|E|F|Q|R)(?=[^A-Za-z0-9_]|$)/g,(all,hold,key)=>`按${hold||''} ${input?.label?.(actions[key])||key}`);
}
export function e2DetailsHTML(category,id,input,version=null){
  const rows=Object.values(E2_DETAILS).filter(e=>{
    if(e.category!==category||e.ownerId!==id)return false;
    if(version===null)return true;
    const expected=category==='hero'?e.ruleVersion:e.definitionVersion;
    return expected!==undefined&&version===expected;
  });
  if(!rows.length)return '';
  return `<details class="e2-rule-details"><summary>${safe(rows[0].label || '规则')} · 详情</summary>${rows.map(e=>`<p>${safe(e2KeyText(e.text,input))}</p>`).join('')}</details>`;
}
export function e2BuildDetails(player,input){
  const groups=[['hero',player.hero?.id,player.hero?.ruleVersion??1],...player.weapons.map(w=>['weapon',w.def.sourceWeapon||w.def.source||w.def.id.replace(/^spell_/, ''),w.def.weaponAssetVersion??1]),...player.weapons.flatMap(w=>(w.attachments||[]).map(id=>['attachment',id])),...(player.spareAttachments||[]).map(id=>['attachment',id]),...player.items.map(id=>['item',id]),...player.actives.map(id=>['active',id]),...(player.stats.synergies||[]).map(s=>['synergy',s.id])];
  const unique=[...new Map(groups.map(r=>[r.join('.'),r])).values()];
  return unique.map(([category,id,version])=>e2DetailsHTML(category,id,input,version??null)).filter(Boolean).join('');
}
