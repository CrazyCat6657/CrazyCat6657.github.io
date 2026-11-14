// Weapon tools of the abandoned bell court. Cached geometry/materials; +Z muzzle.
import * as THREE from '../../vendor/three.module.js';
import { getMaterial } from './materials.js';
import { ASSET_MODEL_RECIPES } from './weapon_assets_recipes.js';
import { applyBlenderGunVisual, animateBlenderGunVisual } from './gun_assets.js';

const geometries = new Map(), templates = new Map();
const IRON='#434d55', DARK='#242d33', BRONZE='#b49257', BONE='#c2b59a', WOOD='#684a34';
function geometry(kind,...a) {
  const key=kind+':'+a.join(',');
  if(!geometries.has(key)) geometries.set(key,
    kind==='box'?new THREE.BoxGeometry(...a):
    kind==='cylinder'?new THREE.CylinderGeometry(...a):
    kind==='cone'?new THREE.ConeGeometry(...a):
    kind==='ring'?new THREE.TorusGeometry(...a):new THREE.OctahedronGeometry(...a));
  return geometries.get(key);
}
const material=(c)=>getMaterial(c,{flat:true,roughness:c===BRONZE?.4:.55,metalness:.74});
const light=(c)=>getMaterial('#192426',{flat:true,roughness:1,metalness:0,emissive:c,emissiveIntensity:1.8});
function part(g,kind,a,color,pos,rot=[0,0,0],name='') {
  const m=new THREE.Mesh(geometry(kind,...a),typeof color==='string'?material(color):color);
  m.position.set(...pos); m.rotation.set(...rot); m.castShadow=true;
  if(name)m.name=name; g.add(m); return m;
}
const box=(g,c,p,s,r=[0,0,0],n='')=>part(g,'box',s,c,p,r,n);
const cyl=(g,c,p,r,h,rot=[Math.PI/2,0,0],n='')=>part(g,'cylinder',[r,r,h,8],c,p,rot,n);
const ring=(g,c,p,r=.13,t=.018,rot=[0,0,0],n='')=>part(g,'ring',[r,t,5,12],c,p,rot,n);
const cone=(g,c,p,r=.07,h=.15,rot=[Math.PI/2,0,0],n='')=>part(g,'cone',[r,h,6],c,p,rot,n);
function row(g,c,axis,start,step,count,size,name='') {
  for(let i=0;i<count;i++) { const p=[...start];p[axis]+=step*i;box(g,c,p,size,[0,0,0],name?name+i:''); }
}
function base(shape,c) {
  const g=new THREE.Group();
  const muzzle=new THREE.Object3D(); muzzle.name='muzzle';
  const body=new THREE.Group();body.name='assetBody';g.add(body);
  const receiver=shape==='mortar'?.24:shape==='tool'?.26:shape==='sight'?.14:.18;
  box(body,DARK,[0,.04,.14],[receiver,.18,.42]);
  box(body,IRON,[0,-.14,-.01],[.10,.26,.14],[.22,0,0],'grip');
  box(body,BRONZE,[0,.155,.06],[receiver*.85,.03,.2]);
  box(body,IRON,[0,-.055,.19],[receiver*.9,.045,.28]);
  const reload=new THREE.Group();reload.name='reload';body.add(reload);
  box(reload,DARK,[.03,-.18,.21],[.09,.25,.12],[-.1,0,0]);
  box(reload,BRONZE,[.03,-.30,.21],[.12,.045,.15]);
  let z=.7;
  if(shape==='sight') {
    cyl(body,IRON,[0,.065,.37],.035,.4); z=.62;
    box(body,BRONZE,[0,.14,.31],[.035,.028,.14]);
  } else if(shape==='clock'||shape==='breech') {
    cyl(body,IRON,[0,.065,.44],.045,.54);
    box(body,WOOD,[0,.035,-.23],[.13,.15,.30]);
    box(body,IRON,[0,.09,-.39],[.17,.20,.06]); z=.73;
  } else if(shape==='bellows') {
    for(const x of [-.07,.07])cyl(body,IRON,[x,.08,.45],.05,.55);
    box(body,WOOD,[0,.075,-.17],[.19,.15,.23]);z=.77;
  } else if(shape==='rail') {
    for(const x of [-.065,.065])box(body,IRON,[x,.075,.58],[.035,.08,.75]);
    box(body,DARK,[0,.06,.85],[.21,.13,.10]);z=.98;
  } else if(shape==='return') {
    box(body,IRON,[0,.09,.34],[.31,.09,.23]);
    for(const x of [-.15,.15])box(body,BRONZE,[x,.09,.52],[.035,.055,.30]);z=.7;
  } else if(shape==='mortar') {
    cyl(body,DARK,[0,.07,.36],.13,.51);
    ring(body,BRONZE,[0,.07,.61],.14,.025);z=.7;
  } else if(shape==='coil') {
    box(body,IRON,[0,.08,.22],[.24,.22,.38]);
    cyl(body,IRON,[0,.06,.49],.04,.43);z=.73;
  } else if(shape==='lamp') {
    box(body,IRON,[0,.09,.31],[.15,.17,.33]);
    cyl(body,DARK,[0,.09,.49],.09,.32);
    ring(body,BRONZE,[0,.09,.65],.105,.024);z=.7;
  } else if(shape==='vessel') {
    cyl(body,BRONZE,[-.10,.09,.14],.09,.28,[0,0,0]);
    cyl(body,DARK,[.02,.06,.47],.045,.43);z=.72;
  } else if(shape==='cage') {
    for(const x of [-.12,.12])box(body,BRONZE,[x,.09,.41],[.03,.08,.39]);
    box(body,IRON,[0,.23,.40],[.25,.03,.28]);z=.68;
  } else if(shape==='tool') {
    box(body,IRON,[0,.065,.31],[.29,.14,.21]);
    for(const x of [-.14,.14])box(body,BRONZE,[x,-.045,.38],[.035,.16,.34],[0,0,x]);z=.63;
  }
  const charge=new THREE.Group();charge.name='charge';charge.position.set(0,.07,z-.06);body.add(charge);
  cone(charge,light(c),[0,0,0],.032,.08);
  const heat=new THREE.Group();heat.name='heat';heat.position.set(-receiver*.5,.16,.16);body.add(heat);
  for(let i=0;i<4;i++)box(heat,light(c),[0,0,i*.035],[.025,.025,.018],[0,0,0],'heat'+i);
  muzzle.position.set(0,.07,z);g.add(muzzle);
  return g;
}

