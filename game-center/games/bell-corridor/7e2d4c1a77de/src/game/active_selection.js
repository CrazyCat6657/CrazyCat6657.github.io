import {ACTIVE_MAP} from './data.js';

const known = id => typeof id==='string' && Object.hasOwn(ACTIVE_MAP,id);
function validSelection(player) {
  if (!player || !Array.isArray(player.actives) || !player.actives.every(known) ||
      !Number.isInteger(player.activeIndex)) return false;
  return player.actives.length ? player.activeIndex>=0&&player.activeIndex<player.actives.length : player.activeIndex===0;
}

export function selectActiveId(player, id) {
  if (!validSelection(player) || !known(id)) return false;
  const index=player.actives.indexOf(id);
  if (index<0) return false;
  player.activeIndex=index;
  return true;
}

export function cycleActiveId(player, direction = 1) {
  if (!validSelection(player) || !player.actives.length || !Number.isSafeInteger(direction) || direction===0) return false;
  const count=player.actives.length;
  player.activeIndex=((player.activeIndex+direction%count)%count+count)%count;
  return true;
}

export function activeSelectionView(player) {
  const entries=Array.isArray(player?.actives)?player.actives.filter(known).map(id=>{
    const {cn,desc,cd}=ACTIVE_MAP[id];return {id,cn,desc,cd};
  }):[];
  return {currentId:validSelection(player)?player.actives[player.activeIndex]??null:null,
    remainingCd:Number.isFinite(player?.activeCd)&&player.activeCd>=0?player.activeCd:0,entries};
}
