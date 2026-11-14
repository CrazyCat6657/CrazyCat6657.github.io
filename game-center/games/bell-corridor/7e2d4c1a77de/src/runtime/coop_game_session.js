import {coopCatalog,coopProgress,coopTransportFrame} from './coop_transport.js';
import {encodeTrustedRecord} from '../core/coop_ledger_codec.js';
import {newPartyLifecycle,validatePartyLifecycle,detectPartyRoomCrossing,partyLifecycleCommand} from './party_lifecycle.js';
import {createHeadlessGame,createHeadlessRestoreCandidate} from './headless_game.js';
import {MemoryStorage,publishRestorePlatform,withPresentationPlatform} from './game_platform.js';
import {HeadlessHUD} from './headless_hud.js';
import {TickScheduler,FIXED_DT} from './tick_scheduler.js';
import {runtimeSourceIdentity} from './source_identity.mjs';
import {loadModules,captureInput,applyInput,inputData,muzzlePose,applyMuzzlePose,projectilePool,applyProjectilePool,captureRealmState,restoreRealmState,restoreProperties} from './game_session.js';
import {validateRuntimeActors,validateRuntimePlayer} from './checkpoint_actor_contract.js';

// No Game/Meta/save import above: module evaluation must occur after the
// Worker-private Storage/platform has been installed by createHeadlessGame.
export const COOP_CHECKPOINT_FORMAT='bell-corridor-coop-session',COOP_CHECKPOINT_SCHEMA=1;
const IDS=['player','player2'],copy=v=>structuredClone(v),int=(v,min=0,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
const fail=m=>{throw TypeError(m);};
const object=v=>v&&Object.getPrototypeOf(v)===Object.prototype;
function keys(v,allowed,required=allowed){if(!object(v)||Object.keys(v).some(k=>!allowed.includes(k))||required.some(k=>!Object.hasOwn(v,k)))fail('Invalid coop fields');}
function tree(v,path='',depth=0){
  if(depth>60)fail('Coop data too deep');
  if(v===undefined||v===null||['string','boolean'].includes(typeof v))return;
  if(typeof v==='number'){if(!Number.isFinite(v)&&!(v===Infinity&&path.endsWith('.reserve')))fail('Invalid coop number '+path);return;}
  if(v instanceof Set){for(const x of v)tree(x,path+'.$set',depth+1);return;}
  if(!object(v)&&!Array.isArray(v))fail('Coop data must be plain');
  for(const [k,x]of Object.entries(v)){if(['__proto__','prototype','constructor'].includes(k))fail('Unsafe coop key');tree(x,path+'.'+k,depth+1);}
}
function canonical(v){if(v instanceof Set)return {$set:[...v].map(canonical)};if(Array.isArray(v))return v.map(canonical);if(object(v))return Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])]));return v;}
const fp=v=>JSON.stringify(canonical(v));
const text=v=>typeof v==='string'&&v.length>0&&v.length<=180;
let checkpointLedgerEncoding=()=>null;
let checkpointReceiptEncoding=()=>null;
const OPTIONS=['seed','profile','scope','difficulty','players'];
const CONFIG=['playerId','slot','heroId','heroRuleVersion','paint','sidearm','supply','route','scheme'];
function optionsData(options,m){
  keys(options,OPTIONS);
  if(!int(options.seed,0,0xffffffff)||!['full3','chapter1','classic'].includes(options.scope)||!m.DIFFICULTY_IDS.includes(options.difficulty)||!Array.isArray(options.players)||options.players.length!==2)fail('Invalid coop options');m.getStageProfile(options.profile);
  options.players.forEach((p,index)=>{
    keys(p,CONFIG);if(p.playerId!==IDS[index]||p.slot!==index||!m.heroes.HERO_MAP[p.heroId]||!m.heroRules.validHeroRuleVersion(p.heroRuleVersion)||m.heroes.heroById(p.heroId,p.heroRuleVersion).id!==p.heroId||!m.heroes.PAINT_MAP[p.paint]||!m.heroes.SUPPLY_MAP[p.supply]||p.sidearm!==null&&!m.heroes.SIDEARMS.some(w=>w.id===p.sidearm)||p.route!=='none'&&!m.build.BUILD_ROUTES.some(r=>r.id===p.route)||p.scheme!==null&&p.scheme!=='foldshadow')fail('Invalid coop actor configuration');
    if((p.heroId==='foldshadow')!==(p.scheme==='foldshadow'))fail('Coop experiment identity mismatch');
  });
}
async function modules(){const m=await loadModules();[m.party,m.heroes,m.heroRules,m.build,m.ui,m.runtime,m.host,m.input,m.rewards]=await Promise.all([import('../game/coop_session.js'),import('../game/heroes.js'),import('../game/hero_rules.js'),import('../game/build_content_data.js'),import('../game/party_ui.js'),import('../game/weapon_assets_runtime.js'),import('../experimental/consumables/host_state.js'),import('./headless_input.js'),import('../game/coop_rewards.js')]);m.blankMeta=(await import('../game/meta.js')).blankMeta;m.life=await import('../game/party_lifecycle_transactions.js');m.shop=await import('../game/shop_transaction.js');checkpointLedgerEncoding=c=>m.rewards.trustedCoopLedgerEncoding(c?.party?.world?.coopRewards);checkpointReceiptEncoding=c=>m.party.trustedPartyReceiptEncoding(c?.party?.receipts,encodeCoopValue);return m;}
function encodeCoopValue(value){return JSON.stringify(value,(k,v)=>{if(v===undefined)return {$undefined:true};if(['__proto__','prototype','constructor'].includes(k))fail('Unsafe coop codec key');if(typeof v==='number'){if(Object.is(v,-0))return {$number:'-0'};if(v===Infinity)return {$number:'Infinity'};if(!Number.isFinite(v))fail('Invalid coop codec number');}return v instanceof Set?{$set:[...v]}:v;});}
function checkpointEncoding(c){const ledger=checkpointLedgerEncoding(c),receipts=checkpointReceiptEncoding(c),encoded=encodeTrustedRecord(c,[{path:['party','world','coopRewards'],raw:ledger?.raw??null,bytes:ledger?.bytes},{path:['party','receipts'],raw:receipts?.raw??null,bytes:receipts?.bytes}],encodeCoopValue);if(encoded.bytes>32*1024*1024)fail('Coop checkpoint exceeds 32 MiB');return encoded;}
export function encodeCoopCheckpoint(c){return checkpointEncoding(c).raw;}
export function decodeCoopCheckpoint(raw,m){const c=m.save.decodeSaveData(raw,32*1024*1024);function revive(v){if(v&&typeof v==='object'){if(Object.keys(v).length===1&&v.$undefined===true)return undefined;if(Object.keys(v).length===1&&v.$number==='-0')return -0;if(v instanceof Set)return new Set([...v].map(revive));for(const k of Object.keys(v))v[k]=revive(v[k]);}return v;}return revive(c);}
export function coopCheckpointKey(sessionId,runId){if(!text(sessionId)||!text(runId))fail('Explicit coop checkpoint identity required');return `bell-corridor:coop:checkpoint:v1:${encodeURIComponent(sessionId)}:${encodeURIComponent(runId)}`;}
function singleWorld(d){
  const w=d.world,a=d.actors.player;
  return {version:1,schemaVersion:6,seed:w.seed,floor:w.floor,hero:a.hero,heroRuleVersion:a.heroRuleVersion,modifier:w.activeModifier?.id||'',practice:!!w.practice,bossType:w.bossType,bossPractice:w.bossPractice,dungeon:copy(w.dungeon),rooms:copy(w.dungeon.rooms),roomId:w.roomId,roomStates:Object.fromEntries(Object.entries(w.roomStates).map(([uid,s])=>[uid,{...copy(s),weaponAssets:copy(s.actorRuntimes?.player)}])),scenes:copy(w.scenes),player:copy(a.player),companion:copy(a.companion),run:copy(w.run),rng:copy(w.rng),grng:copy(w.grng),tracking:copy(a.tracking),choice:['doctrine','attachment','evolution'].includes(a.choice?.kind)?copy(a.choice):null,runId:d.runId,buildSupply:copy(a.buildSupply),runPolicy:copy(w.runPolicy),revival:copy(a.personal.revival),shopTx:copy(w.shopTx),flowVersion:w.flowVersion,stage:copy(w.stage),stageRun:copy(w.stageRun),...(a.experiment?{combatMode:a.personal.combatMode,experiment:copy(a.experiment),consumables:copy(a.consumables)}:{})};
}
function panelState(a){
  const h=a.hud,p=h._choice||h._hub,type=h._choice?'choice':h._hub?'hub':'none';
  if(p&&!p.cfg.partyTyped)fail('Unsupported coop callback panel');
  const binding=p?(a.view.sessionStore?.choiceContexts[a.playerId]?'context':type==='hub'&&p.cfg.partyBinding==='supply'?'supply':type==='hub'&&p.cfg.partyBinding==='revival'?'revival':null):null;if(p&&!binding)fail('Unsupported coop typed panel');
  return {binding,type,index:p?.idx??0,id:p?.id??null,revision:p?.revision??0,sequence:h._panelSequence,navigation:{direction:h._hubNavDir??0,held:h._hubNavHeld??0,next:h._hubNavNext??1},buildOpen:!!a.buildOpen,modalStack:copy(a._modalStack),screen:h.screen,stats:h.stats??null,verdict:h.verdict??null};
}
function actorRuntime(a){return {input:captureInput(a.input),muzzle:muzzlePose(a.player),control:{active:a.weaponAssets.active,held:a.weaponAssets.held,blockHeld:a.weaponAssets.blockHeld,cancelEpoch:a.weaponAssets.cancelEpoch??null},panel:panelState(a)};}
function validateInput(i,m,a){
  keys(i,['worldAimPoint','analogMove','keys','pressed','released','mouse','mousePressed','wheel','anyKey','blocked','capturing','cancelEpoch','physicalActions','physicalKeys','touchDown','touchHit']);
  const bindings=m.controls.get(a.experiment?'experimental':'classic');
  for(const k of ['physicalActions','physicalKeys','touchDown','touchHit'])if(!Array.isArray(i[k])||i[k].length>64||new Set(i[k]).size!==i[k].length||i[k].some(x=>typeof x!=='string'||x.length>64||k!=='physicalKeys'&&!Object.hasOwn(bindings,x)))fail('Invalid coop saved input');
  for(const k of ['keys','pressed','released','mouse','mousePressed'])if(!object(i[k])||Object.values(i[k]).some(v=>typeof v!=='boolean'&&!(k==='mouse'&&typeof v==='number')))fail('Invalid coop saved input keys');
  if(!int(i.cancelEpoch)||typeof i.blocked!=='boolean'||typeof i.capturing!=='boolean'||typeof i.anyKey!=='boolean'||!Number.isFinite(i.wheel))fail('Invalid coop saved input flags');
  for(const k of ['worldAimPoint','analogMove'])if(i[k]!==null){keys(i[k],['x','z']);if(![i[k].x,i[k].z].every(Number.isFinite))fail('Invalid coop saved input vector');}
}
function validatePool(pool,st){
  keys(pool,['head','beamHead','slots','beams']);
  if(!int(pool.head,0,419)||!int(pool.beamHead,0,23)||!Array.isArray(pool.slots)||pool.slots.length!==st.projectiles.length||pool.slots.some((x,i)=>!int(x,0,419)||i>0&&x<=pool.slots[i-1])||!Array.isArray(pool.beams)||pool.beams.length!==24)fail('Invalid coop native pool');
  for(const b of pool.beams){keys(b,['life','maxLife','position','rotation','scale','color','opacity','visible']);if(!Number.isFinite(b.life)||b.life< -1||b.life>b.maxLife+1e-8||!Number.isFinite(b.maxLife)||b.maxLife<=0||b.maxLife>60||!int(b.color,0,0xffffff)||typeof b.visible!=='boolean'||!Number.isFinite(b.opacity)||b.opacity<0||b.opacity>1)fail('Invalid coop beam');for(const k of ['position','scale'])if(!Array.isArray(b[k])||b[k].length!==3||b[k].some(x=>!Number.isFinite(x)||Math.abs(x)>1e5))fail('Invalid coop beam transform');if(!Array.isArray(b.rotation)||b.rotation.length!==4||!['XYZ','YZX','ZXY','XZY','YXZ','ZYX'].includes(b.rotation[3])||b.rotation.slice(0,3).some(x=>!Number.isFinite(x)||Math.abs(x)>1e6))fail('Invalid coop beam rotation');}
}
function ownerTree(v,owner=null){
  if(!v||typeof v!=='object')return;
  for(const k of ['ownerPlayerId','ownerActorId'])if(v[k]!==undefined&&v[k]!==null&&(!IDS.includes(v[k])||owner&&v[k]!==owner))fail('Coop cross-owner reference');
  if(v instanceof Set)return;for(const x of Object.values(v))ownerTree(x,owner);
}
export function validateCoopCheckpoint(input,ctx){return validateCheckpoint(input,ctx,false);}
function validateCheckpoint(input,ctx,owned){
  const m=ctx.modules,ledger=m.rewards.restoreCoopRewardLedger(input?.party?.world?.coopRewards,{runId:input?.runId,playerIds:IDS});
  let c;
  if(owned){
    // Only snapshot's freshly captured, detached data enters here. Party's own
    // validator still checks every live world/actor field below. Avoid cloning
    // that same capture and walking its generic tree twice.
    tree({...input,party:null});c=input;c.party.world.coopRewards=ledger;
  }else{
    const history=m.party.trustedPartyReceipts(input?.party?.receipts,{sessionId:input?.sessionId,runId:input?.runId,revision:input?.revision}),plain={...input,party:{...input.party,...(history?{receipts:null}:{}),world:{...input.party.world,coopRewards:null}}};
    tree(plain);c=copy(plain);c.party.world.coopRewards=ledger;if(history)c.party.receipts=input.party.receipts;
  }
  keys(c,['format','schemaVersion','source','sessionId','runId','generation','revision','options','party','runtime','actors','ack','scheduler','store','meta','rpcReceipts']);
  if(c.format!==COOP_CHECKPOINT_FORMAT||c.schemaVersion!==COOP_CHECKPOINT_SCHEMA||c.source!==ctx.source||c.sessionId!==ctx.sessionId||c.generation!==ctx.generation||!text(c.runId)||c.runId!==c.party?.runId||ctx.runId&&c.runId!==ctx.runId||c.revision!==c.party?.revision)fail('Coop checkpoint source/session/run/generation mismatch');
  optionsData(c.options,m);if(fp(c.options)!==fp(ctx.options))fail('Coop checkpoint options mismatch');
  m.party.validatePartyDraft(c.party,{sessionId:c.sessionId,runId:c.runId});
  const w=c.party.world;
  // Validate the world once through its original low-level schema, then both
  // actor runtime records and party-wide ownership/ledger associations.
  const single=singleWorld(c.party);m.session.validateSession(single,{runtimeState:w.state,party:true,partyDowned:!!w._partyLifecycle?.downed?.player,partyCombatAbilities:Object.values(c.party.actors).some(a=>!!a.experiment)});validateRuntimeActors(single);
  validatePartyLifecycle(w._partyLifecycle,w);
  if(!['play','dead','victory'].includes(w.state)||w.transition!==null||w.comparison||w.practice||w.seed!==(c.options.seed||1)||w.runPolicy.difficulty!==c.options.difficulty||(w.flowVersion===1)!==(c.options.scope==='classic')||w.flowVersion===2&&(w.stage.profile!==c.options.profile||w.stage.campaignScope!==c.options.scope))fail('Unsupported coop lifecycle or run identity');
  const current=w.roomStates[w.roomUid];if(fp((w.pendingLoot||[]).filter(q=>q.roomId===w.roomUid))!==fp(current.lootQueue))fail('Coop pending loot/world mirror mismatch');
  if(!Array.isArray(w.pendingSpawns)||w.pendingSpawns.some(q=>!w.dungeon.rooms.some(r=>r.uid===q.roomUid))||fp(w.pendingSpawns.filter(q=>q.roomUid===w.roomUid).map(q=>{const {roomUid,...data}=q;return data;}))!==fp(current.pending))fail('Coop pending spawn/world mirror mismatch');
  const instances=new Set();for(const gun of [...IDS.flatMap(id=>c.party.actors[id].player.weapons),...Object.values(w.roomStates).flatMap(st=>[...st.pickups,...st.lootQueue.map(q=>q.opts)])])if(gun.assetInstanceId){if(instances.has(gun.assetInstanceId))fail('Duplicate coop physical weapon instance');instances.add(gun.assetInstanceId);}
  keys(c.runtime,['paused','eventSequence','enemySequence','pickupSequence','pool','checkpointPending','completionDeferred','floorCompletionDeferred','commandQueue']);
  if(typeof c.runtime.paused!=='boolean'||!int(c.runtime.eventSequence)||!int(c.runtime.enemySequence,1)||!int(c.runtime.pickupSequence)||typeof c.runtime.checkpointPending!=='boolean'||c.runtime.completionDeferred!==null||c.runtime.floorCompletionDeferred)fail('Invalid coop runtime');
  if(!Array.isArray(c.runtime.commandQueue)||c.runtime.commandQueue.length>128)fail('Invalid queued coop commands');for(const q of c.runtime.commandQueue){keys(q,['actorId','request']);if(!IDS.includes(q.actorId)||!text(q.request?.requestId)||!text(q.request?.kind))fail('Invalid queued coop command');}
  validatePool(c.runtime.pool,w.roomStates[w.roomUid]);
  keys(c.actors,IDS);keys(c.ack,IDS);
  const enemies=new Set();
  for(const st of Object.values(w.roomStates)){
    const entities=new Set([...IDS,...IDS.map(id=>c.party.actors[id].companion?.id).filter(Boolean),...(st.boss?['boss']:[])]);
    for(const e of st.enemies){if(!/^e[1-9]\d*$/.test(e.id)||enemies.has(e.id)||Number(e.id.slice(1))>=c.runtime.enemySequence)fail('Duplicate coop enemy or watermark');enemies.add(e.id);entities.add(e.id);}
    for(const b of st.projectiles)if(b.ownerId!==null&&!entities.has(b.ownerId)||IDS.includes(b.ownerId)&&b.ownerActorId&&b.ownerId!==b.ownerActorId)fail('Unresolved coop native owner');
    ownerTree(st);for(const id of IDS)if(st.actorRuntimes?.[id])ownerTree(st.actorRuntimes[id],id);
  }
  for(const id of IDS){
    const a=c.party.actors[id],r=c.actors[id],config=c.options.players[a.slot];
    if(a.hero!==config.heroId||a.heroRuleVersion!==config.heroRuleVersion||a.personal.experimentScheme!==config.scheme&&a.personal.experimentScheme!==undefined||!!a.experiment!==(config.scheme==='foldshadow')||a.experiment&&a.experiment.scheme!==config.scheme||(a.buildSupply?.selectedRoute||'none')!==config.route)fail('Coop actor config/experiment mismatch');
    validateRuntimePlayer(a.player,id);if(typeof a.player.connected!=='boolean'||a.player.connected!==(w._partyLifecycle.connections[id].status==='ready'))fail('Coop connection/player mismatch');ownerTree(a.companion,id);keys(r,['input','muzzle','control','panel']);validateInput(r.input,m,a);
    keys(c.ack[id],['seq','fingerprint']);if(!int(c.ack[id].seq)||c.ack[id].seq===0&&c.ack[id].fingerprint!==null||c.ack[id].seq>0&&typeof c.ack[id].fingerprint!=='string')fail('Invalid coop input acknowledgement');
    const control=r.control;keys(control,['active','held','blockHeld','cancelEpoch']);if(typeof control.held!=='boolean'||typeof control.blockHeld!=='boolean'||control.cancelEpoch!==null&&!int(control.cancelEpoch)||control.active!==null&&!a.player.weapons.some(w=>w.assetInstanceId===control.active))fail('Invalid coop held control');
    if(!Array.isArray(r.muzzle)||r.muzzle.length>32)fail('Invalid coop muzzle');for(const t of r.muzzle){keys(t,['path','position','rotation','scale']);for(const k of ['path','position','rotation','scale'])if(!Array.isArray(t[k]))fail('Invalid coop muzzle transform');if(t.path.length>32||t.path.some(x=>!int(x,0,1000))||t.position.length!==3||t.scale.length!==3||t.rotation.length!==4||!['XYZ','YZX','ZXY','XZY','YXZ','ZYX'].includes(t.rotation[3])||t.position.some(x=>!Number.isFinite(x)||Math.abs(x)>1e5)||t.scale.some(x=>!Number.isFinite(x)||Math.abs(x)>100)||t.rotation.slice(0,3).some(x=>!Number.isFinite(x)||Math.abs(x)>1e6))fail('Invalid coop muzzle path');}
    const p=r.panel;keys(p,['binding','type','index','id','revision','sequence','navigation','buildOpen','modalStack','screen','stats','verdict']);keys(p.navigation,['direction','held','next']);
    if(!['none','choice','hub'].includes(p.type)||!int(p.index,0,1000)||!int(p.revision)||!int(p.sequence)||p.id!==null&&(!/^panel:[1-9]\d*$/.test(p.id)||Number(p.id.slice(6))>p.sequence)||typeof p.buildOpen!=='boolean'||!Array.isArray(p.modalStack)||p.modalStack.some(x=>!['build','hub','choice'].includes(x))||new Set(p.modalStack).size!==p.modalStack.length||w.state==='play'&&(p.stats!==null||p.verdict!==null)||![null,'screen-pause','screen-death','screen-victory'].includes(p.screen)||![-1,0,1].includes(p.navigation.direction)||p.navigation.held<0||p.navigation.next<1||p.navigation.held>p.navigation.next+1e-8)fail('Invalid coop personal panel');
    if(p.type==='none'&&p.id!==null||p.type!=='none'&&(!p.id||!['context','supply','revival'].includes(p.binding)||p.binding==='context'&&!a.choiceContext||['supply','revival'].includes(p.binding)&&p.type!=='hub'||p.binding==='revival'&&!a.personal.revivalPending)||p.type==='choice'&&!a.choice?.options?.length)fail('Coop panel typed context missing');
  }
  new TickScheduler().register('game-lifecycle',()=>{}).register('party-result',()=>{}).validate(c.scheduler);for(const t of c.scheduler.tasks)if(t.type!=='party-result'||t.payload.runId!==c.runId||!IDS.includes(t.payload.actorId)||t.payload.result!==w._partyLifecycle.settled?.result)fail('Invalid party lifecycle task');
  keys(c.store,['requestSerial','sourceSerial','publishedRevision','publicationPending','maxReceipts']);if(!int(c.store.requestSerial)||!int(c.store.sourceSerial)||c.store.sourceSerial!==w.rewardSerial||c.store.publishedRevision!==c.revision||c.store.publicationPending!==false||!int(c.store.maxReceipts,1,32768)||c.party.receipts.length>c.store.maxReceipts)fail('Unresolved coop transaction checkpoint');
  keys(c.meta,['data','dirty','clearActive','time']);m.save.validateEnvelope({format:'ember-descent',version:2,schemaVersion:6,meta:c.meta.data,active:null});if(typeof c.meta.dirty!=='boolean'||typeof c.meta.clearActive!=='boolean'||!Number.isFinite(c.meta.time)||c.meta.time<0)fail('Invalid coop meta');
  if(!Array.isArray(c.rpcReceipts)||c.rpcReceipts.length>4096)fail('Invalid coop UI receipts');const requests=new Set();for(const r of c.rpcReceipts){keys(r,['actorId','requestId','fingerprint','result']);const k=r.actorId+'\n'+r.requestId;if(!IDS.includes(r.actorId)||!text(r.requestId)||typeof r.fingerprint!=='string'||requests.has(k)||!object(r.result))fail('Invalid coop UI receipt');requests.add(k);}
  return c;
}

