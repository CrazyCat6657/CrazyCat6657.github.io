import {bellCredential,storeBellCredential} from './bell-identity.mjs';
export const ERROR_TEXT={INVALID_MESSAGE:'收到无效消息，请重新进入。',INVALID_INPUT:'操作数据无效。',INVALID_CODE:'请输入六位有效邀请码。',ROOM_NOT_FOUND:'当前服务器上找不到此房间。请打开房主发来的完整邀请链接；只有房主需要启动服务。',ROOM_EXPIRED:'房间已过期，请重新创建。',ROOM_FULL:'房间已有两位玩家。',MATCH_IN_PROGRESS:'对局正在进行，请等待结束。',VERSION_MISMATCH:'页面版本已过旧，请刷新后重新进入。',UNSUPPORTED_MODE:'服务端暂不支持这个游戏模式。',INVALID_SESSION:'重连时间已过，请重新加入房间。',HOST_ONLY:'由房主开始对局。',NOT_READY:'需要两位玩家都准备好。',NOT_IN_ROOM:'请先加入房间。',ALREADY_IN_ROOM:'你已经在房间中。',NOT_PLAYING:'当前不在对局中。',SERVER_FULL:'联机服务暂时已满，请稍后再试。',MAINTENANCE:'联机服务正在维护，请稍后再试。',INTERNAL_ERROR:'联机服务发生错误，请稍后重试。'};
export class RoomClient extends EventTarget{
  constructor(url,config){super();this.url=url;this.config=config;this.storageKey=(config.gameId??'network-lab')==='network-lab'?'game-center:lab-session':'game-center:'+config.gameId+':session';this.seq=0;this.socket=null;this.explicit=false;this.reconnecting=false;this.session=null;this.state=null;this.samples=[];this.opening=null;this.epoch=0;this.sessionReady=false;this.reconnectMs=60000;
    try{this.session=JSON.parse(sessionStorage.getItem(this.storageKey)??'null');}catch{}
  }
  emit(type,detail){this.dispatchEvent(new CustomEvent(type,{detail}));}
  send(message){if(message.type==='input'&&(!this.sessionReady||this.reconnecting))return;if(this.socket?.readyState===WebSocket.OPEN)this.socket.send(JSON.stringify(message));}
  stopHeartbeat(){clearInterval(this.heartbeat);this.heartbeat=null;}
  startHeartbeat(socket){
    this.stopHeartbeat();let lastTick=Date.now(),pendingAt=0;
    const interval=this.config.heartbeatIntervalMs??2000,timeout=this.config.heartbeatTimeoutMs??20000;
    this.heartbeat=setInterval(()=>{
      if(this.socket!==socket||this.explicit){this.stopHeartbeat();return;}
      const now=Date.now();
      // A suspended/throttled tab gets a fresh probe, rather than a false timeout on wake.
      if(now-lastTick>timeout||globalThis.document?.visibilityState==='hidden')pendingAt=0;
      lastTick=now;
      if(pendingAt&&this.lastPong>=pendingAt)pendingAt=0;
      if(pendingAt&&now-pendingAt>=timeout){this.failSocket(socket);return;}
      if(!pendingAt){pendingAt=now;this.send({type:'ping',sentAt:now});}
    },interval);this.heartbeat.unref?.();
  }
  failSocket(socket){if(this.socket!==socket||this.explicit)return;this.socket=null;this.welcomed=false;this.sessionReady=false;this.state=null;this.stopHeartbeat();socket.close();this.emit('disconnected');if(this.session&&!this.reconnecting)void this.reconnect();}
  async connect({resume=false,deadline=Infinity}={}){
    if(this.opening)return this.opening;
    if(this.welcomed&&this.socket?.readyState===WebSocket.OPEN)return;
    this.explicit=false;this.welcomed=false;
    const epoch=this.epoch;const pending=new Promise((resolve,reject)=>{
      const socket=new WebSocket(this.url);this.socket=socket;let settled=false;
      const finish=(error)=>{if(settled)return;settled=true;clearTimeout(timeout);error?reject(error):resolve();};
      this.cancelOpening=()=>finish(Error('连接已取消。'));
      const timeout=setTimeout(()=>{finish(Error('无法连接联机服务，请检查地址或确认服务已启动。'));this.failSocket(socket);},Math.max(1,Math.min(this.config.connectTimeoutMs??6000,deadline-Date.now())));
      socket.addEventListener('open',()=>{if(this.socket!==socket||this.explicit){socket.close();return;}this.send({type:'hello',protocolVersion:this.config.protocolVersion,clientBuild:this.config.clientBuild,gameId:this.config.gameId??'network-lab',mode:this.config.mode??'duel',...(this.config.contentHash?{contentHash:this.config.contentHash}:{}),...(this.config.gameId==='bell-corridor'?{coopProtocol:this.config.protocol,sourceRevision:this.config.sourceRevision,source:this.config.source,profile:bellCredential(this.url)}:{} )});});
      socket.addEventListener('message',event=>{
        if(this.socket!==socket||this.explicit||this.epoch!==epoch)return;
        let message;try{message=JSON.parse(event.data);}catch{return;}
        if(message.type==='coop-profile'){storeBellCredential(message.credential,this.url);this.emit('coop-profile',{id:message.credential.id});}
        if(message.type==='coop-profile-result'||message.type==='coop-runs'||message.type==='coop-command-result'||message.type==='coop-error'||message.type==='coop-input-rejected')this.emit(message.type,message);
        if(message.type==='welcome'){
          this.welcomed=true;this.arena=message.arena;
          if(Number.isFinite(message.reconnectMs))this.reconnectMs=Math.max(1000,Math.min(120000,message.reconnectMs));
          this.startHeartbeat(socket);
          if(resume&&this.session)this.send({type:'resume',code:this.session.code,token:this.session.token});
          else {this.emit('connected',message);finish();}
        }
        if(message.type==='session'){
          this.session={code:message.code,id:message.id,token:message.token};this.seq=0;this.sessionReady=true;try{sessionStorage.setItem(this.storageKey,JSON.stringify(this.session));}catch{}
          if(resume){this.reconnecting=false;finish();this.emit('connected',message);}this.emit('session',this.session);
        }
        if(message.type==='snapshot'&&this.sessionReady){this.state=message;this.emit('state',message);}
        if(message.type==='error'){if(['INVALID_SESSION','ROOM_NOT_FOUND','ROOM_EXPIRED'].includes(message.code)){this.clearSession();this.emit('left');}finish(Error(ERROR_TEXT[message.code]??'连接失败。'));this.emit('problem',ERROR_TEXT[message.code]??'操作未成功，请重试。');if(resume)this.failSocket(socket);}
        if(message.type==='left'){this.clearSession();this.emit('left');}
        if(message.type==='closed'){this.explicit=true;this.stopHeartbeat();this.clearSession();finish(Error(ERROR_TEXT[message.reason]??'房间已关闭。'));this.emit('left');this.emit('problem',ERROR_TEXT[message.reason]??'房间已关闭。');}
        if(message.type==='pong'){this.lastPong=message.sentAt;const rtt=Math.max(0,Date.now()-message.sentAt);this.samples.push(rtt);if(this.samples.length>30)this.samples.shift();this.emit('latency',{rtt,jitter:this.samples.length>1?Math.round(Math.abs(rtt-this.samples.at(-2))):0});}
      });
      socket.addEventListener('error',()=>{if(this.socket!==socket)return;finish(Error('无法连接联机服务，请检查地址或确认服务已启动。'));this.failSocket(socket);});
      socket.addEventListener('close',()=>{finish(Error('联机连接已关闭。'));this.failSocket(socket);});
    }).finally(()=>{if(this.opening===pending){this.opening=null;this.cancelOpening=null;}});
    this.opening=pending;return pending;
  }
  async reconnect(){
    if(this.reconnecting||this.explicit||!this.session)return;
    this.reconnecting=true;const epoch=this.epoch,deadline=Date.now()+this.reconnectMs;let attempt=0;
    this.emit('problem','连接中断，正在尝试重连。');
    while(!this.explicit&&this.session&&Date.now()<deadline&&epoch===this.epoch){
      const base=Math.min(5000,(this.config.retryBaseMs??400)*2**Math.min(attempt++,4));
      await new Promise(r=>{this.retryResolve=r;this.retryTimer=setTimeout(r,Math.min(deadline-Date.now(),base*(0.75+Math.random()*0.5)));});this.retryResolve=null;
      if(this.explicit||epoch!==this.epoch||Date.now()>=deadline)break;
      try{await this.connect({resume:true,deadline});if(this.explicit||epoch!==this.epoch)break;if(this.sessionReady){this.reconnecting=false;return;}}catch{}
    }
    if(epoch===this.epoch){this.reconnecting=false;if(!this.explicit){this.cancelConnection();this.clearSession();this.emit('left');this.emit('problem','未能恢复连接，请重新加入房间。');}}
  }
  clearSession(){this.session=null;this.state=null;this.sessionReady=false;try{sessionStorage.removeItem(this.storageKey);}catch{}}
  cancelConnection(){this.stopHeartbeat();clearTimeout(this.retryTimer);this.retryResolve?.();this.cancelOpening?.();const socket=this.socket;this.socket=null;this.opening=null;this.welcomed=false;this.sessionReady=false;this.reconnecting=false;socket?.close();}
  leave(){this.explicit=true;this.epoch++;this.send({type:'leave'});this.cancelConnection();this.clearSession();this.emit('left');}
  dispose(){this.explicit=true;this.epoch++;this.cancelConnection();}
  coopEnvelope(){const s=this.state,c=this.config;if(c.gameId!=='bell-corridor'||!s?.original)throw Error('Cooperative session is loading');return {protocol:c.protocol,sourceRevision:c.sourceRevision,source:c.source,contentHash:c.contentHash,matchId:s.matchId,generation:s.generation,runId:s.runId};}
  coopActor(){return this.state?.original?.players.find(p=>p.peerId===this.session?.id);}
  sendCoopCommand(request){const actor=this.coopActor(),connection=this.state?.original?.lifecycle.connections[actor?.id];this.send({type:'coop-command',...this.coopEnvelope(),request:{...request,actorEpoch:connection?.epoch}});}
  listCoopRuns(){this.send({type:'coop-list'});}
  continueCoopRun(runId){this.send({type:'coop-continue',runId});}
  abandonCoopRun(){this.send({type:'coop-abandon'});}
  sendInput(input){if(this.reconnecting||!this.sessionReady||this.socket?.readyState!==WebSocket.OPEN||this.state?.state!=='playing')return null;if(this.config.gameId==='bell-corridor'){const actor=this.coopActor();if(!actor)return null;this.seq=Math.max(this.seq,actor.ack??0);const seq=++this.seq;this.send({type:'input',seq,input:{...input,actorEpoch:this.state.original.lifecycle.connections[actor.id].epoch},...this.coopEnvelope()});return seq;}const seq=++this.seq;this.send({type:'input',seq,...input});return seq;}
  input(x,y,aim,fire){return this.sendInput({x,y,aim,fire});}
}

