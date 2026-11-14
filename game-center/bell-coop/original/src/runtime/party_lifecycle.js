import {chapterWavesPending} from '../game/chapter_waves.js';
import {nextStage,newStageContext,isCampaignFinal} from '../game/stage_flow.js';
import {RNG} from '../core/rng.js';
const IDS=['player','player2'],opposite={n:'s',s:'n',e:'w',w:'e'};
const directions={n:[0,-1],s:[0,1],e:[1,0],w:[-1,0]};
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const same=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
const expect=(v,m)=>{if(!v)throw Error(m);};
export function newPartyLifecycle(){return {version:1,epoch:0,barrier:null,downed:{player:null,player2:null},connections:{player:{status:'ready',epoch:1},player2:{status:'ready',epoch:1}},settled:null,bosses:{},bossPending:false,routeDeferred:{player:null,player2:null}};}
export function validatePartyLifecycle(l,w){
 expect(l&&Object.keys(l).sort().join()==='barrier,bossPending,bosses,connections,downed,epoch,routeDeferred,settled,version'&&l.version===1&&Number.isSafeInteger(l.epoch)&&l.epoch>=0,'Invalid party lifecycle');
 for(const id of IDS){
  expect([null,'chapter-boss-completion','first-floor-completion'].includes(l.routeDeferred?.[id]),'Invalid party route deferral');
  const c=l.connections?.[id],a=l.downed?.[id];expect(c&&['ready','disconnected','loading'].includes(c.status)&&Number.isSafeInteger(c.epoch)&&c.epoch>=1,'Invalid party connection');
  expect(a===null||a&&Object.keys(a).sort().join()==='roomUid,status'&&typeof a.roomUid==='string'&&['queued','pending','downed','declined'].includes(a.status),'Invalid party downed actor');
 }
 expect(l.settled===null||l.settled&&l.settled.key&&['dead','victory','chapter-prototype'].includes(l.settled.result),'Invalid party settlement');
 expect(typeof l.bossPending==='boolean'&&l.bosses&&Object.entries(l.bosses).every(([k,v])=>/^c[1-3]s5$|^floor:3$/.test(k)&&v===true),'Invalid party boss ledger');
 const b=l.barrier;if(!b)return;
 expect(Object.keys(b).sort().join()==='confirmed,dir,fromRoomUid,id,kind,next,nextFloor,pending,phase,ready,targetRoomUid'&&b.id===l.epoch&&['room','stage','floor','finish'].includes(b.kind)&&['confirm','ready'].includes(b.phase),'Invalid party barrier');
 expect(Array.isArray(b.pending)&&new Set(b.pending).size===b.pending.length&&b.pending.every(k=>['authorize','hook:player','hook:player2','choice:player','choice:player2'].includes(k)),'Invalid party load actions');
 for(const k of ['confirmed','ready'])expect(Array.isArray(b[k])&&new Set(b[k]).size===b[k].length&&b[k].every(id=>IDS.includes(id)),'Invalid party ready actors');
 expect(b.phase==='confirm'?b.fromRoomUid===w.roomUid:b.confirmed.length===2,'Invalid party barrier phase');
 if(b.kind==='room'){
  const from=w.dungeon.rooms.find(r=>r.uid===b.fromRoomUid),to=w.dungeon.rooms.find(r=>r.uid===b.targetRoomUid),direction=directions[b.dir];
  expect(from&&to&&direction&&to.gx===from.gx+direction[0]&&to.gy===from.gy+direction[1]&&b.next===null&&b.nextFloor===null&&b.pending.length===0,'Invalid party room adjacency');
  const source=w.roomStates[from.uid];expect(source&&!source.enemies.some(e=>e.alive)&&source.pending.length===0&&!source.boss?.alive&&(from.cleared||chapterWavesPending(source.chapterWaves||from.chapterWaves)===0),'Invalid party combat-locked portal');
  const secret=from.secretWallDirs?.find(s=>s.dir===b.dir),opened=w.scenes[from.uid]?.secretOpen;
  expect(from.doors[b.dir]||secret&&(secret.isEntry||(opened instanceof Set?[...opened]:opened||[]).includes(b.dir)),'Invalid party portal authority');
  expect(b.phase==='confirm'?w.roomUid===from.uid:w.roomUid===to.uid,'Invalid loaded party room');
 }else if(b.kind==='stage'){
  expect(w.flowVersion===2&&b.next&&b.nextFloor===null&&b.dir===null&&b.targetRoomUid===null,'Invalid party stage target');
  if(b.phase==='confirm')expect(same(b.next,nextStage(w.stage,w.seed)),'Invalid party next stage');
  else{
   expect(same(b.next,w.stage)&&w.roomId===w.dungeon.startId,'Invalid party loaded stage');
   const chapter=b.next.segment===1?b.next.chapter-1:b.next.chapter,segment=b.next.segment===1?5:b.next.segment-1;
   expect(chapter>=1,'Invalid party previous chapter');const previous=newStageContext(w.seed,b.next.campaignScope,chapter,segment,b.next.profile||'compact');
   expect(b.fromRoomUid.startsWith(`v2:${previous.stageKey}:`),'Invalid party stage origin');
  }
 }else if(b.kind==='floor'){
  expect(w.flowVersion!==2&&[2,3].includes(b.nextFloor)&&b.next===null&&b.dir===null&&b.targetRoomUid===null,'Invalid party floor target');
  expect(b.phase==='confirm'?b.nextFloor===w.floor+1:w.floor===b.nextFloor&&w.roomId===w.dungeon.startId&&b.fromRoomUid.startsWith(`${w.floor-1}:`),'Invalid party floor order');
 }else expect(w.flowVersion===2&&nextStage(w.stage,w.seed)===null&&b.phase==='confirm'&&w.stage.segment===5&&b.next===null&&b.nextFloor===null&&b.dir===null&&b.targetRoomUid===null&&b.pending.length===0,'Invalid party finish target');
 if(b.kind!=='room'&&b.phase==='confirm'){const room=w.dungeon.rooms.find(r=>r.uid===w.roomUid),state=w.roomStates[w.roomUid];expect(room&&['exit','boss'].includes(room.type)&&room.cleared&&state.enemies.every(e=>!e.alive)&&state.pending.length===0&&!state.boss?.alive,'Invalid party staircase authority');}

}
function resetInputs(s){for(const id of IDS){const a=s.game.getActor(id);a.input.resetState();a.input.setBlocked(true);a.weaponAssets.suspend();}}
export function detectPartyRoomCrossing(s){
 const g=s.game;if(g._partyLifecycle.barrier||g.paused||g.state!=='play')return;
 for(const id of IDS){const a=g.getActor(id),p=a.player;if(!p.alive||a.view.panelOpen())continue;
  for(const po of g.portals||[]){if(!po.traversable||!po.neighbor||!g.connectors[po.dir])continue;
   const o=g.roomOffset(po.neighbor),lim=po.neighbor.radius-1.2;
   if(Math.abs(p.x-o.ox)<lim&&Math.abs(p.z-o.oz)<lim){begin(s,id,'room',{dir:po.dir,targetRoomUid:po.neighbor.uid});return;}
  }
 }
}
function begin(s,id,kind,fields={}){
 const g=s.game,l=g._partyLifecycle;expect(!l.barrier&&g.state==='play'&&!g.paused,'Party travel unavailable');
 l.barrier={id:++l.epoch,kind,phase:'confirm',fromRoomUid:g.room.uid,targetRoomUid:null,dir:null,next:null,nextFloor:null,confirmed:[id],ready:[],pending:[],...fields};resetInputs(s);g._partyCheckpointPending=true;
 g.platform.emit('party-transition',{...structuredClone(l.barrier)});return {ok:true,barrier:structuredClone(l.barrier)};
}
export async function partyLifecycleCommand(s,id,r){
 const g=s.game;let l=g._partyLifecycle,b=l.barrier;
 if(['lifecycle.disconnect','lifecycle.reconnect','lifecycle.connection-ready'].includes(r.kind)){
  const c=l.connections[id];expect(!l.settled,'Party ended');
  if(r.kind==='lifecycle.disconnect'){expect(c.status==='ready'||c.status==='loading','Actor not connected');c.status='disconnected';c.epoch++;g.getActor(id).player.connected=false;}
  else {expect(r.actorEpoch===c.epoch,'Stale connection epoch');if(r.kind==='lifecycle.reconnect'){expect(c.status==='disconnected','Actor not disconnected');c.status='loading';}else{expect(c.status==='loading','Actor not loading');c.status='ready';g.getActor(id).player.connected=true;}}
  resetInputs(s);return {ok:true,connection:structuredClone(c)};
 }
 expect(Object.values(l.connections).every(c=>c.status==='ready'),'Party connection barrier');
 if(['lifecycle.revive','lifecycle.decline'].includes(r.kind)){expect(!b,'Party transition barrier');return s.lifeTransaction(id,{...s.store.request(r.kind==='lifecycle.revive'?'party-revive':'party-decline'),requestId:r.requestId});}
 expect(!g.paused||r.kind==='lifecycle.ready','Party paused');
 if(r.kind==='lifecycle.stairs'){
  const a=g.getActor(id),p=a.player;expect(!b&&p.alive&&!a.view.panelOpen(),'Actor cannot use stairs');
  const stairs=a.view.interactables().find(it=>it.type==='stairs'&&Math.hypot(p.x-it.x,p.z-it.z)<=it.radius);
  expect(stairs&&g.room.cleared&&g.aliveEnemyCount()===0&&g.pendingInRoom()===0&&!g.boss?.alive,'Stairs unreachable or locked');
  if((g.flowVersion===2&&g.stage.chapter===1&&g.stage.segment===5||g.flowVersion!==2&&g.floor===1)&&IDS.some(aid=>g.getActor(aid).buildSupply?.selectedRoute)){
   const gate=await s.lifeTransaction(id,s.store.request('party-route-gate'));expect(gate.ok,gate.error);let pending=false;
   for(const aid of IDS){const a=g.getActor(aid);if(g._partyLifecycle.routeDeferred[aid]!==gate.receipt.result.source&&a.view.openPendingRouteSupply())pending=true;}
   if(pending)return {ok:false,reason:'route-choice-pending'};
  }
  expect(IDS.every(aid=>!s.store.choiceContexts[aid]),'Resolve personal choice before stage travel');
  if(g.flowVersion===2){const next=nextStage(g.stage,g.seed);return begin(s,id,next?'stage':'finish',{next});}
  expect(g.hasNextFloor(),'No next floor');return begin(s,id,'floor',{nextFloor:g.nextFloor()});
 }
 expect(b&&r.barrierId===b.id,'Stale party barrier');
 if(r.kind==='lifecycle.confirm'){
  expect(b.phase==='confirm','Party already loading');if(!b.confirmed.includes(id))b.confirmed.push(id);
  if(b.confirmed.length===2){
   resetInputs(s);
   if(b.kind==='room'){const room=g.dungeon.list.find(r=>r.uid===b.targetRoomUid);expect(room,'Missing party destination');g.buildRoom(room,opposite[b.dir]);}
   else if(b.kind==='stage'){
    const from=g.stage.stageKey;g.markStage(from,'cleared');g.completeStageAdvance(b.next,from);
    if(b.next.segment===1&&b.next.chapter>=2)b.pending=['authorize','hook:player','hook:player2','choice:player','choice:player2'];
   }else if(b.kind==='floor'){
    g.releaseStageScenes();g.rng=new RNG(g.seed^(0x9e3779b9*b.nextFloor));g.buildFloor(b.nextFloor);g.applyTheme();b.pending=['authorize','hook:player','hook:player2','choice:player','choice:player2'];
   }else{const ended=await s.lifeTransaction(id,s.store.request('party-finish'));expect(ended.ok,ended.error||'Party finish not committed');return ended;}
   g._partyLifecycle.barrier.phase='ready';resetInputs(s);g._partyCheckpointPending=true;
   g.platform.emit('party-loaded',{barrierId:b.id,roomUid:g.room.uid,stage:g.stage?.stageKey||null});if(g._partyLifecycle.barrier.pending.length){await s.save();await completePartyLoad(s);}
  }
  return {ok:true,barrier:structuredClone(g._partyLifecycle.barrier)};
 }
 expect(r.kind==='lifecycle.ready'&&b.phase==='ready','Party ready unavailable');await completePartyLoad(s);l=g._partyLifecycle;b=l.barrier;
 if(!b.ready.includes(id))b.ready.push(id);
 if(b.ready.length===2){l.barrier=null;resetInputs(s);for(const aid of IDS)g.getActor(aid).input.setBlocked(false);g._partyCheckpointPending=true;}
 return {ok:true,barrier:structuredClone(l.barrier)};
}

// Save the new physical room before any across-floor PartyDraft. Pending typed
// load work + deterministic receipts make cold recovery resume each hook once.
async function completePartyLoad(s){
 const g=s.game;while(g._partyLifecycle.barrier?.pending.length){const b=g._partyLifecycle.barrier,k=b.pending[0],requestId=`travel:${b.id}:${k}`;let result={ok:true};
  if(k==='authorize')result=await s.store.authorizeFloorRewards({kind:'floor-rewards-authorized',requestId});
  else {const [kind,id]=k.split(':'),actor=g.getActor(id);
   if(kind==='hook')result=await s.lifeTransaction(id,{kind:'party-floor-hook',requestId});
   else if(actor.hero.floorChoice&&(actor.hero.floorChoice!=='evolution'||actor.companion?.stage<2))result=await g.partyCommand(id,{kind:actor.hero.floorChoice==='doctrine'&&actor.hero.ruleVersion===3?'doctrine-open':'floor-choice-open',requestId});
  }
  expect(result.ok,result.error||'Party load action pending');g._partyLifecycle.barrier.pending.shift();await s.save();
 }
}
