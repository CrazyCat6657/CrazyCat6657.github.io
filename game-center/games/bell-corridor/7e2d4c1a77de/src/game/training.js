import { resetHeroTransient } from './hero_integration_v3.js';
// Hall-only loadouts. Never use acquisition helpers: they drop guns, compensate
// duplicates, and update run achievement tracking.
import { TEAM } from '../core/constants.js';
import { Player } from './player.js';
import { Companion } from './companion.js';
import { HEROES } from './heroes.js';
import { WEAPONS, WEAPON_MAP, ACTIVES, ACTIVE_MAP, ITEMS, ITEM_MAP } from './data.js';
import { ATTACHMENTS, ATTACH_MAP, SLOT_CN } from './attachments.js';
import { meta } from './meta.js';

const CATALOG = { hero: HEROES, weapon: WEAPONS, active: ACTIVES, attachment: ATTACHMENTS, relic: ITEMS };
const LABELS = { hero: '英雄', weapon: '武器', active: '主动技能', attachment: '配件', relic: '遗物' };
const BASE_WEAPONS = ['pistol_rusty', 'pistol_heavy', 'smg_hornet'];
const SKILL_CORE = {
  warden: '消耗钟鸣印记释放钟波，推开敌人并偏转敌弹；没有印记时释放弱版',
  forgewright: '释放冲击波并降低炉热；炉热越高范围和威力越强',
  ranger: '进入静火，减慢敌人和敌弹；每次射击会消耗静火时间',
  scavenger: '拆解附近地面武器；附近没有武器时消耗废料组装',
  arcanist: '使用法术核心与法力释放钟域，推开削弱附近敌弹并短暂强化法术',
  tamer: '命令异兽扑杀；进化方向会改变指令效果',
  veteran: '消耗战意即时装填并补充护甲；没有战意时仅部分装填',
  gunsmith: '强化当前武器已安装配件的效果，结束后过热；先按 Tab 安装至少一个配件',
  resonant: '消耗共鸣进入定音，强化弹射并使首次反弹后轻微寻敌；无共鸣时只有短暂弱版',
  emberoath: '献出护甲、誓火或安全范围内的生命，进入超载状态',
};
const HELP = '可以自由试用装备，不影响出征配置和解锁进度。';
const isCatalogKind = kind => typeof kind === 'string' && Object.hasOwn(CATALOG, kind);

// PASS B：训练区是**沙盒**——它不写 `seen`、不发成就、不影响解锁与统计（见 HELP 与 configureTraining）。
// 因此这里放开整张目录：玩家需要能**先试再决定**，否则永远没法评估没抽到过的枪。
// 注意：这只是"能否在训练里试用"，与正式出征的解锁/图鉴/掉落完全无关。
export function trainingAvailable(game, kind, id) {
  if (game?.mode !== 'hub' || !isCatalogKind(kind) || typeof id !== 'string' || !CATALOG[kind].some(d => d.id === id)) return false;
  return true;
}

// 保留原"仅可试用已解锁内容"的判据，供以后需要分级训练时使用（例如只放已解锁的给普通玩家）。
export function trainingUnlocked(game, kind, id) {
  if (game?.mode !== 'hub' || !isCatalogKind(kind) || typeof id !== 'string' || !CATALOG[kind].some(d => d.id === id)) return false;
  if (meta.devMode || game.weaponLab) return true;
  const data = meta.data;
  if (kind === 'hero') return (data.heroes || []).includes(id);
  if (kind === 'weapon') return BASE_WEAPONS.includes(id)
    || (data.sidearms || []).includes(id) || (data.seen?.weapon || []).includes(id)
    || HEROES.some(h => (data.heroes || []).includes(h.id) && h.sidearm === id);
  if (kind === 'active') return id === 'grenade_toss' || (data.seen?.active || []).includes(id);
  return id === ATTACHMENTS[0]?.id || (data.seen?.attachment || []).includes(id);
}

function equipWeapon(game, id) {
  const p = game.player, src = WEAPON_MAP[id];
  const def = p.hero?.augment === 'spellcore' && !src.isSpell ? game.spellFor(id) : src;
  p.weapons = [{ def, mag: Math.round(def.mag * p.stats.magazine), reserve: Infinity, dmgMul: 1, attachments: [] }];
  p.weaponIndex = 0;
  p.reloading = false; p.reloadT = 0; p.fireT = 0;
  p.charge = 0; p.charging = false; p.burstLeft = 0; p.burstT = 0; p.spin = 0;
  p._shotsSinceReload = 0;
  p.refreshGunModel();
}

