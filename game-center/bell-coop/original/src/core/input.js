// ============================================================
//  输入系统 —— 键盘 / 鼠标，带边缘触发与指针锁定可选
// ============================================================

import { controls, actionLabel, eventToken } from './control_bindings.js';
import { editingTarget } from './control_actions.js';
const MOUSE_BUTTONS=['left','middle','right','back','forward'];

export class Input {
  constructor(canvas, { store = controls, profile = 'classic' } = {}) {
    this.canvas = canvas;
    this._eventController=new AbortController();
    this.controlStore = store;
    this.profile = profile;
    this.bindings = store.get(profile);
    this.capturing = false;
    this._unsubscribeControls = store.subscribe(() => {
      this.bindings = store.get(this.profile);
      this.resetState();
    });
    this.keys = Object.create(null);
    this.pressed = Object.create(null);   // 本帧按下
    this.released = Object.create(null);
    this.mouse = { x: 0, y: 0, nx: 0, ny: 0, left: false, right: false, middle: false, back: false, forward: false };
    this.mousePressed = { left: false, middle: false, right: false, back: false, forward: false };
    this.wheel = 0;
    this.anyKey = false;
    this.blocked = false;
    this.cancelEpoch = 0;
    this.touchActions = { down: new Set(), hit: new Set() };
    this._bind();
  }

  _bind() {
    const kd = (e) => {
      const k = this._norm(e);
      if (!k || e.defaultPrevented || this.capturing) return;
      if (editingTarget(e.target) || document.querySelector('#hub-panel:not(.hidden) [data-preferences], #hub-panel:not(.hidden) [data-controls]')) return;
      // A key held across a pause/blur must be released before combat resumes.
      if (e.repeat && !this.keys[k]) return;
      if (k === 'Tab' || k === 'Space' || k.startsWith('Arrow')) e.preventDefault();
      // 面板的 Enter 由游戏路由确认，不能同时触发背景或关闭按钮的原生 click。
      if (k === 'Enter' && this.blocked && document.querySelector(
        '#hub-panel:not(.hidden), #choice-panel:not(.hidden), #screen-build:not(.hidden)')) e.preventDefault();
      // 面板切换会清空 keys；系统连发仍属于原来那次长按，不产生新的确认边沿。
      if (!e.repeat && !this.keys[k]) this.pressed[k] = true;
      this.keys[k] = true;
      this.anyKey = true;
    };
    const ku = (e) => {
      // Modifiers pressed after movement began must not swallow its release.
      const k = this._norm({ key: e.key, code: e.code });
      if (!k) return;
      this.keys[k] = false;
      this.released[k] = true;
    };
    this.listen(window,'keydown', kd, { passive: false });
    this.listen(window,'keyup', ku);
    this.listen(window,'blur', () => {
      this.resetState();
    });

    const rectPos = (e) => {
      this.pointer = { x: e.clientX, y: e.clientY };
      this.refreshPointerPosition();
    };
    this.listen(this.canvas,'mousemove', rectPos);
    this.listen(this.canvas,'mousedown', (e) => {
      if (e.button===3||e.button===4) e.preventDefault();
      if (this.blocked || this.capturing) return;
      rectPos(e);
      const side=MOUSE_BUTTONS[e.button];
      if (side) { if (!this.mouse[side]) this.mousePressed[side]=true;this.mouse[side]=true; }
      e.preventDefault();
    });
    this.listen(window,'mouseup', (e) => {
      const side=MOUSE_BUTTONS[e.button];if(side)this.mouse[side]=false;
      if(e.button===3||e.button===4)e.preventDefault();
    });
    this.listen(this.canvas,'auxclick',e=>{if(e.button===3||e.button===4)e.preventDefault();});
    this.listen(this.canvas,'contextmenu', (e) => e.preventDefault());
    // 只把画布上的滚轮当作切枪；面板及滚动条上的滚轮交给浏览器。
    this.listen(this.canvas,'wheel', (e) => {
      if (!this.blocked && !this.capturing) this.wheel += Math.sign(e.deltaY);
    }, { passive: true });
    this.listen(this.canvas,'touchstart', (e) => {
      if (!this.blocked) e.preventDefault();
    }, { passive: false });
  }

  listen(target,type,fn,options={}) { target.addEventListener(type,fn,{...(typeof options==='boolean'?{capture:options}:options),signal:this._eventController.signal}); }
  dispose() { this._eventController.abort();this._unsubscribeControls?.();this.resetState(); }

