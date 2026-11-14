import * as THREE from '../../vendor/three.module.js';
import { TEAM } from '../core/constants.js';
import { reportStatusDamage } from './damage_feedback.js';
import { tickAsh } from './ash_status.js';
import { playerLockTarget } from '../experimental/consumables/visibility.js';
import { bossTakeDamage, bossApplyStatus, bossDie, bossRemove, bossUpdateDeath, bossContact, bossRing, bossArc, moveToward } from './boss_helpers.js';
import { bossWarning, queueBossSummons } from './boss_chapter_actions.js';
import {applyBlenderActorVisual,disposeActorVisual} from '../art/actor_assets.js';

const TAU = Math.PI * 2;
// The six silhouettes use separate geometry and moving parts, not recolored old rigs.
export function buildVariant(kind, color) {
  const group = new THREE.Group(), parts = [];
  const metal = new THREE.MeshStandardMaterial({ color: '#40434b', metalness: 0.8, roughness: 0.45 });
  const glow = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.1 });
  function add(geo, x, y, z, mat = metal) {
    const mesh = new THREE.Mesh(geo, mat); mesh.position.set(x, y, z); group.add(mesh); return mesh;
  }
  if (kind === 'chain_hunter') {
    add(new THREE.BoxGeometry(1.7, 1.2, 3), 0, 1.1, 0);
    for (const x of [-1, 1]) {
      const tusk = add(new THREE.ConeGeometry(0.3, 1.9, 6), x, 1.3, 1.8, glow); tusk.rotation.x = Math.PI / 2;
      parts.push(add(new THREE.BoxGeometry(0.5, 1.4, 0.6), x, 0.6, -0.8));
    }
  } else if (kind === 'iron_drummer') {
    const drum = add(new THREE.CylinderGeometry(1.65, 1.65, 1.2, 12), 0, 1.3, 0, glow); drum.rotation.x = Math.PI / 2;
    for (const x of [-2, 2]) parts.push(add(new THREE.BoxGeometry(0.55, 3, 0.55), x, 1.6, 0));
    add(new THREE.BoxGeometry(1.4, 1.4, 1), 0, 2.7, -0.5);
  } else if (kind === 'mirror_cantor') {
    add(new THREE.ConeGeometry(1, 3.4, 6), 0, 1.9, 0);
    for (const x of [-2, 0, 2]) {
      const m = add(new THREE.OctahedronGeometry(0.85), x, 3, 0, glow); m.scale.set(0.8, 1.7, 0.3); parts.push(m);
    }
  } else if (kind === 'grave_shepherd') {
    add(new THREE.ConeGeometry(1.4, 3.2, 7), 0, 1.7, 0);
    add(new THREE.BoxGeometry(4, 0.3, 0.4), 0, 3.4, 0);
    for (const x of [-1.6, 1.6]) parts.push(add(new THREE.CylinderGeometry(0.4, 0.55, 1.2, 8), x, 2.5, 0, glow));
  } else if (kind === 'slag_crab') {
    const shell = add(new THREE.SphereGeometry(1.8, 12, 8), 0, 1.1, 0); shell.scale.set(1.4, 0.65, 1);
    for (const x of [-2.3, 2.3]) {
      parts.push(add(new THREE.BoxGeometry(1.7, 0.8, 1.6), x, 1.1, 1, glow));
      for (const z of [-1.3, 0.2]) add(new THREE.BoxGeometry(1.7, 0.35, 0.35), x, 0.5, z);
    }
  } else {
    add(new THREE.OctahedronGeometry(1.3), 0, 2.2, 0, glow);
    for (let i = 0; i < 4; i++) {
      const wing = add(new THREE.BoxGeometry(2.8, 0.25, 0.7), Math.cos(i * TAU / 4) * 2, 2.2, Math.sin(i * TAU / 4) * 2);
      wing.rotation.y = -i * TAU / 4; parts.push(wing);
    }
  }
  return { group, parts };
}

const CONFIG = {
  chain_hunter: { hp: 900, color: '#f3aa67', patterns: ['hunt_lunge', 'chain_fan', 'pack_call'] },
  iron_drummer: { hp: 900, color: '#eed073', patterns: ['drum_beats', 'march_cross', 'guard_call'] },
  mirror_cantor: { hp: 780, color: '#82dfff', patterns: ['mirror_volley', 'mirror_step', 'glass_call'] },
  grave_shepherd: { hp: 780, color: '#b19adf', patterns: ['grave_rows', 'herd_spiral', 'herd_call'] },
  slag_crab: { hp: 820, color: '#ff9350', patterns: ['claw_sweep', 'slag_trail', 'furnace_call'] },
  storm_archon: { hp: 820, color: '#9deaff', patterns: ['storm_orbit', 'thunder_lattice', 'tempest_call'] },
};

