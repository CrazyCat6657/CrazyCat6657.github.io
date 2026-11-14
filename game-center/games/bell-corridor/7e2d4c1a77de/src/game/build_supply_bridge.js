import { chestPoolAllows, chestRules } from './chest_rules.js';
// Bridge between the pure supply allocator (build_supply.js) and the live Game.
//
// Design rules carried from the approved Task5 contracts:
//  * The pure module owns identity, ledgers and allocation. This file only:
//      - snapshots what the player really owns,
//      - turns saved room loot into supply allocations and back,
//      - routes a committed ledger entry through the REAL Player acquisition
//        entry points (never a second, simplified set of stat rules).
//  * Rejection never mutates the live Player, RNG or ledger.
//  * An offered (but unclaimed) identity survives return / cold restore and is
//    never re-rolled.
import { WEAPON_MAP, ITEM_MAP, ACTIVE_MAP } from './data.js';
import {pregeneratedWeaponDefinition} from './weapon_compatibility.js';
import { ATTACH_MAP } from './attachments.js';
import { RNG } from '../core/rng.js';
import {
  createBuildSupplyCatalog, newSupplyState, validateBuildSupply, missingDependencies,
  planRewardAllocation, planClaim, planFirstFloorCompletion, planFirstShop,
  supplyEquipmentPool, rewardIdentity,
} from './build_supply.js';

let _catalog = null;
export function supplyCatalog() {
  return _catalog ||= createBuildSupplyCatalog({ weapon: WEAPON_MAP, item: ITEM_MAP, attachment: ATTACH_MAP, active: ACTIVE_MAP });
}
export function resetSupplyCatalog() { _catalog = null; }

const rngPlain = (r) => ({ seed: r.seed >>> 0, s: r.s });
const applyRng = (rngObject, plain) => { rngObject.s = plain.s; };

// What the player truly owns right now. Attachments count from both the spare
// library and every held weapon; a weapon counts by its canonical stock id so a
// spell-converted instance still satisfies a route dependency.
export function ownedFromPlayer(player) {
  const cat = supplyCatalog();
  const owned = { weapon: [], item: [], attachment: [] };
  if (!player) return owned;
  for (const w of player.weapons || []) {
    const id = w.def?.sourceWeapon || w.def?.sourceId || String(w.def?.id || '').replace(/^spell_/, '');
    if (cat.entries[id]?.kind === 'weapon') owned.weapon.push(id);
    for (const a of w.attachments || []) if (cat.entries[a]?.kind === 'attachment') owned.attachment.push(a);
  }
  for (const i of player.items || []) if (cat.entries[i]?.kind === 'item') owned.item.push(i);
  for (const a of player.spareAttachments || []) if (cat.entries[a]?.kind === 'attachment') owned.attachment.push(a);
  return { weapon: [...new Set(owned.weapon)], item: [...new Set(owned.item)], attachment: [...new Set(owned.attachment)] };
}

// Saved room loot uses the spawn kinds ('coins'); the supply ledger uses the
// canonical 'coin'. Convert at the boundary in both directions.
export function lootToAllocation(l) {
  if (!l) return null;
  const kind = l.kind === 'coins' ? 'coin' : l.kind;
  return { ...weaponCarryFields(l),...(kind==='weapon'?{definitionVersion:pregeneratedWeaponDefinition(l).weaponAssetVersion||1}:{}),kind, ...(l.id ? { id: l.id } : {}), ...(l.amount !== undefined ? { amount: l.amount } : {}) };
}
export function allocationToLoot(a) {
  if (!a) return null;
  const kind = a.kind === 'coin' ? 'coins' : a.kind;
  return { ...weaponCarryFields(a),kind, ...(a.id ? { id: a.id } : {}), ...(a.amount !== undefined ? { amount: a.amount } : {}), ...(a.coins !== undefined ? { coins: a.coins } : {}) };
}
function weaponCarryFields(record){
  if(record.kind!=='weapon')return {};
  return Object.fromEntries(['source','definitionVersion','assetInstanceId','assetState','mag','reserve','dmgMul','attachments','attachmentPositions']
    .filter(key=>Object.hasOwn(record,key)).map(key=>[key,structuredClone(record[key])]));
}

