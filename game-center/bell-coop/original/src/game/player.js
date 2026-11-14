import {clearFoldRoom,foldActionFailure} from '../experimental/combat/fold_shadow.js';
import {consumableModifiers,absorbConsumableDamage,tickConsumables} from '../experimental/consumables/runtime.js';
import {decorateFoldRig} from '../experimental/combat/fold_visuals.js';
import {tickCombat, tryCombatAction} from '../experimental/combat/controller.js';
import { actionHit, actionDown } from '../core/control_actions.js';
import { newHeroIntegration } from './hero_integration_v3.js';
import {savedWeaponDefinition} from './weapon_versions.js';
import {validWeaponAssetStateShape} from './weapon_compatibility.js';
import {WeaponAssetsRuntime} from './weapon_assets_runtime.js';
import { BUILD_EFFECTS_VERSION, applyBuildModifiers, clampBuildStats, synergyMatches, buildShotContext } from './build_effects.js';
// ============================================================
//  玩家 —— 移动 / 冲刺 / 射击 / 装填 / 构筑 / 主动技能
// ============================================================
import * as THREE from '../../vendor/three.module.js';
import { forgeFeed } from './hero_rules_v3.js';
import { cancelOverdriveReload } from './active_promises.js';
import { isEmber, isRanger, emberMultiplier, endEmberEscrow, rangerMove } from './hero_p2.js';
import { RANGER_DISTANCE, RANGER_RECOVERY } from './hero_feedback.js';
import { integrationState } from './hero_integration_v3.js';
import { usesSharedMana, sharedManaCap, bindSharedMana, corridorManaMultiplier } from './shared_mana.js';
import { PLAYER, TEAM, MAX_WEAPON_SLOTS } from '../core/constants.js';
import { WEAPON_MAP, LEGACY_WEAPON_MAP, ITEM_MAP, ACTIVE_MAP, SYNERGIES } from './data.js';
import { spellFromWeapon } from './spells.js';
import {observePayment} from './resource_observation.js';
import { animateWeaponAssetModel } from '../art/weapon_assets_models.js';
import { buildPlayer, walkHumanoid } from '../art/models.js';
import { buildGunModel } from '../art/guns.js';
import { attachMods, canInstall, attachGunParts, ATTACH_MAP } from './attachments.js';
import { audio } from '../core/audio.js';
import { attachmentPositions } from './equipment_drops.js';
import { newHeroStateV3 } from './hero_state_v3.js';

export function emptyStats() {
  return {
    damage: 1, rate: 1, speed: 1, crit: 0.05, critMul: 2.0, pierce: 0, bounce: 0,
    homing: 0, explosive: 0, slow: 0, poison: 0, burn: 0, lifesteal: 0,
    maxHp: PLAYER.maxHp, armor: 0, reloadMul: 1, magazine: 1, pickup: 1, coins: 1,
    keyBonus: 0, skillPower: 1, skillCd: 1, bulletSize: 1, dashMax: 1, dashCdMul: 1,
    thorns: 0, souls: 0, regenArmor: 0, standstill: 0, berserk: 0, twin: 0,
    critBoom: 0, tesla: 0, droneCount: 0, ammoMaxMul: 1, ammoFind: 0,
    explosiveMul: 1, blastRadius: 1, freezeChance: 0, beamWidth: 1, moveShoot: 0,
    soulsMul: 1, chainPoison: 0, noBounceSlow: false, burnLife: 0,teslaDamage:1,critBoomRadiusMul:1,
    // 英雄用到的两个乘区（此前不存在，英雄天赋会因此被静默丢弃）
    dmgTakenMul: 1, spreadMul: 1,
    synergies: [],
  };
}

export class Player {
  constructor(game) {
    this.game = game;
    this.buildEffectsVersion = BUILD_EFFECTS_VERSION;
    this.radius = PLAYER.radius;
    this.x = 0; this.z = 0;
    this.vx = 0; this.vz = 0;
    this.yaw = 0;
    this.aim = { x: 0, z: 1 };
    this.aimPoint = { x: 0, z: 8 };   // 准星在地面上的世界落点
    this.aimDist = 8;
    this.moveVec = { x: 0, z: 0, len: 0 };
    this.assetMoveSpeedMul = 1;
    this.dashBuffer = 0;
    this.hp = PLAYER.maxHp;
    this.maxHp = PLAYER.maxHp;
    this.armor = 0;
    this.coins = 0;
    this.keys = 0;
    this.alive = true;
    this.stats = emptyStats();
    this.items = [];
    this.weapons = [];
    this.weaponIndex = 0;
    this.actives = [];
    this.activeIndex = 0;
    this.activeCd = 0;
    this.dashCharges = 1 + (game.hero?.mods?.dashMax || 0);
    this.dashMax = this.dashCharges;
    this.mana = 120;
    this.dashCd = 0;
    this.dashTime = 0;
    // 职业能力（Hero Skill）状态。冷却由 Game.heroSkill 统一管理。
    // 各职业的专属资源也统一挂在这里，HUD 与 Codex 都从这一处读。
    this.heroSkillCd = 0;
    this.heroSkillCdMax = 1;
    this.c2 = newHeroStateV3();
    this.c2Integration = newHeroIntegration();
    this.bellCharges = 0;      // 守钟人：钟鸣印记 0–3
    this.bellFlash = 0;
    this.bellWindow = 0;       // 回钟后的短窗口强化
    this.heat = 0;             // 熔铸匠：炉热
    this.scrap = 0;            // 拾荒客：废料
    this.resonance = 0;        // 回响师：共鸣
    this.phrase = 0;           // 烬誓者：誓火
    this.momentum = 0;         // 远征老兵：战意
    this.tuningT = 0;          // 回响师：定音状态剩余时间
    this.overloadT = 0;        // 烬誓者：超载剩余时间
    // 备用配件（还没装到枪上的）。**Run-only**：开新局必须清空（§49）
    this.spareAttachments = [];
    this._shotsSinceReload = 0;
    this.overclockT = 0;       // 铸枪师：超频剩余时间
    this.momentumT = 0;        // 远征老兵：距上次击杀的时间
    this.swapT = 0;            // 远征老兵：换枪后的短窗口
    this.doctrines = [];       // 远征老兵：本局已确立的战斗教条（§22.1）
    this.spellEchoT = 0;       // 钟术师：钟域的共鸣窗口
    this.overheatT = 0;        // 铸枪师：过热剩余时间
    this.dashDir = { x: 0, z: 1 };
    this.iframes = 0;
    this.reloadT = 0;
    this.reloading = false;
    this.fireT = 0;
    this.spin = 0;
    this.charge = 0;
    this.charging = false;
    this.burstLeft = 0; this.burstT = 0;
    this.walkPhase = 0;
    this.moveAmount = 0;
    this.standT = 0;
    this.kills = 0;
    this.soulCount = 0;
    this.overdrive = 0;
    this.barrier = 0;
    this.forcedFire = false;
    this.deadAnim = 0;
    this.hitFlash = 0;
    this.slowT = 0;
    this.recoil = 0;
    this.drinks = 0;
    this.buildModel();
  }

  // ---------------- 模型 ----------------
  buildModel() {
    if (this.rig) this.game.scene.remove(this.rig.group);
    // 英雄调色板：让四个英雄一眼可辨（轮廓另由 heroes.js 的 build 字段决定）
    // 传 build：英雄的结构差异（肩甲 / 炉罐 / 目镜 / 废料包…）真正进入模型，
    // 而不是只靠配色区分。
    this.rig = buildPlayer(this.hero ? this.hero.pal : undefined, this.hero ? this.hero.build : null);
    if (this.hero?.id==='foldshadow') decorateFoldRig(this.rig);
    this.game.scene.add(this.rig.group);
    this.rig.group.position.set(this.x, 0, this.z);
    this.gunModel = null;
    this.setGunModel(this.weapons.length ? this.weapons[this.weaponIndex].def.model : 'pistol');
  }

  // ---- 武器改装（任务书 §14–§20）----
  // 配件效果**只作用于当前这把枪**，不进入 player.stats（§40 的层次关系）。
  // 法力（§30）：钟术师不用普通弹药；法力以 reserve 承载并随时间回复。
  // 借用这套机制的好处是**弹药掉落自动变成法力补充**，不会变成垃圾（§48）。
  manaCap() { return usesSharedMana(this) ? sharedManaCap(this) : (this.weapon && this.weapon.def.ammoMax) || 120; }
  manaRegen(dt) {
    if (usesSharedMana(this)) {
      this.mana = Math.min(this.manaCap(), this.mana + dt * (this.game.aliveEnemyCount() > 0 ? 5 : 9) * corridorManaMultiplier(this));
      return;
    }
    const w = this.weapon;
    if (!w || w.def.ammoType !== 'mana') return;
    if (!isFinite(w.reserve)) return;
    const cap = this.manaCap();
    if (w.reserve < cap) {
      w.reserve = Math.min(cap, w.reserve + dt * (this.game && this.game.aliveEnemyCount() > 0 ? 5 : 9));
    }
  }