class ExpeditionBoss {
  constructor(game, x, z, kind) {
    const cfg = CONFIG[kind];
    Object.assign(this, { game, id: 'boss', bossType: kind, isBoss: true, team: TEAM.ENEMY,
      x, z, anchorX: x, anchorZ: z, vx: 0, vz: 0, yaw: 0, radius: kind === 'slag_crab' ? 2.1 : 1.55,
      r: 1.55, minY: 0, alive: true, maxHp: cfg.hp, hp: cfg.hp, phase: 0,
      state: 'intro', stateT: 2.4, animT: 0, hitFlash: 0, contactCd: 0, deadT: 0,
      pattern: null, patternT: 0, patternStep: 0, cooldown: 0, lastPattern: '', baseScale: 1,
      hitColor: cfg.color, status: { burn: 0, poison: 0, slow: 0, freeze: 0 }, telegraphs: [],
      variantState: { cycle: 0, shotT: 0, moveAngle: 0, dashX: 0, dashZ: 1 },
    });
    this.r = this.radius;
    this.rig = buildVariant(kind, cfg.color);applyBlenderActorVisual(this.rig,kind); this.group = this.rig.group;
    this.group.position.set(x, 0, z); game.scene.add(this.group);
  }
  get phaseData() { return { name: this.phase ? '狂鸣' : '苏醒', cn: this.phase ? '狂鸣' : '苏醒', color: this.hitColor, rate: this.phase ? 1.2 : 1 }; }
  takeDamage(n, opts = {}) { return bossTakeDamage(this, n, opts, [{ at: 0.5, phase: 1 }]); }
  applyStatus(kind, dur, opts = {}) { bossApplyStatus(this, kind, dur, opts); }
  enterPhase(p) {
    this.phase = p; this.game.setBossPhase(p); this.syncPhaseVisual();
    // A phase change never interrupts damage or adds invulnerability.
    this.game.toast(`${this.cn} · 狂鸣`, '攻势加快，留意地面预警。', this.hitColor);
  }
  syncPhaseVisual() { this.group.scale.setScalar(1 + this.phase * 0.1); }
  die(opts = {}) { bossDie(this,opts); }
  remove() { disposeActorVisual(this.group);bossRemove(this); }
  updateDeath(dt) { bossUpdateDeath(this, dt, { colorA: this.hitColor }); }
  shoot(x, z, angle, speed = 9, kind = 'bolt') {
    this.game.projectiles.spawn({ x, z, y: 1.4, dx: Math.cos(angle), dz: Math.sin(angle), speed,
      damage: 1, life: 5, color: this.hitColor, team: TEAM.ENEMY, size: 0.28, radius: 0.3, kind, owner: this });
  }
  beginPattern() {
    const s = this.variantState, patterns = CONFIG[this.bossType].patterns;
    this.pattern = patterns[s.cycle % patterns.length]; s.cycle++;
    this.lastPattern = this.pattern; this.patternT = 0; this.patternStep = 0; s.shotT = 0;
    const p = playerLockTarget(this), d = Math.hypot(p.x - this.x, p.z - this.z) || 1;
    s.dashX = (p.x - this.x) / d; s.dashZ = (p.z - this.z) / d;
    if(this.game.notifyEnemyAttack)this.game.notifyEnemyAttack(this);else this.game.weaponAssets?.observeEnemyAttack?.(this);
    if (this.pattern === 'hunt_lunge') {
      for (let i = 1; i <= 4; i++) bossWarning(this, this.x + s.dashX * i * 2.3, this.z + s.dashZ * i * 2.3, 1.3, 0.95, 0, this.hitColor);
    } else if (this.pattern === 'drum_beats') {
      for (let i = 0; i < 3; i++) bossWarning(this, p.x + (i - 1) * 3.8, p.z, 1.7, 0.95 + i * 0.4, 1, this.hitColor);
    } else if (this.pattern === 'grave_rows') {
      for (let i = -2; i <= 2; i++) bossWarning(this, this.anchorX + i * 4.2, p.z, 1.6, 1.1 + (i + 2) * 0.18, 1, this.hitColor);
    } else if (this.pattern === 'mirror_step') {
      const pos = this.game.clampToRoom(this.anchorX - (this.x - this.anchorX), this.anchorZ - (this.z - this.anchorZ), this.radius + 1);
      s.blinkX = pos.x; s.blinkZ = pos.z;
      bossWarning(this, pos.x, pos.z, 1.9, 0.85, 0, this.hitColor);
    } else if (this.pattern === 'thunder_lattice') {
      // Staggered lightning leaves a full diagonal escape lane through the grid.
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) if (i !== j)
        bossWarning(this, p.x + i * 4.5, p.z + j * 4.5, 1.65, 1 + (i + 1) * 0.25, 1, this.hitColor);
    } else if (this.pattern.endsWith('_call')) {
      const kinds = { chain_hunter: ['hound', 'grunt'], iron_drummer: ['shielder', 'grunt'],
        mirror_cantor: ['abyss_grunt', 'abyss_grunt'], grave_shepherd: ['hound', 'hound', 'abyss_grunt'],
        slag_crab: ['shielder', 'hound'], storm_archon: ['orb_guard', 'gilded_hound'] };
      queueBossSummons(this, kinds[this.bossType]);
    }
  }
  update(dt, world) {
    // Death is checked before status ticking: corpses cannot keep reporting poison damage.
    if (!this.alive) { this.updateDeath(dt); return; }
    this.animT += dt; this.hitFlash = Math.max(0, this.hitFlash - dt * 3);
    for (const kind of ['burn', 'poison']) if (this.status[kind] > 0) {
      this.status[kind] -= dt; const damage = (this.status[`${kind}Dps`] || 0) * dt;
      this.hp -= damage; reportStatusDamage(this, kind, damage, 3.8);
      if (this.hp <= 0) { this.hp = 0; this.die(this.status[`${kind}BuildSource`]||{}); return; }
    }
    if (tickAsh(this, dt, 3.8)) return;
    if (this.state === 'intro') {
      this.stateT -= dt;
      if (this.stateT > 0) return;
      this.state = 'pattern'; this.beginPattern();
      // HazardZones already advanced this frame. Start the action clock next frame
      // so the first intro action receives the same full warning as later cycles.
      return;
    }
    const s = this.variantState, p = playerLockTarget(this), rate = this.phase ? 1.15 : 1;
    // Movement commitments and area warnings share real simulation time.
    // Frenzy increases shot cadence and orbit speed without shortening warnings.
    this.patternT += dt; s.shotT -= dt * rate;
    s.moveAngle += dt * (this.phase ? 0.8 : 0.55);
    this.vx *= Math.max(0, 1 - dt * 5); this.vz *= Math.max(0, 1 - dt * 5);
    const t = this.patternT, pattern = this.pattern;
    if (this.bossType === 'chain_hunter') {
      if (pattern === 'hunt_lunge' && t >= 0.95 && t < 1.55) {
        this.vx = s.dashX * 17; this.vz = s.dashZ * 17;
      } else if (pattern === 'chain_fan') {
        moveToward(this, dt, p.x + Math.cos(s.moveAngle) * 6, p.z + Math.sin(s.moveAngle) * 6, 3.4);
        if (t > 0.75 && s.shotT <= 0) { bossArc(this, 5, 1.0, Math.atan2(p.z - this.z, p.x - this.x), 10, 1, this.hitColor); s.shotT = 0.65; }
      }
    } else if (this.bossType === 'iron_drummer') {
      if (pattern === 'march_cross') {
        moveToward(this, dt, this.anchorX + (s.cycle % 2 ? 7 : -7), this.anchorZ, 2.8);
        if (t > 0.8 && s.shotT <= 0) {
          for (let i = 0; i < 4; i++) for (let j = -1; j <= 1; j++) this.shoot(this.x, this.z, i * TAU / 4 + j * 0.12, 7 + Math.abs(j) * 2);
          s.shotT = 0.8;
        }
      } else if (pattern === 'drum_beats' && t > 1 && s.shotT <= 0) { bossRing(this, 14, 6, 1, 0, this.hitColor); s.shotT = 1; }
    } else if (this.bossType === 'mirror_cantor') {
      moveToward(this, dt, this.anchorX + Math.cos(s.moveAngle) * 7, this.anchorZ + Math.sin(s.moveAngle) * 7, 3);
      if (pattern === 'mirror_volley' && t > 0.9 && s.shotT <= 0) {
        for (const offset of [-3, 0, 3]) {
          const x = this.x + Math.cos(s.moveAngle) * offset, z = this.z + Math.sin(s.moveAngle) * offset;
          for (const spread of [-0.12, 0.12]) this.shoot(x, z, Math.atan2(p.z - z, p.x - x) + spread, 10);
        }
        s.shotT = 0.75;
      } else if (pattern === 'mirror_step' && t > 0.85 && this.patternStep === 0) {
        const oldX = this.x, oldZ = this.z;
        bossWarning(this, oldX, oldZ, 2.4, 1.2, 1, this.hitColor);
        this.x = s.blinkX; this.z = s.blinkZ; this.patternStep = 1;
        bossRing(this, 16, 7, 1, s.moveAngle, this.hitColor);
      }
    } else if (this.bossType === 'grave_shepherd') {
      // The shepherd retreats while its herd attacks, then advances behind a spiral.
      const away = pattern === 'herd_spiral' ? -1 : 1;
      moveToward(this, dt, this.x + (this.x - p.x) * away, this.z + (this.z - p.z) * away, 1.8);
      if (pattern === 'herd_spiral' && t > 0.7 && s.shotT <= 0) {
        for (let i = 0; i < 3; i++) this.shoot(this.x, this.z, t * 2.2 + i * TAU / 3, 7);
        s.shotT = 0.16;
      }
    } else if (this.bossType === 'slag_crab') {
      moveToward(this, dt, this.anchorX + Math.sin(s.moveAngle) * 9, this.anchorZ + Math.cos(s.moveAngle) * 3, 3.8);
      if (pattern === 'claw_sweep' && t > 0.8 && s.shotT <= 0) {
        for (const side of [-1, 1]) for (let i = 0; i < 5; i++) this.shoot(this.x + side * 2, this.z, Math.atan2(p.z - this.z, p.x - this.x) + side * (0.2 + i * 0.16), 8);
        s.shotT = 0.9;
      } else if (pattern === 'slag_trail' && t > 0.65 && s.shotT <= 0) {
        bossWarning(this, this.x, this.z, 1.9, 1.1, 1, this.hitColor); s.shotT = 0.55;
      }
    } else {
      moveToward(this, dt, this.anchorX + Math.cos(s.moveAngle) * 8, this.anchorZ + Math.sin(s.moveAngle) * 8, 5.2);
      if (pattern === 'storm_orbit' && t > 0.8 && s.shotT <= 0) {
        // Counter-rotating pinwheels leave broad gaps instead of an unbroken ring.
        for (let i = 0; i < 4; i++) {
          this.shoot(this.x, this.z, s.moveAngle * 2 + i * TAU / 4, 9);
          this.shoot(this.x, this.z, -s.moveAngle * 2 + i * TAU / 4, 6);
        }
        s.shotT = 0.24;
      }
    }
    this.x += this.vx * dt; this.z += this.vz * dt;
    world.resolveCircle(this, this.radius, true);
    this.group.position.set(this.x, 0, this.z);
    this.yaw = Math.atan2(p.x - this.x, p.z - this.z); this.group.rotation.y = this.yaw;
    for (let i = 0; i < this.rig.parts.length; i++) this.rig.parts[i].rotation.z = Math.sin(this.animT * 3 + i) * 0.16;
    bossContact(this, dt);
    if (t > (pattern.endsWith('_call') ? 2.4 : 3.6)) this.beginPattern();
  }
}

export class ChainHunter extends ExpeditionBoss { constructor(g, x, z) { super(g, x, z, 'chain_hunter'); } }
export class IronDrummer extends ExpeditionBoss { constructor(g, x, z) { super(g, x, z, 'iron_drummer'); } }
export class MirrorCantor extends ExpeditionBoss { constructor(g, x, z) { super(g, x, z, 'mirror_cantor'); } }
export class GraveShepherd extends ExpeditionBoss { constructor(g, x, z) { super(g, x, z, 'grave_shepherd'); } }
export class SlagCrab extends ExpeditionBoss { constructor(g, x, z) { super(g, x, z, 'slag_crab'); } }
export class StormArchon extends ExpeditionBoss { constructor(g, x, z) { super(g, x, z, 'storm_archon'); } }
