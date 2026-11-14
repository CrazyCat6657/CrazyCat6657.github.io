import {WEAPONS,ITEMS} from './data.js';
import {ATTACHMENTS} from './attachments.js';
import {planEquipmentDrops,spawnPlannedEquipment} from './equipment_drops.js';

// Current public tiers are 1..4; tier 4 is the artifact tier.
export function rollChapterBossLoot(rng,owned=[]) {
  const weapons=WEAPONS.filter(w=>w.tier>=3),items=ITEMS.filter(i=>(i.rarity||1)>=3&&!owned.includes(i.id));
  const result=[],count=rng.int(3,5);let artifact=false;
  for(let i=0;i<count;i++) {
    const draw=rng.next();
    if(draw<.32&&!artifact) {
      const w=rng.pick(weapons);
      if(w.tier>=4){
        artifact=true;
        // A single artifact replaces every earlier weapon in this direct batch.
        for(let j=result.length-1;j>=0;j--)if(result[j].kind==='weapon')result.splice(j,1);
        result.splice(2);
      }
      result.push({kind:'weapon',id:w.id,definitionVersion:w.weaponAssetVersion||1});
    }else if(items.length&&draw<.80){const item=items.splice(rng.int(0,items.length-1),1)[0];result.push({kind:'item',id:item.id});}
    else {const a=rng.pick(ATTACHMENTS);result.push({kind:'attachment',id:a.id,attId:a.id});}
    if(artifact&&result.length===3)break;
  }
  while(result.length<(artifact?3:count)){const a=rng.pick(ATTACHMENTS);result.push({kind:'attachment',id:a.id,attId:a.id});}
  return result.slice(0,artifact?3:count);
}

export function planChapterBossLoot(game) {
  const entries=rollChapterBossLoot(game.rng,game.player.items||[]);
  const world=game._equipmentDropWorld||game,sc=world.roomScene;
  // Reward boxes are ghosted during combat and become solid after settlement.
  // Plan against that final geometry without changing the live scene before
  // the transaction commits. The same view is used for collision and pickup LOS.
  const planningScene={room:sc.room,ox:sc.ox,oz:sc.oz,inner:sc.inner,half:sc.half,secretOpen:sc.secretOpen,props:sc.props,
    colliders:(sc.colliders||[]).map(c=>c.ref?.bossReward?{...c,move:true}:c),
    pointBlocked:sc.pointBlocked,inDoorGap:sc.inDoorGap,clampToRoom:sc.clampToRoom,hazardAt:sc.hazardAt};
  const planningWorld={roomScene:planningScene,_residentRooms:new Map([[sc.room?.uid||'current',planningScene]]),connectors:{}};
  const planner={player:game.player,pickups:game.pickups,_plannedEquipmentDrops:game._plannedEquipmentDrops,_equipmentDropWorld:planningWorld};
  // Prefer the central safe lane, far from the four diagonal lava pools.
  let plan,last;
  const centers=[{x:sc.ox,z:sc.oz+sc.inner*.20},{x:sc.ox,z:sc.oz},{x:world.player.x,z:world.player.z}];
  for(const dx of [-.45,0,.45])for(const dz of [-.45,0,.45])centers.push({x:sc.ox+dx*sc.inner,z:sc.oz+dz*sc.inner});
  for(const center of centers){
    try {plan=planEquipmentDrops(planner,entries,{...center,direction:{x:1,z:0}});break;}catch(e){last=e;}
  }
  if(!plan)throw last||Error('首领奖励缺少安全落点');
  return {entries,plan:plan.map(p=>({...p,noReturn:false,armDelay:1.2}))};
}

export function dropChapterBossLoot(game){const {entries,plan}=planChapterBossLoot(game);spawnPlannedEquipment(game,plan);return entries;}

// Boss boxes remain ordinary transactional chests, with a stricter weapon floor.
export function bossChestLoot(loot,rng) {
  const pool=WEAPONS.filter(w=>w.tier===3);
  return loot.map(e=>e.kind==='weapon'?{kind:'weapon',id:rng.pick(pool).id}:e);
}