  attachMods() {
    const m = attachMods(this.weapon ? this.weapon.attachments : null);
    // 铸枪师「超频」（§21.2）：强化**已安装配件**的效果 ——
    // 注意是强化配件，不是给基础枪加伤害（§21.3 明确禁止"基础枪伤害 +20%"那种设计）。
    if (this.overclockT > 0) {
      if (m.bounce > 0) m.bounce += 1;
      if (m.homing > 0) m.homing += 0.25;
      if (m.chain > 0) m.chain += 1;
      if (m.burn > 0) m.burn += 2;
      if (m.slow > 0) m.slow += 0.15;
      if (m.damage > 0) m.damage += 0.10;
      if (m.rate > 0) m.rate += 0.25;
      if (m.pierce > 0) m.pierce += 1;
      m.overclocked = true;
    }
    // 过热：超频结束后的短暂代价（§21.2"避免无限开"）
    if (this.overheatT > 0) m.rate -= 0.12;
    return m;
  }
  // 槽位数：普通 2、铸枪师 3（§16）。由英雄数据决定，不在这里写 if (hero.id)。
  attachSlots() { return (this.hero && this.hero.attachSlots) || 2; }

  // 武器携带上限。**只有拾荒客多一把**（PASS2 §1.5）。
  // 决策依据（可测量）：拾荒客的整套玩法建立在"捡到就用、随捡随换"上，
  // 而全项目 26 把枪分属 8 种弹药类型；两把槽时"想带的三把里总有一把要吃异种弹药"，
  // 于是捡到好枪常常只能丢掉 —— 这与"废土拾荒"的身份相冲突。
  // 作为**角色特色**给一把（不是全局 +1），代价是它同时保留了"配件槽只有 2 个"的劣势。
  weaponSlots() { return MAX_WEAPON_SLOTS + ((this.hero && this.hero.bonusWeaponSlots) || 0); }
  // 备用配件的容量：普通 3，铸枪师 5（§21.1"可以更自由地拆卸/重装"）
  spareCap() { return (this.hero && this.hero.spareCap) || 3; }
  // 备用配件（还没装上的）：上限 3，避免无限囤积
  addAttachment(attId) {
    const a = ATTACH_MAP[attId];
    if (!a) return false;
    if (!this.spareAttachments) this.spareAttachments = [];
    if (this.spareAttachments.length >= this.spareCap()) {
      this.game.toast('备用配件库已满', `容量 ${this.spareCap()} · 在构筑面板丢弃备用件，或对地面配件选择替换`, '#ff6a3a', 'fail');
      return false;
    }
    this.spareAttachments.push(attId);
    if (this.game.mode === 'run' && !this.game._restoring) this.game.metaSee('attachment', attId);
    this.game.toast(`获得配件 · ${a.cn}`, `${a.desc}　在构筑面板里装配（当前枪 ${(this.weapon.attachments || []).length}/${this.attachSlots()}）`, '#8ad8ff', 'build');
    return true;
  }
  // 把备用配件装到指定武器上（默认当前手持）
  installAttachment(attId, weaponIndex = -1, slotIndex = -1) {
    const idx = weaponIndex >= 0 ? weaponIndex : this.weaponIndex;
    const w = this.weapons[idx];
    if (!w) return { ok: false, why: '没有这把武器' };
    if (!this.spareAttachments) this.spareAttachments = [];
    if (!this.spareAttachments.includes(attId)) return { ok: false, why: '没有这个配件' };
    const chk = canInstall(w.attachments, attId, this.attachSlots(), !!(this.hero && this.hero.attachSameSlot), w.def);
    if (!chk.ok) return chk;
    const positions = attachmentPositions(w).slice();
    const target = slotIndex < 0 ? Array.from({ length: this.attachSlots() }, (_, i) => i).find(i => !positions.includes(i)) : slotIndex;
    if (!Number.isInteger(target) || target < 0 || target >= this.attachSlots()) return { ok: false, why: '装配位无效' };
    if (positions.includes(target)) return { ok: false, why: '这个装配位已有配件，请先拆下' };
    w.attachments.push(attId);
    w.attachmentPositions = [...positions, target];
    this.spareAttachments.splice(this.spareAttachments.indexOf(attId), 1);
    this.recompute();
    if (idx === this.weaponIndex) this.refreshGunModel();
    const a = ATTACH_MAP[attId];
    this.game.toast('改装完成', `${w.def.cn} + ${a.cn}`, '#8ad8ff', 'build');
    return { ok: true, why: '' };
  }
  // 拆下配件放回备用栏（供铸枪师与"想换一个"的玩家使用，§21.1）
  detachAttachment(attId, weaponIndex = -1) {
    const idx = weaponIndex >= 0 ? weaponIndex : this.weaponIndex;
    const w = this.weapons[idx];
    if (!w) return false;
    const i = (w.attachments || []).indexOf(attId);
    if (i < 0) return false;
    if (!this.spareAttachments) this.spareAttachments = [];
    const full = this.spareAttachments.length >= this.spareCap();
    if (full && !this.game.dropAttachmentPickup(attId)) return false;
    const positions = attachmentPositions(w).slice(); positions.splice(i, 1);
    w.attachments.splice(i, 1); w.attachmentPositions = positions;
    if (!full) this.spareAttachments.push(attId);
    this.recompute();
    if (idx === this.weaponIndex) this.refreshGunModel();
    return true;
  }
  dropSpareAttachment(index) {
    if (!Number.isInteger(index) || index < 0 || index >= this.spareAttachments.length) return false;
    const id = this.spareAttachments[index];
    if (!this.game.dropAttachmentPickup(id)) return false;
    this.spareAttachments.splice(index, 1);
    return true;
  }
  // 即时装填（部分或全部）。远征老兵的「压阵」与「空匣反击」都用它。
  instantReload(fraction = 1) {
    const w = this.weapon;
    if (!w) return 0;
    const magSize = this.magSize(w);
    const need = magSize - w.mag;
    if (need <= 0) return 0;
    const take = Math.max(1, Math.round(magSize * fraction));
    const got = Math.min(need, take);
    w.mag += got;
    this._shotsSinceReload = 0;
    audio.reload(1);
    this.game.flashSmall(this.x, 0.9, this.z, w.def.color || '#ffffff', 3, 0.12);
    return got;
  }

  // 换枪 / 改装后重建枪械模型，并把配件的**可见零件**装上去（§19）
  refreshGunModel() {
    if (!this.weapon) return;
    this.setGunModel(this.weapon.def.model);
  }

  setGunModel(modelId) {
    if (this.gunModel) this.rig.weaponMount.remove(this.gunModel);
    this.gunModel = buildGunModel(modelId);
    this.rig.weaponMount.add(this.gunModel);
    this.rig.weaponMount.rotation.set(0, 0, 0);
    // 把当前手持武器的配件显示成真实零件（§19：不能只在数据里装配件）
    if (this.weapon && this.gunModel) attachGunParts(this.gunModel, this.weapon.attachments);
  }

  // ---------------- 构筑 ----------------
  recompute() {
    const s = emptyStats();
    // 英雄基础属性差异 + 英雄 mods（Sidegrade：每项收益都伴随一条代价，见 heroes.js）
    // 挑战词条对基础资源的改动（空骨：生命 -1 / 冲刺 +1）
    // 必须写在 recompute 里，否则会被下一次重算覆盖（那就成了"只写数据不实现玩法"）。
    {
      const md = (this.game && this.game.mod_) || {};
      if (md.hpMinus) s.maxHp -= md.hpMinus;
      if (md.dashPlus) s.dashMax += md.dashPlus;
    }
    // 英雄可以数据化地改写属性（例如熔铸匠按炉热提高爆炸倍率、游侠按专注收束散布）。
    // 走 hook 而不是在 recompute 里写 if (hero.id)，符合任务书 §6 的架构要求。
    if (this.hero && this.hero.hook && this.hero.hook.recompute) {
      try { this.hero.hook.recompute(this, s); } catch (e) { /* 单个 hook 失败不应影响整局 */ }
    }
    if (this.hero) {
      // 英雄基础生命差：必须在 recompute 里改 stats.maxHp，
      // 直接写在 applyHero 里会被 recompute 覆盖掉（那就成了"只写数据不实现玩法"）。
      if (this.hero.hp) s.maxHp += (this.hero.hp - PLAYER.maxHp);
      const hm = this.hero.mods || {};
      for (const k in hm) {
        if (typeof s[k] === 'number') {
          // 除 damage/rate 这类乘区外，其余按加法累加；减速/减弹匣用负值表达
          if (k === 'crit' || k === 'dmgTaken' || k === 'explodeMul' || k === 'spread') s[k] += hm[k];
          else s[k] = (s[k] === undefined ? 0 : s[k]) + hm[k];
        }
      }
    }
    for (const id of this.items) {
      const it=ITEM_MAP[id];if(it)applyBuildModifiers(s,it.mods,'relic');
    }
    s.synergies=[];
    for(const raw of SYNERGIES){
      if(!synergyMatches(raw,this))continue;
      const sy={...raw};
      if(sy.id==='gun_fu')sy.desc='射速 +10%';
      if(sy.id==='absolute_zero')sy.desc='同一普通敌累计3次主命中冻结1.5秒；首领免疫';
      if(sy.id==='cold_steel'||sy.id==='frost_edge')sy.desc+='（首领免疫）';
      s.synergies.push(sy);
      const mods={...sy.mods};
      if(['absolute_zero','cold_steel','frost_edge'].includes(sy.id))delete mods.freezeChance;
      if(sy.id==='blade_storm')delete mods.bounce;
      if(sy.id==='arc_harvest')delete mods.soulsMul;
      if(sy.id==='overkill'){delete mods.critBoomMul;s.critBoom=Math.max(s.critBoom,14);}
      if(sy.id==='reaper')mods.lifesteal=.10;
      applyBuildModifiers(s,mods,'synergy');
    }
    s.dashDistanceMul=this.items.includes('phase_dash')?1.25:1;
    clampBuildStats(s);
    s.maxHp -= this._hpPenalty || 0;
    this.maxHp = Math.max(1, Math.round(s.maxHp));

    if (isEmber(this) && this.c2.escrowHp > 0) {
      // A reduced maximum first shrinks the held reserve; any excess is
      // forfeited, never turned into healing on release.
      this.c2.escrowHp = Math.min(this.c2.escrowHp, Math.max(0, this.maxHp - 1));
      if (this.c2.escrowHp === 0) this.c2.escrowT = 0;
    }
    this.hp = Math.min(this.hp, this.maxHp - (isEmber(this) ? this.c2.escrowHp : 0));
    this.stats = s;
    this.dashMax = Math.max(1, Math.round(s.dashMax));
    this.dashCharges = Math.min(this.dashCharges, this.dashMax);
    this.armor = Math.min(this.armor, 5);
    for(const w of this.weapons){w.mag=Math.min(w.mag,this.magSize(w));if(w.def.ammoType&&Number.isFinite(w.reserve))w.reserve=Math.min(w.reserve,Math.round((w.def.ammoMax||0)*s.ammoMaxMul));}
    bindSharedMana(this);
  }

