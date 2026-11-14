import {pickupReady,pickupPathClear} from './pickup_path.js';
import {planEquipmentDrops} from './equipment_drops.js';
import {planCoopSupply,planCoopRewardClaim} from './coop_rewards.js';
import {applyFieldAltar} from './altar_effects.js';
const expect=(v,m)=>{if(!v)throw Error(m);};
export function altarUnavailable(w,p){const e=w.dungeon?w.dungeon.rooms.find(r=>r.uid===w.roomUid)?.event:w.room.event;if(!e)return '没有祭坛';return w.altarUses?.[w.roomUid]?'本间祭坛已使用':((e.id==='shrine_blood'||e.id==='shrine_armor')&&p.maxHp<=1)?'生命上限不足（须大于 1）':e.id==='shrine_gold'&&p.coins<25?'金币不足（需要 25）':e.id==='shrine_armor'&&p.armor>=5?'护甲已满（5）':'';}
export function planPartyBusiness(store,d,id,r){
 const w=d.world,a=d.actors[id],live=store.game.getActor(id),room=w.roomStates[w.roomUid],proto=Object.getPrototypeOf(store.game);
 if(!['profession-skill','profession-dismantle','profession-assemble','altar-preview','altar-use','supply-defer'].includes(r.kind))return null;
 if(r.kind==='supply-defer'){expect(live.hud._hub?.cfg.partyBinding==='supply','No supply panel');store.actorProjection(d,id).finish();w._partyLifecycle.routeDeferred[id]=w.flowVersion===2?'chapter-boss-completion':'first-floor-completion';return {kind:r.kind};}
 expect(a.player.alive&&w.state==='play'&&!w.paused,'Actor unavailable');
 const p=store.actorProjection(d,id),ctx=p.game;Object.assign(ctx,{state:w.state,paused:false,playerId:id,actorCount:2,roomScene:store.game.roomScene,_residentRooms:store.game._residentRooms,connectors:store.game.connectors,grc:n=>ctx.gr()<n,panelOpen:()=>false,aliveEnemyCount:()=>store.game.aliveEnemyCount(),scavengeWeaponLabel:proto.scavengeWeaponLabel});
 ctx.nearestGroundWeapon=player=>proto.nearestGroundWeapon.call(ctx,player);
 ctx.scavengeAssemble=player=>proto.scavengeAssemble.call(ctx,player);
 ctx.dismantleNearest=player=>proto.dismantleNearest.call(ctx,player);
 ctx.pickups.dismantle=pickup=>{expect(!pickup.recipientId||pickup.recipientId===id,'Weapon belongs to teammate');const index=room.pickups.indexOf(pickup);if(index<0)return false;if(pickup.offerId)w.coopRewards=planCoopRewardClaim(w.coopRewards,{runId:d.runId,eventId:`dismantle:${d.revision+1}:${pickup.pickupId}`,offerId:pickup.offerId,playerId:id}).ledger;room.pickups.splice(index,1);return true;};
 ctx.pickups.spawn=(kind,x,z,opts)=>p.spawnPlan([{kind,x,z,...opts,recipientId:id}])[0];
 ctx.spawnAttachment=(x,z)=>proto.spawnAttachment.call(ctx,x,z);
 if(r.kind.startsWith('profession-')){
  expect(a.hero==='scavenger'&&!live.view.panelOpen(),'Scavenger unavailable');
  expect(r.kind==='profession-skill'||a.heroRuleVersion!==3,'Use the original two-step scavenger skill');
  let result;if(r.kind==='profession-skill')result=proto.heroSkill.call(ctx);else if(r.kind==='profession-dismantle')result=ctx.dismantleNearest(p.player);else result=ctx.scavengeAssemble(p.player);
  expect(result,'Original scavenger action rejected');p.finish();return {kind:r.kind,preview:p.player.c2Integration?.preview||null,scrap:p.player.scrap};
 }
 const altar=live.view.interactables().find(it=>it.type==='altar'&&Math.hypot(a.player.x-it.x,a.player.z-it.z)<=it.radius);
 expect(altar&&pickupPathClear({roomScene:{ox:ctx.roomScene.ox,oz:ctx.roomScene.oz,colliders:ctx.roomScene.colliders.filter(c=>c.ref!==altar.prop)}},a.player.x,a.player.z,altar.x,altar.z),'Altar unreachable');
 if(r.kind==='altar-preview'){
  expect(!live.view.panelOpen()&&!a.choiceContext,'Actor already choosing');a.choiceContext={kind:'altar',actorId:id,roomUid:w.roomUid,token:`${d.revision+1}:${id}:altar`};a.choice={kind:'altar'};p.finish();return {kind:r.kind,choiceToken:a.choiceContext.token};
 }
 expect(a.choiceContext?.kind==='altar'&&a.choiceContext.roomUid===w.roomUid&&a.choiceContext.token===r.choiceToken,'Altar requires current preview confirmation');
 const why=altarUnavailable(w,p.player);expect(!why,why);const event=ctx.room.event,flag=`_used_${w.roomUid}`;
 ctx.rollWeaponId=n=>proto.rollWeaponId.call(ctx,n);ctx.rollItemId=()=>proto.rollItemId.call(ctx);ctx.flashSmall=(...args)=>p.effects.push({kind:'flash',args});ctx.hiddenRoomRevealed=r=>store.game.hiddenRoomRevealed(r);ctx.dungeon={list:w.dungeon.rooms};
 ctx.metaSee('event',event.id);
 if(['field_supply','field_infirmary'].includes(event.id)){
  const resources=event.id==='field_supply'?[['ammo',2],['key',1]]:[['heal',2],['armor',1]],entries=[];
  for(const [resource,baseAmount]of resources){const eventId=`altar:${Array.from(new TextEncoder().encode(w.roomUid),x=>x.toString(16).padStart(2,'0')).join('')}:${resource}`,supply=planCoopSupply(w.coopRewards,{runId:d.runId,eventId,source:'event-reward',resource,baseAmount});w.coopRewards=supply.ledger;for(const offer of supply.receipt.offers)entries.push({kind:offer.reward.kind==='coins'?'coin':offer.reward.kind,amount:offer.reward.amount,offerId:offer.offerId,sourceEventId:eventId,rewardSource:'event-reward'});}
  p.spawnPlan(planEquipmentDrops(ctx,entries));p.player[flag]=true;
 }else if(event.id.startsWith('field_')){const done=applyFieldAltar(p.player,event,flag);expect(done.ok,done.why);}else proto.useAltar.call(ctx);
 expect(p.player[flag],'Original altar did not apply');w.altarUses||={};w.altarUses[w.roomUid]=id;a.choice=null;a.choiceContext=null;p.finish();return {kind:r.kind,eventId:event.id};
}
