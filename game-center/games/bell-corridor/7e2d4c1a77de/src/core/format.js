// 玩家可见的格式化（第十三轮）
// ------------------------------------------------------------
// 只做"把机器格式变成人看的格式"，不读存档、不碰 DOM，可在 Node 里直接测。
// 起因：导入存档确认面板把 savedAt 的 ISO 串原样打到玩家脸上
// （2026-10-21T10:41:43.123Z），而同一个字段在"上次保存"里是本地化时间。

// 存档时间：ISO 字符串 / 毫秒时间戳 / 已格式化字符串都能吃。
// 解析失败或缺失时返回 fallback，绝不回显原串 —— 机器格式上屏本身就是缺陷。
export function formatSavedAt(value, fallback = '时间未知') {
  if (value === null || value === undefined || value === '') return fallback;
  let date = null;
  if (value instanceof Date) date = value;
  else if (typeof value === 'number' && Number.isFinite(value)) date = new Date(value);
  else if (typeof value === 'string') {
    // 纯数字字符串按时间戳处理，其余交给 Date 解析（ISO 8601）。
    const asNumber = /^\d{10,}$/.test(value.trim()) ? Number(value) : NaN;
    date = Number.isFinite(asNumber) ? new Date(asNumber) : new Date(value);
  }
  if (!date || Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleString();
}
