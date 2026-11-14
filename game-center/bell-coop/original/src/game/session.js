import {assertSingleActor} from './actor_context.js';
import {createChapterWaveState,validateChapterWaveState} from './chapter_waves.js';
import {FOLD_SHADOW} from '../experimental/combat/fold_hero.js';
import {PAGE_COMPARISON,validateComparisonSessionIdentity} from '../experimental/comparison/config.js';
import {captureConsumableHost,restoreConsumableHost} from '../experimental/consumables/host_state.js';
import {isKnownItem as isConsumable} from '../experimental/consumables/index.js';
import {PAGE_COMBAT_MODE, validateCombatSessionIdentity} from '../experimental/combat/mode.js';
import {validateCombatState} from '../experimental/combat/controller.js';
import { validateHeroIntegration } from './hero_integration_v3.js';
import { doctrineChoiceData, validateDoctrines } from './doctrine_state_v3.js';
import { validatePetGrowth } from './hero_growth_v3.js';
import { validatePetRage } from './hero_feedback.js';
import {validateSharedManaRecord} from './shared_mana.js';
import { chestRules } from './chest_rules.js';
import {savedWeaponDefinition} from './weapon_versions.js';
import {hasPregeneratedWeaponDefinition,validWeaponAssetStateShape} from './weapon_compatibility.js';
export {savedWeaponDefinition} from './weapon_versions.js';
// 场景与逻辑的边界：只序列化数据，不保存 Three 对象或函数。
import { WEAPON_MAP, LEGACY_WEAPON_MAP, ITEM_MAP, ACTIVE_MAP, ENEMY_MAP, SPECIAL_EVENTS } from './data.js';
import { spellFromWeapon } from './spells.js';
import { heroById, HEROES, MODIFIERS } from './heroes.js';
import { validHeroRuleVersion } from './hero_rules.js';
import { newHeroStateV3, validateHeroStateV3 } from './hero_state_v3.js';
import { ATTACH_MAP } from './attachments.js';
import { validAttachmentPositions } from './equipment_drops.js';
import { validCorrectionIdentity } from './tracking.js';
import { Enemy } from './enemies.js';
import { Boss } from './boss.js';
import { BOSS_MAP, DEFAULT_BOSS_TYPE, createBoss } from './bosses.js';
import { ARCH_MAP } from '../gen/encounters.js';
import { Companion } from './companion.js';
import { encode, decode } from './save.js';
import { generateDungeon, Dungeon, DIRS } from '../gen/dungeon.js';
import { Player } from './player.js';
import { DOCTRINE_MAP, DOCTRINE_MAP_V3 } from './doctrines.js';
import { EVO_MAP } from './companion.js';
import { normalizeFoodPickup } from './objects.js';
import { WeaponAssetsRuntime } from './weapon_assets_runtime.js';
import {validPaidResourceIdentity} from './weapon_assets/lottery_actions.js';
import { MAX_WEAPON_SLOTS } from '../core/constants.js';
import { validateBuildSupply, supplyCatalog } from './build_supply_bridge.js';
import { validateRevival } from './revival.js';
import { validateStageContext } from './stage_flow.js';
import {stageRoomRange} from './stage_profiles.js';
import {validateExpandedDungeon} from '../gen/expanded_stage_dungeon.js';

const TRACK_KEYS = ['time', 'hitStopT', 'shakeAmt', 'hurt', 'flash', 'aberr', 'vt', 'dustTimer', 'autoReloading', '_origin', '_dmgAtRoomStart',
  '_weaponSeen', '_attSeen', '_spellForms', '_knownSyn', '_seenTip', '_shopBought', '_noHitRoom', '_noHitBoss', '_floorFullyCleared', '_rareEvent',
  '_blastKills', '_bossWithSidearm', '_pdChain', '_ventHits', '_deadeyeKills', '_dismantled', '_bounceDouble', '_oathPower', '_fullAttachBoss', '_tipT', '_tipTouched', '_aimDir', '_damageRootSequence'];
export function applyTracking(g, data) { for (const k of TRACK_KEYS) if (Object.hasOwn(data || {}, k)) g[k] = data[k]; }

function plain(v, depth = 0) {
  if (depth > 12 || v === undefined || typeof v === 'function') return undefined;
  if (v === null || ['string', 'number', 'boolean'].includes(typeof v)) return v;
  if (v instanceof Set) return new Set([...v].map(x => plain(x, depth + 1)));
  if (Array.isArray(v)) return v.map(x => plain(x, depth + 1));
  if (Object.getPrototypeOf(v) !== Object.prototype) return undefined;
  const out = {};
  for (const [k, x] of Object.entries(v)) { const y = plain(x, depth + 1); if (y !== undefined) out[k] = y; }
  return out;
}
export function fields(obj, omit = []) {
  const out = {}, skip = new Set(omit);
  for (const [k, v] of Object.entries(obj)) if (!skip.has(k)) { const x = plain(v); if (x !== undefined) out[k] = x; }
  return out;
}
// 深拷贝保证房间休眠快照不会被活跃对象后续修改。
const clone = v => decode(encode(v));
const validSavedReward = x => x?.kind === 'weapon' ? hasPregeneratedWeaponDefinition(x) :
  !!({item:ITEM_MAP,active:ACTIVE_MAP,attachment:ATTACH_MAP}[x?.kind]?.[x.id] || ['heal','key','ammo','armor'].includes(x?.kind)&&x.id===x.kind);
export function validateEmbeddedWeaponState(w,def,roomSnapshot=null){
  if(!validWeaponAssetStateShape(w.assetState))throw Error('武器运行态必须是普通对象');
  if(w.assetState===undefined||w.assetState===null)return;
  const runtime=new WeaponAssetsRuntime({});
  if(!runtime.supports(def))throw Error('武器定义不支持运行态');
  runtime.lottery.validateRaw(w.assetState);
  runtime.bindInventory({weapons:[{...clone(w),def}]});
  if(roomSnapshot){
    if(!roomSnapshot.states?.[w.assetInstanceId]||encode(w.assetState)!==encode(roomSnapshot.states[w.assetInstanceId]))throw Error('武器实例与完整运行态不一致');
    runtime.restore(roomSnapshot,{resumeRuntime:true});
  } else runtime.restore(runtime.capture());
}
export function validateOwnedWeaponRuntime(w,def,snapshot){
  const owner=w.assetInstanceId,state=snapshot?.states?.[owner];
  if(!state)return;
  const version=def.weaponAssetVersion||1;
  if(state.weaponId!==(def.sourceWeapon||def.id)||state.definitionVersion!==undefined&&state.definitionVersion!==version)throw Error('武器运行态与实例不一致');
  const check=value=>{
    if(!value||typeof value!=='object')return;
    if(value.rootShotId&&value.owner===owner&&(value.definitionVersion??2)!==version)throw Error('武器弹体版本与实例不一致');
    if(value.rootShotId&&value.owner===owner&&!validPaidResourceIdentity(value,def))throw Error('武器付款资源与实例不一致');
    for(const child of Object.values(value))if(child&&typeof child==='object')check(child);
  };
  check(state);for(const entity of [...(snapshot.entities||[]),...(snapshot.queue||[])])if(entity.owner===owner)check(entity);
}
export function validateKnownOwnerResources(w,def,snapshot){
  const check=value=>{if(!value||typeof value!=='object')return;if(value.rootShotId&&value.owner===w.assetInstanceId&&!validPaidResourceIdentity(value,def))throw Error('武器付款资源与实例不一致');for(const child of Object.values(value))if(child&&typeof child==='object')check(child);};
  check(snapshot?.states?.[w.assetInstanceId]);
  for(const entity of [...(snapshot?.entities||[]),...(snapshot?.queue||[])])if(entity.owner===w.assetInstanceId)check(entity);
}
const PLAYER_OMIT = ['game', 'hero', 'rig', 'gunModel', 'stats', 'weapons'];
const ENTITY_OMIT = ['game', 'def', 'rig', 'group', 'gunModel', 'telegraphs'];
const ROOM_FLAGS = ['cleared', 'visited', 'discovered', 'entered', 'looted', 'locked', 'lockGrace', 'pendingCombat', 'vaultEntered', 'wavesSpawned', 'telShopCounted','c2CombatStarted','chapterWaves'];
export const SESSION_SCHEMA_VERSION = 6;
// Legacy schemas we can still read: absent (oldest), 1, 2, 3, 4, 5.
const LEGACY_SCHEMAS = [undefined, 1, 2, 3, 4, 5];

