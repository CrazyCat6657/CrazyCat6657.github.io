import {DOCTRINES} from './doctrines.js';
import * as C from '../experimental/consumables/index.js';
import {restoreConsumableHost,captureConsumableHost} from '../experimental/consumables/host_state.js';
import {applyConsumableCommands,consumableShopRows} from '../experimental/consumables/runtime.js';
import {planEquipmentDrops} from './equipment_drops.js';
import {chestRules,chestFields} from './chest_rules.js';
import {planFirstShopInventory,planChestSupply,commitSupplyClaim,acquireRouteReward,applySimpleReward} from './build_supply_bridge.js';
import {planCoopSupply,planCoopChestOpen,COOP_SUPPLY_RESOURCES,COOP_SUPPLY_SOURCES} from './coop_rewards.js';
import {planPurchase,applyPurchaseToProjection,shopIdFor,shopRevision} from './shop_transaction.js';
import {rerollStock} from './economy.js';
import {pickupState,normalizeFoodPickup} from './objects.js';
import {pickupReady,pickupPathClear} from './pickup_path.js';
import {ATTACHMENTS} from './attachments.js';
import {EVOLUTIONS,applyCompanionEvolution} from './companion.js';
const copy=v=>structuredClone(v);
const expect=(ok,why)=>{if(!ok)throw Error(why);};
export const pickupInventory=a=>JSON.stringify([a.player.items,a.player.spareAttachments,a.player.weapons.map(g=>[g.assetInstanceId,g.attachments])]);
function ground(d,kind,x,z,opts={}){
 const w=d.world,p=pickupState(kind==='coins'?'coin':kind,x,z,{...opts,pickupId:`party-pickup:${++w.pickupSerial}`},w.pickupClock);
 w.roomStates[w.roomUid].pickups.push(p);return p;
}
export function planPartySources(store,d,actorId){
 const w=d.world,queue=w.rewardQueue||[];expect(queue.length,'No queued party rewards');store.actorProjection(d,actorId).finish();
 for(const source of queue){
  expect(source.roomUid===w.roomUid,'Queued reward room changed');
  if(source.kind==='shop'){
   if(w.partyShops?.[w.roomUid])continue;
   const legacy=roomStock(w),shared=copy(legacy),proposals=[];
   for(const id of ['player','player2']){const projection=store.actorProjection(d,id),ctx=projection.game;
    if(ctx.buildSupply&&w.floor===1&&!ctx.buildSupply.firstShopId){const plan=planFirstShopInventory(ctx,{roomId:w.roomUid,generation:0,legacyStock:legacy.slice(0,4)});proposals.push({id,stock:plan.inventory?.map(o=>o.allocation)});}projection.finish();}
   for(const [index,proposal]of proposals.entries())if(proposal.stock)for(let i=0;i<2;i++)shared[index*2+i]=copy(proposal.stock[i]);
   for(const id of ['player','player2']){const projection=store.actorProjection(d,id),ctx=projection.game;
    if(ctx.buildSupply&&!ctx.buildSupply.firstShopId){const selected=ctx.buildSupply.selectedRoute;ctx.buildSupply.selectedRoute=null;const plan=planFirstShopInventory(ctx,{roomId:w.roomUid,generation:0,legacyStock:shared.slice(0,4)});ctx.buildSupply=plan.supply;ctx.buildSupply.selectedRoute=selected;}projection.finish();}
   for(const sc of [w.roomStates[w.roomUid].scene,w.scenes[w.roomUid]]){sc.shopStock=copy(shared);sc.sold=shared.map(()=>false);}
   w.dungeon.rooms.find(r=>r.uid===w.roomUid).content.shopStock=copy(shared);
   w.roomStates[w.roomUid].pickups=w.roomStates[w.roomUid].pickups.filter(p=>!(p.shopIndex>=0));
   shared.forEach((item,i)=>{const slot=store.game.roomScene.shopSlots[i];if(slot){const p=ground(d,item.kind,slot.x,slot.z,{...item,y:slot.y});p.shopIndex=i;}});
   w.partyShops||={};w.partyShops[w.roomUid]=true;continue;
  }
  if(source.kind==='vault'){
   const projection=store.actorProjection(d,actorId),ctx=projection.game;
   if(ctx.gr()<.75){const pool=ATTACHMENTS.filter(a=>!ctx._attSeen?.has(a.id)),list=pool.length?pool:ATTACHMENTS,a=list[Math.floor(ctx.gr()*list.length)%list.length];ctx._attSeen||=new Set();ctx._attSeen.add(a.id);ground(d,'attachment',source.x,source.z,{id:a.id,attId:a.id,vy:3,sourceEventId:source.eventId,rewardSource:'room-clear'});}
   projection.finish();continue;
  }
  const resource=source.kind==='coins'?'coin':source.kind;
  expect(COOP_SUPPLY_RESOURCES.includes(resource)&&COOP_SUPPLY_SOURCES.includes(source.rewardSource),'Unknown free supply source');
  const result=planCoopSupply(w.coopRewards,{runId:d.runId,eventId:source.eventId,source:source.rewardSource,resource,baseAmount:source.opts.amount||1});
  w.coopRewards=result.ledger;
  if(result.transaction)for(const offer of result.receipt.offers)ground(d,offer.reward.kind,source.x,source.z,{...source.opts,amount:offer.reward.amount,offerId:offer.offerId,sourceEventId:source.eventId,rewardSource:source.rewardSource});
 }
 w.rewardQueue=[];return {kind:'world-rewards',count:queue.length};
}
export function planPartyRewardCommand(store,d,actorId,r){
 const w=d.world,a=d.actors[actorId],live=store.game.getActor(actorId),room=w.roomStates[w.roomUid];
 if(r.roomUid!==undefined)expect(r.roomUid===w.roomUid,'Stale party room');
 if(r.kind==='consumable-use'||r.kind==='consumable-purchase'){
  expect(a.experiment&&a.consumables,'Consumables disabled');const projection=store.actorProjection(d,actorId),ctx=projection.game,host=restoreConsumableHost(a.consumables);ctx.consumables=host.state;ctx.consumablePurchases=host.purchases;
  if(r.kind==='consumable-use'){expect(!live.view.panelOpen(),'Actor panel open');const result=C.prepareUse(ctx.consumables,r.slot,consumableContext(ctx),r.requestId);expect(result.ok,result.reason);ctx.consumables=result.next;applyConsumableCommands(ctx,result.commands);}
  else{expect(ctx.room.type==='shop','Not in shop');const offer=consumableShopRows(ctx).find(o=>o.itemId===r.itemId);expect(offer&&!offer.sold&&ctx.player.coins>=offer.price,'Consumable purchase unavailable');const result=C.offerPickup(ctx.consumables,r.itemId,1);expect(result.kind!=='full','Consumable inventory full');ctx.consumables=result.state;ctx.player.coins-=offer.price;ctx.consumablePurchases.push(`${w.floor}:${r.itemId}`);}
  a.consumables=captureConsumableHost(ctx);a.experiment=copy(ctx.experiment);projection.finish();return {kind:r.kind};
 }
 if(r.kind==='chest-open'){
  const prop=store.game.roomScene.props.find(p=>p.saveId===r.chestId),saved=[room.scene,w.scenes[w.roomUid]].map(s=>s.props.find(p=>p.id===r.chestId));
  expect(prop?.kind==='chest'&&(!prop.bossReward||store.game.room.cleared)&&!prop.opened&&saved.every(p=>p&&!p.opened)&&!live.view.panelOpen()&&!store.game.paused,'Chest unavailable');
  expect(Math.hypot(a.player.x-prop.worldX,a.player.z-prop.worldZ)<=2.5&&pathToProp(store.game,a.player,prop),'Chest unreachable');
  const rules=chestRules(prop);expect(a.player.keys>=rules.keyCost,'Insufficient keys');
  const bundles=[],details=[];
  for(const id of ['player','player2']){
   const projection=store.actorProjection(d,id),ctx=projection.game;
   // Scene construction already generated the authoritative quality pool. Keep
   // this pre-generated bundle; only the original route allocator may replace it.
   let loot=copy(prop.loot||[]);
   if(ctx.buildSupply&&!w.practice){const plan=planChestSupply(ctx,{roomId:w.roomUid,sourceOrdinal:Number.isInteger(prop.chestIndex)?prop.chestIndex:ctx.room.content.chests.length,baseLoot:loot,chest:prop});
    if(plan.planned){loot=plan.loot;ctx.buildSupply=plan.supply;ctx.grng.s=plan.rng.s;}}
   loot=loot.map(l=>l.kind==='compensation'?{...l,kind:'coins',amount:l.coins||15}:l).map(l=>{const q=normalizeFoodPickup(l.kind==='coins'?'coin':l.kind,{...l,fromChest:true},w.mod_,true);return {...q,...(q.kind==='coin'?{amount:Math.max(1,Math.round(q.amount*(w.mod_?.coinMul||1)))}:{}),kind:q.kind==='coin'?'coins':q.kind};});
   expect(loot.length,'Empty chest rewards');
   bundles.push({playerId:id,loot:loot.map(l=>['weapon','item','active','attachment'].includes(l.kind)?{kind:l.kind,id:l.id}:{kind:l.kind==='coin'?'coins':l.kind,amount:l.amount||1})});
   details.push({id,loot});projection.finish();
  }
  const chestId=partyChestId(w.roomUid,prop.saveId);
  const result=planCoopChestOpen(w.coopRewards,{runId:d.runId,eventId:chestId,source:'chest',chestId,openerId:actorId,chest:{quality:prop.quality,...chestFields(prop),...(prop.bossReward?{bossReward:true}:{})},rewards:bundles},{availableKeys:a.player.keys});
  w.coopRewards=result.ledger;a.player.keys-=rules.keyCost;
  let n=0;for(const {id,loot}of details)for(const l of loot){const offer=result.receipt.offers[n++],angle=n*2.399963229728653;
   const q={roomId:w.roomUid,t:.14*(n-1),kind:l.kind,x:prop.worldX+Math.cos(angle),z:prop.worldZ+Math.sin(angle),opts:{...copy(l),pickupId:`party-pickup:${++w.pickupSerial}`,recipientId:id,offerId:offer.offerId,sourceEventId:chestId,fromChest:true,vy:4.2,y:.9,coinSrc:'chest',healSrc:'chest'}};
   // Each owner gets a distinct newly acquired instance; a legacy carry ID may
   // be retained by the first owner only, never duplicated across inventories.
   if(id==='player2')delete q.opts.assetInstanceId;
   room.lootQueue.push(q);
  }
  for(const p of saved)Object.assign(p,{opened:true,opening:0,loot:copy(prop.loot)});
  w.pendingLoot=[...w.pendingLoot.filter(q=>q.roomId!==w.roomUid),...copy(room.lootQueue)];
  return {kind:r.kind,chestId:r.chestId,keyCost:rules.keyCost,rewards:result.receipt.offers.length};
 }
 if(r.kind==='shop-choice'){
  expect(!live.view.panelOpen()&&r.shopId===shopIdFor(live.view)&&r.revision===shopRevision(w.shopTx,r.shopId),'Stale shop choice');const slot=store.game.roomScene.shopSlots[Number(r.offerId.slice(5))];expect(slot&&!slot.sold&&Math.hypot(a.player.x-slot.x,a.player.z-slot.z)<=2.5,'Shop choice unreachable');const plan=planPurchase(live.view,{offerId:r.offerId,kind:'offer'});expect(plan.needReplace,'Shop replacement not required');store.actorProjection(d,actorId).finish();a.choiceContext={actorId,roomUid:w.roomUid,kind:'shop',shopId:r.shopId,shopRevision:r.revision,offerId:r.offerId,inventory:pickupInventory(a),token:`${d.revision+1}:${actorId}:shop`};a.choice={kind:'shop'};return {kind:r.kind,choiceToken:a.choiceContext.token};
 }
 if(r.kind==='shop-purchase'){
  expect(!store.game.paused&&(!live.view.panelOpen()||r.choiceToken&&a.choiceContext?.token===r.choiceToken),'Actor cannot shop now');
  if(r.choiceToken)expect(a.choiceContext?.kind==='shop'&&a.choiceContext.token===r.choiceToken&&a.choiceContext.inventory===pickupInventory(a)&&a.choiceContext.roomUid===w.roomUid&&a.choiceContext.offerId===r.offerId&&a.choiceContext.shopRevision===r.revision,'Stale shop replacement');
  expect(r.shopId===shopIdFor(live.view)&&r.revision===shopRevision(w.shopTx,r.shopId),'Stale shop request');
  const projection=store.actorProjection(d,actorId),ctx=projection.game;
  ctx.roomScene={shopSlots:store.game.roomScene.shopSlots.map((s,i)=>({...s,sold:!!room.scene.sold[i],item:copy(room.scene.shopStock[i]||s.item)}))};
  const service=r.offerId.startsWith('service:'),target=service?store.game.roomScene.serviceSlots.find(s=>s.id===r.offerId.slice(8)):ctx.roomScene.shopSlots[Number(r.offerId.slice(5))];
  expect(target&&Math.hypot(a.player.x-target.x,a.player.z-target.z)<=(service?2.4:2.5)&&pickupPathClear(store.game,a.player.x,a.player.z,target.x,target.z),'Shop unreachable');
  const planned=planPurchase(ctx,{offerId:r.offerId,kind:service?'service':'offer',replaceIndex:r.replaceIndex});expect(planned.ok,planned.reason||'Purchase rejected');
  applyPurchaseToProjection(projection,planned.plan,{price:planned.price});
  const plan=planned.plan;
  if(plan.soldSlot!==undefined){for(const sc of [room.scene,w.scenes[w.roomUid]])sc.sold[plan.soldSlot]=true;room.pickups=room.pickups.filter(p=>p.shopIndex!==plan.soldSlot);
   const ref=ctx.buildSupply&&Object.values(ctx.buildSupply.shopInventory).flat().find(o=>o.identity.roomId===w.roomUid&&o.identity.slotId===plan.soldSlot&&o.identity.generation===(ctx.room.content.servicesUsed?.reroll||0))?.allocationId;if(ref&&ctx.buildSupply)expect(commitSupplyClaim(ctx,ref).ok,'Invalid shop supply claim');}
  if(plan.serviceUsed)ctx.room.content.servicesUsed={...(ctx.room.content.servicesUsed||{}),[plan.serviceUsed]:(ctx.room.content.servicesUsed?.[plan.serviceUsed]||0)+1};
  if(plan.reroll){const stock=rerollStock(ctx.room.seed,(ctx.room.content.servicesUsed.reroll||1)-1,w.floor,{variant:ctx.room.content.shopVariant||'four-service',category:ctx.room.content.directedCategory||'key'});
   ctx.room.content.shopStock=copy(stock);for(const sc of [room.scene,w.scenes[w.roomUid]]){sc.shopStock=copy(stock);sc.sold=stock.map(()=>false);}room.pickups=room.pickups.filter(p=>!(p.shopIndex>=0));for(const [i,item]of stock.entries()){const slot=store.game.roomScene.shopSlots[i];if(slot){const p=ground(d,item.kind,slot.x,slot.z,{...item,y:slot.y});p.shopIndex=i;}}}
  if(r.choiceToken){a.choice=null;a.choiceContext=null;}w.shopTx.shops[r.shopId]=r.revision+1;projection.finish();return {kind:r.kind,offerId:r.offerId,price:planned.price,delivery:planned.delivery||'service'};
 }
 if(r.kind==='choice-cancel'){expect(a.choiceContext?.token===r.choiceToken,'Stale choice cancel');store.actorProjection(d,actorId).finish();a.choiceContext=null;a.choice=null;return {kind:r.kind};}
 if(r.kind==='pickup-choice'){
  const p=room.pickups.find(p=>p.pickupId===r.pickupId),actual=store.game.pickups.list.find(p=>p.pickupId===r.pickupId);
  expect(p&&actual&&pickupReady(actual)&&(!p.recipientId||p.recipientId===actorId)&&!live.view.panelOpen()&&Math.hypot(a.player.x-p.x,a.player.z-p.z)<=2.2&&pickupPathClear(store.game,a.player.x,a.player.z,p.x,p.z),'Pickup choice unavailable');
  expect(p.kind==='item'||p.kind==='attachment'||p.kind==='consumable','Invalid pickup choice kind');store.actorProjection(d,actorId).finish();
  a.choiceContext={actorId,roomUid:w.roomUid,kind:p.kind==='item'?'relic':p.kind,pickupId:p.pickupId,inventory:pickupInventory(a),consumableRevision:a.consumables?.inventory?.revision,token:`${d.revision+1}:${actorId}:pickup`};a.choice={kind:a.choiceContext.kind,pickupId:p.pickupId,id:p.id};return {kind:r.kind,choiceToken:a.choiceContext.token};
 }
 if(r.kind==='floor-choice-open'){
  const projection=store.actorProjection(d,actorId),hero=live.hero;expect(hero.floorChoice&&(hero.floorChoice!=='doctrine'||hero.ruleVersion!==3),'Use doctrine command');expect(!a.choiceContext,'Choice already pending');const floorKey=partyFloorRewardKey(w);expect(floorKey&&a.floorRewards?.[floorKey]==='offered','Floor reward is not authorized or already claimed');
  let options;if(hero.floorChoice==='doctrine')options=choose(projection.game,DOCTRINES,3);else if(hero.floorChoice==='attachment')options=choose(projection.game,ATTACHMENTS,3);else{expect(a.companion&&a.companion.stage<2,'Pet growth unavailable');options=a.companion.stage===1?EVOLUTIONS.filter(e=>e.id===a.companion.evo):choose(projection.game,EVOLUTIONS,3);}
  a.choice={kind:hero.floorChoice,options:options.map(o=>({id:o.id,cn:o.cn,desc:o.desc,color:o.color}))};a.choiceContext={actorId,kind:hero.floorChoice,roomUid:w.roomUid,floorKey,token:`${d.revision+1}:${actorId}:floor`};projection.finish();return {kind:r.kind,choiceToken:a.choiceContext.token};
 }
 if(r.kind==='floor-choice-confirm'){
  expect(a.choiceContext?.token===r.choiceToken&&a.choiceContext.roomUid===w.roomUid&&a.floorRewards?.[a.choiceContext.floorKey]==='offered'&&a.choice?.options?.some(o=>o.id===r.optionId),'Stale floor choice');const projection=store.actorProjection(d,actorId);
  if(a.choice.kind==='doctrine'){projection.player.doctrines.push(r.optionId);projection.player.recompute();}else if(a.choice.kind==='attachment')expect(projection.game.grantAttachmentReward(r.optionId),'No safe reward drop');else expect(applyCompanionEvolution(a.companion,r.optionId),'Invalid pet evolution');
  a.floorRewards[a.choiceContext.floorKey]='claimed';a.choice=null;a.choiceContext=null;projection.finish();return {kind:r.kind};
 }
 if(r.kind==='supply-claim'){
  const e=a.buildSupply?.rewardLedger[r.supplyKey];expect(e?.claimState==='offered','Supply offer unavailable');const projection=store.actorProjection(d,actorId),ctx=projection.game;
  expect(acquireRouteReward(ctx,e.allocation).ok,'Supply acquisition rejected');applySimpleReward(ctx,e.allocation);expect(commitSupplyClaim(ctx,r.supplyKey).ok,'Supply claim invalid');projection.finish();return {kind:r.kind};
 }
 return null;
}
function choose(ctx,pool,n){const list=pool.slice(),out=[];while(out.length<Math.min(n,pool.length))out.push(list.splice(Math.floor(ctx.gr()*list.length)%list.length,1)[0]);return out;}

