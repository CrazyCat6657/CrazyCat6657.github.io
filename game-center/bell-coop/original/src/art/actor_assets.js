import * as THREE from '../../vendor/three.module.js';
import {actorSlots} from './actor_bindings.js';
import {gunMetalReflection} from './gun_reflections.js';
import {ACTOR_BUNDLES} from './actor_catalog.js';

const bundles=ACTOR_BUNDLES;
const templates=new Map(),ownedMaterials=new WeakMap();let pending=null;
export const actorAssetStatus=Object.fromEntries(Object.keys(bundles).map(k=>[k,{state:'idle',bytes:0,assets:0,loadMs:0}]));
const emptyGeometry=new THREE.BufferGeometry();
emptyGeometry.setAttribute('position',new THREE.Float32BufferAttribute([],3));emptyGeometry.userData.shared=true;
async function loadBundle(bundle,ids){
  const status=actorAssetStatus[bundle],start=performance.now(),controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),4000);
  try{
    const [response,{GLTFLoader}]=await Promise.all([
      fetch(new URL('./assets/actors-'+bundle+'.glb',import.meta.url),{signal:controller.signal}),
      import('../../vendor/loaders/GLTFLoader.js'),
    ]);
    if(!response.ok)throw Error('Actor assets HTTP '+response.status);
    const bytes=await response.arrayBuffer(),gltf=await new GLTFLoader().parseAsync(bytes,'');
    for(const id of ids)if(!gltf.scene.getObjectByName('Actor_'+id))throw Error('Missing actor '+id);
    gltf.scene.traverse(o=>{if(o.isMesh){
      o.geometry.userData.shared=true;o.castShadow=true;o.receiveShadow=true;
      for(const material of Array.isArray(o.material)?o.material:[o.material])if(material.metalness>=.35){material.envMap=gunMetalReflection();material.envMapIntensity=.8;}
    }});
    for(const id of ids)templates.set(id,gltf.scene.getObjectByName('Actor_'+id));
    Object.assign(status,{state:'ready',bytes:bytes.byteLength,assets:ids.length});
  }catch(error){Object.assign(status,{state:'fallback',reason:error.message});console.warn('Actor artwork unavailable; using built-in models.',bundle,error.message);}
  finally{clearTimeout(timer);status.loadMs=performance.now()-start;}
  return status;
}
export function preloadActorAssets(){return pending??=Promise.all(Object.entries(bundles).map(([bundle,ids])=>loadBundle(bundle,ids)));}

export function applyBlenderActorVisual(rig,id){
  const source=templates.get(id);
  if(!source||rig.group.userData.actorArt||(typeof location!=='undefined'&&new URLSearchParams(location.search).get('actorArt')==='legacy'))return false;
  const slots=actorSlots(rig,id),parts=new Map();
  for(const child of source.children){const prefix=id+'_Part_';if(child.name.startsWith(prefix))parts.set(child.name.slice(prefix.length),child);}
  // Validate the complete replacement before mutating the live rig. A damaged
  // optional bundle must leave all original geometry available for fallback.
  if(parts.size!==Object.keys(slots).length||Object.keys(slots).some(k=>!parts.has(k)))return false;
  const original=[];rig.group.traverse(o=>{if(o.isMesh)original.push(o);});
  const hooks=new Set(Object.values(slots)),materials=new Map();
  const pulses=new Set([rig.core,rig.furnace,rig.gem,rig.bellInner,rig.lens,...(rig.eyes||[])].filter(o=>o?.isMesh));
  const cloneMaterial=material=>{if(!materials.has(material))materials.set(material,material.clone());return materials.get(material);};
  for(const mesh of original){
    if(hooks.has(mesh)){
      mesh.geometry=emptyGeometry;
      mesh.userData.actorHook=true;
      // Boss hit-flash traversal also visits these retained Mesh hooks.
      // Isolate even their invisible materials from the legacy material cache.
      mesh.material=Array.isArray(mesh.material)?mesh.material.map(cloneMaterial):cloneMaterial(mesh.material);
      // Keep the animated Mesh identity/material, but skip zero-vertex draw
      // submissions. Layers are local to this node; its new children still draw.
      mesh.layers.disableAll();
    }else mesh.removeFromParent();
  }
  for(const [name,sourcePart] of parts){
    const hook=slots[name],part=sourcePart.clone(true);
    part.position.set(0,0,0);part.quaternion.identity();part.scale.set(1,1,1);
    // These material references are animated by the existing boss consumer.
    const pulse=pulses.has(hook);
    if(pulse)hook.userData.actorPulseHook=true;
    part.traverse(o=>{if(o.isMesh){o.userData.actorMesh=true;o.material=pulse?hook.material:Array.isArray(o.material)?o.material.map(cloneMaterial):cloneMaterial(o.material);}});
    hook.add(part);
  }
  rig.group.userData.actorArt='blender-'+id;
  ownedMaterials.set(rig.group,new Set(materials.values()));
  return true;
}

export function syncActorPulseMaterials(group){
  const owned=ownedMaterials.get(group);if(!owned)return;
  // Elite tint replaces each mesh material separately. Rejoin the visible
  // emitter to the original animated hook before any animation/hit flash runs.
  group.traverse(hook=>{if(hook.userData.actorPulseHook){
    owned.add(hook.material);
    hook.traverse(o=>{if(o.isMesh&&o.userData.actorMesh){owned.add(o.material);o.material=hook.material;}});
  }});
}

export function disposeActorVisual(group){
  const materials=ownedMaterials.get(group);if(!materials)return;
  // Hit flashes and elite tint may have added another per-instance clone.
  group.traverse(o=>{if(o.isMesh&&(o.userData.actorMesh||o.userData.actorHook)){for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);if(o.userData._hitMat)materials.add(o.userData._hitMat);}});
  for(const material of materials)material.dispose();
  ownedMaterials.delete(group);
  // Geometry and the reflection texture belong to the shared bundle cache.
}
