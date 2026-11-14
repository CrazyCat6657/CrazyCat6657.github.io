import * as C from './index.js';

export function captureConsumableHost(g) {
  return {version:1,inventory:C.capture(g.consumables),purchases:[...(g.consumablePurchases||[])]};
}
export function restoreConsumableHost(raw) {
  if (raw===undefined) return {state:C.createState(),purchases:[]};
  if (!raw || typeof raw!=='object' || Array.isArray(raw) || Object.keys(raw).length!==3 || raw.version!==1 ||
      !Object.hasOwn(raw,'inventory') || !Array.isArray(raw.purchases) || raw.purchases.length>18 ||
      new Set(raw.purchases).size!==raw.purchases.length || raw.purchases.some(k=>typeof k!=='string' ||
        ![1,2,3].some(f=>C.ITEM_IDS.some(id=>k===`${f}:${id}`)))) throw Error('实验消耗品宿主状态无效');
  const restored=C.restore(raw.inventory);
  if (!restored.ok) throw Error('实验消耗品库存无效：'+restored.errors.join('；'));
  return {state:restored.state,purchases:[...raw.purchases]};
}