  addItem(id) {
    const it=ITEM_MAP[id];if(!it||this.items.includes(id))return false;
    this.items.push(id);this.recompute();
    if(Number.isFinite(it.mods.armor))this.armor=Math.max(0,Math.min(5,this.armor+it.mods.armor));
    if(it.mods.heal)this.heal(it.mods.heal,'relic');
    this.game?.telFirst?.('firstRelic');
    if(this.game?.mode==='run')this.game.metaSee?.('relic',id);
    this.game.toast?.(`获得遗物 · ${it.cn}`,it.desc,'#7affd2','build');
    this.game.newSynergies?.(this.stats.synergies);return true;
  }

  muzzlePoint() {
    if(!this._wp)this._wp=new THREE.Vector3();
    const mz=this.gunModel?.userData.muzzle;
    if(mz)mz.getWorldPosition(this._wp);else this._wp.set(this.x+this.aim.x,.85,this.z+this.aim.z);
    return this._wp;
  }

  giveWeapon(id, slot = -1, carry = null) {
    let def = null;
    // 钟术师（§28）：拾取普通武器时**自动转换成法术核心**，而不是"无法使用"。
    // 顺序很重要：先判断"是不是需要翻译"，再决定从哪里解析定义 ——
    // 早期版本把转换写成 `if (!def && ...)`，而 WEAPON_MAP 对普通武器总能命中，
    // 于是转换永远不会发生（断言抓到过）。
    const sourceId=id.startsWith('spell_')?id.slice(6):id;
    if(carry?.source!==undefined&&(typeof carry.source!=='string'||carry.source!==sourceId))return false;
    if(!validWeaponAssetStateShape(carry?.assetState))return false;
    let src;try {src=carry?.definitionVersion!==undefined?savedWeaponDefinition({id,source:carry.source===undefined?sourceId:carry.source,definitionVersion:carry.definitionVersion}):WEAPON_MAP[id];}catch{return false;}
    if(carry?.assetState!==undefined&&carry.assetState!==null){
      try{
        const stateDef=src||this.game?.spellDefs?.get(id)||(id.startsWith('spell_')&&WEAPON_MAP[sourceId]?spellFromWeapon(WEAPON_MAP[sourceId]):null);
        const validator=new WeaponAssetsRuntime({});if(!validator.supports(stateDef))return false;
        validator.bindInventory({weapons:[{def:stateDef,assetInstanceId:carry.assetInstanceId,assetState:structuredClone(carry.assetState)}]});
        validator.restore(validator.capture());
      }catch{return false;}
    }
    if(carry?.definitionVersion!==undefined)def=src?.isSpell?src:null;
    if (!def && src && !src.isSpell && this.hero && this.hero.augment === 'spellcore') {
      def = carry?.definitionVersion!==undefined ? spellFromWeapon(src) : this.game.spellFor(sourceId);
      if (def) {
        id = def.id;
        this.game.toast('法术核心', `${def.cn} · ${def.desc}`, def.color, 'build');
      }
    }
    if (!def) def = src || null;
    if (!def && this.game && this.game.spellDefs) def = this.game.spellDefs.get(id) || null;
    // 地面法术可能来自读档，缓存并不一定已由手持武器建立。
    if (!def && typeof id === 'string' && id.startsWith('spell_') && WEAPON_MAP[id.slice(6)]) def = this.game.spellFor(id.slice(6));
    if (!def) return false;
    if (carry?.assetInstanceId && this.weapons.some(x => x.assetInstanceId === carry.assetInstanceId)) return false;
    // 武器实例（任务书 §15）：配件必须**跟着这把枪走**。
    // giveWeapon 的第三个参数用于"从地面拾回一把带改装的枪"。
    const w = {
      def,
      mag: Math.round(def.mag * this.stats.magazine),
      reserve: def.ammoMax ? Math.round(def.ammoMax * this.stats.ammoMaxMul) : Infinity,
      dmgMul: 1,
      attachments: [],
    };
    if (carry) {
      if(typeof carry.assetInstanceId==='string')w.assetInstanceId=carry.assetInstanceId;
      if(carry.assetState!==undefined&&carry.assetState!==null&&[2,3].includes(def.weaponAssetVersion))w.assetState=structuredClone(carry.assetState);
      if (typeof carry.mag === 'number') w.mag = Math.max(0, Math.min(w.mag, carry.mag));
      if (typeof carry.reserve === 'number') w.reserve = carry.reserve;
      if (Number.isFinite(carry.dmgMul) && carry.dmgMul > 0) w.dmgMul = carry.dmgMul;
      if (Array.isArray(carry.attachments)) w.attachments = carry.attachments.filter((x) => ATTACH_MAP[x]).slice();
      if (Array.isArray(carry.attachmentPositions)) w.attachmentPositions = carry.attachmentPositions.slice();
    }
    // 已拥有同名武器 → 转金币
    if (![2,3].includes(def.weaponAssetVersion) && this.weapons.some((x) => x.def.id === id)) {
      if (carry && ((carry.attachments || []).length || carry.dmgMul !== undefined && carry.dmgMul !== 1)) {
        this.game.toast('保留改装武器', '已经有一把同型枪；先把它换下，再回来拾取这把带改装的枪。', '#ffd27a');
        return false;
      }
      this.coins += 8;
      return false;
    }
    if (slot >= 0 && slot < this.weapons.length) {
      // 显式指定槽位时，**旧枪必须丢到地上**，而不是静默消失 ——
      // 否则它身上的配件会跟着一起蒸发（§15 承诺"配件跟着这把枪走"）。
      // 断言（"丢枪落地的拾取物必须携带配件"）抓到过这个漏洞。
      const old = this.weapons[slot];
      if (old && old.def) {
        if (this.game && this.game.dropWeaponPickup) this.game.dropWeaponPickup(old, this.x, this.z, this.aim);
        if (slot === this.weaponIndex) this.game.toast('替换武器', `${old.def.cn} → ${def.cn}（旧枪已丢在地上）`, '#ffd27a', 'build');
      }
      this.weapons[slot] = w;
      if (slot === this.weaponIndex) this.setGunModel(def.model);
    } else if (this.weapons.length < this.weaponSlots()) {
      this.weapons.push(w);
      this.weaponIndex = this.weapons.length - 1;
      this.setGunModel(def.model);
    } else {
      // 槽位已满 → 替换当前手持的武器，把旧枪丢在角色**朝向的反方向**上。
      // 必须让玩家清楚发生了什么：否则"捡了新枪旧枪没了"会显得像 bug。
      const old = this.weapons[this.weaponIndex];
      this.game.dropWeaponPickup(old, this.x, this.z, { x: -this.aim.x, z: -this.aim.z });
      this.weapons[this.weaponIndex] = w;
      this.setGunModel(def.model);
      this.game.toast('替换武器', `${old.def.cn} → ${def.cn}（旧枪已丢在地上）`, '#ffd27a', 'build');
    }
    this.recompute();
    this.reloading = false; this.reloadT = 0;
    this.game.metaSee('weapon', def.sourceWeapon || def.sourceId || def.id.replace(/^spell_/, ''));
    this.game.newSynergies(this.stats.synergies);
    this.game.weaponAssets?.bindInventory?.(this);
    // 记录本局用过的不同武器（用于「什么都会一点」成就）
    if (this.game && this.game._weaponSeen) this.game._weaponSeen.add(id);
    // 钟术师成就：记录用过的**法术形态**（§44）
    if (def && def.isSpell && this.game) {
      if (!this.game._spellForms) this.game._spellForms = new Set();
      this.game._spellForms.add(def.spellForm);
      this.game.metaSee('spell', def.spellForm);
    }
    return true;
  }

