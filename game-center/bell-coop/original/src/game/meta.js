// ============================================================
//  Meta —— 跨局的长期进度（持久化到 localStorage）
//
//  设计原则（任务书第九、十节）：
//  **优先解锁"选择"，慎用永久数值强化**。
//  这里存的是：解锁（英雄 / 起始武器 / 挑战词条）、成就、图鉴、统计、长期货币。
//  刻意**不存**"永久攻击力 +N%"这类东西 —— 一次 Run 的强弱必须仍然发生在地牢内部。
// ============================================================

import {HERO_MAP,SIDEARMS,PAINT_MAP,MODIFIERS} from './heroes.js';
import { saveStore } from './save.js';
import {WEAPON_ASSET_STORAGE_PREFIX} from '../weapon_assets_config.js';
const KEY = WEAPON_ASSET_STORAGE_PREFIX+':meta:v1';

export function blankMeta() {
  return {
    v: 1,
    souls: 0,                 // 钟魂：长期货币（解锁用，不出售战力）
    heroes: ['warden', 'foldshadow'],       // 已解锁英雄
    sidearms: ['pistol_rusty'], // 已解锁起始武器
    modifiers: [],            // 已解锁挑战词条
    seen: { weapon: [], relic: [], active: [], attachment: [], enemy: [], elite: [], boss: [], synergy: [], event: [], area: [], pet: [], spell: [], hero: [] },
    achievements: [],
    stats: { runs: 0, wins: 0, deaths: 0, kills: 0, bossKills: 0, deepest: 1, vaults: 0, secrets: 0, bestTime: 0 },
    reached: { 1: true, 2: false, 3: false },   // 到达过哪些楼层 → Practice Mode 解锁依据
    paints: ['orig'],          // 已解锁涂装（纯外观）
    sel: { hero: 'warden', sidearm: 'pistol_rusty', modifier: '', seed: '', paint: 'orig', supply: 'none', route: 'none' },
    difficulty: 'standard',   // 难度档（PASS2 §1.6）：casual | standard | challenge
    revivalPref: 'off',       // 标准难度是否允许"一次复苏"（Task6）：on | off。挑战强制关闭。
    tut: [],                  // 已看过的教学提示 key
    dev: false,               // 开发者模式（测试用：解锁全部"选择"与全部楼层）
  };
}

export class Meta {
  constructor({data=null}={}) {
    this.data = data?structuredClone(data):blankMeta();
    this._dirty = false;
    this._t = 0;
    if(!data)this.load();
    else this.normalize();
  }

  load() {
    this._clearActive = false;
    try {
      const current = saveStore.read();
      const raw = current ? JSON.stringify(current.meta) : ((typeof localStorage !== 'undefined') ? localStorage.getItem(KEY) : null);
      if (!raw) return;
      const p = JSON.parse(raw);
      if (!p || p.v !== 1) return;
      // 逐字段合并，保证老存档缺字段时不会崩（新增字段自动用默认值）
      const b = blankMeta();
      this.data = {
        ...b, ...p,
        seen: { ...b.seen, ...(p.seen || {}) },
        stats: { ...b.stats, ...(p.stats || {}) },
        reached: { ...b.reached, ...(p.reached || {}) },
        sel: { ...b.sel, ...(p.sel || {}) },
      };
      // Historical entity id was incorrectly recorded as the Codex definition id.
      this.data.seen.boss = [...new Set(this.data.seen.boss.map(id => id === 'boss' ? 'ember_warden' : id))];
      // 新增字段的取值收敛（如 difficulty 的非法值 → 默认），旧档缺字段已经由 ...b 兜住
      this.normalize();
    } catch (e) { /* 存档损坏时静默回到默认，不让它影响开局 */ }
  }

  save(force) {
    if (!this._dirty && !force) return;
    try {
      const result = saveStore.write(this.data, this._clearActive ? null : undefined);
      if (result.ok) { this._dirty = false; this._clearActive = false; }
      return result;
    } catch (e) { /* 隐私模式等场景下写入失败，不影响游玩 */ }
  }

  tick(dt) { this._t += dt; if (this._t > 2.5) { this._t = 0; this.save(); } }
  mark() { this._dirty = true; }
  endRun() { this._clearActive = true; this.mark(); }

  // ---------- 货币 ----------
  get souls() { return this.data.souls | 0; }
  addSouls(n) { this.data.souls = Math.max(0, (this.data.souls | 0) + Math.round(n)); this.mark(); return this.data.souls; }
  spend(n) { if (this.data.souls < n) return false; this.data.souls -= n; this.mark(); return true; }

  // ---------- 开发者模式 ----------
  // 测试用：解锁全部"选择"（英雄 / 起始副武器 / 挑战词条 / 涂装）与全部楼层。
  // 刻意**不做**的事：不发成就、不改图鉴、不送数值 ——
  // 那三样会污染真实进度记录，让"这局是不是真打出来的"变得无法分辨。
  // 旧档没有 difficulty 字段：读档后按默认值补齐，**不因为缺字段而拒绝存档**
  normalize() {
    const ok = ['casual', 'standard', 'challenge'];
    if (!ok.includes(this.data.difficulty)) this.data.difficulty = 'standard';
    if (!this.data.heroes.includes('foldshadow')) this.data.heroes.push('foldshadow');
  }

