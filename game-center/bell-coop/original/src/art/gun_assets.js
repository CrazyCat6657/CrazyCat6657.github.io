import * as THREE from '../../vendor/three.module.js';
import {getMaterial} from './materials.js';
import {ARSENAL_BUNDLES,ARSENAL_STYLES} from './arsenal_assets_data.js';
import {gunMetalReflection} from './gun_reflections.js';

const templates=new Map(),motions=new WeakMap();
let pending=null;
export const gunAssetStatus={state:'idle',bytes:0,loadMs:0,assets:0};
export const arsenalBundleStatus=Object.fromEntries(Object.keys(ARSENAL_BUNDLES).map(k=>[k,{state:'idle',bytes:0,loadMs:0,assets:0}]));
// Diagnostic compatibility with the older small-set art probes.
export const eliteGunAssetStatus=gunAssetStatus,tacticalGunAssetStatus=gunAssetStatus;
const moving=/^(reload|charge|heat|heat\d+|pump|spin|pendulum|mode|anchor\d+|sequence\d+)$/;
const emptyGeometry=new THREE.BufferGeometry();
emptyGeometry.setAttribute('position',new THREE.Float32BufferAttribute([],3));emptyGeometry.userData.shared=true;

async function loadBundle(group,ids,status){
  const start=performance.now(),controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),4000);
  try{
    const [response,{GLTFLoader}]=await Promise.all([
      fetch(new URL('./assets/arsenal-'+group+'.glb',import.meta.url),{signal:controller.signal}),
      import('../../vendor/loaders/GLTFLoader.js'),
    ]);
    if(!response.ok)throw Error('Gun assets HTTP '+response.status);
    const bytes=await response.arrayBuffer(),gltf=await new GLTFLoader().parseAsync(bytes,'');
    for(const id of ids)if(!gltf.scene.getObjectByName('Gun_'+id))throw Error('Missing gun node '+id);
    gltf.scene.traverse(o=>{if(o.isMesh){
      o.geometry.userData.shared=true;o.castShadow=true;
      for(const material of Array.isArray(o.material)?o.material:[o.material])if(material.metalness>=.35){
        material.envMap=gunMetalReflection();material.envMapIntensity=.8;
      }
    }});
    for(const id of ids)templates.set(id,gltf.scene.getObjectByName('Gun_'+id));
    Object.assign(status,{state:'ready',bytes:bytes.byteLength,assets:ids.length});
  }catch(error){
    Object.assign(status,{state:'fallback',reason:error.message});
    console.warn('Gun artwork unavailable; using built-in models.',group,error.message);
  }finally{clearTimeout(timer);status.loadMs=performance.now()-start;}
  return status;
}

export function preloadGunAssets(){
  return pending??=(async()=>{
    const start=performance.now();
    const statuses=await Promise.all(Object.entries(ARSENAL_BUNDLES).map(([group,ids])=>loadBundle(group,ids,arsenalBundleStatus[group])));
    Object.assign(gunAssetStatus,{state:statuses.every(s=>s.state==='ready')?'ready':statuses.some(s=>s.state==='ready')?'partial':'fallback',
      bytes:statuses.reduce((n,s)=>n+s.bytes,0),assets:statuses.reduce((n,s)=>n+s.assets,0),loadMs:performance.now()-start});
    return gunAssetStatus;
  })();
}

export function applyBlenderGunVisual(model,id){
  const source=templates.get(id);
  if(!source||(typeof location!=='undefined'&&new URLSearchParams(location.search).get('gunArt')==='legacy'))return false;
  const visual=source.clone(true),style=ARSENAL_STYLES[id],parts=new Map();
  for(const child of visual.children){
    const prefix=id+'_Part_';if(child.name.startsWith(prefix))parts.set(child.name.slice(prefix.length),child);
  }
  // Snapshot original hooks before inserting geometry. Original node identity,
  // bind transforms and animated visibility remain authoritative.
  const hooks=new Map();model.traverse(o=>{if(moving.test(o.name)&&!hooks.has(o.name))hooks.set(o.name,o);});
  const replaced=new Set([...parts.keys()].filter(name=>hooks.has(name))),remove=[];
  model.traverse(o=>{
    if(!o.isMesh)return;
    let animated=null,replacing=false;
    for(let p=o;p&&p!==model;p=p.parent){
      if(moving.test(p.name)&&!animated)animated=p;
      if(replaced.has(p.name))replacing=true;
    }
    if(!animated||replacing){
      // Keep named mesh indicators and descendants; only suppress old geometry.
      if(moving.test(o.name))o.geometry=emptyGeometry;else remove.push(o);
      return;
    }
    o.material=!/^(charge|heat\d*|anchor\d+|sequence\d+)$/.test(animated.name)
      ?getMaterial(style.shell,{flat:true,roughness:.4,metalness:.7})
      :getMaterial(style.signal,{flat:true,roughness:.55,metalness:0,emissive:style.signal,emissiveIntensity:.65});
  });
  for(const o of remove)o.removeFromParent();
  model.getObjectByName('assetBody').add(visual);model.updateMatrixWorld(true);
  for(const name of replaced)hooks.get(name).attach(parts.get(name));
  for(const part of parts.values()){
    const parent=hooks.get(part.userData.parentHook);if(parent)parent.attach(part);
  }
  model.userData.gunArt='blender-'+id;
  const find=name=>parts.get(name)||visual.getObjectByName(id+'_'+name)||visual.getObjectByName(name);
  const floats=[];
  for(let i=0;i<3;i++){const node=find('ArtFloat'+i);if(node)floats.push({node,y:node.position.y,ry:node.rotation.y,phase:i*2.1});}
  const pulse=find('ArtPulse'),charge=find('ArtCharge'),rotors=[];
  for(const [name,node] of parts){const match=/^ArtRotor([XYZ])?\d*$/.exec(name);if(match)rotors.push({node,axis:(match[1]||'Z').toLowerCase()});}
  motions.set(model,{floats,pulse,scale:pulse?.scale.toArray(),charge,chargeScale:charge?.scale.toArray(),rotors});
  return true;
}

export function animateBlenderGunVisual(model,state={}){
  const motion=motions.get(model);if(!motion)return;
  const time=state.time||0;
  for(const f of motion.floats){f.node.position.y=f.y+Math.sin(time*1.8+f.phase)*.012;f.node.rotation.y=f.ry+Math.sin(time*.8+f.phase)*.22;}
  if(motion.pulse){const amount=1+Math.sin(time*3.8)*.035+(state.firing?.025:0);motion.pulse.scale.set(motion.scale[0]*amount,motion.scale[1]*amount,motion.scale[2]*amount);}
  if(motion.charge){const amount=.65+.35*Math.max(0,Math.min(1,state.charge||0)),s=motion.chargeScale;motion.charge.scale.set(s[0]*amount,s[1]*amount,s[2]*amount);}
  for(const {node,axis} of motion.rotors)node.rotation[axis]=time*(state.firing?9:1.4);
}
