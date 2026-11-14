// Bounded, reusable presentation for the gameplay-owned weapon entities.
import {DEPLOYMENT_LIMITS} from '../game/weapon_assets/deployment_budget.js';
import * as THREE from '../../vendor/three.module.js';
import { teamSafeColor } from '../game/team_colors.js';
import { TEAM } from '../core/constants.js';
import { buildWeaponAssetUnit } from '../art/weapon_assets_units.js';
import {projectileProfile} from './weapon_projectile_profiles.js';
import {WeaponProjectileRenderer} from './weapon_projectile_renderer.js';

const geometry={
  line:new THREE.CylinderGeometry(1,1,1,6),
  ring:new THREE.TorusGeometry(1,.025,4,24),
  core:new THREE.OctahedronGeometry(1,0),
  foot:new THREE.BoxGeometry(1,1,1),
  electric:new THREE.CylinderGeometry(1,1,1,4),
};
const mats=new Map();
function material(color,style='solid') {
  const safe=teamSafeColor(color,TEAM.PLAYER,{isPlayer:true}),key=safe+style;
  if(!mats.has(key))mats.set(key,new THREE.MeshBasicMaterial({color:safe,transparent:style==='faint',opacity:style==='faint'?.32:.88,depthWrite:style!=='faint',toneMapped:false}));
  return mats.get(key);
}
function entry(kind) {
  const group=new THREE.Group();group.visible=false;
  const core=new THREE.Mesh(kind==='line'||kind==='preview'?geometry.line:geometry.core,material('#9ce6e0'));
  const edge=new THREE.Mesh(geometry.ring,material('#9ce6e0','faint'));
  edge.rotation.x=Math.PI/2;
  group.add(core,edge);
  const marks=[];
  for(let i=0;i<4;i++) {
    const m=new THREE.Mesh(geometry.foot,material('#c7d3ad'));
    group.add(m); marks.push(m);
  }
  const shell=new THREE.Mesh(geometry.line,material('#b5ffe2','faint'));shell.visible=false;group.add(shell);
  const arcs=[];
  if(kind==='line'||kind==='preview')for(let i=0;i<4;i++){const m=new THREE.Mesh(geometry.electric,material('#e6fff3'));m.visible=false;group.add(m);arcs.push(m);}
  return {group,core,edge,shell,arcs,marks,kind,unitModels:new Map()};
}
const CAPS={line:24,preview:3,anchor:12,projectile:420,zone:64,unit:DEPLOYMENT_LIMITS.total,mark:32,meteor:10};
// 兜底部署物：只建一次并共享几何/材质（不新增点光、不在每帧新建对象）。
let unitFallback=null,unitFallbackWarned=false;
function fallbackUnit(){
  if(unitFallback)return unitFallback.clone(true);
  const g=new THREE.Group();g.name='unit_fallback';
  const body=new THREE.Mesh(geometry.core,material('#2f383a'));body.position.y=.34;body.scale.set(.42,.66,.42);g.add(body);
  const cap=new THREE.Mesh(geometry.core,material('#ac8747'));cap.position.y=.70;cap.scale.set(.50,.07,.50);g.add(cap);
  unitFallback=g;return g.clone(true);
}
const up=new THREE.Vector3(0,1,0);
export class WeaponAssetFX {
  constructor(scene) {
    this.scene=scene;this.pools={};this.direction=new THREE.Vector3();this.activeCount=0;
    for(const [kind,n] of Object.entries(CAPS)) {
      if(kind==='projectile')continue;
      this.pools[kind]=Array.from({length:n},()=>{const e=entry(kind);scene.add(e.group);return e;});
    }
    this.projectiles=new WeaponProjectileRenderer(scene);
  }
  clear(){for(const a of Object.values(this.pools))for(const e of a)e.group.visible=false;this.projectiles.begin();this.projectiles.end();this.activeCount=0;}
  update(records=[]) {
    this.clear(); const used={};this.overflow=0;
    for(const v of records) {
      let kind=v.kind;
      if(kind==='zone'&&['mine','clock-bomb','rod'].includes(v.mechanic))kind='unit';
      if(kind==='beam')kind='line';if(kind==='bullet')kind='projectile';
      if(kind==='projectile'){if(this.projectiles.add(v))this.activeCount++;else this.overflow++;continue;}
      if(kind==='impact'){if(this.projectiles.impact(v))this.activeCount++;continue;}
      if(!this.pools[kind])continue;
      const i=used[kind]||0,e=this.pools[kind][i];if(!e){this.overflow++;continue;}used[kind]=i+1;
      const x=kind==='preview'?(v.originX??v.x??0):(v.x??v.ax??0),z=kind==='preview'?(v.originZ??v.z??0):(v.z??v.az??0);
      if(!Number.isFinite(x)||!Number.isFinite(z))continue;
      const c=v.color||'#9ce6e0';
      e.core.material=material(c);e.edge.material=material(c,'faint');
      e.group.visible=true;this.activeCount++;
      const groundKind=['anchor','zone','unit','mark'].includes(kind);
      e.group.position.set(x,groundKind?.04:(v.y??(kind==='projectile'?.78:kind==='line'?.27:.09)),z);
      e.group.rotation.set(0,0,0);e.core.rotation.set(0,0,0);e.core.quaternion.identity();
      e.core.position.set(0,0,0);e.shell.visible=false;for(const arc of e.arcs)arc.visible=false;
      const remaining=(v.maxTTL>0?Math.max(0,Math.min(1,v.ttl/v.maxTTL)):1);
      for(const m of e.marks)m.visible=false;
      if(kind==='line'||kind==='preview') {
        const wave=v.mechanic==='v3:traveling_wave';
        let dx=(wave?v.axis?.x:undefined)??v.dx??((v.bx??x)-x), dz=(wave?v.axis?.z:undefined)??v.dz??((v.bz??z)-z);
        let length=v.length??Math.hypot(dx,dz);const norm=Math.hypot(dx,dz)||1;
        dx/=norm;dz/=norm;
        e.group.position.x=x+(wave?0:dx*length*.5);e.group.position.z=z+(wave?0:dz*length*.5);
        const profile=projectileProfile(v),electric=kind==='line'&&profile.line==='electric',segmented=kind==='preview'||(kind==='line'&&profile.line==='pulse');
        const width=(kind==='preview'?.06:(v.width??.135))*(String(v.mechanic||'').startsWith('v3:')?.5:1);
        e.core.scale.set(width,length,width);
        e.core.quaternion.setFromUnitVectors(up,this.direction.set(dx,0,dz));
        e.core.material=material(profile.color||c);
        if(kind==='line'&&!electric&&!segmented){e.shell.visible=true;e.shell.scale.set(width*1.45,length,width*1.45);e.shell.quaternion.copy(e.core.quaternion);e.shell.material=material(profile.color||c,'faint');}
        if(electric){
          e.core.visible=false;
          let previous={x:-dx*length*.5,z:-dz*length*.5};
          for(let j=0;j<4;j++){
            const at=(j+1)/4-.5,zig=j===3?0:(j%2?-.22:.22)*Math.min(1,length/3)*(1+.2*Math.sin((v.visualTime||0)*24));
            const next={x:dx*length*at+dz*zig,z:dz*length*at-dx*zig},arc=e.arcs[j];
            const ax=next.x-previous.x,az=next.z-previous.z,len=Math.hypot(ax,az);
            arc.visible=true;arc.position.set((previous.x+next.x)/2,0,(previous.z+next.z)/2);arc.scale.set(.11,len,.11);arc.quaternion.setFromUnitVectors(up,this.direction.set(ax,0,az).normalize());arc.material=material(profile.color||'#b5ffe2');previous=next;
          }
          e.edge.visible=true;e.edge.scale.setScalar(.25);e.edge.position.set(dx*length*.5,0,dz*length*.5);
        }
        if(segmented){
          e.core.visible=false;
          for(let j=0;j<4;j++){
            const arc=e.arcs[j],at=(j+.5)/4-.5;arc.visible=true;arc.position.set(dx*length*at,0,dz*length*at);arc.scale.set(width,length*.19,width);arc.quaternion.copy(e.core.quaternion);
            arc.material=kind==='preview'?material(v.valid===false?'#d8b671':'#a9e5dc','faint'):material(profile.color||c);
          }
        }
        if(kind==='preview')e.core.material=material(v.valid===false?'#d8b671':'#a9e5dc','faint');
        if(!electric)e.edge.visible=false;
        // End marks show duration and separate friendly line from enemy warnings.
        for(let j=0;j<4;j++) {
          const m=e.marks[j];m.visible=j<Math.ceil(remaining*4);
          const at=(j/3-.5)*(profile.line==='braid'?length:Math.min(length,1.2));
          m.position.set(dx*at,0,dz*at);m.rotation.y=Math.atan2(dx,dz);
          m.scale.set(profile.line==='braid'?.32:.19,.065,.065);
        }
      } else if(kind==='zone') {
        const r=v.radius??1.5;e.core.visible=false;
        if(v.mechanic==='v3:meteor'&&v.phase==='falling'){e.core.visible=true;e.core.position.y=(v.y??6)-.04;e.core.scale.set(.48,.6,.48);}
        if(v.mechanic==='rod-corridor'){
          e.edge.visible=false;e.group.rotation.y=Math.atan2(v.dx||0,v.dz||1);
          for(let j=0;j<4;j++){const m=e.marks[j];m.visible=true;m.rotation.y=0;if(j<2){m.position.set((j===0?-1:1)*r,0,(v.length||0)*.5);m.scale.set(.055,.025,v.length||.1);}else{m.position.set(0,0,j===2?0:v.length||0);m.scale.set(r*2,.025,.055);}}
        }else{
          e.edge.visible=true;e.edge.scale.setScalar(r);
          for(let j=0;j<4;j++){const m=e.marks[j];m.visible=true;m.position.set(Math.cos(j*Math.PI/2)*r,0,Math.sin(j*Math.PI/2)*r);m.scale.set(.12,.03,.25);m.rotation.y=-j*Math.PI/2;}
        }
      } else if(kind==='anchor') {
        e.core.visible=true;e.core.scale.set(.13,.20,.13);e.core.position.y=.13;
        e.edge.visible=true;e.edge.scale.setScalar(.27);
        const number=Math.max(1,Math.min(4,v.index??v.sequence??1));
        for(let j=0;j<4;j++) {
          const m=e.marks[j];m.visible=j<number;m.position.set((j-1.5)*.07,.03,.22);m.scale.set(.035,.035,.07);
        }
      } else if(kind==='unit') {
        const id=v.shot?.lottery?.borrowId||v.shot?.weaponId||v.weaponId||'tripod_caster';
        for(const m of e.unitModels.values())m.visible=false;
        let model=e.unitModels.get(id);
        if(!model){
          // 渲染循环绝不能被"缺模型"打死：buildWeaponAssetUnit 对未登记的 id 会抛错，
          // 而这里是每帧调用的——一旦抛出就是整层画面当帧消失（tesla_arc / hive_scepter 踩过）。
          // 保留函数本身的"响度"（直接调用仍会抛），只在渲染层兜底。
          try{model=buildWeaponAssetUnit(id);}
          catch(err){if(!unitFallbackWarned){unitFallbackWarned=true;console.warn('[weapon-assets] 部署物缺少美术，已用兜底几何：'+id);}model=fallbackUnit();}
          e.unitModels.set(id,model);e.group.add(model);
        }
        model.visible=true;
        model.rotation.y=Math.atan2(v.dx??0,v.dz??1);e.core.visible=false;
        e.edge.visible=true;e.edge.scale.setScalar(.33);
      } else if(kind==='meteor') {
        // 天降陨石：地面预警环随下落收紧/发亮，岩体从高处砸下并翻转，尾迹撒火星。
        const prog=Math.max(0,Math.min(1,v.progress??0));
        const ground=v.radius||2;
        e.edge.visible=true;e.edge.scale.setScalar(ground*(0.82+0.18*prog));
        e.core.visible=true;e.core.position.y=7.5*(1-prog)+.3;
        e.core.scale.set(.62,.62,.62);
        e.core.rotation.set(prog*7.5,prog*5.2,prog*3.4);
        for(let j=0;j<4;j++){const m=e.marks[j];m.visible=true;
          m.position.set((j-1.5)*.16,.02,.20+prog*.55);m.rotation.y=0;m.scale.set(.10,.05,.30);}
      } else if(kind==='mark') {
        // 「数据 + 消费点」缺口修复：visualState 一直在给 mark 发 phase（照钟针停留进度 0..1），
        // 但渲染层没有分支消费它 → 瞄准环恒定、看不出在累积，试玩者反馈"没看出瞄准环在哪"。
        // 这里让环随 dwell 从 .24 涨到 .54，满环即兑现，状态可见。
        e.core.visible=true;e.core.position.y=0;e.core.scale.set(.055,.055,.055);
        e.edge.visible=true;e.edge.scale.setScalar(v.phase===undefined?(v.radius??.35):(.24+.30*Math.max(0,Math.min(1,v.phase))));
        for(const m of e.marks)m.visible=false;
      } else {
        e.core.visible=true;e.core.position.y=0;e.core.scale.set(.065,.065,.065);e.edge.visible=true;e.edge.scale.setScalar(v.radius??.35);
      }
      // Pool reuse must not retain hidden core or displaced transforms from a prior kind.
      if(kind!=='zone'&&kind!=='unit'&&kind!=='preview'&&!(kind==='line'&&['electric','pulse'].includes(projectileProfile(v).line)))e.core.visible=true;
      if(kind==='line'||kind==='preview'||kind==='projectile')e.core.position.set(0,0,0);
    }
    this.projectiles.end();
  }
  stats(){return {active:this.activeCount,overflow:this.overflow||0,limits:{...CAPS},materials:mats.size,projectilePresentation:this.projectiles.stats()};}
  dispose(){for(const a of Object.values(this.pools))for(const e of a)this.scene.remove(e.group);this.projectiles.dispose();}
}
