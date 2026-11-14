import {parentPort,workerData} from 'node:worker_threads';
import {createGameSession} from './game_session.js';

const {sessionId,generation,epoch,options,checkpoint,mode='single',loadRunId}=workerData;
let session,disposed=false;
const identity={sessionId,generation,epoch};
const ready=(async()=>{const create=mode==='coop'?(await import('./coop_game_session.js')).createCoopGameSession:createGameSession;return create({...options,sessionId,generation,...(checkpoint?{checkpoint}:{}),...(loadRunId?{loadRunId}:{})});})().then(s=>{
  session=s;parentPort.postMessage({...identity,type:'ready',state:s.state()});
});
ready.catch(e=>{parentPort.postMessage({...identity,type:'startup-error',error:{name:e.name,message:e.message}});parentPort.close();});
let queue=ready;
parentPort.on('message',message=>{
  queue=queue.then(async()=>{
    if(message.sessionId!==sessionId||message.generation!==generation||message.epoch!==epoch)return;
    const {requestId,method,args=[]}=message;
    try{
      if(disposed)throw Error('Worker session disposed');
      if(typeof requestId!=='string'||!requestId||!Array.isArray(args))throw TypeError('Invalid RPC request');
      let result;
      if(method==='submitInput')result=await session.submitInput(...args);
      else if(method==='command')result=await session.command(...args);
      else if(method==='step')result=await session.step(...args);
      else if(method==='save'&&mode==='coop')result=await session.save();
      else if(method==='recover'&&mode==='coop')result=await session.recover();
      else if(['catalog','progress','transportFrame'].includes(method)&&mode==='coop')result=await session[method](...args);
      else if(method==='snapshot')result=await session.snapshot();
      else if(method==='state')result=await session.state();
      else if(method==='pause')result=await session.pause();
      else if(method==='resume')result=await session.resume();
      else if(method==='dispose'){session.dispose();disposed=true;result={disposed:true};}
      else throw TypeError('Unsupported RPC method');
      const state=disposed?null:session.state(),events=disposed?[]:session.drainEvents();
      parentPort.postMessage({...identity,type:'result',requestId,ok:true,result,state,events});
      if(disposed)parentPort.close();
    }catch(e){let confirmed={};try{confirmed={state:session.state(),events:session.drainEvents()};}catch{}parentPort.postMessage({...identity,type:'result',requestId,ok:false,error:{name:e.name,message:e.message},...confirmed});}
  }).catch(e=>{parentPort.postMessage({...identity,type:'fatal',error:{name:e.name,message:e.message}});parentPort.close();});
});
