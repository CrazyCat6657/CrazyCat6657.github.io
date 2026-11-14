import { doctrineChoiceData, validateDoctrines } from './doctrine_state_v3.js';
import { DOCTRINES_V3, DOCTRINE_MAP_V3 } from './doctrines.js';
import { captureSessionDraft, validateSession } from './session.js';
import { saveStore } from './save.js';
import { meta } from './meta.js';
export const doctrineFloor = g => g.flowVersion===2 ? (g.stage?.segment===1?g.stage.chapter:null) : g.floor;
export function prepareDoctrineChoice(g){const p=g.player,floor=doctrineFloor(g);if(p.c2.doctrinePending||!floor||p.c2.doctrineFloors.includes(floor))return false;
 const candidates=g.rollChoice(DOCTRINES_V3.filter(d=>!p.doctrines.includes(d.id)),5).map(d=>d.id);p.c2.doctrinePending={floor,candidates,picked:[]};return true;}
export function applyDoctrineToggle(p,id){const q=p.c2.doctrinePending;if(!q||!q.candidates.includes(id))return false;const picked=q.picked.includes(id)?q.picked.filter(x=>x!==id):q.picked.length<2?[...q.picked,id]:null;if(!picked)return false;q.picked=picked;return true;}
export function applyDoctrineConfirm(p){const q=p.c2.doctrinePending;if(!q||q.picked.length!==2)return false;p.doctrines.push(...q.picked);p.c2.doctrineFloors.push(q.floor);p.c2.doctrinePending=null;return true;}
function persist(g,change){if(g.storageFrozen?.())return false;try{const draft=captureSessionDraft(g);change(draft);validateSession(draft);const r=saveStore.write(meta.data,draft);if(r.committed!==true){g.toast?.('教条未保存',r.error||'存储写入失败，原选择已保留','#ff6a3a','fail');return false;}
 g.player.doctrines=draft.player.doctrines;g.player.c2.doctrineFloors=draft.player.c2.doctrineFloors;g.player.c2.doctrinePending=draft.player.c2.doctrinePending;g.player.recompute();return true;
 }catch(e){g.toast?.('教条未保存',e.message,'#ff6a3a','fail');return false;}}
export function toggleDoctrine(g,id){const detached=structuredClone(g.player.c2.doctrinePending);if(!detached||!detached.candidates.includes(id)||!detached.picked.includes(id)&&detached.picked.length>=2)return false;
 return persist(g,d=>{if(!applyDoctrineToggle(d.player,id))throw Error('Invalid doctrine toggle');d.choice=doctrineChoiceData(d.player);});}
export function confirmDoctrines(g){const q=g.player.c2.doctrinePending;if(!q||q.picked.length!==2)return false;
 return persist(g,d=>{if(!applyDoctrineConfirm(d.player))throw Error('Invalid doctrine confirmation');d.choice=null;});}
export function openDoctrines(g,{restore=false}={}){const p=g.player;if(g.hero?.ruleVersion!==3||g.hero.id!=='veteran'||g.mode!=='run'||g.practice||g.bossPractice||g._restoring&&!restore)return false;
 if(!p.c2.doctrinePending&&!prepareDoctrineChoice(g))return false;
 const q=p.c2.doctrinePending;validateDoctrines(p);
 g.hud.choicePanel({kind:'doctrine',multi:2,title:'远征老兵 · 本层五选二',sub:'先选两条，可再次点击取消；Enter 或确认按钮确立',options:q.candidates.map(id=>({...DOCTRINE_MAP_V3[id],color:'#ffd24a'})),picked:q.picked.slice(),
 onToggle(o){if(!toggleDoctrine(g,o.id))return false;this.picked=p.c2.doctrinePending.picked.slice();return true;},
 onConfirm(){if(!confirmDoctrines(g))return false;g._pendingChoice=null;g.syncSaveUI?.();return true;}});
 if(!restore)g.saveProgress?.(false);return true;}
