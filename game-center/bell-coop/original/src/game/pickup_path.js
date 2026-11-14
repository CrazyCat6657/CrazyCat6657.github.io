// Movement blockers are checked in world space, including resident-room doors.
function crossesBox(ax, az, bx, bz, c, ox, oz, pad) {
  let low = 0, high = 1;
  for (const [a,b,min,max] of [[ax,bx,c.minx+ox-pad,c.maxx+ox+pad],[az,bz,c.minz+oz-pad,c.maxz+oz+pad]]) {
    const d = b-a;
    if (Math.abs(d) < 1e-10) { if (a < min || a > max) return false; continue; }
    let t0=(min-a)/d, t1=(max-a)/d;
    if(t0>t1)[t0,t1]=[t1,t0];
    low=Math.max(low,t0);high=Math.min(high,t1);
    if(low>high)return false;
  }
  return true;
}
export function pickupPathClear(game, ax, az, bx, bz) {
  const scenes = new Set([game.roomScene, ...(game._residentRooms?.values?.() || []), ...Object.values(game.connectors || {})]);
  for (const scene of scenes) for (const c of scene?.colliders || []) {
    if (c.move && c.top >= .5 && crossesBox(ax,az,bx,bz,c,scene.room?.type==='connector'?0:scene.ox||0,scene.room?.type==='connector'?0:scene.oz||0,.12)) return false;
  }
  return true;
}
export function pickupReady(p) { return !p.collected && !p.shopSlot && !(p.shopIndex >= 0) && p.armT <= 0 && p.vy === 0 && !p.noReturn; }
