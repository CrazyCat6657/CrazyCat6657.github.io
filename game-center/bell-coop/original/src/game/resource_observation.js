// Local, bounded observations only. Never read by gameplay decisions or RNG.
import {usesSharedMana,sharedManaCap} from './shared_mana.js';
export const RESOURCE_EVENT_LIMIT=128,RESOURCE_PAYMENT_LIMIT=240;
const num=n=>Number.isFinite(n)?n:0;
const str=s=>typeof s==='string'?s.slice(0,96):'';
const cloneDetail=(v,depth=0)=>{
  if(v===null||typeof v==='boolean')return v;
  if(typeof v==='number')return num(v);
  if(typeof v==='string')return str(v);
  if(depth>=3)return null;
  if(Array.isArray(v))return v.slice(0,8).map(x=>cloneDetail(x,depth+1));
  if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).filter(([k])=>!['__proto__','prototype','constructor'].includes(k)).slice(0,16).map(([k,x])=>[str(k),cloneDetail(x,depth+1)]));
  return null;
};
export function normalizeResources(raw){
  const empty={version:1,events:[],omitted:0,payments:[],omittedPayments:0,sequence:0};
  if(!raw||raw.version!==1)return empty;
  const nonneg=n=>Number.isSafeInteger(n)&&n>=0?n:0;
  const events=Array.isArray(raw.events)?raw.events:[],payments=Array.isArray(raw.payments)?raw.payments:[];
  return{...empty,events:events.slice(-RESOURCE_EVENT_LIMIT).filter(e=>e&&typeof e.kind==='string').map(e=>({
    seq:nonneg(e.seq),kind:str(e.kind),stage:str(e.stage),chapter:num(e.chapter),segment:num(e.segment),profile:str(e.profile),room:str(e.room),time:num(e.time),
    ...(e.key?{key:str(e.key)}:{}),...(e.before?{before:cleanSnapshot(e.before)}:{}),after:cleanSnapshot(e.after),detail:cloneDetail(e.detail)||{},
  })),omitted:nonneg(raw.omitted)+Math.max(0,events.length-RESOURCE_EVENT_LIMIT),
    payments:payments.slice(0,RESOURCE_PAYMENT_LIMIT).filter(p=>p&&typeof p.weapon==='string'&&Number.isFinite(p.amount)&&p.amount>=0).map(p=>({stage:str(p.stage),weapon:str(p.weapon),unit:str(p.unit),amount:p.amount})),
    omittedPayments:nonneg(raw.omittedPayments)+Math.max(0,payments.length-RESOURCE_PAYMENT_LIMIT),sequence:Math.max(nonneg(raw.sequence),...events.slice(-RESOURCE_EVENT_LIMIT).map(e=>nonneg(e?.seq)))};
}
function cleanSnapshot(s={}){
  if(!s||typeof s!=='object')s={};
  return{coins:num(s.coins),keys:num(s.keys),hp:num(s.hp),weapons:(Array.isArray(s.weapons)?s.weapons:[]).filter(w=>w&&typeof w==='object').slice(0,4).map(w=>({id:str(w.id),unit:str(w.unit),mag:num(w.mag),reserve:w.reserve===null?null:num(w.reserve),capacity:w.capacity===null?null:num(w.capacity),shared:!!w.shared})),mana:s.mana?{amount:num(s.mana.amount),capacity:num(s.mana.capacity)}:null};
}
export function resourceSnapshot(p){
  try {
  const shared=usesSharedMana(p);
  return cleanSnapshot({coins:p?.coins,keys:p?.keys,hp:p?.hp,mana:shared?{amount:p.mana,capacity:sharedManaCap(p)}:null,
    weapons:(p?.weapons||[]).map(w=>({id:w.def?.id,unit:w.def?.ammoType||'unlimited',mag:w.mag,reserve:w.def?.ammoType?w.reserve:null,capacity:w.def?.ammoType?Math.round(w.def.ammoMax*(p.stats?.ammoMaxMul||1)):null,shared:shared&&w.def?.ammoType==='mana'}))});
  }catch{return null;}
}
export function resourceContext(g){
  if(g?.mode!=='run'||g.attract||g._restoring||g._restoringRoom)return null;
  if(g.resourceContext)return g.resourceContext;
  const s=g.stage;if(g.flowVersion!==2||!s)return null;
  return{stage:str(s.stageKey),chapter:s.chapter,segment:s.segment,profile:str(s.profile||'compact')};
}
function ledger(g){
  const context=resourceContext(g);if(!context||!g.tel)return null;
  if(g.tel.resources?.version!==1)g.tel.resources=normalizeResources(null);
  return{context,data:g.tel.resources};
}
export function observeResource(g,kind,detail={},before=null,key=''){
  try{
    key=str(key);
    const state=ledger(g);if(!state)return;
    const {context,data}=state;
    if(key&&data.events.some(e=>e.kind===kind&&e.stage===context.stage&&e.key===key))return;
    const after=resourceSnapshot(g.player);if(!after){data.omitted++;return;}
    const row={seq:++data.sequence,kind,...context,room:str(g.room?.uid||g.resourceRoom),time:num(g.time),...(key?{key:str(key)}:{}),...(before?{before:cleanSnapshot(before)}:{}),after,detail:cloneDetail(detail)};
    data.events.push(row);if(data.events.length>RESOURCE_EVENT_LIMIT){data.events.shift();data.omitted++;}
  }catch{/* Observability must never turn a valid action into a failed action. */}
}
export function observePayment(g,w,amount){
  try{
    if(!(amount>0)||!Number.isFinite(amount)||!w.def?.ammoType)return;
    const state=ledger(g);if(!state)return;
    const {context,data}=state,weapon=str(w.def.id),unit=str(w.def.ammoType);
    const row=data.payments.find(p=>p.stage===context.stage&&p.weapon===weapon&&p.unit===unit);
    if(row){if(Number.isFinite(row.amount+amount))row.amount+=amount;else data.omittedPayments++;}
    else if(data.payments.length<RESOURCE_PAYMENT_LIMIT)data.payments.push({stage:context.stage,weapon,unit,amount});
    else data.omittedPayments++;
  }catch{/* No gameplay dependency. */}
}
export function resourceReport(g,result='active'){
  const final=resourceSnapshot(g.player);if(!final)return null;
  return{version:1,runId:str(g.runId),seed:num(g.seed),hero:str(g.hero?.id),result:str(result),ledger:normalizeResources(g.tel?.resources),final};
}
