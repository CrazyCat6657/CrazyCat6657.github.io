// ============================================================
//  屏幕平面血条层（用户第二轮反馈）
//
//  用户原话："血条不要继承 3D 效果。就一条直线加边框然后固定在怪物头顶平面显示，
//  不要跟着怪物旋转。"
//
//  为什么不能靠 3D 平面解决：我们本来就把平面转向了相机（没有跟着怪物转），
//  但**透视投影**会把离屏中心稍远的四边形压成梯形 —— 看起来就是"斜的、有 3D 感"。
//  这不是朝向问题，是投影本身带来的，改材质/改朝向都解决不了。
//
//  正解：把"怪物头顶"投影成**屏幕像素坐标**，用 DOM 画一条水平的线。
//  好处：永远水平、边框恒为 1px（与内部 288p 渲染无关）、不受透视影响、
//  也不需要每帧同步四元数。
//
//  开销：只在**精英**身上用（通常同屏 0–3 只），每帧几次 style 写入。
// ============================================================

export class WorldBars {
  constructor(rootId = 'worldbars') {
    this.root = typeof document !== 'undefined' ? document.getElementById(rootId) : null;
    this.items = new Map();   // key -> { el, fill, stamp }
    this.stamp = 0;
  }

  get ready() { return !!this.root; }

  /** 每帧开始：给所有条目打上"本帧未出现"的标记 */
  begin() { this.stamp++; }

  /**
   * 显示 / 更新一条血条。
   * @param {*} key    稳定标识（直接用敌人对象）
   * @param {number} sx 屏幕 x（像素）
   * @param {number} sy 屏幕 y（像素，血条底边贴着这里）
   * @param {number} ratio 0..1
   * @param {boolean} dim 是否压低亮度（例如无敌/受保护状态）
   */
  show(key, sx, sy, ratio, dim) {
    if (!this.root) return;
    let it = this.items.get(key);
    if (!it) {
      const el = document.createElement('div');
      el.className = 'ebar';
      const fill = document.createElement('i');
      el.appendChild(fill);
      this.root.appendChild(el);
      it = { el, fill, stamp: 0 };
      this.items.set(key, it);
    }
    it.stamp = this.stamp;
    // 用 transform 定位（不触发 layout），并整体抬到锚点上方
    it.el.style.transform = `translate(-50%, -100%) translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px)`;
    it.el.style.display = 'block';
    const r = ratio <= 0 ? 0 : ratio >= 1 ? 1 : ratio;
    it.fill.style.width = (r * 100).toFixed(1) + '%';
    const cls = dim ? 'ebar dim' : 'ebar';
    if (it.el.className !== cls) it.el.className = cls;
  }

  /** 每帧结束：回收本帧没出现的条目（敌人死亡 / 换房 / 离开视野） */
  end() {
    for (const [key, it] of this.items) {
      if (it.stamp === this.stamp) continue;
      it.el.remove();
      this.items.delete(key);
    }
  }

  /** 整层隐藏（暂停 / 面板 / 非游玩状态），不销毁 DOM */
  setVisible(on) {
    if (!this.root) return;
    this.root.classList.toggle('hidden', !on);
  }

  /** 彻底清空（换房 / 回大厅 / 新局） */
  clear() {
    for (const [, it] of this.items) it.el.remove();
    this.items.clear();
  }
}