// Deterministic per-room source ordinal: the index of the chest in the room's
// authored chest list, never a prop index or a coordinate.
export function chestSourceOrdinal(room, chestIndex) {
  const list = room?.content?.chests || [];
  return Number.isInteger(chestIndex) && chestIndex >= 0 && chestIndex < list.length ? chestIndex : list.length;
}

// Plan a chest opening. Returns the loot actually to be thrown plus the next
// supply state and RNG. A legacy already-opened chest (no ledger) is skipped.
export function planChestSupply(game, { roomId, sourceOrdinal, baseLoot, chest = null, legacyAlreadyOpened = false }) {
  const supply = game.buildSupply;
  if (!supply) return { loot: baseLoot, supply, rng: null, planned: false };
  const cat = supplyCatalog();
  const pool = supplyEquipmentPool(cat, 'chest').filter(e => !chest || chestPoolAllows(chest, e));
  const sourceId = { runId: supply.runId, floorId: String(game.floor), roomId, source: 'chest', sourceOrdinal, generation: 0 };
  let baseRewards = (baseLoot || []).map(lootToAllocation).filter(Boolean);
  const rng = new RNG(game.grng.seed); rng.s = game.grng.s;
  // Repair only a genuinely new offer. Saved ground/queued rewards and source
  // replays keep their identity and allocation; never reroll a pending reward.
  if (!legacyAlreadyOpened && !supply.sourceLedger[rewardIdentity(sourceId, false)]) {
    const reserved = new Set(game.player?.items || []);
    for (const entry of Object.values(supply.rewardLedger)) {
      if (entry.claimState === 'offered' && entry.identity.source !== 'shop' && entry.allocation.kind === 'item') reserved.add(entry.allocation.id);
    }
    const legacyChest = chest && chestRules(chest).legacy;
    const eligible = Object.values(ITEM_MAP).filter(it =>
      (!legacyChest || it.rarity <= (game.floor === 1 ? 3 : 4)) &&
      (!chest || chestPoolAllows(chest, { kind: 'item', id: it.id })) && !(game.mod_?.noFood && it.mods?.heal));
    baseRewards = baseRewards.map(allocation => {
      if (allocation.kind !== 'item') return allocation;
      if (reserved.has(allocation.id)) {
        const candidates = eligible.filter(it => !reserved.has(it.id));
        // The existing supply fallback is 15 coins when the finite pool is exhausted.
        if (!candidates.length) return { kind: 'compensation', coins: 15 };
        allocation = { kind: 'item', id: rng.pick(candidates).id };
      }
      reserved.add(allocation.id);
      return allocation;
    });
  }
  const plan = planRewardAllocation(supply, {
    sourceId,
    baseRewards, pool, owned: ownedFromPlayer(game.player), catalog: cat,
    rng: rngPlain(rng), equipmentOpportunity: true, legacyAlreadyOpened,
  });
  if (!plan.replay && !plan.legacySkipped) {
    // Include the duplicate-replacement draw in the source's saved RNG interval.
    plan.source.rngBefore = rngPlain(game.grng);
    plan.nextSupply.sourceLedger[rewardIdentity(sourceId, false)].rngBefore = rngPlain(game.grng);
  }
  if (plan.replay) {
    const keys = plan.source?.allocationKeys || [];
    const loot = keys.map((k) => plan.nextSupply.rewardLedger[k]).filter(Boolean)
      .map((e) => ({ ...allocationToLoot(e.allocation), supplyKey: rewardIdentity(e.identity) }));
    return { loot, supply: plan.nextSupply, rng: plan.rng, planned: true, replay: true, mode: plan.source?.mode };
  }
  if (plan.legacySkipped) return { loot: baseLoot, supply: plan.nextSupply, rng: plan.rng, planned: false, legacySkipped: true };
  const keys = plan.source.allocationKeys;
  const loot = keys.map((k) => plan.nextSupply.rewardLedger[k]).filter(Boolean)
    .map((e) => ({ ...allocationToLoot(e.allocation), supplyKey: rewardIdentity(e.identity) }));
  return { loot, supply: plan.nextSupply, rng: plan.rng, planned: true, mode: plan.source.mode };
}

