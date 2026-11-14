import {RNG} from '../core/rng.js';
import {Dungeon,DIRS} from './dungeon.js';
import {generateChapterLayout} from './chapter_layout.js';
import {planEncounter} from './encounters.js';
import {getStageDefinition,validateStageContext} from '../game/stage_flow.js';
import {stageRoomRange} from '../game/stage_profiles.js';
import {newChest} from '../game/chest_rules.js';
import {planShopVariant,NEW_SHOP_VARIANT} from '../game/economy.js';
import {POOL_BY_FLOOR,WEAPONS,ITEMS,ACTIVES,SPECIAL_EVENTS} from '../game/data.js';
import {planChapterEncounter,chapterEncounterVersion} from '../game/chapter_encounters.js';

const FIELD_EVENTS=Object.freeze([
  Object.freeze({id:'field_supply',cn:'前线补给',desc:'领取弹药和一把钥匙。',color:'#e8c84a'}),
  Object.freeze({id:'field_infirmary',cn:'野战医护',desc:'恢复生命并领取护甲。',color:'#7bcf91'}),
  Object.freeze({id:'field_arsenal',cn:'军需库',desc:'领取两件武器配件。',color:'#68b9ed'}),
]);

export function generateExpandedStageDungeon(context){
  validateStageContext(context);
  if(context.contentVersion!==2&&context.contentVersion!==3)throw Error('扩大地图需要内容版本2或3');
  const modern=context.contentVersion===3;
  const layout=generateChapterLayout({seed:context.stageSeed,chapter:context.chapter,segment:context.segment,profile:context.profile,hidden:modern&&context.hiddenSegments.includes(context.segment)});
  const d=new Dungeon(context.stageSeed,context.themeId);
  Object.assign(d,{flowVersion:2,contentVersion:context.contentVersion,profile:context.profile,chapter:context.chapter,segment:context.segment,stageKey:context.stageKey,themeId:context.themeId,threatProgress:context.threatProgress,stageSeed:context.stageSeed});
  if(modern&&chapterEncounterVersion(context.encounterVersion)===2)d.encounterVersion=2;
  const def=getStageDefinition(context.chapter,context.segment,context.profile);
  for(const node of layout.rooms){
    const seed=(context.stageSeed^Math.imul(node.x+7,0x9e3779b9)^Math.imul(node.y+13,0x85ebca6b))>>>0;
    const rng=new RNG(seed),type=node.type;
    d.rooms.set(node.id,{
      id:node.id,uid:`v2:${context.stageKey}:${node.id}`,gx:node.x,gy:node.y,type,seed,radius:modern?expeditionRadius(type,context.profile,rng):rng.int(10,12),
      ...(modern?{topologyRole:node.role}:{}),
      doors:{n:false,s:false,e:false,w:false},secretWallDirs:[],dist:0,
      isStart:type==='start',isExit:type==='exit',isBoss:type==='boss',
      cleared:type==='start',visited:type==='start',discovered:false,entered:false,
      looted:false,locked:false,vaultEntered:false,wavesSpawned:false,
    });
  }
  for(const [a,b]of layout.edges){const x=d.rooms.get(a),y=d.rooms.get(b),dir=DIRS.find(k=>x.gx+k.dx===y.gx&&x.gy+k.dy===y.gy);x.doors[dir.k]=true;y.doors[dir.opp]=true;}
  for(const [a,b]of layout.secretEdges||[]){
    const x=d.rooms.get(a),y=d.rooms.get(b),dir=DIRS.find(k=>x.gx+k.dx===y.gx&&x.gy+k.dy===y.gy);
    x.secretWallDirs.push({dir:dir.k,to:y.id});y.secretWallDirs.push({dir:dir.opp,from:x.id,isEntry:true});
  }
  const start=d.list.find(r=>r.isStart);d.startId=start.id;
  const reached=distances(d,start);for(const r of d.list)r.dist=reached.get(r.id);
  if(modern)for(const r of d.list.filter(r=>r.type==='hidden'))r.dist=reached.get(r.secretWallDirs[0].from)+1;
  d.gridSize=1+Math.max(...d.list.flatMap(r=>[r.gx,r.gy]));
  d.maxDist=Math.max(...reached.values());d.battleRatio=d.list.filter(r=>r.type==='battle').length/d.list.length;
  const encounters=modern&&d.encounterVersion===2?planExpeditionRooms(d,context):null;
  for(const r of d.list){r.content=modern?expeditionContentFor(r,def,encounters?.get(r.id)):contentFor(r,def);if(r.content.event)r.event=r.content.event;}
  validateExpandedDungeon(d,context);
  return d;
}

