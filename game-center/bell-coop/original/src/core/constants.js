// ============================================================
//  全局常量 —— 世界尺度 / 渲染尺度 / 平衡参数
// ============================================================

export const TILE = 2;              // 单个地格的世界尺寸
export const ROOM_TILES = 13;       // 1x1 房间的内部地格数（奇数保证中心对称）
export const ROOM_GAP = 12;         // 相邻房间外墙之间的距离（走廊长度）
export const CELL = ROOM_TILES * TILE + ROOM_GAP;  // 38：房间格间距
export const WALL_T = 1.6;          // 墙厚
export const WALL_H = 5.2;          // 墙高
export const DOOR_W = 6;            // 门洞宽度

export const ROOM_TYPE = {
  START: 'start',
  BATTLE: 'battle',
  TREASURE: 'treasure',
  SHOP: 'shop',
  SPECIAL: 'special',
  HIDDEN: 'hidden',
  VAULT: 'vault',      // 风险支线：精英房 + 高额奖励，可选
  EXIT: 'exit',
  BOSS: 'boss',
};

// 楼层序列（主楼层）
export const FLOOR_ORDER = [1, 2, 3];

export const FLOOR_THEME = {
  1: {
    name: '沉钟回廊',
    sub: 'THE SUNKEN KEEP',
    fog: 0x14212c,
    fogDensity: 0.0085,
    ambient: 0x53809f,
    ambientIntensity: 1.02,
    hemiSky: 0x6f9cc4,
    hemiGround: 0x2a3c4a,
    hemiIntensity: 0.92,
    sunColor: 0xc4e4ff,
    sunIntensity: 1.55,
    torch: 0x74e0ff,
    torchIntensity: 5.5,
    accent: '#5fe0ff',
    tint: [1.00, 1.02, 1.05],
    bloomThreshold: 0.90,
    music: 'keep',
    desc: '沉没的钟塔回廊，冷雾与湿石。',
  },
  2: {
    name: '熔核深渊',
    sub: 'THE EMBER ABYSS',
    fog: 0x2a1210,
    fogDensity: 0.0105,
    ambient: 0x9a6242,
    ambientIntensity: 1.10,
    hemiSky: 0xa86e4e,
    hemiGround: 0x3a1610,
    hemiIntensity: 0.98,
    sunColor: 0xffc48e,
    sunIntensity: 1.55,
    torch: 0xff7a2e,
    torchIntensity: 6.4,
    accent: '#ff8a3c',
    tint: [1.06, 1.00, 0.95],
    bloomThreshold: 0.84,
    music: 'abyss',
    desc: '熔铁与煤渣的深渊，热风从裂口涌出。',
  },
  // 第三层：熔心王座（PASS3 §4 修订）
  //
  // 修订原因（有截图与色值依据）：旧配色 accent #ffab4a 与第二层 #ff8a3c
  // 色相仅差约 8°、地板同属棕系，**目视几乎无法与第二层区分** ——
  // 正是任务书明令禁止的"第二层加亮版"。
  // 新方向：**冷石底座 + 青铜金高光 + 强方向感**。
  // 色相被推到"冷灰蓝 ↔ 青铜金"的两端，与第二层"通体熔橙"形成截然不同的画面结构：
  //  · 环境光转冷、压暗（黑曜石在暖光下会变成棕色，必须先把环境光去色）
  //  · 主色改青铜金 #d8a03c（降饱和、偏黄绿），与炉橙拉开
  //  · 火把从"炉火橙"改为"金铜色"，强度下调（王座是照明，不是熔炉）
  3: {
    name: '熔心王座',
    sub: 'THE MOLTEN THRONE',
    fog: 0x1a1d26,
    fogDensity: 0.0112,
    ambient: 0x6e7486,
    ambientIntensity: 1.16,      // 0.90 → 1.16（第一版到 1.34 会超过第二层的亮度）
    hemiSky: 0x9aa2b8,
    hemiGround: 0x24242c,
    hemiIntensity: 0.94,         // 0.78 → 0.94
    sunColor: 0xf0d8a8,
    sunIntensity: 1.48,          // 1.38 → 1.48
    torch: 0xd8a03c,
    torchIntensity: 6.2,
    accent: '#d8a03c',
    tint: [1.02, 1.00, 1.04],
    bloomThreshold: 0.86,
    music: 'throne',
    desc: '地牢最深处，总督的青铜王座正在熔化。',
  },
};

