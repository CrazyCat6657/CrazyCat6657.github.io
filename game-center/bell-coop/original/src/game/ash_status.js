import { reportStatusDamage, statusFeedbackSource } from './damage_feedback.js';

// One independent status ID. The damage is frozen at the hit that applies it;
// later hero HP changes and refreshing hits do not multiply existing ticks.
export function applyAsh(target, spec, opts = {}) {
  if (!spec || !Number.isFinite(spec.duration) || !Number.isFinite(spec.dps) ||
      spec.duration <= 0 || spec.duration > 10 || spec.dps <= 0 || spec.dps > 1000) return;
  const st = target.status;
  const existing = st.ash > 0 ? st.ashDps || 0 : 0;
  st.ash = Math.max(st.ash || 0, spec.duration * (target.isBoss ? .5 : 1));
  st.ashDps = Math.max(existing, spec.dps);
  if(spec.dps>=existing)st.ashFeedbackSource = { ...statusFeedbackSource(opts), sourceInstanceId: spec.sourceInstanceId || 'hero:emberoath' };
}

export function tickAsh(target, dt, y) {
  const st = target.status;
  if (!target.alive || !(st.ash > 0)) return false;
  const used = Math.min(st.ash, dt);
  st.ash = Math.max(0, st.ash - dt);
  const damage = st.ashDps * used;
  target.hp -= damage;
  reportStatusDamage(target, 'ash', damage, y);
  if (target.hp <= 0) {
    target.hp = 0;
    target.die({ ...st.ashFeedbackSource,source: 'statusDot', assetSecondary: true });
    return true;
  }
  return false;
}
