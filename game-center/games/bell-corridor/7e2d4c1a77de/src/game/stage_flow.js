// Task7/8 —— 章节/段流程的**纯模型**。
// 本文件只做"这是哪一段、该不该结束、种子从哪里来"这三个事实，不依赖 DOM / Game /
// 存档 / 生成器。执行（建图、出口、奖励、Boss 分流）由 Game 负责接入。
//
// 版本维度**绝不合并**：
//   flowVersion      —— 流程（1 = 旧三层，2 = 章节五段）
//   contentVersion   —— 阶段表语义（冻结）
//   encounterVersion —— 远征敌人编成（缺失 = 历史版）
//   definitionVersion—— 武器定义（在 weapon_versions.js）
//   schemaVersion    —— 存档信封/会话（在 save.js / session.js）
import {getStageProfile} from './stage_profiles.js';
import {RNG} from '../core/rng.js';
import {CHAPTER_ENCOUNTER_VERSION,chapterEncounterVersion} from './chapter_encounters.js';
export const FLOW_VERSION = 2;
// Keep the historical default for old callers/tools and explicit compact runs.
export const STAGE_CONTENT_VERSION = 1;
export const EXPANDED_STAGE_CONTENT_VERSION = 2;
export const EXPEDITION_STAGE_CONTENT_VERSION = 3;

// 固定 15 段表：主题、威胁进度、总房间数（含起点/出口/Boss）、职责。
// themeId 是旧 FLOOR_THEME 的三值兼容投影（1 沉钟回廊 / 2 熔核深渊 / 3 熔心王座）。
const ROWS = [
  // chapter, segment, themeId, threat, rooms, role
  [1, 1, 1, 0.06, 3, '建立移动与清房节奏'],
  [1, 2, 1, 0.13, 4, '可用选择首次出现'],
  [1, 3, 1, 0.20, 4, '战术房检查'],
  [1, 4, 1, 0.27, 5, 'Boss 前资源判断'],
  [1, 5, 1, 0.33, 4, '章 Boss / 原型出口'],
  [2, 1, 2, 0.40, 3, '章转换与新敌组导入'],
  [2, 2, 2, 0.47, 4, '空间封锁'],
  [2, 3, 2, 0.53, 5, '召唤核心检验'],
  [2, 4, 2, 0.60, 4, '资源压力与选择'],
  [2, 5, 2, 0.66, 4, '章 Boss'],
  [3, 1, 3, 0.73, 3, '终章敌组逐项介绍'],
  [3, 2, 3, 0.80, 4, '火线与机动'],
  [3, 3, 3, 0.86, 5, '完整构筑检验'],
  [3, 4, 3, 0.93, 4, '最后资源出口'],
  [3, 5, 3, 1.00, 4, '最终 Boss / 全局结算'],
];

export const STAGE_TABLE = Object.freeze(ROWS.map(([chapter, segment, themeId, threatProgress, rooms, role]) =>
  Object.freeze({ chapter, segment, stageKey: `c${chapter}s${segment}`, themeId, threatProgress, rooms, role, boss: segment === 5 })));

const BY_KEY = new Map(STAGE_TABLE.map((s) => [s.stageKey, s]));

export function getStageDefinition(chapter, segment, profile = 'compact') {
  const def=BY_KEY.get(`c${chapter}s${segment}`);
  if(!def)return null;
  const p=getStageProfile(profile);
  return profile==='compact'?def:{...def,profile,rooms:p.rooms[0]===p.rooms[1]?p.rooms[0]:null,roomRange:p.rooms};
}
export function stageKeyFor(chapter, segment) { return `c${chapter}s${segment}`; }
export function stageByKey(key) { return BY_KEY.get(key) || null; }

// 版本化整数散列：不消费 game RNG，也不用 JS 字符串默认 hash（那是实现定义的）。
export function stageSeedFor(runSeed, stageKey, contentVersion = 1, profile = 'compact') {
  const def = BY_KEY.get(stageKey);
  if (!def || !Number.isInteger(runSeed)) throw new Error('阶段种子输入无效');
  if(getStageProfile(profile).contentVersion!==contentVersion)throw Error('章节规模与内容版本不一致');
  let h = (runSeed >>> 0) ^ 0x9e3779b9;
  for (let i = 0; i < stageKey.length; i++) h = Math.imul(h ^ stageKey.charCodeAt(i), 0x01000193) >>> 0;
  h = Math.imul(h ^ (contentVersion * 0x85ebca6b), 0xc2b2ae35) >>> 0;
  if(contentVersion===2)h=Math.imul(h^(profile==='medium'?0x6d656469:0x6c617267),0x01000193)>>>0;
  if(contentVersion===3)h=Math.imul(h^(profile==='portable'?0x706f7274:0x7374616e),0x01000193)>>>0;
  return h >>> 0;
}

// A chapter-wide draw fixes which of its five stages receive one extra secret.
// It never consumes gameplay RNG or depends on the currently visited segment.
export function hiddenSegmentsFor(runSeed,chapter){
  if(!Number.isInteger(runSeed)||!Number.isInteger(chapter)||chapter<1||chapter>3)throw Error('隐藏房章节种子无效');
  const rng=new RNG(((runSeed>>>0)^Math.imul(chapter,0x85ebca6b)^0x53454352)>>>0);
  const count=rng.int(1,2);
  return rng.shuffle([1,2,3,4,5]).slice(0,count).sort((a,b)=>a-b);
}

