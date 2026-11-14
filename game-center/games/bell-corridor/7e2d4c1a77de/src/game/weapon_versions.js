import {INSTALLED_WEAPON_MAP,LEGACY_WEAPON_MAP,ARCHIVED_NATIVE_WEAPON_MAP,V2_WEAPON_MAP} from './data.js';
import {spellFromWeapon} from './spells.js';
const V1_WEAPON_MAP={...LEGACY_WEAPON_MAP,...ARCHIVED_NATIVE_WEAPON_MAP};
export function savedWeaponDefinition(w){
  if(!w||typeof w.id!=='string'||(w.source!==undefined&&typeof w.source!=='string'))throw Error('武器身份无效');
  const source=w.source??w.id.replace(/^spell_/,''),version=w.definitionVersion===undefined?1:w.definitionVersion;
  if(![1,2,3].includes(version))throw Error('武器定义版本不支持');
  const definitions=version===1?V1_WEAPON_MAP:version===2?V2_WEAPON_MAP:INSTALLED_WEAPON_MAP;
  if(w.id!==source&&w.id!==`spell_${source}`)throw Error('武器源身份不一致');
  const def=Object.hasOwn(definitions,source)?definitions[source]:null;
  if(!def||(version!==1&&def.weaponAssetVersion!==version))throw Error('武器定义版本未安装');
  return w.id.startsWith('spell_')?spellFromWeapon(def):def;
}
