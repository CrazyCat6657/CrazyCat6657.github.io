// ============================================================
//  战斗教条 / Doctrine（任务书 §22）
//
//  远征老兵的核心成长方式：**每进入新一层，三选一**。
//  §22.1 明确要求"不是简单 +10% Damage"，优先行为型能力。
//
//  实现方式与英雄 Hook 完全同构：每条教条 = 数据 + 可选 hook。
//  老兵的 hook 只是一个**分发器**，把事件转给已选教条 ——
//  这样新增教条只需要往这个数组里加一条，不需要动任何其它代码。
// ============================================================

export const DOCTRINES = [
  {
    id: 'opening_volley', cn: '开火纪律', en: 'Opening Volley',
    desc: '每次装填完成后的前 3 发伤害 +50%',
    // 与"过压弹仓"同类机制，但属于角色规则（§40：教条 = 角色规则，配件 = 那把枪）
    tag: '装填',
  },
  {
    id: 'killchain', cn: '连战不辍', en: 'Killchain',
    desc: '击杀获得的战意由 1 点增至 2 点。',
    tag: '战意',
  },
  {
    id: 'room_breath', cn: '清房喘息', en: 'Room Breath',
    desc: '清空房间后恢复 1 次冲刺并回复 1 点护甲（护甲上限 5）',
    tag: '清房',
  },
  {
    id: 'swap_drill', cn: '换枪操典', en: 'Swap Drill',
    desc: '切换武器后 2 秒内射速 +35%',
    tag: '切枪',
  },
  {
    id: 'butcher', cn: '屠戮收获', en: 'Butcher',
    desc: '击杀精英时额外掉落 1 金币，并补给当前武器 6% 备弹',
    tag: '精英',
  },
  {
    id: 'last_stand', cn: '空匣反击', en: 'Last Stand',
    desc: '弹匣打空后，在 4 单位内击杀敌人，立即装填 30% 弹匣。',
    tag: '空匣',
  },
  {
    id: 'veteran_march', cn: '老练行军', en: 'Veteran March',
    desc: '战意带来的移速加成翻倍（不改变其它加成）',
    tag: '战意',
  },
  {
    id: 'field_repair', cn: '战场修补', en: 'Field Repair',
    desc: '每进入新一层回复 1 点生命（上限不变）',
    tag: '续航',
  },
];

export const DOCTRINE_MAP = Object.fromEntries(DOCTRINES.map((d) => [d.id, d]));
export function doctrineById(id) { return DOCTRINE_MAP[id] || null; }

// 给 HUD / 集合面板用的一行摘要
export function doctrineSummary(list, ruleVersion = 3) {
  const map=ruleVersion===3?DOCTRINE_MAP_V3:DOCTRINE_MAP;
  return (list || []).map(id=>map[id]?.cn || '?').join(' · ');
}

// v1/v2 deliberately retain the historical eight-card pool.
export const DOCTRINES_V3 = [...DOCTRINES,
  {id:'roll_counter',cn:'翻滚反击',desc:'翻滚结束后的前 3 次开火伤害 +35%',tag:'翻滚'},
  {id:'broken_guard',cn:'破甲不退',desc:'护甲耗尽时补满当前弹匣，并获得 2 点战意',tag:'破甲'},
  {id:'elite_breach',cn:'精英破阵',desc:'每名精英或首领第一次受到你的伤害时，追加 4 点战术伤害',tag:'精英'},
  {id:'steady_fire',cn:'稳步压制',desc:'连续命中作战 2 秒后射速 +20%；停火 1.5 秒结束',tag:'压制'},
  {id:'loaded_response',cn:'有备换防',desc:'切换到有弹药的武器后，下一次开火伤害 +60%。',tag:'切枪'},
  {id:'room_supply',cn:'战地补给',desc:'每清空一个战斗房间，为当前武器补给 12% 备弹',tag:'补给'},
  {id:'high_spirits',cn:'昂扬齐射',desc:'战意至少 6 点时，每 4 次正常发射追加一枚战术弹；遥控引爆不计入。',tag:'战意'},
];
export const DOCTRINE_MAP_V3 = Object.fromEntries(DOCTRINES_V3.map(d=>[d.id,d]));
