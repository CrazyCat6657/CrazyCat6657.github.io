import {capturePartyDraft,validatePartyDraft,validateAndEncodePartyDraft,encodePartyDraft,decodePartyDraft,initializePartyPickups,nextPartyPickupId,partyText,PARTY_ACTORS,copyPartyReceipts,appendPartyReceipt} from './coop_session.js';
import {coopJSONBytes} from '../core/coop_ledger_codec.js';
import {partyAcquisitionProjection,planPartyCommand} from './party_acquisition.js';
import {publishPlayerAcquisition} from './acquisition_projection.js';
import {planPartySources,partyFloorRewardKey,authorizePartyFloorRewards} from './party_rewards.js';
import {partyCollectUI,showPartyChoice} from './party_ui.js';
import {restoreConsumableHost} from '../experimental/consumables/host_state.js';
import {meta} from './meta.js';
import {encode} from './save.js';

const plans=new WeakMap(),confirmedRecords=new WeakMap();
const cacheContext=s=>[s.sessionId,s.runId,s.key,s.maxReceipts,s.game._partyCheckpointOwner?.source||null,32*1024*1024];
function rememberConfirmed(s,raw){confirmedRecords.set(s,{raw,context:cacheContext(s),revision:s.revision});}
function confirmedRevision(s,raw){const c=confirmedRecords.get(s);return c&&c.raw===raw&&c.context.every((x,i)=>x===cacheContext(s)[i])?c.revision:null;}
const copy=v=>structuredClone(v);
// Ledger sharing is safe only after validatePartyDraft has replaced it with
// the reward module's internally sealed, WeakSet-attested immutable record.
function copyParty(d){const out=copy({...d,receipts:null,world:{...d.world,coopRewards:null}});out.receipts=copyPartyReceipts(d.receipts);out.world.coopRewards=d.world.coopRewards;return out;}
export function partyStorageKey(sessionId,runId){if(!partyText(sessionId)||!partyText(runId))throw Error('Explicit party identity required');return `bell-corridor:coop:v1:${encodeURIComponent(sessionId)}:${encodeURIComponent(runId)}`;}
function canonical(v){
  if(v===null||typeof v==='string'||typeof v==='boolean'||typeof v==='number'&&Number.isFinite(v))return JSON.stringify(v);
  if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';
  if(v&&Object.getPrototypeOf(v)===Object.prototype)return '{'+Object.keys(v).sort().map(k=>{if(['__proto__','prototype','constructor'].includes(k))throw Error('Unsafe party request');return JSON.stringify(k)+':'+canonical(v[k]);}).join(',')+'}';
  throw Error('Party request must be finite plain data');
}
// Reconcile captured data without replacing unaffected paid entities, ledgers
// or their state objects. In-flight references remain valid after publication.
function reconcile(old,data){
  if(encode(old)===encode(data))return old;
  if(data instanceof Set)return copy(data);
  if(Array.isArray(data)){
    if(!Array.isArray(old))return copy(data);
    const previous=old.slice();old.length=data.length;
    data.forEach((v,i)=>{const base=v?.id?previous.find(x=>x?.id===v.id):previous[i];old[i]=reconcile(base,v);});return old;
  }
  if(data&&Object.getPrototypeOf(data)===Object.prototype){
    if(!old||Object.getPrototypeOf(old)!==Object.prototype)return copy(data);
    for(const key of Object.keys(old))if(!Object.hasOwn(data,key))delete old[key];
    for(const [key,value]of Object.entries(data))old[key]=reconcile(old[key],value);return old;
  }
  return copy(data);
}
export class PartySessionStore {
  #confirmed=null;
  #pendingCandidate=null;
  // The private candidate owns every mutable Set. Public inspection receives a
  // detached copy; Object.freeze(Set) alone would not justify trusted reuse.
  get lastCommitted(){return this.#confirmed?copyParty(this.#confirmed.candidate):null;}
  set lastCommitted(candidate){if(candidate===null){this.#confirmed=null;return;}const sealed=copyParty(candidate),{raw}=this.validate(sealed,true);this.#confirmed={candidate:sealed,raw,context:cacheContext(this)};}
  constructor(game,{sessionId,runId=game.runId,storage=game.platform?.storage||globalThis.localStorage,maxReceipts=32768,restoring=false}={}){
    if(game.actorCount!==2||game.mode!=='run'||runId!==game.runId||game.partySessionStore)throw Error('Party store requires unattached real two-actor run');
    if(!storage||typeof storage.getItem!=='function'||typeof storage.setItem!=='function'||!Number.isSafeInteger(maxReceipts)||maxReceipts<1||maxReceipts>32768)throw Error('Invalid party storage adapter');
    this.game=game;this.sessionId=sessionId;this.runId=runId;this.key=partyStorageKey(sessionId,runId);this.storage=storage;this.maxReceipts=maxReceipts;
    for(const actor of game.actors.values()){actor._partyFloorRewards||={};const key=partyFloorRewardKey(game);if(!restoring&&key&&!actor._partyFloorRewards[key])actor._partyFloorRewards[key]='offered';}
    this.sourceSerial=game._partyRewardSerial||0;this.requestSerial=0;game._partyRewardQueue||=[];
    this.revision=0;this.receipts=[];this.actorMeta=Object.fromEntries(PARTY_ACTORS.map(id=>[id,copy(meta.data)]));
    this.choiceContexts=Object.fromEntries(PARTY_ACTORS.map(id=>[id,game.getActor(id).player.c2?.doctrinePending?{actorId:id,roomUid:game.room.uid,token:`0:${id}:doctrine`}:null]));
    this.busy=true;this.blocked=false;this.error='';this.lastCommitted=null;this.pending=null;this.lastBytes=0;
    this.publishedRevision=0;this.publicationPending=false;
    // Existing records require the explicit later restore protocol; never
    // overwrite a different live world with a constructor-side implicit restore.
    this.ready=Promise.resolve().then(()=>storage.getItem(this.key)).then(raw=>{if(raw!==null)throw Error('Existing party record requires explicit restore');}).catch(error=>{this.blocked=true;this.error=error.message;throw error;}).finally(()=>{this.busy=false;});
    this.ready.catch(()=>{});
    initializePartyPickups(game);game.partySessionStore=this;
  }
  get frozen(){return this.busy||this.blocked||this.game._partyRewardQueue.length>0;}
  nextPickupId(){if(this.frozen)throw Error('Party world is frozen');return nextPartyPickupId(this.game);}
  authorizeFloorRewards(request=this.request('floor-rewards-authorized')){return this.transact('player',request,authorizePartyFloorRewards);}
  request(kind,fields={}){return {kind,requestId:`ui:${this.revision}:${++this.requestSerial}`,roomUid:this.game.room.uid,expectedRevision:this.revision,...fields};}
  collectPickup(p,actorId='player'){return partyCollectUI(this.game.getActor(actorId).view,p);}
  enqueueSource(kind,x,z,opts,rewardSource){
    if(this.busy||this.blocked)throw Error('Party world is frozen');
    const eventId=`source:${++this.sourceSerial}:free`;this.game._partyRewardSerial=this.sourceSerial;
    this.game._partyRewardQueue.push({kind,x,z,opts:copy(opts),rewardSource,eventId,roomUid:this.game.room.uid});
    if(!this.manualSources&&!this.sourceScheduled){this.sourceScheduled=true;queueMicrotask(()=>{this.sourceScheduled=false;this.flushSources();});}
    return eventId;
  }
  async flushSources(){
    await this.ready;if(this.busy||this.blocked||!this.game._partyRewardQueue.length)return {ok:false};
    const first=this.game._partyRewardQueue[0],actor=[...this.game.actors.values()].find(a=>a.active&&a.player.alive)||(this.game._partyLifecycle&&[...this.game.actors.values()].find(a=>a.active));
    if(!actor)return {ok:false};
    const result=await this.transact(actor.playerId,{kind:'world-rewards',requestId:`sources:${first.eventId}`},planPartySources);
    if(!result.ok)this.error=result.error||'Party source commit pending';return result;
  }
  readConfirmedRevision(raw){const cached=confirmedRevision(this,raw);if(cached!==null)return cached;const record=decodePartyDraft(raw,this.identity());if(record.revision===this.revision)rememberConfirmed(this,raw);return record.revision;}
  confirmCheckpointRecord(record,raw){this.validate(record);if(encodePartyDraft(record)!==raw||record.revision!==this.revision)throw Error('Checkpoint journal confirmation mismatch');rememberConfirmed(this,raw);}
  identity(){return {sessionId:this.sessionId,runId:this.runId,maxReceipts:this.maxReceipts};}
  beginDraft(expectedRevision=this.revision,allowQueuedSources=false){
    if(this.busy||this.blocked||!allowQueuedSources&&this.game._partyRewardQueue.length||expectedRevision!==this.revision)throw Error('Party busy, frozen or stale revision');
    this.busy=true;
    try{
      const draft=capturePartyDraft(this.game,{sessionId:this.sessionId,runId:this.runId,revision:this.revision,receipts:this.receipts,actorMeta:this.actorMeta,choiceContexts:this.choiceContexts});
      plans.set(draft,{store:this,baseRevision:this.revision,affected:new Set(),effects:[]});return draft;
    }catch(error){this.busy=false;throw error;}
  }
  actorProjection(draft,actorId){
    const plan=plans.get(draft);if(plan?.store!==this||!this.busy||!PARTY_ACTORS.includes(actorId))throw Error('Invalid PartyDraft projection');
    const projection=partyAcquisitionProjection(this.game,draft,actorId);plan.affected.add(actorId);plan.effects.push({actorId,effects:projection.effects});return projection;
  }
  abort(draft){if(plans.get(draft)?.store===this){plans.delete(draft);if(this.publicationPending){this.blocked=true;this.error='Committed party awaits publication recovery';}this.busy=false;}}
  validate(draft,withEncoding=false){return withEncoding?validateAndEncodePartyDraft(draft,this.identity()):validatePartyDraft(draft,this.identity());}
  async commit(draft,{actorId,requestId,kind,fingerprint,result}){
    const plan=plans.get(draft);if(plan?.store!==this||plan.baseRevision!==this.revision||draft.revision!==this.revision||!this.busy||this.blocked)throw Error('Stale or unowned party commit');
    if(this.receipts.length>=this.maxReceipts)throw Error('Party receipt journal full; new requests refused');
    draft.revision=this.revision+1;
    const receipt={sessionId:this.sessionId,runId:this.runId,actorId,requestId,kind,fingerprint,revision:draft.revision,result:copy(result)};
    draft.receipts=appendPartyReceipt(draft.receipts,receipt,{...this.identity(),revision:draft.revision});draft.publication={actorIds:[...plan.affected]};
    // Seal candidate before touching storage. Awaiting any adapter method holds
    // the same shared world barrier as planning and publication.
    const candidate=copyParty(draft),{raw,bytes}=this.validate(candidate,true),original=await this.storage.getItem(this.key);
    if(original!==null){if(this.readConfirmedRevision(original)!==this.revision)throw Error('Party storage revision conflict');}
    else if(this.revision!==0)throw Error('Party committed record missing');
    let attempted=false;
    try{
      await this.storage.setItem(this.key+':pending',raw);
      if(await this.storage.getItem(this.key+':pending')!==raw)throw Error('Party candidate readback failed');
      // The sealed candidate was validated before encoding. Exact readback
      // proves storage fidelity; reparsing this same local raw would rebuild
      // the unchanged historical journal a second time. New raw still decodes.

      attempted=true;await this.storage.setItem(this.key,raw);
      if(await this.storage.getItem(this.key)!==raw)throw Error('Party commit readback uncertain');
    }catch(error){
      this.error=error.message;
      if(attempted){this.pending={raw,original};this.#pendingCandidate={candidate,raw,original};this.blocked=true;}
      return {ok:false,committed:attempted?null:false,blocked:this.blocked,error:this.error};
    }
    this.#acceptConfirmed(candidate,raw,bytes);return {ok:true,committed:true,receipt:copy(receipt),candidate:copyParty(candidate)};
  }
  acceptCommitted(candidate,raw){
    const sealed=copyParty(candidate),encoded=this.validate(sealed,true);if(encoded.raw!==raw)throw Error('Party committed bytes mismatch');this.#acceptConfirmed(sealed,raw,encoded.bytes);
  }
  #acceptConfirmed(candidate,raw,bytes=coopJSONBytes(raw)){
    this.#confirmed={candidate,raw,context:cacheContext(this)};this.lastBytes=bytes;
    this.publicationPending=true;
    this.revision=candidate.revision;rememberConfirmed(this,raw);this.receipts=copyPartyReceipts(candidate.receipts);this.actorMeta=Object.fromEntries(PARTY_ACTORS.map(id=>[id,copy(candidate.actors[id].meta)]));
    this.choiceContexts=Object.fromEntries(PARTY_ACTORS.map(id=>[id,copy(candidate.actors[id].choiceContext)]));
  }
  publishCommitted(candidate){
    if(!this.busy||!this.publicationPending||this.publishedRevision>=this.revision)throw Error('Party publication requires pending commit barrier');
    const confirmed=this.#confirmed;if(!confirmed)throw Error('Only confirmed party candidate can publish');
    if(candidate!==undefined||!confirmed.context.every((x,i)=>x===cacheContext(this)[i])){candidate=candidate??copyParty(confirmed.candidate);this.validate(candidate);if(encodePartyDraft(candidate)!==confirmed.raw)throw Error('Only confirmed party candidate can publish');}
    candidate=confirmed.candidate;if(candidate.revision!==this.revision)throw Error('Only confirmed party candidate can publish');
    const g=this.game,w=candidate.world,st=w.roomStates[w.roomUid];
    if(g.room.uid!==w.roomUid)throw Error('Party room changed behind commit barrier');
    // Allocator/RNG have one owner and publish once for both projections.
    if(w.allocator.serial<g.weaponSerialAllocator.serial)throw Error('Party allocator regression');
    g.weaponSerialAllocator.restore(w.allocator);g.rng.s=w.rng.s;g.grng.s=w.grng.s;g._partyPickupSerial=w.pickupSerial;
    for(const id of candidate.publication.actorIds){
      const a=g.getActor(id),record=candidate.actors[id],runtime=a.weaponAssets;
      publishPlayerAcquisition(a.player,record.player);
      const snap=st.actorRuntimes[id];for(const [key,value]of Object.entries(snap))if(key!=='version')runtime[key]=reconcile(runtime[key],value);
      runtime.bindInventory(a.player);
      for(const [key,value]of Object.entries(record.tracking))a.view[key]=copy(value);
      Object.assign(a,copy(record.personal));a.player.rig.group.visible=a.player.alive;
      a._partyFloorRewards=copy(record.floorRewards);a.tel=copy(record.telemetry);a.buildSupply=copy(record.buildSupply);a._pendingChoice=copy(record.choice);
      // Personal choice UI consumes this typed data through Party APIs in E2.
      // It cannot invoke a captured single-player callback.
      if(record.companion&&a.companion){const previousStage=a.companion.stage;for(const [key,value]of Object.entries(record.companion))a.companion[key]=reconcile(a.companion[key],value);if(previousStage!==a.companion.stage)a.companion.renderEvolution(previousStage);}
      if(record.experiment)a.experiment=reconcile(a.experiment,record.experiment);
      if(record.consumables){const host=restoreConsumableHost(record.consumables);a.consumables=host.state;a.consumablePurchases=host.purchases;}
      if(a.hud.choiceOpen)a.hud.closeChoice();
      if(a.hud._hub?.cfg.partyBinding==='choice')a.hud.closeHubPanel();
      if(record.choiceContext)showPartyChoice(a.view,copy(record));
    }
    const wanted=new Set(st.pickups.map(p=>p.pickupId));
    for(const p of g.pickups.list.slice())if(!wanted.has(p.pickupId)){p.collected=true;g.pickups.remove(p);}
    for(const p of st.pickups){const existing=g.pickups.list.find(x=>x.pickupId===p.pickupId);if(existing){Object.assign(existing,copy(p));continue;}
      const live=g.pickups.spawn(p.kind,p.x,p.z,{...p,shopSlot:p.shopIndex>=0?g.roomScene.shopSlots[p.shopIndex]:null});Object.assign(live,copy(p));live.mesh.position.set(p.x,p.y,p.z);
    }
    // All shared consumers publish from the one confirmed world record.
    g.roomScene.importState(copy(st.scene));
    for(const saved of w.dungeon.rooms){const live=g.dungeon.list.find(r=>r.uid===saved.uid);if(live){live.content=copy(saved.content);live.discovered=!!saved.discovered;}}
    g.altarUses=copy(w.altarUses||{});g._partyShops=copy(w.partyShops||{});g.pendingLoot=copy(w.pendingLoot);g.shopTx=copy(w.shopTx);g._partyRewardQueue=copy(w.rewardQueue||[]);g._partyRewardSerial=w.rewardSerial||this.sourceSerial;
    g.roomStates.set(w.roomUid,copy(st));g.coopRewards=w.coopRewards;
    if(w._partyLifecycle){g._partyLifecycle=copy(w._partyLifecycle);g.state=w.state;g.stageRun=copy(w.stageRun);g._stageBossPending=!!w._partyLifecycle.bossPending;
      if(candidate.receipts.at(-1)?.kind==='party-boss'){g.projectiles.reset();g.clearEnemies();g.room.cleared=true;g.room.locked=false;g.room.pendingCombat=0;g.pendingSpawns=g.pendingSpawns.filter(q=>q.room!==g.room);g.roomScene.update(0);g.syncDoorLocks();}}
    this.publishedRevision=this.revision;this.publicationPending=false;this.busy=false;
  }
  async transact(actorId,request,planner=planPartyCommand){
    let draft;
    try{
      await this.ready;
      if(!PARTY_ACTORS.includes(actorId)||!request||!partyText(request.requestId)||!partyText(request.kind))throw Error('Invalid party request identity');
      if(request.sessionId!==undefined&&request.sessionId!==this.sessionId||request.runId!==undefined&&request.runId!==this.runId)throw Error('Party request session/run mismatch');
      if(planner===planPartyCommand){
        const fields={'profession-skill':[],'profession-dismantle':[],'profession-assemble':[],'altar-preview':[],'altar-use':['choiceToken'],'supply-defer':[],collect:['pickupId','slot','choiceToken','replaceIndex','useNow'], 'pickup-choice':['pickupId'], 'choice-cancel':['choiceToken'], 'chest-open':['chestId'], 'shop-choice':['shopId','revision','offerId','replaceIndex'],'shop-purchase':['shopId','revision','offerId','replaceIndex','choiceToken'], 'weapon-drop':['weaponInstanceId','weaponIndex','whole'], 'attachment-install':['attachmentId','weaponInstanceId','weaponIndex','slotIndex'], 'attachment-detach':['attachmentId','weaponInstanceId','weaponIndex'], 'attachment-drop':['index'], 'doctrine-open':[], 'doctrine-toggle':['choiceToken','doctrineId'], 'doctrine-confirm':['choiceToken'], 'floor-choice-open':[], 'floor-choice-confirm':['choiceToken','optionId'], 'supply-claim':['supplyKey'],'consumable-use':['slot'],'consumable-purchase':['itemId']}[request.kind];
        if(!fields||Object.keys(request).some(k=>!['requestId','kind','sessionId','runId','expectedRevision','roomUid',...fields].includes(k)))throw Error('Unknown party command or field');
      }
      const {requestId,...payload}=request,fingerprint=canonical(payload),old=this.receipts.find(r=>r.actorId===actorId&&r.requestId===requestId);
      if(old){
        if(old.fingerprint!==fingerprint)throw Error('Party requestId payload conflict');
        const published=old.revision<=this.publishedRevision;
        return {ok:published&&!this.blocked,committed:true,published,replay:true,blocked:this.blocked,...(this.blocked?{error:this.error}:{}),receipt:copy(old)};
      }
      if(this.receipts.length>=this.maxReceipts)throw Error('Party receipt journal full; new requests refused');
      draft=this.beginDraft(request.expectedRevision??this.revision,planner===planPartySources);
      const result=await planner(this,draft,actorId,request),saved=await this.commit(draft,{actorId,requestId,kind:request.kind,fingerprint,result});
      if(!saved.ok)return saved;
      try{this.publishCommitted();}
      catch(error){this.blocked=true;this.error='Committed party publication failed: '+error.message;return {ok:false,committed:true,blocked:true,error:this.error,receipt:saved.receipt};}
      return {ok:true,committed:true,published:true,replay:false,receipt:saved.receipt};
    }catch(error){return {ok:false,committed:false,blocked:this.blocked,error:error.message};}
    finally{if(draft){plans.delete(draft);this.busy=false;}}
  }
  // Same-world transaction publication recovery only. F will rebuild a fresh
  // Worker including physics/input/scheduler from its own complete checkpoint.
  async recoverCommitted(){
    if(!this.blocked||this.busy)return {ok:false,error:'No idle frozen party transaction'};
    try{
      this.busy=true;
      const raw=await this.storage.getItem(this.key);
      if(this.pending){
        const pending=this.#pendingCandidate;if(!pending||pending.raw!==this.pending.raw||pending.original!==this.pending.original)throw Error('Party pending record changed');
        if(raw===pending.original){this.pending=null;this.#pendingCandidate=null;this.blocked=false;this.error='';return {ok:true,committed:false};}
        if(raw!==pending.raw)throw Error('Party commit remains uncertain');
        this.#acceptConfirmed(pending.candidate,raw);this.pending=null;this.#pendingCandidate=null;
      }else if(!this.#confirmed||raw!==this.#confirmed.raw)throw Error('Party committed record changed');
      this.publishCommitted();this.blocked=false;this.error='';return {ok:true,committed:true,revision:this.revision};
    }catch(error){this.blocked=true;this.error=error.message;return {ok:false,committed:null,error:this.error};}
    finally{this.busy=false;}
  }
}
