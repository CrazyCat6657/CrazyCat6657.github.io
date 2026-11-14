// ============================================================
//  触摸控件外观（DOM + CSS）—— 只在 body.touch 下生效
//
//  为什么把结构与样式都放在 JS 里，而不是写进 index.html：
//  这样 PC 版与全部键盘断言一个字节都不受影响，移动端适配变成
//  "新增文件 + 受守卫的调用"，可以整块摘掉而不会留下残留样式。
//  （index.html 是我们最不希望在移动端改动里被碰到的文件。）
//
//  挂载位置有讲究（**不要改成 z-index 方案**）：
//    #tc-zone 必须是 #ui 的第一个子元素 → 它在画布之上、其余 HUD 之下。
//    于是 #btn-build、全屏界面、各种面板都天然还在它上面，
//    不需要给任何既有元素加 z-index（加错会反过来盖住胜利/死亡界面）。
//    #tc-ui（按钮层）插在 #screen-loading 之前 → 在所有全屏界面之下。
// ============================================================

import { AUTO_ZOOM_COMPACT } from '../game/preferences.js';

// 摇杆直径用 vmin（随屏幕缩放），但**位置与光栅尺寸由 touch.js 用像素计算** ——
// 见下方 `.tc-stick` 注释：视觉中心与输入中心必须是同一个数，只能有一个来源。
const STICK_DIA = 22;   // vmin，底盘直径
const KNOB_DIA = 9;     // vmin，摇杆头直径
const BTN = 10;         // vmin，所有动作键统一大小（平板基准）
const PAUSE = 8;        // vmin，暂停键更小、且远离拇指区

/** 基准竖直 fov（平板 / 桌面）= 放大倍率 1.0 的那一档。 */
export const BASE_FOV = 46;
/** fov 下限：倍率 2.0 时约 24°，留一点余量避免退化成贴脸视角。 */
const FOV_MIN = 20;

