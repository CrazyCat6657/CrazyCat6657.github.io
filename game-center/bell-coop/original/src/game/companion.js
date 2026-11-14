import { isTamer, newPetGrowth, petMaxHp, petDamageMul, petInterval, petDown, petTick } from './hero_growth_v3.js';
import { petRaging, PET_RAGE_DURATION } from './hero_feedback.js';
// ============================================================
//  钟炉异兽 / Companion（任务书 §23–§26 + §47 安全规则）
//
//  它不是"无人机"，而是属于这个世界怪物生态的一只小兽。
//
//  §47 的安全规则**逐条落到实现上**：
//  · 不计入敌人数量        → 它**不在** game.enemies 里，而是独立对象。
//                            于是"数敌人开锁门 / 判清房"天然看不到它。
//  · 不阻止清房            → 同上。
//  · 不占用敌人 Portal     → 同上。
//  · 不会卡门 / 卡走廊      → 它不与几何做碰撞（贴着地面滑行），
//                            因此不可能堵住门洞；这是**设计选择**而不是疏漏。
//  · 换房不留在旧房        → 距离超过阈值时"合理跟进"（落在玩家身后），不会瞬移到镜头中央。
//  · 不会永久死亡          → 被击倒后失去战斗能力；清房后逐渐恢复。
//  · 无限召唤复制          → 单实例；只有开新局才重建。
//  · Boss 弹幕错误目标      → 它不在 hitboxes 里，敌人与 Boss 无法把它当目标；
//                            "吸引火力"用"替玩家吸收伤害"来表达，安全且效果一致。
//
//  §56 性能边界：模型只复用缓存几何与缓存材质，不新增 BufferGeometry、不新增灯光。
// ============================================================
import * as THREE from '../../vendor/three.module.js';
import { boxGeo, cylGeo, torusGeo, getMaterial } from '../art/materials.js';
import { TEAM } from '../core/constants.js';

// 三个进化方向（§25）
export const EVOLUTIONS = [
  {
    id: 'horn', cn: '角', en: 'Horn',
    desc: '冲锋 · 近战 · 击退：扑咬带击退，扑杀指令变成一次突进',
    color: '#ff8a3c',
  },
  {
    id: 'shell', cn: '甲', en: 'Shell',
    desc: '防御 · 吸引火力 · 生存：护甲增厚，并替你吸收一部分伤害',
    color: '#9aa4ae',
  },
  {
    id: 'sac', cn: '共鸣囊', en: 'Resonance Sac',
    desc: '远程声波 · 辅助 · 控场：远程声波攻击并减速敌人',
    color: '#8ad8ff',
  },
];
export const EVO_MAP = Object.fromEntries(EVOLUTIONS.map((e) => [e.id, e]));
// The same evolution rules are used by detached party planning and live pets.
export function applyCompanionEvolution(c,dir) {
 if(!c||!EVO_MAP[dir]||c.stage>=2||c.stage===1&&c.evo!==dir)return false;
 const hp=c.hp,alive=c.alive,oldMax=c.maxHp;
 if(c.stage===0){c.evo=dir;c.stage=1;c.maxHp={shell:10,horn:8,sac:7}[dir];c.hp=Math.min(c.maxHp,c.hp+{shell:4,horn:2,sac:1}[dir]);}
 else{c.stage=2;c.maxHp+={shell:6,horn:4,sac:3}[dir];c.hp=c.maxHp;}
 if(c.growth){c.maxHp=petMaxHp(c);c.alive=alive;c.hp=alive?Math.min(c.maxHp,hp+Math.max(0,c.maxHp-oldMax)):0;}
 return true;
}

export function evoById(id) { return EVO_MAP[id] || null; }

export class Companion {
  constructor(game, name = '钟炉幼兽') {
    this.game = game;
    this.ownerPlayerId=game.playerId||game.player?.id||'player';
    this.id=this.ownerPlayerId==='player'?'companion:native':`companion:${this.ownerPlayerId}`;
    this.name = name;
    this.x = game.player.x + 1.6;
    this.z = game.player.z + 1.6;
    this.vx = 0; this.vz = 0;
    this.maxHp = 6;
    this.hp = 6;
    this.alive = true;          // 战斗能力（false = 被击倒，等待恢复）
    this.downedT = 0;
    this.evo = null;            // 'horn' | 'shell' | 'sac'
    this.stage = 0;             // 进化次数（0–2）
    this.fireCd = 0;
    this.chargeT = 0;           // 扑杀突进剩余时间
    this.guardT = 0;            // 甲方向：护主窗口
    this.absorbCd = 0;
    this.animT = 0;
    this.rageT = 0;
    this.rageArmor = 0;
    if(isTamer(game))this.growth=newPetGrowth();
    this.build();
  }

