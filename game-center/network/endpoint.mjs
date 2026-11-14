const get=(storage,key)=>{try{return storage?.getItem(key)||'';}catch{return '';}};
const put=(storage,key,value)=>{try{storage?.setItem(key,value);}catch{}};
const scoped=(config,key)=>`${key}:instance:${config.managedServiceId}`;
export function selectEndpoint(config,{hostname,local,session,key='game-center:server-url',fallbackKey}={}){
  const saved=config.managedServiceId?get(session,scoped(config,key)):get(local,key)||(fallbackKey?get(local,fallbackKey):'');
  return saved||config.serverUrl||(!config.offlineCollection&&['localhost','127.0.0.1','[::1]'].includes(hostname)?'ws://127.0.0.1:8891/socket':'');
}
export function saveEndpoint(config,value,{local,session,key='game-center:server-url'}={}){
  put(local,key,value);if(config.managedServiceId)put(session,scoped(config,key),value);
}
export function browserStorage(){let local,session;try{local=globalThis.localStorage;}catch{}try{session=globalThis.sessionStorage;}catch{}return{local,session,hostname:globalThis.location?.hostname};}
