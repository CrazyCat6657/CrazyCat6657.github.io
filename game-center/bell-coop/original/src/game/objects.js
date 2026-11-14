import {ammoTargets} from './shared_mana.js';
import {collectConsumable} from '../experimental/consumables/runtime.js';
import {assertSingleActor} from './actor_context.js';
import {combatPlayers} from '../experimental/consumables/visibility.js';
import {getItemDef as consumableDef} from '../experimental/consumables/index.js';
import { collectSupplyPickup, commitEquipmentOperation, applyAmmoPickup, reportPickupBlock } from './equipment_transaction.js';
// ============================================================
//  拾取物 / 宝箱开启 / 动态危险区
// ============================================================
import * as THREE from '../../vendor/three.module.js';
import { getMaterial, boxGeo } from '../art/materials.js';
import { ATTACH_MAP } from './attachments.js';
import { buildGunModel } from '../art/guns.js';
import { attachWeaponPickupMarker, syncWeaponPickupMarker } from '../art/weapon_pickup_marker.js';
import { WEAPON_MAP, ITEM_MAP, ACTIVE_MAP } from './data.js';
import {pregeneratedWeaponDefinition} from './weapon_compatibility.js';
import { audio } from '../core/audio.js';
import { TEAM } from '../core/constants.js';
import { preferences } from './preferences.js';
import { relicRisk } from './relic_risks.js';
import { pickupReady, pickupPathClear } from './pickup_path.js';
import {makePropVisual,applyPropAsset} from '../art/prop_assets.js';

function M(color, emissive, ei = 1.2, opts = {}) {
  return getMaterial(color, { emissive, emissiveIntensity: ei, flat: true, roughness: opts.rough ?? 0.6, metalness: opts.metal ?? 0.3, ...opts });
}

const privatePickupGeometry = new WeakMap();
export function normalizeFoodPickup(kind, opts, modifier, inRun) {
  if (inRun && modifier?.noFood && !opts.shopSlot && !(opts.shopIndex >= 0) &&
      (kind === 'heal' || kind === 'item' && ITEM_MAP[opts.id]?.mods?.heal)) {
    const base = kind === 'heal' ? 2 * (opts.amount ?? 1) : 6;
    return { ...opts, kind: 'coin', id: undefined, amount: Math.max(1, Math.round(base * (modifier.coinMul || 1))) };
  }
  return { ...opts, kind };
}
function iconMesh(kind, opts = {}, owned = new Set()) {
  const cachedArt=['coin','heal','ammo','key','armor'].includes(kind)?makePropVisual('pickup_'+kind):null;
  // Cached GLB geometry never belongs to an individual pickup's disposal set.
  if(cachedArt)return cachedArt;
  const g = new THREE.Group();
  switch (kind) {
    case 'coin': {
      const m = M('#e8c84a', '#8a6a10', 0.8, { metal: 0.9, rough: 0.3 });
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 10), m);
      c.rotation.x = Math.PI / 2; c.castShadow = true; g.add(c);
      const r = new THREE.Mesh(new THREE.TorusGeometry(0.20, 0.035, 4, 10), m);
      g.add(r);
      break;
    }
    case 'heal': {
      const m = M('#e03a4a', '#ff2a3a', 0.9, { rough: 0.4 });
      const s1 = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.16, 0.16), m); g.add(s1);
      const s2 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.42, 0.16), m); g.add(s2);
      const s3 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.42), m); g.add(s3);
      break;
    }
    case 'ammo': {
      const m = M('#4a6a2a', null, 0, { rough: 0.7, metal: 0.2 });
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.30, 0.30), m); g.add(b);
      const t = new THREE.Mesh(new THREE.BoxGeometry(0.47, 0.06, 0.33), M('#9dff5a', '#9dff5a', 1.4)); t.position.y = 0.16; g.add(t);
      for (let i = 0; i < 3; i++) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.26, 6), M('#d8b45a')); r.position.set(-0.12 + i * 0.12, 0.22, 0); g.add(r); }
      break;
    }
    case 'key': {
      const m = M('#e8c84a', '#8a6a10', 1.0, { metal: 0.9, rough: 0.3 });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.04, 4, 10), m); ring.position.y = 0.14; g.add(ring);
      const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.34, 0.06), m); shaft.position.y = -0.08; g.add(shaft);
      const t1 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.06), m); t1.position.set(0.06, -0.20, 0); g.add(t1);
      const t2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.06), m); t2.position.set(0.05, -0.10, 0); g.add(t2);
      break;
    }
    case 'armor': {
      const m = M('#5a8ac0', '#2a5a8a', 1.0, { metal: 0.8, rough: 0.35 });
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.46, 0.10), m); g.add(plate);
      const e = new THREE.Mesh(new THREE.ConeGeometry(0.20, 0.22, 4), m); e.position.y = -0.32; e.rotation.y = Math.PI / 4; g.add(e);
      break;
    }
    default: {
      const c = opts.color || '#7affd2';
      const m = M(c, c, 2.2, { rough: 0.35, transparent: true, opacity: 0.95 });
      const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.24, 0), m); g.add(core);
      const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(0.34, 0), getMaterial(c, { emissive: c, emissiveIntensity: 1.2, flat: true, transparent: true, opacity: 0.22, side: true }));
      g.add(shell);
    }
  }
  g.traverse(o => { if (o.geometry) owned.add(o.geometry); });
  return g;
}

