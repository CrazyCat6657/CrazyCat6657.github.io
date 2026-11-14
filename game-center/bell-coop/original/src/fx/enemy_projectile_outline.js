// A bounded inverted hull around the existing colored enemy projectile bodies.
import * as THREE from '../../vendor/three.module.js';
import { TEAM } from '../core/constants.js';

const rimMaterial = new THREE.MeshBasicMaterial({
  color: 0x10212b, side: THREE.BackSide, toneMapped: false,
});

export class EnemyProjectileOutline {
  constructor(scene, geometries, capacity) {
    this.batches = [];
    this.byGeometry = new Map();
    this.matrix = new THREE.Matrix4();
    this.expansion = new THREE.Matrix4().makeScale(1.28, 1.28, 1.28);
    for (const kind of ['bolt', 'orb', 'spike']) {
      const mesh = new THREE.InstancedMesh(geometries[kind], rimMaterial, capacity);
      mesh.name = `enemy-projectile-outline:${kind}`;
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.frustumCulled = false;
      mesh.count = 0;
      mesh.visible = false;
      scene.add(mesh);
      this.batches.push(mesh);
      this.byGeometry.set(geometries[kind], mesh);
    }
  }

  clear() {
    for (const mesh of this.batches) {
      mesh.count = 0;
      mesh.visible = false;
    }
  }

  sync(pool) {
    this.clear();
    if (typeof location !== 'undefined' && new URLSearchParams(location.search).get('combatArt') === 'legacy') return;
    for (const bullet of pool) {
      if (!bullet.alive || bullet.team !== TEAM.ENEMY || !bullet.mesh.visible) continue;
      // Geometry is authoritative, including the body's unknown-kind fallback.
      const batch = this.byGeometry.get(bullet.mesh.geometry);
      if (!batch || batch.count >= batch.instanceMatrix.count) continue;
      bullet.mesh.updateMatrix();
      // Post-multiply so expansion affects only the local shape, not its position.
      this.matrix.copy(bullet.mesh.matrix).multiply(this.expansion);
      batch.setMatrixAt(batch.count++, this.matrix);
    }
    for (const mesh of this.batches) {
      mesh.visible = mesh.count > 0;
      if (mesh.count) mesh.instanceMatrix.needsUpdate = true;
    }
  }
}