  get weapon() { return this.weapons[this.weaponIndex]; }

  switchWeapon(i) {
    if (i < 0 || i >= this.weapons.length || i === this.weaponIndex) return;
    this.game.weaponAssets?.suspend();
    this.weaponIndex = i;
    this.recompute();
    this.setGunModel(this.weapon.def.model);
    this.swapT = 2.0;                        // 「换枪操典」的短窗口（§22.1）
    if (this.game && this.game.emit) this.game.emit('onWeaponSwap', { index: i });
    this.reloading = false; this.reloadT = 0; this.charge = 0;
    this.charging=false;this.burstLeft=0;this.burstT=0;this.spin=0;
    audio.reload(1);
  }
  nextWeapon() { if (this.weapons.length > 1) this.switchWeapon((this.weaponIndex + 1) % this.weapons.length); }

  get activeDef() {
    const id = this.actives[this.activeIndex];
    return typeof id === 'string' && Object.hasOwn(ACTIVE_MAP,id) ? ACTIVE_MAP[id] : null;
  }

  giveActive(id) {
    if (typeof id !== 'string' || !Object.hasOwn(ACTIVE_MAP,id)) return false;
    if (this.actives.includes(id)) { this.coins += 10; return false; }
    const first = this.actives.length === 0;
    this.actives.push(id);
    if (this.game && this.game.mode === 'run') this.game.metaSee('active', id);
    if (first) this.activeIndex = 0;
    this.recompute();
    const a = ACTIVE_MAP[id];
    this.game.toast(`获得技能 · ${a.cn}`, `${a.desc}  ·  ${first ? '按 F 释放' : 'TAB 选择 · X 切换'}`, a.color, 'build');
    return true;
  }

  // 治疗是**唯一入口**（遗物 / 拾取 / 吸血 / 技能都走这里）。
  // 烬誓者的「焚掉治疗 → 换誓火」就在这一个点上实现（§13.2），
  // 而不是在每个治疗来源处各写一遍。
  // src：治疗来源（drop / chest / breakable / shop / altar / relic / hero / event）
  // 只用于遥测分账，不影响任何数值（§1.1 要求先拆贡献再决定改哪一层）。
  heal(n, src = 'drop') {
    if (!this.alive || !Number.isFinite(n) || n < 0) return false;
    const d = { n, burn: false };
    if (this.game && this.game.emit) this.game.emit('onHeal', d);
    if (d.burn) return false;                 // 被职业转成了别的资源
    const before = this.hp;
    this.hp = Math.min(this.maxHp - (isEmber(this) ? this.c2.escrowHp : 0), this.hp + n);
    if (this.game && this.game.telHeal) this.game.telHeal(src, n, this.hp - before);
    return true;
  }

  // ---------------- 主更新 ----------------
  // 兼容入口：一帧内完整推进（自动化测试与固定步长模拟使用）。
  // 主循环走的是拆分版本，以便把"相机跟随"插在移动与瞄准之间：
  //   updateMove → Game.updateCamera → Game.solveAim → updateActions
  update(dt, input, world) {
    this.updateMove(dt, input, world);
    if (world.solveAim) world.solveAim();
    this.updateActions(dt, input, world);
    this.animate(dt);
  }

  // 阶段一：计时器 + 移动 + 碰撞
  updateMove(dt, input, world, {controlsBlocked=false}={}) {
    if (!this.alive) {
      this.deadAnim += dt;
      const k = Math.min(1, this.deadAnim * 2.4);
      this.rig.group.rotation.z = k * 1.5;
      this.rig.body.position.y = -k * 0.55;
      return;
    }
    this.iframes = Math.max(0, this.iframes - dt);
    this.hitFlash = Math.max(0, this.hitFlash - dt * 3.2);
    this.overdrive = Math.max(0, this.overdrive - dt);
    this.barrier = Math.max(0, this.barrier - dt);
    this.recoil = Math.max(0, this.recoil - dt * 7);
    this.dashCd = Math.max(0, this.dashCd - dt);
    this.activeCd = Math.max(0, this.activeCd - dt);
    this.dashBuffer = Math.max(0, (this.dashBuffer || 0) - dt);
    if (this.dashCharges < this.dashMax && this.dashCd <= 0) { this.dashCharges = Math.min(this.dashMax, this.dashCharges + 1); this.dashCd = this.dashCdTotal; }
    // 冲刺结束的一刻通知英雄天赋（例如"守钟人"的钟鸣）
    if (this._wasDashing && this.dashTime <= 0 && this.hero && this.hero.hook && this.hero.hook.onDashEnd) {
      this.hero.hook.onDashEnd(this);
    }
    this._wasDashing = this.dashTime > 0;
    if (this.hero && this.hero.hook && this.hero.hook.tick) this.hero.hook.tick(this, dt);

    const mv = controlsBlocked?{x:0,z:0,len:0}:input.moveVec();
    this.moveVec = mv;
    const sprint = this.game.experiment ? tickCombat(this.game, dt, {sprintHeld:actionDown(input, 'sprint'),moving:mv.len>0,firing:actionDown(input, 'fire'),reloading:this.reloading,dashing:this.dashTime>0 || actionHit(input, 'dodge')}) : {speedMul:1};
    const speedMul = this.stats.speed * (this.assetMoveSpeedMul ?? 1) * sprint.speedMul * (this.game.weaponAssets?.moveSpeedMultiplier(this) ?? 1);

    const rangerMoving = isRanger(this) && this.c2.rangerMoveLeft > 0;
    if (controlsBlocked) {
      this.vx=this.vz=0;
    } else if (rangerMoving) {
      rangerMove(this, dt, world);
      this.dashTime = this.c2.rangerMoveLeft > 0 ? Math.max(0, this.dashTime - dt) : 0;
    } else if (this.dashTime > 0) {
      this.dashTime = Math.max(0, this.dashTime - dt);
      this.vx = this.dashDir.x * PLAYER.dashSpeed * (this.stats.dashDistanceMul||1);
      this.vz = this.dashDir.z * PLAYER.dashSpeed * (this.stats.dashDistanceMul||1);
      this.iframes = Math.max(this.iframes, 0.06);
      if (this.game.vr() < 0.85) world.spawnAfterimage(this.x, this.z, this.yaw);
    } else {
      const tx = mv.x * PLAYER.speed * speedMul;
      const tz = mv.z * PLAYER.speed * speedMul;
      const k = Math.min(1, PLAYER.accel * dt / Math.max(PLAYER.speed, 1));
      this.vx += (tx - this.vx) * Math.min(1, k * 2.6);
      this.vz += (tz - this.vz) * Math.min(1, k * 2.6);
      if (mv.len === 0) {
        const fr = Math.max(0, 1 - PLAYER.friction * dt);
        this.vx *= fr; this.vz *= fr;
      }
    }

    // 移动与碰撞
    if (!rangerMoving && !controlsBlocked) {
      const steps = this.game.experiment ? Math.max(1, Math.ceil(Math.hypot(this.vx, this.vz) * dt / .2)) : 1;
      for (let i=0;i<steps;i++) {
        this.x += this.vx * dt / steps; this.z += this.vz * dt / steps;
        world.resolveCircle(this, this.radius, true);
      }
    }

    const spd = Math.hypot(this.vx, this.vz);
    this.moveAmount = Math.min(1, spd / (PLAYER.speed * speedMul || 1));
    if (spd < 0.6) this.standT += dt; else this.standT = 0;
    // 职业能力冷却 / 印记闪光 / 回钟窗口
    if (this.heroSkillCd > 0) this.heroSkillCd = Math.max(0, this.heroSkillCd - dt);
    if (this.bellFlash > 0) this.bellFlash = Math.max(0, this.bellFlash - dt);
    if (this.bellWindow > 0) { this.bellWindow = Math.max(0, this.bellWindow - dt); if (this.bellWindow === 0) this.recompute(); }
    if (this.tuningT > 0) { this.tuningT = Math.max(0, this.tuningT - dt); if (this.tuningT === 0) this.recompute(); }
    if (this.overloadT > 0) { this.overloadT = Math.max(0, this.overloadT - dt); if (this.overloadT === 0) this.recompute(); }
    // 超频 → 结束后自动进入过热（§21.2）
    if (this.overclockT > 0) {
      this.overclockT = Math.max(0, this.overclockT - dt);
      if (this.overclockT === 0 && this.heatOver === undefined) { this.overheatT = 2.5; this.heatOver = 1; }
    }
    if (this.overheatT > 0) { this.overheatT = Math.max(0, this.overheatT - dt); if (this.overheatT === 0) this.heatOver = undefined; }
    // 远征老兵：战意随时间衰减（§22.2"长时间不战斗逐渐下降"），换枪窗口也在走
    this.manaRegen(dt);
    if (this.momentum > 0 && this.hero?.ruleVersion !== 3) {
      this.momentumT += dt;
      const before = this.momentum | 0;
      if (this.momentumT > 3) this.momentum = Math.max(0, this.momentum - dt * 0.9);
      if ((this.momentum | 0) !== before) this.recompute();
    }
    if (this.swapT > 0) { this.swapT = Math.max(0, this.swapT - dt); if (this.swapT === 0) this.recompute(); }
  }

