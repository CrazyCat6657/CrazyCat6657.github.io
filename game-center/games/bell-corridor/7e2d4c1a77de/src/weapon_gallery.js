import * as THREE from '../vendor/three.module.js';
import { ASSET_WEAPON_DEFINITIONS as weapons } from './game/weapon_assets_data.js';
import { buildWeaponAssetModel,animateWeaponAssetModel,weaponAssetArtStats } from './art/weapon_assets_models.js';
import { preloadGunAssets } from './art/gun_assets.js';
const $=id=>document.getElementById(id),renderer=new THREE.WebGLRenderer({canvas:$('models'),antialias:true,alpha:true});renderer.setPixelRatio(Math.min(1.5,devicePixelRatio));renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(33,1,.01,20);scene.add(new THREE.HemisphereLight(0xd8f0ef,0x30271c,2.7));const sun=new THREE.DirectionalLight(0xffdd9a,3);sun.position.set(2,4,3);scene.add(sun);
const pageSize=20,pageCount=Math.max(1,Math.ceil(weapons.length/pageSize));
let page=0,models=[],ready=false;
document.title=`${weapons.length}武器 · 三维检视`;
$('count').textContent=`每页${pageSize}把，共${weapons.length}把。`;
$('page').textContent='正在加载模型…';$('prev').disabled=$('next').disabled=true;
function load(){for(const m of models)scene.remove(m);models=[];$('grid').replaceChildren();const slice=weapons.slice(page*pageSize,page*pageSize+pageSize);
for(const [i,w] of slice.entries()){const el=document.createElement('article');const num=document.createElement('div');num.className='number';num.textContent=String(page*pageSize+i+1).padStart(3,'0');const b=document.createElement('b');b.textContent=w.cn;const sub=document.createElement('small');sub.textContent=w.assetFamily;el.append(num,b,sub);el.title=`${w.desc}\n${w.assetTradeoff}`;$('grid').append(el);const m=buildWeaponAssetModel(w.id);m.userData.card=el;scene.add(m);models.push(m);} $('page').textContent=`${page+1} / ${pageCount}`;}
window.__gallery={get ready(){return ready;},get page(){return page;},pageCount,total:weapons.length,get models(){return models.map(m=>m.userData.assetId);},get art(){return models.map(m=>({id:m.userData.assetId,gunArt:m.userData.gunArt||null}));},get stats(){return weaponAssetArtStats();},inspectModels:()=>models,setPage:p=>{if(!ready||!Number.isFinite(p))return;page=Math.max(0,Math.min(pageCount-1,Math.floor(p)));load();}};
$('prev').onclick=()=>{page=(page+pageCount-1)%pageCount;load();};$('next').onclick=()=>{page=(page+1)%pageCount;load();};
await preloadGunAssets();load();ready=true;$('prev').disabled=$('next').disabled=false;
function draw(ms){const t=ms/1000,canvas=$('models'),rect=canvas.getBoundingClientRect();renderer.setSize(rect.width,rect.height,false);renderer.setScissorTest(false);renderer.clear();renderer.setScissorTest(true);
for(const model of models){const r=model.userData.card.getBoundingClientRect(),x=r.left-rect.left,y=rect.height-(r.top-rect.top)-r.height;renderer.setViewport(x,y,r.width,r.height);renderer.setScissor(x,y,r.width,r.height);for(const m of models)m.visible=m===model;model.rotation.y=.7+Math.sin(t*.3)*.65;animateWeaponAssetModel(model,{time:t,charge:$('motion').value==='charge'?1:0,heat:1,anchors:4,mode:Math.floor(t)%2,sequence:Math.floor(t*2),firing:$('motion').value==='fire',reloading:$('motion').value==='reload',reloadProgress:(t%1),recoil:$('motion').value==='fire'?.18*(.5+.5*Math.sin(t*20)):0});const box=new THREE.Box3().setFromObject(model),center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());const dist=Math.max(size.x,size.y,size.z)*2.8;camera.aspect=r.width/r.height;camera.position.copy(center).add(new THREE.Vector3(dist*.72,dist*.55,dist*.75));camera.lookAt(center);camera.updateProjectionMatrix();renderer.render(scene,camera);}for(const m of models)m.visible=true;requestAnimationFrame(draw);}
requestAnimationFrame(draw);
