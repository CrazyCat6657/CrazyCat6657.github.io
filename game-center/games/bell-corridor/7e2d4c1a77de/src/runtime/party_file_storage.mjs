import {mkdir,readFile,open,rename,realpath,lstat} from 'node:fs/promises';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';

// Trusted host configuration only. RPC never accepts paths. Keys are opaque,
// content-addressed filenames inside one explicit session namespace.
export async function createPartyFileStorage({dataRoot,namespace}){
  if(typeof dataRoot!=='string'||!path.isAbsolute(dataRoot)||typeof namespace!=='string'||!namespace||namespace.length>180)throw TypeError('Explicit absolute party dataRoot and namespace required');
  await mkdir(dataRoot,{recursive:true});
  const root=await realpath(dataRoot),folder=path.join(root,createHash('sha256').update(namespace).digest('hex'));
  await mkdir(folder,{recursive:true});
  if((await lstat(folder)).isSymbolicLink()||await realpath(folder)!==folder)throw Error('Party storage namespace must not be a link');
  const filename=key=>{
    if(typeof key!=='string'||!key.startsWith('bell-corridor:coop:')||key.length>1200)throw TypeError('Invalid party storage key');
    return path.join(folder,createHash('sha256').update(key).digest('hex')+'.json');
  };
  return Object.freeze({kind:'node-file',namespace,
    async getItem(key){try{return await readFile(filename(key),'utf8');}catch(e){if(e.code==='ENOENT')return null;throw e;}},
    async setItem(key,value){
      if(typeof value!=='string'||Buffer.byteLength(value)>64*1024*1024)throw TypeError('Party file exceeds storage budget');
      const target=filename(key),temp=target+'.'+randomUUID()+'.tmp',file=await open(temp,'wx');
      try{await file.writeFile(value,'utf8');await file.sync();}finally{await file.close();}
      await rename(temp,target);
    }
  });
}
