import { presentationPlatform as gamePlatform } from '../runtime/game_platform.js';
// ============================================================
//  程序化音频引擎 —— 全部音效与 BGM 由 WebAudio 实时合成（无外部素材）
// ============================================================

export class Audio {
  constructor() {
    this.ctx = null;
    this.ready = false;
    this.master = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.noiseBuf = null;
    this.voices = 0;
    this.maxVoices = 26;
    this.muted = false;
    this.musicTimer = null;
    this.currentTrack = null;
    this._step = 0;
    this._nextTime = 0;
    this._volumes = { master: 0.85, music: 0.34, sfx: 0.7 };
    // 实际写进 gain 节点的值 = _volumes × _ducks × (_enabled ? 1 : 0)。
    //
    // 为什么要把"玩家设定的音量"和"场景临时压低"分成两层：
    // 旧实现里暂停界面直接 setVolume('music', 0.14)，恢复时又写回 0.34 —— 是**绝对赋值**。
    // 一旦音量可以被玩家调整，"恢复"那一行就会把玩家设的值覆盖掉
    // （玩家把音乐调到 0.8，暂停一次变回 0.34，而且他自己不知道为什么）。
    // 现在场景只改 _ducks（相对系数），玩家设定那一层谁来都不动。
    this._ducks = { master: 1, music: 1, sfx: 1 };
    this._enabled = { master: true, music: true, sfx: true };
  }

  init() {
    if (gamePlatform().kind === 'headless') return;
    if (this.ready) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC({ latencyHint: 'interactive' });
    } catch (e) { return; }
    const ctx = this.ctx;
    this.master = ctx.createGain();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -12; comp.knee.value = 22; comp.ratio.value = 8;
    comp.attack.value = 0.003; comp.release.value = 0.22;
    this.master.connect(comp);
    comp.connect(ctx.destination);

    this.sfxGain = ctx.createGain();
    this.sfxGain.connect(this.master);
    this.musicGain = ctx.createGain();
    this.musicGain.connect(this.master);
    // 建完立刻按"设定 × 闪避 × 开关"写一遍，保证 init 之前就设过的值不会丢
    for (const k of ['master', 'sfx', 'music']) this._applyGain(k);

