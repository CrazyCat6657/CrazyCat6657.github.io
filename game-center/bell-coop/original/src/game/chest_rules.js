import { RNG } from '../core/rng.js';
import { WEAPONS, ITEMS, ACTIVES } from './data.js';
import { ATTACHMENTS } from './attachments.js';
import { pickWeaponByFamily } from './weapon_assets_pool.js';

// Development candidates, not a final balance verdict. The stored cost is authoritative.
export const CHEST_COSTS = Object.freeze([1, 1, 2, 3, 5]);
export const CONSERVATIVE_COSTS = Object.freeze([1, 1, 1, 2, 3]);
export const CHEST_TIERS = Object.freeze([
  { name: '白钢箱', color: '#e2e8ed', min: 1, max: 1, rolls: 1, coins: 4, attachment: 0, reward: '基础武器 / 遗物' },
  { name: '绿铜箱', color: '#7bcf91', min: 1, max: 2, rolls: 1, coins: 8, attachment: .10, reward: '实用武器 / 遗物' },
  { name: '蓝钢箱', color: '#68b9ed', min: 2, max: 3, rolls: 1, coins: 14, attachment: .25, reward: '进阶武器 / 遗物 / 配件' },
  { name: '紫晶箱', color: '#ba87e9', min: 3, max: 4, rolls: 2, coins: 22, attachment: .40, reward: '稀有武器 / 遗物 / 配件' },
  { name: '橙金箱', color: '#ffbf55', min: 4, max: 5, rolls: 2, coins: 32, attachment: .60, reward: '珍贵武器 / 遗物 / 配件' },
]);
const fields = ['ruleVersion', 'rarityTier', 'locked', 'keyCost'];
export function chestFields(chest) {
  return Object.fromEntries(fields.filter(k => Object.hasOwn(chest, k)).map(k => [k, chest[k]]));
}
export function chestRules(chest) {
  if (!chest || !['normal', 'locked', 'gold'].includes(chest.quality)) throw Error('宝箱品质无效');
  if (!fields.some(k => Object.hasOwn(chest, k))) {
    return { legacy: true, locked: chest.quality === 'locked', keyCost: chest.quality === 'locked' ? 1 : 0,
      name: chest.quality === 'gold' ? '鎏金宝箱' : '旧式宝箱', color: '#ffd24a', reward: '原预生成奖励' };
  }
  if (chest.ruleVersion !== 1 || !Number.isInteger(chest.rarityTier) || chest.rarityTier < 1 || chest.rarityTier > 5 ||
      typeof chest.locked !== 'boolean' || !Number.isInteger(chest.keyCost) || chest.keyCost < 0 || chest.keyCost > 5 ||
      (chest.locked ? chest.keyCost < 1 : chest.keyCost !== 0)) throw Error('宝箱规则版本或开启成本无效');
  return { ...CHEST_TIERS[chest.rarityTier - 1], ...chestFields(chest), legacy: false };
}
export function newChest(rng, floor = 1, { unlocked = false, minTier = 1 } = {}) {
  // 1F: 42/32/20/5.5/.5%; 2F: 30/32/26/10/2%; 3F: 22/28/30/16/4%.
  const cuts = floor >= 3 ? [.22,.50,.80,.96] : floor === 2 ? [.30,.62,.88,.98] : [.42,.74,.94,.995];
  const draw = rng.next(), tier = Math.max(minTier, 1 + cuts.filter(c => draw >= c).length);
  const locked = !unlocked && rng.chance(.12 + (tier - 1) * .09);
  return { quality: tier >= 4 ? 'gold' : 'normal', ruleVersion: 1, rarityTier: tier, locked, keyCost: locked ? CHEST_COSTS[tier-1] : 0 };
}
// Only called on genuinely new content, after the historic generator draws.
export function upgradeNewChests(content, seed, floor, type) {
  const rng = new RNG((seed ^ 0x51c4e57) >>> 0);
  content.chests = content.chests.map(() => newChest(rng, floor, { unlocked: type === 'hidden' || type === 'exit', minTier: type === 'treasure' ? 2 : 1 }));
  if (type === 'vault') content.vaultChest = newChest(rng, floor, { minTier: 3 });
  return content;
}
export function chestPoolAllows(chest, allocation) {
  const r = chestRules(chest);
  if (chest.bossReward && allocation.kind==='weapon' && WEAPONS.find(w=>w.id===allocation.id)?.tier!==3)return false;
  if (r.legacy) return true;
  if (allocation.kind === 'weapon') { const w = WEAPONS.find(w => w.id === allocation.id); return !!w && w.tier >= r.min && w.tier <= r.max; }
  if (allocation.kind === 'item') { const it = ITEMS.find(i => i.id === allocation.id); return !!it && (it.rarity || 1) <= r.max; }
  if (allocation.kind === 'attachment') return r.attachment > 0;
  return true;
}
export function rollTierLoot(chest, rng, floor, modifiers = {}, ownedItems = []) {
  const r = chestRules(chest), out = [];
  const excluded = new Set(ownedItems);
  if (r.legacy) throw Error('旧箱必须消费原奖励规则');
  // Loot-up retains a benefit without silently changing the displayed tier/pool.
  const rolls = r.rolls + Number(r.rolls < 2 && !!modifiers.lootUp && rng.chance(.35 * modifiers.lootUp));
  for (let i=0; i<rolls; i++) {
    const draw = rng.next();
    if (draw < .60) out.push({ kind:'weapon', id:pickWeaponByFamily(rng, WEAPONS.filter(w => w.tier >= r.min && w.tier <= r.max)).id });
    else if (draw < .92 || r.max < 3) {
      const pool = ITEMS.filter(it => (it.rarity || 1) <= r.max && !excluded.has(it.id));
      const it = pool.length ? rng.pick(pool) : null;
      if (!it) out.push({kind:'coins',amount:15});
      else if (modifiers.noFood && it.mods?.heal) out.push({kind:'coins',amount:18});
      else { out.push({kind:'item',id:it.id}); excluded.add(it.id); }
    } else out.push({kind:'active',id:rng.pick(ACTIVES).id});
  }
  out.push({kind:'coins',amount:r.coins + floor * 2 + rng.int(0,4)});
  if (rng.chance(r.attachment)) out.push({kind:'attachment',id:rng.pick(ATTACHMENTS).id});
  if (!modifiers.noFood && rng.chance(.35)) out.push({kind:'heal',amount:1});
  return out;
}