export async function createCoopGameSession({sessionId=globalThis.crypto.randomUUID(),generation=1,checkpoint,loadRunId,storage,persistence,actorProgress,...runOptions}={}){
  if(!text(sessionId)||!int(generation,1))fail('Invalid coop session identity');
  const source=await runtimeSourceIdentity(),scheduler=new TickScheduler();let m,c;
  const options={seed:3131,profile:'standard',scope:'full3',difficulty:'standard',players:[{playerId:'player',slot:0,heroId:'warden',heroRuleVersion:3,paint:'orig',sidearm:null,supply:'none',route:'none',scheme:null},{playerId:'player2',slot:1,heroId:'tamer',heroRuleVersion:3,paint:'orig',sidearm:null,supply:'none',route:'none',scheme:null}],...runOptions};
  if(persistence){keys(persistence,['dataRoot']);if(storage)fail('Choose one coop storage adapter');storage=await (await import('./party_file_storage.mjs')).createPartyFileStorage({...persistence,namespace:sessionId});}
  storage||=new MemoryStorage('coop:'+sessionId);
  if(loadRunId){if(checkpoint)fail('Choose checkpoint or stored run');const raw=await storage.getItem(coopCheckpointKey(sessionId,loadRunId));if(raw===null)fail('Coop checkpoint missing');checkpoint={raw};}
  const runtime=await createHeadlessGame({seed:options.seed,heroId:options.players?.[0]?.heroId,profile:options.profile,scope:options.scope,difficulty:options.difficulty,sessionId,scheduler,
    prepare:async()=>{m=await modules();optionsData(options,m);if(actorProgress){keys(actorProgress,IDS);for(const id of IDS)if(actorProgress[id]!==null)m.save.validateEnvelope({format:'ember-descent',version:2,schemaVersion:6,meta:actorProgress[id],active:null});}if(checkpoint)c=validateCoopCheckpoint(checkpoint.raw?decodeCoopCheckpoint(checkpoint.raw,m):checkpoint,{modules:m,source,sessionId,generation,options,...(loadRunId?{runId:loadRunId}:{})});},
    initialize:g=>c?hydrateWorld(g,c,m):startWorld(g,options,m,actorProgress?.player)});
  const s=new CoopGameSession(runtime,scheduler,m,{sessionId,generation,source,options,storage,initialProgress:actorProgress});
  try{await s._attach(c);if(c)s._applyRuntime(c);await s._recoverJournal(c,!!loadRunId);if(!c)await s.save();return s;}catch(e){s.dispose();throw e;}
}
function adapters(g,id,m){return {input:new m.input.HeadlessInput(),hud:new HeadlessHUD(null,(type,data)=>g.platform.emit(type,{actorId:id,audience:'actor',value:data}))};}
function primaryHUD(g){g.hud.emit=(type,data)=>g.platform.emit(type,{actorId:'player',audience:'actor',value:data});}
function startWorld(g,o,m,hostProgress){primaryHUD(g);g._partyLifecycle=newPartyLifecycle();g.altarUses={};
  if(hostProgress){m.meta.data=copy(hostProgress);m.meta.normalize();}else m.meta.data.sel.modifier='';
  m.meta.data.difficulty=o.difficulty;
  if(m.meta.sel.modifier&&!m.meta.hasModifier(m.meta.sel.modifier))fail('Unowned cooperative world modifier');
  const a=o.players[0];m.meta.data.sel={...m.meta.data.sel,hero:a.heroId,paint:a.paint,supply:a.supply,sidearm:a.sidearm||'',route:a.route};g.experimentScheme=a.scheme;
  // Both actors use the same original constructor/rules. Primary rule version
  // is explicit too, with one world/run initialization and one meta.runs update.
  g.startNewRun(o.seed,{...(o.scope==='classic'?{}:{stageScope:o.scope,stageProfile:o.profile}),actorConfig:a});
  const b=o.players[1];g.createRuntimeActor(b,adapters(g,b.playerId,m));for(const a of g.actors.values())a.player.connected=true;
}
function hydrateWorld(g,c,m){primaryHUD(g);
  const d=c.party,w=d.world,a=d.actors.player;
  m.meta.data=copy(c.meta.data);m.meta._dirty=false;m.meta._clearActive=false;
  g._restoring=true;g._runtimeRestoring=true;
  try{g.startNewRun(w.seed,{practice:w.floor,restoreHero:a.hero,restoreHeroRuleVersion:a.heroRuleVersion,restoreActorRecord:a,restoreExperiment:a.experiment,restoreModifier:w.activeModifier?.id||'',restoreDungeon:w.dungeon,restoreStage:w.flowVersion===2?w.stage:null,restoreStageRun:w.stageRun});}finally{g._restoring=false;}
  g.runId=d.runId;g.runPolicy=copy(w.runPolicy);
  const b=d.actors.player2;g.createRuntimeActor({...c.options.players[1],restoreActorRecord:b},adapters(g,'player2',m));
  for(const id of IDS){const actor=g.getActor(id),r=d.actors[id];Object.assign(actor,copy(r.personal));actor.tel=copy(r.telemetry);actor.buildSupply=copy(r.buildSupply);actor._partyFloorRewards=copy(r.floorRewards);actor.experiment=copy(r.experiment);if(r.consumables){const h=m.host.restoreConsumableHost(r.consumables);actor.consumables=h.state;actor.consumablePurchases=h.purchases;}for(const [key,value]of Object.entries(r.tracking))actor.view[key]=copy(value);actor._pendingChoice=copy(r.choice);actor.input.setProfile(actor.experiment?'experimental':'classic');}
  g.roomStates=new Map(Object.entries(copy(w.roomStates)));for(const [uid,sc]of Object.entries(w.scenes))g._residentRooms.get(uid)?.importState(copy(sc));
  g._restoringRoom=true;try{g.buildRoom(g.dungeon.rooms.get(w.roomId),null,{keepPos:true});}finally{g._restoringRoom=false;g._runtimeRestoring=false;}
  for(const id of IDS){const a=g.getActor(id),r=d.actors[id],snap=w.roomStates[w.roomUid].actorRuntimes[id];m.session.applyPlayer(a.view,r.player);a.weaponAssets.restore(snap,{resumeRuntime:true});a.weaponAssets.serial=snap.serial;if(a.companion&&r.companion)Object.assign(a.companion,copy(r.companion));for(const [key,value]of Object.entries(r.tracking))a.view[key]=copy(value);}
  for(const saved of w.dungeon.rooms){const room=g.dungeon.rooms.get(saved.id);for(const key of Object.keys(room))if(!Object.hasOwn(saved,key))delete room[key];Object.assign(room,copy(saved));}
  const special=new Set(['coopRewards','dungeon','scenes','roomStates','roomId','roomUid','rng','grng','allocator','pickupSerial','pickupClock','partyShops','rewardQueue','rewardSerial','pendingSpawns']);for(const [key,value]of Object.entries(w))if(!special.has(key))g[key]=copy(value);
  g.coopRewards=w.coopRewards;g.rng.seed=w.rng.seed;g.grng.seed=w.grng.seed;g.rng.s=w.rng.s;g.grng.s=w.grng.s;g.weaponSerialAllocator.restore(w.allocator);g._partyPickupSerial=w.pickupSerial;g.pickups.t=w.pickupClock;g._partyShops=copy(w.partyShops);g._partyRewardQueue=copy(w.rewardQueue);g._partyRewardSerial=w.rewardSerial;g.pendingSpawns=w.pendingSpawns.map(q=>{const {roomUid,...r}=copy(q);const room=g.dungeon.list.find(x=>x.uid===roomUid);if(!room)fail('Unresolved pending spawn room');return {...r,room};});g.mode='run';g.attract=false;g.ritual=null;
  g._doorsLocked=null;g.syncDoorLocks();g.updateConnectors(0);g.shakeAmt=w.shakeAmt;
}

