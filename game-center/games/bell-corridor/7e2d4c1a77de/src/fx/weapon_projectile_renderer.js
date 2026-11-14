// Shared, bounded batches: visual width never changes collision or damage.
import * as THREE from '../../vendor/three.module.js';
import {teamSafeColor} from '../game/team_colors.js';
import {TEAM} from '../core/constants.js';
import {projectileProfile} from './weapon_projectile_profiles.js';

const CAP=420, IMPACT_CAP=64, DETAIL_CAP=144;
const up=new THREE.Vector3(0,1,0);
function lathe(points){const g=new THREE.LatheGeometry(points.map(p=>new THREE.Vector2(...p)),8);g.rotateX(Math.PI/2);return g;}
function flat(points){const s=new THREE.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:.28,bevelEnabled:false});g.translate(0,0,-.14);g.rotateX(Math.PI/2);return g;}
const star=[];for(let i=0;i<8;i++){const r=i%2?.40:1,a=i*Math.PI/4;star.push([Math.cos(a)*r,Math.sin(a)*r]);}
const saw=[];for(let i=0;i<24;i++){const r=i%2?.76:1,a=i*Math.PI/12;saw.push([Math.cos(a)*r,Math.sin(a)*r]);}
const geometries={
  capsule:lathe([[0,-1],[.7,-.9],[1,-.5],[1,.5],[.7,.9],[0,1]]),
  sphere:new THREE.IcosahedronGeometry(1,1),crystal:new THREE.OctahedronGeometry(1,0),
  dart:new THREE.ConeGeometry(1,2,4).rotateX(Math.PI/2),
  disc:flat(saw),star:flat(star),
  rocket:lathe([[0,-1],[.7,-1],[.75,.4],[.45,.8],[0,1]]),
  grenade:new THREE.DodecahedronGeometry(1,0),
  flame:lathe([[0,-1],[.6,-.6],[1,-.25],[.7,.4],[.2,.8],[0,1]]),
  droplet:lathe([[0,-1],[.7,-.65],[1,-.1],[.6,.5],[0,1]]),
  cube:new THREE.BoxGeometry(1.7,1.7,1.7),
  fork:flat([[-1,-1],[-.45,-1],[-.45,.3],[.45,.3],[.45,-1],[1,-1],[1,1],[-1,1]]),
  comet:new THREE.IcosahedronGeometry(1,0),
  ring:new THREE.TorusGeometry(1,.085,4,20).rotateX(Math.PI/2),
  segment:new THREE.CylinderGeometry(1,1,1,4),
  chip:new THREE.BoxGeometry(1,1,1),
};
// Normalize head bounds to the registry's transverse radius / z half-length contract.
for(const [name,g]of Object.entries(geometries))if(!['ring','segment','chip'].includes(name)){
  g.computeBoundingBox();const b=g.boundingBox,x=Math.max(Math.abs(b.min.x),Math.abs(b.max.x)),z=Math.max(Math.abs(b.min.z),Math.abs(b.max.z));g.scale(1/x,1,1/z);
}
const bodyMaterial=new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:false});
const rimMaterial=new THREE.MeshBasicMaterial({color:0x10212b,side:THREE.BackSide,toneMapped:false});
const detailMaterial=new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:false});

