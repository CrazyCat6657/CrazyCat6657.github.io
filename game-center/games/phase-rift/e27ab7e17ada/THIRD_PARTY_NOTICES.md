# 第三方组件说明

游戏代码的公开许可证尚未由作者指定；以下许可仅适用于各自第三方组件。

| 组件 | 用途 | 许可与证据 |
|---|---|---|
| Three.js r160 | 网页与 Android 内置 3D 引擎 | MIT，见 licenses/three-r160.txt；与 vendor 文件头 r160 / 2010–2023 一致。原文来源 https://github.com/mrdoob/three.js/blob/r160/LICENSE |
| esbuild 0.28.2 | 本地构建工具，不嵌入游戏 | MIT，安装包 LICENSE.md |
| playwright-core 1.64.1 | 本地自动化工具，不进入玩家包 | Apache-2.0，安装包 LICENSE |
| Capacitor 7.x（精确依赖见 mobile/package-lock.json） | Android 壳与 app / status-bar 插件 | MIT，见 licenses/capacitor-*.txt |
| AndroidX / Gradle / Android 构建插件 | 原有 Android 工程依赖 | 依赖版本由 mobile/android 固定配置；AndroidX 多采用 Apache-2.0，完整传递依赖清单随构建生成。公开商店发行前需复核平台的 NOTICE 要求。 |

Three.js 的完整许可同时内嵌在 PC 单文件中，单独转发 HTML 时仍保留版权与授权声明。
模型、纹理、粒子和声音由项目代码生成。当前 HTML/CSS 没有远程字体、图片或音频加载；系统字体通过本机字体栈选用。
本说明是已检查组件及来源记录，不替代作者对整体项目许可证的选择。
