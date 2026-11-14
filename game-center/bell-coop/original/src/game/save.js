import {HERO_MAP} from './heroes.js';
import {PAGE_COMBAT_MODE, validateCombatEnvelopeIdentity, validateCombatSessionIdentity} from '../experimental/combat/mode.js';
import {PAGE_COMPARISON,validateComparisonEnvelopeIdentity,validateComparisonSessionIdentity} from '../experimental/comparison/config.js';
// 一个原子 JSON 槽同时保存长期进度与活跃远征；写失败不会冒充成功。
import {WEAPON_ASSET_STORAGE_PREFIX} from '../weapon_assets_config.js';
export const SAVE_KEY = WEAPON_ASSET_STORAGE_PREFIX+':save:v2';
const BACKUP_KEY = SAVE_KEY + ':backup';
const TEMP_KEY = SAVE_KEY + ':pending';
export const SAVE_SCHEMA_VERSION = 6;
const MAX_BYTES = 4 * 1024 * 1024;
const dangerous = new Set(['__proto__', 'prototype', 'constructor']);

function checksum(e) {
  const raw = encode({ format: e.format, version: e.version, ...(e.schemaVersion === undefined ? {} : { schemaVersion: e.schemaVersion }), revision: e.revision, savedAt: e.savedAt, ...(e.combatMode === undefined ? {} : {combatMode:e.combatMode}), ...(e.comparisonMode===undefined?{}:{comparisonMode:e.comparisonMode}), meta: e.meta, active: e.active });
  let hash = 0x811c9dc5;
  for (let i = 0; i < raw.length; i++) hash = Math.imul(hash ^ raw.charCodeAt(i), 0x01000193) >>> 0;
  return hash.toString(16).padStart(8, '0');
}

export function encode(data) {
  return JSON.stringify(data, (k, v) => {
    if (dangerous.has(k)) throw new Error('存档包含非法字段');
    if (typeof v === 'number' && !Number.isFinite(v)) {
      if (v !== Infinity) throw new Error('存档包含无效数值');
      return { $number: 'Infinity' };
    }
    return v instanceof Set ? { $set: [...v] } : v;
  });
}
export function decode(raw) { return decodeSaveData(raw,MAX_BYTES); }
// The codec is shared; callers retain their own envelope byte budget.
export function decodeSaveData(raw,maxBytes) {
  if (!Number.isSafeInteger(maxBytes)||maxBytes<1||typeof raw !== 'string' || raw.length > maxBytes) throw new Error('存档为空或过大');
  return JSON.parse(raw, (k, v) => {
    if (dangerous.has(k)) throw new Error('存档包含非法字段');
    if (v && v.$number === 'Infinity' && Object.keys(v).length === 1) return Infinity;
    if (v && Array.isArray(v.$set) && Object.keys(v).length === 1) return new Set(v.$set);
    return v;
  });
}
export function validateEnvelope(e) {
  if (!e || e.format !== 'ember-descent' || e.version !== 2) throw new Error('不支持此存档版本');
  if (![undefined, 1, 2, 3, 4, 5, SAVE_SCHEMA_VERSION].includes(e.schemaVersion)) throw new Error('不支持此存档内部版本；原存档保留');
  validateCombatEnvelopeIdentity(e);
  validateComparisonEnvelopeIdentity(e);
  if (e.checksum !== undefined && (!Number.isSafeInteger(e.revision) || e.revision < 1 || e.checksum !== checksum(e))) throw new Error('存档完整性校验失败');
  const p = e.meta;
  if (!p || p.v !== 1 || !p.stats || !p.sel || !p.seen || !Number.isFinite(p.souls) || p.souls < 0) throw new Error('长期进度数据无效');
  for (const k of ['heroes', 'sidearms', 'modifiers', 'achievements', 'paints', 'tut']) {
    if (!Array.isArray(p[k]) || p[k].some(x => typeof x !== 'string') || p[k].length > 2000) throw new Error('解锁记录无效');
  }
  if (!Object.hasOwn(HERO_MAP,p.sel.hero) || p.heroes.some(id => !Object.hasOwn(HERO_MAP,id))) throw new Error('英雄记录无效');
  for (const v of Object.values(p.seen)) if (!Array.isArray(v) || v.some(x => typeof x !== 'string')) throw new Error('图鉴记录无效');
  for (const v of Object.values(p.stats)) if (!Number.isFinite(v) || v < 0) throw new Error('统计记录无效');
  for (const v of Object.values(p.sel)) if (typeof v !== 'string') throw new Error('配装记录无效');
  if (e.active !== null && e.active !== undefined) {
    const s = e.active;
    if (!Object.hasOwn(HERO_MAP,s.hero)) throw new Error('远征英雄身份无效');
    validateCombatSessionIdentity(s);
    validateComparisonSessionIdentity(s);
    if (![undefined, 1, 2, 3, 4, 5, SAVE_SCHEMA_VERSION].includes(s.schemaVersion)) throw new Error('不支持此远征 schemaVersion；原槽保留');
    if (s.version !== 1 || !Number.isInteger(s.seed) || ![1, 2, 3].includes(s.floor) || !s.player || !s.roomStates || !Array.isArray(s.rooms)) throw new Error('远征快照无效');
  }
  return e;
}

