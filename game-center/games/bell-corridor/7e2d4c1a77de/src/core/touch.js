// ============================================================
//  触摸输入层 —— 双摇杆 + 动作按钮
//
//  ★ 核心设计约束（改这个文件前必须先读这段）★
//
//  本层**不新增任何游戏逻辑接口**。它只做一件事：
//  把触摸状态翻译成 Input 的"合成键鼠状态"。
//
//    左摇杆 → input.analogMove        （moveVec() 的模拟方向分支）
//    右摇杆 → input.analogAim         （Game.solveAim() 的摇杆分支）
//             + input.mouse.left       （按住 = 持续开火）
//    按钮   → input.pressed[k]        （一次性边沿，keydown 的等价物）
//
//  于是 player.js / game.js / hud.js 以及全部键盘断言都不需要知道触摸的存在，
//  也不可能因为触摸而改变行为。这是本项目"565 条断言不能变成假绿"的底线。
//
//  注入时机同样是硬约束：**必须在每帧开头、且在 endFrame() 之后**。
//  pressed 边沿会被 endFrame() 清空，若在帧中途（如 touchstart 回调里）写入，
//  边界帧会被清掉 → 表现为"偶尔点一下没反应"。所以写状态只在 beforeFrame() 里做，
//  事件回调只记录状态。
// ============================================================

import { buildTouchDom, TC_LAYOUT, resolveLayout, applyButtonLayout, resolveCameraFov } from '../ui/touch_controls.js';
import { DEFAULT_PREFERENCES, resolveLayoutOverride, resolvePinCenter, resolveZoom } from '../game/preferences.js';

const DEADZONE = 0.22;        // 摇杆死区（相对半径）
const DOUBLE_TAP_MS = 300;    // 左区双击 = 翻滚
/** 编辑模式下按键/摇杆距屏幕边缘的净空（像素），保证拖完不会有一半在屏外。 */
const EDIT_EDGE = 6;
/** 键位坐标只留一位小数：百分比精度到 0.1 已经远超一个像素，多存没有意义。 */
const round1 = (v) => Math.round(v * 10) / 10;

// 是否需要启用触摸层。
// 判定用能力查询而不是 UA：桌面浏览器（含全部无头探针）hover:hover 且 maxTouchPoints=0，
// 因此默认永远不会进入触摸路径。URL 参数用于人工验证与截图：?touch=1 / ?touch=0
//
// opts.native：由调用方传入 isNative()。**原生 Android 外壳里一律启用**——
// 平板上没有摇杆就等于完全无法操作，这个失败模式（整个游戏动不了）比
// "多显示一层控件"严重得多，不能把可玩性押在媒体查询上。
// 显式的 ?touch=0 仍然优先，保留人工排查手段。
export function shouldUseTouch(search = location.search, opts = {}) {
  const q = new URLSearchParams(search).get('touch');
  if (q === '1' || q === 'true') return true;
  if (q === '0' || q === 'false') return false;
  if (opts.native) return true;
  const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  const noHover = window.matchMedia && window.matchMedia('(hover: none)').matches;
  return (coarse && noHover) || (navigator.maxTouchPoints > 0 && noHover);
}

