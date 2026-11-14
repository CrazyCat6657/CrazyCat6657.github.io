import {guardActorPanel} from './actor_context.js';
import {resolveMinimapZoom} from './preferences.js';
import {PAGE_COMBAT_MODE} from '../experimental/combat/mode.js';
import {e2KeyText,e2BuildDetails} from '../ui/text_e2_view.js';
import {updateCombatHUD} from '../experimental/combat/page.js';
import { controlLabel } from '../core/control_actions.js';
import { seedToWords } from '../core/rng.js';
import { mountControls } from '../ui/controls_view.js';
import { doctrineSummary } from './doctrines.js';
import { EquipmentView } from '../ui/equipment_view.js';
import { mountRelicPreview } from '../ui/relic_preview.js';
import { preferences, applyReticlePreferences, reticleSVG } from './preferences.js';
import { mountPreferences } from '../ui/preferences_view.js';
// ============================================================
//  HUD / 小地图 / 浮动文字 / 信息分级 / 构筑面板 / 界面流程
//
//  信息设计原则：
//   - 消息分级，不同价值的信息不共用同一条堆叠队列
//     quick  : 即时反馈（拾取、清房、护甲）—— 低价值可覆盖
//     fail   : 操作失败（金币不足、弹药耗尽）—— 短促、居中下方
//     build  : 构筑变化（新武器/遗物/技能/协同）—— 独立大卡片，停留时间长
//     story  : 楼层与剧情 —— 顶部横幅，独占
//   - 玩家随时可按 Tab 查看完整本局构筑
// ============================================================
import * as THREE from '../../vendor/three.module.js';
import { glyphSvg, glyphKeyForItem, glyphKeyForActive, glyphKeyForWeapon } from '../ui/glyphs.js';
import { audio } from '../core/audio.js';
import { ATTACH_MAP, SLOT_CN } from './attachments.js';
import { runeName } from './spells.js';
import { WEAPON_MAP, ITEM_MAP, ACTIVE_MAP } from './data.js';
import { meta } from './meta.js';
import {DamageFeedbackView} from '../ui/damage_feedback_view.js';
import {renderActiveSelector} from '../ui/active_selector.js';
// WB-1（2026-10-14）：局内资源与复苏状态的**纯展示**翻译层。
// 它只把实际消费者读到的字段变成文案；读值全部在本文件里完成（见 slotRes / renderRunStatus）。
import { weaponResourceView, weaponHeldNote, runRevivalView, displayNumber, LOW_MANA_FRACTION } from '../ui/run_status_view.js';

const TYPE_COLOR = {
  start: '#8fa2b0', battle: '#4a6472', treasure: '#e8c84a', shop: '#6ad86a',
  special: '#b48adf', hidden: '#5fe0ff', boss: '#ff4a2a', exit: '#8af0ff',
  vault: '#e08a3a',
};

const RARITY_COLOR = ['#8adf6a', '#5ad8ff', '#c07af0', '#ffd24a'];

export class HUD {
  constructor(game) {
    this.game = game;
    this._eventController=new AbortController();
    this.equipment = new EquipmentView(this);
    this.el = {
      hud: document.getElementById('hud'),
      hearts: document.getElementById('hearts'),
      armor: document.getElementById('armor'),
      coins: document.getElementById('coins'),
      keys: document.getElementById('keys'),
      floorName: document.getElementById('floor-name'),
      floorSub: document.getElementById('floor-sub'),
      roomName: document.getElementById('room-name'),
      weapons: document.getElementById('weapons'),
      skill: document.getElementById('skill'),
      heroSkill: document.getElementById('hero-skill'),
      items: document.getElementById('items'),
      status: document.getElementById('status-row'),
      revivalChip: document.getElementById('revival-chip'),
      dashes: document.getElementById('dashes'),
      mana: document.getElementById('mana-status'),
      bossbar: document.getElementById('bossbar'),
      bossFill: document.querySelector('#bossbar .boss-fill'),
      bossPhase: document.querySelector('#bossbar .phase-tag'),
      bossName: document.querySelector('#bossbar .boss-name'),
      toasts: document.getElementById('toasts'),
      toastsFail: document.getElementById('toasts-fail'),
      buildCard: document.getElementById('build-card'),
      story: document.getElementById('story-banner'),
      tips: document.getElementById('tips'),
      interact: document.getElementById('interact'),
      reticle: document.getElementById('reticle'),
      center: document.getElementById('center-msg'),
      popups: document.getElementById('popups'),
      worldLabels: document.getElementById('world-labels'),
      minimap: document.getElementById('minimap'),
      build: document.getElementById('screen-build'),
      buildBody: document.getElementById('build-body'),
      buildBtn: document.getElementById('btn-build'),
      choicePanel: document.getElementById('choice-panel'),
      choiceTitle: document.getElementById('choice-title'),
      choiceSub: document.getElementById('choice-sub'),
      choiceCards: document.getElementById('choice-cards'),
      hubPanel: document.getElementById('hub-panel'),
      hubTitle: document.getElementById('hub-title'),
      hubSub: document.getElementById('hub-sub'),
      hubRows: document.getElementById('hub-rows'),
    };
    this.el.reticle.innerHTML = reticleSVG();
    applyReticlePreferences(this.el.reticle, preferences.get());
    this._hub = null;
    this.clearPanelInput();
    this.mmCtx = this.el.minimap.getContext('2d');
    this.popups = [];
    this.lanes = { quick: [], fail: [] };
    this.heartsCache = -1;
    this.armorCache = -1;
    this._v = new THREE.Vector3();
    this.damageFeedbackView=new DamageFeedbackView({container:this.el.popups,project:({x,y,z})=>{
      this._v.set(x,y,z).project(this.game.camera);
      return {x:(this._v.x*.5+.5)*window.innerWidth,y:(-.5*this._v.y+.5)*window.innerHeight,
        visible:this._v.z>=-1&&this._v.z<=1&&Math.abs(this._v.x)<=1.1&&Math.abs(this._v.y)<=1.1};
    }});
    this.centerTimer = 0;
    this.buildTimer = 0;
    this.storyTimer = 0;
    this.tipTimer = 0;
    this.buildOpen = false;
    this.lastWeaponSig = '';
    this.buildControls();
    const saveTools = document.getElementById('save-tools');
    const helpButton = document.getElementById('btn-help');
    this.listen(helpButton,'click', () => {
      if (saveTools) saveTools.open = false;
      queueMicrotask(() => helpButton.setAttribute('aria-expanded', String(document.getElementById('helpbox').classList.contains('show'))));
    });
    this.listen(saveTools,'toggle', () => {
      if (!saveTools.open) return;
      document.getElementById('helpbox')?.classList.remove('show');
      helpButton?.setAttribute('aria-expanded', 'false');
    });
    this.listen(document.getElementById('btn-hub-close'),'click', () => {
      this.backHubPanel();
      this.game.input?.clearEdges();
    });
    this.listen(document.getElementById('btn-choice-close'),'click', () => {
      this.game.closeTopPanel();
      this.game.input?.clearEdges();
    });
    this.listen(document.getElementById('btn-hub-preferences'),'click', () => this.game.useHub('readout'));
    this.listen(window,'blur', () => { this.pointerFocused = false; this.hideReticle(); this.game.canvas.style.cursor = 'default'; });
    this.listen(window,'focus', () => { this.pointerFocused = true; this.syncPanelInput(); });
    this.listen(document,'fullscreenchange', () => this.syncPanelInput());
    this.listen(document,'pointermove', event => {
      this.pointerOnUI = event.target !== this.game.canvas;
      if (this.pointerOnUI) this.hideReticle();
    });
    this.pointerFocused = true;
    this.listen(document.getElementById('btn-hub-training'),'click', () => this.game.useHub('training'));
    this.listen(document.getElementById('btn-hub-developer'),'click', () => this.game.useHub('developer'));
  }

  listen(target,type,fn,options={}) { target?.addEventListener(type,fn,{...options,signal:this._eventController.signal}); }
  dispose() { this._eventController.abort();this._disposeSettings?.();this.equipment.models.close();this.damageFeedbackView.clear?.(); }

