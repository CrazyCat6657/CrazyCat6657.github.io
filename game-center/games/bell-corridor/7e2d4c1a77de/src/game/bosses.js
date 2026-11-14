// ============================================================
//  首领身份表：经典三位与按章编排的远征九位共用同一创建/恢复入口。
//
//  身份与实体严格分离（PASS1 已定下的约定，本轮继续遵守）：
//   · 实体始终保持 `id === 'boss'`（弹丸 owner / 命中判定 / 存档主键都靠它）
//   · 身份使用 `bossType`，取值只能来自 BOSS_DEFS 的 id
//   · Codex / 陈列 / 奖励 / 结算 / 练习 / 存档一律消费同一份 BOSS_DEFS
//
//  第三层的首领由 **Run Seed 决定**：同一局内稳定，不同 Seed 会轮换，
//  而已经存在的存档在恢复时会沿用自己保存的 bossType（不会被换掉）。
// ============================================================
import { Boss } from './boss.js';
import { BellBeast } from './boss_beast.js';
import { SilentHierophant } from './boss_priest.js';
import { ChainHunter, IronDrummer, MirrorCantor, GraveShepherd, SlagCrab, StormArchon } from './boss_variants.js';
import { chapterBossEnabled, attachBossChapterActions } from './boss_chapter_actions.js';

export const BOSS_DEFS = [
  {
    id: 'ember_warden', cn: '熔核总督', en: 'THE EMBER WARDEN', tag: '王庭遗民',
    cls: Boss, key: '压制 / 炉火 / 权力',
    hint: '环形弹幕与激光轮番袭来，熔岩不断封住退路。战斗越久，攻势越猛烈。',
  },
  {
    id: 'bell_beast', cn: '缚钟兽', en: 'THE BELL BEAST', tag: '钟炉异兽',
    cls: BellBeast, key: '追猎 / 空间 / 解放',
    hint: '锁链会在冲撞时将它拽住。等锁链断开，它便会紧追不放。',
  },
  {
    id: 'silent_hierophant', cn: '哑钟主祭', en: 'THE SILENT HIEROPHANT', tag: '王庭遗民',
    cls: SilentHierophant, key: '仪式 / 声音 / 控场',
    hint: '钟波之后还有迟来的钟击。四周陷入寂静时，留意脚下的波纹与灯光。',
  },
  { id: 'chain_hunter', cn: '断链猎王', en: 'THE CHAIN HUNTER', tag: '钟炉异兽', cls: ChainHunter,
    key: '突进 / 侧追 / 猎群', hint: '长条落点预告它的突进。绕开正面，留意从远处赶来的猎群。' },
  { id: 'iron_drummer', cn: '铁鼓卫长', en: 'THE IRON DRUMMER', tag: '钟炉军团', cls: IronDrummer,
    key: '鼓击 / 十字弹 / 卫队', hint: '鼓点会依次敲落地面。十字弹之间留有空隙，护卫出现前会有青色圆环。' },
  { id: 'mirror_cantor', cn: '裂镜咏者', en: 'THE MIRROR CANTOR', tag: '王庭遗民', cls: MirrorCantor,
    key: '折跃 / 镜阵 / 夹击', hint: '三面镜子同时瞄准，折跃后会在原处留下延迟爆发。' },
  { id: 'grave_shepherd', cn: '墓灯牧者', en: 'THE GRAVE SHEPHERD', tag: '灰烬教团', cls: GraveShepherd,
    key: '横列 / 旋弹 / 驱群', hint: '墓灯横排依次爆发。牧者会边退边招来猎群，再以旋转弹幕向前推进。' },
  { id: 'slag_crab', cn: '熔渣巨钳', en: 'THE SLAG CRAB', tag: '熔炉异兽', cls: SlagCrab,
    key: '横移 / 双钳 / 熔渣', hint: '双钳从两侧扫射，横移时留下的熔渣会延迟爆发。' },
  { id: 'storm_archon', cn: '风暴执政官', en: 'THE STORM ARCHON', tag: '王庭遗民', cls: StormArchon,
    key: '环行 / 风轮 / 雷阵', hint: '风轮弹幕交错旋转，雷阵沿斜线留出通路。' },
];

export const BOSS_MAP = Object.fromEntries(BOSS_DEFS.map((b) => [b.id, b]));
export const BOSS_IDS = BOSS_DEFS.map((b) => b.id);
export const BOSS_CLASSES = BOSS_DEFS.map((b) => b.cls);
export const DEFAULT_BOSS_TYPE = 'ember_warden';
export const CLASSIC_BOSS_IDS = ['ember_warden', 'bell_beast', 'silent_hierophant'];
export const CHAPTER_BOSS_POOLS = Object.freeze({
  1: Object.freeze(['bell_beast', 'chain_hunter', 'iron_drummer']),
  2: Object.freeze(['silent_hierophant', 'mirror_cantor', 'grave_shepherd']),
  3: Object.freeze(['ember_warden', 'slag_crab', 'storm_archon']),
});

export function isBossType(id) { return Object.hasOwn(BOSS_MAP, id); }
export function bossDef(id) { return BOSS_MAP[id] || BOSS_MAP[DEFAULT_BOSS_TYPE]; }

// Seed → 首领身份。纯函数：同一 Seed 永远同一首领。
// 用两个互质的乘法混入 floor，避免相邻 Seed 落在一起时总是同一个。
export function bossTypeFor(seed, floor = 3) {
  const s = ((seed >>> 0) ^ Math.imul(floor, 0x9e3779b1)) >>> 0;
  return CLASSIC_BOSS_IDS[s % CLASSIC_BOSS_IDS.length];
}

export function chapterBossTypeFor(seed, chapter) {
  const pool = CHAPTER_BOSS_POOLS[chapter];
  if (!pool) throw new RangeError('首领章节必须为 1、2 或 3');
  const s = ((seed >>> 0) ^ Math.imul(chapter, 0x85ebca6b)) >>> 0;
  return pool[s % pool.length];
}

// 恢复时的身份解析（continueRun 专用）。
// **显式身份优先**；缺失 = 旧档（那时只有熔核总督）→ 回落到默认，
// 绝不按新 Seed 重掷：否则同一个存档在不同版本里会遇到不同的 Boss。
export function resumeBossType(savedType) {
  return Object.hasOwn(BOSS_MAP, savedType) ? savedType : DEFAULT_BOSS_TYPE;
}

// 创建实体（恢复存档也必须走这里，否则读档后会变成另一个 Boss 的行为）
export function createBoss(game, x, z, bossType) {
  const def = bossDef(bossType);
  const b = new def.cls(game, x, z);
  b.bossType = def.id;         // 兜底：即使子类忘了设置，身份也一定正确
  b.cn = def.cn;
  if (b.variantState || chapterBossEnabled(game)) attachBossChapterActions(b);
  return b;
}
