import {damageSource,resolveDamageActor} from './damage_context.js';

// Shared ordinary/Boss build settlement. Secondary hits never spawn another child.
export function applyBuildFreeze(target,opts={}){
  const c=opts.assetShot?.buildContext||opts.buildContext;
  if(!c||target.isBoss||opts.assetSecondary)return;
  if(c.forceFreeze){target.applyStatus('freeze',1.5);return;}
  if(!(c.freezeHits>0)||!opts.rootShotId||!opts.sourceInstanceId)return;
  const roots=target.buildFreezeRoots||(target.buildFreezeRoots=[]),root=opts.sourceInstanceId+':'+opts.rootShotId;
  if(roots.includes(root))return;
  roots.push(root);if(roots.length>32)roots.shift();
  target.buildFreezeHits=(target.buildFreezeHits||0)+1;
  if(target.buildFreezeHits>=c.freezeHits){target.buildFreezeHits=0;target.applyStatus('freeze',1.5);}
}
export function triggerBuildCritExplosion(target,opts={}){
  if(!opts.crit||opts.assetSecondary)return;
  const c=opts.assetShot?.buildContext||opts.buildContext;
  // Native legacy actions use the same currently held relic projection.
  const actor=resolveDamageActor(target.game,opts),player=actor?.player||(!target.game.actors?target.game.player:null);
  const stats=player?.stats||{},damage=c?.critBoom??stats.critBoom;
  if(!(damage>0))return;
  const radius=3.4*(c?.critBoomRadiusMul??stats.critBoomRadiusMul??1);
  target.game.explode(target.x,.9,target.z,radius,damage*(c?.critBoomDamageMul??stats.explosiveMul??1),0,player,null,
    {...damageSource(opts),sourceInstanceId:opts.sourceInstanceId,rootShotId:opts.rootShotId,
     ...(opts.feedbackCategory?{feedbackCategory:opts.feedbackCategory}:{}),
     ...(opts.feedbackSourceInstanceId?{feedbackSourceInstanceId:opts.feedbackSourceInstanceId}:{}),
     ...(Object.hasOwn(opts,'feedbackRootShotId')?{feedbackRootShotId:opts.feedbackRootShotId}:{}),assetNoRefund:true,assetSecondary:true,
     buildContext:c?{...c,lifesteal:c.relicLifesteal??c.lifesteal,secondary:true}:undefined});
}
export function captureBuildKillContext(target,opts={}){
  const c=opts.buildContext||opts.assetShot?.buildContext;
  target.buildKillContext=c?{...c}:null;
  target.buildKillChain=!!opts.buildChain;
}
export function statusBuildSource(opts={}){
  return {...damageSource(opts),sourceInstanceId:opts.sourceInstanceId||null,rootShotId:opts.rootShotId||null,assetNoRefund:true,
    assetSecondary:true,buildContext:opts.buildContext||opts.assetShot?.buildContext||null,buildChain:!!opts.buildChain};
}
