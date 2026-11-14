// 版本号唯一来源（第十三轮，2026-10-22）
// ------------------------------------------------------------
// 以前包名、标题页角标、README 各写一份，结果标题页在 1.5 的包里还留着 v2.1。
// 现在只有这里定义；标题页在启动时读它（main.js），打包脚本也从这里取版本名。
// 出包时只需修改本文件的 GAME_VERSION 与 ANDROID_VERSION_CODE。
export const GAME_VERSION = '1.7.0';

// 显示用标签（标题页角标）。不要在别处拼接 "v" 前缀。
export const VERSION_LABEL = `v${GAME_VERSION}`;

// 上传格式：安卓 versionCode 必须严格递增，且无法从语义版本推导，所以单独记在这里，
// 由 android_apply.mjs 读取；改版本时两行一起改。
export const ANDROID_VERSION_CODE = 11;
