// A family's chance depends on its rarity mix, not the number of names it contains.
// One random draw keeps historical content-generation draw schedules intact.
export function pickWeaponByFamily(rng,pool,minBoost=0) {
  if(!pool.length)throw Error('Empty weapon pool');
  const groups=new Map();
  for(const w of pool){const key=w.assetFamily||w.cls;let g=groups.get(key);if(!g){g={weapons:[],weights:[],sum:0};groups.set(key,g);}const n=Math.max(.15,5.2-w.tier*1.1)+minBoost*(w.tier>=3?1.8:.2);g.weapons.push(w);g.weights.push(n);g.sum+=n;}
  const list=[...groups.values()];for(const g of list)g.weight=g.sum/g.weapons.length;
  let r=rng.next()*list.reduce((sum,g)=>sum+g.weight,0);
  for(const [index,g] of list.entries()){
    if(r<g.weight||index===list.length-1){let member=Math.max(0,Math.min(.999999999,r/g.weight))*g.sum;for(let j=0;j<g.weapons.length;j++){member-=g.weights[j];if(member<0)return g.weapons[j];}return g.weapons.at(-1);}
    r-=g.weight;
  }
}
