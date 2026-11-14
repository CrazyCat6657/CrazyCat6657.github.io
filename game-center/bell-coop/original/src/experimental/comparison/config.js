export const COMPARISON_VARIANTS=Object.freeze(['classic','fixed','mixed','foldshadow']);
export function comparisonVariant(search='') {
  const p=new URLSearchParams(search),v=p.get('combatCompare');
  return p.get('weaponLab')!=='1'&&COMPARISON_VARIANTS.includes(v)?v:null;
}
export const PAGE_COMPARISON=comparisonVariant(globalThis.location?.search||'');
export function comparisonSeed(requested,previous) {
  const seed=requested===undefined?(previous?.seed||3131):Number(requested);
  return Number.isInteger(seed)&&seed>=1&&seed<=4294967295?seed:null;
}
export function comparisonPrefix(variant) {
  if(!COMPARISON_VARIANTS.includes(variant))throw Error('未知对照路线');
  return `ember-descent:comparison:pass-d:${variant}:v1`;
}
function canonical(v) {
  if(Array.isArray(v))return v.map(canonical);
  if(v && typeof v==='object')return Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])]));
  return v;
}
export function layoutSignature(dungeon) {
  const rooms=dungeon.list.map(r=>({id:r.id,seed:r.seed,type:r.type,gx:r.gx,gy:r.gy,radius:r.radius,doors:r.doors,content:r.content}))
    .sort((a,b)=>a.id.localeCompare(b.id,'en'));
  const text=JSON.stringify(canonical(rooms));let hash=0x811c9dc5;
  for(let i=0;i<text.length;i++)hash=Math.imul(hash^text.charCodeAt(i),0x01000193)>>>0;
  return hash.toString(16).padStart(8,'0');
}
export function createComparisonFixture(g,variant=PAGE_COMPARISON) {
  if(!COMPARISON_VARIANTS.includes(variant))throw Error('未知对照路线');
  const w=g.player.weapons[0];
  return {version:1,variant,seed:g.seed,hero:g.hero.id,weapon:w.def.id,definitionVersion:w.def.weaponAssetVersion||1,
    difficulty:g.runPolicy.difficulty,flowVersion:g.flowVersion,layoutHash:layoutSignature(g.dungeon)};
}
export function comparisonMeta(data) {
  const copy=structuredClone(data);
  Object.assign(copy,{difficulty:'standard',revivalPref:'off',dev:false});
  Object.assign(copy.sel,{hero:'warden',sidearm:'pistol_rusty',modifier:'',paint:'orig',supply:'none',route:'none'});
  return copy;
}
export function validateComparisonEnvelopeIdentity(envelope,expected=PAGE_COMPARISON) {
  if(expected) {
    if(envelope?.comparisonMode!==expected)throw Error('对照入口只接受同路线的独立记录');
  }else if(Object.hasOwn(envelope||{},'comparisonMode'))throw Error('普通入口不能导入对照记录');
}
export function validateComparisonSessionIdentity(s,expected=PAGE_COMPARISON) {
  const f=s?.comparison;
  if(!expected) {if(Object.hasOwn(s||{},'comparison'))throw Error('普通远征不能携带对照条件');return;}
  const fields=['version','variant','seed','hero','weapon','definitionVersion','difficulty','flowVersion','layoutHash'];
  if(!f||typeof f!=='object'||Array.isArray(f)||Object.keys(f).length!==fields.length||fields.some(k=>!Object.hasOwn(f,k))||
    f.version!==1||f.variant!==expected||!COMPARISON_VARIANTS.includes(expected)||!Number.isInteger(f.seed)||f.seed<1||f.seed>4294967295||
    f.seed!==s.seed||f.hero!==(expected==='foldshadow'?'foldshadow':'warden')||f.hero!==s.hero||s.heroRuleVersion!==3||
    f.weapon!=='pistol_rusty'||f.definitionVersion!==2||f.difficulty!=='standard'||f.flowVersion!==1||
    !/^[a-f0-9]{8}$/.test(f.layoutHash)||s.flowVersion!==1||s.practice!==false||s.modifier!==''||
    s.runPolicy?.difficulty!=='standard'||s.runPolicy.revivalAllowed!==false)
    throw Error('对照条件无效，原记录保留');
  if(expected!=='classic' && s.experiment?.scheme!==expected)throw Error('对照方案与实验技能不一致');
}