export const TC_LAYOUT = {
  // 摇杆**静止**时的圆心（屏幕百分比）。跟随手的模式下它就是"手指抬起后圆盘停在哪"。
  //
  // ★ 历史（两轮真机反馈叠在这一个字段上，别只读一半）★
  //   第一轮：浮动圆心 + 为了把整个圆盘留在屏内而做向屏内钳制 pad = radius + 8。
  //          拇指自然落在屏幕边缘附近（x≈100），圆心被强行推到 158 →
  //          圆盘偏离手指约 58px，反馈"圆盘是歪的 / 不能精确反馈到我手放的位置"。
  //          **根因是钳制，不是浮动。**
  //   第二轮：改成固定圆心 —— 圆盘不再歪，但反馈"固定的手感还是太差了"。
  //   现在：默认浮动且**不做任何钳制**（见 touch.js onDown 的 'float' 分支）。
  //          靠边时宁可靠屏幕裁掉一角，也不允许圆心与手指分叉。
  //   两种模式共用的不变量只有一条：**画出来的圆盘中心 === 输入用的圆心**。
  stick: { l: { x: 17, y: 71 }, r: { x: 83, y: 71 } },
  // 'float' = 圆心落在手指触点（默认，玩家可切）；'fixed' = 圆心固定在上面那组坐标。
  // 这里只是**出厂默认**；运行时真正生效的值由 TouchLayer.stickFollow 决定（偏好驱动）。
  stickMode: 'float',
  stickDia: STICK_DIA,
  knobDia: KNOB_DIA,
  buttons: [
    // 右手区：食指够得到的高位。翻滚占原来 C 的位置 —— 但必须往下一档：
    // C 原来在 y=29，而小地图（#minimap-wrap）实测底边在 y≈29.6%（1600×1068 上 316px），
    // 压在一起了。y=37 让出约 26px 余量（探针 I6 会用真实矩形把关）。
    { act: 'dash', label: '翻滚', x: 91, y: 37, size: BTN },
    // C / F 两个技能键左右并列：F 在外（更靠屏幕边），C 在内。
    { act: 'skill', label: 'C', x: 81.5, y: 50, size: BTN },
    { act: 'active', label: 'F', x: 91, y: 50, size: BTN },
    // 左手区：交互键在左轮盘右下方（原来翻滚的位置再往左）。
    { act: 'interact', label: 'E', x: 24, y: 90, size: BTN },
    // 换枪 / 换弹 并列，都在射击轮盘左下方；换枪在换弹左边一点。
    { act: 'swap', label: '换枪', x: 58, y: 90, size: BTN },
    { act: 'reload', label: '换弹', x: 70, y: 90, size: BTN },
    // 暂停 / 主菜单：屏幕右上区域。**放不到"角"上** —— 右上角被小地图占着，
    // 它左边一点又被顶部血条（#bossbar，居中 64vmin）和楼层名（#floor-info）占着。
    // 唯一稳定的空隙是"血条右端 与 小地图左边缘 之间、楼层名下沿之下"，就是这里。
    // （三层的地名都是 4 个字，所以 #floor-info 宽度固定，这个空隙不会忽然变窄。）
    { act: 'pause', label: '❚❚', x: 78, y: 16, size: PAUSE },
    { act:'build',label:'背包',x:7,y:16,size:PAUSE },
    { act:'skill1',label:'掠影',x:62,y:45,size:BTN },
    { act:'skill2',label:'留影',x:72,y:32,size:BTN },
    { act:'ultimate',label:'折镜',x:70,y:56,size:BTN },
    { act:'sprint',label:'疾跑',x:24,y:43,size:BTN },
  ],

  // ---- 矮视口（手机横屏）覆盖 ----
  // 手机横屏的 CSS 视口只有约 904x406（Redmi Turbo 3：物理 2712x1220 / DPR 3）。
  //
  // ★ 第二轮真机反馈（2026-10-16）★ 三件事都改在这里：
  //   ① 按钮**太小**：vmin 单位下 406 高的屏比 1068 的平板小 2.6 倍，同一串数字
  //      在手机上只有平板的 38%。所以紧凑档不是"再收一点"，而是**反向放大**：
  //      动作键 9.5→12vmin、底盘 19→24、摇杆头 8→9。
  //   ② 摇杆**往两边**：左盘 17%→14%、右盘 83%→86%，纵向 67%→65%（不能更低：
  //      #hud-br 技能面板实测上沿在 y=324，底盘下沿必须留在它上面）。
  //   ③ 换枪/换弹**往右**，并且**互相靠近**：58/70 → 67/77（中心距 12%→10%）。
  //      暂停键钉到右上角 78%/16% → 96.7%/5%（角上的小地图由 TC_CSS 内缩让位）。
  //
  // **只在这里写阈值**：touch.js 用 maxHeight 判定后给 body 加 tc-compact 类，
  // 紧凑档的 CSS 一律以 body.tc-compact 为选择器 —— 不让媒体查询里再出现一个数字。
  compact: {
    maxHeight: 560,                       // CSS 像素；平板 1068 / 1280x800 都不会命中
    btn: 12, pause: 7.5,
    stickDia: 24, knobDia: 9,
    stick: { l: { x: 14, y: 65 }, r: { x: 86, y: 65 } },
    buttons: {
      interact: { x: 23, y: 88 },         // 左盘右下，留出与放大后底盘的净空
      swap:     { x: 67, y: 88 },         // 右盘左下，两键并列且靠近
      reload:   { x: 77, y: 88 },
      dash:     { y: 33 },                // 右列上移：小地图下沿到技能面板上沿之间要塞三样
      skill:    { y: 46 },
      active:   { y: 46 },
      pause:    { x: 96.7, y: 5 },        // 右上角
    },
  },
};

