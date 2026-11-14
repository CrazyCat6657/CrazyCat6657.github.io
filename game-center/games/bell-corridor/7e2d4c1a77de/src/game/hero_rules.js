import { TEAM } from '../core/constants.js';

export const HERO_RULE_VERSION = 3;
export function validHeroRuleVersion(value) { return value === 1 || value === 2 || value === 3; }

// Reuse the same solid sampling contract as weapon paths; no new entity pool.
export function heroWaveTargets(game, x, z, radius) {
  const blocked = game.bulletBlocked || game.pointBlocked;
  const targets = [];
  for (const enemy of new Set([...(game.enemies || []), game.boss])) {
    if (!enemy?.alive || enemy.team === TEAM.PLAYER) continue;
    const distance = Math.hypot(enemy.x - x, enemy.z - z);
    if (distance > radius + (enemy.r ?? enemy.radius ?? .5)) continue;
    const steps = Math.max(1, Math.ceil(distance / .12));
    let visible = true;
    for (let i = 0; i <= steps; i++) {
      if (blocked?.call(game, x + (enemy.x - x) * i / steps, z + (enemy.z - z) * i / steps, .03, .8)) { visible = false; break; }
    }
    if (visible) targets.push({ enemy, distance });
  }
  return targets;
}

export function heroWaveDamage(game, x, z, radius, damage, targets = heroWaveTargets(game, x, z, radius)) {
  const rootShotId = game.createDamageRootId();
  for (const { enemy, distance } of targets) {
    const falloff = 1 - .5 * Math.min(1, distance / radius);
    game.onDamage(enemy, damage * falloff, { source: 'skill', ignoreShield: true, assetSecondary: true, assetNoRefund: true,
      rootShotId, feedbackRootShotId: rootShotId, feedbackCategory: 'skill', feedbackSourceInstanceId: 'hero:' + game.hero.id });
  }
  return targets.length;
}

const skillPower = p => p.stats.skillPower ?? 1;
// Frozen C1 factory. Existing callers keep the old export name, but its
// result must never follow the default rule version forward.
export function currentHeroRule(legacy) {
  const base = { ...legacy, ruleVersion: 2 };
  if (legacy.id === 'warden') return { ...base,
    verb: '翻滚攒印记，开火反击；按 C 敲钟推开身边危险',
    costNote: '贴身钟波范围有限；完美闪避能更快攒出强回钟。',
    talent: '完美闪避攒印记；下一枪消耗一枚，强化伤害与穿透并放出近身钟波。无印记按 C 可敲钟并获得一枚。',
    hook: { ...legacy.hook,
      damageMul(p, game) {
        if ((p.bellCharges | 0) <= 0) return p.bellWindow > 0 ? 1.28 : 1;
        p.bellCharges--;p.bellWindow = Math.max(p.bellWindow || 0, 1.4);p.bellFlash = .45;
        game.bellWave(p.x, p.z, 2.8, .55, true, { damage: 4 * skillPower(p) });
        game.shake(.10);p.recompute();return 1.55;
      },
      onHeroSkill(p, game) {
        const n = p.bellCharges | 0;
        p.bellCharges = n > 0 ? 0 : 1;p.bellWindow = n > 0 ? 2.2 : 1.2;p.bellFlash = .45;
        game.bellWave(p.x, p.z, n > 0 ? 4 + .65 * n : 3.5, n > 0 ? 1 + .3 * n : .65, false,
          { damage: (6 + 4 * n) * skillPower(p) });
        game.hud.toast('回钟', n > 0 ? `消耗 ${n} 枚印记 · 钟波震伤敌人并推开敌弹` : '敲钟推开危险 · 获得一枚反击印记', '#ffd24a', 'quick');
        p.recompute();return n > 0 ? 5 : 7;
      },
    },
  };
  if (legacy.id === 'forgewright') return { ...base,
    verb: '开火与爆炸蓄热，按 C 释放贴身冲击波',
    talent: '实际开火或己方爆炸蓄热；按 C 泄压，热量越高范围和伤害越大。爆炸伤害+40%、范围+20%，移速-10%、弹匣-15%。',
    hook: { ...legacy.hook,
      onShotFired(p, data) {
        if (data.paid === false) return;
        const rate = Number.isFinite(data.def?.rate) && data.def.rate > 0 ? data.def.rate : 1;
        p.heat = Math.min(100, p.heat + Math.min(18, 12 / Math.max(.5, rate)));p.recompute();
      },
      onExplosion(p, data, game) {
        if (data.team !== TEAM.PLAYER) return;
        if (Math.hypot((data.x || 0) - p.x, (data.z || 0) - p.z) >= 15) return;
        p.heat = Math.min(100, p.heat + 8 + Math.min(10, (data.radius || 3) * 2));p.recompute();
      },
      recompute(p, stats) {
        const h = Math.min(1, Math.max(0, p.heat / 100));
        stats.explosiveMul += h * .55;stats.blastRadius += h * .30;
        if (h > .75) { stats.reloadMul += .35;stats.speed -= .07; }
      },
      tick(p, dt) {
        const before = p.heat;p.heat = Math.max(0, before - dt * 2.2);
        if (Math.floor(before / 5) !== Math.floor(p.heat / 5) || (before > 75) !== (p.heat > 75) || (before > 0 && p.heat === 0)) p.recompute();
      },
      onHeroSkill(p, game) {
        const h = Math.min(1, Math.max(0, p.heat / 100));
        const damage = (8 + 16 * h) * skillPower(p) * p.stats.explosiveMul;
        p.heat = Math.max(0, p.heat - 55);
        game.heatVent(p.x, p.z, 4 + 3 * h, .8 + 1.7 * h, { damage });p.recompute();
        game.hud.toast('泄压', h >= .5 ? '高热冲击 · 炉热已释放' : '贴身冲击 · 开火可继续蓄热', '#ff8a3c', 'quick');
        return 5;
      },
      resource(p) { return { txt: `炉热 ${Math.round(p.heat)}%${p.heat > 75 ? ' · 高热负担' : p.heat >= 50 ? ' · 强化泄压' : ''}` }; },
    },
  };
  return base;
}
