import {damageSource,resolveDamageActor} from './damage_context.js';
import { TEAM } from '../core/constants.js';
// Accepted damage -> bounded, updatable popup values. No HP or DOM ownership.
const LIFETIME_MS = 750;
const identity = value => typeof value === 'string' && value.length > 0 && value.length <= 256;
const finitePosition = e => ['x','y','z'].every(k => Number.isFinite(e[k]));

export class DamageFeedbackCollector {
  constructor({windowMs = 100, maxGroups = 128} = {}) {
    if (!Number.isFinite(windowMs) || windowMs <= 0 || windowMs > LIFETIME_MS ||
        !Number.isSafeInteger(maxGroups) || maxGroups <= 0 || maxGroups > 4096)
      throw new TypeError('Invalid damage feedback limits');
    this.windowMs = windowMs;
    this.maxGroups = maxGroups;
    this.groups = new Map();
    this.current = new Map();
    this.sequence = 0;
    this.timeMs = 0;
  }

  _advance(timeMs) {
    if (!Number.isFinite(timeMs) || timeMs < this.timeMs) return false;
    this.timeMs = timeMs;
    for (const [id,g] of this.groups) {
      if (timeMs < g.expiresAtMs) continue;
      this.groups.delete(id);
      if (this.current.get(g.key) === g) this.current.delete(g.key);
    }
    return true;
  }

  record(event) {
    if (!event || !Number.isFinite(event.amount) || event.amount <= 0 ||
        !finitePosition(event) || !['runId','roomUid','targetId','sourceInstanceId'].every(k => identity(event[k])) ||
        !(event.rootShotId === null || identity(event.rootShotId)) ||
        !['attack','dot','unit'].includes(event.category) || !this._advance(event.timeMs)) return;
    const key = JSON.stringify([event.runId,event.roomUid,event.targetId,event.sourceInstanceId,event.rootShotId,event.category]);
    let g = this.current.get(key);
    if (!g || event.timeMs - g.startedAtMs >= this.windowMs) {
      while (this.groups.size >= this.maxGroups) {
        const oldest = this.groups.values().next().value;
        this.groups.delete(oldest.id);
        if (this.current.get(oldest.key) === oldest) this.current.delete(oldest.key);
      }
      g = {id:`damage:${++this.sequence}`,key,targetId:event.targetId,amount:0,
        hitCount:0,criticalCount:0,startedAtMs:event.timeMs,expiresAtMs:event.timeMs+LIFETIME_MS};
      this.groups.set(g.id,g);
      this.current.set(key,g);
    }
    // Reject overflow before changing any group value.
    if (!Number.isFinite(g.amount + event.amount)) return;
    g.amount += event.amount;
    g.hitCount++;
    if (event.crit === true) g.criticalCount++;
    g.x = event.x; g.y = event.y; g.z = event.z;
    g.dirty = true;
  }

  drain(timeMs) {
    if (!this._advance(timeMs)) return [];
    const packets = [];
    for (const g of this.groups.values()) {
      if (!g.dirty) continue;
      g.dirty = false;
      packets.push({id:g.id,targetId:g.targetId,x:g.x,y:g.y,z:g.z,amount:g.amount,
        hitCount:g.hitCount,critMode:g.criticalCount===0?'none':g.criticalCount===g.hitCount?'all':'some',
        startedAtMs:g.startedAtMs,expiresAtMs:g.expiresAtMs});
    }
    return packets;
  }

  clear() {
    this.groups.clear();
    this.current.clear();
  }
}

// Status ticks bypass Game.onDamage. Preserve that gameplay path and only report
// damage already subtracted; no extra sounds, statuses, multipliers or refunds.
export function reportStatusDamage(target, kind, amount, y = 1.7) {
  const source = target.status?.[`${kind}FeedbackSource`];
  const root=target.game,actor=resolveDamageActor(root,source||{}),g=actor?.view||(!root?.actors?root:null),actual=Math.max(0,Math.min(amount,target.hp+amount));
  if(g?.hero?.ruleVersion===3&&actual>0){
    const owned=!!actor||g.player?.weapons?.some(w=>w.assetInstanceId===source?.sourceInstanceId);
    g.emit?.('onActualDamage',{targetId:String(target.id||''),targetIsBoss:!!target.isBoss,amount:actual,category:'statusDot',owner:owned?'player':'world',sourceInstanceId:source?.sourceInstanceId||null,rootShotId:source?.rootShotId||null,roomUid:String(g.room?.uid||''),lethal:target.hp<=0,targetMaxHp:target.maxHp,progressionEligible:!target.dummy&&!target.immortal&&!target.invulnerable&&!target.fromSummon&&target.team===TEAM.ENEMY});
  }
  target.game?.recordDamageFeedback?.(target,amount,{
    source:kind,feedbackCategory:'dot',rootShotId:null,
    sourceInstanceId:source?.sourceInstanceId || `status:${kind}`,
  },{y});
}

export function statusFeedbackSource(opts = {}) {
  return {...damageSource(opts),sourceInstanceId:typeof opts.feedbackSourceInstanceId==='string'?opts.feedbackSourceInstanceId:
    typeof opts.sourceInstanceId==='string'?opts.sourceInstanceId:
    typeof opts.source==='string'?`status-source:${opts.source}`:'status:unknown'};
}
