import {configureGamePlatform, restoreCandidatePlatform, withPresentationPlatform, MemoryStorage} from './game_platform.js';
import {HeadlessHUD} from './headless_hud.js';

let claimed=false;
let runtimeTypes;
export async function createHeadlessGame({seed=3131,heroId='warden',profile='standard',scope='full3',difficulty='standard',sessionId=globalThis.crypto.randomUUID(),scheduler=null,prepare=null,initialize=null}={}) {
  if(typeof process==='undefined'||!process.versions?.node)throw Error('Headless runtime requires Node');
  if(claimed || typeof globalThis.document!=='undefined' || typeof globalThis.window!=='undefined' || typeof globalThis.localStorage!=='undefined')throw Error('Use a fresh Node Worker per headless session');
  claimed=true;
  const storage=new MemoryStorage(sessionId), events=[];
  let disposed=false;
  const emit=(type,data)=>{if(!disposed)events.push({type,data});};
  const entityPhase=scheduler?(id,seed)=>{let h=seed>>>0;for(const ch of id)h=Math.imul(h^ch.charCodeAt(0),16777619)>>>0;return h/0x100000000*10;}:null;
  const platform=configureGamePlatform({kind:'headless',storage,emit,scheduler,entityPhase,createHUD:g=>new HeadlessHUD(g,emit)});
  Object.defineProperty(globalThis,'localStorage',{value:storage,configurable:true});
  // Dynamic import is essential: Meta, SaveStore, preferences and controls read
  // storage during module evaluation. Nothing above imports those modules.
  const [{Game},{meta},{HeadlessInput},{HERO_MAP},{DIFFICULTY_IDS},{getStageProfile}]=await Promise.all([
    import('../game/game.js'),import('../game/meta.js'),import('./headless_input.js'),import('../game/heroes.js'),import('../core/constants.js'),import('../game/stage_profiles.js')
  ]);
  runtimeTypes={Game,HeadlessInput};
  if(!Object.hasOwn(HERO_MAP,heroId)||!DIFFICULTY_IDS.includes(difficulty))throw TypeError('Unknown hero or difficulty');
  if(!['full3','chapter1','classic'].includes(scope)||!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)throw TypeError('Invalid stage scope or seed');
  getStageProfile(profile);
  // Runtime checkpoint validation can run after private singleton setup but
  // before any Game/world is constructed. Existing 3A callers omit this hook.
  if (prepare) await prepare({meta});
  meta.data.sel.hero=heroId; meta.data.difficulty=difficulty;
  if(!meta.data.heroes.includes(heroId))meta.data.heroes.push(heroId);
  const game=new Game(null,{platform});
  game.input=new HeadlessInput();
  try { if(initialize)await initialize(game);else game.startNewRun(seed,scope==='classic'?{}:{stageScope:scope,stageProfile:profile}); }
  catch(error) { game.clearWorld(); game.input.dispose(); game.disposeActor(); game.state='disposed'; disposed=true; throw error; }
  return {game,platform,storage,events,
    drainEvents(){return events.splice(0);},
    dispose(){if(disposed)return;game.clearWorld();if(game.player?.rig)game.scene.remove(game.player.rig.group);game.input.dispose();game.disposeActor();game.state='disposed';disposed=true;events.length=0;}
  };
}

// Synchronous, unpublished candidate for the native restore transaction. This
// is not a second session factory or another independently running match.
export function createHeadlessRestoreCandidate(parent,scheduler) {
  if(!runtimeTypes || parent?.platform?.kind!=='headless')throw Error('Restore requires an initialized headless realm');
  const storage=new MemoryStorage(parent.storage.namespace),events=[];
  for(let i=0;i<parent.storage.length;i++){const key=parent.storage.key(i);storage.setItem(key,parent.storage.getItem(key));}
  let disposed=false;
  const emit=(type,data)=>{if(!disposed)events.push({type,data});};
  const platform=restoreCandidatePlatform(parent.platform,{storage,emit,scheduler,createHUD:g=>new HeadlessHUD(g,emit)});
  Object.defineProperty(globalThis,'localStorage',{value:storage,configurable:true});
  const game=withPresentationPlatform(platform,()=>new runtimeTypes.Game(null,{platform}));
  game.input=new runtimeTypes.HeadlessInput();
  return {game,platform,storage,events,
    drainEvents(){return events.splice(0);},
    dispose(){if(disposed)return;withPresentationPlatform(platform,()=>{game.clearWorld();if(game.player?.rig)game.scene.remove(game.player.rig.group);game.input.dispose();game.disposeActor();game.state='disposed';disposed=true;events.length=0;});}
  };
}
