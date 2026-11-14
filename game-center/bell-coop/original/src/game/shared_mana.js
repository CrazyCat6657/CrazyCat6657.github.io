// Current Arcanist owns one pool. Weapon reserve is only a compatibility view
// so every existing payment/refund consumer reaches that same resource.
export const usesSharedMana = p => p?.hero?.id === 'arcanist' && p.hero.ruleVersion === 3;
// Peaceful corridor recovery is geometric and recomputed after every restore;
// warning waves and uncleared rooms cannot grant the out-of-combat multiplier.
export function corridorManaMultiplier(p) {
  const g=p?.game;
  return usesSharedMana(p) && g?.mode==='run' && g.state==='play' && !g.paused &&
    g.room?.cleared && !g.room.locked && !g.boss?.alive &&
    g.aliveEnemyCount()===0 && (g.pendingInRoom?.()||0)===0 && g.playerInConnector?.(0) ? 10 : 1;
}
export const sharedManaCap = p => Math.round(120 * (p.stats?.ammoMaxMul || 1));
export const manaRefundCap = (p,w) => usesSharedMana(p) ? sharedManaCap(p) : (w.def.ammoMax || 120);
const bindings = new WeakMap();
export function bindSharedMana(p) {
  if (!usesSharedMana(p)) return;
  p.mana = Math.max(0, Math.min(sharedManaCap(p), p.mana));
  for (const w of p.weapons || []) {
    if (w.def?.ammoType !== 'mana' || bindings.get(w) === p) continue;
    let detachedReserve = w.reserve;
    Object.defineProperty(w, 'reserve', {
      enumerable: true, configurable: true,
      get() {
        if (usesSharedMana(p) && p.weapons.includes(w)) detachedReserve = p.mana;
        return detachedReserve;
      },
      set(value) {
        detachedReserve = value;
        if (usesSharedMana(p) && p.weapons.includes(w)) p.mana = Math.max(0, Math.min(sharedManaCap(p), value));
      },
    });
    bindings.set(w,p);
  }
}
// A shared pool must not receive one refill for every carried spell.
export const ammoTargets = p => usesSharedMana(p) ? [p.weapon].filter(Boolean) : p.weapons;
export function validateSharedManaRecord(s) {
  if (s.heroRuleVersion !== 3 || s.hero !== 'arcanist') return;
  const p=s.player;
  if (!Number.isFinite(p?.mana) || p.mana < 0 || p.mana > 360) throw Error('角色法力无效');
  if (p.weapons?.some(w=>w.id?.startsWith('spell_') && !Number.isFinite(w.reserve))) throw Error('共享法力武器视图无效');
  if (p.weapons?.some(w=>w.id?.startsWith('spell_') && Math.abs(w.reserve-p.mana)>1e-8)) throw Error('共享法力与武器视图不一致');
}
