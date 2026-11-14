const panel=document.querySelector('#owner-panel'),fragment=new URLSearchParams(location.hash.slice(1)),ticket=fragment.get('launcher');
let remembered=false;try{remembered=sessionStorage.getItem('game-center:owner-panel')==='1';}catch{}
if(ticket||remembered){
  if(ticket)history.replaceState(null,'',location.pathname+location.search);
  const $=selector=>panel.querySelector(selector),message=text=>$('#owner-message').textContent=text;
  let stopped=false,timer;
  const busy=value=>{for(const button of panel.querySelectorAll('button'))button.disabled=value;};
  async function request(path='',body){const response=await fetch('/__game_center_panel'+path,{method:body?'POST':'GET',headers:body?{'content-type':'application/json','x-game-center-panel':'1'}:{},body:body?JSON.stringify(body):undefined,cache:'no-store'});const result=await response.json();if(!response.ok)throw Error(result.error||'本机控制入口已失效，请重新双击启动游戏中心。');return result;}
  function render(state){panel.hidden=false;for(const button of panel.querySelectorAll('[data-mode]'))button.setAttribute('aria-pressed',String(button.dataset.mode===state.mode));$('#owner-state').textContent=state.connections?`${state.connections} 人连接 · ${state.rooms} 个房间`:'服务运行中';$('#owner-sharing').hidden=state.mode!=='lan';$('#owner-share-url').value=state.shareUrl||'';}
  async function refresh(){if(stopped)return;try{render(await request());}catch{clearInterval(timer);if(!panel.hidden)message('服务已断开，请重新双击启动游戏中心。');}}
  try{
    render(ticket?await request('/claim',{ticket}):await request());try{sessionStorage.setItem('game-center:owner-panel','1');}catch{}
    for(const button of panel.querySelectorAll('[data-mode],#owner-stop'))button.addEventListener('click',async()=>{
      busy(true);message('正在处理…');try{const action=button.dataset.mode||'stop',result=await request('/action',{action});
        if(result.redirect){location.replace(result.redirect);return;}
        if(result.stopped){stopped=true;clearInterval(timer);panel.style.setProperty('--accent','var(--muted)');$('#owner-state').textContent='服务已停止';$('#owner-sharing').hidden=true;message('再次游玩时，双击“启动游戏中心”即可。');return;}
        await refresh();message('');
      }catch(error){message(error.message);}if(!stopped)busy(false);
    });
    $('#owner-copy').onclick=async()=>{const input=$('#owner-share-url');try{await navigator.clipboard.writeText(input.value);message('大厅链接已复制。');}catch{input.focus();input.select();message('请复制已选中的大厅地址。');}};
    timer=setInterval(refresh,5000);
  }catch(error){if(ticket){panel.hidden=false;busy(true);message(error.message);}else{panel.hidden=true;try{sessionStorage.removeItem('game-center:owner-panel');}catch{}}}
}
