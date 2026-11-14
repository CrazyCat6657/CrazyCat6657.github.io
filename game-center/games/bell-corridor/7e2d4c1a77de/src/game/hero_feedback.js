// Player-approved C2 playtest tuning. All durations are simulation seconds.
export const RANGER_DISTANCE = 1.65;
export const RANGER_RECOVERY = 1.35;
export const FORGE_HEAT_RATE = 7.5;
export const PET_RAGE_DURATION = 8;
export const PET_RAGE_COOLDOWN = 24;
export const petRaging = c => !!c?.growth && c.alive && c.rageT > 0;
export function addForgeHeat(p, requested) {
  const amount = Math.min(requested, p.c2.forgeHeatBudget);
  p.c2.forgeHeatBudget -= amount;
  p.heat = Math.min(100, p.heat + amount);
}
export function validatePetRage(c) {
  if (!c) return;
  for (const [key, max] of [['rageT', PET_RAGE_DURATION], ['rageArmor', 3]]) {
    if (Object.hasOwn(c, key) && (!Number.isFinite(c[key]) || c[key] < 0 || c[key] > max)) throw Error('异兽暴走状态无效');
  }
  if ((c.rageArmor || 0) > 0 && (!(c.rageT > 0) || !c.alive)) throw Error('异兽临时护甲无效');
  if (c.rageT > 0 && (!c.alive || !c.growth)) throw Error('异兽暴走身份无效');
}
