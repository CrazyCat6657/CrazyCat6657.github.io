// Explicit presentation surface. Unknown calls fail normally instead of being
// swallowed by a Proxy. Choices retain the browser HUD callback contracts.
import {guardActorPanel} from '../game/actor_context.js';
export class HeadlessHUD {
  constructor(game, emit) { this.game=game; this.emit=emit; this.el={}; this._hub=null; this._choice=null; this.buildOpen=false; this._panelSequence=0; this.screen=null; }
  get hubOpen() { return !!this._hub; }
  get choiceOpen() { return !!this._choice; }
  clearPanelInput() { this._hubNavDir=0; this._hubNavHeld=0; this._hubNavNext=1; }
  syncPanelInput() { this.game.input?.setBlocked(this.hubOpen || this.choiceOpen || this.buildOpen || this.game.paused || this.game.state!=='play'); }
  choicePanel(cfg) { cfg=guardActorPanel(this.game,cfg);this._choice={cfg,idx:0,id:'panel:'+ ++this._panelSequence,revision:0}; this.game.setModalOwner('choice',true); this.clearPanelInput(); this.syncPanelInput(); this.changed(); }
  closeChoice() { this._choice=null; this.game.setModalOwner('choice',false); this.clearPanelInput(); this.syncPanelInput(); this.changed(); }
  choiceNav(d) { const c=this._choice,n=c?.cfg.options?.length; if(n)c.idx=(c.idx+d+n)%n; this.changed(); }
  choicePick(i) {
    const c=this._choice,o=c?.cfg.options?.[i]; if(!o)return false;
    if(c.cfg.commitAsync){if(c.pending)return false;c.pending=true;const fn=c.cfg.multi?c.cfg.onToggle:c.cfg.onPick;return Promise.resolve(fn?.(o,i,c)).then(r=>r?.ok===true).finally(()=>{c.pending=false;});}
    if(c.cfg.multi) { c.idx=i; if(c.cfg.onToggle?.call(c.cfg,o,i,c)!==true)return false; this.changed(); return true; }
    if(c.cfg.commitBeforeClose) { c.idx=i; if(c.cfg.onPick?.(o,i,c)!==true)return false; if(this._choice===c)this.closeChoice(); return true; }
    this.closeChoice(); c.cfg.onPick?.(o,i); return true;
  }
  choiceConfirm() {const pending=this._choice;if(pending?.cfg.commitAsync&&pending.cfg.multi){if(pending.pending)return false;pending.pending=true;return Promise.resolve(pending.cfg.onConfirm?.()).then(r=>r?.ok===true).finally(()=>{pending.pending=false;});} const c=this._choice; if(c?.cfg.multi) { if(c.cfg.picked.length!==c.cfg.multi || c.cfg.onConfirm?.()!==true)return false; if(this._choice===c)this.closeChoice(); return true; } return this.choicePick(c?.idx??0); }
  hubPanel(cfg) {
    cfg=guardActorPanel(this.game,cfg);
    if(this.game.actorCount!==2&&this.game.pendingHubSelection?.()){this.game.noticePendingHubSelection();return;}
    const same=!!cfg.page&&this._hub?.cfg.page===cfg.page;
    const idx=same?this._hub.idx:0; this._hub={cfg,idx,id:'panel:'+ ++this._panelSequence,revision:0}; this.game.setModalOwner('hub',true); this.clearPanelInput(); this.syncPanelInput(); this.changed();
  }
  closeHubPanel() {
    if(this.game.actorCount!==2&&this.game.pendingHubSelection?.()){this.game.noticePendingHubSelection();return false;}
    this._hub=null; this.game.setModalOwner('hub',false); this.clearPanelInput(); this.syncPanelInput(); this.changed();
  }
  backHubPanel() { const back=this._hub?.cfg.onBack; if(this.closeHubPanel()===false)return; back?.(); }
  hubNav(d) { const h=this._hub,n=h?.cfg.rows?.length; if(n)h.idx=(h.idx+d+n)%n; this.changed(); }
  hubConfirm() { const h=this._hub,r=h?.cfg.rows?.[h.idx]; if(!r||r.disabled)return false; const p=this.game.actorCount===2?null:this.game.pendingHubSelection?.(); if(p&&r!==p.row){this.game.noticePendingHubSelection();return false;} const result=h.cfg.onPick?.(r,h.idx); return result&&typeof result.then==='function'?result:true; }
  handleHubKeys(input,dt=1/60) {
    if(!this._hub||this.game.topModal()!=='hub'){this.clearPanelInput();return;}
    if(this._hub.cfg.settings)return;
    const up=input.down('w')||input.down('ArrowUp'),down=input.down('s')||input.down('ArrowDown'),dir=Number(down)-Number(up);
    if(!dir){this.clearPanelInput();}
    else if(dir!==this._hubNavDir){this.clearPanelInput();this._hubNavDir=dir;this.hubNav(dir);}
    else {this._hubNavHeld+=Math.max(0,dt);while(this._hubNavHeld+1e-8>=this._hubNavNext){this.hubNav(dir);this._hubNavNext+=.09;}}
    if(input.hit('e')||input.hit('Enter'))this.hubConfirm();
  }
  pending() {
    const type=this.game.topModal(),c=type==='choice'?this._choice:type==='hub'?this._hub:null; if(!c)return null;
    const {onPick,onToggle,onConfirm,onBack,...cfg}=c.cfg;
    return JSON.parse(JSON.stringify({...cfg,type,index:c.idx,panelId:c.id,revision:c.revision}));
  }
  changed() { const p=this.game.topModal()==='choice'?this._choice:this._hub;if(p)p.revision++; this.emit('panel',this.pending()); }
  toggleBuild(on) { this.buildOpen=!!on; this.game.setModalOwner('build',this.buildOpen); this.clearPanelInput(); this.syncPanelInput(); this.emit('build',{open:this.buildOpen}); }
  handleEquipmentKeys(input) {
    // Browser equipment navigation targets focused DOM buttons. Headless
    // callers use Game's shared install/detach/drop transaction methods.
    if (Object.keys(input.pressed).length) throw Error('Headless equipment commands require explicit Game equipment transactions');
  }
  renderBuild() { this.emit('build-refresh',{}); }
  update() {}
  resetRun() { this.stats=null; this.verdict=null; this.emit('reset-run',{}); }
  setHubMode(on) { this.hubMode=!!on; this.emit('hub-mode',{on:!!on}); }
  setWorldLabels(labels) { this.emit('world-labels',labels); }
  showScreen(id) { this.screen=id; this.emit('screen',{id}); }
  hideScreens() { this.screen=null; this.emit('screen',{id:null}); this.syncPanelInput(); }
  hidePauseScreen() { this.emit('hide-pause',{}); }
  hideReticle() {}
  setDeadeye(on) { this.deadeye=!!on; }
  toast(title,sub,color,kind) { this.emit('toast',{title,sub,color,kind}); }
  tip(text) { this.emit('tip',{text}); }
  centerMessage(title,sub,duration) { this.emit('center-message',{title,sub,duration}); }
  popText(x,y,z,text,color,big) { this.emit('pop-text',{x,y,z,text,color,big}); }
  flashBuild() { this.emit('build-refresh',{}); }
  setVictoryVerdict(verdict) { this.verdict=structuredClone(verdict); this.emit('victory-verdict',verdict); }
  fillStats(run,id) { this.stats={run:structuredClone(run),id}; this.emit('stats',{run,id}); }
  applyDisplayPreferences() {}
  refreshControlLabels() {}
  preferencesPanel() { throw Error('Browser preferences panel is unavailable in headless runtime'); }
}
