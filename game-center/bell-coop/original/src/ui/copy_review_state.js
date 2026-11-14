// Rendered-instance feedback, deliberately separate from source-template approval.
export const COPY_REVIEW_KEY = 'text-review:ingame:v7';
export const DECISIONS = Object.freeze({approved:'这句可以', edited:'已修改', issue:'这里有问题'});
const MAX_ROWS=5000, MAX_TEXT=16000;
export const copyRecordId = r => JSON.stringify([r.scene,r.path,r.original]);
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function newCopyReview(basis){return {kind:'text-review-ingame',formatVersion:1,basis,records:[]};}
export function validateCopyReview(raw,basis){
  if(raw?.kind!=='text-review-ingame'||raw.formatVersion!==1||!equal(raw.basis,basis))throw Error('这份草稿来自其他版本，未覆盖本机记录。请保留原文件交给开发者。');
  if(!Array.isArray(raw.records)||raw.records.length>MAX_ROWS)throw Error('草稿记录格式或数量无效。');
  const ids=new Set();
  for(const r of raw.records){
    if(!r||!['scene','path','original','draft','notes','context','updatedAt'].every(k=>typeof r[k]==='string'&&r[k].length<=MAX_TEXT)||!r.original.trim()||!Object.hasOwn(DECISIONS,r.decision)||r.id!==copyRecordId(r)||ids.has(r.id))throw Error('草稿记录不完整或重复，未导入。');
    if(r.decision==='edited'&&!r.draft.trim())throw Error('修改稿不能为空。');
    ids.add(r.id);
  }
  return structuredClone(raw);
}
export function saveCopyRecord(state,record){
  const row={...record,id:copyRecordId(record),updatedAt:new Date().toISOString()};
  const next={...state,records:[...state.records.filter(r=>r.id!==row.id),row]};
  return validateCopyReview(next,state.basis);
}
export function mergeCopyReviews(state,incoming){
  const other=validateCopyReview(incoming,state.basis),byId=new Map(state.records.map(r=>[r.id,r]));
  let added=0,protectedCount=0;
  for(const r of other.records){if(byId.has(r.id)){if(!equal(byId.get(r.id),r))protectedCount++;continue;}byId.set(r.id,r);added++;}
  return {state:{...state,records:[...byId.values()]},added,protectedCount};
}
export function copyReviewMarkdown(state){
  return '# 沉钟回廊 · 游戏内文案审校意见\n\n以下为真实画面中的文字及人工意见。动态数字按遇到时记录，不自动替换程序模板。\n\n'+state.records.map((r,i)=>`## ${i+1}. ${DECISIONS[r.decision]}\n\n场景：${r.scene}\n\n画面信息：${r.context}\n\n原文：\n\n${r.original}\n\n${r.decision==='edited'?`修改为：\n\n${r.draft}\n\n`:''}意见：${r.notes||'无补充'}\n`).join('\n');
}
