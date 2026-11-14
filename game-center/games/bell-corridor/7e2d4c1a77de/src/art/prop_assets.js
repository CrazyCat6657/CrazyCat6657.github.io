import * as THREE from '../../vendor/three.module.js';
import {getMaterial} from './materials.js';

let template=null,pending=null;
export const propAssetStatus={state:'idle',bytes:0,loadMs:0,assets:0};
const PALETTES={
  1:{stone:'#536875',stone_dark:'#2d3d48',wood:'#795639',wood_dark:'#413022',metal:'#a0abb2',metal_dark:'#3b4852',accent:'#6fc6dd',cloth:'#285a70'},
  2:{stone:'#614738',stone_dark:'#35291f',wood:'#68432c',wood_dark:'#38241a',metal:'#a27851',metal_dark:'#46372c',accent:'#d08b46',cloth:'#612b2a'},
  3:{stone:'#49434d',stone_dark:'#282630',wood:'#57463b',wood_dark:'#312a2b',metal:'#b79b5b',metal_dark:'#47413b',accent:'#d6b86d',cloth:'#493550'},
};
const FIXED={bone:'#d0c5ab',red:'#973e30',mark:'#e8bd54',black:'#10171c',gold:'#c8a24a',
  pickup_gold:'#e8c84a',pickup_heal:'#e03a4a',pickup_ammo:'#4a6a2a',pickup_lime:'#9dff5a',pickup_armor:'#5a8ac0'};

export function preloadPropAssets(){
  if(pending)return pending;
  pending=(async()=>{
    const start=performance.now(),controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),2500);
    try{
      const [response,{GLTFLoader}]=await Promise.all([
        fetch(new URL('./assets/dungeon-props.glb',import.meta.url),{signal:controller.signal}),
        import('../../vendor/loaders/GLTFLoader.js'),
      ]);
      if(!response.ok)throw Error('Prop assets HTTP '+response.status);
      const bytes=await response.arrayBuffer(),gltf=await new GLTFLoader().parseAsync(bytes,'');
      gltf.scene.traverse(o=>{if(o.isMesh){o.geometry.userData.shared=true;o.castShadow=o.receiveShadow=true;}});
      template=gltf.scene;
      Object.assign(propAssetStatus,{state:'ready',bytes:bytes.byteLength,assets:template.children.length});
    }catch(error){Object.assign(propAssetStatus,{state:'fallback',reason:error.message});console.warn('Prop artwork unavailable; using built-in models.',error.message);}
    finally{clearTimeout(timer);propAssetStatus.loadMs=performance.now()-start;}
    return propAssetStatus;
  })();
  return pending;
}

export function makePropVisual(id,{theme=1,scale=[1,1,1],color=null,explosive=true}={}){
  if(!template || (typeof location!=='undefined'&&new URLSearchParams(location.search).get('propsArt')==='legacy'))return null;
  const source=template.getObjectByName(id);
  if(!source)return null;
  const root=source.clone(true),palette=PALETTES[theme]||PALETTES[1];
  root.scale.set(...scale);root.userData.propArt='blender-'+id;
  root.traverse(o=>{
    if(!o.isMesh)return;
    const material=m=>{
      const role=m.name;
      const tint=role==='accent'&&color?color:role==='red'&&!explosive?'#506b3f':palette[role]||FIXED[role]||'#ffffff';
      const metal=role.startsWith('metal')||['gold','pickup_gold','pickup_armor'].includes(role),glow=role==='accent'||role.startsWith('pickup_');
      return getMaterial(tint,{flat:true,roughness:metal?.68:.88,metalness:metal?.32:0,
        ...(glow?{emissive:tint,emissiveIntensity:role.startsWith('pickup_')?.65:id==='crystal'?.65:.10}:{})});
    };
    if(id==='barrel'&&!explosive&&['mark','black'].includes(o.material.name))o.visible=false;
    o.material=Array.isArray(o.material)?o.material.map(material):material(o.material);
  });
  return root;
}

// Keep the existing object identity, RNG use, physics and behaviour. Animated
// references remain direct children; only static render children are replaced.
export function applyPropAsset(group,id,options={}){
  const visual=makePropVisual(id,options);
  if(!visual)return false;
  const keep=new Set(options.keep||[]);
  for(const child of [...group.children])if(!keep.has(child))group.remove(child);
  group.add(visual);group.userData.propArt=visual.userData.propArt;
  return true;
}
