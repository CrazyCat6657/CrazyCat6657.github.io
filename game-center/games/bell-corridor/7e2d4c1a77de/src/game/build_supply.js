// Pure supply allocation and claim ledger. Persist the complete draft before world publication.
import { BUILD_ROUTES, BUILD_SOURCES } from './build_content_data.js';
import {hasPregeneratedWeaponDefinition} from './weapon_compatibility.js';
const copy = value => structuredClone(value);
const physical = value => ['attachment', 'item'].includes(value?.kind);
const equipment = value => ['weapon', 'attachment', 'item'].includes(value?.kind);
const own = (owned, value) => (owned[value.kind] || []).includes(value.id);
const counters = ['sourceOrdinal', 'generation', 'subIndex'];

export function rewardIdentity(id, withSubIndex = true) {
  if (!id || ['runId', 'floorId', 'roomId', 'source'].some(k => !validId(id[k])) || !SUPPLY_SOURCES.has(id.source)) throw Error('Invalid source identity');
  for (const k of counters) if ((withSubIndex || k !== 'subIndex') && (!Number.isSafeInteger(id[k]) || id[k] < 0)) throw Error(`Invalid ${k}`);
  if (id.slotId !== undefined && (!Number.isInteger(id.slotId) || id.slotId < 0 || id.slotId > 3)) throw Error('Invalid slotId');
  return JSON.stringify([id.runId, id.floorId, id.roomId, id.source, id.sourceOrdinal, id.generation,
    ...(withSubIndex ? [id.subIndex, ...(id.slotId !== undefined ? [id.slotId] : [])] : [])]);
}

export function newSupplyState(runId, selectedRoute = null) {
  if (!validId(runId) || selectedRoute !== null && !BUILD_ROUTES.some(r => r.id === selectedRoute)) throw Error('Invalid run or route');
  return { version: 2, runId, selectedRoute, routeQueueCursor: 0, freeEquipmentOpportunities: 0,
    mandatoryOffers: {}, categoryMissCount: 0, sourceLedger: {}, rewardLedger: {},
    shopGeneration: {}, shopInventory: {}, firstShopId: null, floorCompletionQueue: [] };
}

function routeFor(supply, catalog) {
  if (!supply.selectedRoute) return null;
  const route = catalog.routes.find(r => r.id === supply.selectedRoute);
  if (!route || route.supplyQueue.length > 4 || new Set(route.supplyQueue).size !== route.supplyQueue.length) throw Error('Invalid route queue');
  if (route.supplyQueue.some(id => !equipment(catalog.entries[id]))) throw Error('Unknown route dependency');
  return route;
}

function missingDependenciesImpl(supply, catalog, owned, { reserveFreeOffers = false } = {}) {
  const route = routeFor(supply, catalog);
  return (route?.supplyQueue || []).filter(id => !own(owned, catalog.entries[id]) &&
    (!reserveFreeOffers || !supply.mandatoryOffers[id]));
}

// Same mulberry step as RNG.next, evaluated on a plain copied state; never call mutable hashSeed().
function next(rng) {
  const s = rng.s + 0x6d2b79f5;
  let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return { value: ((t ^ (t >>> 14)) >>> 0) / 4294967296, rng: { ...rng, s } };
}

