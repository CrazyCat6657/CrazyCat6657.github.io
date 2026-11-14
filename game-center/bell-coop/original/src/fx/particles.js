import {presentationPlatform as gamePlatform} from '../runtime/game_platform.js';
// ============================================================
//  粒子 / 碎片 / 贴花 系统（全部对象池化，零运行时分配）
// ============================================================
import * as THREE from '../../vendor/three.module.js';

const POINT_VERT = `
attribute float aSize;
attribute vec3 aColor;
attribute float aAlpha;
varying vec3 vColor;
varying float vAlpha;
void main(){
  vColor = aColor;
  vAlpha = aAlpha;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * (320.0 / max(-mv.z, 0.1));
  gl_Position = projectionMatrix * mv;
}
`;

const POINT_FRAG = `
varying vec3 vColor;
varying float vAlpha;
void main(){
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float a = smoothstep(0.5, 0.10, d);
  if(a <= 0.001) discard;
  gl_FragColor = vec4(vColor, a * vAlpha);
  #include <colorspace_fragment>
}
`;

export class Particles {
  constructor(scene, max = 2600) {
    this.max = max;
    this.pos = new Float32Array(max * 3);
    this.col = new Float32Array(max * 3);
    this.siz = new Float32Array(max);
    this.alp = new Float32Array(max);
    this.vel = new Float32Array(max * 3);
    this.life = new Float32Array(max);
    this.maxLife = new Float32Array(max);
    this.grav = new Float32Array(max);
    this.drag = new Float32Array(max);
    this.size0 = new Float32Array(max);
    this.size1 = new Float32Array(max);
    this.alpha0 = new Float32Array(max);
    this.additive = new Uint8Array(max);
    this.head = 0;
    this.count = 0;

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(this.col, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(this.siz, 1));
    g.setAttribute('aAlpha', new THREE.BufferAttribute(this.alp, 1));
    g.setDrawRange(0, 0);
    this.geo = g;
    this.mat = new THREE.ShaderMaterial({
      vertexShader: POINT_VERT, fragmentShader: POINT_FRAG,
      transparent: true, depthWrite: false, depthTest: true,
      blending: THREE.AdditiveBlending,
    });
    this.points = new THREE.Points(g, this.mat);
    this.points.frustumCulled = false;
    this.points.renderOrder = 20;
    scene.add(this.points);
    this._tmpColor = new THREE.Color();
  }

  _slot() {
    const i = this.head;
    this.head = (this.head + 1) % this.max;
    if (this.count < this.max) this.count++;
    return i;
  }

  spawn(x, y, z, opt = {}) {
    const i = this._slot();
    const i3 = i * 3;
    this.pos[i3] = x; this.pos[i3 + 1] = y; this.pos[i3 + 2] = z;
    const spd = opt.speed ?? 3;
    let vx, vy, vz;
    if (opt.dir) {
      const [dx, dy, dz] = opt.dir;
      const sp = opt.spread ?? 0.5;
      vx = dx * spd + (Math.random() - 0.5) * spd * sp;
      vy = dy * spd + (Math.random() - 0.5) * spd * sp;
      vz = dz * spd + (Math.random() - 0.5) * spd * sp;
    } else {
      const th = Math.random() * Math.PI * 2, ph = Math.random() * Math.PI;
      vx = Math.sin(ph) * Math.cos(th) * spd;
      vy = Math.abs(Math.cos(ph)) * spd * (opt.upBias ?? 1);
      vz = Math.sin(ph) * Math.sin(th) * spd;
    }
    this.vel[i3] = vx; this.vel[i3 + 1] = vy; this.vel[i3 + 2] = vz;
    const c = opt.color ?? 0xffffff;
    this._tmpColor.set(c);
    this.col[i3] = this._tmpColor.r * (opt.bright ?? 1);
    this.col[i3 + 1] = this._tmpColor.g * (opt.bright ?? 1);
    this.col[i3 + 2] = this._tmpColor.b * (opt.bright ?? 1);
    const s0 = opt.size ?? 0.4, s1 = opt.sizeEnd ?? s0 * 0.2;
    this.size0[i] = s0; this.size1[i] = s1; this.siz[i] = s0;
    const a0 = opt.alpha ?? 1;
    this.alpha0[i] = a0; this.alp[i] = a0;
    this.life[i] = this.maxLife[i] = opt.life ?? 0.6;
    this.grav[i] = opt.gravity ?? 0;
    this.drag[i] = opt.drag ?? 2.0;
    return i;
  }