// Check new metadata before JSON migration can discard explicitly present keys.
function validateRawWeaponMetadata(input) {
  for (const record of [...(Array.isArray(input.rooms) ? input.rooms : []), ...(Array.isArray(input.dungeon?.rooms) ? input.dungeon.rooms : []), ...Object.values(input.roomStates || {})]) {
    if (record && Object.hasOwn(record, 'chapterWaves')) validateChapterWaveState(record.chapterWaves);
  }
  const visit=(value,depth=0)=>{
    if (!value || typeof value !== 'object') return;
    if (depth > 30) throw new Error('职业伤害快照嵌套无效');
    for (const key of ['c2DamageApplied','c2StatusMul']) if (Object.hasOwn(value,key) &&
      (!Number.isFinite(value[key]) || value[key] < 1 || value[key] > 3)) throw new Error('职业伤害快照无效');
    for (const child of Object.values(value)) if (child && typeof child === 'object') visit(child,depth+1);
  };
  visit(input.player?.weapons);
  for (const st of Object.values(input.roomStates || {})) {visit(st.projectiles);visit(st.weaponAssets);}
  const lottery=new WeaponAssetsRuntime({}).lottery;
  for(const w of Array.isArray(input.player?.weapons)?input.player.weapons:[])lottery.validateRaw(w?.assetState);
  for(const st of Object.values(input.roomStates||{})){
    lottery.validateRaw(st?.weaponAssets);
    // Old shop migration can change an item pickup into a weapon after cloning.
    for(const pu of Array.isArray(st?.pickups)?st.pickups:[])lottery.validateRaw(pu?.assetState);
  }
}

// Only absent legacy fields are defaulted. Present invalid values remain invalid.
export function migrateSession(input) {
  if (!input || input.version !== 1 || ![...LEGACY_SCHEMAS, SESSION_SCHEMA_VERSION].includes(input.schemaVersion)) throw new Error('不支持此远征 schemaVersion；原槽保留');
  if (Object.hasOwn(input, 'heroRuleVersion') && !validHeroRuleVersion(input.heroRuleVersion)) throw new Error('不支持此职业规则版本；原槽保留');
  validateRawWeaponMetadata(input);
  if(input.heroRuleVersion===3 && input.hero==='arcanist' && input.player && !Object.hasOwn(input.player,'mana')) {
    if(input.player.weapons?.some(w=>w.id?.startsWith('spell_') && (!Number.isFinite(w.reserve)||w.reserve<0||w.reserve>360)))throw Error('旧档法力无效');
    input=clone(input);
    const held=input.player.weapons?.[input.player.weaponIndex];
    input.player.mana=Math.max(0,Math.min(360,Number.isFinite(held?.reserve)?held.reserve:120));
    for(const w of input.player.weapons||[])if(w.id?.startsWith('spell_'))w.reserve=input.player.mana;
  }
  validateSharedManaRecord(input);
  // Earlier C2 saves have no shared heat budget. Start empty, without granting heat.
  if (input.heroRuleVersion === 3 && input.player?.c2 && !Object.hasOwn(input.player.c2, 'forgeHeatBudget')) {
    input = clone(input);
    input.player.c2.forgeHeatBudget = 0;
  }
  // P1 v3 snapshots predate the two P2 movement fields. Only the exact old
  // shape is grandfathered; a partially missing current shape remains invalid.
  if (input.heroRuleVersion === 3 && input.player?.c2 &&
      !Object.hasOwn(input.player.c2, 'rangerMoveLeft') &&
      !Object.hasOwn(input.player.c2, 'rangerDir') &&
      Object.keys(input.player.c2).length === Object.keys(newHeroStateV3()).length - 2) {
    input = clone(input);
    input.player.c2.rangerMoveLeft = 0;
    input.player.c2.rangerDir = { x: 0, z: 1 };
  }
  if (input.heroRuleVersion === 3) {validateHeroStateV3(input.player,input.hero);validateHeroIntegration(input.player);if(input.hero==='veteran')validateDoctrines(input.player,input.choice);if(input.hero==='tamer'&&input.companion&&Object.hasOwn(input.companion,'growth'))validatePetGrowth(input.companion);}
  validateRawWeaponMetadata(input);
  if (input.schemaVersion === SESSION_SCHEMA_VERSION) {
    if (!input.player || Object.hasOwn(input.player,'activeIndex')) return input;
    const normalized = clone(input);
    normalized.player.activeIndex = 0;
    return normalized;
  }
  // Schemas 2..5 were previous current formats. Their saved dungeon is authoritative:
  // only add the new optional fields and never re-generate a legacy map.
  if ([2, 3, 4, 5].includes(input.schemaVersion)) {
    const s = clone(input);
    if (s.player && !Object.hasOwn(s.player, 'activeIndex')) s.player.activeIndex = 0;
    if (!Object.hasOwn(s, 'runId')) s.runId = null;
    if (!Object.hasOwn(s, 'buildSupply')) s.buildSupply = null;
    if (!Object.hasOwn(s, 'runPolicy')) s.runPolicy = null;
    if (!Object.hasOwn(s, 'revival')) s.revival = null;
    if (!Object.hasOwn(s, 'shopTx')) s.shopTx = null;
    if (!Object.hasOwn(s, 'flowVersion')) { s.flowVersion = 1; s.stage = null; s.stageRun = null; }
    s.schemaVersion = SESSION_SCHEMA_VERSION;
    return s;
  }
  const s = clone(input);
  if (!Object.hasOwn(s, 'runId')) s.runId = null;
  if (!Object.hasOwn(s, 'buildSupply')) s.buildSupply = null;
  if (!Object.hasOwn(s, 'runPolicy')) s.runPolicy = null;
  if (!Object.hasOwn(s, 'revival')) s.revival = null;
  if (!Object.hasOwn(s, 'shopTx')) s.shopTx = null;
  if (!Object.hasOwn(s, 'flowVersion')) { s.flowVersion = 1; s.stage = null; s.stageRun = null; }
  const defaults = { activeIndex: 0, spareAttachments: [], doctrines: [], _hpPenalty: 0, deadeyeT: 0, tuningT: 0, overclockT: 0, overheatT: 0, spellEchoT: 0, momentumT: 0, swapT: 0 };
  if (s.player) for (const [k, v] of Object.entries(defaults)) if (!Object.hasOwn(s.player, k)) s.player[k] = v;
  // Reproduce old generated contents before normalizing their identity. Do not roll new loot.
  if (!s.dungeon && Number.isInteger(s.seed) && [1, 2, 3].includes(s.floor) && s.scenes) {
    const old = generateDungeon(s.seed, s.floor, { legacyContent: true });
    if (!s.rooms || old.list.length !== s.rooms.length || s.rooms.some(r => { const e = old.rooms.get(r.id); return !e || ['seed','uid','gx','gy','type','radius'].some(k => e[k] !== r[k]); })) throw new Error('旧地图版本不兼容；原槽保留，不重新生成');
    s.dungeon = { ...fields(old, ['rooms']), rooms: old.list.map(r => fields(r)) };
    for (const r of old.list) {
      const stock = r.content.shopStock.map(x => ({ ...x, kind: ITEM_MAP[x.id] ? 'item' : ACTIVE_MAP[x.id] ? 'active' : x.kind }));
      s.dungeon.rooms.find(x => x.id === r.id).content.shopStock = clone(stock);
      for (const scene of [s.scenes[r.uid], s.roomStates?.[r.uid]?.scene]) if (scene && !Object.hasOwn(scene, 'shopStock')) scene.shopStock = clone(stock);
      for (const pu of s.roomStates?.[r.uid]?.pickups || []) if (pu.shopIndex >= 0 && stock[pu.shopIndex]) pu.kind = stock[pu.shopIndex].kind;
    }
  }
  // 旧档的房间首领快照没有 bossType：按"当时唯一的首领"迁移，而不是按新 Seed 重掷身份。
  for (const st of Object.values(s.roomStates || {})) if (st.boss && !Object.hasOwn(st.boss, 'bossType')) st.boss.bossType = DEFAULT_BOSS_TYPE;
  // 远征级首领身份（PASS2 §24）：缺失=旧档，按默认首领处理，绝不重掷。
  if (s.bossType !== undefined && !Object.hasOwn(BOSS_MAP, s.bossType)) throw new Error('存档首领身份无效');
  if (s.bossPractice !== undefined && s.bossPractice !== null && !Object.hasOwn(BOSS_MAP, s.bossPractice)) throw new Error('存档首领练习身份无效');
  s.schemaVersion = SESSION_SCHEMA_VERSION;
  return s;
}
export function restoreDungeon(data) {
  const d = new Dungeon(data.seed, data.floor);
  for (const k of ['gridSize','startId','maxDist','battleRatio','flowVersion','contentVersion','encounterVersion','profile','chapter','segment','stageKey','themeId','threatProgress','stageSeed','hiddenSegments']) if (data[k] !== undefined) d[k] = clone(data[k]);
  d.rooms = new Map(data.rooms.map(r => [r.id, clone(r)]));
  return d;
}
export function applyRoomFlags(room, data, {replaceMissing=false} = {}) {
  for (const k of ROOM_FLAGS) {
    if (Object.hasOwn(data, k)) room[k] = k === 'chapterWaves' ? validateChapterWaveState(data[k]) : clone(data[k]);
    else if(replaceMissing)delete room[k];
  }
  if (!Object.hasOwn(data, 'chapterWaves')) delete room.chapterWaves;
}

