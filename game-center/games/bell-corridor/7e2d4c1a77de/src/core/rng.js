// ============================================================
//  可复现的种子随机数（mulberry32 + xorshift 混合）
// ============================================================

export class RNG {
  constructor(seed) {
    this.seed = (seed >>> 0) || 1;
    this.s = this.seed;
  }
  next() {
    // mulberry32
    let t = (this.s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  float(a = 0, b = 1) { return a + this.next() * (b - a); }
  int(a, b) { return Math.floor(this.float(a, b + 1)); }
  range(a, b) { return this.float(a, b); }
  chance(p) { return this.next() < p; }
  pick(arr) { return arr[Math.floor(this.next() * arr.length)]; }
  pickWeighted(arr, weightFn) {
    let total = 0;
    for (const it of arr) total += weightFn(it);
    let r = this.next() * total;
    for (const it of arr) { r -= weightFn(it); if (r <= 0) return it; }
    return arr[arr.length - 1];
  }
  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  // 从数组中抽 n 个不重复元素
  sample(arr, n) {
    const c = arr.slice();
    this.shuffle(c);
    return c.slice(0, n);
  }
  // 高斯近似
  gauss(mean = 0, dev = 1) {
    let u = 0, v = 0;
    while (u === 0) u = this.next();
    while (v === 0) v = this.next();
    return mean + dev * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
}

let _counter = 0;
export function hashSeed(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h ^ (_counter++ * 2654435761)) >>> 0;
}

export function randomSeed() {
  return (Math.floor(Math.random() * 0xffffffff) ^ (Date.now() & 0xffffffff)) >>> 0;
}

export function seedToWords(seed) {
  const s = seed.toString(36).toUpperCase().padStart(6, '0');
  return s;
}
