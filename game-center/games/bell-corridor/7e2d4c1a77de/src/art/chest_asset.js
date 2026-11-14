import * as THREE from '../../vendor/three.module.js';

// One small, texture-free pilot. Factories stay synchronous; the optional asset
// is loaded once at boot. Nothing is attached asynchronously to disposed rooms.
let template = null;
let pending = null;
const tierMaterials = new Map();
export const chestAssetStatus = { state: 'idle', loadMs: 0, bytes: 0 };
export function preloadChestAsset() {
  if (pending) return pending;
  pending = (async () => {
    const start = performance.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    try {
      const [response, { GLTFLoader }] = await Promise.all([
        fetch(new URL('./assets/white-steel-chest.glb', import.meta.url), { signal: controller.signal }),
        import('../../vendor/loaders/GLTFLoader.js'),
      ]);
      if (!response.ok) throw Error(`Chest asset HTTP ${response.status}`);
      const bytes = await response.arrayBuffer();
      const gltf = await new GLTFLoader().parseAsync(bytes, '');
      for (const name of ['Body', 'Lid', 'LockLocked', 'LockUnlocked', 'Emblem1', 'Emblem2', 'Emblem3', 'Emblem4', 'Emblem5']) {
        if (!gltf.scene.getObjectByName(name)) throw Error(`Missing chest node ${name}`);
      }
      gltf.scene.traverse(o => {
        if (!o.isMesh) return;
        o.geometry.userData.shared = true;
        o.castShadow = o.receiveShadow = true;
        for (const m of Array.isArray(o.material) ? o.material : [o.material]) m.flatShading = true;
      });
      template = gltf.scene;
      Object.assign(chestAssetStatus, { state: 'ready', bytes: bytes.byteLength });
    } catch (error) {
      Object.assign(chestAssetStatus, { state: 'fallback', reason: error.message });
      console.warn('Chest artwork unavailable; using built-in model.', error.message);
    } finally {
      clearTimeout(timer);
      chestAssetStatus.loadMs = performance.now() - start;
    }
    return chestAssetStatus;
  })();
  return pending;
}

export function makePilotChestVisual(rules) {
  if (!template || rules.legacy ||
      (typeof location !== 'undefined' && new URLSearchParams(location.search).get('chestArt') === 'legacy')) return null;
  const g = new THREE.Group();
  const nodes = {};
  // clone keeps the small fixed geometry/material cache shared across rooms.
  for (const name of ['Body', 'Lid', rules.locked ? 'LockLocked' : 'LockUnlocked']) {
    const node = template.getObjectByName(name).clone(true);
    nodes[name] = node;
    g.add(node);
  }
  const emblem = template.getObjectByName('Emblem'+rules.rarityTier).clone(true);
  emblem.position.set(0,0,0);nodes.Lid.add(emblem);
  g.traverse(o=>{
    if (!o.isMesh || o.material.name !== 'steel') return;
    const key=rules.rarityTier;
    if(!tierMaterials.has(key)){
      const m=o.material.clone();m.color.set(rules.color);tierMaterials.set(key,m);
    }
    o.material=tierMaterials.get(key);
  });
  g.userData.chestArt = rules.rarityTier===1?'blender-white-steel':'blender-tier-'+rules.rarityTier;
  return { g, lid: nodes.Lid, lock: nodes[rules.locked ? 'LockLocked' : 'LockUnlocked'] };
}