// Serializable drop data shared by transaction planning and presentation.
export function pickupState(kind, x, z, opts = {}, born = 0) {
  return {
      ...(opts.pickupId?{pickupId:opts.pickupId}:{}),
      ...(opts.recipientId?{recipientId:opts.recipientId}:{}),
      ...(opts.offerId?{offerId:opts.offerId}:{}),
      ...(opts.sourceEventId?{sourceEventId:opts.sourceEventId}:{}),
      ...(opts.rewardSource?{rewardSource:opts.rewardSource}:{}),
      kind, x, z, y: opts.y ?? 1.0, id: opts.id, amount: opts.amount || 1, price: opts.price || 0,
      mag: opts.mag, reserve: opts.reserve, dmgMul: opts.dmgMul || 1,
      definitionVersion:kind==='weapon'?pregeneratedWeaponDefinition(opts).weaponAssetVersion||1:opts.definitionVersion,
      ...(opts.source!==undefined?{source:opts.source}:{}),assetInstanceId:opts.assetInstanceId,assetState:opts.assetState,
      born, vx: opts.vx || 0, vy: opts.vy ?? 0, vz: opts.vz || 0,
      baseY: opts.y !== undefined ? opts.y : (kind === 'coin' ? 0.5 : 1.0),
      collected: false, fromChest: !!opts.fromChest, ttl: opts.ttl || 0, shopIndex: -1,
      // §15：武器拾取物必须**携带这把枪自己的改装** ——
      // 这里是显式字段表构造，漏字段就会在拾取层悄悄丢掉配件（断言抓到过）。
      attId: opts.attId || null,
      attachments: Array.isArray(opts.attachments) ? opts.attachments.slice() : [],
      ...(opts.attachmentPositions !== undefined ? { attachmentPositions: structuredClone(opts.attachmentPositions) } : {}),
      // 遥测分账用的来源标记（§1.1 八类治疗来源）：同样是显式字段表，
      // 不写在这里就会被静默丢掉，治疗全部被算成"地面掉落"。
      healSrc: opts.healSrc || null,
      coinSrc: opts.coinSrc || null,
      // 路线供给身份（Task5）：随拾取物一起存档，实际获取后才提交领取账。
      supplyKey: opts.supplyKey || null,
      radius: 0.5, phase: opts.phase ?? 0,   // visual-rng: 仅呼吸相位，不影响判定
      // 落地保护期：刚被"换下来丢掉"的物品在这段时间内不参与磁吸与拾取。
      // 否则它会在丢出的一瞬间被吸回玩家身上，触发"捡起→替换→再丢掉"的死循环。
      armT: opts.armDelay || 0,
      // "离开过才能再拾取"：保护期只能挡住立刻回吸，玩家站在原地不动时，
      // 保护期一过仍会被磁吸捡回 → 又一次替换 → 再丢一把 → 换枪轮盘永不停。
      // 因此换下来的武器必须等玩家走远一次之后才重新变成可拾取状态。
      noReturn: !!opts.noReturn,
    };
}

