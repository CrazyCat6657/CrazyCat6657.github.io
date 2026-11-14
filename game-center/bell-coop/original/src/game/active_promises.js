// Active-item boundaries shared by Game and both weapon paths.
export function cancelOverdriveReload(p,w,runtime=p?.game?.weaponAssets) {
  if(!(p?.overdrive>0))return false;
  const state=runtime?.states?.[w?.assetInstanceId];
  if(state){state.reload=null;state.cooldown=Math.max(0,state.cooldown||0);}
  if(p.weapon===w){p.reloading=false;p.reloadT=0;p.fireT=Math.max(0,p.fireT||0);}
  return true;
}

export function activateOverdrive(p,duration=6) {
  p.overdrive=duration;
  for(const w of p.weapons||[p.weapon])if(w)cancelOverdriveReload(p,w);
}

// This is displacement only: damage remains the original local explosion.
export function wardPulseKnockback(game,p) {
  const sc=game.roomScene,half=sc?.half;
  let count=0;
  for(const e of new Set([...(game.enemies||[]),...(game.hitboxes||[])])) {
    if(!e?.alive||e.team!==1||e.isBoss||e.knockImmune)continue;
    if(Number.isFinite(half)&&(Math.abs(e.x-(sc.ox||0))>half||Math.abs(e.z-(sc.oz||0))>half))continue;
    const dx=e.x-p.x,dz=e.z-p.z,n=Math.hypot(dx,dz);
    const ux=n>1e-8?dx/n:(p.aim?.x||0),uz=n>1e-8?dz/n:(p.aim?.z||1);
    e.vx=(e.vx||0)+ux*6.6;e.vz=(e.vz||0)+uz*6.6;count++;
  }
  return count;
}