function expeditionRadius(type,profile,rng){
  if(type==='boss')return 19;
  if(type==='vault')return profile==='portable'?15:16;
  if(profile==='standard')return 13;
  const roll=rng.next();return roll<.2?11:roll<.5?12:13;
}

function expeditionKind(room){
  const roll=new RNG(room.seed^0x4e455743).next();
  return room.type==='vault'?'vault':roll<.08?'explosive':roll<.16?'horde':'battle';
}

// Allocate exact quotas independently to actual ordinary, explosive and vault
// encounters. Room type alone would incorrectly count dense/explosive themes.
function planExpeditionRooms(d,context){
  const plans=new Map(d.list.filter(r=>r.type==='battle'||r.type==='vault').map(r=>[r.id,{kind:expeditionKind(r),multiWave:false,encounterVersion:2,segment:context.segment}]));
  const ratio=context.chapter===1?0:context.chapter===2?.5:.8;
  for(const kind of ['battle','explosive','vault']){
    const rooms=d.list.filter(r=>plans.get(r.id)?.kind===kind);
    const rank=r=>new RNG((r.seed^0x4d554c54)>>>0).next();
    rooms.sort((a,b)=>rank(a)-rank(b)||(a.id<b.id?-1:a.id>b.id?1:0));
    for(const r of rooms.slice(0,Math.round(rooms.length*ratio)))plans.get(r.id).multiWave=true;
  }
  return plans;
}

function expeditionContentFor(room,def,encounter){
  const rng=new RNG(room.seed^0x4e455743),floor=def.themeId;
  const c={enemies:[],chests:[],shopStock:[],event:null,hazards:0,lockedDoors:false,props:[],pickups:[],elite:false,archetype:null,waves:[]};
  if(room.type==='battle'||room.type==='vault'){
    const themeRoll=rng.next();
    const kind=room.type==='vault'?'vault':themeRoll<.08?'explosive':themeRoll<.16?'horde':'battle';
    const plan=planChapterEncounter({chapter:def.chapter,seed:room.seed,kind,pool:POOL_BY_FLOOR[floor],...encounter});
    Object.assign(c,{enemies:plan.enemies,waves:plan.waves,elite:plan.elite,eliteIndices:plan.eliteIndices,encounterKind:plan.encounterKind});
    c.hazards=room.type==='vault'?2:rng.int(0,floor===1?0:1);
    if(room.type==='vault')c.vaultChest=newChest(rng,floor,{unlocked:true,minTier:3});
    else if(rng.chance(.12))c.chests.push(newChest(rng,floor));
  }else if(room.type==='treasure'||room.type==='hidden'){
    c.chests.push(newChest(rng,floor,{unlocked:true,minTier:room.type==='hidden'?3:2}));
    c.pickups=room.type==='hidden'?['key','heal']:['heal','ammo'];
  }else if(room.type==='shop'){
    c.shopStock=planShopVariant(Array.from({length:4},()=>stockEntry(rng,floor)),room.seed,floor,NEW_SHOP_VARIANT);c.shopVariant=NEW_SHOP_VARIANT;
  }else if(room.type==='special'){
    c.event={...rng.pick(FIELD_EVENTS)};
  }else if(room.type==='boss'&&def.chapter<3){
    c.chests=[3,4].map(rarityTier=>({quality:rarityTier===4?'gold':'normal',ruleVersion:1,rarityTier,locked:false,keyCost:0,bossReward:true}));
  }else if(room.type==='start')c.props=['brazier','brazier'];
  return c;
}

