import { meta } from './meta.js';
import { heroById, SIDEARMS, SUPPLIES, SUPPLY_MAP, PAINTS, PAINT_MAP, modifierById } from './heroes.js';
import { BUILD_ROUTES } from './build_content_data.js';
import { DIFFICULTY } from '../core/constants.js';

// The preparation stone owns selections. Merchant purchases only unlock choices.
export function openPreparation(game) {
  if (game.mode !== 'hub') return;
  const hero = heroById(meta.sel.hero);
  const sidearm = SIDEARMS.find(x => x.id === meta.sel.sidearm);
  const supply = SUPPLY_MAP[meta.sel.supply || 'none'] || SUPPLIES[0];
  const paint = PAINT_MAP[meta.sel.paint || 'orig'] || PAINTS[0];
  const route = BUILD_ROUTES.find(x => x.id === meta.sel.route);
  const modifier = modifierById(meta.sel.modifier);
  game.hud.hubPanel({ page: 'readout', title: '出征准备', sub: '',
    rows: [
      { cn: '英雄', desc: hero.cn, go: 'hero' },
      { cn: '起始副武器', desc: sidearm?.cn || '无', go: 'armory' },
      { cn: '出征补给', desc: supply.cn, go: 'supply' },
      { cn: '构筑路线', desc: route?.name || '不选路线', go: 'route' },
      { cn: '涂装', desc: paint.cn, go: 'paint' },
      { cn: '难度', desc: DIFFICULTY[meta.difficulty].cn, go: 'difficulty' },
      { cn: '挑战词条', desc: modifier?.cn || '无', go: 'modifier' },
      { cn: '一次复苏', desc: meta.difficulty === 'casual' ? '休闲难度始终开启' : meta.difficulty === 'challenge' ? '挑战难度关闭' : (meta.data.revivalPref === 'on' ? '开启' : '关闭'), revival: true },
      { cn: '楼层与首领练习', desc: '', go: 'practice' },
      { cn: '远征模式', desc: '标准 / 小房间 / 经典', stage: true },
      { cn: '设置', desc: '准星、拾取与键位', settings: true },
      { cn: '开发者模式', desc: meta.devMode ? '开启' : '关闭', go: 'developer' },
      { cn: '完成准备', desc: '', close: true },
    ],
    onPick: row => {
      if (game.mode !== 'hub' || !row) return;
      if (row.revival) {
        if (meta.difficulty === 'challenge' || meta.difficulty === 'casual') return;
        const next = meta.data.revivalPref === 'off' ? 'on' : 'off';
        if (game.saveHubSelection(`revival:${next}`, data => { data.revivalPref = next; })) openPreparation(game);
        return;
      }
      if (row.settings) return game.hud.preferencesPanel();
      game.hud.closeHubPanel();
      if (row.go) game.useHub(row.go);
      if (row.stage) game.stageRunPanel();
    },
  });
}

export function openPreparationChoice(game, kind) {
  if (game.mode !== 'hub' || !['supply', 'paint', 'route'].includes(kind)) return;
  const entries = kind === 'supply' ? SUPPLIES : kind === 'paint' ? PAINTS : [{ id: 'none', name: '不选路线', loop: '不指定路线' }, ...BUILD_ROUTES];
  const title = { supply: '出征补给', paint: '涂装', route: '构筑路线' }[kind];
  game.hud.hubPanel({ page: kind, title, sub: '', onBack: () => openPreparation(game),
    rows: entries.map(entry => ({ id: entry.id, cn: entry.cn || entry.name, desc: entry.desc || entry.loop || '',
      disabled: kind === 'paint' && !meta.hasPaint(entry.id),
      tag: meta.sel[kind] === entry.id ? '使用中' : kind === 'paint' && !meta.hasPaint(entry.id) ? '未解锁' : '' })),
    onPick: row => {
      if (game.mode !== 'hub' || !row || !entries.some(entry => entry.id === row.id)) return;
      if (kind === 'paint' && !meta.hasPaint(row.id)) return;
      if (!game.saveHubSelection(`${kind}:${row.id}`, data => { data.sel[kind] = row.id; })) return;
      if (kind === 'paint') game.applyHero(game.player);
      game.refreshHubProgress();
      openPreparationChoice(game, kind);
    },
  });
}
