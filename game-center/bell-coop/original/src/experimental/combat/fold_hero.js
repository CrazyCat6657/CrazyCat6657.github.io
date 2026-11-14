import {FOLD_RULES,foldReturnInfo} from './fold_shadow.js';
// Shared formal hero definition; legacy training uses the same abilities.
export const FOLD_SHADOW = Object.freeze({
  id:'foldshadow', ruleVersion:3, cn:'折影者', en:'Fold Shadow',
  desc:'没有影像时，成功掠影会自动留下退路；开枪后可折返，手动摆影可选，用来调整射击角度。',
  verb:'无影像时掠影自动留影 → 开枪 → 沿安全路径折返', passiveName:'镜步', skillName:'折返', skillCd:2,
  talent:`储存两次掠影；无影像时成功掠影自动留影${FOLD_RULES.anchorLife}秒，可选手动摆影。同房${FOLD_RULES.returnRange}米内沿安全路径折返；机动没有无敌。`,
  costNote:'基础生命 4，掠影与折返没有无敌。折返限同房 40 米内，路径与落点须安全。',
  hp:4, rad:.5, sidearm:'pistol_rusty', mods:{speed:.08},
  pal:{coat:'#28434d',coatDark:'#12252d',hood:'#405d66',accent:'#9ddbd4',belt:'#9b7047'},
  build:{hood:true,visor:true,bulk:.86,tall:1.04},
  hook:{
    skillStatus(p,g) {
      const info=foldReturnInfo(g||p.game),f=(g||p.game)?.experiment?.fold;
      return info.ready ? {ready:true} : {ready:false,reason:info.reason,remaining:f?.swapCd||0,total:2};
    },
    resource(p,g) { const f=(g||p.game)?.experiment?.fold;return {txt:f?`掠影 ${f.qCharges}/2 · 同房影像 ${f.images.length}`:'双段掠影 · 留影折返'}; },
  },
});
