import { DOCTRINE_MAP_V3 } from './doctrines.js';
export function doctrineChoiceData(p){const q=p.c2.doctrinePending;return q?{kind:'doctrine',multi:2,options:q.candidates.map(id=>({id})),picked:q.picked.slice()}:null;}
export function validateDoctrines(p,choice){const s=p.c2,q=s.doctrinePending;
 if(!Array.isArray(p.doctrines)||new Set(p.doctrines).size!==p.doctrines.length||p.doctrines.length!==s.doctrineFloors.length*2||p.doctrines.some(id=>!DOCTRINE_MAP_V3[id]))throw Error('教条领取回执不一致');
 if(q&&(q.candidates.some(id=>!DOCTRINE_MAP_V3[id]||p.doctrines.includes(id))))throw Error('教条候选未知或已拥有');
 if(choice!==undefined){if(!q&&choice?.kind==='doctrine'||q&&(!choice||choice.kind!=='doctrine'||choice.multi!==2||JSON.stringify(choice.options?.map(o=>o.id))!==JSON.stringify(q.candidates)||JSON.stringify(choice.picked)!==JSON.stringify(q.picked)))throw Error('教条界面与待选状态不一致');}return true;}
