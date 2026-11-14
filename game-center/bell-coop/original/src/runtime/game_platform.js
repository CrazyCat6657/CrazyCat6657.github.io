// A realm has one platform. Configure before importing Game/Meta/SaveStore.
// Headless callers use one fresh Node Worker per session; browser stays default.
let current = Object.freeze({kind: 'browser'});
let presentation = null;
let runtimeImported = false;
const restoreCandidates = new WeakSet();
export function gamePlatform() { return current; }
export function presentationPlatform() { return presentation || current; }
// A synchronous candidate-construction/application scope. Never change the
// published rule platform or hold this override while awaiting storage.
export function withPresentationPlatform(platform, callback) {
  if(!ownsGamePlatform(platform)||platform.kind!=='headless')throw TypeError('Invalid presentation platform');
  const previous=presentation;presentation=platform;
  try { const result=callback();if(result?.then)throw TypeError('Presentation scope must be synchronous');return result; }
  finally { presentation=previous; }
}
export function ownsGamePlatform(platform) { return platform === current || restoreCandidates.has(platform); }
// A temporary restore candidate shares the already imported rule modules, but
// routes all world-local effects to its own scheduler/storage/event scope.
export function restoreCandidatePlatform(parent, overrides) {
  if (!ownsGamePlatform(parent) || parent.kind !== 'headless' || !overrides?.scheduler || typeof overrides.emit !== 'function' || typeof overrides.createHUD !== 'function') throw TypeError('Invalid restore candidate platform');
  const platform=Object.freeze({...parent,...overrides});restoreCandidates.add(platform);return platform;
}
export function publishRestorePlatform(platform) {
  if(!restoreCandidates.has(platform))throw TypeError('Only a completed restore candidate can be published');
  current=platform;
}
export function markGameRuntimeImported() { runtimeImported = true; }
export function configureGamePlatform(platform) {
  if (runtimeImported || current.kind !== 'browser') throw Error('Configure platform once, before importing Game; use a fresh Worker per session');
  if (platform?.kind !== 'headless' || typeof platform.createHUD !== 'function' || typeof platform.emit !== 'function') throw TypeError('Invalid explicit headless platform');
  current = Object.freeze(platform);
  return current;
}

export class MemoryStorage {
  #data = new Map();
  constructor(namespace) {
    if (typeof namespace !== 'string' || !namespace) throw TypeError('Storage namespace required');
    this.namespace = namespace;
  }
  get length() { return this.#data.size; }
  key(index) { return [...this.#data.keys()][index] ?? null; }
  getItem(key) { return this.#data.get(String(key)) ?? null; }
  setItem(key, value) { this.#data.set(String(key), String(value)); }
  removeItem(key) { this.#data.delete(String(key)); }
  clear() { this.#data.clear(); }
}