export class PickupManager {
  constructor(game) {
    this.game = game;
    this.list = [];
    this.group = new THREE.Group();
    game.scene.add(this.group);
    this.t = 0;
    this._phaseSequence = 0;
  }

  spawn(kind, x, z, opts = {}) {
    // Normalize food conversion before recording its resource identity/quantity.
    opts = normalizeFoodPickup(kind, opts, this.game.mod_, this.game.mode === 'run'); kind = opts.kind;
    if(this.game.partySessionStore&&opts.rewardSource&&!opts.offerId&&!opts.fromChest&&['coin','ammo','heal','armor','key'].includes(kind)){
      this.game.partySessionStore.enqueueSource(kind,x,z,opts,opts.rewardSource);return null;
    }
    if(this.game.partySessionStore&&!opts.pickupId)opts={...opts,pickupId:this.game.partySessionStore.nextPickupId()};
    const owned = new Set();
    let g;
    if (kind === 'weapon') {
      g = new THREE.Group();
      const def = pregeneratedWeaponDefinition(opts);
      const gun = buildGunModel(def ? def.model : 'pistol');
      gun.scale.setScalar(1.4);
      g.add(gun);
      if (typeof location !== 'undefined' && new URLSearchParams(location.search).get('combatArt') === 'legacy') {
        const glowC = def?.color || '#ffd27a';
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.045, 4, 14), getMaterial(glowC, { emissive: glowC, emissiveIntensity: 2.2, flat: true }));
        owned.add(ring.geometry); // Gun clone geometry belongs to the gun cache.
        ring.rotation.x = Math.PI / 2; g.add(ring);
      } else attachWeaponPickupMarker(g, def.tier);
    } else if (kind === 'consumable') {
      const color=consumableDef(opts.id)?.tone||'#91f3f3';
      g=new THREE.Group();
      const body=new THREE.Mesh(boxGeo(.38,.5,.38),getMaterial(color,{emissive:color,emissiveIntensity:.55,flat:true}));g.add(body);
      const cap=new THREE.Mesh(boxGeo(.21,.13,.21),getMaterial('#c99061',{metalness:.6,flat:true}));cap.position.y=.32;g.add(cap);
      const seal=new THREE.Mesh(boxGeo(.42,.08,.42),getMaterial('#293b45',{flat:true}));g.add(seal);
      applyPropAsset(g,'pickup_vial',{color});
    } else if (kind === 'attachment') {
      // 配件箱（§17）：外形要能一眼看出"这是改装件"而不是枪或遗物
      g = new THREE.Group();
      const a = ATTACH_MAP[opts.id];
      const col = (a && a.color) || '#8ad8ff';
      const body = new THREE.Mesh(boxGeo(0.5, 0.34, 0.5), getMaterial('#2a3036', { metalness: 0.7, roughness: 0.42, flat: true }));
      g.add(body);
      const lid = new THREE.Mesh(boxGeo(0.54, 0.08, 0.54), getMaterial('#5a626c', { metalness: 0.8, roughness: 0.35, flat: true }));
      lid.position.y = 0.20; g.add(lid);
      const core = new THREE.Mesh(boxGeo(0.22, 0.12, 0.22), getMaterial(col, { emissive: col, emissiveIntensity: 2.4, flat: true }));
      core.position.y = 0.13; g.add(core);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.035, 4, 12), getMaterial(col, { emissive: col, emissiveIntensity: 2.0, flat: true }));
      owned.add(ring.geometry); // Attachment boxes are shared boxGeo entries.
      ring.rotation.x = Math.PI / 2; g.add(ring);
      applyPropAsset(g,'pickup_attachment',{keep:[core,ring]});
    } else if (kind === 'item') {
      g = new THREE.Group();
      const def = ITEM_MAP[opts.id];
      const c = ['#8adf6a', '#5ad8ff', '#c07af0', '#ffd24a'][Math.min(3, (def?.rarity || 1) - 1)];
      const core = iconMesh('orb', { color: c }, owned);
      core.scale.setScalar(1.25);
      g.add(core);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.04, 4, 14), getMaterial(c, { emissive: c, emissiveIntensity: 2.0, flat: true }));
      owned.add(ring.geometry);
      ring.rotation.x = Math.PI / 2; g.add(ring);
    } else if (kind === 'active') {
      g = new THREE.Group();
      const def = ACTIVE_MAP[opts.id];
      const c = def?.color || '#8af0ff';
      const core = iconMesh('orb', { color: c }, owned);
      core.scale.setScalar(1.35);
      g.add(core);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.035, 4, 14), getMaterial(c, { emissive: c, emissiveIntensity: 2.4, flat: true }));
      owned.add(ring.geometry);
      ring.rotation.set(Math.PI / 2, 0, 0); g.add(ring);
    } else {
      g = iconMesh(kind, opts, owned);
    }
    g.position.set(x, opts.y !== undefined ? opts.y : 1.0, z);
    syncWeaponPickupMarker(g);
    g.traverse((o) => { if (o.isMesh) o.castShadow = false; });
    this.group.add(g);
    privatePickupGeometry.set(g, owned);
    // The displayed height feeds the bounce boundary, so fixed authority also
    // gives newly spawned pickups a stable phase without consuming gameplay RNG.
    const phase = opts.phase ?? (this.game.platform?.entityPhase ? this.game.platform.entityPhase('pickup:'+ ++this._phaseSequence,this.game.seed)*.628 : Math.random()*6.28);
    const p = { ...pickupState(kind, x, z, { ...opts, phase }, this.t), mesh: g, shopSlot: opts.shopSlot || null };
    this.list.push(p);
    return p;
  }

  update(dt) {
    if (this.game.storageFrozen?.() || (this.game.actors?.size!==2 && this.game.hud && this.game.panelOpen?.())) return;
    this.t += dt;
    this.coinBatch = 0;
    const pl = this.game.player;
    const coinRadius = preferences.get().coinMagnetRadius;
    const range = 2.4 * (pl ? (pl.stats?.pickup ?? 1) : 1);
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      if (p.ttl > 0 && this.t - p.born >= p.ttl) { this.remove(p); continue; }
      // 弹跳：只在还有竖直速度时跑重力。
      // 旧条件额外带入"y 高于基准 0.02"，而下面的正弦浮动正好会越过这个阈值，
      // 于是悬浮物每帧都被重新施加一次重力，产生肉眼可见的抖动。
      if (p.vy !== 0) {
        p.vy -= 16 * dt;
        p.mesh.position.y += p.vy * dt;
        if (p.mesh.position.y <= p.baseY) { p.mesh.position.y = p.baseY; p.vy = Math.abs(p.vy) * 0.42; if (p.vy < 1.2) p.vy = 0; }
      }
      if (p.vx || p.vz) {
        p.x += p.vx * dt; p.z += p.vz * dt;
        p.vx *= Math.max(0, 1 - 6 * dt); p.vz *= Math.max(0, 1 - 6 * dt);
        const cl = this.game.roomScene ? this.game.roomScene.clampToRoom(p.x, p.z, 1.2) : p;
        p.x = cl.x; p.z = cl.z;
      }
      p.mesh.position.x = p.x;
      p.mesh.position.z = p.z;
      p.mesh.rotation.y += dt * (p.kind === 'coin' ? 2.6 : 1.1);
      p.mesh.position.y += Math.sin(this.t * 2.4 + p.phase) * 0.0035;
      syncWeaponPickupMarker(p.mesh);
      if (p.armT > 0) p.armT = Math.max(0, p.armT - dt);
      // 地面武器与配件按 E 主动拾取（见 Game.interactables）。
      // 理由：武器槽只有 2 个，自动吸附会让你"捡到不想要的那把"并把手上的换掉 ——
      // 这是有代价的选择，必须由玩家自己按下去。
      // 配件库也有容量，满库时先选择替换。金币 / 治疗 / 弹药 / 钥匙 / 纯正面遗物 / 主动技能继续自动拾取。
      if(this.game.actorCount===2){
        const candidates=[...this.game.actors.values()].filter(a=>a.active&&a.player.alive&&
          (p.kind!=='heal'||a.player.hp<a.player.maxHp||!!a.player.hero?.hook?.onHeal)&&
          (p.kind!=='armor'||a.player.armor<5)&&
          (p.kind!=='item'||!a.player.items.includes(p.id))&&
          (p.kind!=='ammo'||!/^altar:[0-9a-f]+:ammo$/.test(p.sourceEventId||'')||ammoTargets(a.player).some(w=>w.def.ammoType&&w.reserve<Math.round(w.def.ammoMax*(a.player.stats.ammoMaxMul||1))))&&(!p.recipientId||p.recipientId===a.playerId)&&!a.view.panelOpen())
          .sort((a,b)=>Math.hypot(a.player.x-p.x,a.player.z-p.z)-Math.hypot(b.player.x-p.x,b.player.z-p.z)||a.slot-b.slot);
        const actor=candidates[0],target=actor?.player;
        const manual=p.kind==='weapon'||p.kind==='attachment'||p.kind==='consumable'||p.kind==='item'&&relicRisk(p.id,target).risky;
        if(target&&!manual&&!p.collected&&!p.shopSlot&&!(p.shopIndex>=0)&&p.armT<=0&&p.vy===0){
          const d=Math.hypot(target.x-p.x,target.z-p.z),range=p.kind==='coin'?coinRadius*(target.stats.pickup??1):2.4*(target.stats.pickup??1);
          if(p.noReturn&&d>3.4)p.noReturn=false;
          if(!p.noReturn&&d<range&&pickupPathClear(this.game,p.x,p.z,target.x,target.z)){
            if(d<1.35){this.collect(p,actor.playerId);return;}
            const step=Math.min(d-1.34,(1-d/range)*(p.kind==='coin'?16:11)*dt);
            p.x+=(target.x-p.x)/d*step;p.z+=(target.z-p.z)/d*step;
          }
        }
        continue;
      }
      const manual = (p.kind === 'weapon' || p.kind === 'attachment' || p.kind==='consumable' || p.kind === 'item' && relicRisk(p.id,pl).risky);
      const itemRange = p.kind === 'coin' ? coinRadius * (pl?.stats?.pickup ?? 1) : range;
      // 所有掉落物都需离开一次；手动装备只解除保护，不自动吸附。
      if (this.game.actors?.size!==2 && pl && pl.alive && !p.collected && !p.shopSlot && !(p.shopIndex >= 0) && p.armT <= 0 && p.vy === 0) {
        const d = Math.hypot(pl.x - p.x, pl.z - p.z);
        if (p.noReturn && d > 3.4) p.noReturn = false;   // 走远过一次 → 恢复可拾取
        if (!manual && !p.noReturn && d < itemRange && (p.kind !== 'coin' || pickupPathClear(this.game,p.x,p.z,pl.x,pl.z))) {
          // 先判拾取再算方向：d 恰好为 0 时（拾取物正好生成在玩家脚下，例如金币）
          // 旧写法被 `d > 0.01` 的守卫一起挡掉，会导致"踩在上面也捡不到"。
          if (d < 1.35) { this.collect(p); continue; }
          const f = (1 - d / itemRange) * (p.kind === 'coin' ? 16 : 11);
          const step = Math.min(d - 1.34, f * dt);
          p.x += ((pl.x - p.x) / d) * step;
          p.z += ((pl.z - p.z) / d) * step;
        }
      }
    }
    if (this.coinBatch > 0) this.coinFeedback();
    delete this.coinBatch;
  }

  coinFeedback() {
    const p = this.game.player;
    audio.coin();
    this.game.flashSmall(p.x,.6,p.z,'#e8c84a',2.2,.1);
    this.game.particles.sparkle(p.x,.6,p.z,'#e8c84a',5,1.6);
  }

  collect(p,actorId='player') {
    if(this.game.actorCount===2)return this.game.partySessionStore?.collectPickup(p,actorId)||Promise.resolve({ok:false,error:"Party store unavailable"});
    assertSingleActor(this.game); // PartyDraft owns all multiplayer acquisition.
    if (this.game.storageFrozen?.()) return false;
    if(p?.kind==='consumable')return collectConsumable(this.game,p);
    if (!p || p.collected || !this.list.includes(p)) return false;
    const pl = this.game.player;
    if (!pl) return;
    if (p.kind === 'item' && pl.items.includes(p.id)) {
      return reportPickupBlock(this.game, p, '已拥有此遗物');
    }
    if (p.kind === 'item' && relicRisk(p.id,pl).risky) return this.game.offerRelicPickup(p);
    if (p.kind === 'weapon' || p.kind === 'weapon_crate') return this.game.collectEquipmentPickup(p);
    if (p.kind === 'attachment') {
      if (!pl.alive || !pickupReady(p) || this.game.paused || this.game.panelOpen?.() ||
          Math.hypot(pl.x-p.x,pl.z-p.z) > 2.2 || !pickupPathClear(this.game,pl.x,pl.z,p.x,p.z)) return false;
      if (pl.spareAttachments.length >= pl.spareCap()) { this.game.offerAttachmentReplacement(p); return false; }
      return commitEquipmentOperation(this.game, candidate => ({ ok: candidate.addAttachment(p.attId || p.id) }),
        '配件已领取', { source: p, refresh: false });
    }
    if (p.supplyKey) {
      const taken = collectSupplyPickup(this.game, p);
      if (taken && p.kind === 'coin') {
        if (this.coinBatch !== undefined) this.coinBatch++;
        else this.coinFeedback();
      }
      return taken;
    }
    let taken = true;
    switch (p.kind) {
      case 'coin':
        if (!pl.addCoins(p.amount, p.coinSrc || 'pickup')) { taken = false; break; }
        if (this.coinBatch !== undefined) this.coinBatch++;
        else this.coinFeedback();
        break;
      case 'heal': {
        // Old saved drops may predate the unified spawn boundary.
        if (this.game.mode === 'run' && this.game.mod_?.noFood && !p.shopSlot) {
          pl.addCoins(Math.max(1, Math.round(2 * p.amount * (this.game.mod_.coinMul || 1)))); audio.coin(); break;
        }
        // 满血时默认拒绝拾取；但**有 onHeal 钩子的职业**（烬誓者）必须能捡 ——
        // 否则"焚掉治疗换誓火"这条核心机制在最常见的治疗来源上永远不会触发（§13.2）。
        const canBurn = !!(pl.hero && pl.hero.hook && pl.hero.hook.onHeal);
        if (pl.hp >= pl.maxHp && !canBurn) { taken = false; break; }
        // 治疗来源分账（§1.1）：宝箱 / 破坏物 / 地面掉落必须分开统计
        const healed = pl.heal(p.amount, p.healSrc || 'drop');
        audio.heal();
        if (healed) this.game.toast('回复生命', `生命 +${p.amount}`, '#ff6a7a');
        break;
      }
      case 'ammo': {
        const result = applyAmmoPickup(pl);
        if (!result.ok) { taken = false; break; }
        audio.pickup();
        this.game.toast('弹药补给', result.refilled ? '特殊弹药已补充' : '无需弹药，转化为 3 金币', '#9dff5a');
        break;
      }
      case 'key':
        pl.keys++; audio.key();
        this.game.toast('获得钥匙', `钥匙 ×${pl.keys}`, '#e8c84a');
        break;
      case 'armor':
        pl.armor = Math.min(5, pl.armor + 1); audio.pickup();
        this.game.toast('获得护甲', '护甲 +1', '#8ab0e0');
        break;
      case 'item': {
        taken = pl.addItem(p.id);
        break;
      }
      case 'active': {
        pl.giveActive(p.id);
        break;
      }
      default: taken = true;
    }
    if (!taken) return;
    if (p.supplyKey) this.game.commitSupplyPickup?.(p.supplyKey);
    p.collected = true;
    this.remove(p);
    if (p.kind !== 'coin') this.game.particles.sparkle(p.x, p.mesh.position.y, p.z, '#ffffff', 5, 1.6);
  }

  // 拆解：把地面上的物件**真正移除**（拾荒客 §11.1）。
  // 与"拾取"共用同一套移除路径，避免出现"拆了但还在地上"的幽灵物件。
  dismantle(p) {
    const idx = this.list.indexOf(p);
    if (idx < 0) return false;
    this.remove(p);
    this.game.particles.sparkle(p.x, p.mesh.position.y, p.z, '#8fa2b0', 8, 2.0);
    this.game.particles.smoke(p.x, 0.6, p.z, 4, '#6a7480', 0.5, 0.7);
    audio.impact(true);
    return true;
  }

  removeAttachedTo(slot) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      if (this.list[i].shopSlot === slot) {
        this.remove(this.list[i]);
      }
    }
  }

  clear() {
    for (const p of [...this.list]) this.remove(p);
  }
  remove(p) {
    const index = this.list.indexOf(p);
    if (index < 0) return false;
    this.list.splice(index, 1); this.group.remove(p.mesh);
    for (const geometry of privatePickupGeometry.get(p.mesh) || []) geometry.dispose();
    privatePickupGeometry.delete(p.mesh);
    return true;
  }
}