export class SaveStore {
  constructor() { this.error = ''; this.readError = ''; this.writeError = ''; this.recovered = false; this.pendingWrite = null; this.writeBlock = ''; }
  read() {
    this.readError = ''; this.error = this.writeError; this.recovered = false;
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      try { return validateEnvelope(decode(raw)); }
      catch (err) {
        // 新版本不能被旧程序自动降级覆盖。
        let header; try { header = JSON.parse(raw); } catch (_) {}
        if (header?.version > 2 || header?.schemaVersion > SAVE_SCHEMA_VERSION || header?.active?.schemaVersion > SAVE_SCHEMA_VERSION) throw err;
        const backup = localStorage.getItem(BACKUP_KEY);
        if (backup) { const e = validateEnvelope(decode(backup)); this.recovered = true; return e; }
        throw err;
      }
    } catch (err) { this.readError = err.message; this.error = err.message; return null; }
  }
  get blocked() { return !!(this.pendingWrite || this.writeBlock); }
  // Publication failure may leave old live objects. Every writer (including
  // Meta.tick/pagehide) shares this guard until the committed snapshot is applied.
  blockWrites(reason = '已提交进度正在恢复，请稍候') { this.writeBlock = reason; }
  releaseWrites() { if (!this.pendingWrite) this.writeBlock = ''; }
  cleanupPending() {
    try { localStorage.removeItem(TEMP_KEY); return ''; }
    catch (err) { return `进度已保存，临时槽清理失败：${err.message}`; }
  }
  finishWrite(envelope) {
    const warning = this.cleanupPending();
    this.pendingWrite = null; this.error = ''; this.writeError = '';
    return { ok: true, committed: true, envelope, ...(warning ? { warning } : {}) };
  }
  reconcilePendingWrite() {
    const pending = this.pendingWrite;
    if (!pending) return { ok: false, committed: false, error: '没有待确认的写入' };
    try {
      const current = localStorage.getItem(SAVE_KEY);
      if (current === pending.raw) return this.finishWrite(decode(pending.raw));
      if (current === pending.original) {
        this.pendingWrite = null; this.cleanupPending();
        this.error = this.writeError = '写入未提交，原进度已保留';
        return { ok: false, committed: false, error: this.error };
      }
      // Another value must not be overwritten by a compensating rollback.
      this.error = this.writeError = '存档提交状态待确认，已暂停自动保存与新交易';
    } catch (err) { this.error = this.writeError = `无法确认已保存进度：${err.message}`; }
    return { ok: false, committed: null, blocked: true, error: this.error };
  }
  write(meta, active, { replace = false } = {}) {
    if (this.blocked) return { ok: false, committed: null, blocked: true,
      error: this.writeBlock || this.writeError || '存档提交状态待确认，请先恢复已保存进度' };
    let attempted = false, original, raw;
    try {
      original = localStorage.getItem(SAVE_KEY);
      const previous = this.read();
      if (this.readError && !replace) throw new Error(`旧存档无法读取：${this.readError}。请先导入有效备份`);
      const e = { ...(PAGE_COMBAT_MODE === 'experimental' ? {combatMode:'pass-d'} : {}),...(PAGE_COMPARISON?{comparisonMode:PAGE_COMPARISON}:{}), format: 'ember-descent', version: 2, schemaVersion: SAVE_SCHEMA_VERSION, revision: (previous?.revision || 0) + 1, savedAt: new Date().toISOString(), meta, active: active === undefined ? (previous?.active || null) : active };
      e.checksum = checksum(e); validateEnvelope(e); raw = encode(e);
      if (raw.length > MAX_BYTES) throw new Error('存档过大');
      localStorage.setItem(TEMP_KEY, raw);
      const staged = localStorage.getItem(TEMP_KEY);
      if (staged !== raw) throw new Error('临时写入校验失败');
      validateEnvelope(decode(staged));
      if (previous) localStorage.setItem(BACKUP_KEY, encode(previous));
      attempted = true;
      localStorage.setItem(SAVE_KEY, raw);
      if (localStorage.getItem(SAVE_KEY) !== raw) throw new Error('主槽提交校验待确认');
      return this.finishWrite(decode(raw));
    } catch (err) {
      if (attempted) {
        this.pendingWrite = { raw, original };
        // A setItem wrapper can throw after applying, or readback can fail.
        // Re-read once; never roll back a possibly committed receipt.
        const reconciled = this.reconcilePendingWrite();
        if (reconciled.committed !== false) return reconciled;
      } else this.cleanupPending();
      this.writeError = err.message; this.error = err.message;
      return { ok: false, committed: false, error: this.error };
    }
  }
}
export const saveStore = new SaveStore();
