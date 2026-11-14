// Shared terminology and the limited acquisition cone for low-strength ballistic correction.
export const TrackingTier = Object.freeze({ NONE:'none', CORRECTION:'correction', WEAK:'weak', VISIBLE:'visible', LOCKED:'locked' });
export const MICRO_GYRO = Object.freeze({ strength:.35, coneDegrees:12, name:'弹道微调环' });
export function validCorrectionIdentity(value) { return value === undefined || typeof value === 'boolean'; }
export function trackingDescription(strength=0, locked=false) {
  const tier=locked?TrackingTier.LOCKED:strength<=0?TrackingTier.NONE:strength<=.5?TrackingTier.CORRECTION:strength<1.5?TrackingTier.WEAK:TrackingTier.VISIBLE;
  const label=({none:'无追踪',correction:'弹道微调',weak:'弱追踪',visible:'明显追踪',locked:'锁定追踪'})[tier];
  return {tier,label,strength,coneDegrees:tier==='correction'?MICRO_GYRO.coneDegrees:null,
    description:tier==='correction'?'仅修正前方12°内的轻微偏差；不会追逐侧后方目标':tier==='locked'?'追随武器指定目标；目标失效时遵循武器规则':tier==='none'?'保持手动弹道':`${label}，实际命中仍受距离、弹速与目标移动影响`};
}
export function correctionTargetAllowed(b,target) {
  // Asset mechanics may replace attachment steering with an independent lock/strength.
  // Historical projectiles without source identity retain their numeric fallback.
  const correctionOnly=b.correctionOnly ?? (b.shot?.homing===b.homing?b.shot?.correctionOnly:undefined);
  if (b.targetId || !(correctionOnly ?? (b.homing>0&&b.homing<=.5))) return true;
  const dx=target.x-b.x,dz=target.z-b.z,n=Math.hypot(dx,dz),d=Math.hypot(b.dx,b.dz);
  return n>0&&d>0&&(dx*b.dx+dz*b.dz)/(n*d)>=Math.cos(MICRO_GYRO.coneDegrees*Math.PI/180);
}