  buildControls() {
    // 这张表是玩家唯一能查"我还能按什么"的地方，所以**每一个可用按键都必须在这里**。
    // 曾经漏了 C（职业能力）—— 玩家实测反馈"我都不知道我自己还有一个技能，
    // 按了 C 才发现有这么个东西"。新增按键时务必回来补一行。
    const key = action => controlLabel(this.game.input, action);
    const fold = (this.game.experiment?.scheme || this.game.experimentPreview)==='foldshadow';
    const rows = [
      [[key('move_up'),key('move_left'),key('move_down'),key('move_right')].join(' · '), '移动'],
      ['鼠标', '瞄准'], [key('fire'), '射击'], [key('dodge'), '闪避（游侠可以连续闪现两次）'],
      [key('reload'), '装填'], [key('next_weapon'), '下一把武器'],
      ...(this.game.input?.profile !== 'experimental' ? [[[1,2,3].map(i=>key('weapon_'+i)).join(' · '), '指定武器槽（第三槽限拾荒客）']] : []),
      [key(this.game.input?.profile === 'experimental' ? 'skill_3' : 'hero_skill'), '职业能力（游侠合并到闪避）'],
      [key('active'), '使用当前主动道具'], [key('cycle_active'), '轮换主动道具（共享冷却）'],
      [key('interact'), '交互 / 开箱 / 交易 / 下楼 / 拾取武器'],
      [key('build'), '本局构筑与武器改装'], [key('minimap'), '放大小地图'],
      ...(this.game.input?.profile === 'experimental' ? [[key('sprint'), '疾跑（消耗体力，无无敌）'],[key('skill_1')+' / '+key('skill_2')+' / '+key('skill_3'), fold?'掠影 / 留影 / 折返':'踏进 / 战术 / 钟鸣'],[key('ultimate'), fold?'万象折镜（100战斗能量）':'战斗能量超载']] : []),
      ['ESC', '关闭最上层面板 / 暂停'], ['方向键 / E / Enter', '菜单导航 / 确认（固定）'],
      ['鼠标 / 滚轮', '选择菜单选项 / 滚动列表'],
      ['1 / 2 / 3', '选择奖励卡片'],
    ];
    const html = rows.map(([k, v]) => `<div><kbd>${k}</kbd>${v}</div>`).join('');
    const a = document.getElementById('ctl-list'); if (a) a.innerHTML = html;
    const b = document.getElementById('ctl-list2'); if (b) b.innerHTML = html;
  }

  applyDisplayPreferences(p) {
    const prefs = preferences.get ? { ...preferences.get(), ...(p || {}) } : (p || {});
    if (this.el.reticle) applyReticlePreferences(this.el.reticle, prefs);
    // 音量：设定值（music / sfx）与开关（_enabled）是两层，两层都要写，
    // 缺一层就会出现"关了音效但音乐还在响"这类半生效状态。
    // master 不在这里动 —— 它没有对玩家暴露，改动它等于整体响度变了一个量级。
    audio.setVolume?.('music', prefs.volumeMusic);
    audio.setVolume?.('sfx', prefs.volumeSfx);
    audio.setEnabled?.('music', prefs.musicOn !== false);
    audio.setEnabled?.('sfx', prefs.sfxOn !== false);
    // 小地图只缓存原始偏好值；真正的换算在 drawMinimap 里按"当前是不是紧凑档"现算
    // （转屏会改变档位，缓存换算结果会在转屏后失效）。
    this._mmPref = prefs.minimapZoom;
    return prefs;
  }

  hidePauseScreen(){document.getElementById('screen-pause')?.classList.add('hidden');}

  heartSVG() {
    return `<svg viewBox="0 0 24 22"><path d="M12 21C12 21 1 14.4 1 7.6 1 4 3.7 1.4 7.1 1.4c2 0 3.7 1 4.9 2.6 1.2-1.6 2.9-2.6 4.9-2.6C20.3 1.4 23 4 23 7.6 23 14.4 12 21 12 21z" fill="#e03a4a" stroke="#5a0d16" stroke-width="1.6"/></svg>`;
  }
  shieldSVG() {
    return `<svg viewBox="0 0 20 22"><path d="M10 1 2 4v7c0 6 8 10 8 10s8-4 8-10V4z" fill="#5a8ac0" stroke="#12283f" stroke-width="1.4"/></svg>`;
  }
  coinSVG() { return `<svg class="ico" viewBox="0 0 18 18"><circle cx="9" cy="9" r="7.4" fill="#ffd24a" stroke="#6a4a08" stroke-width="1.6"/><circle cx="9" cy="9" r="3.4" fill="#a87a10"/></svg>`; }
  keySVG() { return `<svg class="ico" viewBox="0 0 18 18"><circle cx="6" cy="6" r="4" fill="none" stroke="#ffe9a8" stroke-width="2"/><rect x="7" y="8" width="2.4" height="8" fill="#ffe9a8"/><rect x="9" y="13" width="4" height="2.2" fill="#ffe9a8"/></svg>`; }

  hideReticle() { if (this.el.reticle) this.el.reticle.style.display = 'none'; }
  showReticle() { if (this.pointerFocused !== false && this.el.reticle) this.el.reticle.style.display = ''; }

  preferencesPanel() {
    const fromHub = this.game.mode === 'hub' && this.hubOpen;
    this.hubPanel({ page: 'preferences', settings: true, title: '设置', sub: '画面、声音、操作与拾取。', onBack: fromHub ? () => this.game.useHub('readout') : null });
  }

  controlsPanel() {
    this.hubPanel({ page: 'controls', settings: true, controls: true, title: '键位设置', sub: '当前页面对应预设即时生效；另一预设独立保存。', onBack: () => this.preferencesPanel() });
  }

  refreshControlLabels() {
    this._wSig = this._sSig = this._hsSig = null;
    this.buildControls();
  }

  backHubPanel() {
    const back = this._hub?.cfg.onBack;
    if (this.closeHubPanel() === false) return;
    back?.();
  }

