// Compose only a known nested ledger property from internally validated JSON.
// Every other key/value still runs the original codec, including unsafe-key,
// Set, Infinity and undefined rules. Property order and encoded bytes stay equal.
export function encodeLedgerPath(value,path,ledgerJSON,encode){
 if(!ledgerJSON)return encode(value);
 const visit=(node,depth)=>{
  const wanted=path[depth];
  if(!node||Object.getPrototypeOf(node)!==Object.prototype||!Object.hasOwn(node,wanted))return encode(node);
  const fields=[];
  for(const key of Object.keys(node)){
   if(key===wanted){const encoded=depth===path.length-1?ledgerJSON:visit(node[key],depth+1);fields.push(JSON.stringify(key)+':'+encoded);}
   else{const field=encode({[key]:node[key]});if(field!=='{}')fields.push(field.slice(1,-1));}
  }
  return '{'+fields.join(',')+'}';
 };
 return visit(value,0);
}

// Exact UTF-8 budget without allocating a second multi-megabyte byte array in
// Node. Browsers retain the original TextEncoder path.
export function coopJSONBytes(raw){return typeof globalThis.Buffer?.byteLength==='function'?globalThis.Buffer.byteLength(raw,'utf8'):new TextEncoder().encode(raw).length;}

export function encodeTrustedRecord(value,paths,encode){
 const encoded=node=>{const raw=encode(node);return {raw,bytes:coopJSONBytes(raw)};};
 const visit=(node,entries)=>{
  if(!entries.length)return encoded(node);
  if(!node||Object.getPrototypeOf(node)!==Object.prototype)return encoded(node);
  const fields=[];let bytes=2;
  for(const key of Object.keys(node)){
   const matches=entries.filter(p=>p.path[0]===key),direct=matches.find(p=>p.path.length===1);
   if(direct||matches.length){const field=direct||visit(node[key],matches.map(p=>({...p,path:p.path.slice(1)}))),prefix=JSON.stringify(key)+':';fields.push(()=>prefix+field.raw);bytes+=coopJSONBytes(prefix)+field.bytes;}
   else{const field=encode({[key]:node[key]});if(field==='{}')continue;fields.push(field.slice(1,-1));bytes+=coopJSONBytes(field)-2;}
  }
  let raw;
  return {get raw(){return raw??='{'+fields.map(field=>typeof field==='function'?field():field).join(',')+'}';},bytes:bytes+Math.max(0,fields.length-1)};
 };
 return visit(value,paths.filter(p=>p.raw!==null));
}
