// 结算标题（第十三轮）
// ------------------------------------------------------------
// 以前 <h2> 写死"总督已陨落"。但章节流程里第 1 章首领是缚钟兽、第 2 章是哑钟主祭，
// 只有第 3 章（以及旧三层）才是熔核总督 —— 打别的首领也会被告知"总督已陨落"。
// 这里把"结算类型 → 标题"收在一处，三种结局各说各的，不再借用首领专名。
// 纯函数，不读 DOM、不读存档。

// kind: 'boss' | 'chapter' | 'campaign'
// boss: BOSS_DEFS 的一项（cn/en）；chapter: 章节号。
export function victoryVerdict({ kind = 'boss', boss = null, chapter = null } = {}) {
  if (kind === 'campaign') {
    return { title: '余 烬 落 定', sub: 'ALL CHAPTERS CLEARED' };
  }
  if (kind === 'chapter') {
    const n = Number.isInteger(chapter) ? chapter : 1;
    return { title: `第 ${n} 章 完 成`, sub: `CHAPTER ${n} CLEARED` };
  }
  const cn = boss && boss.cn ? boss.cn : '首领';
  const en = boss && boss.en ? boss.en : '';
  return { title: `${cn} 已 陨 落`, sub: en ? `${en} FALLEN` : 'FALLEN' };
}
