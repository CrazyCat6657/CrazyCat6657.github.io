// Content-v3 only. Classic Encounter Director and its RNG stream stay unchanged.
import { RNG } from '../core/rng.js';
import { ENEMIES, ENEMY_MAP } from './data.js';

export const CHAPTER_ENCOUNTER_VERSION = 2;
// Absence is the historical composition, independently of map/content versions.
export function chapterEncounterVersion(value = 1) {
  if (value !== 1 && value !== CHAPTER_ENCOUNTER_VERSION) throw new Error('不支持此章节编成版本');
  return value;
}

export function planChapterEncounter({ chapter = 1, seed = 1, kind = 'battle', pool = [], segment = 1, encounterVersion = 1, multiWave = true } = {}) {
  const modern = chapterEncounterVersion(encounterVersion) === CHAPTER_ENCOUNTER_VERSION;
  if (modern && (!Number.isInteger(segment) || segment < 1 || segment > 5 || typeof multiWave !== 'boolean')) throw new Error('章节编成选项无效');
  chapter = Math.max(1, Math.min(3, Math.trunc(chapter) || 1));
  if (kind === 'dense') kind = 'horde';
  if (!['battle', 'vault', 'explosive', 'horde'].includes(kind)) throw new Error(`Unknown chapter encounter: ${kind}`);
  const rng = new RNG((seed ^ Math.imul(chapter, 0x9e3779b9) ^ 0x163ea501) >>> 0);
  let available = [...new Set(pool)].filter(id => ENEMY_MAP[id] && !id.includes('_small'));
  if (!available.length) available = ENEMIES.filter(d => d.floor === chapter && !d.id.includes('_small')).map(d => d.id);
  if (kind === 'explosive') {
    // Use the actual fuse/explosion AI, including when this chapter's normal
    // pool contains no explosive enemy. Never rename an ordinary composition.
    available = ENEMIES.filter(d => d.ai === 'bomber' && d.floor <= chapter).map(d => d.id);
  } else if (kind === 'horde') {
    const light = available.filter(id => ENEMY_MAP[id].tier <= 2 && ENEMY_MAP[id].ai !== 'summoner');
    if (light.length) available = light;
  }
  if (modern && chapter === 1 && segment <= 2) {
    // Shield AI shoots too; summoners can introduce shooters. Use the actual
    // non-projectile consumers rather than a label/tier based ranged filter.
    const safe = d => ['charger', 'bomber', 'swarm', 'blob', 'brute'].includes(d.ai) && (segment !== 1 || !d.splitInto);
    available = available.filter(id => safe(ENEMY_MAP[id]));
    if (!available.length) available = ENEMIES.filter(d => d.floor === chapter && !d.id.includes('_small') && safe(d)).map(d => d.id);
  }
  const sizes = chapter === 1 ? [5, 5] : chapter === 2 ? [5, 5, 6] : rng.chance(0.5) ? [8, 7, 7] : [8, 6, 6, 6];
  if (kind === 'horde') sizes[0] *= 5;
  if (modern) {
    if (kind === 'horde') sizes[0] = chapter === 3 ? 40 : 15;
    else {
      if (chapter === 1 && segment === 1) sizes[0] = rng.int(3, 5);
      if (chapter === 1 || !multiWave) sizes.length = 1;
    }
  }
  const groups = sizes.map(n => ({ enemies: Array.from({ length: n }, () => rng.pick(available)), elite: kind === 'vault', eliteIndices: [] }));
  // At most one elite in the entire ordinary encounter, including reinforcements.
  if (kind === 'battle' && rng.chance(0.2)) {
    const group = rng.pick(groups);
    group.eliteIndices.push(rng.int(0, group.enemies.length - 1));
  }
  return {
    ...groups[0],
    waves: groups.slice(1).map(group => ({ ...group, delay: 1.6 })),
    encounterKind: kind,
  };
}
