import {applyFieldAltar} from './altar_effects.js';
import {captureDamageContext, damageSource, resolveDamageActor, emitDamageEvent} from './damage_context.js';
import {PartySessionStore} from './party_session_store.js';
import {WeaponSerialAllocator, orderedActors, runtimes, weaponMetrics, reserveWorldWeaponReferences, refreshGroundSlow} from './world_weapon_services.js';
import {initializeActorContext, registerActor, assertSingleActor, primaryActor, replacePrimaryActor, retirePrimaryActor, invalidateActorCallbacks, installActorMethods} from './actor_context.js';
import {createChapterWaveState,tickChapterWaves,chapterWavesPending,findChapterSpawnPoints} from './chapter_waves.js';
import {dropChapterBossLoot} from './chapter_rewards.js';
import {FOLD_SHADOW} from '../experimental/combat/fold_hero.js';
import {activateOverdrive,wardPulseKnockback} from './active_promises.js';
import {PAGE_COMPARISON,comparisonMeta,comparisonSeed,createComparisonFixture} from '../experimental/comparison/config.js';
import * as Consumables from '../experimental/consumables/index.js';
import {restoreConsumableHost} from '../experimental/consumables/host_state.js';
import {useConsumable,purchaseConsumable,collectConsumable,tickConsumables,notifyConsumableAttack,resetConsumableFloor,seedConsumableSamples} from '../experimental/consumables/runtime.js';
import {updateConsumablesPage} from '../experimental/consumables/page.js';
import {suppressesNewPlayerLocks,selectPlayerTarget,combatPlayers} from '../experimental/consumables/visibility.js';
import {clearFoldRoom,foldOnPaidShot,tickFold} from '../experimental/combat/fold_shadow.js';
import {FoldVisuals} from '../experimental/combat/fold_visuals.js';
import {updateCombatHUD} from '../experimental/combat/page.js';
import {preferences,resolveZoom,resolvePinCenter} from './preferences.js';
import {resolveCameraFov} from '../ui/touch_controls.js';
import {PAGE_COMBAT_MODE} from '../experimental/combat/mode.js';
import {newCombatState, validateCombatState, creditUltimate,tryCombatAction} from '../experimental/combat/controller.js';
import { controlLabel,actionHit } from '../core/control_actions.js';
import { resetHeroTransient } from './hero_integration_v3.js';
import {ammoTargets} from './shared_mana.js';
import { openDoctrines } from './doctrine_choice_v3.js';
import { isVeteran, veteranTarget, petRoomEnter } from './hero_growth_v3.js';
import { chestRules } from './chest_rules.js';
import { commitChestOpen } from './chest_transaction.js';
import { captureBuildKillContext } from './build_hit_effects.js';
import { captureC2Lethal, enqueueC2Echo } from './hero_rules_v3.js';
import { roomDiagnostics, roomPurpose, beginRoomDiagnostic, recordRoomDiagnostic, updateRoomDiagnosticOverlay } from './room_diagnostics.js';
// ============================================================
//  Game —— 世界容器 / 房间流转 / 战斗协调 / 流程状态机
// ============================================================
import * as THREE from '../../vendor/three.module.js';
import { glyphSvg, glyphKeyForItem, glyphKeyForActive, glyphKeyForWeapon } from '../ui/glyphs.js';
import { CELL, TILE, TEAM, FLOOR_THEME, RENDER, PLAYER, FLOOR_ORDER, DOOR_W } from '../core/constants.js';
import { RNG, randomSeed, seedToWords } from '../core/rng.js';
import { audio } from '../core/audio.js';
import { getTiledMaterial } from '../art/materials.js';
import { generateDungeon, DIRS, DIR_MAP } from '../gen/dungeon.js';
import { PostFX } from '../fx/postfx.js';
import { Particles, Debris, Decals } from '../fx/particles.js';
import { FlashLights, FollowLights, FixedLightPool } from '../fx/lights.js';
import { RoomScene } from './room.js';
import { Player } from './player.js';
import { Enemy } from './enemies.js';
import { ConnectorScene } from './connector.js';
import { buildPortals } from './portal.js';
import { HubScene, TRAINING, PENDULUM } from './hub.js';
import { openPreparation, openPreparationChoice } from './hub_preparation.js';
import { meta } from './meta.js';
import { HEROES, heroById, SIDEARMS, MODIFIERS, modifierById, PAINTS, PAINT_MAP, heroWithPaint, SUPPLIES, SUPPLY_MAP } from './heroes.js';
import { emberHitContext } from './hero_p2.js';
import { heroWaveDamage, heroWaveTargets } from './hero_rules.js';
import { ACHIEVEMENTS, ACH_REWARDS, ACH_MAP } from './achievements.js';
import { ATTACHMENTS, ATTACH_MAP, SLOT_CN } from './attachments.js';
import { DOCTRINES, DOCTRINE_MAP } from './doctrines.js';
import { Companion, EVOLUTIONS, EVO_MAP } from './companion.js';
import { spellFromWeapon, runeName } from './spells.js';
import { CODEX_KINDS, CODEX_MAP, codexTotal } from './codex.js';
import { clampToRects, pushOutOfBoxes, resolveEnemyMovement } from './collide.js';
import { Boss } from './boss.js';
import { BOSS_DEFS, BOSS_MAP, BOSS_IDS, bossDef, bossTypeFor, chapterBossTypeFor, createBoss, resumeBossType, DEFAULT_BOSS_TYPE } from './bosses.js';
import { emptyTelemetry, normalizeTelemetry, bump, summarize } from './telemetry.js';
import {observeResource,resourceReport} from './resource_observation.js';
import { DIFFICULTY, DIFFICULTY_IDS, DEFAULT_DIFFICULTY } from '../core/constants.js';
import { SHOP_SERVICES, SERVICE_MAP, servicePrice, serviceLeft, markServiceUsed, rerollStock, ammoServiceCheck, healServiceCheck } from './economy.js';
import { Projectiles } from './projectiles.js';
import { PickupManager, HazardZones } from './objects.js';
import { relicRisk } from './relic_risks.js';
import { offerRelicPickup } from './relic_pickup.js';
import { pickupReady, pickupPathClear } from './pickup_path.js';
import { HUD } from './hud.js';
import { WEAPONS, ITEMS, ACTIVES, WEAPON_MAP, ITEM_MAP, ACTIVE_MAP, POOL_BY_FLOOR } from './data.js';
import {pregeneratedWeaponDefinition} from './weapon_compatibility.js';
import { buildGunModel } from '../art/guns.js';
import { saveStore, encode, decode, validateEnvelope } from './save.js';
import { captureSession, captureSessionDraft, validateSession, captureRoom, captureRoomWorld, applyRoom, applyPlayer, clearRoomDynamics, restoreCompanion, applyTracking, applyRoomFlags, restoreDungeon, savedWeaponDefinition } from './session.js';
import { trainingPanel, configureTraining, trainingAvailable } from './training.js';
import { WorldBars } from '../ui/worldbars.js';
import { WeaponAssetsRuntime } from './weapon_assets_runtime.js';
import { pickWeaponByFamily } from './weapon_assets_pool.js';
import { WeaponAssetFX } from '../fx/weapon_assets_fx.js';
import { DamageFeedbackCollector } from './damage_feedback.js';
import { selectActiveId, cycleActiveId, activeSelectionView } from './active_selection.js';
import { BUILD_ROUTES } from './build_content_data.js';
import { newRunSupply, planChestSupply, planCompletionSupply, planFirstShopInventory, commitSupplyClaim, acquireRouteReward, applySimpleReward, missingRouteDependencies, supplyCatalog, catalogAllocation } from './build_supply_bridge.js';
import { runPolicyFor, newRevivalState, lethalTransition, acceptRevival, declineRevival, markSettled, revivalHpAfter, REVIVAL } from './revival.js';
import { publishAcquisition, publishDrops, acquisitionProjection } from './acquisition_projection.js';
import { planEquipmentDrops, weaponDropEntries, spawnPlannedEquipment } from './equipment_drops.js';
import { commitEquipmentOperation, collectEquipmentPickup } from './equipment_transaction.js';
import { newShopJournal, shopIdFor, shopRevision, getShopView, planPurchase, applyPlanToDraft, makeReceipt, hasReceipt, fingerprintOf, SHOP_JOURNAL_MAX } from './shop_transaction.js';
import { generateStageDungeon } from '../gen/stage_dungeon.js';
import { newStageContext, nextStage, getStageDefinition, isCampaignFinal, isChapterFinal, FLOW_VERSION, STAGE_CONTENT_VERSION } from './stage_flow.js';
import { getStageProfile } from './stage_profiles.js';
import { runProgressLabel } from './progress_label.js';
import { victoryVerdict } from './victory_copy.js';
import { formatSavedAt } from '../core/format.js';
import { gamePlatform, ownsGamePlatform, markGameRuntimeImported } from '../runtime/game_platform.js';

markGameRuntimeImported();

// 精英血条投影用的复用向量（避免每帧 new）
const _barV = new THREE.Vector3();

// 本局稳定身份（Task5 供给/交易）。**不能重用 seed**：同 seed 两局必须各有
// 自己的身份，否则"待领奖励只领一次"的账本会在两局之间串味。
// 刻意不使用 Math.random（gameplay 文件禁用），也不需要它 —— 运行期不需要可复现。
let _runSeq = 0;
// 章节 Boss 映射（Task7）：第一章/第二章 Boss 只结束本章，不结算全局胜利。
const CHAPTER_BOSS = { 1: 'bell_beast', 2: 'silent_hierophant', 3: 'ember_warden' };
export function newRunId() {  const c = (typeof globalThis !== 'undefined' && globalThis.crypto) ? globalThis.crypto : null;
  if (c && typeof c.randomUUID === 'function') return `run-${c.randomUUID()}`;
  const t = (typeof Date !== 'undefined' ? Date.now() : 0).toString(36);
  return `run-${t}-${(_runSeq++).toString(36)}`;
}

export class Game {
  constructor(canvas, {platform = gamePlatform(), presentation = null} = {}) {
    if (!ownsGamePlatform(platform)) throw Error('Configure the realm platform before importing Game');
    this.platform = platform;
    this.presentation = presentation;
    initializeActorContext(this);
    this.weaponSerialAllocator=new WeaponSerialAllocator();
    this.lifecycleScheduler = platform.scheduler || null;
    this.lifecycleScheduler?.register('game-lifecycle', task => this.executeLifecycle(task));
    this.canvas = canvas;
    this.state = 'loading';
    this.paused = false;
    this.buildOpen = false;
    // 流程版本（Task7/8）：1 = 旧三层，2 = 章节五段。旧档缺字段一律按 1。
    this.flowVersion = 1;
    this.stage = null;
    this.stageRun = null;
    this.mmBig = false;
    this.time = 0;
    // game.time also advances during pause/RAF; damage popups use this clock.
    this.damageFeedbackTimeMs = 0;
    this.timeScale = 1;
    this.enemyTimeScale = 1;
    this.hitStopT = 0;
    this.shakeAmt = 0;
    this.hurt = 0;
    this.flash = 0;
    this.aberr = 0;
    this.floor = 1;
    this.theme = FLOOR_THEME[1];
    this.seed = randomSeed();
    this.run = this.freshRun();
    this.grng = new RNG(0x5eed1234);
    this.pendingSpawns = [];
    // V3.0：'run' = 地牢远征，'hub' = 钟炉前厅（安全区）
    this.mode = 'run';
    // 成就追踪状态（每一项都必须真的有人写入，否则成就要么永远拿不到、
    // 要么因为 undefined 恒为假/恒为真而"白送"——两种都是"只写数据不实现玩法"）
    this.resetAchievementTracking();
    this.hubScene = null;
    this.hero = heroById(meta.sel.hero);
    this.companion = null;      // 驯炉人的钟炉异兽（§24）
    this._dummyT = 0;
    this.connectors = {};
    this.portals = [];
    this._prewarmed = new Set();
    this._prewarmQueue = [];
    // 本地运行遥测（PASS2 §38）：只用于调平衡，不联网，随活跃 Run 保存
    this.tel = emptyTelemetry();
    // 目的地房间的"可见预览"场景（走廊出现时保留，而不是建完即拆）
    this.previewScene = null;
    this.previewRoom = null;
    this.roomStates = new Map();
    this._residentRooms = new Map();
    this._residentConnectors = new Map();
    this.pendingLoot = [];
    this._autosaveT = 0;
    this.initThree();
    this.initSystems();
    this.hud = presentation ? presentation.createRemoteHUD(this.actorView()) : platform.kind === 'headless' ? platform.createHUD(this.actorView()) : new HUD(this.actorView());
    // 精英血条：**屏幕平面**绘制（不走 3D，避免透视把血条压成梯形）
    this.worldBars = platform.kind === 'headless' ? null : new WorldBars('worldbars');
    if (platform.kind !== 'headless' && !presentation) this.bindUI();
    this.clock = new THREE.Clock();
    this.loop = this.loop.bind(this);
    if (platform.kind !== 'headless' && !presentation) {
      window.addEventListener('pagehide', () => this.saveProgress(false));
      document.addEventListener('visibilitychange', () => { if (document.hidden) this.saveProgress(false); });
    }
    if (!presentation) this.syncSaveUI();
  }

  // Internal actor/runtime foundation; GameSession still admits only one input owner.
  getActor(playerId) { if (playerId === undefined) throw Error('Unknown playerId'); return primaryActor(this, playerId); }
  actorView() { return primaryActor(this).view; }
  disposeActor() { retirePrimaryActor(this); }

  resolveRunActorConfig(opts) {
    if(opts.actorConfig&&!this._restoring)return Object.freeze({...opts.actorConfig});
    const restoring = this._restoring;
    return Object.freeze({
      heroId: restoring ? opts.restoreHero : PAGE_COMBAT_MODE === 'experimental' ? 'warden' : meta.sel.hero,
      heroRuleVersion: restoring ? opts.restoreHeroRuleVersion ?? 1 : undefined,
      paint: meta.sel.paint || 'orig',
      sidearm: !restoring && meta.sel.sidearm && meta.hasSidearm(meta.sel.sidearm) ? meta.sel.sidearm : null,
      supply: restoring ? 'none' : meta.sel.supply || 'none', route: meta.sel.route,
      scheme: PAGE_COMBAT_MODE === 'experimental' ? restoring ? opts.restoreExperiment?.scheme || 'fixed' : this.experimentScheme || 'fixed' : null,
      ...(opts.restoreActorRecord?{restoreActorRecord:opts.restoreActorRecord}:{}),
    });
  }

  initializeRunActor(config, actor = primaryActor(this)) {
    const view=actor.view;
    view.experimentScheme=config.scheme;
    view.combatMode=PAGE_COMBAT_MODE==='experimental'?'pass-d':'classic';
    view.experiment=PAGE_COMBAT_MODE==='experimental'?newCombatState(config.scheme):config.heroId==='foldshadow'?newCombatState('foldshadow'):null;
    view.consumables=view.experiment?Consumables.createState():null;view.consumablePurchases=[];
    view.hero=view.experiment?.scheme==='foldshadow'?FOLD_SHADOW:heroById(config.heroId,config.heroRuleVersion);
    if(view.player?.rig)this.scene.remove(view.player.rig.group);
    view.player=new Player(view);view.player.r=view.player.radius;view.player.id=actor.playerId;view.player.team=TEAM.PLAYER;
    view.applyHero(view.player,config.paint);
    if(config.restoreActorRecord){applyPlayer(view,config.restoreActorRecord.player);view.companion?.dispose();view.companion=null;restoreCompanion(view,config.restoreActorRecord.companion);return actor;}
    view.player.giveWeapon(view.hero.sidearm||'pistol_rusty');
    if(config.sidearm&&config.sidearm!==view.hero.sidearm)view.player.giveWeapon(config.sidearm);
    view.companion?.dispose();view.companion=view.hero.companion?new Companion(view):null;
    view.applySupply(config.supply);view.player.recompute();
    return actor;
  }

  // Explicit personal configuration and independent real adapters. No world
  // construction, selection mutation, persistence, or second Game.update.
  createRuntimeActor(config, {playerId='player2',slot=1,input,hud}={}) {
    assertSingleActor(this);
    if(this.state!=='play'||this.mode!=='run'||this._restoring||!config||
      !['heroId','heroRuleVersion','paint','sidearm','supply','route','scheme'].every(k=>Object.hasOwn(config,k))||
      !input||input===this.input||!hud||hud===this.hud)throw Error('Explicit runtime actor configuration and adapters required');
    if(heroById(config.heroId,config.heroRuleVersion).id!==config.heroId)throw Error('Unknown runtime actor hero');
    const actor=registerActor(this,{playerId,slot}),v=actor.view;
    try {
      actor.input=input;actor.hud=hud;hud.game=v;actor.spellDefs=new Map();actor._knownSyn=new Set();actor._seenTip=new Set();
      actor.buildSupply=newRunSupply(this.runId,config.route);actor.revival=newRevivalState(this.runId,this.runPolicy.revivalAllowed);actor.revivalPending=false;
      v.resetAchievementTracking();v.telReset();actor.weaponAssets=new WeaponAssetsRuntime(v);
      this.initializeRunActor(Object.freeze({...config}),actor);
      actor.player.x=this.player.x;actor.player.z=this.player.z;actor.player.animate(0);
      for(const a of orderedActors(this))a.view._dmgAtRoomStart=Object.values(a.tel?.dmgBy||{}).reduce((n,v)=>n+v,0);
      return actor;
    } catch(error) {
      actor.weaponAssets?.clear();actor.companion?.dispose();actor.foldVisuals?.dispose();
      if(actor.player?.rig)this.scene.remove(actor.player.rig.group);
      actor._listeners.length=0;actor.active=false;this.actors.delete(playerId);throw error;
    }
  }
  captureWeaponAllocator() { this.reserveWeaponReferences();return this.weaponSerialAllocator.capture(); }
  restoreWeaponAllocator(snapshot) {
    const candidate=new WeaponSerialAllocator(snapshot);
    this.reserveWeaponReferences();
    if(candidate.serial<this.weaponSerialAllocator.serial)throw Error('Weapon allocator would reuse live identities');
    this.weaponSerialAllocator.restore(candidate.capture());
  }
  weaponMetrics() { return weaponMetrics(this); }
  reserveWeaponReferences() { reserveWorldWeaponReferences(this); }
  claimWeaponInstance(runtime, weapon) {
    for(const a of orderedActors(this))if(a.weaponAssets!==runtime &&
      (a.weaponAssets?.weapons.has(weapon.assetInstanceId)||(a.player?.weapons||[]).some(w=>w===weapon||w.assetInstanceId&&w.assetInstanceId===weapon.assetInstanceId)))throw Error('Weapon instance already owned by another actor');
  }
  validateWeaponRuntimeRestore(runtime,snapshot) {
    const identities=s=>new Set([...Object.keys(s.states||{}),...(s.entities||[]).map(e=>e.id),...Object.keys(s.paidActions||{})]);
    const incoming=identities(snapshot);
    for(const r of runtimes(this))if(r!==runtime)for(const id of identities(r))if(incoming.has(id))throw Error('Weapon runtime identity already belongs to another actor');
  }
  refreshGroundSlow() { refreshGroundSlow(this); }
  refreshWeaponTimeChannels() {
    const scales=this.computeTimeScales(0);
    this.enemyBulletTimeScale=scales.enemyBullet;this.hazardTimeScale=scales.hazard;
  }
  notifyEnemyAttack(enemy) { for(const r of runtimes(this))r.observeEnemyAttack(enemy); }
  interceptNativeProjectile(b) { for(const r of runtimes(this))if(r.interceptNativeProjectile(b))return true;return false; }

  freshRun() {
    return {
      time: 0, kills: 0, coins: 0, keys: 0, weapons: [], items: [], actives: [],
      floor: 1, rooms: 0, secrets: 0, vaults: 0, dmgTaken: 0, eliteKills: 0,
    };
  }

  // 当前是否还有下一层
  hasNextFloor() { return FLOOR_ORDER.indexOf(this.floor) < FLOOR_ORDER.length - 1; }
  nextFloor() { const i = FLOOR_ORDER.indexOf(this.floor); return FLOOR_ORDER[i + 1]; }

  // ================= 初始化 =================
  initThree() {
    const headless = this.platform.kind === 'headless';
    const width = headless ? 1280 : window.innerWidth, height = headless ? 720 : window.innerHeight;
    if (!headless) {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: false, powerPreference: 'high-performance', stencil: false });
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor(0x05080b, 1);
    }

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x06090d);

    this.camera = new THREE.PerspectiveCamera(46, width / height, 1.5, 130);
    this.camOffset = new THREE.Vector3(0, 30, 21);
    this.camLook = new THREE.Vector3();
    this.camPos = new THREE.Vector3(0, 30, 21);

    this.ambient = new THREE.AmbientLight(0xffffff, 0.35);
    this.scene.add(this.ambient);
    this.hemi = new THREE.HemisphereLight(0x88aacc, 0x223344, 0.45);
    this.scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight(0xffffff, 0.9);
    this.sun.position.set(12, 26, 10);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(1024, 1024);
    const sc = this.sun.shadow.camera;
    sc.left = -26; sc.right = 26; sc.top = 26; sc.bottom = -26; sc.near = 1; sc.far = 70;
    this.sun.shadow.bias = -0.0012;
    this.sun.shadow.normalBias = 0.03;
    this.scene.add(this.sun);
    this.sunTarget = new THREE.Object3D();
    this.scene.add(this.sunTarget);
    this.sun.target = this.sunTarget;

    if (!headless) {
      this.postfx = new PostFX(this.renderer);
      this.postfx.setSize(width, height);
    }
    this.raycaster = new THREE.Raycaster();
    this.groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.9);
    this._mouseNDC = new THREE.Vector2();
    this._hitPoint = new THREE.Vector3();
  }

  initSystems() {
    this.particles = new Particles(this.scene, 2600);
    this.debris = new Debris(this.scene, 220);
    this.decals = new Decals(this.scene, 90);
    this.flashLights = new FlashLights(this.scene, 6);
    // 10 盏常驻点光：前 8 盏给房间静态灯（与原实现能力一致），
    // 末尾 2 盏保留给运行时动态灯（召唤物）。全部一次创建、只改参数，
    // 因此灯光总数在整局中恒定，材质程序只需编译一次。
    this.roomLights = new FixedLightPool(this.scene, 10, 2);
    this.followLights = new FollowLights(this.scene, 1);
    this.projectiles = new Projectiles(this.scene, 420);
    this.weaponAssets = new WeaponAssetsRuntime(this.actorView());
    this.weaponAssetFX = new WeaponAssetFX(this.scene);
    this.damageFeedback = new DamageFeedbackCollector();
    // 弹丸要读挑战词条（「急钟」的子弹速度倍率）。
    // 之前默认它已经持有 game 引用，结果整段倍率静默失效 —— 是断言把它抓出来的。
    this.projectiles.game = this;
    this.pickups = new PickupManager(this);
    this.hazards = new HazardZones(this);
    this.enemies = [];
    this.hitboxes = [];
    this.boss = null;
    this.roomScene = null;
    this.room = null;
    this.transition = null;
    this.afterimages = this.buildAfterimages();
    this.dustTimer = 0;
    this.autoReloading = false;
  }

  buildAfterimages() {
    const list = [];
    const geo = new THREE.BoxGeometry(0.72, 1.7, 0.5);
    for (let i = 0; i < 14; i++) {
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x67e8ff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
      m.visible = false;
      this.scene.add(m);
      list.push({ mesh: m, life: 0 });
    }
    return { list, head: 0 };
  }

  bindUI() {
    const on = (id, fn) => { const e = document.getElementById(id); if (e) e.addEventListener('click', () => { audio.resume(); audio.ui('select'); fn(); }); };
    on('btn-start', () => this.enterHub());        // 标题 → 钟炉前厅（不再直接扔进地牢）
    on('btn-help', () => {
      // 展开/收起玩法要点（旧实现只切换控制列表透明度，等于没有说明内容）
      const el = document.getElementById('helpbox');
      if (el) el.classList.toggle('show');
    });
    on('btn-resume', () => this.setPaused(false));
    on('btn-quit', () => this.abandonRun());
    on('btn-save-quit', () => this.saveAndQuit());
    on('btn-continue', () => this.continueRun());
    on('btn-export-save', () => this.exportSave());
    on('btn-import-save', () => document.getElementById('save-import-file')?.click());
    document.getElementById('save-import-file')?.addEventListener('change', async e => {
      const file = e.target.files?.[0]; e.target.value = '';
      if (file) await this.importSave(file);
    });
    on('btn-victory-again', () => this.startNewRun());
    on('btn-death-again', () => this.startNewRun());
    // 结算后回大厅：留下新的记录、发现、成就与可选内容
    on('btn-victory-hub', () => this.enterHub());
    on('btn-death-hub', () => this.enterHub());
    // 结算界面原本只能"再来一局"，没有回到标题的出口（UI 流程上的死角）
    on('btn-victory-title', () => this.toTitle());
    on('btn-death-title', () => this.toTitle());
    // 本局构筑（Inventory / Build）—— 玩家必须能随时确认自己拿到了什么
    on('btn-build', () => this.setBuild(true));
    on('btn-build-close', () => this.setBuild(false));
    on('btn-pending-choice', () => { if(this.partySessionStore){this.setBuild(false);this.actorView().openFloorChoice(this.hero);return;}if (this._pendingChoice) { this.setBuild(false); this.hud.choicePanel(this._pendingChoice); this._pendingChoice = null; this.syncSaveUI(); } });
    on('btn-pause-preferences', () => this.hud.preferencesPanel());
    on('btn-pause-layout',()=>this.beginLayoutEdit());
    on('btn-pause-build', () => this.setBuild(true));
    on('btn-victory-build', () => this.setBuild(true));
    on('btn-death-build', () => this.setBuild(true));
    document.getElementById('seed-text').textContent = seedToWords(this.seed);
    window.addEventListener('resize', () => this.onResize());
  }

  // 打开/关闭"本局构筑"面板。打开时暂停时间流逝，但保留在 play 状态，
  // 因此 ESC / TAB 都能关闭并继续，不会打断本局流程。
  setBuild(v) {
    if (!this.hud) return;
    const open = v === undefined ? !this.hud.buildOpen : !!v;
    this.buildOpen = open;
    this.hud.toggleBuild(open);
  }

  // ------------------------------------------------------------
  //  面板按键（三选一 §41 / 构筑面板 §20）
  //
  //  **必须放在 update() 之外单独调用。** 这是踩过的坑：
  //  主循环的 playing 判定是 `state==='play' && !paused && !buildOpen`，
  //  所以构筑面板一打开，update() 整段就不跑了 —— 原先写在 update() 里的
  //  「按数字键把备用配件装到当前枪上」永远收不到输入，玩家按了没反应。
  //  现在由 loop() 的非游玩分支与 stepSim() 各自调用一次，恰好每帧一次。
  // ------------------------------------------------------------
  closeTopPanel() {
    const owner = this.topModal();
    if (owner === 'build') { this.setBuild(false); return true; }
    // 楼层奖励可先收起，仍保留待选数据，存档/继续后可重新选择。
    if (owner === 'choice'&&this.hud._choice?.cfg?.multi) return false;
    if (owner === 'choice') { this._pendingChoice = this.hud._choice?.cfg; this.hud.closeChoice?.(); this.syncSaveUI(); return true; }
    if (owner === 'hub') { this.hud.backHubPanel(); return true; }
    return false;
  }

  panelOpen() { return !!(this.buildOpen || this.hud.hubOpen || this.hud.choiceOpen); }

  setModalOwner(kind, open) {
    this._modalStack = (this._modalStack || []).filter(k => k !== kind);
    if (open) this._modalStack.push(kind);
    for (const [i, k] of this._modalStack.entries()) {
      const el = { build: this.hud?.el.build, choice: this.hud?.el.choicePanel, hub: this.hud?.el.hubPanel }[k];
      if (el) el.style.zIndex = String(60 + i);
    }
  }
  topModal() { return (this._modalStack || []).at(-1) || (this.paused ? 'pause' : null); }

  resetTimeScales({ clearSources = true } = {}) {
    for(const k of ['timeScale','enemyTimeScale','enemyBulletTimeScale','fxTimeScale','uiTimeScale','hazardTimeScale'])this[k]=1;
    if(clearSources)this.hitStopT=0;
    const actors=this.actors?orderedActors(this):[this];
    for(const actor of actors){
      actor.playerMoveTimeScale=actor.playerActionTimeScale=1;
      if(clearSources){
        actor.weaponAssets?.clearPrismField({refresh:false});
        const p=actor.player;if(p){const hadDeadeye=p.deadeyeT>0,hp=p.hp,armor=p.armor;p.slowT=p.deadeyeT=0;if(hadDeadeye){p.recompute();p.hp=hp;p.armor=armor;}}
      }
      actor.hud?.setDeadeye(false);
    }
  }

  cancelLifecycleTimers() {
    for (const id of this._lifecycleTimers || []) {
      if (this.lifecycleScheduler) this.lifecycleScheduler.cancel(id); else clearTimeout(id);
    }
    this._lifecycleTimers = new Set();
    this.lifecycleScheduler?.cancelAll();
  }
  scheduleLifecycle(fn, delay, typed = null) {
    const run = this.run, state = this.state;
    this._lifecycleTimers ||= new Set();
    if (this.lifecycleScheduler) {
      if (!typed) throw Error('Fixed lifecycle requires a typed task');
      const id = this.lifecycleScheduler.schedule('game-lifecycle', {
        ...typed, runId:this.runId, state, floor:this.floor, stageKey:this.stage?.stageKey || null
      }, delay);
      this._lifecycleTimers.add(id); return id;
    }
    const id = setTimeout(() => {
      this._lifecycleTimers.delete(id);
      if (this.run === run && this.state === state) fn();
    }, delay);
    this._lifecycleTimers.add(id);
    return id;
  }
  executeLifecycle(task) {
    if (this.runId !== task.runId || this.state !== task.state || this.floor !== task.floor || (this.stage?.stageKey || null) !== task.stageKey) return false;
    if (task.kind === 'show-victory') this.showLifecycleResult('victory', task.run);
    else if (task.kind === 'show-death') this.showLifecycleResult('dead');
    else if (task.kind === 'advance-stage') this.completeStageAdvance(task.next, task.stageKey);
    else if (task.kind === 'advance-floor') this.completeFloorAdvance(task.nextFloor);
    else throw Error('Unknown Game lifecycle task');
    return true;
  }
  showLifecycleResult(state, run = null) {
    this.hud.fillStats(run || this.snapshotRun(state), state === 'dead' ? 'death-stats' : 'victory-stats');
    this.hud.showScreen(state === 'dead' ? 'screen-death' : 'screen-victory');
  }

  syncSaveUI() {
    const saved = saveStore.read();
    if (this.platform?.kind === 'headless') { this.platform.emit('save-status',{hasActive:!!saved?.active,error:saveStore.error,recovered:saveStore.recovered}); return; }
    const btn = document.getElementById('btn-continue');
    // 章节流程里 floor 只是主题投影，继续按钮必须说"第 X 章 · 第 Y 段"，不能再写"层"。
    const progress = saved?.active ? runProgressLabel({ stage: saved.active.stage, floor: saved.active.floor }) : '';
    if (btn) { const name = PAGE_COMBAT_MODE === 'experimental' ? '独立实验' : '远征'; btn.disabled = !saved?.active; btn.textContent = saved?.active ? `继续${name}${progress ? ` · ${progress}` : ''}` : `继续${name}（暂无）`; }
    document.getElementById('btn-pending-choice')?.classList.toggle('hidden', !this._pendingChoice);
    const status = document.getElementById('save-status');
    if (status) status.textContent = saveStore.error ? `保存异常：${saveStore.error}` : saveStore.recovered ? '主存档受损，已改用上一份有效备份；请先导出备份，再保存一次重建主存档。' : (saved?.savedAt ? `上次保存：${formatSavedAt(saved.savedAt)}` : '进度会自动保存。');
    const alert = document.getElementById('save-alert');
    if (alert) alert.textContent = saveStore.error ? '保存异常' : saveStore.recovered ? '已恢复备份' : '';
    if (saveStore.error || saveStore.recovered) { const tools = document.getElementById('save-tools'); if (tools) tools.open = true; }
  }

  saveProgress(notify = false) {
    let result;
    try {
      if (this._restoring || this.state === 'transition' || this.ritual) {
        if (notify) this.toast('暂时无法保存', '请等待进度恢复、楼层切换或出征仪式结束', '#ff6a3a');
        return false;
      }
      const canSaveActive = this.mode === 'run' && this.state === 'play' && (this.player?.alive || this.revivalPending);
      const active = meta._clearActive ? null : canSaveActive ? validateSession(captureSession(this), this.lifecycleScheduler ? {runtimeState:this.state} : {}) : undefined;
      result = saveStore.write(meta.data, active);
    } catch (err) { result = { ok: false, error: err.message }; }
    if (result.ok) { meta._dirty = false; meta._clearActive = false; }
    if (notify || !result.ok) this.toast(result.ok ? '保存完成' : '保存失败', result.ok ? '当前进度已保存；有可续现场时，可从标题或大厅继续。' : result.error, result.ok ? '#8af0ff' : '#ff6a3a');
    if (saveStore.blocked) this.openStorageRecovery();
    this.syncSaveUI(); return result.ok;
  }

  openStorageRecovery() {
    if (this.pendingHubSelection()) { this.input?.setBlocked?.(true); return; }
    const first = !this._storageRecovery;
    this._storageRecovery = true;
    this.input?.setBlocked?.(true);
    if (!first && this.hud?.hubOpen) return;
    this.hud?.hubPanel?.({
      title: '保存状态待确认', sub: '战斗已暂停。请先确认这次写入是否真的落盘，再继续，避免覆盖原有进度。',
      rows: [{ cn: '重新确认并恢复', desc: '重读本地存档；已提交则恢复该现场，未提交则保留原现场' }],
      onPick: () => this.recoverStorage(),
    });
  }

  recoverStorage() {
    const result = saveStore.pendingWrite ? saveStore.reconcilePendingWrite() : { committed: true, envelope: saveStore.read() };
    if (result.committed === null || result.committed === true && !result.envelope) {
      this.toast('仍无法确认', result.error || saveStore.error, '#ff6a3a', 'fail'); return false;
    }
    if (result.committed === false) {
      saveStore.releaseWrites(); this._storageRecovery = false; this.hud.closeHubPanel();
      this.input?.clearEdges?.();
      if (this.revivalPending) this.openRevivalPanel();
      return true;
    }
    // Keep every writer blocked until the persisted scene has been restored.
    saveStore.blockWrites();
    const e = result.envelope;
    meta.data = structuredClone(e.meta); meta._dirty = false; meta._clearActive = false;
    let ok = false;
    try {
      if (e.active) ok = this.continueRun();
      else { this._abandoning = true; this.enterHub(); ok = true; }
    } finally { this._abandoning = false; }
    if (!ok) { this.openStorageRecovery(); return false; }
    saveStore.releaseWrites(); this._storageRecovery = false;
    this.hud.closeHubPanel();
    if (this.revivalPending) this.openRevivalPanel();
    this.input?.clearEdges?.(); return true;
  }

  storageFrozen() {
    if(this.partySessionStore)return this.partySessionStore.frozen;
    if (!saveStore.blocked && !this._storageRecovery) return false;
    this.openStorageRecovery(); return true;
  }

  saveAndQuit() { if (this.saveProgress(true)) this.toTitle(); }
  beginPartySession(options) { return new PartySessionStore(this,options); }
  partyCommand(actorId,request) {
    if(!this.partySessionStore)throw Error('PartySessionStore not attached');
    if(this._partyCheckpointOwner?.inTick)return this._partyCheckpointOwner.queueActorCommand(actorId,request);
    return this.partySessionStore.transact(actorId,request);
  }

  abandonRun() {
    this.hud.hubPanel({ title: '结束当前远征？', sub: '确认后会删除当前远征进度，但保留长期解锁与图鉴。只是暂时离开，请取消并选择“保存并退出”。',
      rows: [{ cn: '确认结束', desc: '返回大厅，当前远征无法继续' }, { cn: '取消', desc: '保留当前远征' }],
      onPick: r => { this.hud.closeHubPanel(); if (r.cn !== '确认结束') return;
        const result = saveStore.write(meta.data, null); if (!result.ok) { this.toast('无法结束', result.error, '#ff6a3a'); return; }
        this._abandoning = true; this.enterHub(); this._abandoning = false; this.syncSaveUI(); } });
  }

  continueRun() {
    try {
      if (meta._clearActive) { this.saveProgress(false); this.toast('远征已结束', '本局已结算，旧现场不能继续；如果保存异常，请先导出长期进度备份。', '#ff6a3a'); return false; }
      const e = saveStore.read();
      if (!e?.active) { this.toast('无法继续', saveStore.error || '暂无可以继续的远征', '#ff6a3a'); return false; }
      const s = validateSession(e.active);
      return this.restoreSessionState(s);
    } catch (err) { this.toast('无法恢复远征', err.message + '；原存档仍保留，可导出备份', '#ff6a3a'); return false; }
    finally { this._restoring = false; this._restoringRoom = false; this.syncSaveUI(); }
  }

  // Shared real reconstruction path. Runtime callers prevalidate their own
  // envelope and retain terminal/transition state outside schema6.
  restoreSessionState(s, {pause = true, runtime = false} = {}) {
    try {
      this._runtimeRestoring = runtime;
      this._restoring = true;
      this.startNewRun(s.seed, { practice: s.floor, restoreHero: s.hero, restoreHeroRuleVersion: s.heroRuleVersion ?? 1, restoreExperiment:s.experiment, restoreModifier: s.modifier, restoreDungeon: s.dungeon,
        restoreStage: s.flowVersion === 2 ? s.stage : null, restoreStageRun: s.flowVersion === 2 ? s.stageRun : null });
      // 沿用存档里的首领身份：旧档不能因为 Seed 映射变化而换 Boss（PASS2 §24）
      this.bossType = resumeBossType(s.bossType);
      this.bossPractice = Object.hasOwn(BOSS_MAP, s.bossPractice) ? s.bossPractice : null;
      // 路线供给账随档恢复；旧档缺字段 → 无路线（但保持账本机制一致，避免后续开箱无账）。
      this.runId = typeof s.runId === 'string' && s.runId ? s.runId : newRunId();
      this.buildSupply = s.buildSupply ? structuredClone(s.buildSupply) : newRunSupply(this.runId, 'none');
      // 本局策略与复苏（Task6）：一律以存档为准，不读后来改动过的 Meta。
      this.runPolicy = s.runPolicy ? structuredClone(s.runPolicy) : runPolicyFor('standard', 'off');
      this.revival = s.revival ? structuredClone(s.revival) : newRevivalState(this.runId, false);
      this.revivalPending = false; this._stageBossPending = false; this._completionDeferred = null;
      this.shopTx = s.shopTx ? structuredClone(s.shopTx) : newShopJournal(this.runId);
      this._shopSeq = (this.shopTx.receipts || []).reduce((m, r) => Math.max(m, r.sequence || 0), 0);
      // 遥测随存档恢复（缺失=旧档 → 空表继续记）
      this.tel = normalizeTelemetry(s.telemetry);
      this.hero = s.hero==='foldshadow'?FOLD_SHADOW:heroById(s.hero, s.heroRuleVersion ?? 1); this.applyModifier(s.modifier); this.applyHero(this.player);
      for (const data of s.rooms) { const r = this.dungeon.rooms.get(data.id); if (!r || r.uid !== data.uid || r.seed !== data.seed) throw new Error('地图与生成版本不一致'); applyRoomFlags(r, data); }
      this.roomStates = new Map(Object.entries(s.roomStates));
      for (const [uid, scene] of Object.entries(s.scenes)) this._residentRooms.get(uid)?.importState(scene);
      for (const [uid, st] of this.roomStates) this._residentRooms.get(uid)?.importState(st.scene);
      this._restoringRoom = true;
      this.buildRoom(this.dungeon.rooms.get(s.roomId), null, { keepPos: true });
      applyPlayer(this, s.player);
      this.experiment = s.experiment ? validateCombatState(s.experiment) : null;
      this.comparison=s.comparison?structuredClone(s.comparison):null;
      const consumableHost=this.experiment?restoreConsumableHost(s.consumables):null;
      this.consumables=consumableHost?.state||null;this.consumablePurchases=consumableHost?.purchases||[];
      if (this.companion) { this.companion.dispose(); this.companion = null; }
      restoreCompanion(this, s.companion);
      applyTracking(this, s.tracking);
      this.run = s.run; this.practice = s.practice;
      this.rng = new RNG(s.rng.seed); this.rng.s = s.rng.s;
      this.grng = new RNG(s.grng.seed); this.grng.s = s.grng.s;
      this.mode = 'run'; this.state = 'play'; this.attract = false; this._attractReady = false; this.ritual = null; this.transition = null;
      this.setBuild(false); this.hud.closeHubPanel(); this.hud.closeChoice(); this._pendingChoice = null;
      if (s.choice) this.restoreFloorChoice(s.choice, {runtime});
      this.resetTimeScales({ clearSources: false });
      this._doorsLocked = null; this.syncDoorLocks(); this.updateConnectors(0); this.updateCamera(1);
      if (runtime) {
        for (const data of s.rooms) applyRoomFlags(this.dungeon.rooms.get(data.id), data, {replaceMissing:true});
        applyTracking(this, s.tracking); // updateCamera(1) is initialization, not a simulated second.
      }
      this.input.clearEdges(); this.input.left = this.input.right = false;
      // 待复苏现场：恢复后直接进入复苏面板，而不是继续游戏。
      if (this.revival.status === 'pending') {
        this.revivalPending = true;
        this.paused = false;
        this.hud.hideScreens?.();
        this.openRevivalPanel();
        this.toast('濒死', '每局一次：接受复苏，或结束本局', '#ffd24a', 'story');
        return true;
      }
      this.paused = false; if (pause) this.setPaused(true);
      if (pause) this.toast('远征已恢复', '现场已暂停 · 点击返回游戏继续', '#8af0ff');
      return true;
    } finally { this._restoring = false; this._restoringRoom = false; this._runtimeRestoring = false; this.syncSaveUI(); }
  }

  exportSave() {
    if (this.state === 'play' && !this.saveProgress(false)) return;
    const e = saveStore.read();
    if (!e) { this.toast('无法导出', saveStore.error || '暂无存档', '#ff6a3a'); return; }
    const a = document.createElement('a'), url = URL.createObjectURL(new Blob([encode(e)], { type: 'application/json' }));
    a.href = url; a.download = `沉钟回廊_存档_${new Date().toISOString().slice(0, 10)}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async importSave(file) {
    try {
      if (file.size > 4 * 1024 * 1024) throw new Error('文件过大');
      const e = validateEnvelope(decode(await file.text()));
      if (e.active) e.active = validateSession(e.active);
      this.hud.hubPanel({ title: '导入存档', sub: `备份时间 ${formatSavedAt(e.savedAt)}。确认后替换本浏览器的长期进度和远征槽；当前进度会保留在自动备份槽。`,
        rows: [{ cn: '确认导入', desc: e.active ? `包含远征进度：${runProgressLabel({ stage: e.active.stage, floor: e.active.floor }) || '未知'}` : '只包含长期进度' }, { cn: '取消', desc: '保留当前进度' }],
        onPick: r => {
          this.hud.closeHubPanel(); if (r.cn !== '确认导入') return;
          const result = saveStore.write(e.meta, e.active || null, { replace: true });
          if (!result.ok) { this.toast('导入失败', result.error, '#ff6a3a'); return; }
          meta.load(); this._importing = true; this.enterHub(); this._importing = false; this.syncSaveUI(); this.toast('导入完成', '长期进度已恢复；有远征时可点击继续远征', '#8af0ff');
        } });
    } catch (err) { this.toast('导入失败', err.message + '；当前存档未改变', '#ff6a3a'); }
  }

  restoreFloorChoice(cfg, {runtime=false} = {}) {
    // 导入档只决定候选 ID 与顺序；名称、说明、颜色均从本地定义重建。
    if(cfg.kind==='doctrine'&&this.hero.ruleVersion===3)return openDoctrines(this,{restore:true});
    const kind = cfg.kind;
    const options = cfg.options.map(({ id }) => {
      const d = ({ attachment: ATTACH_MAP, evolution: EVO_MAP, doctrine: DOCTRINE_MAP }[kind])[id];
      return { id, cn: d.cn, desc: d.desc,
        tag: kind === 'attachment' ? SLOT_CN[d.slot] : kind === 'evolution' ? (this.companion?.stage ? '强化' : '方向') : d.tag,
        color: kind === 'evolution' ? d.color : kind === 'doctrine' ? '#ffd24a' : '#8ad8ff' };
    });
    const title = `${this.hero.cn} · ${{ attachment: '配件三选一', evolution: '异兽进化', doctrine: '战斗教条' }[kind]}`;
    this.hud.choicePanel({ kind, title, sub: '选择本层奖励。', options, commitBeforeClose: kind === 'attachment', onPick: (o, i, choice) => {
      if (cfg.kind === 'attachment') return this.claimFloorAttachment(o.id, choice);
      if (runtime && cfg.kind === 'evolution') {
        if (this.companion && this.companion.evolve(o.id)) this.toast('异兽进化', `${this.companion.name} · ${EVO_MAP[o.id].cn}（${this.companion.stage}/2）`, EVO_MAP[o.id].color, 'story');
        return;
      }
      if (runtime && cfg.kind === 'doctrine') {
        this.player.doctrines.push(o.id); this.player.recompute();
        const d=DOCTRINE_MAP[o.id];this.toast('教条确立', `${d.cn} · ${d.desc}`, '#ffd24a', 'build');return;
      }
      if (cfg.kind === 'evolution') this.companion?.evolve(o.id);
      else if (cfg.kind === 'doctrine') { this.player.doctrines.push(o.id); this.player.recompute(); }
      this._pendingChoice = null; this.syncSaveUI(); this.saveProgress(false);
    } });
  }

  handlePanelKeys(dt = 1 / 60) {
    const inp = this.input;
    if (!inp || !this.hud) return;
    inp.setBlocked?.(this.paused || this.panelOpen() || this.state !== 'play');
    if (this.experiment?.fold) tickFold(this,0);
    const owner = this.topModal();
    if (owner === 'build') {
      this.hud.handleEquipmentKeys?.(inp);
      return;
    }
    if (owner === 'choice') {
      for (let i = 0; i < (this.hud._choice?.cfg?.options?.length||3); i++) if (inp.pressed[String(i + 1)]) this.hud.choicePick(i);
      if (inp.pressed['ArrowLeft'] || inp.pressed['a']) this.hud.choiceNav(-1);
      if (inp.pressed['ArrowRight'] || inp.pressed['d']) this.hud.choiceNav(1);
      if (inp.pressed['Enter'] || inp.pressed['e']) this.hud.choiceConfirm();
      return;
    }
    if (owner === 'hub') { this.hud.handleHubKeys?.(inp, dt); }
  }

  installBuildAttachment(attId, weaponIndex = this.player?.weaponIndex, slotIndex = -1) {
    return commitEquipmentOperation(this, p => p.installAttachment(attId, weaponIndex, slotIndex), '改装完成');
  }
  tryInstallAttachment(attId, weaponIndex = this.player?.weaponIndex, slotIndex = -1) {
    return this.installBuildAttachment(attId, weaponIndex, slotIndex);
  }
  tryDetachAttachment(attId, weaponIndex = this.player?.weaponIndex) {
    return commitEquipmentOperation(this, p => {
      const w = p.weapons[weaponIndex];
      if (!w?.attachments?.includes(attId)) return { ok: false, why: '这件配件不在目标武器上' };
      // If the spare library is full, reserve its ground position *first*.
      if (p.spareAttachments.length >= p.spareCap() && !p.game.dropAttachmentPickup(attId))
        return { ok: false, why: '附近没有可及落点，原配件已保留' };
      const at = w.attachments.indexOf(attId);
      const positions = w.attachmentPositions || w.attachments.map((_, i) => i);
      w.attachments.splice(at, 1); positions.splice(at, 1); w.attachmentPositions = positions;
      if (p.spareAttachments.length < p.spareCap()) p.spareAttachments.push(attId);
      p.recompute(); return { ok: true };
    }, '配件已拆下');
  }
  dropAttachmentPickup(id) {
    if (!ATTACH_MAP[id] || !this.player) return null;
    const plan = planEquipmentDrops(this, [{ kind: 'attachment', id, attId: id }]);
    return spawnPlannedEquipment(this, plan)[0];
  }
  grantAttachmentReward(id) {
    if (!ATTACH_MAP[id] || !this.player) return false;
    if (this.player.spareAttachments.length < this.player.spareCap()) return this.player.addAttachment(id);
    const pickup = this.dropAttachmentPickup(id);
    if (pickup) this.toast('奖励已保留在地面', '备用配件库已满；用交互动作选择替换，或打开构筑面板丢弃旧件后再领取。', '#8ad8ff');
    return !!pickup;
  }
  claimFloorAttachment(id, choice) {
    if (!choice || this.hud._choice !== choice || choice.cfg.kind !== 'attachment' || !choice.cfg.options.some(o => o.id === id)) return false;
    const ok = commitEquipmentOperation(this, p => ({ ok: p.game.grantAttachmentReward(id) }), '楼层配件已领取', { consumeChoice: choice, refresh: false });
    if (ok) { this._pendingChoice = null; this.syncSaveUI(); }
    return ok;
  }
  tryDropSpareAttachment(index) {
    return commitEquipmentOperation(this, p => {
      if (!Number.isInteger(index) || !p.spareAttachments[index]) return { ok: false, why: '没有这件备用配件' };
      if (!p.game.dropAttachmentPickup(p.spareAttachments[index]))
        return { ok: false, why: '附近没有可以放置配件的地面，配件仍保留在备用库' };
      p.spareAttachments.splice(index, 1); return { ok: true };
    }, '配件已掉落地面');
  }
  dropBuildWeapon(index, whole = false) {
    return commitEquipmentOperation(this, p => {
      if (!Number.isInteger(index) || !p.weapons[index]) return { ok: false, why: '没有这把武器' };
      if (p.weapons.length <= 1) return { ok: false, why: '请保留最后一把武器' };
      p.game.dropWeaponPickup(p.weapons[index], p.x, p.z, p.aim, { whole });
      p.weapons.splice(index, 1);
      p.weaponIndex = Math.max(0, Math.min(p.weapons.length - 1, p.weaponIndex - (index < p.weaponIndex ? 1 : 0)));
      p.reloading = false; p.reloadT = 0; p.recompute(); return { ok: true };
    }, whole ? '整枪已掉落地面' : '武器已掉落地面');
  }
  collectEquipmentPickup(pickup) { return collectEquipmentPickup(this, pickup); }
  useConsumable(slot) { return useConsumable(this,slot); }
  purchaseConsumable(itemId) { return purchaseConsumable(this,itemId); }
  notifyConsumableAttack() { notifyConsumableAttack(this); }

  offerRelicPickup(pickup) { return offerRelicPickup(this,pickup); }

  offerAttachmentReplacement(pickup) {
    if (!this.pickups.list.includes(pickup) || pickup.collected) return;
    const room = this.room, p = this.player, before = p.spareAttachments.slice();
    const owner = { title: '备用配件库已满 · 选择替换', sub: `新配件：${ATTACH_MAP[pickup.attId || pickup.id]?.cn}。选择要放下的一件，旧件会掉到地面；取消则保留全部物品。`,
      rows: [...before.map((id, index) => ({ cn: `换下 ${ATTACH_MAP[id].cn}`, desc: ATTACH_MAP[id].desc, index })), { cn: '取消', desc: '取消：保留原库存，新配件留在地面' }],
      onPick: row => {
        if (this.hud._hub?.cfg !== owner) return;
        if (row.index === undefined) { this.hud.closeHubPanel(); return; }
        if (!this.hud.hubOpen || this.room !== room || this.player !== p || !this.pickups.list.includes(pickup) || pickup.collected || JSON.stringify(p.spareAttachments) !== JSON.stringify(before)) return;
        const ok = commitEquipmentOperation(this, candidate => {
          if (!candidate.game.dropAttachmentPickup(candidate.spareAttachments[row.index])) return { ok:false, why:'旧配件附近没有可放置的地面，原库存和新配件都没有变动' };
          candidate.spareAttachments.splice(row.index, 1);
          return { ok: candidate.addAttachment(pickup.attId || pickup.id) };
        }, '备用件已替换', { source: pickup });
        if (ok) this.hud.closeHubPanel();
      } };
    this.hud.hubPanel(owner);
  }

  // ---------------- 路线供给（Task5）----------------
  // 供给账（this.buildSupply）由 build_supply_bridge 维护；这里只做"玩家能看见/能操作"的部分，
  // 以及把"实际获取"回写到领取账。
  commitSupplyPickup(supplyKey) {
    const r = commitSupplyClaim(this, supplyKey);
    if (r.ok && !r.replay) this.saveProgress(false);
    return r.ok;
  }

  // 大厅选择路线（写入 meta，开局时冻结进本局的 buildSupply）。
  setRoute(route) {
    const allowed = ['none', ...BUILD_ROUTES.map((r) => r.id)];
    if (!allowed.includes(route)) return false;
    meta.setSel('route', route); meta.save(true);
    return true;
  }

  routeView() {
    const supply = this.buildSupply;
    return {
      selected: supply?.selectedRoute || null,
      missing: missingRouteDependencies(this).map((id) => ({ id, label: this.supplyLabel(catalogAllocation(id)) })),
      pending: supply ? Object.keys(supply.rewardLedger).filter((k) => supply.rewardLedger[k].mandatory && supply.rewardLedger[k].claimState === 'offered').length : 0,
      routes: BUILD_ROUTES.map((r) => ({ id: r.id, name: r.name, loop: r.loop, queue: r.supplyQueue })),
    };
  }

  supplyLabel(a) {
    if (!a) return '未知';
    if (a.kind === 'weapon') return WEAPON_MAP[a.id]?.cn || a.id;
    if (a.kind === 'item') return ITEM_MAP[a.id]?.cn || a.id;
    if (a.kind === 'attachment') return ATTACH_MAP[a.id]?.cn || a.id;
    if (a.kind === 'active') return ACTIVE_MAP[a.id]?.cn || a.id;
    if (a.kind === 'compensation') return `补偿 ${a.coins || 15} 金币`;
    return `${a.kind} ×${a.amount || 1}`;
  }

  // 逐件"领取/暂不领取"面板（不是四选一）。关闭保留未领身份。
  openSupplyPanel(queue, title, { onDefer = null } = {}) {
    const supply = this.buildSupply;
    if (!supply) return;
    const rows = queue.filter((k) => supply.rewardLedger[k]?.claimState === 'offered').map((key) => ({
      cn: `领取 · ${this.supplyLabel(supply.rewardLedger[key].allocation)}`,
      desc: '构筑路线的必要装备；暂不领取也会保留资格，换层后仍可打开',
      key,
    }));
    if (!rows.length) return;
    rows.push({ cn: '暂不领取', desc: '保留待领资格；不会重新抽取，也不会丢失', defer: true });
    this.hud.hubPanel({
      title: title || '路线补齐 · 可领取装备',
      sub: '逐件领取或暂不领取；关闭面板不会丢失待领资格，可从构筑面板再次打开。',
      rows,
      onPick: (row) => {
        if (row.key) this.claimSupplyOffer(row.key);
        else { if (row.defer && onDefer) onDefer(); this.hud.closeHubPanel(); }
      },
    });
  }

  claimSupplyOffer(key) {
    const supply = this.buildSupply;
    const e = supply?.rewardLedger[key];
    if (!e) { this.hud.closeHubPanel(); return false; }
    if (e.claimState === 'committed') return true;
    if (this.storageFrozen()) return false;
    try {
      const draft = captureSessionDraft(this), metaDraft = structuredClone(meta.data);
      const projection = acquisitionProjection(this, draft, metaDraft);
      const res = acquireRouteReward(projection.game, e.allocation);
      if (!res.ok) { this.toast('无法领取', res.reason || '条件不满足；本次没有消耗任何资源', '#ff6a3a', 'fail'); return false; }
      applySimpleReward(projection.game, e.allocation);
      const ledger = { buildSupply: draft.buildSupply };
      if (!commitSupplyClaim(ledger, key).ok) return false;
      draft.buildSupply = ledger.buildSupply;
      projection.finish(); validateSession(draft);
      const saved = saveStore.write(metaDraft, draft);
      if (saved.committed !== true) { if (saveStore.blocked) this.openStorageRecovery(); this.toast('领取未保存', saved.error, '#ff6a3a', 'fail'); return false; }
      try {
        publishAcquisition(this, draft); publishDrops(this, projection.drops);
        this.buildSupply = structuredClone(draft.buildSupply); meta.data = metaDraft; meta._dirty = false; meta._clearActive = false;
        this.roomStates.set(this.room.uid, structuredClone(draft.roomStates[this.room.uid]));
        this.hud.closeHubPanel(); this.reopenPendingSupplyPanel();
      } catch (err) { saveStore.blockWrites(); this.openStorageRecovery(); return false; }
      return true;
    } catch (err) { this.toast('无法领取', err.message, '#ff6a3a', 'fail'); return false; }
  }

  reopenPendingSupplyPanel() {
    const supply = this.buildSupply;
    if (!supply) return;
    const remaining = (supply.floorCompletionQueue || []).filter((k) => supply.rewardLedger[k]?.claimState === 'offered');
    if (remaining.length) this.openSupplyPanel(remaining, '首层补齐 · 路线必要装备');
  }

  // 从构筑面板打开的入口：任何仍有待领身份的路线装备。
  openPendingRouteSupply() {
    const supply = this.buildSupply;
    if (!supply) return false;
    const pending = Object.keys(supply.rewardLedger).filter((k) => supply.rewardLedger[k].mandatory && supply.rewardLedger[k].claimState === 'offered');
    if (!pending.length) return false;
    this.openSupplyPanel(pending, '待领 · 路线必要装备');
    return true;
  }

  // 小地图放大（M）。状态挂在 Game 上，换局 / 回标题时能可靠复位，
  // 而不是依赖读取上一次写进 DOM 的内联样式字符串。
  toggleMinimapBig(v) {
    this.mmBig = v === undefined ? !this.mmBig : !!v;
    if (this.platform?.kind === 'headless') { this.platform.emit('minimap',{big:this.mmBig}); return; }
    const wrap = document.getElementById('minimap-wrap');
    if (wrap) wrap.classList.toggle('big', this.mmBig);
  }

  onResize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.input?.refreshPointerPosition?.();
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.postfx.setSize(w, h);
    this.hud?.syncPanelInput();
  }

  // ================= 世界接口（供弹幕/敌人调用）=================
  get colliders() { return this.roomScene ? this.roomScene.colliders : EMPTY; }
  get propsBlocking() { return true; }

  pointBlocked(x, z, r, y = 0.85) {
    for (const sc of this.activeScenes()) {
      if (sc.pointBlockedBullet && sc.pointBlockedBullet(x, z, r, y)) return true;
    }
    // 任何矩形之外（墙体内部）同样视为阻挡
    const rects = this.walkRects();
    return !rects.some((rc) => x >= rc.x0 && x <= rc.x1 && z >= rc.z0 && z <= rc.z1);
  }

  // 玩家**移动**用的碰撞查询（与 Player 移动解算同源：看 c.move 而非 c.bullet）。
  // 供寻路/自动化使用，避免拿"子弹能否通过"去判断"人能否走过去"。
  moveBlocked(x, z, r, y = 0.9) {
    if (!this.roomScene) return false;
    const rr = r ?? (this.player ? this.player.radius : 0.62);
    for (const sc of this.activeScenes()) {
      // 房间的局部边界查询不能否决其他房间/走廊；并集边界在下方统一判断。
      if (sc instanceof RoomScene && (Math.abs(x - sc.ox) > sc.half + rr || Math.abs(z - sc.oz) > sc.half + rr)) continue;
      if (sc.pointBlocked && sc.pointBlocked(x, z, rr, y)) return true;
    }
    const rects = this.walkRects();
    return !rects.some((rc) => x >= rc.x0 - rr && x <= rc.x1 + rr && z >= rc.z0 - rr && z <= rc.z1 + rr);
  }
  propHit(x, z, r, y) { return this.roomScene ? this.roomScene.propHit(x, z, r, y) : null; }
  clampToRoom(x, z, pad) { return this.roomScene ? this.roomScene.clampToRoom(x, z, pad) : { x, z }; }
  // 并集解算：边界夹取由所有矩形统一处理，障碍推出交给各场景。
  resolveCircle(e, r, clamp) {
    const rects = this.walkRects();
    if (!rects.length) return false;
    const bx = e.x, bz = e.z;
    const cl = clampToRects(e.x, e.z, r, rects);
    if (cl) {
      e.x = cl.x; e.z = cl.z;
      if (e.vx !== undefined) {
        if (Math.abs(e.x - bx) > 1e-6) e.vx = 0;
        if (Math.abs(e.z - bz) > 1e-6) e.vz = 0;
      }
    }
    for (const sc of this.activeScenes()) if (sc.resolveColliders) sc.resolveColliders(e, r);
    return false;
  }
  addHazard(x, z, radius, delay, damage, color) { this.hazards.add(x, z, radius, delay, damage, color); }

  hitTest(x, z, r, team, owner, hitSet, y) {
    for (const e of this.hitboxes) {
      if (!e.alive || e.team === team) continue;
      if (hitSet && hitSet.has(e.id)) continue;
      if (y !== undefined && e.minY !== undefined && y < e.minY) continue;
      const dx = e.x - x, dz = e.z - z;
      const rr = (e.r ?? e.radius ?? 0.5) + r;
      if (dx * dx + dz * dz <= rr * rr) return e;
    }
    return null;
  }

  findNearest(x, z, team, range, exclude, used) {
    let best = null, bd = range * range;
    for (const e of this.hitboxes) {
      if (!e.alive || e.team !== team) continue;
      if(this.actorCount>1&&team===TEAM.PLAYER&&suppressesNewPlayerLocks(e.game))continue;
      if (exclude && e === exclude) continue;
      if (used && used.has(e.id)) continue;
      const dx = e.x - x, dz = e.z - z;
      const d = dx * dx + dz * dz;
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }

  onDamage(target, dmg, opts = {}) {
    if (!target || !target.alive) return;
    opts={...opts,...captureDamageContext(this,opts)};
    // Defensive rules belong to the actual victim. No offensive proc runs here.
    if(target.team===TEAM.PLAYER){const before=target.hp;target.assetLastSourceInstanceId=opts.sourceInstanceId||null;target.assetLastRootShotId=opts.rootShotId||null;target.assetLastNoRefund=!!opts.assetNoRefund;captureBuildKillContext(target,opts);if(target.hero?.id==='resonant'&&target.hero.ruleVersion===3)target.c2Lethal=null;target.takeDamage(dmg,opts);return Math.max(0,before-target.hp);}
    const actor=resolveDamageActor(this,opts,{diagnose:true});
    if(actor&&actor.view!==this)return actor.view.onDamage(target,dmg,opts);
    if((this.actors||this.playerId)&&!actor){const before=target.hp;captureBuildKillContext(target,opts);target.takeDamage(dmg,opts);return Math.max(0,Math.min(before,before-target.hp));}
    const context=emberHitContext(this,target,dmg,opts||{});
    const adjusted=this.weaponAssets?.beforeDamage(target,context.damage,context.opts)||context;
    const before=target.hp;
    target.assetLastSourceInstanceId=adjusted.opts.sourceInstanceId||null;
    target.assetLastRootShotId=adjusted.opts.rootShotId||null;
    target.assetLastNoRefund=!!adjusted.opts.assetNoRefund;
    captureC2Lethal(this,target,adjusted.opts);
    captureBuildKillContext(target,adjusted.opts);
    target.takeDamage(adjusted.damage, adjusted.opts);
    if (target.alive && this.hero?.ruleVersion === 3 && this.hero.id === 'resonant') target.c2Lethal = null;
    const applied=Number.isFinite(before)&&Number.isFinite(target.hp)?Math.min(Math.max(0,before),Math.max(0,before-target.hp)):0;
    this.weaponAssets?.afterDamage(target,applied,adjusted.opts);
    this.weaponAssets?.observeActualDamage?.(target,applied,adjusted.opts,before);
    if (applied > 0 && this.hero?.ruleVersion === 3) {
      const o = adjusted.opts, source = o.source || 'unknown';
      const direct = !o.assetSecondary && ['bullet','beam','weapon_asset'].includes(source);
      const primaryExplosion = source === 'explosion' && (o.primaryExplosion || o.assetShot?.explosion && !o.assetShot?.secondaryExplosion);
      const category = source === 'secondaryEcho' ? 'secondaryEcho' : source === 'heroSkill' ? 'heroSkill' :
        o.feedbackCategory === 'unit' ? 'companion' : direct ? 'directWeapon' : primaryExplosion ? 'explosion' :
        ['burn','poison','statusDot'].includes(source) ? 'statusDot' : o.assetSecondary ? 'secondary' : 'environmental';
      const playerOwned = o.feedbackCategory !== 'unit' && (o.ownerPlayerId === this.playerId || o.owner === this.player || o.bullet?.ownerRef === this.player ||
        this.player?.weapons?.some(w => w.assetInstanceId === o.sourceInstanceId));
      // Numeric actual HP loss, after defenses and before any downstream caller
      // can confuse a secondary effect with a paid attack. This is a plain-data
      // hook for later C2 hero progression consumers.
      this.emit('onActualDamage', { targetId: String(target.id || ''), targetIsBoss: !!target.isBoss,
        ownerPlayerId:o.ownerPlayerId,sourceEntityId:o.sourceEntityId,amount: applied, category, owner: playerOwned ? 'player' : o.feedbackCategory === 'unit' ? 'unit' : 'world',
        sourceInstanceId: o.sourceInstanceId || null, rootShotId: o.rootShotId || null,
        roomUid: String(this.room?.uid || this.mode || 'world'), lethal: !target.alive,
        targetMaxHp:target.maxHp, progressionEligible:!target.dummy&&!target.immortal&&!target.invulnerable&&!target.fromSummon&&target.team===TEAM.ENEMY });
      if(isVeteran(this.player)&&playerOwned&&source!=='heroSkill')veteranTarget(this.player,target,this);
    }
    return applied;
  }

  damageFeedbackObjectId(object, prefix) {
    this._damageFeedbackIds ??= new WeakMap();
    if (!object || (typeof object !== 'object' && typeof object !== 'function')) return prefix;
    if (!this._damageFeedbackIds.has(object)) {
      this._damageFeedbackSequence = (this._damageFeedbackSequence || 0) + 1;
      this._damageFeedbackIds.set(object, `${prefix}:${this._damageFeedbackSequence}`);
    }
    return this._damageFeedbackIds.get(object);
  }

  createDamageRootId() {
    this._damageRootSequence = (this._damageRootSequence || 0) + 1;
    return `legacy:${this._damageFeedbackEpoch || 0}:${this._damageRootSequence}`;
  }

  nativeUnitDamageFeedback(unit) {
    // Saved with the unit and its in-flight bullets. A transient WeakMap ID
    // would disagree with those bullets after a room or cold restoration.
    unit.damageFeedbackSourceId ||= `unit:${this.createDamageRootId()}`;
    unit.sourceEntityId=unit.damageFeedbackSourceId;
    // A summoned unit pays no ammunition per bullet and never inherits the
    // currently held gun's refund or primary-only build effects.
    return {ownerPlayerId:unit.ownerPlayerId??null,sourceEntityId:unit.damageFeedbackSourceId,feedbackCategory:'unit',feedbackSourceInstanceId:unit.damageFeedbackSourceId,feedbackRootShotId:null,
      sourceInstanceId:unit.damageFeedbackSourceId,rootShotId:null,assetSecondary:true,assetNoRefund:true};
  }

  getActiveSelectionView() { return activeSelectionView(this.player); }

  selectActive(id) {
    if (this.state !== 'play' || !this.player?.alive || this._restoring || this._importing ||
        (!this.buildOpen && (this.paused || this.panelOpen?.()))) return false;
    if (!selectActiveId(this.player,id)) return false;
    if (this.mode === 'run') this.saveProgress(false);
    return true;
  }

  cycleActive(direction = 1) {
    if (this.state !== 'play' || !this.player?.alive || this.paused || this.panelOpen?.() || this._restoring || this._importing) return false;
    if (!cycleActiveId(this.player,direction)) return false;
    if (this.mode === 'run') this.saveProgress(false);
    return true;
  }

  recordDamageFeedback(target, amount, opts = {}, position = {}) {
    this.damageFeedback ??= new DamageFeedbackCollector();
    const owner = opts.owner || opts.bullet?.ownerRef;
    const category = opts.feedbackCategory || (owner && owner !== this.player ? 'unit' : 'attack');
    const sourceInstanceId = opts.feedbackSourceInstanceId || opts.sourceInstanceId || (owner ? this.damageFeedbackObjectId(owner,'owner') : `source:${opts.source || 'environment'}`);
    const root = Object.hasOwn(opts,'feedbackRootShotId') ? opts.feedbackRootShotId : opts.rootShotId;
    this.damageFeedback.record({
      runId:`world:${this._damageFeedbackEpoch || 0}`,roomUid:this.room?.uid || this.mode || 'world',
      targetId:typeof target.id==='string'&&target.id?target.id:this.damageFeedbackObjectId(target,'target'),
      sourceInstanceId,rootShotId:category==='attack'&&typeof root==='string'?root:null,
      category,amount,crit:!!opts.crit,x:position.x??target.x,y:position.y??1.7,z:position.z??target.z,
      timeMs:this.damageFeedbackTimeMs || 0,
    });
    // The UI file belongs to Workbuddy. Until its public interface arrives,
    // callers keep their existing popup instead of silently losing feedback.
    return typeof this.hud?.applyDamageFeedback === 'function';
  }

  advanceDamageFeedback(dt) {
    if (this.paused || (this.actorCount!==2&&this.panelOpen?.()) || !Number.isFinite(dt) || dt <= 0) return;
    this.damageFeedbackTimeMs = (this.damageFeedbackTimeMs || 0) + dt * 1000;
  }

  flushDamageFeedback() {
    const packets = this.damageFeedback?.drain(this.damageFeedbackTimeMs || 0) || [];
    if (packets.length) this.hud?.applyDamageFeedback?.(packets);
    return packets;
  }

  clearDamageFeedback() {
    this.damageFeedback?.clear();
    this.hud?.clearDamageFeedback?.();
    this._damageFeedbackEpoch = (this._damageFeedbackEpoch || 0) + 1;
    this._damageFeedbackIds = new WeakMap();
  }

  weaponAssetOpenPortals() {
    const sc=this.roomScene,room=this.room;
    if(!sc?.half||room?.locked||this.mode!=='run')return [];
    const x=sc.ox||0,z=sc.oz||0,h=sc.half,w=DOOR_W/2,result=[];
    for(const [dir,nx,nz] of [['n',0,-1],['s',0,1],['e',1,0],['w',-1,0]]){
      const door=room.doors?.[dir];if(!door||door.locked||door.sealed)continue;
      result.push({id:`${room.uid}:${dir}`,ax:x+nx*h-(nx?0:w),az:z+nz*h-(nx?w:0),bx:x+nx*h+(nx?0:w),bz:z+nz*h+(nx?w:0)});
    }
    return result;
  }

  weaponAssetExplosionFeedback({x,y=.8,z,radius,damage,sourceInstanceId,rootShotId,owner,shot,killsBefore=0,secondaryOnly=false,mechanic}) {
    const actor=resolveDamageActor(this,{owner,assetShot:shot,sourceInstanceId,rootShotId},{initiating:true,diagnose:true});
    if(actor&&actor.view!==this)return actor.view.weaponAssetExplosionFeedback({x,y,z,radius,damage,sourceInstanceId,rootShotId,owner,shot,killsBefore,secondaryOnly,mechanic});
    const meteor=mechanic==='meteor'||mechanic==='v3:meteor';
    this.explodeVisual(x,y,z,radius,meteor?0xff7a2a:0xffb347);
    // 陨石（试玩反馈："陨石打击感太弱，完全没有元气骑士那种天降火陨石的打击感"）：
    // 单靠一次爆炸粒子撑不起"天降"的重量，必须叠四层：冲击波环 → 扬尘 → 火星 → 焦痕，并配专用低频音。
    if(meteor){
      this.particles.ring(x,.35,z,0xffb066,26,Math.max(1.1,radius*.5),7.5);
      this.particles.smoke(x,.5,z,10,0x6b5a4a,Math.max(.6,radius*.28),1.25);
      this.particles.sparkle(x,.7,z,0xff8a3c,12,3.4);
      this.particles.impact(x,.4,z,0xffd9a0,10,Math.max(.5,radius*.3));
      this.decals.add(x,z,radius*.85,0x120d09,0.85,30);
      this.flashSmall(x,y+.3,z,0xff8a3c,34*Math.min(2,radius/3),0.3);
      audio.meteor(Math.min(1.6,radius/3));
      this.shake(Math.min(.95,radius*.075));
    } else {
      audio.explosion(Math.min(1.8,radius/3));this.shake(Math.min(.5,radius*.05));
    }
    if(!secondaryOnly&&(actor||!this.actors))this.emit('onExplosion',{x,z,radius,damage,team:TEAM.PLAYER,owner:owner||this.player,sourceInstanceId,rootShotId,assetShot:shot});
    if((actor||!this.actors)&&this.run&&this.run.kills-killsBefore>=3)this._blastKills=Math.max(this._blastKills|0,this.run.kills-killsBefore);
    for(const prop of (this.roomScene?.props||[]).slice()){
      if(prop.hp===undefined||prop.explosive||Math.hypot(prop.worldX-x,prop.worldZ-z)>=radius+.6)continue;
      this.onPropHit(prop,damage*1.6,prop.worldX,.6,prop.worldZ,{assetShot:shot});
    }
  }

  weaponAssetFeedback(event, payload = {}) {
    const p=this.player,w=payload.weapon,def=w?.def;
    if(event==='meteor-warning'){audio.meteorWarning();return;}
    if(event==='reload'){audio.reload(payload.phase==='complete'?1:0);return;}
    if(event==='feed'){audio.reload(1);return;}
    if(event==='invalid-placement'){
      const reasons={'placement-range':'落点超过14米','placement-wall':'落点或射线被墙遮挡','segment-wall':'连线穿过了墙壁','segment-too-short':'两锚点至少间隔0.75米','segment-too-long':'相邻锚点最多间隔8米','segment-cap':'已经达到连线数量上限'};
      if(this.time-(this._assetInvalidAt??-10)>.6){this._assetInvalidAt=this.time;audio.ui('error');this.toast('落点或连线无效',reasons[payload.reason]||'请选择有效的地面落点','#ffcf6a','fail');}
      return;
    }
    if(event==='shot'&&p&&def){
      const wp=p.muzzlePoint();
      audio.gun(def.sfx||({energy:'laser',shotgun:'shotgun',minigun:'minigun',launcher:'rocket',sniper:'sniper'}[def.cls])||'pistol',def.cls==='minigun'?.65:1);
      this.particles.muzzle(wp.x,wp.y,wp.z,p.aim.x,p.aim.z,def.color,def.assetFamily==='爆破' ?1.4:.85);
      this.flashSmall(wp.x,wp.y,wp.z,def.color,6,.045);
      this.shake((def.shake||0)*(1+(payload.charge||0))*(1+(p.attachMods().shake||0)));
      p.recoil=Math.min(.35,.06+(def.damage||0)*.004);
      p.vx-=p.aim.x*(def.knock||0)*.55;p.vz-=p.aim.z*(def.knock||0)*.55;
    }
  }

  onBulletEnd(x, y, z, b) {
    if (b.explosive > 0) return;
    this.particles.impact(x, y, z, b.mesh.material.color.getHex(), 5, 0.8);
    if (this.vr() < 0.35) this.decals.add(x, z, 0.28, 0x090a0c, 0.6, 22);
    this.flashSmall(x, y, z, b.mesh.material.color.getHex(), 3, 0.05);
  }

  onRicochet(x, y, z, b) {
    this.particles.impact(x, y, z, b.mesh.material.color.getHex(), 4, 0.7);
    if (this.vr() < 0.4) audio.ricochet();
  }

  onPropHit(prop, dmg, x, y, z, bullet) {
    // Hub scenery intentionally has no destruction interface (propHit is null).
    // Asset blast feedback must not turn that scenery into destructible props.
    if (prop.hp === undefined || typeof this.roomScene?.destroyProp !== 'function') return;
    prop.hp -= dmg;
    this.particles.impact(x, y, z, '#c8b090', 5, 0.8);
    if (prop.trap || prop.blocksMove === false) return;
    if (prop.hp <= 0) this.roomScene.destroyProp(prop);
  }

  explode(x, y, z, radius, damage, team, owner, statuses, damageContext = {}) {
    if (!Object.hasOwn(damageContext,'rootShotId')) damageContext = {...damageContext,rootShotId:this.createDamageRootId()};
    damageContext={...damageContext,...captureDamageContext(this,{...(team!==TEAM.PLAYER?{ownerPlayerId:null}:{}),...damageContext,owner})};
    const actor=resolveDamageActor(this,damageContext,{diagnose:true});
    if(actor&&actor.view!==this)return actor.view.explode(x,y,z,radius,damage,team,owner,statuses,damageContext);
    const col = team === TEAM.PLAYER ? 0xffb347 : 0xff6a3a;
    this.particles.explosion(x, Math.max(0.4, y), z, radius * 0.42, col);
    this.decals.add(x, z, radius * 0.7, 0x0b0a08, 0.75, 26);
    this.flashSmall(x, y + 0.4, z, col, 26 * Math.min(2, radius / 3), 0.26);
    this.shake(Math.min(0.55, radius * 0.055));
    audio.explosion(Math.min(1.8, radius / 3));
    // 广播爆炸事件：熔铸匠据此累积「炉热」（§9.1），未来遗物也可监听（§6）
    emitDamageEvent(this,'onExplosion', { x, z, radius, damage, team, owner,
      secondaryOnly: (!!damageContext.assetSecondary && !damageContext.primaryExplosion) || !!damageContext.buildChain },damageContext);
    // 连锁击杀：同一次爆炸内击杀 >= 3 名敌人（用于「连锁反应」成就）
    const killsBefore = this.run ? (this.run.kills | 0) : 0;
    for (const e of this.hitboxes) {
      if (!e.alive || e.team === team) continue;
      const d = Math.hypot(e.x - x, e.z - z);
      const er = e.r ?? e.radius ?? 0.5;
      if (d > radius + er) continue;
      const falloff = 1 - Math.min(1, d / (radius + er)) * 0.65;
      const dir = { x: (e.x - x) / (d || 1), z: (e.z - z) / (d || 1) };
      // 爆炸是"绕开盾牌"的正解：无视正面格挡。
      this.onDamage(e, damage * falloff, { ...damageContext, owner, crit: false, dir, statuses, knock: damageContext.knock??2.2, source: 'explosion', ignoreShield: true });
    }
    if (this.run) {
      const dk = (this.run.kills | 0) - killsBefore;
      if (dk >= 3 && (actor||!this.actors)) this._blastKills = Math.max(this._blastKills | 0, dk);
    }
    // 破坏周围可破坏物
    if (typeof this.roomScene?.destroyProp === 'function') {
      const props = this.roomScene.props.slice();
      for (const p of props) {
        if (p.hp === undefined || p.explosive) continue;
        const d = Math.hypot(p.worldX - x, p.worldZ - z);
        if (d < radius + 0.6) {
          p.hp -= damage * 1.6;
          if (p.hp <= 0) this.roomScene.destroyProp(p);
        }
      }
    }
  }

  explodeVisual(x, y, z, radius, color) {
    this.particles.explosion(x, y, z, radius * 0.35, color);
    this.flashSmall(x, y, z, color, radius * 3.4, 0.2);
  }

  spawnAfterimage(x, z, yaw) {
    const a = this.afterimages;
    const it = a.list[a.head];
    a.head = (a.head + 1) % a.list.length;
    it.mesh.visible = true;
    it.mesh.position.set(x, 0.85, z);
    it.mesh.rotation.y = yaw;   // 方盒对称，仅与全局朝向约定保持一致
    it.life = 0.26;
    it.mesh.material.opacity = 0.45;
  }

  // 兜底：任何一处 NaN 传进来都会让 shakeAmt 永久 NaN（相机抖动彻底失效且不报错）。
  // 与其指望每个调用点都传对，不如在这里挡一次。
  shake(n) { if (!Number.isFinite(n) || n <= 0) return; this.shakeAmt = Math.min(1.1, this.shakeAmt + n); }
  damageFlash(n) { if (!Number.isFinite(n) || n <= 0) return; this.hurt = Math.min(1.0, this.hurt + n); }
  flashSmall(x, y, z, color, intensity, dur) { this.flashLights.flash(x, y, z, color, intensity, dur); }

  chargeFx(player, k) {
    if (!this._chargeFx) {
      this._chargeFx = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 1), new THREE.MeshBasicMaterial({ color: 0xffd06a, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
      this.scene.add(this._chargeFx);
    }
    if (!this._chargeWp) this._chargeWp = new THREE.Vector3();
    const wp = this._chargeWp;
    const mz = player.gunModel?.userData?.muzzle || player.rig.weaponMount;
    mz.getWorldPosition(wp);
    this._chargeFx.visible = true;
    this._chargeFx.position.copy(wp);
    this._chargeFx.scale.setScalar(0.4 + k * 1.9);
    this._chargeFx.material.opacity = 0.35 + k * 0.6;
    player.rig.weaponMount.position.z = -k * 0.12;
  }
  clearChargeFx() {
    if (this._chargeFx) { this._chargeFx.visible = false; this._chargeFx.scale.setScalar(1); }
    if (this.player) this.player.rig.weaponMount.position.z *= 0.8;
  }
  spinFx(rig, spin) {
    const g = rig.weaponMount.children[0];
    if (g && g.userData && g.userData.spin) g.userData.spin.rotation.z += spin * 0.55;
  }

  // ================= 随机池 =================
  coinMul() { return 1; }
  rollWeaponId(minBoost = 0) {
    const rng = this.rng;
    const minT = this.floor === 1 ? 1 : 2;
    const pool = WEAPONS.filter((w) => w.tier >= minT && w.tier <= (this.floor === 1 ? 3 : 4));
    return pickWeaponByFamily(rng,pool,minBoost);
  }
  rollItemId(exclude = []) {
    const blocked = new Set([...(this.player?.items || []), ...exclude]);
    const pool = ITEMS.filter(i => i.rarity <= (this.floor === 1 ? 3 : 4) && !blocked.has(i.id));
    return pool.length ? this.rng.pick(pool) : null;
  }
  rollActiveId() { return this.rng.pick(ACTIVES); }

  // ================= 流程 =================
  toTitle() {
    if (this.state === 'play' && !this.saveProgress(false)) return false;
    this.state = 'title';
    this.paused = false;
    this.toggleMinimapBig(false);
    if (this.hud) { this.hud.closeHubPanel(); this.hud.closeChoice?.(); this.setBuild(false); this.hud.setHubMode(false); }
    this.hud.showScreen('screen-title');
    audio.playMusic('calm');
    if (!this._attractReady) this.ensureAttractScene();
    if (this.player) this.player.rig.group.visible = false;
    if (this.platform?.kind !== 'headless') document.getElementById('seed-text').textContent = seedToWords(this.seed);
    this.syncSaveUI();
  }

  startNewRun(seedWanted, opts = {}) {
    if(opts.stageScope&&!this._restoring)getStageProfile(opts.stageProfile||'compact');
    let comparisonStarted=false;
    if(PAGE_COMPARISON&&!this._restoring) {
      const seed=comparisonSeed(seedWanted,this.comparison);
      if(seed===null)return false;
      const candidate=comparisonMeta(meta.data),saved=saveStore.write(candidate,null);
      if(saved.committed!==true){this.toast('未开始对照',saved.error||'保存状态待确认','#ff6a3a','fail');if(saveStore.blocked)this.openStorageRecovery();return false;}
      meta.data=candidate;meta._dirty=false;meta._clearActive=false;
      this.experimentScheme=PAGE_COMPARISON;seedWanted=seed;opts={};comparisonStarted=true;
    }
    const actorConfig = this.resolveRunActorConfig(opts);
    this.hud.closeHubPanel(); this.hud.closeChoice?.(); this.setBuild(false);
    this.clearWorld();
    // This is a complete new/restored world, unlike a local runtime reset.
    this.weaponSerialAllocator=new WeaponSerialAllocator();
    this.roomStates=new Map();
    if (!this._restoring) {
      if (this.player?.rig) this.scene.remove(this.player.rig.group);
      replacePrimaryActor(this);
      this.weaponAssets = new WeaponAssetsRuntime(this.actorView());
    } else this._listeners.length = 0;
    this.comparison=null;
    const selectedHero = actorConfig.heroId;
    this.combatMode = PAGE_COMBAT_MODE === 'experimental' ? 'pass-d' : 'classic';
    if (PAGE_COMBAT_MODE === 'experimental') {
      this.experiment = newCombatState(actorConfig.scheme);
    } else this.experiment = selectedHero === 'foldshadow' ? newCombatState('foldshadow') : null;
    this.input?.setProfile?.(this.experiment ? 'experimental' : 'classic');
    this.consumables=this.experiment?Consumables.createState():null;this.consumablePurchases=[];
    this._restoreDungeon = this._restoring ? opts.restoreDungeon : null;
    if (!this._restoring&&!comparisonStarted) { meta._clearActive = false; saveStore.write(meta.data, null); }
    this.hud.closeHubPanel(); this.hud.closeChoice?.(); this._pendingChoice = null;
    audio.resume();
    this._attractReady = false;
    this.attract = false;
    this.attractT = 0;
    // 允许外部指定种子（"同 Seed + 同输入 → 同结果"的前提）。
    // 验收套件必须钉死种子，否则每次都跑在不同地牢上，通过数会随布局浮动，
    // 失败也无法复现 —— 这比"稳定地失败"更糟。
    this.seed = (seedWanted === undefined || seedWanted === null || seedWanted === '')
      ? randomSeed()
      : (Number(seedWanted) >>> 0);
    if (this.seed === 0) this.seed = 1;
    this.rng = new RNG(this.seed);          // 生成期随机（地牢布局 / 房间内容）
    // Gameplay RNG：与被消费节奏无关的独立流。
    // 与生成流分开，才能保证"同 Seed + 同输入 → 同结果"：
    // 生成流会被异步的房间构建消费，"什么时候消费"取决于玩家怎么走，
    // 混用会让暴击 / 扩散 / Boss 弹幕选择变成不可复现。
    this.grng = new RNG((this.seed ^ 0x9e3779b9) >>> 0);
    this.vt = 0;                            // visual RNG 的走时基准（非确定，纯装饰）
    this.floor = 1;
    this.transition = null;
    this.paused = false;
    this.setBuild(false);
    this.pendingSpawns = [];
    // 遥测按局重置。恢复旧档时随后会被 applyTelemetry 覆盖回存档值（见 session.js）。
    this.telReset();
    this.toggleMinimapBig(false);
    this.theme = FLOOR_THEME[1];
    this.run = this.freshRun();
    // 路线供给（Task5）：新局按大厅选定的路线建立供给账；恢复时由 continueRun 用存档覆盖。
    this.runId = newRunId();
    this.buildSupply = newRunSupply(this.runId, actorConfig.route);
    this._floor1CompletionDeferred = false;
    this._completionDeferred = null; this._stageBossPending = false;
    // 本局策略 + 一次复苏（Task6）：难度与是否允许复苏在这里冻结，之后不读改动过的 Meta。
    this.runPolicy = runPolicyFor(meta.difficulty, meta.data.revivalPref);
    this.revival = newRevivalState(this.runId, this.runPolicy.revivalAllowed);
    this.revivalPending = false;
    // 商店交易账本（Task5）：回执 + 每店版本随局走。
    this.shopTx = newShopJournal(this.runId);
    this._shopSeq = 0;
    this.resetAchievementTracking();
    this._knownSyn = new Set();
    this._seenTip = new Set();
    this.mode = 'run';
    this.hubScene = null;
    // World challenge/difficulty applies once; personal construction uses the
    // same real Player and fixed actor context in browser and headless paths.
    this.applyModifier(this._restoring ? opts.restoreModifier : meta.sel.modifier);
    this.initializeRunActor(actorConfig);
    if (!this._restoring) { meta.data.stats.runs++; meta.mark(); }
    // 练习模式（任务书第十四节）：从已抵达的楼层直接开始。
    // 不算标准 Victory，奖励降低 —— 既满足"选关"，又不破坏标准 Run 的成长结构。
    const startFloor = (opts && opts.practice) ? Math.max(1, Math.min(3, opts.practice | 0)) : 1;
    // Boss Practice（§25）：直接从第三层开始、强制指定首领，且不产生任何正式收益。
    // 与"选层练习"共用同一套 practice 门控（不计标准胜利），额外再屏蔽 Boss 击杀与图鉴战胜。
    this.bossPractice = (opts && opts.bossPractice && Object.hasOwn(BOSS_MAP, opts.bossPractice))
      ? opts.bossPractice : null;
    this.practice = startFloor > 1 || !!this.bossPractice;
    // 首领身份：新局由 Seed 决定（同一 Seed 永远同一个首领）。恢复存档时由 continueRun 覆盖。
    this.bossType = this.bossPractice || bossTypeFor(this.seed, 3);
    // 章节五段流程（Task7/8）：新局走 buildStage(第一章第一段)；旧三层流程完全不变。
    if (opts.stageScope && !this._restoring) {
      this.flowVersion = 2;
      const profile=getStageProfile(opts.stageProfile||'compact');
      this.stageRun = { campaignScope: opts.stageScope === 'full3' ? 'full3' : 'chapter1', contentVersion: profile.contentVersion, ...(profile.contentVersion>=2?{profile:profile.id}:{}), milestones: {}, rewards: {}, pendingReward: null };
      this.bossType = profile.contentVersion===3?chapterBossTypeFor(this.seed,1):CHAPTER_BOSS[1];
      this.buildStage(newStageContext(this.seed, this.stageRun.campaignScope, 1, 1,profile.id));
    } else if (this._restoring && opts.restoreStage) {
      this.flowVersion = 2;
      this.stage = opts.restoreStage;
      this.stageRun = opts.restoreStageRun || { campaignScope: this.stage.campaignScope, contentVersion: this.stage.contentVersion, milestones: {}, rewards: {}, pendingReward: null };
      this.bossType = this.stage.contentVersion===3?chapterBossTypeFor(this.seed,this.stage.chapter):(CHAPTER_BOSS[this.stage.chapter] || DEFAULT_BOSS_TYPE);
      this.buildStage(this.stage);
    } else {
      this.flowVersion = 1; this.stage = null; this.stageRun = null;
      this.buildFloor(startFloor);
    }
    // Boss Practice：直接把玩家放进首领房，而不是让他再走一遍整层
    // （练习入口的目的是"反复打这个首领"，跑图属于纯摩擦）。
    if (this.bossPractice) {
      const br = this.dungeon.list.find((r) => r.type === 'boss');
      if (br) this.buildRoom(br, null, { keepPos: false });
      const bd = bossDef(this.bossPractice);
      this.toast('首领练习', `${bd.cn} · 不计通关、不发奖励、不记图鉴`, '#8af0ff', 'story');
    } else if (this.practice) this.toast('练习模式', `从第 ${startFloor} 层开始 · 单局练习，不计入通关记录`, '#ffd24a', 'story');
    this.applyTheme();
    // **必须显式退出大厅 HUD 模式。**
    // index.html 里有 `#hud.hub #minimap,#floor-info,#bossbar,#room-banner{display:none}`，
    // 而 setHubMode(true) 只在 enterHub() 里调用过、从来没有人把它关掉 ——
    // 于是"标题 → 大厅 → 出征"这条正常流程下，整局的小地图 / 楼层信息 / Boss 血条 / 房间横幅
    // 全部被 CSS 隐藏（玩家实测反馈："游玩全程完全没有小地图"）。
    this.hud.setHubMode(false);
    this.hud.setWorldLabels([]);        // 清掉大厅的训练靶标签，别带进地牢
    this.state = 'play';
    this.paused = false;
    this.hud.hideScreens();
    this.hud.resetRun();
    this.hud.centerMessage(this.theme.name, this.theme.sub, 2.6);
    audio.playMusic('keep');
    this.toast('沉钟回廊', '第一层 · 找到通往更深处的阶梯', '#5fe0ff', 'story');
    this.tip('move', 'WASD 移动 · 鼠标瞄准 · 左键射击');
    if(!this._restoring&&this.hero.ruleVersion===3&&this.hero.id==='veteran')openDoctrines(this.actorView());
    if (!this._restoring) {
      if(PAGE_COMBAT_MODE === 'experimental' && this.experiment) {try{seedConsumableSamples(this);}catch(error){this.toast('实验样品',error.message,'#ffcf6a','fail');}}
      if(PAGE_COMPARISON)this.comparison=createComparisonFixture(this);
      this.saveProgress(false);
    }
  }

  // ---------------- 轻量情境教学（只在第一次遇到时出现）----------------
  // 触发点是"玩家第一次真正需要这个信息"的时刻，而不是一上来倒一大段操作说明。
  tip(key, text) {
    if (!this._seenTip) this._seenTip = new Set();
    if (this._seenTip.has(key)) return;
    this._seenTip.add(key);
    this.hud.tip(text);
  }

  // 每帧评估一次：把教学提示挂到真实游戏事件上（进入封锁房 / 靠近可交互物 /
  // 拿到第二把武器 / 拿到主动技能 / 下到第二层）。
  // 之前 tip() 只被开局那一次调用，等于整套教学系统是死的。
  updateTips(dt) {
    const p = this.player;
    if (!p || this.state !== 'play') return;
    this._tipT = (this._tipT || 0) + dt;
    if (this._tipT < 0.25) return;
    this._tipT = 0;

    // 职业能力：**一进局就讲**，而且要说明"它是干什么的"。
    // 玩家实测反馈："我都不知道我自己还有一个什么技能，按了 C 才发现，
    // 但也不知道有什么用" —— 只报按键名不够，必须带上这个职业的动词/天赋。
    if (p.hero && p.hero.skillName) {
      const what = (p.hero.verb || p.hero.talent || '').split('：')[0];
      this.tip('heroSkill', `${controlLabel(this.input, this.experiment ? 'skill_3' : p.hero.skillInput === 'dodge' ? 'dodge' : 'hero_skill')} = 职业能力「${p.hero.skillName}」· ${what}`);
    }
    if (this.room && !this.room.cleared && this.aliveEnemyCount() > 0) {
      this.tip('dash', '右键 / 空格 冲刺翻滚 · 翻滚期间无敌，可穿过弹幕');
    }
    if (p.weapons.length > 1) {
      this.tip('swap', `${p.weaponSlots() >= 3 ? '1 / 2 / 3' : '1 / 2'} / Q / 滚轮 切换武器`);
    }
    if (p.actives.length > 0) {
      this.tip('active', 'F 释放主动技能 · 与 C 的职业能力是两回事，两者可以同时用');
    }
    // 改装：捡到配件的那一刻就把"怎么装"讲清楚（这是玩家实测"走不通"的那一步）
    if ((p.spareAttachments || []).length > 0) {
      this.tip('attach', 'TAB 打开构筑面板 · 点备用配件装到当前枪上，点枪上的徽记可拆下（也能按数字键）');
    }
    if (p.items.length > 0 || p.stats.synergies.length > 0) {
      this.tip('build', 'TAB 查看本局构筑（武器 / 遗物 / 协同）');
    }
    if (this.actorCount===1 && this.roomScene && !this._tipTouched && this.nearestInteractable()) {
      this._tipTouched = true;
      this.tip('interact', '使用交互动作 · 开箱 / 交易 / 下楼');
    }
    if (this.floor >= 2) {
      this.tip('map', '打开大地图查看房间；橙色方块代表尚未清理的房间');
    }
  }

  clearWorld({keepCompanion=false}={}) {
    invalidateActorCallbacks(this);
    for(const actor of this.actors?orderedActors(this):[{view:this,slot:0}]){
      const v=actor.view;if(v.experiment?.fold)clearFoldRoom(v);
      v.foldVisuals?.dispose();v.foldVisuals=null;v.weaponAssets?.reset?.();
      if(actor.slot!==0){v.companion?.dispose();v.companion=null;if(v.player?.rig)this.scene.remove(v.player.rig.group);actor.input?.dispose?.();}
    }
    this.clearDamageFeedback();this.weaponAssetFX?.clear();
    this.cancelLifecycleTimers();
    this.resetTimeScales();
    for (const e of this.enemies) e.remove();
    this.enemies.length = 0;
    if (this.boss) { this.boss.remove(); this.boss = null; }
    if (this.companion&&!keepCompanion) { this.companion.dispose(); this.companion = null; }
    this.disposeConnectors();
    this.portals = [];
    this.disposeFloorScenes();
    if (this.roomScene) { this.roomScene.dispose(); this.roomScene = null; }
    this.projectiles.reset();
    this.pickups.clear();
    this.hazards.clear();
    this.particles.clear();
    this.debris.clear();
    this.decals.clear();
    this.flashLights.reset();
    this.roomLights.clear();
    for (const a of this.afterimages.list) { a.life = 0; a.mesh.visible = false; }
    if (this._turrets) { for (const t of this._turrets) this.scene.remove(t.g); this._turrets.length = 0; }
    if (this._drones) { for (const d of this._drones) this.scene.remove(d.g); this._drones.length = 0; }
    if (this.platform?.kind !== 'headless') document.getElementById('popups').innerHTML = '';
  }

  buildFloor(floor) {
    if(this.floor!==floor)for(const a of orderedActors(this))resetConsumableFloor(a.view);
    this.resetTimeScales();
    this.disposeFloorScenes();
    this.roomStates = new Map();
    this.pendingLoot = [];
    // 遥测：记录进入本层时的 HP（用于"进层→离层"资源曲线，§30）
    if (this.tel && this.tel.hpIn && this.player) this.tel.hpIn[floor] = this.player.hp;
    // 每层的网格是独立生成的，原点与预热记录都必须重置
    this._origin = null;
    this._pitch = 0;                 // 格距按层缓存，换层必须重算
    this._prewarmed = new Set();
    this._prewarmQueue = [];
    this.dropPreview();
    this.disposeConnectors();
    this.floor = floor;
    if (!this._restoring && !this.attract) meta.noteReach(floor);
    this.transition = null;
    this._doorsLocked = null;
    this.hitStopT = 0;
    this.theme = FLOOR_THEME[floor];
    this.dungeon = this._restoring && this._restoreDungeon?.floor === floor ? restoreDungeon(this._restoreDungeon) : generateDungeon(this.seed, floor);
    this.run.floor = floor;
    for (const r of this.dungeon.list) { r.discovered = false; r.visited = false; r.cleared = r.type === 'start'; }
    const start = this.dungeon.rooms.get(this.dungeon.startId);
    this.room = start;
    if (this.experiment?.fold) clearFoldRoom(this);
    start.cleared = true;
    this.warmFloorAssets(floor);
    this.warmRoomTypeCaches();
    this.warmActorCaches(floor);
    this.buildRoom(start, null);
  }

  // ================= 章节五段流程（Task7/8）=================
  // 阶段地牢由纯生成器给出；房间内容/门/坐标与旧流程同构，因此 RoomScene 无需改动。
  buildStage(context, opts = {}) {
    for(const a of orderedActors(this))resetConsumableFloor(a.view);
    const def = getStageDefinition(context.chapter, context.segment);
    if (!def) throw new Error('未知阶段');
    this.resetTimeScales();
    this.disposeFloorScenes();
    this.roomStates = new Map();
    this.pendingLoot = [];
    if (this.tel && this.tel.hpIn && this.player) this.tel.hpIn[context.themeId] = this.player.hp;
    this._origin = null; this._pitch = 0;
    this._prewarmed = new Set(); this._prewarmQueue = [];
    this.dropPreview();
    this.disposeConnectors();
    this.flowVersion = 2;
    this.stage = context;
    this.floor = context.themeId;              // 兼容投影：主题 / 遥测 / 房间构建都按 floor 取色
    this.transition = null; this._doorsLocked = null; this.hitStopT = 0;
    this.theme = FLOOR_THEME[context.themeId];
    const restoringStage = this._restoring && this._restoreDungeon?.stageKey === context.stageKey;
    this.dungeon = restoringStage ? restoreDungeon(this._restoreDungeon) : generateStageDungeon(context);
    this.dungeon.flowVersion = 2; this.dungeon.stageKey = context.stageKey; this.dungeon.themeId = context.themeId;
    this.run.floor = context.themeId;
    for (const r of this.dungeon.list) { r.discovered = false; r.visited = false; r.cleared = r.type === 'start'; }
    const start = this.dungeon.rooms.get(this.dungeon.startId);
    this.room = start; start.cleared = true;
    if (this.experiment?.fold) clearFoldRoom(this);
    if (!this._restoring && !this.attract) meta.noteReach(context.themeId);
    this.markStage(context.stageKey, 'entered');
    this.warmFloorAssets(context.themeId);
    this.warmRoomTypeCaches();
    this.warmActorCaches(context.themeId);
    this.buildRoom(start, null, opts);
    observeResource(this,'stage-enter',{},null,'enter:'+context.stageKey);
  }

  // 阶段里程碑账本：稳定键，随档保存；重复进入/恢复不重复计数。
  ensureStageRun() {
    this.stageRun ||= { campaignScope: this.stage?.campaignScope||'chapter1', contentVersion: this.stage?.contentVersion||STAGE_CONTENT_VERSION, ...(this.stage?.profile?{profile:this.stage.profile}:{}), milestones: {}, rewards: {}, pendingReward: null };
    return this.stageRun;
  }
  markStage(stageKey, kind) {
    const run = this.ensureStageRun();
    const cur = run.milestones[stageKey] || {};
    if (cur[kind]) return false;
    run.milestones[stageKey] = { ...cur, [kind]: true };
    return true;
  }
  stageCleared(stageKey, kind = 'cleared') { return !!this.stageRun?.milestones?.[stageKey]?.[kind]; }

  // HUD 楼层条：章节流程显示"第 X 章 · 第 Y 段 · 主题 · 职责"。
  stageBanner() {
    if (this.flowVersion !== 2 || !this.stage) return null;
    const def = getStageDefinition(this.stage.chapter, this.stage.segment);
    const th = FLOOR_THEME[this.stage.themeId];
    const sub=this.stage.contentVersion>=2?`${th.name} · ${getStageProfile(this.stage.profile).label} · ${this.dungeon.list.length} 间房`:`${th.name} · ${def ? def.role : ''}`;
    return { name: `第 ${this.stage.chapter} 章 · 第 ${this.stage.segment} 段`, sub };
  }

  // 大厅入口：开始一次章节远征（chapter1 = 单章原型；full3 = 三章候选）。
  startStageRun(scope = 'chapter1',profile = 'compact') { getStageProfile(profile);return this.startNewRun(undefined, { stageScope: scope,stageProfile:profile }); }

  stageRunPanel() {
    const H = this.hud;
    H.hubPanel({
      title: '选择远征模式',
      sub: '选择适合自己的地图与流程。',
      rows: [
        {cn:'标准远征',desc:'三章十五层 · 每层15间大房间 · 推荐',scope:'full3',profile:'standard'},
        {cn:'小房间远征',desc:'三章十五层 · 每层15间房 · 更多紧凑战场',scope:'full3',profile:'portable'},
        {cn:'经典三层',desc:'熟悉的三层地牢与大房间',classic:true},
        {cn:'返回',desc:'返回出征准备'},
      ],
      onPick:r=>{H.closeHubPanel();if(r.classic)return this.requestExpedition();if(r.scope)return this.requestExpedition(0,null,{scope:r.scope,profile:r.profile});this.useHub('readout');},
    });
  }

  // 敌人 / 武器模型预热：第一次遇到某种敌人、第一次拿到某把枪时不再现建网格。
  warmActorCaches(floor) {    const pool = POOL_BY_FLOOR[floor] || POOL_BY_FLOOR[1];
    for (const k of pool) {
      try { const e = new Enemy(this, k, 0, 0, {}); e.remove(); } catch (err) { /* 忽略 */ }
    }
    for (const w of WEAPONS) {
      if (w.tier > (floor === 1 ? 3 : 4)) continue;
      try { buildGunModel(w.model); } catch (err) { /* 忽略 */ }
    }
  }

  // 开局/下楼一次构建整层静态场景并保留；动态战斗只在当前房推进。
  // 每房独立 room.seed，回房复用同一场景与纯数据快照。
  warmRoomTypeCaches() {
    if (!this.dungeon || !this.dungeon.list) return;
    const prevWarming = this._warming, prevRoom = this.room, prevAttract = this.attract;
    this._warming = true;
    this.attract = true;
    for (const r of this.dungeon.list) {
      const off = this.roomOffset(r);
      const rs = new RoomScene(this, r, off.ox, off.oz);
      rs.setDoorsOpen(true);
      this._residentRooms.set(r.uid, rs);
      this._prewarmed.add(r.uid);
    }
    this._warming = prevWarming;
    this.room = prevRoom;
    this.attract = prevAttract;
    // 每条无向边只建一份走廊，战斗锁门只影响激活和通行，不拆几何。
    for (const r of this.dungeon.list) {
      for (const d of DIRS) {
        const nb = this.dungeon.get(r.gx + d.dx, r.gy + d.dy);
        if (!nb || (!r.doors[d.k] && !(r.secretWallDirs || []).some(s => s.dir === d.k))) continue;
        const key = [r.uid, nb.uid].sort().join('|');
        if (this._residentConnectors.has(key)) continue;
        const a = this.roomOffset(r), b = this.roomOffset(nb), axis = d.dx ? 'x' : 'z';
        // 大小房相接时，中心是两道面对面外墙的中点，不是房间中心的中点。
        const shift = (r.radius - nb.radius) / 2;
        const conn = new ConnectorScene(this, { axis, ox: (a.ox + b.ox) / 2 + d.dx * shift, oz: (a.oz + b.oz) / 2 + d.dy * shift,
          len: Math.max(4, (axis === 'x' ? Math.abs(b.ox - a.ox) : Math.abs(b.oz - a.oz)) - r.radius - nb.radius),
          floor: this.floor, rngSeed: (r.seed ^ nb.seed) >>> 0 });
        conn.hiddenUid = r.type === 'hidden' ? r.uid : nb.type === 'hidden' ? nb.uid : null;
        this._residentConnectors.set(key, conn);
      }
    }
    this.syncSecretVisibility();
  }

  hiddenRoomRevealed(room) {
    if (room.type !== 'hidden' || room.visited) return true;
    return (room.secretWallDirs || []).some(d => {
      const parent = this.dungeon.rooms.get(d.from);
      return d.isEntry && !!this._residentRooms.get(parent?.uid)?.secretOpen.has(DIR_MAP[d.dir].opp);
    });
  }

  syncSecretVisibility() {
    for (const sc of this._residentRooms.values()) {
      if (sc.room.type === 'hidden') { const revealed = this.hiddenRoomRevealed(sc.room); sc.group.visible = revealed; sc.room.discovered = revealed; }
      for (const [dir, frame] of Object.entries(sc.secretFrames || {})) frame.visible = sc.secretOpen.has(dir);
    }
    for (const conn of this._residentConnectors.values()) if (conn.hiddenUid) conn.group.visible = this.hiddenRoomRevealed(this._residentRooms.get(conn.hiddenUid).room);
  }

  disposeFloorScenes() {
    const old = this.roomScene;
    for (const sc of this._residentRooms?.values() || []) sc.dispose();
    if (old && [...(this._residentRooms?.values() || [])].includes(old)) this.roomScene = null;
    for (const sc of this._residentConnectors?.values() || []) sc.dispose();
    this._residentRooms = new Map(); this._residentConnectors = new Map();
    this.connectors = {}; this.previewScene = null; this.previewRoom = null;
  }

  // 楼层级资源预热 —— 在玩家还没踏进房门之前就把该层会用到的
  // 地板 / 墙体平铺材质全部烘焙好，避免"第一次进某类房间"才现做而产生掉帧尖峰。
  warmFloorAssets(floor) {
    const names = floor === 3
      ? ['floor_ritual', 'floor_obsidian', 'floor_throne']
      : floor === 2
        ? ['floor_ritual', 'floor_obsidian', 'floor_basalt', 'floor_moss']
        : ['floor_ritual', 'floor_stone', 'floor_moss', 'floor_metal'];
    const walls = floor === 3 ? ['wall_throne', 'wall_throne_carved']
      : floor === 2 ? ['wall_abyss', 'wall_abyss_carved']
        : ['wall_brick', 'wall_carved'];
    const rooms = this.dungeon && this.dungeon.list && this.dungeon.list.length ? this.dungeon.list : [this.room];
    const rep = Math.round(((rooms[0] && rooms[0].radius ? rooms[0].radius : 12) * 2 + 0.6) / (TILE * 2));
    for (const n of names) getTiledMaterial(n, this.rng, rep, rep, { roughness: 0.94, metalness: 0.02 });
    for (const n of walls) getTiledMaterial(n, this.rng, 1, 2, { roughness: 0.92, metalness: 0.03 });
    // 走廊地板（buildDoors 使用 4 × round(len/4)）
    for (const n of names) getTiledMaterial(n, this.rng, 4, 3, { roughness: 0.95 });
  }

  buildRoom(room, entryDir, opts = {}) {
    // 防御：room 为空时直接返回，避免 RoomScene 里 room.seed 取值抛异常
    // 把一个"传参错误"放大成整个游戏卡死。
    if (!room) return false;
    beginRoomDiagnostic(this, room, entryDir, opts);
    const sameRoom = this.room === room;
    if(!sameRoom)for(const a of orderedActors(this))if(a.experiment?.fold)clearFoldRoom(a.view);
    // A prewarmed room with the same UID does not make the currently displayed
    // HubScene (or an old floor's scene) that resident instance.
    if (this.roomScene && this._residentRooms.get(this.room?.uid) === this.roomScene && this.roomScene.room === this.room && !this._restoringRoom) {
      this.roomStates.set(this.room.uid, this.actorCount===2?{...captureRoomWorld(this),actorRuntimes:Object.fromEntries(orderedActors(this).map(a=>[a.playerId,a.weaponAssets.capture()]))}:captureRoom(this));
      this.roomScene.setDoorsOpen(true);
    }
    this.disposeConnectors();
    // 目的地房间预览到此为止：接下来会以"正式房间"的身份重建它（灯光 / 敌人 / 拾取都在那次构建里）。
    // 必须先拆掉，否则同一间房会同时存在两份几何。
    this.dropPreview();
    // 换房时必须清掉上一间房的掉落与动态危险区。
    // 所有房间都构建在原点、共用同一套世界坐标，所以残留物会**原样出现在新房间里**；
    // 商店货架上的物品（shopSlot）更是永远捡不起来，会一直占着拾取列表。
    // 旧实现只在 clearWorld()（开局 / 下楼）里清理，穿门这条路漏掉了。
    const roomChanged = this.room && this.room !== room;
    if (roomChanged) clearRoomDynamics(this);
    if (roomChanged) this.room = room;
    if (this.roomScene && this._residentRooms.get(this.roomScene.room?.uid) !== this.roomScene) this.roomScene.dispose();
    this.clearEnemies();
    const off = this.roomOffset(room);
    // 无伤清房判定：记录进入本房时的累计受伤量，清房时比较
    for(const actor of orderedActors(this)){
      actor.view._dmgAtRoomStart=this.actorCount>1?Object.values(actor.tel?.dmgBy||{}).reduce((n,v)=>n+v,0):(this.run.dmgTaken??0);
      if(room.type==='boss'&&actor.player)actor.player._bossHitCount=0;
    }
    try {
      this.roomScene = this._residentRooms.get(room.uid) || new RoomScene(this, room, off.ox, off.oz);
      this.roomScene.buildLights();
    } catch (error) { recordRoomDiagnostic(this, 'error', { message: `scene-load: ${error.message}` }); throw error; }
    // Portal 是"门"的唯一语义真源：走廊生成 / 可行走并集 / 换房判定 / 战斗锁门 全部从它读
    this.portals = buildPortals(this, room, this.roomScene);
    this.room = room;
    room.visited = true;
    room.discovered = true;
    this.discoverNeighbors(room);
    if (!this._restoringRoom) { this.run.rooms++; if (this.tel) this.tel.rooms++; }
    // ---- 玩家位置 ----
    // entryDir 表示"玩家是从该方向的门进入本房间的"：
    //   从东门进入 → 出现在房间西侧；西门 → 东侧；北门 → 南侧；南门 → 北侧。
    // 位置由 RoomScene.entryPoint() 给出，保证在房间内部且不压在墙/机关/危险地板上。
    if (this.player && !this._restoringRoom) {
      if (opts.keepPos) {
        // 从走廊走进来：玩家的世界坐标**本来就是对的**，一个像素都不用挪。
        // 这正是"无缝"的含义 —— 没有坐标跳变，也就没有瞬时感。
        this.player.iframes = Math.max(this.player.iframes, 0.5);
        this.room.lockGrace = 0.45;      // 先让人完整进房，再触发战斗锁门（3.4）
        this.camAnchor = { x: this.player.x * 0.4, z: this.player.z * 0.4 - 1.5 };
        this.lastEntry = { roomId: room.id, dir: entryDir || null, x: this.player.x, z: this.player.z };
      } else if (entryDir) {
        const pt = this.roomScene.entryPoint(entryDir);
        this.player.x = pt.x; this.player.z = pt.z;
      } else if (room.isStart) {
        this.player.x = off.ox; this.player.z = off.oz + 3.0;
      } else if (!sameRoom) {
        const pt = this.roomScene.entryPoint('s');   // 兜底：南侧安全点
        this.player.x = pt.x; this.player.z = pt.z;
      }
      this.player.vx = 0; this.player.vz = 0;
      this.player.iframes = Math.max(this.player.iframes, 0.35);   // 进门短暂无敌，避免出生即被秒
      this.camPos.set(this.player.x, 30, this.player.z + 21);
      this.camAnchor = { x: this.player.x * 0.4, z: this.player.z * 0.4 - 1.5 };
      this.lastEntry = { roomId: room.id, dir: entryDir || null, x: this.player.x, z: this.player.z };
    }
    // 内容
    if (!this.attract) {
      try {
        if (this.roomStates.has(room.uid)) applyRoom(this, this.roomStates.get(room.uid));
        else this.spawnRoomContent(room);
      } catch (error) { recordRoomDiagnostic(this, 'error', { message: `content-load: ${error.message}` }); throw error; }
    }
    if(this.actorCount===2&&!this._restoringRoom){
      for(const a of orderedActors(this)){
        const p=a.player;
        if(a.slot!==0){const pt=entryDir?this.roomScene.entryPoint(entryDir):{x:off.ox,z:off.oz+3};p.x=pt.x;p.z=pt.z;p.vx=p.vz=0;p.iframes=Math.max(p.iframes,.5);}
        if(a.companion){a.companion.x=p.x;a.companion.z=p.z;}
        if(a.companion?.growth)petRoomEnter(a.companion,a.view);
        a.view.emit('onRoomEnter',{room});
      }
    }
    if(this.hero?.ruleVersion===3){
      if(this.actorCount!==2&&this.companion?.growth)petRoomEnter(this.companion,this);
      if(this.enemies.some(e=>e.alive&&!e.dummy&&!e.fromSummon)||this.boss?.alive)room.c2CombatStarted=true;
    }
    this._doorsLocked = null;
    this.syncDoorLocks();
    this.updateConnectors(0);
    this.decals.clear();
    // 楼层氛围
    let track = this.floor === 1 ? 'keep' : 'abyss';
    if (room.type === 'shop' || room.type === 'treasure' || room.type === 'special') track = 'calm';
    if (room.type === 'boss' && !room.cleared) track = 'boss';
    audio.playMusic(track);
    this.spawnAmbientDust();
    return true;
  }

  discoverNeighbors(r) {
    if (r.type === 'hidden') return;
    for (const d of DIRS) {
      if (!r.doors[d.k]) continue;
      const n = this.dungeon.get(r.gx + d.dx, r.gy + d.dy);
      if (n && n.type !== 'hidden') n.discovered = true;
    }
  }

  // 打击顿帧：极短暂冻结世界（0.06 倍速），只用于高价值命中
  hitStop(t) { this.hitStopT = Math.max(this.hitStopT || 0, t); }

  clearEnemies() {
    if (this.worldBars) this.worldBars.clear();
    for (const e of this.enemies) e.remove();
    this.enemies.length = 0;
    // Boss 独立于 enemies 数组：必须显式移除模型再置空，
    // 否则存活中的 Boss 会留下"幽灵模型"（房间重建后无实体但看得见）。
    if (this.boss) { this.boss.remove(); this.boss = null; }
  }

  spawnRoomContent(room) {
    const c = room.content || {};
    const scene = this.roomScene;
    // 敌人
    if (this.stage?.contentVersion===3 && !room.cleared && c.enemies?.length) {
      if(!room.chapterWaves)room.chapterWaves=createChapterWaveState([{enemies:c.enemies,delay:1.6,elite:c.elite,eliteIndices:c.eliteIndices},...(c.waves||[])]);
      this.advanceChapterWaves();
      if(c.encounterKind==='horde'||c.encounterKind==='explosive')this.hud.centerMessage(c.encounterKind==='horde'?'密集攻势':'爆破阵列',c.waves?.length?'清理一波后迎接下一波':c.encounterKind==='explosive'?'小心敌人自爆':'留意周围的敌人',3);
    } else if (room.type!=='exit' && !room.cleared && c.enemies && c.enemies.length) {
      const spots = scene.enemySpots || [];
      const forceElite = !!c.elite;
      c.enemies.forEach((kind, i) => {
        // 兜底落点同样必须是**世界坐标**（enemySpots 现在也是世界坐标）
        const sp = spots[i] || { x: scene.ox + scene.inner * 0.4 * (this.gr() < 0.5 ? -1 : 1), z: scene.oz + scene.inner * 0.4 };   // 敌人落点：gameplay 随机
        const elite = (forceElite || this.rng.chance(this.eliteRollChance())) && !kind.includes('small');
        this.spawnEnemy(kind, sp.x, sp.z, { elite, fromSummon:false });
      });
    }
    // Encounter Director（PASS2 §19）：延迟增援波。
    // 只有少数房间有（原型里的 wave.chance），每间房**只排一次**。
    // 落点用现有"危险区预警"表现（damage 0，不会真的伤人）——
    // 它天生就是"持续显示 + 延迟触发 + 可存档"，正好是增援预告需要的语义。
    if (room.type!=='exit' && this.stage?.contentVersion!==3 && !room.cleared && !room.wavesSpawned && (c.waves || []).length) {
      room.wavesSpawned = true;
      this.scheduleWaves(room, c.waves);
    }
    // Boss（身份由 Run Seed 决定；实体 id 仍然是 'boss'）
    if (room.type === 'boss' && !room.cleared) {
      // Boss 也必须用**世界坐标**生成（旧实现传的是房间局部坐标，
      // 靠 clampToRoom 的越界钳制被"救"回房间边缘 —— 位置是错的，只是不会报错）。
      const bt = this.bossType || DEFAULT_BOSS_TYPE;
      const bd = bossDef(bt);
      this.boss = createBoss(this, scene.ox, scene.oz - scene.inner * 0.35, bt);
      this.hud.centerMessage(bd.cn.split('').join(' '), bd.en, 3.0);
      audio.bossRoar();
      this.shake(0.8);
      this.setBossPhase(0);
      // "见过"即解锁该首领的练习入口（Boss Practice 专用局不写任何正式记录）
      if (!this.bossPractice){if(this.actorCount===2)this.metaSee('boss',bt);else meta.see('boss', bt);}
      if (this.tel) this.tel.boss = bt;
      this.telFirst('bossFight');
    }
    // 拾取物（首次进入）
    if (!room.looted) {
      room.looted = true;
      for (const sp of (scene.pickupSpots || [])) {
        this.pickups.spawn(sp.kind, sp.x, sp.z, { amount: sp.kind === 'coin' ? this.rng.int(3, 7) : 1, rewardSource:'room-pickup' });
      }
    }
    // 商店陈列
    if (room.type === 'shop') {
      if (!room.telShopCounted) { room.telShopCounted = true; if (this.tel) this.tel.shops++; }
      this.spawnShopSlots();
    }
  }

  advanceChapterWaves() {
    const room=this.room;
    if(this.stage?.contentVersion!==3||!room?.chapterWaves||room.cleared)return;
    const physical=this.pendingSpawns.filter(q=>q.room===room).length;
    tickChapterWaves(room.chapterWaves,{alive:this.enemies.filter(e=>e.alive).length,pending:physical,spawnWave:(wave,index)=>{
      const points=findChapterSpawnPoints({scene:this.roomScene,player:this.player,...(this.actorCount>1?{players:combatPlayers(this)}:{}),enemies:wave.enemies,count:wave.enemies.length,seed:room.seed+index});
      if(points.length!==wave.enemies.length)return false;
      for(let i=0;i<points.length;i++){
        const p=points[i],delay=wave.delay;
        this.hazards.add(p.x,p.z,1.1,delay,0,'#8ad8ff');
        this.spawnEnemy(wave.enemies[i],p.x,p.z,{delay,fromWave:true,fromSummon:false,elite:wave.elite||wave.eliteIndices.includes(i)});
      }
      this.hud.centerMessage(index?'下一波将至':'敌群将至',`第 ${index+1} 波 · ${points.length} 个敌人`,1.7);
      return true;
    }});
  }

  // 把当前商店货架摆到世界里（真实进房与"刷新库存"共用同一条路径）
  spawnShopSlots() {
    const scene = this.roomScene;
    if (!scene || !scene.shopSlots) return;
    if(this.partySessionStore&&!this._partyShops?.[this.room.uid]){if(!this._partyRewardQueue.some(q=>q.kind==='shop'&&q.roomUid===this.room.uid))this.partySessionStore.enqueueSource('shop',0,0,{},'shop');return;}
    // 首层首店（generation 0）为选定路线提供两条便宜捷径货架；只在**第一次**应用，
    // 之后进店/刷新都保持现场（供给账的 firstShopId 一旦写定就不再重发保底）。
    if (this.actorCount!==2 && this.buildSupply?.selectedRoute && !this.practice && this.floor === 1 && !this.buildSupply.firstShopId) {
      this.applyRouteFirstShop(scene);
    }
    for (const slot of scene.shopSlots) {
      this.pickups.removeAttachedTo(slot);
      if (slot.sold) continue;
      const it = slot.item;
      if (!it) continue;
      const id = it.id || it.kind;
      this.pickups.spawn(this.shopKind(it.kind), slot.x, slot.z, { ...it, id, y: slot.y, shopSlot: slot, price: it.price });
    }
  }

  applyRouteFirstShop(scene) {
    const content = this.room?.content;
    if (!content) return;
    const legacyStock = (scene.shopSlots || []).map((s) => ({ ...s.item }));
    if (legacyStock.length < 4 || legacyStock.length > 6) return;
    const extraStock = legacyStock.slice(4);
    let plan;
    try { plan = planFirstShopInventory(this, { roomId: this.room.uid, generation: 0, legacyStock: legacyStock.slice(0,4) }); }
    catch (err) { this.toast('路线商店无法生成', err.message, '#ff6a3a', 'fail'); return; }
    if (!plan.inventory) return;
    this.buildSupply = plan.supply;
    plan.inventory.forEach((offer, i) => {
      if (!scene.shopSlots[i]) return;
      scene.shopSlots[i].item = { ...offer.allocation };
      scene.shopSlots[i].sold = !!offer.sold;
      scene.shopSlots[i].supplyRef = offer.allocationId;
    });
    content.shopStock = [...plan.inventory.map((o) => ({ ...o.allocation })), ...extraStock];
    scene.shopStock = [...plan.inventory.map((o) => ({ ...o.allocation })), ...extraStock];
  }

  // ------------------------------------------------------------
  //  商店服务（PASS2 §29）—— 有次数上限的金币出口
  //  原子性：先判定（售罄 / 缺钱 / 弹满 / 满血），全部通过才扣费；
  //  任何一条不满足都**不扣费**，并把原因说清楚（不让玩家白花钱）。
  // ------------------------------------------------------------
  buyService(id, slot) {
    if (!SERVICE_MAP[id]) return;
    return this.purchaseShopOffer({ shopId: shopIdFor(this), revision: shopRevision(this.shopTx, shopIdFor(this)), offerId: `service:${id}`, requestId: this.nextShopRequestId() });
  }

  shopKind(kind) {
    if (kind === 'weapon') return 'weapon';
    if (kind === 'item') return 'item';
    if (kind === 'active') return 'active';
    return kind;
  }

  spawnEnemy(kind, x, z, opts = {}) {
    if (opts.delay) {
      // 延迟生成进入 **Pending Combat Spawn** 队列（帧驱动，不用 setTimeout）。
      // 两个理由：
      //   1) 确定性 —— setTimeout 不在 stepSim 的时间轴里，会让"同 Seed 同输入"失效；
      //   2) 状态正确 —— 房间在"仍有待生成敌人"时不允许判定为 cleared，
      //      否则会出现"门已开、奖励已发，敌人几秒后才冒出来"。
      this.pendingSpawns.push({
        room: this.room, t: opts.delay, kind, x, z,
        // fromWave 放在**条目顶层**（不进 opts）：opts 会被原样传给 Enemy 构造，
        // 而这个标记只属于"待生成队列"本身。
        fromWave: !!opts.fromWave,
        opts: { elite: opts.elite, angle: opts.angle, fromSummon: opts.fromSummon??!opts.fromWave },
      });
      this.room.pendingCombat = (this.room.pendingCombat || 0) + 1;
      return null;
    }
    const clamped = this.roomScene ? this.roomScene.clampToRoom(x, z, 1.4) : { x, z };
    let e;
    try { e = new Enemy(this, kind, clamped.x, clamped.z, opts); }
    catch (error) { recordRoomDiagnostic(this, 'error', { message: `spawn ${kind}: ${error.message}` }); throw error; }
    if(this.hero?.ruleVersion===3)e.fromSummon=opts.fromSummon??!opts.fromWave;
    this.enemies.push(e);
    if(this.stage?.contentVersion===3&&this.hero?.ruleVersion===3&&!this.room.c2CombatStarted&&!e.fromSummon){
      if(this.companion?.growth)petRoomEnter(this.companion,this);
      this.room.c2CombatStarted=true;
    }
    recordRoomDiagnostic(this, 'spawn', { kind });
    return e;
  }

  // 推进待生成敌人。房间变了 / 玩家不在地牢时直接丢弃（不会跨房间泄漏）。
  updatePendingSpawns(dt) {
    if (!this.pendingSpawns.length) return;
    for (let i = this.pendingSpawns.length - 1; i >= 0; i--) {
      const q = this.pendingSpawns[i];
      if (this.room !== q.room || this.state !== 'play') { this._dropPending(i); continue; }
      q.t -= dt;
      if (q.t > 0) continue;
      this._dropPending(i, true);
      this.spawnEnemy(q.kind, q.x, q.z, q.opts);
    }
  }

  _dropPending(i, spawns) {
    const q = this.pendingSpawns[i];
    this.pendingSpawns.splice(i, 1);
    if (q.room) q.room.pendingCombat = Math.max(0, (q.room.pendingCombat || 0) - 1);
    // 增援波被丢弃（换房 / 重开 / 清场）时把标记放回去，下次进房重新排 ——
    // 否则那一波会永久消失，房间会比设计的更好打（而玩家不会知道少打了什么）。
    if (q.fromWave && q.room && !q.room.cleared) q.room.wavesSpawned = false;
  }

  // ------------------------------------------------------------
  //  Encounter Director 的增援波（PASS2 §19）
  //
  //  设计约束：
  //   · 延迟生成走 pendingSpawns（帧驱动 / 可存档 / 已计入锁门），不能用 setTimeout
  //   · 必须有**可见预警**，而且**不能贴脸生成**
  //   · 只有少数房间有（原型决定），大多数房间保持"快进快打快出"
  // ------------------------------------------------------------
  scheduleWaves(room, waves) {
    const scene = this.roomScene;
    if (!scene || !waves || !waves.length) return;
    const p = this.player;
    let idx = 0;
    for (let wi = 0; wi < waves.length; wi++) {
      const w = waves[wi];
      const delay = Math.max(1.2, (w.delay || 1.6) + wi * 1.4);
      const n = w.enemies.length;
      for (let i = 0; i < n; i++, idx++) {
        // 落点由房间种子决定（不消费 RNG）：同 Seed 同房间的增援落点一致
        const a = (idx / Math.max(1, n)) * Math.PI * 2 + ((room.seed % 360) * Math.PI) / 180;
        const r = scene.inner * (0.40 + (idx % 3) * 0.13);
        let x = scene.ox + Math.cos(a) * r, z = scene.oz + Math.sin(a) * r;
        // 不贴脸：离玩家太近就换到对面
        if (p && Math.hypot(p.x - x, p.z - z) < 5.5) { x = scene.ox - Math.cos(a) * r; z = scene.oz - Math.sin(a) * r; }
        const pos = scene.clampToRoom(x, z, 1.4);
        // 预警环：复用危险区表现（damage 0 ⇒ 只做预告，不会真的伤人），
        // 它天然是"持续显示 + 延迟触发 + 可存档"，正是增援预告需要的语义。
        this.hazards.add(pos.x, pos.z, 1.5, delay, 0, '#8ad8ff');
        this.spawnEnemy(w.enemies[i], pos.x, pos.z, { delay, fromWave: true });
      }
    }
    if (idx > 0) {
      this.hud.centerMessage('增援将至', 'REINFORCEMENTS INBOUND', 1.7);
      this.toast('增援将至', '青色落点会冒出第二批敌人', '#8ad8ff', 'quick');
      audio.teleport();
    }
  }

  // 当前房间还有多少"属于本房战斗"的敌人在等待生成
  pendingInRoom(room = this.room) {
    if (!room) return 0;
    let n = 0;
    for (const q of this.pendingSpawns) if (q.room === room) n++;
    if(!room.cleared)n+=chapterWavesPending(room.chapterWaves);
    return n;
  }

  // 丢弃某房间（或全部）的待生成敌人
  dropPendingFor(room) {
    for (let i = this.pendingSpawns.length - 1; i >= 0; i--) {
      if (!room || this.pendingSpawns[i].room === room) this._dropPending(i);
    }
  }

  // ============================================================
  //  通用"3 选 1"（任务书 §41 / §52）
  //
  //  从池子里抽 n 个**不重复**的选项，全部走 gameplay RNG ——
  //  这样"同 Seed + 同输入 → 同样的三选一结果"是可复现的，可以被断言验证。
  // ============================================================
  // 钟术师的法术核心（§28）：把普通武器定义翻译成法术定义，并缓存。
  // 走 Adapter 而不是另建一套数据表（§29），因此武器的一切属性仍可复用。
  spellFor(weaponId) {
    if (!this.spellDefs) this.spellDefs = new Map();
    const key = 'spell_' + weaponId;
    if (this.spellDefs.has(key)) return this.spellDefs.get(key);
    const src = WEAPON_MAP[weaponId];
    if (!src) return null;
    const def = spellFromWeapon(src);
    if (!def) return null;
    this.spellDefs.set(def.id, def);
    return def;
  }

  rollChoice(pool, n = 3) {
    const arr = (pool || []).slice();
    const out = [];
    const k = Math.min(n, arr.length);
    for (let i = 0; i < k; i++) {
      const j = Math.floor(this.gr() * arr.length) % arr.length;
      out.push(arr.splice(j, 1)[0]);
    }
    return out;
  }

  // 每层奖励三选一（由英雄的 floorChoice 决定内容；铸枪师 = 配件，§21.1）
  openFloorChoice(hero) {
    this.telFirst('firstHeroGrowth');
    if (!hero || !hero.floorChoice) return false;
    if (hero.floorChoice === 'attachment') {
      const picks = this.rollChoice(ATTACHMENTS, 3);
      this.hud.choicePanel({
        kind: 'attachment',
        commitBeforeClose: true,
        title: `${hero.cn} · 配件三选一`,
        sub: '每下一层必定获得一次 —— 这是铸枪师的成长方式（不是伤害 +20%）',
        options: picks.map((a) => ({ cn: a.cn, desc: a.desc, tag: SLOT_CN[a.slot], color: '#8ad8ff', id: a.id })),
        onPick: (o, i, choice) => this.claimFloorAttachment(o.id, choice),
      });
      return true;
    }
    // 驯炉人：每层宠物进化三选一（§25）。第二次必须在**已选方向上**继续变异。
    if (hero.floorChoice === 'evolution') {
      const c = this.companion;
      if (!c) return false;
      if (c.stage >= 2) return false;
      const pool = c.stage === 1 ? [EVO_MAP[c.evo]] : EVOLUTIONS;
      const picks = c.stage === 1 ? pool : this.rollChoice(pool, 3);
      this.hud.choicePanel({
        kind: 'evolution',
        title: `${hero.cn} · 异兽进化`,
        sub: c.stage === 0 ? '选择这只异兽的长成方向（第二次会在同一方向上继续变异）' : `继续强化「${EVO_MAP[c.evo].cn}」方向`,
        options: picks.map((e) => ({ cn: e.cn, desc: e.desc, tag: c.stage === 0 ? '方向' : '强化', color: e.color, id: e.id })),
        onPick: (o) => {
          if (this.companion && this.companion.evolve(o.id)) {
            this.toast('异兽进化', `${this.companion.name} · ${EVO_MAP[o.id].cn}（${this.companion.stage}/2）`, EVO_MAP[o.id].color, 'story');
          }
        },
      });
      return true;
    }
    // 远征老兵：每层战斗教条三选一（§22.1）。教条是**行为型**能力，不是 +10% 伤害。
    if(hero.floorChoice==='doctrine'&&hero.ruleVersion===3)return openDoctrines(this.actorView());
    if (hero.floorChoice === 'doctrine') {
      const picks = this.rollChoice(DOCTRINES, 3);
      this.hud.choicePanel({
        kind: 'doctrine',
        title: `${hero.cn} · 战斗教条`,
        sub: '每进入新一层选择一条 —— 它们改变你的打法，而不是加一点数值',
        options: picks.map((d) => ({ cn: d.cn, desc: d.desc, tag: d.tag, color: '#ffd24a', id: d.id })),
        onPick: (o) => {
          if (!this.player.doctrines) this.player.doctrines = [];
          this.player.doctrines.push(o.id);
          this.player.recompute();
          const d = DOCTRINE_MAP[o.id];
          this.toast('教条确立', `${d.cn} · ${d.desc}`, '#ffd24a', 'build');
        },
      });
      return true;
    }
    return false;
  }

  // 精英出现率的**单一来源**：生成点与自动测试都读它，
  // 这样"挑战词条真的改变了概率"可以被精确断言，而不是靠统计猜测。
  eliteRollChance() {
    const boost = (this.mod_ && this.mod_.eliteChance) || 1;
    return (0.11 + (this.floor - 1) * 0.05) * boost;
  }

  // 配件掉落（§17）：控制出现频率 —— 只在"高价值容器"里出现，
  // 不是每个房间都掉。一局中应该能体验改装，但不该满地都是。
  spawnAttachment(x, z, floorBoost = 0) {
    const pool = ATTACHMENTS.filter((a) => !this._attSeen || !this._attSeen.has(a.id));
    const list = pool.length ? pool : ATTACHMENTS;
    // 走 gameplay 随机（§1.3），保证同 Seed 可复现
    const idx = Math.floor(this.gr() * list.length) % list.length;
    const a = list[idx];
    if (!this._attSeen) this._attSeen = new Set();
    this._attSeen.add(a.id);
    this.pickups.spawn('attachment', x, z, { id: a.id, attId: a.id, vx: 0, vy: 3.0, vz: 0, y: 0.8, armDelay: 0.45 });
    return a;
  }

  // 按"容器价值"决定是否掉配件：鎏金箱 / 上锁箱 / 宝库 / Boss 才会
  rollAttachmentFrom(kind, x, z) {
    const chance = kind === 'vault' ? 0.75 : kind === 'boss' ? 1.0 : kind === 'locked' ? 0.45 : kind === 'gold' ? 0.35 : 0;
    if (chance <= 0) return null;
    if (!this.grc(chance)) return null;
    const a = this.spawnAttachment(x, z);
    if (a && this.tel) { bump(this.tel.attachmentsBySrc, kind, 1); this.telFirst('firstAttachment'); }
    return a;
  }

  spawnCoins(x, z, n, opts = {}) {
    if (![x,z,n].every(Number.isFinite) || n <= 0) return;
    // 挑战词条「精锐潮 / 铁粮」的金币倍率
    const cm = (this.mod_ && this.mod_.coinMul) || 1;
    n = Math.max(1, Math.round(n * (opts.coinMultiplierApplied?1:cm)));
    if (n <= 0) return;
    if(this.partySessionStore&&!opts.fromChest&&opts.rewardSource){this.partySessionStore.enqueueSource('coin',x,z,{...opts,amount:n},opts.rewardSource);return;}
    const groups = this.partySessionStore?1:Math.min(5, Math.max(1, Math.round(n / 3)));
    for (let i = 0; i < groups; i++) {
      // 金币落点会影响能否安全捡到：gameplay 随机
      const a = this.gr() * Math.PI * 2;
      const p = { x: x + Math.cos(a) * 0.5, z: z + Math.sin(a) * 0.5 };
      this.pickups.spawn('coin', p.x, p.z, { ...opts, amount: Math.floor(n / groups) + Number(i < n % groups), vx: Math.cos(a) * 2.5, vy: 3.2, vz: Math.sin(a) * 2.5 });
    }
  }

  // 把换下来的武器丢到地上。
  // 必须丢得**足够远**并带一段落地保护期：
  // 旧实现丢在距玩家 0.8 处，而自动拾取半径 1.35、磁吸范围 2.4 ——
  // 旧枪当场被吸回玩家身上，于是又触发一次替换、再把刚拿到的新枪丢掉，
  // 形成每帧来回换枪的死循环（表现为"两个武器名在第二个格子里疯狂跳"）。
  dropWeaponPickup(w, x, z, awayDir = null, options = {}) {
    const plan = planEquipmentDrops(this, weaponDropEntries(this, w, options), { x, z, direction: awayDir || this.player.aim });
    // Snapshot gun state before suspending its room actions; the ground instance
    // owns the complete carried state and is authoritative when picked up again.
    this.weaponAssets?.drop(w.assetInstanceId);
    if (this.weaponAssets?.states && w.assetInstanceId) delete this.weaponAssets.states[w.assetInstanceId];
    return spawnPlannedEquipment(this, plan)[0];
  }

  spawnDeathBurst(x, y, z, color) {
    this.particles.ring(x, y, z, color, 14, 0.4, 5);
    this.flashSmall(x, y, z, color, 5, 0.12);
  }

  onEnemyKilled(e, lethalContext = {}) {
    if(e.worldKillProcessed)return;e.worldKillProcessed=true;
    const actor=resolveDamageActor(this,lethalContext,{diagnose:true}),personal=actor?.view||(!this.actors?this:null);
    if(personal)enqueueC2Echo(personal,e);
    // §42：训练区（大厅）打靶**不得污染正式统计、不得发成就、不得计入本局战绩**。
    // 之前这里无条件 `meta.data.stats.kills++` 与 `checkAchievements()` ——
    // 在大厅打木桩会涨"累计击杀"，还可能白送"连锁反应"这类成就（自查抓到）。
    const inRun = this.mode === 'run';
    if (e.dummy) this.dummyKills = (this.dummyKills | 0) + 1;
    if (!inRun || e.dummy) return;
    if (inRun) {
      if(this.actorCount!==2)meta.data.stats.kills++;
      if (personal?.player?.deadeyeT > 0) personal._deadeyeKills = (personal._deadeyeKills | 0) + 1;
      if(this.actorCount===2)this.metaSee('enemy',e.def.id);else meta.see('enemy', e.def.id);
      personal?.checkAchievements();
      this.run.kills++;
      if (e.elite) { this.run.eliteKills++; this.metaSee('elite', e.def.id); }
    }
    personal?.player.onKill(e);   // World death once; personal reward only to its lethal owner.
    const st = personal?.player.stats||{keyBonus:0,ammoFind:0};
    if (e.def?.model && this.rng.chance(0.05 + st.keyBonus * 0.10)) {
      this.pickups.spawn('key', e.x, e.z, { vy: 3,rewardSource:'enemy-drop' });
    } else if (this.rng.chance(0.045 + st.ammoFind * 0.05)) {
      this.pickups.spawn('ammo', e.x, e.z, { vy: 3,rewardSource:'enemy-drop' });
    } else if (this.rng.chance(this.floor >= 3 ? 0.055 : 0.035)) {   // 一/二层 0.055→0.035（PASS2 §1.1 免费治疗偏宽裕）；第三层保留 0.055
      // 挑战词条「铁粮」：回复类拾取改为金币（这才是它原本想指的系统 —— 游戏里真的有 heal 拾取物）
      if (this.mod_ && this.mod_.noFood) this.spawnCoins(e.x, e.z, 2,{rewardSource:'enemy-drop'});
      else this.pickups.spawn('heal', e.x, e.z, { vy: 3,rewardSource:'enemy-drop' });
    }
  }

  // ================= 主循环 =================
  loop() {
    if (this.platform?.kind === 'headless') throw Error('Headless games advance through stepSim, never RAF');
    requestAnimationFrame(this.loop);
    const dt = Math.min(0.048, this.clock.getDelta());
    const actors=orderedActors(this),party=this.actorCount>1;
    if (this._textReviewFrozen) { for(const actor of actors)actor.input.endFrame(); return; }
    if (this.storageFrozen() || this._stageBossPending || this._partyCheckpointPending) { this.touch?.beforeFrame(); for(const actor of actors){actor.view.handlePanelKeys(dt);actor.input.endFrame();} this.render(dt); return; }
    if(!party||!this.paused)this.time += dt;
    // 无头验收模式：逻辑时间只由 stepSim 提供。
    // 否则 RAF 会以真实 dt（软件渲染下可达 0.2s）额外推进一帧，
    // 使"固定步长"名不副实、验收结果不可复现（同一输入会得到不同结果）。
    // 渲染保留，以便截图与 sceneStats 仍然有效。
    if (this.headlessSim) { this.render(dt); return; }
    for(const actor of actors)actor.input.setBlocked?.(this.paused||actor.view.panelOpen()||actor.revivalPending||this.state!=='play');
    this.touch?.beforeFrame();
    const playing = this.state === 'play' && !this.paused && (this.actorCount>1||(!this.panelOpen() && !this.revivalPending));
    if (playing) this.update(dt);
    else {
      for(const actor of actors)actor.weaponAssets?.suspend();
      // 暂停 / 构筑面板期间 update() 不跑，但面板自己的按键必须照样响应
      // （否则"打开构筑面板按数字键改装"就是死的 —— 实测踩过）。
      for(const actor of actors){actor.view.handlePanelKeys(dt);actor.input.endFrame();}
      this.hud.hideReticle();
      if (this.state === 'title') this.updateAttractCamera(dt);
      // 死亡 → 结算界面之间有 1.5s（胜利是 3.2s）的演出窗口。
      // 这段时间主循环不跑 update，于是玩家倒地动画 / 中央标题计时全都不推进 ——
      // 观感是"站着不动一会儿，然后被结算界面盖住"。这里只推进与演出相关的部分。
      else if (this.state === 'dead' || this.state === 'victory') this.updateCinematic(dt);
      // 待复苏（Task6）：冻结一切关卡逻辑与计时，只保留"看得见"的部分。
      else if (this.revivalPending) this.updateRevivalFreeze(dt);
    }
    this.render(dt);
  }

  // 结算界面出现前的演出推进：只跑与"看"有关的部分，不碰关卡逻辑。
  updateCinematic(dt) {
    this.advanceDamageFeedback(dt);
    for(const a of orderedActors(this)){const p=a.player;if(p){p.updateMove(dt,a.input,a.view);p.animate(dt);}a.hud.update(dt);}
    this.updateCamera(dt);
    this.particles.update(dt);
    this.debris.update(dt);
    this.decals.update(dt);
    this.projectiles.update(dt, this);
    this.roomLights.update(dt, this.time);
    if (this.roomScene) this.roomScene.update(dt);
    this.flushDamageFeedback();
  }

  // 待复苏：只推进"看得见"的部分，关卡逻辑 / 计时 / RNG / Boss 节拍全部冻结。
  updateRevivalFreeze(dt) {
    const p = this.player;
    if (p) p.animate(dt);
    this.updateCamera(dt);
    this.hud.update(dt);
    this.particles.update(dt);
    this.debris.update(dt);
    this.decals.update(dt);
    this.roomLights.update(dt, this.time);
    if (this.roomScene) this.roomScene.update(dt);
  }

  // 自动化验收开关：见 loop() 注释
  setHeadlessSim(on) {
    this.headlessSim = !!on;
    if (on) this.input.clearEdges();
  }

  // 标题界面：围绕真实地牢场景的低速环绕镜头（不使用任何外部背景图）
  updateAttractCamera(dt) {
    this.attractT = (this.attractT || 0) + dt * 0.11;
    const t = this.attractT;
    const r = 15.5;
    const a = this.camAnchor || { x: 0, z: -2 };
    this.camera.position.set(a.x + Math.cos(t) * r, 11.5 + Math.sin(t * 0.7) * 2.6, a.z + Math.sin(t) * r);
    this.camera.lookAt(a.x, 1.7, a.z);
    this.sun.position.set(a.x + Math.cos(t) * 20, 26, a.z + Math.sin(t) * 20);
    this.sunTarget.position.set(a.x, 0, a.z);
    this.particles.update(dt);
    if (this.roomScene) this.roomScene.update(dt);
    this.roomLights.update(dt, this.time);
    this.dustTimer -= dt;
    if (this.dustTimer <= 0 && this.roomScene) {
      this.dustTimer = 0.14;
      const s = this.roomScene.inner * 0.9;
      this.particles.spawn((Math.random() - 0.5) * s * 2, Math.random() * 3 + 0.6, (Math.random() - 0.5) * s * 2, {   // visual-rng: 纯粒子表现
        speed: 0.16, color: this.floor === 1 ? 0x9fd8f0 : 0xff8a3c, size: 0.12, sizeEnd: 0.05,
        life: 2.6, alpha: 0.30, drag: 1.0, gravity: 0.03, bright: 1.3,
      });
    }
  }

  ensureAttractScene() {
    if (this._attractReady) return;
    this.attract = true;
    this.rng = this.rng || new RNG(this.seed);
    this.floor = 1;
    this.theme = FLOOR_THEME[1];
    this.buildFloor(1);
    this.applyTheme();
    this._attractReady = true;
    if (this.player) this.player.rig.group.visible = false;
  }

  // 固定步长推进游戏逻辑（供自动化测试使用，不受渲染帧率影响）
  stepSim(frames = 1, dt = 1 / 60, {unpersistedParty=false}={}) {
    const party=this.actorCount>1,actors=orderedActors(this);
    if (this._textReviewFrozen) { for(const actor of actors)actor.input.endFrame(); return 0; }
    if (this.storageFrozen()) { for(const actor of actors){actor.view.handlePanelKeys(dt);actor.input.endFrame();} return 0; }
    if (this._stageBossPending||this._partyCheckpointPending) return 0;
    let n = 0;
    for (let i = 0; i < frames; i++) {
      // 暂停 / 构筑面板：逻辑冻结，但面板按键仍要处理（与 loop() 的非游玩分支一致），
      // 否则"面板里的操作"在自动化里完全不可断言。
      for(const actor of actors)actor.input.setBlocked?.(this.paused||actor.view.panelOpen()||actor.revivalPending||this.state!=='play');
    this.touch?.beforeFrame();
      if (this.paused || (!party&&(this.panelOpen() || this.revivalPending))) {
        for(const actor of actors){actor.view.handlePanelKeys(dt);actor.input.endFrame();}
        if(!party)this.time += dt;
        continue;
      }
      // 与主循环 loop() 保持一致：play 走完整 update，
      // 死亡 / 胜利的演出窗口走 updateCinematic，否则无头验收里这段根本不会推进，
      // 也就无法断言"玩家倒地动画真的在播"。
      const cinematic = this.state === 'dead' || this.state === 'victory';
      if (this.state !== 'play' && !cinematic) break;
      if(party&&cinematic&&!this._partyLifecycle?.settled)throw Error('Unsettled party cinematic');
      this.time += dt;
      if (cinematic) this.updateCinematic(dt); else this.update(dt,{unpersistedParty});
      n++;
    }
    return n;
  }

  get actorCount() { return this.actors?.size||1; }

  // Internal common-tick driver; persistence and party lifecycle remain gated.
  stepPartyCombat(ticks=1) {
    if(this.actorCount!==2||!Number.isInteger(ticks)||ticks<1||ticks>36000)throw Error('Internal party combat requires two actors and bounded ticks');
    if(this.state!=='play')throw Error('Unsupported party lifecycle');
    let advanced=0;
    for(let i=0;i<ticks;i++){
      const n=this.stepSim(1,1/60,{unpersistedParty:true});
      if(!n)break;
      this.lifecycleScheduler?.advance();
      if(this.lifecycleScheduler)this._lifecycleTimers=new Set(this.lifecycleScheduler.tasks.keys());
      advanced++;
    }
    return {advanced,...this.partyTickStatus};
  }

  updateActorPrelude(dt) {
    tickConsumables(this,dt);
    if(!this.panelOpen()&&!this.revivalPending&&this.experiment)for(let i=0;i<4;i++)if(actionHit(this.input,`item_${i+1}`))useConsumable(this,i);
  }
  updateActorMotion(dt) {
    const blocked=this.panelOpen()||this.revivalPending||this.player.connected===false;
    const mvdt=dt*this.playerMoveTimeScale,acdt=dt*this.playerActionTimeScale;
    this.player.updateMove(mvdt,this.input,this,{controlsBlocked:blocked});
    // Camera follow remains a single presentation operation, between the
    // original primary movement and aim. Other actors provide world aim.
    return {mvdt,acdt,blocked};
  }
  updateActorRuntime(dt) { this.weaponAssets?.update(dt,{timeEffectsPrepared:true}); }
  updateActorTail(dt) {
    if(this.player.stats.tesla>0)this.updateTesla(dt*this.enemyTimeScale);
  }

  // Internal party combat may explicitly defer persistence. The default path
  // stops at the real checkpoint boundary until Task4F provides a party save.
  update(dt,{unpersistedParty=false}={}) {
    const actors=orderedActors(this),party=this.actorCount>1;
    if (this.storageFrozen() || this._stageBossPending || this._partyCheckpointPending) return false;
    if (this.paused || (!party&&(this.panelOpen() || this.revivalPending))) {
      for(const actor of actors){actor.view.handlePanelKeys(dt);actor.input.endFrame();}
      return false;
    }
    if(party)this.partyTickStatus||={persistence:'unsupported-party-checkpoint',acquisition:'awaiting-PartyDraft',lifecycle:'awaiting-party-lifecycle',deferredCheckpoints:0};
    this.advanceDamageFeedback(dt);
    const p = this.player;
    for(const actor of actors)actor.view.updateActorPrelude(dt);
    if(saveStore.blocked || this._storageRecovery){for(const actor of actors)actor.input.endFrame();return false;}
    // ---- 时间缩放：六条独立通道（任务书 §10.3）----
    const TS = this.computeTimeScales(dt);
    this.timeScale = TS.enemy;
    this.enemyTimeScale = TS.enemy;
    this.enemyBulletTimeScale = TS.enemyBullet;
    this.playerMoveTimeScale = TS.playerMove;
    this.playerActionTimeScale = TS.playerAction;
    this.fxTimeScale = TS.fx;
    this.hazardTimeScale = TS.hazard;
    if (TS.enemy < 1) this.applyTimeScaleVisual();
    for(const actor of actors)actor.hud.setDeadeye?.(actor.player.deadeyeT>0||(!party&&TS.deadeye));
    this.run.time += dt;
    for(const actor of actors)actor.view.telTick(dt);

    for(const actor of actors)actor.hud.update(dt);
    this.roomLights.update(dt, this.time);
    const fdt = dt * this.fxTimeScale;         // 表现层单独一条通道（静火时略慢，但不像敌人那么慢）
    this.particles.update(fdt);
    this.debris.update(fdt);
    this.decals.update(fdt);
    this.hazards.update(dt * this.hazardTimeScale);

    // 玩家：严格三段式 —— 移动 → 相机跟随 → 用"最新相机"解算瞄准 → 动作
    // 旧实现把瞄准与相机跟随拆散在两处，导致 (a) 相机在玩家存活时几乎不跟随，
    // (b) 准星用的是上一帧相机，屏幕准星与真实弹道发生偏差。
    // 玩家移动与玩家动作也是两条独立通道：
    // 「静火」期间敌人 0.35 / 玩家移动 0.70 / 瞄准与 UI 保持 1.00 —— 手感不该被一起拖慢。
    for(const actor of actors){
      const v=actor.view,{mvdt,acdt,blocked}=v.updateActorMotion(dt);
      if(actor.slot===0)this.updateCamera(dt);
      v.solveAim();
      if(!blocked)v.player.updateActions(acdt,actor.input,v);else actor.weaponAssets?.suspend();
    // 模型同步（位置 / 朝向 / 走路 / 翻滚动画）。
    // 拆分路径曾经漏掉这一步 —— updateMove 只改逻辑坐标，animate 才把 rig 摆到坐标上，
    // 结果玩家本体隐形、模型僵尸般停在房间中点。自动化测试当时只断言了相机与弹道，
    // 没人断言"看见的自己 == 真正的自己"，所以一直没暴露。
      v.player.animate(mvdt);
    }
    this.updateReticle();

    // 敌人
    this.hitboxes.length = 0;
    this.hitboxes.push(...combatPlayers(this));
    for (const e of this.enemies) {
      if (!e.alive) { if (!e.deathDone) e.updateDeath(dt); continue; }
      e.update(dt * this.enemyTimeScale, this);
      this.hitboxes.push(e);
    }
    if (this.boss && this.boss.alive) {
      const bossDt = dt * this.enemyTimeScale;
      const stunned = actors.some(a=>!!a.experiment)?Math.min(bossDt, this.boss.stunT || 0):0;
      if (stunned > 0) this.boss.stunT = Math.max(0, this.boss.stunT - stunned);
      if (bossDt > stunned) this.boss.update(bossDt - stunned, this);
      if (this.boss.alive) this.hitboxes.push(this.boss);
    }
    // ---- 精英血条：把"头顶锚点"投影成屏幕像素，交给 DOM 画一条水平直线 ----
    // 光有 3D 平面做不到用户要的效果：透视投影会把离屏中心稍远的四边形压成梯形，
    // 看起来"斜的、带 3D 感"。投影到屏幕后画，则永远水平、线宽恒定。
    if (this.worldBars && this.worldBars.ready) {
      // 只在可操作时显示；暂停 / 面板打开 / 结算演出时整层隐藏（否则会浮在 UI 上）
      const playable = this.state === 'play' && !this.paused && !this.panelOpen();
      this.worldBars.setVisible(playable);
      if (playable) {
        this.worldBars.begin();
        const cw = this.canvas.clientWidth, ch = this.canvas.clientHeight;
        for (const e of this.enemies) {
          if (!e.alive || !e.elite) continue;
          const anchorY = (typeof e.barAnchorY === 'function' ? e.barAnchorY() : 2.4) + 0.5;
          _barV.set(e.x, anchorY, e.z).project(this.camera);
          if (_barV.z > 1) continue;                       // 在相机背后
          const sx = (_barV.x * 0.5 + 0.5) * cw;
          const sy = (-_barV.y * 0.5 + 0.5) * ch;
          this.worldBars.show(e, sx, sy, e.maxHp > 0 ? e.hp / e.maxHp : 0, false);
        }
        this.worldBars.end();
      }
    }

    // 死亡演出播放完毕后再真正移除模型
    if (this.enemies.some((e) => !e.alive)) {
      const retainedOwner=e=>party&&this.projectiles.pool.some(b=>b.alive&&b.ownerRef===e);
      const done = this.enemies.filter((e) => !e.alive && e.deathDone&&!retainedOwner(e));
      for (const d of done) d.remove();
      this.enemies = this.enemies.filter((e) => e.alive || !e.deathDone||retainedOwner(e));
    }

    // 延迟生成与弹丸都按"真实时间 × 与它们相关的通道"推进：
    // 弹丸在 update 内部再按阵营分流（玩家弹 1.0 / 敌弹 enemyBulletTimeScale）。
    this.updatePendingSpawns(dt);
    this.advanceChapterWaves();
    this.updatePendingLoot(dt);
    this.projectiles.update(dt, this);
    this.pickups.update(dt);
    for(const actor of actors)actor.view.updateActorRuntime(dt);
    this.roomScene.update(dt);

    // 召唤物
    // 召唤物 / 特斯拉 / 敌人技能：同样受顿帧影响，
    // 否则顿帧期间"世界冻结"但召唤物照常行动，看起来像是卡顿而不是打击感。
    this.updateSummons(dt * this.enemyTimeScale);
    // 特斯拉
    for(const actor of actors)actor.view.updateActorTail(dt);
    // 敌人技能
    this.updateEnemyAbilities(dt * this.enemyTimeScale);

    // 面板按键（三选一 / 构筑）
    for(const actor of actors)actor.view.handlePanelKeys();
    // 同伴：跟随世界时间推进（静火期间它同样变慢，不会出现"宠物独自清屏"）
    for(const actor of actors){actor._c2PlayerDt=dt*actor.playerMoveTimeScale;if(actor.companion)actor.companion.update(dt*this.enemyTimeScale,actor.view);}
    this.flushDamageFeedback();
    if (this.mode === 'run') {
      // 门锁 / 清理判定
      this.updateRoomLogic(dt);
      // 情境教学（每 0.25s 评估一次，只在第一次满足条件时弹出）
      for(const actor of actors)actor.view.updateTips(dt);
      // V3.0：按需建立/释放走廊，并在走廊存在期间分帧预热目的地房间
      this.updateConnectors(dt);
      this.runPrewarm(6);
      // 房间切换
      if(!party)this.updateTransition(dt);else this._partyCheckpointOwner?.detectRoomCrossing();
    } else {
      // 大厅：只跑"安全区"该有的东西（训练木桩复原 + 功能点交互 + 训练补给）
      this._lootT = (this._lootT || 0) - dt;
      if (this._lootT <= 0) { this._lootT = 2.5; this.refreshTrainingLoot(); }
      this.updateHubExtras(dt);
      this.hud.setWorldLabels(this.hubWorldLabels());
    }
    // 后续光晕
    this.flashLights.update(dt);
    this.followLights.get(0).position.set(p.x, 1.5, p.z);
    this.followLights.get(0).intensity = 1.6 + this.flash * 3;
    this.followLights.get(0).color.set(this.theme.torch);
    // 残影
    for (const a of this.afterimages.list) {
      if (a.life <= 0) continue;
      a.life -= dt;
      a.mesh.material.opacity = Math.max(0, a.life / 0.26) * 0.45;
      a.mesh.scale.z = 1 + (1 - a.life / 0.26) * 0.5;
      if (a.life <= 0) a.mesh.visible = false;
    }
    // 尘埃
    this.dustTimer -= dt;
    if (this.dustTimer <= 0) {
      this.dustTimer = 0.12;
      const s = this.roomScene.inner * 0.9;
      this.particles.spawn((Math.random() - 0.5) * s * 2, Math.random() * 3 + 0.5, (Math.random() - 0.5) * s * 2, {   // visual-rng: 纯粒子表现
        speed: 0.14, color: this.floor === 2 ? 0xff8a3c : 0x9fd8f0, size: 0.12, sizeEnd: 0.05,
        life: 2.4, alpha: 0.28, drag: 1.0, gravity: this.floor === 2 ? 0.12 : 0.03, bright: 1.2,
      });
    }
    // 屏幕特效衰减（受击红光衰减略快，避免连续掉血时长期糊住画面）
    this.hurt = Math.max(0, this.hurt - dt * 3.0);
    this.flash = Math.max(0, this.flash - dt * 4);
    this.aberr = Math.max(0, this.aberr - dt * 2.5);
    this.shakeAmt = Math.max(0, this.shakeAmt - dt * 2.4);

    // 必须在逻辑推进结束后清空本帧边缘输入，否则 pressed 会永久为真，
    // 造成"按住不放/一次点击触发多次"的持续翻滚、持续切枪与持续交互。
    for(const actor of actors)actor.input.endFrame();
    // 远征的长期收益与现场必须同一事务；大厅仍由 Meta.tick 独立保存。
    this._autosaveT += dt;
    if (this._autosaveT >= 3 && this.mode === 'run' && this.state === 'play') {
      this._autosaveT = 0;
      if(!party)this.saveProgress(false);
      else if(unpersistedParty)this.partyTickStatus.deferredCheckpoints++;
      else {this._partyCheckpointPending=true;if(!this._partyCheckpointOwner)throw Error('Unsupported party checkpoint: combat frozen at autosave boundary');}
    }
    return true;
  }

  applyTimeScaleVisual() {
    if (Math.random() < 0.25) this.aberr = Math.max(this.aberr, 0.006);   // visual-rng: 纯粒子表现
  }

  updateTesla(dt) {
    const p = this.player;
    p._teslaT = (p._teslaT || 0) - dt;
    if (p._teslaT > 0) return;
    p._teslaT = 0.55;
    const tgt = this.findNearest(p.x, p.z, TEAM.ENEMY, 5, null, null);
    if(!tgt||!this.weaponAssets._los(p,tgt))return;
    this.projectiles._addBeam(p.x, 0.9, p.z, tgt.x - p.x, tgt.z - p.z, Math.hypot(tgt.x - p.x, tgt.z - p.z), '#5ad8ff', 0.07, 0.12);
    this.onDamage(tgt, 4*(p.stats.teslaDamage??1), { source: 'tesla',assetSecondary:true });
    audio.gun('energy', 0.3);
  }

  updateEnemyAbilities(dt) {
    // 敌人特殊技能：喷射者（喷吐者）在近距离释放环形弹幕
    for (const e of this.enemies) {
      if (!e.alive) continue;
      if (orderedActors(this).some(a=>!!a.experiment)&&e.combatStunT > 0) continue;
      if (e.def.ai === 'caster' && e.def.id.includes('spitter')) {
        e._novaT = (e._novaT || 3) - dt;
        if (e._novaT <= 0) {
          e._novaT = 6.5;
          const target=this.actorCount>1?selectPlayerTarget(e):this.player;
          const d = target?Math.hypot(target.x - e.x, target.z - e.z):Infinity;
          if (!suppressesNewPlayerLocks(this) && d < 12 && this.grc(0.6)) {   // 是否触发新星弹幕：gameplay 随机
            for (let i = 0; i < 10; i++) {
              const a = (i / 10) * Math.PI * 2;
              this.projectiles.spawn({ x: e.x, y: 1.1, z: e.z, dx: Math.cos(a), dz: Math.sin(a), speed: 9, damage: 1, life: 4, color: e.def.projColor, team: TEAM.ENEMY, size: 0.28, radius: 0.3, kind: 'orb', owner: e });
            }
            this.particles.ring(e.x, 1.1, e.z, e.def.projColor, 18, 0.7, 6);
            audio.bossShoot(0);
          }
        }
      }
      if (e.def.id === 'wasp' && !e._stung) {
        e._stung = true;
      }
    }
  }

  updateRoomLogic(dt) {
    const r = this.room;
    if (!r) return;
    if (r.type === 'boss') {
      if (this.boss && !this.boss.alive && !r.cleared) {
        r.cleared = true;
        this.onBossDefeated();
      }
      return;
    }
    // 注意：必须统计"存活"敌人。子弹在 projectiles.update() 中击杀敌人，
    // 而本函数同一帧内先于清理逻辑执行，若直接用 this.enemies.length，
    // 已死但尚未回收的敌人会让房门多锁一帧（表现为"清完了门还不开"）。
    if (r.lockGrace > 0) { r.lockGrace = Math.max(0, r.lockGrace - dt); this.syncDoorLocks(); return; }
    if (this.roomScene && this.roomScene.secretOpen && this.roomScene.secretOpen.size > 0) {
      this.metaSee('area', 'secret');
    }
    const alive = this.enemies.reduce((n, e) => n + (e.alive ? 1 : 0), 0);
    // 待生成敌人（分裂怪幼体 / 召唤 / 增援）也算"本房战斗未结束"。
    // 旧实现只看 alive，于是房间可能在敌人还没出现的空窗期被判 cleared 并开门，
    // 随后敌人又冒出来 —— 玩家看到的就是"门开着却还有敌人在打"。
    const pending = this.pendingInRoom(r);
    if (!r.cleared) {
      if (alive > 0 || pending > 0) r.locked = true;
      else if (r.locked) { r.cleared = true; r.locked = false; audio.doorOpen(); this.onRoomCleared(); }
      else r.cleared = true;
    }
    this.syncDoorLocks();
  }

  onRoomCleared() {
    const actors=this.actors?orderedActors(this):[{view:this}];
    for(const actor of actors)actor.view.onActorRoomCleared('event');
    if (this.room.type === 'vault') {
      this.run.vaults++;
      this.metaSee('area', 'vault');
      // 宝库是配件的高概率来源（§17）
      if(this.partySessionStore)this.partySessionStore.enqueueSource('vault',this.roomScene.ox+1.2,this.roomScene.oz,{},'room-clear');
      else if(this.actorCount>1){this.partyTickStatus||={};this.partyTickStatus.vaultReward='awaiting-PartyDraft';}
      else this.rollAttachmentFrom('vault', this.player.x + 1.2, this.player.z);
      this.toast('宝库已肃清', '高额奖励已解锁', '#ffd24a', 'story');
    } else {
      this.toast('房间已清空', '通路开启', '#9dff5a', 'quick');
    }
    for(const actor of actors)actor.view.onActorRoomCleared('regen');
    if(this.actorCount===2)this._partyCheckpointOwner?.roomCleared();
  }

  onActorRoomCleared(phase) {
    const p=this.player;
    if(phase==='event'){
      const taken=this.actorCount>1?Object.values(this.tel?.dmgBy||{}).reduce((n,v)=>n+v,0):(this.run.dmgTaken??0);
      if(taken===(this._dmgAtRoomStart??0))this._noHitRoom=true;
      this.emit('onRoomClear',{room:this.room});this.checkAchievements();return;
    }
    if ((this.actorCount!==2||p.alive) && p.stats.regenArmor > 0 && p.armor < 3) {
      p.armor++;
      this.toast('力场充能', '护甲 +1', '#8ab0e0', 'quick');
    }
    this.particles.ring(p.x, 0.2, p.z, '#9dff5a', 20, 0.9, 5);
  }

  // 阶段 Boss：只结束本段并开启阶梯；**不**调用 meta.endRun（除非是三章最终段）。
  onStageBossDefeated() {
    if(this.actorCount>1)return this._partyCheckpointOwner?.bossDefeated();
    const key = this.stage.stageKey;
    if (this.stageRun?.milestones[key]?.boss) return true;
    if (this.storageFrozen()) return false;
    this.flushDamageFeedback();
    const bt = this.boss?.bossType || this.bossType || DEFAULT_BOSS_TYPE;
    try {
      const draft = captureSessionDraft(this), metaDraft = structuredClone(meta.data);
      draft.stageRun.milestones[key] = { ...(draft.stageRun.milestones[key] || {}), boss: true };
      const projection = acquisitionProjection(this, draft, metaDraft);
      if(this.stage.contentVersion===3&&this.stage.chapter<3){
        const loot=dropChapterBossLoot(projection.game);
        draft.stageRun.rewards[`v2:${key}:boss-loot`]={version:1,loot};
      }else projection.game.rollAttachmentFrom('boss', this.player.x, this.player.z + 1.4);
      projection.game.telFirst('bossKilled'); projection.finish();
      if (!this.practice) { metaDraft.stats.bossKills++; projection.game.metaSee('boss', bt); metaDraft.souls += 30; }
      const st = draft.roomStates[this.room.uid];
      st.projectiles = [];
      st.enemies = []; st.boss = null;
      for (const r of [draft.rooms.find(r => r.uid === this.room.uid), draft.dungeon.rooms.find(r => r.uid === this.room.uid)]) if (r) { r.cleared = true; r.pendingCombat = 0; }
      validateSession(draft);
      const result = saveStore.write(metaDraft, draft);
      if (result.committed !== true) {
        if (saveStore.blocked) this.openStorageRecovery();
        else {
          this._stageBossPending = true;
          this.hud.hubPanel({ title: '首领奖励尚未保存', sub: result.error || '原现场已保留', rows: [{ cn: '重试保存', desc: '保存战斗结果后继续' }], onPick: () => this.onStageBossDefeated() });
        }
        return false;
      }
      try {
        publishAcquisition(this, draft); publishDrops(this, projection.drops);
        this.stageRun = structuredClone(draft.stageRun);
        this.room.cleared = true; this.room.pendingCombat = 0;
        this.roomStates.set(this.room.uid, structuredClone(st));
        meta.data = metaDraft; meta._dirty = false; meta._clearActive = false;
        this.projectiles.reset(); this.enemies.forEach(e => e.remove()); this.enemies.length = 0;
        if (this.boss) { this.boss.remove(); this.boss = null; }
        this._stageBossPending = false; this.hud.closeHubPanel();
        this.resetTimeScales(); audio.stopMusic(); audio.victory();
        const bd = bossDef(bt); this.hud.centerMessage(`${bd.cn} 已 陨 落`, bd.en + ' FALLEN', 4.0);
        this.toast('首领已陨落', '阶梯已开启 · 走上阶梯继续前进', '#ffd24a', 'story');
      } catch (err) { saveStore.blockWrites(); this.openStorageRecovery(); return false; }
      return true;
    } catch (err) {
      this._stageBossPending=true;
      this.hud.hubPanel({title:'首领奖励尚未保存',sub:err.message,rows:[{cn:'重试领取',desc:'重新寻找安全落点并保存结果'}],onPick:()=>this.onStageBossDefeated()});
      this.toast('首领结果未保存', err.message, '#ff6a3a', 'fail'); return false;
    }
  }

  onBossDefeated() {
    if (this.mode !== 'run' || this.state !== 'play') return;
    if(this.actorCount>1)return this._partyCheckpointOwner?.bossDefeated();
    if (this.flowVersion === 2) return this.onStageBossDefeated();
    this.flushDamageFeedback();
    const bt = (this.boss && this.boss.bossType) || this.bossType || DEFAULT_BOSS_TYPE;
    const bd = bossDef(bt);
    audio.stopMusic();
    audio.victory();
    this.hud.centerMessage(`${bd.cn} 已 陨 落`, bd.en + ' FALLEN', 4.0);
    this.shake(1.0);
    this.damageFlash(0.3);
    this.state = 'victory';
    this.resetTimeScales();
    this.archiveResources('victory');
    meta.endRun();
    // 「亲手养成」：击败 Boss 时手上有一把装满 3 个配件的枪
    if (this.player.weapons.some((w) => (w.attachments || []).length >= 3)) this._fullAttachBoss = true;
    // Boss 击败必定给一个配件（§17 的"Boss / 楼层奖励"）
    this.rollAttachmentFrom('boss', this.player.x, this.player.z + 1.4);
    this._bossWithSidearm = this.player.weapon && this.player.weapon.def && this.player.weapon.def.id === (this.hero.sidearm || 'pistol_rusty');
    this._noHitBoss = (this.player._bossHitCount | 0) === 0;
    if (!this.practice) meta.data.stats.wins++;
    // Boss Practice 是"训练房"：不刷击杀、不刷图鉴战胜、不发钟魂与成就（PASS2 §25）
    if (!this.bossPractice) {
      meta.data.stats.bossKills++;
      if (this.boss?.bossType) meta.see('boss', this.boss.bossType);   // 实体 id 只用于弹丸归属
    }
    this.telFirst('bossKilled');
    if (this.tel) this.tel.ended = 'victory';
    if (!this.practice) meta.addSouls(this.activeModifier ? 45 : 30);
    // Boss Practice 连成就也不发：它要提供的是"练机制"，不是"刷卡"。
    // 成就奖励含钟魂（正式货币），在练习局发放等于开了一条刷币捷径（PASS2 §25）。
    if (!this.bossPractice) this.checkAchievements({ atVictory: !this.practice, winWithModifier: !!this.activeModifier && !this.practice });
    meta.save(true);
    // 旧三层胜利：这里的首领才是结算标题该说的那个（不再写死"总督"）。
    this.hud.setVictoryVerdict(victoryVerdict({ kind: 'boss', boss: bd }));
    const run = this.snapshotRun('victory');
    const finishedRun = this.run;
    this.scheduleLifecycle(() => {
      if (this.state !== 'victory' || this.run !== finishedRun) return;
      this.showLifecycleResult('victory', run);
    }, 3200, {kind:'show-victory',run});
    this.projectiles.reset();
    this.enemies.forEach((e) => e.remove());
    this.enemies.length = 0;
  }

  onPlayerDeath() {
    this.flushDamageFeedback();
    // Task6：致命伤先判定"能否进入待复苏"，而不是直接结算。
    const t = lethalTransition(this.revival, this.runId);
    if (t.outcome === 'pending') {
      this.revival = t.next;
      this.revivalPending = true;
      this.resetTimeScales();
      this.weaponAssets?.suspend?.();
      this.openRevivalPanel();
      this.toast('濒死', '每局一次：接受复苏，或结束本局', '#ffd24a', 'story');
      this.saveProgress(false);
      return true;
    }
    this.finalizeDeath();
    return false;
  }

  // 最终结算（一次性）。重复回调不再重复计数 / 不再重复发成就。
  finalizeDeath() {
    if (this.mode !== 'run' || this.state !== 'play') return;
    const settled = markSettled(this.revival, this.runId);
    this.revival = settled.next;
    this.revivalPending = false;
    this.hud.closeHubPanel?.();
    this.weaponAssets?.clear(); this.weaponAssetFX?.clear();
    if (settled.already && this.state === 'dead') return;
    this.resetTimeScales();
    this.state = 'dead';
    audio.defeat();
    this.archiveResources('dead');
    meta.endRun();
    meta.data.stats.deaths++;
    meta.checkAchDone && meta.checkAchDone();
    this.checkAchievements({});
    meta.save(true);
    audio.stopMusic();
    const finishedRun = this.run;
    this.scheduleLifecycle(() => {
      if (this.state !== 'dead' || this.run !== finishedRun) return;
      this.showLifecycleResult('dead');
    }, 1500, {kind:'show-death'});
  }

  // ---------------- 一次复苏（Task6）----------------
  openRevivalPanel() {
    const p = this.player;
    const hpAfter = p ? revivalHpAfter(p.maxHp) : REVIVAL.minHeal;
    this.hud.hubPanel({
      title: '濒死 · 一次复苏',
      sub: `每局一次。接受后恢复 ${hpAfter} 点生命（最大生命的 ${Math.round(REVIVAL.healFraction * 100)}%）并获得 ${REVIVAL.protectSeconds} 秒保护；战斗现场、Boss 阶段与已获得的构筑全部保留。`,
      rows: [
        { cn: '接受复苏', desc: `恢复 ${hpAfter} 点生命 · ${REVIVAL.protectSeconds} 秒保护 · 本局不再可用`, act: 'accept' },
        { cn: '结束本局', desc: '按正常死亡结算，保留长期进度与图鉴', act: 'decline' },
      ],
      onPick: (r) => { if (r.act === 'accept') this.acceptRevival(); else if (r.act === 'decline') this.declineRevival(); },
    });
  }

  acceptRevival() {
    const p = this.player;
    if (!p) return false;
    const req = `${this.revival?.pendingId || this.runId}:accept`;
    const r = acceptRevival(this.revival, req, p.maxHp, this.runId);
    if (!r.ok) { this.toast('无法复苏', r.reason, '#ff6a3a', 'fail'); return false; }
    if (r.replay) return !this.revivalPending;
    try {
      const draft = captureSessionDraft(this);
      draft.revival = r.next;
      Object.assign(draft.player, { alive: true, hp: Math.min(p.maxHp, r.hp), iframes: Math.max(p.iframes, REVIVAL.protectSeconds), deadAnim: 0 });
      validateSession(draft);
      const result = saveStore.write(meta.data, draft);
      if (result.committed !== true) {
        if (saveStore.blocked) this.openStorageRecovery();
        this.toast('复苏未保存', `${result.error || '保存状态待确认'}；现场已保留，请重试`, '#ff6a3a', 'fail');
        return false;
      }
      this.revival = r.next; this.revivalPending = false;
      meta._dirty = false; meta._clearActive = false;
      Object.assign(p, { alive: true, hp: draft.player.hp, iframes: draft.player.iframes, deadAnim: 0 });
      if (p.rig) p.rig.group.visible = true;
      this.hud.closeHubPanel(); this.input.clearEdges();
      this.toast('复苏', `恢复 ${Math.round(r.hp)} 点生命，并获得 ${REVIVAL.protectSeconds} 秒保护`, '#8af0ff', 'story');
      return true;
    } catch (err) { this.toast('复苏未保存', err.message, '#ff6a3a', 'fail'); return false; }
  }

  declineRevival() {
    const r = declineRevival(this.revival, this.runId);
    if (!r.ok) { this.hud.closeHubPanel(); return false; }
    this.revival = r.next;
    this.finalizeDeath();
    return true;
  }

  // 结算用的"本局真实持有"快照 —— 与玩家实际拿到的东西严格一致
  snapshotRun(result) {
    const p = this.player;
    return {
      ...this.run,
      result,
      floor: this.floor,
      // 结算页的"抵达"用这一句：章节流程是"第 X 章 · 第 Y 段"，旧三层才是"第 N 层"。
      progress: runProgressLabel({ stage: this.stage, floor: this.floor }),
      coins: p.coins,
      keys: p.keys,
      weapons: p.weapons.map((w) => w.def.id),
      items: [...p.items],
      actives: [...p.actives],
      synergies: (p.stats.synergies || []).map((s) => s.cn),
      secrets: this.run.secrets || 0,
      vaults: this.run.vaults || 0,
      eliteKills: this.run.eliteKills || 0,
    };
  }

  portalByDir(dir) {
    const list = this.portals || [];
    for (const p of list) if (p.dir === dir) return p;
    return null;
  }
  traversablePortals() {
    const out = [];
    for (const p of this.portals || []) if (p.toUid && (p.secret ? p.revealed : true) && !p.combatLocked) out.push(p);
    return out;
  }

  // ---------- V3.0 世界坐标 ----------
  // 整层共用一个 pitch；起始房间固定在原点，方便标题镜头与初始取景。
  roomPitch() { return this.floorPitch(); }
  originCell() {
    if (!this._origin) {
      const st = this.dungeon && this.dungeon.list.find((r) => r.isStart);
      this._origin = st ? { gx: st.gx, gy: st.gy } : { gx: 0, gy: 0 };
    }
    return this._origin;
  }
  // 楼层统一的格距。
  //
  // **不能用 room.radius 逐房计算**：V3_PITCH(19) - V3_PITCH(13) = 12，
  // 于是 Boss 房（半径 19，全项目唯一一个非 13 的房间）会被放到**网格之外** ——
  // 它的世界坐标相对邻居整体偏移 (gx-原点gx)*12、(gy-原点gy)*12。
  // 而走廊取两个房间中心的**中点**、门洞却各自贴在自家中心上，
  // 三个轴对齐矩形在垂直方向上不再重叠 → 可行走并集断开 →
  // **玩家走到 Boss 房门口就再也进不去**（实测第三层 seed1：门洞在 x 84、
  // 走廊在 x 96、房间内区从 z −143.8 才开始，中间 43 个单位走不通）。
  //
  // 统一取标准房间半径（13）算 pitch：13+19=32 < 42，不会重叠；
  // 半径 13 的房间位置与修复前完全一致，只有 Boss 房回到正确的格位上。
  floorPitch() {
    if (!this._pitch) this._pitch = V3_PITCH(13);
    return this._pitch;
  }

  roomOffset(room) {
    const o = this.originCell();
    const pitch = this.floorPitch();
    return { ox: (room.gx - o.gx) * pitch, oz: (room.gy - o.gy) * pitch, pitch };
  }
  // 当前可行走矩形并集：房间内区 + 门洞过渡区 + 已激活的走廊
  walkRects() {
    const out = [];
    const rs = this.roomScene;
    if (rs && rs.rectWorld) {
      out.push({ x0: -rs.inner + rs.ox, x1: rs.inner + rs.ox, z0: -rs.inner + rs.oz, z1: rs.inner + rs.oz });
      // 门洞过渡区：把"房间内区"和"走廊"之间的墙厚缝隙补上，
      // 否则并集在门口断开，玩家会被夹回房间、永远走不出去。
      for (const dirKey in this.connectors) {
        if (!DIR_MAP[dirKey]) continue;
        const hw = 3;                                    // = DOOR_W/2
        // 过渡矩形必须**两端都压进**被连接的两个矩形 ≥ 2r：
        // clampToRects 会按半径 r 收缩每个矩形再判断"在不在里面"，
        // 若过渡段只有墙厚那么窄（0.8），收缩后直接变成空集 ——
        // 并集在门口断开，玩家会被夹回房间、永远走不出去。
        // 重叠量必须 > 2r（r=玩家半径 0.62 → 1.24），否则按半径收缩后仍会留缝。
        const ov = 3.0;
        const ax = rs.ox, az = rs.oz;
        if (dirKey === 'n') out.push({ x0: ax - hw, x1: ax + hw, z0: az - rs.half - ov, z1: az - rs.inner + ov });
        if (dirKey === 's') out.push({ x0: ax - hw, x1: ax + hw, z0: az + rs.inner - ov, z1: az + rs.half + ov });
        if (dirKey === 'w') out.push({ z0: az - hw, z1: az + hw, x0: ax - rs.half - ov, x1: ax - rs.inner + ov });
        if (dirKey === 'e') out.push({ z0: az - hw, z1: az + hw, x0: ax + rs.inner - ov, x1: ax + rs.half + ov });
      }
    }
    for (const k in this.connectors) out.push(this.connectors[k].rectWorld());
    // 目的地那一侧也要接上：走廊尽头停在隔壁房间的**墙平面**，
    // 而房间矩形只到内墙面，中间还差一个墙厚(0.8)。不补这段，并集在走廊尽头断开，
    // 玩家会停在走廊末端、永远走不进隔壁（checkZoneCrossing 的阈值也就永远够不到）。
    if (rs) {
      for (const k in this.connectors) {
        const off = DIR_MAP[k];
        const nb = this.dungeon.get(this.room.gx + off.dx, this.room.gy + off.dy);
        if (!nb) continue;
        const o = this.roomOffset(nb);
        const inn = (nb.radius || 13) - 0.8;
        const half = nb.radius || 13;
        out.push({ x0: -inn + o.ox, x1: inn + o.ox, z0: -inn + o.oz, z1: inn + o.oz });
        const hw = 3, ov = 3.0;
        if (k === 'n') out.push({ x0: o.ox - hw, x1: o.ox + hw, z0: o.oz + half - ov, z1: o.oz + inn + ov });
        if (k === 's') out.push({ x0: o.ox - hw, x1: o.ox + hw, z0: o.oz - inn - ov, z1: o.oz - half + ov });
        if (k === 'w') out.push({ z0: o.oz - hw, z1: o.oz + hw, x0: o.ox + half - ov, x1: o.ox + inn + ov });
        if (k === 'e') out.push({ z0: o.oz - hw, z1: o.oz + hw, x0: o.ox - inn - ov, x1: o.ox - half + ov });
      }
    }
    return out;
  }
  // 所有活动场景（房间 + 走廊）
  activeScenes() {
    const out = [];
    if (this.roomScene) out.push(this.roomScene);
    for (const k in this.connectors) out.push(this.connectors[k]);
    // 目的地房间预览也是"真实存在的几何"：弹丸会飞进去、视线能看见它，
    // 所以它的碰撞必须和当前房间同等对待，否则会出现"看得见但子弹穿墙"。
    for (const k of Object.keys(this.connectors)) {
      const nb = this.portalByDir(k)?.neighbor;
      const sc = this._residentRooms.get(nb?.uid);
      if (sc && !out.includes(sc)) out.push(sc);
    }
    if (!this._residentRooms.size && this.previewScene) out.push(this.previewScene);
    return out;
  }

  // ---------- 随机数分层 ----------
  // gr()  : gameplay 随机（影响结果）—— 必须是可复现的种子流
  // vr()  : visual 随机（火花 / 抖动 / 装饰）—— 允许非确定
  gr() { return this.grng.next(); }
  grr(a, b) { return this.grng.float(a, b); }
  gri(a, b) { return this.grng.int(a, b); }
  grc(p) { return this.grng.chance(p); }
  grPick(arr) { return this.grng.pick(arr); }
  vr() { return Math.random(); }   // visual-rng: 纯粒子表现
  vrr(a, b) { return a + Math.random() * (b - a); }   // visual-rng: 纯粒子表现

  // 存活敌人数（不含已死待回收）——门锁 / 通行判定统一用它
  aliveEnemyCount() {
    let n = 0;
    for (const e of this.enemies) if (e.alive) n++;
    return n;
  }

  syncDoorLocks() {
    if (!this.roomScene) return;
    // 必须显式布尔化：aliveEnemyCount()===0 且 this.boss===null 时，
    // `0 > 0 || (null && ...)` 会得到 null 而不是 false，传进 Portal 会造成类型不一致。
    const locked = !!(this.aliveEnemyCount() > 0 || this.pendingInRoom() > 0 || (this.boss && this.boss.alive));
    // 注意：**不能**因为"锁状态没变"就跳过 setDoorsOpen。
    // 换房会新建一个 RoomScene，它的门栅栏碰撞盒默认是 solid（move:true）。
    // 旧写法 `if (this._doorsLocked === locked) return;` 会让新房间继承上一间房的
    // "已同步过"状态，于是门永远打不开 —— 表现出来就是玩家被卡在门口、速度被抹成 0
    // （V3.0 无缝连接实测踩到：走廊就在眼前却走不进去）。
    // setDoorsOpen 只是给 ≤4 个碰撞盒写布尔，幂等且极廉价，每帧同步完全没问题。
    const changed = this._doorsLocked !== locked;
    this._doorsLocked = locked;
    // 战斗锁门不改变房间连接关系，只改 Portal 上的一个标志位（专家建议第三节）
    for (const po of this.portals || []) po.combatLocked = locked;
    this.roomScene.setDoorsOpen(!locked);
    if (locked && changed) { audio.doorLock(); this.shake(0.08); }
  }

  // ================= 房间切换（V3.0 无缝连接）=================
  // 相邻房间之间是**真实存在于世界里的走廊**；玩家走过去的过程中没有任何坐标跳变。
  // 旧实现是"靠近门 → 0.22s 淡入淡出 + 瞬时换房"，本版本彻底移除该路径。
  // 楼梯 / 楼层切换仍然走 E 交互（允许）。

  disposeConnectors() {
    if (!this._residentConnectors.size) for (const k in this.connectors) this.connectors[k].dispose();
    this.connectors = {};
  }

  // 根据玩家与门的距离按需建立 / 释放走廊。
  // 战斗锁定期间不建立走廊 —— 这就是"另一侧的战斗门关闭、无法从走廊逃离战斗"（3.4）。
  updateConnectors(dt) {
    const rs = this.roomScene;
    const p = this.player;
    if (!rs || !p) return;
    this.syncSecretVisibility();
    if (this._residentConnectors.size) {
      this.connectors = {};
      for (const po of this.portals || []) {
        if (!po.traversable || !po.neighbor) continue;
        const key = [this.room.uid, po.neighbor.uid].sort().join('|');
        const conn = this._residentConnectors.get(key);
        if (conn) { conn.portal = po; this.connectors[po.dir] = conn; }
      }
      return;
    }
    for (const dirKey of ['n', 's', 'e', 'w']) {
      const po = this.portalByDir(dirKey);
      // 可通行性完全由 Portal 回答（普通门 / 已揭示的暗门 / 战斗锁门都收在它里面）
      if (!po || !po.traversable || !po.neighbor) {
        if (this.connectors[dirKey]) { this.connectors[dirKey].dispose(); delete this.connectors[dirKey]; }
        continue;
      }
      const th = po.threshold;
      const dist = Math.abs(po.axis === 'z' ? (th.z - p.z) : (th.x - p.x));
      if (!this.connectors[dirKey]) {
        // 生成阈值不能太小。踩过的坑：出口房的楼梯挡在门前时，Portal 的 approachFrom
        // 会被退到"从房间中心可直达"的位置（否则路径被楼梯截断），那一退往往就退到
        // 离门 8~9 单位 —— 阈值设 7.5 就永远不会生成走廊，跨房必然失败。
        // 放宽到 12 同时也给 Streaming Buffer 更长的预热窗口（本版本的设计意图）。
        if (dist > 12) continue;                         // 还离得远，先不建
        this.connectors[dirKey] = this.makeConnector(dirKey, po.neighbor, po);
        // 走廊出现的这一刻就是 Streaming Buffer 的开始：把目的地房间排进预热队列
        this.queuePrewarm(po.neighbor);
      } else if (dist > 14 && !this.playerInConnector(2.0)) {
        this.connectors[dirKey].dispose(); delete this.connectors[dirKey];
      }
    }
    // 走廊全部释放后，目的地房间预览也该收起来（否则玩家回房间深处后，
    // 隔壁那间房还一直挂在场景里占显存、还参与碰撞）。
    if (!Object.keys(this.connectors).length) this.dropPreview();
  }

  makeConnector(dirKey, nb, portal = null) {
    const cached = this._residentConnectors.get([this.room.uid, nb.uid].sort().join('|'));
    if (cached) { cached.portal = portal; return cached; }
    const rs = this.roomScene;
    const a = { x: rs.ox, z: rs.oz };
    const bo = this.roomOffset(nb);
    const b = { x: bo.ox, z: bo.oz };
    const axis = Math.abs(b.z - a.z) > Math.abs(b.x - a.x) ? 'z' : 'x';
    const cx = (a.x + b.x) / 2, cz = (a.z + b.z) / 2;
    const total = axis === 'z' ? Math.abs(b.z - a.z) : Math.abs(b.x - a.x);
    const len = Math.max(4, total - rs.half * 2);
    const conn = new ConnectorScene(this, {
      axis, ox: cx, oz: cz, len, floor: this.floor,
      rngSeed: (this.room.seed ^ (dirKey.charCodeAt(0) * 2654435761)) >>> 0,
    });
    conn.portal = portal;             // 走廊挂在它的 Portal 上，供查询与诊断
    return conn;
  }

  // 玩家是否"在走廊里或贴着走廊"。
  // 这里必须用**正向余量**：曾经写成 -0.4（要求玩家完全在走廊内），
  // 于是玩家走到走廊尽头那一瞬间判定失败 → 走廊被释放 → 可行走并集塌缩回房间 →
  // 玩家被 clampToRects 一路夹回房间内（实测出现 17 单位的瞬移）。
  playerInConnector(margin = 2.0) {
    const p = this.player;
    for (const k in this.connectors) {
      const c = this.connectors[k];
      if (c.containsWorld(p.x, p.z, margin)) return true;
    }
    return false;
  }

  // 玩家是否已经踏进隔壁房间（用真实世界坐标判断，不再用"离门多近"）
  checkZoneCrossing() {
    if (this.transition || this.state !== 'play' || this.paused || this.buildOpen) return;
    const p = this.player;
    if (!p || !this.room) return;
    const cands = [];
    for (const k in this.connectors) {
      const po = this.portalByDir(k);
      const nb = po && po.neighbor;
      if (nb) cands.push({ room: nb, dirKey: k });
    }
    for (const c of cands) {
      const nb = c.room;
      const o = this.roomOffset(nb);
      const lim = nb.radius - 1.2;
      if (Math.abs(p.x - o.ox) < lim && Math.abs(p.z - o.oz) < lim) {
        this.enterNeighbourRoom(nb, c.dirKey);
        return;
      }
    }
  }

  enterNeighbourRoom(nb, dirKey) {
    const backDir = DIR_MAP[dirKey].opp;
    audio.doorOpen();
    // 保持世界坐标：玩家是从走廊里"走进来"的，位置本来就在房间内
    this.buildRoom(nb, backDir, { keepPos: true });
  }

  // ---------- Streaming Buffer：分帧预热目的地房间 ----------
  queuePrewarm(room) {
    if (!room) return;
    if (this._residentRooms.has(room.uid)) return;
    if (!this._prewarmed) this._prewarmed = new Set();
    if (this._prewarmed.has(room.uid)) return;
    if (!this._prewarmQueue) this._prewarmQueue = [];
    if (!this._prewarmQueue.some((r) => r.uid === room.uid)) this._prewarmQueue.push(room);
  }
  runPrewarm(budgetMs = 6) {
    if (!this._prewarmQueue || !this._prewarmQueue.length) return;
    const t0 = performance.now();
    while (this._prewarmQueue.length && performance.now() - t0 < budgetMs) {
      const room = this._prewarmQueue.shift();
      if (this._prewarmed.has(room.uid)) continue;
      this._prewarmed.add(room.uid);
      // 【曾经的行为】建一次再**立刻拆掉**，只为了把几何 / 材质 / 贴图灌进缓存。
      // 后果：玩家站在走廊里，下一间房根本不存在 —— 看起来就是"走进一片黑暗"
      // （走廊和房间内区本来就在可行走并集里，玩家能走过去，但那边什么都没有）。
      //
      // 【现在】把这次构建**保留**成"目的地房间预览"，同时照样完成缓存预热 ——
      // 一份构建成本同时满足"看得见"和"不卡顿"两件事。
      // 用 _warming = true 构建：RoomScene.buildLights() 在预热期不会去动
      // 全局灯光池（池子恒定 17 盏这个硬约束不能被第二个房间破坏）。
      // 没有道具灯并不要紧 —— 场景另有 ambient 0.35 + hemisphere 0.45 + 定向光 0.9，
      // 房间轮廓与陈设清晰可见，玩家走过去时会自然地"被自己的光逐步照亮"。
      this.keepPreview(room);
    }
  }

  // 建出并保留目的地房间的可见预览（同一次构建兼作缓存预热）。
  keepPreview(room) {
    if (!room) return;
    if (this._residentRooms.has(room.uid)) { this.previewScene = this._residentRooms.get(room.uid); this.previewRoom = room; return; }
    if (this.previewRoom === room && this.previewScene) return;
    this.dropPreview();
    const off = this.roomOffset(room);
    const prev = this._warming;
    this._warming = true;
    try {
      this.previewScene = new RoomScene(this, room, off.ox, off.oz);
      // 新场景的门栅栏碰撞盒默认是 solid（move:true）——那是给"当前房间战斗锁门"用的。
      // 预览房只是"看得见的那一间"，玩家必须能沿着走廊走进去，所以把它的门全部打开。
      // 不打开的话，走廊会在预览房门口被一堵看不见的墙截断（实测被挡在 z≈-28 走不过去）。
      this.previewScene.setDoorsOpen(true);
      this.previewRoom = room;
    } catch (e) {
      recordRoomDiagnostic(this, 'error', { roomUID: room.uid, message: `prewarm: ${e.message}` });
      this.previewScene = null; this.previewRoom = null;   // 预览失败不影响主流程
    }
    this._warming = prev;
  }

  dropPreview() {
    if (this.previewScene && !this._residentRooms.has(this.previewRoom?.uid)) { try { this.previewScene.dispose(); } catch (e) { /* ignore */ } }
    this.previewScene = null;
    this.previewRoom = null;
  }
  prewarmStats() {
    return { queued: (this._prewarmQueue || []).length, done: (this._prewarmed || new Set()).size };
  }

  updateTransition(dt) {
    const tr = this.transition;
    if (!tr) { this.checkZoneCrossing(); return; }
    tr.t += dt;
    if (tr.phase === 'out') {
      if (tr.t >= tr.dur) {
        this.buildRoom(tr.room, DIR_MAP[tr.dirKey].opp);
        tr.phase = 'in'; tr.t = 0;
      }
    } else if (tr.t >= tr.dur) {
      this.transition = null;
    }
  }

  transitionAlpha() {
    const tr = this.transition;
    if (!tr) return 0;
    const k = Math.min(1, tr.t / tr.dur);
    return tr.phase === 'out' ? k : 1 - k;
  }

  // ================= 交互 =================
  // 每一种交互物拥有**自己的固定触发半径**，再在其中取"真实距离最近"的那一个。
  // 旧实现是"当前最近距离 + 各类额外 margin"，会让后遍历到的远处物体覆盖近处物体，
  // 并造成"靠近没提示、走远反而提示"的错乱。
  interactables() {
    const s = this.roomScene;
    const out = [];
    if (!s) return out;
    // 大厅：功能点就是可交互物（与房间道具同一套字段，最近目标 / 距离门限逻辑完全复用）
    if (this.mode === 'hub') {
      for (const pr of s.props) {
        if (pr.kind !== 'hub') continue;
        out.push({ type: 'hub', prop: pr, id: pr.hub, x: pr.worldX, z: pr.worldZ, radius: pr.radius, label: pr.label, act: pr.act });
      }
      return out.concat(this.groundInteractables());
    }
    for (const prop of s.props) {
      if (prop.bossReward && !this.room.cleared) continue;
      if (prop.kind === 'chest' && !prop.opened) {
        const rules = chestRules(prop), locked = rules.locked;
        out.push({
          type: 'chest', prop, x: prop.worldX, z: prop.worldZ, radius: 2.5,
          label: `${rules.name}${locked ? ' · 上锁' : ' · 未锁'}`,
          act: '打开', need: rules.keyCost,
        });
      } else if (prop.kind === 'stairs') {
        out.push({ type: 'stairs', prop, x: prop.worldX, z: prop.worldZ, radius: 3.4, label: '通往下一层的阶梯', act: '下降' });
      } else if (prop.altar) {
        out.push({ type: 'altar', prop, x: prop.worldX, z: prop.worldZ, radius: 2.9, label: this.room.event ? this.room.event.cn : '深渊馈赠', act: '使用' });
      } else if (prop.kind === 'table' && !prop.flipped && prop.flip === 0) {
        out.push({ type: 'table', prop, x: prop.worldX, z: prop.worldZ, radius: 3.1, label: '桌子', act: '翻倒作为掩体' });
      }
    }
    // 商店：全部由**只读模型**驱动（getShopView）。交互层不再直接读可变库存，
    // 真正的裁决仍在 purchaseShopOffer —— 这里只负责"告诉玩家有什么、多少钱"。
    const shopView = getShopView(this);
    if (shopView && s.shopSlots) {
      for (const o of shopView.offers) {
        if (o.sold) continue;
        const slot = s.shopSlots[o.slotIndex];
        if (!slot) continue;
        out.push({
          type: 'shop', slot, x: slot.x, z: slot.z, radius: 2.5,
          label: `${o.cn} · ${o.price} 金币`,
          act: this.player.coins >= o.price ? '购买' : '金币不足',
          disabled: this.player.coins < o.price,
        });
      }
      // 商店服务台（PASS2 §29）：有次数上限的金币出口 —— 补弹 / 急救 / 刷新库存。
      // 缺钱、售罄、弹满、满血时一律显示为不可用，并且**不扣费**（判定在 buyService/purchaseShopOffer 里）。
      for (const sv of shopView.services) {
        const def = SERVICE_MAP[sv.id];
        const slot = (s.serviceSlots || []).find((x) => x.id === sv.id);
        if (!def || !slot) continue;
        const afford = this.player.coins >= sv.price;
        out.push({
          type: 'service', slot, id: sv.id, x: slot.x, z: slot.z, radius: 2.4,
          label: `${def.cn} · ${sv.price} 金币（剩余 ${sv.left} 次）`,
          act: sv.left <= 0 ? '已售罄' : (afford ? def.act : '金币不足'),
          disabled: sv.left <= 0 || !afford,
        });
      }
    }
    out.push(...this.groundInteractables());
    return out;
  }

  groundInteractables() {
    const out = [];
    // 地面武器和配件：主动拾取（按 E），不再自动吸附。
    // 武器槽只有 2 个，捡枪意味着可能要换掉手上那把 —— 这是有代价的选择，必须玩家自己按。
    // （金币 / 纯正面遗物 / 治疗 等没有"选错"风险的物件仍然自动拾取，见 Pickups.update 的 manual 分支。）
    for (const pu of (this.pickups ? this.pickups.list : [])) {
      if(this.actorCount===2&&pu?.recipientId&&pu.recipientId!==this.playerId)continue;
      if (!pu || !(['weapon', 'attachment'].includes(pu.kind) || this.experiment&&pu.kind==='consumable' || pu.kind === 'item' && relicRisk(pu.id,this.player).risky) || pu.shopSlot || pu.collected) continue;
      if (!pickupReady(pu) || !pickupPathClear(this,this.player.x,this.player.z,pu.x,pu.z)) continue;
      if(pu.kind==='consumable') {
        out.push({type:'groundConsumable',prop:pu,x:pu.x,z:pu.z,radius:2.2,label:`${Consumables.getItemDef(pu.id)?.name||'药剂'} ×${pu.amount}`,act:'拾取消耗品'});continue;
      }
      if (pu.kind === 'item') {
        out.push({type:'groundRelic',prop:pu,x:pu.x,z:pu.z,radius:2.2,label:ITEM_MAP[pu.id]?.cn || '遗物',act:'查看收益 / 代价'});
        continue;
      }
      if (pu.kind === 'attachment') {
        const a = ATTACH_MAP[pu.attId || pu.id];
        out.push({ type: 'groundAttachment', prop: pu, x: pu.x, z: pu.z, radius: 2.2, label: a?.cn || '配件', act: this.player.spareAttachments.length >= this.player.spareCap() ? '选择替换备用配件' : '拾取配件' });
        continue;
      }
      const full = this.player.weapons.length >= this.player.weaponSlots();
      const wd = savedWeaponDefinition(pu);
      const atts = (pu.attachments || []).length;
      out.push({
        type: 'groundWeapon', prop: pu, x: pu.x, z: pu.z, radius: 2.2,
        label: `${wd ? wd.cn : '武器'}${atts ? '（含改装）' : ''}`,
        act: full ? '换掉当前武器' : '拾取',
      });
    }
    return out;
  }

  nearestInteractable() {
    const p = this.player;
    let best = null, bd = Infinity;
    for (const c of this.interactables()) {
      const d = Math.hypot(p.x - c.x, p.z - c.z);
      if (d > c.radius) continue;      // 各自的固定半径
      if (d < bd) { bd = d; best = c; } // 只有真正更近才替换
    }
    return best;
  }

  // 商店 / 交互提示的商品名。PASS3 §37：带一个**推导出的字形**，
  // 让玩家在不读完整文本时也能一眼分出"这是什么类别的东西"。
  // ------------------------------------------------------------
  //  难度档（PASS2 §1.6 / §32）
  //  与挑战词条同为 g.mod_ 上的字段，但**层次不同**：
  //  词条改规则（弹药/掉落机制），难度只改强度倍率。
  //  standard 的三项倍率恒为 1.0 —— 有断言保证它逐位等于今日行为。
  // ------------------------------------------------------------
  difficultyDef() { const id = (this.mode === 'run' && this.runPolicy?.difficulty) ? this.runPolicy.difficulty : meta.difficulty; return DIFFICULTY[id] || DIFFICULTY[DEFAULT_DIFFICULTY]; }

  applyDifficulty() {
    const d = this.difficultyDef();
    this.mod_ = this.mod_ || {};
    this.mod_.enemyHpMul = (this.mod_.enemyHpMul || 1) * d.enemyHpMul;
    this.mod_.enemyDmgMul = (this.mod_.enemyDmgMul || 1) * d.enemyDmgMul;
    this.mod_.dropMul = (this.mod_.dropMul || 1) * d.dropMul;
    this.mod_.soulMul = (this.mod_.soulMul || 1) * d.soulMul;
    this.difficultyId = (this.mode === 'run' && this.runPolicy?.difficulty) ? this.runPolicy.difficulty : meta.difficulty;
    return this.mod_;
  }

  shopLabel(item) {
    const gl = (k) => glyphSvg(k);
    if (item.kind === 'weapon') { const d = pregeneratedWeaponDefinition(item); return `${gl(glyphKeyForWeapon(d))}${d?.cn || '武器'}`; }
    if (item.kind === 'item') { const d = ITEM_MAP[item.id]; return `${gl(glyphKeyForItem(d))}${d?.cn || '遗物'}`; }
    if (item.kind === 'active') { const d = ACTIVE_MAP[item.id]; return `${gl(glyphKeyForActive(d))}${d?.cn || '技能'}`; }
    const basic = { heal: 'heart', key: 'key', ammo: 'ammo', armor: 'shield' };
    return `${gl(basic[item.kind] || 'generic')}${{ heal: '治疗包', key: '钥匙', ammo: '弹药箱', armor: '护甲板' }[item.kind] || '补给'}`;
  }

  interactHint() {
    const heroKey = controlLabel(this.input, 'hero_skill');
    const it = this.nearestInteractable();
    if (!it) {
      const w=this.hero?.ruleVersion===3&&this.hero.id==='scavenger'&&this.nearestGroundWeapon(this.player);
      return w?`<b>${heroKey}</b> ${this.scavengeWeaponLabel(w)} · 拆解得 2–3 废料（再次 ${heroKey} 确认） · 当前废料 ${this.player.scrap|0}`:'';
    }
    if (it.type === 'chest' && it.prop.opened) return '';
    if (!it.act) return '';
    let extra = '';
    if (it.type === 'chest') { const r = chestRules(it.prop); extra = `（需 ${r.keyCost} 把 / 持有 ${this.player.keys} 把）<br><span class="interaction-preview">${r.reward}${this.player.keys < r.keyCost ? ' · 可暂留，购得钥匙后回来' : ''}</span>`; }
    if (it.type === 'shop') extra = `（持有 ${this.player.coins}）<br><span class="interaction-preview">${this.equipmentInfo(it.slot.item)}</span>`;
    if (it.type === 'groundWeapon') extra = `<br><span class="interaction-preview">${this.equipmentInfo({ kind: 'weapon', id: it.prop.id }, it.prop)}</span>`;
    if(it.type==='groundWeapon'&&this.hero?.ruleVersion===3&&this.hero.id==='scavenger')extra+=`<br><b>${heroKey}</b> 拆枪：${this.scavengeWeaponLabel(it.prop)} · 2–3 废料 · 当前 ${this.player.scrap|0}；${this.player.c2Integration?.preview && this.player.c2Integration.preview.id===it.prop.c2ScrapId?`再按 ${heroKey} 确认`:`首次 ${heroKey} 预览，再次 ${heroKey} 确认`}`;
    if (it.type === 'groundRelic') extra = `<br><span class="interaction-preview">${[...relicRisk(it.prop.id,this.player).costs,...relicRisk(it.prop.id).conditional].join('；')}</span>`;
    if (it.type === 'groundAttachment') extra = `<br><span class="interaction-preview">${ATTACH_MAP[it.prop.attId || it.prop.id]?.desc || ''} · 备用库 ${this.player.spareAttachments.length}/${this.player.spareCap()} · Tab 可丢弃/装配</span>`;
    if (it.type === 'altar') extra = `<br><span class="interaction-preview">${this.room.event?.desc || '一次性的随机馈赠'} · E 查看并确认</span>`;
    return `<b>${controlLabel(this.input, 'interact')}</b> ${it.act} · ${it.label} ${extra}`;
  }

  interact() {
    const it = this.nearestInteractable();
    if (!it) return;
    if (it.type === 'chest') return this.openChest(it.prop);
    if (it.type === 'stairs') return this.useStairs();
    if (it.type === 'altar') return this.previewAltar();
    if (it.type === 'table') {
      it.prop.flipped = true;
      audio.impact(true);
      this.particles.smoke(it.prop.worldX, 0.6, it.prop.worldZ, 4, '#6a5a4a', 0.4, 0.6);
      this.toast('翻倒桌子', '形成掩体，可阻挡弹幕', '#8fa2b0', 'quick');
      return;
    }
    if (it.type === 'shop') return this.buy(it.slot, it.disabled);
    if (it.type === 'service') return this.buyService(it.id, it.slot);
    if (it.type === 'groundWeapon') return this.pickups.collect(it.prop,this.playerId||'player');   // 主动拾取地面武器
    if (it.type === 'groundConsumable') return collectConsumable(this,it.prop);
    if (it.type === 'groundRelic') return this.offerRelicPickup(it.prop);
    if (it.type === 'groundAttachment') return this.pickups.collect(it.prop,this.playerId||'player');
    if (it.type === 'hub') return this.useHub(it.id);
  }

  openChest(prop) { return commitChestOpen(this, prop); }

  equipmentInfo(item, instance = null) {
    const p = this.player;
    if (item.kind === 'weapon') {
      let src;
      try { src = instance ? savedWeaponDefinition({...instance,id:item.id}) : pregeneratedWeaponDefinition(item); }
      catch { return '武器属性无法读取'; }
      if (!src) return '武器属性无法读取';
      const d = p.hero?.augment === 'spellcore' && !src.isSpell ? spellFromWeapon(src) : src;
      const current = p.weapon, mult = instance?.dmgMul || 1;
      const dmg = (d.damage * mult).toFixed(1), rate = d.rate.toFixed(2), pellets = d.pellets || 1;
      const delta = current ? `；对比当前 ${current.def.cn}：基础单发 ${(d.damage * mult - current.def.damage * (current.dmgMul || 1)).toFixed(1)}，射速 ${(d.rate - current.def.rate).toFixed(2)}` : '';
      const slots = p.weaponSlots(), full = p.weapons.length >= slots;
      const old = full ? `；满${slots}槽，将替换当前 ${current.def.cn}，旧武器与配件落地` : '；占用一个空武器槽';
      const owned = p.weapons.some(w => w.def.id === d.id);
      const duplicate = instance && ((instance.attachments || []).length || (instance.dmgMul && instance.dmgMul !== 1))
        ? '；已拥有同名武器，改装实例留在地面；先换出当前枪再取回' : '；已拥有同名武器，转为 8 金币';
      const ammo = d.ammoType === 'mana' ? '法力（自动回复）' : d.ammoType ? `${d.ammoType === 'rocket' ? '爆炸' : d.ammoType === 'energy' ? '能量' : '特殊'}弹药，储备 ${d.ammoMax}` : '无限储备弹药';
      const mods = instance?.attachments?.length ? `；携带配件 ${instance.attachments.map(a => ATTACH_MAP[a]?.cn || a).join('、')}` : '';
      return `${d.cn} · 基础每弹 ${dmg}${pellets > 1 ? ` × ${pellets} 颗` : ''} · 每秒 ${rate} 次 · 弹容 ${d.mag} · 装填 ${d.reload} 秒 · ${ammo}<br>${d.desc}${d.assetTradeoff ? `<br>限制：${d.assetTradeoff}` : ''}${mods}${delta}${owned && ![2,3].includes(d.weaponAssetVersion) ? duplicate : old}。数值为武器基础值，英雄/遗物/配件另行叠加。`;
    }
    if (item.kind === 'item') return ITEM_MAP[item.id]?.desc || '遗物';
    if (item.kind === 'active') { const d = ACTIVE_MAP[item.id]; return d ? `${d.desc} · 基础冷却 ${d.cd} 秒 · ${p.actives.includes(item.id) ? '已拥有，转为 10 金币' : `加入主动栏并切换为当前 ${controlLabel(this.input,'active')} 技能`}` : '主动技能'; }
    return { heal: `回复 1 点当前生命（${p.hp}/${p.maxHp}）；英雄治疗机制可能转化效果`, key: '获得 1 把钥匙，用于上锁宝箱', armor: `获得最多 1 点护甲（当前 ${p.armor}/5）`, ammo: '各把有限弹药武器补充该武器定义的一份弹药；法术核心补充法力' }[item.kind] || '';
  }

  previewAltar() {
    const ev = this.room.event;
    if (!ev) return;
    const p = this.player, used = p[`_used_${this.room.uid || this.room.id}`];
    const why = used ? '本间祭坛已使用' : ((ev.id === 'shrine_blood' || ev.id === 'shrine_armor') && p.maxHp <= 1) ? '生命上限不足（须大于 1）' : ev.id === 'shrine_gold' && p.coins < 25 ? '金币不足（需要 25）' : ev.id === 'shrine_armor' && p.armor >= 5 ? '护甲已满（5）' : '';
    this.hud.hubPanel({ title: ev.cn, sub: `${ev.desc} 当前生命 ${p.hp}/${p.maxHp} · 护甲 ${p.armor}/5 · 金币 ${p.coins}。取消不会扣资源或消耗机会。`,
      rows: [{ cn: '接受契约', desc: why || '确认执行以上代价与收益', disabled: !!why }, { cn: '取消', desc: '取消：不扣资源，也不消耗这次机会' }],
      onPick: r => { this.hud.closeHubPanel(); if (r.cn === '接受契约') { this.useAltar(); this.saveProgress(false); } } });
  }

  // ---------------- 原子商店事务（Task5）----------------
  nextShopRequestId() {
    // Failed UI attempts have no receipt. After a cold continue the successful
    // transaction count can therefore be below a committed request's suffix.
    // The durable journal, not the transient counter, owns request uniqueness.
    let requestId;
    do {
      this._shopSeq = (this._shopSeq || 0) + 1;
      requestId = `${this.runId}:req:${this._shopSeq}`;
    } while (hasReceipt(this.shopTx?.receipts, requestId));
    return requestId;
  }

  _shopFail(reason, quiet = false) {
    if (!quiet) { audio.ui('error'); this.toast('无法购买', reason, '#ff6a3a', 'fail'); }
    return { ok: false, reason };
  }

  shopViewData() { return getShopView(this); }

  // 唯一交易入口：校验 → 纯计划 → 纯 draft 保存 → 才发布。拒绝/失败路径 live 零变化。
  purchaseShopOffer(req) {
    const j = this.shopTx;
    if (!j || j.runId !== this.runId) return this._shopFail('交易账本缺失');
    const { shopId, revision, offerId, requestId, replaceIndex } = req || {};
    if (![shopId, offerId, requestId].every((v) => typeof v === 'string' && v && v.length <= 180)) return this._shopFail('请求格式无效');
    if (!Number.isInteger(revision) || revision < 0) return this._shopFail('请求版本无效');
    if (replaceIndex !== undefined && replaceIndex !== null && (!Number.isInteger(replaceIndex) || replaceIndex < 0)) return this._shopFail('替换目标无效');
    // 1) 回执优先于 stale/库存 —— 已成功的请求在玩家走远后仍是成功。
    const prior = hasReceipt(j.receipts, requestId);
    if (prior) {
      if (prior.fingerprint !== fingerprintOf(shopId, revision, offerId, replaceIndex)) return this._shopFail('请求编号与内容不一致');
      return { ok: true, replay: true, receipt: prior };
    }
    if (this.storageFrozen()) return this._shopFail('保存状态待确认');
    if (j.receipts.length >= SHOP_JOURNAL_MAX) return this._shopFail('交易记录已满，请结束本局再交易');
    // 2) 世界校验
    if (this.mode !== 'run' || this.state !== 'play' || this.paused || this.panelOpen?.() || this.revivalPending || !this.player?.alive) return this._shopFail('当前不能交易');
    if (shopId !== shopIdFor(this)) return this._shopFail('不在该商店');
    if (revision !== shopRevision(j, shopId)) return this._shopFail('请求已过期，请重新打开商店');
    const kind = offerId.startsWith('service:') ? 'service' : 'offer';
    // 3) 纯计划（不触碰 live）
    let planned;
    try { planned = planPurchase(this, { offerId, kind, replaceIndex }); }
    catch (err) { return this._shopFail('交易失败：' + err.message); }
    // 满武器槽：委托 UI 明确确认要换掉哪一把（四字段 API 之外的可选字段）。
    if (planned.needReplace) { this._askReplaceWeapon(offerId, planned.slots); return { ok: false, reason: '需要确认替换哪把武器', needReplace: true }; }
    if (!planned.ok) return this._shopFail(planned.reason);
    // 4) 纯 draft + 校验 + **先保存**
    try {
      const draft = captureSessionDraft(this);
      const { journal, receipt } = makeReceipt(j, { requestId, shopId, revision, offerId, kind, price: planned.price, credit: planned.credit, replaceIndex, result: { delivery: planned.delivery || 'service', service: planned.service || null } });
      const rerollStockArr = planned.plan.reroll ? rerollStock(this.room.seed, (this.room.content.servicesUsed?.reroll) || 0, this.floor, {variant:this.room.content.shopVariant || 'four-service',category:this.room.content.directedCategory || 'key'}) : null;
      const metaDraft = structuredClone(meta.data);
      const projection = applyPlanToDraft(draft, this, planned.plan, { journal, rerollStock: rerollStockArr, metaDraft, price: planned.price });
      validateSession(draft);
      const res = saveStore.write(metaDraft, draft);
      if (res.committed !== true) { if (saveStore.blocked) this.openStorageRecovery(); this.toast('交易待确认', res.error || '保存失败；这次交易还没有生效', '#ff6a3a', 'fail'); return { ok: false, reason: res.error || '保存失败' }; }
      // 5) 发布（业务结果已经落盘）
      try { this._publishPurchase(planned, { journal, receipt, rerollStockArr, draft, metaDraft, projection }); }
      catch (err) { saveStore.blockWrites(); this.openStorageRecovery(); return { ok: true, receipt, recoveryRequired: true }; }
      return { ok: true, receipt };
    } catch (err) {
      this._shopFail('交易失败', true);
      this.toast('交易失败', `${err.message}（未扣费）`, '#ff6a3a', 'fail');
      return { ok: false, reason: err.message };
    }
  }

  // 发布：只把"已经保存过的结果"写进 live 对象，不再产生新的业务决策。
  _publishPurchase(planned, { journal, rerollStockArr, draft, metaDraft, projection }) {
    const plan = planned.plan;
    // Notifications may observe real grants, but committed data is authoritative.
    if (plan.ammoAll) {
      const gain = draft.player.weapons.reduce((n,w,i) => n + Math.max(0, Number.isFinite(w.reserve) ? w.reserve - (this.player.weapons[i]?.reserve || 0) : 0), 0);
      if (gain) this.telAmmo('in', gain);
    }
    publishAcquisition(this, draft);
    this.shopTx = journal;
    this.buildSupply = structuredClone(draft.buildSupply);
    meta.data = metaDraft; meta._dirty = false; meta._clearActive = false;
    publishDrops(this, projection.drops);
    this.roomStates.set(this.room.uid, structuredClone(draft.roomStates[this.room.uid]));
    if (plan.serviceUsed) markServiceUsed(this.room.content, plan.serviceUsed);
    if (plan.reroll && rerollStockArr) {
      this.room.content.shopStock = rerollStockArr.map(x => ({ ...x }));
      this.roomScene.shopSlots.forEach((slot,i) => { slot.item = { ...rerollStockArr[i] }; slot.sold = false; });
      this.roomScene.shopStock = rerollStockArr.map(x => ({ ...x }));
      this.spawnShopSlots();
    }
    if (plan.soldSlot !== undefined) {
      const slot = this.roomScene.shopSlots[plan.soldSlot];
      slot.sold = true; this.pickups.removeAttachedTo(slot);
      this.particles.sparkle(slot.x, 1.6, slot.z, '#9dff5a', 12, 2.6);
    }
    audio.ui('buy');
    const label = planned.delivery === 'recycle' ? `回收 · 金币 +${planned.credit}` : (this.shopItemLabel(planned) || '交易完成');
    this.toast('购买完成', `${label}（−${planned.price} 金币）`, '#ffd27a', 'quick');
  }

  shopItemLabel(planned) {
    const p = planned.plan;
    if (p.weapon) return p.weapon.def?.cn;
    if (p.item) return ITEM_MAP[p.item]?.cn;
    if (p.active) return ACTIVE_MAP[p.active]?.cn;
    if (p.attachment) return ATTACH_MAP[p.attachment]?.cn;
    return null;
  }

  // 满武器槽时的显式替换确认（绝不静默换枪）。
  _askReplaceWeapon(offerId, slots) {
    const p = this.player;
    if (!p) return;
    const rows = p.weapons.map((w, i) => ({ cn: `换下 · ${w.def.cn}`, desc: `${w.def.desc}（旧枪与它的配件会掉在地上）`, index: i }));
    rows.push({ cn: '取消购买', desc: '保留全部武器与金币' });
    this.hud.hubPanel({
      title: '武器槽已满 · 选择替换',
      sub: `当前 ${p.weapons.length}/${slots} 槽。选择要换下的一把。`,
      rows,
      onPick: (r) => {
        this.hud.closeHubPanel();
        if (r.index === undefined) return;
        const slot = this.roomScene.shopSlots[Number(String(offerId).slice(5))];
        this.buy(slot, false, r.index);
      },
    });
  }

  buy(slot, disabled, replaceIndex) {
    if (!slot || slot.sold) return;
    const idx = (this.roomScene?.shopSlots || []).indexOf(slot);
    if (idx < 0) return;
    if (disabled) { audio.ui('error'); this.toast('金币不足', `需要 ${slot.item.price} 金币（持有 ${this.player.coins}）`, '#ff6a3a', 'fail'); return; }
    return this.purchaseShopOffer({ shopId: shopIdFor(this), revision: shopRevision(this.shopTx, shopIdFor(this)), offerId: `slot:${idx}`, requestId: this.nextShopRequestId(), replaceIndex });
  }

  updatePendingLoot(dt) {
    if(this.partySessionStore?.frozen)return;
    for (let i = this.pendingLoot.length - 1; i >= 0; i--) {
      const q = this.pendingLoot[i]; if (q.roomId !== this.room?.uid) continue;
      q.t -= dt; if (q.t > 0) continue;
      const needed = q.kind === 'coins' && !q.opts.supplyKey ? Math.min(5,Math.max(1,Math.round(Math.max(1,Math.round(q.opts.amount * (this.mod_?.coinMul || 1))) / 3))) : 1;
      if (this.pickups.list.length + needed > 1000) continue;
      const before = new Set(this.pickups.list), rng = this.grng.s;
      try {
        if(this.partySessionStore&&q.opts.offerId)this.pickups.spawn(q.kind==='coins'?'coin':q.kind,q.x,q.z,q.opts);
        else if (q.kind === 'coins' && q.opts.supplyKey) this.pickups.spawn('coin', q.x, q.z, { ...q.opts, amount: Math.max(1, Math.round(q.opts.amount * (this.mod_?.coinMul || 1))) });
        else if (q.kind === 'coins') this.spawnCoins(q.x, q.z, q.opts.amount,q.opts);
        else this.pickups.spawn(q.kind, q.x, q.z, q.opts);
        this.pendingLoot.splice(i, 1);
      } catch (error) {
        for (const p of [...this.pickups.list]) if (!before.has(p)) this.pickups.remove(p);
        this.grng.s = rng; // Keep the same queued reward for a later retry.
      }
    }
  }

  useAltar() {
    const ev = this.room.event;
    const p = this.player;
    if (!ev) return;
    this.metaSee('event', ev.id);
    // 用 floor:roomId 的全局 UID 作为状态键（旧的 `_used_${gx},${gy}` 会跨楼层串味）
    const flag = `_used_${this.room.uid || this.room.id}`;
    if (p[flag]) { audio.ui('error'); this.toast('祭坛已沉寂', '每间祭坛只能用一次', '#8fa2b0'); return; }
    if(ev.id.startsWith('field_')) {
      return commitEquipmentOperation(this,candidate=>applyFieldAltar(candidate,ev,flag),'补给已领取',{refresh:false});
    }
    switch (ev.id) {
      case 'shrine_blood':
        if (p.maxHp <= 1) { this.toast('无法献祭', '生命上限不足', '#ff6a3a'); return; }
        p[flag] = true;
        p.items.push('dmg_up'); p.items.push('crit_up'); 
        p._hpPenalty = (p._hpPenalty || 0) + 1;
        p.recompute();
        p.hp = Math.min(p.hp, p.maxHp);
        this.toast('血之祭坛', '生命上限 -1，获得「战斗激素」与「弱点透镜」', '#c0303a');
        audio.phaseChange();
        break;
      case 'shrine_gold':
        if (p.coins < 25) { this.toast('金币不足', '需要 25 金币', '#ff6a3a'); return; }
        p[flag] = true;
        p.coins -= 25;
        this.pickups.spawn('weapon', this.roomScene.ox, this.roomScene.oz + 1.5, { id: this.rollWeaponId(1).id, vx: 0, vy: 3, vz: 0, y: 1.2 });
        this.toast('贪欲祭坛', '支付 25 金币，获得一件随机武器', '#e8c84a');
        break;
      case 'shrine_armor':
        if (p.maxHp <= 1 || p.armor >= 5) { this.toast('无法立誓', p.maxHp <= 1 ? '生命上限不足' : '护甲已满（5）', '#ff6a3a'); return; }
        p[flag] = true;
        p.armor = Math.min(5, p.armor + 2);
        p._hpPenalty = (p._hpPenalty || 0) + 1; p.recompute(); p.hp = Math.min(p.hp, p.maxHp);
        this.toast('铁誓祭坛', '护甲 +2，生命上限 -1', '#9aa4ae');
        break;
      case 'forge': {
        p[flag] = true;
        this._rareEvent = true;       // 深渊铁匠属于罕见事件

        const w = p.weapon;
        if (w) { w.dmgMul = (w.dmgMul || 1) * 1.3; this.toast('深渊铁匠', `${w.def.cn} 伤害强化 +30%`, '#ff8a3c'); }
        else this.toast('深渊铁匠', '没有武器可强化', '#8fa2b0');
        break;
      }
      case 'oracle':
        p[flag] = true;
        for (const r of this.dungeon.list) if (r.type !== 'hidden' || this.hiddenRoomRevealed(r)) r.discovered = true;
        this.toast('迷雾先知', '本层普通房间已揭示；隐藏房仍需寻找暗墙', '#8af0ff', 'build');
        audio.secretFound();
        break;
      default: {
        // 风险支线（宝库）中的祭坛：没有预设事件，给予一次深渊馈赠
        p[flag] = true;
        const it = this.rollItemId();
        if (it) p.addItem(it.id);
        else { const before = p.coins; p.addCoins(15, 'event'); this.toast('深渊馈赠', `获得 ${p.coins - before} 金币`, '#e8c84a'); }
        break;
      }
    }
    this.particles.ring(this.roomScene.ox, 1.0, this.roomScene.oz - this.roomScene.inner * 0.55, ev.color, 30, 1.2, 7);
    this.flashSmall(this.roomScene.ox, 1.6, this.roomScene.oz - this.roomScene.inner * 0.55, ev.color, 20, 0.5);
  }

  // 章节流程的阶段推进（Task7/8）：旧三层流程的 useStairs 完全不动。
  routeCompletionGate(source) {
    if (!this.buildSupply?.selectedRoute || this.practice) return true;
    const plan = planCompletionSupply(this, { roomId: this.room.uid, completionSource: source });
    this.buildSupply = plan.supply;
    const pending = plan.queue.filter(k => this.buildSupply.rewardLedger[k]?.claimState === 'offered');
    if (pending.length && this._completionDeferred !== source) {
      this.openSupplyPanel(pending, '路线补齐 · 必要装备', { onDefer: () => { this._completionDeferred = source; } });
      this.saveProgress(false);
      return false;
    }
    return true;
  }

  useStageStairs() {
    if (this.storageFrozen() || this._stageBossPending) return;
    const def = getStageDefinition(this.stage.chapter, this.stage.segment);
    if (def.boss && !this.room.cleared) { audio.ui('error'); this.toast('先击败首领', '这道阶梯在首领倒下后开启', '#ff6a3a', 'fail'); return; }
    if (!def.boss && this.aliveEnemyCount() > 0) { audio.ui('error'); this.toast('先清理房间', `还有 ${this.aliveEnemyCount()} 名敌人`, '#ff6a3a', 'fail'); return; }
    if (this.stage.chapter === 1 && this.stage.segment === 5 && !this.routeCompletionGate('chapter-boss-completion')) return;
    this.markStage(this.stage.stageKey, 'cleared');
    observeResource(this,'stage-exit',{},null,'exit:'+this.stage.stageKey);
    const next = nextStage(this.stage, this.seed);
    if (!next) {
      if (isCampaignFinal(this.stage)) this.finishCampaign();
      else this.finishChapterPrototype();
      return;
    }
    this.advanceToStage(next);
  }

  advanceToStage(next) {
    const fromKey = this.stage.stageKey;
    audio.stairs();
    this.transition = null; this.state = 'transition';
    const th = FLOOR_THEME[next.themeId];
    const def = getStageDefinition(next.chapter, next.segment);
    const subtitle=next.contentVersion>=2?`${th.name} · ${getStageProfile(next.profile).label}`:`${th.name} · ${def.role}`;
    this.hud.centerMessage(`${next.chapter}-${next.segment}`, subtitle, 3.0);
    this.hurt = 0.4;
    this.scheduleLifecycle(() => {
      this.completeStageAdvance(next, fromKey);
    }, 1400, {kind:'advance-stage',next});
  }

  completeStageAdvance(next, fromKey) {
      if (this.stage?.stageKey !== fromKey) return;
      const th = FLOOR_THEME[next.themeId];
      this.releaseStageScenes();     // 释放场景与动态，但**保留**玩家 / 宠物 / 构筑 / 真实资源
      this.bossType = next.contentVersion===3?chapterBossTypeFor(this.seed,next.chapter):(CHAPTER_BOSS[next.chapter] || this.bossType);
      this.buildStage(next);
      this.applyTheme();
      this.state = 'play';
      audio.playMusic(th.music);
      this.hud.resetRun();
      this.broadcastActorEvent('onStageStart', { stageKey: next.stageKey });
      if(this.actorCount!==2&&next.segment===1&&this.hero.ruleVersion===3&&this.hero.id==='veteran'){this.emit('onFloorStart',{floor:next.chapter});openDoctrines(this.actorView());}
      this.saveProgress(false);
  }

  // 阶段释放：比 clearWorld 轻 —— **不销毁玩家与宠物**（跨段必须保留构筑与异兽成长）。
  releaseStageScenes() {
    this.clearDamageFeedback();
    for(const a of orderedActors(this)){if(a.experiment?.fold)clearFoldRoom(a.view);a.weaponAssets?.reset?.();a.weaponAssets?.bindInventory(a.player);a.input.resetState();a.callbackEpoch++;}
    this.weaponAssetFX?.clear();
    this.cancelLifecycleTimers();
    this.resetTimeScales();
    for (const e of this.enemies) e.remove();
    this.enemies.length = 0;
    if (this.boss) { this.boss.remove(); this.boss = null; }
    this.disposeConnectors();
    this.portals = [];
    this.disposeFloorScenes();
    if (this.roomScene) { this.roomScene.dispose(); this.roomScene = null; }
    this.projectiles.reset();
    this.pickups.clear(); this.hazards.clear();
    this.particles.clear(); this.debris.clear(); this.decals.clear();
    this.flashLights.reset(); this.roomLights.clear();
    for (const a of this.afterimages.list) { a.life = 0; a.mesh.visible = false; }
    if (this._turrets) { for (const t of this._turrets) this.scene.remove(t.g); this._turrets.length = 0; }
    if (this._drones) { for (const d of this._drones) this.scene.remove(d.g); this._drones.length = 0; }
    if (this.platform?.kind !== 'headless') { const pop = document.getElementById('popups'); if (pop) pop.innerHTML = ''; }
  }

  // 单章原型完成（scope=chapter1 的 c1s5）：只声明原型完成，不冒充三章通关。
  finishChapterPrototype() {
    if (this.mode !== 'run' || this.state !== 'play') return;
    this.state = 'victory';
    this.resetTimeScales();
    this.archiveResources('chapter-prototype');
    meta.endRun();
    meta.save(true);
    audio.victory();
    this.hud.centerMessage('第一章完成', '', 4.0);
    this.toast('远征完成', '第一章已完成。', '#ffd24a', 'story');
    // 章完成不是"首领已陨落"：标题按结算类型给，章节号来自真实上下文。
    this.hud.setVictoryVerdict(victoryVerdict({ kind: 'chapter', chapter: this.stage?.chapter ?? 1 }));
    const run = this.snapshotRun('chapter-prototype');
    const finishedRun = this.run;
    this.scheduleLifecycle(() => {
      if (this.state !== 'victory' || this.run !== finishedRun) return;
      this.showLifecycleResult('victory', run);
    }, 3200, {kind:'show-victory',run});
  }

  // 三章全程通关（scope=full3 的 c3s5）：唯一一次全局胜利结算。
  finishCampaign() {
    if (this.mode !== 'run' || this.state !== 'play') return;
    this.markStage(this.stage.stageKey, 'boss');
    this.state = 'victory';
    this.resetTimeScales();
    this.archiveResources('victory');
    meta.endRun();
    meta.data.stats.wins++;
    audio.victory();
    this.hud.centerMessage('余烬落定', 'ALL CHAPTERS CLEARED', 4.0);
    this.hud.setVictoryVerdict(victoryVerdict({ kind: 'campaign' }));
    meta.save(true);
    const run = this.snapshotRun('victory');
    const finishedRun = this.run;
    this.scheduleLifecycle(() => {
      if (this.state !== 'victory' || this.run !== finishedRun) return;
      this.showLifecycleResult('victory', run);
    }, 3200, {kind:'show-victory',run});
  }

  useStairs() {
    if (this.flowVersion === 2) return this.useStageStairs();
    if (!this.hasNextFloor()) {
      this.toast('已到最深处', '这里是熔心王座，没有更深的阶梯', '#8fa2b0', 'fail');
      return;
    }
    if (this.floor === 1 && !this.routeCompletionGate('first-floor-completion')) return;
    // 整层清空判定：所有"非秘密类"房间都已清理（隐藏房 / 宝库是可选内容，不计入）
    const allCleared = this.dungeon.list.every((r) =>
      r.cleared || r.type === 'start' || r.type === 'hidden' || r.type === 'vault');
    if (allCleared) this._floorFullyCleared = true;
    if (this.tel && this.tel.hpOut && this.player) this.tel.hpOut[this.floor] = this.player.hp;
    const nf = this.nextFloor();
    audio.stairs();
    this.transition = null;
    this.state = 'transition';
    const th = FLOOR_THEME[nf];
    this.hud.centerMessage('下 降', `${th.name} · ${th.sub}`, 3.4);
    this.hurt = 0.4;
    this.scheduleLifecycle(() => {
      this.completeFloorAdvance(nf);
    }, 1400, {kind:'advance-floor',nextFloor:nf});
  }

  completeFloorAdvance(nf) {
      const th = FLOOR_THEME[nf];
      this.clearWorld({keepCompanion:this.hero.ruleVersion===3&&this.hero.id==='tamer'});
      this.rng = new RNG(this.seed ^ (0x9e3779b9 * nf));
      this.buildFloor(nf);
      this.applyTheme();
      this.state = 'play';
      audio.playMusic(th.music);
      const hint = nf === 3 ? '第三层 · 熔核总督就坐在王座上' : '第二层 · 出口潜藏在某处';
      this.toast(th.name, hint, th.accent, 'story');
      this.hud.resetRun();
      // 进入新一层的事件：教条 / 未来内容可以据此结算（例如老兵「战场修补」）
      this.emit('onFloorStart', { floor: nf });
      // 每层奖励三选一（§21.1 / §41）。放在这里是因为玩家此刻站在**新层的起始房**（安全），
      // 不需要暂停游戏 —— 面板就能正常收到输入。
      this.openFloorChoice(this.hero);
  }

  applyTheme() {
    const th = this.theme;
    this.scene.fog = new THREE.FogExp2(th.fog, th.fogDensity);
    this.ambient.color.set(th.ambient);
    this.ambient.intensity = th.ambientIntensity;
    this.hemi.color.set(th.hemiSky);
    this.hemi.groundColor.set(th.hemiGround);
    this.hemi.intensity = th.hemiIntensity ?? 1.0;
    this.sun.color.set(th.sunColor);
    this.sun.intensity = th.sunIntensity;
    if (this.platform?.kind === 'headless') { this.platform.emit('theme',{floor:this.floor,accent:th.accent}); return; }
    document.documentElement.style.setProperty('--accent', th.accent);
    document.documentElement.style.setProperty('--accent-dim', th.accent + '88');
    const t = th.tint || [1, 1, 1];
    this.postfx.compMat.uniforms.tint.value.set(t[0], t[1], t[2]);
    this.postfx.brightMat.uniforms.threshold.value = th.bloomThreshold ?? 0.86;
  }

  setPaused(v) {
    if (this.state !== 'play') return;
    if(this.actorCount>1){
      this.paused=!!v;
      for(const actor of orderedActors(this)){
        if(v)actor.weaponAssets?.suspend();
        actor.input.setBlocked?.(v||actor.view.panelOpen()||actor.revivalPending);
        actor.hud.syncPanelInput();
        if(v)actor.hud.showScreen('screen-pause');else actor.hud.hideScreens();
      }
      audio.duck('music',v?.42:1);
      return {paused:this.paused,persistence:'unsupported-party-checkpoint'};
    }
    this.paused = v;
    if(v)this.weaponAssets?.suspend();
    this.input.setBlocked?.(v || this.panelOpen());
    this.hud.syncPanelInput();
    if (v) this.saveProgress(false);
    if (v) { this.hud.showScreen('screen-pause'); audio.duck('music', 0.42); }
    else { this.hud.hideScreens(); audio.duck('music', 1); }
  }

  setBossPhase(i) {
    if (i < 0) return;
    if (this.platform?.kind === 'headless') { this.platform.emit('boss-phase',{phase:i}); return; }
    this.postfx.brightMat.uniforms.threshold.value = Math.max(0.55, 0.84 - i * 0.1);
  }

  spawnAmbientDust() { this.dustTimer = 0; }

  beginLayoutEdit() {
    const t = this.touch;
    if (!t || !t.active || t.editMode) return false;
    if (this.state !== 'play'||this.hud.choiceOpen||this.revivalPending||this.storageFrozen()||this._stageBossPending) return false;
    // 先把可能开着的面板收掉，否则退出编辑后状态不干净。
    // 注意**不能走 closeTopPanel()** —— 那会触发上层面板的 onBack 回调，
    // 把"从大厅设置里进来编辑"弹回上一层面板，而那个面板会重新盖住要拖的按钮。
    if (this.buildOpen) this.setBuild(false);
    if (this.hud.choiceOpen) this.hud.closeChoice?.();
    if (this.hud.hubOpen && this.hud.closeHubPanel() === false) return false;
    if (!this.paused) this.setPaused(true);
    if(this.storageFrozen())return false;
    this.hud.hidePauseScreen?.();
    t.onEditDone = (action) => {
      if (action === 'reset') { t.resetEditDraft(); this.toast('已恢复默认摆放', '还没保存，点「完成」才会生效。', '#ffd24a', 'quick'); return; }
      this.endLayoutEdit(action === 'done');
    };
    t.beginEdit();
    this.toast('键位编辑', '拖动按键或摇杆；「完成」保存，「取消」放弃。', '#ffd24a', 'story');
    return true;
  }

  endLayoutEdit(commit) {
    const t = this.touch;
    if (!t || !t.editMode) return false;
    let result = null;
    if (commit) {
      const next = t.commitEdit();
      if (next) result = preferences.update({ layoutCustom: next });
      if(result&&!result.ok){this.toast('请重试保存',result.error,'#ff8a5a','fail');return false;}
      if(result?.ok)this.applyDisplayPreferences(result.values);
    }
    t.onEditDone = null;
    t.endEdit();
    this.setPaused(false);
    if (result && result.ok) this.toast('键位已保存', '下次进游戏还是这个摆放；设置里可以恢复默认。', '#8af0ff', 'quick');
    else if (result && !result.ok) this.toast('键位没存上', result.error, '#ff8a5a', 'fail');
    return true;
  }

  /**
   * 偏好 → 各处生效的**唯一扇出点**。启动时（main.js）与设置面板每次改动都调这里。
   *
   * 为什么不干脆让每个消费者自己读 localStorage：那样"面板上显示的值"与
   * "实际生效的值"会变成两条独立的路径，两边只要有一处漏了就是静默不一致
   * （本项目最典型的形态就是"表填好了、消费点没写"）。这里只做扇出，不做判断。
   */

  applyDisplayPreferences(p) {
    const prefs = p || preferences.get();
    this.displayPrefs = prefs;
    this.touch?.applyPreferences?.(prefs);
    if (!this.touch && this.camera) {
      this.camera.fov = resolveCameraFov(this.canvas?.clientWidth||1,this.canvas?.clientHeight||1,resolveZoom(prefs,false));
      this.camera.updateProjectionMatrix();
    }
    this.hud?.applyDisplayPreferences?.(prefs);
    return prefs;
  }

  updateCamera(dt) {
    const p = this.presentation ? this.getActor(this.presentation.localPlayerId).player : this.player;
    if (!p) return;
    const pinCenter = this.touch ? this.touch.pinCenter : resolvePinCenter(this.displayPrefs,false);
    const lead = pinCenter ? 0 : 3.4;
    const tx = p.x + p.aim.x * lead;
    const tz = p.z + p.aim.z * lead;
    const k = Math.min(1, dt * (pinCenter?14:7.5));
    this.camPos.x += (tx - this.camPos.x) * k;
    this.camPos.z += (tz - this.camPos.z) * k;
    let sx = 0, sy = 0;
    if (this.shakeAmt > 0.001) {
      const a = this.shakeAmt * 1.5;
      sx = (Math.random() - 0.5) * a;   // visual-rng: 纯粒子表现
      sy = (Math.random() - 0.5) * a;   // visual-rng: 纯粒子表现
    }
    const zoom = this.timeScale < 1 ? 0.92 : 1;
    this.camera.position.set(this.camPos.x + sx, 30 * zoom + sy, this.camPos.z + 21 * zoom);
    this.camera.lookAt(this.camPos.x + sx * 0.5, 1.0, this.camPos.z);
    this.camera.updateMatrixWorld();
    // 阳光跟随
    this.sun.position.set(this.camPos.x + 14, 28, this.camPos.z + 12);
    this.sunTarget.position.set(this.camPos.x, 0, this.camPos.z);
  }

  // ------------------------------------------------------------
  //  统一 Aim Solution
  //  屏幕鼠标位置 → 与地面（y = AIM_Y）求交 → 得到唯一的世界瞄准点。
  //  该点同时用于：准星显示、相机前导、玩家朝向、子弹初速方向。
  //  因为准星是"该点反投影回屏幕"，所以准星一定落在鼠标处，
  //  而子弹方向被约束为"枪口 → 该点"，两者严格一致。
  // ------------------------------------------------------------
  solveAim() {
    const p = this.player;
    if (!p) return null;
    const stick = this.input && this.input.analogAim;
    if (stick) {
      const sl = Math.hypot(stick.x, stick.z);
      const sdx = sl > 1e-4 ? stick.x / sl : (this._aimDir ? this._aimDir.x : 0);
      const sdz = sl > 1e-4 ? stick.z / sl : (this._aimDir ? this._aimDir.z : 1);
      this._aimDir = { x: sdx, z: sdz };
      p.aim.x = sdx; p.aim.z = sdz;
      p.yaw = Math.atan2(sdx, sdz);
      // 摇杆给不出"屏幕上那个点"，只能沿方向取一个固定距离构造瞄准点。
      //
      // ★ 这个距离不是审美参数，是**功能门槛**（改它之前先读完这段）★
      // 武器资产系统把 `dist(玩家, aimPoint)` 当距离用：
      //   energy.js:48   pressure_mine   → dist > 8  就拒绝部署
      //   lottery_actions.js:93  地雷/木桶 → dist > 8 / > 14 拒绝
      //   energy.js:60、mechanical.js:56  → dist > 14 拒绝
      //   energy.js:117  e.range = Math.min(e.range, dist(p, aimPoint))
      // 所以这个值必须 ≤ 8 留出余量，否则这些"布置型"武器会被**永久拒发**。
      // （我第一版取 22，等于让压力地雷、钟摆炸弹一类全部哑火 —— 键盘路径完全正常，
      //  只有平板会哑，属于典型的"只验逻辑、没验每一件武器还活着"。）
      // 取 7：既满足上面全部门槛，又让"放在身前"这个语义成立。
      // 另外枪口前向钳制是 min(..., max(0.30, aimDist*0.45), 1.15)，只要 aimDist ≳ 2.6
      // 出膛位置就与鼠标瞄准完全相同，所以这个取值不影响弹丸起点。
      const dist = 7;
      p.aimPoint = { x: p.x + sdx * dist, z: p.z + sdz * dist };
      p.aimDist = dist;
      return p.aimPoint;
    }
    if(this.actorCount>1&&!this.presentation&&!this.input.worldAimPoint)throw Error('Party actor requires independent world aimPoint or analog aim');
    const hit = this.input.worldAimPoint || (this.platform?.kind === 'headless' ? null : this.screenToGround(this.input.mouse.x, this.input.mouse.y));
    let ax, az;
    if (hit) { ax = hit.x; az = hit.z; }
    else {
      // 鼠标贴近屏幕上缘：射线与地面近乎平行，intersectPlane 会失败。
      // 沿上一帧的水平方向外推一个有限距离，避免准星/弹道突然翻转。
      const d = this._aimDir || { x: 0, z: 1 };
      ax = p.x + d.x * 34; az = p.z + d.z * 34;
    }
    let dx = ax - p.x, dz = az - p.z;
    let l = Math.hypot(dx, dz);
    if (l < 1e-4) { dx = this._aimDir ? this._aimDir.x : 0; dz = this._aimDir ? this._aimDir.z : 1; l = 1; }
    else { dx /= l; dz /= l; }
    this._aimDir = { x: dx, z: dz };
    p.aim.x = dx; p.aim.z = dz;
    p.yaw = Math.atan2(dx, dz);
    p.aimPoint = { x: ax, z: az };
    p.aimDist = l;
    return p.aimPoint;
  }

  // 更新准星：把世界瞄准点反投影回屏幕。
  updateReticle(view = this) {
    const r = view.hud && view.hud.el.reticle;
    const p = view.player;
    if (!r || !p) return;
    if (this.paused || view.panelOpen() || this.state !== 'play' || view.hud.pointerFocused === false || view.hud.pointerOnUI) { view.hud.hideReticle(); return; }
    const rect = this.canvas.getBoundingClientRect();
    let sx, sy, ok = false;
    if (p.aimPoint) {
      this._v3 = this._v3 || new THREE.Vector3();
      this._v3.set(p.aimPoint.x, 0.9, p.aimPoint.z).project(this.camera);
      if (this._v3.z < 1) { sx = (this._v3.x * 0.5 + 0.5) * rect.width + rect.left; sy = (-this._v3.y * 0.5 + 0.5) * rect.height + rect.top; ok = true; }
    }
    if (!ok) { sx = view.input.mouse.x + rect.left; sy = view.input.mouse.y + rect.top; }
    r.style.display = '';
    r.style.left = sx.toFixed(1) + 'px';
    r.style.top = sy.toFixed(1) + 'px';
    const it = view.nearestInteractable();
    const hot = !!it;
    const warning = !!(it && (it.disabled || (it.type === 'chest' && it.need && view.player.keys < it.need)));
    r.classList.toggle('hot', hot && !warning);
    r.classList.toggle('lock', !!it && it.type !== 'shop');
    r.classList.toggle('far', (p.aimDist || 0) > 26 && !hot);
  }

  screenToGround(sx, sy) {
    const rect = this.canvas.getBoundingClientRect();
    if (!(rect.width > 0 && rect.height > 0)) return null;
    this._mouseNDC.x = (sx / rect.width) * 2 - 1;
    this._mouseNDC.y = -(sy / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this._mouseNDC, this.camera);
    const hit = this.raycaster.ray.intersectPlane(this.groundPlane, this._hitPoint);
    if (!hit) return null;
    return { x: hit.x, z: hit.z };
  }

  render(dt) {
    if (this.platform?.kind === 'headless') throw Error('Rendering is unavailable on the headless platform');
    const view=this.presentation ? this.getActor(this.presentation.localPlayerId).view : this;
    updateCombatHUD(view);
    updateConsumablesPage(view,dt);
    if (!this.presentation && this.experiment?.fold && this.hero?.id==='foldshadow' && !this.foldVisuals) this.foldVisuals=new FoldVisuals(this.actorView());
    if(this.presentation){for(const actor of this.actors.values()){if(actor.experiment?.fold&&!actor.foldVisuals)actor.foldVisuals=new FoldVisuals(actor.view);actor.foldVisuals?.sync(dt);this.presentation.assetFX.get(actor.playerId)?.update(actor.weaponAssets.visualState());}}
    else {this.foldVisuals?.sync(dt);updateRoomDiagnosticOverlay(this);this.weaponAssetFX?.update(this.weaponAssets?.visualState()||[]);}
    this.projectiles?.syncVisuals?.();
    const u = this.postfx.compMat.uniforms;
    u.hurt.value = this.hurt;
    u.flash.value = this.flash * 0.7;
    u.aberrationBoost.value = this.aberr + this.shakeAmt * 0.006;
    u.bloomStrength.value = RENDER.bloom * (1 + (this.floor - 1) * 0.10);
    u.ditherAmt.value = RENDER.dither;
    u.time.value = this.time;
    this.postfx.render(this.scene, this.camera, dt);
  }

  toast(t, s, c, kind) { if (this.hud) this.hud.toast(t, s, c, kind); }
  popText(x, y, z, t, c, big) { if (this.hud) this.hud.popText(x, y, z, t, c, big); }

  roomLabel() {
    const map = {
      start: '起始厅堂', battle: '战斗区域', treasure: '宝箱房', shop: '黑市商栈',
      special: '秘仪房间', hidden: '隐藏区域', boss: '总督之座', exit: '下行阶梯',
      vault: '风险宝库 · 可选',
    };
    if (!this.room) return '';
    if (!(this.room.content?.enemies || []).length && ['start','shop','treasure','special','hidden'].includes(this.room.type)) return roomPurpose(this.room);
    // 封锁中的战斗房直接给出剩余敌人数 —— 玩家不该靠猜来判断还剩几只。
    if (this.room.type === 'battle') {
      if (this.room.cleared) return '战斗区域 · 已清空';
      const n = this.aliveEnemyCount();
      return `战斗区域 · 封锁中（剩余 ${n}）`;
    }
    if (this.room.type === 'vault') {
      const n = this.aliveEnemyCount();
      return (this.room.cleared || n === 0) ? '风险宝库 · 已肃清' : `风险宝库 · 封锁中（剩余 ${n}）`;
    }
    if (this.room.type === 'exit') {
      const n = this.aliveEnemyCount();
      return n > 0 ? `下行阶梯 · 守卫 ${n}` : '下行阶梯';
    }
    return map[this.room.type] || '';
  }

  diagnosticSnapshot() { return roomDiagnostics(this); }

  newSynergies(list) {
    if (!this._knownSyn) this._knownSyn = new Set();
    for (const s of list) {
      if (this._knownSyn.has(s.id)) continue;
      this._knownSyn.add(s.id);
      this.telFirst('firstSynergy');
      this.metaSee('synergy', s.id);
      this.toast(`协同激活 · ${s.cn}`, s.desc, '#ffd24a', 'build');
      this.particles.ring(this.player.x, 0.4, this.player.z, '#ffd24a', 26, 1.0, 6);
      audio.ui('buy');
    }
    if (this.hud) this.hud.flashBuild();
  }

  // 当前状态效果（用于 HUD / Build 面板展示）
  statusEffects() {
    const p = this.player;
    if (!p) return [];
    const out = [];
    const st = p.stats;
    if (p.overdrive > 0) out.push({ cn: '超载', t: p.overdrive, c: '#ff5a10' });
    if (p.slowT > 0) out.push({ cn: '时之滞', t: p.slowT, c: '#8af0ff' });
    if (p.barrier > 0) out.push({ cn: '力场', t: p.barrier, c: '#ffd06a' });
    if (p.iframes > 0) out.push({ cn: '无敌', t: p.iframes, c: '#c8f0ff' });
    if (st.burn) out.push({ cn: '灼烧弹药', t: -1, c: '#ff7a1a' });
    if (st.poison) out.push({ cn: '腐蚀弹药', t: -1, c: '#9dff5a' });
    if (st.slow) out.push({ cn: '霜冻弹药', t: -1, c: '#8af0ff' });
    if (st.twin) out.push({ cn: '双生', t: -1, c: '#ffd24a' });
    if (st.tesla) out.push({ cn: '特斯拉', t: -1, c: '#a0f0ff' });
    if (p.dashMax > 1) out.push({ cn: `冲刺 ×${p.dashCharges}/${p.dashMax}`, t: -1, c: '#c07af0' });
    return out;
  }

  useActiveSkill(def, p, power) {
    const id = def.id;
    if(!['barrier','time_freeze'].includes(id))notifyConsumableAttack(this);
    switch (id) {
      case 'time_freeze':
        p.slowT = 4.0;
        audio.slowmo();
        this.toast('时之滞', '敌人速度大幅降低', '#8af0ff');
        this.aberr = 0.02;
        break;
      case 'grenade_toss': {
        this.projectiles.spawn({
          rootShotId:this.createDamageRootId(),sourceInstanceId:'active:grenade_toss',
          x: p.x + p.aim.x, y: 1.0, z: p.z + p.aim.z, dx: p.aim.x, dz: p.aim.z,
          speed: 17, vy: 5.5, damage: 6 * power, life: 3, explodeOnHit: true,
          explosive: 26 * power, blastRadius: 4.4, color: '#9dff5a', team: TEAM.PLAYER,
          arc: true, gravity: 20, kind: 'orb', size: 0.3, owner: p, knock: 3,
        });
        audio.gun('grenade');
        break;
      }
      case 'blink': {
        const dist = 8.5;
        const nx = p.x + p.aim.x * dist, nz = p.z + p.aim.z * dist;
        const from = { x: p.x, z: p.z };
        this.particles.ring(from.x, 0.6, from.z, '#c07af0', 24, 0.8, 8);
        const cl = this.roomScene.clampToRoom(nx, nz, 1.2);
        let tx = cl.x, tz = cl.z;
        // 避免闪现进墙
        if (this.roomScene.pointBlocked(tx, tz, p.radius, 0.9)) { tx = from.x; tz = from.z; }
        p.x = tx; p.z = tz; p.iframes = Math.max(p.iframes, 0.6);
        this.particles.ring(tx, 0.6, tz, '#c07af0', 24, 0.8, 8);
        this.explode(tx, 0.7, tz, 3.2, 6 * power, TEAM.PLAYER, p, null);
        audio.teleport();
        break;
      }
      case 'barrier':
        p.barrier = 4.0;
        audio.shield();
        this.particles.ring(p.x, 0.8, p.z, '#ffd06a', 30, 1.0, 5);
        break;
      case 'heal_pulse':
        p.heal(1, 'relic');
        audio.heal();
        this.explode(p.x, 0.7, p.z, 5.0, 5 * power, TEAM.PLAYER, p, null);
        this.particles.ring(p.x, 0.5, p.z, '#7affd2', 30, 1.2, 8);
        break;
      case 'shockwave':
        this.explode(p.x, 0.5, p.z, 6.4, 9 * power, TEAM.PLAYER, p, null);
        this.particles.ring(p.x, 0.4, p.z, '#ff8a3c', 40, 1.4, 12);
        this.shake(0.4);
        audio.explosion(1.1);
        break;
      case 'chain_blast': {
        let from = { x: p.x, z: p.z };
        const used = new Set();
        for (let i = 0; i < 6; i++) {
          const t = this.findNearest(from.x, from.z, TEAM.ENEMY, 12, null, used);
          if (!t) break;
          used.add(t.id);
          this.projectiles._addBeam(from.x, 0.9, from.z, t.x - from.x, t.z - from.z, Math.hypot(t.x - from.x, t.z - from.z), '#5ad8ff', 0.11, 0.16);
          this.onDamage(t, 12 * power, { source: 'skill' });
          from = t;
        }
        audio.gun('gauss');
        break;
      }
      case 'overdrive':
        activateOverdrive(p,6.0);
        audio.gun('spinup');
        this.toast('超载模式', '射速翻倍 · 免装填6秒 · 备弹与法力照付', '#ff5a10');
        break;
      case 'turret': {
        const pos = this.roomScene.clampToRoom(p.x + p.aim.x * 2.4, p.z + p.aim.z * 2.4, 1.2);
        this.spawnTurret(pos.x, pos.z, power);
        break;
      }
      case 'drone_summon':
        this.spawnCompanion(power);
        break;
      case 'meteor_rain': {
        const rootShotId=this.createDamageRootId();
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2;
          const tx = p.x + p.aim.x * 6 + Math.cos(a) * 3.4;
          const tz = p.z + p.aim.z * 6 + Math.sin(a) * 3.4;
          this.projectiles.spawn({
            rootShotId,sourceInstanceId:'active:meteor_rain',
            x: tx, y: 13 + i * 0.75, z: tz, dx: 0, dz: 0, speed: 0, vy: -13,
            damage: 7 * power, life: 3.4, explosive: 20 * power, blastRadius: 4.0,
            color: '#ff7a2e', team: TEAM.PLAYER, gravity: 26, arc: true,
            kind: 'orb', size: 0.42, radius: 0.4, owner: p, knock: 3, explodeOnHit: true,
          });
        }
        this.shake(0.5); audio.gun('grenade');
        this.toast('陨星雨', '熔岩自天而降', '#ff7a2e', 'build');
        break;
      }
      case 'ward_pulse':
        p.heal(1, 'relic');
        p.barrier = Math.max(p.barrier, 3.0);
        this.explode(p.x, 0.7, p.z, 6.5, 4 * power, TEAM.PLAYER, p, null,{knock:0});
        wardPulseKnockback(this,p);
        this.particles.ring(p.x, 0.5, p.z, '#7affd2', 34, 1.3, 9);
        audio.shield();
        break;
    }
  }

  spawnTurret(x, z, power) {
    if (!this._turrets) this._turrets = [];
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0x6d7880, flatShading: true, metalness: 0.7, roughness: 0.4 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.55, 0.3, 6), mat); base.position.y = 0.15; g.add(base);
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.6), mat); body.position.y = 0.55; g.add(body);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.9, 6), mat); barrel.position.set(0, 0.6, 0.6); barrel.rotation.x = Math.PI / 2; g.add(barrel);
    const lens = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.06), new THREE.MeshBasicMaterial({ color: 0xffb347, toneMapped: false })); lens.position.set(0, 0.66, 0.34); g.add(lens);
    g.position.set(x, 0, z);
    this.scene.add(g);
    // 灯光走 FixedLightPool 的"运行时动态"槽位：场景灯数保持恒定，
    // 不会因为召唤物数量变化触发材质重编译。
    const light = this.roomLights ? this.roomLights.addDynamic(x, 1.0, z, 0xffb347, 3, 8, 0.08) : null;
    this._turrets.push({ ...captureDamageContext(this,{owner:this.player}),g, x, z, life: 22, cd: 0.4, power, light });
    audio.ui('buy');
    this.particles.ring(x, 0.3, z, '#ffb347', 20, 0.8, 6);
  }

  syncBuildDrones(){
    this._drones||=[];
    const need=Math.min(2,this.player?.stats.droneCount||0);
    for(let i=this._drones.length-1;i>=0;i--){const d=this._drones[i];if(d.passive&&d.ownerPlayerId===(this.playerId||'player')&&this._drones.filter(x=>x.passive&&x.ownerPlayerId===(this.playerId||'player')).length>need){this.scene.remove(d.g);this._drones.splice(i,1);}}
    const missing=need-this._drones.filter(d=>d.passive&&d.ownerPlayerId===(this.playerId||'player')).length;
    if(missing>0)this.spawnCompanion(1,{count:missing,passive:true,silent:true});
  }
  spawnCompanion(power,{count=2,passive=false,silent=false}={}) {
    if (!this._drones) this._drones = [];
    for(let i=0;i<count;i++){
      const g = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ color: 0xa8b4bd, flatShading: true, metalness: 0.8, roughness: 0.35 });
      const core = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.6), mat); g.add(core);
      const glow = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.05), new THREE.MeshBasicMaterial({ color: 0x3ad2ff, toneMapped: false })); glow.position.set(0, 0, 0.32); g.add(glow);
      const gun = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.5, 6), mat); gun.position.set(0, -0.16, 0.3); gun.rotation.x = Math.PI / 2; g.add(gun);
      this.scene.add(g);
      const light=!passive&&this.roomLights?this.roomLights.addDynamic(0,0,0,0x3ad2ff,2.2,7,.10):null;
      this._drones.push({...captureDamageContext(this,{owner:this.player}),g,life:30,cd:.5,power,phase:i*Math.PI,light,passive});
    }
    if(!silent){audio.ui('buy');this.particles.ring(this.player.x,.8,this.player.z,'#3ad2ff',20,1,6);}
  }

  updateSummons(dt) {
    if (this._turrets) {
      for (let i = this._turrets.length - 1; i >= 0; i--) {
        const t = this._turrets[i],view=resolveDamageActor(this,t)?.view||(!this.actors?this:null),p=view?.player;
        if(!p)continue;
        t.life -= dt;
        t.cd -= dt;
        const tgt = this.findNearest(t.x, t.z, TEAM.ENEMY, 16, null, null);
        if (tgt && t.cd <= 0) {
          t.cd = 0.42;
          const dx = tgt.x - t.x, dz = tgt.z - t.z;
          const l = Math.hypot(dx, dz) || 1;
          this.projectiles.spawn({
            x: t.x, y: 0.8, z: t.z, dx: dx / l, dz: dz / l, speed: 30, damage: 4.5 * t.power,
            ...damageSource(t),feedbackContext:this.nativeUnitDamageFeedback(t),
            life: 1.6, color: '#ffb347', team: TEAM.PLAYER, size: 0.2, radius: 0.25, kind: 'bolt', owner: p,
          });
          audio.gun('pistol', 0.35);
          this.particles.muzzle(t.x + dx / l * 0.6, 0.8, t.z + dz / l * 0.6, dx / l, dz / l, '#ffb347', 0.6);
        }
        if (tgt) {
          const a = Math.atan2(tgt.x - t.x, tgt.z - t.z);
          t.g.rotation.y = a;
        }
        t.g.position.y = Math.sin(this.time * 3) * 0.03;
        if (t.light) t.light.light.intensity = 2.4 + Math.sin(this.time * 12) * 1.0;
        if (t.life < 3) t.g.visible = Math.floor(t.life * 6) % 2 === 0;
        if (t.life <= 0) {
          this.scene.remove(t.g);
          if (t.light) { t.light.active = false; t.light.light.intensity = 0; }
          this.particles.smoke(t.x, 0.6, t.z, 6, '#8a8a8a', 0.6, 0.7);
          this._turrets.splice(i, 1);
        }
      }
    }
    if(this.actors)for(const actor of orderedActors(this))actor.view.syncBuildDrones();else this.syncBuildDrones();
    if (this._drones) {
      for (let i = this._drones.length - 1; i >= 0; i--) {
        const d = this._drones[i],view=resolveDamageActor(this,d)?.view||(!this.actors?this:null),p=view?.player;
        if(!p)continue;
        if(!d.passive)d.life-=dt;
        const a = this.time * 0.8 + d.phase;
        const tx = p.x + Math.cos(a) * 2.2, tz = p.z + Math.sin(a) * 2.2;
        d.g.position.x += (tx - d.g.position.x) * Math.min(1, dt * 5);
        d.g.position.z += (tz - d.g.position.z) * Math.min(1, dt * 5);
        d.g.position.y = 1.9 + Math.sin(this.time * 2.4 + d.phase) * 0.12;
        if (d.light) { d.light.light.position.set(d.g.position.x, d.g.position.y, d.g.position.z); d.light.light.intensity = 2.2; }
        d.cd -= dt;
        const tgt = this.findNearest(d.g.position.x, d.g.position.z, TEAM.ENEMY, 15, null, null);
        if(tgt&&view.weaponAssets._los(d.g.position,tgt)){
          const yaw = Math.atan2(tgt.x - d.g.position.x, tgt.z - d.g.position.z);
          d.g.rotation.y = yaw;
          if (d.cd <= 0) {
            d.cd = 0.3;
            this.projectiles.spawn({
              x: d.g.position.x, y: d.g.position.y, z: d.g.position.z,
              ...damageSource(d),feedbackContext:this.nativeUnitDamageFeedback(d),
              dx: Math.sin(yaw), dz: Math.cos(yaw), speed: 34, damage: 3.6 * d.power,
              life: 1.6, color: '#3ad2ff', team: TEAM.PLAYER, size: 0.18, radius: 0.24, kind: 'orb', owner: p,
            });
            audio.gun('energy', 0.25);
          }
        }
        if (d.life < 4) d.g.visible = Math.floor(d.life * 6) % 2 === 0;
        if (d.life <= 0) {
          this.scene.remove(d.g);
          if (d.light) { d.light.active = false; d.light.light.intensity = 0; }
          this._drones.splice(i, 1);
        }
      }
    }
  }

  // ============================================================
  //  英雄 / 挑战词条的应用
  // ============================================================
  applyHero(p, paint = meta.sel.paint || 'orig') {
    const base = this.hero || heroById('warden');
    const h = heroWithPaint(base, paint);   // 涂装只改配色，不改数值
    this.heroPainted = h;
    const inputProfile = h.id === 'foldshadow' || PAGE_COMBAT_MODE === 'experimental' && this.mode === 'run' ? 'experimental' : 'classic';
    if (this.input?.profile !== inputProfile) this.input?.setProfile?.(inputProfile);
    const identityChanged=p.hero && (p.hero.id!==h.id || p.hero.ruleVersion!==h.ruleVersion);
    if(identityChanged)resetHeroTransient(p);
    p.hero = h;
    p.buildModel();                       // 用英雄调色板重建模型
    if (h.id==='foldshadow' && !this.foldVisuals) this.foldVisuals=new FoldVisuals(this);
    p.radius = h.rad || p.radius;
    p.r = p.radius;
    p.recompute();                        // 生命差在 recompute 里进 stats.maxHp
    if(identityChanged || !p._heroApplied){p.hp = p.maxHp;p.dashCharges=p.dashMax;}
    p._heroApplied=true; // A paint refresh must not refill HP or clear a restored skill.
  }

  // 出征补给（任务书 §5.3）：一次性、幅度小、不永久 —— 大厅不许卖战力
  applySupply(sup = 'none') {
    const p = this.player;
    if (sup === 'armor') { p.armor = Math.min(5, (p.armor | 0) + 1); }
    else if (sup === 'ammo') {
      for (const w of ammoTargets(p)) {
        if (w && typeof w.reserve === 'number' && isFinite(w.reserve)) w.reserve = Math.round(w.reserve * 1.4);
      }
    } else if (sup === 'coin') { p.coins += 15; }
    if (sup !== 'none') {
      const sd = SUPPLY_MAP[sup];
      if (sd) this.toast('出征补给', `${sd.cn} · ${sd.desc}`, '#8af0ff', 'quick');
    }
  }

  applyModifier(id) {
    this.mod_ = {};
    const m = id ? modifierById(id) : null;
    if (m) { m.apply(this); this.activeModifier = m; }
    else this.activeModifier = null;
    // 难度档必须在词条之后应用：两者都写 g.mod_，
    // 难度只做强度乘算，不覆盖词条改的规则字段。
    this.applyDifficulty();
  }

  // ============================================================
  //  钟炉前厅（冒险者大厅）
  //
  //  它把 roomScene 这个字段复用成 HubScene：Player 的移动 / 碰撞 / 相机
  //  一行都不用改，交互也走同一套 nearestInteractable 流程。
  // ============================================================
  enterHub() {
    if (PAGE_COMBAT_MODE === 'experimental'||PAGE_COMPARISON) {
      if(PAGE_COMPARISON) {
        if(!this._importing&&!this._abandoning&&this.state==='play'&&!this.saveProgress(false))return false;
        this.comparison=null;
      }
      this.state = 'title'; this.experiment = null; return this.toTitle();
    }
    if (!this._importing && !this._abandoning && this.mode === 'run' && this.state === 'play' && !this.saveProgress(false)) return false;
    this.trainingShooterEnabled = false;
    if (this.experiment?.fold) clearFoldRoom(this);
    this.foldVisuals?.dispose(); this.foldVisuals=null;
    this.experiment = null; this.consumables = null; this.consumablePurchases = []; this.combatMode = 'classic';
    this.clearDamageFeedback();
    this.weaponAssets?.reset?.();this.weaponAssetFX?.clear();
    this.cancelLifecycleTimers();
    this.resetTimeScales();
    this.disposeFloorScenes();
    this.projectiles.reset(); this.pendingLoot = [];
    if (this.companion) { this.companion.dispose(); this.companion = null; }
    for (const t of [...(this._turrets || []), ...(this._drones || [])]) this.scene.remove(t.g);
    this._turrets = []; this._drones = [];
    this.hud.closeChoice(); this._pendingChoice = null;
    if (this.player?.rig) this.scene.remove(this.player.rig.group);
    replacePrimaryActor(this);
    this.resetAchievementTracking(); this.telReset();
    this._knownSyn = new Set(); this._seenTip = new Set();
    this.experiment = null; this.consumables = null; this.consumablePurchases = []; this.combatMode = 'classic';
    this.weaponAssets = new WeaponAssetsRuntime(this.actorView());
    this.hero = heroById(meta.sel.hero);
    this.input?.setProfile?.(this.hero.id === 'foldshadow' ? 'experimental' : 'classic');
    // 回大厅必须清掉练习身份与层练习标记，否则下一局会被当成练习局（拿不到奖励）
    this.practice = false;
    this.bossPractice = null;
    audio.resume();
    this.mode = 'hub';
    this.state = 'play';
    this.attract = false;
    this._attractReady = false;
    this.transition = null;
    this.paused = false;
    this.setBuild(false);
    this.hud.closeHubPanel();
    // 本局统计也归零：否则大厅的构筑面板还显示着上一局的击杀 / 房间数
    this.run = this.freshRun();
    // 拆掉地牢现场（保留 meta 进度）
    this.disposeConnectors();
    this.portals = [];
    this.clearEnemies();
    this.pendingSpawns = [];
    this.pickups.clear();
    this.hazards.clear();
    if (this.roomScene && this.roomScene !== this.hubScene) this.roomScene.dispose();
    if (this.hubScene) this.hubScene.dispose();
    this.hubScene = new HubScene(this);
    this.roomScene = this.hubScene;
    this.room = this.hubScene.room;

    // 标题界面直接进大厅时玩家对象还不存在（它是在开局时创建的），
    // 这里补建一次，保证"标题 → 大厅"这条路径独立可用。
    if (this.player?.rig) this.scene.remove(this.player.rig.group);
    this.player = new Player(this.actorView());
    this.player.hero = this.hero;
    this.player.r = this.player.radius;
    this.player.id = 'player';
    this.player.team = TEAM.PLAYER;
    // ------------------------------------------------------------
    //  肉鸽语义：**回到大厅 = 本局结束**。
    //  局内得到的一切（武器 / 遗物 / 主动技能 / 配件 / 金币 / 钥匙 / 护甲 / 职业资源）
    //  都必须清空，只保留长期成长（钟魂 / 解锁 / 图鉴 / 成就）。
    //  旧实现完全不碰 player，于是"死回大厅"之后你还拿着上一局的枪与技能 ——
    //  玩家实测反馈："死亡回到大厅，属性、枪械什么都没变，这不合理，这是肉鸽类游戏。"
    // ------------------------------------------------------------
    {
      const q = this.player;
      q.weapons.length = 0;
      q.weaponIndex = 0;
      q.items.length = 0;
      q.actives.length = 0;
      q.activeIndex = 0;
      q.spareAttachments = [];
      q._hpPenalty = 0; q.doctrines = []; q.soulCount = 0; q.kills = 0;
      q.coins = 0; q.keys = 0; q.armor = 0;
      q.bellCharges = 0; q.heat = 0; q.scrap = 0; q.spellEchoT = 0;
      q.deadeyeT = 0; q.overdrive = 0; q.barrier = 0; q.charging = false; q.reloading = false;
      q.recompute();
    }
    // 从标题直接进大厅、或刚刚清空过，玩家都没有武器 —— 训练区要能开枪，先给一把。
    this.player.giveWeapon(this.hero.sidearm || 'pistol_rusty');
    if (this.player.weapons.length >= 2) this.telFirst('secondWeapon');
    const p = this.player;
    p.hero = this.hero;
    p.buildModel();
    p.maxHp = this.hero.hp || p.maxHp;
    p.hp = p.maxHp;
    p.radius = this.hero.rad || p.radius;
    p.r = p.radius;
    p.alive = true;
    p.iframes = 1.0;
    p.hero = this.hero;
    p.x = this.hubScene.ox;
    p.z = this.hubScene.oz + 12;
    p.vx = p.vz = 0;
    p.yaw = Math.PI;
    p.recompute();

    // 灯光：大厅自己的规格（走定长灯光池，光数依然恒定）
    // §42：训练区提供无限测试弹药（离开训练区由 startNewRun 重建武器实例自然恢复）
    for (const w of this.player.weapons) {
      if (w && w.def && isFinite(w.reserve)) w.reserve = Infinity;
    }
    this.refreshTrainingLoot(true);
    this._hubLights();
    this.hubScene.spawnHeroes(HEROES.filter((h) => meta.hasHero(h.id)));
    // 长期进度「看得见」（任务书 5.5 / 6）：牌位 / 陈列 / 灯光 / 展柜 / 侧廊 / 英雄标记
    this.refreshHubProgress();
    this.spawnDummies();
    this.ritual = null;
    if (this.hubScene) this.hubScene.playRitual(0);
    this.hud.setHubMode(true);
    this.hud.hideScreens();
    this.hud.resetRun();
    this.hud.hideReticle();
    this.toast('钟炉前厅', '', '#8af0ff', 'story');
  }

  // 大厅的"长期进度等级"（任务书第 6 节）：
  //   0 第一次来（人少 / 灯冷 / 柜空 / 角落封闭 / 巨钟破损）
  //   1 抵达过第二层或拿到过成就 → 角落开始恢复使用
  //   2 抵达过第三层或通关过   → 侧廊开放、巨钟修补
  //   3 多次通关且成就可观     → 灯光转暖、展柜渐满
  hubTier() {
    const st = meta.data.stats;
    const ach = (meta.data.achievements || []).length;
    if ((st.wins | 0) >= 2 && ach >= 6) return 3;
    if ((st.deepest | 0) >= 3 || (st.wins | 0) >= 1) return 2;
    if ((st.deepest | 0) >= 2 || ach >= 1) return 1;
    return 0;
  }

  // §42：训练区要有可拆解的武器与可试装的配件 ——
  // 否则拾荒客的「拆解」与全局「改装」在安全区根本练不了。
  // 每 2.5 秒检查一次数量，缺了就补（拆解掉的那把会被重新放回）。
  refreshTrainingLoot(force = false) {
    if (this.mode !== 'hub' || !this.hubScene) return;
    // 陈列位置必须在**可走内区**内（hub inner = 20）。
    // 旧值 z=21.5 落在南墙里（20~22），玩家实测"最下方的枪被墙挡着完全看不见"。
    const spots = [
      { x: -8.5, z: 18.8, id: 'pistol_heavy' },
      { x: 8.5, z: 18.8, id: 'smg_hornet' },
    ];
    let haveW = 0;
    for (const it of this.pickups.list) {
      if (it.kind === 'weapon' && it.training) haveW++;
    }
    if (force || haveW < spots.length) {
      for (const sp of spots) {
        const ex = this.pickups.list.some((it) => it.kind === 'weapon' && it.training
          && Math.abs(it.x - (this.hubScene.ox + sp.x)) < 1.2);
        if (ex) continue;
        this.pickups.spawn('weapon', this.hubScene.ox + sp.x, this.hubScene.oz + sp.z, {
          id: sp.id, mag: 99, reserve: Infinity, y: 0.9,
        });
        const last = this.pickups.list[this.pickups.list.length - 1];
        if (last) { last.training = true; last.noReturn = false; last.ttl = 0; }
      }
    }
  }

  // 把 meta 里的长期进度映射到大厅实物（功勋墙牌位 / Boss 陈列 / 灯光 / 展柜 / 侧廊）
  refreshHubProgress() {
    const hub = this.hubScene;
    if (!hub) return;
    // 长期变化：灯光冷暖、火盆恢复、武器展柜、封闭侧廊、巨钟修补
    if (hub.applyProgress) hub.applyProgress(this.hubTier(), meta.data.seen.weapon || []);
    const earned = (meta.data.achievements || []).map((id) => {
      const a = ACH_MAP[id];
      return id + '|' + ((a && a.cat) || '');
    });
    if (hub.refreshWall) hub.refreshWall(earned);
    if (hub.refreshTrophies) hub.refreshTrophies(meta.data.seen.boss || []);
    // 档案馆实体进度（桌上典籍亮度 + 档案格）
    if (hub.setCodexProgress) {
      let seenAll = 0, total = 0;
      for (const k of CODEX_KINDS) {
        total += k.list.length;
        seenAll += k.list.filter((e) => meta.hasSeen(k.kind, e.id)).length;
      }
      hub.setCodexProgress(seenAll, total);
    }
    // 当前出征英雄在前厅里的标记（§5.1）
    if (hub.markSelectedHero) hub.markSelectedHero(meta.sel.hero);
    // 中央信息碑：几行碑文代表几项已配置的准备
    if (hub.setReadout) {
      let lv = 1;
      if (heroById(meta.sel.hero).id !== 'warden') lv++;
      if (meta.sel.sidearm !== 'pistol_rusty') lv++;
      if (meta.sel.supply && meta.sel.supply !== 'none') lv++;
      if (meta.sel.paint && meta.sel.paint !== 'orig') lv++;
      hub.setReadout(lv);
    }
  }

  _hubLights() {
    const pool = this.roomLights;
    if (pool && pool.clear) pool.clear();
    const hub = this.hubScene;
    if (hub) hub.lightByTag = {};
    for (const sp of (hub ? hub.lightSpecs : [])) {
      if (!pool || !pool.add) continue;
      const it = pool.add(sp.x, sp.y, sp.z, sp.color, sp.intensity, sp.distance, sp.flicker || 0);
      // 带 tag 的光（例如炉井余烬光）要能被大厅场景在仪式中直接改强度
      if (sp.tag && hub) hub.lightByTag[sp.tag] = it;
    }
  }

  // ============================================================
  //  出征仪式（任务书第 4 节）
  //
  //  给每次远征一个固定的仪式：炉井重新亮起 → 周围机械开始运转 →
  //  巨钟缓慢鸣响一次 → 远征门打开 → 进入标准 Run。全程约 3.6 秒。
  //  作用不是"炫技"，而是让"开始一局"这件事在世界里有重量。
  // ============================================================
  expeditionRitual() {
    if (this.ritual) return false;
    this.ritual = { t: 0, dur: 3.6, bellRung: false, opened: false };
    this.hud.closeHubPanel();
    audio.machineSpin(8);
    audio.furnaceIgnite();
    this.hud.centerMessage('远 征', `${this.hero.cn} · 钟炉前厅`, 3.4);
    if (this.hubScene) this.hubScene.playRitual(0.01);
    return true;
  }

  updateRitual(dt) {
    const r = this.ritual;
    if (!r) return false;
    r.t += dt;
    const k = Math.min(1, r.t / r.dur);
    if (this.hubScene) this.hubScene.playRitual(k);
    // 巨钟鸣响：仪式推进到约 55% 时敲响（也是全游戏最重要的声音标志）
    if (!r.bellRung && k >= 0.55) {
      r.bellRung = true;
      audio.bell(true);
      this.shake(0.30);
      if (this.hubScene) this.hubScene.update(0);   // 让这一帧的钟摆姿态立即生效
    }
    // 远征门打开
    if (!r.opened && k >= 0.72) { r.opened = true; audio.doorOpen(); audio.stairs(); }
    if (k >= 1) {
      this.ritual = null;
      this.startNewRun();
      return true;
    }
    return true;
  }

  // 训练木桩：真实敌人（复用整条战斗链路），打死后自动复原
  spawnDummies() {
    for (const sp of TRAINING) this.spawnDummyAt(sp);
  }

  setTrainingShooter(enabled) {
    if (this.mode !== 'hub' || this.state !== 'play' || typeof enabled !== 'boolean') return false;
    if (this.trainingShooterEnabled === enabled) return true;
    this.trainingShooterEnabled = enabled;
    if (enabled) {
      if (!this.enemies.some(e => e.alive && e.dummy && e.trainKind === 'shooter')) {
        this.spawnDummyAt(TRAINING.find(sp => sp.kind === 'shooter'));
      }
    } else {
      for (const b of this.projectiles?.pool || []) {
        if (!b.ownerRef?.dummy || b.ownerRef.trainKind !== 'shooter') continue;
        b.alive = false;
        b.mesh.visible = false;
      }
      this.enemies = this.enemies.filter(e => {
        if (!e.dummy || e.trainKind !== 'shooter') return true;
        e.alive = false;
        e.remove();
        return false;
      });
    }
    return true;
  }

  // 训练靶（任务书 §5.6）：木桩 / 移动靶 / 耐久靶（测主动技能）都复用真实敌人，
  // 因此真实弹丸、真实伤害、真实命中反馈全部成立。
  spawnDummyAt(sp) {
    if (!sp || sp.kind === 'shooter' && !this.trainingShooterEnabled) return null;
    const x = this.hubScene.ox + sp.x, z = this.hubScene.oz + sp.z;
    const e = this.spawnEnemy('grunt', x, z, {});
    if (!e) return null;
    e.dummy = true;
    e.trainKind = sp.kind;
    e.trainSpot = sp;
    e.def = { ...e.def, contact: 0, speed: 0 };
    if (sp.kind === 'mover') { e.maxHp = e.hp = 160; e.moverDir = 1; }
    else if (sp.kind === 'shooter') { e.maxHp = e.hp = sp.hp || 260; e.dummyFire = true; }
    else if (sp.kind === 'tank') { e.maxHp = e.hp = sp.hp || 900; }
    else { e.maxHp = e.hp = 120; }
    return e;
  }

  makeDummy(e) {
    e.dummy = true;
    e.maxHp = e.hp = 120;
    e.def = { ...e.def, contact: 0, speed: 0 };
  }

  // 大厅的常驻世界标签：训练靶的名字 + 实时血量、摆动钟的说明。
  // 目的：让"这里是干什么的"一眼可见 —— 玩家实测反馈"靶子不显示血量也不显示啥，
  // 谁知道那是靶子"，以及"大厅很多摆件看着像可交互其实只是装饰"。
  hubWorldLabels() {
    const hs = this.hubScene;
    if (!hs) return [];
    const out = [];
    for (const e of this.enemies) {
      if (!e.alive || !e.dummy || !e.trainKind) continue;
      const name = (e.trainSpot && e.trainSpot.cn) || { dummy: '木桩', mover: '移动靶', tank: '耐久靶', shooter: '射击靶' }[e.trainKind] || '训练靶';
      const pct = e.maxHp > 0 ? Math.max(0, Math.round((e.hp / e.maxHp) * 100)) : 0;
      const hp = e.maxHp >= 900 ? '∞' : `${Math.max(0, Math.round(e.hp))}/${Math.round(e.maxHp)}`;
      out.push({
        x: e.x, y: 2.5, z: e.z,
        html: `${name} <span class="hp">${hp}</span>`,
        cls: `t-${e.trainKind}`,
      });
    }
    // 功能点（可交互的）也标出来：这样"有名字的 = 能按 E 的"，
    // 没名字的就是纯装饰 —— 直接回答"大厅里很多东西看着像能用其实不能用"。
    for (const st of (hs.props || [])) {
      if (!st || st.kind !== 'hub' || !st.hub || String(st.hub).indexOf('hero:') === 0) continue;
      if (st.hub === 'weaponCases') continue;   // 8 座展柜共用一种名字，靠近时 E 提示已够，不再重复漂浮
      out.push({ x: st.worldX, y: 2.9, z: st.worldZ, html: `${st.label}`, cls: 'st' });
    }
    // 摆动钟：说明它只推不伤
    const pd = hs.pendulum;
    if (pd) {
      const a = pd.pivot.rotation.z;
      out.push({
        x: hs.ox + PENDULUM.x - Math.sin(a) * PENDULUM.len, y: 2.3, z: hs.oz + PENDULUM.z,
        html: '摆动钟', cls: 'warn',
      });
    }
    return out;
  }

  updateHubExtras(dt) {
    // 出征仪式优先：仪式期间不处理其它大厅交互（避免"仪式播到一半又开了面板"）
    if (this.updateRitual(dt)) return;
    this._dummyT -= dt;
    if (this._dummyT <= 0 && !this.weaponLab?.customScenario) {
      this._dummyT = 0.6;
      // 只**补齐差额**：旧写法一次调 spawnDummies() 会补满 3 个，
      // 于是"打掉 2 个"反而让木桩总数涨到 5（数量虚增，看起来像 bug）。
      // 逐个靶位补齐（按 index 去重，避免"打掉一个反而多一个"）
      const used = new Set();
      for (const e of this.enemies) {
        if (!e.alive || !e.dummy || !e.trainSpot) continue;
        const i = TRAINING.indexOf(e.trainSpot);
        if (i >= 0) used.add(i);
      }
      for (let i = 0; i < TRAINING.length; i++) {
        if (!used.has(i)) this.spawnDummyAt(TRAINING[i]);
      }
    }
    // 移动靶：沿滑轨往返
    for (const e of this.enemies) {
      if (!e.alive || e.trainKind !== 'mover' || !e.trainSpot) continue;
      const sp = e.trainSpot, base = this.hubScene.ox + sp.x;
      e.x += (e.moverDir || 1) * (sp.speed || 3) * dt;
      if (e.x > base + sp.to) { e.x = base + sp.to; e.moverDir = -1; }
      if (e.x < base + sp.from) { e.x = base + sp.from; e.moverDir = 1; }
      e.group.position.set(e.x, 0, e.z);
    }
    // 摆动钟：翻滚练习用的危险源。大厅是**安全区** —— 它会照样把你撞开、
    // 照样走受击表现（击退 / 无敌帧 / 镜头反馈），但**不扣血**。
    // 玩家实测反馈："在大厅里会被那个钟打伤" —— 一个会掉血的安全区既不合理，
    // 也让人不敢靠近训练区。伤害改为 0，练习价值（练走位时机）完全保留。
    const pd = this.hubScene && this.hubScene.pendulum;
    const pl = this.player;
    if (pd && pl && pl.alive) {
      const a = pd.pivot.rotation.z;
      const bx = this.hubScene.ox + PENDULUM.x - Math.sin(a) * PENDULUM.len;
      const bz = this.hubScene.oz + PENDULUM.z;
      const d = Math.hypot(pl.x - bx, pl.z - bz);
      if (d < 0.95) {
        // 击退 + 短无敌帧（复用真实受击流程），但伤害记 0
        const nx = (pl.x - bx) / Math.max(0.01, d), nz = (pl.z - bz) / Math.max(0.01, d);
        if (pl.dashTime <= 0 && pl.iframes <= 0) {
          pl.vx += nx * 7.5; pl.vz += nz * 7.5;
          pl.iframes = 0.6;
          this.shake(0.18);
          this.damageFlash(0.35);
          audio.impact(true);
        }
      }
    }
    meta.tick(dt);
  }

  // ============================================================
  //  大厅功能点
  // ============================================================
  trainingPanel(kind = '') { return trainingPanel(this, kind); }
  configureTraining(opts = {}) { return configureTraining(this, opts); }
  trainingAvailable(kind, id) { return trainingAvailable(this, kind, id); }

  saveHubSelection(key, edit) {
    const result = meta.commitSelection(key, edit);
    const pending = meta._pendingSelection;
    if (pending?.write === saveStore.pendingWrite && this.hud._hub && !this.pendingHubSelection()) {
      this._hubSelectionRecovery = { write: pending.write, hub: this.hud._hub, row: this.hud._hub.cfg.rows[this.hud._hub.idx] };
    }
    if (!pending || pending.write !== saveStore.pendingWrite) this._hubSelectionRecovery = null;
    if (!result.ok) this.toast('设置尚未保存', result.error || '浏览器存储写入失败，请重试', '#ff6a3a');
    return result.ok;
  }

  pendingHubSelection() {
    const pending = this._hubSelectionRecovery;
    return pending && pending.write === saveStore.pendingWrite && meta._pendingSelection?.write === pending.write && this.hud._hub === pending.hub ? pending : null;
  }

  noticePendingHubSelection() {
    this.toast('保存状态待确认', '请重试刚才的选项，确认保存后再返回或修改其他设置', '#ff6a3a');
  }

  challengePanel() {
    if (this.mode !== 'hub') { this.toast('挑战词条', '只在大厅选择下次远征；当前远征保持原词条', '#ffd24a'); return; }
    this.hud.hubPanel({ page: 'modifier', onBack: () => this.useHub('readout'), title: '挑战词条 · 下次远征', sub: '下次远征生效。',
      rows: [{ cn: '无词条', id: '', desc: '不附加挑战词条', tag: !meta.sel.modifier ? '使用中' : '' },
        ...MODIFIERS.map(m => ({ cn: m.cn, id: m.id, desc: m.desc, disabled: !meta.hasModifier(m.id), tag: meta.sel.modifier === m.id ? '使用中' : meta.hasModifier(m.id) ? '可选' : '未解锁 · 去钟魂商人' })),
        { cn: '钟魂商人', go: 'merchant', desc: '查看挑战词条解锁' }, { cn: '返回出征准备', go: 'readout', desc: '' }],
      onPick: row => {
        if (row.go) { this.hud.closeHubPanel(); return this.useHub(row.go); }
        if (this.mode !== 'hub' || row.id !== '' && (!modifierById(row.id) || !meta.hasModifier(row.id))) return;
        if (!this.saveHubSelection(`modifier:${row.id}`, candidate => { candidate.sel.modifier = row.id; })) return;
        this.refreshHubProgress(); this.challengePanel();
        this.toast('下次远征词条', modifierById(row.id)?.cn || '无词条', '#8af0ff');
      } });
  }

  // 难度档（PASS2 §1.6）：独立面板而不是塞进词条列表 ——
  // 任务书要求"词条是规则、难度是强度"分开表达，混在一起会让玩家以为它们是同一类东西。
  difficultyPanel() {
    if (this.mode !== 'hub') { this.toast('难度', '只在大厅选择下次远征；当前远征保持原难度', '#ffd24a'); return; }
    const cur = meta.difficulty;
    this.hud.hubPanel({
      page: 'difficulty', onBack: () => this.useHub('readout'),
      title: '难度 · 下次远征',
      sub: '下次远征生效。',
      rows: DIFFICULTY_IDS.map(id => ({
        cn: DIFFICULTY[id].cn, id,
        desc: `${DIFFICULTY[id].desc}（敌人生命 ×${DIFFICULTY[id].enemyHpMul} · 敌弹伤害 ×${DIFFICULTY[id].enemyDmgMul} · 掉落 ×${DIFFICULTY[id].dropMul}）`,
        tag: cur === id ? '使用中' : '可选',
      })).concat([{ cn: '返回', id: null, desc: '' }]),
      onPick: row => {
        if (row.id === null) { this.hud.closeHubPanel(); return this.useHub('readout'); }
        if (!DIFFICULTY_IDS.includes(row.id) || !this.saveHubSelection(`difficulty:${row.id}`, candidate => { candidate.difficulty = row.id; })) return;
        this.difficultyPanel();
        this.toast('难度已设为', `${DIFFICULTY[row.id].cn} · 下次远征生效`, '#8af0ff');
      },
    });
  }

  requestExpedition(practice = 0, bossPractice = null,stage = null) {
    const go = () => stage?this.startStageRun(stage.scope,stage.profile):bossPractice
      ? this.startNewRun(undefined, { practice: 3, bossPractice })
      : practice ? this.startNewRun(undefined, { practice }) : this.expeditionRitual();
    if (!saveStore.read()?.active) { go(); return; }
    const what = stage?`${getStageProfile(stage.profile).label}章节远征 · ${stage.scope==='full3'?'三章十五段':'第一章五段'}`:bossPractice ? `${bossDef(bossPractice).cn} 首领练习（无正式收益）`
      : practice ? `经典三层 · 从第 ${practice} 层开始练习` : '经典三层 · 从第一层开始';
    this.hud.hubPanel({ title: '开始新的远征？', sub: '已有可继续的远征。开始新远征会替换它；临时退出后可选择继续远征。',
      rows: [{ cn: '开始新远征', desc: what }, { cn: '继续旧远征', desc: '恢复原现场' }, { cn: '取消', desc: '保留原存档' }],
      onPick: r => { this.hud.closeHubPanel(); if (r.cn === '开始新远征') go(); else if (r.cn === '继续旧远征') this.continueRun(); } });
  }

  useHub(id) {
    if (this.ritual) return;          // 仪式进行中不接受新交互
    const H = this.hud;
    const S = meta.souls;
    if (['supply', 'route', 'paint'].includes(id)) { openPreparationChoice(this, id); return; }
    if (id === 'training') { this.trainingPanel(); return; }
    if (id === 'trainingAttachments') { this.trainingPanel('attachment'); return; }
    if (id === 'modifier') { this.challengePanel(); return; }
    if (id === 'difficulty') { this.difficultyPanel(); return; }
    if (id === 'developer') {
      H.hubPanel({ title: `开发者模式 · ${meta.devMode ? '已开启' : '已关闭'}`, onBack: () => this.useHub('readout'), sub: '开启后可以试用全部内容，并练习所有楼层。不会影响真实的解锁、图鉴或成就。',
        rows: [{ cn: meta.devMode ? '关闭开发者模式' : '开启开发者模式', desc: '' }, { cn: '训练配装', desc: '立即试用可用内容' }, { cn: '返回', desc: '' }],
        onPick: r => { H.closeHubPanel(); if (r.cn === '训练配装') return this.trainingPanel(); if (r.cn === '返回') return;
          meta.setDev(!meta.devMode);
          if (!meta.devMode) {
            if (!meta.data.heroes.includes(meta.sel.hero)) meta.setSel('hero', 'warden');
            if (!meta.data.sidearms.includes(meta.sel.sidearm)) meta.setSel('sidearm', 'pistol_rusty');
            if (!meta.data.modifiers.includes(meta.sel.modifier)) meta.setSel('modifier', '');
            this.configureTraining({ hero: meta.sel.hero, weapon: heroById(meta.sel.hero).sidearm });
          }
          this.hubScene?.spawnHeroes(HEROES.filter(h => meta.hasHero(h.id))); this.refreshHubProgress(); meta.save(true); this.useHub('developer'); } });
      return;
    }
    if (id === 'expedition') {
      H.hubPanel({ title: '出征台', sub: '',
        rows: [
          { cn: '开始远征', desc: '标准远征 / 小房间远征 / 经典三层', start: true },
          ...(saveStore.read()?.active ? [{ cn: '继续远征', desc: '', resume: true }] : []),
          { cn: '出征准备', desc: '英雄、装备与难度', prepare: true },
          { cn: '返回', desc: '' },
        ],
        onPick: row => { H.closeHubPanel(); if (row.start) this.stageRunPanel(); else if (row.resume) this.continueRun(); else if (row.prepare) this.useHub('readout'); },
      });
      return;
    }
    // 走近某位英雄交谈：聚焦到他（任务书 5.2）
    // 走近某位英雄交谈，或通过英雄碑进入：两种入口共用同一个面板
    if (id === 'hero' || id.indexOf('hero:') === 0) {
      this.heroPanel(id.indexOf('hero:') === 0 ? id.slice(5) : undefined);
      return;
    }
    if (id === 'armory') {
      const rows = SIDEARMS.map((sd) => {
        const owned = meta.hasSidearm(sd.id);
        return {
          cn: sd.cn, id: sd.id,
          desc: owned ? '已解锁' : '需在钟魂商人处解锁',
          tag: meta.sel.sidearm === sd.id ? '使用中' : (owned ? '可用' : '未解锁'),
          cost: owned ? null : `${sd.cost} 钟魂`,
          disabled: !owned && S < sd.cost,
        };
      });
      H.hubPanel({
        page: 'armory', onBack: () => this.useHub('readout'), title: '起始副武器', sub: '随英雄的起始武器一同携带。',
        rows,
        onPick: (r) => {
          if (!meta.hasSidearm(r.id)) {
            const sd = SIDEARMS.find((x) => x.id === r.id);
            if (!meta.buyUnlock('sidearm',sd.id)) { this.toast('钟魂不足', `需要 ${sd.cost}`, '#ff6a3a'); return; }
            meta.unlockSidearm(r.id);
            this.toast('解锁副武器', sd.cn, '#ffd24a');
          }
          meta.setSel('sidearm', r.id);
          this.toast('副武器已备好', r.cn, '#8af0ff'); meta.save(true);
          this.useHub('readout');
        },
      });
      return;
    }
    // 工坊 / 商人区（任务书 §5.3）：
    //   出征补给（一次性资源）· 涂装（纯外观）· 库存解锁（英雄 / 副武器 / 挑战词条）
    // **明确不做**：出售顶级装备、直接买完整 Build、永久无限堆攻击力。
    if (id === 'merchant') {
      const rows = [];
      rows.push({ cn: '— 涂装 —', desc: '', disabled: true });
      for (const pt of PAINTS) {
        const owned = meta.hasPaint(pt.id);
        rows.push({
          cn: pt.cn, kind: 'paint', id: pt.id,
          desc: owned ? (pt.cost ? '已解锁' : '默认拥有') : '在钟魂商人处解锁的涂装',
          tag: owned ? '已解锁' : '未解锁',
          cost: owned ? null : `${pt.cost} 钟魂`,
          disabled: owned || S < pt.cost,
        });
      }
      rows.push({ cn: '— 英雄与装备 —', desc: '', disabled: true });
      for (const h of HEROES) if (h.unlock && !meta.hasHero(h.id)) rows.push({ cn: h.cn, kind: 'hero', id: h.id, desc: h.talent, cost: `${h.unlock.souls} 钟魂`, disabled: S < h.unlock.souls });
      for (const sd of SIDEARMS) if (!meta.hasSidearm(sd.id)) rows.push({ cn: sd.cn, kind: 'sidearm', id: sd.id, desc: '起始副武器', cost: `${sd.cost} 钟魂`, disabled: S < sd.cost });
      for (const m of MODIFIERS) if (!meta.hasModifier(m.id)) rows.push({ cn: m.cn, kind: 'mod', id: m.id, desc: m.desc, cost: '40 钟魂', disabled: S < 40 });
      H.hubPanel({
        page: 'merchant',
        title: '钟魂商人',
        sub: `钟魂 ${S}`,
        rows,
        onPick: (r) => {
          if (r.disabled) return;
          if (r.kind === 'paint') {
            const paint = PAINT_MAP[r.id];
            if (!paint) return;
            // Derive price from current ownership, not a stale rendered row.
            const price = meta.hasPaint(r.id) ? 0 : paint.cost;
            if (meta.souls < price) { this.toast('钟魂不足', `需要 ${price}`, '#ff6a3a'); return; }
            if (!this.saveHubSelection(`paint:${r.id}`, candidate => {
              candidate.souls -= price;
              if (!meta.hasPaint(r.id)) candidate.paints.push(r.id);
            })) return;
            this.refreshHubProgress();
            this.toast('涂装已解锁', r.cn, '#ffd24a');
            this.useHub('merchant');
            return;
          }
          const cost = r.cost ? Number(String(r.cost).replace(/[^0-9]/g, '')) : 0;
          if (cost > 0 && !meta.spend(cost)) { this.toast('钟魂不足', `需要 ${cost}`, '#ff6a3a'); return; }
          if (r.kind === 'hero') meta.unlockHero(r.id);
          if (r.kind === 'sidearm') meta.unlockSidearm(r.id);
          if (r.kind === 'mod') meta.unlockModifier(r.id);
          this.toast('已解锁', r.cn, '#ffd24a');
          this.useHub('merchant');
        },
      });
      return;
    }
    // 中央信息碑（任务书 §5.1）：当前英雄 + 本局准备状态 + 长期进度摘要
    if (id === 'readout') { openPreparation(this); return; }
    if (id === 'weaponCases') { this.codexPanel('weapon'); return; }
    if (id === 'wall') {
      const rows = ACHIEVEMENTS.map((a) => ({
        cn: a.cn, desc: `${a.cat} · ${a.desc}`,
        tag: meta.hasAch(a.id) ? '已达成' : '',
      }));
      const st = meta.data.stats;
      rows.push({ cn: '— 统计 —', desc: `远征 ${st.runs} 次 · 通关 ${st.wins} · 最深 ${st.deepest} 层 · 累计击杀 ${st.kills}`, disabled: true });
      H.hubPanel({ title: '功勋墙', sub: `已达成 ${meta.data.achievements.length}/${ACHIEVEMENTS.length}`, rows, onPick: () => H.closeHubPanel() });
      return;
    }
    if (id === 'codex') {
      this.codexPanel();
      return;
    }
    if (id === 'practice') {
      const rows = [];
      for (const f of [2, 3]) {
        // 开发者模式下不再要求"先正常抵达该层"（测试时经常直接想看第三层）
        const ok = !!meta.data.reached[f] || meta.devMode;
        rows.push({
          cn: `第 ${f} 层练习`, kind: 'floor', floor: f,
          desc: ok ? '' : '抵达该层后解锁',
          tag: ok ? (meta.devMode && !meta.data.reached[f] ? '开发模式' : '已解锁') : '未解锁', disabled: !ok,
        });
      }
      // ---- Boss Practice（PASS2 §25）----
      // 只在**真的见过**该首领之后解锁（开发者模式可全练）。
      // 明确不计标准胜利、不发钟魂 / 正式奖励、不刷图鉴战胜 —— 它只是训练房。
      rows.push({ cn: '— 首领练习 —', desc: '', disabled: true });
      for (const id of BOSS_IDS) {
        const bd = bossDef(id);
        const seen = meta.hasSeen('boss', id) || meta.devMode;
        rows.push({
          cn: bd.cn, kind: 'boss', boss: id, cost: bd.key,
          desc: seen ? '' : '与它交手后解锁',
          tag: seen ? (meta.devMode && !meta.hasSeen('boss', id) ? '开发模式' : '可练习') : '未解锁',
          disabled: !seen,
        });
      }
      rows.push({ cn: '取消', desc: '', disabled: false });
      H.hubPanel({
        page: 'practice', onBack: () => this.useHub('readout'), title: '楼层与首领练习', sub: '练习不计通关，不发放钟魂与正式奖励。',
        rows,
        onPick: (r) => {
          H.closeHubPanel();
          if (r.kind === 'floor') this.requestExpedition(r.floor);
          else if (r.kind === 'boss') this.requestExpedition(3, r.boss);
        },
      });
      return;
    }
    if (id === 'trophy') {
      const st = meta.data.stats;
      H.hubPanel({
        title: '远征战果',
        sub: '',
        rows: [
          { cn: '击败首领', desc: `累计 ${st.bossKills} 次`, disabled: true },
          { cn: '通关次数', desc: `累计 ${st.wins} 次`, disabled: true },
          { cn: '最深抵达', desc: `第 ${st.deepest} 层`, disabled: true },
          { cn: '风险宝库', desc: `进入 ${st.vaults} 次`, disabled: true },
        ],
        onPick: () => H.closeHubPanel(),
      });
      return;
    }
  }

  // 英雄面板：英雄碑与「走近英雄」共用（任务书 5.2）
  // 档案馆（任务书 §5.4）：目录 → 条目
  // 未发现的条目不显示名称，而给出**可推断的轮廓**（类别 / 稀有度 / 出现楼层…），
  // 让玩家能判断"我还差哪一类东西"，而不是面对一片问号。
  codexPanel(kind) {
    const H = this.hud;
    if (!kind) {
      let seenAll = 0;
      const rows = CODEX_KINDS.map((k) => {
        const seen = k.list.filter((e) => meta.hasSeen(k.kind, e.id)).length;
        seenAll += seen;
        return {
          cn: k.cn, id: k.kind,
          desc: `已记录 ${seen} / ${k.list.length}`,
          tag: seen >= k.list.length ? '完整' : `${Math.round((seen / k.list.length) * 100)}%`,
        };
      });
      rows.unshift({ cn: '— 总览 —', desc: `世界已知条目 ${seenAll} / ${codexTotal()}`, disabled: true });
      H.hubPanel({
        title: '档案馆', sub: '这个世界还有哪些东西你没有发现',
        rows,
        onPick: (r) => { if (!r.disabled) this.codexPanel(r.id); },
      });
      return;
    }
    const k = CODEX_MAP[kind];
    if (!k) return;
    const rows = [{ cn: '← 返回目录', desc: '' }];
    let seenN = 0;
    for (const e of k.list) {
      const got = meta.hasSeen(kind, e.id);
      if (got) {
        seenN++;
        rows.push({ cn: e.cn, desc: e.desc, tag: e.tag || '' });
      } else {
        rows.push({ cn: '???', desc: e.hint || '尚未发现', tag: '未发现', disabled: true });
      }
    }
    H.hubPanel({
      title: `档案馆 · ${k.cn}`,
      sub: `已记录 ${seenN} / ${k.list.length}`,
      rows,
      onPick: (r) => { if (String(r.cn).indexOf('返回') === 0) this.codexPanel(); },
    });
  }

  heroPanel(focusId) {
    const H = this.hud;
    const S = meta.souls;
      const rows = HEROES.map((h) => {
        const owned = meta.hasHero(h.id);
        const cost = !owned && h.unlock ? h.unlock.souls : null;
        return {
          cn: h.cn, id: h.id,
          desc: `天赋：${h.talent}<br><span class="e2-cost">技能效果：${h.verb}。${h.costNote || ''}</span>`,
          tag: meta.sel.hero === h.id ? '使用中' : (owned ? '已解锁' : '未解锁'),
          cost: cost ? `${cost} 钟魂` : null,
          disabled: !owned && (cost === null || S < cost),
        };
      });
      H.hubPanel({
        page: 'hero', onBack: () => this.useHub('readout'), title: '选择英雄',
        sub: `钟魂 ${S}`,
        rows,
        onPick: (r) => {
          const h = HEROES.find((x) => x.id === r.id);
          if (!meta.hasHero(h.id)) {
            const cost = meta.unlockPrice('hero',h.id);
            if (!meta.buyUnlock('hero',h.id)) { this.toast('钟魂不足', `需要 ${cost}`, '#ff6a3a'); return; }
            meta.unlockHero(h.id);
            meta.see('hero', h.id);
            this.toast('解锁英雄', `${h.cn} 已加入远征`, '#ffd24a');
          }
          meta.setSel('hero', h.id);
          this.hero = h;
          this.configureTraining({ hero: h.id }); meta.save(true);
          this.toast('英雄已切换', h.cn, '#8af0ff');
          this.useHub('readout');
        },
      });
  }


  // ============================================================
  //  职业能力（Hero Skill）统一入口 —— 任务书 §4 / §5
  //
  //  所有英雄共用 C 键与同一条冷却管线；与 F（主动道具）并存、互不替代。
  //  具体效果由各英雄的 hook.onHeroSkill 实现，冷却时长由它返回（返回值即冷却秒数）。
  // ============================================================
  // ============================================================
  //  时间缩放合成（任务书 §10.3）
  //
  //  来源：时之滞（主动技能）/ 游侠「静火」/ 停摆棱镜 / 打击顿帧。
  //  合成规则：**每个通道取各来源中最小者**（最强减速生效），再乘顿帧 ——
  //  多个来源同时存在时不会互相覆盖，也不会叠成"时间停止"。
  //  旧实现只有一个全局 timeScale，谁后写谁生效，必然互相覆盖。
  // ============================================================
  computeTimeScales(dt) {
    const hitStop=this.hitStopT>0?.06:1;
    if(this.hitStopT>0)this.hitStopT=Math.max(0,this.hitStopT-dt);
    const actors=this.actors?orderedActors(this):[{player:this.player,weaponAssets:this.weaponAssets}];
    const contributions=actors.map(actor=>{
      const p=actor.player,prism=actor.weaponAssets?.prepareTimeEffects(dt)??1;
      const slow=p&&p.slowT>0?.32:1;
      if(p&&p.slowT>0)p.slowT=Math.max(0,p.slowT-dt);
      const de=!!(p&&p.deadeyeT>0);
      if(de){p.deadeyeT=Math.max(0,p.deadeyeT-dt);if(p.deadeyeT===0)p.recompute();}
      const move=(de?.70:1)*hitStop,action=hitStop;
      actor.playerMoveTimeScale=move;actor.playerActionTimeScale=action;
      return {enemy:Math.min(de?.35:1,slow)*hitStop,enemyBullet:Math.min(de?.35:1,slow,prism)*hitStop,
        playerMove:move,playerAction:action,fx:(de?.55:1)*hitStop,hazard:Math.min(de?.55:1,prism)*hitStop,deadeye:de};
    });
    const result={...contributions[0]};
    for(const channel of ['enemy','enemyBullet','hazard','fx'])result[channel]=Math.min(...contributions.map(c=>c[channel]));
    return result;
  }

  heroSkill(p) {
    if (this.experiment?.fold) return tryCombatAction(this,'skill_3');
    p = p || this.player;
    if (!p || !p.alive || this.state !== 'play' || this.paused || this.buildOpen ||
        this.panelOpen?.() || this._restoring || this._importing || this.revivalPending) return false;
    const h = this.hero;
    if (!h) return false;
    if (h.skillInput === 'dodge') return false;
    if (p.heroSkillCd > 0) { audio.ui('error'); return false; }
    const hook = h.hook || {};
    const status = typeof hook.skillStatus === 'function' ? hook.skillStatus(p, this) : null;
    if (status?.ready === false) {
      this.toast('职业能力', status.reason || `${h.cn} 现在用不出「${h.skillName || '能力'}」`, '#ff6a3a', 'fail');
      return false;
    }
    let cd = h.skillCd ?? 8;
    if (typeof hook.onHeroSkill === 'function') {
      const r = hook.onHeroSkill(p, this);
      if (r === false || (r && typeof r === 'object' && r.ready === false)) {
        this.toast('职业能力', r?.reason || hook.skillStatus?.(p, this)?.reason || `${h.cn} 现在用不出「${h.skillName || '能力'}」`, '#ff6a3a', 'fail');
        return false;
      }
      if (typeof r === 'number') cd = r;
      else if (r && typeof r === 'object') cd = r.cooldown;
    } else {
      this.toast('职业能力', `${h.cn} 尚未掌握职业能力`, '#8fa2b0');
      return false;
    }
    if (!Number.isFinite(cd) || cd < 0) {
      this.toast('职业能力', '技能冷却状态无效', '#ff6a3a', 'fail');
      return false;
    }
    p.heroSkillCd = cd;
    p.heroSkillCdMax = cd || 1;
    if(this.experiment)notifyConsumableAttack(this);
    return true;
  }

  // ============================================================
  //  统一 Hook 事件层（任务书 §6）
  //
  //  英雄差异尽量由「数据 + Hook + 小型状态对象」表达，而不是在 game.js 里堆
  //  `if (hero.id === 'xxx')`。遗物 / 未来的宠物同样可以监听这些事件。
  // ============================================================
  emit(event, data) {
    if(this.actors){const actor=resolveDamageActor(this,data||{},{diagnose:true});if(actor)return actor.view.emit(event,data);return;}
    if(event==='onShotFired')notifyConsumableAttack(this);
    if (event === 'onActualDamage') creditUltimate(this, data);
    if (event === 'onShotFired' && this.experiment?.fold) foldOnPaidShot(this,data);
    if(event==='onShotFired')this.weaponAssets?.observeShot?.(data);
    const p = this.player;
    // 完美闪避连击（守钟人成就）在这里统一计数 —— 与具体职业无关，任何监听者都能受益
    if (event === 'onPerfectDodge' && p) {
      p.pdChain = (p.pdChain | 0) + 1;
      this._pdChain = p.pdChain;
    }
    const hook = this.hero && this.hero.hook;
    const fn = hook && hook[event];
    // 单个 hook 出错不应该中断整局：吞掉异常但保留其它监听者
    if (typeof fn === 'function') {
      try { fn(p, data || {}, this); } catch (e) { this.reportActorHookError(event,e); }
    }
    if (this._listeners && this._listeners.length) {
      for (const l of this._listeners) {
        if (l.event !== event) continue;
        try { l.fn(p, data || {}, this); } catch (e) { this.reportActorHookError(event,e); }
      }
    }
  }

  reportActorHookError(event,error) { this.actorHookDiagnostics??=[];if(this.actorHookDiagnostics.length>=64)this.actorHookDiagnostics.shift();this.actorHookDiagnostics.push({event,message:String(error)});if(this.strictActorHooks)throw error; }

  emitActor(playerId,event,data) { return this.getActor(playerId).view.emit(event,data); }
  broadcastActorEvent(event,data) { for(const actor of orderedActors(this))actor.view.emit(event,data); }

  on(event, fn) {
    if (!this._listeners) this._listeners = [];
    const listeners = this._listeners, entry = {event, fn};
    listeners.push(entry);
    return () => { const i = listeners.indexOf(entry); if (i >= 0) listeners.splice(i, 1); };
  }

  // 附近地面的武器（拾荒客拆解目标的判定，§11.1）
  nearestGroundWeapon(p, range = 3.6) {
    const list = (this.pickups && this.pickups.list) || [];
    let best = null, bd = range * range;
    for (const it of list) {
      if (this.actorCount===2&&it.recipientId&&it.recipientId!==this.playerId)continue;
      if (it.kind !== 'weapon' || it.collected || it.shopSlot || it.shopIndex>=0 || !pickupReady(it) || !pickupPathClear(this,p.x,p.z,it.x,it.z)) continue;
      const dx = it.x - p.x, dz = it.z - p.z, d2 = dx * dx + dz * dz;
      if (d2 < bd) { bd = d2; best = it; }
    }
    return best;
  }

  scavengeWeaponLabel(w) { const d=savedWeaponDefinition(w);return `${d?.cn||w.id} · 稀有度 ${d?.tier||1}`; }

  // 拆解地面武器 → 废料（§11.1 / §11.2）。防刷规则见下方注释。
  dismantleNearest(p) {
    const w = this.nearestGroundWeapon(p);
    if (!w) return null;
    // 防"拆枪 → 买枪 → 再拆"的无限资源循环：
    // 目前可拆对象只有**地面上真实存在的掉落物**，且拆解后对象消失；
    // 起始副武器在手中、刚丢出的武器有落地保护期，都进不了这条路径。
    if (!this.pickups.dismantle(w)) return null;
    const gain = 2 + (this.grc(0.35) ? 1 : 0);      // gameplay 随机（§1.3）
    p.scrap = (p.scrap | 0) + gain;
    this._dismantled = (this._dismantled | 0) + 1;
    p.recompute();
    this.hud.toast('拆解', `废料 +${gain}（现有 ${p.scrap}）`, '#8fa2b0', 'build');
    return { id: w.id, gain };
  }

  // 废料 → 应急物资（§11.2 / §11.3）。
  // 说明：§41 的通用 ChoicePanel（带图标/颜色/Seeded Roll）是 Step 7 的内容；
  // 这里先按"当前最缺什么"自动选定，避免在交火中弹出模态框打断战斗。
  scavengeAssemble(p) {
    const cost = 3;
    if ((p.scrap | 0) < cost) return null;
    p.scrap -= cost;
    const lowAmmo = (() => {
      const w = p.weapon;
      return w && typeof w.reserve === 'number' && isFinite(w.reserve) && w.reserve < 24;
    })();
    let what;
    if (lowAmmo) { what = '弹药包'; for (const w of ammoTargets(p)) if (w && isFinite(w.reserve)) w.reserve += 40; }
    else if (p.armor < 2) { what = '护甲片'; p.armor = Math.min(5, (p.armor | 0) + 1); }
    else { what = '临时改件'; p.bellWindow = Math.max(p.bellWindow || 0, 3.0); }   // 临时强化（本局有效）
    p.recompute();
    this.hud.toast('现场拼装', `${what}（消耗 ${cost} 废料）`, '#8fa2b0', 'build');
    return { what, scrap: p.scrap };
  }

  // 泄压（熔铸匠 §9.3）：把炉热转成一次以玩家为中心的冲击波 + 火焰环。
  heatVent(x, z, radius, power, options = null) {
    this.particles.ring(x, 0.4, z, '#ff7a2e', 26, 0.8, radius);
    this.particles.ring(x, 1.0, z, '#ffd24a', 20, 1.0, radius * 0.75);
    this.particles.explosion(x, 0.8, z, radius * 0.5, '#ff8a3c');
    audio.explosion(Math.min(1.6, radius / 3));
    this.shake(0.22);
    if (options) {
      const targets = heroWaveTargets(this, x, z, radius);
      const hits = heroWaveDamage(this, x, z, radius, options.damage, targets);
      for (const {enemy: e, distance: d} of targets) {
        if (!e.alive || e.boss || e.isBoss || e === this.boss || d < .01) continue;
        const k = Math.max(0, 1 - d / radius) * power;
        const previous={x:e.x,z:e.z};
        e.x += (e.x - x) / d * k * 2.2;e.z += (e.z - z) / d * k * 2.2;
        resolveEnemyMovement(e,this,previous);
      }
      this._ventHits = Math.max(this._ventHits | 0, hits);
      return hits;
    }
    let hits = 0;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const dx = e.x - x, dz = e.z - z, d = Math.hypot(dx, dz);
      const er = (e.r ?? e.radius ?? 0.5);
      if (d > radius + er || d < 0.01) continue;
      hits++;
      const k = (1 - d / radius) * power;
      if (!e.boss) {
        const previous={x:e.x,z:e.z};
        e.x += (dx / d) * k * 2.2;
        e.z += (dz / d) * k * 2.2;
        resolveEnemyMovement(e,this,previous);
      }
      this.onDamage(e, 1.2 + k * 2.0, { source: 'explosion', ignoreShield: true, knock: 3.0 });
    }
    this._ventHits = Math.max(this._ventHits | 0, hits);
  }

  // 钟波：以 (x,z) 为中心的圆形冲击。守钟人的「回钟」与"钟鸣一击"都用它。
  // 同时服务三个效果：推开普通敌人 / 偏转并削弱附近敌弹 / 视觉与听觉反馈。
  bellWave(x, z, radius, power, small = false, options = null) {
    this.particles.ring(x, 0.45, z, '#ffd24a', small ? 14 : 26, 0.7 + power * 0.3, radius);
    if (!small) this.particles.ring(x, 0.9, z, '#8af0ff', 20, 0.9, radius * 0.8);
    audio.bell(false);
    if (!small) this.shake(0.16);
    const targets = options ? heroWaveTargets(this, x, z, radius) : null;
    if (targets) heroWaveDamage(this, x, z, radius, options.damage, targets);
    // 推开附近普通敌人（Boss 不受位移影响，只吃反馈）
    for (const e of targets ? targets.map(t => t.enemy) : this.enemies) {
      if (!e.alive) continue;
      const dx = e.x - x, dz = e.z - z, d = Math.hypot(dx, dz);
      const er = (e.r ?? e.radius ?? 0.5);
      if (d > radius + er || d < 0.01) continue;
      const k = (options ? Math.max(0, 1 - d / radius) : 1 - d / radius) * power;
      const boss = e.boss || (options && (e.isBoss || e === this.boss));
      if (!boss) {
        const previous={x:e.x,z:e.z};
        e.x += (dx / d) * k * 1.6;
        e.z += (dz / d) * k * 1.6;
        resolveEnemyMovement(e,this,previous);
      }
      if (e.stunT !== undefined && (!options || !boss)) e.stunT = Math.max(e.stunT || 0, 0.18 + k * 0.3);
      if (e.hitFlash !== undefined) e.hitFlash = 0.18;
    }
    // 偏转并削弱附近敌弹
    const pool = (this.projectiles && this.projectiles.pool) || [];
    let n = 0;
    for (const b of pool) {
      if (!b.alive || b.team === TEAM.PLAYER) continue;
      const dx = b.x - x, dz = b.z - z, d = Math.hypot(dx, dz);
      if (d > radius || d < 0.01) continue;
      const sp = Math.max(6, Math.hypot(b.vx, b.vz) * 0.9);
      b.vx = (dx / d) * sp; b.vz = (dz / d) * sp;
      const nl = Math.hypot(b.vx, b.vz) || 1;
      b.dx = b.vx / nl; b.dz = b.vz / nl;
      b.damage *= 0.5;                 // "轻微削弱"：不直接清屏
      b._deflected = true;
      n++;
    }
    return n;
  }

  // 图鉴记录入口：只在真实远征里记录（大厅里不该"发现"任何东西）
  metaSee(kind, id) {
    if(this.actors&&this.actorCount===2&&this.partySessionStore&&this._partyCheckpointOwner){for(const a of orderedActors(this))this._partyCheckpointOwner?.queueSeen(a.playerId,kind,id);return;}
    if (!id) return;
    if (this.mode !== 'run') return;
    if (this._restoring || this._warming) return;
    meta.see(kind, id);
  }

  // ============================================================
  //  成就判定
  // ============================================================
  // 成就在"新的一局"里必须重新开始计数。
  // 抽成方法的原因：曾经这段逻辑散落在构造与 startNewRun 两处，
  // 于是"重置"和"新增字段"很容易漏掉一处（与地图状态类的坑同源）。
  resetAchievementTracking() {
    this._weaponSeen = new Set();
    this._shopBought = false;
    this._noHitRoom = false;
    this._noHitBoss = false;
    this._floorFullyCleared = false;
    this._rareEvent = false;
    this._blastKills = 0;
    this._dmgAtRoomStart = 0;
    for(const k of ['_pdChain','_ventHits','_deadeyeKills','_dismantled','_bounceDouble','_oathPower'])this[k]=0;
    this._bossWithSidearm=false;this._fullAttachBoss=false;this._attSeen=new Set();this._spellForms=new Set();
    if(this.player)this.player.c2Integration=undefined;
  }

  // ============================================================
  //  运行遥测（PASS2 §38）
  //  只记账，不参与任何玩法判定。任何一项读不到都不影响游戏运行。
  // ============================================================
  telReset() { this.tel = emptyTelemetry(); }

  // 本局已进行的总秒数
  telNow() {
    const t = this.tel && this.tel.timeByFloor ? this.tel.timeByFloor : {};
    return (t[1] || 0) + (t[2] || 0) + (t[3] || 0);
  }

  // 里程碑只记第一次（"第一个遗物出现在第几秒"这类问题以前完全靠感觉）
  telFirst(key) {
    if (!this.tel) return;
    if (!this.tel.firstOf) this.tel.firstOf = {};
    if (!Object.hasOwn(this.tel.firstOf, key)) this.tel.firstOf[key] = +this.telNow().toFixed(1);
  }

  telDamage(src, n) { if (this.tel) bump(this.tel.dmgBy, src || 'other', n); }

  // 治疗分账：**获得**与**浪费**必须分开记 —— 满血捡到治疗包是纯浪费，
  // 而"治疗够不够"这个问题的答案完全取决于浪费率（§1.1 / §30）。
  telHeal(src, requested, applied) {
    if (!this.tel) return;
    const s = src || 'drop';
    bump(this.tel.healBy, s, applied);
    const wasted = Math.max(0, (requested || 0) - (applied || 0));
    if (wasted > 0) bump(this.tel.healWasted, s, wasted);
  }

  telCoins(dir, src, n) {
    if (!this.tel) return;
    bump(dir === 'in' ? this.tel.coinsIn : this.tel.coinsOut, src || 'other', n);
  }

  telAmmo(dir, n) { if (this.tel) bump(dir === 'in' ? this.tel.ammoIn : this.tel.ammoOut, 'ammo', n); }
  telService(id) { if (this.tel) bump(this.tel.services, id, 1); }

  // 每帧累计：分层时长、协同生效时长、首领战时长
  telTick(dt) {
    if (!this.tel || !Number.isFinite(dt)) return;
    const t = this.tel.timeByFloor;
    if (t) t[this.floor] = +((t[this.floor] || 0) + dt).toFixed(2);
    if (this.boss && this.boss.alive) this.tel.bossTime = +((this.tel.bossTime || 0) + dt).toFixed(2);
    const syn = this.player && this.player.stats ? (this.player.stats.synergies || []) : [];
    for (const s of syn) if (s && s.cn) this.tel.synergyTime[s.cn] = +((this.tel.synergyTime[s.cn] || 0) + dt).toFixed(2);
  }

  archiveResources(result) {
    try {
      if(!this.tel?.resources)return;
      observeResource(this,'run-end',{result},null,'end:'+this.runId);
      const report=resourceReport(this,result);
      if(report)meta.data.resourceObservation=report;
    } catch {/* A report cannot block completion or progress saving. */}
  }

  telemetrySummary() { return summarize(this.tel); }

  runCtx(extra = {}) {
    const p = this.player;
    const tagCount = {};
    for (const id of (p.items || [])) {
      const it = ITEM_MAP[id];
      if (!it || !it.tags) continue;
      for (const t of it.tags) tagCount[t] = (tagCount[t] || 0) + 1;
    }
    return {
      secrets: this.run.secrets | 0,
      vaults: this.run.vaults | 0,
      synergies: (p.stats.synergies || []).length,
      maxTagCount: Math.max(0, ...Object.values(tagCount)),
      distinctWeapons: this._weaponSeen ? this._weaponSeen.size : 0,
      floorFullyCleared: this._floorFullyCleared,
      rareEvent: !!this._rareEvent,
      noHitRoom: !!this._noHitRoom,
      noHitBoss: !!this._noHitBoss,
      blastKills: this._blastKills | 0,
      bossKilledWithSidearm: !!this._bossWithSidearm,
      winWithModifier: !!this.activeModifier,
      winAtOneHp: p.hp <= 1 && p.alive,
      winNoShop: !this._shopBought,
      // 职业成就用的计数（§44）。每一项都必须由真实事件写入 —— 否则成就永远拿不到。
      pdChain: this._pdChain | 0,
      ventHits: this._ventHits | 0,
      deadeyeKills: this._deadeyeKills | 0,
      dismantled: this._dismantled | 0,
      bounceDoubleKill: this._bounceDouble | 0,
      oathPower: this._oathPower | 0,
      fullAttachBoss: !!this._fullAttachBoss,
      doctrineCount: (this.player.doctrines || []).length,
      petStage: this.companion ? this.companion.stage : 0,
      spellForms: this._spellForms ? this._spellForms.size : 0,
      // 通关类成就的门控：只有从胜利结算这条路径调用时才为真
      atVictory: false,
      ...extra,
    };
  }

  checkAchievements(extra) {
    if (this.mode !== 'run' || this._restoring) return 0;
    const ctx = this.runCtx(extra);
    let got = 0;
    for (const a of ACHIEVEMENTS) {
      if (meta.hasAch(a.id)) continue;
      let ok = false;
      try { ok = !!a.check(ctx); } catch (e) { ok = false; }
      if (!ok) continue;
      meta.grantAch(a.id);
      got++;
      const rw = ACH_REWARDS[a.id] || {};
      if (rw.souls) meta.addSouls(rw.souls);
      if (rw.unlockModifier) meta.unlockModifier(rw.unlockModifier);
      if (rw.unlockSidearm) meta.unlockSidearm(rw.unlockSidearm);
      this.toast('成就达成', `${a.cn} · ${a.desc}${rw.souls ? `　+${rw.souls} 钟魂` : ''}`, '#ffd24a', 'story');
      if (this.mode === 'hub') this.refreshHubProgress();   // 在大厅达成时，功勋墙立刻亮一块
    }
    return got;
  }
}
const EMPTY = [];

// ============================================================
//  V3.0 无缝连接：房间在世界里拥有真实位置
//  两间相邻房的中心距 = 2*房间进深 + 走廊长度。
//  走廊不是装饰，它是真的可走的空间，也是下一房间的 Streaming Buffer。
// ============================================================
const CORRIDOR_LEN = 16;                  // 走廊长度（世界单位）≈ 2.3 秒走完
export const V3_PITCH = (r) => r * 2 + CORRIDOR_LEN;

// Install explicit actor receivers after the real implementations exist.
installActorMethods(Game.prototype);