  update(dt) {
    const g = this.game, p = g.player;
    updateCombatHUD(g);
    if (!p) return;
    if (this.hubMode) this.updateDeveloperStatus();
    // 心跳
    const hs = [];
    const held = p.hero?.ruleVersion === 3 && p.hero.id === 'emberoath' ? p.c2.escrowHp : 0;
    for (let i = 0; i < p.maxHp; i++) {
      const fill = Math.max(0, Math.min(1, p.hp - i));
      const escrow = Math.max(0, Math.min(1, p.hp + held - i)) - fill;
      hs.push(`<div class="heart${fill || escrow ? '' : ' empty'}"${escrow && !fill ? ' style="opacity:.40;filter:grayscale(.65)" title="焚誓暂时封存"' :
        fill > 0 && fill < 1 ? ` style="opacity:${fill.toFixed(2)}"` : ''}>${this.heartSVG()}</div>`);
    }
    const hkey = `${p.maxHp}:${p.hp.toFixed(2)}:${held.toFixed(2)}`;
    if (hkey !== this.heartsCache) { this.el.hearts.innerHTML = hs.join(''); this.heartsCache = hkey; }
    const akey = p.armor;
    if (akey !== this.armorCache) {
      this.el.armor.innerHTML = new Array(p.armor).fill(`<div class="armor-pip">${this.shieldSVG()}</div>`).join('');
      this.armorCache = akey;
    }
    this.el.coins.innerHTML = this.coinSVG() + p.coins;
    this.el.keys.innerHTML = this.keySVG() + p.keys;

    // 冲刺（Dash）指示：常驻可用次数与回充进度
    this.renderDashes(p);
    this.renderMana(p);

    // 武器
    //   签名缓存：武器栏/技能栏/状态栏的结构每帧重建 innerHTML 会造成持续的
    //   DOM 解析 + 布局开销（武器槽内含 6 个嵌套节点）。只在内容真正变化时重建，
    //   数字类字段单独更新文本。
    //   武器区保留弹匣与备弹；法力统一由左上角 renderMana 展示。
    const slotRes = (w, i) => weaponResourceView({
      ammoType: w.def.ammoType, ammoMax: w.def.ammoMax, reserve: w.reserve, mag: w.mag,
      manaCap: ((i === p.weaponIndex || usesSharedMana(p)) && w.def.ammoType === 'mana') ? p.manaCap() : undefined,
      sharedMana: usesSharedMana(p),
    });
    const wSig = p.weapons.map((w, i) => `${w.def.id}:${i === p.weaponIndex ? 1 : 0}:${p.reloading && i === p.weaponIndex ? 1 : 0}:${p.magSize(w)}:${slotRes(w, i).kind}`).join('|');
    if (this._wSig !== wSig) {
      this._wSig = wSig;
      this.el.weapons.innerHTML = p.weapons.map((w, i) => {
        const d = w.def;
        const rv = slotRes(w, i);
        const magSize = p.magSize(w);
        const pct = Math.max(0, Math.min(1, w.mag / magSize));
        return `<div class="wslot ${i === p.weaponIndex ? 'active' : ''}">
          <div class="wn">${d.cn}<span class="wres ${rv.kind}" data-reskind="${i}">${rv.label}</span></div>
          <div class="wa"><span data-ammo="${i}">${rv.ammoText}</span></div>
          <div class="bar"><i data-bar="${i}" style="width:${pct * 100}%"></i></div>
          ${p.reloading && i === p.weaponIndex ? `<div class="reload">装填中</div>` : ''}
        </div>`;
      }).join('');
    } else {
      // 同结构下只更新会逐帧变化的数字（弹匣、备弹/法力、进度条与低法力提醒），不重建 DOM
      for (let i = 0; i < p.weapons.length; i++) {
        const w = p.weapons[i];
        const rv = slotRes(w, i);
        const magSize = p.magSize(w);
        const ammoEl = this.el.weapons.querySelector(`[data-ammo="${i}"]`);
        const ammoText = rv.ammoText;
        if (ammoEl && ammoEl.textContent !== ammoText) ammoEl.textContent = ammoText;
        const resEl = this.el.weapons.querySelector(`[data-reskind="${i}"]`);
        if (resEl) resEl.classList.toggle('low', !!rv.low);
        const barEl = this.el.weapons.querySelector(`[data-bar="${i}"]`);
        if (barEl) { const pct = Math.max(0, Math.min(1, w.mag / magSize)); barEl.style.width = (pct * 100).toFixed(1) + '%'; }
      }
    }

    // 技能
    const ad = p.activeDef;
    if (ad) {
      const cd = p.activeCd, total = ad.cd * p.stats.skillCd;
      const ready = cd <= 0;
      const pct = ready ? 1 : 1 - cd / total;
      const sSig = `${ad.id}:${ready ? 1 : 0}:${cd.toFixed(1)}:${p.actives.length}`;
      if (this._sSig !== sSig) {
        this._sSig = sSig;
        this.el.skill.className = 'panel' + (ready ? ' ready' : '');
        this.el.skill.innerHTML = `<div class="sn">[${controlLabel(g.input, 'active')}] ${ad.cn}${ready ? ' ◆ 就绪' : ` ${cd.toFixed(1)}s`}</div><div class="sb"><i style="width:${(pct * 100).toFixed(1)}%;background:${ready ? '#9dff5a' : '#ffb347'}"></i></div>${p.actives.length>1?`<div class="sd">[${controlLabel(g.input, 'cycle_active')}] 切换主动道具</div>`:''}`;
      }
    } else if (this._sSig !== 'none') {
      this._sSig = 'none';
      this.el.skill.className = 'panel hidden';
      this.el.skill.innerHTML = '';
    }

    // 职业能力（Hero Skill，统一 C 键）—— 任务书 §4 / §5。
    // 只显示"这个英雄怎么打"最核心的一件事：冷却 + 专属资源。
    // 数据来自 hero.hook.resource(p)，不在 HUD 里写 if (hero.id)（§6）。
    const heroDef = g.hero;
    if (heroDef && this.el.heroSkill) {
      const hcd = g.experiment?.fold?.swapCd ?? p.heroSkillCd ?? 0, htotal = g.experiment?.fold ? 2 : p.heroSkillCdMax || 1;
      const status = heroDef.hook?.skillStatus?.(p, g) || null;
      const hReady = hcd <= 0 && status?.ready !== false;
      const hres = (heroDef.hook && heroDef.hook.resource) ? heroDef.hook.resource(p) : { txt: '' };
      const remaining = Number.isFinite(status?.remaining) ? Math.max(0, status.remaining) : null;
      const total = Number.isFinite(status?.total) && status.total > 0 ? status.total : null;
      const progress = Number.isFinite(status?.progress) ? Math.max(0, Math.min(1, status.progress)) :
        remaining !== null && total !== null ? 1 - Math.min(1, remaining / total) :
        hcd > 0 ? 1 - Math.min(1, hcd / htotal) : hReady ? 1 : 0;
      const reason = !hReady ? (hcd > 0 ? `${hcd.toFixed(1)}s` : status?.reason || '暂不可用') : '';
      const hSig = `${heroDef.id}:${hReady ? 1 : 0}:${hcd.toFixed(1)}:${reason}:${progress.toFixed(2)}:${hres?.txt || ''}`;
      if (this._hsSig !== hSig) {
        this._hsSig = hSig;
        this.el.heroSkill.className = 'panel' + (hReady ? ' ready' : '');
        this.el.heroSkill.innerHTML =
          `<div class="sn">[${controlLabel(g.input, g.experiment ? 'skill_3' : heroDef.skillInput === 'dodge' ? 'dodge' : 'hero_skill')}] ${heroDef.skillName || '职业能力'}${hReady ? ' ◆ 就绪' : ` · ${reason}`}</div>` +
          `<div class="sb"><i style="width:${(progress * 100).toFixed(1)}%;background:${hReady ? '#8af0ff' : '#ffb347'}"></i></div>` +
          (hres?.txt ? `<div class="sd">${hres.txt}</div>` : '');
      }
    }

    // 状态效果（显示 0.1s 精度，避免每帧重建）
    const fx = g.statusEffects();
    const fxKey = fx.map((f) => `${f.cn}${f.t > 0 ? Math.ceil(f.t * 10) : ''}`).join(',');
    if (this._fxKey !== fxKey) {
      this._fxKey = fxKey;
      this.el.status.innerHTML = fx.map((f) => `<span class="fx" style="border-color:${f.c};color:${f.c}">${f.cn}${f.t > 0 ? ` ${f.t.toFixed(1)}s` : ''}</span>`).join('');
    }

    // 本局复苏状态（Task6 / WB-1）：只读 runPolicy / revival / runId 并翻译成文案，
    // 不写玩法状态；大厅 / 标题 / 结算语境由纯函数判为 null（不显示上一局）。
    this.renderRunStatus();

    // 遗物 chips
    const chips = p.items.map((id) => {
      const it = ITEM_MAP[id];
      if (!it) return '';
      const c = RARITY_COLOR[Math.min(3, it.rarity - 1)];
      return `<div class="item-chip" style="border-color:${c}" title="${it.cn}：${it.desc}"><span style="color:${c};font-size:1.05em">${it.cn[0]}</span></div>`;
    });
    for (const s of (p.stats.synergies || [])) {
      chips.push(`<div class="item-chip syn" style="border-color:#ffd24a" title="协同 ${s.cn}：${s.desc}"><span style="color:#ffd24a;font-size:.8em">协</span></div>`);
    }
    const itemsKey = p.items.join(',') + '|' + (p.stats.synergies || []).map((s) => s.id).join(',');
    if (this._itemsKey !== itemsKey) { this.el.items.innerHTML = chips.join(''); this._itemsKey = itemsKey; }

    // 楼层 / 房间
    const th = g.theme;
    const banner = typeof g.stageBanner === 'function' ? g.stageBanner() : null;
    this.el.floorName.textContent = banner ? banner.name : th.name;
    this.el.floorSub.textContent = banner ? banner.sub : th.sub;
    this.el.roomName.textContent = g.roomLabel();

    // Boss 血条
    if (g.boss && g.boss.alive) {
      this.el.bossbar.classList.remove('hidden');
      const f = Math.max(0, g.boss.hp / g.boss.maxHp);
      this.el.bossFill.style.width = (f * 100).toFixed(1) + '%';
      this.el.bossPhase.textContent = ['I', 'II', 'III'][g.boss.phase] || 'I';
      if (this.el.bossName) this.el.bossName.textContent = g.boss.cn || '';
    } else this.el.bossbar.classList.add('hidden');

    this.updatePopups(dt);
    this.updateWorldLabels();
    this.updateLanes(dt);
    // 交互提示
    const it = g.nearestInteractable();
    this.lastInteractDanger = !!(it && it.type === 'chest' && it.need && p.keys <= 0);
    const hint = g.interactHint();
    if (hint) {
      this.el.interact.classList.remove('hidden');
      this.el.interact.innerHTML = hint;
      this.el.interact.classList.toggle('danger', this.lastInteractDanger);
      this.el.interact.classList.toggle('shop', !!it && it.type === 'shop');
      this.el.interact.classList.toggle('warn', !!(it && it.disabled));
    } else this.el.interact.classList.add('hidden');
    // 中央信息
    if (this.centerTimer > 0) {
      this.centerTimer -= dt;
      if (this.centerTimer <= 0) this.el.center.classList.remove('show');
    }
    if (this.buildTimer > 0) { this.buildTimer -= dt; if (this.buildTimer <= 0) this.el.buildCard.classList.remove('show'); }
    if (this.storyTimer > 0) { this.storyTimer -= dt; if (this.storyTimer <= 0) this.el.story.classList.remove('show'); }
    if (this.tipTimer > 0) { this.tipTimer -= dt; if (this.tipTimer <= 0) this.el.tips.classList.remove('show'); }
    // 受击红屏统一由 Player.takeDamage 触发（护甲抵挡 0.5 / 掉血 1.0）。
    // 这里曾额外做一次"HP 下降就闪 0.7"，叠加后每次都顶到上限，
    // 屏幕上会一直糊着一层红。已移除。

    if (this.buildOpen) this.renderBuild();

    this.drawMinimap();
  }

  // 左上角法力资源，只读真实角色池或武器独立池。
  renderMana(p) {
    const el = this.el.mana;
    if (!el) return;
    // 角色共享池独立于手持武器；旧职业的独立池逐把列出，避免切枪后误认回满。
    const shared = usesSharedMana(p);
    const manaWeapons = p.weapons.filter(w => w.def.ammoType === 'mana');
    const pools = shared ? [{ label: '法力', value: p.mana, cap: p.manaCap() }] :
      manaWeapons.map(w => ({
        label: `法力 · ${w.def.cn}`,
        value: w.reserve, cap: w === p.weapon ? p.manaCap() : w.def.ammoMax || 120,
      }));
    const sig = JSON.stringify(pools.map(v => [v.label, displayNumber(v.value), v.cap, v.value < v.cap * LOW_MANA_FRACTION]));
    if (this._manaSig === sig) return;
    this._manaSig = sig;
    el.classList.toggle('hidden', !pools.length);
    el.replaceChildren(...pools.map(v => {
      const row = document.createElement('div');
      row.className = 'mana-pool' + (v.value < v.cap * LOW_MANA_FRACTION ? ' low' : '');
      row.textContent = `${v.label} ${displayNumber(v.value)}/${displayNumber(v.cap)}`;
      return row;
    }));
  }