// Commit a supply identity after the reward was really acquired. Free supply
// carries no price, so a save failure only means the offer may reappear.
export function commitSupplyClaim(game, supplyKey, receiptId) {
  const supply = game.buildSupply;
  if (!supply || !supplyKey) return { ok: false };
  const plan = planClaim(supply, supplyKey, { ok: true, ...(receiptId ? { receiptId } : {}) }, supplyCatalog());
  if (plan.ok || plan.replay) { game.buildSupply = plan.nextSupply; return { ok: true, replay: !!plan.replay }; }
  return { ok: false };
}

// Missing route dependencies, used by the HUD to show progress.
export function missingRouteDependencies(game) {
  const supply = game.buildSupply;
  if (!supply) return [];
  try { return missingDependencies(supply, supplyCatalog(), ownedFromPlayer(game.player)); }
  catch { return []; }
}

// Plan the floor-completion gate (legacy flow: before the first-floor stairs).
export function planCompletionSupply(game, { roomId, completionSource = 'first-floor-completion' }) {
  const supply = game.buildSupply;
  if (!supply) return { supply, queue: [] };
  const plan = planFirstFloorCompletion(supply, {
    roomId, sourceOrdinal: 0, completionSource, catalog: supplyCatalog(),
    owned: ownedFromPlayer(game.player), rng: rngPlain(game.grng),
  });
  return { supply: plan.nextSupply, queue: plan.queue, rng: plan.rng };
}

// First-shop (generation 0) route shortcut shelves.
export function planFirstShopInventory(game, { roomId, generation, legacyStock }) {
  const supply = game.buildSupply;
  if (!supply) return { supply, inventory: null };
  const plan = planFirstShop(supply, {
    roomId, sourceOrdinal: 0, generation, floorId: String(game.floor),
    legacyStock, owned: ownedFromPlayer(game.player), catalog: supplyCatalog(),
  });
  return { supply: plan.nextSupply, inventory: plan.inventory, replay: !!plan.replay };
}

// Acquire a free route reward through the REAL Player entry points, then commit
// the ledger. Returns a short reason when the acquisition could not happen.
export function acquireRouteReward(game, allocation) {
  const p = game.player;
  if (!p || !allocation) return { ok: false, reason: '无法获取' };
  switch (allocation.kind) {
    case 'weapon': {
      let def;try{def=pregeneratedWeaponDefinition(allocation);}catch{return {ok:false,reason:'武器历史定义无效'};}
      const ok = p.giveWeapon(allocation.id, -1, {...weaponCarryFields(allocation),definitionVersion:def.weaponAssetVersion||1});
      return { ok: true, transferred: !ok };
    }
    case 'attachment': {
      const ok = game.grantAttachmentReward(allocation.id);
      return { ok: !!ok, reason: ok ? null : '备用配件库已满' };
    }
    case 'item': {
      const ok = p.addItem(allocation.id);
      return { ok: true, transferred: !ok, reason: ok ? null : '已拥有该遗物' };
    }
    case 'coin': return { ok: true, coins: allocation.amount || 0, applied: false };
    case 'key': return { ok: true, keys: allocation.amount || 1, applied: false };
    case 'heal': return { ok: true, heal: allocation.amount || 1, applied: false };
    case 'armor': return { ok: true, armor: allocation.amount || 1, applied: false };
    case 'compensation': return { ok: true, coins: allocation.coins || 15, applied: false };
    default: return { ok: false, reason: '未知奖励类型' };
  }
}

// Apply the simple (non-entity) reward kinds that acquireRouteReward deferred.
export function applySimpleReward(game, allocation) {
  const p = game.player;
  if (!p) return;
  if (allocation.kind === 'coin' || allocation.kind === 'compensation') p.addCoins(allocation.coins || allocation.amount || 15, 'chest');
  else if (allocation.kind === 'key') p.keys += allocation.amount || 1;
  else if (allocation.kind === 'heal') p.heal(allocation.amount || 1, 'chest');
  else if (allocation.kind === 'armor') p.armor = Math.min(5, p.armor + (allocation.amount || 1));
}

export function newRunSupply(runId, route) {
  return newSupplyState(runId, route && route !== 'none' ? route : null);
}
// Catalog entry as a plain {kind,id} allocation, for labels.
export function catalogAllocation(id) {
  const e = supplyCatalog().entries[id];
  return e ? { kind: e.kind, id: e.id } : null;
}
export { validateBuildSupply, rewardIdentity };
