import {PAGE_COMPARISON,COMPARISON_VARIANTS} from './config.js';
import {comparisonReport} from './report.js';

const NAMES={classic:'经典守钟人',fixed:'实验守钟人·震慑',mixed:'实验守钟人·护幕',foldshadow:'独立折影者'};
function route(variant,seed) {
  const url=new URL(location.href);url.search='';url.hash='';url.searchParams.set('combatCompare',variant);
  url.searchParams.set('compareSeed',String(seed));return url.href;
}
function validSeed(value) {const n=Number(value);return Number.isInteger(n)&&n>=1&&n<=4294967295?n:null;}
export function installComparisonPage(g) {
  if(new URLSearchParams(location.search).get('weaponLab')==='1')return;
  const title=document.getElementById('screen-title'),row=title.querySelector('.row');
  if(!PAGE_COMPARISON) {
    const link=document.createElement('a');link.className='btn';link.id='btn-comparison';link.textContent='同图训练';link.href=route('classic',3131);(document.getElementById('training-options')||row).append(link);return;
  }
  title.querySelector('.desc').textContent=`条件对照 · ${NAMES[PAGE_COMPARISON]}。标准难度、无复苏 / 词条 / 额外出征补给，使用锈蚀手枪与旧首层地图。四路线独立保存。`;
  const old=document.getElementById('combat-experiment-setup');if(old)old.hidden=true;
  const setup=document.createElement('div');setup.id='comparison-setup';
  const label=document.createElement('label');label.textContent='共同 Seed ';
  const input=document.createElement('input');input.id='comparison-seed';input.type='number';input.min='1';input.max='4294967295';input.step='1';
  input.value=String(validSeed(new URLSearchParams(location.search).get('compareSeed'))||3131);input.setAttribute('aria-label','公平对照种子');label.append(input);setup.append(label);
  const note=document.createElement('p');note.textContent='先对比经典与实验守钟人；折影者生命与机制另比。实验路线各有六种药剂样品，经典沿用原玩法。相同 Seed 仅固定初始布局，局内行为仍会影响后续过程。';setup.append(note);
  title.insertBefore(setup,row);
  const start=document.getElementById('btn-start');start.textContent=`开始对照 · ${NAMES[PAGE_COMPARISON]}`;
  // Combat-page capture was installed earlier. A new button avoids two owners
  // without intercepting any other title or pause controls.
  const button=start.cloneNode(true);start.replaceWith(button);
  button.addEventListener('click',event=>{event.preventDefault();const seed=validSeed(input.value);if(seed===null){input.reportValidity();return;}g.startNewRun(seed);});
  function nav(parent) {
    const holder=document.createElement('div');holder.className='row';holder.dataset.comparisonRoutes='';
    for(const variant of COMPARISON_VARIANTS) {
      const link=document.createElement('a');link.className='btn';link.dataset.comparisonVariant=variant;link.textContent=NAMES[variant];link.href=route(variant,validSeed(input.value)||3131);
      if(variant===PAGE_COMPARISON)link.setAttribute('aria-current','page');
      link.addEventListener('click',event=>{
        if(g.state==='play'&&!g.saveProgress(true)){event.preventDefault();return;}
        const seed=g.state==='play'?g.seed:validSeed(input.value);
        if(seed===null){event.preventDefault();input.reportValidity();return;}
        link.href=route(variant,seed);
      });holder.append(link);
    }parent.append(holder);
  }
  nav(setup);const pause=document.getElementById('screen-pause');nav(pause);
  const exportButton=document.createElement('button');exportButton.className='btn';exportButton.id='btn-comparison-export';exportButton.textContent='导出本局对照记录';
  exportButton.addEventListener('click',()=>{
    if(!g.comparison||g.mode!=='run'||!['play','dead','victory'].includes(g.state))return;
    const blob=new Blob([JSON.stringify(comparisonReport(g),null,2)],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob);
    const link=document.createElement('a');link.href=url;link.download=`对照记录_${PAGE_COMPARISON}_${g.comparison.seed}.json`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });pause.querySelector('.row').append(exportButton);
  for(const screen of ['screen-death','screen-victory']) {
    const row=document.getElementById(screen)?.querySelector('.row');if(!row)continue;
    const copy=exportButton.cloneNode(true);copy.removeAttribute('id');copy.dataset.comparisonExport=screen;
    copy.addEventListener('click',()=>exportButton.click());row.append(copy);
  }
}