  // 冲刺可用次数 + 回充进度（默认 1 次冲刺时也要能看到）
  renderDashes(p) {
    const el = this.el.dashes;
    if (!el) return;
    const cdTotal = p.dashCdTotal || 1;
    const filling = (p.dashCharges < p.dashMax && p.dashCd > 0) ? 1 - p.dashCd / cdTotal : 0;
    const key = `${p.dashMax}:${p.dashCharges}:${Math.ceil(filling * 12)}`;
    if (this._dashKey === key) return;
    this._dashKey = key;
    let html = '';
    for (let i = 0; i < p.dashMax; i++) {
      const filled = i < p.dashCharges;
      const pct = filled ? 100 : (i === p.dashCharges ? filling * 100 : 0);
      html += `<div class="dash-pip${filled ? ' ready' : ''}"><i style="width:${pct.toFixed(0)}%"></i></div>`;
    }
    html += `<span class="dash-label">冲刺 ${p.dashCharges}/${p.dashMax}</span>`;
    el.innerHTML = html;
  }

  centerMessage(title, sub, dur = 2.4) {
    this.game.copyReview?.recordMessage(title, sub);
    this.el.center.querySelector('.cm-t').textContent = title;
    this.el.center.querySelector('.cm-s').textContent = sub || '';
    this.el.center.classList.add('show');
    this.centerTimer = dur;
  }

  // ---------------- 信息分级 ----------------
  toast(title, sub, color, kind = 'quick') {
    title = e2KeyText(title, this.game.input);
    sub = e2KeyText(sub, this.game.input);
    this.game.copyReview?.recordMessage(title, sub);
    const c = color || '#5fe0ff';
    if (kind === 'story') {
      const e = this.el.story;
      e.innerHTML = `<div class="sb-t" style="color:${c}">${title}</div>${sub ? `<div class="sb-s">${sub}</div>` : ''}`;
      e.style.borderColor = c;
      e.classList.add('show');
      this.storyTimer = 3.2;
      return;
    }
    if (kind === 'build') {
      const e = this.el.buildCard;
      e.innerHTML = `<div class="bc-t" style="color:${c}">${title}</div>${sub ? `<div class="bc-s">${sub}</div>` : ''}`;
      e.style.borderLeftColor = c;
      e.classList.add('show');
      this.buildTimer = 5.0;
      // 构筑信息同时进入历史，可在 Tab 中回看
      if (!this._buildLog) this._buildLog = [];
      this._buildLog.unshift({ t: title, s: sub, c });
      if (this._buildLog.length > 12) this._buildLog.pop();
      return;
    }
    const lane = kind === 'fail' ? 'fail' : 'quick';
    const host = lane === 'fail' ? this.el.toastsFail : this.el.toasts;
    const list = this.lanes[lane];
    const max = lane === 'fail' ? 2 : 3;
    const life = lane === 'fail' ? 2.2 : 1.8;
    // 同类低价值消息合并：标题相同直接刷新计时
    const dup = list.find((x) => x.title === title);
    if (dup) { dup.life = life; return; }
    const d = document.createElement('div');
    d.className = 'toast' + (lane === 'fail' ? ' fail' : '');
    d.style.borderLeftColor = c;
    d.innerHTML = `<div class="tt" style="color:${c}">${title}</div>${sub ? `<div class="td">${sub}</div>` : ''}`;
    host.appendChild(d);
    list.push({ el: d, life, title });
    while (list.length > max) { const t = list.shift(); t.el.remove(); }
  }

  updateLanes(dt) {
    for (const lane of ['quick', 'fail']) {
      const list = this.lanes[lane];
      for (let i = list.length - 1; i >= 0; i--) {
        const t = list[i];
        t.life -= dt;
        if (t.life < 0.45) t.el.style.opacity = Math.max(0, t.life / 0.45);
        if (t.life <= 0) { t.el.remove(); list.splice(i, 1); }
      }
    }
  }

  tip(text) {
    this.el.tips.textContent = text;
    this.el.tips.classList.add('show');
    this.tipTimer = 5.0;
  }

  flashBuild() {
    if (this.el.buildBtn) {
      this.el.buildBtn.classList.add('pulse');
      setTimeout(() => this.el.buildBtn.classList.remove('pulse'), 1400);
    }
  }

  // ---------------- 构筑面板 ----------------
  toggleBuild(v) {
    this.buildOpen = v === undefined ? !this.buildOpen : v;
    this.game.setModalOwner('build', this.buildOpen);
    this.clearPanelInput();
    this.el.build.classList.toggle('hidden', !this.buildOpen);
    if (this.buildOpen) { this._buildSig = null; this.renderBuild(); this.hideReticle(); }
    else this.equipment.close();
    if (!this.buildOpen && this.game.state === 'play' && !this.game.paused) this.showReticle();
    this.syncPanelInput();
    this.focusTopPanel();
  }

  handleEquipmentKeys(input) { this.equipment.keys(input); }