  // 阶段三：冲刺 / 武器 / 技能 / 交互
  updateActions(dt, input, world) {
    if (!this.alive) { return; }
    const mv = this.moveVec || input.moveVec();

    // ---- 冲刺翻滚 ----
    // 只接受**边缘触发**（本帧新按下）。按住不放、连点 20 次都不会连发；
    // 仅保留一个极短（PLAYER.dashBuffer 秒）的受控缓冲，用于"冷却差几帧"的手感补偿。
    const wantDash = actionHit(input, 'dodge');
    if (wantDash) this.dashBuffer = PLAYER.dashBuffer;
    if (this.dashBuffer > 0 && this.dashCharges > 0 && this.dashTime <= 0 &&
        !(isRanger(this) && this.c2.rangerMoveLeft > 0)) {
      this.dashBuffer = 0;
      let dx = mv.x, dz = mv.z;
      if (mv.len === 0) { dx = this.aim.x; dz = this.aim.z; }
      this.startDash(dx, dz, world);
    }

    // ---- 武器与技能 ----
    const w = this.weapon;
    if (actionHit(input, 'reload') && w && w.mag < this.magSize(w)) this.beginReload(w);
    if (actionHit(input, 'weapon_1')) this.switchWeapon(0);
    if (actionHit(input, 'weapon_2')) this.switchWeapon(1);
    if (actionHit(input, 'weapon_3') && this.weaponSlots() >= 3) this.switchWeapon(2);
    if (actionHit(input, 'next_weapon')) this.nextWeapon();
    if (actionHit(input, 'active')) this.useActive(world);
    // 职业能力统一用 C（任务书 §4）：所有英雄同一个键，玩家不需要记"每个人技能键不同"。
    // 与 F（主动道具）并存，互不替代（§5）。
    if (this.game.experiment) {
      for (const action of ['skill_1','skill_2','skill_3','ultimate']) if (actionHit(input, action)) {
        const before = {x:this.x,z:this.z};
        if (tryCombatAction(this.game, action)) {
          if(action==='skill_2'&&this.game.experiment.scheme==='fixed')this.game.notifyConsumableAttack?.();
          if (this.game.experiment.fold) continue;
          if (action === 'skill_1') { this.game.spawnAfterimage?.(before.x,before.z,this.yaw); this.game.spawnAfterimage?.(this.x,this.z,this.yaw); }
          else if (action !== 'skill_3') this.game.particles?.ring?.(this.x,.3,this.z,action === 'ultimate' ? '#ff9d4a' : '#8af0ff',20,action === 'skill_2' ? 3 : 1.4,3);
        } else if (this.game.experiment.fold) this.game.toast?.('未施放',foldActionFailure(this.game,action),'#ffcf6a','fail');
        else if (action !== 'skill_3') this.game.toast?.('未施放',action === 'ultimate' ? '超载需要 100 战斗能量，生效期间不能再次开启' : action === 'skill_1' ? '踏进冷却中、闪避中或前方没有可达空间' : '战术技能冷却中；震慑需要近处敌人，护幕无法覆盖更长的屏障','#ffcf6a','fail');
      }
    } else if (actionHit(input, 'hero_skill') && this.hero?.skillInput !== 'dodge') world.heroSkill(this);
    if (actionHit(input, 'interact')) world.interact(this);

    this.updateWeapon(dt, input, world);
  }

  startDash(dx, dz, world) {
    const l = Math.hypot(dx, dz) || 1;
    this.dashDir = { x: dx / l, z: dz / l };
    this.dashTime = PLAYER.dashTime;
    if (isRanger(this)) {
      this.c2.rangerDir = { ...this.dashDir };
      this.c2.rangerMoveLeft = PLAYER.dashSpeed * PLAYER.dashTime * RANGER_DISTANCE * (this.stats.dashDistanceMul || 1);
      this.c2.rangerUsed = 2;
      this.c2.rangerWindow = this.c2.rangerGap = this.c2.rangerRecovery = 0;
      const tracking = integrationState(this);tracking.rangerT = 8;tracking.rangerTargets = [];
    }
    this.dashCharges--;
    this.dashBuffer = 0;
    // 消耗次数后必须**启动回充计时**。
    // 旧实现从未写入 dashCd，导致下一帧的"cd<=0 就补一次"立刻成立 ——
    // 冲刺冷却形同虚设（唯一限制只有 0.19s 的翻滚时长），
    // 也让「回旋核心」这类减冷却道具完全无效。
    if (this.dashCd <= 0) this.dashCd = this.dashCdTotal;
    // 立即给速度，使翻滚在本帧就可见，而不是延迟一帧
    this.vx = this.dashDir.x * PLAYER.dashSpeed * (this.stats.dashDistanceMul||1);
    this.vz = this.dashDir.z * PLAYER.dashSpeed * (this.stats.dashDistanceMul||1);
    this.iframes = PLAYER.iframes;
    audio.roll();
    world.spawnAfterimage(this.x, this.z, this.yaw);
    world.particles.ring(this.x, 0.12, this.z, this.game.theme.accent, 12, 0.5, 4);
    world.shake(0.06);
  }

  // 一次冲刺回充所需的完整时间（供 HUD 显示回充进度，也供 startDash 使用）
  get dashCdTotal() { return (isRanger(this) ? RANGER_RECOVERY : PLAYER.dashCooldown) * this.stats.dashCdMul; }

  magSize(w) { const a=attachMods(w.attachments);return Math.max(1,Math.round(w.def.mag*Math.max(.25,Math.min(3,this.stats.magazine+(a.magazine||0))))); }

  // 统一弹道：子弹从"枪口"射向"准星在地面上的落点"，两者在准星处严格重合。
  //
  // 修正记录：旧实现在 d < 5.5 的区间把「枪口→准星」与「玩家朝向」做线性插值。
  // 但枪口相对玩家中心有约 1.5–2.4 单位的前向偏移，两条射线并不平行，
  // 于是插值会引入**可达 0.64° 的系统性角度偏差**（实测零扩散下偏差区间 [-0.64°, 0]，
  // 均值 -0.107°）—— 这正是"瞄着头打不中头"的根因。
  // 现在只在贴脸（<0.9，方向会剧烈翻转）时才回退到玩家朝向。
  aimAngleFromXZ(wx, wz) {
    const dx = this.aimPoint ? this.aimPoint.x - wx : this.aim.x;
    const dz = this.aimPoint ? this.aimPoint.z - wz : this.aim.z;
    const d = Math.hypot(dx, dz);
    if (!this.aimPoint || d < 0.9) return Math.atan2(this.aim.x, this.aim.z);
    return Math.atan2(dx, dz);
  }

  beginReload(w) {
    if(this.overdrive>0&&this.game.weaponAssets?.supports(w?.def)){this.game.weaponAssets.beginReload(this,w);return;}
    if(cancelOverdriveReload(this,w))return;
    if (this.hero?.ruleVersion === 3 && this.hero.id === 'forgewright' && this.c2.forgeT > 0) {
      forgeFeed(this,w,0); return;
    }
    if(this.game.weaponAssets?.supports(w?.def)){this.game.weaponAssets.beginReload(this,w);return;}
    if (this.reloading) return;
    if (w.def.ammoType && w.reserve <= 0) { this.game.toast('弹药耗尽', '备弹已空，需要拾取弹药补给', '#ff6a3a', 'fail'); return; }
    this.reloading = true;
    this.reloadT = w.def.reload * this.stats.reloadMul;
    audio.reload(0);
  }

