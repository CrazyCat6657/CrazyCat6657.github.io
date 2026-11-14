// ============================================================
//  动态光源池（枪口火光 / 爆炸 / 子弹照明）
// ============================================================
import * as THREE from '../../vendor/three.module.js';

export class FlashLights {
  constructor(scene, count = 8) {
    this.pool = [];
    for (let i = 0; i < count; i++) {
      const l = new THREE.PointLight(0xffffff, 0, 12, 1.8);
      l.visible = false;
      l.castShadow = false;
      scene.add(l);
      this.pool.push({ light: l, t: 0, dur: 0.2, peak: 10, follow: null, offset: new THREE.Vector3() });
    }
    this.head = 0;
  }
  flash(x, y, z, color, intensity = 14, dur = 0.16, follow = null, offset = null) {
    const it = this.pool[this.head];
    this.head = (this.head + 1) % this.pool.length;
    it.light.color.set(color);
    it.light.position.set(x, y, z);
    it.light.intensity = intensity;
    it.light.visible = true;
    it.t = dur; it.dur = dur; it.peak = intensity;
    it.follow = follow;
    if (offset) it.offset.copy(offset);
    return it;
  }
  update(dt) {
    for (const it of this.pool) {
      if (it.t <= 0) { if (it.light.visible) it.light.visible = false; continue; }
      it.t -= dt;
      const k = Math.max(0, it.t / it.dur);
      it.light.intensity = it.peak * k * k;
      if (it.follow) {
        it.light.position.set(it.follow.position.x + it.offset.x, it.follow.position.y + it.offset.y, it.follow.position.z + it.offset.z);
      }
      if (it.t <= 0) it.light.visible = false;
    }
  }
  reset() { for (const it of this.pool) { it.t = 0; it.light.visible = false; it.light.intensity = 0; it.follow = null; } }
}

// 常亮动态灯（用于跟随玩家的手持光 / 危险区照明）
export class FollowLights {
  constructor(scene, count = 2) {
    this.pool = [];
    for (let i = 0; i < count; i++) {
      const l = new THREE.PointLight(0xffffff, 0, 16, 1.7);
      scene.add(l);
      this.pool.push(l);
    }
  }
  get(i) { return this.pool[i % this.pool.length]; }
}

// 固定灯光池 —— 灯光数量恒定，避免着色器频繁重编译
//
// 分配策略：
//   前 (count - reserve) 盏  → 房间静态灯（地板环境光 / 火盆 / 炬火 / 水晶 / 祭坛…）
//   末尾 reserve 盏          → 运行时动态灯（召唤物 / 持续型危险区）
// 全部一次性建在场景里，只改 intensity/position/color，从不增删对象，
// 这样材质程序在整个生命周期内只编译一次。
export class FixedLightPool {
  constructor(scene, count = 8, reserve = 2) {
    this.pool = [];
    this.reserve = Math.max(0, Math.min(reserve, count - 1));
    for (let i = 0; i < count; i++) {
      const l = new THREE.PointLight(0xffffff, 0, 15, 1.7);
      l.position.set(0, 2, 0);
      scene.add(l);
      this.pool.push({ light: l, base: 0, flicker: 0, phase: Math.random() * 10, active: false });
    }
    this.head = 0;
    this.dyn = 0;
  }
  // 房间静态灯可用槽位数
  get roomSlots() { return this.pool.length - this.reserve; }
  clear() {
    this.head = 0; this.dyn = 0;
    for (const it of this.pool) { it.active = false; it.light.intensity = 0; }
  }
  _use(it, x, y, z, color, intensity, distance, flicker) {
    it.active = true;
    it.light.position.set(x, y, z);
    it.light.color.set(color);
    it.light.distance = distance;
    it.base = intensity;
    it.flicker = flicker;
    it.light.intensity = intensity;
    return it;
  }
  // 房间静态灯
  add(x, y, z, color, intensity, distance = 15, flicker = 0) {
    const it = this.pool[this.head % this.roomSlots];
    this.head++;
    return this._use(it, x, y, z, color, intensity, distance, flicker);
  }
  // 运行时动态灯（召唤物等）。占用保留槽位，不会挤掉房间的环境光。
  addDynamic(x, y, z, color, intensity, distance = 12, flicker = 0) {
    if (this.reserve <= 0) return null;
    const base = this.roomSlots;
    const it = this.pool[base + (this.dyn % this.reserve)];
    this.dyn++;
    return this._use(it, x, y, z, color, intensity, distance, flicker);
  }
  update(dt, t) {
    for (const it of this.pool) {
      if (!it.active) continue;
      if (it.flicker > 0) it.light.intensity = it.base * (1 + Math.sin(t * 11.7 + it.phase) * it.flicker * 0.5 + Math.sin(t * 27.3 + it.phase) * it.flicker * 0.25);
    }
  }
}