export const PLAYER = {
  radius: 0.62,
  speed: 8.6,
  accel: 78,
  friction: 13,
  maxHp: 6,
  dashSpeed: 26,
  dashTime: 0.19,
  dashCooldown: 0.95,
  iframes: 0.55,
  pickupRange: 2.4,
  dashBuffer: 0.12,     // 冲刺输入缓冲窗口（秒）—— 极短且受控，绝不排队
};

export const BULLET = {
  max: 900,
  radius: 0.28,
  enemyRadius: 0.3,
  life: 4.2,
};

// ------------------------------------------------------------
//  低分辨率渲染：目标 = "清晰的低分辨率"，不是"模糊的低画质"
//  内部渲染高度提高到 288p，配合 nearest 放大 + 材质像素化
//  保留 NDS 质感（色阶量化 + 轻抖动 + 轻扫描线），但削弱会损害可读性的项
// ------------------------------------------------------------
export const RENDER = {
  internalHeight: 288,      // 内部渲染高度（像素）
  minWidth: 288,
  maxWidth: 640,
  exposure: 1.95,
  bloom: 0.44,              // 原 0.72：过强 bloom 会糊掉小目标
  levels: 26,               // 色阶量化（复古）
  dither: 0.26,             // 有序抖动强度（原 0.55 过脏）
  vignette: 0.18,           // 原 0.26 过暗
  chroma: 0.0011,           // 色差（原 0.0022 边缘发虚）
  scanline: 0.055,          // 扫描线（原 0.10 过密）
  saturation: 1.10,
  contrast: 1.07,           // 轻对比提升，帮助剪影分离
};

export const LAYER = {
  GROUND: 0,     // 地板
  PROP: 1,       // 场景物件
  ENTITY: 2,     // 角色
  BULLET: 3,     // 弹丸
  FX: 4,         // 特效
};

export const TEAM = { PLAYER: 0, ENEMY: 1, NEUTRAL: 2 };

export const MAX_WEAPON_SLOTS = 2;

// ============================================================
//  难度档（PASS2 §1.6 / §32）
//
//  任务书要求"标准模式平衡稳定之后再接" —— 所以这里只**建通道、不调标准数值**：
//  `standard` 的三项倍率全部是 1.0，与今日行为逐位相同（有断言保证）。
//  休闲与挑战是在同一层上做乘算，将来要微调只改这张表，不必碰玩法代码。
//
//  实现方式挂在既有词条修饰器（g.mod_）之后，因此：
//   · 与词条可叠加（词条是"改变规则"，难度是"改变强度"，层次不混）
//   · 不需要在敌人/掉落/商店里各插一遍判断
//
//  只影响三类东西，**不改变任何内容的形状**（不换编成、不改弹幕结构）：
//  敌人生命、敌弹伤害、掉落与金币。
// ============================================================
export const DIFFICULTY = {
  casual: { cn: '休闲', desc: '敌人更脆、伤害更低、掉落略多。适合熟悉机制与内容。', enemyHpMul: 0.85, enemyDmgMul: 0.75, dropMul: 1.15, soulMul: 0.8 },
  standard: { cn: '标准', desc: '标准强度，所有倍率为 1.0。', enemyHpMul: 1.0, enemyDmgMul: 1.0, dropMul: 1.0, soulMul: 1.0 },
  challenge: { cn: '挑战', desc: '敌人更硬、伤害更高、掉落略少。为标准玩法熟练者准备。', enemyHpMul: 1.15, enemyDmgMul: 1.25, dropMul: 0.9, soulMul: 1.2 },
};
export const DIFFICULTY_IDS = ['casual', 'standard', 'challenge'];
export const DEFAULT_DIFFICULTY = 'standard';
