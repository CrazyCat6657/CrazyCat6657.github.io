export const FIXED_DT = 1 / 60;
const integer = (v, min = 0) => Number.isSafeInteger(v) && v >= min;
function data(value) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
  if (typeof value === 'number' && Number.isFinite(value)) return;
  if (Array.isArray(value)) { for (const x of value) data(x); return; }
  if (value && Object.getPrototypeOf(value) === Object.prototype) {
    for (const [k, v] of Object.entries(value)) { if (['__proto__','prototype','constructor'].includes(k)) throw TypeError('Unsafe task data'); data(v); } return;
  }
  throw TypeError('Task payload must be finite plain data');
}

// Explicit executors are registered by the owning runtime. Checkpoints contain
// data only; no callbacks, function source, eval or wall-clock handles.
export class TickScheduler {
  constructor() { this.tick = 0; this.generation = 0; this.nextId = 1; this.tasks = new Map(); this.executors = new Map(); }
  register(type, execute, validate = data) {
    if (typeof type !== 'string' || !type || this.executors.has(type) || typeof execute !== 'function' || typeof validate !== 'function') throw TypeError('Invalid task executor');
    this.executors.set(type, {execute, validate}); return this;
  }
  schedule(type, payload, delayMs) {
    const executor = this.executors.get(type);
    if (!executor) throw TypeError('Unknown task type');
    if (!Number.isFinite(delayMs) || delayMs < 0 || delayMs > 86400000) throw TypeError('Invalid task delay');
    data(payload); executor.validate(payload);
    const dueTick = this.tick + Math.ceil(delayMs * 60 / 1000 - 1e-10);
    if (!integer(dueTick) || !integer(this.nextId, 1) || this.nextId === Number.MAX_SAFE_INTEGER) throw RangeError('Task clock exhausted');
    const id = this.nextId++;
    this.tasks.set(id, {id, order:id, generation:this.generation, dueTick, type, payload:structuredClone(payload)}); return id;
  }
  cancel(id) { if (!integer(id, 1)) throw TypeError('Invalid task ID'); return this.tasks.delete(id); }
  cancelAll() { if (!integer(this.generation + 1)) throw RangeError('Task generation exhausted'); this.tasks.clear(); this.generation++; }
  advance() {
    if (!integer(this.tick + 1)) throw RangeError('Task clock exhausted');
    this.tick++;
    // A callback can cancel the remaining batch or schedule a new generation.
    const due = [...this.tasks.values()].filter(t => t.dueTick <= this.tick).sort((a,b) => a.dueTick-b.dueTick || a.order-b.order);
    for (const t of due) {
      if (!this.tasks.delete(t.id) || t.generation !== this.generation) continue;
      this.executors.get(t.type).execute(structuredClone(t.payload));
    }
  }
  checkpoint() { return structuredClone({version:1,tick:this.tick,generation:this.generation,nextId:this.nextId,tasks:[...this.tasks.values()]}); }
  validate(checkpoint) {
    const c = structuredClone(checkpoint);
    if (!c || Object.keys(c).sort().join() !== 'generation,nextId,tasks,tick,version' || c.version !== 1 || !integer(c.tick) || !integer(c.generation) || !integer(c.nextId,1) || !Array.isArray(c.tasks) || c.tasks.length > 1000) throw TypeError('Invalid scheduler checkpoint');
    const ids = new Set(), orders = new Set();
    for (const t of c.tasks) {
      if (!t || Object.keys(t).sort().join() !== 'dueTick,generation,id,order,payload,type' || !integer(t.id,1) || t.id >= c.nextId || !integer(t.order,1) || t.order !== t.id || ids.has(t.id) || orders.has(t.order) || t.generation !== c.generation || !integer(t.dueTick) || !this.executors.has(t.type)) throw TypeError('Invalid scheduled task');
      data(t.payload); this.executors.get(t.type).validate(t.payload); ids.add(t.id); orders.add(t.order);
    }
    return c;
  }
  restore(checkpoint) {
    const c = this.validate(checkpoint);
    this.tick=c.tick; this.generation=c.generation; this.nextId=c.nextId; this.tasks=new Map(c.tasks.map(t=>[t.id,t]));
  }
}
