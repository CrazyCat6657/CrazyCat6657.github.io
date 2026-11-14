// One serial space per real world. Detached planners fork this value and only
// publish it after their surrounding transaction succeeds.
export class WeaponSerialAllocator {
  constructor(snapshot = {version:1,serial:0}) { this.restore(snapshot); }
  capture() { return {version:1,serial:this.serial}; }
  restore(s) {
    if (!s || Object.getPrototypeOf(s)!==Object.prototype || Object.keys(s).sort().join()!=='serial,version' || s.version!==1 || !Number.isSafeInteger(s.serial) || s.serial<0) throw Error('Invalid weapon allocator snapshot');
    this.serial=s.serial;
  }
  reserve(value) {
    if (!Number.isSafeInteger(value) || value<0) throw Error('Invalid weapon serial');
    this.serial=Math.max(this.serial,value);
  }
  next(prefix) {
    if (!/^[a-z][a-z-]*$/.test(prefix) || this.serial===Number.MAX_SAFE_INTEGER) throw Error('Invalid or exhausted weapon serial');
    return `${prefix}:${++this.serial}`;
  }
  fork() { const draft=new WeaponSerialAllocator(this.capture()); draft.baseSerial=this.serial; return draft; }
  commit(draft) {
    if (!(draft instanceof WeaponSerialAllocator) || draft.baseSerial!==this.serial || draft.serial<this.serial) throw Error('Stale or regressive weapon allocator plan');
    this.restore(draft.capture());
  }
}

export function orderedActors(world) { return [...(world.actors?.values()||[])].filter(a=>a.active).sort((a,b)=>a.slot-b.slot); }
export function runtimes(world) { return world.actors?orderedActors(world).map(a=>a.weaponAssets).filter(Boolean):[world.weaponAssets].filter(Boolean); }
export function weaponMetrics(world) {
  const all=runtimes(world);
  return {entities:all.flatMap(r=>r.entities),states:Object.assign({},...all.map(r=>r.states)),nativeLines:(world.projectiles?.beams||[]).filter(b=>b.life>0).length};
}
// Only serial-shaped strings in plain state are visited; never traverse a live
// Player/Three object graph. Keys carry state IDs and paid root IDs too.
export function reserveWeaponReferences(allocator, value, seen=new Set()) {
  if(typeof value==='string') { if(value.startsWith('party-pickup:'))return;const m=/^[a-z][a-z-]*:(\d+)$/.exec(value); if(m)allocator.reserve(Number(m[1])); return; }
  if(!value||typeof value!=='object'||seen.has(value))return;
  seen.add(value);
  if(value instanceof Map){for(const [k,v]of value){reserveWeaponReferences(allocator,k,seen);reserveWeaponReferences(allocator,v,seen);}return;}
  if(!Array.isArray(value)&&Object.getPrototypeOf(value)!==Object.prototype)return;
  for(const [k,v]of Object.entries(value)){reserveWeaponReferences(allocator,k,seen);reserveWeaponReferences(allocator,v,seen);}
}
export function reserveWorldWeaponReferences(world) {
  const allocator=world.weaponSerialAllocator;
  if(!allocator)return; // Detached original single-player projections have no live allocator.
  for(const a of orderedActors(world)) {
    for(const w of a.player?.weapons||[]) {reserveWeaponReferences(allocator,w.assetInstanceId);reserveWeaponReferences(allocator,w.assetState);}
    if(a.weaponAssets){allocator.reserve(a.weaponAssets.serial);reserveWeaponReferences(allocator,a.weaponAssets.capture());}
  }
  reserveWeaponReferences(allocator,world.roomStates);
  for(const p of world.pickups?.list||[]) {reserveWeaponReferences(allocator,p.assetInstanceId);reserveWeaponReferences(allocator,p.assetState);}
  for(const b of world.projectiles?.pool||[])if(b.alive) {
    reserveWeaponReferences(allocator,b.sourceInstanceId);
    reserveWeaponReferences(allocator,b.rootShotId);
    reserveWeaponReferences(allocator,b.buildContext);
  }
}
export function refreshGroundSlow(world) {
  const zones=weaponMetrics(world).entities.filter(e=>e.mechanic==='frost'&&!e.ended&&e.ttl>0);
  for(const t of world.hitboxes||[])if(t.alive&&t.team===1)t.assetGroundSlow=!t.isBoss&&t.constructor?.name!=='Boss'&&zones.some(e=>Math.hypot(e.x-t.x,e.z-t.z)<=e.radius+(t.r||t.radius||.5));
}
