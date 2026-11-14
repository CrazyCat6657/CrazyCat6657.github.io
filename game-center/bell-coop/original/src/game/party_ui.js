import {relicRisk} from './relic_risks.js';
import {ITEM_MAP} from './data.js';
import {ATTACH_MAP} from './attachments.js';
import {DOCTRINE_MAP_V3} from './doctrines.js';
import {shopIdFor,shopRevision,planPurchase} from './shop_transaction.js';
const call=(v,kind,data={})=>v.partyCommand(v.sessionStore.request(kind,data));
export async function partyCollectUI(v,p){
 if(!p)return {ok:false};
 if(p.kind==='item'&&relicRisk(p.id,v.player).risky||p.kind==='attachment'&&v.player.spareAttachments.length>=v.player.spareCap()||p.kind==='consumable'&&v.consumables?.slots.every(Boolean))return call(v,'pickup-choice',{pickupId:p.pickupId});
 return call(v,'collect',{pickupId:p.pickupId});
}
export function showPartyChoice(v,record){
 const c=record.choice,q=record.choiceContext;if(!c||!q)return;
 if(q.kind==='altar'){const e=v.room.event;v.hud.hubPanel({partyTyped:true,partyBinding:'choice',title:e.cn,sub:`${e.desc} 当前生命 ${v.player.hp}/${v.player.maxHp} · 护甲 ${v.player.armor}/5 · 金币 ${v.player.coins}。取消不会扣资源或消耗机会。`,rows:[{cn:'接受契约',accept:true},{cn:'取消'}],onPick:row=>call(v,row.accept?'altar-use':'choice-cancel',{choiceToken:q.token})});return;}
 if(['relic','attachment','consumable'].includes(q.kind)&&q.pickupId){
  const p=v.pickups.list.find(p=>p.pickupId===q.pickupId);if(!p)return;
  const rows=q.kind==='attachment'?[...v.player.spareAttachments.map((id,index)=>({cn:`换下 ${ATTACH_MAP[id].cn}`,index,accept:true})),{cn:'取消'}]:q.kind==='consumable'?[...v.consumables.slots.map((slot,index)=>({cn:`替换第 ${index+1} 格`,index,accept:true})),{cn:'立即使用新药剂',useNow:true,accept:true},{cn:'取消'}]:[{cn:'接受并拾取',accept:true},{cn:'暂不拾取'}];
  const risk=q.kind==='relic'?relicRisk(c.id,v.player):null;
  v.hud.hubPanel({partyTyped:true,partyBinding:'choice',title:q.kind==='relic'?`遗物确认 · ${ITEM_MAP[c.id]?.cn}`:q.kind==='attachment'?'备用配件库已满 · 选择替换':'消耗品四格已满',sub:'确认后生效；暂不领取会留在地面。',rows,
   ...(risk?{relicPreview:{benefits:risk.benefits,costs:[...risk.costs,...risk.conditional],notes:[risk.context].filter(Boolean)}}:{}),
   onPick:async row=>{if(!row.accept){const cancelled=await call(v,'choice-cancel',{choiceToken:q.token});if(cancelled.ok)v.hud.closeHubPanel();return cancelled;}const result=await call(v,'collect',{pickupId:q.pickupId,choiceToken:q.token,...(row.index!==undefined?{replaceIndex:row.index}:{}),...(row.useNow?{useNow:true}:{})});if(result.ok)v.hud.closeHubPanel();return result;}});return;
 }
 if(q.kind==='shop'){
  v.hud.hubPanel({partyTyped:true,partyBinding:'choice',title:'武器槽已满 · 选择替换',sub:'旧枪与配件会按原规则放回地面。',rows:[...v.player.weapons.map((w,index)=>({cn:`换下 ${w.def.cn}`,index})),{cn:'取消购买'}],onPick:async row=>{if(row.index===undefined){const r=await call(v,'choice-cancel',{choiceToken:q.token});if(r.ok)v.hud.closeHubPanel();return r;}const r=await call(v,'shop-purchase',{shopId:q.shopId,revision:q.shopRevision,offerId:q.offerId,replaceIndex:row.index,choiceToken:q.token});if(r.ok)v.hud.closeHubPanel();return r;}});return;
 }
 if(c.kind==='doctrine' &&c.multi){
  v.hud.choicePanel({partyTyped:true,...c,title:'远征老兵 · 本层五选二',sub:'先选两条，再确认。',commitAsync:true,options:c.options.map(o=>({...DOCTRINE_MAP_V3[o.id],color:'#ffd24a'})),
   onToggle:o=>call(v,'doctrine-toggle',{choiceToken:q.token,doctrineId:o.id}),onConfirm:()=>call(v,'doctrine-confirm',{choiceToken:q.token})});return;
 }
 v.hud.choicePanel({partyTyped:true,...c,title:c.kind==='evolution'?'异兽进化':'本层奖励',sub:'选择一项奖励。',commitAsync:true,onPick:o=>call(v,'floor-choice-confirm',{choiceToken:q.token,optionId:o.id})});
}
// Explicit replacements only. Unlisted old single-actor bridges keep their guard.
export const PARTY_UI_METHODS=Object.freeze({
 checkAchievements(v,extra){const g=v.sessionStore.game,owner=g._partyCheckpointOwner;return owner?owner.queueAchievements(v.playerId,extra):Object.getPrototypeOf(g).checkAchievements.call(v,extra);},
 metaSee(v,kind,id){const g=v.sessionStore.game,owner=g._partyCheckpointOwner;return owner?owner.queueSeen(v.playerId,kind,id):Object.getPrototypeOf(g).metaSee.call(v,kind,id);},
 heroSkill(v){if(v.hero.id!=='scavenger')return Object.getPrototypeOf(v.sessionStore.game).heroSkill.call(v);return call(v,'profession-skill');},
 dismantleNearest(v){return call(v,'profession-dismantle');},
 scavengeAssemble(v){return call(v,'profession-assemble');},
 previewAltar(v){return call(v,'altar-preview');},
 useAltar(v){return call(v,'altar-use',{choiceToken:v.sessionStore.choiceContexts[v.playerId]?.token});},
 onPlayerDeath(v){return v.sessionStore.game._partyCheckpointOwner.actorDowned(v.playerId);},
 acceptRevival(v){return v.sessionStore.game._partyCheckpointOwner.queueLifecycle(v.playerId,'lifecycle.revive');},
 declineRevival(v){return v.sessionStore.game._partyCheckpointOwner.queueLifecycle(v.playerId,'lifecycle.decline');},
 openRevivalPanel(v){return v.sessionStore.game._partyCheckpointOwner.showRevival(v.playerId);},
 useStairs(v){return v.sessionStore.game._partyCheckpointOwner.queueLifecycle(v.playerId,'lifecycle.stairs');},
 useStageStairs(v){return PARTY_UI_METHODS.useStairs(v);},
 saveProgress(){return false;},
 closeTopPanel(v){const owner=v.topModal();if(owner==='build'){v.setBuild(false);return true;}if(owner==='choice'){if(v.hud._choice?.cfg.multi)return false;v.hud.closeChoice();return true;}if(owner==='hub'){v.hud.backHubPanel();return true;}return false;},
 useConsumable(v,slot){return call(v,'consumable-use',{slot});},
 purchaseConsumable(v,itemId){return call(v,'consumable-purchase',{itemId});},
 openChest(v,prop){return call(v,'chest-open',{chestId:prop?.saveId}).then(r=>{if(r.ok)v.toast('宝箱开启','两位队员各有一份同品质奖励。','#ffd24a','quick');return r;});},
 collectEquipmentPickup:partyCollectUI,
 offerRelicPickup(v,p){return call(v,'pickup-choice',{pickupId:p?.pickupId});},
 offerAttachmentReplacement(v,p){return call(v,'pickup-choice',{pickupId:p?.pickupId});},
 installBuildAttachment(v,id,index=v.player.weaponIndex,slotIndex=-1){return call(v,'attachment-install',{attachmentId:id,weaponInstanceId:v.player.weapons[index]?.assetInstanceId,slotIndex});},
 tryInstallAttachment(v,...args){return PARTY_UI_METHODS.installBuildAttachment(v,...args);},
 tryDetachAttachment(v,id,index=v.player.weaponIndex){return call(v,'attachment-detach',{attachmentId:id,weaponInstanceId:v.player.weapons[index]?.assetInstanceId});},
 tryDropSpareAttachment(v,index){return call(v,'attachment-drop',{index});},
 dropBuildWeapon(v,index,whole=false){return call(v,'weapon-drop',{weaponInstanceId:v.player.weapons[index]?.assetInstanceId,whole});},
 openFloorChoice(v){const record=v.sessionStore.lastCommitted?.actors[v.playerId];if(record?.choiceContext){showPartyChoice(v,record);return Promise.resolve({ok:true,reopened:true});}return call(v,v.hero.floorChoice==='doctrine'&&v.hero.ruleVersion===3?'doctrine-open':'floor-choice-open');},
 nextShopRequestId(v){return `shop-ui:${v.sessionStore.revision}:${++v.sessionStore.requestSerial}`;},
 purchaseShopOffer(v,r){return v.partyCommand({kind:'shop-purchase',roomUid:v.room.uid,...r});},
 buy(v,slot,disabled,replaceIndex){const index=v.roomScene.shopSlots.indexOf(slot);if(index<0||disabled)return {ok:false};const offerId=`slot:${index}`,data={shopId:shopIdFor(v),revision:shopRevision(v.shopTx,shopIdFor(v)),offerId,...(replaceIndex!==undefined?{replaceIndex}:{})},plan=planPurchase(v,{offerId,kind:'offer',replaceIndex});return call(v,plan.needReplace?'shop-choice':'shop-purchase',data);},
 buyService(v,id){return call(v,'shop-purchase',{shopId:shopIdFor(v),revision:shopRevision(v.shopTx,shopIdFor(v)),offerId:`service:${id}`});},
 claimSupplyOffer(v,supplyKey){return call(v,'supply-claim',{supplyKey}).then(r=>{if(r.ok){v.hud.closeHubPanel();v.reopenPendingSupplyPanel();}return r;});},
 openSupplyPanel(v,queue,title){const rows=queue.filter(key=>v.buildSupply?.rewardLedger[key]?.claimState==='offered').map(key=>({cn:`领取 · ${v.supplyLabel(v.buildSupply.rewardLedger[key].allocation)}`,key}));if(rows.length)v.hud.hubPanel({partyTyped:true,partyBinding:'supply',title:title||'路线必要装备',rows:[...rows,{cn:'暂不领取'}],onPick:row=>row.key?PARTY_UI_METHODS.claimSupplyOffer(v,row.key):call(v,'supply-defer').then(r=>{if(r.ok)v.hud.closeHubPanel();return r;})});},
 reopenPendingSupplyPanel(v){return PARTY_UI_METHODS.openPendingRouteSupply(v);},
 openPendingRouteSupply(v){const keys=Object.keys(v.buildSupply?.rewardLedger||{}).filter(k=>v.buildSupply.rewardLedger[k].mandatory&&v.buildSupply.rewardLedger[k].claimState==='offered');if(!keys.length)return false;PARTY_UI_METHODS.openSupplyPanel(v,keys);return true;},
});
