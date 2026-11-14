import {createHeadlessGame,createHeadlessRestoreCandidate} from './headless_game.js';
import {publishRestorePlatform,withPresentationPlatform} from './game_platform.js';
import {TickScheduler,FIXED_DT} from './tick_scheduler.js';
import {runtimeSourceIdentity} from './source_identity.mjs';
import {validateRuntimeActors} from './checkpoint_actor_contract.js';

const FORMAT='bell-corridor-game-session', VERSION=1;
const int=(v,min=0,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
const copy=v=>structuredClone(v);
function fail(message){throw TypeError(message);}
function object(v){return v&&Object.getPrototypeOf(v)===Object.prototype;}
function keys(v,allowed,required=allowed){if(!object(v)||Object.keys(v).some(k=>!allowed.includes(k))||required.some(k=>!Object.hasOwn(v,k)))fail('Invalid fields');}
function text(v){return typeof v==='string'&&v.length>0&&v.length<=160;}
function finite(v,depth=0){
  if(depth>40)fail('Checkpoint too deep');
  if(typeof v==='function'||typeof v==='symbol'||typeof v==='bigint'||typeof v==='number'&&!Number.isFinite(v))fail('Non-finite runtime data');
  if(v&&typeof v==='object'){
    if(!object(v)&&!Array.isArray(v))fail('Runtime data must be plain');
    for(const [k,x]of Object.entries(v)){if(['__proto__','prototype','constructor'].includes(k))fail('Unsafe runtime key');finite(x,depth+1);}
  }
}
function canonical(v){if(Array.isArray(v))return v.map(canonical);if(object(v))return Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])]));return v;}
const fingerprint=v=>JSON.stringify(canonical(v));
const OPTION_KEYS=['seed','heroId','profile','scope','difficulty'];
const INPUT_KEYS=['seq','move','aimPoint','aimDirection','aimDistance','actions','keys'];
const SUPPORTED_KEYS=new Set([...'abcdefghijklmnopqrstuvwxyz0123456789','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Shift','Space','Tab','Enter','Escape']);
const GAME_FIELDS=['state','paused','revivalPending','transition','_completionDeferred','_floor1CompletionDeferred','_autosaveT','_damageFeedbackEpoch','_damageFeedbackSequence','damageFeedbackTimeMs','timeScale','enemyTimeScale','enemyBulletTimeScale','playerMoveTimeScale','playerActionTimeScale','fxTimeScale','uiTimeScale','hazardTimeScale'];
const INPUT_FIELDS=['worldAimPoint','analogMove','keys','pressed','released','mouse','mousePressed','wheel','anyKey','blocked','capturing','cancelEpoch'];

