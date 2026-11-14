// Task5B consumer surface; imports no solo game/save module.
export const COOP_PROTOCOL='bell-original-coop-v2';
export function authorityEnvelope(config,state){return {protocol:COOP_PROTOCOL,sourceRevision:config.sourceRevision,source:config.source,contentHash:config.contentHash,matchId:state.matchId,generation:state.generation,runId:state.runId};}
export function originalInput(config,state,seq,input){return {type:'input',seq,input,...authorityEnvelope(config,state)};}
export function originalCommand(config,state,request){return {type:'coop-command',request,...authorityEnvelope(config,state)};}
export function decodeOriginalWire(value){if(value&&typeof value==='object'){if(!Array.isArray(value)&&Object.keys(value).length===1&&value.$number==='Infinity')return Infinity;return Array.isArray(value)?value.map(decodeOriginalWire):Object.fromEntries(Object.entries(value).map(([k,v])=>[k,decodeOriginalWire(v)]));}return value;}
