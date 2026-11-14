import * as THREE from '../../vendor/three.module.js';
import {getMaterial,boxGeo,cylGeo,torusGeo} from './materials.js';
const templates=new Map(),IRON='#343d3c',BRONZE='#ac8747',DARK='#172024',GLOW='#a6dce3';
function mesh(parent,geo,color,x,y,z,rot=null){const m=new THREE.Mesh(geo,getMaterial(color,{flat:true,roughness:.63,metalness:.65}));m.position.set(x,y,z);if(rot)m.rotation.set(...rot);parent.add(m);return m;}
const box=(p,c,x,y,z,a,b,d)=>mesh(p,boxGeo(a,b,d),c,x,y,z);
const cyl=(p,c,x,y,z,r,h,rot)=>mesh(p,cylGeo(r,r,h,8),c,x,y,z,rot);
function foot(p,x,z){box(p,BRONZE,x,.09,z,.22,.12,.23);box(p,IRON,x*.8,.25,z*.8,.10,.38,.10);}
export function buildWeaponAssetUnit(id){
  let t=templates.get(id);if(!t){t=new THREE.Group();t.name='unit_'+id;
    if(id==='bell_hound'){
      box(t,IRON,0,.48,0,.40,.30,.70);box(t,BRONZE,0,.57,.43,.40,.30,.32);cyl(t,GLOW,0,.57,.60,.11,.05,[Math.PI/2,0,0]);
      for(const x of [-.22,.22])for(const z of [-.25,.25])foot(t,x,z);box(t,BRONZE,0,.57,-.43,.07,.07,.26);box(t,IRON,-.14,.80,.38,.12,.19,.13);box(t,IRON,.14,.80,.38,.12,.19,.13);
    } else if(id==='beacon_furnace'){
      box(t,IRON,0,.12,0,.8,.2,.8);cyl(t,BRONZE,0,.45,0,.27,.58);cyl(t,IRON,0,.83,0,.12,.28);box(t,GLOW,0,.48,.28,.22,.13,.02);box(t,BRONZE,0,.96,0,.40,.06,.40);
    } else if(id==='shield_lantern'){
      box(t,IRON,0,.12,0,.70,.20,.50);box(t,BRONZE,0,.55,.08,.68,.72,.16);box(t,GLOW,0,.55,.18,.46,.07,.03);box(t,IRON,0,.52,.0,.40,.55,.13);
    } else if(id==='spring_nest'){
      box(t,IRON,0,.10,0,.70,.13,.70);for(let i=0;i<5;i++)mesh(t,torusGeo(.22,.028,4,12),BRONZE,0,.18+i*.10,0,[Math.PI/2,0,0]);box(t,IRON,0,.66,0,.56,.06,.56);cyl(t,GLOW,0,.72,0,.09,.13);
    } else if(id==='procession_drum'){
      cyl(t,BRONZE,0,.46,0,.34,.43);cyl(t,IRON,0,.70,0,.36,.045);for(const x of [-.27,.27])foot(t,x,0);box(t,BRONZE,0,.82,0,.04,.23,.04);
    } else if(id==='recall_censer'){
      cyl(t,IRON,0,.14,0,.28,.15);cyl(t,BRONZE,0,.38,0,.31,.26);cyl(t,IRON,0,.54,0,.38,.06);cyl(t,BRONZE,0,.66,0,.12,.16);box(t,GLOW,0,.47,.30,.2,.07,.03);
    } else if(id==='thunder_cask'){
      cyl(t,BRONZE,0,.38,0,.30,.67);for(const y of [.15,.38,.65])mesh(t,torusGeo(.31,.038,4,12),IRON,0,y,0,[Math.PI/2,0,0]);box(t,GLOW,0,.74,0,.17,.07,.17);
    } else if(id==='pressure_mine'||id==='clock_bomb'){
      cyl(t,IRON,0,.11,0,.37,.18);cyl(t,BRONZE,0,.23,0,.24,.08);box(t,GLOW,0,.29,0,.12,.04,.12);if(id==='clock_bomb'){box(t,BRONZE,0,.31,.08,.035,.05,.26);cyl(t,BRONZE,0,.38,-.14,.05,.12);}
    } else if(id==='grounding_rod'||id==='stake_keeper'){
      box(t,IRON,0,.11,0,.54,.16,.54);cyl(t,BRONZE,0,.64,0,.07,1.06);for(const y of [.8,1])cyl(t,IRON,0,y,0,.17,.08);cyl(t,GLOW,0,1.22,0,.09,.14);
    } else if(id==='tripod_caster'||id==='relay_carbine') {
      // relay_carbine（v3 一扣跟随炮）复用三脚炮模型：合同要求"复用模型 / 新增装饰粒子与点光源 0"，
      // 因此不新建几何。**注意：部署物模型是按 id 查表的，id 没登记会直接抛
      // "Unknown deployable art"，而这只在真实渲染时才会炸**（Node 因果测试不渲染）——
      // 由 tools/r2_ui_browser.mjs 抓到。
      for(let i=0;i<3;i++)foot(t,Math.sin(i*Math.PI*2/3)*.42,Math.cos(i*Math.PI*2/3)*.42);
      cyl(t,BRONZE,0,.54,0,.13,.64);const head=new THREE.Group();head.name='head';t.add(head);head.position.y=.84;box(head,IRON,0,0,0,.39,.29,.42);cyl(head,IRON,0,0,.36,.08,.46,[Math.PI/2,0,0]);cyl(head,BRONZE,0,0,.60,.10,.09,[Math.PI/2,0,0]);
    } else if(id==='tesla_arc'){
      // 特斯拉线圈：底座 → 层叠铜线圈 → 顶端发光电极 → 两侧集电叉。
      // 电弧本身由 FX 的光束池渲染，这里只给"装置"实体；不新增粒子、不新增点光。
      box(t,IRON,0,.10,0,.66,.20,.66);
      cyl(t,BRONZE,0,.25,0,.17,.22);
      for(let i=0;i<4;i++)mesh(t,torusGeo(.19-i*.012,.026,4,12),BRONZE,0,.36+i*.13,0,[Math.PI/2,0,0]);
      cyl(t,IRON,0,.90,0,.085,.10);
      cyl(t,GLOW,0,.99,0,.055,.14);
      for(const x of [-.31,.31]){box(t,IRON,x,.30,0,.05,.30,.05);cyl(t,GLOW,x,.49,0,.045,.10);}
    } else if(id==='hive_scepter'){
      // 母巢：底座 → 六层巢环 → 巢口辉光 → 巢壁上的四只爬口。
      box(t,IRON,0,.09,0,.76,.18,.76);
      cyl(t,BRONZE,0,.42,0,.33,.58);
      for(const y of [.23,.45,.65])mesh(t,torusGeo(.345,.030,4,12),IRON,0,y,0,[Math.PI/2,0,0]);
      for(let i=0;i<4;i++){const ang=i*Math.PI/2;box(t,BRONZE,Math.sin(ang)*.27,.32,Math.cos(ang)*.27,.11,.17,.11);}
      cyl(t,GLOW,0,.80,0,.13,.10);
      box(t,IRON,0,.88,0,.30,.05,.30);
    } else throw Error('Unknown deployable art: '+id);
    templates.set(id,t);
  }return t.clone(true);
}