  updateWeapon(dt, input, world) {
    const w = this.weapon;
    if (!w) return;
    forgeFeed(this,w,0);
    cancelOverdriveReload(this,w);
    if(this.game.weaponAssets?.supports(w.def)){this.game.weaponAssets.updateWeapon(this,dt,input,world);return;}
    const def = w.def;
    const gs = this.stats;
    this.fireT = Math.max(0, this.fireT - dt);

    if (this.reloading) {
      this.reloadT -= dt;
      if (this.reloadT <= 0) {
        this.reloadT = 0;
        this.reloading = false;
        const magSize = this.magSize(w);
        const need = magSize - w.mag;
        if (def.ammoType && !(usesSharedMana(this) && def.ammoType === 'mana')) {
          const take = Math.min(need, w.reserve);
          w.mag += take; w.reserve -= take;
        } else w.mag = magSize;
        // 过压弹仓（配件）：装填完成后的前 3 发强化 —— 计数在这里归零
        this._shotsSinceReload = 0;
        audio.reload(1);
        this.game.flashSmall(this.x, 0.9, this.z, def.color || '#ffffff', 3, 0.12);
      }
      return;
    }

    const wantFire = (actionDown(input, 'fire') || this.forcedFire) && !this.game.paused && !this.game.buildOpen && this.game.state === 'play';
    if (wantFire && w.mag <= 0) forgeFeed(this,w,1);
    if (wantFire && w.mag <= 0 && !(this.overdrive>0) && !this.reloading) { this.beginReload(w); return; }

    // 蓄力武器
    if (def.special === 'charge') {
      if (wantFire && (w.mag > 0 || this.overdrive>0)) {
        if (!this.charging) { this.charging = true; audio.gun('charge'); }
        const chargeRate = this.hero?.ruleVersion === 3 && this.hero.id === 'forgewright' && this.c2.forgeT > 0 ? 2 : 1;
        this.charge = Math.min(1, this.charge + chargeRate * dt / def.chargeTime);
        this.game.chargeFx(this, this.charge);
        if (this.charge >= 1 && this.game.vr() < 0.3) this.game.particles.sparkle(this.x + this.aim.x * 1.0, 0.9, this.z + this.aim.z * 1.0, def.color, 1, 1);
      } else if (this.charging) {
        this.charging = false;
        const mul = 1 + (def.chargeMul - 1) * this.charge;
        this.fireWeapon(world, mul, this.charge > 0.95);
        this.charge = 0;
        this.game.clearChargeFx();
      }
      return;
    }
    this.game.clearChargeFx();

    // 预热武器
    if (def.special === 'spinup') {
      if (wantFire) {
        if (this.spin === 0) audio.gun('spinup');
        this.spin = Math.min(1, this.spin + dt / (def.spinTime || 0.5));
      } else this.spin = Math.max(0, this.spin - dt * 1.6);
      this.game.spinFx(this.rig, this.spin);
    } else this.spin = 1;

    if (this.burstLeft > 0) {
      this.burstT = Math.max(0, this.burstT - dt);
      if (this.burstT <= 0) {
        this.fireWeapon(world, 1, false);
        this.burstLeft--;
        this.burstT = def.burstGap || 0.05;
      }
      return;
    }

    // 配件也会改射速（重压枪管 -18% / 冷却片 +22%）
    const amRate = 1 + (this.attachMods().rate || 0);
    const rateMul = gs.rate * consumableModifiers(world).fireRateMult * (this.overdrive > 0 ? 2 : 1) * (def.special === 'spinup' ? (0.28 + 0.72 * this.spin) : 1) * amRate;
    const cd = 1 / Math.max(0.05, def.rate * rateMul);
    if (wantFire && this.fireT <= 0 && (w.mag > 0 || this.overdrive>0)) {
      this.fireT = cd;
      if (def.special === 'burst') { this.burstLeft = Math.max(1, def.burstCount || 1) - 1; this.burstT = def.burstGap || 0.05; }
      this.fireWeapon(world, 1, false);
    }
    // 自动装填提示
    if (w.mag <= 0 && !(this.overdrive>0) && !this.reloading && !this.game.autoReloading) this.beginReload(w);
  }

