import {applyFieldAmmo} from './altar_effects.js';
import {planPartyBusiness} from './party_business.js';
import {Player} from './player.js';
import {capturePlayer,savedWeaponDefinition} from './session.js';
import {WeaponAssetsRuntime} from './weapon_assets_runtime.js';
import {WeaponSerialAllocator} from './world_weapon_services.js';
import {RNG} from '../core/rng.js';
import {spellFromWeapon} from './spells.js';
import {WEAPON_MAP} from './data.js';
import {ATTACH_MAP} from './attachments.js';
import {pickupState} from './objects.js';
import {planEquipmentDrops,weaponDropEntries} from './equipment_drops.js';
import {preferences} from './preferences.js';
import {resourceContext} from './resource_observation.js';
import {applyAmmoPickup} from './equipment_transaction.js';
import {commitSupplyClaim} from './build_supply_bridge.js';
import {pickupReady,pickupPathClear} from './pickup_path.js';
import {doctrineFloor,prepareDoctrineChoice,applyDoctrineToggle,applyDoctrineConfirm} from './doctrine_choice_v3.js';
import {planPartyConsumablePickup,planPartyRewardCommand} from './party_rewards.js';
import {relicRisk} from './relic_risks.js';
import {planCoopRewardClaim,planCoopRewardConsume} from './coop_rewards.js';
import {doctrineChoiceData} from './doctrine_state_v3.js';