function modulePart(g,key,c,slot) {
  const b=g.getObjectByName('assetBody'), L=light(c);
  const top=slot===0?.235:.20, front=slot===0?.43:.12;
  const spin=new THREE.Group();spin.name='mechanical_'+key;b.add(spin);
  const teeth=(n,r,p,axis='y')=>{
    const d=new THREE.Group(); d.position.set(...p);spin.add(d);
    for(let i=0;i<n;i++) {
      const a=i/n*Math.PI*2;
      const pos=axis==='y'?[Math.cos(a)*r,0,Math.sin(a)*r]:[Math.cos(a)*r,Math.sin(a)*r,0];
      box(d,IRON,pos,[.045,.035,.08],axis==='y'?[0,-a,0]:[0,0,a]);
    } return d;
  };
  switch(key) {
    case 'bellows':case 'sieve':case 'shuttle':case 'twin_shell': {
      if(key==='bellows') {
        for(let i=0;i<5;i++)box(spin,i%2?WOOD:IRON,[0,.1,.15+i*.045],[.22-i*.012,.16-i*.008,.025]);
      } else if(key==='sieve') {
        for(let i=0;i<4;i++) {
          box(spin,BRONZE,[-.09+i*.06,.13,.59],[.02,.19,.025]);
          box(spin,IRON,[0,.07+i*.045,.595],[.23,.016,.025]);
        }
      } else if(key==='shuttle') {
        part(spin,'facet',[.075,0],BONE,[0,.23,.40],[0,0,.5]);
        for(const s of [-1,1])box(spin,BRONZE,[s*.08,.23,.39],[.02,.045,.31]);
      } else for(const s of [-1,1])cyl(spin,BRONZE,[s*.1,.23,.16],.055,.24);
      break;
    }
    case 'notch':case 'four_notch':case 'tags':case 'nails':case 'three_socket':case 'four_socket':case 'three_window': {
      const count=key==='notch'?3:key.startsWith('three')?3:4;
      box(spin,BRONZE,[.12,.15,.14],[.045,.10,.27]);
      for(let i=0;i<count;i++) {
        const z=.03+i*.065;
        if(key.includes('socket'))ring(spin,IRON,[.155,.16,z],.025,.009,[0,Math.PI/2,0]);
        else box(spin,key==='tags'?BONE:IRON,[.153,.18,z],[.035,.09,.040],key==='nails'?[.25,0,0]:[0,0,0]);
        box(spin,L,[.18,.17,z],[.015,.025,.020],[0,0,0],(key==='four_socket'?'anchor':'sequence')+i);
      } break;
    }
    case 'open_sight':case 'sight':case 'bell_sight':case 'tilted_sight':case 'triangle_sight':case 'triangle_frame':case 'window_frame':case 'door_posts': {
      if(key==='bell_sight') {
        part(spin,'cylinder',[.035,.09,.13,8],BRONZE,[0,.28,.27],[0,0,0]);
        cyl(spin,BONE,[0,.235,.27],.016,.11,[0,0,0]);
      } else if(key.startsWith('triangle')) {
        for(const s of [-1,1])box(spin,BRONZE,[s*.065,.26,.29],[.018,.19,.022],[0,0,s*-.6]);
        box(spin,BRONZE,[0,.185,.29],[.21,.02,.022]);
      } else {
        for(const s of [-1,1])box(spin,BRONZE,[s*.06,.25,.29],[.025,.15,.028],[0,0,key==='tilted_sight'?.35:0]);
        if(key==='window_frame'||key==='door_posts')box(spin,BRONZE,[0,.33,.29],[.15,.025,.035]);
      }
      box(spin,L,[0,.22,.31],[.02,.025,.025]); break;
    }
    case 'hammer':case 'heel':case 'stopper':case 'flag':case 'relay':case 'bell_switch': {
      box(spin,IRON,[.10,.25,.03],[.065,.10,.08],[.25,0,-.25]);
      box(spin,BRONZE,[.12,.31,.035],[.12,.025,.08]);
      if(key==='flag')box(spin,BONE,[.18,.33,.12],[.13,.11,.018]);
      if(key==='bell_switch')part(spin,'cylinder',[.02,.065,.09,8],BRONZE,[.14,.20,.30]);
      if(key==='heel')box(spin,IRON,[0,-.12,-.27],[.2,.19,.08],[.25,0,0]);break;
    }
    case 'side_plate':case 'guard':case 'side_vanes':case 'gap': {
      for(const s of [-1,1])box(spin,BRONZE,[s*.14,.09,.34],[.035,.25,.13],[0,0,s*.25]);
      if(key==='side_plate')box(spin,IRON,[.18,.095,.12],[.045,.17,.28]);
      if(key==='side_vanes')for(const s of [-1,1])box(spin,IRON,[s*.19,.10,.58],[.045,.04,.25],[0,s*.55,0]);break;
    }
    case 'vent':case 'rack':case 'twin_rack':case 'shell_rack':case 'pin_bank':case 'ladder':case 'abacus': {
      const n=key==='abacus'?5:4;
      for(let i=0;i<n;i++) {
        const z=.04+i*.09;
        if(key==='pin_bank') {cyl(spin,IRON,[(i-1.5)*.06,.26,.15],.018,.19,[0,0,0]);box(spin,L,[(i-1.5)*.06,.35,.15],[.025,.025,.025]);}
        else if(key==='abacus') {cyl(spin,BRONZE,[0,.25,z],.012,.26,[0,0,Math.PI/2]);cyl(spin,BONE,[i%2?.05:-.05,.25,z],.032,.04,[0,0,Math.PI/2]);}
        else if(key==='shell_rack')cyl(spin,BRONZE,[.13,.06,z],.032,.12,[0,0,0]);
        else box(spin,key==='ladder'?BRONZE:IRON,[0,.20,z],[key==='vent'?.23:.18,.025,.035]);
      }
      if(key==='twin_rack')for(const s of [-1,1])box(spin,BRONZE,[s*.13,.24,.20],[.025,.03,.36]);break;
    }
    case 'drum':case 'disc':case 'distance_ring':case 'orbit_ring':case 'echo_ring':case 'flywheel':case 'ratchet':case 'escapement':case 'mill':case 'pressure_plate':case 'mine_rack': {
      const p=key==='distance_ring'?[0,.09,.76]:key==='orbit_ring'?[0,.09,.46]:[.13,.095,.18];
      const axis=key==='distance_ring'||key==='orbit_ring'?'z':'x';
      if(key==='drum')cyl(spin,BRONZE,p,.14,.13,[0,0,Math.PI/2]);
      else {
        ring(spin,BRONZE,p,key==='orbit_ring'?.23:.135,.025,axis==='x'?[0,Math.PI/2,0]:[0,0,0]);
        const gear=teeth(key==='ratchet'?8:6,.12,p,axis==='x'?'z':'y');
        if(axis==='x')gear.rotation.y=Math.PI/2;else gear.rotation.x=Math.PI/2;
        if(key==='escapement')box(spin,IRON,[.15,.25,.16],[.04,.16,.12],[0,0,.55]);
        if(key==='mill')cyl(spin,BONE,[.14,.10,.19],.08,.13,[0,0,Math.PI/2]);
        if(key==='pressure_plate')box(spin,IRON,[0,.26,.22],[.28,.02,.22]);
      }break;
    }
    case 'pump':case 'mag':case 'sliding_collar':case 'shutter':case 'split_gate':case 'flip_breech':case 'open_chamber':case 'escrow': {
      box(spin,WOOD,[0,-.02,.42],[.19,.13,.18],[0,0,0],key==='pump'?'pump':'gate');
      if(key==='shutter'||key==='split_gate')for(const s of [-1,1])box(spin,IRON,[s*.095,.12,.65],[.045,.19,.12],[0,s*.3,0]);
      if(key==='flip_breech')box(spin,BRONZE,[0,.24,.13],[.23,.09,.18],[0,0,0],'mode');
      if(key==='open_chamber')ring(spin,BRONZE,[0,.25,.12],.08,.02,[Math.PI/2,0,0]);break;
    }
    case 'paired_barrel':case 'vertical_barrel':case 'three_barrel':case 'six_barrel':case 'offset_barrel':case 'wide_barrel':case 'needle_rails':case 'rails':case 'parallel_rails': {
      const n=key==='six_barrel'?6:key==='three_barrel'?3:key==='wide_barrel'||key==='offset_barrel'?1:2;
      for(let i=0;i<n;i++) {
        const a=i/n*Math.PI*2;
        let x=n>2?Math.cos(a)*.095:(i-(n-1)/2)*.14, y=.07+(n>2?Math.sin(a)*.095:0);
        if(key==='vertical_barrel'){x=0;y=.07+(i-.5)*.17;}
        if(key==='offset_barrel')x=.12;
        const r=key==='wide_barrel'?.1:key.includes('needle')?.025:.038;
        if(key.includes('rails'))box(spin,IRON,[x,y,.57],[r,.04,.62]);
        else cyl(spin,IRON,[x,y,.5],r,.58);
        ring(spin,BRONZE,[x,y,.80],r*1.2,.01);
      }
      if(key==='six_barrel')spin.name='spin';break;
    }
    case 'long_stock':case 'long_spear':case 'staff':case 'bipod': {
      if(key==='long_stock')box(spin,WOOD,[0,.03,-.32],[.14,.15,.41]);
      else if(key==='bipod')for(const s of [-1,1])cyl(spin,IRON,[s*.11,-.10,.73],.016,.28,[.3,0,s*.4]);
      else {cyl(spin,key==='staff'?WOOD:IRON,[0,.07,.49],.027,1.1);cone(spin,BRONZE,[0,.07,1.12],.065,.21);g.getObjectByName('muzzle').position.z=1.24;}
      break;
    }
    case 'tube':case 'arched_barrel':case 'hook_nozzle':case 'seam_nozzle':case 'mortar_cup':case 'bucket':case 'funnel':case 'bell_muzzle':case 'twin_bell': {
      if(key==='twin_bell')for(const s of [-1,1])part(spin,'cylinder',[.07,.12,.22,8],BRONZE,[s*.105,.10,.65],[Math.PI/2,0,0]);
      else if(key==='hook_nozzle'||key==='arched_barrel') {cyl(spin,IRON,[0,.11,.54],.055,.25,[Math.PI/2-.4,0,0]);cyl(spin,BRONZE,[0,.20,.68],.07,.13,[Math.PI/2-.4,0,0]);}
      else if(key==='seam_nozzle')box(spin,BRONZE,[0,.08,.63],[.30,.06,.11]);
      else if(key==='tube')cyl(spin,DARK,[0,.08,.42],.145,.74);
      else part(spin,'cylinder',[key==='funnel'?.14:.12,.065,.24,8],BRONZE,[0,.08,.65],[Math.PI/2,0,0]);break;
    }
    case 'fuel':case 'furnace':case 'vessel':case 'twin_vessel':case 'twin_cell':case 'cask':case 'relic': {
      const n=key.startsWith('twin')?2:1;
      for(let i=0;i<n;i++) {
        const x=n===1?-.13:(i-.5)*.26;
        cyl(spin,key==='relic'?BONE:BRONZE,[x,.08,.04],.095,.27,[0,0,0]);
        ring(spin,IRON,[x,.20,.04],.1,.015,[Math.PI/2,0,0]);
        if(key==='furnace'||key==='twin_cell')row(spin,L,2,[x,.11,-.02],.035,4,[.055,.025,.014]);
        if(key==='cask')row(spin,IRON,1,[x,-.02,.04],.08,3,[.21,.02,.21]);
      }break;
    }
    case 'lens':case 'split_lens':case 'mirror':case 'angled_prism':case 'facet':case 'core':case 'seal': {
      const p=[0,.11,key==='mirror'?.61:.55];
      if(key==='facet'||key==='angled_prism'||key==='core')part(spin,'facet',[.10,0],key==='core'?L:BONE,p,[0,key==='angled_prism'?.65:0,.4],key==='core'?'core':'prism');
      else {ring(spin,BRONZE,p,.115,.025);cyl(spin,key==='seal'?BRONZE:L,p,.075,.025,[Math.PI/2,key==='mirror'?.5:0,0]);}
      if(key==='split_lens')box(spin,IRON,[0,.11,.56],[.02,.20,.07]);break;
    }
    case 'coil_stack':case 'three_ring':case 'double_helix':case 'spiral':case 'spring': {
      const count=key==='three_ring'?3:key==='coil_stack'?5:6;
      for(let i=0;i<count;i++) {
        const z=.20+i*.075;
        if(key==='double_helix')for(const s of [-1,1])box(spin,s===1?BRONZE:IRON,[Math.sin(i*.8)*.08*s,.08+Math.cos(i*.8)*.08*s,z],[.028,.028,.11],[0,0,i*.8]);
        else ring(spin,i%2?BRONZE:IRON,[0,.08,z],key==='spring'?.07:.105,.013,key==='spiral'?[.15,.18,0]:[0,0,0]);
      }break;
    }
    case 'four_cage':case 'broken_cage':case 'cage':case 'split_fork':case 'fork':case 'twin_rod':case 'harpoon':case 'three_blade':case 'saw': {
      if(key==='saw'||key==='three_blade') {
        const n=key==='saw'?10:3;const d=teeth(n,.16,[0,.22,.48]);d.name='spin';
        cyl(d,BRONZE,[0,0,0],.065,.05,[0,0,0]);
      } else if(key.includes('cage')) {
        for(let i=0;i<4;i++) {
          const a=i*Math.PI/2;
          if(key==='broken_cage'&&i===1)continue;
          box(spin,BRONZE,[Math.cos(a)*.14,.08+Math.sin(a)*.14,.48],[.027,.027,.40]);
        }ring(spin,IRON,[0,.08,.65],.15,.018);
      } else {
        for(const s of [-1,1]) {
          cyl(spin,IRON,[s*.1,.08,.55],.028,.44);
          if(key==='harpoon')cone(spin,BRONZE,[s*.1,.08,.76],.055,.14);
          else box(spin,L,[s*.1,.08,.77],[.04,.04,.045]);
        }
      }break;
    }
    case 'reel':case 'cross_spool':case 'needle_spool':case 'anchor_reel':case 'cable':case 'chain': {
      const p=key==='anchor_reel'?[.02,.29,.19]:[.15,.1,.13];
      ring(spin,BRONZE,p,key==='anchor_reel'?.17:.12,.023,[0,0,Math.PI/2],'spin');
      cyl(spin,DARK,p,.09,.075,[0,0,Math.PI/2]);
      for(let i=0;i<4;i++) {
        if(key==='chain')ring(spin,IRON,[.15,.11,.25+i*.065],.035,.009,[Math.PI/2,0,i%2?Math.PI/2:0]);
        else box(spin,BONE,[.16,.16,.24+i*.055],[.026,.025,.045],[0,.35,0]);
      }
      if(key==='cross_spool')ring(spin,BRONZE,[-.13,.1,.14],.10,.02,[0,Math.PI/2,0]);break;
    }
    case 'clock_hand':case 'pendulum':case 'weight_arm':case 'balance':case 'hourglass': {
      if(key==='hourglass') {
        cone(spin,BONE,[.14,.23,.15],.075,.14,[0,0,0]);cone(spin,BONE,[.14,.10,.15],.075,.14,[Math.PI,0,0]);
        for(const s of [-1,1])box(spin,BRONZE,[.14+s*.075,.17,.15],[.015,.26,.015]);
      } else {
        ring(spin,BRONZE,[.15,.18,.15],.105,.018,[0,Math.PI/2,0]);
        box(spin,BRONZE,[.18,.24,.15],[.02,.13,.02],[0,0,key==='pendulum'?.4:0],key==='pendulum'?'pendulum':'hand');
        if(key==='weight_arm'||key==='balance') {box(spin,IRON,[0,.29,.13],[.34,.025,.05]);for(const s of [-1,1])cyl(spin,BRONZE,[s*.17,.22,.13],.065,.04,[0,0,0]);}
      }break;
    }
    case 'stamp':case 'ledger':case 'ruler':case 'chisel':case 'anvil':case 'square_tile':case 'stacked_stone':case 'split_stone':case 'leaf': {
      if(key==='ledger') {box(spin,BONE,[.13,.22,.1],[.11,.13,.045],[.15,0,0]);row(spin,DARK,1,[.19,.18,.13],.025,4,[.018,.009,.055]);}
      else if(key==='ruler') {box(spin,BRONZE,[.105,.15,.47],[.05,.03,.66]);row(spin,DARK,2,[.14,.16,.22],.08,7,[.045,.012,.012]);}
      else if(key==='chisel')box(spin,BONE,[0,.08,.72],[.13,.065,.26],[0,0,.1]);
      else if(key==='anvil'){box(spin,IRON,[0,.23,.20],[.24,.065,.16]);cone(spin,IRON,[.14,.23,.2],.04,.17,[0,0,-Math.PI/2]);}
      else if(key==='stacked_stone'||key==='split_stone')for(let i=0;i<3;i++)box(spin,BONE,[(i%2)*.025,.18+i*.045,.30],[.16,.035,.10],[0,i*.2,0]);
      else if(key==='leaf')for(const s of [-1,1])box(spin,BONE,[s*.095,.16,.42],[.12,.025,.22],[0,s*.5,0]);
      else {box(spin,key==='square_tile'?BONE:BRONZE,[0,.24,.15],[.19,.06,.19]);box(spin,IRON,[0,.29,.15],[.08,.04,.08]);}break;
    }
    case 'fuse':case 'burning_fuse':case 'comet_tail': {
      for(let i=0;i<4;i++)box(spin,i===3?L:BONE,[.11,.18+i*.025,.1-i*.04],[.025,.025,.06],[.5,0,0]);break;
    }
    case 'beacon':case 'lantern':case 'lamp':case 'censer':case 'post': {
      cyl(spin,BRONZE,[.12,.26,.19],.06,.13,[0,0,0]);
      cone(spin,BRONZE,[.12,.36,.19],.095,.05,[0,0,0]);
      for(const s of [-1,1])box(spin,IRON,[.12+s*.065,.25,.19],[.02,.16,.025]);
      box(spin,L,[.12,.25,.19],[.065,.10,.065]);
      if(key==='censer')ring(spin,BRONZE,[.12,.40,.19],.045,.012,[0,0,0]);break;
    }
    case 'tripod':case 'track':case 'hound_jaw':case 'nest':case 'bell':case 'hinge':case 'valve': {
      if(key==='tripod')for(let i=0;i<3;i++){const a=i/3*Math.PI*2;cyl(spin,IRON,[Math.cos(a)*.10,-.14,.22+Math.sin(a)*.10],.017,.26,[Math.cos(a)*.35,0,Math.sin(a)*.35]);}
      else if(key==='hound_jaw') {for(const s of [-1,1])box(spin,BONE,[s*.10,.12,.57],[.06,.06,.22],[0,s*.3,0]);row(spin,IRON,2,[-.09,.18,.49],.045,4,[.04,.04,.03]);}
      else if(key==='nest')for(let i=0;i<3;i++)ring(spin,BRONZE,[0,.18+i*.03,.35],.14-i*.015,.02,[Math.PI/2,.1,0]);
      else if(key==='bell')part(spin,'cylinder',[.03,.1,.15,8],BRONZE,[.12,.26,.19]);
      else if(key==='valve'){ring(spin,BRONZE,[.14,.27,.15],.085,.017,[Math.PI/2,0,0]);box(spin,BRONZE,[.14,.27,.15],[.18,.025,.025]);}
      else if(key==='track')row(spin,IRON,2,[-.15,-.03,.07],.065,6,[.07,.04,.045]);
      else {cyl(spin,BRONZE,[0,.22,.42],.055,.24,[0,0,Math.PI/2]);box(spin,IRON,[0,.27,.53],[.12,.05,.24],[.2,0,0]);}break;
    }
    case 'split_fan': {
      for(const s of [-1,1])for(let i=0;i<3;i++)cyl(spin,IRON,[s*(.07+i*.05),.08,.56],.023,.28,[Math.PI/2,s*(.15+i*.14),0]);break;
    }
    default: throw new Error('Unimplemented weapon model module: '+key);
  }
}

