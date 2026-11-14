import { PAGE_COMBAT_MODE } from './mode.js';
import { controlLabel } from '../../core/control_actions.js';
import {FOLD_RULES,foldReturnInfo} from './fold_shadow.js';

// The entry performs a full navigation so global progression singletons cannot
// retain a previous mode's data. A preview never migrates the real save.
export function installCombatPage(game) {
  if (new URLSearchParams(location.search).get('weaponLab') === '1') return;
  const title = document.getElementById('screen-title'), row = title.querySelector('.row');
  const url = new URL(location.href); url.search = ''; url.hash = '';
  const link = document.createElement('a'); link.className = 'btn';
  if (PAGE_COMBAT_MODE === 'classic') {
    url.searchParams.set('combatExperiment','pass-d'); link.href = url.href;
    link.id = 'btn-combat-experiment'; link.textContent = '技能训练';
    const extra=document.createElement('details');extra.id='training-options';extra.className='training-options';
    const summary=document.createElement('summary');summary.textContent='训练与玩法';extra.append(summary,link);title.append(extra);
    installCombatHUD(game); return;
  }
  link.href = url.href; link.id = 'btn-combat-classic'; link.textContent = '返回经典玩法'; row.append(link);
  link.addEventListener('click', event => { if (game.state === 'play' && !game.saveProgress(true)) event.preventDefault(); });
  title.querySelector('.desc').textContent = '折影者 · 高机动战斗实验。无影像时掠影自动留影，开枪后可折返；手动摆影可选，掠影和折返没有无敌。';
  const start = document.getElementById('btn-start'); start.textContent = '新实验 · 折影者';
  const controls = document.createElement('div'); controls.id = 'combat-experiment-setup';
  controls.innerHTML = `<label>实验职业 <select id="experiment-scheme"><option value="foldshadow">折影者：掠影 / 留影 / 折返 / 万象折镜</option><option value="fixed">守钟人对照：固定组</option><option value="mixed">守钟人对照：混合组</option></select></label>
    <label>对照 Seed <input id="experiment-seed" type="number" min="1" max="4294967295" step="1" value="3131" aria-label="实验种子"></label>
    <p data-experiment-description></p>
    <p>Shift疾跑消耗体力；右键/空格闪避负责无敌。Q/C机动无无敌。首房可手动拾取药剂，数字1–4使用对应格。</p>`;
  title.insertBefore(controls, row);
  const syncChoice=()=>{
    const fold=controls.querySelector('select').value==='foldshadow';
    game.experimentPreview=controls.querySelector('select').value;
    start.textContent=fold?'新实验 · 折影者':'新实验 · 守钟人对照';
    controls.querySelector('[data-experiment-description]').textContent=fold
      ? `${controlLabel(game.input,'skill_1')}无影像时掠影自动留影${FOLD_RULES.anchorLife}秒；开枪后可按${controlLabel(game.input,'skill_3')}折返，同房最远${FOLD_RULES.returnRange}米且路径安全。${controlLabel(game.input,'skill_2')}可选手动摆影。真实枪械或爆炸伤害为${controlLabel(game.input,'ultimate')}充能，满后开启万象折镜。掠影与折返没有无敌。`
      : '现有守钟人对照：技能 1 踏进，技能 2 震慑或护幕，技能 3 钟鸣，大招超载。用于比较输入与战斗节奏；具体按键见当前键位表。';
    game.hud.refreshControlLabels();
  };
  controls.querySelector('select').addEventListener('change',syncChoice);syncChoice();
  start.addEventListener('click', event => {
    event.preventDefault(); event.stopImmediatePropagation();
    const input = controls.querySelector('input'), seed = Number(input.value);
    if (!input.value || !Number.isInteger(seed) || seed < 1 || seed > 4294967295) { input.reportValidity(); return; }
    game.experimentScheme = controls.querySelector('select').value;
    game.startNewRun(seed);
  }, {capture:true});
  document.getElementById('btn-quit').textContent = '结束实验并返回标题';
  installCombatHUD(game);
}

