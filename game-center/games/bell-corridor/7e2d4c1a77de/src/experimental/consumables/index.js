// ============================================================
// 四格消耗品 · 公开入口（interface-v1）
// ------------------------------------------------------------
// 正式接线只应 import 这个文件，不要深入子模块，
// 这样后续换实现（例如改成事件总线）不必改 Game 侧。
// ============================================================
export {
  MODULE_ID, FORMAT_VERSION, DEFAULT_CONFIG, CLEANSABLE_STATUS_IDS,
  ITEM_DEFS, ITEM_IDS, getItemDef, isKnownItem, normalizeConfig,
} from './items.js';

export {
  createState, validateState, capture, restore,
  onFloorTransition, onModeChange, endRun, cloneState,
} from './state.js';

export {
  offerPickup, resolvePickup, slotSummary,
} from './inventory.js';

export {
  prepareUse, useImmediately, canUseSlot, getModifiers,
  absorbDamage, notifyAttack, tick, reasonText, REASON_TEXT,
} from './use.js';

export { getView } from './view.js';

// 便捷组合：宿主每帧只需要一次 tick；界面每帧只需要一次 getView。
import { DEFAULT_CONFIG, normalizeConfig } from './items.js';
import { tick as tickImpl } from './use.js';
import { getView as getViewImpl } from './view.js';

export function advance(state, dt, context = {}, config = DEFAULT_CONFIG) {
  return tickImpl(state, dt, context, normalizeConfig(config));
}

export function view(state, context = {}, config = DEFAULT_CONFIG) {
  return getViewImpl(state, context, normalizeConfig(config));
}