export async function createGameSession(options={}) {
  const {sessionId=globalThis.crypto.randomUUID(),generation=1,checkpoint,...runOptions}=options;
  if(!text(sessionId)||!int(generation,1))fail('Invalid session identity');
  const source=await runtimeSourceIdentity(),scheduler=new TickScheduler();
  let modules,validated;
  const base={seed:3131,heroId:'warden',profile:'standard',scope:'full3',difficulty:'standard',...runOptions};
  keys(base,OPTION_KEYS);
  const runtime=await createHeadlessGame({...base,sessionId,scheduler,prepare:async()=>{
    modules=await loadModules();
    // No Game/Player/RoomScene has been constructed at this point.
    if(checkpoint)validated=validateCheckpoint(checkpoint,{sessionId,generation,source,modules,options:base});
  }});
  const session=new GameSession(runtime,scheduler,modules,{sessionId,generation,source,options:base});
  if(validated)session._apply(validated);
  return session;
}
async function loadModules(){
  const [session,save,{meta},stage,{HERO_MAP},{DIFFICULTY_IDS},{getStageProfile},enemies,{controls},platform]=await Promise.all([
    import('../game/session.js'),import('../game/save.js'),import('../game/meta.js'),import('../game/stage_flow.js'),import('../game/heroes.js'),import('../core/constants.js'),import('../game/stage_profiles.js'),import('../game/enemies.js'),import('../core/control_bindings.js'),import('./game_platform.js')
  ]);return {session,save,meta,stage,HERO_MAP,DIFFICULTY_IDS,getStageProfile,enemies,controls,platform};
}
function validateOptions(o,m){keys(o,OPTION_KEYS);if(!int(o.seed,0,0xffffffff)||!Object.hasOwn(m.HERO_MAP,o.heroId)||!m.DIFFICULTY_IDS.includes(o.difficulty)||!['full3','chapter1','classic'].includes(o.scope))fail('Invalid run options');m.getStageProfile(o.profile);}
function inputData(input,game){
  keys(input,INPUT_KEYS,['seq']);finite(input);
  if(!int(input.seq,1))fail('Invalid input sequence');
  const move=Object.hasOwn(input,'move')?input.move:{x:0,z:0};keys(move,['x','z']);if(![move.x,move.z].every(Number.isFinite))fail('Invalid movement');
  for(const [name,list]of [['actions',input.actions||[]],['keys',input.keys||[]]]){
    if(!Array.isArray(list)||list.length>64||new Set(list).size!==list.length||list.some(x=>typeof x!=='string'||!x||x.length>64||name==='actions'&&!Object.hasOwn(game.input.bindings,x)||name==='keys'&&!SUPPORTED_KEYS.has(x)))fail('Invalid input '+name);
  }
  if(Object.hasOwn(input,'aimPoint')&&!object(input.aimPoint)||Object.hasOwn(input,'aimDirection')&&!object(input.aimDirection))fail('Invalid aim');
  if(input.aimPoint&&input.aimDirection)fail('Ambiguous aim');
  if(input.aimPoint){keys(input.aimPoint,['x','z']);if(![input.aimPoint.x,input.aimPoint.z].every(Number.isFinite)||Math.hypot(input.aimPoint.x-game.player.x,input.aimPoint.z-game.player.z)>100)fail('Invalid aim point');}
  if(input.aimDirection){keys(input.aimDirection,['x','z']);const n=Math.hypot(input.aimDirection.x,input.aimDirection.z);if(!Number.isFinite(n)||n<=0||!Number.isFinite(input.aimDistance)||input.aimDistance<0||input.aimDistance>100)fail('Invalid aim distance');}
  else if(Object.hasOwn(input,'aimDistance'))fail('Aim distance requires direction');
}
function captureInput(i){return {...Object.fromEntries(INPUT_FIELDS.map(k=>[k,copy(i[k]??null)])),physicalActions:[...i._physicalActions],physicalKeys:[...i._physicalKeys],touchDown:[...i.touchActions.down],touchHit:[...i.touchActions.hit]};}
function applyInput(i,s){for(const k of INPUT_FIELDS)i[k]=copy(s[k]);i._physicalActions=new Set(s.physicalActions);i._physicalKeys=new Set(s.physicalKeys);i.touchActions={down:new Set(s.touchDown),hit:new Set(s.touchHit)};}
function muzzlePose(player){
  const root=player.rig.group,nodes=[];
  for(let node=player.gunModel?.userData.muzzle;node;node=node.parent){
    const path=[];let cursor=node;
    while(cursor!==root){if(!cursor.parent)fail('Muzzle outside player rig');path.unshift(cursor.parent.children.indexOf(cursor));cursor=cursor.parent;}
    nodes.push({path,position:node.position.toArray(),rotation:node.rotation.toArray(),scale:node.scale.toArray()});
    if(node===root)break;
  }
  return nodes;
}
function applyMuzzlePose(player,pose){
  validateMuzzleStructure(player,pose);
  // Restore the original Euler representation too: later animation assigns
  // individual Euler axes. A quaternion round-trip can choose another branch.
  for(const t of pose){let node=player.rig.group;for(const index of t.path)node=node.children[index];node.position.fromArray(t.position);node.rotation.fromArray(t.rotation);node.scale.fromArray(t.scale);node.updateMatrix();}
  player.rig.group.updateMatrixWorld(true);
}
function validateMuzzleStructure(player,pose) {
  if(fingerprint(muzzlePose(player).map(x=>x.path))!==fingerprint(pose.map(x=>x.path)))fail('Player rule-model pose structure mismatch');
}
function captureRealmState(modules) {
  return {meta:Object.getOwnPropertyDescriptors(modules.meta),save:Object.getOwnPropertyDescriptors(modules.save.saveStore),storage:Object.getOwnPropertyDescriptor(globalThis,'localStorage'),enemySequence:modules.enemies.captureEnemySequence()};
}
function restoreProperties(object,descriptors) {
  for(const key of Reflect.ownKeys(object))if(!Object.hasOwn(descriptors,key))delete object[key];
  Object.defineProperties(object,descriptors);
}
function restoreRealmState(modules,state) {
  restoreProperties(modules.meta,state.meta);restoreProperties(modules.save.saveStore,state.save);
  Object.defineProperty(globalThis,'localStorage',state.storage);modules.enemies.restoreEnemySequence(state.enemySequence);
}
function projectilePool(g){
  const p=g.projectiles;
  return {head:p.head,beamHead:p.beamHead,slots:p.pool.flatMap((b,index)=>b.alive?[index]:[]),beams:p.beams.map(b=>({life:b.life,maxLife:b.maxLife,position:b.mesh.position.toArray(),rotation:b.mesh.rotation.toArray(),scale:b.mesh.scale.toArray(),color:b.mesh.material.color.getHex(),opacity:b.mesh.material.opacity,visible:b.mesh.visible}))};
}
function applyProjectilePool(g,s){
  const p=g.projectiles,live=p.pool.filter(b=>b.alive),dead=p.pool.filter(b=>!b.alive),slots=new Map(s.slots.map((slot,i)=>[slot,live[i]]));
  if(live.length!==s.slots.length)fail('Projectile pool reconstruction mismatch');
  let next=0;p.pool.splice(0,p.pool.length,...p.pool.map((_,index)=>slots.get(index)||dead[next++]));
  p.head=s.head;p.beamHead=s.beamHead;p.active.length=0;
  for(let i=0;i<p.beams.length;i++){const b=p.beams[i],saved=s.beams[i];b.life=saved.life;b.maxLife=saved.maxLife;b.mesh.position.fromArray(saved.position);b.mesh.rotation.fromArray(saved.rotation);b.mesh.scale.fromArray(saved.scale);b.mesh.material.color.setHex(saved.color);b.mesh.material.opacity=saved.opacity;b.mesh.visible=saved.visible;}
}
function panelState(g){
  if(g.buildOpen)fail('Checkpoint does not support an open equipment panel');
  if(g.hud._hub&&!g.revivalPending)fail('Checkpoint does not support this hub callback');
  const c=g.hud._choice,cfg=c?.cfg||g._pendingChoice;
  if(cfg&&!['attachment','evolution','doctrine'].includes(cfg.kind))fail('Unsupported pending choice');
  return {type:g.revivalPending?'revival':cfg?'floor-choice':'none',open:!!c,index:c?.idx??g.hud._hub?.idx??0,panelId:c?.id??g.hud._hub?.id??null,revision:c?.revision??g.hud._hub?.revision??0,sequence:g.hud._panelSequence,
    navigation:{direction:g.hud._hubNavDir??0,held:g.hud._hubNavHeld??0,next:g.hud._hubNavNext??1}};
}
function validatePanelNavigation(panel) {
  const n=panel.navigation;keys(n,['direction','held','next']);
  if(![-1,0,1].includes(n.direction)||!Number.isFinite(n.held)||n.held<0||!Number.isFinite(n.next)||n.next<1||n.held>n.next+1e-8)fail('Invalid panel navigation clock');
  const repeats=(n.next-1)/.09;
  if(Math.abs(repeats-Math.round(repeats))>1e-6||n.direction===0&&(n.held!==0||n.next!==1)||n.direction!==0&&panel.type!=='revival')fail('Panel navigation/world mismatch');
}
function terminalResult(c) { return c.runtime.game.state==='dead'?'dead':c.options.scope==='chapter1'?'chapter-prototype':'victory'; }
function validateTerminalPresentation(c) {
  const state=c.runtime.game.state,p=c.presentation,tasks=c.scheduler.tasks;
  if(state!=='dead'&&state!=='victory') {
    if(p.screen==='screen-death'||p.screen==='screen-victory'||p.stats!==null)fail('Nonterminal world has terminal presentation');
    return;
  }
  const screen=state==='dead'?'screen-death':'screen-victory',kind=state==='dead'?'show-death':'show-victory';
  if(p.screen===null) {
    if(p.stats!==null||tasks.length!==1||tasks[0].payload.kind!==kind)fail('Unshown terminal result requires its lifecycle task');
  } else {
    if(p.screen!==screen||tasks.length!==0||!object(p.stats))fail('Completed terminal presentation/task mismatch');
    keys(p.stats,['run','id']);
    if(p.stats.id!==(state==='dead'?'death-stats':'victory-stats')||!object(p.stats.run)||p.stats.run.result!==terminalResult(c))fail('Terminal stats/state mismatch');
    for(const [key,value]of Object.entries(c.world.run))if(!['floor','weapons','items','actives','coins','keys'].includes(key)&&fingerprint(p.stats.run[key])!==fingerprint(value))fail('Terminal stats/run mismatch: '+key);
  }
  if(state==='victory'&&p.verdict===null)fail('Victory verdict is missing');
}
function validateMaterializedPresentation(session,c) {
  if(!['dead','victory'].includes(c.runtime.game.state))return;
  const stats=c.presentation.stats?.run||c.scheduler.tasks[0]?.payload.run;
  if(stats&&fingerprint(stats)!==fingerprint(session.game.snapshotRun(terminalResult(c))))fail('Terminal stats do not match the restored original world');
}
function validateCheckpoint(input,ctx){
  const c=copy(input),{modules:m}=ctx;
  keys(c,['format','version','source','sessionId','generation','options','world','meta','runtime','scheduler','input','ack','receipts','presentation']);
  if(c.format!==FORMAT||c.version!==VERSION||c.source!==ctx.source||c.sessionId!==ctx.sessionId||c.generation!==ctx.generation)fail('Checkpoint source/session/generation mismatch');
  validateOptions(c.options,m);if(fingerprint(c.options)!==fingerprint(ctx.options))fail('Checkpoint run options mismatch');
  keys(c.runtime,['game','paused','panel','eventSequence','enemySequence','pickupTime','pickupSequence','muzzlePose','projectilePool','assetControl']);finite(c.runtime);finite(c.meta);finite(c.presentation);finite(c.input);finite(c.ack);finite(c.receipts);
  const r=c.runtime,g=r.game;
  keys(g,GAME_FIELDS);if(!['play','transition','dead','victory'].includes(g.state)||typeof g.paused!=='boolean'||typeof r.paused!=='boolean'||typeof g.revivalPending!=='boolean'||!int(r.eventSequence))fail('Invalid runtime state');
  for(const k of GAME_FIELDS.filter(k=>k.endsWith('Scale')||k==='damageFeedbackTimeMs'))if(!Number.isFinite(g[k])||g[k]<0||g[k]>1e15)fail('Invalid runtime clock');
  if(!Number.isFinite(g._autosaveT)||g._autosaveT<0||g._autosaveT>3.1||!int(g._damageFeedbackEpoch)||g._damageFeedbackSequence!==null&&!int(g._damageFeedbackSequence)||g._completionDeferred!==null&&!['first-floor-completion','chapter-boss-completion'].includes(g._completionDeferred)||typeof g._floor1CompletionDeferred!=='boolean'||!Number.isFinite(r.pickupTime)||r.pickupTime<0||!int(r.pickupSequence))fail('Invalid runtime counters');
  if(!Array.isArray(r.muzzlePose)||r.muzzlePose.length>32)fail('Invalid muzzle pose');
  for(const t of r.muzzlePose){
    keys(t,['path','position','rotation','scale']);
    if(!Array.isArray(t.path)||t.path.length>32||t.path.some(x=>!int(x,0,1000))||!Array.isArray(t.position)||t.position.length!==3||t.position.some(x=>!Number.isFinite(x)||Math.abs(x)>100000)||!Array.isArray(t.scale)||t.scale.length!==3||t.scale.some(x=>!Number.isFinite(x)||Math.abs(x)>100)||!Array.isArray(t.rotation)||t.rotation.length!==4||t.rotation.slice(0,3).some(x=>!Number.isFinite(x)||Math.abs(x)>1e6)||!['XYZ','YZX','ZXY','XZY','YXZ','ZYX'].includes(t.rotation[3]))fail('Invalid muzzle transform');
  }
  const s=m.session.validateSession(c.world,{runtimeState:g.state});c.world=s;
  validateRuntimeActors(s);
  if(s.choice&&m.HERO_MAP[s.hero]?.floorChoice!==s.choice.kind)fail('Pending choice does not belong to this hero');
  const pool=r.projectilePool,current=s.roomStates[s.rooms.find(x=>x.id===s.roomId).uid];
  keys(pool,['head','beamHead','slots','beams']);
  if(!int(pool.head,0,419)||!int(pool.beamHead,0,23)||!Array.isArray(pool.slots)||pool.slots.length!==current.projectiles.length||new Set(pool.slots).size!==pool.slots.length||pool.slots.some((slot,i)=>!int(slot,0,419)||i>0&&slot<=pool.slots[i-1])||!Array.isArray(pool.beams)||pool.beams.length!==24)fail('Invalid projectile pool');
  for(const b of pool.beams){
    keys(b,['life','maxLife','position','rotation','scale','color','opacity','visible']);
    if(!Number.isFinite(b.life)||b.life< -1||b.life>b.maxLife+1e-8||!Number.isFinite(b.maxLife)||b.maxLife<=0||b.maxLife>60||!int(b.color,0,0xffffff)||typeof b.visible!=='boolean'||!Number.isFinite(b.opacity)||b.opacity<0||b.opacity>1)fail('Invalid native beam');
    for(const key of ['position','scale'])if(!Array.isArray(b[key])||b[key].length!==3||b[key].some(x=>!Number.isFinite(x)||Math.abs(x)>100000))fail('Invalid beam transform');
    if(!Array.isArray(b.rotation)||b.rotation.length!==4||b.rotation.slice(0,3).some(x=>!Number.isFinite(x))||!['XYZ','YZX','ZXY','XZY','YXZ','ZYX'].includes(b.rotation[3]))fail('Invalid beam rotation');
  }
  keys(c.presentation,['screen','verdict','stats']);
  if(![null,'screen-pause','screen-death','screen-victory'].includes(c.presentation.screen)||c.presentation.verdict!==null&&!object(c.presentation.verdict)||c.presentation.stats!==null&&!object(c.presentation.stats))fail('Invalid presentation checkpoint');
  if(s.seed!==(c.options.seed||1)||s.hero!==c.options.heroId||s.runPolicy.difficulty!==c.options.difficulty||(s.flowVersion===1)!==(c.options.scope==='classic')||s.flowVersion===2&&(s.stage.profile!==c.options.profile||s.stage.campaignScope!==c.options.scope))fail('World/run identity mismatch');
  if(!text(s.runId)||g.revivalPending!==(s.revival?.status==='pending')||g.state!=='play'&&g.revivalPending)fail('World/runtime state mismatch');
  // Validate private meta through the original envelope, without publishing.
  m.save.validateEnvelope({format:'ember-descent',version:2,schemaVersion:6,meta:c.meta.data,active:null});
  keys(c.meta,['data','dirty','clearActive','time']);if(typeof c.meta.dirty!=='boolean'||typeof c.meta.clearActive!=='boolean'||!Number.isFinite(c.meta.time)||c.meta.time<0)fail('Invalid private meta');
  const ids=new Set(['player','boss']);
  for(const st of Object.values(s.roomStates)){
    const local=new Set(['player',...(st.boss?['boss']:[])]);
    for(const e of st.enemies){if(!/^e[1-9]\d*$/.test(e.id)||ids.has(e.id))fail('Duplicate/invalid enemy identity');ids.add(e.id);local.add(e.id);}
    for(const b of st.projectiles)if(b.ownerId!==null&&!local.has(b.ownerId))fail('Unresolved projectile owner');
  }
  if(!int(r.enemySequence,1)||[...ids].filter(x=>x.startsWith('e')).some(id=>Number(id.slice(1))>=r.enemySequence))fail('Invalid enemy sequence watermark');
  keys(r.assetControl,['active','held','blockHeld','cancelEpoch']);
  if(r.assetControl.active!==null&&!Object.hasOwn(s.roomStates[s.rooms.find(x=>x.id===s.roomId).uid].weaponAssets.states,r.assetControl.active)||typeof r.assetControl.held!=='boolean'||typeof r.assetControl.blockHeld!=='boolean'||r.assetControl.cancelEpoch!==null&&!int(r.assetControl.cancelEpoch))fail('Invalid weapon input control');
  if(r.assetControl.active!==null&&!s.player.weapons.some(w=>w.assetInstanceId===r.assetControl.active))fail('Unowned active weapon');
  const p=r.panel;keys(p,['type','open','index','panelId','revision','sequence','navigation']);validatePanelNavigation(p);
  if(!['none','floor-choice','revival'].includes(p.type)||typeof p.open!=='boolean'||!int(p.index,0,64)||!int(p.revision)||!int(p.sequence)||p.panelId!==null&&(!/^panel:[1-9]\d*$/.test(p.panelId)||Number(p.panelId.slice(6))>p.sequence))fail('Invalid pending panel');
  if((p.type==='floor-choice')!==!!s.choice||(p.type==='revival')!==g.revivalPending||p.type==='none'&&(p.panelId!==null||p.open)||p.type==='floor-choice'&&(p.index>=s.choice.options.length||p.open!==!!p.panelId)||p.type==='revival'&&(p.panelId===null||p.index>1))fail('Pending panel/world mismatch');
  const scheduler=new TickScheduler().register('game-lifecycle',()=>{});scheduler.validate(c.scheduler);
  if(c.scheduler.tasks.length>1)fail('Conflicting lifecycle tasks');
  for(const t of c.scheduler.tasks){
    const q=t.payload;
    keys(q,['kind','runId','state','floor','stageKey','next','nextFloor','run'],['kind','runId','state','floor','stageKey']);
    if(q.runId!==s.runId||q.state!==g.state||q.floor!==s.floor||q.stageKey!==(s.stage?.stageKey||null))fail('Lifecycle/world mismatch');
    if(q.kind==='advance-stage'){
      keys(q,['kind','runId','state','floor','stageKey','next']);
      if(g.state!=='transition'||s.flowVersion!==2||fingerprint(q.next)!==fingerprint(m.stage.nextStage(s.stage,s.seed)))fail('Invalid stage transition task');
    }else if(q.kind==='advance-floor'){
      keys(q,['kind','runId','state','floor','stageKey','nextFloor']);
      if(g.state!=='transition'||s.flowVersion!==1||q.nextFloor!==s.floor+1||q.nextFloor>3)fail('Invalid floor transition task');
    }else if(q.kind==='show-victory'){keys(q,['kind','runId','state','floor','stageKey','run']);if(g.state!=='victory'||!object(q.run))fail('Invalid victory task');}
    else if(q.kind==='show-death'){keys(q,['kind','runId','state','floor','stageKey']);if(g.state!=='dead')fail('Invalid death task');}
    else fail('Unknown lifecycle task');
    if(t.dueTick>c.scheduler.tick+(q.kind==='show-victory'?192:q.kind==='show-death'?90:84))fail('Lifecycle deadline out of range');
  }
  if(g.state==='transition'&&c.scheduler.tasks.length!==1)fail('Transition missing lifecycle task');
  validateTerminalPresentation(c);
  if(g.transition!==null)fail('Unsupported legacy room transition');
  keys(c.input,[...INPUT_FIELDS,'physicalActions','physicalKeys','touchDown','touchHit']);
  for(const k of ['physicalActions','physicalKeys','touchDown','touchHit'])if(!Array.isArray(c.input[k])||c.input[k].length>64||c.input[k].some(x=>typeof x!=='string'||x.length>64)||new Set(c.input[k]).size!==c.input[k].length)fail('Invalid saved input');
  const bindings=m.controls.get(s.experiment?'experimental':'classic');
  for(const k of ['physicalActions','touchDown','touchHit'])if(c.input[k].some(x=>!Object.hasOwn(bindings,x)))fail('Unsupported saved action');
  if(c.input.physicalKeys.some(x=>!SUPPORTED_KEYS.has(x)))fail('Unsupported saved key');
  if(typeof c.input.blocked!=='boolean'||typeof c.input.capturing!=='boolean'||!int(c.input.cancelEpoch)||!Number.isFinite(c.input.wheel)||typeof c.input.anyKey!=='boolean')fail('Invalid saved input flags');
  for(const k of ['keys','pressed','released','mouse','mousePressed'])if(!object(c.input[k])||Object.values(c.input[k]).some(v=>typeof v!=='boolean'&&!(k==='mouse'&&typeof v==='number'))||['keys','pressed','released'].includes(k)&&Object.keys(c.input[k]).some(x=>!SUPPORTED_KEYS.has(x)))fail('Invalid saved input keys');
  for(const k of ['worldAimPoint','analogMove'])if(c.input[k]!==null){keys(c.input[k],['x','z']);if(![c.input[k].x,c.input[k].z].every(Number.isFinite))fail('Invalid saved input vector');}
  keys(c.ack,['seq','fingerprint']);if(!int(c.ack.seq)||c.ack.seq>0&&typeof c.ack.fingerprint!=='string'||c.ack.seq===0&&c.ack.fingerprint!==null)fail('Invalid input ack');
  if(!Array.isArray(c.receipts)||c.receipts.length>4096)fail('Invalid RPC receipts');
  const reqs=new Set();for(const receipt of c.receipts){
    keys(receipt,['requestId','fingerprint','result']);if(!text(receipt.requestId)||typeof receipt.fingerprint!=='string'||reqs.has(receipt.requestId))fail('Invalid RPC receipt');
    const request=JSON.parse(receipt.fingerprint);finite(request);if(!object(request)||request.requestId!==receipt.requestId||fingerprint(request)!==receipt.fingerprint)fail('Invalid receipt request');
    keys(receipt.result,['ok','tick','panel']);if(typeof receipt.result.ok!=='boolean'||!int(receipt.result.tick,0,c.scheduler.tick)||receipt.result.panel!==null&&!object(receipt.result.panel))fail('Invalid receipt result');
    reqs.add(receipt.requestId);
  }
  return c;
}

