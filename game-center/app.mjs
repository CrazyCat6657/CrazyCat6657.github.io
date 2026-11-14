const container=document.querySelector('#games');
const status=document.querySelector('#load-message');
let games=[];
const node=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text)el.textContent=text;return el;};
function card(game){
  const el=node('article','game-card');el.style.setProperty('--game-color',game.color);
  const cover=node('div','cover-wrap');const img=node('img');img.src=game.cover;img.alt=game.title+'游戏实景';img.loading='lazy';img.width=960;img.height=600;cover.append(img);
  const version=game.version??'尚未导入';
  const body=node('div','card-body'),head=node('div','card-head'),name=node('div');name.append(node('h3','',game.title),node('span','version',/^\d/.test(version)?'v'+version:version));head.append(name);
  const bottom=node('div','card-bottom card-actions');
  const info=node('button','game-info','游戏简介');info.type='button';info.setAttribute('aria-label',game.title+'：游戏简介');
  info.addEventListener('click',()=>{document.querySelector('#about-title').textContent=game.title;document.querySelector('#about-copy').textContent=game.description;document.querySelector('#game-about').showModal();});
  const action=node(game.playUrl?'a':'span','button',game.playUrl?'开始游戏':'暂不可用');if(game.playUrl){action.href='play.html?game='+encodeURIComponent(game.id);action.setAttribute('aria-label','开始游戏：'+game.title);}action.append(node('span','','↗'));
  bottom.append(info,action);body.append(head,node('p','gameplay',game.gameplay??game.genre),bottom);el.append(cover,body);return el;
}
function render(filter='all'){container.replaceChildren(...games.filter(g=>filter!=='offline'||g.offlineSupported).map(card));}
try{const response=await fetch('manifest.json',{cache:'no-store'});if(!response.ok)throw Error();const manifest=await response.json();if(manifest.schemaVersion!==1||!Array.isArray(manifest.games))throw Error();games=manifest.games;render();status.textContent='';}catch{status.textContent='游戏列表暂时无法读取。请刷新页面；离线合集请通过“启动游戏中心”打开。';}
for(const button of document.querySelectorAll('[data-filter]'))button.addEventListener('click',()=>{for(const other of document.querySelectorAll('[data-filter]')){other.classList.toggle('active',other===button);other.setAttribute('aria-pressed',String(other===button));}render(button.dataset.filter);});
const about=document.querySelector('#game-about');about.addEventListener('click',event=>{if(event.target===about){const rect=about.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)about.close();}});