export function buildWeaponAssetModel(id) {
  const recipe=ASSET_MODEL_RECIPES[id];if(!recipe)throw new Error('Unknown weapon art: '+id);
  let t=templates.get(id);
  if(!t) {
    t=base(recipe.shape,recipe.color);
    recipe.modules.forEach((key,i)=>modulePart(t,key,recipe.color,i));
    t.name='weapon_asset_'+id;
    t.userData={assetId:id,artVersion:1,physicalModules:recipe.modules};
    templates.set(id,t);
  }
  const model=t.clone(true);
  model.userData={assetId:id,artVersion:1,physicalModules:[...recipe.modules],muzzle:model.getObjectByName('muzzle')};
  applyBlenderGunVisual(model,id);
  return model;
}

export function animateWeaponAssetModel(model,state={}) {
  if(!model?.name?.startsWith('weapon_asset_'))return;
  animateBlenderGunVisual(model,state);
  const time=state.time||0, charge=Math.max(0,Math.min(1,state.charge||0)),heat=Math.max(0,Math.min(1,state.heat||0));
  const spin=model.getObjectByName('spin');if(spin)spin.rotation.z=time*(state.firing?9:1.4);
  const c=model.getObjectByName('charge');if(c)c.scale.setScalar(.55+charge*.95);
  const r=model.getObjectByName('reload');if(r)r.position.y=state.reloading?-.12*Math.sin((state.reloadProgress||0)*Math.PI):0;
  const p=model.getObjectByName('pendulum');if(p)p.rotation.z=Math.sin(time*5)*.35;
  const m=model.getObjectByName('mode');if(m)m.rotation.z=state.mode?Math.PI:0;
  const pump=model.getObjectByName('pump');if(pump)pump.position.z=.42-(state.recoil||0)*.20;
  for(let i=0;i<4;i++) {
    const h=model.getObjectByName('heat'+i);if(h)h.visible=heat>(i+.5)/4;
    const a=model.getObjectByName('anchor'+i);if(a)a.visible=i<(state.anchors||0);
    const s=model.getObjectByName('sequence'+i);if(s)s.visible=i<=((state.sequence||0)%4);
  }
}

export function weaponAssetArtStats() {
  return {recipes:Object.keys(ASSET_MODEL_RECIPES).length,templates:templates.size,geometries:geometries.size};
}