// ---------------- 动态危险区（Boss 熔岩喷发等）----------------
export class HazardZones {
  constructor(game) {
    this.game = game;
    this.items = [];
    this.group = new THREE.Group();
    game.scene.add(this.group);
    this.geoRing = new THREE.RingGeometry(0.86, 1.0, 32);
    this.geoDisc = new THREE.CircleGeometry(0.92, 20);
  }
  add(x, z, radius, delay, damage, color = '#ff5a10') {
    const m = new THREE.Mesh(this.geoRing, new THREE.MeshBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity: 0.85, side: THREE.DoubleSide, toneMapped: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, 0.07, z); m.scale.setScalar(radius);
    const d = new THREE.Mesh(this.geoDisc, new THREE.MeshBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity: 0.22, side: THREE.DoubleSide, toneMapped: false }));
    d.rotation.x = -Math.PI / 2; d.position.set(x, 0.06, z); d.scale.setScalar(radius * 0.6);
    this.group.add(m); this.group.add(d);
    // 这里**不再**给每个危险区挂 PointLight。
    // 旧实现每个危险区一盏点光（上限 24），会让 Boss 战的场景灯数从 8 涨到 30+，
    // 每次材质重编译都会卡顿。现在靠"自发光圆环/圆盘 + 泛光"表现地火，
    // 真正的照明由喷发瞬间复用既有的闪光灯池完成。
    this.items.push({ x, z, radius, t: 0, delay, damage, mesh: m, disc: d, erupted: 0, alive: true, color });
  }
  update(dt) {
    const players = combatPlayers(this.game);
    for (let i = this.items.length - 1; i >= 0; i--) {
      const h = this.items[i];
      h.t += dt;
      const k = Math.min(1, h.t / h.delay);
      h.disc.scale.setScalar(h.radius * (0.6 + k * 0.4));
      h.mesh.material.opacity = 0.35 + k * 0.5;
      if (h.t >= h.delay) {
        if (h.erupted <= 0) {
          h.erupted = 0.55;
          this.game.particles.explosion(h.x, 0.4, h.z, h.radius * 0.5, h.color);
          this.game.shake(0.16);
          audio.explosion(0.7);
          this.game.flashSmall(h.x, 0.8, h.z, h.color, 18, 0.22);
          // 喷发照明：复用闪光灯池（灯光总数恒定），比常驻点光更符合"爆燃"的观感
          if (this.game.flashLights) this.game.flashLights.flash(h.x, 1.1, h.z, h.color, 34, 0.34);
        }
        h.erupted -= dt;
        h.mesh.material.opacity = Math.max(0, h.erupted / 0.55) * 0.9;
        for(const pl of players) if (Math.hypot(pl.x - h.x, pl.z - h.z) < h.radius) {
          if ((pl._hzCd || 0) <= 0) {
            pl._hzCd = 0.6;
            // 挑战词条「余烬诅咒」：环境危险区伤害倍率
            const hm = (this.game && this.game.mod_ && this.game.mod_.hazardMul) || 1;
            pl.takeDamage(h.damage * hm, { source: 'hazard' });
          }
        }
        if (h.erupted <= 0) { h.alive = false; }
      }
      h.mesh.scale.setScalar(h.radius * (1 + (1 - k) * 0.15));
      if (!h.alive) {
        this.remove(h);
      }
    }
    for(const pl of players) pl._hzCd = Math.max(0, (pl._hzCd || 0) - dt);
  }
  clear() {
    for (const h of [...this.items]) this.remove(h);
  }
  remove(h) {
    const index = this.items.indexOf(h);
    if (index < 0) return false;
    this.items.splice(index, 1); this.group.remove(h.mesh); this.group.remove(h.disc);
    // Materials are created by add for this instance; geoRing/geoDisc are manager-owned.
    h.mesh.material.dispose(); h.disc.material.dispose();
    return true;
  }
}
