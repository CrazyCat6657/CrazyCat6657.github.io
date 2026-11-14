import {FOLD_SHADOW} from '../experimental/combat/fold_hero.js';
import { e2Copy } from './text_e2_data.js';
import { audio } from '../core/audio.js';
import { TEAM } from '../core/constants.js';
import { currentHeroRule, HERO_RULE_VERSION, validHeroRuleVersion } from './hero_rules.js';
import { heroRuleV3 } from './hero_rules_v3.js';

// ============================================================
//  英雄 / 职业（任务书第七节）
//
//  要求：**不能只是"同一个模型换颜色 + 血量不同"**。
//  每个英雄必须同时具备：
//    · 独立低模外观（轮廓 / 主色 / 标志性部件）
//    · 独立初始武器或武器类别
//    · 独立小型天赋（真的改变打法，不只是数值）
//    · 少量属性差异
//    · 代价（Sidegrade，不是纯上位）
//
//  实现方式：
//    · pal   → 直接喂给 buildPlayer(pal)，改变大衣/兜帽/点缀色
//    · build → 额外的标志性部件（肩甲 / 目镜 / 面罩 / 燃料罐），决定轮廓
//    · mods  → 合并进 player.stats（乘区写在 stats 里，见 player.recompute）
//    · hook  → 每帧 / 事件回调（击杀、冲刺结束、清房），真正改变行为
//
//  天赋一律写成"有得有失"：每个英雄都至少有一条负面或限制。
// ============================================================

// 静火（Bullet Time）单发消耗：按射速折算，慢枪贵、快枪便宜。
// 参照点：手枪 3.2 发/秒 → 约 0.42 秒/发（接近旧值，保持原手感）。
export function deadeyeShotCost(rate) {
  const r = Number.isFinite(rate) && rate > 0 ? rate : 3.2;
  return Math.min(0.85, Math.max(0.14, 1.35 / Math.max(0.4, r)));
}

