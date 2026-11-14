// Shared field-event effects: original Player methods, resources and caps.
import {ammoTargets} from './shared_mana.js';
export function applyFieldAmmo(player,units){let used=0;for(;used<units;used++){const targets=ammoTargets(player).filter(w=>w.def.ammoType&&w.reserve<Math.round(w.def.ammoMax*(player.stats.ammoMaxMul||1)));if(!targets.length)break;for(const w of targets)w.reserve=Math.min(Math.round(w.def.ammoMax*(player.stats.ammoMaxMul||1)),w.reserve+(w.def.ammoPickup||5));}return used;}
export function applyFieldAltar(candidate,event,flag){
 if(candidate[flag])return {ok:false,why:'此处补给已经领取'};
 if(event.id==='field_supply'){
  applyFieldAmmo(candidate,2);
  candidate.keys++;
 }else if(event.id==='field_infirmary'){
  candidate.heal(2,'event');candidate.armor=Math.min(5,candidate.armor+1);
 }else if(event.id==='field_arsenal'){
  for(let i=0;i<2;i++)candidate.game.spawnAttachment(candidate.x,candidate.z);
 }else return {ok:false,why:'未知补给'};
 candidate[flag]=true;return {ok:true};
}