function installCombatHUD(game) {
  const style = document.createElement('style');
  style.textContent = `#combat-experiment-setup{max-width:780px;font-size:13px;line-height:1.6;margin:10px auto}#combat-experiment-setup label{display:inline-block;margin:5px}#combat-experiment-setup p{margin:5px}#experiment-hud{position:fixed;top:80px;left:50%;transform:translateX(-50%);max-width:70vw;padding:9px 14px;background:#081720e8;border:1px solid #73cbd0;color:#e0f5f1;z-index:12;font:13px/1.5 sans-serif;pointer-events:none}#experiment-hud[hidden]{display:none}#experiment-hud meter{width:120px;margin:0 8px}#experiment-hud .experiment-note{color:#b8d2d6;font-size:12px}`;
  document.head.append(style);
  const hud = document.createElement('div'); hud.id = 'experiment-hud'; hud.hidden = true;
  hud.innerHTML = `<b data-exp-title></b> · 体力<meter min="0" max="100" value="100"></meter><span data-exp-stamina></span><div data-exp-skills></div><div class="experiment-note" data-exp-note></div>`;
  document.body.append(hud);
  game.experimentHUD = hud; game.hud.refreshControlLabels();
}

export function updateCombatHUD(game) {
  const hud = game.experimentHUD; if (!hud) return;
  const s = game.experiment;
  hud.hidden = !s || game.state !== 'play' || game.paused || game.panelOpen(); if (hud.hidden) return;
  const key = action => controlLabel(game.input, action);
  const formal=PAGE_COMBAT_MODE==='classic';
  hud.querySelector('[data-exp-title]').textContent = s.fold?'折影者':`守钟人对照 · ${s.scheme === 'fixed' ? '固定组' : '混合组'}`;
  hud.querySelector('meter').value = s.stamina;
  hud.querySelector('[data-exp-stamina]').textContent = `${Math.floor(s.stamina)}/100${s.exhausted?' · 恢复至20才能疾跑':''}`;
  const cd = n => n > 0 ? `${n.toFixed(1)}s` : '就绪';
  const back=s.fold?foldReturnInfo(game):null;
  const retreat=back?.anchor?`${back.remaining.toFixed(1)}s · ${back.distance?.toFixed(1)??'?'}/${back.range}米`:'掠影会自动留影';
  const retreatStatus=!back?.anchor?'无影像':back.ready?'就绪':s.fold.swapCd>0?cd(s.fold.swapCd):back.distance>back.range?'距离过远':'闪避中';
  const ultimate=s.ultLeft>0?s.ultLeft.toFixed(1)+'s':s.energy>=100?'就绪':`${Math.floor(s.energy)}/100（命中真实敌人充能）`;
  hud.querySelector('[data-exp-skills]').textContent = s.fold ? `[${key('skill_1')}]掠影 ${s.fold.qCharges}/2${s.fold.qCharges<2?' · '+s.fold.qRecharge.toFixed(1)+'s':''} · [${key('skill_3')}]折返 ${retreatStatus}（${retreat}） · [${key('skill_2')}]手动摆影·可选 ${cd(s.fold.echoCd)} · [${key('ultimate')}]万象折镜 ${ultimate}` : `[${key('skill_1')}]踏进 ${cd(s.cdStep)} · [${key('skill_2')}]${s.scheme === 'fixed'?'震慑':'护幕'} ${cd(s.cdTactic)} · [${key('skill_3')}]钟鸣 ${cd(game.player.heroSkillCd)} · [${key('ultimate')}]超载 ${s.ultLeft>0?s.ultLeft.toFixed(1)+'s':Math.floor(s.energy)+'/100'}`;
  hud.querySelector('[data-exp-note]').textContent = `${s.fold?`常用：[${key('skill_1')}]→开枪→[${key('skill_3')}]；`:''}[${key('sprint')}]疾跑 · [${key('dodge')}]闪避 · [${key('active')}]主动 / [${key('cycle_active')}]轮换 · 药剂 ${[1,2,3,4].map(i=>key('item_'+i)).join('/')}`;
  if(formal){hud.querySelector('[data-exp-skills]').textContent=`[${key('ultimate')}] 万象折镜 · ${ultimate}`;hud.querySelector('[data-exp-note]').hidden=true;}
}
