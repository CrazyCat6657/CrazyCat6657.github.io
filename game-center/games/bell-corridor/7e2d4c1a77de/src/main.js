import {PAGE_COMBAT_MODE} from './experimental/combat/mode.js';
import {installCombatPage} from './experimental/combat/page.js';
import {installConsumablesPage} from './experimental/consumables/page.js';
import {installComparisonPage} from './experimental/comparison/page.js';
// ============================================================
//  入口 —— 启动、加载、全局按键
// ============================================================
import { Game } from './game/game.js';
import {mountCopyReview} from './ui/copy_review.js';
import { TEAM } from './core/constants.js';
import { meta } from './game/meta.js';
import { heroById, deadeyeShotCost } from './game/heroes.js';
import { ATTACHMENTS } from './game/attachments.js';
import { CACHE as ASSET_CACHE } from './art/materials.js';
import { CODEX_KINDS } from './game/codex.js';
import { BOSS_DEFS, resumeBossType, bossTypeFor } from './game/bosses.js';
import { captureSession, validateSession } from './game/session.js';
import { buildPlayer } from './art/models.js';
import { EVOLUTIONS } from './game/companion.js';
import { TRAINING } from './game/hub.js';
import { Input } from './core/input.js';
import { handleControlShortcut,handlePauseAction } from './core/control_actions.js';
import {TouchLayer,shouldUseTouch} from './core/touch.js';
import {installNativeShell,isNative} from './core/native.js';
import {preferences} from './game/preferences.js';
import { audio } from './core/audio.js';
import { getTexture } from './art/materials.js';
import { RNG } from './core/rng.js';
import { VERSION_LABEL } from './core/version.js';
import { installWeaponLab } from './weapon_lab_bridge.js';
import { preloadChestAsset } from './art/chest_asset.js';
import { preloadPropAssets } from './art/prop_assets.js';
import { preloadGunAssets } from './art/gun_assets.js';
import { preloadActorAssets } from './art/actor_assets.js';

const canvas = document.getElementById('game');
// 版本角标只有一个来源（core/version.js）。放在这里同步写入，file:// 打不开时也能看到真实版本。
const versionEl = document.getElementById('build-version');
if (versionEl) versionEl.textContent = VERSION_LABEL;
const bar = document.querySelector('#load-bar i');
const loadText = document.getElementById('load-text');
const raf = (n = 1) => new Promise((r) => { let i = 0; const f = () => (++i >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); });
const setProgress = (p, t) => { if (bar) bar.style.width = p + '%'; if (t && loadText) loadText.textContent = t; };

let game = null;

// file:// 直开时模块会被浏览器安全策略拦截，此处给出**明确的正确启动方式**，
// 而不是让玩家永远停留在"正在生成地牢"。
if (location.protocol === 'file:') {
  const fail = document.getElementById('boot-fail');
  const loading = document.getElementById('screen-loading');
  if (loading) loading.classList.add('hidden');
  if (fail) fail.classList.remove('hidden');
  const e = document.getElementById('boot-fail-err');
  if (e) e.textContent = '当前地址：' + location.href;
  window.__booted = true;
}

