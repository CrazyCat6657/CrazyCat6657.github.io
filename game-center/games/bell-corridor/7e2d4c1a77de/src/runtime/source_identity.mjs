import {createHash} from 'node:crypto';
import {readdir, readFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
let identity;
// Hash actual rule/runtime sources, not a moving Git HEAD or caller claim.
export function runtimeSourceIdentity() {
  return identity ||= (async()=>{
    const files=[];
    async function walk(url,prefix='') { for(const e of await readdir(url,{withFileTypes:true})) {
      if(e.isSymbolicLink())throw Error('Source identity rejects symlinks');
      const p=prefix+e.name;
      if(e.isDirectory())await walk(new URL(e.name+'/',url),p+'/');
      else if(/\.(?:js|mjs)$/.test(p))files.push(p);
    }}
    await walk(root);const hash=createHash('sha256');
    for(const p of files.sort()){hash.update(p+'\0');hash.update(await readFile(new URL(p,root)));hash.update('\0');}
    return 'bell-corridor-runtime-v1:sha256:'+hash.digest('hex');
  })();
}
