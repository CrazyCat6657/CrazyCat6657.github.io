import {Input} from '../core/input.js';

// Inherit the real action bindings, move normalization and edge semantics.
// Only event acquisition is replaced; no DOM listeners or synthetic document.
export class HeadlessInput extends Input {
  _bind() {}
  constructor() {
    super(null); this.worldAimPoint = {x: 0, z: 7};
    // Physical snapshots survive Input.setBlocked/resetState. Those methods
    // cancel logical holds/edges; a still-held physical control must release
    // before it can be admitted again, just like a browser key repeat.
    this._physicalActions = new Set(); this._physicalKeys = new Set();
  }
  submit({move = {x:0,z:0}, aimPoint, aimDirection, aimDistance, actions = [], keys = []} = {}, player) {
    for (const value of [move.x, move.z]) if (!Number.isFinite(value)) throw TypeError('Non-finite movement');
    if (!Array.isArray(actions) || actions.some(a => !Object.hasOwn(this.bindings, a))) throw TypeError('Unknown action');
    if (!Array.isArray(keys) || keys.some(k => typeof k !== 'string')) throw TypeError('Invalid edge keys');
    let point = aimPoint;
    if (aimDirection) {
      const len = Math.hypot(aimDirection.x, aimDirection.z);
      if (!player || !Number.isFinite(len) || len <= 0 || !Number.isFinite(aimDistance) || aimDistance < 0 || aimDistance > 100) throw TypeError('Invalid world aim direction/distance');
      point = {x: player.x + aimDirection.x / len * aimDistance, z: player.z + aimDirection.z / len * aimDistance};
    }
    if (point && (!Number.isFinite(point.x) || !Number.isFinite(point.z) || (player && Math.hypot(point.x-player.x,point.z-player.z)>100))) throw TypeError('Invalid world aim point');
    if (point) this.worldAimPoint = {x:point.x,z:point.z};
    const physicalActions=new Set(actions),physicalKeys=new Set(keys),down=new Set();
    if(!this.blocked&&!this.capturing)for(const action of physicalActions) {
      if(!this._physicalActions.has(action)) {
        down.add(action); this.touchActions.hit.add(action);
      } else if(this.touchActions.down.has(action)) down.add(action);
    }
    // Keep pending press edges until endFrame, including press+release or
    // repeated snapshots received before the next simulation tick.
    this.touchActions.down=down;
    const logicalKeys=Object.create(null);
    for(const key of physicalKeys) {
      if(!this._physicalKeys.has(key)&&!this.capturing) {
        logicalKeys[key]=true; this.pressed[key]=true;
      } else if(this.keys[key]) logicalKeys[key]=true;
    }
    for(const key of this._physicalKeys) if(!physicalKeys.has(key)) this.released[key]=true;
    this.keys=logicalKeys;
    this._physicalActions=physicalActions; this._physicalKeys=physicalKeys;
    this.analogMove = this.blocked ? null : {x:move.x,z:move.z};
  }
  dispose() { this.resetState(); this._unsubscribeControls?.(); }
}
