// 进度文案（第十三轮）
// ------------------------------------------------------------
// 章节流程把 floor 当"主题编号"用（1/2/3），而旧三层里 floor 真的是楼层。
// 于是同一局在 HUD 顶上写"第 1 章 · 第 4 段"，在继续按钮和结算里却写"第 1 层"。
// 这里给一个唯一判定：有 stage 就用章/段，没有才用层。
// 纯函数，不读存档、不碰 DOM。

// stage 可能是存档里的 plain 对象，也可能是运行中的上下文；只认 chapter/segment 两个整数。
export function stageProgressLabel(stage) {
  if (!stage || !Number.isInteger(stage.chapter) || !Number.isInteger(stage.segment)) return '';
  return `第 ${stage.chapter} 章 · 第 ${stage.segment} 段`;
}

// 传入 {stage, floor}：章节流程返回章/段，旧三层返回"第 N 层"。
// floor 非法时返回空串，由调用方决定兜底文案（不猜一个数字）。
export function runProgressLabel(run) {
  const stage = stageProgressLabel(run && run.stage);
  if (stage) return stage;
  const floor = run && run.floor;
  return Number.isInteger(floor) && floor >= 1 ? `第 ${floor} 层` : '';
}