export function validateEntityDataRecord(d,Type){
  const denied=new Set(['game','rig','def','group','gunModel','hero','stats','mesh','ownerRef','light','g']);
  if(Type)for(let proto=Type.prototype;proto&&proto!==Object.prototype;proto=Object.getPrototypeOf(proto))for(const k of Object.getOwnPropertyNames(proto))denied.add(k);
  if(d&&Object.keys(d).some(k=>denied.has(k)))throw Error('Snapshot contains scene or method field');
}
export function capturePlayer(p) {
  return { ...fields(p, PLAYER_OMIT), weapons: p.weapons.map(w => ({ ...fields(w, ['def']), id: w.def.id, source: w.def.sourceWeapon || w.def.sourceId || w.def.id.replace(/^spell_/, ''),definitionVersion:w.def.weaponAssetVersion||1 })) };
}
export function applyPlayer(g, data) {
  const p = g.player;
  Object.assign(p, clone(fields(data, ['weapons'])));
  p.hero = g.hero;
  p.buildEffectsVersion=2;
  p.weapons = data.weapons.map(w => ({ ...clone(fields(w, ['id', 'source','definitionVersion'])), def: savedWeaponDefinition(w) }));
  // recompute 只重建派生属性；当前血量/护甲、资源与装填状态以快照为准。
  const hp = p.hp, armor = p.armor, resources=p.weapons.map(w=>({mag:w.mag,reserve:w.reserve}));
  p.recompute(); p.hp = hp; p.armor = armor;
  p.weapons.forEach((w,i)=>Object.assign(w,resources[i]));
  p.buildModel(); p.animate(0);
  g.weaponAssets?.bindInventory?.(p);
}
export function captureRoom(g) {
  assertSingleActor(g);
  return {...captureRoomWorld(g), weaponAssets:g.weaponAssets?.capture()};
}
function captureSummon(t){return {...fields(t,['g','light']),pose:{position:t.g.position.toArray(),rotation:t.g.rotation.toArray(),scale:t.g.scale.toArray(),visible:t.g.visible}};}
function restoreSummonPose(t,data){if(!data.pose)return;const p=data.pose;if(!Array.isArray(p.position)||p.position.length!==3||!Array.isArray(p.scale)||p.scale.length!==3||!Array.isArray(p.rotation)||p.rotation.length!==4||!['XYZ','YZX','ZXY','XZY','YXZ','ZYX'].includes(p.rotation[3])||[...p.position,...p.scale,...p.rotation.slice(0,3)].some(x=>!Number.isFinite(x))||typeof p.visible!=='boolean')throw Error('Invalid summon pose');t.g.position.fromArray(p.position);t.g.rotation.fromArray(p.rotation);t.g.scale.fromArray(p.scale);t.g.visible=p.visible;}
export function captureRoomWorld(g) {
  const sc = g.roomScene;
  const slots = sc.shopSlots || [];
  return clone({
    scene: sc.exportState(),
    ...(g.room.chapterWaves?{chapterWaves:structuredClone(g.room.chapterWaves)}:{}),
    enemies: g.enemies.map(e => ({ ...fields(e, ENTITY_OMIT), kind: e.kind })),
    boss: g.boss ? fields(g.boss, ENTITY_OMIT) : null,
    pickups: g.pickups.list.map(p => ({ ...fields(p, ['mesh', 'shopSlot']), shopIndex: p.shopSlot ? slots.indexOf(p.shopSlot) : -1, y: p.mesh.position.y })),
    hazards: g.hazards.items.map(h => fields(h, ['mesh', 'disc'])),
    projectiles: g.projectiles.pool.filter(b => b.alive).map(b => ({ ...fields(b, ['mesh', 'ownerRef']), ownerId: b.ownerRef?.id || null, color: '#' + b.mesh.material.color.getHexString() })),
    pending: g.pendingSpawns.filter(q => q.room === g.room).map(q => fields(q, ['room'])),
    lootQueue: (g.pendingLoot || []).filter(q => q.roomId === g.room.uid),
    turrets: (g._turrets || []).map(captureSummon),
    drones: (g._drones || []).map(captureSummon),
  });
}
export function clearRoomDynamics(g) {
  g.clearDamageFeedback?.();
  for(const a of g.actors?.values()||[])a.weaponAssets?.clear();if(!g.actors)g.weaponAssets?.clear();g.weaponAssetFX?.clear();
  g.clearEnemies(); g.pickups.clear(); g.hazards.clear(); g.projectiles.reset();
  g.dropPendingFor(); g.pendingLoot = [];
  for (const t of [...(g._turrets || []), ...(g._drones || [])]) {
    g.scene.remove(t.g);
    if (t.light) { t.light.active = false; t.light.light.intensity = 0; }
  }
  g._turrets = []; g._drones = [];
}
export function applyRoom(g, s) {
  const rngState = g.rng.s, gameplayState = g.grng.s;
  clearRoomDynamics(g);
  g.roomScene.importState(s.scene);
  if(Object.hasOwn(s,'chapterWaves'))g.room.chapterWaves=validateChapterWaveState(s.chapterWaves);
  else delete g.room.chapterWaves;
  for (const data of g.room.type==='exit'?[]:s.enemies || []) {
    const e = new Enemy(g, data.kind, data.x, data.z, { elite: data.elite, id: data.id });
    Object.assign(e, clone(data)); e.group.position.set(e.x, 0, e.z);
    if (!e.alive) e.updateDeath(0);
    g.enemies.push(e);
  }
  if (s.boss) {
    // 必须按保存的身份创建对应类，否则读档后行为会变成另一个首领（身份 ≠ 实体 id）
    g.boss = createBoss(g, s.boss.x, s.boss.z, s.boss.bossType);
    Object.assign(g.boss, clone(s.boss));
    g.boss.group.position.set(g.boss.x, 0, g.boss.z);
    if (g.boss.syncPhaseVisual) g.boss.syncPhaseVisual();
    g.setBossPhase(g.boss.phase);
  }
  for (const data of s.pickups || []) {
    const slot = data.shopIndex >= 0 ? g.roomScene.shopSlots[data.shopIndex] : null;
    const normalized = normalizeFoodPickup(data.kind, { ...data, ...(data.kind==='weapon'?{definitionVersion:data.definitionVersion??1}:{}),shopSlot: slot }, g.mod_, g.mode === 'run');
    const p = g.pickups.spawn(normalized.kind, data.x, data.z, normalized);
    Object.assign(p, clone(fields(normalized, ['shopIndex', 'shopSlot', 'y']))); p.mesh.position.set(p.x, data.y, p.z);
  }
  for (const data of s.hazards || []) { g.hazards.add(data.x, data.z, data.radius, data.delay, data.damage, data.color); Object.assign(g.hazards.items.at(-1), clone(data)); }
  const entities = new Map([...(g.actors?[...g.actors.values()].map(a=>[a.playerId,a.player]):[['player',g.player]]), ...g.enemies.map(e => [e.id, e]), ['boss', g.boss]]);
  if(g.actors)for(const a of g.actors.values())if(a.companion?.id)entities.set(a.companion.id,a.companion);
  if(g.companion?.id)entities.set(g.companion.id,g.companion);
  for (const data of s.projectiles || []) {
    if(data.ownerId!==null&&!entities.has(data.ownerId))throw Error('Unresolved native projectile owner');
    const b = g.projectiles.spawn({ ...data, owner: entities.get(data.ownerId) || null });
    if (!b) throw new Error('弹幕快照超出容量');
    Object.assign(b, clone(fields(data, ['ownerId', 'color'])));
    b.mesh.position.set(b.x, b.y, b.z);
  }
  g.room.pendingCombat = 0;
  for (const q of g.room.type==='exit'?[]:s.pending || []) { g.pendingSpawns.push({ ...clone(q), room: g.room }); g.room.pendingCombat++; }
  if(g.room.type==='exit'){g.room.cleared=true;g.room.locked=false;delete g.room.chapterWaves;}
  g.pendingLoot = clone(s.lootQueue || []);
  for (const t of s.turrets || []) { const v=t.ownerPlayerId?g.getActor(t.ownerPlayerId).view:g;v.spawnTurret(t.x, t.z, t.power); Object.assign(g._turrets.at(-1), clone(t));restoreSummonPose(g._turrets.at(-1),t); }
  for(const data of s.drones||[]){const v=data.ownerPlayerId?g.getActor(data.ownerPlayerId).view:g;v.spawnCompanion(data.power,{count:1,passive:!!data.passive,silent:true});Object.assign(g._drones.at(-1),clone(data));restoreSummonPose(g._drones.at(-1),data);}
  g.hitboxes = [...(g.actors?[...g.actors.values()].map(a=>a.player):[g.player]), ...g.enemies.filter(e => e.alive), ...(g.boss?.alive ? [g.boss] : [])];
  if(s.actorRuntimes)for(const [id,snapshot]of Object.entries(s.actorRuntimes))g.getActor(id).weaponAssets.restore(snapshot,{preserveWeaponState:!g._restoringRoom&&!g._runtimeRestoring,resumeRuntime:true});
  if(s.weaponAssets)g.weaponAssets?.restore(s.weaponAssets,{preserveWeaponState:!g._restoring,resumeRuntime:!!g._runtimeRestoring});
  g.rng.s = rngState; g.grng.s = gameplayState;
}
export function captureSession(g, { pure = false } = {}) {
  assertSingleActor(g);
  if (g.hero.ruleVersion === 3){validateHeroStateV3(g.player,g.hero.id);validateHeroIntegration(g.player);if(g.hero.id==='veteran')validateDoctrines(g.player);if(g.hero.id==='tamer'&&g.companion&&Object.hasOwn(g.companion,'growth'))validatePetGrowth(g.companion);}
  const roomStates = pure ? new Map(g.roomStates) : g.roomStates;
  roomStates.set(g.room.uid, captureRoom(g));
  return clone({ ...(g.comparison?{comparison:structuredClone(g.comparison)}:{}),...(g.experiment ? {combatMode:g.combatMode || 'pass-d',experiment:validateCombatState(g.experiment),...(g.consumables?{consumables:captureConsumableHost(g)}:{})} : {}), version: 1, schemaVersion: SESSION_SCHEMA_VERSION, seed: g.seed, floor: g.floor, hero: g.hero.id, heroRuleVersion: g.hero.ruleVersion || 1, modifier: g.activeModifier?.id || '', practice: !!g.practice,
    // Boss Pool 身份（§24）：随存档走，旧档恢复时不会被 Seed 映射换掉
    bossType: g.bossType || DEFAULT_BOSS_TYPE, bossPractice: g.bossPractice || null,
    dungeon: { ...fields(g.dungeon, ['rooms']), rooms: g.dungeon.list.map(r => fields(r)) },
    player: capturePlayer(g.player), companion: g.companion ? fields(g.companion, ['game', 'group', 'parts', 'core', 'body', 'head', 'legs', 'tail', 'light']) : null,
    // 运行遥测随活跃 Run 保存（PASS2 §38）：只用于调平衡，不联网
    telemetry: fields(g.tel || {}),
    rooms: g.dungeon.list.map(r => Object.fromEntries(['id', 'uid', 'seed', 'gx', 'gy', 'radius', 'type', ...ROOM_FLAGS].filter(k => r[k] !== undefined).map(k => [k, r[k]]))), roomId: g.room.id, roomStates: Object.fromEntries(roomStates), run: fields(g.run),
    // 未访问房间也已生成奖励；保存实际内容，避免下楼/词条差异导致续玩重掷。
    scenes: Object.fromEntries([...g._residentRooms].map(([uid, sc]) => [uid, sc.exportState()])),
    rng: { seed: g.rng.seed, s: g.rng.s }, grng: { seed: g.grng.seed, s: g.grng.s },
    tracking: Object.fromEntries(TRACK_KEYS.filter(k => g[k] !== undefined).map(k => [k, plain(g[k])])),
    choice: g.hero.ruleVersion===3&&g.hero.id==='veteran'?doctrineChoiceData(g.player):g.hud._choice ? fields(g.hud._choice.cfg, ['onPick']) : (g._pendingChoice ? fields(g._pendingChoice, ['onPick']) : null),
    // 路线供给身份（Task5）：runId 随局生成并持久化；seed 不是 runId。
    runId: g.runId || null, buildSupply: g.buildSupply ? plain(g.buildSupply) : null,
    // 本局策略与一次复苏（Task6）
    runPolicy: g.runPolicy ? plain(g.runPolicy) : null, revival: g.revival ? plain(g.revival) : null,
    // 商店交易账本（Task5）：回执与版本随档走，重放不二次扣款。
    shopTx: g.shopTx ? plain(g.shopTx) : null,
    // 流程与阶段（Task7/8）：flowVersion 1=旧三层，2=章节五段。
    flowVersion: g.flowVersion === 2 ? 2 : 1,
    stage: g.flowVersion === 2 && g.stage ? plain(g.stage) : null,
    stageRun: g.flowVersion === 2 && g.stageRun ? plain(g.stageRun) : null,
  });
}
export function captureSessionDraft(g) { return captureSession(g, { pure: true }); }
export function validateSession(s, {combatMode = PAGE_COMBAT_MODE,comparisonMode=PAGE_COMPARISON,runtimeState=null,party=false,partyCombatAbilities=false,partyDowned=false} = {}) {
  // Only the independent runtime envelope opts into a settled death scene.
  // Browser schema6 validation retains its active-save contract.
  if (runtimeState !== null && !['play','transition','dead','victory'].includes(runtimeState)) throw Error('Invalid runtime state');
  validateCombatSessionIdentity(s || {}, combatMode);
  validateComparisonSessionIdentity(s,comparisonMode);
  const combatAbilities = combatMode === 'experimental' || s?.hero === 'foldshadow';
  if (combatAbilities) restoreConsumableHost(s.consumables);
  else if (Object.hasOwn(s||{},'consumables')) throw Error('经典远征不能携带实验消耗品');
  if (combatAbilities) validateCombatState(s.experiment);
  s = migrateSession(s);
  const worldCombatAbilities=combatAbilities||party&&partyCombatAbilities;
  if (!s || s.version !== 1 || ![1, 2, 3].includes(s.floor) || !Number.isInteger(s.seed) || !HEROES.some(h => h.id === s.hero)) throw new Error('远征身份无效');
  // 流程版本：1 = 旧三层（默认），2 = 章节五段。
  const flow2 = s.flowVersion === 2;
  if (s.flowVersion !== undefined && ![1, 2].includes(s.flowVersion)) throw new Error('不支持此流程版本');
  if (flow2) {
    validateStageContext(s.stage, s.seed);
    if (!s.stage || s.stage.themeId !== s.floor) throw new Error('阶段主题与楼层投影不一致');
    if (!s.stageRun || s.stageRun.contentVersion !== s.stage.contentVersion || s.stageRun.campaignScope !== s.stage.campaignScope) throw new Error('阶段进度与阶段上下文不一致');
    if(s.stage.contentVersion>=2&&s.stageRun.profile!==s.stage.profile)throw Error('阶段规模与进度不一致');
    if (typeof s.stageRun.milestones !== 'object' || s.stageRun.milestones === null || typeof s.stageRun.rewards !== 'object' || s.stageRun.rewards === null) throw new Error('阶段进度账本无效');
    if (Object.keys(s.stageRun.milestones).length > 15 || Object.keys(s.stageRun.rewards).length > 64) throw new Error('阶段进度账本过大');
    for (const [k, v] of Object.entries(s.stageRun.milestones)) if (typeof k !== 'string' || !v || typeof v !== 'object') throw new Error('阶段里程碑无效');
    for (const k of Object.keys(s.stageRun.rewards)) if (typeof k !== 'string' || !k.startsWith('v2:')) throw new Error('阶段奖励键无效');
  } else if (s.stage || s.stageRun) throw new Error('非阶段流程不得携带阶段字段');
  if (s.modifier && !MODIFIERS.some(m => m.id === s.modifier)) throw new Error('挑战词条无效');
  if (!Array.isArray(s.rooms) || s.rooms.length < 1 || s.rooms.length > 40 || !s.rooms.some(r => r.id === s.roomId) || !s.roomStates) throw new Error('地图快照无效');
  const expectDungeonSeed = flow2 ? s.stage.stageSeed : s.seed;
  if (!s.dungeon || s.dungeon.seed !== expectDungeonSeed || s.dungeon.floor !== s.floor || !Array.isArray(s.dungeon.rooms) || s.dungeon.rooms.length !== s.rooms.length) throw new Error('已保存地图拓扑无效');
  if(flow2){const [min,max]=stageRoomRange(s.stage);if(s.rooms.length<min||s.rooms.length>max)throw Error('阶段地图房间数与规模不一致');}
  const expected = restoreDungeon(s.dungeon);
  if(flow2&&s.stage.contentVersion>=2)validateExpandedDungeon(expected,s.stage);
  if(flow2&&s.stage.contentVersion===1&&(s.dungeon.contentVersion!==undefined&&s.dungeon.contentVersion!==1||s.dungeon.profile!==undefined&&s.dungeon.profile!=='compact'))throw Error('旧章节地图身份不一致');
  if (s.experiment?.fold) {
    const f=s.experiment.fold, room=expected.rooms.get(s.roomId);
    if (f.images.length && f.roomUid!==room?.uid) throw Error('影像不属于当前房间');
    // World rooms use a 42-unit pitch relative to the start, rather than CELL.
    // Include the outgoing corridor: room identity changes only after entry.
    const origin=expected.list.find(r=>r.isStart)||{gx:0,gy:0};
    for (const image of f.images) if (image.roomUid!==room.uid ||
      Math.abs(image.x-(room.gx-origin.gx)*42)>room.radius+42 ||
      Math.abs(image.z-(room.gy-origin.gy)*42)>room.radius+42) throw Error('影像落点不属于当前房间');
  }
  if (expected.list.length !== s.rooms.length) throw new Error('地图版本不兼容');
  for (const r of s.rooms) {
    const e = expected.rooms.get(r.id);
    if (!e || e.seed !== r.seed || e.uid !== r.uid || e.gx !== r.gx || e.gy !== r.gy || e.type !== r.type || e.radius !== r.radius) throw new Error('地图版本不兼容');
    const expectUid = flow2 ? `v2:${s.stage.stageKey}:${r.id}` : `${s.floor}:${r.id}`;
    if (!Number.isInteger(r.gx) || !Number.isInteger(r.gy) || Math.abs(r.gx)>32 || Math.abs(r.gy)>32 || r.id !== `${r.gx},${r.gy}` || r.uid !== expectUid || !Number.isInteger(r.seed) || !Number.isFinite(r.radius) || r.radius < 5 || r.radius > 30 || !['start','battle','shop','treasure','special','hidden','vault','exit','boss'].includes(r.type) || !e.doors || !Array.isArray(e.secretWallDirs) || !e.content) throw new Error('地图房间定义无效');
    for (const dir of DIRS) { if (typeof e.doors[dir.k] !== 'boolean') throw new Error('门定义无效'); const nb=expected.get(r.gx+dir.dx,r.gy+dir.dy); if (e.doors[dir.k] && (!nb || !nb.doors?.[dir.opp])) throw new Error('门连接不一致'); }
    if ((e.content.enemies || []).some(id=>!ENEMY_MAP[id]) || !Array.isArray(e.content.shopStock)) throw new Error('已保存房间内容无效');
    for (const [k,max] of [['enemies',50],['chests',12],['shopStock',8],['props',1000],['pickups',50]]) if (!Array.isArray(e.content[k]) || e.content[k].length>max) throw new Error('房间内容列表无效');
    for (const stock of e.content.shopStock) if (!stock || !Number.isFinite(stock.price) || stock.price<0 || !validSavedReward(stock)) throw new Error('已保存商品无效');
    if (e.content.pickups.some(k=>!['coin','heal','key','ammo','armor','weapon_crate'].includes(k)) || e.content.chests.some(c=>!['normal','gold','locked'].includes(c.quality)) || e.content.event && !SPECIAL_EVENTS.some(ev=>ev.id===e.content.event.id) && !(s.stage?.contentVersion===3&&['field_supply','field_infirmary','field_arsenal'].includes(e.content.event.id))) throw new Error('已保存奖励或事件无效');
    if (e.content.shopVariant !== undefined && !['four-service','expanded','directed'].includes(e.content.shopVariant)) throw Error('商店候选类型无效');
    if (e.content.directedCategory !== undefined && !['key','heal','ammo','armor'].includes(e.content.directedCategory)) throw Error('商店定向类目无效');
    for (const chest of e.content.chests) chestRules(chest);
    if (e.content.vaultChest !== undefined) chestRules(e.content.vaultChest);
    // Encounter Director 字段：缺失视为旧档（允许），出现就必须合法（严格）。
    if (e.content.archetype != null && !ARCH_MAP[e.content.archetype]) throw new Error('已保存房间战术原型无效');
    if (e.content.waves !== undefined) {
      if (!Array.isArray(e.content.waves) || e.content.waves.length > (s.stage?.contentVersion===3?3:2)) throw new Error('已保存房间增援波无效');
      for (const w of e.content.waves) {
        if (!w || !Array.isArray(w.enemies) || w.enemies.length > (s.stage?.contentVersion===3?40:8) || w.enemies.some(id => !ENEMY_MAP[id]) || !Number.isFinite(w.delay) || w.delay < 0 || w.delay > 20) throw new Error('已保存房间增援波无效');
      }
    }
    if (s.stage?.contentVersion === 3 && e.content.enemies.length) {
      const planned = createChapterWaveState([{ enemies: e.content.enemies, delay: 1.6, elite: e.content.elite, eliteIndices: e.content.eliteIndices }, ...(e.content.waves || [])]);
      validateChapterWaveState(planned);
      // The saved encounter is authoritative. Runtime progress may advance its
      // cursor, but may never substitute, trim or append its planned waves.
      for (const record of [r, e, s.roomStates[r.uid]].filter(Boolean)) if (Object.hasOwn(record, 'chapterWaves')) {
        const state = validateChapterWaveState(record.chapterWaves);
        if (JSON.stringify(state.waves) !== JSON.stringify(planned.waves)) throw Error('章节波次与房间编成不一致');
      }
    }
    const states = [r, e, s.roomStates[r.uid]].filter(Boolean);
    const withWaves = states.filter(record => Object.hasOwn(record, 'chapterWaves'));
    if (withWaves.length) {
      if (s.stage?.contentVersion !== 3 || !e.content.enemies.length || withWaves.length !== states.length || !s.roomStates[r.uid]) throw Error('章节波次与房间快照不一致');
      const reference = JSON.stringify(validateChapterWaveState(withWaves[0].chapterWaves));
      if (withWaves.some(record => JSON.stringify(validateChapterWaveState(record.chapterWaves)) !== reference)) throw Error('章节波次进度不一致');
    }
    if (e.secretWallDirs.length>4) throw new Error('隐藏门列表无效');
    for (const wall of e.secretWallDirs) {
      const dir=DIRS.find(d=>d.k===wall.dir),target=expected.rooms.get(wall.to||wall.from);
      if (!dir||!target||target.gx!==e.gx+dir.dx||target.gy!==e.gy+dir.dy||!(target.secretWallDirs||[]).some(w=>w.dir===dir.opp&&(w.to===e.id||w.from===e.id)) || (e.type!=='hidden'&&target.type!=='hidden')) throw new Error('隐藏门关联无效');
    }
  }
  if (s.dungeon.rooms.length!==expected.rooms.size || s.dungeon.rooms.filter(r=>r.type==='start').length!==1 || expected.rooms.get(s.dungeon.startId)?.type!=='start' || !Number.isInteger(s.dungeon.gridSize) || s.dungeon.gridSize<1 || s.dungeon.gridSize>32) throw new Error('地图起点或唯一性无效');
  const reached=expected.bfsFrom(expected.rooms.get(s.dungeon.startId));
  if (expected.list.some(r=>r.type!=='hidden'&&!reached.has(r.id) || r.type==='hidden'&&(!r.secretWallDirs.length||!r.secretWallDirs.some(w=>reached.has(w.from))))) throw new Error('地图不可达');
  for (const w of s.player.weapons) if (!validAttachmentPositions(w)) throw Error('武器装配位无效');
  const roomKeys = new Set(s.rooms.map(r => r.uid));
  if (roomKeys.size !== s.rooms.length || Object.keys(s.roomStates).some(k => !roomKeys.has(k)) || !s.roomStates[expected.rooms.get(s.roomId).uid]) throw new Error('房间状态关联无效');
  if (!s.scenes || Object.keys(s.scenes).length !== roomKeys.size || Object.keys(s.scenes).some(k => !roomKeys.has(k))) throw new Error('整层场景快照无效');
  for (const [uid, scene] of [...Object.entries(s.scenes), ...Object.entries(s.roomStates).map(([uid, st]) => [uid, st.scene])]) {
    if (!scene || !Array.isArray(scene.props) || scene.props.length > 1000 || !Array.isArray(scene.destroyed) || !Array.isArray(scene.secretOpen) || !Array.isArray(scene.sold) || !Number.isFinite(scene.t) || !Number.isFinite(scene.rng)) throw new Error('场景状态无效');
    if (!Array.isArray(scene.shopStock) || scene.shopStock.length > 8 || scene.shopStock.some(x => !x || !Number.isFinite(x.price) || x.price < 0 || !validSavedReward(x))) throw new Error('商店库存无效');
    for (const p of scene.props) {
      if (typeof p.id !== 'string' || !p.id.startsWith(uid + ':prop:')) throw new Error('道具状态关联无效');
      if (p.quality !== undefined || ['ruleVersion','rarityTier','locked','keyCost'].some(k=>Object.hasOwn(p,k))) chestRules(p);
      if (!Array.isArray(p.loot) || p.loot.length > 8 || p.loot.some(x =>
        !x || !['weapon','item','active','attachment','coins','heal'].includes(x.kind) ||
        (x.kind === 'attachment' && !ATTACH_MAP[x.id]) || (x.kind === 'weapon' && !hasPregeneratedWeaponDefinition(x)) || (x.kind === 'item' && !ITEM_MAP[x.id]) || (x.kind === 'active' && !ACTIVE_MAP[x.id]) ||
        (['coins','heal'].includes(x.kind) && (!Number.isFinite(x.amount) || x.amount < 0)))) throw new Error('宝箱奖励无效');
    }
  }
  const p = s.player;
  // Infinity is a sentinel exclusively for weapons without finite-ammo types.
  const finiteTree = (v, path = '') => {
    if (typeof v === 'number' && !Number.isFinite(v)) {
      if (v === Infinity && /(?:^|\.)reserve$/.test(path)) return;
      throw new Error('快照含非有限数值：' + path);
    }
    if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) finiteTree(x, path + '.' + k);
    if (v instanceof Set) for (const x of v) finiteTree(x, path + '.$set');
  };
  finiteTree(s);
  const denied = new Set(['game', 'rig', 'def', 'group', 'gunModel', 'hero', 'stats', 'mesh', 'ownerRef', 'light', 'g']);
  const records = [[p, Player], [s.companion, Companion]];
  for (const st of Object.values(s.roomStates)) {
    if(st.weaponAssets)new WeaponAssetsRuntime({}).restore(st.weaponAssets);
    // 用**该首领自己的类**做"场景对象字段"检查：三个 Boss 各有自己的字段名
    const bossCls = st.boss ? (BOSS_MAP[st.boss.bossType] ? BOSS_MAP[st.boss.bossType].cls : Boss) : null;
    records.push(...(st.enemies || []).map(e => [e, Enemy]), [st.boss, bossCls], ...['pickups','hazards','projectiles','turrets','drones'].flatMap(k => (st[k] || []).map(d => [d, null])));
  }
  for (const [d, Type] of records) {
    const keys = new Set(denied);
    if (Type) for (let proto = Type.prototype; proto && proto !== Object.prototype; proto = Object.getPrototypeOf(proto)) {
      for (const k of Object.getOwnPropertyNames(proto)) keys.add(k);
    }
    if (d && Object.keys(d).some(k => keys.has(k))) throw new Error('快照含场景对象字段：' + Object.keys(d).find(k => keys.has(k)));
  }
  const weaponSlots = MAX_WEAPON_SLOTS + ((s.hero==='foldshadow'?FOLD_SHADOW:heroById(s.hero, s.heroRuleVersion ?? 1)).bonusWeaponSlots || 0);
  // Task6：只有经严格复兴状态证实的 HP=0 / alive=false 才允许保存（待复苏现场）。
  const revivalPending = !!(s.revival && s.revival.status === 'pending' && typeof s.runId === 'string' && s.runId && s.revival.runId === s.runId);
  const terminalDead = runtimeState === 'dead'||party&&partyDowned;
  if (!p || !Array.isArray(p.weapons) || p.weapons.length < 1 || p.weapons.length > weaponSlots || !Number.isFinite(p.hp) || p.hp < 0 || (!revivalPending && !terminalDead && p.hp <= 0) || p.hp > p.maxHp || !Number.isFinite(p.maxHp) || p.maxHp < 1 || !Number.isFinite(p.x) || !Number.isFinite(p.z) || !Number.isInteger(p.weaponIndex) || p.weaponIndex < 0 || p.weaponIndex >= p.weapons.length) throw new Error('玩家快照无效');
  if (revivalPending) { if (p.alive !== false || p.hp !== 0) throw new Error('待复苏玩家快照必须为 0 生命且未存活'); }
  else if (terminalDead) { if (p.alive !== false || p.hp !== 0) throw Error('终局死亡现场必须为真实死亡玩家'); }
  else if (p.alive !== true) throw new Error('活跃远征玩家必须在世');
  if(p.buildEffectsVersion!==undefined&&![1,2].includes(p.buildEffectsVersion))throw new Error('不支持构筑语义版本');
  for (const k of ['coins', 'keys', 'armor', 'heroSkillCd', 'reloadT', 'activeCd', '_hpPenalty']) if (p[k] !== undefined && (!Number.isFinite(p[k]) || p[k] < 0)) throw new Error('玩家资源无效');
  for (const k of ['vx','vz','yaw','radius','dashCd','dashTime','fireT','charge','burstLeft','burstT','standT','bellWindow','heat','scrap','resonance','phrase','momentum','overclockT','overloadT','slowT']) if (!Number.isFinite(p[k])) throw new Error('玩家行动状态无效');
  if (s.heroRuleVersion === 2 && (p.heat < 0 || p.heat > 100 || !Number.isInteger(p.bellCharges) || p.bellCharges < 0 || p.bellCharges > 3)) throw new Error('职业资源状态无效');
  if (s.heroRuleVersion === 3) validateHeroStateV3(p, s.hero);
  for (const k of ['alive','reloading','charging']) if (typeof p[k] !== 'boolean') throw new Error('玩家行动标记无效');
  for (const w of p.weapons) {
    const def = savedWeaponDefinition(w);
    validateEmbeddedWeaponState(w,def,runtimeState!==null&&w.assetState?s.roomStates[expected.rooms.get(s.roomId).uid].weaponAssets:null);
    validateOwnedWeaponRuntime(w,def,s.roomStates[expected.rooms.get(s.roomId).uid].weaponAssets);
    for(const st of Object.values(s.roomStates))validateKnownOwnerResources(w,def,st.weaponAssets);
    if (!Array.isArray(w.attachments) || w.attachments.some(a => !ATTACH_MAP[a]) || !Number.isFinite(w.mag) || w.mag < 0 || !(w.reserve >= 0) || (!Number.isFinite(w.reserve) && (def.ammoType || w.id.startsWith('spell_')))) throw new Error('武器实例无效');
  }
  // Active-room time sources belong to held instances. Dormant rooms retain
  // their historical owners until applyRoom filters them against the inventory.
  const prism=s.roomStates[expected.rooms.get(s.roomId).uid].weaponAssets?.prismField;
  if(prism&&!p.weapons.some(w=>w.assetInstanceId===prism.owner))throw Error('停摆场来源不属于当前武器实例');
  if (!Array.isArray(p.items) || p.items.some(i => !ITEM_MAP[i]) || !Array.isArray(p.actives) || p.actives.some(a => typeof a !== 'string' || !Object.hasOwn(ACTIVE_MAP,a))) throw new Error('构筑无效');
  if (!Number.isInteger(p.activeIndex) || (p.actives.length ? p.activeIndex < 0 || p.activeIndex >= p.actives.length : p.activeIndex !== 0)) throw new Error('主动技能选择无效');
  if (!Array.isArray(p.spareAttachments) || p.spareAttachments.some(a => !ATTACH_MAP[a]) || !Array.isArray(p.doctrines) || p.doctrines.some(d => !(s.heroRuleVersion===3?DOCTRINE_MAP_V3:DOCTRINE_MAP)[d])) throw new Error('配件或教条无效');
  for (const k of ['aim','aimPoint','dashDir','moveVec']) if (!p[k] || !Number.isFinite(p[k].x) || !Number.isFinite(p[k].z)) throw new Error('玩家方向无效');
  for (const k of ['time','hitStopT','shakeAmt','hurt','flash','aberr','vt','dustTimer','_tipT','_dmgAtRoomStart']) if (s.tracking?.[k] !== undefined && !Number.isFinite(s.tracking[k])) throw new Error('远征计时无效');
  if (s.tracking?._damageRootSequence !== undefined && (!Number.isSafeInteger(s.tracking._damageRootSequence) || s.tracking._damageRootSequence < 0)) throw new Error('攻击反馈序号无效');
  for (const k of ['_weaponSeen','_attSeen','_spellForms','_knownSyn','_seenTip']) if (s.tracking?.[k] !== undefined && !(s.tracking[k] instanceof Set)) throw new Error('远征追踪集合无效');
  if (!s.run || ['time','kills','coins','keys','floor','rooms','secrets','vaults','dmgTaken','eliteKills'].some(k => !Number.isFinite(s.run[k]) || s.run[k] < 0) || ['weapons','items','actives'].some(k => !Array.isArray(s.run[k]))) throw new Error('远征统计无效');
  for (const st of Object.values(s.roomStates)) {
    if (!st.scene || !Array.isArray(st.enemies) || st.enemies.some(e => !ENEMY_MAP[e.kind] || !Number.isFinite(e.hp)) || (st.projectiles || []).length > 420) throw new Error('房间状态无效');
    for (const e of [...st.enemies, ...(st.boss ? [st.boss] : [])]) {
      if (typeof e.id !== 'string' || typeof e.alive !== 'boolean' || !e.status || ['burn','poison','slow','freeze'].some(k => !Number.isFinite(e.status[k]))) throw new Error('敌人身份或状态无效');
      if (Object.hasOwn(e,'combatStunT') && (combatMode !== 'experimental' || !Number.isFinite(e.combatStunT) || e.combatStunT < 0 || e.combatStunT > .7)) throw Error('实验震慑状态无效');
    }
    for (const k of ['pickups', 'hazards', 'projectiles', 'pending', 'lootQueue', 'turrets', 'drones']) if (!Array.isArray(st[k]) || st[k].length > 1000) throw new Error('动态对象列表无效');
    if (!Array.isArray(st.scene.props) || !Array.isArray(st.scene.destroyed) || !Array.isArray(st.scene.secretOpen) || !Array.isArray(st.scene.sold)) throw new Error('场景状态无效');
    for (const d of [...st.enemies, ...(st.boss ? [st.boss] : []), ...st.pickups, ...st.hazards, ...st.projectiles, ...st.pending, ...st.lootQueue, ...st.turrets]) {
      if (!Number.isFinite(d.x) || !Number.isFinite(d.z) || Math.abs(d.x) > 10000 || Math.abs(d.z) > 10000) throw new Error('实体坐标无效');
    }
    for (const q of st.pending) if (!ENEMY_MAP[q.kind] || !Number.isFinite(q.t) || !q.opts) throw new Error('延迟生成无效');
    for (const b of st.projectiles) if (b.c2DamageApplied !== undefined && (!Number.isFinite(b.c2DamageApplied) || b.c2DamageApplied < 1 || b.c2DamageApplied > 3)) throw new Error('职业伤害快照无效');
    for (const b of st.projectiles) if (!validCorrectionIdentity(b.correctionOnly) || !Number.isFinite(b.life) || !Number.isFinite(b.speed) || !Number.isFinite(b.damage) || b.life < 0 || (b.hitSet !== null && !(b.hitSet instanceof Set))) throw new Error('弹丸状态无效');
    for(const q of st.lootQueue){
      if(!q||!Number.isFinite(q.t)||!q.opts||!(party?['weapon','item','active','attachment','coins','coin','heal','ammo','armor','key','weapon_crate','consumable']:['weapon','item','active','attachment','coins','heal']).includes(q.kind) ||
        (q.kind==='weapon'&&!hasPregeneratedWeaponDefinition(q.opts)) ||
        (q.kind==='item'&&!ITEM_MAP[q.opts.id]) || (q.kind==='active'&&!ACTIVE_MAP[q.opts.id]) ||
        (q.kind==='attachment'&&!ATTACH_MAP[q.opts.id]) || (['coins','heal'].includes(q.kind)&&(!Number.isFinite(q.opts.amount)||q.opts.amount<0)))throw Error('排队奖励无效');
    }
    if(st.boss?.veilTarget!==undefined) {
      const target=st.boss.veilTarget;
      if(!(worldCombatAbilities||party) || !target || Object.keys(target).length!==2 ||
        !Number.isFinite(target.x)||!Number.isFinite(target.z))throw Error('Boss隐身前目标快照无效');
    }
    for (const pu of st.pickups) {
      const def=pu.kind==='weapon'?savedWeaponDefinition(pu):null;
      if(def)validateEmbeddedWeaponState(pu,def);
      if (!validAttachmentPositions(pu)) throw Error('地面武器装配位无效');
      if (!['weapon', 'item', 'active', 'attachment', 'coin', 'ammo', 'heal', 'key', 'armor', 'weapon_crate'].includes(pu.kind) && !(worldCombatAbilities&&pu.kind==='consumable')) throw new Error('未知拾取物');
      if (pu.kind==='consumable' && (!isConsumable(pu.id)||!Number.isInteger(pu.amount)||pu.amount>99||pu.shopIndex!==-1||pu.price!==0)) throw Error('实验药剂拾取物无效');
      if (!Number.isFinite(pu.amount) || pu.amount <= 0 || pu.kind === 'coin' && !Number.isSafeInteger(pu.amount) || !Number.isFinite(pu.price) || pu.price < 0 || !Number.isInteger(pu.shopIndex) || pu.shopIndex < -1 || pu.shopIndex >= st.scene.shopStock.length) throw new Error('拾取物数量或价格无效');
      for (const key of ['y','baseY','born','vx','vy','vz','phase','radius','armT','ttl','dmgMul']) if (!Number.isFinite(pu[key])) throw new Error('拾取物数值无效');
      if (pu.ttl < 0 || pu.radius <= 0 || pu.dmgMul <= 0 || !Array.isArray(pu.attachments) || pu.attachments.some(id => !ATTACH_MAP[id])) throw new Error('拾取物实例无效');
      for (const key of ['mag','reserve']) if (pu[key] !== undefined && (!(pu[key] >= 0) || !Number.isFinite(pu[key]) && !(key === 'reserve' && pu[key] === Infinity && pu.kind === 'weapon' && !def?.ammoType))) throw new Error('拾取武器弹药无效');
      if ((pu.kind === 'item' && !ITEM_MAP[pu.id]) || (pu.kind === 'active' && !ACTIVE_MAP[pu.id]) || (pu.kind === 'attachment' && !ATTACH_MAP[pu.attId || pu.id])) throw new Error('拾取物定义无效');
    }
  }
  if (s.choice && (!['attachment', 'evolution', 'doctrine'].includes(s.choice.kind) || !Array.isArray(s.choice.options) || s.choice.options.length < 1 || s.choice.options.length > (s.heroRuleVersion===3&&s.hero==='veteran'&&s.choice.kind==='doctrine'?5:3))) throw new Error('楼层奖励无效');
  if (s.choice && s.choice.options.some(o => !({ attachment: ATTACH_MAP, evolution: EVO_MAP, doctrine: s.heroRuleVersion===3?DOCTRINE_MAP_V3:DOCTRINE_MAP }[s.choice.kind][o.id]))) throw new Error('未知楼层奖励');
  if (s.companion && (![0, 1, 2].includes(s.companion.stage) || (s.companion.stage > 0 && !['horn', 'shell', 'sac'].includes(s.companion.evo)))) throw new Error('异兽进化状态无效');
  if (s.companion && ['x','z','hp','maxHp','downedT','fireCd','chargeT','guardT','absorbCd','animT'].some(k => !Number.isFinite(s.companion[k]))) throw new Error('异兽状态无效');
  validatePetRage(s.companion);
  for (const st of Object.values(s.roomStates)) if (st.boss && (!Object.hasOwn(BOSS_MAP, st.boss.bossType) || !Number.isInteger(st.boss.phase) || st.boss.phase < 0 || st.boss.phase > 2 || !Number.isFinite(st.boss.hp) || !Number.isFinite(st.boss.patternT))) throw new Error('首领状态无效');
  for (const r of [s.rng, s.grng]) if (!r || !Number.isFinite(r.s) || !Number.isFinite(r.seed)) throw new Error('随机流无效');
  if (s.runId !== undefined && s.runId !== null && !(typeof s.runId === 'string' && s.runId.length > 0 && s.runId.length <= 180)) throw new Error('远征身份无效');
  if (s.buildSupply !== undefined && s.buildSupply !== null) {
    if (!s.runId) throw new Error('供给缺少远征身份');
    if (s.buildSupply.runId !== s.runId) throw new Error('供给远征身份不一致');
    validateBuildSupply(s.buildSupply, supplyCatalog());
  }
  if (s.runPolicy !== undefined && s.runPolicy !== null) {
    const rp = s.runPolicy;
    if (rp.version !== 1 || !['casual', 'standard', 'challenge'].includes(rp.difficulty) || typeof rp.revivalAllowed !== 'boolean' || !['default', 'explicit-on', 'explicit-off', 'disabled', 'legacy-off'].includes(rp.revivalChoice)) throw new Error('远征策略无效');
  }
  if (s.revival !== undefined && s.revival !== null) {
    if (!s.runId) throw new Error('复苏缺少远征身份');
    validateRevival(s.revival, s.runId);
    if (s.revival.status === 'pending' && !revivalPending) throw new Error('待复苏状态与玩家快照不一致');
  }
  if (s.shopTx !== undefined && s.shopTx !== null) {
    const j = s.shopTx;
    if (!s.runId || j.version !== 1 || j.runId !== s.runId) throw new Error('商店交易账本身份无效');
    if (!Number.isInteger(j.sequence) || j.sequence < 0 || !Array.isArray(j.receipts) || j.receipts.length > 512) throw new Error('商店交易账本无效');
    if (!j.shops || typeof j.shops !== 'object') throw new Error('商店版本记录无效');
    for (const [shopId, rev] of Object.entries(j.shops)) if (typeof shopId !== 'string' || !Number.isInteger(rev) || rev < 0 || rev > 100000) throw new Error('商店版本记录无效');
    for (const r of j.receipts) if (!r || typeof r.requestId !== 'string' || !r.requestId || !Number.isInteger(r.sequence) || r.sequence < 1 || typeof r.fingerprint !== 'string' || typeof r.offerId !== 'string' || !Number.isFinite(r.price) || r.price < 0) throw new Error('商店回执无效');
  }
  return s;
}
export function restoreCompanion(g, data) {
  if (!data) return;
  g.companion = new Companion(g.player.game, data.name);
  for (let i = 0; i < (data.stage || 0); i++) g.companion.evolve(data.evo);
  if(!Object.hasOwn(data,'growth'))delete g.companion.growth;
  Object.assign(g.companion, clone(data));
  g.companion.group.position.set(data.x, 0, data.z);
  g.companion.updateRageVisual();
}