/**
 * 把"玩家选的放大倍率"换算成 `PerspectiveCamera` 的**竖直** fov。
 *
 * 为什么倍率的定义是"相对 46°"：
 *   PerspectiveCamera.fov 是竖直视场，可见世界高度 ∝ tan(fov/2)。
 *   把 46° 那一档当 1.0 倍，于是 `tan(fov/2) = tan(46°/2) / 倍率`。
 *   这样"倍率"就是一个能和画面直接对上的数：2.0 倍 = 画面里的世界高度翻倍。
 *
 * 历史：上一版按"横向可见范围与平板对齐"推了一个与宽高比绑定的定值
 * （手机 904×406 → 31.9°，即倍率 1.49）。真机反馈"还是稍微有点远"，
 * 于是把倍率交给玩家；自动档在紧凑档取 AUTO_ZOOM_COMPACT（1.7）。
 * **平板与桌面的 1.0 倍仍是 46°，与改动前逐字节相同。**
 *
 * @param {number} zoom 0 / 非有限数 = 自动（紧凑档 1.7、其它 1.0）；否则用给定倍率
 */
export function resolveCameraFov(w, h, zoom = 0) {
  const c = TC_LAYOUT.compact;
  const compact = !!c && !(h > c.maxHeight);
  const z = Number.isFinite(zoom) && zoom > 0 ? zoom : (compact ? AUTO_ZOOM_COMPACT : 1);
  const want = Math.tan(BASE_FOV * Math.PI / 360) / z;
  return Math.max(FOV_MIN, 2 * Math.atan(want) * 180 / Math.PI);
}

/**
 * 当前视口该用哪一套布局。返回的对象里都是**有效值**（已套用过紧凑档与玩家自定义的覆盖），
 * 调用方不需要再关心分支。`.compact` 字段用于给 body 打类、以及探针断言。
 *
 * 覆盖优先级（后者压前者）：基准 → 紧凑档 → 玩家自定义（opts.layout）。
 * 玩家自定义按 base / compact 两套分开存 —— 手机与平板的可用空间完全不同，
 * 用同一组百分比必然有一边是错的。
 *
 * @param {object} [opts] { btnScale, layout } —— 全部可选，缺省 = 内置布局（PC / 探针默认路径）
 */
export function resolveLayout(w, h, opts) {
  const o = opts || {};
  const c = TC_LAYOUT.compact;
  // 视口**高**超过阈值（平板 / 桌面窗口）走基准；矮于阈值（手机横屏）才收紧凑档。
  const compact = !!c && !(h > c.maxHeight);
  const scale = Number.isFinite(o.btnScale) && o.btnScale > 0 ? o.btnScale : 1;
  const own = o.layout && typeof o.layout === 'object' ? o.layout : null;

  const cs = (compact && c.stick) || {};
  const ownStick = (own && own.sticks) || {};
  const stick = {};
  for (const side of ['l', 'r']) {
    stick[side] = { ...TC_LAYOUT.stick[side], ...(cs[side] || {}), ...(ownStick[side] || {}) };
  }

  const buttons = TC_LAYOUT.buttons.map((b) => {
    // 基准里 buttons[].size 已经写死了，这里按 act 重新取一份
    const base = b.act === 'pause' ? PAUSE : BTN;
    const size0 = compact && c ? (b.act === 'pause' ? (c.pause ?? base) : (c.btn ?? base)) : base;
    const cov = (compact && c && (c.buttons || {})[b.act]) || {};
    const mine = (own && own.buttons && own.buttons[b.act]) || {};
    return { ...b, ...cov, ...mine, size: size0 * scale };
  });

  return {
    compact,
    stick,
    // 摇杆**不吃** btnScale：它的直径是按拇指行程定的，放大后会顶到左下角的武器面板；
    // 玩家想改摇杆位置请用键位编辑（拖圆心），想改大小请直接说。
    stickDia: compact && c ? c.stickDia : TC_LAYOUT.stickDia,
    knobDia: compact && c ? c.knobDia : TC_LAYOUT.knobDia,
    buttons,
  };
}

