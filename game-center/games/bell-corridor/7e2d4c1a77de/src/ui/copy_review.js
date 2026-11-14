import {COPY_REVIEW_KEY,DECISIONS,newCopyReview,copyRecordId,validateCopyReview,saveCopyRecord,mergeCopyReviews,copyReviewMarkdown} from './copy_review_state.js';

const make=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;};
const visible=el=>{
  for(let p=el;p&&p!==document.body;p=p.parentElement){const s=getComputedStyle(p);if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0||p.hidden)return false;}
  return true;
};
function nodePath(node){
  const parts=[];let el=node.parentElement;
  while(el&&el!==document.body){if(el.id){parts.unshift('#'+el.id);break;}parts.unshift(el.tagName.toLowerCase()+':'+[...el.parentElement.children].indexOf(el));el=el.parentElement;}
  return parts.join('/')+'/text:'+Array.prototype.indexOf.call(node.parentNode.childNodes,node);
}
function clippedRect(rect,el){
  let left=Math.max(0,rect.left),top=Math.max(0,rect.top),right=Math.min(innerWidth,rect.right),bottom=Math.min(innerHeight,rect.bottom);
  for(let p=el.parentElement;p&&p!==document.body;p=p.parentElement){
    const s=getComputedStyle(p),r=p.getBoundingClientRect();
    if(/auto|scroll|hidden|clip/.test(s.overflowX)){left=Math.max(left,r.left);right=Math.min(right,r.right);}
    if(/auto|scroll|hidden|clip/.test(s.overflowY)){top=Math.max(top,r.top);bottom=Math.min(bottom,r.bottom);}
  }
  return right-left>2&&bottom-top>3?{left,top,width:right-left,height:bottom-top}:null;
}

