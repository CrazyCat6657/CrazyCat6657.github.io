import {encodeTrustedRecord,coopJSONBytes} from '../core/coop_ledger_codec.js';
import {validateRevival} from './revival.js';
import {Player} from './player.js';
import {Companion} from './companion.js';
import {validHeroRuleVersion} from './hero_rules.js';
import {DOCTRINE_MAP,DOCTRINE_MAP_V3} from './doctrines.js';
// Party transaction record. This is deliberately independent of schema6 and of
// the later Worker/input/scheduler checkpoint protocol.
import {captureRoomWorld,capturePlayer,fields,validateEntityDataRecord,savedWeaponDefinition,validateEmbeddedWeaponState,validateOwnedWeaponRuntime,validateKnownOwnerResources} from './session.js';
import {TRACKING_FIELDS,primaryActor} from './actor_context.js';
import {WeaponSerialAllocator,reserveWeaponReferences} from './world_weapon_services.js';
import {WeaponAssetsRuntime} from './weapon_assets_runtime.js';
import {createCoopRewardLedger,restoreCoopRewardLedger,trustedCoopLedgerEncoding} from './coop_rewards.js';
import {validateHeroStateV3} from './hero_state_v3.js';
import {validateHeroIntegration} from './hero_integration_v3.js';
import {validateDoctrines,doctrineChoiceData} from './doctrine_state_v3.js';
import {validatePetGrowth} from './hero_growth_v3.js';
import {validatePetRage} from './hero_feedback.js';
import {captureConsumableHost,restoreConsumableHost} from '../experimental/consumables/host_state.js';
import {validateCombatState} from '../experimental/combat/controller.js';
import {validateBuildSupply,supplyCatalog} from './build_supply_bridge.js';
import {validAttachmentPositions} from './equipment_drops.js';
import {ATTACH_MAP} from './attachments.js';
import {ITEM_MAP,ACTIVE_MAP,ENEMY_MAP} from './data.js';
import {heroById} from './heroes.js';
import {encode,decodeSaveData} from './save.js';