export function newStageContext(runSeed, campaignScope = 'chapter1', chapter = 1, segment = 1, profile = 'compact') {
  const scope = campaignScope === 'full3' ? 'full3' : 'chapter1';
  if (scope === 'chapter1' && chapter !== 1) throw new Error('单章原型只能停留在第一章');
  const def = getStageDefinition(chapter, segment);
  if (!def) throw new Error('未知阶段');
  const p=getStageProfile(profile);
  return { flowVersion: FLOW_VERSION, contentVersion: p.contentVersion, ...(profile==='compact'?{}:{profile}), ...(p.contentVersion===3?{encounterVersion:CHAPTER_ENCOUNTER_VERSION,hiddenSegments:hiddenSegmentsFor(runSeed,chapter)}:{}), campaignScope: scope, chapter, segment, stageKey: def.stageKey, themeId: def.themeId, threatProgress: def.threatProgress, stageSeed: stageSeedFor(runSeed, def.stageKey,p.contentVersion,profile) };
}

export function nextStage(context, runSeed) {
  if (!context || context.flowVersion !== FLOW_VERSION) return null;
  if (!Number.isInteger(runSeed)) throw new Error('下一阶段需要出征种子');
  validateStageContext(context,runSeed);
  const def = getStageDefinition(context.chapter, context.segment);
  if (!def) return null;
  if (context.segment < 5) return { ...context, ...rebuild(runSeed, context.chapter, context.segment + 1,context) };
  if (context.chapter >= 3) return null;
  if (context.campaignScope === 'chapter1') return null;   // 单章原型不越章
  return { ...context, ...rebuild(runSeed, context.chapter + 1, 1,context) };
}
function rebuild(runSeed, chapter, segment,context) {
  const def = getStageDefinition(chapter, segment);
  return { chapter, segment, ...(context.contentVersion===3?{hiddenSegments:hiddenSegmentsFor(runSeed,chapter)}:{}), stageKey: def.stageKey, themeId: def.themeId, threatProgress: def.threatProgress, stageSeed: stageSeedFor(runSeed, def.stageKey,context.contentVersion,context.profile||'compact') };
}

export function isChapterFinal(context) { return !!context && context.segment === 5; }
export function isCampaignFinal(context) { return !!context && context.chapter === 3 && context.segment === 5; }

// 阶段视图（只读，给 HUD）。
export function getStageView(context) {
  if (!context || context.flowVersion !== FLOW_VERSION) return { flowVersion: 1 };
  const def = getStageDefinition(context.chapter, context.segment,context.profile||'compact');
  return { flowVersion: FLOW_VERSION, chapter: context.chapter, segment: context.segment, stageKey: context.stageKey,
    themeId: context.themeId, threatProgress: context.threatProgress, rooms: def?.rooms ?? null, boss: !!def?.boss,
    campaignScope: context.campaignScope, isCampaignFinal: isCampaignFinal(context), ...(context.contentVersion>=2?{profile:context.profile,roomRange:def.roomRange}:{}) };
}

// 严格校验：出现即必须合法。缺失（旧档）由调用方决定如何迁移。
export function validateStageContext(context, runSeed) {
  if (context === undefined || context === null) return true;
  if (typeof context !== 'object' || context.flowVersion !== FLOW_VERSION) throw new Error('不支持此流程版本');
  if (![STAGE_CONTENT_VERSION,EXPANDED_STAGE_CONTENT_VERSION,EXPEDITION_STAGE_CONTENT_VERSION].includes(context.contentVersion)) throw new Error('不支持此阶段内容版本');
  const encounterVersion=chapterEncounterVersion(context.encounterVersion);
  if(context.contentVersion!==3&&encounterVersion!==1)throw Error('旧阶段不支持新版章节编成');
  const profile=context.profile===undefined?'compact':context.profile;
  if(getStageProfile(profile).contentVersion!==context.contentVersion)throw Error('章节规模与内容版本不一致');
  if (!['chapter1', 'full3'].includes(context.campaignScope)) throw new Error('阶段范围无效');
  if (!Number.isInteger(context.chapter) || context.chapter < 1 || context.chapter > 3) throw new Error('章节无效');
  if (context.campaignScope === 'chapter1' && context.chapter !== 1) throw new Error('单章原型不能超过第一章');
  if (!Number.isInteger(context.segment) || context.segment < 1 || context.segment > 5) throw new Error('段无效');
  if(context.contentVersion===3){
    const hs=context.hiddenSegments;
    if(!Array.isArray(hs)||hs.length<1||hs.length>2||hs.some((n,i)=>!Number.isInteger(n)||n<1||n>5||(i>0&&n<=hs[i-1])))throw Error('隐藏房章节分布无效');
    if(Number.isInteger(runSeed)&&JSON.stringify(hs)!==JSON.stringify(hiddenSegmentsFor(runSeed,context.chapter)))throw Error('隐藏房分布与出征种子不一致');
  }
  const def = getStageDefinition(context.chapter, context.segment);
  if (!def || def.stageKey !== context.stageKey || def.themeId !== context.themeId || def.threatProgress !== context.threatProgress) throw new Error('阶段定义不一致');
  if (!Number.isInteger(context.stageSeed) || context.stageSeed < 0 || context.stageSeed > 0xffffffff) throw new Error('阶段种子无效');
  if (Number.isInteger(runSeed) && stageSeedFor(runSeed, context.stageKey,context.contentVersion,profile) !== context.stageSeed) throw new Error('阶段种子与出征种子不一致');
  return true;
}

// 奖励键：与房间 UID 分开的稳定键。
export function rewardKeyFor(stageKey, kind) { return `v2:${stageKey}:${kind}`; }
export function roomUidFor(stageKey, roomId) { return `v2:${stageKey}:${roomId}`; }