  build() {
    const g = new THREE.Group();
    this.group = g;
    g.position.set(this.x, 0, this.z);
    this.game.scene.add(g);
    const dark = getMaterial('#3a3a42', { roughness: 0.7, metalness: 0.35, flat: true });
    const hide = getMaterial('#5a4030', { roughness: 0.85, metalness: 0.05, flat: true });
    const ember = getMaterial('#ff7a2e', { emissive: 0xff5a10, emissiveIntensity: 2.2, flat: true });
    const bone = getMaterial('#c8c0a8', { roughness: 0.7, metalness: 0.1, flat: true });
    // 身体（贴着地面的小兽比例：低、长、有背脊）
    const body = new THREE.Mesh(boxGeo(0.62, 0.42, 0.96), hide);
    body.position.y = 0.42;
    g.add(body);
    this.body = body;
    const head = new THREE.Mesh(boxGeo(0.40, 0.34, 0.40), hide);
    head.position.set(0, 0.60, 0.52);
    g.add(head);
    this.head = head;
    if (this.growth) {
      const eyes = new THREE.Group();
      const red = getMaterial('#ff2525', { emissive: 0xff1010, emissiveIntensity: 3, flat: true });
      for (const x of [-.13, .13]) {
        const eye = new THREE.Mesh(boxGeo(.12, .08, .10), red);
        // Raised onto the brow so both glowing eyes read from the overhead camera.
        eye.position.set(x, .80, .63);eyes.add(eye);
      }
      eyes.visible = false;g.add(eyes);this.rageEyes = eyes;
    }
    // 四肢（短、粗 —— 俯视角下"虫兽"轮廓）
    for (const [sx, sz] of [[-0.22, 0.30], [0.22, 0.30], [-0.22, -0.30], [0.22, -0.30]]) {
      const leg = new THREE.Mesh(cylGeo(0.07, 0.09, 0.34, 5), dark);
      leg.position.set(sx, 0.17, sz);
      g.add(leg);
    }
    // 尾（带余烬核心）
    const tail = new THREE.Mesh(cylGeo(0.05, 0.08, 0.5, 5), dark);
    tail.position.set(0, 0.44, -0.62);
    tail.rotation.x = Math.PI / 2.6;
    g.add(tail);
    this.tail = tail;
    // 胸口炉核（世界身份的锚点：它属于熔炉生态）
    const core = new THREE.Mesh(cylGeo(0.10, 0.10, 0.10, 6), ember);
    core.position.set(0, 0.44, 0.50);
    g.add(core);
    this.core = core;
    // 进化零件（按方向追加，全部复用缓存几何）
    this.parts = { horn: null, shell: null, sac: null };
    this._mkHorn = () => {
      const h = new THREE.Mesh(cylGeo(0.02, 0.10, 0.42, 5), bone);
      h.position.set(0, 0.78, 0.62);
      h.rotation.x = -0.5;
      g.add(h);
      const h2 = h.clone();
      h2.position.set(-0.14, 0.74, 0.60);
      h2.rotation.z = 0.22;
      g.add(h2);
      const h3 = h.clone();
      h3.position.set(0.14, 0.74, 0.60);
      h3.rotation.z = -0.22;
      g.add(h3);
      return [h, h2, h3];
    };
    this._mkShell = () => {
      const s = new THREE.Mesh(boxGeo(0.76, 0.16, 1.06), getMaterial('#6a6250', { roughness: 0.6, metalness: 0.4, flat: true }));
      s.position.y = 0.66;
      g.add(s);
      for (let i = 0; i < 4; i++) {
        const ridge = new THREE.Mesh(boxGeo(0.16, 0.16, 0.16), getMaterial('#8a8270', { roughness: 0.55, metalness: 0.45, flat: true }));
        ridge.position.set(-0.24 + i * 0.16, 0.78, -0.30 + i * 0.20);
        g.add(ridge);
      }
      return [s];
    };
    this._mkSac = () => {
      const sac = new THREE.Mesh(torusGeo(0.20, 0.05, 3, 12), getMaterial('#8ad8ff', { emissive: 0x67e8ff, emissiveIntensity: 2.0, flat: true }));
      sac.position.set(0, 0.62, -0.36);
      sac.rotation.y = Math.PI / 2;
      g.add(sac);
      const sac2 = new THREE.Mesh(cylGeo(0.12, 0.16, 0.22, 6), getMaterial('#3f6a9a', { emissive: 0x2a4a6a, emissiveIntensity: 0.8, flat: true }));
      sac2.position.set(0, 0.50, -0.34);
      g.add(sac2);
      return [sac, sac2];
    };
  }