    // 白噪声缓冲
    const n = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    this.noiseBuf = buf;
    this.ready = true;
  }

  resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  _node(kind) {
    return kind === 'master' ? this.master : kind === 'music' ? this.musicGain : kind === 'sfx' ? this.sfxGain : null;
  }

  _applyGain(kind) {
    const g = this._node(kind);
    if (!g) return;                                   // 还没 init：值先存着，init() 里会补写
    const vol = Number.isFinite(this._volumes[kind]) ? this._volumes[kind] : 0;
    const duck = Number.isFinite(this._ducks[kind]) ? this._ducks[kind] : 1;
    g.gain.value = Math.max(0, Math.min(1, vol * duck * (this._enabled[kind] ? 1 : 0)));
  }

  /** 玩家设定层。场景里的临时压低请用 duck()，**不要**在这里写绝对值。 */
  setVolume(kind, v) {
    this._volumes[kind] = v;
    this._applyGain(kind);
  }
  getVolume(kind) { return this._volumes[kind]; }

  /** 场景闪避层（暂停压低音乐、首领演出压低全场）。系数是相对值，1 = 不压低。 */
  duck(kind, factor) {
    this._ducks[kind] = Number.isFinite(factor) ? factor : 1;
    this._applyGain(kind);
  }
  getDuck(kind) { return this._ducks[kind]; }

  /** 用户开关层（设置面板里的"音乐 / 音效"开关）。关掉后 gain 恒为 0，但设定值仍保留。 */
  setEnabled(kind, on) {
    this._enabled[kind] = !!on;
    this._applyGain(kind);
  }
  isEnabled(kind) { return this._enabled[kind]; }

  get t() { return this.ctx ? this.ctx.currentTime : 0; }

  _gain(v = 1, bus = 'sfx') {
    const g = this.ctx.createGain();
    g.gain.value = v;
    g.connect(bus === 'music' ? this.musicGain : this.sfxGain);
    return g;
  }

  _busy() { return !this.ready || this.muted || this.voices > this.maxVoices; }
  _take() { this.voices++; setTimeout(() => { this.voices = Math.max(0, this.voices - 1); }, 900); }

  // ---------- 基础音源 ----------
  _osc(type, f0, f1, dur, vol, when = 0, dest = null, detune = 0) {
    if (this._busy()) return null;
    const ctx = this.ctx, t = ctx.currentTime + when;
    const o = ctx.createOscillator();
    o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    if (detune) o.detune.value = detune;
    const g = dest || this._gain(vol);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.012, dur * 0.2));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    o.start(t); o.stop(t + dur + 0.02);
    this._take();
    return { o, g };
  }

  _noise(dur, vol, when = 0, filter = { type: 'lowpass', f0: 4000, f1: 400, q: 1 }, dest = null) {
    if (this._busy()) return null;
    const ctx = this.ctx, t = ctx.currentTime + when;
    const s = ctx.createBufferSource();
    s.buffer = this.noiseBuf;
    s.loop = true;
    s.playbackRate.value = 1;
    const bq = ctx.createBiquadFilter();
    bq.type = filter.type; bq.Q.value = filter.q ?? 1;
    bq.frequency.setValueAtTime(filter.f0, t);
    bq.frequency.exponentialRampToValueAtTime(Math.max(40, filter.f1), t + dur);
    const g = dest || this._gain(vol);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.02, dur * 0.25));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(bq); bq.connect(g);
    s.start(t); s.stop(t + dur + 0.05);
    this._take();
    return { s, g };
  }

  // ---------- 具体音效 ----------
  gun(kind = 'pistol', vol = 1) {
    if(gamePlatform().kind==='headless'){gamePlatform().emit('presentation-audio',{method:'gun',args:Array.from(arguments)});return;}
    if (!this.ready) return;
    switch (kind) {
      case 'pistol':
        this._noise(0.09, 0.30 * vol, 0, { type: 'bandpass', f0: 2600, f1: 700, q: 1.1 });
        this._osc('square', 400, 90, 0.07, 0.18 * vol);
        break;
      case 'smg':
        this._noise(0.045, 0.17 * vol, 0, { type: 'highpass', f0: 1800, f1: 900, q: 1 });
        this._osc('square', 620, 180, 0.04, 0.11 * vol);
        break;
      case 'rifle':
        this._noise(0.10, 0.32 * vol, 0, { type: 'bandpass', f0: 3200, f1: 800, q: 0.9 });
        this._osc('sawtooth', 300, 70, 0.08, 0.16 * vol);
        break;
      case 'shotgun':
        this._noise(0.26, 0.42 * vol, 0, { type: 'lowpass', f0: 2400, f1: 160, q: 0.7 });
        this._osc('sawtooth', 190, 48, 0.22, 0.26 * vol);
        break;
      case 'sniper':
        this._osc('sawtooth', 1400, 120, 0.22, 0.22 * vol);
        this._noise(0.30, 0.34 * vol, 0.01, { type: 'bandpass', f0: 4200, f1: 260, q: 0.8 });
        break;
      case 'laser':
        this._osc('sawtooth', 1800, 240, 0.20, 0.20 * vol);
        this._osc('sine', 3200, 900, 0.16, 0.10 * vol, 0, null, 12);
        break;
      case 'energy':
        this._osc('sine', 900, 180, 0.16, 0.20 * vol);
        this._osc('square', 1400, 420, 0.10, 0.09 * vol, 0.005);
        break;
      case 'plasma':
        this._osc('triangle', 1300, 300, 0.22, 0.18 * vol);
        this._osc('sine', 520, 1400, 0.20, 0.10 * vol, 0);
        break;
      case 'rocket':
        this._noise(0.42, 0.30 * vol, 0, { type: 'bandpass', f0: 900, f1: 220, q: 0.6 });
        this._osc('sawtooth', 240, 70, 0.36, 0.20 * vol);
        break;
      case 'grenade':
        this._osc('square', 320, 150, 0.10, 0.20 * vol);
        break;
      case 'flame':
        this._noise(0.16, 0.16 * vol, 0, { type: 'lowpass', f0: 1200, f1: 500, q: 0.4 });
        break;
      case 'gauss':
        this._osc('sine', 2400, 200, 0.30, 0.20 * vol);
        this._noise(0.24, 0.22 * vol, 0, { type: 'highpass', f0: 900, f1: 2400, q: 1 });
        break;
      case 'orb':
        this._osc('sine', 700, 1600, 0.18, 0.16 * vol);
        break;
      case 'charge':
        this._osc('sawtooth', 200, 1500, 0.5, 0.12 * vol);
        break;
      case 'spinup':
        this._osc('square', 120, 420, 0.5, 0.10 * vol);
        break;
      default:
        this._noise(0.08, 0.25 * vol);
    }
  }

  explosion(size = 1) {
    if(gamePlatform().kind==='headless'){gamePlatform().emit('presentation-audio',{method:'explosion',args:Array.from(arguments)});return;}
    if (!this.ready) return;
    const d = 0.35 + size * 0.35;
    this._noise(d, Math.min(0.6, 0.34 * size), 0, { type: 'lowpass', f0: 1600, f1: 70, q: 0.8 });
    this._osc('sine', 160 * (1 / size), 30, d * 0.9, Math.min(0.42, 0.26 * size));
    if (size > 1.2) this._noise(0.16, 0.3, 0.01, { type: 'highpass', f0: 2600, f1: 700, q: 0.8 });
    // 大爆炸补"体量"：次低频撞击 + 长尾轰鸣。原来只有中高频"啪"，
    // 缺的是玩家能"感到"的那口低频（试玩反馈：陨石打击感太弱）。
    if (size >= 1.4) {
      this._osc('sine', 78, 26, 0.75 * size, 0.30);
      this._noise(1.15 * size, 0.11, 0.05, { type: 'lowpass', f0: 420, f1: 70, q: 0.7 });
    }
  }

  // 陨石坠落预告：低频风切上行 + 压迫感（在落点预告窗口播放）
  meteorWarning() {
    if(gamePlatform().kind==='headless'){gamePlatform().emit('presentation-audio',{method:'meteorWarning',args:Array.from(arguments)});return;}
    if (!this.ready) return;
    this._noise(0.55, 0.10, 0, { type: 'bandpass', f0: 240, f1: 1500, q: 0.7 });
    this._osc('sawtooth', 68, 156, 0.55, 0.075);
    this._osc('sine', 44, 60, 0.62, 0.09, 0.02);
  }

  // ============================================================
  //  天降陨石 —— 全游戏最重的单次撞击
  //  设计：四层递进，缺一层就"飘"
  //    ① 撞击核心：宽频噪声急速下压（2600→55Hz）＝岩石砸进地面的撕裂
  //    ② 低频轰击：95→26Hz 的正弦＝能"感到"的那一下
  //    ③ 次声体量：48→22Hz 长衰减＝大质量物体的余威
  //    ④ 碎石脆响 + 长尾轰鸣：砸完之后地面还在响
  // ============================================================
  meteor(size = 1) {
    if(gamePlatform().kind==='headless'){gamePlatform().emit('presentation-audio',{method:'meteor',args:Array.from(arguments)});return;}
    if (!this.ready) return;
    const s = Math.max(0.6, Math.min(1.8, size));
    // ① 撞击核心
    this._noise(0.50 * s, Math.min(0.62, 0.44 * s), 0, { type: 'lowpass', f0: 2600, f1: 55, q: 0.8 });
    // ② 低频轰击
    this._osc('sine', 95, 26, 0.85 * s, Math.min(0.44, 0.34 * s));
    // ③ 次声体量
    this._osc('sine', 48, 22, 1.35 * s, Math.min(0.30, 0.22 * s), 0.01);
    // ④ 碎石脆响（错开的短脉冲，制造"碎块四散"的颗粒感）
    const crumbs = [[0.03, 3000, 900], [0.09, 4200, 1400], [0.17, 2400, 700], [0.28, 5200, 1800]];
    for (const [when, f0, f1] of crumbs) this._noise(0.05, 0.16, when * s, { type: 'highpass', f0, f1, q: 0.9 });
    // 长尾轰鸣
    this._noise(1.25 * s, 0.10, 0.06, { type: 'lowpass', f0: 380, f1: 75, q: 0.7 });
  }

  impact(hard = false) {
    if(gamePlatform().kind==='headless'){gamePlatform().emit('presentation-audio',{method:'impact',args:Array.from(arguments)});return;}
    if (!this.ready) return;
    this._osc('square', hard ? 900 : 620, hard ? 200 : 160, 0.05, hard ? 0.12 : 0.08);
  }

  ricochet() {
    if(gamePlatform().kind==='headless'){gamePlatform().emit('presentation-audio',{method:'ricochet',args:Array.from(arguments)});return;}
    if (!this.ready) return;
    this._osc('triangle', 2600, 700, 0.14, 0.10);
  }

  hitEnemy(crit = false) {
    if(gamePlatform().kind==='headless'){gamePlatform().emit('presentation-audio',{method:'hitEnemy',args:Array.from(arguments)});return;}
    if (!this.ready) return;
    this._noise(0.06, 0.14, 0, { type: 'bandpass', f0: crit ? 3000 : 1900, f1: 500, q: 1.4 });
    if (crit) this._osc('sine', 1500, 2600, 0.10, 0.12);
  }

  enemyDie() {
    if(gamePlatform().kind==='headless'){gamePlatform().emit('presentation-audio',{method:'enemyDie',args:Array.from(arguments)});return;}
    if (!this.ready) return;
    this._noise(0.24, 0.22, 0, { type: 'bandpass', f0: 1400, f1: 180, q: 0.8 });
    this._osc('sawtooth', 320, 60, 0.20, 0.12);
  }

  hurt() {
    if(gamePlatform().kind==='headless'){gamePlatform().emit('presentation-audio',{method:'hurt',args:Array.from(arguments)});return;}
    if (!this.ready) return;
    this._osc('square', 300, 90, 0.16, 0.22);
    this._noise(0.12, 0.16, 0, { type: 'lowpass', f0: 900, f1: 200, q: 1 });
  }

  roll() {
    if(gamePlatform().kind==='headless'){gamePlatform().emit('presentation-audio',{method:'roll',args:Array.from(arguments)});return;}
    if (!this.ready) return;
    this._noise(0.20, 0.12, 0, { type: 'bandpass', f0: 600, f1: 1600, q: 0.6 });
  }

  reload(stage = 0) {
    if(gamePlatform().kind==='headless'){gamePlatform().emit('presentation-audio',{method:'reload',args:Array.from(arguments)});return;}
    if (!this.ready) return;
    this._osc('square', stage === 0 ? 220 : 380, stage === 0 ? 140 : 260, 0.05, 0.10);
    this._noise(0.05, 0.07, 0.02, { type: 'highpass', f0: 2400, f1: 1200, q: 1 });
  }

  pickup() {
    if(gamePlatform().kind==='headless'){gamePlatform().emit('presentation-audio',{method:'pickup',args:Array.from(arguments)});return;}
    if (!this.ready) return;
    this._osc('triangle', 720, 1180, 0.10, 0.16);
    this._osc('triangle', 1180, 1620, 0.10, 0.10, 0.06);
  }
  coin() {
    if(gamePlatform().kind==='headless'){gamePlatform().emit('presentation-audio',{method:'coin',args:Array.from(arguments)});return;}
    if (!this.ready) return;
    this._osc('square', 1320, 1320, 0.04, 0.07);
    this._osc('square', 1760, 1760, 0.05, 0.06, 0.045);
  }
  key() {
    if(gamePlatform().kind==='headless'){gamePlatform().emit('presentation-audio',{method:'key',args:Array.from(arguments)});return;}
    if (!this.ready) return;
    this._osc('triangle', 1600, 2200, 0.09, 0.11);
    this._osc('sine', 2400, 3000, 0.09, 0.07, 0.05);
  }
  heal() {
    if(gamePlatform().kind==='headless'){gamePlatform().emit('presentation-audio',{method:'heal',args:Array.from(arguments)});return;}
    if (!this.ready) return;
    const n = [660, 880, 1100, 1320];
    n.forEach((f, i) => this._osc('sine', f, f, 0.16, 0.10, i * 0.055));
  }
  chestOpen() {
    if(gamePlatform().kind==='headless'){gamePlatform().emit('presentation-audio',{method:'chestOpen',args:Array.from(arguments)});return;}
    if (!this.ready) return;
    this._noise(0.3, 0.14, 0, { type: 'bandpass', f0: 700, f1: 2200, q: 0.7 });
    this._osc('sine', 420, 900, 0.35, 0.10);
  }
  doorLock() {
    if(gamePlatform().kind==='headless'){gamePlatform().emit('presentation-audio',{method:'doorLock',args:Array.from(arguments)});return;}
    if (!this.ready) return;
    this._osc('square', 160, 70, 0.20, 0.22);
    this._noise(0.22, 0.16, 0, { type: 'lowpass', f0: 700, f1: 120, q: 0.9 });
  }
  doorOpen() {
    if(gamePlatform().kind==='headless'){gamePlatform().emit('presentation-audio',{method:'doorOpen',args:Array.from(arguments)});return;}
    if (!this.ready) return;
    this._osc('square', 90, 180, 0.24, 0.16);
    this._noise(0.24, 0.12, 0, { type: 'bandpass', f0: 500, f1: 1400, q: 0.6 });
  }
  stairs() {
    if(gamePlatform().kind==='headless'){gamePlatform().emit('presentation-audio',{method:'stairs',args:Array.from(arguments)});return;}
    if (!this.ready) return;
    [523, 659, 784, 1046].forEach((f, i) => this._osc('triangle', f, f, 0.4, 0.12, i * 0.10));
  }
  secretFound() {
    if(gamePlatform().kind==='headless'){gamePlatform().emit('presentation-audio',{method:'secretFound',args:Array.from(arguments)});return;}
    if (!this.ready) return;
    [880, 1174, 1568].forEach((f, i) => this._osc('sine', f, f * 1.5, 0.3, 0.12, i * 0.08));
  }
  bossRoar() {
    if(gamePlatform().kind==='headless'){gamePlatform().emit('presentation-audio',{method:'bossRoar',args:Array.from(arguments)});return;}
    if (!this.ready) return;
    this._osc('sawtooth', 120, 42, 1.1, 0.32);
    this._osc('square', 62, 30, 1.2, 0.20, 0, null, 6);
    this._noise(1.0, 0.24, 0, { type: 'lowpass', f0: 900, f1: 90, q: 0.7 });
  }
  // 巨钟 / 小钟 —— 全游戏的"声音标志"（任务书第 32 节）。
  // 钟的音色关键在于**非谐分音**：真实钟体的分音不是整数倍，
  // 用 0.5/1.0/1.19/1.56/2.0/2.66 这组比例叠出来才有"钟味"，
  // 单纯叠倍频听起来是风琴而不是钟。
  bell(big = true) {
    if(gamePlatform().kind==='headless'){gamePlatform().emit('presentation-audio',{method:'bell',args:Array.from(arguments)});return;}
    if (!this.ready) return;
    const f = big ? 76 : 208;                 // 巨钟基频极低，靠分音撑起厚度
    const dur = big ? 4.6 : 1.5;
    const partials = [[0.5, 0.30], [1.0, 0.34], [1.19, 0.19], [1.56, 0.15], [2.0, 0.11], [2.66, 0.06]];
    for (const [ratio, vol] of partials) {
      // 每个分音都带极轻微的下滑（钟体余振），衰减靠 dur
      this._osc('sine', f * ratio, f * ratio * 0.994, dur, vol, 0);
    }
    // 敲击瞬态：金属撞击的宽带噪声 + 高频短促起音
    this._noise(0.12, 0.24, 0, { type: 'bandpass', f0: f * 7, f1: f * 2.2, q: 0.9 });
    this._osc('triangle', f * 3.1, f * 1.5, 0.42, 0.13, 0);
    if (big) {
      // 低频轰鸣：让"巨钟"有体量感
      this._osc('sine', f * 0.25, f * 0.24, dur * 0.9, 0.22, 0.01);
    }
  }
  // 炉井点燃：低频上行的热流 + 持续的火声
  furnaceIgnite() {
    if(gamePlatform().kind==='headless'){gamePlatform().emit('presentation-audio',{method:'furnaceIgnite',args:Array.from(arguments)});return;}
    if (!this.ready) return;
    this._osc('sawtooth', 42, 118, 2.2, 0.20);
    this._osc('sine', 60, 190, 2.0, 0.14, 0.05);
    this._noise(2.4, 0.16, 0, { type: 'lowpass', f0: 400, f1: 2600, q: 0.7 });
  }
  // 机械运转：节律性的金属咬合（出征仪式里炉井周围的机械）
  machineSpin(turns = 6) {
    if(gamePlatform().kind==='headless'){gamePlatform().emit('presentation-audio',{method:'machineSpin',args:Array.from(arguments)});return;}
    if (!this.ready) return;
    for (let i = 0; i < turns; i++) {
      this._osc('square', 168, 132, 0.07, 0.055, i * 0.095);
      this._noise(0.05, 0.05, i * 0.095, { type: 'highpass', f0: 1200, f1: 2400, q: 0.6 });
    }
  }
  phaseChange() {
    if(gamePlatform().kind==='headless'){gamePlatform().emit('presentation-audio',{method:'phaseChange',args:Array.from(arguments)});return;}
    if (!this.ready) return;
    [220, 262, 330, 440, 587].forEach((f, i) => this._osc('sawtooth', f, f * 2, 0.6, 0.14, i * 0.07));
    this._noise(0.8, 0.2, 0, { type: 'lowpass', f0: 2000, f1: 200, q: 0.8 });
  }
  victory() {
    if(gamePlatform().kind==='headless'){gamePlatform().emit('presentation-audio',{method:'victory',args:Array.from(arguments)});return;}
    if (!this.ready) return;
    const mel = [523, 659, 784, 1046, 784, 1046, 1318];
    mel.forEach((f, i) => {
      this._osc('triangle', f, f, 0.5, 0.14, i * 0.16);
      this._osc('sine', f / 2, f / 2, 0.5, 0.08, i * 0.16);
    });
  }
  defeat() {
    if(gamePlatform().kind==='headless'){gamePlatform().emit('presentation-audio',{method:'defeat',args:Array.from(arguments)});return;}
    if (!this.ready) return;
    const mel = [440, 415, 349, 261];
    mel.forEach((f, i) => this._osc('triangle', f, f * 0.98, 0.7, 0.14, i * 0.24, null, 0));
  }
  ui(kind = 'move') {
    if(gamePlatform().kind==='headless'){gamePlatform().emit('presentation-audio',{method:'ui',args:Array.from(arguments)});return;}
    if (!this.ready) return;
    if (kind === 'move') this._osc('square', 620, 780, 0.04, 0.05);
    else if (kind === 'select') { this._osc('square', 880, 1320, 0.08, 0.08); }
    else if (kind === 'buy') { [784, 1046, 1318].forEach((f, i) => this._osc('square', f, f, 0.09, 0.07, i * 0.05)); }
    else this._osc('square', 300, 200, 0.09, 0.07);
  }
  dashBlast() {
    if(gamePlatform().kind==='headless'){gamePlatform().emit('presentation-audio',{method:'dashBlast',args:Array.from(arguments)});return;}
    if (!this.ready) return;
    this._noise(0.25, 0.22, 0, { type: 'bandpass', f0: 300, f1: 2400, q: 0.6 });
    this._osc('sine', 200, 700, 0.2, 0.14);
  }
  shield() {
    if(gamePlatform().kind==='headless'){gamePlatform().emit('presentation-audio',{method:'shield',args:Array.from(arguments)});return;}
    if (!this.ready) return;
    this._osc('sine', 300, 900, 0.4, 0.16);
    this._osc('sine', 600, 1500, 0.4, 0.08, 0, null, 8);
  }
  slowmo() {
    if(gamePlatform().kind==='headless'){gamePlatform().emit('presentation-audio',{method:'slowmo',args:Array.from(arguments)});return;}
    if (!this.ready) return;
    this._osc('sine', 900, 200, 0.7, 0.16);
  }
  bossShoot(kind = 0) {
    if(gamePlatform().kind==='headless'){gamePlatform().emit('presentation-audio',{method:'bossShoot',args:Array.from(arguments)});return;}
    if (!this.ready) return;
    if (kind === 0) this._osc('sawtooth', 240, 700, 0.16, 0.14);
    else if (kind === 1) this._noise(0.3, 0.2, 0, { type: 'bandpass', f0: 1800, f1: 300, q: 0.7 });
    else this._osc('square', 500, 150, 0.22, 0.14);
  }
  teleport() {
    if(gamePlatform().kind==='headless'){gamePlatform().emit('presentation-audio',{method:'teleport',args:Array.from(arguments)});return;}
    if (!this.ready) return;
    this._osc('sine', 1800, 300, 0.24, 0.13);
    this._noise(0.2, 0.1, 0, { type: 'highpass', f0: 2000, f1: 600, q: 1 });
  }

  // ---------- 音乐 ----------
  static TRACKS = {
    keep: {
      bpm: 96, root: 45, scale: [0, 2, 3, 5, 7, 8, 10], bars: 4,
      bass: [0, 0, 3, 3, 5, 5, 3, 2], lead: [7, 10, 12, 10, 8, 7, 5, 3, 7, 10, 12, 15, 12, 10, 8, 7],
      pad: [0, 5, 3, 7], drums: 'x...x...x...x...',
    },
    abyss: {
      bpm: 106, root: 41, scale: [0, 1, 3, 5, 6, 8, 10], bars: 4,
      bass: [0, 0, 0, 1, 3, 3, 1, 0], lead: [6, 8, 11, 13, 11, 8, 6, 3, 6, 8, 13, 16, 13, 11, 8, 6],
      pad: [0, 3, 1, 6], drums: 'x..xx...x..xx...',
    },
    boss: {
      bpm: 138, root: 38, scale: [0, 1, 3, 6, 7, 8, 11], bars: 2,
      bass: [0, 0, 1, 0, 3, 3, 6, 3], lead: [7, 10, 13, 12, 10, 7, 6, 3, 7, 13, 15, 18, 15, 13, 10, 7],
      pad: [0, 6, 3, 7], drums: 'xxxxx.xxx.x.xxxx',
    },
    calm: {
      bpm: 76, root: 48, scale: [0, 2, 4, 7, 9], bars: 4,
      bass: [0, 0, 3, 4], lead: [7, 9, 12, 9, 7, 4, 2, 0, 7, 12, 16, 12, 9, 7, 4, 2],
      pad: [0, 4, 2, 7], drums: 'x.......x.......',
    },
    // 第三层：熔心王座 —— 更压迫、更低沉的进行曲
    throne: {
      bpm: 118, root: 36, scale: [0, 1, 4, 5, 7, 8, 11], bars: 4,
      bass: [0, 0, 0, 0, 4, 4, 1, 0], lead: [7, 12, 11, 8, 7, 5, 4, 1, 7, 12, 16, 15, 12, 11, 8, 7],
      pad: [0, 4, 1, 5], drums: 'x.xx..x.x.xx..x.',
    },
  };

  _midi(n) { return 440 * Math.pow(2, (n - 69) / 12); }

  playMusic(name) {
    if(gamePlatform().kind==='headless'){gamePlatform().emit('presentation-audio',{method:'playMusic',args:Array.from(arguments)});return;}
    this.init();
    if (!this.ready) return;
    if (this.currentTrack === name) return;
    this.currentTrack = name;
    this._step = 0;
    this._nextTime = this.ctx.currentTime + 0.06;
    if (this.musicTimer) clearInterval(this.musicTimer);
    if (!name || !Audio.TRACKS[name]) { this.musicTimer = null; return; }
    this.musicTimer = setInterval(() => this._schedule(), 40);
  }

  stopMusic() {
    if(gamePlatform().kind==='headless'){gamePlatform().emit('presentation-audio',{method:'stopMusic',args:Array.from(arguments)});return;}
    if (this.musicTimer) clearInterval(this.musicTimer);
    this.musicTimer = null;
    this.currentTrack = null;
  }

  _schedule() {
    if (!this.ready || !this.currentTrack) return;
    const tr = Audio.TRACKS[this.currentTrack];
    if (!tr) return;
    const spb = 60 / tr.bpm / 4; // 16 分音符
    while (this._nextTime < this.ctx.currentTime + 0.25) {
      this._playStep(tr, this._step, this._nextTime);
      this._step++;
      this._nextTime += spb;
    }
  }

  _mnote(tr, deg) {
    const oct = Math.floor(deg / tr.scale.length);
    const idx = ((deg % tr.scale.length) + tr.scale.length) % tr.scale.length;
    return this._midi(tr.root + tr.scale[idx] + oct * 12);
  }

  _playStep(tr, step, time) {
    const s16 = step % 16, bar = Math.floor(step / 16) % tr.bars;
    const ctx = this.ctx;
    const mk = (type, freq, dur, vol, detune = 0) => {
      const o = ctx.createOscillator(); o.type = type;
      o.frequency.value = freq; o.detune.value = detune;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, time);
      g.gain.exponentialRampToValueAtTime(vol, time + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
      o.connect(g); g.connect(this.musicGain);
      o.start(time); o.stop(time + dur + 0.02);
    };
    const nz = (dur, vol, f0, f1, q = 1) => {
      const s = ctx.createBufferSource(); s.buffer = this.noiseBuf; s.loop = true;
      const bq = ctx.createBiquadFilter(); bq.type = 'bandpass'; bq.Q.value = q;
      bq.frequency.setValueAtTime(f0, time);
      bq.frequency.exponentialRampToValueAtTime(f1, time + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, time);
      g.gain.exponentialRampToValueAtTime(vol, time + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
      s.connect(bq); bq.connect(g); g.connect(this.musicGain);
      s.start(time); s.stop(time + dur + 0.02);
    };
    // 低音
    if (s16 % 4 === 0) {
      const d = tr.bass[(bar * 4 + (s16 / 4)) % tr.bass.length];
      mk('sawtooth', this._mnote(tr, d), 0.42, 0.16, -4);
      mk('square', this._mnote(tr, d) / 2, 0.36, 0.07);
    }
    // 主旋律
    const ld = tr.lead[(bar * 16 + s16) % tr.lead.length];
    if (s16 % 2 === 0 || (s16 % 4 === 3)) {
      mk('triangle', this._mnote(tr, ld + 7), 0.22, 0.075, 6);
    }
    // 铺底
    if (s16 === 0 || s16 === 8) {
      const p = tr.pad[bar % tr.pad.length];
      mk('sine', this._mnote(tr, p), 1.6, 0.075);
      mk('sine', this._mnote(tr, p + 7), 1.6, 0.05, 9);
    }
    // 鼓
    const dch = tr.drums[s16 % tr.drums.length];
    if (dch === 'x') {
      mk('sine', 130, 0.16, 0.30);
      mk('sine', 58, 0.20, 0.22);
      nz(0.06, 0.10, 2200, 600, 0.8);
    } else if (dch === 'o') {
      nz(0.12, 0.12, 1400, 400, 0.6);
    }
    if (s16 === 4 || s16 === 12) nz(0.11, 0.11, 3200, 1200, 0.9);
    if (s16 % 2 === 1) nz(0.03, 0.035, 7000, 4200, 1.2);
  }
}

export const audio = new Audio();