export class WeaponProjectileRenderer {
  constructor(scene){
    this.scene=scene;this.batches={};this.transform=new THREE.Object3D();this.direction=new THREE.Vector3();this.color=new THREE.Color();this.safeColorCache=new Map();
    for(const [name,g]of Object.entries(geometries)){
      const count=name==='segment'?CAP*4:name==='chip'?DETAIL_CAP*4+IMPACT_CAP*5:CAP+IMPACT_CAP;
      const mesh=new THREE.InstancedMesh(g,name==='segment'||name==='chip'||name==='ring'?detailMaterial:bodyMaterial,count);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.count=0;mesh.frustumCulled=false;mesh.visible=false;scene.add(mesh);
      this.batches[name]={mesh,count:0,cap:count};
      if(!['segment','chip','ring'].includes(name)){
        const rim=new THREE.InstancedMesh(g,rimMaterial,CAP);rim.instanceMatrix.setUsage(THREE.DynamicDrawUsage);rim.count=0;rim.frustumCulled=false;rim.visible=false;scene.add(rim);this.batches[name+'Rim']={mesh:rim,count:0,cap:CAP};
      }
    }
    this.begin();
  }
  begin(){for(const b of Object.values(this.batches))b.count=0;this.projectiles=0;this.impacts=0;this.details=0;this.overflow=0;}
  safe(hex){
    const key=typeof hex==='string'?hex:'#b9ffe9';
    if(!this.safeColorCache.has(key)){if(this.safeColorCache.size>=256)this.safeColorCache.clear();this.safeColorCache.set(key,new THREE.Color(teamSafeColor(key,TEAM.PLAYER,{isPlayer:true})));}
    return this.safeColorCache.get(key);
  }
  put(name,x,y,z,sx,sy,sz,yaw,color,rotation=0){
    const b=this.batches[name];if(!b||b.count>=b.cap){this.overflow++;return false;}
    const t=this.transform;t.position.set(x,y,z);t.rotation.set(0,yaw,rotation);t.scale.set(sx,sy,sz);t.updateMatrix();
    b.mesh.setMatrixAt(b.count,t.matrix);if(!name.endsWith('Rim'))b.mesh.setColorAt(b.count,this.safe(color));b.count++;return true;
  }
  segment(a,b,width,color){
    const batch=this.batches.segment;if(batch.count>=batch.cap){this.overflow++;return;}
    const d=this.direction.set(b.x-a.x,b.y-a.y,b.z-a.z),length=d.length();if(length<.001)return;
    const t=this.transform;t.position.set((a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2);t.quaternion.setFromUnitVectors(up,d.divideScalar(length));t.scale.set(width,length,width);t.updateMatrix();
    batch.mesh.setMatrixAt(batch.count,t.matrix);batch.mesh.setColorAt(batch.count,this.safe(color));batch.count++;
  }
  add(v){
    if(this.projectiles>=CAP){this.overflow++;return false;}
    const p=projectileProfile(v),x=v.x??0,z=v.z??0,y=v.y??.78;
    if(![x,y,z].every(Number.isFinite))return false;
    this.projectiles++;
    const time=Number.isFinite(v.visualTime)?v.visualTime:0,age=Math.max(0,time-(Number.isFinite(v.created)?v.created:0));
    const yaw=Math.atan2(Number.isFinite(v.dx)?v.dx:0,Number.isFinite(v.dz)?v.dz:1);
    const mul=Math.max(.75,Math.min(1.7,(Number.isFinite(v.radius)?v.radius:.13)/.13));
    const r=p.radius*mul,l=p.length*mul;
    const spin=['disc','star'].includes(p.shape)?age*17:0;
    const color=p.color||v.color||'#c3ffe6';
    const sy=['disc','star','fork'].includes(p.shape)?r*.75:r;
    this.put(p.shape+'Rim',x,y,z,r*1.13,sy*1.13,l*1.13,yaw+spin,color);
    this.put(p.shape,x,y,z,r,sy,l,yaw+spin,color);
    const d={x:Math.sin(yaw),z:Math.cos(yaw)},right={x:d.z,z:-d.x};
    if(p.trail!=='none'){
      const tail=Math.min(1.9,Math.max(.55,(v.speed||24)*.025)),a={x:x-d.x*l*.6,y,z:z-d.z*l*.6};
      if(p.trail==='electric'){
        let previous=a;
        for(let i=1;i<=3;i++){const zig=(i===3?0:(i%2?1:-1)*r*.65),next={x:a.x-d.x*tail*i/3+right.x*zig,y,z:a.z-d.z*tail*i/3+right.z*zig};this.segment(previous,next,.075,color);previous=next;}
      }else{
        const end={x:a.x-d.x*tail,y,z:a.z-d.z*tail};
        this.segment(a,end,p.trail==='ember'?.12:p.trail==='frost'?.07:.065,color);
      }
    }
    // Decorative motifs degrade first; every projectile retains its large head.
    if(this.details<DETAIL_CAP&&p.detail!=='none'){
      this.details++;
      if(p.detail==='ring')this.put('ring',x,y,z,r*1.4,r*.8,l*1.15,yaw,color);
      else if(p.detail==='snow'){
        for(let i=0;i<3;i++){const a=yaw+i*Math.PI/3;this.put('chip',x,y+.04,z,r*2.6,.075,.085,a,'#effff8');}
      }else if(p.detail==='fins'||p.detail==='fork'){
        this.put('chip',x-d.x*l*.5,y,z-d.z*l*.5,r*2.6,.11,.18,yaw,color);
      }else if(p.detail==='spark'){
        for(let i=0;i<2;i++){const sign=i?1:-1;this.put('chip',x+right.x*r*sign,y+.03,z+right.z*r*sign,.12,.11,r*.8,yaw+sign*.75,'#ecfff8');}
      }else if(p.detail==='seal'){
        this.put('ring',x,y+.05,z,r*.85,r*.5,r*.85,yaw,'#effff5');this.put('chip',x,y+.06,z,r*1.6,.08,.11,yaw,'#effff5');
      }else if(p.detail==='notch'){
        this.put('chip',x,y+r*.5,z,.12,.1,l*1.1,yaw,'#effff5');
      }
    }
    return true;
  }
  impact(v){
    const y=v.y??.85;
    if(this.impacts>=IMPACT_CAP||![v.x,y,v.z].every(Number.isFinite))return false;
    this.impacts++;
    const maxTTL=Number.isFinite(v.maxTTL)&&v.maxTTL>0?v.maxTTL:.22,ttl=Number.isFinite(v.ttl)?v.ttl:maxTTL;
    const p=projectileProfile(v),progress=1-Math.max(0,Math.min(1,ttl/maxTTL)),r=.25+progress*.6;
    const color=p.color||v.color||'#eaffed',time=Number.isFinite(v.visualTime)?v.visualTime:0;
    if(['electric','frost','shatter','spark'].includes(p.impact)){
      const number=p.impact==='electric'?3:4;
      for(let i=0;i<number;i++){const a=i*Math.PI*2/number+time*2;this.put('chip',v.x+Math.sin(a)*r,y,v.z+Math.cos(a)*r,.09,.09,.25*(1-progress)+.06,a,color);}
      if(p.impact==='electric')this.put('ring',v.x,y,v.z,r,.1,r,0,color);
    }else if(p.impact==='ember'){
      for(let i=0;i<3;i++)this.put('chip',v.x+(i-1)*r*.65,y+progress*.7,v.z,.11,.18,.11,progress*3+i,color);
    }else{
      this.put('ring',v.x,y,v.z,r,.12,r,0,color);
      if(p.impact==='seal')this.put('chip',v.x,y+.05,v.z,r*1.5,.1,.14,0,color);
    }
    return true;
  }
  end(){for(const b of Object.values(this.batches)){b.mesh.count=b.count;b.mesh.visible=b.count>0;if(b.count){b.mesh.instanceMatrix.needsUpdate=true;if(b.mesh.instanceColor)b.mesh.instanceColor.needsUpdate=true;}}}
  stats(){return{projectiles:this.projectiles,impacts:this.impacts,details:this.details,overflow:this.overflow,batches:Object.values(this.batches).filter(b=>b.count>0).length,capacity:CAP,detailCapacity:DETAIL_CAP,impactCapacity:IMPACT_CAP};}
  dispose(){for(const b of Object.values(this.batches)){this.scene.remove(b.mesh);b.mesh.dispose();}}
}