  // ---------- 预设效果 ----------
  muzzle(x, y, z, dirx, dirz, color = 0xffd27a, scale = 1) {
    if(gamePlatform().kind==='headless')gamePlatform().emit('presentation-particles',{method:'muzzle',args:Array.from(arguments)});
    for (let i = 0; i < 7; i++) {
      this.spawn(x, y, z, {
        dir: [dirx, 0.15, dirz], speed: 7 * scale, spread: 0.9,
        color, size: (0.5 + Math.random() * 0.6) * scale, sizeEnd: 0.05,
        life: 0.10 + Math.random() * 0.09, alpha: 1, drag: 5, bright: 2.0,
      });
    }
    this.spawn(x + dirx * 0.3, y, z + dirz * 0.3, {
      color, size: 1.5 * scale, sizeEnd: 0.2, life: 0.07, alpha: 0.9, drag: 8, bright: 1.6,
    });
  }

  impact(x, y, z, color = 0xffffff, n = 6, scale = 1) {
    if(gamePlatform().kind==='headless')gamePlatform().emit('presentation-particles',{method:'impact',args:Array.from(arguments)});
    for (let i = 0; i < n; i++) {
      this.spawn(x, y, z, {
        speed: 3.4 * scale, color, size: (0.22 + Math.random() * 0.3) * scale, sizeEnd: 0.03,
        life: 0.22 + Math.random() * 0.22, gravity: -6, drag: 3.5, bright: 1.5,
      });
    }
  }

  bloodburst(x, y, z, color = 0x9c1f2e, n = 10, scale = 1) {
    if(gamePlatform().kind==='headless')gamePlatform().emit('presentation-particles',{method:'bloodburst',args:Array.from(arguments)});
    for (let i = 0; i < n; i++) {
      this.spawn(x, y, z, {
        speed: 4.2 * scale, color, size: 0.35 * scale, sizeEnd: 0.05,
        life: 0.35 + Math.random() * 0.3, gravity: -14, drag: 2.4, bright: 1.2,
      });
    }
  }

  smoke(x, y, z, n = 6, color = 0x555555, scale = 1, life = 0.9) {
    if(gamePlatform().kind==='headless')gamePlatform().emit('presentation-particles',{method:'smoke',args:Array.from(arguments)});
    for (let i = 0; i < n; i++) {
      this.spawn(x + (Math.random() - .5) * .6, y + Math.random() * .4, z + (Math.random() - .5) * .6, {
        speed: 1.4 * scale, color, size: (0.9 + Math.random()) * scale, sizeEnd: 2.6 * scale,
        life: life * (0.6 + Math.random() * 0.7), alpha: 0.36, gravity: 1.1, drag: 1.6, bright: 1,
      });
    }
  }

  explosion(x, y, z, scale = 1, color = 0xffa030) {
    if(gamePlatform().kind==='headless')gamePlatform().emit('presentation-particles',{method:'explosion',args:Array.from(arguments)});
    const n = Math.floor(16 * scale);
    for (let i = 0; i < n; i++) {
      this.spawn(x, y, z, {
        speed: 9 * scale, spread: 1.2, color, size: 0.6 * scale, sizeEnd: 0.05,
        life: 0.28 + Math.random() * 0.3, drag: 3.2, bright: 2.4,
      });
    }
    for (let i = 0; i < Math.floor(10 * scale); i++) {
      this.spawn(x, y, z, {
        speed: 3 * scale, color: 0x2a2a2a, size: 1.2 * scale, sizeEnd: 3.4 * scale,
        life: 0.7 + Math.random() * 0.5, alpha: 0.4, gravity: 1.4, drag: 1.4,
      });
    }
    this.spawn(x, y + 0.3, z, { color: 0xffffff, size: 3.2 * scale, sizeEnd: 1.0 * scale, life: 0.14, alpha: 0.85, drag: 8, bright: 2 });
  }

