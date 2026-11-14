import {combatPageMode, EXPERIMENT_STORAGE_PREFIX} from './experimental/combat/mode.js';
import {comparisonVariant,comparisonPrefix} from './experimental/comparison/config.js';
// The integrated game keeps daily progress. The workshop iframe uses its own slot.
export function weaponAssetStoragePrefix(search='') {
  const variant=comparisonVariant(search);if(variant)return comparisonPrefix(variant);
  if (combatPageMode(search) === 'experimental') return EXPERIMENT_STORAGE_PREFIX;
  return new URLSearchParams(search).get('weaponLab')==='1'
    ? 'ember-descent:weapon-assets' : 'ember-descent';
}
// Cooperative entry sets this before any Game/Meta import. Only an explicit
// fixed namespace is accepted; ordinary pages preserve their historical slots.
export const WEAPON_ASSET_STORAGE_PREFIX=globalThis.__bellPresentationStorage===true
  ? 'ember-descent:coop-presentation:v1' : weaponAssetStoragePrefix(globalThis.location?.search||'');