const LEGACY_HEROES = [
  {
    id: 'warden',
    cn: '守钟人',
    en: 'Warden',
    desc: '沉钟回廊的看守者。攻守均衡，靠冲刺节奏吃饭。',
    verb: '用翻滚穿过危险，然后抓住反击窗口',
    passiveName: '钟鸣',
    skillName: '回钟',
    skillCd: 6,
    costNote: '没有成功闪避时，他基本就是标准角色 —— 上限完全来自操作。',
    // talent：英雄碑 / 信息碑 / 图鉴 / 商人列表都会读它。
    // **曾经漏写**，而信息碑用模板字符串渲染 `${hero.cn} · ${hero.talent}`，
    // 于是界面上直接显示"守钟人 · undefined"（英雄碑用裸值 + `|| ''` 兜住了，所以只有信息碑暴露）。
    // 教训：这类"数据表漏字段"不会报错，只会把 undefined 打到玩家脸上；
    // 新增英雄时必须补齐与其他英雄一致的字段集（见 probe_heroes 的字段完整性断言）。
    talent: '钟鸣：完美闪避叠加印记（最多 3 层）；下一次开火消耗印记，造成额外伤害与穿透并释放小型钟波',
    mods: {},
    pal: { coat: '#2f6f84', coatDark: '#1d4a5c', hood: '#3f8ea6', accent: '#67e8ff', belt: '#8a5a2b' },
    // 结构描述（§36）：钟形肩甲 + 标准比例 —— 涂黑后靠"一侧钟肩"就能认出来
    build: { hood: true, bellPauldron: true },
    sidearm: 'pistol_rusty',
    hp: 6,
    rad: 0.62,
    // ============================================================
    //  被动「钟鸣」+ Hero Skill「回钟」（任务书 §8）
    //
    //  核心动词：**闪避 → 反击**。
    //  翻滚不再只是"跑路键"：完美闪避直接变成主动输出资源。
    //  代价按 §8.3 处理 —— 不叠"冲刺冷却 +15%"这种数值税，
    //  而是"没有成功闪避时，他基本就是标准角色"，上限完全来自操作。
    // ============================================================
    hook: {
      // 完美闪避：获得钟鸣印记（§8.1）
      onPerfectDodge(p, d, game) {
        p.bellCharges = Math.min(3, (p.bellCharges | 0) + 1);
        p.bellFlash = 0.45;
        audio.bell(false);
        game.particles.ring(p.x, 0.5, p.z, '#ffd24a', 22, 0.7, 2.4);
        game.hud.toast('钟鸣印记', `完美闪避 · 印记 ${p.bellCharges}/3`, '#ffd24a', 'quick');
        p.recompute();
      },
      // 印记在下一次开火时消耗并强化（§8.1：额外伤害 + 穿透 + 小型钟波 + 更明显反馈）
      damageMul(p, game) {
        if ((p.bellCharges | 0) > 0) {
          p.bellCharges--;
          p.bellWindow = Math.max(p.bellWindow || 0, 1.4);
          if (game) {
            game.bellWave(p.x, p.z, 2.6, 0.55, true);   // 小型钟波
            game.shake(0.10);
          }
          p.recompute();
          return 1.55;
        }
        // 回钟之后的短窗口：仍然强化，但弱于消耗印记
        return (p.bellWindow > 0) ? 1.28 : 1;
      },
      // 印记强化期间附带穿透
      pierceAdd(p) { return (p.bellWindow > 0) ? 1 : 0; },
      // Hero Skill「回钟」（§8.2）：有印记 → 强版短冷却；无印记 → 弱版长冷却
      onHeroSkill(p, game) {
        const n = p.bellCharges | 0;
        if (n > 0) {
          p.bellCharges = 0;
          game.bellWave(p.x, p.z, 4.0 + n * 1.0, 1.0 + n * 0.4, false);
          p.bellWindow = 2.2;
          game.hud.toast('回钟', `消耗 ${n} 枚印记 · 钟波推开敌人并偏转敌弹`, '#ffd24a', 'story');
          p.recompute();
          return 4.5;
        }
        game.bellWave(p.x, p.z, 3.0, 0.55, false);
        p.bellWindow = 1.2;
        game.hud.toast('回钟（弱）', '没有印记：范围与威力较弱，冷却更长', '#8fa2b0', 'quick');
        p.recompute();
        return 9;
      },
      tick(p) {
        // 有印记时角色持续微光（让"我攒着弹药"这件事看得见）
        if ((p.bellCharges | 0) > 0 && p.bellFlash <= 0) p.bellFlash = 0.14;
      },
      resource(p) { return { txt: `钟鸣印记 ${p.bellCharges | 0}/3` }; },
    },
    unlock: null,          // 默认解锁
  },
  {
    id: 'forgewright',
    cn: '熔铸匠',
    en: 'Forgewright',
    desc: '深渊熔炉的匠人。爆破见长，身板厚但步子沉。',
    verb: '把爆炸和房间环境变成自己的武器',
    passiveName: '炉热',
    skillName: '泄压',
    skillCd: 5,
    costNote: '高热区会拖慢装填与移动，继续堆热存在风险。',
    pal: { coat: '#8a4a1e', coatDark: '#5c2f12', hood: '#b5651f', accent: '#ffb347', belt: '#4a4a52' },
    // 矮壮 + 双炉罐 + 粗肩 + 厚手套
    build: { hood: true, backTank: true, bulk: 1.16, tall: 0.94 },
    sidearm: 'grenade_lobber',
    hp: 7,
    rad: 0.66,
    // 天赋：爆炸伤害 +40%、爆炸半径 +20%；代价：移速 -10%、弹匣 -15%
    mods: { explosiveMul: 0.40, blastRadius: 0.20, speed: -0.10, magazine: -0.15 },
    talent: '熔铸：爆炸伤害 +40%、范围 +20%（移速 -10%，弹匣 -15%）',
    // ============================================================
    //  被动「炉热」+ Hero Skill「泄压」（任务书 §9）
    //  核心动词：**引爆 → 蓄热 → 泄压**。
    //  别人看到爆炸桶说"危险"，熔铸匠说"武器"。
    // ============================================================
    hook: {
      // 炉热来源：**自己制造的爆炸**（§9.1）。走 onExplosion 广播，
      // 而不是在每个爆炸点判断 hero.id。
      onExplosion(p, d, game) {
        const near = Math.hypot((d.x || 0) - p.x, (d.z || 0) - p.z) < 15;
        if (!near) return;
        p.heat = Math.min(100, (p.heat | 0) + 8 + Math.min(10, (d.radius || 3) * 2));
        p.recompute();
      },
      // 炉热越高爆炸越强；进入高热区开始付代价（§9.1：不要无限线性增长）
      recompute(p, s) {
        const h = Math.min(1, Math.max(0, (p.heat | 0) / 100));
        s.explosiveMul += h * 0.55;
        s.blastRadius += h * 0.30;
        if (h > 0.75) { s.reloadMul += 0.35; s.speed -= 0.07; }   // 高热：换弹与移动变差
      },
      tick(p, dt) {
        if ((p.heat | 0) > 0) {
          const before = p.heat | 0;
          p.heat = Math.max(0, p.heat - dt * 2.2);
          if ((p.heat | 0) !== before && (p.heat | 0) % 5 === 0) p.recompute();
        }
      },
      // 泄压（§9.3）：把炉热转成冲击波 + 火焰环 + 击退，热量大幅下降
      onHeroSkill(p, game) {
        const h = Math.min(1, Math.max(0, (p.heat | 0) / 100));
        const radius = 3.2 + h * 3.4;
        const power = 0.6 + h * 1.9;
        game.heatVent(p.x, p.z, radius, power);
        p.heat = Math.max(0, (p.heat | 0) - 55);
        p.recompute();
        game.hud.toast('泄压', `炉热 ${Math.round(h * 100)}% → 冲击波 r=${radius.toFixed(1)}`, '#ff8a3c', 'story');
        return 5;
      },
      resource(p) { return { txt: `炉热 ${Math.round(p.heat | 0)}%` }; },
    },
    unlock: { souls: 60 },
  },
  {
    id: 'ranger',
    cn: '余烬游侠',
    en: 'Ember Ranger',
    desc: '在灰烬里讨生活的猎手。站定才打得准，动起来就飘。',
    verb: '在满屏弹幕里制造几秒属于自己的时间',
    passiveName: '专注',
    skillName: '静火',
    skillCd: 14,
    costNote: '静火有严格时限，每次射击还会额外消耗时间。',
    pal: { coat: '#3a5a3a', coatDark: '#243a24', hood: '#4f7a45', accent: '#ffd24a', belt: '#6d4527' },
    // 瘦长 + 目镜 + 长围巾
    build: { hood: true, visor: true, bulk: 0.92, tall: 1.08 },
    sidearm: 'rifle_carbine',
    hp: 5,
    rad: 0.60,
    // 天赋：静止 ≥0.6s 后伤害 +30%、暴击 +8%；代价：移动中散布 +35%、生命 -1
    mods: { spreadMul: 0.35 },
    talent: '专注：静止 0.6s 后散布收束、伤害 +12%、暴击 +6%（移动中散布 +35%）',
    // ============================================================
    //  被动「专注」+ Hero Skill「静火」（任务书 §10）
    //  核心动词：**减速世界 → 精准处决**。
    //  §10.1 明确要求：不要让普通状态就获得过高伤害 —— 真正的高潮在静火。
    //  时间缩放见 Game.computeTimeScales（§10.3 的六通道拆分）。
    // ============================================================
    hook: {
      tick(p, dt) {
        const moving = (p.moveAmount || 0) > 0.12;
        p._still = moving ? 0 : (p._still || 0) + dt;
        const want = p._still >= 0.6;
        if (want !== p._aimReady) { p._aimReady = want; p.recompute(); }
      },
      recompute(p, s) {
        // 专注时散布显著收束（"看起来就准"的那一层）；静火期间再收一档
        if (p._aimReady) s.spreadMul *= 0.55;
        if (p.deadeyeT > 0) s.spreadMul *= 0.70;
      },
      damageMul(p) { return p._aimReady ? 1.12 : 1; },
      critAdd(p) { return p._aimReady ? 0.06 : 0; },
      // 每次射击都消耗静火时间（§10.2）：不能无限白嫖输出
      onShotFired(p, d, game) {
        if (p.deadeyeT > 0) {
          // 消耗按**这把枪的射速**折算（PASS2 §10 游侠专项）。
          // 旧实现是固定 0.55 秒/发：实测让所有武器类别都只能打 8 发 ——
          // 加特林（15 发/秒）0.53 秒就烧光 4.6 秒静火，而狙击（0.85 发/秒）
          // 根本受不到这个成本约束（窗口才是限制）。结果是"射速越高越不该开静火"，
          // 与"精算每一次射击"的职业定位正好相反。
          // 新公式让**每次静火的持续开火时长**在各武器类别间大致持平（约 3.2–3.4 秒），
          // 快枪每发便宜、慢枪每发贵 —— 时间才是真正的资源。
          p.deadeyeT = Math.max(0, p.deadeyeT - deadeyeShotCost(d && d.def ? d.def.rate : 0));
          if (p.deadeyeT === 0) {
            p.recompute();
            game.hud.toast('静火结束', '世界把速度重新扑了回来', '#8fa2b0', 'quick');
          }
        }
      },
      // 静火（§10.2）：敌人 0.35 / 玩家移动 0.70 / 瞄准与 UI 1.00
      onHeroSkill(p, game) {
        p.deadeyeT = 4.6;
        p.recompute();
        audio.bell(false);
        game.hud.toast('静火', '世界慢下来 —— 每一次射击都会消耗这段安静', '#8af0ff', 'story');
        return 14;
      },
      resource(p) {
        return { txt: p.deadeyeT > 0 ? `静火 ${p.deadeyeT.toFixed(1)}s` : (p._aimReady ? '专注 · 已收束' : '专注 · 未收束') };
      },
    },
    unlock: { souls: 45 },
  },
  {
    id: 'scavenger', bonusWeaponSlots: 1,
    cn: '拾荒客',
    en: 'Scavenger',
    desc: '专挑别人打剩的东西。资源宽裕，但经不起硬碰。',
    verb: '把别人不要的随机掉落变成资源',
    passiveName: '拆解',
    skillName: '现场拼装',
    skillCd: 4,
    costNote: '生命最少、受伤加成最高 —— 资源换来的容错仍然要靠走位保住。',
    pal: { coat: '#5a4a6a', coatDark: '#3a2f45', hood: '#7a5f8a', accent: '#c07af0', belt: '#8a5a2b' },
    // 不对称的大废料背包 + 外挂零件
    build: { hood: true, scrapPack: true, bulk: 1.04 },
    sidearm: 'smg_hornet',
    hp: 5,
    rad: 0.60,
    // 天赋：拾取范围 +60%、金币收益 +35%、每次击杀额外掉金币；代价：生命 -1、受伤 +15%
    mods: { pickup: 0.60, coins: 0.35, dmgTakenMul: 0.15 },
    talent: '拾荒：拾取范围 +60%、金币 +35%、击杀额外掉钱（受伤 +15%）',
    hook: {
      onKill(p, d, game) {
        // §1.3：影响玩法结果的随机必须走 seeded gameplay RNG。
        // 这里原本是 Math.random() < 0.55 —— 会破坏"同 Seed + 同输入 → 同结果"的承诺。
        if (game.grc(0.55)) game.spawnCoins(p.x, p.z, 1,{rewardSource:'event-reward'});
      },
      // ============================================================
      //  Hero Skill「现场拆解 / 拼装」（任务书 §11）
      //  核心动词：**拆解 → 重组资源**。
      //  附近有不需要的地面武器 → 拆掉换废料；否则把废料拼成应急物资。
      // ============================================================
      onHeroSkill(p, game) {
        if (game.nearestGroundWeapon(p)) {
          const r = game.dismantleNearest(p);
          return r ? 3 : false;
        }
        const made = game.scavengeAssemble(p);
        if (made) return 6;
        game.hud.toast('拆解', '附近没有可拆的武器，废料也不足 3', '#8fa2b0', 'quick');
        return false;
      },
      resource(p) { return { txt: `废料 ${p.scrap | 0}` }; },
    },
    unlock: { souls: 45 },
  },

  // ============================================================
  //  第十职业：钟术师 / Bell Arcanist（任务书 §27–§32）
  //  核心动词：**把枪翻译成法术**。
  //  他真正打破了"所有人都拿枪"这件事，但**不能让普通内容作废**（§48）——
  //  所以武器掉落被翻译成法术核心、弹药掉落变成法力补充、配件变成符文、
  //  源武器的 tags 被保留（Synergy 照常触发）。
  // ============================================================
  {
    id: 'arcanist',
    cn: '钟术师',
    en: 'Bell Arcanist',
    desc: '他不相信火器。他相信钟声里本来就写着更直接的东西。',
    verb: '不用枪，把整个武器掉落系统翻译成法术',
    passiveName: '法术核心',
    skillName: '钟域',
    skillCd: 11,
    costNote: '法力见底时他只剩原地回复 —— 施法节奏必须自己掌控。',
    pal: { coat: '#3a3350', coatDark: '#241f34', hood: '#544a78', accent: '#c07af0', belt: '#6a5230' },
    build: { hood: true, arcanistHalo: true, bulk: 0.96, tall: 1.06 },
    sidearm: 'pistol_rusty',      // 会被自动翻译成第一个法术核心（§28）
    hp: 5,
    rad: 0.60,
    mods: {},
    augment: 'spellcore',         // 关键标记：拾取武器 → 自动翻译成法术核心
    talent: '法术核心：所有普通武器被翻译成法术（保留其身份与标签）；法力以 reserve 承载并随时间回复',
    hook: {
      // 钟域（§32）：消耗法力 → 推开近距离敌弹 + 短暂强化当前法术
      onHeroSkill(p, game) {
        const w = p.weapon;
        if (!w || w.def.ammoType !== 'mana') { game.hud.toast('钟域', '当前没有可共鸣的法术核心', '#ff6a3a', 'fail'); return false; }
        const cost = 30;
        if (w.reserve < cost) { game.hud.toast('钟域', `法力不足（需要 ${cost}）`, '#ff6a3a', 'fail'); return false; }
        w.reserve -= cost;
        // 推开并削弱附近敌弹（不是无敌清屏）
        let n = 0;
        const pool = (game.projectiles && game.projectiles.pool) || [];
        for (const b of pool) {
          if (!b.alive || b.team === TEAM.PLAYER) continue;
          const dx = b.x - p.x, dz = b.z - p.z, d = Math.hypot(dx, dz);
          if (d > 5.2 || d < 0.01) continue;
          const sp = Math.max(7, Math.hypot(b.vx, b.vz));
          b.vx = (dx / d) * sp; b.vz = (dz / d) * sp;
          const nl = Math.hypot(b.vx, b.vz) || 1;
          b.dx = b.vx / nl; b.dz = b.vz / nl;
          b.damage *= 0.5;
          n++;
        }
        p.spellEchoT = 2.6;        // 短暂共鸣：法术伤害 +25%
        p.recompute();
        audio.bell(true);
        game.particles.ring(p.x, 0.6, p.z, '#c07af0', 24, 0.9, 5.2);
        game.hud.toast('钟域', `推开 ${n} 发敌弹 · 法术共鸣 2.6 秒`, '#c07af0', 'story');
        return 11;
      },
      // 共鸣窗口内的法术强化（走 damageMul，作用于当前武器）
      damageMul(p) { return p.spellEchoT > 0 ? 1.25 : 1; },
      tick(p, dt) {
        if (p.spellEchoT > 0) { p.spellEchoT = Math.max(0, p.spellEchoT - dt); if (p.spellEchoT === 0) p.recompute(); }
      },
      resource(p) {
        const w = p.weapon;
        if (w && w.def.ammoType === 'mana') {
          const cap = p.manaCap();
          return { txt: `法力 ${Math.round(w.reserve)}/${cap}${p.spellEchoT > 0 ? ' · 共鸣中' : ''}` };
        }
        return { txt: '无法术核心' };
      },
    },
    unlock: { souls: 55 },
  },

  // ============================================================
  //  第九职业：驯炉人 / Furnace Tamer（任务书 §23–§26）
  //  核心动词：**指挥 → 培养同伴**。
  //  它身边的小兽属于这个世界的地下生态，不是无人机。
  // ============================================================
  {
    id: 'tamer',
    cn: '驯炉人',
    en: 'Furnace Tamer',
    desc: '在地下捡到一只幼兽的人。他花了很久才明白：那不是他的武器，是同伴。',
    verb: '和一只会成长的钟炉异兽共同作战',
    passiveName: '驯养',
    skillName: '扑杀',
    skillCd: 8,
    costNote: '异兽被击倒时他只剩基础的自己 —— 护主与进化都需要时间积累。',
    pal: { coat: '#5a4a34', coatDark: '#3a3020', hood: '#7a6440', accent: '#ffb347', belt: '#6a5230' },
    build: { hood: true, petHarness: true, bulk: 1.0 },
    sidearm: 'flame_belcher',
    hp: 5,
    rad: 0.62,
    mods: {},
    companion: true,              // §24：开局带一只钟炉异兽
    floorChoice: 'evolution',     // §25：每层进化三选一
    talent: '驯养：钟炉异兽自动跟随与攻击，不会永久死亡；每层进化三选一（角 / 甲 / 共鸣囊）',
    hook: {
      // 扑杀 / Command（§26）：按当前进化方向下达不同指令
      onHeroSkill(p, game) {
        if (!game.companion) return false;
        const ok = game.companion.command(game);
        return ok ? 8 : false;
      },
      // 清房时给倒下的异兽一点恢复（§24"清房后逐渐恢复"）
      onRoomClear(p, game) {
        const c = game.companion;
        if (c && !c.alive) c.hp = Math.min(c.maxHp, c.hp + 2);
      },
      resource(p) {
        const c = p.game && p.game.companion;
        if (!c) return { txt: '异兽未就位' };
        const dir = c.evo ? ({ horn: '角', shell: '甲', sac: '共鸣囊' })[c.evo] : '未进化';
        return { txt: c.alive ? `异兽 ${dir} ${c.stage}/2 · HP ${Math.max(0, Math.round(c.hp))}` : `异兽倒地（${dir}）` };
      },
    },
    unlock: { souls: 50 },
  },

  // ============================================================
  //  第八职业：远征老兵 / Expedition Veteran（任务书 §22）
  //  核心动词：**过层 → 选择成长**。
  //  §22.4 要求他与余烬游侠形成**鲜明反差**：
  //    游侠"停下来，获得自己的时间"；老兵"不要停，保持节奏"。
  // ============================================================
  {
    id: 'veteran',
    cn: '远征老兵',
    en: 'Expedition Veteran',
    desc: '把每一次下潜都当成一次行军的人。他不需要奇迹，只需要不停下。',
    verb: '一层一层选择成长路线，并靠连续作战维持战意',
    passiveName: '战意',
    skillName: '压阵',
    skillCd: 12,
    costNote: '停下来休息就会掉战意 —— 他必须一直往前推，否则慢慢变回标准角色。',
    pal: { coat: '#4a4a56', coatDark: '#2f2f38', hood: '#6a6a76', accent: '#ffd24a', belt: '#6d4527' },
    build: { hood: true, veteranMantle: true, bulk: 1.06 },
    sidearm: 'shotgun_sapper',
    hp: 6,
    rad: 0.64,
    mods: {},
    floorChoice: 'doctrine',   // §22.1：每层三选一战斗教条
    talent: '战意：连续击杀积累（越久不战越衰减），小幅提高移速/射速/装填；每层确立一条战斗教条',
    hook: {
      has(p, id) { return (p.doctrines || []).includes(id); },
      // 击杀 → 战意（§22.2）。带 killed 参数，教条可以据此判断精英 / 距离。
      onKill(p, d, game) {
        const gain = this.has(p, 'killchain') ? 2 : 1;
        p.momentum = Math.min(10, (p.momentum | 0) + gain);
        p.momentumT = 0;
        const e = d && d.enemy;
        // 「屠戮收获」：精英击杀额外掉金币
        if (this.has(p, 'butcher') && e && e.elite) game.spawnCoins(p.x, p.z, 1,{rewardSource:'event-reward'});
        // 「空匣反击」：弹匣打空时的近距离击杀 → 立即装填 30%
        if (this.has(p, 'last_stand') && p.weapon && p.weapon.mag <= 0 && e) {
          if (Math.hypot(e.x - p.x, e.z - p.z) < 4) p.instantReload(0.30);
        }
        p.recompute();
      },
      // 战意带来的小幅加成（§22.2 明确"数值不能过大"）
      recompute(p, s) {
        const m = Math.max(0, Math.min(10, p.momentum | 0));
        if (m > 0) {
          const per = this.has(p, 'veteran_march') ? 0.012 : 0.006;
          s.speed += m * per;          // 满战意：+12% 或 +6%
          s.rate += m * 0.005;         // +5%
          s.reloadMul -= m * 0.006;
        }
        if (this.has(p, 'swap_drill') && p.swapT > 0) s.rate += 0.35;
      },
      // 「开火纪律」：装填完成后的前 3 发强化
      damageMul(p) {
        return (this.has(p, 'opening_volley') && (p._shotsSinceReload | 0) < 3) ? 1.50 : 1;
      },
      // 「战场修补」：每进入新一层回复 1 点生命（上限不变）
      // —— 这条教条最初只写了数据却没实现，是"数据/消费点分离"自查时抓出来的。
      onFloorStart(p, d, game) {
        if (!this.has(p, 'field_repair')) return;
        if (p.hp >= p.maxHp) return;
        p.heal(1, 'hero');
        game.hud.toast('战场修补', '生命 +1', '#9dff5a', 'quick');
      },
      // 「清房喘息」
      onRoomClear(p, game) {
        if (!this.has(p, 'room_breath')) return;
        p.dashCharges = Math.min(p.dashMax, (p.dashCharges | 0) + 1);
        p.armor = Math.min(5, (p.armor | 0) + 1);
        game.hud.toast('清房喘息', '冲刺 +1 · 护甲 +1', '#9dff5a', 'quick');
      },
      // 压阵（§22.3）：消耗战意 → 快速装填 + 轻微护甲；战意不足时是弱版
      onHeroSkill(p, game) {
        const m = Math.max(0, Math.min(10, p.momentum | 0));
        const got = p.instantReload(m > 0 ? 1 : 0.34);
        if (m > 0) p.armor = Math.min(5, (p.armor | 0) + 1);
        p.momentum = Math.max(0, m - 4);
        p.recompute();
        game.particles.ring(p.x, 0.6, p.z, '#ffd24a', 16, 0.6, 2.2);
        game.hud.toast('压阵', m > 0 ? `消耗战意 · 装填 ${got} 发 · 护甲 +1` : '战意不足：只完成一次部分装填', '#ffd24a', m > 0 ? 'story' : 'quick');
        return m > 0 ? 10 : 16;
      },
      resource(p) {
        const m = p.momentum | 0;
        return { txt: `战意 ${m}/10${(p.doctrines || []).length ? ` · 教条 ${p.doctrines.length}` : ''}` };
      },
    },
    unlock: { souls: 40 },
  },

  // ============================================================
  //  第七职业：铸枪师 / Gunsmith（任务书 §21）
  //  核心动词：**养枪 → 改造**。
  //  别人寻找好枪；他能把一把普通枪一路养成本局专属武器。
  //  §21.3 的红线：他的强度**不能**来自"基础枪伤害 +20%"，
  //  只能来自"配件选择更稳定、武器成长上限更高"。
  // ============================================================
  {
    id: 'gunsmith',
    cn: '铸枪师',
    en: 'Gunsmith',
    desc: '把军械库当工作台的人。他相信没有废枪，只有还没改完的枪。',
    verb: '把一把普通枪一路养成本局专属武器',
    passiveName: '枪架',
    skillName: '超频',
    skillCd: 16,
    costNote: '基础枪毫无加成 —— 强度全部来自配件选择与养成速度。',
    pal: { coat: '#3a4a56', coatDark: '#26333c', hood: '#556a78', accent: '#ffd24a', belt: '#6a5230' },
    build: { hood: true, gunsmithRack: true, bulk: 1.02 },
    sidearm: 'smg_hornet',
    hp: 6,
    rad: 0.62,
    mods: {},
    attachSlots: 3,          // §16：铸枪师 3 槽
    spareCap: 5,             // §21.1：更自由地拆卸 / 重装
    attachSameSlot: true,    // §21.1：高级配件兼容性略高（允许重复一个槽类型）
    floorChoice: 'attachment',   // §21.1：每下一层必定获得一次配件三选一
    talent: '枪架：配件槽 3（普通 2）· 每下一层获得一次配件三选一 · 同槽可重复一次',
    hook: {
      // 超频（§21.2）：强化当前武器已安装配件的效果；结束后进入过热
      onHeroSkill(p, game) {
        const n = ((p.weapon && p.weapon.attachments) || []).length;
        if (n === 0) {
          game.hud.toast('超频', '当前武器没有任何配件，超频没有意义', '#ff6a3a', 'fail');
          return false;
        }
        p.overclockT = 5.0;
        p.heatOver = undefined;
        p.overheatT = 0;
        game.particles.ring(p.x, 0.6, p.z, '#ffd24a', 20, 0.8, 2.6);
        game.particles.ring(p.x, 1.0, p.z, '#8ad8ff', 14, 1.0, 1.8);
        game.hud.toast('超频', `${n} 个配件的效果被强化 5 秒`, '#ffd24a', 'story');
        return 16;
      },
      resource(p) {
        if (p.overheatT > 0) return { txt: `过热 ${p.overheatT.toFixed(1)}s` };
        if (p.overclockT > 0) return { txt: `超频 ${p.overclockT.toFixed(1)}s` };
        const n = ((p.weapon && p.weapon.attachments) || []).length;
        return { txt: `配件 ${n}/${p.attachSlots()}` };
      },
    },
    unlock: { souls: 45 },
  },

  // ============================================================
  //  第五职业：回响师 / Resonant（任务书 §12）
  //  核心动词：**利用墙壁 → 改写弹道**。
  //  这是最能体现《沉钟回廊》自身身份的职业之一。
  // ============================================================
  {
    id: 'resonant',
    cn: '回响师',
    en: 'Resonant',
    desc: '研究旧王庭钟声、回音与共振现象的人。在他眼里，墙不是障碍，是第二条弹道。',
    verb: '用墙壁和柱子重新设计自己的弹道',
    passiveName: '共鸣',
    skillName: '定音',
    skillCd: 12,
    costNote: '不利用墙体的角度，共鸣就攒不起来 —— 开放房间里他接近标准角色。',
    pal: { coat: '#2f4a6a', coatDark: '#1d3250', hood: '#3f6a9a', accent: '#8ad8ff', belt: '#4a4a52' },
    build: { hood: true, resonanceRig: true, bulk: 0.98, tall: 1.04 },
    sidearm: 'rifle_carbine',
    hp: 6,
    rad: 0.62,
    mods: {},
    talent: '共鸣：反弹后命中积攒共鸣（0–5）；首次反弹不衰减且伤害 +18%；天生 +1 弹射',
    hook: {
      // 天生 +1 Bounce（§12.2）；定音期间再多 +2
      recompute(p, s) { s.bounce += 1; if (p.tuningT > 0) s.bounce += 2; },
      // 标记"这一发是回响弹"：只有首次反弹才有加成（避免"全程无脑射墙"）
      shotMods(p, o) {
        o.resonant = true;
        if (p.tuningT > 0) {
          o.bounce = (o.bounce || 0) + 2;
          // 定音期间：首次墙反弹之后获得轻微寻敌（§12.3）
          if (!o.homing) o.homing = 0.35;
        }
      },
      // 反弹后命中 → 共鸣 +1（§12.1）
      onProjectileHit(p, d, game) {
        if (!d.bounced || p.tuningT > 0) return;
        if ((p.resonance | 0) >= 5) return;
        p.resonance = (p.resonance | 0) + 1;
        audio.bell(false);
        game.particles.ring(p.x, 0.5, p.z, '#8ad8ff', 14, 0.5, 1.8);
        game.hud.toast('共鸣', `反弹命中 · 共鸣 ${p.resonance}/5`, '#8ad8ff', 'quick');
        p.recompute();
      },
      // 定音（§12.3）：消耗共鸣进入定音状态；共鸣越高持续越久
      onHeroSkill(p, game) {
        const n = p.resonance | 0;
        if (n <= 0) {
          p.tuningT = 1.6;
          game.hud.toast('定音（弱）', '没有共鸣：只有一次短暂的弹射强化', '#8fa2b0', 'quick');
          return 14;
        }
        p.resonance = 0;
        p.tuningT = 2.5 + n * 1.1;
        audio.bell(true);
        game.particles.ring(p.x, 0.6, p.z, '#8ad8ff', 20, 0.9, 3.0);
        game.hud.toast('定音', `消耗 ${n} 共鸣 · 弹射 +2，首次反弹后轻微寻敌`, '#8ad8ff', 'story');
        p.recompute();
        return 12;
      },
      resource(p) {
        return { txt: p.tuningT > 0 ? `定音 ${p.tuningT.toFixed(1)}s` : `共鸣 ${p.resonance | 0}/5` };
      },
    },
    unlock: { souls: 35 },
  },

  // ============================================================
  //  第六职业：烬誓者 / Ember Oath（任务书 §13）
  //  核心动词：**主动付出 → 获得超载**。
  //  刻意不做成"血越少伤害越高"的纯数值狂战士。
  // ============================================================
  {
    id: 'emberoath',
    cn: '烬誓者',
    en: 'Ember Oath',
    desc: '接受过旧王庭炉火仪式的人。他相信力量必须用自己身上的东西去换。',
    verb: '主动付出生命资源换取爆发',
    passiveName: '誓火',
    skillName: '焚誓',
    skillCd: 10,
    costNote: '上限最高、容错最低：每一次超载都是拿护甲与生命换的。',
    pal: { coat: '#5a2a22', coatDark: '#3d1a14', hood: '#7a3524', accent: '#ff7a2e', belt: '#3a3a42' },
    build: { hood: true, oathCore: true, bulk: 1.02 },
    sidearm: 'grenade_lobber',
    hp: 5,
    rad: 0.62,
    mods: {},
    talent: '誓火：满血时的治疗会被焚成誓火（0–5）；护甲碎裂与低生命清房也积攒誓火',
    hook: {
      // 满血时治疗不浪费 —— 转成誓火（§13.2）。
      // 用"满血才焚"代替弹窗：既实现了"放弃治疗"的选择，又不会误操作，
      // 也不会在交火中弹出一个打断战斗的窗口。
      onHeal(p, d, game) {
        if (p.hp >= p.maxHp - 0.01 && (p.phrase | 0) < 5) {
          d.burn = true;
          p.phrase = (p.phrase | 0) + 1;
          game.particles.ring(p.x, 0.5, p.z, '#ff7a2e', 14, 0.5, 1.6);
          game.hud.toast('焚誓', `治疗被焚成誓火 ${p.phrase}/5`, '#ff7a2e', 'quick');
          p.recompute();
        }
      },
      onArmorBreak(p, d, game) {
        p.phrase = Math.min(5, (p.phrase | 0) + 1);
        game.hud.toast('誓火', `护甲碎裂 · 誓火 ${p.phrase}/5`, '#ff7a2e', 'quick');
      },
      onRoomClear(p, d, game) {
        if (p.hp <= 2 && (p.phrase | 0) < 5) {
          p.phrase = (p.phrase | 0) + 1;
          game.hud.toast('险境誓言', `低生命清房 · 誓火 ${p.phrase}/5`, '#ff7a2e', 'quick');
        }
      },
      // 超载期间：射速与机动小幅提升（数值克制，核心是"熔痕"这个行为变化）
      recompute(p, s) {
        if (p.overloadT > 0) { s.rate += 0.35; s.speed += 0.10; }
      },
      // 熔痕：超载期间的弹丸带灼烧（§13.3）
      shotMods(p, o) {
        if (p.overloadT > 0) {
          o.statuses = Object.assign({}, o.statuses || {});
          o.statuses.burn = Math.max(2, o.statuses.burn || 0);
          o.color = '#ff8a3c';
        }
      },
      // 焚誓（§13.3）：优先护甲 → 誓火 → 安全规则下消耗生命。
      // **绝对禁止把自己扣死**：生命只在 hp > 1 时被动用。
      onHeroSkill(p, game) {
        let power = 0;
        const spent = [];
        if ((p.armor | 0) > 0) { p.armor--; power += 1.0; spent.push('护甲 1'); }
        const ph = Math.min(3, p.phrase | 0);
        if (ph > 0) { p.phrase -= ph; power += ph * 0.8; spent.push(`誓火 ${ph}`); }
        if (power < 0.9 && p.hp > 1) { p.hp = Math.max(1, p.hp - 1); power += 1.0; spent.push('生命 1'); }
        if (power <= 0) {
          game.hud.toast('焚誓', '没有可献出的资源（生命也不能再低了）', '#ff6a3a', 'fail');
          return false;
        }
        p.overloadT = 3.0 + power * 1.3;
        game._oathPower = Math.max(game._oathPower | 0, Math.round(power * 10) / 10);   // 「重誓」成就
        audio.explosion(1.2);
        game.particles.ring(p.x, 0.6, p.z, '#ff7a2e', 24, 0.9, 3.4);
        game.shake(0.20);
        game.hud.toast('超载', `献出 ${spent.join(' + ')} · 超载 ${p.overloadT.toFixed(1)}s`, '#ff7a2e', 'story');
        p.recompute();
        return 10;
      },
      resource(p) {
        return { txt: p.overloadT > 0 ? `超载 ${p.overloadT.toFixed(1)}s` : `誓火 ${p.phrase | 0}/5` };
      },
    },
    unlock: { souls: 35 },
  },
];

