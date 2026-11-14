import { chestRules, chestPoolAllows } from './chest_rules.js';
import { WEAPON_MAP, ITEM_MAP, ACTIVE_MAP } from './data.js';
import { ATTACH_MAP } from './attachments.js';
import {coopJSONBytes} from '../core/coop_ledger_codec.js';

// Pure transaction plans. Persist ledger + inventory/ground changes atomically,
// using transaction.baseRevision as a compare-and-swap guard. Publish only a
// non-null transaction; receipt is historical information, including on replay.
export const COOP_REWARD_VERSION = 1;
export const COOP_SUPPLY_RESOURCES = Object.freeze(['coin', 'ammo', 'heal', 'armor', 'key']);
export const COOP_SUPPLY_SOURCES = Object.freeze(['enemy-drop', 'room-clear', 'breakable-drop', 'room-pickup', 'event-reward']);
const catalogs = { weapon: WEAPON_MAP, item: ITEM_MAP, active: ACTIVE_MAP, attachment: ATTACH_MAP };
const supplyKinds = { coin: 'coins', ammo: 'ammo', heal: 'heal', armor: 'armor', key: 'key' };
const resourceKinds = new Set(Object.values(supplyKinds));
const ledgerKeys = ['version', 'runId', 'playerIds', 'revision', 'remainders', 'events', 'offers', 'openedChests'];
// Memoize validation only for deeply frozen snapshots produced here. This has
// no effect on rewards or serialization; external JSON is always fully checked.
const validatedLedgers = new WeakSet();
const encodedLedgers = new WeakMap();
// Only this module's completely validated, deeply frozen plain-data ledgers
// qualify. External frozen objects never acquire this identity. The private
// cache stores the exact original JSON text; budget accounting still sees it.
export function trustedCoopLedgerJSON(ledger){
  if(!validatedLedgers.has(ledger))return null;
  let raw=encodedLedgers.get(ledger);if(!raw){raw=JSON.stringify(ledger);encodedLedgers.set(ledger,raw);}return raw;
}
const encodedLedgerBytes=new WeakMap();
export function trustedCoopLedgerEncoding(ledger){const raw=trustedCoopLedgerJSON(ledger);if(raw===null)return null;let proof=encodedLedgerBytes.get(ledger);if(!proof){proof=Object.freeze({raw,bytes:coopJSONBytes(raw)});encodedLedgerBytes.set(ledger,proof);}return proof;}