export async function mountCopyReview(game){
  const link=make('link');link.rel='stylesheet';link.href=new URL('./copy_review.css',import.meta.url).href;document.head.append(link);
  const root=make('div');root.id='copy-review';document.body.append(root);
  const toolbar=make('div','cr-toolbar'),targets=make('div','cr-targets'),instruction=make('div','cr-instruction'),shade=make('div','cr-shade'),panel=make('section','cr-panel');
  panel.setAttribute('aria-label','文案审校');panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.tabIndex=-1;
  shade.hidden=panel.hidden=instruction.hidden=true;
  const status=make('p','cr-status');status.setAttribute('role','status');
  const button=(label,fn,cls='')=>{const b=make('button',cls,label);b.type='button';b.addEventListener('click',fn);return b;};
  const toggle=button('开启审校',()=>active?leave():enter(),'cr-primary');toggle.id='copy-review-toggle';
  const count=make('span','cr-count','正在准备…');
  toolbar.append(toggle,button('最近提示',()=>{enter();recentPanel();}),button('审校记录',()=>{enter();recordsPanel();}),count);
  root.append(targets,toolbar,instruction,shade,panel);
  let active=false,state=null,basis=null,storageIssue='',oldStorage='',recent=[],priorCapture=false,previewRestore=null,previewContents=[];
  const originals=new Map();
  const showStatus=t=>{status.textContent=t;};
  const closePanel=()=>{panel.hidden=shade.hidden=true;rebuild();toggle.focus();};
  const openPanel=title=>{panel.replaceChildren(make('h2','',title));status.textContent='';panel.hidden=shade.hidden=false;panel.append(button('关闭',closePanel));panel.focus();};
  function currentScene(){
    const screen=[...document.querySelectorAll('#ui > .screen')].find(e=>!e.classList.contains('hidden'))?.id||'';
    const hub=document.getElementById('hub-panel');
    const labels={'screen-title':'开始界面','screen-pause':'暂停菜单','screen-death':'失败结算','screen-victory':'胜利结算','screen-loading':'加载界面'};
    return [labels[screen]||(game.mode==='hub'?'钟炉前厅':'远征中'),hub&&!hub.classList.contains('hidden')?document.getElementById('hub-title')?.textContent:'',!screen&&game.mode==='run'?'第'+game.floor+'层 · '+game.roomLabel():''].filter(Boolean).join(' · ');
  }
  function context(){return [game.hero?.name||game.hero?.cn||'',game.player?.weapons?.map(w=>w.def.name||w.def.cn).join(' / ')||''].filter(Boolean).join(' · ');}
  function refreshCount(){count.textContent=state?`已存 ${state.records.length} 条`:'草稿未就绪';}
  function persist(next){
    if(storageIssue){showStatus(storageIssue+' 请先导出备份。');return false;}
    try{localStorage.setItem(COPY_REVIEW_KEY,JSON.stringify(next));state=next;refreshCount();return true;}
    catch{showStatus('本机保存失败，修改尚未保存。请复制文字或导出当前意见，释放浏览器存储后重试。');return false;}
  }
  function resetText(){for(const [node,value]of originals)if(node.isConnected)node.nodeValue=value;}
  function collect(){
    const rows=[],walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    while(walker.nextNode()){
      const node=walker.currentNode,el=node.parentElement;
      if(!el||el.closest('#copy-review,script,style,svg,textarea,select,option,noscript,#boot-fail')||!node.nodeValue.trim()||!visible(el))continue;
      if(!originals.has(node))originals.set(node,node.nodeValue);
      const original=originals.get(node).trim(),path=nodePath(node),row={scene:currentScene(),path,original,context:context()};row.id=copyRecordId(row);
      const range=document.createRange();range.selectNodeContents(node);
      if(![...range.getClientRects()].some(r=>clippedRect(r,el)))continue;
      const draft=state?.records.find(r=>r.id===row.id);
      if(draft?.decision==='edited')node.nodeValue=originals.get(node).replace(original,()=>draft.draft);
      rows.push({...row,node});
    }
    return rows;
  }
  function rebuild(){
    targets.replaceChildren();if(!active||!panel.hidden)return;
    resetText();
    for(const row of collect()){
      const range=document.createRange();range.selectNodeContents(row.node);
      for(const r of range.getClientRects()){
        const box=clippedRect(r,row.node.parentElement);if(!box)continue;
        const hit=button('',()=>edit(row),'cr-hit');hit.setAttribute('aria-label','审校：'+row.original);hit.title=row.original;
        Object.assign(hit.style,Object.fromEntries(Object.entries(box).map(([k,v])=>[k,v+'px'])));targets.append(hit);
      }
    }
  }
  function enter(){
    if(active)return;
    active=true;game._textReviewFrozen=true;priorCapture=!!game.input.capturing;game.input.capturing=true;game.input.resetState();game.weaponAssets?.suspend();
    document.body.classList.add('cr-reviewing');toggle.textContent='继续游玩';instruction.hidden=false;
    instruction.textContent='已暂停 · 点击画面中的文字进行审校；继续游玩时恢复原文。';rebuild();
  }
  function leave(){
    if(!active)return;restorePreview();resetText();originals.clear();targets.replaceChildren();panel.hidden=shade.hidden=instruction.hidden=true;
    document.body.classList.remove('cr-reviewing');game.input.resetState();game.input.capturing=priorCapture;game._textReviewFrozen=false;active=false;toggle.textContent='开启审校';toggle.blur();
  }
  function edit(row){
    openPanel('修改这句话');
    const saved=state?.records.find(r=>r.id===row.id),original=make('p','cr-original',row.original),hint=make('p','cr-muted',row.scene);
    const label=make('label','','想改成什么'),draft=make('textarea');draft.id='copy-review-draft';draft.maxLength=16000;draft.value=saved?.draft||row.original;label.append(draft);
    const noteLabel=make('label','','补充意见（可不填）'),notes=make('textarea','cr-notes');notes.id='copy-review-notes';notes.maxLength=8000;notes.value=saved?.notes||'';noteLabel.append(notes);
    panel.append(hint,original,label,noteLabel,make('p','cr-muted','这里显示的是你遇到的原句和实际数值。只保存文案意见，不改变游戏规则。'));
    const decide=decision=>{
      if(!state){showStatus('审校尚未准备好，请稍后重试。');return;}
      try{
        const next=saveCopyRecord(state,{scene:row.scene,path:row.path,original:row.original,context:row.context,decision,draft:decision==='edited'?draft.value:'',notes:notes.value});
        if(!persist(next))return;
        if(row.node?.isConnected&&decision==='edited')row.node.nodeValue=originals.get(row.node).replace(row.original,()=>draft.value);
        closePanel();instruction.textContent='已保存 · 修改稿会在审校画面中原位预览；继续游玩时恢复原文。';
      }catch(e){showStatus(e.message);}
    };
    const actions=make('div','cr-actions');actions.append(button('这句可以',()=>decide('approved')),button('保存并预览',()=>decide('edited'),'cr-primary'),button('这里有问题',()=>decide('issue')));panel.append(actions,status);draft.focus();
  }
  function recentPanel(){
    openPanel('最近提示');panel.append(make('p','cr-muted','点一条即可提出修改。记录的是当时出现的完整提示。'));
    const list=make('div','cr-list');
    for(const r of recent)list.append(button(r.original,()=>edit(r)));
    if(!recent.length)list.append(make('p','','暂时没有提示。继续游玩，遇到提示后再来查看。'));
    panel.append(list,status);
  }
  function download(text,name,type){const url=URL.createObjectURL(new Blob([text],{type})),a=make('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function recordsPanel(){
    openPanel('已保存的审校意见');
    panel.append(make('p','cr-muted','完成一批后导出发给我。这里的意见仅针对遇到的画面，不会自动批准其他相似文案。'));
    const actions=make('div','cr-actions');
    actions.append(button('导出意见文件',()=>state&&download(JSON.stringify(state,null,2),'沉钟回廊_游戏内文案审校.json','application/json')),button('导出文字版',()=>state&&download(copyReviewMarkdown(state),'沉钟回廊_文案修改意见.md','text/markdown')));
    if(oldStorage&&storageIssue)actions.append(button('导出未读取的旧草稿',()=>download(oldStorage,'沉钟回廊_旧草稿_请保留.json','application/json')));
    panel.append(actions);
    const fileLabel=make('label','cr-file','恢复同版本备份（保留本机已有意见）'),file=make('input');file.type='file';file.accept='.json,application/json';file.setAttribute('aria-label','恢复审校备份');
    file.addEventListener('change',async()=>{
      const f=file.files[0];file.value='';if(!f||!state)return;
      try{if(f.size>8*1024*1024)throw Error('备份过大，请交给开发者处理。');const merged=mergeCopyReviews(state,JSON.parse(await f.text()));if(persist(merged.state))showStatus(`恢复 ${merged.added} 条；保留本机不同意见 ${merged.protectedCount} 条。关闭再打开可查看。`);}catch(e){showStatus(e.message);}
    });fileLabel.append(file);panel.append(fileLabel);
    const examples=make('div','cr-actions');examples.append(button('预览失败结算文案',()=>preview('screen-death')),button('预览胜利结算文案',()=>preview('screen-victory')));panel.append(examples);
    panel.append(make('p','cr-muted','结算预览仅借用游戏的实际界面，不结算本局、不发奖励。'));
    const list=make('div','cr-list');for(const r of state?.records||[])list.append(button(DECISIONS[r.decision]+' · '+(r.decision==='edited'?r.draft:r.original),()=>edit(r)));panel.append(list,status);
    if(storageIssue)showStatus(storageIssue);
  }
  function restorePreview(){if(!previewRestore)return;resetText();for(const [el,html]of previewContents)el.innerHTML=html;previewContents=[];for(const [el,hidden]of previewRestore)el.classList.toggle('hidden',hidden);previewRestore=null;instruction.style.pointerEvents='none';}
  function preview(id){
    restorePreview();resetText();
    const screens=[...document.querySelectorAll('#ui > .screen,#hub-panel,#choice-panel,#screen-build')];previewRestore=screens.map(el=>[el,el.classList.contains('hidden')]);
    for(const el of screens)el.classList.toggle('hidden',el.id!==id);
    const prefix=id==='screen-death'?'death':'victory';
    for(const suffix of ['stats','items']){const el=document.getElementById(prefix+'-'+suffix);if(el)previewContents.push([el,el.innerHTML]);}
    if(game.player&&game.run)game.hud.fillStats(game.snapshotRun(prefix==='death'?'dead':'victory'),prefix+'-stats');
    closePanel();instruction.replaceChildren(document.createTextNode('结算文案预览 · 不结算本局　'));
    const back=button('返回原画面',()=>{restorePreview();instruction.textContent='已暂停 · 点击画面中的文字进行审校。';rebuild();});instruction.append(back);instruction.style.pointerEvents='auto';rebuild();
  }
  // Capture before the game's window listeners. Editor typing keeps native defaults.
  const block=e=>{
    if(!active)return;
    if(root.contains(e.target)){
      if(e.type==='keydown'){
        if(e.key==='Escape'){e.preventDefault();if(!panel.hidden)closePanel();else if(previewRestore){restorePreview();rebuild();}else leave();}
        if(e.key==='Tab'&&!panel.hidden){const focusable=[...panel.querySelectorAll('button,textarea,input')].filter(el=>!el.disabled);if(!focusable.length)return;const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===panel)){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
        e.stopPropagation();
      }else if(e.type==='keyup')e.stopPropagation();
      return;
    }
    if(e.type==='keydown'&&e.key==='Escape'){e.preventDefault();if(!panel.hidden)closePanel();else leave();}
    e.preventDefault();e.stopImmediatePropagation();
  };
  for(const event of ['keydown','keyup','pointerdown','mousedown','mouseup','click','dblclick','contextmenu','touchstart'])window.addEventListener(event,block,{capture:true,passive:false});
  let rebuildQueued=false;const queueRebuild=()=>{if(!active||rebuildQueued)return;rebuildQueued=true;requestAnimationFrame(()=>{rebuildQueued=false;rebuild();});};
  window.addEventListener('resize',queueRebuild);document.addEventListener('scroll',queueRebuild,true);
  const api={enter,leave,get active(){return active;},recordMessage(title,sub=''){
    if(active)return;const scene=currentScene(),original=[title,sub].filter(Boolean).join('\n').trim();if(!original)return;
    const row={scene,path:'最近提示',original,context:context()};row.id=copyRecordId(row);recent=[row,...recent.filter(r=>r.id!==row.id)].slice(0,60);
  }};game.copyReview=api;
  try{
    const response=await fetch('./docs/pass-e2/INGAME_REVIEW_MANIFEST.json',{cache:'no-store'});if(!response.ok)throw Error('版本信息读取失败');
    const manifest=await response.json();basis=manifest.basis;if(!basis?.runtimeFingerprint?.sha1||!basis?.copyFingerprint?.sha1)throw Error('版本信息不完整');
    state=newCopyReview(basis);
    try{oldStorage=localStorage.getItem(COPY_REVIEW_KEY)||'';if(oldStorage)state=validateCopyReview(JSON.parse(oldStorage),basis);}catch(e){storageIssue='已有草稿无法安全读取，已保留原数据。'+e.message;}
    refreshCount();
  }catch{storageIssue='审校版本信息读取失败，请用本地启动器重新打开；旧草稿未改动。';count.textContent='审校暂不可保存';}
  return api;
}
