// Imported before any original game module. These keys never touch solo slots.
export const BELL_PROFILE_KEY='game-center:bell-coop:capability:v1';
export function bellEndpoint(endpoint){const u=new URL(endpoint);if(!['ws:','wss:'].includes(u.protocol)||u.username||u.password)throw TypeError('Explicit cooperative WebSocket endpoint required');return u.origin+u.pathname;}
export function bellProfileKey(endpoint){return BELL_PROFILE_KEY+':endpoint:'+encodeURIComponent(bellEndpoint(endpoint));}
export function bellCredential(endpoint,storage=globalThis.localStorage){try{return JSON.parse(storage.getItem(bellProfileKey(endpoint))??'null');}catch{return null;}}
export function storeBellCredential(credential,endpoint,storage=globalThis.localStorage){if(!credential||!/^[a-f0-9]{32}$/.test(credential.id)||!/^[a-f0-9]{48}$/.test(credential.secret))throw TypeError('Invalid cooperative capability');storage.setItem(bellProfileKey(endpoint),JSON.stringify(credential));}
// Old preproduction global credentials have no trustworthy service binding.
// Keep them untouched. A UI may call this only after the user identifies the
// original host; never guess its owner from a new invitation or current URL.
export function migrateLegacyBellCredential(endpoint,storage=globalThis.localStorage){if(bellCredential(endpoint,storage))return false;const raw=storage.getItem(BELL_PROFILE_KEY);if(!raw)return false;storeBellCredential(JSON.parse(raw),endpoint,storage);return true;}