async function boot() {
  window.__bootStarted = true;
  setProgress(8, '正在初始化引擎…');
  await raf(3);

  await Promise.all([preloadChestAsset(),preloadPropAssets(),preloadGunAssets(),preloadActorAssets()]);

  game = new Game(canvas);
  game.input = new Input(canvas, {profile:PAGE_COMBAT_MODE});
  if(shouldUseTouch(location.search,{native:isNative()})){
    game.touch=new TouchLayer(game,{input:game.input,prefs:preferences.get(),onPause:()=>handlePauseAction(game),onBuild:()=>game.setBuild()});
    window.__touch=game.touch;
  }
  installNativeShell({onBack:()=>handlePauseAction(game)}).catch(()=>{});
  window.__PREFS=preferences;
  installCombatPage(game);
  installConsumablesPage(game);
  installComparisonPage(game);
  window.__game = game;
  if(new URLSearchParams(location.search).get('copyReview')==='1')await mountCopyReview(game);
  if(new URLSearchParams(location.search).get('weaponLab')==='1')installWeaponLab(game);
  // 验收探针用的语义入口（测试不再直接摸内部字段）
  window.__META = meta;
  window.__HERO = (id) => heroById(id);
  window.__TEAM = TEAM;
  window.__TRAINING = TRAINING;   // 训练区靶位表（断言用它推导数量，避免硬编码过期）
  window.__BUILD_PLAYER = buildPlayer;   // 剪影核对工具需要直接建模型（§55）
  window.__EVOS = EVOLUTIONS;    // 宠物进化池（§52 确定性测试）
  window.__ATTS = ATTACHMENTS;   // 探针需要配件池做 Seed 确定性测试（§52）
  window.__CODEX_KINDS = CODEX_KINDS;   // 图鉴分类表（探针核对"图鉴身份 vs 可玩身份"）
  window.__BOSS_DEFS = BOSS_DEFS;       // Boss Pool 唯一身份表（PASS2 §20）
  // 存档层工具（探针校验"旧档缺少新字段时是否仍被接受"这类纯规则）
  window.__SESSION = { captureSession, validateSession };
  window.__RESUME_BOSS_TYPE = resumeBossType;   // 旧档身份解析规则（可被探针直接断言）
  window.__BOSS_TYPE_FOR = bossTypeFor;         // Seed → 首领身份（PASS2 §24 产品规则）
  window.__DEADEYE_COST = deadeyeShotCost;
  // 性能审查（PASS3 §54）只读入口：几何 / 材质 / 贴图缓存的规模
  window.__CACHE = ASSET_CACHE;      // 几何/材质/贴图缓存规模（PASS3 §54 性能审查只读入口）

  setProgress(42, '正在烘焙像素贴图…');
  await raf(3);
  const rng = new RNG(1337);
  for (const n of ['floor_stone', 'floor_moss', 'floor_basalt', 'floor_obsidian', 'floor_ritual', 'floor_metal',
    'floor_throne', 'wall_brick', 'wall_carved', 'wall_abyss', 'wall_abyss_carved',
    'wall_throne', 'wall_throne_carved', 'wood', 'metal_plate', 'banner', 'banner_abyss']) {
    try { getTexture(n, rng); } catch (e) { /* 忽略单张贴图失败 */ }
  }

  setProgress(70, '正在加载武器与敌人图鉴…');
  await raf(4);

  setProgress(90, '正在准备地牢生成器…');
  await raf(3);

  setProgress(100, '就绪');
  await raf(6);

  game.onResize();
  game.applyDisplayPreferences(preferences.get());
  game.clock.start();
  requestAnimationFrame(game.loop);
  game.toTitle();
  document.getElementById('boot-fail')?.classList.add('hidden');
  window.__booted = true;
}

// ---------------- 全局按键 ----------------
window.addEventListener('keydown', (e) => {
  audio.resume();
  handleControlShortcut(game, e);
}, { passive: false });

window.addEventListener('mousedown', () => audio.resume(), { once: false });
window.addEventListener('pointerdown', () => audio.resume(), { once: false });

// 切到后台时自动暂停（仅真正隐藏页面时）
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && game && !game._textReviewFrozen && game.state === 'play' && !game.paused) {
    if (game.buildOpen) game.setBuild(false);
    game.setPaused(true);
  }
});

if (location.protocol !== 'file:') {
  boot().catch((err) => {
    console.error(err);
    if (loadText) {
      loadText.textContent = '启动失败：' + (err && err.message ? err.message : err);
      loadText.style.color = '#ff6a6a';
    }
    if (window.__bootFail) window.__bootFail((err && err.stack) || String(err));
  });
}