  get devMode() { return !!this.data.dev; }
  setDev(on) { this.data.dev = !!on; this.mark(); this.save(true); return this.devMode; }

  // ---------- 解锁 ----------
  // 每个 has* 都先问开发者模式：dev 打开时"全部已解锁"，但存档里的真实解锁记录不被篡改。
  hasHero(id) { return Object.hasOwn(HERO_MAP,id) && (id === 'foldshadow' || this.devMode || this.data.heroes.includes(id)); }
  unlockHero(id) { if (!Object.hasOwn(HERO_MAP,id)) return false; if (!this.hasHero(id)) { this.data.heroes.push(id); this.mark(); return true; } return false; }
  hasSidearm(id) { return this.devMode || this.data.sidearms.includes(id); }
  unlockSidearm(id) { if (!this.hasSidearm(id)) { this.data.sidearms.push(id); this.mark(); return true; } return false; }
  hasPaint(id) { return this.devMode || (this.data.paints || ['orig']).includes(id); }
  unlockPaint(id) { if (!this.data.paints) this.data.paints = ['orig']; if (!this.hasPaint(id)) { this.data.paints.push(id); this.mark(); return true; } return false; }
  hasModifier(id) { return this.devMode || this.data.modifiers.includes(id); }
  unlockModifier(id) { if (!this.hasModifier(id)) { this.data.modifiers.push(id); this.mark(); return true; } return false; }

  // Shared original price/ownership consumer for the hub and authenticated coop profile.
  unlockPrice(kind,id) {
    if(kind==='hero'){const h=HERO_MAP[id];return !h?null:this.hasHero(id)?0:h.unlock?.souls??null;}
    if(kind==='sidearm'){const d=SIDEARMS.find(x=>x.id===id);return !d?null:this.hasSidearm(id)?0:d.cost;}
    if(kind==='paint'){const d=PAINT_MAP[id];return !d?null:this.hasPaint(id)?0:d.cost;}
    if(kind==='modifier'){return !MODIFIERS.some(x=>x.id===id)?null:this.hasModifier(id)?0:40;}
    return null;
  }
  buyUnlock(kind,id) {
    const price=this.unlockPrice(kind,id);if(price===null||!this.spend(price))return false;
    ({hero:()=>this.unlockHero(id),sidearm:()=>this.unlockSidearm(id),paint:()=>this.unlockPaint(id),modifier:()=>this.unlockModifier(id)})[kind]();
    if(kind==='hero')this.see('hero',id);return true;
  }

  // ---------- 图鉴 ----------
  see(kind, id) {
    const a = this.data.seen[kind];
    if (!a || a.includes(id)) return false;
    a.push(id); this.mark(); return true;
  }
  hasSeen(kind, id) { const a = this.data.seen[kind]; return !!a && a.includes(id); }
  seenCount(kind) { const a = this.data.seen[kind]; return a ? a.length : 0; }

  // ---------- 成就 ----------
  hasAch(id) { return this.data.achievements.includes(id); }
  grantAch(id) {
    if (this.hasAch(id)) return false;
    this.data.achievements.push(id); this.mark(); return true;
  }

  // ---------- 统计 / 推进 ----------
  noteReach(floor) {
    if (floor > (this.data.stats.deepest | 0)) { this.data.stats.deepest = floor; this.mark(); }
    if (!this.data.reached[floor]) { this.data.reached[floor] = true; this.mark(); }
  }

  // ---------- 选择 ----------
  // Continuous settings edit a detached candidate. Legacy setters below keep
  // their API; callers needing confirmed publication use this explicit result.
  commitSelection(key, edit) {
    const pending = this._pendingSelection;
    if (pending && pending.write === saveStore.pendingWrite) {
      if (pending.key !== key) return { ok: false, committed: null, blocked: true, error: '请先重试上次选择，以确认保存状态' };
      const result = saveStore.reconcilePendingWrite();
      if (result.committed === null) return result;
      this._pendingSelection = null;
      if (result.ok) {
        this.data = structuredClone(result.envelope.meta);
        this._dirty = false; this._clearActive = false;
      }
      return result;
    }
    this._pendingSelection = null; // Another recovery path already resolved it.
    try {
      const candidate = structuredClone(this.data);
      edit(candidate);
      const pendingBefore = saveStore.pendingWrite;
      const result = saveStore.write(candidate, this._clearActive ? null : undefined);
      if (result.ok) {
        this.data = structuredClone(result.envelope.meta);
        this._dirty = false; this._clearActive = false;
      } else if (saveStore.pendingWrite && saveStore.pendingWrite !== pendingBefore) this._pendingSelection = { key, write: saveStore.pendingWrite };
      return result;
    } catch (err) { return { ok: false, committed: false, error: err.message }; }
  }

  setSel(k, v) { this.data.sel[k] = v; this.mark(); }
  // 难度档与"选择"同级：只影响强度倍率，不影响规则（规则归挑战词条）。
  get difficulty() { return this.data.difficulty || 'standard'; }
  setDifficulty(id) { this.data.difficulty = id; this.mark(); this.save(true); return this.difficulty; }
  get sel() { return this.data.sel; }

  reset() { this.data = blankMeta(); this.save(true); }
}

// 单例（游戏内共享一份）
export const meta = new Meta();