const LEGACY_HERO_MAP = Object.fromEntries(LEGACY_HEROES.map(h => [h.id, { ...h, ruleVersion: 1 }]));
const V2_HEROES = LEGACY_HEROES.map(currentHeroRule);
const V2_HERO_MAP = Object.fromEntries(V2_HEROES.map(h => [h.id, h]));
export const HEROES = [...V2_HEROES.map(heroRuleV3).map(o => e2Copy('hero', o)), FOLD_SHADOW];
export const HERO_MAP = Object.fromEntries(HEROES.map((h) => [h.id, h]));
export function heroById(id, ruleVersion = HERO_RULE_VERSION) {
  if (!validHeroRuleVersion(ruleVersion)) throw new Error('不支持此职业规则版本');
  const map = ruleVersion === 1 ? LEGACY_HERO_MAP : ruleVersion === 2 ? V2_HERO_MAP : HERO_MAP;
  return map[id] || map.warden;
}

// ---------- 挑战词条（任务书第二十九节：只增加挑战与变化，不永久增强玩家）----------
export const MODIFIERS = [
  {
    id: 'swift_bells', cn: '急钟', en: 'Swift Bells',
    desc: '敌人子弹速度 +25%，己方子弹速度 +10%',
    apply(g) { g.mod_ = g.mod_ || {}; g.mod_.bulletSpeed = 1.10; g.mod_.enemyBulletSpeed = 1.25; },
    unlockAfterWin: true,
  },
  {
    id: 'elite_tide', cn: '精锐潮', en: 'Elite Tide',
    desc: '精英出现率大幅提高，但金币掉落 +40%',
    apply(g) { g.mod_ = g.mod_ || {}; g.mod_.eliteChance = 2.2; g.mod_.coinMul = 1.40; },
    unlockAfterWin: true,
  },
  {
    // 注意：这条词条原本写的是"不再掉落食物类回复"，但游戏里**并不存在食物系统** ——
    // 属于"数据表里有、游戏里没有"的典型。现在改为指向真实存在的回复类遗物（带 heal 的），
    // 规则可被断言验证。
    id: 'iron_ration', cn: '铁粮', en: 'Iron Ration',
    desc: '回复类掉落（治疗拾取物与生命结晶）改为金币；金币收益 +25%',
    apply(g) { g.mod_ = g.mod_ || {}; g.mod_.noFood = true; g.mod_.coinMul = (g.mod_.coinMul || 1) * 1.25; },
    unlockAfterWin: true,
  },
  {
    id: 'hollow_bones', cn: '空骨', en: 'Hollow Bones',
    desc: '生命上限 -1，但冲刺次数 +1',
    apply(g) { g.mod_ = g.mod_ || {}; g.mod_.hpMinus = 1; g.mod_.dashPlus = 1; },
    unlockAfterWin: false,
  },
  {
    id: 'ember_curse', cn: '余烬诅咒', en: 'Ember Curse',
    desc: '环境危险区伤害 +50%，但敌方掉落品质提升',
    apply(g) { g.mod_ = g.mod_ || {}; g.mod_.hazardMul = 1.50; g.mod_.lootUp = 1; },
    unlockAfterWin: true,
  },
];

