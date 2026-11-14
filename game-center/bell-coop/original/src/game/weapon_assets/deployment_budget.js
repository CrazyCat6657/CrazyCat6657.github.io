// One bounded budget for live deployments and shells that will become deployments.
// Pending rods also reserve their possible connecting corridor. Derived reservations
// need no new save fields, and therefore apply to old v2 snapshots as well.
export const DEPLOYMENT_LIMITS=Object.freeze({total:40,mine:24,cask:16,rod:24,'rod-corridor':8,spider:20});
const SHELLS=Object.freeze({pressure_mine:'mine',thunder_cask:'cask',grounding_rod:'rod'});
export function deploymentType(e) {
  if(e.kind==='projectile'&&!e.relicBonus&&e.shot?.definitionVersion!==3){
    const borrow=e.shot?.weaponId==='chamber_lottery'&&e.shot?.lottery;
    if(borrow?.version===1&&borrow.action==={pressure_mine:'mine',thunder_cask:'cask'}[borrow.borrowId])return borrow.action;
    return SHELLS[e.shot?.weaponId]||null;
  }
  if(e.kind==='unit')return e.mechanic||'unit';
  if(e.kind==='zone'&&['mine','clock-bomb','rod','rod-corridor'].includes(e.mechanic))return e.mechanic;
  return null;
}
export function deploymentUsage(entities) {
  const usage={total:0,mine:0,cask:0,rod:0,'rod-corridor':0,spider:0},rods=new Map();
  for(const e of entities){
    if(e.ended||!(e.ttl>0))continue;
    const type=deploymentType(e);if(!type)continue;
    usage.total++;if(Object.hasOwn(usage,type))usage[type]++;
    if(type==='rod'){const group=rods.get(e.owner)||{live:0,pending:0};group[e.kind==='projectile'?'pending':'live']++;rods.set(e.owner,group);}
  }
  for(const {live,pending} of rods.values()){
    const corridors=Math.max(0,pending-(live?0:1));
    usage['rod-corridor']+=corridors;usage.total+=corridors;
  }
  return usage;
}
export function deploymentAdmission(entities, additions=[]) {
  const usage=deploymentUsage([...entities,...additions]);
  for(const [type,limit] of Object.entries(DEPLOYMENT_LIMITS))if(usage[type]>limit)return {ok:false,reason:`deployment-${type}`,usage};
  return {ok:true,reason:null,usage};
}
export function validateDeploymentBudget(entities) {
  const result=deploymentAdmission(entities);if(!result.ok)throw Error('Deployment budget exceeded: '+result.reason);
  return result.usage;
}
