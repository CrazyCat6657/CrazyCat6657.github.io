import { ACTIONS, controls, bindingLabel, actionLabel, eventToken } from '../core/control_bindings.js';

// The parent owns the hub modal and calls dispose whenever its content changes.
export function mountControls(container, { input, onChange = () => {}, onDone = () => {}, store = controls } = {}) {
  let profile = input?.profile || 'classic', editor = null, disposed = false, suppressContext = false;
  container.innerHTML = `<div data-controls>
    <style>
      [data-controls] { text-align:left; }
      [data-controls] .controls-toolbar { display:flex; flex-wrap:wrap; gap:10px; align-items:center; }
      [data-controls] .controls-list { max-height:40vh; overflow:auto; margin:12px 0; }
      [data-controls] .controls-row { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:7px 2px; border-bottom:1px solid #ffffff18; }
      [data-controls] .controls-binding { color:#c3dbed; font-size:13px; }
      [data-controls] .controls-editor { padding:12px; border:1px solid #73bde0; margin:10px 0; }
      [data-controls] .controls-tokens { display:flex; flex-wrap:wrap; gap:6px; margin:8px 0; }
      [data-controls] .controls-pad { padding:12px; border:1px dashed #91c8e3; margin:8px 0; }
      [data-controls] .controls-error { color:#ffaaa0; }
      [data-controls] button:focus-visible, [data-controls] select:focus-visible { outline:2px solid #a8e2ff; outline-offset:3px; }
      [data-controls] small { color:#b6bec9; }
    </style>
    <div class="controls-toolbar"><label>编辑预设 <select data-profile aria-label="编辑控制预设"><option value="classic">经典玩法</option><option value="experimental">实验玩法（独立入口）</option></select></label>
    <button type="button" class="btn" data-reset>恢复当前预设默认</button></div>
    <p data-note></p><div data-editor></div><div class="controls-list" data-list></div>
    <p>菜单固定使用方向键／WASD 导航、E／Enter 确认、Esc 返回；与战斗改键分开。</p>
    <p data-status role="status" aria-live="polite">每项保留 1–3 个绑定；保存后即时生效。Esc 为取消／关闭，Enter 为菜单确认。</p>
    <button type="button" class="btn primary" data-done>完成</button>
  </div>`;
  const root = container.querySelector('[data-controls]');
  const el = selector => root.querySelector(selector);
  const doc = container.ownerDocument || document;
  const view = doc.defaultView;
  function status(message, error = false) {
    el('[data-status]').textContent = message;
    el('[data-status]').classList.toggle('controls-error', error);
  }
  function setCapturing(value) {
    if (input) { input.capturing = value; input.resetState?.(); }
    if (editor) editor.capturing = value;
  }
  function stopCapture() { if (editor?.capturing) setCapturing(false); }
  function renderList() {
    el('[data-note]').textContent = `${profile === (input?.profile || 'classic') ? '正在编辑当前页面使用的预设。' : '这里只保存另一套预设，不会切换当前玩法。'}实验玩法已接入疾跑、技能与四格药剂；经典与实验键位分别保存。构筑、地图与主动轮换仅支持键盘。`;
    const list = el('[data-list]'); list.replaceChildren();
    for (const action of ACTIONS.filter(action => action.profiles.includes(profile))) {
      const row = doc.createElement('div'); row.className = 'controls-row'; row.dataset.action = action.id;
      const text = doc.createElement('span'); text.textContent = action.label;
      if (action.keyboardOnly) { const hint = doc.createElement('small'); hint.textContent = ' · 仅键盘'; text.append(hint); }
      const binding = doc.createElement('span'); binding.className = 'controls-binding'; binding.textContent = actionLabel(action.id, profile, store);
      const edit = doc.createElement('button'); edit.type = 'button'; edit.className = 'btn'; edit.textContent = '改键'; edit.setAttribute('aria-label', `修改${action.label}绑定`);
      edit.addEventListener('click', () => {
        stopCapture(); editor = { action, tokens: store.get(profile)[action.id], capturing: false };
        renderEditor(); status(`正在编辑${action.label}；原绑定在保存成功前保持不变。`);
        el('[data-capture]').focus();
      });
      row.append(text, binding, edit); list.append(row);
    }
  }
  function renderEditor() {
    const host = el('[data-editor]'); host.replaceChildren();
    if (!editor) return;
    const box = doc.createElement('div'); box.className = 'controls-editor';
    const heading = doc.createElement('strong'); heading.textContent = `${editor.action.label} · 候选绑定`;
    const tokens = doc.createElement('div'); tokens.className = 'controls-tokens';
    for (const [index, token] of editor.tokens.entries()) {
      const remove = doc.createElement('button'); remove.type = 'button'; remove.className = 'btn';
      remove.textContent = `${bindingLabel(token)} ×`; remove.setAttribute('aria-label', `移除候选绑定${bindingLabel(token)}`);
      remove.addEventListener('click', () => { stopCapture(); editor.tokens.splice(index, 1); renderEditor(); }); tokens.append(remove);
    }
    if (!editor.tokens.length) tokens.textContent = '候选为空：保存前请至少添加一个绑定。';
    const toolbar = doc.createElement('div'); toolbar.className = 'controls-toolbar';
    function button(label, attr, callback) {
      const b = doc.createElement('button'); b.type = 'button'; b.className = 'btn'; b.textContent = label;
      b.setAttribute(attr, ''); b.addEventListener('click', callback); toolbar.append(b); return b;
    }
    const capture = button(editor.capturing ? '等待输入（Esc 取消捕获）' : '捕获一个按键／鼠标', 'data-capture', () => {
      if (editor.capturing) { stopCapture(); renderEditor(); status('已取消捕获，候选绑定仍保留。'); return; }
      if (editor.tokens.length >= 3) { status('最多三个绑定，请先移除一个候选。', true); return; }
      setCapturing(true); renderEditor(); status('请按普通按键，或在捕获区点击鼠标／滚动。Esc 只取消捕获；浏览器快捷键不会被拦截。');
    });
    capture.disabled = !editor.capturing && editor.tokens.length >= 3;
    button('清空候选', 'data-clear', () => { stopCapture(); editor.tokens = []; renderEditor(); });
    button('保存此动作', 'data-save', () => {
      stopCapture(); const result = store.rebind(profile, editor.action.id, editor.tokens);
      if (result.ok) { editor = null; renderEditor(); renderList(); status('已保存 · 刷新后仍保留。'); }
      else { renderEditor(); status(result.error, true); }
    });
    button('取消编辑', 'data-cancel', () => { stopCapture(); editor = null; renderEditor(); status('已取消编辑，原绑定保留。'); });
    const pad = doc.createElement('div'); pad.className = 'controls-pad'; pad.dataset.capturePad = '';
    pad.textContent = editor.capturing ? '捕获区：可在此点击鼠标（含侧键）或滚动；面板按钮仍可操作。' : '先移除需要替换的候选，再捕获新绑定。支持普通按键和鼠标侧键；Tab 仅构筑，滚轮仅切枪。';
    box.append(heading, tokens, toolbar, pad); host.append(box);
  }
  function captureEvent(event) {
    if (!editor?.capturing || disposed) return;
    if (event.type === 'keydown' && event.key === 'Escape' && !event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey) {
      event.preventDefault(); event.stopImmediatePropagation(); stopCapture(); renderEditor();
      status('已取消捕获，候选绑定仍保留。'); return;
    }
    if (event.type === 'keydown' && event.key === 'Escape') {
      status('Esc 组合键不能绑定；请单按 Esc 取消捕获。', true); return;
    }
    // Let native buttons/selects keep their usual pointer interaction.
    if (event.type !== 'keydown' && event.target?.closest?.('select,option')) {
      stopCapture(); renderEditor(); status('已取消捕获，可以选择编辑预设。'); return;
    }
    if (event.type !== 'keydown' && event.target?.closest?.('button,input,label')) return;
    if (event.type === 'keydown' && event.repeat) return;
    const token = eventToken(event);
    if (!token) { status('不支持此输入。请使用普通按键或鼠标；Ctrl、Alt、Meta 组合键与菜单保留键不能绑定。', true); return; }
    event.preventDefault(); event.stopImmediatePropagation();
    if (token === 'Mouse2') suppressContext = true;
    if (token === 'Enter') { status('Enter 为菜单确认保留键，不能绑定。', true); return; }
    if (editor.tokens.includes(token)) { status('候选中已有此绑定，请换一个。', true); return; }
    if (editor.action.keyboardOnly && (token.startsWith('Mouse') || token.startsWith('Wheel'))) { status('此全局动作仅支持键盘。', true); return; }
    if (token.startsWith('Wheel') && editor.action.id !== 'next_weapon') { status('滚轮仅可绑定“下一把武器”。', true); return; }
    if (token === 'Tab' && editor.action.id !== 'build') { status('Tab 仅可绑定“查看构筑”。', true); return; }
    editor.tokens.push(token); stopCapture(); renderEditor(); status(`已添加候选${bindingLabel(token)}，点击“保存此动作”后生效。`);
  }
  function preventContext(event) {
    if (suppressContext || (editor?.capturing && !event.target?.closest?.('button,select,input'))) event.preventDefault();
    suppressContext = false;
  }
  function blur() { if (editor?.capturing) { stopCapture(); renderEditor(); status('窗口失焦，已取消捕获。'); } }
  for (const type of ['keydown', 'mousedown', 'wheel']) doc.addEventListener(type, captureEvent, { capture: true, passive: false });
  doc.addEventListener('contextmenu', preventContext, true);
  view?.addEventListener('blur', blur);
  el('[data-profile]').addEventListener('change', event => {
    stopCapture(); editor = null; profile = event.target.value; renderEditor(); renderList(); status(`已切换编辑对象；当前游戏仍使用${input?.profile === 'experimental' ? '实验' : '经典'}键位。`);
  });
  el('[data-reset]').addEventListener('click', () => {
    stopCapture(); const result = store.reset(profile);
    if (result.ok) { editor = null; renderEditor(); renderList(); status('当前预设已恢复默认并保存。'); }
    else { renderEditor(); status(result.error, true); }
  });
  el('[data-done]').addEventListener('click', () => { dispose(); onDone(); });
  const unsubscribe = store.subscribe((changedProfile, bindings) => { if (!disposed) { renderList(); onChange(changedProfile, bindings); } });
  function dispose() {
    if (disposed) return;
    stopCapture(); disposed = true; unsubscribe();
    if (input) { input.capturing = false; input.resetState?.(); }
    for (const type of ['keydown', 'mousedown', 'wheel']) doc.removeEventListener(type, captureEvent, true);
    doc.removeEventListener('contextmenu', preventContext, true); view?.removeEventListener('blur', blur);
  }
  el('[data-profile]').value = profile;
  renderList(); return dispose;
}