function contentFor(room,def){
  const rng=new RNG(room.seed^0x4e455743),floor=def.themeId;
  const c={enemies:[],chests:[],shopStock:[],event:null,hazards:0,lockedDoors:false,props:[],pickups:[],elite:false,archetype:null,waves:[]};
  if(room.type==='battle'||room.type==='vault'){
    const budget=(room.type==='vault'?4.8+def.threatProgress*3:2.8+def.threatProgress*3.2)*rng.float(.9,1.1);
    const deg=Object.values(room.doors).filter(Boolean).length;
    const plan=planEncounter({floor,seed:room.seed,budget,pool:POOL_BY_FLOOR[floor],layout:{doors:deg,radius:room.radius,open:deg>=3}});
    Object.assign(c,{enemies:plan.enemies,waves:plan.waves,elite:room.type==='vault'||plan.elite,archetype:plan.archetype,encounterBudget:budget});
    c.hazards=room.type==='vault'?2:rng.int(0,floor===1?0:1);
    if(room.type==='vault')c.vaultChest=newChest(rng,floor,{unlocked:true,minTier:3});
    else if(rng.chance(.12))c.chests.push(newChest(rng,floor));
  }else if(room.type==='treasure'){
    c.chests.push(newChest(rng,floor,{unlocked:true,minTier:2}));c.pickups.push('heal');
  }else if(room.type==='shop'){
    c.shopStock=planShopVariant(Array.from({length:4},()=>stockEntry(rng,floor)),room.seed,floor,NEW_SHOP_VARIANT);c.shopVariant=NEW_SHOP_VARIANT;
  }else if(room.type==='special'){
    c.event=rng.pick(SPECIAL_EVENTS);if(rng.chance(.35))c.chests.push(newChest(rng,floor));
  }else if(room.type==='start')c.props=['brazier','brazier'];
  return c;
}

function stockEntry(rng,floor){
  const roll=rng.next();
  if(roll<.4){const w=rng.pick(WEAPONS.filter(w=>w.tier<=floor+1));return{kind:'weapon',id:w.id,price:18+w.tier*16};}
  if(roll<.7){const item=rng.pick(ITEMS);return{kind:'item',id:item.id,price:22+(item.rarity||1)*4};}
  if(roll<.85)return{kind:'active',id:rng.pick(ACTIVES).id,price:24};
  const kind=rng.pick(['heal','key','ammo','armor']);return{kind,id:kind,price:{heal:12,key:16,ammo:10,armor:26}[kind]};
}

function distances(d,start,{excludeBoss=false}={}){
  const found=new Map([[start.id,0]]),q=[start];
  for(let i=0;i<q.length;i++)for(const dir of DIRS){if(!q[i].doors[dir.k])continue;const n=d.get(q[i].gx+dir.dx,q[i].gy+dir.dy);if(!n||found.has(n.id)||excludeBoss&&n.type==='boss')continue;found.set(n.id,found.get(q[i].id)+1);q.push(n);}
  return found;
}

// Validate the saved map itself, without regenerating its rewards or shop stock.
export function validateExpandedDungeon(d,context){
  validateStageContext(context);
  const [min,max]=stageRoomRange(context),rooms=d.list;
  const modern=context.contentVersion===3;
  if(chapterEncounterVersion(d.encounterVersion)!==chapterEncounterVersion(context.encounterVersion))throw Error('地图与阶段章节编成版本不一致');
  if(![2,3].includes(context.contentVersion)||d.flowVersion!==2||d.contentVersion!==context.contentVersion||d.profile!==context.profile||d.stageKey!==context.stageKey||d.seed!==context.stageSeed||d.stageSeed!==context.stageSeed||d.themeId!==context.themeId||d.floor!==context.themeId||d.chapter!==context.chapter||d.segment!==context.segment)throw Error('扩大地图身份不一致');
  if(rooms.length<min||rooms.length>max||!Number.isInteger(d.gridSize)||d.gridSize<1||d.gridSize>11)throw Error('扩大地图规模无效');
  const starts=rooms.filter(r=>r.type==='start'),ends=rooms.filter(r=>r.type==='exit'||r.type==='boss');
  if(starts.length!==1||starts[0].id!==d.startId||ends.length!==1||ends[0].type!==(context.segment===5?'boss':'exit'))throw Error('扩大地图起点或终点无效');
  for(const r of rooms){
    if(!Number.isInteger(r.gx)||!Number.isInteger(r.gy)||r.gx<0||r.gy<0||r.gx>=d.gridSize||r.gy>=d.gridSize||r.id!==`${r.gx},${r.gy}`||r.uid!==`v2:${context.stageKey}:${r.id}`)throw Error('扩大地图坐标无效');
    if(!['start','exit','boss','battle','treasure','shop','special','vault',...(modern?['hidden']:[])].includes(r.type)||r.isStart!==(r.type==='start')||r.isExit!==(r.type==='exit')||r.isBoss!==(r.type==='boss'))throw Error('扩大地图房型无效');
    for(const dir of DIRS){const n=d.get(r.gx+dir.dx,r.gy+dir.dy);if(typeof r.doors?.[dir.k]!=='boolean'||r.doors[dir.k]&&(!n||!n.doors?.[dir.opp]))throw Error('扩大地图门连接无效');}
  }
  const hidden=modern?rooms.filter(r=>r.type==='hidden'):[];
  if(modern)validateExpeditionRooms(d,context,hidden);
  if(distances(d,starts[0]).size!==rooms.length-hidden.length||distances(d,starts[0],{excludeBoss:true}).size!==rooms.length-hidden.length-(context.segment===5?1:0))throw Error('扩大地图存在断开的房间');
  if(context.segment===5&&Object.values(ends[0].doors).filter(Boolean).length!==1)throw Error('首领房必须位于支路尽头');
  return true;
}

