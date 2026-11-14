// Rigid visual slots. Object identities and all gameplay transforms belong to
// the original rigs; Blender meshes only supply geometry below these nodes.
import {ACTOR_CATALOG} from './actor_catalog.js';
const cached=new WeakMap();
function remainingSlots(rig){
  if(cached.has(rig))return cached.get(rig);
  const candidates=new Map([[rig.group,'staticRoot']]),seen=new Set([rig.group,rig.weaponMount]);
  const visit=(value,path)=>{
    if(!value||typeof value!=='object')return;
    if(value.isObject3D){if(!seen.has(value)){seen.add(value);candidates.set(value,path);}return;}
    if(Array.isArray(value))value.forEach((o,i)=>visit(o,path+i));
    else for(const [key,o] of Object.entries(value))visit(o,path+'_'+key);
  };
  for(const [key,value] of Object.entries(rig))if(key!=='group'&&key!=='weaponMount')visit(value,key);
  const owners=new Set();
  rig.group.traverse(o=>{if(o.isMesh){let owner=o;while(owner&&!candidates.has(owner))owner=owner.parent;if(owner)owners.add(owner);}});
  const slots=Object.fromEntries([...candidates].filter(([node])=>owners.has(node)).map(([node,name])=>[name,node]));cached.set(rig,slots);return slots;
}
export function actorSlots(rig,id){
  if(id==='rusher'){
    const slots={body:rig.body,neck:rig.neck,head:rig.head,tail:rig.tail};
    rig.legs.forEach((leg,i)=>['hip','knee','paw'].forEach(k=>slots['leg'+i+'_'+k]=leg[k]));return slots;
  }
  if(id==='bomber'){
    const slots={body:rig.body,head:rig.head,core:rig.core};
    rig.legs.forEach((leg,i)=>['hip','knee'].forEach(k=>slots['leg'+i+'_'+k]=leg[k]));return slots;
  }
  if(id==='turret')return{body:rig.body,turret:rig.turret,barrel:rig.barrel,lens:rig.lens};
  if(id==='bell_beast'){
    const slots=Object.fromEntries(['torso','neck','head','jaw','tail','tailFlail','flailSpike','bell','bellLip','bellCore','bellYoke'].map(k=>[k,rig[k]]));
    rig.chains.forEach((o,i)=>slots['chain'+i]=o);
    rig.spine.forEach((o,i)=>slots['spine'+i]=o);
    rig.eyes.forEach((o,i)=>slots['eye'+i]=o);
    rig.legs.forEach((leg,i)=>['upper','knee','claw'].forEach(k=>slots['leg'+i+'_'+k]=leg[k]));
    return slots;
  }
  if(id!=='grunt'&&id!=='shielder')return ACTOR_CATALOG[id]?remainingSlots(rig):{};
  const slots=Object.fromEntries(['hips','torso','neck','head'].map(k=>[k,rig[k]]));
  for(const limb of ['armR','armL'])for(const k of ['sh','el','hand'])slots[limb+'_'+k]=rig[limb][k];
  for(const limb of ['legR','legL'])for(const k of ['hip','knee','foot'])slots[limb+'_'+k]=rig[limb][k];
  if(rig.shield)slots.shield=rig.shield;
  return slots;
}