const environments=new WeakMap();
function environment(draft){
  let env=environments.get(draft);if(env)return env;
  const rng=new RNG(draft.world.rng.seed),grng=new RNG(draft.world.grng.seed);rng.s=draft.world.rng.s;grng.s=draft.world.grng.s;
  env={rng,grng,allocator:new WeaponSerialAllocator(draft.world.allocator)};environments.set(draft,env);return env;
}
// Explicit, restricted context: original Player methods and immutable hero hooks
// run here; unknown services throw rather than silently swallowing effects.
export function partyAcquisitionProjection(world,draft,actorId){
  const actor=draft.actors[actorId],live=world.getActor(actorId);if(!actor||!live)throw Error('Unknown party projection actor');
  const shared=environment(draft),room=draft.world.roomStates[draft.world.roomUid],drops=[],effects=[];
  const ctx={mode:world.mode,hero:live.hero,mod_:structuredClone(draft.world.mod_||{}),floor:draft.world.floor,
    runId:draft.runId,room:draft.world.dungeon.rooms.find(r=>r.uid===draft.world.roomUid),buildSupply:structuredClone(actor.buildSupply),
    time:draft.world.time,practice:draft.world.practice,flowVersion:draft.world.flowVersion,stage:draft.world.stage,
    experiment:structuredClone(actor.experiment),combatMode:actor.personal.combatMode,
    resourceContext:resourceContext(live.view),resourceRoom:draft.world.roomUid,
    tel:structuredClone(actor.telemetry),...structuredClone(actor.tracking),spellDefs:new Map(),
    rng:shared.rng,grng:shared.grng,weaponSerialAllocator:shared.allocator,
    _equipmentDropWorld:world,_equipmentPreferences:preferences.get(),_plannedEquipmentDrops:drops,
    hitboxes:[],pickups:{list:room.pickups,t:draft.world.pickupClock},
    toast(...args){effects.push({kind:'toast',args});},
    hud:{toast(...args){effects.push({kind:'toast',args});}},
    particles:{ring(...args){effects.push({kind:'ring',args});}},
    emit(event,data){const fn=this.hero?.hook?.[event];if(fn)fn(this.player,data||{},this);},
    spellFor(id){const def=WEAPON_MAP[id];return def?spellFromWeapon(def):null;},
    metaSee(kind,id){const seen=actor.meta?.seen?.[kind];if(this.mode==='run'&&id&&seen&&!seen.includes(id))seen.push(id);},
    telNow(){return Object.values(this.tel?.timeByFloor||{}).reduce((n,v)=>n+v,0);},
    telFirst(key){if(this.tel){this.tel.firstOf||={};if(!Object.hasOwn(this.tel.firstOf,key))this.tel.firstOf[key]=+this.telNow().toFixed(1);}},
    gr(){return shared.grng.next();},
    telAmmo(dir,n){const key=dir==='in'?'ammoIn':'ammoOut';this.tel[key]||={};this.tel[key].ammo=(this.tel[key].ammo||0)+n;},
    telService(id){this.tel.services||={};this.tel.services[id]=(this.tel.services[id]||0)+1;},
    telHeal(src,requested,applied){if(this.tel){this.tel.healBy||={};this.tel.healWasted||={};this.tel.healBy[src]=(this.tel.healBy[src]||0)+applied;this.tel.healWasted[src]=(this.tel.healWasted[src]||0)+Math.max(0,requested-applied);}},
    telCoins(dir,src,n){if(this.tel){const key=dir==='in'?'coinsIn':'coinsOut';this.tel[key]||={};this.tel[key][src]=(this.tel[key][src]||0)+n;}},
    newSynergies(list){this._knownSyn||=new Set();for(const s of list)if(!this._knownSyn.has(s.id)){this._knownSyn.add(s.id);this.telFirst('firstSynergy');this.metaSee('synergy',s.id);}},
    claimWeaponInstance(runtime,gun){if(gun.assetInstanceId)for(const [id,a]of Object.entries(draft.actors))if(id!==actorId&&(a.player.weapons.some(w=>w.assetInstanceId===gun.assetInstanceId)||Object.values(draft.world.roomStates).some(st=>st.actorRuntimes?.[id]?.states?.[gun.assetInstanceId])))throw Error('Weapon instance belongs to teammate');},
  };
  const p=Object.assign(Object.create(Player.prototype),structuredClone(actor.player));
  p.weapons=p.weapons.map(w=>({...w,def:savedWeaponDefinition(w)}));p.game=ctx;p.hero=live.hero;p.stats=structuredClone(live.player.stats);
  p.setGunModel=model=>effects.push({kind:'gun-model',model});ctx.player=p;
  const runtime=new WeaponAssetsRuntime(ctx);Object.assign(runtime,structuredClone(room.actorRuntimes[actorId]));ctx.weaponAssets=runtime;runtime.bindInventory(p);
  const spawnPlan=plan=>plan.map(({kind,x,z,...opts})=>{const data=pickupState(kind,x,z,{...opts,pickupId:`party-pickup:${++draft.world.pickupSerial}`},draft.world.pickupClock);drops.push(data);return data;});
  ctx.dropWeaponPickup=(gun,x,z,direction,options={})=>{
    const plan=planEquipmentDrops(ctx,weaponDropEntries(ctx,gun,options),{x,z,direction:direction||p.aim});
    runtime.drop(gun.assetInstanceId);if(gun.assetInstanceId)delete runtime.states[gun.assetInstanceId];return spawnPlan(plan)[0];
  };
  ctx.dropAttachmentPickup=id=>ATTACH_MAP[id]?spawnPlan(planEquipmentDrops(ctx,[{kind:'attachment',id,attId:id}]))[0]:null;
  ctx.grantAttachmentReward=id=>p.spareAttachments.length<p.spareCap()?p.addAttachment(id):!!ctx.dropAttachmentPickup(id);
  return {game:ctx,player:p,drops,effects,spawnPlan,finish(){
    actor.player=capturePlayer(p);actor.telemetry=structuredClone(ctx.tel);actor.buildSupply=structuredClone(ctx.buildSupply);
    for(const key of new Set([...Object.keys(actor.tracking),'_knownSyn','_weaponSeen','_spellForms','_shopBought','_attSeen']))if(ctx[key]!==undefined)actor.tracking[key]=structuredClone(ctx[key]);
    room.actorRuntimes[actorId]=runtime.capture();room.pickups.push(...structuredClone(drops));
    draft.world.rng.s=shared.rng.s;draft.world.grng.s=shared.grng.s;draft.world.allocator=shared.allocator.capture();return this;
  }};
}
function expect(ok,why){if(!ok)throw Error(why);}
function weaponIndex(p,request){const i=request.weaponInstanceId?p.weapons.findIndex(w=>w.assetInstanceId===request.weaponInstanceId):request.weaponIndex??p.weaponIndex;expect(Number.isInteger(i)&&i>=0&&i<p.weapons.length,'Stale party weapon');return i;}
export function planPartyCommand(store,draft,actorId,request){
  const actor=draft.actors[actorId],w=draft.world,live=store.game.getActor(actorId),room=w.roomStates[w.roomUid];
  expect(live.player.alive&&store.game.state==='play','Party actor unavailable');
  const business=planPartyBusiness(store,draft,actorId,request);if(business)return business;
  const reward=planPartyRewardCommand(store,draft,actorId,request);if(reward)return reward;
  if(request.kind==='doctrine-open'||request.kind==='doctrine-toggle'||request.kind==='doctrine-confirm'){
    expect(actor.hero==='veteran'&&actor.heroRuleVersion===3,'Actor has no doctrine choice');
    const projection=store.actorProjection(draft,actorId),p=projection.player;
    if(request.kind==='doctrine-open'){
      expect(!p.c2.doctrinePending,'Doctrine choice already open');
      const floor=doctrineFloor(projection.game);expect(floor&&!p.c2.doctrineFloors.includes(floor),'Doctrine floor unavailable');
      // Same original rule helper, with the single shared detached RNG.
      projection.game.gr=()=>projection.game.grng.next();
      projection.game.rollChoice=(...args)=>Object.getPrototypeOf(store.game).rollChoice.apply(projection.game,args);
      expect(prepareDoctrineChoice(projection.game),'Doctrine choice unavailable');
      actor.choiceContext={actorId,roomUid:w.roomUid,token:`${draft.revision+1}:${actorId}:doctrine`};
    }else{
      expect(actor.choiceContext?.actorId===actorId&&actor.choiceContext.roomUid===w.roomUid&&request.choiceToken===actor.choiceContext.token,'Stale typed choice');
      if(request.kind==='doctrine-toggle')expect(applyDoctrineToggle(p,request.doctrineId),'Invalid doctrine toggle');
      else{expect(applyDoctrineConfirm(p),'Doctrine choice incomplete');actor.choiceContext=null;}
    }
    projection.finish();actor.choice=doctrineChoiceData(p);return {kind:request.kind,choiceToken:actor.choiceContext?.token||null};
  }
  const projection=store.actorProjection(draft,actorId),p=projection.player;
  if(request.kind==='collect'){
    const source=room.pickups.find(p=>p.pickupId===request.pickupId),liveSource=store.game.pickups.list.find(p=>p.pickupId===request.pickupId);
    expect(source&&liveSource&&!source.collected&&!source.price&&!(source.shopIndex>=0),'Party pickup unavailable');
    expect(!source.recipientId||source.recipientId===actorId,'Pickup belongs to teammate');
    expect(pickupReady(liveSource)&&(!live.view.panelOpen()||request.choiceToken&&actor.choiceContext?.token===request.choiceToken)&&Math.hypot(p.x-source.x,p.z-source.z)<=2.2&&pickupPathClear(store.game,p.x,p.z,source.x,source.z),'Pickup unreachable');
    if(actor.choiceContext?.pickupId===source.pickupId){
      expect(request.choiceToken===actor.choiceContext.token&&actor.choiceContext.roomUid===w.roomUid&&actor.choiceContext.inventory===JSON.stringify([actor.player.items,actor.player.spareAttachments,actor.player.weapons.map(g=>[g.assetInstanceId,g.attachments])]),'Stale pickup choice');
    }
    if(source.kind==='item'&&relicRisk(source.id,p).risky)expect(request.choiceToken&&actor.choiceContext?.kind==='relic','Risk relic requires confirmation');
    if(source.kind==='attachment'&&request.replaceIndex!==undefined){
      expect(actor.choiceContext?.kind==='attachment'&&request.choiceToken===actor.choiceContext.token,'Replacement requires confirmation');
      expect(Number.isInteger(request.replaceIndex)&&p.spareAttachments[request.replaceIndex],'Stale spare attachment');
      expect(projection.game.dropAttachmentPickup(p.spareAttachments[request.replaceIndex]),'No safe attachment drop');p.spareAttachments.splice(request.replaceIndex,1);
    }
    // Original business rules consume exactly the recorded pickup.
    let remaining=0;
    let ok=false;const coins=p.coins;
    if(source.kind==='consumable')ok=planPartyConsumablePickup(projection,actor,source,request);
    else if(source.kind==='weapon_crate'){const def=Object.getPrototypeOf(store.game).rollWeaponId.call(projection.game,1);ok=p.giveWeapon(def.id);if(!ok)p.addCoins(10);ok=true;}
    else if(source.kind==='weapon'){ok=p.giveWeapon(source.id,request.slot??-1,{...source,source:source.source});ok=ok||p.coins>coins;}
    else if(source.kind==='attachment')ok=p.addAttachment(source.attId||source.id);
    else if(source.kind==='item')ok=p.addItem(source.id);
    else if(source.kind==='active')ok=p.giveActive(source.id)||p.coins>coins;
    else if(source.kind==='coin')ok=p.addCoins(source.amount,source.coinSrc||'pickup');
    else if(source.kind==='ammo'){if(/^altar:[0-9a-f]+:ammo$/.test(source.sourceEventId||'')){const n=applyFieldAmmo(p,source.amount);expect(n>0,'Field ammunition already full');remaining=source.amount-n;ok=true;}else{ok=true;for(let i=0;i<source.amount;i++)expect(applyAmmoPickup(p).ok,'Ammo grant rejected');}}
    else if(source.kind==='heal'){expect(p.hp<p.maxHp||p.hero?.hook?.onHeal,'Life already full');const n=p.hero?.hook?.onHeal?source.amount:Math.min(source.amount,p.maxHp-p.hp);p.heal(n,source.healSrc||'drop');remaining=source.amount-n;ok=true;}
    else if(source.kind==='key'){p.keys+=source.amount;ok=true;}
    else if(source.kind==='armor'){const n=Math.min(source.amount,5-p.armor);expect(n>0,'Armor already full');p.armor+=n;remaining=source.amount-n;ok=true;}
    expect(ok,'Original acquisition rejected; pickup retained');
    if(source.supplyKey&&!remaining){const ledger={buildSupply:actor.buildSupply};expect(commitSupplyClaim(ledger,source.supplyKey).ok,'Invalid supply claim');actor.buildSupply=ledger.buildSupply;projection.game.buildSupply=ledger.buildSupply;}
    if(source.offerId){const identity={runId:draft.runId,eventId:`claim:${draft.revision+1}:${source.pickupId}`,offerId:source.offerId,playerId:actorId};const claim=['coin','ammo','heal','armor','key'].includes(source.kind)?planCoopRewardConsume(w.coopRewards,{...identity,amount:source.amount-remaining}):planCoopRewardClaim(w.coopRewards,identity);w.coopRewards=claim.ledger;}
    if(remaining)source.amount=remaining;else room.pickups.splice(room.pickups.indexOf(source),1);
    if(request.choiceToken){actor.choice=null;actor.choiceContext=null;}
    if(source.kind==='weapon')projection.game.tel.weaponPickups=(projection.game.tel.weaponPickups||0)+1;
  }else if(request.kind==='weapon-drop'){
    const i=weaponIndex(p,request);expect(p.weapons.length>1,'Keep the final weapon');projection.game.dropWeaponPickup(p.weapons[i],p.x,p.z,p.aim,{whole:!!request.whole});p.weapons.splice(i,1);p.weaponIndex=Math.min(p.weaponIndex,p.weapons.length-1);p.reloading=false;p.reloadT=0;p.recompute();
  }else if(request.kind==='attachment-install'){
    const result=p.installAttachment(request.attachmentId,weaponIndex(p,request),request.slotIndex??-1);expect(result.ok,result.why);
  }else if(request.kind==='attachment-detach')expect(p.detachAttachment(request.attachmentId,weaponIndex(p,request)),'Attachment detach rejected');
  else if(request.kind==='attachment-drop')expect(p.dropSpareAttachment(request.index),'Attachment drop rejected');
  else throw Error('Unsupported party command: '+request.kind);
  projection.finish();return {kind:request.kind,pickupId:request.pickupId||null};
}