  fireWeapon(world, chargeMul = 1, fullCharge = false) {
    const w = this.weapon;
    if (!w) return;
    forgeFeed(this,w);
    const def = w.def;
    const gs = this.stats;
    if (w.mag <= 0 && !(this.overdrive>0)) return;
    const magBefore=w.mag,sharedManaShot=usesSharedMana(this)&&def.ammoType==='mana';
    let paidResource=1;
    if(w.mag<=0&&def.ammoType&&!sharedManaShot&&!(w.reserve>=1))return;
    if (def.special === 'beam' && !world.projectiles.beamAvailable()) return;
    if (usesSharedMana(this) && def.ammoType === 'mana') {
      const cost = (def.tags || []).some(t => t === 'heavy' || t === 'explosive') ? 6 : 2;
      if (this.mana < cost) return;
      this.mana -= cost;
      paidResource=cost;
    }
    if(w.mag>0)w.mag--;else if(def.ammoType&&!sharedManaShot)w.reserve--;
    observePayment(this.game,w,paidResource);
    // 广播"开了一枪"：游侠的「静火」据此扣减时间（§10.2：每次射击都消耗时间）。
    if (this.game && this.game.emit) this.game.emit('onShotFired', { weapon: w, def, paid: true });

    // 枪口世界坐标（复用临时向量：加特林这类高射速武器每秒会调到几十次，
    // 每发都新建 Vector3 只是白给 GC 找活干）
    if (!this._wp) this._wp = new THREE.Vector3();
    const wp = this._wp;
    const mz = this.gunModel && this.gunModel.userData.muzzle;
    if (mz) mz.getWorldPosition(wp); else wp.set(this.x + this.aim.x, 0.85, this.z + this.aim.z);

    let dmg = def.damage * gs.damage * consumableModifiers(world).damageMult * chargeMul * (w.dmgMul || 1);
    let echoBaseDamage = dmg;
    if (gs.standstill > 0 && this.standT > 0.5) dmg *= (1 + gs.standstill);
    if(gs.berserk>0)dmg*=1+Math.min(.6,gs.berserk*Math.max(0,this.maxHp-this.hp));
    // 英雄天赋的伤害乘区（守钟人的"钟鸣"、游侠的"专注"…）
    if (this.hero && this.hero.hook && this.hero.hook.damageMul) dmg *= this.hero.hook.damageMul(this, this.game);
    const heroCrit = (this.hero && this.hero.hook && this.hero.hook.critAdd) ? this.hero.hook.critAdd(this, this.game) : 0;
    // 英雄给予的穿透（例如守钟人的"钟鸣一击"）
    const heroPierce = (this.hero && this.hero.hook && this.hero.hook.pierceAdd) ? this.hero.hook.pierceAdd(this, this.game) : 0;
    const crit = this.game.grc(gs.crit + heroCrit);
    if (crit) dmg *= gs.critMul;
    // ---- 武器改装效果（任务书 §14–§20）----
    // 配件是"这把枪怎样变化"，所以在这里结算，而不是进 player.stats（§40）。
    const am = this.attachMods();
    dmg *= (1 + (am.damage || 0));
    echoBaseDamage *= (1 + (am.damage || 0));
    if (am.mechs.lastShot && w.mag <= 0 && magBefore>0) dmg *= 2.2; // Only actual magazine rounds, not direct reserve supply.
    if (am.mechs.afterReload && w.buildReloaded && (this._shotsSinceReload | 0) < 3) dmg *= 1.40;
    this._shotsSinceReload = (this._shotsSinceReload | 0) + 1;

    const statuses = {};
    if (am.burn) statuses.burn = Math.max(statuses.burn || 0, am.burn);          // 余烬核心
    if (am.slow) statuses.slow = Math.max(statuses.slow || 0, am.slow);          // 冷凝核心
    if (def.burn || gs.burn) statuses.burn = Math.max(def.burn || 0, gs.burn);
    if (gs.poison) statuses.poison = gs.poison;
    if (gs.slow) statuses.slow = gs.slow;
    if (def.poison) statuses.poison = def.poison;
    if (this.hero?.ruleVersion === 3 && this.hero.hook?.shotMods) {
      const statusOpt = { statuses };
      this.hero.hook.shotMods(this, statusOpt);
      Object.assign(statuses, statusOpt.statuses);
    }

    // spreadMul：余烬游侠「移动中散布 +35%」等天赋的乘区
    const spreadDeg = def.spread * (this.moveAmount * 0.55 + 0.75) * (def.special === 'flame' ? 1 : 1) * (gs.spreadMul || 1) * (1 + (am.spread || 0));

    // ------------------------------------------------------------
    //  出膛点（弹丸实际生成位置）与枪口（视觉）分离
    //
    //  问题：手臂前伸后枪口距玩家中心可达 1.0–2.4 单位。若弹丸就生成在枪口，
    //  贴脸射击时枪口已经**落在敌人身后** —— 子弹从敌人体内生成、直接飞走，
    //  表现为"贴脸打不中"。同时若玩家瞄远处、身旁贴着敌人，也会整个跳过它。
    //
    //  做法：出膛点始终落在「玩家 → 准星」这条射线上（因此弹道与准星严格共线），
    //  前向距离取
    //    a) 枪口前向距离，
    //    b) 不超过准星距离的 45%（枪口不得越过准星），
    //    c) 绝对上限 1.15，
    //    d) 再收回到「射线上第一个敌人」之前 —— 绝不在敌人身体里生成弹丸。
    //  枪口火光/粒子仍用真实枪口，视觉不受影响。
    // ------------------------------------------------------------
    const adx = this.aim.x, adz = this.aim.z;
    const pd = this.aimPoint ? Math.hypot(this.aimPoint.x - this.x, this.aimPoint.z - this.z) : 8;
    const muzzleFwd = (wp.x - this.x) * adx + (wp.z - this.z) * adz;
    let fwd = Math.min(muzzleFwd, Math.max(0.30, pd * 0.45), 1.15);
    for (let k = 0.30; k <= fwd + 1e-4; k += 0.12) {
      const hx = this.x + adx * k, hz = this.z + adz * k;
      if (world.hitTest(hx, hz, 0.02, TEAM.PLAYER, this, null, 0.85)) { fwd = Math.max(0.30, k - 0.18); break; }
    }
    const sx = this.x + adx * fwd, sz = this.z + adz * fwd;

    const baseAng = this.aimAngleFromXZ(sx, sz);
    const c2DamageApplied = isEmber(this) ? emberMultiplier(this) : undefined;
    const explosive = (def.explosive > 0 ? def.explosive * gs.explosiveMul * chargeMul : (gs.explosive > 0 ? gs.explosive : 0)) * (c2DamageApplied ?? 1);
    const blastR = (explosive > 0 ? 3.2 * gs.blastRadius : 0) + (fullCharge ? 1.6 : 0);

    // Legacy direct attacks keep the firing instance even after switching guns.
    const sourceInstanceId = w.assetInstanceId || (w.assetInstanceId = this.game.weaponAssets?._id('weapon'));
    const rootShotId = this.game.createDamageRootId?.() || null;
    const buildContext=buildShotContext(this,w,am),intrinsicStatuses={};
    for(const k of ['burn','poison','slow'])if(def[k])intrinsicStatuses[k]=def[k];
    if(isEmber(this)&&statuses.ash)intrinsicStatuses.ash=statuses.ash;
    if(w.attachments?.includes('arc_core')){w.buildArc||={streak:0,roots:[]};if(w.buildArc.pending)w.buildArc.streak=0;w.buildArc.pending=rootShotId;}
    if (def.special === 'beam') {
      const bx = Math.sin(baseAng), bz = Math.cos(baseAng);
      const res = world.projectiles.fireBeam(sx, wp.y, sz, bx, bz, {
        damage: dmg, range: 42, color: def.color, width: 0.14 * gs.beamWidth, crit,
        statuses, knock: def.knock, life: 0.09, sourceInstanceId, rootShotId,buildContext,intrinsicStatuses,echoBaseDamage,c2DamageApplied,
      }, world);
      audio.gun('laser');
      world.particles.beam(wp.x, wp.y, wp.z, bx, bz, def.color, res.len, 10);
      this.game.flashSmall(wp.x, wp.y, wp.z, def.color, 9, 0.08);
      this.game.shake(def.shake || 0);
      this.rig.armR.sh.rotation.x -= 0.16;
      if (w.mag <= 0) this.beginReload(w);
      return;
    }

    const pellets = def.pellets || 1;
    const extraShot = gs.twin > 0 && this.game.grc(gs.twin);
    const isFlame = def.special === 'flame';
    for (let i = 0; i < pellets + (extraShot ? 1 : 0); i++) {
      let ang = baseAng;
      if (pellets > 1) ang += ((i / (pellets - 1)) - 0.5) * (spreadDeg * Math.PI / 180) * 2 + (this.game.gr() - 0.5) * 0.05;
      else ang += (this.game.gr() - 0.5) * (spreadDeg * Math.PI / 180);
      const dx = Math.sin(ang), dz = Math.cos(ang);
      const opts = {
        x: sx, y: isFlame ? wp.y - 0.1 : wp.y, z: sz, dx, dz,c2DamageApplied,
        speed: def.speed * (isFlame ? (0.7 + this.game.gr() * 0.5) : 1) * (fullCharge ? 1.25 : 1) * (1 + (am.speed || 0)),
        damage: dmg / (isFlame ? 1 : (pellets > 1 ? 1 : 1)),
        life: def.life * (isFlame ? (0.6 + this.game.gr() * 0.6) : 1) * (1 + (am.life || 0)),
        pierce: (def.pierce || 0) + gs.pierce + heroPierce + (am.pierce | 0),
        bounce:Math.min(24,((def.bounce||0)+gs.bounce+(am.bounce|0))*(buildContext.bounceDouble?2:1)),
        explosive, blastRadius: blastR,
        homing: (def.homing || 0) + gs.homing + (am.homing || 0),
        correctionOnly: am.correctionOnly && !(def.homing || gs.homing) ? true : undefined,
        size: def.size * gs.bulletSize * (fullCharge ? 1.5 : 1),
        radius: def.size * gs.bulletSize * 0.9 + 0.08,
        color: def.color, team: TEAM.PLAYER, crit: crit && i === 0,
        statuses: Object.keys(statuses).length ? statuses : null,
        chain:(def.special==='chain'?def.chainCount:0)+(am.chain|0)-(w.attachments?.includes('arc_core')?1:0),arcCore:w.attachments?.includes('arc_core')||false,buildContext,intrinsicStatuses,
        chainRange: def.chainRange || 6,
        arc: def.special === 'arc',
        speedRetain: def.speedRetain ?? 1,
        noSlow: gs.noBounceSlow,
        kind: def.special === 'arc' ? 'orb' : (def.cls === 'energy' ? 'orb' : 'bolt'),
        spin: def.cls === 'special' ? 1 : 0,
        knock: def.knock,
        owner: this, sourceInstanceId, rootShotId, echoBaseDamage: echoBaseDamage * pellets,
      };
      // 英雄可以改写"这一发弹丸"（回响师的反弹强化 §12.2 / 烬誓者的熔痕 §13.3）。
      // 走 hook 而不是在 fireWeapon 里写 if (hero.id)，符合 §6。
      if (this.hero && this.hero.hook && this.hero.hook.shotMods) {
        const homing = opts.homing;
        try { this.hero.hook.shotMods(this, opts, i === 0); } catch (e) { /* ignore */ }
        if (opts.homing !== homing) opts.correctionOnly = undefined;
      }
      world.projectiles.spawn(opts);
    }
    // 反馈
    audio.gun(def.sfx || 'pistol', def.cls === 'minigun' ? 0.7 : 1);
    world.particles.muzzle(wp.x, wp.y, wp.z, this.aim.x, this.aim.z, def.color, def.explosive > 0 ? 1.6 : (isFlame ? 0.6 : 1));
    this.game.flashSmall(wp.x, wp.y, wp.z, def.color, def.explosive > 0 ? 16 : 8, 0.07);
    // 手感字段一律用 `|| 0` 兜底：任何一个合成的武器定义漏掉 knock / shake，
    // 都会让下面几行算出 NaN，进而把玩家速度、相机抖动一起污染成 NaN。
    // 这属于"数据表 + 消费点分离"的经典风险（见 spells.js 的同类注释），
    // 消费端必须自己兜底，不能假设数据一定齐。
    this.game.shake((def.shake || 0) * (fullCharge ? 2.4 : 1) * (1 + (am.shake || 0)));
    this.recoil = Math.min(0.35, 0.06 + (def.damage || 0) * 0.004);
    this.vx -= this.aim.x * (def.knock || 0) * 0.55;
    this.vz -= this.aim.z * (def.knock || 0) * 0.55;
    if (isFlame) world.particles.smoke(wp.x + this.aim.x, 0.4, wp.z + this.aim.z, 1, '#3a2a1a', 0.5, 0.5);
    if (w.mag <= 0 && !(this.overdrive>0) && !this.reloading) this.beginReload(w);
  }

  // ---------------- 主动技能 ----------------
  useActive(world) {
    const def = this.activeDef;
    if (!def) { this.game.toast('尚无技能', '在商店或宝箱中获得主动技能', '#ffcf6a', 'fail'); return; }
    if (this.activeCd > 0) { audio.ui('error'); this.game.toast('技能冷却中', `${this.activeCd.toFixed(1)} 秒后可用`, '#ffcf6a', 'fail'); return; }
    const cd = def.cd * this.stats.skillCd;
    this.activeCd = cd;
    audio.ui('select');
    const power = this.stats.skillPower;
    world.useActiveSkill(def, this, power);
    this.game.toast(`技能 · ${def.cn}`, def.desc, def.color, 'quick');
  }

