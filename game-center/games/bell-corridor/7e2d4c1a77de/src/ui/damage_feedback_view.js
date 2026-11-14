const identity=v=>typeof v==='string'&&v.length>0&&v.length<=256;
function valid(p) {
  return p&&identity(p.id)&&identity(p.targetId)&&[p.x,p.y,p.z,p.amount,p.startedAtMs,p.expiresAtMs].every(Number.isFinite)&&
    p.amount>0&&p.startedAtMs>=0&&Math.abs(p.expiresAtMs-p.startedAtMs-750)<1e-6&&
    Number.isSafeInteger(p.hitCount)&&p.hitCount>0&&['none','some','all'].includes(p.critMode);
}

/** Presentation only: packet identity controls upserts; simulation time controls life. */
export class DamageFeedbackView {
  constructor({container,project,maxVisible=42}={}) {
    if(!container?.ownerDocument||typeof project!=='function'||!Number.isInteger(maxVisible)||maxVisible<1||maxVisible>128)
      throw new TypeError('Invalid damage view configuration');
    this.container=container;this.project=project;this.maxVisible=maxVisible;this.nodes=new Map();this.timeMs=0;
  }
  remove(id) {this.nodes.get(id)?.el.remove();this.nodes.delete(id);}
  expire(){for(const [id,n]of this.nodes)if(n.packet.expiresAtMs<=this.timeMs)this.remove(id);}
  apply(packets) {
    if(!Array.isArray(packets))return;
    this.expire();
    for(const p of packets) {
      if(!valid(p)||p.expiresAtMs<=this.timeMs)continue;
      let n=this.nodes.get(p.id);
      if(n&&(n.packet.startedAtMs!==p.startedAtMs||n.packet.expiresAtMs!==p.expiresAtMs||n.packet.targetId!==p.targetId||
          p.hitCount<n.packet.hitCount||p.amount<n.packet.amount))continue;
      if(!n) {
        while(this.nodes.size>=this.maxVisible)this.remove(this.nodes.keys().next().value);
        const lanes=new Set([...this.nodes.values()].filter(v=>v.packet.targetId===p.targetId).map(v=>v.lane));
        let lane=0;while(lanes.has(lane))lane++;
        const el=this.container.ownerDocument.createElement('div'),value=this.container.ownerDocument.createElement('span'),mark=this.container.ownerDocument.createElement('small');
        value.className='damage-value';mark.className='damage-crit';el.append(value,mark);this.container.appendChild(el);
        n={el,value,mark,lane,packet:null};this.nodes.set(p.id,n);
      }
      n.packet={...p};const text=p.amount<.5?'<1':String(Math.round(p.amount));
      n.value.textContent=text;n.mark.textContent=p.critMode==='none'?'':p.critMode==='some'?' ·':' ✦';
      n.el.className=`popup damage-popup crit-${p.critMode}`;
      Object.assign(n.el.dataset,{damageId:p.id,targetId:p.targetId,crit:p.critMode,hitCount:String(p.hitCount),amount:String(p.amount)});
      n.el.setAttribute('aria-label',text+(p.critMode==='some'?'，部分暴击':p.critMode==='all'?'，全部暴击':''));
      n.el.title=`${p.hitCount} 次命中`;
    }
    this.update(this.timeMs);
  }
  update(timeMs) {
    if(Number.isFinite(timeMs)&&timeMs>=this.timeMs)this.timeMs=timeMs;
    this.expire();
    for(const n of this.nodes.values()) {
      const p=n.packet,point=this.project({x:p.x,y:p.y,z:p.z});
      if(!point?.visible||!Number.isFinite(point.x)||!Number.isFinite(point.y)){n.el.style.display='none';continue;}
      const age=Math.max(0,this.timeMs-p.startedAtMs)/750,offset=[0,-24,24][n.lane%3];
      n.el.style.display='block';n.el.style.left=`${point.x}px`;n.el.style.top=`${point.y}px`;
      n.el.style.opacity=String(Math.min(1,(1-age)*2));
      n.el.style.transform=`translate(-50%,-50%) translate(${offset}px,${-age*36-Math.floor(n.lane/3)*14}px) scale(${1+age*.15})`;
    }
  }
  clear(){for(const id of [...this.nodes.keys()])this.remove(id);}
}