export function configureTraining(game, opts = {}) {
  if (game?.mode !== 'hub' || !game.player || !opts || typeof opts !== 'object' || Array.isArray(opts)) return false;
  const proto = Object.getPrototypeOf(opts);
  if (proto !== Object.prototype && proto !== null) return false;
  const keys = Reflect.ownKeys(opts);
  if (!keys.length || keys.some(k => !isCatalogKind(k) && !['refillResources','clearRelics'].includes(k))) return false;
  // Snapshot only own data fields once, into a record with no inherited fields.
  // Both validation and mutation must consume exactly the same values.
  const ownOpts = Object.create(null);
  for (const k of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(opts, k);
    if (!descriptor || !Object.hasOwn(descriptor, 'value')) return false;
    ownOpts[k] = descriptor.value;
  }
  opts = ownOpts;
  for (const k of Object.keys(CATALOG)) if (Object.hasOwn(opts, k) && !trainingAvailable(game, k, opts[k])) return false;
  if (Object.hasOwn(opts, 'refillResources') && opts.refillResources !== true) return false;
  if (Object.hasOwn(opts, 'clearRelics') && opts.clearRelics !== true) return false;
  const selectedHero = opts.hero && HEROES.find(h => h.id === opts.hero);
  if (opts.attachment && !selectedHero && game.player.spareAttachments.length >= game.player.spareCap()) return false;

  game.setBuild(false);
  if (selectedHero) {
    const old = game.player;
    const pose = { x: old.x, z: old.z, yaw: old.yaw, aim: { ...old.aim }, aimPoint: { ...old.aimPoint }, aimDist: old.aimDist };
    if (old.rig) game.scene.remove(old.rig.group);
    if (game.companion) game.companion.dispose();
    game.companion = null;
    game.hero = selectedHero;
    game.applyModifier('');
    const p = new Player(game);
    game.player = p;
    Object.assign(p, pose, { id: 'player', team: TEAM.PLAYER });
    game.applyHero(p);
    p.rig.group.position.set(p.x, 0, p.z);
    p.rig.group.rotation.y = p.yaw;
    equipWeapon(game, selectedHero.sidearm || 'pistol_rusty');
    if (selectedHero.companion) game.companion = new Companion(game);
  }
  const p = game.player;
  if(p.hero?.ruleVersion===3)resetHeroTransient(p);
  if (opts.weapon) equipWeapon(game, opts.weapon);
  if (opts.active) {
    p.actives = [opts.active]; p.activeIndex = 0; p.activeCd = 0;
  }
  if (opts.attachment) p.spareAttachments.push(opts.attachment);
  // PASS B：遗物试装。点一次装上、再点一次卸下；纯训练，不写图鉴、不改掉率。
  if (opts.relic && ITEM_MAP[opts.relic]) {
    const i = p.items.indexOf(opts.relic);
    if (i >= 0) p.items.splice(i, 1); else p.items.push(opts.relic);
  }
  if (opts.clearRelics) p.items.length = 0;
  if (opts.refillResources) {
    Object.assign(p, { bellCharges: 3, heat: 80, scrap: 60, resonance: 6, phrase: 3, momentum: 6,
      soulCount: 12, heroSkillCd: 0, activeCd: 0 });
  }
  p.recompute();
  game.hud?.renderBuild?.();
  game.toast('训练配装已生效', opts.refillResources ? '职业资源和技能冷却已恢复。' : '', '#8ad8ff', 'build');
  return true;
}

export function trainingPanel(game, kind = '') {
  if (game?.mode !== 'hub' || !game.player || typeof kind !== 'string' || (kind !== '' && !isCatalogKind(kind))) return false;
  const H = game.hud;
  if (!kind) {
    H.hubPanel({ title: '训练配装', sub: HELP,
      rows: [...Object.keys(CATALOG).map(k => ({ kind: k, cn: LABELS[k], desc: '' })),
        { toggleShooter: true, cn: game.trainingShooterEnabled ? '关闭射击靶' : '开启射击靶', desc: '练习躲避弹幕' },
        { clearRelics: true, cn: '清空全部遗物', desc: '仅训练：把当前装上的遗物全部卸下，方便从零测一把枪' },
        { refill: true, cn: '补充训练职业资源', desc: '仅训练：结束当前职业技能，炉热 80、废料 60、战意 6、魂数 12；职业与主动冷却归零' },
        { close: true, cn: '返回', desc: '' }],
      onPick: r => { if (r.kind) return trainingPanel(game, r.kind);
        if (r.toggleShooter) { game.setTrainingShooter(!game.trainingShooterEnabled); return trainingPanel(game); }
        H.closeHubPanel();
        if (r.clearRelics) configureTraining(game, { clearRelics: true });
        if (r.refill) configureTraining(game, { refillResources: true }); } });
    return true;
  }
  const rows = CATALOG[kind].map(d => {
    const available = trainingAvailable(game, kind, d.id);
    let desc;
    if (kind === 'hero') desc = `${d.desc} 初始武器：${WEAPON_MAP[d.sidearm]?.cn || d.sidearm}<br>天赋：${d.talent || ''}<br>技能效果（${d.skillName}）：${d.verb || ''}。${d.ruleVersion===3?d.costNote:SKILL_CORE[d.id] || ''}`;
    else if (kind === 'weapon') desc = game.equipmentInfo({ kind: 'weapon', id: d.id })
      .replace(/；(?:已拥有同名武器，转为 8 金币|满两槽，将替换当前 .*?，旧武器与配件落地|占用一个空武器槽)/g, '') + '<br>训练时弹药无限。';
    else if (kind === 'active') desc = `${d.desc} 基础冷却 ${d.cd} 秒；按 F 使用；训练选择会替换当前主动技能并清除冷却。`;
    else if (kind === 'relic') desc = `${d.desc}；再次选择可以卸下`;
    else desc = `${SLOT_CN[d.slot] || d.slot} · ${d.desc}；放入备用配件，按 Tab 安装（${game.player.spareAttachments.length}/${game.player.spareCap()}）。`;
    const full = kind === 'attachment' && game.player.spareAttachments.length >= game.player.spareCap();
    const held = kind === 'relic' && game.player.items.includes(d.id);
    return { id: d.id, cn: d.cn, desc, disabled: !available || full,
      tag: !available ? '尚未解锁或发现' : full ? '备用配件已满' : kind === 'relic' ? (held ? '已装上 · 再点卸下' : '未装上') : '训练可用' };
  });
  rows.push({ back: true, cn: '返回', desc: '返回训练配装首页' });
  H.hubPanel({ title: `训练配装 · ${LABELS[kind]}`, sub: HELP, rows,
    onPick: r => { if (r.back) return trainingPanel(game); if (!configureTraining(game, { [kind]: r.id })) return; H.closeHubPanel(); } });
  return true;
}