  sparkle(x, y, z, color, n = 5, up = 2) {
    if(gamePlatform().kind==='headless')gamePlatform().emit('presentation-particles',{method:'sparkle',args:Array.from(arguments)});
    for (let i = 0; i < n; i++) {
      this.spawn(x, y, z, { speed: 1.8, color, size: 0.35, sizeEnd: 0.02, life: 0.5 + Math.random() * 0.5, gravity: -up * 0.4, alpha: 0.9, bright: 1.8 });
    }
  }

  ring(x, y, z, color, n = 22, radius = 0.4, speed = 5) {
    if(gamePlatform().kind==='headless')gamePlatform().emit('presentation-particles',{method:'ring',args:Array.from(arguments)});
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      this.spawn(x + Math.cos(a) * radius, y, z + Math.sin(a) * radius, {
        dir: [Math.cos(a), 0.12, Math.sin(a)], speed, spread: 0.1,
        color, size: 0.4, sizeEnd: 0.02, life: 0.4, drag: 2.6, bright: 1.8,
      });
    }
  }

  beam(x, y, z, dirx, dirz, color, len = 4, n = 14) {
    if(gamePlatform().kind==='headless')gamePlatform().emit('presentation-particles',{method:'beam',args:Array.from(arguments)});
    for (let i = 0; i < n; i++) {
      const t = Math.random() * len;
      this.spawn(x + dirx * t, y, z + dirz * t, {
        speed: 1.2, color, size: 0.32, sizeEnd: 0.02, life: 0.18 + Math.random() * 0.14, alpha: 0.9, bright: 2.2,
      });
    }
  }

  update(dt) {
    const { pos, vel, life, maxLife, siz, alp, size0, size1, alpha0, grav, drag } = this;
    let alive = 0;
    for (let i = 0; i < this.count; i++) {
      if (life[i] <= 0) { alp[i] = 0; siz[i] = 0; continue; }
      life[i] -= dt;
      const i3 = i * 3;
      const d = Math.max(0, 1 - drag[i] * dt);
      vel[i3] *= d; vel[i3 + 2] *= d;
      vel[i3 + 1] = vel[i3 + 1] * d + grav[i] * dt;
      pos[i3] += vel[i3] * dt;
      pos[i3 + 1] += vel[i3 + 1] * dt;
      pos[i3 + 2] += vel[i3 + 2] * dt;
      if (pos[i3 + 1] < 0.05 && grav[i] !== 0) { pos[i3 + 1] = 0.05; vel[i3 + 1] *= -0.25; vel[i3] *= 0.6; vel[i3 + 2] *= 0.6; }
      const t = Math.max(0, life[i]) / maxLife[i];
      const k = 1 - t;
      siz[i] = size0[i] * t + size1[i] * k;
      alp[i] = alpha0[i] * Math.min(1, t * 2.4);
      if (life[i] > 0) alive++;
    }
    this.geo.setDrawRange(0, this.count);
    this.geo.attributes.position.needsUpdate = true;
    this.geo.attributes.aColor.needsUpdate = true;
    this.geo.attributes.aSize.needsUpdate = true;
    this.geo.attributes.aAlpha.needsUpdate = true;
    this.aliveCount = alive;
  }

  clear() {
    this.life.fill(0); this.alp.fill(0); this.siz.fill(0);
    this.geo.setDrawRange(0, this.count);
  }
}

