import { WEAPONS,WEAPON_MAP } from './game/data.js';
import { HEROES } from './game/heroes.js';
import { ATTACHMENTS } from './game/attachments.js';
import { configureTraining } from './game/training.js';
import { ASSET_SPECS } from './game/weapon_assets_specs.js';
import { RELIC_PROJECTILE_IDS } from './game/weapon_assets_runtime.js';
import { capturePlayer,applyPlayer,savedWeaponDefinition } from './game/session.js';
import { encode,decode } from './game/save.js';

export function installWeaponLab(g) {
  const lab={customScenario:false,finite:true,scenario:'normal'};
  g.weaponLab=lab;
  lab.catalog=()=>({weapons:WEAPONS.filter(w=>[2,3].includes(w.weaponAssetVersion)),heroes:HEROES,attachments:ATTACHMENTS});
  lab.init=()=>{if(g.mode!=='hub')g.enterHub();g.hud.closeHubPanel();g.setPaused(false);g.updateCamera(1);g.render(0);return lab.catalog();};
  lab.equip=(id,hero,keepSecond=false)=>{
    if(!WEAPON_MAP[id]?.weaponAssetVersion)return false;
    if(g.mode!=='hub')return false;
    const old=keepSecond?g.player.weapon:null,serial=g.weaponAssets.serial;
    g.weaponAssets.reset();g.weaponAssets.serial=serial;
    const ok=configureTraining(g,{...(hero?{hero}:{}),weapon:id});if(!ok)return false;
    if(lab.finite)g.player.weapon.reserve=g.player.weapon.def.ammoMax||Infinity;
    if(old)g.player.weapons.push(old);
    g.weaponAssets.bindInventory(g.player);
    g.player.refreshGunModel();g.input.setBlocked(false);return true;
  };
  lab.refill=()=>{for(const w of g.player.weapons){w.mag=g.player.magSize(w);w.reserve=lab.finite?(w.def.ammoMax||Infinity):Infinity;}g.player.hp=g.player.maxHp;return true;};
  lab.attach=id=>{if(!ATTACHMENTS.some(a=>a.id===id))return false;const a=g.player.spareAttachments,n=a.length;a.push(id);const result=g.player.installAttachment(id);if(!result.ok)a.splice(n,1);return result;};
  lab.targets=kind=>{
    if(g.mode!=='hub')return false;
    lab.customScenario=kind!=='normal';lab.scenario=kind;
    g.weaponAssets.clear();g.projectiles.reset();
    for(const e of g.enemies)g.scene.remove(e.group);g.enemies=[];
    const hs=g.hubScene,p=g.player;
    const lane=kind==='normal'?0:-6;
    p.x=hs.ox+lane;p.z=hs.oz+12;p.vx=p.vz=0;
    p.aim={x:0,z:1};p.yaw=0;p.aimPoint={x:p.x,z:p.z+4};p.animate(0);g.updateCamera(1);
    if(kind==='normal')g.spawnDummies();
    else {
      const points=kind==='line'?[[0,16],[0,18],[0,20]]:kind==='crowd'?[[-2,17],[0,17],[2,17],[-1,19],[1,19]]:kind==='moving'?[[0,17]]:kind==='shield'?[[0,17]]:[[-4,17],[4,17]];
      for(const [x,z] of points){const e=g.spawnEnemy(kind==='shield'?'shield':'grunt',hs.ox+lane+x,hs.oz+z,{});if(!e)continue;e.dummy=true;e.trainKind=kind==='moving'?'mover':'tank';e.maxHp=e.hp=kind==='shield'?150:500;e.def={...e.def,speed:0,contact:0};
        if(kind==='moving'){e.trainSpot={kind:'mover',x:lane,z:17,from:-4,to:4,speed:5};e.moverDir=1;}
        if(kind==='shield'){e.yaw=Math.PI;e.shieldBroken=false;}
      }
    }
    g.hitboxes=[p,...g.enemies.filter(e=>e.alive)];g.setPaused(false);g.input.setBlocked(false);return true;
  };
  lab.save=()=>{
    const snapshot={version:1,hero:g.hero.id,scenario:lab.scenario,player:capturePlayer(g.player),runtime:g.weaponAssets.capture(),targets:g.enemies.filter(e=>e.alive).map(e=>({kind:e.kind,id:e.id,x:e.x,z:e.z,hp:e.hp,maxHp:e.maxHp,shieldHp:e.shieldHp,shieldBroken:e.shieldBroken,yaw:e.yaw,trainKind:e.trainKind,trainSpot:e.trainSpot,moverDir:e.moverDir}))};
    localStorage.setItem('ember-descent:weapon-lab:trial:v1',encode(snapshot));return true;
  };
  lab.restore=()=>{
    const raw=localStorage.getItem('ember-descent:weapon-lab:trial:v1');if(!raw)return false;
    const s=decode(raw);if(s.version!==1||!Array.isArray(s.player?.weapons)||!s.player.weapons.length||!Array.isArray(s.targets))throw Error('演练存档版本不匹配');
    const definitions=s.player.weapons.map(savedWeaponDefinition);
    // Validate exact versions and runtime ownership before changing the visible world.
    const validator=new g.weaponAssets.constructor(g);
    const owners=new Set();for(const w of s.player.weapons){if(typeof w.assetInstanceId!=='string'||!w.assetInstanceId||owners.has(w.assetInstanceId))throw Error('演练武器实例身份无效');owners.add(w.assetInstanceId);}
    // Independently validate the inventory-embedded state before runtime state can shadow it.
    validator.bindInventory({weapons:s.player.weapons.map((w,i)=>({...decode(encode(w)),def:definitions[i]}))});
    const embedded=validator.capture();
    validator.restore({...decode(encode(s.runtime)),states:{...decode(encode(s.runtime.states)),...embedded.states}});
    validator.restore(s.runtime);
    for(const [i,w] of s.player.weapons.entries())if(validator.supports(definitions[i])&&validator.states[w.assetInstanceId]?.weaponId!==(definitions[i].sourceWeapon||definitions[i].id))throw Error('演练武器运行时身份不匹配');
    lab.equip(s.player.weapons[0].source||definitions[0].sourceWeapon||definitions[0].id,s.hero);lab.targets(s.scenario);
    // Discard temporary training owners before applyPlayer binds the saved inventory.
    g.weaponAssets.reset();applyPlayer(g,s.player);
    for(const e of g.enemies)g.scene.remove(e.group);g.enemies=[];
    for(const data of s.targets){const e=g.spawnEnemy(data.kind,data.x,data.z,{id:data.id});Object.assign(e,data,{dummy:true});e.def={...e.def,speed:0,contact:0};}
    g.hitboxes=[g.player,...g.enemies];g.weaponAssets.restore(s.runtime);g.player.refreshGunModel();return true;
  };
  lab.status=()=>{
    const p=g.player,w=p?.weapon,s=w?.assetState||{};
    return {name:w?.def.cn,weapon:w?.def.sourceWeapon||w?.def.id,mag:w?.mag,reserve:w?.reserve===Infinity?'∞':w?.reserve,heat:Math.round(s.heat||0),sequence:s.sequence||0,anchors:g.weaponAssets.entities.filter(e=>e.kind==='anchor').length,lines:g.weaponAssets.entities.filter(e=>e.mechanic==='anchor').length,entities:g.weaponAssets.entities.length,mode:g.mode,state:g.state,paused:g.paused,targets:g.enemies.filter(e=>e.alive).map(e=>({hp:Math.ceil(e.hp),x:e.x,z:e.z})),completed:WEAPONS.filter(w=>[2,3].includes(w.weaponAssetVersion)).length};
  };
  lab.info=id=>ASSET_SPECS[id];
  lab.relicCompatibility=id=>RELIC_PROJECTILE_IDS.includes(id);
  window.__weaponLab=lab;
}
