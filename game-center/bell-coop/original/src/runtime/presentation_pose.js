// Browser-safe semantic rig poses. Native node references survive GLB replacement;
// child-index paths do not. Removed decorative meshes have no semantic reference.
const excluded=new Set(['game','parent','children','geometry','material','userData','def','hero','ownerRef','stats','shopSlot']);
export function capturePresentationPose(entity){
 const out=[],seen=new Set(),walked=new Set();
 function visit(value,path,depth){
  if(!value||typeof value!=='object'||depth>5||walked.has(value))return;
  walked.add(value);
  if(value.isObject3D){if(seen.has(value))return;seen.add(value);
   const m=value.material?(Array.isArray(value.material)?value.material:[value.material]):[];
   out.push({path,position:value.position.toArray(),rotation:value.rotation.toArray(),scale:value.scale.toArray(),visible:value.visible,...(m.length?{materials:m.map(x=>({color:x.color?.getHex(),emissive:x.emissive?.getHex(),emissiveIntensity:x.emissiveIntensity,opacity:x.opacity,transparent:x.transparent}))}:{})});return;}
  if(Array.isArray(value)){value.forEach((v,i)=>visit(v,[...path,i],depth+1));return;}
  if(Object.getPrototypeOf(value)!==Object.prototype&&path.length>0)return;
  for(const [key,v]of Object.entries(value))if(!excluded.has(key))visit(v,[...path,key],depth+1);
 }
 // A class instance at the root is intentional; only its explicit data members.
 visit(entity,[],0);
 return out;
}
export function applyPresentationPose(entity,poses,{strict=true}={}){
 for(const p of poses||[]){let node=entity;for(const key of p.path)node=node?.[key];
  if(!node?.isObject3D){if(strict)throw Error('Original rig hook unavailable: '+p.path.join('.'));continue;}
  node.position.fromArray(p.position);node.rotation.fromArray(p.rotation);node.scale.fromArray(p.scale);node.visible=p.visible;
  const materials=node.material?(Array.isArray(node.material)?node.material:[node.material]):[];
  p.materials?.forEach((v,i)=>{const m=materials[i];if(!m)return;if(v.color!==undefined)m.color?.setHex(v.color);if(v.emissive!==undefined)m.emissive?.setHex(v.emissive);if(v.emissiveIntensity!==undefined)m.emissiveIntensity=v.emissiveIntensity;if(v.opacity!==undefined)m.opacity=v.opacity;if(v.transparent!==undefined)m.transparent=v.transparent;});
 }
}