export class TouchLayer {
  constructor(game, opts = {}) {
    this.game = game;
    this.input = opts.input || game.input;
    this.onPause = opts.onPause || (() => {});
    this.onBuild = opts.onBuild || (() => {});
    this.active = true;

    this.dom = buildTouchDom();
    // 建不出来（没有 #ui）说明环境不对，直接放弃而不是半残运行
    if (!this.dom) { this.active = false; return; }
    document.body.classList.add('touch');

    // 两根摇杆各自的持有手指。用 pointerId 区分，天然支持多指同时操作。
    // 每根摇杆：node = 底盘 DOM，knob = 摇杆头 DOM，home = 固定圆心（像素）。
    // ⚠️ 不要把这一层与 dom.sticks[*] 混起来。曾经写成 `st.el.el.knob`，
    // 结果是"输入逻辑全对，但圆盘不显示、摇杆头不动"——属于本项目反复出现的
    // "只验逻辑对不对、没验看得见的对不对"盲区，由 probe_touch 的 I3 抓出。
    //
    // cx/cy 是**输入圆心**，同时就是圆盘的视觉中心 —— 两者必须是同一个数（见 _layoutSticks）。
    this.sticks = {
      l: { id: null, x: 0, y: 0, cx: 0, cy: 0, node: null, knob: null, home: { x: 0, y: 0 } },
      r: { id: null, x: 0, y: 0, cx: 0, cy: 0, node: null, knob: null, home: { x: 0, y: 0 } },
    };
    for (const side of ['l', 'r']) {
      const d = this.dom.sticks[side];
      this.sticks[side].node = d.el;
      this.sticks[side].knob = d.knob;
    }

    this.aimDir = { x: 0, z: 1 };   // 瞄准方向常驻，松手不清零
    this.pending = [];              // 本帧要注入的边沿
    this.held = [];                 // 上一帧注入过、本帧要释放的键
    this.pendingWheel = 0;
    this._lastLeftTap = -1e9;
    this._hotEl = null;

    // ---- 偏好驱动的显示 / 手感状态（全部由 applyPreferences 写入，唯一来源）----
    // prefs 只保存与触摸层直接相关的那几个字段，避免这一层反向依赖整个偏好表。
    this.prefs = { ...DEFAULT_PREFERENCES, ...(opts.prefs || {}) };
    this.stickFollow = this.prefs.stickFollow !== false;   // 默认跟随手指
    this.pinCenter = false;                                // 由 _layoutSticks 按当前档位算
    this.zoom = 0;
    // 键位编辑模式（见 beginEdit/endEdit）。默认 false，PC / 探针路径完全不碰。
    this.editMode = false;
    this._drag = null;
    this._editMoved = false;

    // 触摸模式下瞄准完全由右摇杆接管（见 Game.solveAim 的守卫分支）。
    // 常驻非空是关键：如果只在按住时存在，松手瞬间 solveAim 会退回鼠标路径，
    // 而鼠标坐标仍是 (0,0) → 准星和枪口会突然指向屏幕左上角。
    this.input.analogAim = { x: 0, z: 1 };

    this._layoutSticks();
    this._bind();
    this._rewriteHelpText();
  }

  // ---------- 几何 ----------
  // 摇杆几何**只在这里算，而且全用像素**。
  // 圆盘的 width/height/left/top 与输入用的 cx/cy/radius 出自同一次计算，
  // 所以"画出来的圆盘中心"和"算方向用的圆心"不可能不一致。
  //
  // ★ 真机事故（2026-10-16）★
  // 旧版是"圆心跟手指跑"，但为了让整个圆盘留在屏内，把圆心向屏内钳制了
  // `pad = radius + 8`。摇杆半径 14vmin 在小米平板 7 上约 150px，于是 pad ≈ 158px；
  // 而拇指自然落在屏幕边缘附近（x≈100），圆心被强行推到 158 —— 圆盘偏离手指约 58px，
  // 越靠边偏得越多。玩家原话："两个转盘都是歪的，并不能精确反馈到我手放的位置。"
  // 教训：**视觉位置与输入位置只能有一个来源**；一旦分成 CSS 的 vmin 与 JS 的 px 两套，
  // 或者中间夹了一层"为了好看"的钳制，两者就会分叉，而分叉的表现就是"手感不对"。
  _layoutSticks() {
    const w = window.innerWidth, h = window.innerHeight;
    const vmin = Math.min(w, h) / 100;
    // 本视口该用哪套布局（平板基准 / 手机紧凑）。阈值唯一来源 = TC_LAYOUT.compact。
    // 先问一次"是紧凑档吗"，因为玩家自定义键位按两档分开存（手机与平板空间差太多）。
    const compact = resolveLayout(w, h).compact;
    // 编辑中的草稿优先于已保存的键位：这样"编辑 → 转屏 → 再编辑"不会把草稿丢掉，
    // 也不会因为 resize 把玩家刚拖好的位置弹回去。
    const over = this._draft ? this._draft.data : resolveLayoutOverride(this.prefs, compact);
    const L = this.layout = resolveLayout(w, h, { btnScale: this.prefs.btnScale, layout: over });
    // body 上的 tc-compact 是紧凑档 CSS 的**唯一**开关；
    // 用类而不是媒体查询，是为了不让同一个阈值在 CSS 里再写一遍（两处数字必然漂）。
    document.body.classList.toggle('tc-compact', L.compact);
    // 相机与手感的两项派生值也在这里统一算：它们都依赖"是不是紧凑档"。
    this.pinCenter = resolvePinCenter(this.prefs, L.compact);
    this.zoom = resolveZoom(this.prefs, L.compact);
    const dia = L.stickDia * vmin;
    this.radius = dia / 2;                                 // 摇杆最大位移（像素）
    this.cx = w * 0.5;                                     // 左右区划分线

    for (const side of ['l', 'r']) {
      const s = this.sticks[side];
      if (!s.node) continue;
      s.node.style.width = s.node.style.height = dia + 'px';
      s.node.style.borderWidth = Math.max(1, 0.28 * vmin) + 'px';
      s.knob.style.width = s.knob.style.height = L.knobDia * vmin + 'px';
      s.knob.style.margin = `${-L.knobDia * vmin / 2}px 0 0 ${-L.knobDia * vmin / 2}px`;
      s.knob.style.borderWidth = Math.max(1, 0.25 * vmin) + 'px';
      s.knob.style.boxShadow = `0 0 ${2 * vmin}px rgba(95,224,255,.34)`;
      s.home.x = w * L.stick[side].x / 100;
      s.home.y = h * L.stick[side].y / 100;
      // 手指按着的时候不改圆心，等松手再归位；否则旋转屏幕会让圆盘从手指下跳走
      if (s.id === null) this._drawHome(side);
    }
    // 按钮的位置与尺寸也跟着视口走（手机横屏要整体收一档并让开右下角）
    if (this.dom && this.dom.buttons) applyButtonLayout(this.dom.buttons, L);
    this._applyCameraFov(w, h);
  }