export const MODIFIER_MAP = Object.fromEntries(MODIFIERS.map((m) => [m.id, m]));
export function modifierById(id) { return MODIFIER_MAP[id] || null; }

// 涂装：**纯外观**的长期解锁（任务书 §5.3 的"外观"、§10 的"主色块"）。
// 只改强调色与兜帽/大衣的色相，不碰任何数值 —— 保证它永远不会破坏平衡。
export const PAINTS = [
  { id: 'orig', cn: '原色', cost: 0, patch: {} },
  { id: 'cold', cn: '霜调', cost: 25, patch: { accent: '#8af0ff', hood: '#3f8ea6', coat: '#2b5f78' } },
  { id: 'warm', cn: '炉调', cost: 25, patch: { accent: '#ffb347', hood: '#b5651f', coat: '#8a4a1e' } },
  { id: 'jade', cn: '苔调', cost: 25, patch: { accent: '#7affd2', hood: '#3f7a63', coat: '#2f5a4a' } },
];
export const PAINT_MAP = Object.fromEntries(PAINTS.map((x) => [x.id, x]));
export function heroWithPaint(hero, paintId) {
  const pt = PAINT_MAP[paintId];
  if (!pt || !Object.keys(pt.patch).length) return hero;
  return { ...hero, pal: { ...hero.pal, ...pt.patch }, paint: paintId };
}

// 出征补给：开局带一点资源（任务书 §5.3 的"少量 Run 准备"）。
// 刻意做成**一次性、不永久**，且幅度很小 —— 不许在大厅里买战力。
export const SUPPLIES = [
  { id: 'none', cn: '不带补给', desc: '不带额外补给，轻装出发', cost: 0 },
  { id: 'armor', cn: '铁片护甲', desc: '开局护甲 +1（受护甲上限限制）', cost: 0 },
  { id: 'ammo', cn: '备用弹匣', desc: '开局时所有有限备弹武器 +40% 备弹', cost: 0 },
  { id: 'coin', cn: '钟魂碎片', desc: '开局金币 +15', cost: 0 },
];
export const SUPPLY_MAP = Object.fromEntries(SUPPLIES.map((x) => [x.id, x]));

export const SIDEARMS = [
  { id: 'pistol_rusty', cn: '锈蚀手枪', cost: 0 },
  { id: 'smg_hornet', cn: '蜂巢冲锋枪', cost: 30 },
  { id: 'rifle_carbine', cn: '卡宾步枪', cost: 35 },
  { id: 'grenade_lobber', cn: '掷弹器', cost: 40 },
];