export class CoopGameSession{
  constructor(runtime,scheduler,modules,identity){this.runtime=runtime;this.game=runtime.game;this.scheduler=scheduler;this.modules=modules;Object.assign(this,identity);this.paused=false;this.disposed=false;this.busy=false;this.saveBlocked=false;this.saveError='';this.eventSequence=0;this.ack=Object.fromEntries(IDS.map(id=>[id,{seq:0,fingerprint:null}]));this.rpcReceipts=[];this.commandQueue=[];this.commandWaiters=new Map();this.game._partyCheckpointOwner=this;this.scheduler.register('party-result',t=>this.showResult(t));}
  async _attach(c){const g=this.game,storage=this.storage;
    // A checkpoint explicitly restores store identity; constructor still refuses
    // implicit overwrites for all ordinary E callers.
    const bootstrap=c?{getItem:async()=>null,setItem:()=>{throw Error('Restore bootstrap cannot write');}}:storage;
    this.store=g.beginPartySession({sessionId:this.sessionId,runId:g.runId,storage:bootstrap,maxReceipts:c?.store.maxReceipts,restoring:!!c});await this.store.ready;this.store.storage=storage;this.store.manualSources=true;
    if(!c&&this.initialProgress){for(const id of IDS){this.store.actorMeta[id]=copy(this.initialProgress[id]??this.modules.blankMeta());this.store.actorMeta[id].stats.runs++;}delete this.initialProgress;}
    if(!c){const d=this.modules.party.capturePartyDraft(g,{sessionId:this.sessionId,runId:g.runId,revision:0,receipts:[],actorMeta:this.store.actorMeta,choiceContexts:this.store.choiceContexts});for(const id of IDS)if(d.actors[id].choiceContext)this.modules.ui.showPartyChoice(g.getActor(id).view,d.actors[id]);for(const id of IDS){const a=g.getActor(id);if(a.hero.id==='veteran'&&a.hero.ruleVersion===3&&!a.player.c2.doctrinePending){const opened=await g.partyCommand(id,this.store.request('doctrine-open'));if(!opened.ok)fail(opened.error);}}}
    if(c){Object.assign(this.store,copy(c.store),{revision:c.revision,receipts:this.modules.party.copyPartyReceipts(c.party.receipts),actorMeta:Object.fromEntries(IDS.map(id=>[id,copy(c.party.actors[id].meta)])),choiceContexts:Object.fromEntries(IDS.map(id=>[id,copy(c.party.actors[id].choiceContext)])),lastCommitted:c.party});}
  }
  async _recoverJournal(c,recover=false){if(!c)return;const raw=await this.storage.getItem(this.store.key);if(raw===null)return;const record=this.modules.party.decodePartyDraft(raw,this.store.identity());if(record.revision<c.revision)fail('Stored party journal predates checkpoint');if(record.revision===c.revision){this.store.confirmCheckpointRecord(record,raw);return;}
    if(!recover)fail('Stored party journal is newer than checkpoint');
    if(record.revision!==c.revision+1||record.world.time!==c.party.world.time||record.world.roomUid!==c.party.world.roomUid)fail('Stored party journal cannot recover from this checkpoint');
    this.store.busy=true;this.store.acceptCommitted(record,raw);this.store.sourceSerial=record.world.rewardSerial;try{this.store.publishCommitted();}finally{this.store.busy=false;}await this.save();
  }
  _live(id){if(this.disposed)fail('Coop session disposed');if(id!==undefined&&!IDS.includes(id))fail('Unknown playerId');if(this.game.actorCount!==2)fail('Coop actors unavailable');}
  _idle(){this._live();if(this.busy)fail('Coop session busy');}
  async _exclusive(fn){this._idle();this.busy=true;try{return await fn();}finally{this.busy=false;}}
  submitInput(id,input){this._idle();this._live(id);if(this.saveBlocked||this.store.frozen||Object.values(this.game._partyLifecycle.connections).some(c=>c.status!=='ready')||this.game._partyLifecycle.barrier)fail('Coop input frozen');tree(input);const c=this.game._partyLifecycle.connections[id];if(c.status!=='ready'||c.epoch>1&&input.actorEpoch!==c.epoch||input.actorEpoch!==undefined&&input.actorEpoch!==c.epoch)fail('Stale actor input epoch');const {actorEpoch,...data}=input;inputData(data,this.game.getActor(id).view);const fingerprint=fp(input),ack=this.ack[id];if(input.seq===ack.seq){if(fingerprint!==ack.fingerprint)fail('Input sequence payload conflict');return {seq:ack.seq,tick:this.scheduler.tick,replay:true};}if(input.seq<ack.seq)fail('Stale input sequence');this.game.getActor(id).input.submit(input,this.game.getActor(id).player);this.ack[id]={seq:input.seq,fingerprint};return {seq:input.seq,tick:this.scheduler.tick,replay:false};}
  async command(id,request){return this._exclusive(async()=>{this._live(id);tree(request);if(!object(request)||!text(request.requestId)||!text(request.kind))fail('Invalid coop command');if(request.sessionId!==undefined&&request.sessionId!==this.sessionId||request.runId!==undefined&&request.runId!==this.game.runId||request.generation!==undefined&&request.generation!==this.generation)fail('Coop command identity mismatch');if(this.saveBlocked)fail('Coop checkpoint save blocked');const connection=this.game._partyLifecycle.connections[id];if(!['lifecycle.disconnect','lifecycle.reconnect','lifecycle.connection-ready'].includes(request.kind)&&(connection.epoch>1&&request.actorEpoch!==connection.epoch||request.actorEpoch!==undefined&&request.actorEpoch!==connection.epoch))fail('Stale actor command epoch');
    if(request.kind.startsWith('lifecycle.')){const old=this.rpcReceipts.find(r=>r.actorId===id&&r.requestId===request.requestId),fingerprint=fp(request);if(old){if(old.fingerprint!==fingerprint)fail('Coop lifecycle request conflict');return copy(old.result);}if(this.rpcReceipts.length>=4096)fail('Coop lifecycle receipt journal full');keys(request,['requestId','kind','sessionId','runId','generation','actorEpoch',...(['lifecycle.confirm','lifecycle.ready'].includes(request.kind)?['barrierId']:[]),...(['lifecycle.reconnect','lifecycle.connection-ready'].includes(request.kind)?['actorEpoch']:[])],['requestId','kind',...(['lifecycle.confirm','lifecycle.ready'].includes(request.kind)?['barrierId']:[]),...(['lifecycle.reconnect','lifecycle.connection-ready'].includes(request.kind)?['actorEpoch']:[])]);if(this.game._partyRewardQueue.length)await this._flushSources();await this.save();const result=await partyLifecycleCommand(this,id,request);this.rpcReceipts.push({actorId:id,requestId:request.requestId,fingerprint,result:copy(result)});await this.save();return result;}
    if(this.game._partyLifecycle.barrier)fail('Party transition barrier');if(Object.values(this.game._partyLifecycle.connections).some(c=>c.status!=='ready'))fail('Party connection barrier');
    const {generation,actorEpoch,...typed}=request;
    // Store commands have their own actor-scoped fingerprinted transaction
    // receipts. Capture the exact pre-command physics boundary before commit.
    if(!request.kind.includes('.')&&!['interact','pause','resume'].includes(request.kind)){if(this.game._partyRewardQueue.length)await this._flushSources();await this.save();const result=await this.game.partyCommand(id,typed);if(result.ok)await this.save();return result;}
    const old=this.rpcReceipts.find(r=>r.actorId===id&&r.requestId===request.requestId),fingerprint=fp(request);if(old){if(old.fingerprint!==fingerprint)fail('Coop UI request payload conflict');return copy(old.result);}if(this.rpcReceipts.length>=4096)fail('Coop UI receipt journal full');
    const actor=this.game.getActor(id),h=actor.hud,p=h.pending(),kind=request.kind,panel=/^(choice|hub)\./.test(kind);
    keys(request,['requestId','kind','sessionId','runId','generation','actorEpoch',...(panel?['panelId','revision']:[]),...(['choice.pick','hub.pick'].includes(kind)?['index']:[]),...(['choice.nav','hub.nav','active.cycle'].includes(kind)?['delta']:[]),...(kind==='active.select'?['activeId']:[]),...(kind==='scene.table-flip'?['saveId']:[])],['requestId','kind',...(panel?['panelId','revision']:[])]);
    if(panel&&(!p||p.panelId!==request.panelId||p.revision!==request.revision||!kind.startsWith(p.type+'.')))fail('Stale coop personal panel');await this.save();let ok=true;
    if(kind==='active.select'){if(!actor.player.actives.includes(request.activeId))fail('Unknown owned active');ok=actor.view.selectActive(request.activeId);}else if(kind==='active.cycle'){if(![-1,1].includes(request.delta))fail('Invalid active direction');ok=actor.view.cycleActive(request.delta);}else if(kind==='scene.table-flip'){const it=actor.view.nearestInteractable();if(it?.type!=='table'||it.prop?.saveId!==request.saveId)fail('Table unreachable');Object.getPrototypeOf(this.game).interact.call(actor.view);}else if(kind==='choice.pick'){if(!int(request.index,0,p.options.length-1))fail('Invalid coop panel index');ok=await h.choicePick(request.index);}else if(kind==='choice.confirm')ok=await h.choiceConfirm();else if(kind==='choice.nav'||kind==='hub.nav'){if(![-1,1].includes(request.delta))fail('Invalid coop panel direction');kind==='choice.nav'?h.choiceNav(request.delta):h.hubNav(request.delta);}else if(kind==='hub.pick'){if(!int(request.index,0,p.rows.length-1)||p.rows[request.index].disabled)fail('Invalid coop panel row');h._hub.idx=request.index;const result=await h.hubConfirm();ok=result?.ok??result??false;}else if(kind==='hub.confirm'){const result=await h.hubConfirm();ok=result?.ok??result??false;}else if(kind==='choice.back'||kind==='hub.back')ok=actor.view.closeTopPanel();else if(kind==='pause')this._setPaused(true);else if(kind==='resume')this._setPaused(false);else if(kind==='equipment.open')actor.view.setBuild(true);else if(kind==='equipment.close')actor.view.setBuild(false);else if(kind==='interact')fail('Use explicit typed coop acquisition commands');else fail('Unsupported coop UI command');
    const result={ok:ok!==false,tick:this.scheduler.tick,panel:h.pending()};this.rpcReceipts.push({actorId:id,requestId:request.requestId,fingerprint,result:copy(result)});await this.save();return result;
  });}
  queueSeen(id,catalogKind,value){if(!value||this.game.state!=='play'||this.game._restoring||this.game._warming||!this.store.actorMeta[id].seen[catalogKind]||this.store.actorMeta[id].seen[catalogKind].includes(value)||this.commandQueue.some(q=>q.actorId===id&&q.request.kind==='party-seen'&&q.request.catalogKind===catalogKind&&q.request.id===value))return false;this.queueActorCommand(id,{...this.store.request('party-seen'),catalogKind,id:value});return true;}
  queueAchievements(id,extra={}){if(this.game.state!=='play'||!this.modules.life.hasPartyAchievement(this.store,id,extra))return 0;const old=this.commandQueue.find(q=>q.actorId===id&&q.request.kind==='party-achievements');if(old)Object.assign(old.request.extra,copy(extra));else this.queueActorCommand(id,{...this.store.request('party-achievements'),extra:copy(extra)});return 0;}
  bossDefeated(){const g=this.game,l=g._partyLifecycle;if(l.bossPending||l.bosses[g.stage?.stageKey||`floor:${g.floor}`])return false;l.bossPending=true;g._stageBossPending=true;this.queueActorCommand('player',this.store.request('party-boss'));return true;}
  actorDowned(id){const g=this.game,l=g._partyLifecycle,a=g.getActor(id);if(l.downed[id]||l.settled)return false;l.downed[id]={roomUid:g.room.uid,status:'queued'};a.weaponAssets.suspend();a.input.resetState();a.input.setBlocked(true);this.queueActorCommand(id,this.store.request('party-down'));return true;}
  roomCleared(){if(IDS.some(id=>this.game._partyLifecycle.downed[id]))this.queueActorCommand('player',this.store.request('party-clear-revive'));}
  showRevival(id){const a=this.game.getActor(id);if(!a.revivalPending)return;a.hud.hubPanel({partyTyped:true,partyBinding:'revival',title:'濒死 · 一次复苏',rows:[{cn:'接受复苏',act:'accept'},{cn:'等待队友',act:'decline'}],onPick:r=>this.queueLifecycle(id,r.act==='accept'?'lifecycle.revive':'lifecycle.decline')});}
  async lifeTransaction(id,request){const result=await this.store.transact(id,request,this.modules.life.planPartyLife);if(result.ok){for(const aid of IDS){const a=this.game.getActor(aid);if(a.revivalPending)this.showRevival(aid);else if(a.hud._hub?.cfg.partyBinding==='revival')a.hud.closeHubPanel();}this.scheduleResults();}return result;}
  scheduleResults(){const l=this.game._partyLifecycle;if(!l.settled)return;for(const aid of IDS){this.game.getActor(aid).input.setBlocked(true);if(!this.game.getActor(aid).hud.screen?.startsWith('screen-death')&&!this.game.getActor(aid).hud.screen?.startsWith('screen-victory')&&![...this.scheduler.tasks.values()].some(t=>t.type==='party-result'&&t.payload.actorId===aid))this.scheduler.schedule('party-result',{runId:this.game.runId,actorId:aid,result:l.settled.result},l.settled.result==='dead'?1500:3200);}this.game._lifecycleTimers=new Set(this.scheduler.tasks.keys());}
  showResult(t){const g=this.game;if(t.runId!==g.runId||t.result!==g._partyLifecycle.settled?.result)return;const a=g.getActor(t.actorId),p=a.player,run={...g.run,result:t.result,floor:g.floor,coins:p.coins,keys:p.keys,weapons:p.weapons.map(w=>w.def.id),items:[...p.items],actives:[...p.actives]};if(t.result!=='dead')a.hud.setVictoryVerdict(this.modules.life.partyVerdict(g));a.hud.fillStats(run,t.result==='dead'?'death-stats':'victory-stats');a.hud.showScreen(t.result==='dead'?'screen-death':'screen-victory');}
  detectRoomCrossing(){detectPartyRoomCrossing(this);}
  queueLifecycle(id,kind){const request=this.store.request(kind);return this.inTick?this.queueActorCommand(id,request):partyLifecycleCommand(this,id,request);}
  queueActorCommand(actorId,request){if(this.commandQueue.length>=128)throw Error('Coop tick command queue full');const q={actorId,request:copy(request)};if(request.kind.startsWith('party-'))delete q.request.expectedRevision;this.commandQueue.push(q);return new Promise((resolve,reject)=>this.commandWaiters.set(q,{resolve,reject}));}
  async _flushSources(){await this.save();const result=await this.store.flushSources();if(result.ok)await this.save();return result;}
  async _flushCommands(){while(this.commandQueue.length){const q=this.commandQueue[0];await this.save();const result=q.request.kind.startsWith('party-')?await this.lifeTransaction(q.actorId,q.request):q.request.kind.startsWith('lifecycle.')?await partyLifecycleCommand(this,q.actorId,q.request):await this.game.partyCommand(q.actorId,q.request);if(!result.ok&&q.request.kind.startsWith('party-')){this.game._partyCheckpointPending=true;break;}this.commandQueue.shift();this.commandWaiters.get(q)?.resolve(result);this.commandWaiters.delete(q);if(result.ok)await this.save();if(this.store.blocked)break;}}
  async step(ticks=1){return this._exclusive(async()=>{if(!int(ticks,1,36000))fail('Invalid coop step count');let advanced=0;const g=this.game;await this.store.ready;
    if(this.store.publicationPending||this.store.blocked||this.saveBlocked)return {...this.state(),advanced};
    for(let i=0;i<ticks;i++){
      if(this.commandQueue.length)await this._flushCommands();
      if(this.paused||g.paused||g._partyLifecycle.barrier||Object.values(g._partyLifecycle.connections).some(c=>c.status!=='ready')||g._stageBossPending||!['play','dead','victory'].includes(g.state)||g.state==='play'&&IDS.every(id=>!g.getActor(id).player.alive)&&!this.commandQueue.length)break;
      if(g._partyRewardQueue.length){const r=await this._flushSources();if(!r.ok)break;}
      if(this.commandQueue.length)await this._flushCommands();
      if(this.store.busy)break;
      if(g._partyCheckpointPending){await this.save();g._partyCheckpointPending=false;}
      if(g.state==='play'&&IDS.every(id=>!g.getActor(id).player.alive))break;
      let n;this.inTick=true;try{n=g.stepSim(1,FIXED_DT);}finally{this.inTick=false;}if(!n)break;this.scheduler.advance();g._lifecycleTimers=new Set(this.scheduler.tasks.keys());advanced++;
      if(g._partyRewardQueue.length)await this._flushSources();
      if(this.commandQueue.length)await this._flushCommands();
      if(g._partyCheckpointPending){await this.save();g._partyCheckpointPending=false;}
    }
    return {...this.state(),advanced};
  });}
  _setPaused(value){this._live();this.paused=value;this.game.setPaused(value);return this.state();}
  pause(){this._idle();return this._setPaused(true);}
  resume(){this._idle();return this._setPaused(false);}
  state(){this._live();const g=this.game;return {sessionId:this.sessionId,generation:this.generation,runId:g.runId,tick:this.scheduler.tick,revision:this.store?.revision??0,state:g.state,lifecycle:copy(g._partyLifecycle),frozen:g.state==='play'&&IDS.every(id=>!g.getActor(id).player.alive)||!!g._partyLifecycle.barrier||this.saveBlocked||!!this.store?.frozen||!!g._partyCheckpointPending||!!g._stageBossPending,paused:this.paused||g.paused,time:g.time,runTime:g.run.time,support:{lifecycle:'party-v1',checkpoint:'complete-v1'},roomId:g.room.uid,floor:g.floor,stage:g.stage?.stageKey||null,persistence:{kind:this.storage.kind||'memory',blocked:this.saveBlocked||!!this.store?.blocked,error:this.saveError||this.store?.error||''},players:IDS.map(id=>{const a=g.getActor(id),p=a.player;return {id,slot:a.slot,hero:a.hero.id,x:p.x,z:p.z,hp:p.hp,armor:p.armor,alive:p.alive,weaponIndex:p.weaponIndex,weaponId:p.weapon.def.id,mag:p.weapon.mag,reserve:p.weapon.reserve,coins:p.coins,keys:p.keys,ack:this.ack[id].seq,panel:a.hud.pending(),buildOpen:!!a.buildOpen};}),enemies:g.enemies.filter(e=>e.alive).map(e=>({id:e.id,kind:e.kind,x:e.x,z:e.z,hp:e.hp})),boss:g.boss?{id:'boss',type:g.boss.bossType,x:g.boss.x,z:g.boss.z,hp:g.boss.hp}:null,projectiles:g.projectiles.pool.filter(b=>b.alive).map(b=>({x:b.x,y:b.y,z:b.z,team:b.team,ownerId:b.ownerRef?.id??null})),assets:IDS.flatMap(id=>g.getActor(id).weaponAssets.entities.map(e=>({actorId:id,id:e.id,kind:e.kind,x:e.x,y:e.y,z:e.z,ttl:e.ttl}))),pickups:g.pickups.list.map(p=>({pickupId:p.pickupId,recipientId:p.recipientId??null,kind:p.kind,id:p.id??null,x:p.x,z:p.z,amount:p.amount})),hazards:g.hazards.items.map(h=>({x:h.x,z:h.z,radius:h.radius,delay:h.delay})),pendingLoot:g.pendingLoot.length,rewardQueue:g._partyRewardQueue.length,pendingCombat:g.room.pendingCombat||0,cleared:!!g.room.cleared};}
  catalog(){return coopCatalog(this); }
  progress(){this._live();return coopProgress(this); }
  transportFrame(knownStatic=null){return coopTransportFrame(this,knownStatic); }
  drainEvents(){this._live();return this.runtime.drainEvents().map(e=>({...e,audience:e.data?.actorId?'actor':'world',...(e.data?.actorId?{actorId:e.data.actorId}:{}),sequence:++this.eventSequence,tick:this.scheduler.tick}));}
  snapshot(){this._live();const g=this.game,s=this.store,m=this.modules.meta;if(s.busy||s.blocked||s.publicationPending||g._stageBossPending&&!g._partyLifecycle.bossPending||g.ritual)fail('Coop checkpoint blocked by unresolved transaction/lifecycle');
    const c={format:COOP_CHECKPOINT_FORMAT,schemaVersion:COOP_CHECKPOINT_SCHEMA,source:this.source,sessionId:this.sessionId,runId:g.runId,generation:this.generation,revision:s.revision,options:copy(this.options),party:this.modules.party.capturePartyDraft(g,{sessionId:this.sessionId,runId:g.runId,revision:s.revision,receipts:s.receipts,actorMeta:s.actorMeta,choiceContexts:s.choiceContexts}),runtime:{paused:this.paused,eventSequence:this.eventSequence,enemySequence:this.modules.enemies.captureEnemySequence(),pickupSequence:g.pickups._phaseSequence,pool:projectilePool(g),checkpointPending:!!g._partyCheckpointPending,completionDeferred:g._completionDeferred??null,floorCompletionDeferred:!!g._floor1CompletionDeferred,commandQueue:copy(this.commandQueue)},actors:Object.fromEntries(IDS.map(id=>[id,actorRuntime(g.getActor(id))])),ack:copy(this.ack),scheduler:this.scheduler.checkpoint(),store:{requestSerial:s.requestSerial,sourceSerial:s.sourceSerial,publishedRevision:s.publishedRevision,publicationPending:s.publicationPending,maxReceipts:s.maxReceipts},meta:{data:copy(m.data),dirty:m._dirty,clearActive:!!m._clearActive,time:m._t},rpcReceipts:copy(this.rpcReceipts)};
    return validateCheckpoint(c,{modules:this.modules,...this},true);
  }
  async save(){this._live();try{const c=this.snapshot();const journal=await this.storage.getItem(this.store.key);if(journal===null&&c.revision>0){const baseline=this.modules.party.encodePartyDraft(c.party);await this.storage.setItem(this.store.key,baseline);if(await this.storage.getItem(this.store.key)!==baseline)throw Error('Coop baseline journal readback uncertain');this.store.confirmCheckpointRecord(c.party,baseline);}else if(journal!==null&&this.store.readConfirmedRevision(journal)!==c.revision)throw Error('Coop journal/checkpoint revision conflict');c.runtime.checkpointPending=false;const {raw,bytes}=checkpointEncoding(c),key=coopCheckpointKey(this.sessionId,this.game.runId);await this.storage.setItem(key,raw);if(await this.storage.getItem(key)!==raw)throw Error('Coop checkpoint readback uncertain');this.saveBlocked=false;this.saveError='';this.game._partyCheckpointPending=false;this.game.partyTickStatus={...(this.game.partyTickStatus||{}),persistence:this.storage.kind||'memory'};return {ok:true,runId:c.runId,revision:c.revision,tick:c.scheduler.tick,bytes,persistence:this.storage.kind||'memory'};}catch(e){this.saveBlocked=true;this.saveError=e.message;throw e;}}
  async recover(){return this._exclusive(async()=>{if(this.store.blocked){const r=await this.store.recoverCommitted();if(!r.ok)return r;}this.scheduleResults();const saved=await this.save();this.game._partyCheckpointPending=false;return saved;});}
  _applyRuntime(c){const g=this.game;this.paused=c.runtime.paused;this.commandQueue=copy(c.runtime.commandQueue);this.ack=copy(c.ack);this.rpcReceipts=copy(c.rpcReceipts);this.eventSequence=c.runtime.eventSequence;this.modules.enemies.restoreEnemySequence(c.runtime.enemySequence);g.pickups._phaseSequence=c.runtime.pickupSequence;g._partyCheckpointPending=c.runtime.checkpointPending;g._completionDeferred=c.runtime.completionDeferred;g._floor1CompletionDeferred=c.runtime.floorCompletionDeferred;g._stageBossPending=!!g._partyLifecycle.bossPending;
    for(const id of IDS){const a=g.getActor(id),r=c.actors[id],p=r.panel;if(p.binding==='revival')this.showRevival(id);else if(p.binding==='supply')this.modules.ui.PARTY_UI_METHODS.openPendingRouteSupply(a.view);else this.modules.ui.showPartyChoice(a.view,c.party.actors[id]);if(p.type==='none'){a.hud.closeChoice();a.hud.closeHubPanel();}const current=p.type==='choice'?a.hud._choice:p.type==='hub'?a.hud._hub:null;if(p.type!=='none'&&!current)fail('Coop typed panel failed to reconstruct');if(current){const count=(current.cfg.options||current.cfg.rows).length;if(p.index>=count)fail('Coop panel index mismatch');Object.assign(current,{idx:p.index,id:p.id,revision:p.revision});}a.buildOpen=p.buildOpen;a.hud.buildOpen=p.buildOpen;a._modalStack=copy(p.modalStack);Object.assign(a.hud,{_panelSequence:p.sequence,_hubNavDir:p.navigation.direction,_hubNavHeld:p.navigation.held,_hubNavNext:p.navigation.next,screen:p.screen,stats:copy(p.stats),verdict:copy(p.verdict)});Object.assign(a.weaponAssets,copy(r.control));if(r.control.cancelEpoch===null)delete a.weaponAssets.cancelEpoch;applyInput(a.input,r.input);applyMuzzlePose(a.player,r.muzzle);}
    applyProjectilePool(g,c.runtime.pool);this.scheduler.restore(c.scheduler);g._lifecycleTimers=new Set(this.scheduler.tasks.keys());const m=this.modules.meta;m.data=copy(c.meta.data);m._dirty=c.meta.dirty;m._clearActive=c.meta.clearActive;m._t=c.meta.time;this.runtime.drainEvents();
  }
  async restore(input){return this._exclusive(async()=>{const c=validateCoopCheckpoint(input,{modules:this.modules,...this,runId:this.game.runId});await this._recoverJournal(c,false);const original=captureRealmState(this.modules),old=this.runtime;let candidate,state;
    // All candidate construction/hydration is synchronous. Await only after
    // restoring singleton descriptors, so old world remains authoritative.
    try{restoreProperties(this.modules.save.saveStore,Object.getOwnPropertyDescriptors(new this.modules.save.SaveStore()));const scheduler=new TickScheduler(),runtime=createHeadlessRestoreCandidate(old,scheduler);candidate=new CoopGameSession(runtime,scheduler,this.modules,{sessionId:this.sessionId,generation:this.generation,source:this.source,options:copy(this.options),storage:this.storage});withPresentationPlatform(runtime.platform,()=>{hydrateWorld(candidate.game,c,this.modules);state=captureRealmState(this.modules);});}catch(e){try{candidate?.dispose();}finally{restoreRealmState(this.modules,original);}throw e;}restoreRealmState(this.modules,original);
    try{await candidate._attach(c);const current=captureRealmState(this.modules);try{restoreRealmState(this.modules,state);withPresentationPlatform(candidate.runtime.platform,()=>{candidate._applyRuntime(c);candidate.snapshot();state=captureRealmState(this.modules);});}finally{restoreRealmState(this.modules,current);}}catch(e){try{candidate.dispose();}finally{restoreRealmState(this.modules,original);}throw e;}
    let cleanupError;try{old.dispose();}catch(e){cleanupError=e;}finally{restoreRealmState(this.modules,state);publishRestorePlatform(candidate.runtime.platform);}for(const k of ['runtime','game','scheduler','store','paused','ack','rpcReceipts','eventSequence','saveBlocked','saveError','commandQueue','commandWaiters'])this[k]=candidate[k];this.game._partyCheckpointOwner=this;this.scheduler.executors.get('party-result').execute=t=>this.showResult(t);if(cleanupError)this.runtime.platform.emit('restore-cleanup-error',{message:cleanupError.message});return this.state();
  });}
  dispose(){if(this.disposed)return;this.runtime.dispose();this.disposed=true;}
}