export const PARTY_FORMAT='bell-corridor-party-draft',PARTY_SCHEMA=1;
export const PARTY_ACTORS=Object.freeze(['player','player2']);
export const PARTY_MAX_BYTES=32*1024*1024; // Explicit transaction-record budget, measured by store.
const copy=v=>structuredClone(v),integer=n=>Number.isSafeInteger(n)&&n>=0;
const receiptProofs=new WeakMap();
// Keys enter only after restoreCoopRewardLedger returns its internally sealed
// ledger. Keep the index private; mutable world pickups are checked every time.
const rewardOfferIndexes=new WeakMap();
function rewardOfferIndex(ledger){let index=rewardOfferIndexes.get(ledger);if(!index){index=new Map(ledger.offers.map(o=>[o.offerId,o]));rewardOfferIndexes.set(ledger,index);}return index;}
function receiptKey(r){return r.actorId+'\n'+r.requestId;}
function validateReceipt(r,sessionId,runId,revision,seen){const k=receiptKey(r);if(!PARTY_ACTORS.includes(r.actorId)||!partyText(r.requestId)||r.sessionId!==sessionId||r.runId!==runId||!partyText(r.kind)||typeof r.fingerprint!=='string'||!r.fingerprint||!integer(r.revision)||r.revision<1||r.revision>revision||seen.has(k))throw Error('Invalid party receipt');seen.add(k);}
// Object.freeze(Set) is not immutable. Such unusual receipt results keep the
// full validation/clone/codec path; only plain data histories acquire proof.
function plainHistory(v){return !v||typeof v!=='object'||(Array.isArray(v)||Object.getPrototypeOf(v)===Object.prototype)&&Object.values(v).every(plainHistory);}
function freezeHistory(v){if(v&&typeof v==='object'){for(const x of Object.values(v))freezeHistory(x);Object.freeze(v);}return v;}
export function trustedPartyReceipts(receipts,{sessionId,runId,revision}={}){const p=receiptProofs.get(receipts);return !!p&&p.sessionId===sessionId&&p.runId===runId&&revision>=p.revision;}
export function copyPartyReceipts(receipts){return receiptProofs.has(receipts)?receipts:copy(receipts);}
export function trustedPartyReceiptEncoding(receipts,encode){const p=receiptProofs.get(receipts);if(!p)return null;let proof=p.encoded.get(encode);if(!proof){const raw=encode(receipts);proof=Object.freeze({raw,bytes:coopJSONBytes(raw)});p.encoded.set(encode,proof);}return proof;}
function sealReceipts(receipts,sessionId,runId,revision,seen){if(!plainHistory(receipts))return receipts;const sealed=freezeHistory(copy(receipts));receiptProofs.set(sealed,{sessionId,runId,revision,seen,encoded:new Map()});return sealed;}
export function appendPartyReceipt(receipts,receipt,{sessionId,runId,revision}){
 const p=receiptProofs.get(receipts);if(!p||!trustedPartyReceipts(receipts,{sessionId,runId,revision})){const out=copy(receipts);out.push(copy(receipt));return out;}
 const seen=new Set(p.seen);validTree(receipt);validateReceipt(receipt,sessionId,runId,revision,seen);
 if(!plainHistory(receipt))return [...receipts,copy(receipt)];
 const last=freezeHistory(copy(receipt)),out=Object.freeze([...receipts,last]),encoded=new Map();
 for(const [encode,proof]of p.encoded){const raw=encode(last),separator=receipts.length?',':'';encoded.set(encode,Object.freeze({raw:proof.raw.slice(0,-1)+separator+raw+']',bytes:proof.bytes+separator.length+coopJSONBytes(raw)}));}
 receiptProofs.set(out,{sessionId,runId,revision,seen,encoded});return out;
}
export const partyText=x=>typeof x==='string'&&x.length>0&&x.length<=180;
const WORLD_FIELDS=['altarUses','_partyLifecycle','state','paused','time','seed','floor','flowVersion','stage','stageRun','run','runPolicy','bossType','bossPractice','activeModifier','mod_','practice','comparison','shopTx','transition','_autosaveT','_origin','hitStopT','shakeAmt','hurt','flash','aberr','vt','dustTimer','_damageRootSequence','_damageFeedbackEpoch','_damageFeedbackSequence','damageFeedbackTimeMs','timeScale','enemyTimeScale','enemyBulletTimeScale','hazardTimeScale','fxTimeScale','uiTimeScale'];
const PERSONAL_FIELDS=['heroPainted','experimentScheme','combatMode','consumablePurchases','revival','revivalPending','autoReloading','_aimDir','_tipT','_tipTouched','playerMoveTimeScale','playerActionTimeScale','_c2PlayerDt'];
const COMPANION_OMIT=['game','group','parts','core','body','head','legs','tail','light'];

