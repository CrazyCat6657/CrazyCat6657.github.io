// Version 1 remains the compact historical campaign. Expanded maps are optional.
const range=(a,b)=>Object.freeze([a,b]);
export const STAGE_PROFILES=Object.freeze({
  compact:Object.freeze({id:'compact',label:'紧凑',rooms:range(3,5),contentVersion:1}),
  medium:Object.freeze({id:'medium',label:'中型',rooms:range(8,10),contentVersion:2,spine:range(5,7),branchCount:range(1,2),branchLen:range(1,2),freeChests:range(1,1)}),
  large:Object.freeze({id:'large',label:'大型',rooms:range(15,15),contentVersion:2,spine:range(8,10),branchCount:range(2,3),branchLen:range(1,3),freeChests:range(1,2)}),
  portable:Object.freeze({id:'portable',label:'小房间远征',rooms:range(15,15),contentVersion:3,spine:range(8,10),branchCount:range(2,3),branchLen:range(1,3),freeChests:range(1,1)}),
  standard:Object.freeze({id:'standard',label:'标准远征',rooms:range(15,15),contentVersion:3,spine:range(8,10),branchCount:range(2,3),branchLen:range(1,3),freeChests:range(1,1)}),
});
export function getStageProfile(id='compact'){
  if(!Object.hasOwn(STAGE_PROFILES,id))throw Error('未知章节规模');
  return STAGE_PROFILES[id];
}
export function stageRoomRange(context){
  const p=getStageProfile(context?.contentVersion>=2?context.profile:'compact');
  if(context?.contentVersion===3){const n=p.rooms[0]+(context.hiddenSegments?.includes(context.segment)?1:0);return [n,n];}
  return p.rooms;
}
export function isShopSegment(chapter,segment,contentVersion=2){return chapter>=1&&chapter<=3&&(contentVersion===3?segment>=1&&segment<=5&&(segment<5||chapter===3):segment===2||segment===4);}
