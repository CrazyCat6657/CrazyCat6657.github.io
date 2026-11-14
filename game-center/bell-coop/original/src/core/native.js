// ============================================================
//  原生外壳胶水（Capacitor / Android）
//
//  在普通浏览器里本文件**什么都不做**：没有 window.Capacitor 时 isNative() 为 false，
//  所有调用提前返回。因此 PC 版与全部无头探针的行为与从前完全一致。
//
//  只负责三件"网页管不到"的事：
//    1. 系统返回键 → 语义上等同 ESC（关面板 / 暂停），没人处理时才退出应用
//    2. 隐藏状态栏（沉浸式）
//    3. 锁定横屏（Manifest 已锁，这里再兜一层，部分定制系统会忽略清单）
// ============================================================

export function isNative() {
  const C = globalThis.Capacitor;
  return !!(C && typeof C.isNativePlatform === 'function' && C.isNativePlatform());
}

// onBack: () => boolean —— 返回 true 表示"这次返回被游戏消费了"，不要退出应用。
// 用动态 import 是因为这两个插件在浏览器里不存在，
// 静态 import 会让 PC 版直接 404 加载失败。
export async function installNativeShell({ onBack } = {}) {
  if (!isNative()) return false;

  try {
    const App = globalThis.Capacitor.Plugins?.App || globalThis.Capacitor.registerPlugin('App');
    await App.addListener('backButton', () => {
      let handled = false;
      try { handled = !!(onBack && onBack()); } catch { handled = false; }
      // 标题界面按返回 = 退出应用（Android 惯例）；游玩中一定已被消费，不会误退出。
      if (!handled) { try { App.exitApp(); } catch { /* 忽略 */ } }
    });
  } catch { /* 没有插件时退化为系统默认行为 */ }

  try {
    const StatusBar = globalThis.Capacitor.Plugins?.StatusBar || globalThis.Capacitor.registerPlugin('StatusBar');
    await StatusBar.setOverlaysWebView({ overlay: true });
    await StatusBar.hide();
  } catch { /* 忽略 */ }

  try { await screen.orientation.lock('landscape'); } catch { /* 部分设备不支持 */ }

  return true;
}