export class GameSession {
  constructor(runtime,scheduler,modules,identity){
    this.runtime=runtime;this.game=runtime.game;this.scheduler=scheduler;this.modules=modules;Object.assign(this,identity);
    this.paused=false;this.disposed=false;this.ack={seq:0,fingerprint:null};this.receipts=new Map();this.eventSequence=0;
  }
  _live(playerId){if(this.disposed)throw Error('Session disposed');if(this.game.actors?.size!==1)fail('Unsupported multi-actor GameSession');if(playerId!==undefined&&playerId!=='player')fail('Unknown playerId');}
  start(options={}){
    this._live();const next={...this.options,...options};validateOptions(next,this.modules);
    if(!int(this.generation+1))fail('Generation exhausted');
    const m=this.modules.meta;m.data.sel.hero=next.heroId;m.data.difficulty=next.difficulty;if(!m.data.heroes.includes(next.heroId))m.data.heroes.push(next.heroId);
    this.game.startNewRun(next.seed,next.scope==='classic'?{}:{stageScope:next.scope,stageProfile:next.profile});this.options=next;this.generation++;
    this.paused=false;this.ack={seq:0,fingerprint:null};this.receipts.clear();return this.state();
  }
  submitInput(playerId,input){
    this._live();if(playerId!=='player')fail('Unknown playerId');const fp=fingerprint(input);
    if(input?.seq===this.ack.seq){if(fp!==this.ack.fingerprint)fail('Input sequence payload conflict');return {seq:this.ack.seq,tick:this.scheduler.tick,replay:true};}
    if(!int(input?.seq,1)||input.seq<this.ack.seq)fail('Stale input sequence');
    inputData(input,this.game);const {seq,...payload}=input;this.game.input.submit(payload,this.game.player);this.ack={seq,fingerprint:fp};
    return {seq,tick:this.scheduler.tick,replay:false};
  }
  command(playerId,request){
    this._live();if(playerId!=='player')fail('Unknown playerId');if(!object(request)||!text(request.requestId)||!text(request.kind))fail('Invalid command');finite(request);
    const fp=fingerprint(request),old=this.receipts.get(request.requestId);
    if(old){if(old.fingerprint!==fp)fail('Request payload conflict');return copy(old.result);}
    // Never evict a committed request and accidentally execute it twice.
    if(this.receipts.size>=4096)fail('Command receipt capacity reached');
    const g=this.game;if(g.actorCount===2)fail('Party commands require asynchronous Game.partyCommand(playerId, request)');const h=g.hud,p=h.pending(),kind=request.kind;
    const panel=kind!=='choice.reopen'&&(kind.startsWith('choice.')||kind.startsWith('hub.'));
    const fields=['requestId','kind',...(panel?['panelId','revision']:[]),...(['choice.pick','hub.pick'].includes(kind)?['index']:[]),...(['choice.nav','hub.nav'].includes(kind)?['delta']:[])];
    keys(request,fields);
    if(panel&&(!p||p.panelId!==request.panelId||p.revision!==request.revision||!kind.startsWith(p.type+'.')))fail('Stale pending panel');
    if(['choice.pick','hub.pick'].includes(kind)&&!int(request.index,0,(p.options||p.rows).length-1))fail('Invalid panel index');
    if(['choice.nav','hub.nav'].includes(kind)&&![-1,1].includes(request.delta))fail('Invalid panel navigation');
    let ok=true;
    if(kind==='choice.pick')ok=h.choicePick(request.index);
    else if(kind==='choice.confirm')ok=h.choiceConfirm();
    else if(kind==='choice.nav')h.choiceNav(request.delta);
    else if(kind==='choice.back')ok=g.closeTopPanel();
    else if(kind==='hub.pick'){if(p.rows[request.index].disabled)fail('Disabled panel row');h._hub.idx=request.index;ok=h.hubConfirm();h.changed();}
    else if(kind==='hub.confirm')ok=h.hubConfirm();
    else if(kind==='hub.nav')h.hubNav(request.delta);
    else if(kind==='hub.back')h.backHubPanel();
    else if(kind==='choice.reopen'){if(!g._pendingChoice)fail('No deferred floor choice');h.choicePanel(g._pendingChoice);g._pendingChoice=null;g.syncSaveUI();}
    else if(kind==='interact'){if(this.paused||g.state!=='play'||g.panelOpen()||g.revivalPending)fail('Interaction blocked');g.interact();}
    else if(kind==='pause')this.pause();
    else if(kind==='resume')this.resume();
    else fail('Unsupported command');
    const result={ok:ok!==false,tick:this.scheduler.tick,panel:h.pending()};this.receipts.set(request.requestId,{requestId:request.requestId,fingerprint:fp,result:copy(result)});return result;
  }
  pause(){this._live();this.paused=true;if(this.game.state==='play')this.game.setPaused(true);return this.state();}
  resume(){this._live();this.paused=false;if(this.game.state==='play')this.game.setPaused(false);return this.state();}
  step(ticks=1){
    this._live();if(!int(ticks,1,36000))fail('Invalid step count');let advanced=0;
    for(let i=0;i<ticks;i++){
      const g=this.game;if(this.paused||g.paused||g.storageFrozen()||g._stageBossPending)break;
      if(g.state!=='transition')g.stepSim(1,FIXED_DT);
      this.scheduler.advance();g._lifecycleTimers=new Set(this.scheduler.tasks.keys());advanced++;
    }
    return {...this.state(),advanced};
  }
  state(){
    this._live();const g=this.game,p=g.player;
    return {sessionId:this.sessionId,generation:this.generation,tick:this.scheduler.tick,ack:this.ack.seq,state:g.state,paused:this.paused||g.paused,runId:g.runId,stage:g.stage?.stageKey||null,floor:g.floor,roomId:g.room.uid,
      player:{id:'player',x:p.x,z:p.z,hp:p.hp,armor:p.armor,alive:p.alive,weaponIndex:p.weaponIndex},
      enemies:g.enemies.filter(e=>e.alive).map(e=>({id:e.id,kind:e.kind,x:e.x,z:e.z,hp:e.hp})),boss:g.boss?{id:'boss',bossType:g.boss.bossType,x:g.boss.x,z:g.boss.z,hp:g.boss.hp,phase:g.boss.phase}:null,
      projectiles:g.projectiles.pool.filter(b=>b.alive).map(b=>({x:b.x,y:b.y,z:b.z,team:b.team})),
      assets:g.weaponAssets.entities.map(e=>({id:e.id,kind:e.kind,mechanic:e.mechanic||null,x:e.x,y:e.y,z:e.z,ttl:e.ttl})),
      hazards:g.hazards.items.map(h=>({x:h.x,z:h.z,radius:h.radius,delay:h.delay})),pickups:g.pickups.list.map(p=>({kind:p.kind,id:p.id||null,x:p.x,z:p.z})),
      pendingCombat:g.room.pendingCombat||0,cleared:!!g.room.cleared,panel:g.hud.pending(),screen:g.hud.screen};
  }
  drainEvents(){this._live();return this.runtime.drainEvents().map(e=>({...e,sequence:++this.eventSequence,tick:this.scheduler.tick}));}
  snapshot(){
    this._live();const g=this.game,m=this.modules.meta;
    if(g.storageFrozen()||g._stageBossPending||g.ritual)fail('Checkpoint blocked by unresolved transaction');
    const world=this.modules.session.captureSessionDraft(g);
    if(world.choice)world.choice={kind:world.choice.kind,options:world.choice.options.map(o=>({id:o.id})),...(world.choice.multi?{multi:world.choice.multi,picked:copy(world.choice.picked)}:{})};
    const checkpoint={format:FORMAT,version:VERSION,source:this.source,sessionId:this.sessionId,generation:this.generation,options:copy(this.options),world,
      meta:{data:copy(m.data),dirty:m._dirty,clearActive:!!m._clearActive,time:m._t},
      runtime:{game:Object.fromEntries(GAME_FIELDS.map(k=>[k,copy(g[k]??null)])),paused:this.paused,panel:panelState(g),eventSequence:this.eventSequence,enemySequence:this.modules.enemies.captureEnemySequence(),pickupTime:g.pickups.t,pickupSequence:g.pickups._phaseSequence,muzzlePose:muzzlePose(g.player),projectilePool:projectilePool(g),assetControl:{active:g.weaponAssets.active,held:g.weaponAssets.held,blockHeld:g.weaponAssets.blockHeld,cancelEpoch:g.weaponAssets.cancelEpoch??null}},scheduler:this.scheduler.checkpoint(),input:captureInput(g.input),ack:copy(this.ack),receipts:copy([...this.receipts.values()]),
      presentation:{screen:g.hud.screen,verdict:g.hud.verdict??null,stats:g.hud.stats??null}};
    return validateCheckpoint(checkpoint,{sessionId:this.sessionId,generation:this.generation,source:this.source,modules:this.modules,options:this.options});
  }
  restore(checkpoint){
    this._live();const c=validateCheckpoint(checkpoint,{sessionId:this.sessionId,generation:this.generation,source:this.source,modules:this.modules,options:this.options});
    if(c.world.runId!==this.game.runId)fail('Checkpoint belongs to another run');
    const current=this.game.player,saved=c.world.player.weapons[c.world.player.weaponIndex];
    if(current.hero.ruleVersion===c.world.heroRuleVersion&&current.weapon.def.model===this.modules.session.savedWeaponDefinition(saved).model&&fingerprint(current.weapon.attachments)===fingerprint(saved.attachments))validateMuzzleStructure(current,c.runtime.muzzlePose);
    const original=captureRealmState(this.modules),oldRuntime=this.runtime;
    let candidate,candidateState;
    // No await or caller callback crosses this barrier. All candidate effects
    // use private world-local routes; singleton descriptors are restored even
    // when a real constructor/consumer rejects the candidate during application.
    try {
      restoreProperties(this.modules.save.saveStore,Object.getOwnPropertyDescriptors(new this.modules.save.SaveStore()));
      const scheduler=new TickScheduler(),runtime=createHeadlessRestoreCandidate(oldRuntime,scheduler);
      candidate=new GameSession(runtime,scheduler,this.modules,{sessionId:this.sessionId,generation:this.generation,source:this.source,options:copy(this.options)});
      withPresentationPlatform(runtime.platform,()=>{candidate._apply(c);candidate.snapshot();candidateState=captureRealmState(this.modules);});
    } catch(error) {
      try { candidate?.dispose(); } finally { restoreRealmState(this.modules,original); }
      throw error;
    }
    restoreRealmState(this.modules,original);
    let cleanupError;
    try { oldRuntime.dispose(); } catch(error) { cleanupError=error; }
    finally { restoreRealmState(this.modules,candidateState);publishRestorePlatform(candidate.runtime.platform); }
    for(const name of ['runtime','game','scheduler','paused','ack','receipts','eventSequence'])this[name]=candidate[name];
    if(cleanupError)this.runtime.platform.emit('restore-cleanup-error',{message:cleanupError.message});
    return this.state();
  }
  _apply(c){
    const m=this.modules.meta,g=this.game;
    m.data=copy(c.meta.data);m._dirty=false;m._clearActive=false;
    g.restoreSessionState(copy(c.world),{pause:false,runtime:true});
    this.modules.enemies.restoreEnemySequence(c.runtime.enemySequence);
    g.pickups.t=c.runtime.pickupTime;
    g.pickups._phaseSequence=c.runtime.pickupSequence;
    Object.assign(g.weaponAssets,copy(c.runtime.assetControl));
    if(g.weaponAssets.cancelEpoch===null)delete g.weaponAssets.cancelEpoch;
    Object.assign(g,copy(c.runtime.game));this.paused=c.runtime.paused;
    const p=c.runtime.panel;
    if(p.type==='floor-choice'&&!p.open){g._pendingChoice=g.hud._choice.cfg;g.hud.closeChoice();}
    const panel=p.type==='floor-choice'&&p.open?g.hud._choice:p.type==='revival'?g.hud._hub:null;
    if(panel)Object.assign(panel,{idx:p.index,id:p.panelId,revision:p.revision});
    Object.assign(g.hud,{_hubNavDir:p.navigation.direction,_hubNavHeld:p.navigation.held,_hubNavNext:p.navigation.next});
    g.hud._panelSequence=p.sequence;Object.assign(g.hud,copy(c.presentation));
    this.scheduler.restore(c.scheduler);g._lifecycleTimers=new Set(this.scheduler.tasks.keys());
    applyInput(g.input,c.input);this.ack=copy(c.ack);this.receipts=new Map(c.receipts.map(r=>[r.requestId,copy(r)]));this.eventSequence=c.runtime.eventSequence;
    applyMuzzlePose(g.player,c.runtime.muzzlePose);
    applyProjectilePool(g,c.runtime.projectilePool);
    m.data=copy(c.meta.data);m._dirty=c.meta.dirty;m._clearActive=c.meta.clearActive;m._t=c.meta.time;
    // Original rule callbacks use the Worker-private active save for subsequent
    // transactions. This is never the user's browser Storage.
    const saved=this.modules.save.saveStore.write(m.data,g.state==='dead'||g.state==='victory'?null:c.world);
    if(!saved.ok)throw Error('Private checkpoint publication failed');
    validateMaterializedPresentation(this,c);
    this.runtime.drainEvents();
  }
  dispose(){if(this.disposed)return;this.runtime.dispose();this.disposed=true;}
}

// Shared low-level runtime mechanics; party validation remains independent.
export {loadModules,captureInput,applyInput,inputData,muzzlePose,applyMuzzlePose,projectilePool,applyProjectilePool,captureRealmState,restoreRealmState,restoreProperties};