// ---------------- 碎片（受重力的小方块）----------------
export class Debris {
  constructor(scene, max = 220) {
    this.max = max;
    this.geo = new THREE.BoxGeometry(1, 1, 1);
    this.mat = new THREE.MeshStandardMaterial({ vertexColors: false, color: 0xffffff, roughness: 0.9, metalness: 0.1, flatShading: true });
    this.mesh = new THREE.InstancedMesh(this.geo, this.mat, max);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.mesh.castShadow = false;
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(max * 3), 3);
    this.mesh.material.vertexColors = false;
    this.mesh.count = 0;
    scene.add(this.mesh);
    this.items = [];
    for (let i = 0; i < max; i++) {
      this.items.push({ alive: false, p: new THREE.Vector3(), v: new THREE.Vector3(), r: new THREE.Euler(), rv: new THREE.Vector3(), s: new THREE.Vector3(1, 1, 1), life: 0, col: new THREE.Color() });
    }
    this.head = 0;
    this._m = new THREE.Matrix4();
    this._q = new THREE.Quaternion();
  }

  spawn(x, y, z, color, opt = {}) {
    const it = this.items[this.head];
    this.head = (this.head + 1) % this.max;
    it.alive = true;
    it.p.set(x, y, z);
    const s = opt.speed ?? 5;
    it.v.set((Math.random() - .5) * s, Math.random() * s * 0.9 + 1.5, (Math.random() - .5) * s);
    if (opt.dir) { it.v.x = opt.dir[0] * s; it.v.z = opt.dir[2] * s; it.v.y = opt.dir[1] * s + 2; }
    it.r.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    it.rv.set((Math.random() - .5) * 14, (Math.random() - .5) * 14, (Math.random() - .5) * 14);
    const sc = opt.size ?? (0.14 + Math.random() * 0.16);
    it.s.set(sc * (0.6 + Math.random() * 0.8), sc * (0.6 + Math.random() * 0.8), sc * (0.6 + Math.random() * 0.8));
    it.life = opt.life ?? (0.9 + Math.random() * 1.2);
    it.col.set(color);
    return it;
  }

  burst(x, y, z, color, n = 8, scale = 1) {
    for (let i = 0; i < n; i++) this.spawn(x, y + 0.2, z, color, { speed: 5 * scale });
  }

  update(dt) {
    let idx = 0;
    for (const it of this.items) {
      if (!it.alive) continue;
      it.life -= dt;
      if (it.life <= 0) { it.alive = false; continue; }
      it.v.y -= 22 * dt;
      it.p.addScaledVector(it.v, dt);
      if (it.p.y < 0.1) { it.p.y = 0.1; it.v.y *= -0.34; it.v.x *= 0.7; it.v.z *= 0.7; it.rv.multiplyScalar(0.7); }
      it.r.x += it.rv.x * dt; it.r.y += it.rv.y * dt; it.r.z += it.rv.z * dt;
      const sc = Math.min(1, it.life * 2.2);
      this._q.setFromEuler(it.r);
      this._m.compose(it.p, this._q, new THREE.Vector3(it.s.x * sc, it.s.y * sc, it.s.z * sc));
      this.mesh.setMatrixAt(idx, this._m);
      this.mesh.instanceColor.setXYZ(idx, it.col.r, it.col.g, it.col.b);
      idx++;
    }
    this.mesh.count = idx;
    this.mesh.instanceMatrix.needsUpdate = true;
    this.mesh.instanceColor.needsUpdate = true;
  }

  clear() { for (const it of this.items) it.alive = false; this.mesh.count = 0; }
}

// ---------------- 地面贴花（弹孔 / 焦痕 / 血渍）----------------
export class Decals {
  constructor(scene, max = 90) {
    this.max = max;
    this.items = [];
    const geo = new THREE.PlaneGeometry(1, 1);
    for (let i = 0; i < max; i++) {
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
        color: 0x000000, transparent: true, opacity: 0, depthWrite: false, blending: THREE.NormalBlending, side: THREE.DoubleSide,
      }));
      m.rotation.x = -Math.PI / 2;
      m.position.y = 0.03;
      m.renderOrder = 1;
      m.visible = false;
      m.frustumCulled = false;
      scene.add(m);
      this.items.push({ mesh: m, life: 0, maxLife: 1 });
    }
    this.head = 0;
  }
  add(x, z, size = 0.6, color = 0x0a0a0a, opacity = 0.7, life = 26) {
    const it = this.items[this.head];
    this.head = (this.head + 1) % this.max;
    it.mesh.visible = true;
    it.mesh.position.set(x, 0.03, z);
    it.mesh.rotation.z = Math.random() * Math.PI * 2;
    it.mesh.scale.setScalar(size);
    it.mesh.material.color.set(color);
    it.mesh.material.opacity = opacity;
    it.life = it.maxLife = life;
  }
  update(dt) {
    for (const it of this.items) {
      if (!it.mesh.visible) continue;
      it.life -= dt;
      if (it.life <= 0) { it.mesh.visible = false; continue; }
      if (it.life < 4) it.mesh.material.opacity *= Math.max(0, 1 - dt * 0.35);
    }
  }
  clear() { for (const it of this.items) { it.mesh.visible = false; it.life = 0; } }
}