  // 手机横屏把相机竖直 fov 收紧（换算见 touch_controls.resolveCameraFov）。
  // 放在触摸层而不是 Game.onResize 里，是为了让**桌面路径完全不碰相机** ——
  // 桌面根本不会创建 TouchLayer，所以既有渲染与截图断言逐字节不变。
  _applyCameraFov(w, h) {
    const cam = this.game && this.game.camera;
    if (!cam) return;
    const fov = resolveCameraFov(w, h, this.prefs.zoom);
    if (cam.fov === fov) return;
    cam.fov = fov;
    cam.updateProjectionMatrix();
  }

  /**
   * 把一份偏好快照套到触摸层上。**这是偏好 → 触摸层唯一的入口**，
   * 启动（main.js）与设置面板改动（hud.applyDisplayPreferences）都走它。
   * 不在这里读 localStorage：读一次、传一份，避免"面板显示的值"与"生效的值"分叉。
   */
  applyPreferences(p) {
    if (!p) return;
    this.prefs = { ...this.prefs, ...p };
    this.stickFollow = this.prefs.stickFollow !== false;
    // 正在编辑键位时不重摆 —— 否则面板里的改动会把玩家刚拖好的位置当场冲掉
    if (!this.editMode) this._layoutSticks();
  }

  // 把圆心设回固定位置，并把圆盘画在那里。cx/cy 与视觉位置在这里同时被赋值 —— 唯一来源。
  _drawHome(side) {
    const s = this.sticks[side];
    s.cx = s.home.x; s.cy = s.home.y;
    s.node.style.transform = 'translate(-50%,-50%)';
    s.node.style.left = s.cx + 'px';
    s.node.style.top = s.cy + 'px';
    s.knob.style.transform = 'translate(0px,0px)';
  }

