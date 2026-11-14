import {PROJECTILE_PROFILES} from './fx/weapon_projectile_profiles.js';
const $=id=>document.getElementById(id),frame=$('game-frame');let lab,catalog;
const message=text=>{$('message').textContent=text;};
function filtered(){const q=$('search').value.toLowerCase(),f=$('family').value;return catalog.weapons.filter(w=>(!f||w.assetFamily===f)&&`${w.cn} ${w.id} ${w.desc} ${w.assetFamily}`.toLowerCase().includes(q));}
function fill(){const old=$('weapon').value;const ws=filtered();$('weapon').replaceChildren(...ws.map(w=>new Option(w.cn,w.id)));if(ws.some(w=>w.id===old))$('weapon').value=old;else if(ws.length)$('weapon').selectedIndex=0;info();}
function info(){const w=catalog.weapons.find(w=>w.id===$('weapon').value);if(!w){$('name').textContent='没有匹配武器';$('loop').textContent='清空搜索或切换机械类别后重试。';$('visual').textContent='';$('cost').textContent='';$('relic').textContent='';return;}$('name').textContent=w.cn;$('loop').textContent=w.desc;$('visual').textContent=`弹丸表现：${PROJECTILE_PROFILES[w.id]?.signature||''}`;$('cost').textContent=`代价：${w.assetTradeoff||''} · 弹仓 ${w.mag} · 装填 ${w.reload} 秒`;$('relic').textContent=lab.relicCompatibility(w.id)?'遗物适配：双生链接可加射一弹；爆裂装药每次射击至多触发一次小爆炸。':'遗物限制：这把枪不触发双生链接或爆裂装药。';}
const operate=(id,fn)=>{$(id).onclick=()=>{try{const result=fn();if(result===false||result?.ok===false)message(result?.why||'操作未生效，请先回到大厅演练。');else message('已生效。点击右侧画面继续试射。');}catch(e){message(e.message);console.error(e);}};};
async function start(){
  await new Promise((resolve,reject)=>{const began=Date.now(),timer=setInterval(()=>{const w=frame.contentWindow;if(w?.__booted&&w.__game?.state==='title'&&w.__weaponLab){clearInterval(timer);lab=w.__weaponLab;resolve();}else if(Date.now()-began>60000){clearInterval(timer);reject(Error('游戏未完成启动，请查看右侧错误信息'));}},200);});
  catalog=lab.init();$('count').textContent=`${catalog.weapons.length} 把已接入运行 · 26 把原有来源保留`;
  $('family').append(...[...new Set(catalog.weapons.map(w=>w.assetFamily))].map(f=>new Option(f,f)));
  $('hero').append(...catalog.heroes.map(h=>new Option(h.cn,h.id)));$('attachment').append(...catalog.attachments.map(a=>new Option(a.cn,a.id)));
  fill();const initial=new URLSearchParams(location.search);if(catalog.weapons.some(w=>w.id===initial.get('weapon'))){$('weapon').value=initial.get('weapon');info();lab.equip($('weapon').value,$('hero').value);if(initial.has('scenario')){const kind=initial.get('scenario');if([...$('scenario').options].some(o=>o.value===kind)){$('scenario').value=kind;lab.targets(kind);}}}
  $('search').oninput=fill;$('family').onchange=fill;$('weapon').onchange=info;
  operate('equip',()=>lab.equip($('weapon').value,$('hero').value,$('keep').checked));operate('targets',()=>lab.targets($('scenario').value));operate('refill',()=>lab.refill());
  operate('pause',()=>frame.contentWindow.__game.setPaused(!frame.contentWindow.__game.paused));operate('attach',()=>lab.attach($('attachment').value));
  operate('save',()=>lab.save());operate('restore',()=>lab.restore());
  operate('finite',()=>{lab.finite=!lab.finite;$('finite').textContent=`有限储备：${lab.finite?'开':'关'}`;lab.refill();});
  setInterval(()=>{const s=lab.status();$('live').textContent=`${s.name||'演练'} · ${s.mag??0} / ${s.reserve??0} · 热 ${s.heat}% · 锚 ${s.anchors} / 线 ${s.lines} ${s.paused?' · 已暂停':''}`;},250);
  window.__labUI={lab,catalog};message('加载完成。可先试连锚织光器，选择移动靶检查穿线伤害。');
}
start().catch(e=>message(`启动失败：${e.message}`));
