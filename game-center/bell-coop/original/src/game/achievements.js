// ============================================================
//  成就系统（任务书第十一节）
//
//  覆盖探索 / 战斗 / Build / 武器 / 挑战五类。
//  **成就不只是 Toast**：大厅「功勋墙」会把它陈列出来。
//  部分成就解锁的是"选择"（英雄、起始武器、挑战词条、Codex 条目），
//  而不是直接把属性发给玩家 —— 避免把肉鸽变成数值刷子。
//
//  check 在关键时刻被调用（击杀 / 清房 / 下层 / 胜利 / 死亡），
//  ctx 里带上当时的局面快照。
// ============================================================

export const ACHIEVEMENTS = [
  // 探索类
  { id: 'secret_room', cn: '不该存在的地方', cat: '探索', desc: '第一次发现隐藏房',
    check: (c) => c.secrets >= 1 },
  { id: 'vault_1', cn: '贪心的代价', cat: '探索', desc: '第一次进入风险宝库',
    check: (c) => c.vaults >= 1 },
  { id: 'clear_floor', cn: '一寸不留', cat: '探索', desc: '把某一层除起始房、隐藏房、风险宝库之外的房间全部清理',
    check: (c) => c.floorFullyCleared },
  { id: 'rare_event', cn: '幽邃的低语', cat: '探索', desc: '与深渊铁匠互动一次',
    check: (c) => c.rareEvent },

  // 战斗类
  { id: 'no_hit_room', cn: '寸步不让', cat: '战斗', desc: '不损失生命地清空一个战斗房；护甲抵挡不影响达成',
    check: (c) => c.noHitRoom },
  { id: 'no_hit_boss', cn: '纹丝不动', cat: '战斗', desc: '未受伤且未消耗普通护甲，击败一个 Boss；临时护甲完全吸收的伤害不计受击',
    check: (c) => c.noHitBoss },
  { id: 'barrel_chain', cn: '连锁反应', cat: '战斗', desc: '同一次爆炸击杀 3 名敌人',
    check: (c) => c.blastKills >= 3 },

  // Build 类
  { id: 'synergy_1', cn: '齿轮咬合', cat: 'Build', desc: '触发一组协同',
    check: (c) => c.synergies >= 1 },
  { id: 'tag_stack', cn: '专精', cat: 'Build', desc: '同时持有 4 件同一流派的遗物',
    check: (c) => c.maxTagCount >= 4 },

  // 武器类
  { id: 'weapon_boss', cn: '它不适合你', cat: '武器', desc: '击败首领的瞬间，手持本局初始副武器',
    check: (c) => c.bossKilledWithSidearm },
  { id: 'gun_variety', cn: '什么都会一点', cat: '武器', desc: '一局中累计用过 6 把不同武器（含初始武器）',
    check: (c) => c.distinctWeapons >= 6 },

  // 挑战类
  // 注意：通关类成就必须被 c.atVictory 门控。
  // 否则 "不购物 / 低生命 / 带词条" 这些条件在开局几秒内就为真，会直接白送
  // （实测踩过：新档立刻判定就发了 3 个成就）。
  { id: 'modifier_win', cn: '背着诅咒赢', cat: '挑战', desc: '带着任意挑战词条通关',
    check: (c) => c.atVictory && c.winWithModifier },
  { id: 'low_hp_win', cn: '一线生机', cat: '挑战', desc: '剩余生命不超过 1 点时通关',
    check: (c) => c.atVictory && c.winAtOneHp },
  { id: 'no_shop_win', cn: '自给自足', cat: '挑战', desc: '不购买任何商品或商店服务通关',
    check: (c) => c.atVictory && c.winNoShop },


  // ---- 职业成就（§44）：每职业 1 条代表性的，奖励"选择"与钟魂，不奖励永久攻击力 ----
  { id: 'hero_bell_chain', cn: '钟声连响', cat: '职业', desc: '守钟人：连续完成 5 次完美闪避，中途受伤即中断',
    check: (c) => c.pdChain >= 5 },
  { id: 'hero_vent_five', cn: '一炉烈火', cat: '职业', desc: '熔铸匠：一次狂暴期间命中 5 个不同真实敌人',
    check: (c) => c.ventHits >= 5 },
  { id: 'hero_deadeye_three', cn: '游影三杀', cat: '职业', desc: '余烬游侠：第一段游闪起 8 秒内击杀 3 个不同真实敌人',
    check: (c) => c.deadeyeKills >= 3 },
  { id: 'hero_dismantle_five', cn: '拆解工', cat: '职业', desc: '拾荒客：本局累计拆解 5 件地面武器',
    check: (c) => c.dismantled >= 5 },
  { id: 'hero_bounce_double', cn: '一弹双响', cat: '职业', desc: '回响师：同一发子弹反弹后击杀 2 个不同敌人',
    check: (c) => c.bounceDoubleKill >= 2 },
  { id: 'hero_oath_big', cn: '重誓', cat: '职业', desc: '烬誓者：一次焚誓封存 3 点生命（需要至少 2 点当前生命）',
    check: (c) => c.oathPower >= 3 },
  { id: 'hero_full_attach_boss', cn: '亲手养成', cat: '职业', desc: '铸枪师：击败首领时，本局至少有一把枪装满 3 个配件',
    check: (c) => c.fullAttachBoss === true },
  { id: 'hero_doctrine_two', cn: '行军条令', cat: '职业', desc: '远征老兵：在一局内确立 2 条战斗教条',
    check: (c) => c.doctrineCount >= 2 },
  { id: 'hero_pet_evo_two', cn: '一同长大', cat: '职业', desc: '驯炉人：让异兽完成两次进化',
    check: (c) => c.petStage >= 2 },
  { id: 'hero_spell_variety', cn: '翻译者', cat: '职业', desc: '钟术师：用过 4 种不同的法术形态',
    check: (c) => c.spellForms >= 4 },
];

export const ACH_MAP = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));

// 成就解锁的"选择"奖励（不是属性）
export const ACH_REWARDS = {
  secret_room: { souls: 25 },
  vault_1: { souls: 25 },
  clear_floor: { souls: 30 },
  no_hit_boss: { souls: 45, unlockModifier: 'hollow_bones' },
  barrel_chain: { souls: 15 },
  synergy_1: { souls: 20 },
  tag_stack: { souls: 25 },
  weapon_boss: { souls: 30, unlockSidearm: 'smg_hornet' },
  gun_variety: { souls: 20 },
  modifier_win: { souls: 60, unlockModifier: 'ember_curse' },
  low_hp_win: { souls: 60 },
  no_shop_win: { souls: 40 },
  rare_event: { souls: 20 },
  no_hit_room: { souls: 15 },
  // 职业成就的奖励同样是"选择"，不是属性
  hero_bell_chain: { souls: 30 },
  hero_vent_five: { souls: 30 },
  hero_deadeye_three: { souls: 30 },
  hero_dismantle_five: { souls: 25, unlockSidearm: 'rifle_carbine' },
  hero_bounce_double: { souls: 35 },
  hero_oath_big: { souls: 30 },
  hero_full_attach_boss: { souls: 40 },
  hero_doctrine_two: { souls: 25 },
  hero_pet_evo_two: { souls: 35 },
  hero_spell_variety: { souls: 35 },
};