  // ---------- 事件绑定 ----------
  _bind() {
    this._onDown = (e) => this.onDown(e);
    this._onMove = (e) => this.onMove(e);
    this._onUp = (e) => this.onUp(e);
    window.addEventListener('pointerdown', this._onDown, { passive: false });
    window.addEventListener('pointermove', this._onMove, { passive: false });
    window.addEventListener('pointerup', this._onUp);
    window.addEventListener('pointercancel', this._onUp);
    window.addEventListener('resize', () => this._layoutSticks());
    window.addEventListener('orientationchange', () => this._layoutSticks());
    // 切后台：把摇杆全部松开，避免回来时"手指还按着"
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.releaseAll();
    });
    for (const b of this.dom.buttons) {
      const act = b.dataset.act;
      b.addEventListener('pointerdown', (e) => {
        // 编辑模式：同一个按下的动作含义从"按键"变成"开始拖动"。
        // 放在这里而不是另绑一套监听，是为了只有一个 pointerdown 入口 ——
        // 否则两套监听会同时响应，拖的时候还会顺手打出一发子弹。
        if (this.editMode) { this._beginDrag(act, 'button', b, e); return; }
        e.preventDefault(); e.stopPropagation();
        b.classList.add('press');
        this.hit(act);
      });
      const off = () => b.classList.remove('press');
      b.addEventListener('pointerup', off);
      b.addEventListener('pointercancel', off);
      b.addEventListener('pointerleave', off);
      b.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    for (const side of ['l', 'r']) {
      const node = this.sticks[side].node;
      node.addEventListener('pointerdown', (e) => {
        if (this.editMode) this._beginDrag(side, 'stick', node, e);
      });
    }
    const bar = this.dom.editbar;
    if (bar) {
      bar.querySelector('#tc-edit-done')?.addEventListener('click', () => this.onEditDone?.('done'));
      bar.querySelector('#tc-edit-cancel')?.addEventListener('click', () => this.onEditDone?.('cancel'));
      bar.querySelector('#tc-edit-reset')?.addEventListener('click', () => this.onEditDone?.('reset'));
    }
  }

  // ---------- 键位编辑 ----------
  // 设计取舍：**直接拖真按钮**，不做"缩略预览图里拖小圆点"。
  // 预览图要按视口百分比缩放，而手机与平板宽高比差 2.2 vs 1.5，
  // 预览的比例和真机永远对不上 —— 那就会变成"看着对、上手歪"的老问题。
  // 代价是编辑时必须让游戏暂停但**触摸层保持可见**，所以 editMode 会强制 tc-play（见 beforeFrame）。
  beginEdit() {
    if (this.editMode) return false;
    this.editMode = true;
    this.releaseAll();
    // 草稿取自**当前生效值**（含紧凑档覆盖与既有自定义），所以第一次进编辑模式看到的就是现在的摆放。
    const data = { buttons: {}, sticks: {} };
    for (const b of this.layout.buttons) data.buttons[b.act] = { x: round1(b.x), y: round1(b.y) };
    for (const side of ['l', 'r']) data.sticks[side] = { x: round1(this.layout.stick[side].x), y: round1(this.layout.stick[side].y) };
    this._draft = { slot: this.layout.compact ? 'compact' : 'base', data };
    this._editMoved = false;
    document.body.classList.add('tc-edit');
    return true;
  }

  /** 提交：返回可写进偏好的 layoutCustom（调用方负责持久化）。 */
  commitEdit() {
    if (!this.editMode || !this._draft) return null;
    const cur = { ...(this.prefs.layoutCustom || {}) };
    cur[this._draft.slot] = this._draft.data;
    return cur;
  }

  /** 「恢复默认」：把草稿换回内置摆放（不含玩家的自定义），但留在编辑模式里让玩家确认。 */
  resetEditDraft() {
    if (!this.editMode || !this._draft) return false;
    const L = resolveLayout(window.innerWidth, window.innerHeight, { btnScale: this.prefs.btnScale });
    const data = { buttons: {}, sticks: {} };
    for (const b of L.buttons) data.buttons[b.act] = { x: round1(b.x), y: round1(b.y) };
    for (const side of ['l', 'r']) data.sticks[side] = { x: round1(L.stick[side].x), y: round1(L.stick[side].y) };
    this._draft.data = data;
    this._layoutSticks();
    return true;
  }

  endEdit() {
    if (!this.editMode) return;
    this._draft = null;
    this._cancelDrag();
    this.editMode = false;
    document.body.classList.remove('tc-edit');
    this._layoutSticks();
  }

  _beginDrag(key, kind, node, e) {
    e.preventDefault(); e.stopPropagation();
    const r = node.getBoundingClientRect();
    this._drag = { key, kind, node, offX: e.clientX - (r.left + r.width / 2), offY: e.clientY - (r.top + r.height / 2) };
    node.classList.add('drag');
    window.addEventListener('pointermove', this._onDragMove, { passive: false });
    window.addEventListener('pointerup', this._onDragUp);
    window.addEventListener('pointercancel', this._onDragUp);
  }

  // 与事件系统配对的两个回调必须是**稳定引用**（instance field 箭头函数），
  // 否则 removeEventListener 拿不到同一个函数对象，监听会越挂越多。
  _onDragMove = (e) => {
    const d = this._drag;
    if (!d || !this._draft) return;
    e.preventDefault();
    const w = window.innerWidth || 1, h = window.innerHeight || 1;
    // 用 offset 尺寸（含缩放后的按键直径）算净空 —— 保证拖完整个控件都在屏内，
    // 不会出现"按钮有一半在屏幕外、怎么点都没反应"。
    const hw = (d.node.offsetWidth / 2 + EDIT_EDGE) / w * 100;
    const hh = (d.node.offsetHeight / 2 + EDIT_EDGE) / h * 100;
    const x = Math.min(100 - hw, Math.max(hw, (e.clientX - d.offX) / w * 100));
    const y = Math.min(100 - hh, Math.max(hh, (e.clientY - d.offY) / h * 100));
    const px = round1(x), py = round1(y);
    if (d.kind === 'stick') {
      this._draft.data.sticks[d.key] = { x: px, y: py };
      this.sticks[d.key].home.x = w * px / 100;
      this.sticks[d.key].home.y = h * py / 100;
      this._drawHome(d.key);
    } else {
      this._draft.data.buttons[d.key] = { x: px, y: py };
      const spec = this.layout.buttons.find((b) => b.act === d.key);
      if (spec) { spec.x = px; spec.y = py; }
      applyButtonLayout(this.dom.buttons, this.layout);
    }
    this._editMoved = true;
  };

  _cancelDrag() {
    if (this._drag) this._drag.node.classList.remove('drag');
    this._drag = null;
    window.removeEventListener('pointermove', this._onDragMove);
    window.removeEventListener('pointerup', this._onDragUp);
    window.removeEventListener('pointercancel', this._onDragUp);
  }

  _onDragUp = () => this._cancelDrag();

  // 是否"正在游玩"：与 Game.loop 的 playing 判据保持一致。
  // 不满足时不注入任何输入 —— 否则暂停期间按住的方向会在恢复的第一帧生效。
  _interactive() {
    const g = this.game;
    if (!g || g.state !== 'play') return false;
    if(g._textReviewFrozen||g._stageBossPending||g.input?.capturing)return false;
    if (g.paused || g.revivalPending || g.buildOpen) return false;
    if (g.panelOpen && g.panelOpen()) return false;
    if (g.storageFrozen && g.storageFrozen()) return false;
    return true;
  }

  // ---------- 触摸事件 ----------
  onDown(e) {
    if (e.pointerType === 'mouse') return;            // 桌面鼠标不进触摸层
    // 只有"落在摇杆捕获层上"的触点才算摇杆。
    // 按钮、#btn-build、面板、全屏界面都在捕获层之上，触点目标是它们 → 交给 DOM 处理。
    // 这比列举一堆选择器排除更可靠（以后新增 UI 也不需要回来改这里）。
    if (e.target !== this.dom.zone) return;
    if (this.editMode) return;                        // 编辑模式：摇杆由拖动接管，不注入输入
    if (!this._interactive()) return;
    const side = e.clientX < this.cx ? 'l' : 'r';
    const st = this.sticks[side];
    if (st.id !== null) return;                       // 该侧已有手指，忽略第二根
    st.id = e.pointerId;
    if (this.stickFollow) {
      // 跟随手（默认）：圆心＝触点，**并且不做任何钳制**。
      // 钳制（旧版 pad = radius + 8）会让圆盘离开手指，那正是第一轮真机"圆盘是歪的"的根因；
      // 宁可靠边时圆盘被屏幕裁掉一角，也不能让中心与手指不一致。
      st.cx = e.clientX; st.cy = e.clientY;
      st.node.style.transform = 'translate(-50%,-50%)';
      st.node.style.left = st.cx + 'px';
      st.node.style.top = st.cy + 'px';
    } else {
      this._drawHome(side);                           // 固定模式：圆心永远在 home
    }
    st.x = 0; st.y = 0;
    st.knob.style.transform = 'translate(0px,0px)';
    st.node.classList.add('on');
    if (side === 'l') this._maybeDoubleTap();
    e.preventDefault();
  }

  onMove(e) {
    const st = this.sticks.l.id === e.pointerId ? this.sticks.l
      : (this.sticks.r.id === e.pointerId ? this.sticks.r : null);
    if (!st) return;
    let dx = e.clientX - st.cx, dy = e.clientY - st.cy;
    const d = Math.hypot(dx, dy);
    if (d > this.radius) { const k = this.radius / d; dx *= k; dy *= k; }
    st.x = dx / this.radius; st.y = dy / this.radius;
    st.knob.style.transform = `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px)`;
    e.preventDefault();
  }

  onUp(e) {
    if (this.sticks.l.id === e.pointerId) this._release('l');
    else if (this.sticks.r.id === e.pointerId) this._release('r');
  }

  _release(side) {
    const s = this.sticks[side];
    s.id = null; s.x = 0; s.y = 0;
    s.node.classList.remove('on');
    // 摇杆头归位、圆盘回到固定圆心（浮动模式下这就是"归位"，固定模式下位置本来就没动过）
    this._drawHome(side);
  }

  releaseAll() {
    if (this.sticks.l.id !== null) this._release('l');
    if (this.sticks.r.id !== null) this._release('r');
  }

  _maybeDoubleTap() {
    const t = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    if (t - this._lastLeftTap < DOUBLE_TAP_MS) { this.hit('dash'); this._lastLeftTap = -1e9; }
    else this._lastLeftTap = t;
  }

  // ---------- 按钮 ----------
  hit(act) {
    if (!this._interactive() && act !== 'pause') return;
    switch (act) {
      case 'dash': this.pending.push('dodge'); break;
      case 'reload': this.pending.push('reload'); break;
      case 'active': this.pending.push('active'); break;
      case 'skill': this.pending.push(this.input.profile==='experimental'?'skill_3':'hero_skill'); break;
      case 'skill1': this.pending.push('skill_1'); break;
      case 'skill2': this.pending.push('skill_2'); break;
      case 'ultimate': this.pending.push('ultimate'); break;
      case 'sprint': this.sprintOn=!this.sprintOn; break;
      case 'interact': this.pending.push('interact'); break;
      case 'swap': this.pending.push('next_weapon'); break;
      case 'pause': this.onPause(); break;
      case 'build': this.onBuild(); break;
      default: break;
    }
  }

  // ---------- 每帧注入（由 Game.loop 在 setBlocked 之后调用） ----------
  beforeFrame() {
    const inp = this.input;
    if (!this.active || !inp) return;
    if(this._inputEpoch!==inp.cancelEpoch){this.releaseAll();this.sprintOn=false;this._inputEpoch=inp.cancelEpoch;}
    inp.touchActions={down:new Set(),hit:new Set()};
    inp.analogAim ||= {...this.aimDir};
    const multi=inp.profile==='experimental'&&!!this.game.experiment;
    const fold=multi&&this.game.experiment.scheme==='foldshadow';
    const labels={skill:fold?'折返':multi?'钟鸣':'职业',active:'道具',interact:'交互',skill1:fold?'掠影':'踏进',skill2:fold?'留影':this.game.experiment?.scheme==='mixed'?'护幕':'震慑',ultimate:fold?'折镜':'超载',sprint:'疾跑'};
    for(const b of this.dom.buttons){if(['skill1','skill2','ultimate','sprint'].includes(b.dataset.act))b.hidden=!multi;if(labels[b.dataset.act])b.textContent=labels[b.dataset.act];}

    // 先释放上一帧注入的虚拟键：保证 keys 不会残留（残留会造成持续触发）
    for (const k of this.held) inp.keys[k] = false;
    this.held.length = 0;

    const live = this._interactive();
    // 键位编辑期间游戏是暂停的（live=false），但控件必须看得见、抓得住 ——
    // 显示判据放在这一处，CSS 里不再写第二条显示规则（否则两个来源必然漂）。
    const show = live || this.editMode;
    const body = document.body;
    if (body.classList.contains('tc-play') !== show) body.classList.toggle('tc-play', show);

    if (!live) {
      this.releaseAll();this.sprintOn=false;
      // 非游玩状态 update() 不跑 → endFrame() 也不会跑。
      // 必须自己清掉"按住开火"，否则暂停回来第一帧会凭空开火。
      this.pending.length = 0;
      this.pendingWheel = 0;
      if (inp.mouse.left) inp.mouse.left = false;
      if (inp.analogMove) inp.analogMove = null;
      return;
    }

    // ---- 左摇杆 → 移动 ----
    const l = this.sticks.l;
    const lm = Math.hypot(l.x, l.y);
    if (l.id !== null && lm > DEADZONE) inp.analogMove = { x: l.x, z: l.y };
    else inp.analogMove = null;

    // ---- 右摇杆 → 瞄准（方向常驻）+ 按住开火 ----
    const r = this.sticks.r;
    const rm = Math.hypot(r.x, r.y);
    if (r.id !== null && rm > DEADZONE) {
      const k = 1 / rm;
      this.aimDir = { x: r.x * k, z: r.y * k };
      inp.touchActions.down.add('fire');
    } else {
      inp.mouse.left = false;
    }
    inp.analogAim.x = this.aimDir.x;
    inp.analogAim.z = this.aimDir.z;

    // ---- 一次性边沿 ----
    for (const action of this.pending) inp.touchActions.hit.add(action);
    if(multi&&this.sprintOn)inp.touchActions.down.add('sprint');
    this.pending.length = 0;
    if (this.pendingWheel) { inp.wheel += this.pendingWheel; this.pendingWheel = 0; }

    // 把鼠标坐标钉在画布中心：solveAim 在触摸模式下不会用它，
    // 但 updateReticle 的"投影失败"兜底分支会读它，留在 (0,0) 会让准星飞到屏幕左上角。
    const cx = this.game.canvas.clientWidth * 0.5;
    const cy = this.game.canvas.clientHeight * 0.5;
    inp.pointer = { x: cx, y: cy };
    inp.mouse.x = cx; inp.mouse.y = cy;

    // 触摸模式下指针永远"在画布上"：手指抬起时产生的 pointermove（target 是按钮）
    // 会把准星永久隐藏。桌面靠 hover 语义判断，触摸没有这个概念。
    const hud = this.game.hud;
    if (hud && hud.pointerFocused === false) hud.pointerFocused = true;

    this._syncHotButton();
  }

  // 借用准星已经算好的 hot 状态，不重复调用 nearestInteractable（省一次遍历）
  _syncHotButton() {
    const btn = this.dom.buttons.find((b) => b.dataset.act === 'interact');
    if (!btn) return;
    const ret = this.game.hud && this.game.hud.el && this.game.hud.el.reticle;
    const hot = !!(ret && ret.classList.contains('hot'));
    if (hot !== this._hotEl) {
      btn.classList.toggle('hot', hot);
      this._hotEl = hot;
    }
  }

  // 触摸模式下把"操作说明"换成触摸版。键盘说明对平板玩家是无效信息。
  _rewriteHelpText() {
    const rows = [
      ['左摇杆', '移动'], ['右摇杆', '瞄准并射击（按住持续开火）'],
      ['翻滚', '冲刺翻滚（无敌帧）· 左区快速双击同样触发'],
      ['E', '交互 / 开箱 / 交易 / 下楼 / 拾取'],
      ['C', '职业能力（每个英雄各不相同）'], ['F', '主动技能（捡到的道具）'],
      ['换弹', '装填'], ['换枪', '切换武器'],
      ['❚❚', '暂停 / 主菜单 · 里面可改设置与按键布局'],
      ['小地图', '点一下放大成整层总览，再点一下收起'],
      ['按键布局', '暂停 → 按键布局：拖动按键与摇杆到顺手的位置，可存模板'],
      ['构筑 TAB', '本局构筑与武器改装'],
    ];
    const html = rows.map(([k, v]) => `<div><kbd>${k}</kbd>${v}</div>`).join('');
    for (const id of ['ctl-list', 'ctl-list2']) {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    }
  }

  destroy() {
    window.removeEventListener('pointerdown', this._onDown);
    window.removeEventListener('pointermove', this._onMove);
    window.removeEventListener('pointerup', this._onUp);
    window.removeEventListener('pointercancel', this._onUp);
    this._cancelDrag();
    this.releaseAll();
    document.body.classList.remove('touch', 'tc-play', 'tc-edit', 'tc-compact');
    this.active = false;
  }
}
