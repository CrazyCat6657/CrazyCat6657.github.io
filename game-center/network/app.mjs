import {installInvitation,invitationError} from './invite.mjs';
import { RoomClient } from './client.mjs';
import {selectEndpoint,saveEndpoint,browserStorage} from './endpoint.mjs';
const $=selector=>document.querySelector(selector),canvas=$('#arena'),ctx=canvas.getContext('2d');
const config=await fetch('config.json',{cache:'no-store'}).then(r=>r.json());
const endpointOptions=browserStorage();
$('#server-url').value=selectEndpoint(config,endpointOptions);
$('#code').value=new URLSearchParams(location.search).get('room')?.toUpperCase().slice(0,6)??'';
let client,world,keys=new Set(),aim=0,fire=false,busy=false,renderPlayers=new Map();
const feedback=text=>{$('#feedback').textContent=text;};
const invitation=installInvitation({config,getCode:()=>client?.session?.code,getEndpoint:()=>$('#server-url').value.trim(),feedback});
function reset(){world=null;renderPlayers.clear();$('#entrance').hidden=false;$('#room-controls').hidden=true;$('#match-state').textContent='等待玩家';$('#score').textContent='0 : 0';$('#time').textContent='2:00';}
function connectClient(){
  const value=$('#server-url').value.trim();
  if(!value)throw Error('还没有配置联机服务。可先玩单人游戏，或在连接设置中填写服务地址。');
  let url;try{url=new URL(value);}catch{throw Error('请输入有效的 WebSocket 服务地址。');}
  if(!['ws:','wss:'].includes(url.protocol)||url.username||url.password||url.hash||url.search)throw Error('请填写 ws:// 或 wss:// 服务地址，不包含密码、查询参数或片段。');
  if(location.protocol==='https:'&&url.protocol!=='wss:')throw Error('当前页面需要使用 wss:// 安全连接。');
  if(client?.url===url.href)return client;
  client?.dispose();reset();client=new RoomClient(url.href,config);
  client.addEventListener('connected',()=>{$('#connection').textContent='已连接';});
  client.addEventListener('disconnected',()=>{$('#connection').textContent='连接已断开';});
  client.addEventListener('problem',e=>feedback(e.detail));
  client.addEventListener('session',()=>{$('#entrance').hidden=true;$('#room-controls').hidden=false;$('#room-code').textContent=client.session.code;invitation.update();feedback('邀请朋友加入，双方准备后由房主开始。');});
  client.addEventListener('left',reset);
  client.addEventListener('latency',e=>{$('#latency').textContent=`往返延迟 ${e.detail.rtt} ms · 相邻样本波动 ${e.detail.jitter} ms`;});
  client.addEventListener('state',e=>{
    world=e.detail;const me=world.players.find(p=>p.id===client.session?.id),host=world.host===me?.id;
    $('#entrance').hidden=true;$('#room-controls').hidden=false;$('#room-code').textContent=world.code;
    $('#players').replaceChildren(...world.players.map((p,i)=>{const li=document.createElement('li'),name=document.createElement('span'),status=document.createElement('span');name.textContent=(i===0?'房主':'客人')+(p.id===me?.id?'（你）':'');status.textContent=!p.connected?'重连中':p.ready?'已准备':'未准备';li.append(name,status);return li;}));
    $('#ready').textContent=me?.ready?'取消准备':world.state==='result'?'准备再来一局':'准备';$('#ready').disabled=!['waiting','result'].includes(world.state);
    $('#start').hidden=!host;$('#start').disabled=!['waiting','result'].includes(world.state)||world.players.length!==2||!world.players.every(p=>p.connected&&p.ready);
    $('#score').textContent=world.players.map(p=>p.score).join(' : ');
    const seconds=Math.ceil(world.remainingMs/1000);$('#time').textContent=world.state==='waiting'?'2:00':Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');
    $('#match-state').textContent=({waiting:'等待玩家准备',playing:'先到 3 分获胜',paused:'等待队友重连',result:!world.result?.winner?'平局':world.result.winner===me?.id?'你赢了':'对局结束'})[world.state];
    if(world.state==='playing')feedback('');else if(world.state==='paused')feedback('连接中断，对局已暂停。请等待队友重连。');else if(world.state==='result')feedback(world.players.length===2?'双方再次准备后，房主可开始下一局。':'对方已离开。可以邀请另一位朋友，或离开房间。');
  });return client;
}
async function run(action){if(busy)return;busy=true;$('#create').disabled=true;try{invitation.assertDestination();const c=connectClient();await c.connect();await action(c);}catch(e){feedback(e.message);}finally{busy=false;$('#create').disabled=false;}}
$('#create').addEventListener('click',()=>run(c=>c.send({type:'create'})));
$('#join-form').addEventListener('submit',e=>{e.preventDefault();run(c=>c.send({type:'join',code:$('#code').value.trim().toUpperCase()}));});
$('#ready').addEventListener('click',()=>{const me=world?.players.find(p=>p.id===client.session?.id);client?.send({type:'ready',value:!me?.ready});});
$('#start').addEventListener('click',()=>client?.send({type:'start'}));
$('#leave').addEventListener('click',()=>client?.leave());
$('#save-server').addEventListener('click',()=>{try{client?.dispose();client=null;reset();connectClient();try{saveEndpoint(config,$('#server-url').value.trim(),endpointOptions);}catch{}feedback('连接地址已保存。');}catch(e){feedback(e.message);}});
function release(){keys.clear();fire=false;client?.input(0,0,aim,false);}
window.addEventListener('keydown',e=>{if(e.target.closest('input,button,summary'))return;if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){keys.add(e.code);e.preventDefault();}});
window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',release);document.addEventListener('visibilitychange',()=>{if(document.hidden)release();});
canvas.addEventListener('pointermove',e=>{const rect=canvas.getBoundingClientRect(),me=world?.players.find(p=>p.id===client?.session?.id);if(me)aim=Math.atan2((e.clientY-rect.top)*600/rect.height-me.y,(e.clientX-rect.left)*960/rect.width-me.x);});
canvas.addEventListener('pointerdown',e=>{if(e.button===0){canvas.focus();fire=true;canvas.setPointerCapture(e.pointerId);}});window.addEventListener('pointerup',()=>fire=false);canvas.addEventListener('pointercancel',()=>fire=false);
setInterval(()=>{if(document.hidden)return;client?.input(Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft')),Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp')),aim,fire);},1000/30);
setInterval(()=>client?.send({type:'ping',sentAt:Date.now()}),2000);
function draw(){
  ctx.fillStyle='#0d1e2c';ctx.fillRect(0,0,960,600);ctx.strokeStyle='#203443';ctx.lineWidth=1;
  for(let x=0;x<960;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,600);ctx.stroke();}for(let y=0;y<600;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(960,y);ctx.stroke();}
  for(const box of client?.arena?.obstacles??[{x:260,y:175,w:90,h:250},{x:610,y:175,w:90,h:250}]){ctx.fillStyle='#2f485a';ctx.fillRect(box.x,box.y,box.w,box.h);ctx.strokeStyle='#486577';ctx.strokeRect(box.x,box.y,box.w,box.h);}
  for(const[i,p]of (world?.players??[]).entries()){
    const rendered=renderPlayers.get(p.id)??{x:p.x,y:p.y};rendered.x+=(p.x-rendered.x)*.35;rendered.y+=(p.y-rendered.y)*.35;renderPlayers.set(p.id,rendered);
    ctx.globalAlpha=p.hp>0?(p.connected?1:.4):.2;ctx.fillStyle=i===0?'#8bd2e4':'#dca865';ctx.beginPath();ctx.arc(rendered.x,rendered.y,17,0,Math.PI*2);ctx.fill();ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(rendered.x,rendered.y);ctx.lineTo(rendered.x+Math.cos(p.aim)*30,rendered.y+Math.sin(p.aim)*30);ctx.stroke();
    ctx.fillStyle='#0b1420';ctx.fillRect(rendered.x-23,rendered.y-34,46,5);ctx.fillStyle=i===0?'#8bd2e4':'#dca865';ctx.fillRect(rendered.x-23,rendered.y-34,46*p.hp/100,5);ctx.font='13px Segoe UI';ctx.textAlign='center';ctx.fillStyle='#dce7ee';ctx.fillText(p.id===client.session?.id?'你':i===0?'房主':'客人',rendered.x,rendered.y+45);ctx.globalAlpha=1;
  }
  ctx.fillStyle='#f5e6bc';for(const b of world?.bullets??[]){ctx.beginPath();ctx.arc(b.x,b.y,4,0,Math.PI*2);ctx.fill();}
  if(!world||world.state==='waiting'){ctx.fillStyle='#a9bbc7';ctx.textAlign='center';ctx.font='18px Microsoft YaHei';ctx.fillText(world?'双方准备后开始':'创建房间，邀请一位朋友',480,80);}
  requestAnimationFrame(draw);
}draw();
// A refreshed tab can resume its own session; invite links contain only the public room code and service identity.
try{const c=connectClient();if(c.session)run(async x=>x.send({type:'resume',code:x.session.code,token:x.session.token}));}catch(e){feedback(e.message);}
