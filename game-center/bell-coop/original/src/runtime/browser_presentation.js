// Original browser rendering only. No Node imports, checkpoint restoration,
// Game.update, room damage, AI, pickup update, runtime tick or Meta tick.
import * as THREE from '../../vendor/three.module.js';
import {buildPlayer} from '../art/models.js';
import {buildGunModel} from '../art/guns.js';
import {WEAPON_MAP} from '../game/data.js';
import {audio} from '../core/audio.js';
import {Game} from '../game/game.js';
import {registerActor} from '../game/actor_context.js';
import {Player} from '../game/player.js';
import {HUD} from '../game/hud.js';
import {RoomScene} from '../game/room.js';
import {ConnectorScene} from '../game/connector.js';
import {Enemy} from '../game/enemies.js';
import {createBoss,BOSS_MAP} from '../game/bosses.js';
import {Companion} from '../game/companion.js';
import {heroById,heroWithPaint,HERO_MAP} from '../game/heroes.js';
import {FOLD_SHADOW} from '../experimental/combat/fold_hero.js';
import {savedWeaponDefinition,fields} from '../game/session.js';
import {WeaponAssetFX} from '../fx/weapon_assets_fx.js';
import {Input} from '../core/input.js';
import {preferences} from '../game/preferences.js';
import {RNG} from '../core/rng.js';
import {FLOOR_THEME} from '../core/constants.js';
import {applyPresentationPose} from './presentation_pose.js';
import {preloadActorAssets,actorAssetStatus} from '../art/actor_assets.js';
import {preloadGunAssets,gunAssetStatus} from '../art/gun_assets.js';
import {preloadPropAssets,propAssetStatus} from '../art/prop_assets.js';
import {preloadChestAsset,chestAssetStatus} from '../art/chest_asset.js';