function roomStock(w){return copy(w.roomStates[w.roomUid].scene.shopStock||[]);}

function consumableContext(ctx){return {alive:true,paused:false,mode:ctx.mode,hp:ctx.player.hp,hpMax:ctx.player.maxHp,canHeal:!ctx.mod_?.noHealing&&!ctx.player.stats.noHealing,stamina:ctx.experiment?.stamina,staminaMax:ctx.experiment?100:undefined,statuses:[]};}
export function planPartyConsumablePickup(projection,actor,source,r){
 expect(actor.experiment&&actor.consumables&&C.isKnownItem(source.id),'Consumable pickup invalid');const ctx=projection.game,host=restoreConsumableHost(actor.consumables);ctx.consumables=host.state;ctx.consumablePurchases=host.purchases;
 let result=C.offerPickup(ctx.consumables,source.id,source.amount),dropped=[];
 if(result.kind==='full'){expect(actor.choiceContext?.kind==='consumable'&&r.choiceToken===actor.choiceContext.token&&actor.choiceContext.consumableRevision===actor.consumables.inventory.revision,'Stale consumable choice');result=C.resolvePickup(ctx.consumables,{incoming:{itemId:source.id,count:source.amount},choice:r.useNow?'useNow':'replace',slot:r.replaceIndex,requestId:r.requestId},consumableContext(ctx));expect(result.ok,result.reason);ctx.consumables=result.next;applyConsumableCommands(ctx,result.commands);dropped=result.dropped||[];}
 else{ctx.consumables=result.state;if(result.overflow)dropped=[result.overflow];}
 if(dropped.length)projection.spawnPlan(planEquipmentDrops(ctx,dropped.map(o=>({kind:'consumable',id:o.itemId,amount:o.count}))));
 actor.consumables=captureConsumableHost(ctx);actor.experiment=copy(ctx.experiment);return true;
}

