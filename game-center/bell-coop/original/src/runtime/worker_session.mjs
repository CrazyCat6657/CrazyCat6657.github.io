import {Worker} from 'node:worker_threads';
import {randomUUID} from 'node:crypto';

function error(code,message){const e=new Error(message);e.code=code;return e;}
export async function createWorkerSession(options={}){
  const bridge=new WorkerSession(options);await bridge._initialize();return bridge;
}

// Manual fixed-step owner. There is deliberately no second autonomous clock.
// A future synchronous RoomManager adapter reads confirmed()/terminal(), never
// returns an RPC Promise from its advance/serialize methods.
export async function createCoopWorkerSession(options={}){return createWorkerSession({...options,mode:'coop'});}

export class WorkerSession {
  constructor({sessionId=randomUUID(),generation=1,timeoutMs=30000,checkpoint,mode='single',loadRunId,...options}={}){
    if(typeof sessionId!=='string'||!sessionId||sessionId.length>160||!Number.isSafeInteger(generation)||generation<1||!Number.isFinite(timeoutMs)||timeoutMs<1||timeoutMs>300000)throw TypeError('Invalid Worker session configuration');
    if(!['single','coop'].includes(mode))throw TypeError('Invalid Worker session mode');this.mode=mode;this.initialLoadRunId=loadRunId;
    this.sessionId=sessionId;this.generation=generation;this.timeoutMs=timeoutMs;this.options={seed:3131,...(mode==='single'?{heroId:'warden'}:{}),profile:'standard',scope:'full3',difficulty:'standard',...options};
    this.initialCheckpoint=checkpoint;this.disposed=false;this.slot=null;this.slots=new Set();this.cache=null;this.events=[];this.replacing=false;
  }
  async _initialize(){const slot=await this._spawn(this.options,this.generation,this.initialCheckpoint,this.initialLoadRunId);this.slot=slot;this.cache=slot.state;delete this.initialCheckpoint;delete this.initialLoadRunId;}
  _fail(slot,e){
    if(slot.failed)return;slot.failed=e;clearTimeout(slot.readyTimer);slot.rejectReady?.(e);
    for(const p of slot.pending.values()){clearTimeout(p.timer);p.reject(e);}slot.pending.clear();
  }
  async _spawn(options,generation,checkpoint,loadRunId){
    const epoch=randomUUID(),worker=new Worker(new URL('./session_worker.mjs',import.meta.url),{workerData:{sessionId:this.sessionId,generation,epoch,options,checkpoint,loadRunId,mode:this.mode},execArgv:[]});
    const slot={worker,epoch,generation,pending:new Map(),failed:null,state:null};
    this.slots.add(slot);
    const ready=new Promise((resolve,reject)=>{slot.resolveReady=resolve;slot.rejectReady=reject;slot.readyTimer=setTimeout(()=>{this._fail(slot,error('WORKER_START_TIMEOUT','Worker startup timed out'));void worker.terminate();},this.timeoutMs);});
    worker.on('message',m=>this._message(slot,m));
    worker.on('error',e=>this._fail(slot,error('WORKER_ERROR',e.message)));
    worker.on('exit',code=>{this.slots.delete(slot);this._fail(slot,error('WORKER_EXIT','Worker exited ('+code+')'));});
    try{await ready;return slot;}catch(e){await worker.terminate();throw e;}
  }
  _message(slot,m){
    if(slot.failed||m?.sessionId!==this.sessionId||m?.generation!==slot.generation||m?.epoch!==slot.epoch)return;
    if(m.type==='startup-error'||m.type==='fatal'){this._fail(slot,error('WORKER_FAILURE',m.error?.message||'Worker failed'));void slot.worker.terminate();return;}
    if(m.type==='ready'){clearTimeout(slot.readyTimer);slot.state=m.state;slot.resolveReady(slot);return;}
    if(m.type!=='result')return;
    const p=slot.pending.get(m.requestId);if(!p)return;slot.pending.delete(m.requestId);clearTimeout(p.timer);
    if(Object.hasOwn(m,'state'))slot.state=m.state;
    if(Object.hasOwn(m,'state')&&this.slot===slot&&!this.disposed){this.cache=m.state;this.events.push(...(m.events||[]));if(this.events.length>4096)this.events.splice(0,this.events.length-4096);}
    if(!m.ok){p.reject(error('REMOTE_ERROR',m.error?.message||'Worker request failed'));return;}
    p.resolve(m.result);
  }
  _live(){if(this.disposed)throw error('DISPOSED','Worker session disposed');if(this.replacing)throw error('REPLACING','Worker session is replacing its world');if(this.slot?.failed)throw this.slot.failed;}
  _request(method,args=[]){
    try{this._live();}catch(e){return Promise.reject(e);}
    const slot=this.slot,requestId=randomUUID();
    return new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{const e=error('RPC_TIMEOUT','Worker RPC timed out: '+method);this._fail(slot,e);void slot.worker.terminate();},this.timeoutMs);
      slot.pending.set(requestId,{resolve,reject,timer});
      try{slot.worker.postMessage({sessionId:this.sessionId,generation:slot.generation,epoch:slot.epoch,requestId,method,args});}
      catch(e){clearTimeout(timer);slot.pending.delete(requestId);reject(error('INVALID_RPC_PAYLOAD',e.message));}
    });
  }
  submitInput(playerId,input){return this._request('submitInput',[playerId,input]);}
  command(playerId,request){return this._request('command',[playerId,request]);}
  step(ticks=1){return this._request('step',[ticks]);}
  catalog(){return this._request('catalog');}
  progress(){return this._request('progress');}
  transportFrame(knownStatic=null){return this._request('transportFrame',[knownStatic]);}
  snapshot(){return this._request('snapshot');}
  save(){return this._request('save');}
  recover(){return this._request('recover');}
  state(){return this._request('state');}
  pause(){return this._request('pause');}
  resume(){return this._request('resume');}
  confirmed(){return structuredClone(this.cache);}
  terminal(){return ['dead','victory'].includes(this.cache?.state)?structuredClone(this.cache):null;}
  drainEvents(){return this.events.splice(0);}
  async _replace(options,generation,checkpoint){
    this._live();this.replacing=true;const old=this.slot;
    try{
      // A barrier is required; replacing while a previous step is pending could
      // roll back a newly confirmed tick. Callers finish outstanding RPC first.
      if(old.pending.size)throw error('RPC_PENDING','Finish pending RPC before replacing');
      const next=await this._spawn(options,generation,checkpoint);
      if(this.disposed){this._fail(next,error('DISPOSED','Worker session disposed'));await next.worker.terminate();throw error('DISPOSED','Worker session disposed');}
      this.slot=next;this.cache=next.state;this.options=options;this.generation=generation;this.events=[];
      this._fail(old,error('REPLACED','Worker session replaced'));await old.worker.terminate();return this.confirmed();
    }finally{this.replacing=false;}
  }
  start(options={}){return this._replace({...this.options,...options},this.generation+1);}
  restore(checkpoint){
    if(checkpoint?.sessionId!==this.sessionId||checkpoint?.generation!==this.generation||(checkpoint?.runId??checkpoint?.world?.runId)!==this.cache?.runId)return Promise.reject(error('CHECKPOINT_IDENTITY','Checkpoint belongs to another session/run/generation'));
    return this._replace(this.options,this.generation,checkpoint);
  }
  async dispose(){
    if(this.disposed)return;this.disposed=true;
    await Promise.all([...this.slots].map(async slot=>{this._fail(slot,error('DISPOSED','Worker session disposed'));await slot.worker.terminate();}));
    this.cache=null;this.events=[];
  }
}