const copy=v=>structuredClone(v),ids=['player','player2'];
// A remote actor never constructs HUD/EquipmentView or binds DOM listeners.
export class RemotePresentationHUD {
 constructor(game){this.game=game;this.el={};this.hubOpen=this.choiceOpen=this.buildOpen=false;}
 setDeadeye(){} applyDisplayPreferences(){} hideReticle(){} syncPanelInput(){}
 toast(){} popText(){} tip(){} setWorldLabels(){} refreshControlLabels(){}
}
export async function preloadPresentationAssets(){
 await Promise.all([preloadActorAssets(),preloadGunAssets(),preloadPropAssets(),preloadChestAsset()]);
 const statuses=[...Object.values(actorAssetStatus),gunAssetStatus,propAssetStatus,chestAssetStatus];
 if(statuses.some(s=>s.state!=='ready'))throw Error('原游戏美术资源未能完整载入，请重试。');
 return statuses;
}
export class OriginalCoopPresentation {
 createRemoteHUD(view){return new RemotePresentationHUD(view);}
 constructor(canvas,{localPlayerId,command,pause,onError=()=>{}}){
  if(!globalThis.__bellPresentationStorage)throw Error('Configure cooperative Storage before importing original modules');
  if(!ids.includes(localPlayerId))throw Error('Unknown local actor');
  this.localPlayerId=localPlayerId;this.command=command;this.pause=pause;this.onError=onError;
  this.assetFX=new Map();this.actorRenderState=new Map();this.methods=this.createMethods();this.disposed=false;
  this.game=new Game(canvas,{presentation:this});const g=this.game;
  this.events=new AbortController();this.scenes=new Map();this.entities=new Map();this.tick=-1;
  const b=registerActor(g,{playerId:'player2',slot:1});b.hud=new RemotePresentationHUD(b.view);
  for(const a of g.actors.values()){
   a._modalStack=[];this.actorRenderState.set(a.playerId,{});a.input={actionDown:()=>!!this.actorRenderState.get(a.playerId).firing,actionHit:()=>false,label:()=>'',setBlocked(){},clearEdges(){}};
   a.weaponAssets={entities:[],visualState(){return this.entities;}};
   this.assetFX.set(a.playerId,a.slot===0?g.weaponAssetFX:new WeaponAssetFX(g.scene));
  }
  const a=g.getActor(localPlayerId);this.actor=a;this.view=a.view;a.input=new Input(canvas);
  a.hud=new HUD(a.view);this.hud=a.hud;
  // All static solo bindUI/pagehide/visibility callbacks were skipped in Game.
  const bind=(id,fn)=>document.getElementById(id)?.addEventListener('click',fn,{signal:this.events.signal});
  bind('btn-build',()=>this.view.setBuild(true));bind('btn-build-close',()=>this.view.setBuild(false));
  bind('btn-pause-build',()=>this.view.setBuild(true));bind('btn-resume',()=>this.pause(false));
  bind('btn-death-build',()=>this.view.setBuild(true));bind('btn-victory-build',()=>this.view.setBuild(true));
  bind('btn-pause-preferences',()=>this.hud.preferencesPanel());
  bind('btn-pending-choice',()=>this.send({kind:'floor-choice-open'}));
  window.addEventListener('resize',()=>g.onResize(),{signal:this.events.signal});
  window.addEventListener('keydown',e=>this.shortcut(e),{signal:this.events.signal});
  window.addEventListener('blur',()=>this.release(),{signal:this.events.signal});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)this.release();},{signal:this.events.signal});
  g.applyDisplayPreferences(preferences.get());this.hud.applyDisplayPreferences(preferences.get());g.onResize();
 }
 send(request){if(this.disposed)return Promise.resolve({ok:false});return this.command(request).then(r=>{if(r?.ok===false)this.hud.toast('操作未完成','请稍后重试。','#ffcf6a','fail');return r;}).catch(e=>{this.onError(e);return {ok:false,error:e.message};});}
 createMethods(){
  const tx=(kind,extra={})=>this.send({kind,...(!kind.includes('.')?{roomUid:this.game.room?.uid}:{}),...extra});
  return {
   saveProgress:()=>false,metaSee:()=>false,screenToGround:(_v,x,y)=>this.game.screenToGround(x,y),
   nearestInteractable:v=>{let best=null,dist=Infinity;for(const i of this.personal?.interactables||[]){const d=Math.hypot(v.player.x-i.x,v.player.z-i.z);if(d<=i.radius&&d<dist){best=i;dist=d;}}return best;},
   interactables:()=>this.personal?.interactables||[],interactHint:()=>this.personal?.hint||'',
   setBuild:(v,on)=>{const open=on===undefined?!v.buildOpen:!!on;if(open===!!v.buildOpen)return {ok:true};v.buildOpen=open;v.hud.toggleBuild(open);return tx(open?'equipment.open':'equipment.close');},
   closeTopPanel:v=>{const p=this.personal?.panel;if(v.topModal()==='build'){v.setBuild(false);return true;}if(v.hud._hub?.cfg.settings||v.hud._hub?.cfg.controls){v.hud.closeHubPanel();return true;}if(p){if(p.multi)return false;this.send({kind:p.type+'.back',panelId:p.panelId,revision:p.revision});return true;}return false;},
   setPaused:(_v,on)=>this.pause(on),
   installBuildAttachment:(v,id,index=v.player.weaponIndex,slotIndex=-1)=>tx('attachment-install',{attachmentId:id,weaponInstanceId:v.player.weapons[index]?.assetInstanceId,slotIndex}),
   tryInstallAttachment:(v,...args)=>v.installBuildAttachment(...args),
   tryDetachAttachment:(v,id,index=v.player.weaponIndex)=>tx('attachment-detach',{attachmentId:id,weaponInstanceId:v.player.weapons[index]?.assetInstanceId}),
   tryDropSpareAttachment:(_v,index)=>tx('attachment-drop',{index}),
   dropBuildWeapon:(v,index,whole=false)=>tx('weapon-drop',{weaponInstanceId:v.player.weapons[index]?.assetInstanceId,whole}),
   selectActive:(_v,id)=>tx('active.select',{activeId:id}),cycleActive:(_v,delta)=>tx('active.cycle',{delta}),
   useHub:(_v,id)=>{if(id==='readout')this.hud.preferencesPanel();},
   toggleMinimapBig:()=>{this.game.mmBig=!this.game.mmBig;},
   applyDisplayPreferences:(_v,p)=>{this.game.applyDisplayPreferences(p);this.hud.applyDisplayPreferences(p);},
   openFloorChoice:()=>tx('floor-choice-open'),
   beginLayoutEdit:()=>false,
  };
 }
 shortcut(e){
  const v=this.view,i=v.input;if(e.defaultPrevented||i.capturing||e.target.closest?.('input,select,textarea'))return;
  if(e.key==='Escape'){e.preventDefault();if(!e.repeat&&!v.closeTopPanel())this.pause(!this.snapshot?.original?.paused);return;}
  if(e.repeat)return;
  if(i.matchesEvent('build',e)){e.preventDefault();v.setBuild();}
  else if(!v.panelOpen()&&i.matchesEvent('minimap',e)){e.preventDefault();v.toggleMinimapBig();}
  else if(!v.panelOpen()&&i.matchesEvent('cycle_active',e)){e.preventDefault();v.cycleActive(1);}
 }
 release(){this.view.input.resetState();this.onRelease?.();}
 apply(snapshot){
  if(this.disposed)return false;
  const start=performance.now(),g=this.game,f=snapshot.original;if(!f||!snapshot.dynamic||!snapshot.personal)return false;
  if(snapshot.static){this.construct(snapshot.static);this.staticRevision=snapshot.static.revision;}
  if(!this.staticRevision||this.staticRevision!==snapshot.staticRevision)return false;
  this.snapshot=snapshot;this.personal=snapshot.personal;
  g.state=f.state;g.paused=!!f.paused;g.runId=f.runId;g.run.time=f.runTime;g.room=this.roomsByUid.get(f.roomId);g.roomScene=this.scenes.get(f.roomId);g.runPolicy=f.runPolicy;g.mod_=copy(f.mod_||{});g.activeModifier=copy(f.modifier||null);g._partyLifecycle=f.lifecycle;g.hiddenRoomRevealed=room=>f.map.find(r=>r.id===room.id)?.revealed===true;
  for(const r of f.map||[]){const room=g.dungeon.rooms.get(r.id);if(room)Object.assign(room,r);}
  Object.assign(g,snapshot.dynamic.effects);g.time=f.time;
  for(const data of snapshot.dynamic.players)this.applyActor(data,data.id===this.localPlayerId?this.personal:null);
  for(const d of snapshot.dynamic.rooms){const sc=this.scenes.get(d.uid);if(!sc)throw Error('Original scene recipe missing');sc.importState?.(d.state);for(const [key,open]of Object.entries(d.doors||{})){const door=sc.doorways[key];if(door){door.open=open;door.barrier.object.visible=!open;}}}
  this.syncEnemies(snapshot.dynamic);this.syncObjects(snapshot.dynamic);this.syncSummons(snapshot.dynamic.summons);
  this.syncPanel(this.personal.panel);this.syncScreen(this.personal);
  for(const event of snapshot.events||[])this.event(event);
  this.receivedAt=performance.now();this.tick=snapshot.dynamic.tick;this.applyMs=performance.now()-start;return true;
 }
 construct(recipe){
  const start=performance.now(),g=this.game;
  for(const sc of this.scenes.values())sc.dispose();this.scenes.clear();
  g.floor=recipe.floor;audio.playMusic('floor'+g.floor);g.theme=FLOOR_THEME[g.floor];g.stage=copy(recipe.stage);g.flowVersion=recipe.flowVersion;g.seed=recipe.seed;g.rng=new RNG(recipe.seed);g.grng=new RNG(recipe.seed);
  const map=new Map(recipe.topology.map(r=>[r.id,copy(r)]));g.dungeon={rooms:map,get list(){return [...this.rooms.values()];},get(x,y){return this.list.find(r=>r.gx===x&&r.gy===y);},gridSize:recipe.gridSize};
  this.roomsByUid=new Map([...map.values()].map(r=>[r.uid,r]));
  for(const spec of recipe.rooms){
   let sc;if(spec.kind==='RoomScene'){const room={...copy(spec.room)};map.set(room.id,room);this.roomsByUid.set(room.uid,room);sc=new RoomScene(g,room,spec.ox,spec.oz);}
   else if(spec.kind==='ConnectorScene')sc=new ConnectorScene(g,{axis:spec.recipe.axis,ox:spec.ox,oz:spec.oz,len:spec.recipe.hl*2,floor:spec.recipe.floor,rngSeed:spec.room.seed||1});
   else throw Error('Unsupported original scene kind '+spec.kind);
   this.scenes.set(spec.room.uid,sc);
  }
  g._residentRooms=new Map([...this.scenes].filter(([,sc])=>sc instanceof RoomScene));g._residentConnectors=new Map([...this.scenes].filter(([,sc])=>sc instanceof ConnectorScene));
  g.roomLights.clear();for(const sp of recipe.rooms.flatMap(r=>r.lightSpecs))g.roomLights.add(sp.x,sp.y,sp.z,sp.color,sp.intensity,sp.distance,sp.flicker||0);
  this.constructMs=performance.now()-start;
 }
 applyActor(data,personal){
  const a=this.game.getActor(data.id),v=a.view,appearance=data.appearance,p=personal?.player,state=this.actorRenderState.get(data.id);
  const key=JSON.stringify([appearance.heroId,appearance.heroRuleVersion,appearance.paint]);
  if(state.hero!==key){
   if(!HERO_MAP[appearance.heroId])throw Error('Unknown original hero');
   if(a.player)this.game.scene.remove(a.player.rig.group);
   a.hero=appearance.heroId==='foldshadow'?FOLD_SHADOW:heroById(appearance.heroId,appearance.heroRuleVersion);a.heroPainted=heroWithPaint(a.hero,appearance.paint);
   a.player=new Player(v);a.player.hero=a.heroPainted;a.player.buildModel();a.player.id=a.playerId;state.hero=key;
  }
  const player=a.player,weaponData=p?.weapons||[{...appearance.weapon,mag:0,reserve:0,attachments:appearance.weapon.attachments||[]}];
  const sig=JSON.stringify([p?.weaponIndex||0,weaponData.map(w=>[w.id,w.source,w.definitionVersion,w.attachments,w.attachmentPositions])]);
  if(state.weapons!==sig){player.weapons=weaponData.map(w=>({...copy(w),def:savedWeaponDefinition(w)}));player.weaponIndex=p?.weaponIndex||0;player.buildModel();state.weapons=sig;}
  if(p){Object.assign(player,copy(fields(p,['weapons'])));p.weapons.forEach((w,i)=>Object.assign(player.weapons[i],copy(fields(w,['id','source','definitionVersion']))));a.buildSupply=personal.buildSupply;a.consumables=personal.consumables;a.revival=personal.revival;a.revivalPending=personal.revivalPending;}
  else {Object.assign(player,copy(data.animation));Object.assign(player.weapon,data.weaponState);}
  a.experiment=copy(personal?.experiment||data.experiment);state.firing=data.firing;
  if(data.id===this.localPlayerId&&a.input.profile!==(a.experiment?'experimental':'classic'))a.input.setProfile(a.experiment?'experimental':'classic');
  const pub=this.snapshot.original.players.find(p=>p.id===data.id);if(pub)for(const k of ['hp','armor','alive','coins','keys'])player[k]=pub[k];
  if(personal){const hp=player.hp,armor=player.armor;player.recompute();player.hp=hp;player.armor=armor;}else {player.stats ||= {};player.stats.synergies||=[];}
  // Semantic hooks reference original rig parts, independent from replacement GLB hierarchy.
  const previous=player.rig.group.position.clone();applyPresentationPose(player,data.pose);state.motion={from:previous,to:player.rig.group.position.clone()};
  if(data.companion){if(!a.companion)a.companion=new Companion(v,data.companion.data.name);const c=a.companion;if(c.stage!==data.companion.data.stage||c.evo!==data.companion.data.evo){const previousStage=c.stage;Object.assign(c,copy(data.companion.data));c.renderEvolution(previousStage);}Object.assign(c,copy(data.companion.data));applyPresentationPose(c,data.companion.pose);c.updateRageVisual();}
  else if(a.companion){a.companion.dispose();a.companion=null;}
  a.weaponAssets.entities=copy(this.snapshot.dynamic.assets.find(x=>x.actorId===data.id)?.entities||[]);
 }
 syncEnemies(dynamic){
  const g=this.game,wanted=new Set();g.enemies=[];
  for(const d of dynamic.enemies){const id='enemy:'+d.data.id;wanted.add(id);let e=this.entities.get(id);if(!e){e=new Enemy(g,d.data.kind,d.data.x,d.data.z,{elite:d.data.elite,id:d.data.id});this.entities.set(id,e);}Object.assign(e,copy(d.data));applyPresentationPose(e,d.pose);g.enemies.push(e);}
  if(dynamic.boss){const d=dynamic.boss,id='boss:'+d.data.bossType;wanted.add(id);let b=this.entities.get(id);if(!b){if(!BOSS_MAP[d.data.bossType])throw Error('Unknown original Boss');b=createBoss(g,d.data.x,d.data.z,d.data.bossType);this.entities.set(id,b);}Object.assign(b,copy(d.data));applyPresentationPose(b,d.pose);g.boss=b;}else g.boss=null;
  for(const [key,e]of this.entities)if(!wanted.has(key)){e.remove();this.entities.delete(key);}
 }
 syncObjects(dynamic){
  const g=this.game;
  // Original pool allocators only construct visuals here. No update/collision is called.
  g.projectiles.reset();for(const d of dynamic.native){const b=g.projectiles.spawn({...d,color:d.color||'#8af0ff'});if(!b)throw Error('Original projectile visual pool exhausted');Object.assign(b,copy(fields(d,['pose'])));applyPresentationPose(b,d.pose);}
  for(const d of dynamic.beams){const b=g.projectiles.beams[d.index];b.life=d.life;b.maxLife=d.maxLife;applyPresentationPose(b,d.pose);}
  const existing=new Map(g.pickups.list.map(p=>[p.pickupId,p]));for(const d of dynamic.pickups){let p=existing.get(d.pickupId);if(!p)p=g.pickups.spawn(d.kind,d.x,d.z,d);existing.delete(d.pickupId);Object.assign(p,copy(fields(d,['pose'])));applyPresentationPose(p,d.pose);}for(const p of existing.values())g.pickups.remove(p);
  while(g.hazards.items.length>dynamic.hazards.length)g.hazards.remove(g.hazards.items.at(-1));
  dynamic.hazards.forEach((d,i)=>{if(!g.hazards.items[i])g.hazards.add(d.x,d.z,d.radius,d.delay,d.damage,d.color);const h=g.hazards.items[i];Object.assign(h,copy(fields(d,['pose'])));applyPresentationPose(h,d.pose);});
 }
 syncSummons(data){
  const g=this.game;
  for(const [key,items]of [['_turrets',data?.turrets||[]],['_drones',data?.drones||[]]]){
   g[key]||=[];while(g[key].length>items.length){const t=g[key].pop();g.scene.remove(t.g);if(t.light)t.light.active=false;}
   items.forEach((d,i)=>{if(!g[key][i]){const v=g.getActor(d.data.ownerPlayerId).view;if(key==='_turrets')v.spawnTurret(d.data.x,d.data.z,d.data.power);else v.spawnCompanion(d.data.power,{count:1,passive:!!d.data.passive,silent:true});}const t=g[key][i];Object.assign(t,copy(d.data));applyPresentationPose(t,d.pose);});
  }
 }
 syncPanel(panel){
  const key=panel?panel.panelId+':'+panel.revision:'';if(key===this.panelKey)return;this.panelKey=key;
  const h=this.hud;if(!panel){if(h._hub&&!h._hub.cfg.settings&&!h._hub.cfg.controls)h.closeHubPanel();if(h._choice)h.closeChoice();return;}
  const submit=(kind,index)=>this.send({kind,panelId:panel.panelId,revision:panel.revision,...(index===undefined?{}:{index})});
  const cfg={...copy(panel),partyTyped:true,commitAsync:true,onPick:(_o,index)=>submit(panel.type+'.pick',index),onToggle:(_o,index)=>submit('choice.pick',index),onConfirm:()=>submit('choice.confirm'),onBack:()=>submit('hub.back')};
  if(panel.type==='hub'){h.hubPanel(cfg);h._hub.idx=panel.index;h.updateHubSelection();}
  else if(panel.type==='choice'){h.choicePanel(cfg);h._choice.idx=panel.index;h.updateChoiceSelection();}
  else throw Error('Unsupported original typed panel');
 }
 syncScreen(p){
  const h=this.hud,id=p.screen||(this.snapshot.original.paused?'screen-pause':null);
  if(id!==this.screen){if(id)h.showScreen(id);else h.hideScreens();this.screen=id;}
  if(p.stats&&JSON.stringify(p.stats)!==this.statsKey){this.statsKey=JSON.stringify(p.stats);h.fillStats(p.stats.run,p.stats.id);}
  if(p.verdict)h.setVictoryVerdict(p.verdict);
 }
 event(e){if(e.sequence<=(this.eventSequence||0))return;this.eventSequence=e.sequence;const d=e.data||{},h=this.hud;
  if(e.type==='presentation-audio'){const allowed=new Set(['gun','explosion','meteorWarning','meteor','impact','ricochet','hitEnemy','enemyDie','hurt','roll','reload','pickup','coin','key','heal','chestOpen','doorLock','doorOpen','stairs','secretFound','bossRoar','bell','furnaceIgnite','machineSpin','phaseChange','victory','defeat','ui','dashBlast','shield','slowmo','bossShoot','teleport','playMusic','stopMusic']);if(!allowed.has(d.method))throw Error('Unknown original audio event');audio[d.method](...d.args);}
  else if(e.type==='presentation-particles'){if(!['muzzle','impact','bloodburst','smoke','explosion','sparkle','ring','beam'].includes(d.method))throw Error('Unknown original particle event');this.game.particles[d.method](...d.args);}
  else if(e.type==='toast')h.toast(d.title,d.sub,d.color,d.kind);else if(e.type==='pop-text')h.popText(d.x,d.y,d.z,d.text,d.color,d.big);else if(e.type==='center-message')h.centerMessage(d.title,d.sub,d.duration);else if(e.type==='tip')h.tip(d.text);
 }
 interact(){const i=this.view.nearestInteractable();if(!i||i.disabled)return;
  const data={roomUid:this.game.room.uid};
  if(i.type==='chest')return this.send({...data,kind:'chest-open',chestId:i.saveId});
  if(i.type==='stairs')return this.send({kind:'lifecycle.stairs'});
  if(i.type==='table')return this.send({kind:'scene.table-flip',saveId:i.saveId});
  if(i.type==='altar')return this.send({...data,kind:'altar-preview'});
  if(i.type==='shop'||i.type==='service'){const shop=this.personal.shop;return this.send({...data,kind:i.type==='shop'&&shop.offers.find(o=>o.offerId===i.offerId)?.kind==='weapon'&&this.actor.player.weapons.length>=3?'shop-choice':'shop-purchase',shopId:shop.shopId,revision:shop.revision,offerId:i.offerId});}
  if(i.pickupId)return this.send({...data,kind:['groundRelic','groundConsumable'].includes(i.type)?'pickup-choice':'collect',pickupId:i.pickupId});
 }
 inputFrame(){const i=this.view.input;if(!this.actor.player)return null;
  i.refreshPointerPosition();this.view.solveAim();
  if(i.actionHit('interact'))this.interact();
  const localActions=new Set(['interact','build','minimap','cycle_active']);
  const actions=Object.keys(i.bindings).filter(a=>!localActions.has(a)&&(i.actionDown(a)||i.actionHit(a)));
  const move=i.moveVec();return {move:{x:move.x,z:move.z},aimPoint:copy(this.actor.player.aimPoint),actions,keys:[]};
 }
 render(dt){
  if(this.disposed||!this.snapshot)return;const g=this.game,v=this.view,h=this.hud;
  // HUD navigation is local. Confirmation invokes the captured typed binding.
  if(h.hubOpen)h.handleHubKeys(v.input,dt);
  if(h.choiceOpen){if(v.input.hit('ArrowLeft'))h.choiceNav(-1);if(v.input.hit('ArrowRight'))h.choiceNav(1);for(let n=1;n<=5;n++)if(v.input.hit(String(n)))h.choicePick(n-1);if(v.input.hit('Enter'))h.choiceConfirm();}
  if(h.buildOpen)h.handleEquipmentKeys(v.input);
  for(const a of g.actors.values()){a.player?.animate(dt);const motion=this.actorRenderState.get(a.playerId)?.motion;if(motion)a.player.rig.group.position.lerpVectors(motion.from,motion.to,Math.min(1,(performance.now()-this.receivedAt)/34));}
  for(const sc of this.scenes.values())sc instanceof RoomScene?sc.updateVisuals(dt):sc.update(dt);
  g.particles.update(dt);g.debris.update(dt);g.decals.update(dt);g.flashLights.update(dt);g.roomLights.update(dt,g.time);
  g.updateCamera(dt);h.update(dt);g.updateReticle(v);g.render(dt);
 }
 dispose(){if(this.disposed)return;this.release();this.disposed=true;this.events.abort();this.view.input.dispose();this.hud.dispose();
  for(const sc of this.scenes.values())sc.dispose();for(const e of this.entities.values())e.remove();
  for(const a of this.game.actors.values()){a.companion?.dispose();a.foldVisuals?.dispose();this.assetFX.get(a.playerId)?.clear();}
  this.game.pickups.clear();this.game.hazards.clear();this.game.projectiles.reset();
  const p=this.game.postfx;for(const k of ['rtScene','rtBloomA','rtBloomB','rtBloomC','brightMat','blurMat','compMat'])p[k]?.dispose();p.quad?.geometry.dispose();
  this.game.scene.clear();this.game.renderer.dispose();
 }
}

// The lobby previews the same loaded original rig and weapon factories.
export class OriginalLoadoutPreview {
 constructor(canvas,selection){
  const base=selection.hero==='foldshadow'?FOLD_SHADOW:heroById(selection.hero,3),hero=heroWithPaint(base,selection.paint);
  this.renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:false});this.renderer.setPixelRatio(1);this.renderer.setSize(220,140,false);
  this.scene=new THREE.Scene();this.scene.add(new THREE.HemisphereLight(0xb3e4ff,0x25303b,2));const light=new THREE.DirectionalLight(0xffd6ad,3);light.position.set(3,5,5);this.scene.add(light);
  const rig=buildPlayer(hero.pal,hero.build),def=WEAPON_MAP[selection.sidearm]||WEAPON_MAP[hero.sidearm];this.scene.add(rig.group);rig.group.rotation.y=-.5;
  if(def){const gun=buildGunModel(def.model);rig.armR?.sh?.add(gun);gun.position.set(.15,-.5,.5);}
  const camera=new THREE.PerspectiveCamera(40,220/140,.1,50);camera.position.set(4,3.5,6);camera.lookAt(0,1,0);this.renderer.render(this.scene,camera);
 }
 dispose(){this.scene.clear();this.renderer.dispose();}
}