function validateExpeditionRooms(d,context,hidden){
  const expectedHidden=context.hiddenSegments.includes(context.segment)?1:0;
  if(hidden.length!==expectedHidden||new Set(d.list.map(r=>r.id)).size!==d.list.length)throw Error('远征隐藏房数量无效');
  let entries=0,targets=0;
  for(const r of d.list){
    const radii=r.type==='boss'?[19]:r.type==='vault'?[context.profile==='portable'?15:16]:context.profile==='portable'?[11,12,13]:[13];
    if(!radii.includes(r.radius))throw Error('远征房间尺度无效');
    if(!Array.isArray(r.secretWallDirs)||r.secretWallDirs.length>(r.type==='hidden'?1:4))throw Error('隐藏门列表无效');
    if(!r.content||!Array.isArray(r.content.enemies)||!Array.isArray(r.content.waves))throw Error('远征房间内容无效');
    if(['start','exit','boss','hidden','treasure','special','shop'].includes(r.type)&&(r.content.enemies.length||r.content.waves.length))throw Error('非战斗房不得配置敌人');
    if(r.type==='hidden'&&(r.secretWallDirs.length!==1||Object.values(r.doors).some(Boolean)))throw Error('隐藏房不得有普通门');
    const seenDirs=new Set();
    for(const wall of r.secretWallDirs){
      if(!wall||typeof wall!=='object'||Array.isArray(wall)||seenDirs.has(wall.dir))throw Error('隐藏门结构无效');
      seenDirs.add(wall.dir);
      const entry=r.type==='hidden';
      const keys=Object.keys(wall).sort().join(',');
      if(keys!==(entry?'dir,from,isEntry':'dir,to')||entry&&wall.isEntry!==true)throw Error('隐藏门字段无效');
      const targetId=entry?wall.from:wall.to,dir=DIRS.find(k=>k.k===wall.dir),target=d.rooms.get(targetId);
      if(typeof targetId!=='string'||!dir||!target||target.gx!==r.gx+dir.dx||target.gy!==r.gy+dir.dy||r.doors[dir.k]||target.doors?.[dir.opp])throw Error('隐藏门关联无效');
      if(entry?['hidden','boss','exit','vault'].includes(target.type):target.type!=='hidden')throw Error('隐藏门房型无效');
      const reciprocal=target.secretWallDirs?.filter(w=>w&&w.dir===dir.opp&&(entry?w.to===r.id:w.from===r.id&&w.isEntry===true));
      if(!reciprocal||reciprocal.length!==1)throw Error('隐藏门双向关联无效');
      if(entry)entries++;else targets++;
    }
  }
  if(entries!==expectedHidden||targets!==expectedHidden)throw Error('隐藏门数量无效');
  const hiddenIds=new Set(hidden.map(r=>r.id));
  if([...distances(d,d.rooms.get(d.startId)).keys()].some(id=>hiddenIds.has(id)))throw Error('隐藏房意外连通');
}
