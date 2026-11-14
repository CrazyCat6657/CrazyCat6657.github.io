import { FORMAT_VERSION, MODULE_ID, getModifiers } from './index.js';

// Read-only host gate. Invalid/absent module state must never alter classic AI.
export function suppressesNewPlayerLocks(game) {
  if(game?.actors?.size>1)return combatActors(game).every(a=>suppressesNewPlayerLocks(a.view));
  const state = game?.consumables;
  // Full validation belongs to host creation/restore/transactions. This hot
  // path checks the public shape without walking inventory or request logs.
  if (!game?.experiment || game.mode !== 'run' || state?.formatVersion !== FORMAT_VERSION ||
      state.moduleId !== MODULE_ID || !Array.isArray(state.slots) ||
      !state.effects || typeof state.effects !== 'object' || Array.isArray(state.effects) ||
      !state.armor || typeof state.armor !== 'object') return false;
  return getModifiers(state).suppressNewLocks;
}

// Stable world candidates. Companions and inactive/disconnected actors never
// enter enemy perception or environmental damage, while personal menus do.
export function combatActors(game) {
  return game?.actors ? [...game.actors.values()].filter(a=>a.active&&a.player?.alive&&a.connected!==false&&a.player.connected!==false).sort((a,b)=>a.slot-b.slot||a.playerId.localeCompare(b.playerId)) : (game?.player?.alive?[{player:game.player,view:game,playerId:game.player.id||'player'}]:[]);
}
export function combatPlayers(game) { return combatActors(game).map(a=>a.player); }
export function selectPlayerTarget(actor, {retain=false}={}) {
  const g=actor.game, candidates=combatActors(g);
  if(g?.actors?.size<=1||!g?.actors)return candidates.find(a=>!suppressesNewPlayerLocks(a.view))?.player||null;
  const locked=retain&&candidates.find(a=>a.playerId===actor.targetPlayerId);
  if(locked&&!suppressesNewPlayerLocks(locked.view))return locked.player;
  const visible=candidates.filter(a=>!suppressesNewPlayerLocks(a.view));
  visible.sort((a,b)=>(Math.hypot(a.player.x-actor.x,a.player.z-actor.z)-Math.hypot(b.player.x-actor.x,b.player.z-actor.z))||a.playerId.localeCompare(b.playerId));
  const chosen=visible[0];
  actor.targetPlayerId=chosen?.playerId||null;
  return chosen?.player||null;
}

// Bosses may finish committed patterns at the last visible point. Never read
// the hidden player's current coordinates; this small cache survives a save.
export function playerLockTarget(actor) {
  const g=actor.game,p=g.player;
  if(g.actors?.size>1){
    const retain=!['idle','intro','phase','recover'].includes(actor.state)||actor.burstLeft>0;
    const target=selectPlayerTarget(actor,{retain});
    if(target){actor.veilTarget={x:target.x,z:target.z};return target;}
    return actor.veilTarget||{x:actor.x,z:actor.z};
  }
  if(!g.experiment || !g.consumables)return p;
  if(!suppressesNewPlayerLocks(g)) {
    actor.veilTarget={x:p.x,z:p.z};return p;
  }
  return actor.veilTarget||{x:actor.x,z:actor.z};
}
