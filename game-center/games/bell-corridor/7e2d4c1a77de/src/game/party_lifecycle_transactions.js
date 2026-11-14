import {victoryVerdict} from './victory_copy.js';
import {bossDef} from './bosses.js';
import {planCompletionSupply} from './build_supply_bridge.js';
import {planChapterBossLoot} from './chapter_rewards.js';
import {ACHIEVEMENTS,ACH_REWARDS} from './achievements.js';
import {lethalTransition,acceptRevival,declineRevival,markSettled,revivalHpAfter,REVIVAL,validateRevival} from './revival.js';
import {resourceReport,observeResource} from './resource_observation.js';
const IDS=['player','player2'],expect=(v,m)=>{if(!v)throw Error(m);};
export function hasPartyAchievement(store,id,extra={}){const a=store.game.getActor(id),status=Object.getPrototypeOf(store.game).runCtx.call(a.view,extra);return ACHIEVEMENTS.some(ach=>{if(store.actorMeta[id].achievements.includes(ach.id))return false;try{return ach.check(status);}catch{return false;}});}
function achievements(store,d,id,ctx,extra={}){const a=d.actors[id],m=a.meta;ctx.run=d.world.run;ctx.companion=a.companion;ctx.activeModifier=d.world.activeModifier;const status=Object.getPrototypeOf(store.game).runCtx.call(ctx,extra);for(const ach of ACHIEVEMENTS){if(m.achievements.includes(ach.id))continue;let ok=false;try{ok=ach.check(status);}catch{}if(!ok)continue;m.achievements.push(ach.id);const r=ACH_REWARDS[ach.id]||{};m.souls+=r.souls||0;if(r.unlockModifier&&!m.modifiers.includes(r.unlockModifier))m.modifiers.push(r.unlockModifier);if(r.unlockSidearm&&!m.sidearms.includes(r.unlockSidearm))m.sidearms.push(r.unlockSidearm);}}
function revive(a){Object.assign(a.player,{alive:true,hp:Math.min(a.player.maxHp,revivalHpAfter(a.player.maxHp)),iframes:Math.max(a.player.iframes,REVIVAL.protectSeconds),deadAnim:0});a.personal.revivalPending=false;}
export function settlePartyDraft(store,d,result){
 const w=d.world,l=w._partyLifecycle;if(l.settled)return;
 l.settled={key:`${d.runId}:party:${result}`,result};l.barrier=null;w.state=result==='dead'?'dead':'victory';
 for(const id of IDS){const a=d.actors[id],projection=store.actorProjection(d,id),ctx=projection.game;
  a.personal.revival=markSettled(a.personal.revival,d.runId).next;a.personal.revivalPending=false;a.choice=null;a.choiceContext=null;
  a.meta.stats.kills+=(a.player.kills||0);
  if(result==='dead')a.meta.stats.deaths++;else if(result==='victory')a.meta.stats.wins++;
  ctx.seed=w.seed;observeResource(ctx,'run-end',{result},null,'end:'+d.runId);const report=resourceReport(ctx,result);if(report)a.meta.resourceObservation=report;
  ctx.tel.ended=result;achievements(store,d,id,ctx,{atVictory:result==='victory',winWithModifier:result==='victory'&&!!w.activeModifier});projection.finish();
 }
}
export function planPartyLife(store,d,id,r){
 const w=d.world,l=w._partyLifecycle,a=d.actors[id];expect(!l.settled,'Party already settled');
 if(r.kind==='party-seen'){
  const list=a.meta.seen[r.catalogKind];expect(Array.isArray(list),'Unknown party catalog');if(!list.includes(r.id))list.push(r.id);store.actorProjection(d,id).finish();return {kind:r.kind};
 }else if(r.kind==='party-achievements'){
  const p=store.actorProjection(d,id);achievements(store,d,id,p.game,r.extra||{});p.finish();return {kind:r.kind};
 }else if(r.kind==='party-floor-hook'){
  a.meta.stats.deepest=Math.max(a.meta.stats.deepest||0,w.floor);a.meta.reached[w.floor]=true;const p=store.actorProjection(d,id);p.game.emit('onFloorStart',{floor:w.flowVersion===2?w.stage.chapter:w.floor});p.finish();return {kind:r.kind};
 }else if(r.kind==='party-route-gate'){
  const source=w.flowVersion===2?'chapter-boss-completion':'first-floor-completion';
  for(const aid of IDS){const p=store.actorProjection(d,aid),ctx=p.game;if(ctx.buildSupply?.selectedRoute){const plan=planCompletionSupply(ctx,{roomId:w.roomUid,completionSource:source});ctx.buildSupply=plan.supply;if(plan.rng)ctx.grng.s=plan.rng.s;}p.finish();}
  return {kind:r.kind,source};
 }else if(r.kind==='party-finish'){
  expect(w.flowVersion===2&&w.stage.segment===5&&w.roomStates[w.roomUid].boss===null&&w.dungeon.rooms.find(q=>q.uid===w.roomUid).cleared,'Campaign not complete');
  expect(w.stage.campaignScope==='chapter1'&&w.stage.chapter===1||w.stage.campaignScope==='full3'&&w.stage.chapter===3,'Campaign scope incomplete');
  settlePartyDraft(store,d,w.stage.campaignScope==='chapter1'?'chapter-prototype':'victory');
 }else if(r.kind==='party-boss'){
  const room=w.roomStates[w.roomUid],key=w.stage?.stageKey||`floor:${w.floor}`,milestone=w.flowVersion===2?w.stageRun.milestones[key]:l.bosses;
  if(milestone?.boss||l.bosses[key]){store.actorProjection(d,id).finish();return {kind:r.kind,replay:true};}
  expect(room.boss&&!room.boss.alive,'Boss still alive');const bt=room.boss.bossType;
  for(const aid of IDS){const a=d.actors[aid],p=store.actorProjection(d,aid),ctx=p.game;
   if(w.flowVersion===2&&w.stage.contentVersion===3&&w.stage.chapter<3){const reward=planChapterBossLoot(ctx);p.spawnPlan(reward.plan.map(x=>({...x,recipientId:aid})));w.stageRun.rewards[`v2:${key}:boss:${aid}`]={version:1,loot:reward.entries};}
   else{const proto=Object.getPrototypeOf(store.game);ctx.grc=n=>ctx.gr()<n;ctx.spawnAttachment=(x,z)=>proto.spawnAttachment.call(ctx,x,z);ctx.pickups.spawn=(kind,x,z,opts)=>p.spawnPlan([{kind,x,z,...opts,recipientId:aid}])[0];proto.rollAttachmentFrom.call(ctx,'boss',ctx.player.x,ctx.player.z+1.4);}
   ctx.telFirst('bossKilled');ctx._fullAttachBoss=ctx.player.weapons.some(g=>g.attachments?.length>=3);ctx._noHitBoss=(ctx.player._bossHitCount|0)===0;ctx._bossWithSidearm=ctx.player.weapon.def.id===(ctx.hero.sidearm||'pistol_rusty');
   a.meta.stats.bossKills++;a.meta.souls+=w.activeModifier&&w.flowVersion!==2?45:30;if(!a.meta.seen.boss.includes(bt))a.meta.seen.boss.push(bt);achievements(store,d,aid,ctx);p.finish();
  }
  if(w.flowVersion===2)w.stageRun.milestones[key]={...(w.stageRun.milestones[key]||{}),boss:true};l.bosses[key]=true;l.bossPending=false;
  room.boss=null;room.projectiles=[];room.enemies=[];room.pending=[];w.pendingSpawns=w.pendingSpawns.filter(q=>q.roomUid!==w.roomUid);
  const r=w.dungeon.rooms.find(q=>q.uid===w.roomUid);r.cleared=true;r.pendingCombat=0;r.locked=false;
  if(w.flowVersion!==2)settlePartyDraft(store,d,'victory');
 }else if(r.kind==='party-down'){
  expect(!a.player.alive&&a.player.hp===0&&l.downed[id],'Actor not downed');
  const t=lethalTransition(a.personal.revival,d.runId);if(t.outcome==='pending'){a.personal.revival=t.next;a.personal.revivalPending=true;}
  l.downed[id].status=a.personal.revivalPending?'pending':'downed';
  store.actorProjection(d,id).finish();
 }else if(r.kind==='party-revive'){
  expect(!a.player.alive&&l.downed[id],'Actor not downed');
  const t=acceptRevival(a.personal.revival,r.requestId,a.player.maxHp,d.runId);expect(t.ok,'No personal revival available');a.personal.revival=t.next;
  const p=store.actorProjection(d,id);revive(a);Object.assign(p.player,{alive:a.player.alive,hp:a.player.hp,iframes:a.player.iframes,deadAnim:0});p.finish();l.downed[id]=null;
 }else if(r.kind==='party-decline'){
  const t=declineRevival(a.personal.revival,d.runId);expect(t.ok,'No pending revival');a.personal.revival=t.next;a.personal.revivalPending=false;l.downed[id].status='declined';store.actorProjection(d,id).finish();
 }else if(r.kind==='party-clear-revive'){
  expect(store.game.room.cleared,'Room not clear');
  for(const aid of IDS){const dead=d.actors[aid];if(!dead.player.alive&&l.downed[aid]){const p=store.actorProjection(d,aid);if(dead.personal.revival?.status==='pending')dead.personal.revival={...dead.personal.revival,status:'ready',pendingId:null,receipt:null};revive(dead);Object.assign(p.player,{alive:true,hp:dead.player.hp,iframes:dead.player.iframes,deadAnim:0});p.finish();l.downed[aid]=null;}}
  // No downed actors is still an idempotent world fact.
  store.actorProjection(d,id).finish();
 }else throw Error('Unknown internal party lifecycle transaction');
 for(const aid of IDS)validateRevival(d.actors[aid].personal.revival,d.runId);
 if(IDS.every(id=>!d.actors[id].player.alive)&&IDS.every(id=>!d.actors[id].personal.revivalPending&&l.downed[id]?.status!=='queued'))settlePartyDraft(store,d,'dead');
 return {kind:r.kind,result:l.settled?.result||null};
}

export function partyVerdict(g){const result=g._partyLifecycle.settled?.result;return victoryVerdict(result==='chapter-prototype'?{kind:'chapter',chapter:g.stage.chapter}:g.flowVersion===2?{kind:'campaign'}:{kind:'boss',boss:bossDef(g.bossType)});}