export class CoopRewardError extends Error {
  constructor(code, message) { super(message); this.name = 'CoopRewardError'; this.code = code; }
}
function fail(code, message) { throw new CoopRewardError(code, message); }
function record(value, keys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(value))) fail('INVALID_STRUCTURE', `${label}: expected a plain object`);
  const own = Reflect.ownKeys(value);
  if (own.length !== keys.length || keys.some(k => !Object.hasOwn(value, k)) ||
      own.some(k => typeof k !== 'string' || !keys.includes(k) || !Object.getOwnPropertyDescriptor(value, k).enumerable ||
        !Object.hasOwn(Object.getOwnPropertyDescriptor(value, k), 'value'))) fail('INVALID_STRUCTURE', `${label}: unexpected fields`);
}
function id(value, label) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/.test(value) ||
      value.split(/[.:-]/).some(s => ['__proto__', 'prototype', 'constructor'].includes(s))) fail('INVALID_ID', `${label}: invalid identity`);
  return value;
}
function integer(value, label, minimum = 0) {
  if (!Number.isSafeInteger(value) || value < minimum || Object.is(value, -0)) fail('INVALID_AMOUNT', `${label}: expected a safe integer >= ${minimum}`);
  return value;
}
function array(value, label) {
  if (!Array.isArray(value) || Reflect.ownKeys(value).length !== value.length + 1 ||
      Array.from({length: value.length}, (_, i) => i).some(i => !Object.hasOwn(value, i))) fail('INVALID_STRUCTURE', `${label}: expected a dense array`);
  return value;
}
function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}
function sealLedger(ledger) { freeze(ledger); validatedLedgers.add(ledger); return ledger; }
// Strict structural comparison also rejects non-JSON values in snapshots.
function canonical(value) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number' && Number.isFinite(value) && !Object.is(value, -0)) return JSON.stringify(value);
  if (Array.isArray(value)) return `[${array(value, 'JSON array').map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    const keys = Object.keys(value).sort(); record(value, keys, 'JSON object');
    return `{${keys.map(k => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
  }
  fail('INVALID_STRUCTURE', 'Snapshot must contain only JSON data');
}
function same(a, b) { return canonical(a) === canonical(b); }
function identity(options) {
  record(options, ['runId', 'playerIds'], 'identity');
  const runId = id(options.runId, 'runId');
  const playerIds = array(options.playerIds, 'playerIds').map(p => id(p, 'playerId'));
  if (playerIds.length !== 2 || new Set(playerIds).size !== 2) fail('INVALID_PLAYERS', 'Co-op rewards require two distinct players');
  return {runId, playerIds};
}
function empty({runId, playerIds}) {
  return {version: COOP_REWARD_VERSION, runId, playerIds: [...playerIds], revision: 0,
    remainders: Object.fromEntries(COOP_SUPPLY_RESOURCES.map(k => [k, 0])), events: [], offers: [], openedChests: []};
}
function member(ledger, value) {
  id(value, 'playerId');
  if (!ledger.playerIds.includes(value)) fail('UNKNOWN_PLAYER', 'Player does not belong to this run');
  return value;
}
function chestSpec(value) {
  const keys = ['quality', 'ruleVersion', 'rarityTier', 'locked', 'keyCost', 'bossReward'].filter(k => Object.hasOwn(value || {}, k));
  record(value, keys, 'chest');
  if(Object.hasOwn(value,'bossReward')&&typeof value.bossReward!=='boolean')fail('INVALID_CHEST','Invalid boss chest flag');
  if (Object.hasOwn(value, 'keyCost')) integer(value.keyCost, 'chest keyCost');
  let rules;
  try { rules = chestRules(value); } catch { fail('INVALID_CHEST', 'Invalid chest rule specification'); }
  // Materialize data instead of retaining caller-owned objects.
  return {spec: Object.fromEntries(keys.map(k => [k, value[k]])), rules};
}
function loot(value, chest) {
  const entries = array(value, 'loot');
  if (!entries.length) fail('INVALID_REWARD', 'Each player requires a nonempty pre-generated chest bundle');
  return entries.map(reward => {
    if (resourceKinds.has(reward?.kind)) {
      record(reward, ['kind', 'amount'], 'resource reward');
      return {kind: reward.kind, amount: integer(reward.amount, 'reward amount', 1)};
    }
    record(reward, ['kind', 'id'], 'equipment reward');
    id(reward.id, 'equipment id');
    if (typeof reward.kind !== 'string' || !Object.hasOwn(catalogs, reward.kind) || !Object.hasOwn(catalogs[reward.kind], reward.id)) fail('INVALID_REWARD', 'Unknown reward kind or catalog identity');
    if (!chestPoolAllows(chest, reward)) fail('INVALID_REWARD', 'Reward does not belong to this chest quality pool');
    return {kind: reward.kind, id: reward.id};
  });
}
function requestFor(ledger, kind, raw) {
  const fields = kind === 'supply' ? ['runId', 'eventId', 'source', 'resource', 'baseAmount'] :
    kind === 'chest' ? ['runId', 'eventId', 'source', 'chestId', 'openerId', 'chest', 'rewards'] :
    kind === 'claim' ? ['runId', 'eventId', 'offerId', 'playerId'] : kind === 'consume' ? ['runId','eventId','offerId','playerId','amount'] : null;
  if (!fields) fail('INVALID_EVENT', 'Unknown reward event kind');
  record(raw, fields, 'request'); id(raw.runId, 'runId'); id(raw.eventId, 'eventId');
  if (raw.runId !== ledger.runId) fail('RUN_MISMATCH', 'Reward event belongs to a different run');
  const common = {runId: raw.runId, eventId: raw.eventId};
  if (kind === 'supply') {
    if (!COOP_SUPPLY_SOURCES.includes(raw.source)) fail('INVALID_SOURCE', 'Only whitelisted free out-of-chest supplies use the 9/5 multiplier');
    if (!COOP_SUPPLY_RESOURCES.includes(raw.resource)) fail('INVALID_REWARD', 'Only supply resources use the 9/5 multiplier');
    return {...common, source: raw.source, resource: raw.resource, baseAmount: integer(raw.baseAmount, 'baseAmount', 1)};
  }
  if(kind==='consume'){if(!Number.isFinite(raw.amount)||raw.amount<=0)fail('INVALID_AMOUNT','Invalid consumed amount');return {...common,offerId:id(raw.offerId,'offerId'),playerId:member(ledger,raw.playerId),amount:raw.amount};}
  if (kind === 'claim') return {...common, offerId: id(raw.offerId, 'offerId'), playerId: member(ledger, raw.playerId)};
  if (raw.source !== 'chest') fail('INVALID_SOURCE', 'Only ordinary chest rewards belong in a chest transaction');
  const {spec} = chestSpec(raw.chest), bundles = array(raw.rewards, 'rewards');
  if (bundles.length !== 2) fail('INVALID_PLAYERS', 'Chest requires one pre-generated loot bundle per player');
  const rewards = bundles.map(bundle => {
    record(bundle, ['playerId', 'loot'], 'chest bundle');
    return {playerId: member(ledger, bundle.playerId), loot: loot(bundle.loot, spec)};
  });
  if (new Set(rewards.map(b => b.playerId)).size !== 2) fail('INVALID_PLAYERS', 'Duplicate chest bundle owner');
  return {...common, source: 'chest', chestId: id(raw.chestId, 'chestId'), openerId: member(ledger, raw.openerId),
    chest: spec, rewards: ledger.playerIds.map(p => rewards.find(b => b.playerId === p))};
}
function previous(ledger, kind, request) {
  const event = ledger.events.find(e => e.request.eventId === request.eventId);
  if (!event) return null;
  if (event.kind !== kind || !same(event.request, request)) fail('EVENT_CONFLICT', 'Event identity was already used with a different payload');
  return event.receipt;
}
function apply(ledger, kind, request) {
  const receipt = {runId: ledger.runId, eventId: request.eventId, baseRevision: ledger.revision,
    revision: ledger.revision + 1, keyDebits: [], offers: [], grants: []};
  const offer = (reward, ownerId, chest = null) => {
    const entry = {offerId: `reward-${receipt.revision}-${receipt.offers.length}`, sourceEventId: request.eventId,
      source: request.source, ownerId, chestId: chest ? request.chestId : null,
      quality: chest?.quality ?? null, rarityTier: chest?.rarityTier ?? null, reward,
      claimedBy: null, claimEventId: null};
    receipt.offers.push(entry); ledger.offers.push({...entry});
  };
  if (kind === 'supply') {
    const numerator = BigInt(request.baseAmount) * 9n + BigInt(ledger.remainders[request.resource]);
    const amount = Number(numerator / 5n);
    integer(amount, 'scaled amount', 1);
    ledger.remainders[request.resource] = Number(numerator % 5n);
    // Exactly one team offer, never a separately multiplied offer per player.
    offer({kind: supplyKinds[request.resource], amount}, null);
  } else if (kind === 'chest') {
    if (ledger.openedChests.some(c => c.chestId === request.chestId)) fail('CHEST_ALREADY_OPEN', 'Chest was already opened by another event');
    const rules = chestRules(request.chest);
    if (rules.keyCost) receipt.keyDebits.push({playerId: request.openerId, resource: 'key', amount: rules.keyCost});
    for (const bundle of request.rewards) for (const reward of bundle.loot) offer({...reward}, bundle.playerId, request.chest);
    ledger.openedChests.push({chestId: request.chestId, eventId: request.eventId});
  } else {
    const index = ledger.offers.findIndex(o => o.offerId === request.offerId), entry = ledger.offers[index];
    if (!entry) fail('UNKNOWN_OFFER', 'Reward offer does not exist in this run');
    if (entry.ownerId !== null && entry.ownerId !== request.playerId) fail('OWNER_MISMATCH', 'Reward is bound to another player');
    if (entry.claimedBy !== null) fail('ALREADY_CLAIMED', 'Reward was already claimed; retry using the original claim eventId');
    let reward={...entry.reward};
    if(kind==='consume'){
      if(!resourceKinds.has(entry.reward.kind)||entry.reward.kind!=='heal'&&!Number.isSafeInteger(request.amount))fail('INVALID_AMOUNT','Only recorded supply quantities can be consumed');
      const remaining=entry.remainingAmount??entry.reward.amount;
      if(request.amount>remaining)fail('INVALID_AMOUNT','Consumption exceeds remaining offer');
      const rest=remaining-request.amount;
      ledger.offers[index]={...entry,remainingAmount:rest,consumptions:[...(entry.consumptions||[]),{playerId:request.playerId,eventId:request.eventId,amount:request.amount}],claimedBy:rest===0?request.playerId:null,claimEventId:rest===0?request.eventId:null};
      reward={kind:entry.reward.kind,amount:request.amount};
    }else{
      if(entry.consumptions)fail('INVALID_EVENT','Partially consumed supplies require quantity consumption');
      ledger.offers[index] = {...entry, claimedBy: request.playerId, claimEventId: request.eventId};
    }
    receipt.grants.push({offerId: entry.offerId, playerId: request.playerId, reward,
      source: entry.source, chestId: entry.chestId, quality: entry.quality, rarityTier: entry.rarityTier});
  }
  ledger.revision = receipt.revision;
  ledger.events.push({kind, request, receipt});
  return receipt;
}

export function createCoopRewardLedger(options) { return sealLedger(empty(identity(options))); }

// Expected identity is mandatory: never infer the target session from untrusted
// saved data. Rebuild the entire journal and verify every receipt and derived
// field; a numerically plausible but historically wrong remainder is rejected.
export function restoreCoopRewardLedger(snapshot, expectedIdentity) {
  const expected = identity(expectedIdentity);
  if(validatedLedgers.has(snapshot)){if(snapshot.runId!==expected.runId||!same(snapshot.playerIds,expected.playerIds))fail('RUN_MISMATCH','Reward ledger identity differs from target session');return snapshot;}
  record(snapshot, ledgerKeys, 'ledger');
  if (snapshot.version !== COOP_REWARD_VERSION) fail('INVALID_VERSION', 'Unsupported reward ledger version');
  if (snapshot.runId !== expected.runId || !same(snapshot.playerIds, expected.playerIds)) fail('RUN_MISMATCH', 'Reward ledger identity differs from target session');
  const ledger = empty(expected);
  for (const event of array(snapshot.events, 'events')) {
    record(event, ['kind', 'request', 'receipt'], 'event');
    const request = requestFor(ledger, event.kind, event.request);
    if (previous(ledger, event.kind, request)) fail('INVALID_EVENT', 'Duplicate event in reward journal');
    const receipt = apply(ledger, event.kind, request);
    if (!same(receipt, event.receipt)) fail('INVALID_LEDGER', 'Stored reward receipt is inconsistent with journal');
  }
  if (!same(ledger, snapshot)) fail('INVALID_LEDGER', 'Reward ledger derived fields are inconsistent with journal');
  return sealLedger(ledger);
}
function plan(snapshot, kind, raw, options) {
  const ledger = validatedLedgers.has(snapshot) ? snapshot :
    restoreCoopRewardLedger(snapshot, {runId: snapshot?.runId, playerIds: snapshot?.playerIds});
  const request = requestFor(ledger, kind, raw), oldReceipt = previous(ledger, kind, request);
  if (oldReceipt) return freeze({status: 'replay', ledger, receipt: oldReceipt, transaction: null});
  if (kind === 'chest') {
    record(options, ['availableKeys'], 'chest authority options');
    if (integer(options.availableKeys, 'availableKeys') < chestRules(request.chest).keyCost) fail('INSUFFICIENT_KEYS', 'Opener cannot pay the chest key cost');
  }
  // Share frozen historical records. Only this draft's arrays/remainders and a
  // newly replaced claim record can change, including when planning fails.
  const draft = {...ledger, remainders: {...ledger.remainders}, events: [...ledger.events],
    offers: [...ledger.offers], openedChests: [...ledger.openedChests]};
  const receipt = apply(draft, kind, request); sealLedger(draft);
  return freeze({status: 'commit', ledger: draft, receipt, transaction: receipt});
}
export function planCoopSupply(ledger, request) { return plan(ledger, 'supply', request); }
export function planCoopChestOpen(ledger, request, authorityOptions) { return plan(ledger, 'chest', request, authorityOptions); }
export function planCoopRewardClaim(ledger, request) { return plan(ledger, 'claim', request); }

// Partial physical supplies grant exactly the amount actually taken by this actor.
export function planCoopRewardConsume(ledger,request){return plan(ledger,'consume',request);}
