import { chestRules } from './chest_rules.js';
import { captureSessionDraft, validateSession } from './session.js';
import { acquisitionProjection, publishAcquisition, publishDrops } from './acquisition_projection.js';
import { planChestSupply, commitSupplyClaim } from './build_supply_bridge.js';
import { saveStore } from './save.js';
import { meta } from './meta.js';
import { audio } from '../core/audio.js';
import {pregeneratedWeaponDefinition} from './weapon_compatibility.js';
import {observeResource,resourceSnapshot} from './resource_observation.js';

export function commitChestOpen(game, prop) {
  if (!prop || prop.kind !== 'chest' || prop.opened || game.mode !== 'run' || game.state !== 'play' ||
      !game.player?.alive || game.paused || game.revivalPending || game.storageFrozen() || game.panelOpen() ||
      !game.roomScene.props.includes(prop)) return false;
  try {
    const rules = chestRules(prop);
    if (game.player.keys < rules.keyCost) {
      observeResource(game,'chest-blocked',{cost:rules.keyCost,id:prop.saveId},null,game.room.uid+':'+prop.saveId);
      game.toast('钥匙不足', `需要 ${rules.keyCost} 把钥匙，当前持有 ${game.player.keys} 把 · 可以先去买钥匙，宝箱会留在这里`, '#ff6a3a', 'fail');
      return false;
    }
    const draft = captureSessionDraft(game), metaDraft = structuredClone(meta.data);
    const projection = acquisitionProjection(game, draft, metaDraft), ctx = projection.game;
    ctx.buildSupply = structuredClone(draft.buildSupply); ctx.room = game.room;
    const uid = game.room.uid, state = draft.roomStates[uid];
    const savedProps = [state.scene, draft.scenes[uid]].map(sc => sc.props.find(p => p.id === prop.saveId));
    if (savedProps.some(p => !p || p.opened)) throw Error('宝箱保存身份不一致');
    let loot = structuredClone(prop.loot || []), supplyMode = null;
    if (ctx.buildSupply && !game.practice) {
      const plan = planChestSupply(ctx, { roomId:uid, sourceOrdinal:Number.isInteger(prop.chestIndex) ? prop.chestIndex : game.room.content.chests.length, baseLoot:loot, chest:prop });
      if (plan.planned) {
        loot = plan.loot; ctx.buildSupply = plan.supply; ctx.grng.s = plan.rng.s; supplyMode = plan.mode;
        for (const l of loot) if (l.kind === 'compensation') {
          ctx.player.addCoins(l.coins || 15, 'chest');
          if (!commitSupplyClaim(ctx, l.supplyKey).ok) throw Error('补偿领取身份无效');
        }
        loot = loot.filter(l => l.kind !== 'compensation');
      }
    }
    ctx.player.keys -= rules.keyCost;
    for (const p of savedProps) Object.assign(p, { opened:true, opening:0, loot:structuredClone(loot) });
    loot.forEach((l, i) => {
      const a = i / Math.max(1, loot.length) * Math.PI * 2 + ctx.gr();
      state.lootQueue.push({roomId:uid,t:.14*i,kind:l.kind,x:prop.worldX+Math.cos(a),z:prop.worldZ+Math.sin(a),
        opts:{...structuredClone(l),...(l.kind==='weapon'?{definitionVersion:pregeneratedWeaponDefinition(l).weaponAssetVersion||1}:{}),id:l.id,amount:l.amount,supplyKey:l.supplyKey || null,fromChest:true,vx:Math.cos(a)*2.4,vy:4.2,vz:Math.sin(a)*2.4,y:.9,healSrc:'chest',coinSrc:'chest'}});
    });
    if (rules.legacy && supplyMode !== 'route' && supplyMode !== 'category') ctx.rollAttachmentFrom(prop.quality,prop.worldX-1,prop.worldZ);
    if (ctx.tel?.chests) { const key = rules.legacy ? prop.quality : `tier${rules.rarityTier}`; ctx.tel.chests[key] = (ctx.tel.chests[key] || 0) + 1; }
    observeResource(ctx,'chest-open',{cost:rules.keyCost,id:prop.saveId},resourceSnapshot(game.player),uid+':'+prop.saveId);
    ctx.telFirst('firstChest'); projection.finish(); draft.buildSupply = ctx.buildSupply;
    validateSession(draft);
    const saved = saveStore.write(metaDraft,draft);
    if (saved.committed !== true) {
      if (saveStore.blocked) game.openStorageRecovery();
      game.toast('宝箱尚未开启', saved.error || '保存失败；钥匙和宝箱奖励都没有扣除，可以重试', '#ff6a3a', 'fail'); return false;
    }
    try {
      publishAcquisition(game,draft); publishDrops(game,projection.drops);
      game.buildSupply = structuredClone(draft.buildSupply);
      game.roomStates.set(uid,structuredClone(state));
      game.pendingLoot = [...game.pendingLoot.filter(q => q.roomId !== uid), ...structuredClone(state.lootQueue)];
      Object.assign(prop,{opened:true,opening:0,loot:structuredClone(loot)});
      meta.data = metaDraft; meta._dirty = false; meta._clearActive = false;
    } catch (error) { saveStore.blockWrites(); game.openStorageRecovery(); return false; }
    audio.chestOpen(); if (rules.keyCost) audio.key();
    game.particles.sparkle(prop.worldX,1.3,prop.worldZ,rules.color,16,3.2);
    game.flashSmall(prop.worldX,1.4,prop.worldZ,rules.color,12,.4);
    game.toast('宝箱开启', `掉落 ${loot.length} 件 · 背包、武器槽或配件库满时，未领取的物品会留在地面`, rules.color, 'quick');
    return true;
  } catch (error) { game.toast('宝箱未更改',error.message,'#ff6a3a','fail'); return false; }
}
