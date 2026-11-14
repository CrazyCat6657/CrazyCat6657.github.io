import * as THREE from '../../vendor/three.module.js';
import { getMaterial } from './materials.js';

const TIER_COLORS = ['#8adf6a', '#5ad8ff', '#c07af0', '#ffd24a'];
const markers = new WeakMap();
const tierArt = new Map();
let baseArt;

// A flat ring and its broad front-facing ticks share one geometry/draw call.
// These five geometries belong to this cache, never an individual pickup.
function markerGeometry(inner, outer, ticks = 0) {
  const positions = [];
  const quad = (a, b, c, d) => {
    for (const p of [a, c, b, a, d, c]) positions.push(p[0], 0, p[1]);
  };
  for (let i = 0; i < 24; i++) {
    const a = i * Math.PI / 12, b = (i + 1) * Math.PI / 12;
    quad([inner * Math.cos(a), inner * Math.sin(a)],
      [outer * Math.cos(a), outer * Math.sin(a)],
      [outer * Math.cos(b), outer * Math.sin(b)],
      [inner * Math.cos(b), inner * Math.sin(b)]);
  }
  for (let i = 0; i < ticks; i++) {
    const angle = (i - (ticks - 1) / 2) * 0.44;
    const point = (x, z) => [x * Math.cos(angle) + z * Math.sin(angle), z * Math.cos(angle) - x * Math.sin(angle)];
    quad(point(-0.09, 0.62), point(0.09, 0.62), point(0.09, 0.92), point(-0.09, 0.92));
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
}

export function attachWeaponPickupMarker(root, tier) {
  const level = Math.max(1, Math.min(4, Math.round(tier || 1)));
  if (!baseArt) baseArt = {
    geometry: markerGeometry(0.43, 0.98),
    material: getMaterial('#18252c', { roughness: 0.9, metalness: 0.1, flat: true }),
  };
  if (!tierArt.has(level)) {
    const color = TIER_COLORS[level - 1];
    tierArt.set(level, {
      geometry: markerGeometry(0.47, 0.58, level),
      // Tier cues retain the HUD palette on all three differently lit floors.
      material: new THREE.MeshBasicMaterial({ color, toneMapped: false }),
    });
  }
  const art = tierArt.get(level), marker = new THREE.Group();
  marker.name = 'weapon-pickup-marker';
  marker.add(new THREE.Mesh(baseArt.geometry, baseArt.material));
  const face = new THREE.Mesh(art.geometry, art.material);
  face.position.y = 0.002;
  marker.add(face);
  root.add(marker);
  markers.set(root, marker);
}

export function syncWeaponPickupMarker(root, floorY = 0.05) {
  const marker = markers.get(root);
  if (!marker) return;
  // Only the original gun bobs/spins. The marker follows X/Z on the floor.
  marker.position.y = floorY - root.position.y;
  marker.rotation.y = -root.rotation.y;
}
