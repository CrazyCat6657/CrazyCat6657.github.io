import {
  preferences, applyReticlePreferences, reticleSVG,
  layoutPresets, ZOOM_MIN, ZOOM_MAX, BTN_SCALE_MIN, BTN_SCALE_MAX,
  resolveZoom, AUTO_ZOOM_COMPACT,
} from '../game/preferences.js';

// ============================================================
//  设置面板
//
//  三条设计约束：
//   ① **每一个控件都必须有消费点**，而且改完要立刻看得见效果（不是"存了但下次才生效"）。
//      本项目的典型事故就是"表填好了、没人读"—— 所以这个面板里没有"待实现"的项。
//   ② 值本身不许在这里再算一遍。默认值、范围、"自动档等于多少"全部来自 preferences.js，
//      否则面板显示 1.7、实际生效 1.49 这类分叉迟早出现。
//   ③ 主观项（钉不钉中心、放大多少）必须能**回到自动**。所以钉中心给了"自动/总是/从不"
//      三档，放大倍率给了"自动"档，而不是只给一个滑杆逼玩家自己找基准。
// ============================================================

/** 一行滑杆：label + range + output。output 的文字由 caller 决定怎么显示（可能带"自动"）。 */
const slider = (id, label, min, max, step) =>
  `<label>${label} <input id="pref-${id}" type="range" min="${min}" max="${max}" step="${step}"><output></output></label>`;

