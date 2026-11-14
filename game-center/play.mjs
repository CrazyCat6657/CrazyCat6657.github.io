const frame=document.querySelector('#game'),message=document.querySelector('#message');
const fullscreen=document.querySelector('#fullscreen'),reload=document.querySelector('#reload');
let watchdog;
try{
  const response=await fetch('manifest.json',{cache:'no-store'});if(!response.ok)throw Error('游戏列表无法读取，请返回大厅重试。');
  const manifest=await response.json();const game=manifest.games.find(g=>g.id===new URLSearchParams(location.search).get('game'));
  if(!game?.playUrl)throw Error('没有找到这款游戏，请返回大厅选择。');
  const url=new URL(game.playUrl,location.href);if(url.origin!==location.origin||!url.pathname.startsWith(new URL('games/',location.href).pathname))throw Error('游戏入口地址无效。');
  const check=await fetch(url,{method:'HEAD'});if(!check.ok)throw Error('游戏文件暂时不可用，请返回大厅或重新下载合集。');
  document.title=game.title+' · 游戏中心';document.querySelector('#game-title').textContent=game.title+' · '+(/^\d/.test(game.version)?'v':'')+game.version;
  frame.addEventListener('load',()=>{
    clearTimeout(watchdog);
    message.textContent=matchMedia('(pointer: coarse)').matches
      ? game.touchHint??'这款游戏建议使用桌面浏览器和键鼠。'
      : game.touchHint?game.controls:'点击游戏画面开始，按 Esc 可释放鼠标或打开游戏内菜单。';
    fullscreen.disabled=false;reload.disabled=false;
  });
  frame.src=url.href;frame.hidden=false;
  watchdog=setTimeout(()=>{message.textContent='载入时间较长，可重新载入或返回大厅。';reload.disabled=false;},15000);
}catch(error){message.textContent=error.message;document.querySelector('#game-title').textContent='暂时无法启动';}
reload.addEventListener('click',()=>{if(confirm('重新载入会中断当前游玩，确定继续？'))frame.src=frame.src;});
fullscreen.addEventListener('click',async()=>{try{await frame.requestFullscreen();frame.focus();}catch{message.textContent='浏览器未允许全屏，可继续在当前窗口游玩。';}});