  renderBuild() {
    const p = this.game.player;
    if (!p) return;
    const signature = JSON.stringify([p.weapons.map(w => [w.def.id, w.assetInstanceId, w.attachments, w.attachmentPositions]),
      p.weaponIndex, p.spareAttachments, p.items, p.actives, p.activeIndex, p.hp, p.armor, p.coins, p.keys,
      p.stats,p.hero?.id,p.hero?.ruleVersion,p.doctrines, this._buildLog, this.equipment.signature(), preferences.get().autoDetachOnReplace]);
    if (this._buildSig === signature) return;
    this._buildSig = signature;
    const focused = document.activeElement;
    const focusData = focused && this.el.buildBody.contains(focused) ? { ...focused.dataset } : null;
    const scroll = this.el.buildBody.scrollTop;
    const st = p.stats;
    const row = (k, v) => `<div class="bs-r"><span>${k}</span><b>${v}</b></div>`;
    const synergyHtml = (st.synergies || []).length
      ? st.synergies.map((s) => `<div class="bs-syn"><b>${s.cn}</b><span>${s.desc}</span></div>`).join('')
      : '<div class="bs-empty">尚未激活任何协同。武器标签与遗物组合可能触发额外效果。</div>';
    const itemHtml = p.items.length
      ? p.items.map((id) => {
        const it = ITEM_MAP[id]; if (!it) return '';
        const c = RARITY_COLOR[Math.min(3, it.rarity - 1)];
        // §37：用**推导出的字形**代替纯文字（icon 字段只有 3/39 条填了，不可依赖）
        const gl = glyphSvg(glyphKeyForItem(it));
        return `<div class="bs-item" style="border-color:${c}">${gl}<b style="color:${c}">${it.cn}</b><span>${it.desc}</span></div>`;
      }).join('')
      : '<div class="bs-empty">尚未获得遗物。</div>';
    // 任务书 §20：改装后显示「原武器名 + 配件徽记」，不生成超长随机词缀名。
    // §40：这里展示的是"这把枪怎样变化"，与遗物（角色规则）分列，层次不混。
    const wHtml = this.equipment.weaponsHTML(p);
    // 法力说明：weaponHeldNote 以前没有任何消费者，玩家看不到"为什么切枪像回满"。
    // 放在构筑面板（按需展开），常驻 HUD 只留状态 —— 与 E2 的信息分级一致。
    const heldManaNote = p.weapon ? weaponHeldNote(weaponResourceView({
      ammoType: p.weapon.def.ammoType, ammoMax: p.weapon.def.ammoMax, reserve: p.weapon.reserve, mag: p.weapon.mag,
      manaCap: p.weapon.def.ammoType === 'mana' ? p.manaCap() : undefined, sharedMana: usesSharedMana(p),
    }), true) : null;
    const spare = p.spareAttachments || [];
    const spareHtml = this.equipment.spareHTML(p);
    const log = (this._buildLog || []).map((l) => `<div class="bs-log" style="color:${l.c}">${l.t}${l.s ? ` <i>${l.s}</i>` : ''}</div>`).join('');
    // 构筑路线（Task5）：本局所选路线的缺口与待领的免费必要装备。
    const rv = this.game.routeView ? this.game.routeView() : null;
    const routeHtml = rv && rv.selected ? `<h3>构筑路线</h3>
      <div class="bs-item" style="border-color:#8ad8ff">
        <b style="color:#8ad8ff">${(rv.routes.find((r) => r.id === rv.selected) || {}).name || rv.selected}</b>
        <span>还需：${rv.missing.length ? rv.missing.map((m) => m.label).join('、') : '必要装备已集齐'}</span>
        ${rv.pending ? `<button class="btn small" type="button" data-supply-open="1">领取待领装备（${rv.pending}）</button>` : ''}
      </div>` : '';

    this.el.buildBody.innerHTML = `
      <div class="bs-col">
        <h3>${p.hero?.cn || '职业'} · ${p.weaponSlots()} 把武器 / 每枪 ${p.attachSlots()} 配件槽</h3><div class="bs-item"><span>${p.hero?.talent || ''}</span><span class="e2-cost">${p.hero?.costNote || ''}</span>${p.doctrines?.length?`<span>教条：${doctrineSummary(p.doctrines,p.hero?.ruleVersion)}</span>`:''}</div><h3>持有武器 · 装配目标</h3>${wHtml}${routeHtml}
        <h3>主动技能</h3><div class="active-selector"></div>
        ${e2BuildDetails(p, this.game.input)}
      </div>
      <div class="bs-col">
        <h3>备用配件（${spare.length}/${p.spareCap()} · <span class="bs-tip">拖放，或点选后确认</span>）</h3>${spareHtml}
        <h3>遗物（${p.items.length}）</h3>${itemHtml}
        <h3>协同（${(st.synergies || []).length}）</h3>${synergyHtml}
        ${log ? `<h3>构筑记录</h3><div class="bs-logs">${log}</div>` : ''}
      </div>
      <div class="bs-col">
        <h3>属性</h3>
        <div class="bs-rows">
          ${row('生命', `${p.hp} / ${p.maxHp}`)}
          ${row('护甲', p.armor)}
          ${row('金币', p.coins)}
          ${row('钥匙', p.keys)}
          ${row('伤害倍率', `×${st.damage.toFixed(2)}`)}
          ${row('射速倍率', `×${st.rate.toFixed(2)}`)}
          ${row('暴击率', `${(st.crit * 100).toFixed(0)}%`)}
          ${row('暴击伤害', `×${st.critMul.toFixed(1)}`)}
          ${row('移速倍率', `×${st.speed.toFixed(2)}`)}
          ${row('弹匣倍率', `×${st.magazine.toFixed(2)}`)}
          ${row('装填倍率', `×${st.reloadMul.toFixed(2)}`)}
          ${row('穿透 / 弹跳', `${st.pierce} / ${st.bounce}`)}
          ${row('技能威力 / 冷却', `×${st.skillPower.toFixed(2)} / ×${st.skillCd.toFixed(2)}`)}
          ${row('冲刺', `${p.dashCharges} / ${p.dashMax}`)}
          ${row('本局击杀', this.game.run.kills)}
          ${row('本局房间', this.game.run.rooms)}
          ${row('承受伤害', Math.round(this.game.run.dmgTaken || 0))}
        </div>
        ${heldManaNote ? `<p class="bs-active-help">${heldManaNote}</p>` : ''}
      </div>`;
    renderActiveSelector(this.el.buildBody.querySelector('.active-selector'),this.game.getActiveSelectionView(),{
      useLabel:controlLabel(this.game.input, 'active'), cycleLabel:controlLabel(this.game.input, 'cycle_active'),
      disabled:this.game.state!=='play'||!p.alive,
      onSelect:id=>{if(this.game.selectActive(id)){
        const focused=document.activeElement?.dataset?.activeId;
        this.game.input?.clearEdges();this.renderBuild();
        if(focused)this.el.buildBody.querySelector(`[data-active-id="${focused}"]`)?.focus({preventScroll:true});
      }},
    });
    this.equipment.bind(this.el.buildBody);
    this.equipment.models.draw(this.el.buildBody, p.weapons);
    this.el.buildBody.scrollTop = scroll;
    if (focusData) {
      const next = [...this.el.buildBody.querySelectorAll('button')].find(e =>
        Object.keys(focusData).length && Object.entries(focusData).every(([k,v]) => e.dataset[k] === v));
      next?.focus({ preventScroll: true });
    }
    if (!this._buildClickBound) {
      this._buildClickBound = true;
      this.listen(this.el.buildBody,'click', e => {
        if (this.game.topModal() !== 'build') return;
        if (e.target.closest('[data-supply-open]')) { this.game.setBuild(false); this.game.openPendingRouteSupply?.(); }
      });
    }
  }

  // ---------------- 本局复苏状态（WB-1） ----------------
  // 纯读取：把 game 上已经存在的本局字段交给 run_status_view 翻译。
  // 注意三条不能做的事：不读 meta 偏好、不推断"用过几次"、不在无本局状态时编造。
  renderRunStatus() {
    const el = this.el.revivalChip;
    if (!el) return;
    const g = this.game;
    const view = runRevivalView({ mode: g.mode, state: g.state, runId: g.runId, runPolicy: g.runPolicy, revival: g.revival });
    const sig = view ? `${view.status}|${view.tone}|${view.detail}` : 'none';
    if (this._rvSig === sig) return;
    this._rvSig = sig;
    if (!view) { el.classList.add('hidden'); el.innerHTML = ''; return; }
    el.className = `rv-chip ${view.tone}`;
    el.innerHTML = `<b>${view.label}</b><span>${view.detail}</span>`;
  }

  // 显式清空（换局 / 进大厅）：这些时机 HUD.update 不一定还会跑，
  // 光靠每帧重算会在"上一帧的 DOM"里留下上一局的复苏状态。
  hideRunStatus() {
    this._rvSig = null;
    const el = this.el.revivalChip;
    if (el) { el.className = 'rv-chip hidden'; el.innerHTML = ''; }
  }

  resetRun() {
    this.clearDamageFeedback();
    for (const lane of ['quick', 'fail']) { for (const t of this.lanes[lane]) t.el.remove(); this.lanes[lane].length = 0; }
    this.el.buildCard.classList.remove('show');
    this.el.story.classList.remove('show');
    this.el.tips.classList.remove('show');
    this.el.popups.innerHTML = '';
    this.popups.length = 0;
    this._buildLog = [];
    this._fxKey = null;
    // 结构缓存也要清：否则新一局若恰好与上一局结构相同，
    // 而 DOM 已在别处被清空时，会保留一个空壳不重建。
    this._wSig = null;
    this._sSig = null;
    this._itemsKey = null;
    this._dashKey = null;
    this.hideRunStatus();
    this.heartsCache = -1;
    this.armorCache = -1;
    this.game.setBuild(false);
  }

  popText(wx, wy, wz, text, color, big = false) {
    if (this.popups.length > 42) {
      const old = this.popups.shift();
      if (old && old.el.parentNode) old.el.remove();
    }
    const d = document.createElement('div');
    d.className = 'popup';
    d.textContent = text;
    d.style.color = color || '#fff';
    d.style.fontSize = big ? '1.9em' : '1.25em';
    this.el.popups.appendChild(d);
    this.popups.push({ el: d, x: wx, y: wy, z: wz, life: 0.75, maxLife: 0.75, vz: 1.6, big });
  }

  applyDamageFeedback(packets) {
    this.damageFeedbackView.update(this.game.damageFeedbackTimeMs||0);
    this.damageFeedbackView.apply(packets);
  }
  clearDamageFeedback(){this.damageFeedbackView.clear();}

  // ------------------------------------------------------------
  //  世界标签（常驻）：训练靶的名字 / 血量、摆动钟的警告等。
  //
  //  为什么需要它：玩家实测反馈"靶子也不显示血量，也不显示啥，谁知道那是靶子"。
  //  3D 里没有文字，纯靠造型很难让人认出"这是给人打的"。
  //  这里用 DOM 覆盖层把世界坐标投影到屏幕，和弹字共用同一套投影思路。
  //  DOM 节点按需创建 / 复用，不每帧重建（那会每帧解析一次 HTML，很贵）。
  // ------------------------------------------------------------
  setWorldLabels(list) {
    const want = list || [];
    const box = this.el.worldLabels;
    if (!box) return;
    // 数量变化时补齐 / 裁掉节点
    while (box.childNodes.length < want.length) {
      const d = document.createElement('div');
      d.className = 'wlb';
      box.appendChild(d);
    }
    while (box.childNodes.length > want.length) box.removeChild(box.lastChild);
    for (let i = 0; i < want.length; i++) {
      const el = box.childNodes[i];
      const w = want[i];
      if (el.dataset.sig !== w.html) { el.innerHTML = w.html; el.dataset.sig = w.html; }
      el.dataset.x = String(w.x); el.dataset.y = String(w.y); el.dataset.z = String(w.z);
      el.dataset.cls = w.cls || '';
    }
    this._labels = want;
  }

