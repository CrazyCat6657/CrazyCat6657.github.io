// Only consumers of already serialized weapons use this registry. New pools,
// training and the current catalog continue to use WEAPON_MAP / enabled IDs.
import {INSTALLED_WEAPON_MAP} from './data.js';
import {savedWeaponDefinition} from './weapon_versions.js';

export const ARCHIVED_BASE_IDS=['funnel_shotgun','conductive_sign','wax_seal','reversible_breech'];
export const ARCHIVED_PRECISION_IDS=['offset_duelist','split_decision','window_keeper','vent_rifle','metronome_carbine'];
export const ARCHIVED_GEOMETRY_IDS=['backstep_bellows','stopper_rail','weft_needle','bank_stamp','wall_clock','skipping_stone','angle_debt','mirror_slug'];
export const ARCHIVED_ENERGY_IDS=['storm_battery','ion_abacus','ember_seam','salt_cracker','kiln_seal'];
export const ARCHIVED_MECHANICAL_IDS=['chase_comet','chain_harpoon','return_post','bell_hound','procession_drum','recall_censer','escrow_cannon','empty_chamber','balance_ledger','folding_pike','mercy_invoice','reserve_mill'];
export const ARCHIVED_WEAPON_IDS=[...ARCHIVED_BASE_IDS,...ARCHIVED_PRECISION_IDS,...ARCHIVED_GEOMETRY_IDS,...ARCHIVED_ENERGY_IDS,...ARCHIVED_MECHANICAL_IDS];

// Old factories/snapshots use null as an absent state. Other present values
// must be plain records before any binding or serialization can normalize them.
export function validWeaponAssetStateShape(state){
  return state===undefined||state===null||typeof state==='object'&&Object.getPrototypeOf(state)===Object.prototype;
}

// Bare pregenerated rewards historically used the installed catalog at spawn.
// Held and serialized ground instances retain savedWeaponDefinition's v1 default.
export function pregeneratedWeaponDefinition(record){
  if(!record||typeof record.id!=='string')throw Error('武器身份无效');
  const source=record.source??record.id.replace(/^spell_/,'');
  const installed=Object.hasOwn(INSTALLED_WEAPON_MAP,source)?INSTALLED_WEAPON_MAP[source]:null;
  return savedWeaponDefinition({...record,definitionVersion:record.definitionVersion===undefined?(installed?.weaponAssetVersion||1):record.definitionVersion});
}
export function hasPregeneratedWeaponDefinition(record){
  try{pregeneratedWeaponDefinition(record);return true;}catch{return false;}
}
export function supportsInstalledAssetDefinition(def){
  if(![2,3].includes(def?.weaponAssetVersion))return false;
  try{return !!savedWeaponDefinition({id:def.id,source:def.sourceWeapon||def.id,definitionVersion:def.weaponAssetVersion});}catch{return false;}
}
