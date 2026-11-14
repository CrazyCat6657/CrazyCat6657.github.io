import {glyphSvg,glyphKeyForActive} from './glyphs.js';
const states=new WeakMap();
/** Render a read-only selection model and send intents through one delegated listener. */
export function renderActiveSelector(container,model,{onSelect,disabled=false,useLabel='F',cycleLabel='X'}={}) {
  if(!container)return;
  let state=states.get(container);
  if(!state) {
    state={};states.set(container,state);
    container.addEventListener('click',e=>{
      const button=e.target.closest?.('[data-active-id]');
      if(!button||!container.contains(button)||state.disabled||button.disabled||!state.ids.has(button.dataset.activeId))return;
      e.preventDefault();e.stopPropagation();state.onSelect?.(button.dataset.activeId);
    });
    // Existing modal routing prevents native Enter/Space activation. Handle
    // focused skill buttons here without sending those keys into combat.
    container.addEventListener('keydown',e=>{
      if(e.key!=='Enter'&&e.key!==' ')return;
      const button=e.target.closest?.('[data-active-id]');
      if(!button||!container.contains(button))return;
      e.preventDefault();e.stopPropagation();if(!e.repeat)button.click();
    });
  }
  const entries=model?.entries||[];state.ids=new Set(entries.map(e=>e.id));state.onSelect=onSelect;state.disabled=disabled;
  const doc=container.ownerDocument,heading=doc.createElement('div');heading.className='bs-active-help';
  const cd=Number.isFinite(model?.remainingCd)?Math.max(0,model.remainingCd):0;
  heading.textContent=`${useLabel} 使用 · ${cycleLabel} 切换 · ${cd>0?`共享冷却 ${cd.toFixed(1)}s`:'技能就绪'} · 切换保留剩余冷却`;
  const nodes=[heading];
  if(!entries.length){const empty=doc.createElement('div');empty.className='bs-empty';empty.textContent='尚未获得主动技能。可在商店或宝箱中获取。';nodes.push(empty);}
  for(const entry of entries) {
    const selected=entry.id===model.currentId,button=doc.createElement('button');
    button.type='button';button.className=`bs-act bs-active-choice${selected?' on':''}`;button.dataset.activeId=entry.id;
    button.disabled=!!disabled;button.setAttribute('aria-pressed',String(selected));
    const glyph=doc.createElement('span');glyph.className='active-glyph';glyph.setAttribute('aria-hidden','true');
    glyph.innerHTML=glyphSvg(glyphKeyForActive(entry));
    const name=doc.createElement('b'),desc=doc.createElement('span'),choice=doc.createElement('small');
    name.textContent=entry.cn;desc.textContent=entry.desc;choice.textContent=`${selected?`${useLabel} · 已选中`:'点击选择'} · 冷却 ${entry.cd}s`;
    button.append(glyph,name,desc,choice);nodes.push(button);
  }
  const focused=doc.activeElement?.dataset?.activeId;
  container.replaceChildren(...nodes);
  if(focused)nodes.find(n=>n.dataset?.activeId===focused)?.focus?.({preventScroll:true});
}
