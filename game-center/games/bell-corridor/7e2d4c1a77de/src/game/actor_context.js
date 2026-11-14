import {PARTY_UI_METHODS} from './party_ui.js';
// Explicit actor context boundary. This module never imports Game and never
// forwards unknown members. Every route below is an explicit, reviewable API.
const bindings = new WeakMap();
const roots = new WeakMap();
const viewActors = new WeakMap();
const registered = new WeakSet();
const words = text => Object.freeze(text.trim().split(/\s+/));
export const ACTOR_FIELDS = words(`
  player hero heroPainted input hud experiment experimentScheme combatMode
  consumables consumablePurchases companion weaponAssets buildSupply spellDefs _listeners _knownSyn
  _seenTip tel buildOpen _pendingChoice _aimDir revival revivalPending _c2PlayerDt
  autoReloading foldVisuals _chargeFx _chargeWp _modalStack _tipT _tipTouched playerMoveTimeScale
  playerActionTimeScale _partyFloorRewards
`);
export const TRACKING_FIELDS = words(`
  _weaponSeen _shopBought _noHitRoom _noHitBoss _floorFullyCleared _rareEvent _blastKills _dmgAtRoomStart
  _pdChain _ventHits _deadeyeKills _dismantled _bounceDouble _oathPower _bossWithSidearm _fullAttachBoss
  _attSeen _spellForms
`);
export const WORLD_READ_FIELDS = words(`
  presentation strictActorHooks copyReview experimentPreview experimentHUD shakeAmt hurt flash vt dustTimer _origin
  _damageFeedbackIds _damageFeedbackSequence _damageRootSequence _damageFeedbackEpoch
  _autosaveT _completionDeferred _doorsLocked _floor1CompletionDeferred _importing _lifecycleTimers _residentRooms
  _restoring _restoringRoom _runtimeRestoring _stageBossPending _storageRecovery _textReviewFrozen _warming
  activeModifier attract boss bossPractice bossType camera canvas clock
  comparison connectors damageFeedbackTimeMs debris decals dungeon enemies enemyTimeScale
  flashLights floor flowVersion grng hazards hitboxes hubScene mmBig
  mod_ mode particles paused pendingLoot pendingSpawns pickups platform
  portals practice previewRoom projectiles renderer ritual rng room
  roomLights roomScene roomStates run runId runPolicy scene seed
  shopTx stage stageRun state theme time timeScale touch weaponSerialAllocator
  trainingShooterEnabled transition weaponAssetFX weaponLab actorCount
`);
// Shared writes performed by reviewed actor consumers only: invalid-asset
// feedback time, skill aberration, single-actor time preparation, summons, and
// the runtime's prism-channel refresh. Damage/ID services mutate root directly.
export const WORLD_WRITE_FIELDS = words(`
  _assetInvalidAt aberr hitStopT _turrets _drones enemyBulletTimeScale
  hazardTimeScale
`);
export const ACTOR_METHODS = words(`
  interact interactables groundInteractables buyService routeView
  updateActorPrelude updateActorMotion updateActorRuntime updateActorTail onActorRoomCleared
  setBuild closeTopPanel panelOpen setModalOwner topModal restoreFloorChoice handlePanelKeys useConsumable
  purchaseConsumable notifyConsumableAttack getActiveSelectionView selectActive cycleActive onDamage weaponAssetExplosionFeedback weaponAssetFeedback
  onBulletEnd onRicochet onPropHit explode chargeFx clearChargeFx tip updateTips
  spellFor rollChoice openFloorChoice dropWeaponPickup onPlayerDeath openRevivalPanel acceptRevival declineRevival
  nearestInteractable interactHint solveAim toast popText newSynergies statusEffects useActiveSkill
  updateTesla spawnTurret syncBuildDrones spawnCompanion applyHero applySupply heroSkill emit
  on nearestGroundWeapon dismantleNearest scavengeAssemble heatVent bellWave resetAchievementTracking telReset
  telNow telFirst telDamage telHeal telCoins telAmmo telService telTick
  telemetrySummary runCtx checkAchievements metaSee
`);
export const WORLD_METHODS = words(`
  pointBlocked moveBlocked propHit clampToRoom resolveCircle addHazard hitTest findNearest
  damageFeedbackObjectId createDamageRootId nativeUnitDamageFeedback recordDamageFeedback advanceDamageFeedback flushDamageFeedback clearDamageFeedback weaponAssetOpenPortals
  spawnCoins explodeVisual spawnAfterimage shake damageFlash flashSmall spinFx coinMul spawnDeathBurst
  hitStop roomPitch originCell floorPitch roomOffset walkRects activeScenes gr
  grr gri grc grPick vr vrr aliveEnemyCount hiddenRoomRevealed
  difficultyDef roomLabel stageBanner scavengeWeaponLabel supplyLabel equipmentInfo
  reportActorHookError storageFrozen setPaused computeTimeScales resetTimeScales weaponMetrics reserveWeaponReferences claimWeaponInstance validateWeaponRuntimeRestore refreshGroundSlow refreshWeaponTimeChannels notifyEnemyAttack interceptNativeProjectile
`);
export const SINGLE_ACTOR_BRIDGES = words(`
  restoreSessionState finalizeDeath
  syncSaveUI saveProgress openStorageRecovery recoverStorage saveAndQuit abandonRun
  continueRun exportSave installBuildAttachment tryInstallAttachment tryDetachAttachment dropAttachmentPickup grantAttachmentReward claimFloorAttachment
  tryDropSpareAttachment dropBuildWeapon collectEquipmentPickup offerRelicPickup offerAttachmentReplacement commitSupplyPickup setRoute
  openSupplyPanel claimSupplyOffer reopenPendingSupplyPanel openPendingRouteSupply toggleMinimapBig onResize rollWeaponId rollItemId
  rollActiveId toTitle startNewRun startStageRun stageRunPanel spawnAttachment rollAttachmentFrom
  snapshotRun openChest previewAltar nextShopRequestId _shopFail shopViewData purchaseShopOffer
  shopItemLabel _askReplaceWeapon buy useAltar routeCompletionGate useStageStairs advanceToStage finishChapterPrototype
  finishCampaign useStairs beginLayoutEdit endLayoutEdit applyDisplayPreferences screenToGround diagnosticSnapshot
  enterHub hubTier refreshHubProgress trainingPanel configureTraining trainingAvailable saveHubSelection pendingHubSelection
  noticePendingHubSelection challengePanel difficultyPanel requestExpedition useHub codexPanel heroPanel archiveResources
`);

