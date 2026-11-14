// ============================================================
//  档案馆 / Codex（任务书 §5.4）
//
//  要求：记录 武器 / 遗物 / 主动技能 / Synergy / 敌人 / Elite / Boss /
//  特殊事件 / 隐藏区域 / 英雄；**未发现内容显示轮廓、??? 或模糊条目**。
//
//  设计要点：
//  · 未发现不是"空着"，而是给一条**可推断的轮廓**（类别 / 稀有度 / 出现楼层…）。
//    玩家能由此判断"我还差哪一类东西"，而不是面对一片问号。
//  · Boss 列表按 §16 的 Boss Pool 写全三个（后两个尚未实装）——
//    它们本就"尚未被发现"，在档案里显示为 ??? 是**正确**的，而不是占位符。
// ============================================================
import { WEAPONS, ITEMS, ACTIVES, SYNERGIES, ENEMIES, SPECIAL_EVENTS } from './data.js';
import { HEROES } from './heroes.js';
import { ATTACHMENTS, SLOT_CN } from './attachments.js';
import { EVOLUTIONS } from './companion.js';
import { FORMS } from './spells.js';
import { BOSS_DEFS } from './bosses.js';

// Boss Pool（任务书 §16 / PASS2 §20）。
// PASS2 之后三个首领都已实装，所以这里**直接由 BOSS_DEFS 派生** ——
// 图鉴、奖杯陈列、练习入口、结算全部消费同一份身份表，不再各写一份硬编码清单
// （那样必然会出现"图鉴里有名字但游戏里遇不到"的漂移）。
export const BOSS_POOL = BOSS_DEFS.map((b) => ({
  id: b.id, cn: b.cn, tag: b.tag, desc: b.hint, key: b.key,
}));

const AREAS = [
  { id: 'secret', cn: '隐藏房', desc: '墙体之后不该存在的地方。', tag: '探索' },
  { id: 'vault', cn: '风险宝库', desc: '高额奖励与高风险同处一室。', tag: '探索' },
];

// Match the actual elite generation exclusion: summoned small variants stay ordinary.
const ELITES = ENEMIES.filter(e => !e.id.includes('small'));
const WEAPON_CLASS_NAMES = {pistol:'手枪',smg:'冲锋枪',rifle:'步枪',shotgun:'霰弹枪',sniper:'狙击枪',rocket:'火箭筒',launcher:'发射器',minigun:'转轮机枪',energy:'能量武器',flame:'喷射武器',special:'特殊武器'};

export const CODEX_KINDS = [
  {
    kind: 'weapon', cn: '武器', short: '枪械',
    list: WEAPONS.map((w) => ({ id: w.id, cn: w.cn, desc: w.desc, tag: WEAPON_CLASS_NAMES[w.cls] || '武器', hint: `未知武器 · ${WEAPON_CLASS_NAMES[w.cls] || '武器'}`, group: w.cls })),
  },
  {
    kind: 'relic', cn: '遗物', short: '遗物',
    list: ITEMS.map((i) => ({ id: i.id, cn: i.cn, desc: i.desc, tag: `${i.rarity} 级`, hint: `未知遗物 · ${i.rarity} 级`, group: i.rarity })),
  },
  {
    kind: 'active', cn: '主动技能', short: '主动',
    list: ACTIVES.map((a) => ({ id: a.id, cn: a.cn, desc: a.desc, tag: `冷却 ${a.cd} 秒`, hint: `未知技能 · 冷却 ${a.cd} 秒`, group: a.rarity })),
  },
  {
    kind: 'synergy', cn: '协同', short: '协同',
    list: SYNERGIES.map((s) => ({ id: s.id, cn: s.cn, desc: s.desc, tag: `${(s.req || []).length} 件触发`, hint: `未知协同 · 需要 ${(s.req || []).length} 件相关物品` })),
  },
  {
    kind: 'enemy', cn: '敌人', short: '敌人',
    list: ENEMIES.map((e) => ({ id: e.id, cn: e.cn, desc: e.desc || '王庭崩坏之后仍在巡行。', tag: `第 ${e.floor} 层`, hint: `未知敌人 · 第 ${e.floor} 层出现` })),
  },
  {
    kind: 'elite', cn: '精英', short: '精英',
    list: ELITES.map((e) => ({ id: e.id, cn: `${e.cn}（精英）`, desc: '同一形态被强化后的个体：更耐打、更危险。', tag: `第 ${e.floor} 层`, hint: `未知精英 · 第 ${e.floor} 层的强化个体` })),
  },
  {
    kind: 'boss', cn: '首领', short: '首领',
    list: BOSS_POOL.map((b) => ({ id: b.id, cn: b.cn, desc: b.desc, tag: b.tag, hint: `未知首领 · ${b.tag}` })),
  },
  {
    kind: 'event', cn: '特殊事件', short: '事件',
    list: SPECIAL_EVENTS.map((e) => ({ id: e.id, cn: e.cn, desc: e.desc, tag: '事件', hint: '未知事件' })),
  },
  {
    kind: 'area', cn: '隐藏区域', short: '区域',
    list: AREAS.map((a) => ({ id: a.id, cn: a.cn, desc: a.desc, tag: a.tag, hint: '未探索过的区域' })),
  },
  {
    // §43：配件进入 Codex
    kind: 'attachment', cn: '配件', short: '改装',
    list: ATTACHMENTS.map((a) => ({
      id: a.id, cn: a.cn, desc: a.desc, tag: SLOT_CN[a.slot],
      hint: `未知改装配件 · ${SLOT_CN[a.slot]}类`,
    })),
  },
  {
    // §43：宠物进化
    kind: 'pet', cn: '异兽进化', short: '异兽',
    list: EVOLUTIONS.map((e) => ({
      id: e.id, cn: e.cn, desc: e.desc, tag: '进化方向',
      hint: '尚未见过的异兽进化方向',
    })),
  },
  {
    // §43：法术核心（钟术师把武器翻译成的形态）
    kind: 'spell', cn: '法术核心', short: '法术',
    list: FORMS.map((f) => ({
      id: f.id, cn: f.cn, desc: f.desc, tag: '法术形态',
      hint: '尚未翻译出的法术形态',
    })),
  },
  {
    kind: 'hero', cn: '英雄', short: '英雄',
    // 任务书 §43：英雄条目要能看到**战斗动词 / 被动 / Hero Skill / 代价**，
    // 但不要写成长篇攻略 —— 所以每一条都是一句动词 + 四项要点。
    list: HEROES.map((h) => ({
      id: h.id, cn: h.cn,
      desc: `${h.verb || h.talent}。被动「${h.passiveName || '—'}」，技能「${h.skillName || '—'}」。`,
      tag: `${h.hp} 生命`,
      hint: '尚未加入前厅的英雄',
      detail: `天赋：${h.talent || ''} 技能说明：${h.costNote || ''}`,
    })),
  },
];

export const CODEX_MAP = Object.fromEntries(CODEX_KINDS.map((k) => [k.kind, k]));
export function codexTotal() { return CODEX_KINDS.reduce((n, k) => n + k.list.length, 0); }