  updateWorldLabels() {
    const box = this.el.worldLabels;
    if (!box || !this._labels || !this._labels.length) return;
    const cam = this.game.camera;
    const w = window.innerWidth, h = window.innerHeight;
    for (let i = 0; i < this._labels.length; i++) {
      const el = box.childNodes[i];
      if (!el) continue;
      const l = this._labels[i];
      this._v.set(l.x, l.y, l.z).project(cam);
      if (this._v.z > 1) { el.style.display = 'none'; continue; }
      el.style.display = 'block';
      el.className = 'wlb' + (l.cls ? ' ' + l.cls : '');
      el.style.left = ((this._v.x * 0.5 + 0.5) * w).toFixed(1) + 'px';
      el.style.top = ((-this._v.y * 0.5 + 0.5) * h).toFixed(1) + 'px';
    }
  }

  updatePopups(dt) {
    this.damageFeedbackView.update(this.game.damageFeedbackTimeMs||0);
    const cam = this.game.camera;
    const w = window.innerWidth, h = window.innerHeight;
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const p = this.popups[i];
      p.life -= dt;
      p.y += p.vz * dt;
      p.vz *= Math.max(0, 1 - dt * 3.2);
      if (p.life <= 0) { p.el.remove(); this.popups.splice(i, 1); continue; }
      this._v.set(p.x, p.y, p.z).project(cam);
      if (this._v.z > 1) { p.el.style.display = 'none'; continue; }
      p.el.style.display = 'block';
      const sx = (this._v.x * 0.5 + 0.5) * w;
      const sy = (-this._v.y * 0.5 + 0.5) * h;
      p.el.style.left = sx.toFixed(1) + 'px';
      p.el.style.top = sy.toFixed(1) + 'px';
      const t = p.life / p.maxLife;
      p.el.style.opacity = Math.min(1, t * 2).toFixed(2);
      const sc = 1 + (1 - t) * 0.25;
      p.el.style.transform = `translate(-50%,-50%) scale(${sc.toFixed(2)})`;
    }
  }

  minimapGeom() {
    const g = this.game, d = g.dungeon;
    if (!d) return null;
    const cv = this.el.minimap;
    if (!cv) return null;
    const n = d.gridSize;
    // ① 分辨率跟随显示尺寸 ×DPR。**下限取 180 = 历史值**，这样任何设备上都不会比改动前更糊；
    //    上限（DPR 封顶 2）只是为了不把填充率浪费在一个指示器上。
    const cssW = cv.clientWidth || cv.width || 180;
    const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    const S = Math.max(180, Math.round(cssW * dpr));
    // ② 内容缩放
    const compact = document.body.classList.contains('tc-compact');
    // 大图状态的唯一来源是 **Game.mmBig**（toggleMinimapBig 写的就是它）。
    // 这里读 this.mmBig 是个真实踩过的坑：HUD 上根本没有这个字段，
    // 于是大图永远按"没放大"算，局部窗口与总览画出来一模一样。
    const zoom = g.mmBig ? 1 : resolveMinimapZoom({ minimapZoom: this._mmPref }, compact);
    const span = Math.min(n, Math.max(3, Math.ceil(n / zoom)));
    const cur = g.room;
    let wx = 0, wy = 0;
    if (span < n) {
      // 窗口居中到当前房间并钳制在网格内 —— 钳制是必须的：靠近网格边缘时
      // 不钳制就会画到网格外面去，右下角整块空白。
      const half = (span - 1) / 2;
      wx = Math.min(n - span, Math.max(0, Math.round((cur ? cur.gx : 0) - half)));
      wy = Math.min(n - span, Math.max(0, Math.round((cur ? cur.gy : 0) - half)));
    }
    const cell = Math.floor((S - 10) / (span + 0.4));
    const ox = (S - cell * span) / 2 - wx * cell;
    const oy = (S - cell * span) / 2 - wy * cell;
    // cssW 一起返回：判断"房间看起来有多大"必须用**显示尺寸**，
    // 而 cell 是 backing store 里的尺寸，两者差一个 cssW/S 的倍率。
    // 探针断言就靠这一项，不必自己再拍一个公式。
    return { S, n, span, wx, wy, cell, ox, oy, compact, cssW, dpr };
  }

  drawMinimap() {
    const g = this.game, d = g.dungeon;
    if (!d) return;
    const cv = this.el.minimap;
    // #hud 隐藏 / 小地图 display:none 时 clientWidth 为 0。此时不重设 backing store、
    // 也不绘制 —— 否则会拿 0 尺寸算出退化几何，画出一堆 0 宽的矩形。
    if (!cv || !cv.clientWidth) return;
    const ctx = this.mmCtx;
    const G = this.minimapGeom();
    if (!G) return;
    const { S, span, wx, wy, cell, ox, oy } = G;
    if (cv.width !== S) { cv.width = cv.height = S; }
    ctx.clearRect(0, 0, S, S);
    const inWin = (r) => r.gx >= wx && r.gx < wx + span && r.gy >= wy && r.gy < wy + span;
    ctx.lineWidth = Math.max(2, cell * 0.18);
    ctx.strokeStyle = 'rgba(150,200,220,0.34)';
    for (const r of d.list) {
      if (!r.discovered || !inWin(r) || (r.type === 'hidden' && !g.hiddenRoomRevealed(r))) continue;
      for (const key of ['n', 's', 'e', 'w']) {
        if (!r.doors[key] && !(r.secretWallDirs || []).some(s => s.dir === key && (s.isEntry || g._residentRooms.get(r.uid)?.secretOpen.has(key)))) continue;
        const dx = key === 'e' ? 1 : key === 'w' ? -1 : 0;
        const dy = key === 's' ? 1 : key === 'n' ? -1 : 0;
        const nb = d.get(r.gx + dx, r.gy + dy);
        if (!nb || !nb.discovered || !inWin(nb) || (nb.type === 'hidden' && !g.hiddenRoomRevealed(nb))) continue;
        ctx.beginPath();
        ctx.moveTo(ox + (r.gx + 0.5) * cell, oy + (r.gy + 0.5) * cell);
        ctx.lineTo(ox + (nb.gx + 0.5) * cell, oy + (nb.gy + 0.5) * cell);
        ctx.stroke();
      }
    }
    for (const r of d.list) {
      if (!r.discovered || !inWin(r) || (r.type === 'hidden' && !g.hiddenRoomRevealed(r))) continue;
      const x = ox + r.gx * cell, y = oy + r.gy * cell;
      const pad = Math.max(1, cell * 0.14);
      let col = TYPE_COLOR[r.type] || '#4a6472';
      if (!r.visited && r.type !== 'start') col = this.shade(col, 0.55);
      ctx.fillStyle = col;
      ctx.fillRect(x + pad, y + pad, cell - pad * 2, cell - pad * 2);
      ctx.strokeStyle = 'rgba(0,0,0,0.65)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + pad, y + pad, cell - pad * 2, cell - pad * 2);
      const cx = x + cell / 2, cy = y + cell / 2;
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      if (r.type === 'shop') { ctx.fillRect(cx - cell * 0.16, cy - cell * 0.2, cell * 0.32, cell * 0.4); }
      else if (r.type === 'treasure') { ctx.fillRect(cx - cell * 0.18, cy - cell * 0.14, cell * 0.36, cell * 0.28); }
      else if (r.type === 'boss') {
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(cx, cy, cell * 0.22, 0, 6.3); ctx.fill();
        ctx.fillStyle = '#ff4a2a';
        ctx.beginPath(); ctx.arc(cx, cy, cell * 0.13, 0, 6.3); ctx.fill();
      } else if (r.type === 'exit') {
        ctx.fillStyle = '#04202a';
        ctx.fillRect(cx - cell * 0.18, cy - cell * 0.18, cell * 0.36, cell * 0.36);
        ctx.fillStyle = '#8af0ff';
        ctx.fillRect(cx - cell * 0.1, cy - cell * 0.1, cell * 0.2, cell * 0.2);
      } else if (r.type === 'vault') {
        ctx.fillStyle = '#2a1608';
        ctx.fillRect(cx - cell * 0.2, cy - cell * 0.2, cell * 0.4, cell * 0.4);
        ctx.fillStyle = '#e08a3a';
        ctx.fillRect(cx - cell * 0.09, cy - cell * 0.09, cell * 0.18, cell * 0.18);
      } else if (r.type === 'special') {
        ctx.fillStyle = '#2a1a3a';
        ctx.beginPath(); ctx.moveTo(cx, cy - cell * 0.22); ctx.lineTo(cx + cell * 0.2, cy); ctx.lineTo(cx, cy + cell * 0.22); ctx.lineTo(cx - cell * 0.2, cy); ctx.closePath(); ctx.fill();
      } else if (!r.cleared && r.visited) {
        ctx.fillStyle = '#ff8a3a';
        ctx.fillRect(cx - cell * 0.08, cy - cell * 0.08, cell * 0.16, cell * 0.16);
      }
    }
    const cur = g.room;
    if (cur) {
      const x = ox + cur.gx * cell, y = oy + cur.gy * cell;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      const t = (performance.now() / 320) % 1;
      const infl = 1 + Math.sin(t * Math.PI * 2) * 0.14;
      const hw = (cell * 0.5) * infl;
      ctx.strokeRect(x + cell / 2 - hw, y + cell / 2 - hw, hw * 2, hw * 2);
    }
  }

  shade(hex, f) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.round(((n >> 16) & 255) * f), g = Math.round(((n >> 8) & 255) * f), b = Math.round((n & 255) * f);
    return `rgb(${r},${g},${b})`;
  }

  // 结算标题：由 Game 按结算类型算好传进来（victory_copy.js），HUD 不猜首领身份。
  setVictoryVerdict({ title = '', sub = '' } = {}) {
    const t = document.getElementById('victory-title');
    if (t) t.textContent = title;
    const s = document.getElementById('victory-sub');
    if (s) s.textContent = sub;
  }

  showScreen(id) {
    if (id === 'screen-pause') document.getElementById('seed-text').textContent = seedToWords(this.game.seed);
    const saves = document.getElementById('save-tools');
    if (saves && !document.getElementById('save-alert')?.textContent) saves.open = false;
    for (const s of ['screen-loading', 'screen-title', 'screen-pause', 'screen-victory', 'screen-death']) {
      const e = document.getElementById(s);
      if (e) e.classList.toggle('hidden', s !== id);
    }
    this.el.hud.classList.toggle('hidden', id === 'screen-title' || id === 'screen-loading');
    if (id === 'screen-victory' || id === 'screen-death') this.game.setBuild(false);
    // 任何全屏界面出现时都收起准星
    this.hideReticle();
  }
  hideScreens() {
    for (const s of ['screen-loading', 'screen-title', 'screen-pause', 'screen-victory', 'screen-death']) {
      const e = document.getElementById(s);
      if (e) e.classList.add('hidden');
    }
    this.el.hud.classList.remove('hidden');
    this.showReticle();
    this.syncPanelInput();
  }
  hideHud() { this.el.hud.classList.add('hidden'); }

  fillStats(run, elId) {
    const el = document.getElementById(elId);
    if (!el) return;
    const mins = Math.floor(run.time / 60), secs = Math.floor(run.time % 60).toString().padStart(2, '0');
    el.innerHTML = `
      <div>用时 <b>${mins}:${secs}</b></div>
      <div>击杀 <b>${run.kills}</b></div>
      <div>精英击杀 <b>${run.eliteKills || 0}</b></div>
      <div>金币 <b>${run.coins}</b></div>
      <div>钥匙 <b>${run.keys}</b></div>
      <div>武器 <b>${run.weapons.length}</b></div>
      <div>遗物 <b>${run.items.length}</b></div>
      <div>主动技能 <b>${run.actives.length}</b></div>
      <div>抵达 <b>${run.progress || `第 ${run.floor} 层`}</b></div>
      <div>房间 <b>${run.rooms}</b></div>
      <div>承受伤害 <b>${Math.round(run.dmgTaken || 0)}</b></div>
      <div>秘门 <b>${run.secrets || 0}</b></div>
      <div>宝库 <b>${run.vaults || 0}</b></div>`;
    const itEl = document.getElementById(elId.replace('-stats', '-items'));
    if (itEl) {
      const chips = [
        ...run.weapons.map((id) => {
          const live = this.game.player?.weapons.find(w => w.def.id === id)?.def;
          const def = live || this.game.spellDefs?.get(id) || WEAPON_MAP[id] ||
            (id.startsWith('spell_') ? this.game.spellFor?.(id.slice(6)) : null);
          return `<span>${def?.cn || '未知武器'}</span>`;
        }),
        ...run.items.map((i) => `<span>${ITEM_MAP[i] ? ITEM_MAP[i].cn : i}</span>`),
        ...run.actives.map((a) => `<span>${ACTIVE_MAP[a] ? ACTIVE_MAP[a].cn : a}</span>`),
        ...(run.synergies || []).map((s) => `<span class="syn">协同 · ${s}</span>`),
      ];
      itEl.innerHTML = chips.join('') || '<span style="opacity:.5">没有获得任何装备</span>';
    }
  }

  // ============================================================
  //  大厅功能面板（英雄 / 军械 / 商行 / 功勋墙 / 档案馆 / 试炼门）
  //
  //  刻意做成**一个通用列表控件**而不是七套专页：
  //  大厅的功能点只会越来越多，通用控件让"加一个功能点"的成本保持在十几行。
  // ============================================================
  hubPanel(cfg) {
    cfg=guardActorPanel(this.game,cfg);
    if (this.game.actorCount!==2 && this.game.pendingHubSelection?.()) { this.game.noticePendingHubSelection(); return; }
    this.clearPanelInput();
    this.updateDeveloperStatus();
    const same = !!cfg.page && this._hub?.cfg.page === cfg.page;
    const scroll = same ? this.el.hubRows.closest('.hub-panel').scrollTop : 0;
    const active = document.activeElement;
    const focusRow = same && this.el.hubRows.contains(active) ? active.dataset.i : null;
    this._hub = { cfg, idx: same ? this._hub.idx : 0 };
    this.game.setModalOwner('hub', true);
    this.el.hubPanel.classList.remove('hidden');
    this.el.hubTitle.textContent = cfg.title || '';
    this.el.hubSub.textContent = e2KeyText(cfg.sub, this.game.input);
    this.renderHubPanel();
    this.el.hubRows.closest('.hub-panel').scrollTop = scroll;
    this.hideReticle();
    this.syncPanelInput();
    if (same && focusRow != null) this.el.hubRows.querySelector(`[data-i="${focusRow}"]`)?.focus({ preventScroll: true });
    else if (!same) this.focusTopPanel();
  }

  closeHubPanel() {
    if (this.game.actorCount!==2 && this.game.pendingHubSelection?.()) { this.game.noticePendingHubSelection(); return false; }
    this._disposeSettings?.(); this._disposeSettings = null;
    this._hub = null;
    this.game.setModalOwner('hub', false);
    this.el.hubPanel.classList.add('hidden');
    this.clearPanelInput();
    this.syncPanelInput();
    this.focusTopPanel();
  }

  get hubOpen() { return !!this._hub; }

  renderHubPanel() {
    const H = this._hub;
    if (!H) return;
    this._disposeSettings?.(); this._disposeSettings = null;
    if (H.cfg.controls) {
      this._disposeSettings = mountControls(this.el.hubRows, { input: this.game.input, onChange: () => this.refreshControlLabels(), onDone: () => this.backHubPanel() });
      return;
    }
    if (H.cfg.settings) {
      mountPreferences(this.el.hubRows,p=>this.game.applyDisplayPreferences(p),()=>this.backHubPanel(),{onControls:()=>this.controlsPanel(),onEditLayout:()=>this.game.beginLayoutEdit()});
      return;
    }
    const rows = H.cfg.rows || [];
    H.idx = Math.max(0, Math.min(rows.length - 1, H.idx));
    const html = rows.map((r, i) => {
      const cls = 'hub-row' + (i === H.idx ? ' sel' : '') + (r.disabled ? ' lock' : '');
      const cost = (r.cost !== undefined && r.cost !== null) ? `<span class="rc">${r.cost}</span>` : '';
      const tag = r.tag ? `<span class="rt">${r.tag}</span>` : '';
      return `<div class="${cls}" data-i="${i}" tabindex="-1"><span class="rn">${r.cn}</span>` +
             `<span class="rd">${e2KeyText(r.desc, this.game.input)}</span>${tag}${cost}</div>`;
    }).join('');
    this.el.hubRows.innerHTML = html || '<div class="hint-sm">（暂无内容）</div>';
    if (H.cfg.relicPreview) mountRelicPreview(this.el.hubRows,H.cfg.relicPreview);
    // 鼠标点击 / 悬停
    for (const node of this.el.hubRows.querySelectorAll('.hub-row')) {
      const i = Number(node.dataset.i);
      node.addEventListener('mouseenter', () => {
        if (this._hub === H) { H.idx = i; this.updateHubSelection(); }
      });
      node.addEventListener('click', () => { if (this._hub) { this._hub.idx = i; this.hubConfirm(); } });
    }
  }

  hubNav(d) {
    const H = this._hub;
    if (!H) return;
    const n = (H.cfg.rows || []).length;
    if (!n) return;
    H.idx = (H.idx + d + n) % n;
    this.updateHubSelection(true);
  }

  updateHubSelection(scroll = false) {
    if (!this._hub) return;
    for (const node of this.el.hubRows.querySelectorAll('.hub-row')) {
      const selected = Number(node.dataset.i) === this._hub.idx;
      node.classList.toggle('sel', selected);
      if (selected && scroll) node.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }

  clearPanelInput() {
    this._hubNavDir = 0;
    this._hubNavHeld = 0;
    this._hubNavNext = 1.0;
  }

  handleHubKeys(input, dt) {
    if (!this.hubOpen || this.game.topModal() !== 'hub') {
      this.clearPanelInput();
      return;
    }
    if (this._hub.cfg.settings) return;
    const up = input.down('ArrowUp') || input.down('w');
    const down = input.down('ArrowDown') || input.down('s');
    const dir = Number(down) - Number(up);
    if (!dir) {
      this.clearPanelInput();
    } else if (dir !== this._hubNavDir) {
      this.clearPanelInput();
      this._hubNavDir = dir;
      this.hubNav(dir);
    } else {
      this._hubNavHeld += Math.max(0, dt);
      while (this._hubNavHeld + 1e-8 >= this._hubNavNext) {
        this.hubNav(dir);
        this._hubNavNext += 0.09;
      }
    }
    if (input.hit('e') || input.hit('Enter')) this.hubConfirm();
  }

  syncPanelInput() {
    const blocked = this.hubOpen || this.choiceOpen || this.buildOpen || this.game.paused || this.game.state !== 'play';
    this.game.input?.setBlocked(!!blocked);
    if (this.game.canvas?.style) this.game.canvas.style.cursor = blocked || this.pointerFocused === false ? 'default' : 'none';
    if (blocked) this.hideReticle();
  }

  focusTopPanel() {
    const panel = { build: this.el.build, choice: this.el.choicePanel, hub: this.el.hubPanel }[this.game.topModal()];
    if (panel) panel.focus({ preventScroll: true });
    else if ([this.el.build, this.el.choicePanel, this.el.hubPanel].some(el => el?.contains(document.activeElement))) {
      document.activeElement.blur();
    }
  }

  hubConfirm() {
    const H = this._hub;
    if (!H) return;
    const r = (H.cfg.rows || [])[H.idx];
    if (!r || r.disabled) { audio.ui('error'); return; }
    const pending = this.game.actorCount===2?null:this.game.pendingHubSelection?.();
    if (pending && r !== pending.row) { this.game.noticePendingHubSelection(); return; }
    H.cfg.onPick && H.cfg.onPick(r, H.idx);
  }

  // ============================================================
  //  通用 ChoicePanel（任务书 §41）
  //
  //  铸枪师每层配件 / 远征老兵每层教条 / 驯炉人每层进化 —— 三处共用**同一套 UI**，
  //  而不是各写一套选择界面。选项数量固定为 3，操作为 1/2/3 直选或 ←→ + Enter。
  //
  //  调用时机是换层完成后的起始房。Game 单独处理面板输入并冻结后台模拟。
  // ============================================================
  choicePanel(cfg) {
    cfg=guardActorPanel(this.game,cfg);
    if (!this.el.choicePanel) return;
    this._choice = { cfg, idx: 0 };
    this.game.setModalOwner('choice', true);
    this.clearPanelInput();
    this.el.choiceTitle.textContent = cfg.title || '选择';
    this.el.choiceSub.textContent = cfg.sub || '';
    this.el.choicePanel.classList.toggle('multi',!!cfg.multi);
    const close=document.getElementById('btn-choice-close');if(close){close.disabled=!!cfg.multi;close.textContent=cfg.multi?'必选两条后确认':'关闭 ESC';close.style.opacity=cfg.multi?'.45':'';close.style.cursor=cfg.multi?'default':'';}
    const keys=this.el.choicePanel.querySelector?.('.choice-keys');if(keys)keys.textContent=cfg.multi?'请选择两条奖励后确认。':'';
    this.el.choicePanel.classList.remove('hidden');
    this.renderChoice();
    this.hideReticle();
    this.game.input?.setBlocked(true);
    this.focusTopPanel();
  }
  get choiceOpen() { return !!this._choice; }
  closeChoice() {
    this._choice = null;
    this.game.setModalOwner('choice', false);
    if (this.el.choicePanel) this.el.choicePanel.classList.add('hidden');
    this.clearPanelInput();
    this.syncPanelInput();
    this.focusTopPanel();
  }
  renderChoice() {
    const C = this._choice;
    if (!C || !this.el.choiceCards) return;
    const opts = C.cfg.options || [];
    C.idx = Math.max(0, Math.min(opts.length - 1, C.idx));
    this.el.choiceCards.innerHTML = opts.map((o, i) => {
      const picked=!!C.cfg.multi&&C.cfg.picked.includes(o.id);
      const sel = (i === C.idx ? ' sel' : '')+(picked?' picked':'');
      const col = o.color || '#8ad8ff';
      return `<div class="choice-card${sel}" data-i="${i}" style="border-color:${i === C.idx ? col : 'rgba(140,190,215,.22)'}">
        <div class="ck">[${i + 1}]${picked?' ✓ 已选择':''}</div>
        <div class="cn" style="color:${col}">${o.cn || ''}</div>
        <div class="cd">${o.desc || ''}</div>
        ${o.tag ? `<div class="ct">${o.tag}</div>` : ''}
      </div>`;
    }).join('');
    if(C.cfg.multi){this.el.choiceSub.textContent=`${C.cfg.sub} · 已选择 ${C.cfg.picked.length}/${C.cfg.multi}`;
      const button=document.createElement('button');button.className='btn doctrine-confirm';button.textContent=`确认 ${C.cfg.picked.length}/${C.cfg.multi}`;button.disabled=C.cfg.picked.length!==C.cfg.multi;button.addEventListener('click',()=>this.choiceConfirm());this.el.choiceCards.appendChild(button);}
    for (const node of this.el.choiceCards.querySelectorAll('.choice-card')) {
      const i = Number(node.dataset.i);
      node.addEventListener('mouseenter', () => {
        if (this._choice === C) { C.idx = i; this.updateChoiceSelection(); }
      });
      node.addEventListener('click', () => { if (this._choice) { this._choice.idx = i; this.choicePick(i); } });
    }
  }
  choiceNav(d) {
    const C = this._choice;
    if (!C) return;
    const n = (C.cfg.options || []).length;
    if (!n) return;
    C.idx = (C.idx + d + n) % n;
    this.updateChoiceSelection();
  }
  updateChoiceSelection() {
    const C = this._choice;
    if (!C) return;
    for (const node of this.el.choiceCards.querySelectorAll('.choice-card')) {
      const i = Number(node.dataset.i), selected = i === C.idx;
      node.classList.toggle('sel', selected);
      node.style.borderColor = selected ? (C.cfg.options[i].color || '#8ad8ff') : 'rgba(140,190,215,.22)';
    }
  }
  choicePick(i) {
    const C = this._choice;
    if (!C) return false;
    const o = (C.cfg.options || [])[i];
    if (!o) return false;
    if(C.cfg.commitAsync){if(C.pending)return false;C.pending=true;const fn=C.cfg.multi?C.cfg.onToggle:C.cfg.onPick;return Promise.resolve(fn?.(o,i,C)).then(r=>r?.ok===true).finally(()=>{C.pending=false;});}
    if(C.cfg.multi){C.idx=i;if(C.cfg.onToggle?.call(C.cfg,o,i,C)!==true)return false;this.renderChoice();return true;}
    // Only the durable floor attachment flow opts in. Existing doctrine,
    // evolution and other choice callbacks retain their close-first contract.
    if (C.cfg.commitBeforeClose) {
      C.idx = i; this.updateChoiceSelection();
      if (C.cfg.onPick?.(o, i, C) !== true) return false;
      if (this._choice === C) this.closeChoice();
      return true;
    }
    this.closeChoice();
    C.cfg.onPick && C.cfg.onPick(o, i);
    return true;
  }
  choiceConfirm() {const pending=this._choice;if(pending?.cfg.commitAsync&&pending.cfg.multi){if(pending.pending)return false;pending.pending=true;return Promise.resolve(pending.cfg.onConfirm?.()).then(r=>r?.ok===true).finally(()=>{pending.pending=false;});}const C=this._choice;if(C?.cfg.multi){if(C.cfg.picked.length!==C.cfg.multi||C.cfg.onConfirm?.()!==true)return false;if(this._choice===C)this.closeChoice();return true;}return this.choicePick(C?C.idx:0);}

  // 「静火」的感官表现（任务书 §10.4）：暗角 + 轻微去饱和 + 准星变细。
  // 刻意用 **CSS 覆盖层**而不是后处理通道 —— §56 明确要求
  // "Bullet Time 不通过极高后处理开销实现"，纯 CSS 几乎是零成本。
  setDeadeye(on) {
    if (this._deadeye === on) return;
    this._deadeye = on;
    if (this.el.hud) this.el.hud.classList.toggle('deadeye', !!on);
  }

  // 进入 / 离开大厅时切换 HUD 的"战斗专属"部分（小地图、房间横幅、Boss 条）
  setHubMode(on) {
    this.hubMode = !!on;
    if (this.el.hud) this.el.hud.classList.toggle('hub', !!on);
    // 大厅里 hud.update 仍会跑（state 仍为 play），但复苏状态属于某一局 ——
    // 进大厅先显式清掉，避免"上一局的复苏"挂在大厅上。
    if (on) this.hideRunStatus();
    if (on) { this.hideReticle(); }
    this.updateDeveloperStatus();
  }

  updateDeveloperStatus() {
    const el = document.getElementById('developer-status');
    if (el) el.textContent = meta.devMode ? '开发模式：开启' : '开发模式：关闭';
  }
}
import {usesSharedMana} from './shared_mana.js';