/** 按钮的尺寸与坐标全部写进内联样式（唯一来源是 TC_LAYOUT）。初始化与 resize 都要调。 */
export function applyButtonLayout(buttons, layout) {
  const byAct = new Map(layout.buttons.map((b) => [b.act, b]));
  for (const el of buttons) {
    const spec = byAct.get(el.dataset.act);
    if (!spec) continue;
    el.style.left = spec.x + '%';
    el.style.top = spec.y + '%';
    el.style.width = spec.size + 'vmin';
    el.style.height = spec.size + 'vmin';
    el.style.fontSize = (spec.size * 0.34) + 'vmin';
  }
}

export const TC_CSS = `
body.touch [data-act][hidden]{display:none!important;}
body.touch #experiment-hud{top:50px;max-width:56vw;padding:4px 8px;font:11px/1.35 sans-serif;}
body.touch #experiment-hud meter{width:65px;}
body.touch{ -webkit-touch-callout:none; }
body.touch, body.touch #app, body.touch #ui, body.touch canvas{
  touch-action:none; -webkit-user-select:none; user-select:none;
  /* 关掉橡皮筋与下拉刷新：不关的话，从屏幕边缘拖动会让整个页面跟着平移，
     玩到一半画面被拽走。touch-action 只挡住手势解析，overscroll 才是兜底。 */
  overscroll-behavior:none;
}
/* 摇杆捕获层：在画布之上、HUD 之下 */
body.touch #tc-zone{
  position:absolute; inset:0; pointer-events:auto; touch-action:none; display:none;
}
body.touch.tc-play #tc-zone{ display:block; }

/* 按钮与摇杆外观层：默认不吃事件，只有按钮自己吃 */
body.touch #tc-ui{ position:absolute; inset:0; pointer-events:none; display:none; }
body.touch.tc-play #tc-ui{ display:block; }

/* 摇杆底盘。**这里不写 width/height/margin** —— 尺寸与坐标全部由 touch.js 按像素设置：
   一旦"画出来的位置"和"算输入用的圆心"分成两个来源（CSS 的 vmin 与 JS 的 px），
   两者就可能不一致，而表现就是真机上"圆盘是歪的"。只留一个来源。
   常驻可见（低不透明度）：固定摇杆必须让玩家看得见圆盘在哪，否则不知道该把拇指放哪。 */
body.touch .tc-stick{
  position:absolute; border-radius:50%; box-sizing:border-box;
  border-style:solid; border-color:rgba(150,200,225,.34); background:rgba(10,20,28,.24);
  pointer-events:none; opacity:.34; transition:opacity .12s linear;
}
body.touch .tc-stick.on{ opacity:1; border-color:rgba(205,240,255,.62); background:rgba(14,30,42,.32); }
body.touch .tc-stick>i{
  position:absolute; left:50%; top:50%; border-radius:50%; box-sizing:border-box;
  border-style:solid; background:rgba(120,205,235,.50); border-color:rgba(205,240,255,.78);
}

body.touch .tc-btn{
  position:absolute; transform:translate(-50%,-50%); border-radius:50%; box-sizing:border-box;
  display:flex; align-items:center; justify-content:center;
  pointer-events:auto; touch-action:none; cursor:pointer;
  border:.26vmin solid rgba(150,205,230,.42); background:rgba(8,18,26,.52);
  color:#dff2f8; font-family:inherit; font-weight:600;
  letter-spacing:.02em; text-shadow:0 1px 0 rgba(0,0,0,.9);
  -webkit-user-select:none; user-select:none; -webkit-tap-highlight-color:transparent;
  transition:background .08s linear, border-color .08s linear, transform .08s linear;
}
body.touch .tc-btn.press{
  background:rgba(40,100,125,.86); border-color:#5fe0ff; transform:translate(-50%,-50%) scale(.94);
}
body.touch .tc-btn.wide{ border-radius:999px; width:auto; padding:0 1.4vmin; }
/* 常驻提示：靠近可交互物时高亮 E，玩家不用猜什么时候能按 */
body.touch .tc-btn.hot{ border-color:#ffd24a; color:#ffd24a; box-shadow:0 0 2.4vmin rgba(255,210,74,.5); }

/* 触摸模式**不画点状准星**。键鼠需要它是因为光标本身就是准星；双摇杆下
   强制把它画在"固定距离的圆周"上只会显得僵硬（真机反馈"瞄准很僵硬"），
   而且屏幕上那个点根本不能表达"我瞄多远"。朝向由角色自身转动表达。
   必须 !important：hud.js 会用内联 display 控制它，内联样式优先级高于普通规则。 */
body.touch #reticle{ display:none !important; }

/* 交互提示抬高一点：底部中间现在有按钮 */
body.touch #interact{ bottom:27vmin; }
/* 触摸模式下 HUD 基础字号整体放大一档：平板视距比显示器远 */
body.touch #ui{ font-size:clamp(13px,1.45vmin,22px); }

/* =====================================================================
   矮视口（手机横屏）紧凑档 —— 同一个包装到手机上也要能玩
   =====================================================================
   6.67" 手机横屏的 CSS 视口只有约 904x406（物理 2712x1220 / DPR 3）。
   HUD 的字号是 clamp(13px,1.45vmin,22px)：vmin=406 时算出来只有 5.9px，
   会被 13px 的**下限**顶住 —— 字号没跟着缩，相对高度就成了平板的两倍多。

   更要命的是折行。.rv-chip 是 flex + max-width:38vmin，而 38vmin 在手机上
   只有 154px，装不下「本局复苏 · 不可用」+「本局未开启（标准难度 · 出征前可设置）」，
   于是 flex 把后一句压成 **28px 宽**（中文一字约 10px → 每行两个字），排了十几行，
   120px 高 —— 一处折行就把左上状态栏从屏高的 16% 撑到 68%，直接把左轮盘压住。
   （.rv-chip b 写了 nowrap、.rv-chip span 漏了，平板上 406px 够宽所以从没暴露。）

   所以这里做三件事：字号降一档、**不许把一句话挤成竖排**、缩掉装饰性元素。
   整块只在 body.tc-compact 下生效（阈值唯一来源 = TC_LAYOUT.compact.maxHeight，
   由 touch.js 判定后加类），平板与 PC 完全不受影响。 */
body.touch.tc-compact #ui{ font-size:clamp(10px,2.6vmin,22px); }

/* 长句一律不折行。手机横屏横向很富裕，宁可整条不换行，
   也不能让它被 flex 压缩成一列（那正是左上栏被撑到 68% 屏高的原因）。 */
body.touch.tc-compact .rv-chip{ max-width:72vw; }
body.touch.tc-compact .rv-chip b, body.touch.tc-compact .rv-chip span{ white-space:nowrap; }
body.touch.tc-compact #status-row{ max-width:none; }
body.touch.tc-compact #hearts{ max-width:52vw; }

/* 小地图缩小：手机上它只用来"大概看看"，占满 20vmin 太奢侈；
   而且它的下沿决定右列按钮能摆多高。
   11vmin（原来 13）是为了把右上角腾出来给暂停键（见下面的 #hud-tr）。 */
body.touch.tc-compact #minimap{ width:11vmin; height:11vmin; }
body.touch.tc-compact #minimap-wrap.big #minimap{ width:40vmin; height:40vmin; }

/* 右上角交付给暂停键：整块 #hud-tr（楼层名 + 小地图）向右内缩 13vmin。
   #hud-tr 是 right 定位 + width:auto，加 padding-right 只会把**内容**往左推，
   右边界不动 —— 于是"楼层名右端 / 小地图右端"从 899 退到约 846，
   x∈[846,899] 这一列空出来正好放 30px 的暂停键。 */
body.touch.tc-compact #hud-tr{ padding-right:13vmin; }

/* 装饰 / 冗余：英文副标题手机上没必要占一行 */
body.touch.tc-compact #floor-sub{ display:none; }

/* 大厅底部快捷条上移，避开底部的触摸键行（E / 换枪 / 换弹 在 y=88%）。
   原来 bottom:10vmin 时它的下沿正好压在键行上，玩家会以为"是这串字挡住了按钮"。 */
body.touch.tc-compact #hub-shortcuts{ bottom:24vmin; }
/* "开发模式：关闭"这行状态字不常驻（真机反馈：那串文本和按钮有遮挡）。
   想确认状态可以点「开发模式」按钮进去看，功能没有丢。 */
body.touch.tc-compact #developer-status{ display:none; }

/* 面板最小宽度是 em，字号降了会跟着窄，这里再收一点 */
body.touch.tc-compact .wslot{ min-width:11em; }
body.touch.tc-compact #skill{ min-width:9em; }
/* #hud-br 的高度直接决定右轮盘能不能让开 —— 战斗提示那行在手机上省掉 */
body.touch.tc-compact #skill .sd{ display:none; }

/* =====================================================================
   点击可达性 —— 真机上"按钮按不动"的根因
   =====================================================================
   真机反馈：手机上 E / 换枪 / 换弹 三个键完全没反应，连第一关都开不了
   （大厅里必须按 E 用出征台）；同一排的其它键正常。平板上同样的布局却没事。

   实测（904x406，大厅态，逐个按钮取 document.elementFromPoint）：
     interact(E) 顶层 = #save-tools 里的 div.row
     swap(换枪)  顶层 = #save-tools 里的 button#btn-import-save
     reload(换弹) 顶层 = #save-tools 里的 div.row
   原因：#save-tools 在 DOM 里排在 #tc-ui **之后**，于是画在按钮之上；
   它 declared 了 pointer-events:auto 且 width:min(700px,94vw) 居中、bottom:1vmin，
   手机视口矮，这一条正好盖住 y=88% 那一行键。平板视口高（键行离底 107px）所以没暴露。

   规矩：**"文字 + 按钮"的容器只负责排版，不能自己吃事件**；只有真正的按钮吃。
   这样以后再加任何常驻文本条，都不会静默把某个触摸键吞掉。
   （这一条只写在触摸样式表里，PC 路径一个字节都不变。） */
body.touch #save-tools, body.touch #hub-shortcuts{ pointer-events:none; }
body.touch #save-tools button, body.touch #save-tools input,
body.touch #hub-shortcuts button{ pointer-events:auto; }

/* 大厅里整条存档工具直接不显示：它在标题界面同样可用，而在大厅它只会压住键行。
   必须 !important —— 让它显示的规则写在 index.html 里，且用了 :has()：
   #ui:has(#hud.hub:not(.hidden)) #save-tools{display:block}。
   那个选择器的 id 计数比这里高，不加 !important 压不住（实测：pointer-events 生效了、
   元素却仍然显示，键行照样被视觉覆盖）。 */
body.touch.tc-compact #hud.hub ~ #save-tools{ display:none !important; }

/* 面板在小屏上必须能滚。touch-action **不是继承属性**，但浏览器判定"这一拖能不能滚动"
   时会沿祖先链取交集，而 #ui 上写了 touch-action:none —— 结果是面板里的上下滑动
   被整条链否掉，手机上设置面板只能看到第一屏。这里把可滚动的那几个容器放开。 */
body.touch #hub-panel, body.touch .hub-panel,
body.touch #choice-panel, body.touch .choice-box,
body.touch #screen-build{ touch-action:pan-y; }

/* 小地图在触摸下可点：点一下＝按 M（切换全图 / 局部）。
   它是 HUD 里唯一"点了有用但长得不像按钮"的元素，桌面靠键盘 M，触摸没有 M。 */
body.touch #minimap-wrap{ pointer-events:auto; cursor:pointer; }

/* =====================================================================
   键位编辑模式（body.tc-edit）
   =====================================================================
   编辑期间游戏是**暂停**的，但触摸层必须可见 —— 所以 tc-play 由 touch.js 在
   编辑模式下强制加上（不是靠这里的 CSS 再写一条显示规则，避免两个来源）。
   这里只负责"可拖"的观感：按键与摇杆从 pointer-events:none 变成可抓，
   并给出明确的"可拖动"外观。 */
body.touch.tc-edit .tc-btn, body.touch.tc-edit .tc-stick{ pointer-events:auto; cursor:move; }
body.touch.tc-edit .tc-btn{ border-color:#ffd24a; border-width:.4vmin; }
body.touch.tc-edit .tc-stick{ opacity:.55; border-style:dashed; }
body.touch.tc-edit .tc-btn.drag, body.touch.tc-edit .tc-stick.drag{
  border-color:#5fe0ff; box-shadow:0 0 3vmin rgba(95,224,255,.55);
}
/* 编辑条：挂在 #tc-ui 里（于是永远在按键之上、全屏界面之下），
   容器本身不吃事件，只有条子吃 —— 与 #save-tools 那条规矩一致。 */
body.touch .tc-editbar{
  position:absolute; left:50%; bottom:1.2vmin; transform:translateX(-50%);
  display:none; align-items:center; gap:.8em; z-index:5;
  pointer-events:none; padding:.5em .9em; border-radius:999px;
  background:rgba(6,12,18,.92); border:1px solid rgba(255,210,74,.5);
  font-size:clamp(10px,1.5vmin,15px); white-space:nowrap;
}
body.touch.tc-edit .tc-editbar{ display:flex; }
body.touch .tc-editbar button{ pointer-events:auto; }
body.touch .tc-editbar .tc-hint{ color:#ffd24a; }
`;

