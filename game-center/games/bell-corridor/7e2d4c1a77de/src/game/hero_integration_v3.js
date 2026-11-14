import { newHeroStateV3 } from './hero_state_v3.js';

export const newHeroIntegration = () => ({ preview: null, sequence: 0, forgeTargets: [], rangerTargets: [], rangerT: 0 });
export function resetHeroTransient(p) {
  p.mana=120;
  // Called only by an identity change or an explicit training configuration.
  if (p.c2?.escrowHp > 0 && p.alive && p.hp > 0) p.hp = Math.min(p.maxHp, p.hp + p.c2.escrowHp);
  p.c2 = newHeroStateV3(); p.c2Integration = newHeroIntegration();
  for (const k of ['heroSkillCd','bellCharges','bellWindow','heat','resonance','phrase','momentum','tuningT','overloadT','overclockT','overheatT','deadeyeT','spellEchoT','_still']) p[k] = 0;
  p._aimReady = false;p.heatOver=undefined;delete p.veteranTactics;p.doctrines=[];
}
export function validateHeroIntegration(p) {
  const s = p.c2Integration;
  if (s === undefined) return; // Pre-integration v3 snapshots remain readable.
  const plain = v => v && typeof v === 'object' && !Array.isArray(v) && Object.getPrototypeOf(v) === Object.prototype;
  const ids = (a,max) => Array.isArray(a) && a.length <= max && new Set(a).size === a.length && a.every(x=>typeof x==='string'&&x.length>0&&x.length<=128);
  if (!plain(s) || Object.keys(s).length !== 5 || !['preview','sequence','forgeTargets','rangerTargets','rangerT'].every(k=>Object.hasOwn(s,k)) || !ids(s.forgeTargets,5) || !ids(s.rangerTargets,3) ||
      !Number.isSafeInteger(s.sequence) || s.sequence < 0 || !Number.isFinite(s.rangerT) || s.rangerT < 0 || s.rangerT > 8) throw new Error('职业整合追踪无效');
  const q=s.preview;
  if (q !== null && (!plain(q) || Object.keys(q).length!==5 || !ids([q.id,q.roomUid],2) ||
      !Number.isFinite(q.x)||!Number.isFinite(q.z)||!Number.isFinite(q.remaining)||q.remaining<=0||q.remaining>3)) throw new Error('拆解确认状态无效');
}
export function integrationState(p) { return p.c2Integration ||= newHeroIntegration(); }
export function scavengeTick(p,dt,g=p.game) {
  const s=integrationState(p),q=s.preview,w=g.nearestGroundWeapon(p);
  if (!q) return;
  q.remaining=Math.max(0,q.remaining-dt);
  if (!q.remaining || g.mode==='run'&&g.aliveEnemyCount()>0 || !w || w.c2ScrapId!==q.id || w.x!==q.x || w.z!==q.z || String(g.room?.uid||g.mode)!==q.roomUid) s.preview=null;
}
export function scavengeSkill(p,g) {
  const s=integrationState(p);
  if (g.mode==='run'&&g.aliveEnemyCount()>0) {s.preview=null;return {ready:false,reason:'交战中不能拆解或拼装，先清空房间'};}
  scavengeTick(p,0,g);
  const w=g.nearestGroundWeapon(p);
  if (w) {
    if (s.preview && s.preview.id===w.c2ScrapId) {s.preview=null;return g.dismantleNearest(p)?3:{ready:false,reason:'武器已移动或不可拆解'};}
    if (!w.c2ScrapId) {s.sequence=Math.max(s.sequence,...g.pickups.list.map(q=>/^scrap:\d+$/.test(q.c2ScrapId||'')?Number(q.c2ScrapId.slice(6)):0));w.c2ScrapId=`scrap:${++s.sequence}`;}
    s.preview={id:w.c2ScrapId,x:w.x,z:w.z,roomUid:String(g.room?.uid||g.mode),remaining:3};
    g.hud?.toast?.('确认拆枪',`${g.scavengeWeaponLabel(w)} · 再按 C 拆解得 2–3 废料；E 拾取`,'#c07af0','build');
    return {cooldown:0};
  }
  s.preview=null;
  if (p.scrap<3) return {ready:false,reason:'附近没有可拆武器；拼装需要 3 废料'};
  return g.scavengeAssemble(p)?6:{ready:false,reason:'拼装未完成，废料未消耗'};
}
// Actual HP loss is the only award source. Bounded stable IDs prevent tick,
// repeated-hit, and resurrected-entity farming in a single skill window.
export function integrationDamage(p,d,g) {
  if (g.mode!=='run'||g.practice||g.bossPractice||g._restoring||!d.progressionEligible||d.owner!=='player'||d.amount<=0||!d.targetId) return;
  const s=integrationState(p);
  if(p.hero.id==='forgewright'&&p.c2.forgeT>0&&!s.forgeTargets.includes(d.targetId)&&s.forgeTargets.length<5){
    s.forgeTargets.push(d.targetId);g._ventHits=Math.max(g._ventHits||0,s.forgeTargets.length);g.checkAchievements();
  }
  if(p.hero.id==='ranger'&&s.rangerT>0&&d.lethal&&!s.rangerTargets.includes(d.targetId)&&s.rangerTargets.length<3){
    s.rangerTargets.push(d.targetId);g._deadeyeKills=Math.max(g._deadeyeKills||0,s.rangerTargets.length);g.checkAchievements();
  }
}