  // ---------------- 受击 ----------------
  takeDamage(n, opts = {}) {
    if (!Number.isFinite(n) || n <= 0) return false;
    if (!this.alive || this.iframes > 0 || this.barrier > 0) return false;
    if (this.game?.mode === 'hub') {
      this.iframes = 0.6;
      this.hitFlash = 0.3;
      this.game.shake(0.12);
      return true;
    }
    this.pdChain = 0;        // 受伤即打断完美闪避连击（守钟人成就）
    // dmgTakenMul：英雄代价类天赋（拾荒客「受伤 +15%」）在这里生效
    if (this.stats.dmgTakenMul && this.stats.dmgTakenMul !== 1) n = n * this.stats.dmgTakenMul;
    // 驯炉人「甲」方向（§25）：异兽替玩家吸收一部分伤害 ——
    // 用"护主"而不是"当靶子"来实现"吸引火力"，这样不会影响敌人的目标选择逻辑（§47）。
    if (this.game && this.game.companion && this.game.companion.evo === 'shell' && this.game.companion.alive) {
      n = this.game.companion.absorbFor(n);
      if (n <= 0) { this.iframes = 0.6; return false; }
    }
    const ward=absorbConsumableDamage(this.game,n);
    if (ward.absorbed>0) {
      this.game.toast('临时护甲',`吸收 ${ward.absorbed} 点伤害`,'#6fd0ff','quick');
      n=ward.remainder;
      if(n<=0){this.iframes=.65;this.game.damageFlash(.4);return true;}
    }
    // Boss 战受击计数（用于「纹丝不动：无伤击败一个 Boss」），进入 Boss 房时归零
    if (this.game && this.game.boss && this.game.boss.alive) this._bossHitCount = (this._bossHitCount | 0) + 1;
    if (opts.source === 'contact' && this.stats.thorns > 0 && opts.attacker && opts.attacker.takeDamage) {
      this.game.onDamage(opts.attacker,this.stats.thorns,{source:'thorns',owner:this});
    }
    if (this.armor > 0) {
      this.armor--;
      if (this.armor === 0 && this.game && this.game.emit) this.game.emit('onArmorBreak', {});
      this.game.toast('护甲抵挡', '护甲 -1', '#9aa4ae', 'quick');
      this.iframes = 0.65;
      audio.impact(true);
      this.game.shake(0.16);
      this.game.damageFlash(0.5);
      return true;
    }
    this.hp -= n;
    this.iframes = 1.05;
    this.hitFlash = 1;
    // 本局统计：承受伤害（结算界面会展示，之前该字段声明了但从未写入）
    this.game.run.dmgTaken = (this.game.run.dmgTaken || 0) + n;
    // 遥测：受伤按来源分账（PASS2 §38）——这里才是"真正掉了多少血"的唯一口径
    if (this.game.telDamage) this.game.telDamage(opts.source || 'other', n);
    audio.hurt();
    this.game.shake(0.4);
    this.game.damageFlash(1);
    this.game.particles.bloodburst(this.x, 0.9, this.z, '#ff5a5a', 14, 1.1);
    if (this.hp <= 0) { this.hp = 0; this.die(); }
    return true;
  }

  die() {
    if (!this.alive) return;
    if (isEmber(this)) endEmberEscrow(this, false);
    this.alive = false;
    tickConsumables(this.game,0);
    if (this.game.experiment?.fold) clearFoldRoom(this.game);
    this.deadAnim = 0;
    // 致命伤的处置**完全交给 Game**（Task6）：可能进入"待复苏"（必须保留战斗现场），
    // 也可能最终结算。旧实现在这里就先清 weaponAssets / 播放败北 —— 那会让
    // 待复苏状态丢失已经付费的运行态实体，所以清理被移到了最终结算路径。
    this.game.onPlayerDeath();
  }

  // killed：本帧被击杀的敌人（可选）。英雄 / 教条可以据此判断"精英""距离"等。
  onKill(killed) {
    if(killed?.buildKillProcessed)return;
    if(killed)killed.buildKillProcessed=true;
    // 回收弹仓（配件）：击杀有 30% 概率返还 1 发 —— 走 gameplay 随机（§1.3）
    const w = killed?.assetLastSourceInstanceId?this.weapons.find(w=>w.assetInstanceId===killed.assetLastSourceInstanceId):this.weapon;
    if (!killed?.assetLastNoRefund && w && w.attachments && w.attachments.includes('reclaim_mag') && this.game.grc(0.30)) {
      const cap = this.magSize(w);
      const refund=[2,3].includes(w.def.weaponAssetVersion)?this.game.weaponAssets.claimRefund(w.assetInstanceId,killed.assetLastRootShotId,1):1;
      if(refund>0&&w.def.ammoType==='mana')w.reserve=Math.min(w.def.ammoMax*this.stats.ammoMaxMul,w.reserve+refund);
      else if(refund>0&&w.mag<cap)w.mag=Math.min(cap,w.mag+refund);
      if(w===this.weapon)this.stats.mag=w.mag;
    }
    if(this.game.emit)this.game.emit('onKill',{enemy:killed});
    else if (this.hero && this.hero.hook && this.hero.hook.onKill) this.hero.hook.onKill(this, { enemy: killed }, this.game);
    this.kills++;
    const ctx=killed?.buildKillContext||{}, chain=!!killed?.buildKillChain;
    this.soulCount+=(ctx.soulsMul||this.stats.soulsMul||1)*(chain?(ctx.chainSoulsMul||1):1);
    const need=ctx.soulNeed??this.stats.souls;
    if(need>0&&this.soulCount>=need){this.soulCount%=need;this.heal(1,'relic');audio.heal();this.game.toast('灵魂收割','回复 1 生命','#c07af0','quick');}
    const chance=Math.min(1,Math.max(0,ctx.lifesteal??this.stats.lifesteal));
    if((ctx.burnLife&&(killed?.status?.burn>0||killed?.buildBurnKill))||(chance>0&&this.game.grc(chance))){this.heal(1,'relic');audio.heal();}

  }

  // src：金币来源（kill / chest / pickup / shop_sell / modifier），仅用于遥测分账
  addCoins(n, src = 'pickup') {
    if (!Number.isFinite(n) || n < 0 || !Number.isFinite(this.stats.coins) || this.stats.coins < 0) return false;
    const next = this.coins + Math.round(n * this.stats.coins);
    if (!Number.isSafeInteger(next) || next < 0) return false;
    const gained = next - this.coins;
    this.coins = next;
    if (gained > 0 && this.game && this.game.telCoins) this.game.telCoins('in', src, gained);
    return true;
  }

  animate(dt) {
    const rig = this.rig;
    if (!this.alive) return;
    const asset=this.weapon?.assetState||{};
    animateWeaponAssetModel(this.gunModel,{time:this.game.time,charge:this.charge,heat:(asset.heat||0)/100,sequence:asset.sequence||0,mode:asset.mode,anchors:this.game.weaponAssets?.entities.filter(v=>v.kind==='anchor'&&v.owner===this.weapon?.assetInstanceId).length||0,reloading:this.reloading,reloadProgress:this.reloading?1-this.reloadT/Math.max(.1,this.weapon?.def.reload||1):0,recoil:this.recoil,firing:actionDown(this.game.input, 'fire')});
    this.walkPhase += dt * (4.4 + this.moveAmount * 9.5) * (this.moveAmount > 0.05 ? 1 : 0.35);
    rig.group.position.set(this.x, 0, this.z);
    // 朝向约定（全局唯一）：模型正面在本地 +Z（面部护目镜 / 目镜 / 手臂前伸后的枪口都在 +Z），
    // 而 yaw = atan2(dx, dz) 本身就是"指向瞄准点"的角度，两者同构 ⇒ rotation.y = yaw。
    // 旧写法多加了 π，导致**整个角色背对瞄准方向**（枪从背后伸出、脸朝镜头、披风甩在身前）。
    // 这是纯视觉缺陷：弹道走的是 sin/cos(yaw) 与旋转无关，所以逻辑测试全绿 —— 典型的"逻辑对、看得见的错"。
    rig.group.rotation.y = this.yaw;
    // 冲刺翻滚
    if (this.dashTime > 0) {
      const p = 1 - this.dashTime / PLAYER.dashTime;
      rig.body.rotation.x = -p * Math.PI * 2;
      rig.body.position.y = Math.sin(p * Math.PI) * 0.42;
    } else {
      rig.body.rotation.x *= Math.max(0, 1 - dt * 12);
      rig.body.position.y *= Math.max(0, 1 - dt * 12);
    }
    walkHumanoid(rig, this.walkPhase, 0.35 + this.moveAmount * 0.85, this.moveAmount);
    // Animate only this rig's existing furnace parts; cached materials stay immutable.
    if(rig.backTank){const rage=this.hero?.ruleVersion===3&&this.hero.id==='forgewright'&&this.c2.forgeT>0;
      rig.backTank.scale.setScalar(rage?1.04+Math.sin(this.game.time*16)*.035:1);
      if(rage&&Math.floor((this.game.time-dt)*4)!==Math.floor(this.game.time*4))this.game.particles.sparkle(this.x,.9,this.z,'#ff8a3c',1,.7);}
    // 瞄准手臂
    const pitch = -0.10;
    rig.armR.sh.rotation.x = -Math.PI / 2 + pitch - this.recoil * 1.6;
    rig.armR.sh.rotation.z = -0.24;
    rig.armR.el.rotation.x = 0.18 + this.recoil;
    rig.armL.sh.rotation.z = 0.20;
    rig.armL.sh.rotation.x = -0.22 - this.recoil * 0.4;
    // 披风摆动
    const sw = Math.sin(this.walkPhase * 0.8) * 0.12 + this.moveAmount * 0.22;
    rig.cloakPivot.rotation.x = -0.12 - this.moveAmount * 0.35 - sw * 0.5;
    rig.cloakPivot.rotation.z = Math.sin(this.walkPhase * 0.6) * 0.08;
    rig.capePivot.rotation.x = this.moveAmount * 0.25;
    if (rig.tail) rig.tail.rotation.x = -0.2 - this.moveAmount * 0.5;
    // 受击闪红
    const flash = this.hitFlash;
    if (flash > 0) {
      rig.body.scale.setScalar(1 + flash * 0.07);
    } else rig.body.scale.setScalar(1);
    if (this.dashTime > 0 && this.game.vr() < 0.7) this.game.spawnAfterimage(this.x, this.z, this.yaw);
  }
}