export function mountPreferences(container, onChange, onDone, hooks = {}) {
  if(typeof hooks==='function')hooks={onControls:hooks};
  const p0 = preferences.get();
  const compact = document.body.classList.contains('tc-compact');
  const zoomAuto = resolveZoom({ zoom: 0 }, compact);
  const pct = v => `${Math.round(v * 100)}%`;
  const num1 = v => (Math.round(v * 10) / 10).toFixed(1);
  // 吸附范围只表达"近/中/远"，不把内部距离数值写给玩家（滑杆仍是 3.5/4.5/5.5）。
  const magnetLabel = v => ({ 3.5: '近', 4.5: '中', 5.5: '远' })[v] || String(v);

  container.innerHTML = `<div data-preferences>
    <h4 class="pref-group">画面</h4>
    <label>画面放大倍率
      <select id="pref-zoomMode">
        <option value="auto">自动</option>
        <option value="manual">手动</option>
      </select>
    </label>
    <label>手动倍率（${ZOOM_MIN}–${ZOOM_MAX}）
      <input id="pref-zoom" type="range" min="${ZOOM_MIN}" max="${ZOOM_MAX}" step="0.1"><output></output>
    </label>
    <p class="pref-note" id="pref-zoom-note"></p>
    <label>角色位置
      <select id="pref-pinCenter">
        <option value="auto">自动（手机钉在正中、平板保留前视）</option>
        <option value="on">一律钉在屏幕正中</option>
        <option value="off">一律朝瞄准方向前视</option>
      </select>
    </label>
    <p class="pref-note">钉在正中时镜头只跟人不跟准星，瞄准不会反过来推动画面；前视会朝你要打的方向多让出一段。</p>
    ${slider('minimapZoom', '小地图放大（1 = 画整层，越大只显示越近的一片）', 0, 3, 0.5)}
    <p class="pref-note" id="pref-mm-note"></p>

    <h4 class="pref-group">手感</h4>
    <label><input id="pref-stickFollow" type="checkbox"> 摇杆跟随手指（按下处就是圆心）</label>
    <p class="pref-note">关掉则两根摇杆固定停在屏幕左右下角。</p>
    ${slider('btnScale', '触摸按键大小', BTN_SCALE_MIN, BTN_SCALE_MAX, 0.05)}

    <h4 class="pref-group">音量</h4>
    <label><input id="pref-musicOn" type="checkbox"> 音乐</label>
    ${slider('volumeMusic', '音乐音量', 0, 1, 0.02)}
    <label><input id="pref-sfxOn" type="checkbox"> 音效</label>
    ${slider('volumeSfx', '音效音量', 0, 1, 0.02)}

    <h4 class="pref-group">按键布局</h4>
    <p class="pref-note">拖动按钮调整位置，点击完成保存。手机和平板分别保存布局。</p>
    <div class="row">
      <button class="btn small" id="pref-editLayout">编辑按键布局</button>
      <button class="btn small" id="pref-resetLayout">恢复默认键位</button>
    </div>
    <div class="pref-presets">
      <select id="pref-presetList" aria-label="键位模板"></select>
      <button class="btn small" id="pref-presetSave">存为新模板</button>
      <button class="btn small" id="pref-presetLoad">载入</button>
      <button class="btn small" id="pref-presetDel">删除</button>
    </div>

    <h4 class="pref-group">准星</h4>
    <div class="reticle-preview" aria-label="准星实时预览"><div class="reticle-art">${reticleSVG()}</div></div>
    ${slider('size', '尺寸（12–64 像素）', 12, 64, 1)}
    ${slider('lineWidth', '线宽（0.5–4）', 0.5, 4, 0.1)}
    ${slider('opacity', '透明度（20–100%）', 0.2, 1, 0.05)}
    <label>颜色 <input id="pref-color" type="color"> HEX <input id="pref-hex" type="text" maxlength="7" spellcheck="false" aria-label="HEX 颜色"></label>
    <div class="pref-rgb">${['R', 'G', 'B'].map(c => `<label>${c} <input id="pref-${c}" type="number" min="0" max="255" step="1" aria-label="${c} 颜色"></label>`).join('')}</div>
    <label><input id="pref-outline" type="checkbox"> 对比描边（深色准星使用白描边）</label>
    <label><input id="pref-center" type="checkbox"> 中心点</label>

    <h4 class="pref-group">拾取</h4>
    <label><input id="pref-autoDetachOnReplace" type="checkbox"> 换枪或普通丢枪时卸下全部配件，旧枪与配件分别掉地上</label>
    ${slider('coinMagnetRadius', '金币吸附范围（近 → 远）', 3.5, 5.5, 1)}

    <p role="status" aria-live="polite" id="pref-status">调整后即时保存，并立刻作用到画面上。</p>
    ${hooks.onControls?'<button class="btn" id="pref-controls">键位设置</button>':''}
    <div class="row"><button class="btn" id="pref-reset">重置全部默认</button><button class="btn primary" id="pref-done">完成</button></div>
  </div>`;

  const el = id => container.querySelector(`#pref-${id}`);
  const preview = container.querySelector('.reticle-art');
  const out = id => el(id).nextElementSibling;
  // 说明文字的写入必须**容错**：它是纯提示，一旦某个 id 写错，
  // 直接用 el(x).textContent = 会把整个面板的挂载过程炸掉 ——
  // 玩家看到的是"点设置没反应"，而不是"少了一行说明"。面板里的结构性错误
  // 由探针 P9b（逐个 id 点名）负责抓，不靠运行期崩。
  const setText = (id, text) => { const n = el(id); if (n) n.textContent = text; };
  let p = p0;

  function sync() {
    for (const key of ['size', 'lineWidth', 'color', 'coinMagnetRadius', 'btnScale', 'volumeMusic', 'volumeSfx']) {
      el(key).value = p[key];
      const o = out(key);
      if (o?.tagName === 'OUTPUT') o.textContent = key === 'btnScale' ? `${num1(p[key])}x` : (key.startsWith('volume') ? pct(p[key]) : key === 'coinMagnetRadius' ? magnetLabel(p[key]) : p[key]);
    }
    el('opacity').value=p.opacity;out('opacity').textContent = pct(p.opacity);
    // 放大倍率：0 存的是"自动"，但滑杆必须停在实际生效的那个值上 ——
    // 否则玩家会看到滑杆指着 1.2 而画面是 1.7，然后怀疑设置没生效。
    el('zoomMode').value = p.zoom > 0 ? 'manual' : 'auto';
    el('zoom').value = resolveZoom(p, compact);
    el('zoom').disabled = !(p.zoom > 0);
    out('zoom').textContent = `${num1(resolveZoom(p, compact))}x`;
    setText('zoom-note', p.zoom > 0
      ? `当前手动 ${num1(p.zoom)}x：手机与平板都用这个倍率。切回「自动」手机恢复 ${AUTO_ZOOM_COMPACT}x、平板恢复 1.0x。`
      : `自动：手机 ${AUTO_ZOOM_COMPACT}x、平板 1.0x。切到「手动」可以两台设备统一用你选的值。`);
    el('pinCenter').value = p.pinCenter;
    el('minimapZoom').value = resolveMinimapZoomDisplay(p);
    setText('mm-note', p.minimapZoom > 0
      ? `手动 ${num1(p.minimapZoom)}x（手机上放大到约 ${num1(p.minimapZoom)} 倍房间尺寸）。`
      : '自动：手机上放大 2x（房间大一圈，只显示当前房间附近），平板画整层。按 M 或用手指点一下小地图看全图。');
    el('stickFollow').checked = p.stickFollow !== false;
    el('musicOn').checked = p.musicOn !== false;
    el('sfxOn').checked = p.sfxOn !== false;
    el('hex').value = p.color;
    p.color.match(/\w\w/g).forEach((value, i) => { el(['R', 'G', 'B'][i]).value = parseInt(value, 16); });
    for (const key of ['outline', 'center', 'autoDetachOnReplace']) el(key).checked = p[key];
    applyReticlePreferences(preview, p);
  }
  // 小地图的"自动档"在手机上是 2；面板里显示这个数，玩家才知道自动到底是多少
  function resolveMinimapZoomDisplay(v) {
    const z = Number(v.minimapZoom);
    if (Number.isFinite(z) && z > 0) return z;
    return document.body.classList.contains('tc-compact') ? 2 : 1;
  }

  function publish(result) {
    p = result.values; sync(); onChange(p);
    el('status').textContent = result.ok ? '已保存 · 立刻生效 · 刷新后仍保留' : result.error;
    el('status').classList.toggle('pref-error', !result.ok);
  }
  const boolKeys = ['outline', 'center', 'autoDetachOnReplace', 'stickFollow', 'musicOn', 'sfxOn'];
  const numKeys = ['size', 'lineWidth', 'opacity', 'color', 'coinMagnetRadius', 'btnScale', 'volumeMusic', 'volumeSfx'];
  for (const key of [...boolKeys, ...numKeys, 'minimapZoom']) {
    el(key)?.addEventListener('input', () => publish(preferences.update({ [key]: boolKeys.includes(key) ? el(key).checked : key==='color'?el(key).value:Number(el(key).value) })));
  }
  // 放大倍率：滑杆只写数值；"自动"是另一个控件（模式下拉），两者分开就不会互相覆盖
  el('zoom').addEventListener('input', () => publish(preferences.update({ zoom: Number(el('zoom').value) })));
  el('zoomMode').addEventListener('change', () => publish(preferences.update({ zoom: el('zoomMode').value === 'auto' ? 0 : Math.max(ZOOM_MIN,resolveZoom(p,compact)) })));
  el('pinCenter').addEventListener('change', () => publish(preferences.update({ pinCenter: el('pinCenter').value })));
  el('hex').addEventListener('change', () => publish(preferences.update({ color: el('hex').value })));
  for (const key of ['R', 'G', 'B']) el(key).addEventListener('change', () => {
    const rgb = ['R', 'G', 'B'].map(c => el(c).value.trim() === '' ? NaN : Number(el(c).value));
    if (rgb.some(v => !Number.isInteger(v) || v < 0 || v > 255)) { publish({ ok: false, values: p, error: 'RGB 必须是 0–255 的整数。' }); return; }
    publish(preferences.update({ color: '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join('') }));
  });

  // ---------- 按键布局 ----------
  el('editLayout').addEventListener('click', () => {
    if (typeof hooks.onEditLayout === 'function' && hooks.onEditLayout()) return;
    el('status').textContent = '当前设备没有触摸层，无法编辑按键布局。';
    el('status').classList.add('pref-error');
  });
  el('resetLayout').addEventListener('click', () => publish(preferences.update({ layoutCustom: null })));

  function refreshPresets() {
    const list = layoutPresets.list();
    const sel = el('presetList');
    const keep = sel.value;
    sel.replaceChildren();
    for(const item of list.length?list:[{name:''}]){const option=document.createElement('option');option.value=item.name;option.textContent=item.name||'（添加模板后可选择）';sel.append(option);}
    if (list.some(x => x.name === keep)) sel.value = keep;
  }
  function presetMsg(r, okText) {
    const s = el('status');
    s.textContent = r.ok ? okText : r.error;
    s.classList.toggle('pref-error', !r.ok);
    refreshPresets();
  }
  el('presetSave').addEventListener('click', () => {
    const cur = preferences.get().layoutCustom;
    if (!cur) { presetMsg({ ok: false, error: '当前用的是默认键位，先在编辑模式里拖动按键再保存模板。' }); return; }
    const name = (window.prompt('模板名称（最多 20 字）') || '').trim();
    if (!name) return;
    presetMsg(layoutPresets.add(name, cur), `模板「${name}」已保存。`);
  });
  el('presetLoad').addEventListener('click', () => {
    const name = el('presetList').value;
    const found = layoutPresets.list().find(x => x.name === name);
    if (!found) { presetMsg({ ok: false, error: '请先选一个模板。' }); return; }
    publish(preferences.update({ layoutCustom: found.layout }));
  });
  el('presetDel').addEventListener('click', () => {
    const name = el('presetList').value;
    if (!name) { presetMsg({ ok: false, error: '请先选一个模板。' }); return; }
    presetMsg(layoutPresets.remove(name), `模板「${name}」已删除。`);
  });

  el('reset').addEventListener('click', () => { refreshPresets(); publish(preferences.reset()); });
  el('controls')?.addEventListener('click',hooks.onControls);
  el('done').addEventListener('click', onDone);
  refreshPresets();
  sync();
  onChange(p);
}
