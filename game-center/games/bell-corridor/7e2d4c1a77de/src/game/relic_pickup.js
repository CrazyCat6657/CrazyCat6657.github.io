import { ITEM_MAP } from './data.js';
import { relicRisk } from './relic_risks.js';
import { pickupReady, pickupPathClear } from './pickup_path.js';
import { captureSessionDraft, validateSession } from './session.js';
import { acquisitionProjection, publishAcquisition, publishDrops } from './acquisition_projection.js';
import { saveStore } from './save.js';
import { meta } from './meta.js';
import { commitSupplyClaim } from './build_supply_bridge.js';

function valid(game, pickup, identity) {
  const p = game.player;
  if (identity.config && (!game.hud.hubOpen || (game.hud._hub?.cfg || game.hud.cfg) !== identity.config)) return false;
  return game.state === 'play' && p?.alive && game.room === identity.room && p === identity.player && game.roomScene === identity.scene &&
    pickup.id === identity.id && pickup.kind === 'item' && game.pickups.list.includes(pickup) && pickupReady(pickup) &&
    Math.hypot(p.x-pickup.x,p.z-pickup.z) <= 2.2 && pickupPathClear(game,p.x,p.z,pickup.x,pickup.z);
}
export function offerRelicPickup(game, pickup) {
  const identity = { room:game.room, scene:game.roomScene, player:game.player, id:pickup?.id };
  if (!pickup || !ITEM_MAP[pickup.id] || !valid(game,pickup,identity) || game.storageFrozen()) return false;
  const risk = relicRisk(pickup.id,game.player);
  if (!risk.risky) return false;
  const costs = [...risk.costs];
  if (ITEM_MAP[pickup.id].mods.maxHp < 0 && game.mode === 'run') {
    const preview = acquisitionProjection(game,captureSessionDraft(game),structuredClone(meta.data));
    preview.player.items.push(pickup.id); preview.player.recompute();
    costs.push(`当前实际变化：生命上限 ${game.player.maxHp} → ${preview.player.maxHp}；生命 ${game.player.hp} → ${preview.player.hp}`);
  }
  const config = { title:`遗物确认 · ${ITEM_MAP[pickup.id].cn}`,
    sub:'该遗物具有本局代价。请查看后选择。',
    relicPreview:{ benefits:risk.benefits, costs:[...costs,...risk.conditional],
      notes:[risk.context,'暂不拾取会留在地面。以后可以再次按 E 查看；关闭和拒绝没有消耗。'].filter(Boolean) },
    rows:[{ cn:'接受并拾取', desc:'保存成功后才生效', accept:true }, { cn:'暂不拾取', desc:'保留原物，无消耗' }],
    onPick:row => {
      if (!row.accept) { game.hud.closeHubPanel(); return; }
      if (acceptRelicPickup(game,pickup,identity)) game.hud.closeHubPanel();
    } };
  identity.config = config;
  game.hud.hubPanel(config);
  return true;
}

export function acceptRelicPickup(game, pickup, identity) {
  if (game.storageFrozen() || !valid(game,pickup,identity)) return false;
  try {
    if(game.mode !== 'run') {
      if(!game.player.addItem(pickup.id))return false;
      pickup.collected=true;game.pickups.remove(pickup);return true;
    }
    const draft=captureSessionDraft(game), metaDraft=structuredClone(meta.data);
    const index=game.pickups.list.indexOf(pickup), roomState=draft.roomStates[game.room.uid];
    const projection=acquisitionProjection(game,draft,metaDraft);
    if (!projection.player.addItem(pickup.id)) { game.toast('未拾取','已经拥有，原物保留','#ff6a3a','fail'); return false; }
    roomState.pickups.splice(index,1);
    if (pickup.supplyKey) {
      const ledger={buildSupply:draft.buildSupply};
      if(!commitSupplyClaim(ledger,pickup.supplyKey).ok)return false;
      draft.buildSupply=ledger.buildSupply;
    }
    projection.finish(); validateSession(draft);
    // Every mode=run expedition, including practice, follows the existing
    // durable active-session and discovery contract. Hub was handled above.
    {
      const result=saveStore.write(metaDraft,draft);
      if (result.committed !== true) {
        if(saveStore.blocked)game.openStorageRecovery();
        game.toast('遗物尚未保存',result.error || '原物保留，请重试','#ff6a3a','fail'); return false;
      }
    }
    try {
      publishAcquisition(game,draft); publishDrops(game,projection.drops);
      pickup.collected=true;game.pickups.remove(pickup);
      game.roomStates.set(game.room.uid,structuredClone(draft.roomStates[game.room.uid]));
      meta.data=metaDraft;meta._dirty=false;meta._clearActive=false;game.buildSupply=structuredClone(draft.buildSupply);
      game.toast(`获得遗物 · ${ITEM_MAP[pickup.id].cn}`,ITEM_MAP[pickup.id].desc,'#7affd2','build');
      return true;
    } catch(error) { saveStore.blockWrites();game.openStorageRecovery();return false; }
  } catch(error) { game.toast('未拾取',error.message,'#ff6a3a','fail');return false; }
}