export function partyFloorRewardKey(w){return w.flowVersion===2?(w.stage?.segment===1&&w.stage.chapter>=2?`chapter:${w.stage.chapter}`:null):w.floor>=2?`floor:${w.floor}`:null;}
// Explicit internal authority used by lifecycle G; never a client command.
export function authorizePartyFloorRewards(store,draft){const key=partyFloorRewardKey(draft.world);expect(key,'No lawful floor reward at this stage');for(const id of ['player','player2']){const actor=draft.actors[id];actor.floorRewards||={};if(!actor.floorRewards[key])actor.floorRewards[key]='offered';store.actorProjection(draft,id).finish();}return {kind:'floor-rewards-authorized',floorKey:key};}
export function partyChestId(roomUid,saveId){const hex=s=>Array.from(new TextEncoder().encode(String(s)),b=>b.toString(16).padStart(2,'0')).join('');const id=`chest:${hex(roomUid)}:${hex(saveId)}`;expect(id.length<=128,'Chest identity exceeds ledger limit');return id;}
function pathToProp(world,p,prop){const dx=prop.worldX-p.x,dz=prop.worldZ-p.z,d=Math.hypot(dx,dz),end=Math.max(0,d-1.1);return d<1.1||pickupPathClear(world,p.x,p.z,p.x+dx/d*end,p.z+dz/d*end);}
