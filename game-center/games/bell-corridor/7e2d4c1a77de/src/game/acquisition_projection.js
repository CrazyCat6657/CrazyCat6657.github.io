import {assertSingleActor} from './actor_context.js';
// Run existing Player acquisition rules against detached data. No live player,
// scene, discovery record, RNG or instance allocator is changed before commit.
import { Player } from './player.js';
import { capturePlayer, savedWeaponDefinition } from './session.js';
import { WeaponAssetsRuntime } from './weapon_assets_runtime.js';
import { RNG } from '../core/rng.js';
import { spellFromWeapon } from './spells.js';
import { WEAPON_MAP } from './data.js';
import { pickupState } from './objects.js';
import { preferences } from './preferences.js';
import {resourceContext} from './resource_observation.js';

export function acquisitionProjection(game, draft, metaDraft) {
  assertSingleActor(game);
  const ctx = Object.create(Object.getPrototypeOf(game));
  Object.assign(ctx, {
    mode: game.mode, hero: game.hero, mod_: structuredClone(game.mod_ || {}),
    time: game.time, floor: game.floor, practice: game.practice, player: null,resourceContext:resourceContext(game),resourceRoom:game.room?.uid,
    tel: structuredClone(draft.telemetry), ...structuredClone(draft.tracking),
    particles: new Proxy({}, { get: () => () => {} }),
    hud: new Proxy({}, { get: () => () => {} }), toast() {},
    spellDefs: new Map(), _listeners: [],
    _equipmentDropWorld: game, _equipmentPreferences: preferences.get(),
  });
  for (const key of ['rng', 'grng']) {
    ctx[key] = new RNG(draft[key].seed); ctx[key].s = draft[key].s;
  }
  // Only immutable hero hooks belong in the projection. Presentation callbacks
  // and external closures never run during a transaction plan.
  ctx.emit = (event, data) => { const fn = ctx.hero?.hook?.[event]; if (fn) fn(ctx.player, data || {}, ctx); };
  ctx.spellFor = id => { const def = WEAPON_MAP[id]; return def ? spellFromWeapon(def) : null; };
  ctx.metaSee = (kind, id) => {
    const seen = metaDraft?.seen?.[kind];
    if (ctx.mode === 'run' && id && seen && !seen.includes(id)) seen.push(id);
  };
  ctx.newSynergies = list => {
    ctx._knownSyn ||= new Set();
    for (const s of list) if (!ctx._knownSyn.has(s.id)) {
      ctx._knownSyn.add(s.id); ctx.telFirst('firstSynergy'); ctx.metaSee('synergy', s.id);
    }
  };
  const p = Object.assign(Object.create(Player.prototype), structuredClone(draft.player));
  p.weapons = p.weapons.map(w => ({ ...w, def: savedWeaponDefinition(w) }));
  p.game = ctx; p.hero = game.hero; p.stats = structuredClone(game.player.stats);
  p.setGunModel = () => {}; ctx.player = p;
  const runtime = new WeaponAssetsRuntime(ctx);
  const roomState = draft.roomStates[game.room.uid];
  if (roomState.weaponAssets) Object.assign(runtime, structuredClone(roomState.weaponAssets));
  runtime.serial=Math.max(runtime.serial,game.weaponSerialAllocator?.serial||0);
  // Reserve all saved ground IDs across rooms before creating another gun.
  for (const st of Object.values(draft.roomStates)) for (const drop of st.pickups || []) {
    const match = /^weapon:(\d+)$/.exec(drop.assetInstanceId || '');
    if (match) runtime.serial = Math.max(runtime.serial, Number(match[1]));
  }
  runtime.bindInventory(p); ctx.weaponAssets = runtime;
  const drops = []; ctx._plannedEquipmentDrops = drops;
  ctx.pickups = { list: roomState.pickups, t: game.pickups.t || 0, spawn(kind, x, z, opts) {
    const drop = pickupState(kind, x, z, structuredClone(opts), game.pickups.t || 0);
    drops.push(drop); return drop;
  } };
  ctx.grantAttachmentReward = id => p.spareAttachments.length < p.spareCap() ? p.addAttachment(id) : !!ctx.dropAttachmentPickup(id);
  return {
    game: ctx, player: p, drops,
    finish() {
      draft.player = capturePlayer(p);
      draft.telemetry = structuredClone(ctx.tel);
      for (const key of Object.keys(draft.tracking)) if (ctx[key] !== undefined) draft.tracking[key] = structuredClone(ctx[key]);
      for (const key of ['_knownSyn', '_weaponSeen', '_spellForms', '_shopBought', '_attSeen']) if (ctx[key] !== undefined) draft.tracking[key] = structuredClone(ctx[key]);
      draft.rng.s = ctx.rng.s; draft.grng.s = ctx.grng.s;
      roomState.weaponAssets = runtime.capture();
      roomState.pickups.push(...structuredClone(drops));
      return this;
    },
  };
}

export function publishDrops(game, drops) {
  assertSingleActor(game);
  for (const data of drops) {
    const p = game.pickups.spawn(data.kind, data.x, data.z, data);
    Object.assign(p, structuredClone(data));
    if (p.mesh) p.mesh.position.y = data.y;
  }
}

// Hydrate the already committed outcome without running acquisition a second
// time. Existing gun objects survive ammunition purchases and retain identity.
export function publishAcquisition(game, draft) {
  assertSingleActor(game);
  publishPlayerAcquisition(game.player, draft.player);
  const snap = draft.roomStates[game.room.uid]?.weaponAssets;
  if (snap && game.weaponAssets) {
    Object.assign(game.weaponAssets, structuredClone(snap)); game.weaponAssets.bindInventory(game.player);
  }
  for (const key of Object.keys(draft.tracking)) game[key] = structuredClone(draft.tracking[key]);
  game.tel = structuredClone(draft.telemetry);
  game.rng.s = draft.rng.s; game.grng.s = draft.grng.s;
}
export function publishPlayerAcquisition(p, record) {
  const old = p.weapons, data = structuredClone(record);
  const oldHeld = p.weapon;
  const oldModel = JSON.stringify([oldHeld?.def.model, oldHeld?.attachments]);
  const weapons = data.weapons.map((w, i) => {
    const def = savedWeaponDefinition(w);
    const existing = w.assetInstanceId ? old.find(x => x.assetInstanceId === w.assetInstanceId) : old[i]?.def.id === def.id ? old[i] : null;
    const { id, source, definitionVersion, ...state } = w;
    return Object.assign(existing || {}, state, { def });
  });
  delete data.weapons; Object.assign(p, data); p.weapons = weapons; p.recompute();
  if (p.weapon && (p.weapon !== oldHeld || oldModel !== JSON.stringify([p.weapon.def.model, p.weapon.attachments]))) p.setGunModel(p.weapon.def.model);
}