let mounted = false;

// 建 DOM 并挂载。返回 TouchLayer 需要的节点句柄。
export function buildTouchDom() {
  if (mounted) return null;
  mounted = true;
  const ui = document.getElementById('ui');
  if (!ui) return null;

  const style = document.createElement('style');
  style.id = 'tc-style';
  style.textContent = TC_CSS;
  document.head.appendChild(style);

  const zone = document.createElement('div');
  zone.id = 'tc-zone';
  ui.insertBefore(zone, ui.firstChild);

  const layer = document.createElement('div');
  layer.id = 'tc-ui';
  // 插到所有全屏界面之前 → 界面（标题/暂停/结算）永远盖在按钮之上
  const anchor = document.getElementById('screen-loading');
  if (anchor) ui.insertBefore(layer, anchor); else ui.appendChild(layer);

  const sticks = {};
  for (const side of ['l', 'r']) {
    const el = document.createElement('div');
    el.className = 'tc-stick';
    const knob = document.createElement('i');
    el.appendChild(knob);
    layer.appendChild(el);
    // 位置与尺寸由 TouchLayer._layoutSticks() 统一按像素写（唯一来源）
    sticks[side] = { el, knob };
  }

  const buttons = [];
  for (const spec of TC_LAYOUT.buttons) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tc-btn';
    b.dataset.act = spec.act;
    b.textContent = spec.label;
    layer.appendChild(b);
    buttons.push(b);
  }

  // 键位编辑条。放在按钮之后 → 画在按钮之上（但仍在全屏界面之下）。
  const editbar = document.createElement('div');
  editbar.className = 'tc-editbar';
  editbar.innerHTML = '<span class="tc-hint">拖动按键 / 摇杆到顺手的位置</span>';
  for (const [id, label] of [['done', '完成'], ['cancel', '取消'], ['reset', '恢复默认']]) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn small';
    b.id = 'tc-edit-' + id;
    b.textContent = label;
    editbar.appendChild(b);
  }
  layer.appendChild(editbar);

  // 尺寸与坐标统一由 applyButtonLayout 写；建完先按当前视口摆一次，
  // 之后 TouchLayer._layoutSticks() 会在 resize 时重摆。
  applyButtonLayout(buttons, resolveLayout(window.innerWidth, window.innerHeight));

  // 平板用 iOS/Android 的视口裁剪才能拿到安全区，否则刘海/手势条会压住控件。
  // 直接在此处补 viewport-fit=cover，避免去动 index.html。
  const vp = document.querySelector('meta[name=viewport]');
  if (vp && !/viewport-fit/.test(vp.content)) vp.content += ',viewport-fit=cover';

  return { zone, layer, sticks, buttons, editbar };
}

// 供探针/调试使用
export function resetTouchDomFlag() { mounted = false; }