export function nextPartyPickupId(g) {
  if(!integer(g._partyPickupSerial||0)||g._partyPickupSerial===Number.MAX_SAFE_INTEGER)throw Error('Party pickup allocator exhausted');
  return `party-pickup:${++g._partyPickupSerial}`;
}
export function initializePartyPickups(g) {
  g._partyPickupSerial ||= 0;
  const records=[...g.pickups.list,...[...g.roomStates.values()].flatMap(s=>s.pickups||[]),...(g.pendingLoot||[]).map(q=>q.opts)];
  for(const p of records){const m=/^party-pickup:(\d+)$/.exec(p.pickupId||'');if(m)g._partyPickupSerial=Math.max(g._partyPickupSerial,Number(m[1]));}
  // Current room's dormant copy is superseded by the live capture.
  for(const p of g.pickups.list)if(!p.pickupId)p.pickupId=nextPartyPickupId(g);
  for(const [uid,s]of g.roomStates)if(uid!==g.room.uid)for(const p of s.pickups||[])if(!p.pickupId)p.pickupId=nextPartyPickupId(g);
  for(const q of g.pendingLoot||[])if(!q.opts.pickupId)q.opts.pickupId=nextPartyPickupId(g);
}
function actorRecord(g,id,meta) {
  const a=primaryActor(g,id),v=a.view;
  const choice=a.hero.ruleVersion===3&&a.hero.id==='veteran'?doctrineChoiceData(a.player):a.hud?._choice?fields(a.hud._choice.cfg,['onPick','onToggle','onConfirm','onBack']):a._pendingChoice?fields(a._pendingChoice):null;
  return {playerId:id,slot:a.slot,hero:a.hero.id,heroRuleVersion:a.hero.ruleVersion||1,player:capturePlayer(a.player),
    floorRewards:copy(a._partyFloorRewards||{}),personal:fields(Object.fromEntries(PERSONAL_FIELDS.map(k=>[k,a[k]]))),
    tracking:fields({...Object.fromEntries(TRACKING_FIELDS.map(k=>[k,v[k]])),_knownSyn:a._knownSyn,_seenTip:a._seenTip}),
    telemetry:fields(a.tel||{}),buildSupply:copy(a.buildSupply||null),choice:copy(choice),
    experiment:a.experiment?copy(validateCombatState(a.experiment)):null,
    consumables:a.consumables?captureConsumableHost(v):null,
    companion:a.companion?fields(a.companion,COMPANION_OMIT):null,meta:copy(meta)};
}
export function capturePartyDraft(g,{sessionId,runId,revision=0,receipts=[],actorMeta,choiceContexts={}}={}) {
  if(g.actorCount!==2||g.mode!=='run'||runId!==g.runId)throw Error('Party requires two real run actors');
  const roomStates=Object.fromEntries([...g.roomStates].map(([uid,s])=>{const st=copy(s);if(st.weaponAssets){st.actorRuntimes={...(st.actorRuntimes||{}),player:st.weaponAssets};delete st.weaponAssets;}return[uid,st];}));
  roomStates[g.room.uid]={...captureRoomWorld(g),actorRuntimes:Object.fromEntries(PARTY_ACTORS.map(id=>[id,primaryActor(g,id).weaponAssets.capture()]))};
  const allocator=new WeaponSerialAllocator(g.weaponSerialAllocator.capture());
  reserveWeaponReferences(allocator,roomStates);
  const actors=Object.fromEntries(PARTY_ACTORS.map(id=>[id,actorRecord(g,id,actorMeta[id])]));
  for(const id of PARTY_ACTORS)actors[id].choiceContext=copy(choiceContexts[id]||null);
  reserveWeaponReferences(allocator,actors);
  return {format:PARTY_FORMAT,schemaVersion:PARTY_SCHEMA,sessionId,runId,revision,receipts:copyPartyReceipts(receipts),
    world:{...fields(Object.fromEntries(WORLD_FIELDS.map(k=>[k,g[k]]))),roomId:g.room.id,roomUid:g.room.uid,
      dungeon:{...fields(g.dungeon,['rooms']),rooms:g.dungeon.list.map(r=>fields(r))},
      scenes:Object.fromEntries([...g._residentRooms].map(([uid,sc])=>[uid,sc.exportState()])),roomStates,
      rng:{seed:g.rng.seed,s:g.rng.s},grng:{seed:g.grng.seed,s:g.grng.s},allocator:allocator.capture(),
      partyShops:copy(g._partyShops||{}),rewardSerial:g._partyRewardSerial||0,rewardQueue:copy(g._partyRewardQueue||[]),pickupSerial:g._partyPickupSerial,pickupClock:g.pickups.t,pendingSpawns:g.pendingSpawns.map(q=>({...fields(q,['room']),roomUid:q.room.uid})),
      pendingLoot:copy(g.pendingLoot||[]),coopRewards:g.coopRewards||createCoopRewardLedger({runId,playerIds:PARTY_ACTORS})},actors};
}
function validTree(v,path='',depth=0) {
  if(depth>50)throw Error('Party record too deep');
  if(typeof v==='number'&&!Number.isFinite(v)&&!(v===Infinity&&path.endsWith('.reserve')))throw Error('Invalid party number '+path);
  if(v===undefined||v===null||['string','number','boolean'].includes(typeof v))return;
  if(v instanceof Set){for(const x of v)validTree(x,path+'.$set',depth+1);return;}
  if(typeof v!=='object'||!Array.isArray(v)&&Object.getPrototypeOf(v)!==Object.prototype)throw Error('Party data must be plain');
  for(const [k,x]of Object.entries(v)){if(['__proto__','constructor','prototype'].includes(k))throw Error('Unsafe party field');validTree(x,path+'.'+k,depth+1);}
}
function validateActor(a,w,runId) {
  if(!a.floorRewards||Object.entries(a.floorRewards).some(([k,v])=>!/^floor:[23]$|^chapter:[23]$/.test(k)||!['offered','claimed'].includes(v)))throw Error('Invalid party floor reward authority');
  if(!validHeroRuleVersion(a.heroRuleVersion))throw Error('Invalid party hero rule version');
  validateEntityDataRecord(a.player,Player);validateEntityDataRecord(a.companion,Companion);
  validateRevival(a.personal.revival,runId);if(typeof a.personal.revivalPending!=='boolean'||a.personal.revivalPending!==(a.personal.revival?.status==='pending'))throw Error('Invalid party personal revival');
  const p=a.player,h=heroById(a.hero,a.heroRuleVersion);
  if(h.id!==a.hero||!p||p.id!==a.playerId||typeof p.alive!=='boolean'||!p.alive&&!w._partyLifecycle?.downed?.[a.playerId]||!Array.isArray(p.weapons)||p.weapons.length<1||p.weapons.length>2+(h.bonusWeaponSlots||0)||!integer(p.weaponIndex)||p.weaponIndex>=p.weapons.length)throw Error('Invalid party player identity');
  for(const k of ['hp','maxHp','x','z','vx','vz','reloadT','heroSkillCd','activeCd'])if(!Number.isFinite(p[k]))throw Error('Invalid party player '+k);
  if(p.alive?p.hp<=0:p.hp!==0)throw Error('Party downed HP mismatch');
  if(p.hp<0||p.hp>p.maxHp||p.maxHp<1||!integer(p.coins)||!integer(p.keys)||!integer(p.armor)||p.armor>5)throw Error('Invalid party resources');
  if(!Array.isArray(p.doctrines)||p.doctrines.some(id=>!(a.heroRuleVersion===3?DOCTRINE_MAP_V3:DOCTRINE_MAP)[id]))throw Error('Invalid party doctrines');
  if(a.heroRuleVersion===3){validateHeroStateV3(p,a.hero);validateHeroIntegration(p);if(a.hero==='veteran')validateDoctrines(p,a.choice);}
  if(a.experiment)validateCombatState(a.experiment);
  if(a.consumables)restoreConsumableHost(a.consumables);
  if(!Array.isArray(p.items)||p.items.some(id=>!ITEM_MAP[id])||!Array.isArray(p.actives)||p.actives.some(id=>!ACTIVE_MAP[id])||!integer(p.activeIndex)||(p.actives.length?p.activeIndex>=p.actives.length:p.activeIndex!==0))throw Error('Invalid party build');
  if(!Array.isArray(p.spareAttachments)||p.spareAttachments.length>(h.spareCap||3)||p.spareAttachments.some(id=>!ATTACH_MAP[id]))throw Error('Invalid party attachments');
  for(const k of ['_weaponSeen','_attSeen','_spellForms','_knownSyn','_seenTip'])if(a.tracking[k]!==undefined&&!(a.tracking[k] instanceof Set))throw Error('Invalid party tracking Set');
  if(a.buildSupply){if(a.buildSupply.runId!==runId)throw Error('Party supply run mismatch');validateBuildSupply(a.buildSupply,supplyCatalog());}
  if(a.companion){if(a.companion.growth)validatePetGrowth(a.companion);validatePetRage(a.companion);for(const k of ['x','z','hp','maxHp','downedT','fireCd','chargeT','guardT','absorbCd','animT'])if(!Number.isFinite(a.companion[k]))throw Error('Invalid party companion');}
  const snap=w.roomStates[w.roomUid].actorRuntimes[a.playerId];
  for(const gun of p.weapons){const def=savedWeaponDefinition(gun);if(!validAttachmentPositions(gun,h.attachSlots||2)||!Array.isArray(gun.attachments)||gun.attachments.some(id=>!ATTACH_MAP[id])||!Number.isFinite(gun.mag)||gun.mag<0||!(gun.reserve>=0)||!Number.isFinite(gun.reserve)&&!!def.ammoType)throw Error('Invalid party weapon');validateEmbeddedWeaponState(gun,def,gun.assetState?snap:null);validateOwnedWeaponRuntime(gun,def,snap);for(const st of Object.values(w.roomStates))validateKnownOwnerResources(gun,def,st.actorRuntimes?.[a.playerId]);}
  if(snap.prismField&&!p.weapons.some(gun=>gun.assetInstanceId===snap.prismField.owner))throw Error('Party prism owner absent');
}
function validatePartyRecord(d,{sessionId=d?.sessionId,runId=d?.runId,maxReceipts=32768}={}) {
  const rewardLedger=restoreCoopRewardLedger(d?.world?.coopRewards,{runId,playerIds:PARTY_ACTORS});
  const history=trustedPartyReceipts(d?.receipts,{sessionId,runId,revision:d?.revision});
  validTree({...d,...(history?{receipts:null}:{}),world:{...d.world,coopRewards:null}});
  if(d?.format!==PARTY_FORMAT||d.schemaVersion!==PARTY_SCHEMA||!partyText(sessionId)||!partyText(runId)||d.sessionId!==sessionId||d.runId!==runId||!integer(d.revision)||!d.actors||Object.keys(d.actors).sort().join()!=='player,player2'||!Array.isArray(d.receipts)||d.receipts.length>maxReceipts)throw Error('Invalid PartyDraft identity');
  const w=d.world;if(!w||!integer(w.pickupSerial)||!w.dungeon?.rooms?.length||w.dungeon.rooms.length>40||!w.roomStates?.[w.roomUid]||!w.dungeon.rooms.some(r=>r.id===w.roomId&&r.uid===w.roomUid))throw Error('Invalid party world');
  if(d.publication&&(!Array.isArray(d.publication.actorIds)||!d.publication.actorIds.length||new Set(d.publication.actorIds).size!==d.publication.actorIds.length||d.publication.actorIds.some(id=>!PARTY_ACTORS.includes(id))))throw Error('Invalid party publication');
  const rooms=new Set(w.dungeon.rooms.map(r=>r.uid));if(rooms.size!==w.dungeon.rooms.length||Object.keys(w.scenes||{}).length!==rooms.size||Object.keys(w.scenes).some(uid=>!rooms.has(uid)))throw Error('Party scene association');
  const ids=new Set(),runtimeOwners=new Map(),groundIds=new Set(),pickupIds=new Set();
  const claim=(id,actor)=>{if(!partyText(id)||ids.has(id))throw Error('Duplicate party inventory instance');ids.add(id);if(runtimeOwners.has(id)&&runtimeOwners.get(id)!==actor)throw Error('Party weapon owner conflict');};
  const allocator=new WeaponSerialAllocator(w.allocator);const high=allocator.serial;reserveWeaponReferences(allocator,d.actors);reserveWeaponReferences(allocator,w.roomStates);if(allocator.serial!==high)throw Error('Party allocator below saved identities');
  for(const [uid,st]of Object.entries(w.roomStates)){
    if(!rooms.has(uid)||!st.scene||!Array.isArray(st.enemies)||st.enemies.some(e=>!ENEMY_MAP[e.kind]||!Number.isFinite(e.hp)))throw Error('Invalid party room');
    for(const k of ['pickups','hazards','projectiles','pending','lootQueue','turrets','drones'])if(!Array.isArray(st[k])||st[k].length>1000)throw Error('Invalid party dynamic list');
    for(const [actor,snap]of Object.entries(st.actorRuntimes||{})){if(!PARTY_ACTORS.includes(actor))throw Error('Unknown runtime actor');new WeaponAssetsRuntime({}).restore(snap,{resumeRuntime:true});for(const id of [...Object.keys(snap.states),...(snap.entities||[]).map(e=>e.id),...Object.keys(snap.paidActions||{})]){if(runtimeOwners.has(id)&&runtimeOwners.get(id)!==actor)throw Error('Cross-owner runtime identity');runtimeOwners.set(id,actor);}}
    for(const p of st.pickups){if(!partyText(p.pickupId)||pickupIds.has(p.pickupId)||p.recipientId&&!PARTY_ACTORS.includes(p.recipientId))throw Error('Invalid party pickup identity');pickupIds.add(p.pickupId);if(!Number.isFinite(p.x)||!Number.isFinite(p.z)||!(p.amount>0)||!Number.isFinite(p.amount))throw Error('Invalid party pickup');if(p.kind==='weapon'){const def=savedWeaponDefinition(p);validateEmbeddedWeaponState(p,def);if(p.assetInstanceId){if(groundIds.has(p.assetInstanceId))throw Error('Duplicate ground weapon');groundIds.add(p.assetInstanceId);}}}
    for(const q of st.lootQueue)if(q.opts?.pickupId){if(!partyText(q.opts.pickupId)||pickupIds.has(q.opts.pickupId))throw Error('Duplicate queued party pickup identity');pickupIds.add(q.opts.pickupId);}
    for(const b of st.projectiles)if(b.ownerActorId&&!PARTY_ACTORS.includes(b.ownerActorId)||b.ownerId?.startsWith('player')&&!PARTY_ACTORS.includes(b.ownerId))throw Error('Invalid native projectile actor');
  }
  for(const [index,id]of PARTY_ACTORS.entries()){const a=d.actors[id];if(a.playerId!==id||a.slot!==index)throw Error('Party actor slot mismatch');validateActor(a,w,runId);for(const gun of a.player.weapons){if(gun.assetInstanceId){claim(gun.assetInstanceId,id);if(groundIds.has(gun.assetInstanceId))throw Error('Weapon both carried and grounded');}}}
  w.coopRewards=rewardLedger;const physicalOffers=new Set(),offerIndex=rewardOfferIndex(rewardLedger);
  for(const state of Object.values(w.roomStates))for(const p of [...state.pickups,...state.lootQueue.map(q=>({...q.opts,kind:q.kind}))])if(p.offerId){
    const offer=offerIndex.get(p.offerId);
    if(!offer||physicalOffers.has(p.offerId)||offer.claimedBy!==null||p.sourceEventId!==offer.sourceEventId||(p.recipientId||null)!==offer.ownerId)throw Error('Party physical reward association mismatch');
    physicalOffers.add(p.offerId);const kind=p.kind==='coin'?'coins':p.kind;
    if(kind!==offer.reward.kind||offer.reward.id&&p.id!==offer.reward.id||offer.reward.amount!==undefined&&Math.abs(p.amount-(offer.remainingAmount??offer.reward.amount))>1e-9)throw Error('Party reward remaining quantity mismatch');
  }
  if(!history){const receipts=new Set();for(const r of d.receipts)validateReceipt(r,sessionId,runId,d.revision,receipts);d.receipts=sealReceipts(d.receipts,sessionId,runId,d.revision,receipts);}
  const encoded=encodePartyRecord(d);if(encoded.bytes>PARTY_MAX_BYTES)throw Error('Party record exceeds 32 MiB budget');
  return encoded;
}
export function validatePartyDraft(d,identity){validatePartyRecord(d,identity);return d;}
// This returns the bytes from this exact validation, not a cache of a mutable
// draft. The store seals its private detached candidate before its first await.
export function validateAndEncodePartyDraft(d,identity){return validatePartyRecord(d,identity);}
function encodePartyRecord(d){const ledger=trustedCoopLedgerEncoding(d?.world?.coopRewards),receipts=trustedPartyReceiptEncoding(d?.receipts,encode);return encodeTrustedRecord(d,[{path:['world','coopRewards'],raw:ledger?.raw??null,bytes:ledger?.bytes},{path:['receipts'],raw:receipts?.raw??null,bytes:receipts?.bytes}],encode);}
export function encodePartyDraft(d){const {raw,bytes}=encodePartyRecord(d);if(bytes>PARTY_MAX_BYTES)throw Error('Party record exceeds budget');return raw;}
export function decodePartyDraft(raw,identity){return validatePartyDraft(decodeSaveData(raw,PARTY_MAX_BYTES),identity);}
