import { PAGE_COMBAT_MODE } from '../combat/mode.js';
import { controlLabel } from '../../core/control_actions.js';
import { createConsumablesBar } from '../../ui/experimental/consumables/consumables_bar.js';
import { ITEM_DEFS } from './index.js';
import { consumableView, consumableShopRows } from './runtime.js';

const pages = new WeakMap();
const SHOP_PAGE = 'experimental-consumable-supply';
const enabled = g => !!g.experiment && g.mode === 'run' && g.state === 'play';
const visible = g => enabled(g) && !g.paused && !g.panelOpen?.();
const ready = g => visible(g) && g.player?.alive && !g.input?.blocked && !g.input?.capturing &&
  !g._restoring && !g._importing && !g._storageRecovery && !g.revivalPending;

function feedback(page, result) {
  if (result && result.ok === false) page.bar.showFeedback({ kind: 'error', text: result.reason || '当前无法使用' });
}

function openSupply(g, page, message = '') {
  if (!ready(g) || g.room?.type !== 'shop') return;
  showSupply(g, page, message);
}

function showSupply(g, page, message = '') {
  const room = g.room, player = g.player, experiment = g.experiment;
  const rows = consumableShopRows(g).map(row => ({
    itemId: row.itemId, cn: row.name,
    desc: row.itemId === 'cleanse_tonic' ? ITEM_DEFS.cleanse_tonic.detail : row.detail,
    cost: `${row.price} 金币`, tag: row.sold ? '本层已购' : '每层限购一次',
    disabled: !!row.sold || player.coins < row.price,
  }));
  rows.push({ cn: '取消', cancel: true, desc: '关闭补给，继续探索' });
  const cfg = {
    page: SHOP_PAGE, title: '药剂补给',
    sub: `持有 ${player.coins} 金币。每层每种限购一次；满栏时不会扣费。${message ? ` ${message}` : ''}`,
    rows,
    onPick(row) {
      // A storage-recovery panel or a different room must never be overwritten by
      // a stale shop callback. The runtime independently validates the purchase.
      if (g.hud._hub?.cfg !== cfg || g.room !== room || g.player !== player || g.experiment !== experiment) return;
      if (row.cancel) { g.hud.closeHubPanel(); updateConsumablesPage(g); return; }
      if (row.disabled || !enabled(g) || g.paused || g.buildOpen || g.revivalPending ||
          g.input?.capturing || g._restoring || g._importing || g._storageRecovery || !player.alive) return;
      const result = g.purchaseConsumable(row.itemId);
      if (g.hud._hub?.cfg === cfg && !g._storageRecovery) {
        showSupply(g, page, result?.ok ? '购买成功。' : result?.reason || '购买未完成。');
      }
      updateConsumablesPage(g);
    },
  };
  // Block immediately, including a fire button held before the UI click.
  g.input?.setBlocked?.(true);
  g.input?.resetState?.();
  g.hud.hubPanel(cfg);
  updateConsumablesPage(g);
}

export function installConsumablesPage(g) {
  if (pages.has(g) || PAGE_COMBAT_MODE !== 'experimental' && g.hero?.id !== 'foldshadow') return;
  const css = document.createElement('link');
  css.rel = 'stylesheet'; css.href = new URL('../../ui/experimental/consumables/consumables.css', import.meta.url).href;
  document.head.append(css);
  const mount = document.createElement('div');
  mount.id = 'experiment-consumables'; mount.hidden = true;
  const shop = document.createElement('button');
  shop.type = 'button'; shop.className = 'cons-supply-button'; shop.textContent = '药剂补给'; shop.hidden = true;
  mount.append(shop); document.body.append(mount);
  const page = { mount, shop, signature: '', bar: null };
  page.bar = createConsumablesBar({ mount, onAction(action) {
    if (action.type !== 'use' || !ready(g)) return;
    feedback(page, g.useConsumable(action.slot));
    updateConsumablesPage(g);
  } });
  // No keyboard listeners: Game resolves the user's semantic item_1..4 actions.
  // Pointer-down clears a canvas fire hold while leaving slots selectable.
  mount.addEventListener('pointerdown', () => g.input?.resetState?.());
  shop.addEventListener('click', () => openSupply(g, page));
  pages.set(g, page);
  const setup = document.getElementById('combat-experiment-setup');
  if (setup) {
    const note = document.createElement('p'); note.dataset.consumablesHelp = '';
    note.textContent = `首房有六种样品各 1：${Object.values(ITEM_DEFS).map(item => item.name).join('、')}。手动交互拾取；四格单击查看，双击使用，也可使用对应改键。净化目前没有玩家负面状态来源，无状态时拒用且不消耗。`;
    setup.append(note);
  }
  updateConsumablesPage(g);
}

export function updateConsumablesPage(g, dt = 0) {
  if (!pages.has(g) && g.experiment?.fold) installConsumablesPage(g);
  const page = pages.get(g); if (!page) return;
  // Hide only this mounted bar; never touch the HUD's existing modal containers.
  page.mount.hidden = !visible(g);
  if (page.mount.hidden) { page.signature = ''; return; }
  page.shop.hidden = g.room?.type !== 'shop';
  page.shop.disabled = !ready(g);
  const view = consumableView(g); if (!view) { page.mount.hidden = true; return; }
  const slots = view.slots.map(slot => ({ ...slot, key: controlLabel(g.input, `item_${slot.index + 1}`),
    ...(slot.itemId === 'stamina_tonic' ? { detail: '恢复 50% 体力上限，体力达到 20 后解除疲劳。' } : {}),
  }));
  const display = { ...view, slots };
  // Changes in usability/keys are immediate; only effect readouts are quantized.
  // Clock/revision can advance each frame without tearing down interactive DOM.
  const tenth = value => Math.ceil(value * 10) / 10;
  display.effects = view.effects.map(effect => ({ ...effect, remaining: tenth(effect.remaining), ratio: tenth(effect.ratio) }));
  display.armor = { ...view.armor, remaining: tenth(view.armor.remaining) };
  const signature = JSON.stringify([display.slots, display.effects, display.armor]);
  if (signature !== page.signature) { page.bar.render(display); page.signature = signature; }
}
