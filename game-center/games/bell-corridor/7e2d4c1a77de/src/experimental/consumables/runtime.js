import {PAGE_COMBAT_MODE} from '../combat/mode.js';
import * as C from './index.js';
import {captureConsumableHost} from './host_state.js';
import {captureSessionDraft,validateSession} from '../../game/session.js';
import {acquisitionProjection,publishAcquisition,publishDrops} from '../../game/acquisition_projection.js';
import {planEquipmentDrops,spawnPlannedEquipment} from '../../game/equipment_drops.js';
import {pickupReady,pickupPathClear} from '../../game/pickup_path.js';
import {saveStore} from '../../game/save.js';
import {meta} from '../../game/meta.js';

const requests=new WeakMap();
const PRICES={heal_draught:10,rage_tonic:12,veil_tonic:10,ward_tonic:12,stamina_tonic:6,cleanse_tonic:6};
const IDLE=Object.freeze({damageMult:1,fireRateMult:1,invisible:false,suppressNewLocks:false,armorPoints:0,armorRemaining:0,active:[]});
export function consumablesEnabled(g) { return !!(g?.experiment && g.consumables && g.mode==='run'); }
function available(g,{allowPanel=false}={}) {
  return consumablesEnabled(g) && g.state==='play' && g.player?.alive && !g.paused && !g._restoring && !g._importing &&
    !g.revivalPending && !saveStore.blocked && !saveStore.readError && !g._storageRecovery && !g.buildOpen &&
    (!g.panelOpen?.() || allowPanel&&['experimental-consumable-supply','experimental-consumable-pickup'].includes(g.hud?._hub?.cfg?.page));
}
export function consumableContext(g,{allowPanel=false}={}) {
  const p=g.player;
  return {alive:!!p?.alive,paused:!available(g,{allowPanel}),mode:g.mode,hp:p?.hp,hpMax:p?.maxHp,
    canHeal:!g.mod_?.noHealing && !p?.stats?.noHealing,healBlockedReason:'当前规则不允许治疗',
    stamina:g.experiment?.stamina,staminaMax:g.experiment?100:undefined,
    // Current players have no negative-status container. slowT is a friendly
    // enemy-time debuff, NOT a player ailment; never put it in this list.
    statuses:[]};
}
export function consumableModifiers(g) { return consumablesEnabled(g)?C.getModifiers(g.consumables):IDLE; }
export function consumableView(g) { return consumablesEnabled(g)?C.getView(g.consumables,consumableContext(g)):null; }
function requestId(g) {
  let n=requests.get(g)||0,id;
  do {n++;id=`cons:${g.runId}:${g.consumables.clock}:${g.consumables.revision}:${n}`;} while(g.consumables.requests.some(r=>r.id===id));
  requests.set(g,n);return id;
}
function feedback(g,r) { if(r?.feedback)g.toast?.(r.ok?'消耗品':'未使用',r.feedback.text,r.ok?'#9ddbd4':'#ffcf6a',r.ok?'quick':'fail'); }
export function applyConsumableCommands(ctx,list) {
  for(const cmd of list||[]) {
    if(cmd.type==='heal') {if(!ctx.player.heal(cmd.amount,'consumable'))throw Error('当前治疗入口拒绝，药剂已保留');}
    else if(cmd.type==='restoreStamina') {
      ctx.experiment.stamina=Math.min(100,ctx.experiment.stamina+100*cmd.ratio);
      if(ctx.experiment.stamina>=20)ctx.experiment.exhausted=false;
    } else if(cmd.type==='cleanse') throw Error('当前没有可净化的玩家负面状态，药剂已保留');
    else throw Error('未知药剂命令');
  }
}
// Plan on detached session/player data; only publish a confirmed durable write.
function commit(g,result,{source=null,dropped=[],cost=0,purchaseKey=null}={}) {
  if(!result.ok || result.duplicate)return result;
  try {
    const draft=captureSessionDraft(g),metaDraft=structuredClone(meta.data);
    const projection=acquisitionProjection(g,draft,metaDraft),ctx=projection.game;
    ctx.experiment=structuredClone(g.experiment);ctx.consumables=result.next;
    ctx.consumablePurchases=[...(g.consumablePurchases||[])];
    if(source) {
      const at=g.pickups.list.indexOf(source);if(at<0 || source.collected)throw Error('地面物品已改变');
      draft.roomStates[g.room.uid].pickups.splice(at,1);
    }
    if(cost>ctx.player.coins)throw Error('金币不足');
    ctx.player.coins-=cost;
    if(cost>0)ctx.telCoins?.('out','consumable',cost);
    if(purchaseKey)ctx.consumablePurchases.push(purchaseKey);
    applyConsumableCommands(ctx,result.commands);
    if(dropped.length) {
      const plan=planEquipmentDrops(ctx,dropped.map(d=>({kind:'consumable',id:d.itemId,amount:d.count})));
      spawnPlannedEquipment(ctx,plan);
    }
    projection.finish();draft.experiment=structuredClone(ctx.experiment);draft.consumables=captureConsumableHost(ctx);
    validateSession(draft,{combatMode:PAGE_COMBAT_MODE});
    const written=saveStore.write(metaDraft,draft);
    if(written.committed!==true) {
      if(saveStore.blocked)g.openStorageRecovery?.();
      throw Error(written.error||'保存未确认，药剂与金币已保留');
    }
    try {
      publishAcquisition(g,draft);
      g.experiment.stamina=draft.experiment.stamina;g.experiment.exhausted=draft.experiment.exhausted;
      g.consumables=ctx.consumables;g.consumablePurchases=ctx.consumablePurchases;
      publishDrops(g,projection.drops);
      if(source){source.collected=true;g.pickups.remove(source);}
      g.roomStates.set(g.room.uid,structuredClone(draft.roomStates[g.room.uid]));
      meta.data=metaDraft;meta._dirty=false;meta._clearActive=false;
    }catch(error){saveStore.blockWrites();g.openStorageRecovery?.();throw error;}
    feedback(g,result);return {ok:true};
  }catch(error){g.toast?.('消耗品未提交',error.message,'#ffcf6a','fail');return {ok:false,reason:error.message};}
}
export function useConsumable(g,slot) {
  if(!available(g))return {ok:false,reason:'当前不能使用药剂'};
  const r=C.prepareUse(g.consumables,slot,consumableContext(g),requestId(g));
  if(!r.ok){g.consumables=r.next;feedback(g,r);return r;}
  return commit(g,r);
}
export function consumableShopRows(g) {
  return C.ITEM_IDS.map(itemId=>({itemId,name:C.ITEM_DEFS[itemId].name,detail:C.ITEM_DEFS[itemId].short,price:PRICES[itemId],
    sold:(g.consumablePurchases||[]).includes(`${g.floor}:${itemId}`)}));
}
export function purchaseConsumable(g,itemId) {
  if(!available(g,{allowPanel:true}) || g.room?.type!=='shop')return {ok:false,reason:'只能在商店购买'};
  const offer=consumableShopRows(g).find(o=>o.itemId===itemId);
  if(!offer||offer.sold)return {ok:false,reason:'本层该药剂已售罄'};
  if(g.player.coins<offer.price)return {ok:false,reason:'金币不足'};
  const r=C.offerPickup(g.consumables,itemId,1);
  if(r.kind==='full')return {ok:false,reason:'四格已满，请先使用一格或拾取地面药剂时替换'};
  return commit(g,{ok:true,next:r.state,commands:[],feedback:{text:`购买${offer.name}`}}, {cost:offer.price,purchaseKey:`${g.floor}:${itemId}`});
}
function sourceReady(g,p,allowPanel=false) {
  return available(g,{allowPanel}) && p?.kind==='consumable' && C.isKnownItem(p.id) && Number.isInteger(p.amount) &&
    p.amount>0 && p.amount<=99 && g.pickups.list.includes(p) && !p.collected && pickupReady(p) &&
    Math.hypot(g.player.x-p.x,g.player.z-p.z)<=2.2 && pickupPathClear(g,g.player.x,g.player.z,p.x,p.z);
}
export function collectConsumable(g,p) {
  if(g.actorCount===2&&g.sessionStore)return g.sessionStore.collectPickup(p,g.playerId);
  if(!sourceReady(g,p))return false;
  const offer=C.offerPickup(g.consumables,p.id,p.amount);
  if(offer.kind!=='full')return commit(g,{ok:true,next:offer.state,commands:[],feedback:{text:`拾取${C.ITEM_DEFS[p.id].name}`}},
    {source:p,dropped:offer.overflow?[offer.overflow]:[]}).ok;
  const state=g.consumables,room=g.room,player=g.player;
  const owner={page:'experimental-consumable-pickup',title:'消耗品四格已满',sub:`${C.ITEM_DEFS[p.id].name} ×${p.amount}。替换会把旧药剂放回地面；取消保留双方物品。`,
    rows:[...state.slots.map((s,slot)=>({cn:`替换第${slot+1}格 · ${C.ITEM_DEFS[s.itemId].name} ×${s.count}`,slot,choice:'replace'})),
      {cn:'立即使用新药剂1个',choice:'useNow'},{cn:'取消 · 留在地面'}],
    onPick:row=>{
      if(g.hud._hub?.cfg!==owner || g.room!==room || g.player!==player || g.consumables!==state || !sourceReady(g,p,true))return;
      if(!row.choice){g.hud.closeHubPanel();return;}
      const r=C.resolvePickup(state,{incoming:{itemId:p.id,count:p.amount},choice:row.choice,slot:row.slot,requestId:requestId(g)},consumableContext(g,{allowPanel:true}));
      if(!r.ok){feedback(g,r);return;}
      if(commit(g,r,{source:p,dropped:r.dropped}).ok && g.hud._hub?.cfg===owner)g.hud.closeHubPanel();
    }};
  g.hud.hubPanel(owner);return false;
}
export function tickConsumables(g,dt) {
  if(!consumablesEnabled(g))return;
  const context=consumableContext(g);
  if(!g.player?.alive)context.paused=false;
  g.consumables=C.tick(g.consumables,dt,context);
}
export function notifyConsumableAttack(g) {
  if(consumablesEnabled(g))g.consumables=C.notifyAttack(g.consumables).next;
}
export function absorbConsumableDamage(g,amount) {
  if(!consumablesEnabled(g))return {absorbed:0,remainder:amount};
  const r=C.absorbDamage(g.consumables,amount);g.consumables=r.next;return r;
}
export function resetConsumableFloor(g) {if(consumablesEnabled(g))g.consumables=C.onFloorTransition(g.consumables);}
export function seedConsumableSamples(g) {
  if(PAGE_COMBAT_MODE !== 'experimental' || !consumablesEnabled(g))return;
  const entries=C.ITEM_IDS.map(id=>({kind:'consumable',id,amount:1}));
  const plan=planEquipmentDrops(g,entries).map(p=>({...p,armDelay:0,noReturn:false}));
  spawnPlannedEquipment(g,plan);
}
