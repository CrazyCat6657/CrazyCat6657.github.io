import {buildShotContext,validateBuildContext} from './build_effects.js';
import { actorWorldContext } from './actor_context.js';

// Only data crosses an attack/status/save boundary; live refs stay in ownerRef.
const fields=['ownerPlayerId','sourceEntityId','sourceInstanceId','rootShotId','source','feedbackCategory','c2DamageApplied','c2StatusMul','roomUid','createdTick','attackSequence'];
export function damageSource(opts={}) {
  const shot=opts.assetShot||opts.bullet||{};
  const out={};
  for(const k of fields){const v=Object.hasOwn(opts,k)?opts[k]:Object.hasOwn(opts.damageContext||{},k)?opts.damageContext[k]:Object.hasOwn(shot,k)?shot[k]:shot.damageContext?.[k];if(v!==undefined)out[k]=v;}
  const build=opts.buildContext||opts.damageContext?.buildContext||shot.buildContext||shot.damageContext?.buildContext;
  if(build)out.buildContext=structuredClone(build);
  return out;
}
export function resolveDamageActor(context,opts={}, {initiating=false,diagnose=false}={}) {
  const {world,actor}=actorWorldContext(context),source=damageSource(opts);
  if(!world.actors)return null; // isolated original rule fixtures
  let id=source.ownerPlayerId;
  if(id===undefined&&['environment','hazard','trap','suicide'].includes(source.source))id=null;
  if(id===undefined){
    const ref=opts.owner||opts.ownerRef||opts.bullet?.ownerRef;
    if(ref){id=ref.ownerPlayerId;for(const a of world.actors.values())if(a.player===ref||a.companion===ref){id=a.playerId;break;}if(id===undefined)id=null;}
    else if(initiating&&actor)id=actor.playerId;
    else if(world.actors.size===1)id=world.actors.keys().next().value;
  }
  const found=id&&world.actors.get(id);
  if(found?.active)return found;
  if(diagnose&&id!==null){world.damageDiagnostics??=[];if(world.damageDiagnostics.length>=64)world.damageDiagnostics.shift();world.damageDiagnostics.push({code:'unresolved-damage-owner',...source,ownerPlayerId:id??null});}
  return null;
}
export function captureDamageContext(context,opts={}) {
  const {world}=actorWorldContext(context),out=damageSource(opts);
  const actor=resolveDamageActor(context,opts,{initiating:true,diagnose:true});
  out.ownerPlayerId=Object.hasOwn(out,'ownerPlayerId')?out.ownerPlayerId:actor?.playerId??null;
  if(!out.buildContext&&actor?.player?.weapon){out.buildContext=buildShotContext(actor.player,actor.player.weapon,{},true);out.buildContext.sourceInstanceId=out.sourceInstanceId??null;out.buildContext.forceFreeze=false;out.buildContext.freezeHits=0;}
  out.sourceEntityId??=opts.owner?.id||opts.ownerRef?.id||opts.attacker?.id||actor?.player?.id||null;
  out.sourceInstanceId??=null;out.rootShotId??=null;
  out.roomUid??=String(world.room?.uid||world.mode||'world');
  out.createdTick??=Number.isSafeInteger(world.platform?.scheduler?.tick)?world.platform.scheduler.tick:0;
  out.attackSequence??=world._damageRootSequence||0;
  return out;
}
export function emitDamageEvent(context,event,data,opts=data) {
  const {world}=actorWorldContext(context),actor=resolveDamageActor(context,opts,{initiating:true,diagnose:true});
  if(actor)return actor.view.emit(event,data);
  if(!world.actors)return context.emit?.(event,data);
}

export function validDamageContext(value) {
  if(!value||Object.getPrototypeOf(value)!==Object.prototype||Object.keys(value).some(k=>!fields.includes(k)&&k!=='buildContext'))return false;
  for(const k of fields){const v=value[k];if(v===undefined)continue;
    if(['createdTick','attackSequence','c2DamageApplied','c2StatusMul'].includes(k)){if(!Number.isFinite(v)||v<0||v>Number.MAX_SAFE_INTEGER)return false;}
    else if(v!==null&&(typeof v!=='string'||!v.length||v.length>256))return false;
  }
  try{validateBuildContext(value.buildContext,value.buildContext?.sourceInstanceId);}catch{return false;}
  return true;
}