Object.assign(ERROR_TEXT,{ROOM_GAME_MISMATCH:'这个邀请码属于另一款游戏，请从对应入口加入。',CONTENT_MISMATCH:'游戏内容版本不同，请刷新页面后重新加入。'});
Object.assign(ERROR_TEXT,{INVALID_SETTINGS:'房间设置无效，请检查地图、武器和数值范围。',INVALID_ATTRIBUTES:'属性超出允许范围，请调整后保存。',INVALID_TALENTS:'天赋选择重复或超出本房间的次数。',BUILD_REQUIRED:'请先保存本人的秘密天赋选择，再准备。',WEAPON_NOT_ALLOWED:'本房间未开放这把武器。'});
Object.assign(ERROR_TEXT,{ROOM_FULL:'房间已满。',NOT_READY:'请等人数与分队符合规则，并让全员准备。',INVALID_TEAM:'请选择有效的队伍。',TEAM_FULL:'这支队伍已满，请选择另一队。',SHOP_CLOSED:'补给时间已结束。',INVALID_ITEM:'这件补给暂时无法购买。',INSUFFICIENT_COINS:'金币不足。',SHOP_LIMIT:'这件补给已达到购买上限。',INVALID_REQUEST:'购买请求已失效，请重新选择。',NOT_SHOPPING:'当前不在补给阶段。'});
Object.assign(ERROR_TEXT,{UNKNOWN_ITEM:'这件补给暂时无法购买。',ITEM_LIMIT:'这件补给已达到购买上限。',REQUEST_ID_REUSED:'购买请求已失效，请重新选择。',TOO_MANY_PURCHASES:'本场购买次数已满。'});
Object.assign(ERROR_TEXT,{ROOM_TOO_LARGE:'房间人数超过所选玩法上限，请先让部分玩家离开。'});

Object.assign(ERROR_TEXT,{PROFILE_IN_USE:'此合作身份已在另一个房间中。',ACTIVE_RUN_EXISTS:'还有一场未结束的远征，请继续或先放弃。',INVALID_PROFILE:'合作身份无效，请检查本机保存的身份凭据。',RUN_OWNER_REQUIRED:'请使用参加这场远征时的合作身份。',RUN_NOT_FOUND:'没有可继续的合作远征。',COOP_BUSY:'正在处理操作，请稍候。',COOP_LOADING:'正在载入远征。',STALE_GENERATION:'远征已经更新，请等待最新画面。'});