  // 进化（§25）：第一次选方向，第二次在已选方向上继续变异
  evolve(dir) {
    const previousStage=this.stage;
    if(!applyCompanionEvolution(this,dir))return false;
    this.renderEvolution(previousStage);this.game.metaSee('pet',dir);return true;
  }
  renderEvolution(previousStage=0) {
    const dir=this.evo;if(!EVO_MAP[dir])return;
    if(previousStage===0&&!this.parts[dir])this.parts[dir]=this['_mk'+dir[0].toUpperCase()+dir.slice(1)]();
    if(previousStage<2&&this.stage===2){this.group.scale.setScalar(1.14);if(this.parts[dir])this.parts[dir].forEach(m=>{if(m.scale)m.scale.multiplyScalar(1.35);});}
  }

  get power() { return this.stage; }

  takeDamage(n) {
    if (!this.alive) return false;
    if (petRaging(this)) {
      n *= .5;
      const absorbed = Math.min(this.rageArmor, n);this.rageArmor -= absorbed;n -= absorbed;
    }
    this.hp -= n;
    this.game.particles.sparkle(this.x, 0.6, this.z, '#ff8a3c', 5, 1.6);
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      this.rageT = this.rageArmor = 0;this.updateRageVisual();
      this.downedT = 0;
      if(this.growth)petDown(this);
      this.game.hud.toast(this.name, this.growth?'被击倒 · 作战恢复 60 秒 + 独立清新房':'被击倒了 —— 清空房间后会恢复', '#8fa2b0', 'quick');
      return true;
    }
    return false;
  }

  // 替玩家吸收伤害（甲方向 §25）：不是"当靶子"，而是"护主"
  absorbFor(amount) {
    if (!this.alive || this.evo !== 'shell' || this.absorbCd > 0) return amount;
    this.absorbCd = 6;                      // 有节奏，不是无限免伤
    this.takeDamage(1);
    this.game.particles.ring(this.x, 0.5, this.z, '#9aa4ae', 12, 0.4, 1.6);
    return Math.max(0, amount - 1);
  }

  update(dt, game) {
    const p = game.player;
    if (!p) return;
    this.animT += dt;
    if (this.rageT > 0) {
      this.rageT = Math.max(0, this.rageT - (game._c2PlayerDt ?? dt));
      if (this.rageT === 0) this.rageArmor = 0;
    }
    this.updateRageVisual();
    if(this.growth)petTick(this,game._c2PlayerDt??dt,game);
    if (this.absorbCd > 0) this.absorbCd = Math.max(0, this.absorbCd - dt);
    if (this.fireCd > 0) this.fireCd = Math.max(0, this.fireCd - dt);
    if (this.guardT > 0) this.guardT = Math.max(0, this.guardT - dt);

    // 被击倒：失去战斗能力，清房后逐渐恢复（§24）
    if (!this.alive) {
      this.downedT += dt;
      this.group.rotation.z = Math.sin(this.animT * 2) * 0.06;
      this.group.position.set(this.x, -0.16, this.z);
      if (!this.growth && game.room.cleared && game.aliveEnemyCount() === 0) {
        this.hp = Math.min(this.maxHp, this.hp + dt * 2.5);
        if (this.hp >= this.maxHp * 0.6) {
          this.alive = true;
          this.game.hud.toast(this.name, '重新站了起来', '#9dff5a', 'quick');
        }
      }
      return;
    }

    // 跟随（§47：太远时"合理跟进"，落在玩家身后，不瞬移到镜头中央）
    const dx = p.x - this.x, dz = p.z - this.z;
    const d = Math.hypot(dx, dz);
    if (d > 26) {
      const ba = p.yaw + Math.PI;
      this.x = p.x + Math.sin(ba) * 2.2;
      this.z = p.z + Math.cos(ba) * 2.2;
      this.vx = this.vz = 0;
    } else {
      const want = 2.6;
      const spd = d > want ? Math.min(9.5, 3.2 + (d - want) * 1.5) * (petRaging(this) ? 1.5 : 1) : 0;
      const ux = d > 0.01 ? dx / d : 0, uz = d > 0.01 ? dz / d : 0;
      this.vx += (ux * spd - this.vx) * Math.min(1, dt * 6);
      this.vz += (uz * spd - this.vz) * Math.min(1, dt * 6);
      this.x += this.vx * dt;
      this.z += this.vz * dt;
    }

    // 朝向 + 抬落（贴地滑行，不与几何碰撞 —— 因此永远不会卡门/卡走廊）
    const face = Math.atan2(this.vx, this.vz);
    if (Math.hypot(this.vx, this.vz) > 0.4) this.group.rotation.y = face;
    else if (p) this.group.rotation.y = Math.atan2(p.x - this.x, p.z - this.z);
    this.group.position.set(this.x, Math.abs(Math.sin(this.animT * 8)) * 0.05, this.z);

    // 自动攻击（§24）：扑杀突进期间不重复开火
    if (this.chargeT > 0) {
      this.chargeT = Math.max(0, this.chargeT - dt);
      this.x += Math.sin(this.group.rotation.y) * 11 * (petRaging(this) ? 1.5 : 1) * dt;
      this.z += Math.cos(this.group.rotation.y) * 11 * (petRaging(this) ? 1.5 : 1) * dt;
      for (const e of game.enemies) {
        if (!e.alive || e.dummy) continue;
        if (Math.hypot(e.x - this.x, e.z - this.z) < 1.5) {
          game.onDamage(e, 2.4 * (1 + this.stage * 0.5) * petDamageMul(this), {
            source: 'companion', owner:this,ownerPlayerId:this.ownerPlayerId,sourceEntityId:this.id, ...(this.growth?{owner:this,sourceInstanceId:'companion:native',feedbackCategory:'unit',feedbackSourceInstanceId:'companion:native',feedbackContext:{feedbackCategory:'unit',feedbackSourceInstanceId:'companion:native'}}:{}), dir: { x: Math.sin(this.group.rotation.y), z: Math.cos(this.group.rotation.y) }, knock: 3.4,
          });
        }
      }
    } else if (this.fireCd <= 0 && game.room && !game.room.cleared) {
      const t = this.findTarget(game);
      if (t) {
        this.fireCd = petInterval(this);
        this.attack(game, t);
      }
    }
  }

  findTarget(game) {
    let best = null, bd = 11 * 11;
    for (const e of game.enemies) {
      if (!e.alive || e.dummy) continue;
      const dx = e.x - this.x, dz = e.z - this.z;
      const d2 = dx * dx + dz * dz;
      if (d2 < bd) { bd = d2; best = e; }
    }
    return best;
  }

  attack(game, t) {
    const dx = t.x - this.x, dz = t.z - this.z;
    const d = Math.hypot(dx, dz) || 1;
    const ux = dx / d, uz = dz / d;
    if (this.evo === 'sac') {
      // 共鸣囊：远程声波（减速）
      game.projectiles.spawn({owner:this,ownerPlayerId:this.ownerPlayerId,sourceEntityId:this.id,
        x: this.x + ux * 0.6, y: 0.6, z: this.z + uz * 0.6, dx: ux, dz: uz,
        speed: 15, damage: (1.2 + this.stage * 0.5)*petDamageMul(this),
        ...(this.growth?{owner:this,sourceInstanceId:'companion:native',feedbackCategory:'unit',feedbackSourceInstanceId:'companion:native',feedbackContext:{feedbackCategory:'unit',feedbackSourceInstanceId:'companion:native'}}:{}), life: 1.6, team: TEAM.PLAYER,
        size: 0.30, radius: 0.32, kind: 'orb', color: '#8ad8ff',
        statuses: { slow: 0.4 },
      });
      game.particles.ring(this.x, 0.5, this.z, '#8ad8ff', 10, 0.35, 1.2);
    } else if (this.evo === 'horn') {
      // 角：短距冲锋
      this.chargeT = 0.35;
      game.particles.ring(this.x, 0.4, this.z, '#ff8a3c', 12, 0.35, 1.4);
    } else {
      // 未进化 / 甲：近身撕咬（甲方向更偏向护主，攻击更慢更重）
      game.onDamage(t, (1.6 + this.stage * 0.6)*petDamageMul(this), { source: 'companion', owner:this,ownerPlayerId:this.ownerPlayerId,sourceEntityId:this.id, ...(this.growth?{owner:this,sourceInstanceId:'companion:native',feedbackCategory:'unit',feedbackSourceInstanceId:'companion:native',feedbackContext:{feedbackCategory:'unit',feedbackSourceInstanceId:'companion:native'}}:{}), dir: { x: ux, z: uz }, knock: 1.2 });
      game.particles.sparkle(t.x, 0.8, t.z, '#ffb347', 4, 1.4);
    }
  }

  // 扑杀 / Command（§26）：按方向给出不同指令
  command(game) {
    if (!this.alive) {
      game.hud.toast(this.name, this.growth?`恢复 ${Math.floor(this.growth.effectiveRecovery)}/60 秒 · 独立清新房 ${this.growth.clearedNewRoomWithoutPet?1:0}/1`:'它还没站起来', '#8fa2b0', 'quick');
      return false;
    }
    if (this.growth) {
      if (this.rageT > 0) return false;
      this.rageT = PET_RAGE_DURATION;this.rageArmor = 3;
      this.fireCd = Math.min(this.fireCd, .15);
      this.updateRageVisual();
      game.particles.ring(this.x, .6, this.z, '#ff4538', 24, .7, 3);
      game.hud.toast('异兽暴走', '8 秒攻击加快 · 攻击与移动 ×1.5 · 临时护甲 3 · 减伤 50%', '#ff745a', 'story');
      return true;
    }
    if (this.evo === 'horn') {
      this.chargeT = 1.1;
      game.hud.toast('扑杀 · 冲锋', '异兽向前突进', '#ff8a3c', 'story');
      return true;
    }
    if (this.evo === 'sac') {
      // 远程爆发：一圈声波弹
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        game.projectiles.spawn({owner:this,ownerPlayerId:this.ownerPlayerId,sourceEntityId:this.id,
          x: this.x, y: 0.6, z: this.z, dx: Math.cos(a), dz: Math.sin(a),
          speed: 14, damage: (1.4 + this.stage * 0.4)*petDamageMul(this),
          ...(this.growth?{owner:this,sourceInstanceId:'companion:native',feedbackCategory:'unit',feedbackSourceInstanceId:'companion:native',feedbackContext:{feedbackCategory:'unit',feedbackSourceInstanceId:'companion:native'}}:{}), life: 1.6, team: TEAM.PLAYER,
          size: 0.26, radius: 0.3, kind: 'orb', color: '#8ad8ff', statuses: { slow: 0.35 },
        });
      }
      game.particles.ring(this.x, 0.6, this.z, '#8ad8ff', 22, 0.8, 3.0);
      game.hud.toast('扑杀 · 声波爆发', '环形声波', '#8ad8ff', 'story');
      return true;
    }
    // 甲 / 未进化：防守（护主窗口）
    this.guardT = 3.5;
    this.absorbCd = 0;
    game.particles.ring(this.x, 0.6, this.z, '#9aa4ae', 18, 0.7, 2.4);
    game.hud.toast('扑杀 · 护主', '接下来 3.5 秒它会替你挡下一次伤害', '#9aa4ae', 'story');
    return true;
  }

  dispose() {
    if (this.group && this.group.parent) this.group.parent.remove(this.group);
  }

  updateRageVisual() {
    if (!this.growth) return;
    this.group.scale.setScalar((this.stage === 2 ? 1.14 : 1) * (petRaging(this) ? 1.6 : 1));
    if (this.rageEyes) this.rageEyes.visible = petRaging(this);
  }
}