  _norm(e) {
    return eventToken(e);
  }

  resetState() {
    this.cancelEpoch++;
    this.touchActions = { down: new Set(), hit: new Set() };
    this.analogMove = null;
    this.keys = Object.create(null);
    for(const side of MOUSE_BUTTONS)this.mouse[side]=false;
    this.clearEdges();
  }
  setProfile(profile) {
    if (!['classic', 'experimental'].includes(profile)) throw Error('未知控制预设');
    this.profile = profile;
    this.bindings = this.controlStore.get(profile);
    this.resetState();
  }
  label(action) { return actionLabel(action, this.profile, this.controlStore); }
  matchesEvent(action, event) {
    return !this.capturing && (this.bindings[action] || []).includes(eventToken(event));
  }
  _token(token, edge) {
    if (token.startsWith('Mouse')) {
      const side = MOUSE_BUTTONS[Number(token.slice(5))];
      return !!(edge ? this.mousePressed[side] : this.mouse[side]);
    }
    if (token.startsWith('Wheel')) return edge && (token === 'WheelUp' ? this.wheel < 0 : this.wheel > 0);
    return edge ? this.hit(token) : this.down(token);
  }
  actionDown(action) {
    return !this.blocked && !this.capturing && (this.touchActions?.down.has(action) || (this.bindings[action] || []).some(token => this._token(token, false)));
  }
  actionHit(action) {
    return !this.blocked && !this.capturing && (this.touchActions?.hit.has(action) || (this.bindings[action] || []).some(token => this._token(token, true)));
  }

  down(k) { return !!this.keys[k]; }
  // Keep canvas-local coordinates accurate when a stationary pointer survives
  // resize/fullscreen. Rendering resolution never participates in this mapping.
  refreshPointerPosition() {
    if (!this.pointer) return;
    const r = this.canvas.getBoundingClientRect();
    this.mouse.x = this.pointer.x - r.left;
    this.mouse.y = this.pointer.y - r.top;
    this.mouse.nx = r.width > 0 ? (this.mouse.x / r.width) * 2 - 1 : 0;
    this.mouse.ny = r.height > 0 ? -(this.mouse.y / r.height) * 2 + 1 : 0;
  }
  hit(k) { return !!this.pressed[k]; }
  up(k) { return !!this.released[k]; }
  get clickL() { return this.mousePressed.left; }
  get clickR() { return this.mousePressed.right; }

  // 归一化移动向量
  moveVec() {
    if (this.blocked) return { x: 0, z: 0, len: 0 };
    if (this.analogMove) {
      let {x,z}=this.analogMove; const len=Math.hypot(x,z);
      if (!Number.isFinite(len)||len===0) return {x:0,z:0,len:0};
      const scale=len>1?1/len:1;
      return {x:x*scale,z:z*scale,len:Math.min(1,len)};
    }
    let x = 0, z = 0;
    if (this.actionDown('move_left')) x -= 1;
    if (this.actionDown('move_right')) x += 1;
    if (this.actionDown('move_up')) z -= 1;
    if (this.actionDown('move_down')) z += 1;
    const len = Math.hypot(x, z);
    if (len > 0) { x /= len; z /= len; }
    return { x, z, len: len > 0 ? 1 : 0 };
  }

  // 清空本帧边缘事件。必须在每一帧逻辑推进结束后调用，
  // 否则 pressed[k] 会永久为 true，导致 hit() 恒真（持续翻滚 / 每帧切枪 / 每帧重装）。
  endFrame() {
    this.touchActions?.hit.clear();
    this.pressed = Object.create(null);
    this.released = Object.create(null);
    for(const side of MOUSE_BUTTONS)this.mousePressed[side]=false;
    this.wheel = 0;
    this.anyKey = false;
  }

  // 暂停 / 失焦 / 切场景时调用，避免残留按键在恢复瞬间误触发
  clearEdges() { this.endFrame(); }

  // 面板导航仍使用 down/hit，战斗逻辑由 Game 暂停；进入/离开时丢弃残留输入。
  setBlocked(on) {
    const blocked = !!on;
    if (this.blocked === blocked) return;
    this.cancelEpoch++;
    this.touchActions = { down: new Set(), hit: new Set() };
    this.analogMove = null;
    this.blocked = blocked;
    this.keys = Object.create(null);
    for(const side of MOUSE_BUTTONS)this.mouse[side]=false;
    this.clearEdges();
  }
}
