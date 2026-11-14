// Source-owned original Meta catalog and purchase/selection rules. No account
// service and no storage writes here; the authenticated host commits the result.
import {Meta,blankMeta} from '../game/meta.js';
import {HEROES,SIDEARMS,PAINTS,SUPPLIES,MODIFIERS} from '../game/heroes.js';
import {BUILD_ROUTES} from '../game/build_content_data.js';
const list={hero:HEROES,sidearm:SIDEARMS,paint:PAINTS,supply:SUPPLIES,route:[{id:'none',cn:'不选路线'},...BUILD_ROUTES],modifier:[{id:"",cn:"无词条",desc:"不附加挑战词条"},...MODIFIERS]};
export function coopProfileView(data){
 const m=new Meta({data:data||blankMeta()});
 return {souls:m.souls,selection:structuredClone(m.sel),catalog:Object.fromEntries(Object.entries(list).map(([kind,entries])=>[kind,entries.map(d=>({id:d.id,cn:d.cn||d.name,desc:d.desc||d.talent||d.loop||'',price:kind==="modifier"&&d.id===""?0:['hero','sidearm','paint','modifier'].includes(kind)?m.unlockPrice(kind,d.id):0,owned:kind==='hero'?m.hasHero(d.id):kind==='sidearm'?m.hasSidearm(d.id):kind==='paint'?m.hasPaint(d.id):kind==='modifier'?(!d.id||m.hasModifier(d.id)):true}))]))};
}
export function applyCoopProfile(data,request){
 const m=new Meta({data:data||blankMeta()});
 if(!request||!['profile.buy','profile.select'].includes(request.kind)||!list[request.category]?.some(d=>d.id===request.id))throw Error('无效的准备选择');
 const {category,id}=request;
 if(request.kind==='profile.buy'){if(!m.buyUnlock(category,id))throw Error('钟魂不足或此项尚未开放');}
 else {const owned={hero:()=>m.hasHero(id),sidearm:()=>m.hasSidearm(id),paint:()=>m.hasPaint(id),modifier:()=>!id||m.hasModifier(id),supply:()=>true,route:()=>true};if(!owned[category]())throw Error('请先解锁此项');m.setSel(category,id);}
 return {meta:structuredClone(m.data),view:coopProfileView(m.data)};
}
export function validateCoopSelection(data,build){
 const view=coopProfileView(data),selections={hero:build.heroId,paint:build.paint,sidearm:build.sidearm,supply:build.supply,route:build.route};
 for(const [category,id]of Object.entries(selections)){if(category==='sidearm'&&id===null)continue;if(!view.catalog[category].some(d=>d.id===id&&d.owned))throw Error('准备选择尚未解锁');}
 return true;
}
