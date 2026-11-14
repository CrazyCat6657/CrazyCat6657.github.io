import * as THREE from '../../vendor/three.module.js';
import { gamePlatform } from '../runtime/game_platform.js';

let reflection=null;
// One tiny shared studio-like reflection for machined weapon surfaces. This is
// a material input, not a scene light or postprocess: stone, UI and legacy art
// retain the scene's lighting. Standard PBR otherwise makes metal almost black
// in rooms lit mainly by ambient/hemisphere lights, which have no specular IBL.
export function gunMetalReflection(){
  if(reflection)return reflection;
  if(gamePlatform().kind==='headless') {
    reflection=new THREE.CubeTexture(Array.from({length:6},()=>({data:new Uint8Array([255,255,255,255]),width:1,height:1})));
    reflection.colorSpace=THREE.SRGBColorSpace;reflection.name='headless_weapon_metal';reflection.needsUpdate=true;
    return reflection;
  }
  const faces=[];
  for(let face=0;face<6;face++){
    const canvas=document.createElement('canvas');canvas.width=canvas.height=32;
    const ctx=canvas.getContext('2d'),gradient=ctx.createLinearGradient(0,0,0,32);
    gradient.addColorStop(0,face===2?'#dae1e5':'#a7b3bf');
    gradient.addColorStop(.43,face===3?'#353b43':'#687888');
    gradient.addColorStop(.55,'#29333c');gradient.addColorStop(1,'#171d25');
    ctx.fillStyle=gradient;ctx.fillRect(0,0,32,32);
    if(face!==3){ctx.fillStyle=face===2?'#eff1ed':'#c4cdd2';ctx.fillRect(face%2?20:5,3,5,19);}
    faces.push(canvas);
  }
  reflection=new THREE.CubeTexture(faces);reflection.colorSpace=THREE.SRGBColorSpace;
  reflection.name='shared_weapon_metal_32px';reflection.needsUpdate=true;
  return reflection;
}