function weighted(pool, weight, rng) {
  const eligible = [...pool].sort((a,b)=>a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
    .map(entry => ({ entry, weight: weight(entry) })).filter(x => x.weight > 0);
  if (!eligible.length) return { entry: { kind: 'compensation', coins: 15 }, rng: copy(rng) };
  const draw = next(rng), total = eligible.reduce((sum, x) => sum + x.weight, 0);
  let remainder = draw.value * total;
  for (const candidate of eligible) {
    remainder -= candidate.weight;
    if (remainder < 0) return { entry: copy(candidate.entry), rng: draw.rng };
  }
  return { entry: copy(eligible.at(-1).entry), rng: draw.rng };
}

/** Allocation + source event commitment in one immutable draft.
 * sourceId uses floorId='1' for the initial floor. equipmentOpportunity is caller-established,
 * before this transform, not inferred from an optional attachment roll performed later.
 * baseRewards are PREEXISTING saved chest rewards; pool is finite, sorted by exact stable id.
 * sourceCounters are committed on offering/delivery, not acquisition: leaving an offer pending
 * never counts as owning it and does not reroll it. ROOT approved this interpretation.
 * legacyAlreadyOpened must come from imported prop.opened, not absence of a ledger alone.
 */
function planRewardAllocationImpl(supply, { sourceId, baseRewards, pool, owned, catalog, rng,
  equipmentOpportunity = false, legacyAlreadyOpened = false, mandatoryCompletion = false }) {
  const sourceKey = rewardIdentity(sourceId, false);
  if (sourceId.runId !== supply.runId) throw Error('Foreign run');
  if (supply.sourceLedger[sourceKey]) return { replay: true, nextSupply: copy(supply), rng: copy(rng), source: copy(supply.sourceLedger[sourceKey]) };
  if (legacyAlreadyOpened) return { legacySkipped: true, nextSupply: copy(supply), rng: copy(rng), source: null };
  const draft = copy(supply), rewards = copy(baseRewards), route = routeFor(draft, catalog);
  const pendingItems = new Set();
  for (const [key, entry] of Object.entries(draft.rewardLedger)) {
    if (entry.claimState !== 'offered' || entry.identity.source === 'shop' || entry.allocation.kind !== 'item') continue;
    pendingItems.add(entry.allocation.id);
    // An already offered free relic can satisfy a route without creating a
    // second physical copy. Preserve its allocation and exact source identity.
    if (route?.supplyQueue.includes(entry.allocation.id) && !draft.mandatoryOffers[entry.allocation.id]) {
      entry.mandatory = true;
      draft.mandatoryOffers[entry.allocation.id] = key;
    }
  }
  let rngAfter = copy(rng), mandatoryId = null, mandatoryIndex = -1, mode = 'legacy';
  const early = sourceId.floorId === '1' && route && sourceId.source !== 'shop';
  const routeWindow = early && (mandatoryCompletion || (equipmentOpportunity && draft.freeEquipmentOpportunities < 4));
  const missing = routeWindow ? missingDependenciesImpl(draft, catalog, owned, { reserveFreeOffers: true }) : [];
  let candidate = missing.length ? copy(catalog.entries[missing[0]]) : null;
  if (candidate) { mandatoryId = candidate.id; mode = 'route'; }
  const pityDue = sourceId.source === 'chest' && draft.categoryMissCount >= 3;
  // A route weapon wins and leaves category pity due. An already offered physical reward satisfies pity.
  if (!candidate && pityDue && !rewards.some(physical)) {
    const result = weighted(pool.filter(physical).filter(e => !own(owned, e) && (e.kind !== 'item' || !pendingItems.has(e.id))), () => 1, rngAfter);
    candidate = result.entry; rngAfter = result.rng; mode = 'category';
  }
  if (candidate) {
    const matching = rewards.findIndex(entry => entry.kind === candidate.kind && entry.id === candidate.id);
    if (matching >= 0) mandatoryIndex = matching;
    else {
      const index = rewards.findIndex(equipment);
      if (index < 0) { mandatoryIndex = rewards.length; rewards.push(candidate); }
      else { mandatoryIndex = index; rewards[index] = candidate; }
    }
  }
  const keys = rewards.map((allocation, subIndex) => {
    const identity = { ...sourceId, subIndex }, key = rewardIdentity(identity);
    if (draft.rewardLedger[key]) throw Error('Sub-index collision');
    draft.rewardLedger[key] = { identity, allocation, claimState: 'offered', compensationCommitted: false,
      mandatory: mandatoryId !== null && subIndex === mandatoryIndex, delivery: null, receipt: null };
    if (mandatoryId !== null && subIndex === mandatoryIndex) draft.mandatoryOffers[mandatoryId] = key;
    return key;
  });
  if (early && equipmentOpportunity && !mandatoryCompletion) draft.freeEquipmentOpportunities = Math.min(4, draft.freeEquipmentOpportunities + 1);
  draft.routeQueueCursor = route ? route.supplyQueue.filter(id => own(owned, catalog.entries[id]) || draft.mandatoryOffers[id]).length : 0;
  if (sourceId.source === 'chest') {
    const compensatedPity = mode === 'category' && candidate?.kind === 'compensation';
    draft.categoryMissCount = rewards.some(physical) || compensatedPity ? 0 : Math.min(3, draft.categoryMissCount + 1);
  }
  const source = { identity: copy(sourceId), sourceCommitted: true, allocationKeys: keys, mode,
    rngBefore: copy(rng), rngAfter: copy(rngAfter) };
  draft.sourceLedger[sourceKey] = source;
  return { nextSupply: draft, rng: rngAfter, source, replay: false };
}

// A finite weighted equipment pool. Ordinary physical=1, selected missing physical=4,
// required weapon=2, ownership=0. Source and floor eligibility are resolved before this call.
function planWeightedEquipmentImpl(supply, catalog, owned, pool, rng) {
  const route = routeFor(supply, catalog), missing = new Set(missingDependenciesImpl(supply, catalog, owned));
  const unique = [...new Map(pool.filter(equipment).map(e => [e.id, e])).values()].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  return weighted(unique, e => own(owned, e) ? 0 : physical(e) ? missing.has(e.id) ? 4 : 1 : route?.requiredWeapons?.representative === e.id ? 2 : 1, rng);
}

/** Claim ledger draft only. Acquisition/storage code supplies a VALIDATED plain effect plan.
 * `ok:false` preserves offered and produces no commands. `pending:true` is not acquired.
 * Storage success must precede world publication. Do not call this before validating capacity,
 * exact weapon replacement confirmation, definition versions, duplicate ownership and range.
 */
function planClaimImpl(supply, key, validatedEffectPlan) {
  const entry = supply.rewardLedger[key];
  if (!entry) throw Error('Unknown offer');
  if (entry.claimState === 'committed') return { replay: true, nextSupply: copy(supply), commands: [], receipt: copy(entry.receipt) };
  if (!validatedEffectPlan?.ok || validatedEffectPlan.pending) return { ok: false, nextSupply: copy(supply), commands: [], reason: validatedEffectPlan?.reason || 'pending' };
  const draft = copy(supply), e = draft.rewardLedger[key];
  e.claimState = 'committed';
  e.compensationCommitted = e.allocation.kind === 'compensation';
  e.receipt = { key, result: e.compensationCommitted ? 'compensation' : 'acquired', allocation: copy(e.allocation),
    ...(validatedEffectPlan.receiptId ? { transactionReceiptId: validatedEffectPlan.receiptId } : {}) };
  for(const inventory of Object.values(draft.shopInventory))for(const offer of inventory)if(offer.allocationId===key){
    offer.claimState='committed';offer.sold=true;
  }
  return { ok: true, nextSupply: draft, commands: copy(validatedEffectPlan.commands || []), receipt: copy(e.receipt), replay: false };
}

/** Reuses pending free route identities; creates only never-offered missing dependencies.
 * UI pages these identities in a SINGLE existing choice panel, never a four-item choose-one.
 * The routine plans allocations only; it does not claim or force installation/replacement.
 */
function planFirstFloorCompletionImpl(supply, { roomId, sourceOrdinal = 0, completionSource = 'first-floor-completion', catalog, owned, rng }) {
  const route = routeFor(supply, catalog);
  if (!route) return { nextSupply: copy(supply), rng: copy(rng), queue: [] };
  let draft = copy(supply), rngAfter = copy(rng);
  const queue = [];
  for (let index = 0; index < route.supplyQueue.length; index++) {
    const id = route.supplyQueue[index], dependency = catalog.entries[id];
    if (own(owned, dependency)) continue;
    const reserved = draft.mandatoryOffers[id];
    if (reserved) {
      if (draft.rewardLedger[reserved].claimState === 'offered') queue.push(reserved);
      continue;
    }
    const plan = planRewardAllocationImpl(draft, { sourceId: { runId: supply.runId, floorId: '1', roomId,
      source: completionSource, sourceOrdinal: sourceOrdinal + index, generation: 0 },
      baseRewards: [], pool: [], owned, catalog, rng: rngAfter, mandatoryCompletion: true });
    draft = plan.nextSupply; rngAfter = plan.rng;
    queue.push(draft.mandatoryOffers[id]);
  }
  draft.floorCompletionQueue = queue;
  return { nextSupply: draft, rng: rngAfter, queue };
}

/** Four shelf first-generation inventory. Does not reserve/consume the free mandatory budget.
 * Offer identities and inventory persist on first offer; retries/revisits use saved allocation.
 * Generation >0 keeps all new offers in the transaction journal but is not the initial shop guarantee.
 */
function planFirstShopImpl(supply, { roomId, sourceOrdinal = 0, generation = 0, floorId = '1', legacyStock, owned, catalog }) {
  const shopId = rewardIdentity({ runId: supply.runId, floorId, roomId, source: 'shop', sourceOrdinal, generation }, false);
  const shopBaseId = rewardIdentity({ runId: supply.runId, floorId, roomId, source: 'shop', sourceOrdinal, generation: 0 }, false);
  if (supply.shopInventory[shopId]) return { replay: true, nextSupply: copy(supply), inventory: copy(supply.shopInventory[shopId]) };
  if (legacyStock.length !== 4) throw Error('Expected four shelf slots');
  const route = routeFor(supply, catalog), stock = copy(legacyStock);
  const isFirstShop = !supply.firstShopId || supply.firstShopId === shopBaseId;
  if (floorId === '1' && generation === 0 && isFirstShop && route) {
    const missing = missingDependenciesImpl(supply, catalog, owned), weapon = route.requiredWeapons?.representative;
    const slot0 = weapon && !own(owned, catalog.entries[weapon]) ? weapon : missing[0];
    const slot1 = missing.find(id => id !== slot0 && physical(catalog.entries[id]));
    for (const [slotId, id] of [[0, slot0], [1, slot1]]) {
      if (!id) continue;
      const e = catalog.entries[id], base = e.kind === 'attachment' ? 24 : e.kind === 'item' ? 22 + e.rarity * 4 : e.price ?? 18 + e.tier * 16;
      stock[slotId] = { kind: e.kind, id, price: Math.min(base, e.kind === 'weapon' ? 30 : 25) };
    }
  }
  const draft = copy(supply), inventory = stock.map((allocation, slotId) => {
    const identity = { runId: supply.runId, floorId, roomId, source: 'shop', sourceOrdinal, generation, subIndex: slotId, slotId };
    const allocationId = rewardIdentity(identity);
    draft.rewardLedger[allocationId] = { identity, allocation, claimState: 'offered', compensationCommitted: false,
      mandatory: false, delivery: null, receipt: null };
    return { identity, offerId: allocationId, allocationId, supplyRef: allocationId, allocation, claimState: 'offered', sold: false };
  });
  draft.shopInventory[shopId] = inventory;
  if (floorId === '1' && generation === 0 && !draft.firstShopId) draft.firstShopId = shopBaseId;
  draft.shopGeneration[`${floorId}/${roomId}/${sourceOrdinal}`] = generation;
  return { replay: false, nextSupply: draft, inventory };
}
// A catalog contains only real physical definitions. It never treats a synergy as loot.
const SUPPLY_SOURCES = new Set(['starter','chest','event','vault','boss','shop','first-floor-completion','chapter-boss-completion']);
const validId = value => typeof value === 'string' && value.length > 0 && value.length <= 180 &&
  !/[\u0000-\u001f\u007f]/.test(value) && !['__proto__','constructor','prototype'].includes(value);
const plainRecord = value => value && Object.getPrototypeOf(value) === Object.prototype;
const int = (value,min=0,max=Number.MAX_SAFE_INTEGER) => Number.isSafeInteger(value) && value>=min && value<=max;
const same = (a,b) => JSON.stringify(a)===JSON.stringify(b);
function freeze(value){
  if(value&&typeof value==='object'){for(const child of Object.values(value))freeze(child);Object.freeze(value);}
  return value;
}
export function createBuildSupplyCatalog({weapon={},item={},attachment={},active={}}){
  const entries={};
  for(const [kind,map]of Object.entries({weapon,item,attachment,active}))for(const [id,def]of Object.entries(map)){
    if(!validId(id)||def.id!==id||entries[id])throw Error('Invalid or colliding supply definition');
    entries[id]={kind,id,...(kind==='weapon'?{tier:def.tier,definitionVersion:def.weaponAssetVersion||1}:{}),
      ...(kind==='item'?{rarity:def.rarity}:{})};
  }
  const catalog={routes:copy(BUILD_ROUTES),sources:copy(BUILD_SOURCES),entries};
  for(const route of catalog.routes){
    if(route.supplyQueue.length>4||new Set(route.supplyQueue).size!==route.supplyQueue.length||
      route.supplyQueue.some(id=>!equipment(entries[id])))throw Error('Unknown route dependency');
  }
  for(const ids of Object.values(catalog.sources))for(const id of ids)if(!equipment(entries[id]))throw Error('Unknown source definition');
  return freeze(catalog);
}
function validateRng(rng){
  if(!plainRecord(rng)||!int(rng.seed,0,0xffffffff)||!int(rng.s,0,Number.MAX_SAFE_INTEGER-0x6d2b79f5))throw Error('Invalid supply RNG');
}
function validateOwned(owned,catalog){
  if(!plainRecord(owned))throw Error('Invalid owned equipment');
  for(const kind of ['weapon','attachment','item']){
    if(!Array.isArray(owned[kind])||owned[kind].length>4000||owned[kind].some(id=>catalog.entries[id]?.kind!==kind))throw Error('Invalid owned '+kind);
  }
}
function validateAllocation(allocation,catalog){
  if(!plainRecord(allocation))throw Error('Invalid reward allocation');
  const kind=allocation.kind;
  if(['weapon','attachment','item','active'].includes(kind)){
    if(!validId(allocation.id)||(kind==='weapon'?!hasPregeneratedWeaponDefinition(allocation):catalog.entries[allocation.id]?.kind!==kind))throw Error('Unknown physical reward');
    if(allocation.definitionVersion!==undefined&&(!int(allocation.definitionVersion,1,3)||kind!=='weapon'))throw Error('Invalid reward weapon revision');
  }else if(kind==='compensation'){
    if(allocation.coins!==15)throw Error('Invalid supply compensation');
  }else if(!['coin','key','ammo','armor','heal'].includes(kind))throw Error('Unknown reward kind');
  if(allocation.amount!==undefined&&(!Number.isFinite(allocation.amount)||allocation.amount<=0||allocation.amount>1000000))throw Error('Invalid reward amount');
  if(allocation.price!==undefined&&!int(allocation.price,0,1000000))throw Error('Invalid reward price');
  return allocation;
}
function validatePool(pool,catalog){
  if(!Array.isArray(pool)||pool.length>4000)throw Error('Invalid equipment pool');
  if(new Set(pool.map(e=>e?.id)).size!==pool.length)throw Error('Duplicate pool entry');
  for(const e of pool){validateAllocation(e,catalog);if(!equipment(e)||catalog.entries[e.id]?.kind!==e.kind)throw Error('Non-catalog equipment pool entry');}
}
/** Strict present-field validation. Missing legacy supply state must be migrated by Session, never guessed here. */
export function validateBuildSupply(supply,catalog){
  if(!plainRecord(supply)||supply.version!==2||!validId(supply.runId)||
    supply.selectedRoute!==null&&!catalog.routes.some(r=>r.id===supply.selectedRoute)||
    !int(supply.routeQueueCursor,0,4)||!int(supply.freeEquipmentOpportunities,0,4)||!int(supply.categoryMissCount,0,3)||
    !Array.isArray(supply.floorCompletionQueue)||supply.floorCompletionQueue.length>4)throw Error('Invalid build supply state');
  const route=routeFor(supply,catalog);
  for(const name of ['mandatoryOffers','sourceLedger','rewardLedger','shopGeneration','shopInventory'])if(!plainRecord(supply[name]))throw Error('Invalid supply ledger');
  if(Object.keys(supply.sourceLedger).length>4096||Object.keys(supply.rewardLedger).length>16384||Object.keys(supply.mandatoryOffers).length>4)throw Error('Supply ledger is full');
  for(const [key,e]of Object.entries(supply.rewardLedger)){
    if(!plainRecord(e)||rewardIdentity(e.identity)!==key||e.identity.runId!==supply.runId||
      !['offered','committed'].includes(e.claimState)||typeof e.mandatory!=='boolean'||typeof e.compensationCommitted!=='boolean')throw Error('Invalid supply allocation identity');
    validateAllocation(e.allocation,catalog);
    if(e.claimState==='offered'&&(e.receipt!==null||e.compensationCommitted))throw Error('Unclaimed supply has receipt');
    if(e.claimState==='committed'&&(!plainRecord(e.receipt)||e.receipt.key!==key||!same(e.receipt.allocation,e.allocation)||
      e.receipt.result!==(e.allocation.kind==='compensation'?'compensation':'acquired')||
      e.compensationCommitted!==(e.allocation.kind==='compensation')||
      e.receipt.transactionReceiptId!==undefined&&!validId(e.receipt.transactionReceiptId)))throw Error('Invalid supply claim receipt');
  }
  for(const [key,source]of Object.entries(supply.sourceLedger)){
    if(!plainRecord(source)||rewardIdentity(source.identity,false)!==key||source.identity.runId!==supply.runId||source.sourceCommitted!==true||
      !['legacy','route','category'].includes(source.mode)||!Array.isArray(source.allocationKeys)||source.allocationKeys.length>64||
      new Set(source.allocationKeys).size!==source.allocationKeys.length)throw Error('Invalid supply source event');
    validateRng(source.rngBefore);validateRng(source.rngAfter);
    source.allocationKeys.forEach((id,index)=>{
      const e=supply.rewardLedger[id];if(!e||rewardIdentity(e.identity,false)!==key||e.identity.subIndex!==index)throw Error('Detached reward allocation');
    });
  }
  for(const [id,key]of Object.entries(supply.mandatoryOffers)){
    const e=supply.rewardLedger[key];if(!route?.supplyQueue.includes(id)||!e?.mandatory||e.allocation.id!==id)throw Error('Invalid mandatory route offer');
  }
  for(const [key,e]of Object.entries(supply.rewardLedger)){
    if(e.mandatory&&supply.mandatoryOffers[e.allocation.id]!==key)throw Error('Detached mandatory offer');
    if(e.identity.source==='shop'){
      const stock=supply.shopInventory[rewardIdentity(e.identity,false)];
      if(!stock?.some(o=>o.allocationId===key))throw Error('Detached shop allocation');
    }else if(!supply.sourceLedger[rewardIdentity(e.identity,false)]?.allocationKeys.includes(key))throw Error('Detached source allocation');
  }
  if(new Set(supply.floorCompletionQueue).size!==supply.floorCompletionQueue.length||supply.floorCompletionQueue.some(key=>!supply.rewardLedger[key]?.mandatory))throw Error('Invalid completion queue');
  if(supply.firstShopId!==null&&(!validShopKey(supply.firstShopId,supply.runId)||!supply.shopInventory[supply.firstShopId]))throw Error('Invalid first shop');
  for(const generation of Object.values(supply.shopGeneration))if(!int(generation,0,2048))throw Error('Invalid shop generation');
  for(const [key,inventory]of Object.entries(supply.shopInventory)){
    if(!validShopKey(key,supply.runId)||!Array.isArray(inventory)||inventory.length!==4)throw Error('Invalid supply shop inventory');
    inventory.forEach((o,slot)=>{
      const e=supply.rewardLedger[o.allocationId];
      if(!e||rewardIdentity(o.identity,false)!==key||o.identity.slotId!==slot||o.identity.subIndex!==slot||
        o.offerId!==o.allocationId||o.supplyRef!==o.allocationId||!same(o.identity,e.identity)||!same(o.allocation,e.allocation)||
        o.claimState!==e.claimState||o.sold!==(e.claimState==='committed'))throw Error('Invalid shop supply reference');
    });
  }
  return supply;
}
function validShopKey(key,runId){
  try{const [run,floor,room,source,ordinal,generation]=JSON.parse(key);
    return source==='shop'&&run===runId&&rewardIdentity({runId:run,floorId:floor,roomId:room,source,sourceOrdinal:ordinal,generation},false)===key;
  }catch{return false;}
}
function context(supply,catalog,owned,rng){validateBuildSupply(supply,catalog);validateOwned(owned,catalog);validateRng(rng);}
export function missingDependencies(supply,catalog,owned,options={}){
  validateBuildSupply(supply,catalog);validateOwned(owned,catalog);return missingDependenciesImpl(supply,catalog,owned,options);
}
export function planRewardAllocation(supply,args){
  const {catalog,owned,rng,sourceId,baseRewards,pool}=args;
  context(supply,catalog,owned,rng);rewardIdentity(sourceId,false);
  if(sourceId.runId!==supply.runId)throw Error('Foreign run');
  if(sourceId.source==='shop'||args.mandatoryCompletion&&!['first-floor-completion','chapter-boss-completion'].includes(sourceId.source))throw Error('Wrong supply allocation entry point');
  if(!supply.sourceLedger[rewardIdentity(sourceId,false)]&&!args.legacyAlreadyOpened){
    if(!Array.isArray(baseRewards)||baseRewards.length>64)throw Error('Invalid base reward batch');
    baseRewards.forEach(e=>validateAllocation(e,catalog));validatePool(pool,catalog);
  }
  const result=planRewardAllocationImpl(supply,args);validateBuildSupply(result.nextSupply,catalog);return result;
}
export function planWeightedEquipment(supply,catalog,owned,pool,rng){
  context(supply,catalog,owned,rng);validatePool(pool,catalog);return planWeightedEquipmentImpl(supply,catalog,owned,pool,rng);
}
export function planClaim(supply,key,validatedEffectPlan,catalog){
  validateBuildSupply(supply,catalog);
  if(validatedEffectPlan?.receiptId!==undefined&&!validId(validatedEffectPlan.receiptId))throw Error('Invalid transaction receipt');
  const result=planClaimImpl(supply,key,validatedEffectPlan);validateBuildSupply(result.nextSupply,catalog);return result;
}
export function planFirstFloorCompletion(supply,args){
  context(supply,args.catalog,args.owned,args.rng);
  if(!validId(args.roomId)||args.sourceOrdinal!==undefined&&!int(args.sourceOrdinal,0,Number.MAX_SAFE_INTEGER-4))throw Error('Invalid completion identity');
  if(args.completionSource!==undefined&&!['first-floor-completion','chapter-boss-completion'].includes(args.completionSource))throw Error('Invalid completion source');
  const result=planFirstFloorCompletionImpl(supply,args);validateBuildSupply(result.nextSupply,args.catalog);return result;
}
export function planFirstShop(supply,args){
  validateBuildSupply(supply,args.catalog);validateOwned(args.owned,args.catalog);
  const id={runId:supply.runId,floorId:args.floorId??'1',roomId:args.roomId,source:'shop',sourceOrdinal:args.sourceOrdinal??0,generation:args.generation??0};
  const key=rewardIdentity(id,false);
  if(!supply.shopInventory[key]){
    if(!Array.isArray(args.legacyStock)||args.legacyStock.length!==4)throw Error('Expected four shelf slots');
    args.legacyStock.forEach(e=>validateAllocation(e,args.catalog));
  }
  const result=planFirstShopImpl(supply,args);validateBuildSupply(result.nextSupply,args.catalog);return result;
}
/** Preserve previously eligible legacy entries; add only approved new definitions for this source. */
export function supplyEquipmentPool(catalog,source,legacyPool=[]){
  if(!Object.hasOwn(catalog.sources,source))throw Error('Unknown equipment source');
  validatePool(legacyPool,catalog);
  return [...new Map([...legacyPool,...catalog.sources[source].map(id=>catalog.entries[id])].map(e=>[e.id,copy(e)])).values()]
    .sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);
}