export class ActorState {
  constructor(world, {playerId = 'player', slot = 0} = {}) {
    if (!((playerId==='player'&&slot===0)||(playerId==='player2'&&slot===1))) throw Error('Unsupported actor identity');
    Object.defineProperties(this, {playerId:{value:playerId,enumerable:true},slot:{value:slot,enumerable:true}});
    this.active = true;
    this.callbackEpoch = 0;
    this.tracking = {};
    for (const key of ACTOR_FIELDS) this[key] = undefined;
    this._listeners = [];
    this.buildOpen = this.autoReloading = false;
    this.playerMoveTimeScale = this.playerActionTimeScale = 1;
    this._modalStack = [];
    roots.set(this, world);
    Object.defineProperty(this, 'view', {value:new ActorWorldView(this),enumerable:true});
    Object.seal(this);
  }
}
function live(view) {
  const actor = viewActors.get(view), world = actor && roots.get(actor);
  if (!actor?.active || !registered.has(actor) || !bindings.has(world) || world.actors.get(actor.playerId) !== actor)
    throw Error('Inactive or unsupported actor context');
  return {actor, world};
}
export function actorWorldContext(context) {
  const actor=viewActors.get(context);return actor?{actor,world:live(context).world}:{actor:null,world:context};
}
export class ActorWorldView {
  constructor(actor) { viewActors.set(this, actor); Object.preventExtensions(this); }
  actorView() { live(this); return this; }
  get playerId() { return live(this).actor.playerId; }
  get slot() { return live(this).actor.slot; }
  get sessionStore() { return live(this).world.partySessionStore; }
  partyCommand(request) { const {actor,world}=live(this);return world.partyCommand(actor.playerId,request); }
}
for (const key of [...ACTOR_FIELDS, ...TRACKING_FIELDS]) {
  const tracking = TRACKING_FIELDS.includes(key);
  Object.defineProperty(ActorWorldView.prototype, key, {
    get(){const {actor}=live(this);return (tracking?actor.tracking:actor)[key];},
    set(value){const {actor}=live(this);(tracking?actor.tracking:actor)[key]=value;}
  });
}
for (const key of [...WORLD_READ_FIELDS, ...WORLD_WRITE_FIELDS]) {
  Object.defineProperty(ActorWorldView.prototype, key, {
    get(){return live(this).world[key];},
    ...(WORLD_WRITE_FIELDS.includes(key)?{set(value){live(this).world[key]=value;}}:{})
  });
}
// Called once after the real Game class is defined. Actor implementations keep
// their original bodies and execute on a fixed view. Root APIs delegate to the
// primary actor; geometric services retain root receivers. Legacy transactions
// and lifecycle calls are explicitly single-actor-only bridges, not Party APIs.
export function installActorMethods(prototype) {
  for (const name of ACTOR_METHODS) {
    const implementation=prototype[name];
    if(typeof implementation!=='function')throw Error('Missing actor method: '+name);
    Object.defineProperty(ActorWorldView.prototype,name,{value:function(...args){live(this);const {world}=live(this);if(world.presentation?.methods[name])return world.presentation.methods[name](this,...args);if(world.actorCount===2&&world.partySessionStore&&PARTY_UI_METHODS[name])return PARTY_UI_METHODS[name](this,...args);return implementation.apply(this,args);}});
  }
  for (const name of [...WORLD_METHODS, ...SINGLE_ACTOR_BRIDGES]) {
    if(typeof prototype[name]!=='function')throw Error('Missing world service: '+name);
    Object.defineProperty(ActorWorldView.prototype,name,{value:function(...args){const {world}=live(this);if(world.presentation?.methods[name])return world.presentation.methods[name](this,...args);if(world.actorCount===2&&world.partySessionStore&&PARTY_UI_METHODS[name])return PARTY_UI_METHODS[name](this,...args);if(SINGLE_ACTOR_BRIDGES.includes(name))assertSingleActor(world);return world[name](...args);}});
  }
}
export function primaryActor(world, playerId = 'player') {
  const actor=world.actors?.get(playerId);
  if(!actor?.active || !registered.has(actor) || roots.get(actor)!==world || !bindings.has(world))throw Error('Unknown playerId or inactive actor context');
  return actor;
}
export function assertSingleActor(world) {
  const actor=viewActors.get(world);if(actor)world=live(world).world;
  if(world.actors && world.actors.size!==1)throw Error('Unsupported multi-actor single-player API');
}
export function registerActor(world, identity) {
  if(world.actors.size!==1||world.actors.has(identity.playerId))throw Error('Unsupported actor registration');
  const actor=new ActorState(world,identity);registered.add(actor);world.actors.set(actor.playerId,actor);return actor;
}
export function initializeActorContext(world) {
  if(bindings.has(world))throw Error('Actor context already initialized');
  world.actors=new Map();
  // Only real constructed Games gain actor delegation. Historical isolated
  // rule fixtures calling Game.prototype retain their original method bodies.
  for(const name of ACTOR_METHODS)Object.defineProperty(world,name,{value:function(...args){if(['onDamage','explode','emit','weaponAssetExplosionFeedback','metaSee'].includes(name))return Object.getPrototypeOf(this)[name].apply(this,args);return primaryActor(this).view[name](...args);},configurable:true});
  for(const name of SINGLE_ACTOR_BRIDGES){const implementation=world[name];Object.defineProperty(world,name,{value:function(...args){if(this.presentation&&['onResize','applyDisplayPreferences','screenToGround','toggleMinimapBig'].includes(name))return implementation.apply(this,args);if(this.actorCount===2&&this.partySessionStore&&PARTY_UI_METHODS[name])return PARTY_UI_METHODS[name](primaryActor(this).view,...args);assertSingleActor(this);return implementation.apply(this,args);},configurable:true});}
  const actor=new ActorState(world);registered.add(actor);bindings.set(world,actor);world.actors.set(actor.playerId,actor);
  for(const key of [...ACTOR_FIELDS,...TRACKING_FIELDS]) {
    const tracking=TRACKING_FIELDS.includes(key);
    Object.defineProperty(world,key,{enumerable:true,configurable:false,
      get(){const a=bindings.get(this);return (tracking?a.tracking:a)[key];},
      set(value){const a=bindings.get(this);(tracking?a.tracking:a)[key]=value;}
    });
  }
  return actor;
}
export function replacePrimaryActor(world) {
  assertSingleActor(world);
  const previous=primaryActor(world),{input,hud}=previous;
  previous._listeners.length=0;
  previous.active=false;
  // These adapters are transferred, not disposed/recreated: browser HUD owns
  // DOM listeners and Input owns device listeners. Old views can no longer use them.
  previous.input=previous.hud=undefined;
  const actor=new ActorState(world);actor.input=input;actor.hud=hud;actor.experimentScheme=previous.experimentScheme;
  registered.add(actor);bindings.set(world,actor);world.actors.clear();world.actors.set(actor.playerId,actor);
  if(hud)hud.game=actor.view;
  return actor;
}
export function retirePrimaryActor(world) {
  for(const actor of world.actors.values()){actor._listeners.length=0;actor.active=false;}
}
export function invalidateActorCallbacks(world) {
  if(bindings.has(world))for(const actor of world.actors.values())actor.callbackEpoch++;
}

// Legacy single-player transaction methods may capture root in their callback
// bodies. Bind every actual panel callback to its creating actor/generation so
// a retained old cfg cannot operate on a later Player through those bridges.
export function guardActorPanel(view, cfg) {
  const actor=viewActors.get(view);
  if(!actor)return cfg; // Plain isolated HUD fixtures retain the original API.
  const context=live(view);
  if(context.world.presentation)return cfg; // Replica callbacks are typed transport bindings, never original business handlers.
  const epoch=actor.callbackEpoch,guarded={...cfg};
  for(const name of ['onPick','onToggle','onConfirm','onBack']) {
    const callback=cfg[name];
    if(typeof callback!=='function')continue;
    guarded[name]=function(...args){
      const {world}=live(view);if(!(cfg.partyTyped===true&&world.actorCount===2&&world.partySessionStore))assertSingleActor(view);
      if(actor.callbackEpoch!==epoch)throw Error('Inactive actor panel generation');
      return callback.apply(this,args);
    };
  }
  return guarded;
}
