import * as THREE from '../../../vendor/three.module.js';

const MAX_IMAGES = 3, BEAM_COUNT = 18, BEAM_LIFE = .12;
const COPPER = 0xc99061, IRON = 0x293b45, CYAN = 0x91f3f3;
let decorationResources;

function mesh(parent, geometry, material, x, y, z, sx = 1, sy = 1, sz = 1) {
  const part = new THREE.Mesh(geometry, material);
  part.position.set(x, y, z);
  part.scale.set(sx, sy, sz);
  parent.add(part);
  return part;
}

// Like the base character model cache, these immutable decoration resources are
// shared by rebuilt player rigs. The transient effect owner never disposes them.
function decorationCache() {
  if (decorationResources) return decorationResources;
  decorationResources = {
    box: new THREE.BoxGeometry(1, 1, 1),
    ring: new THREE.TorusGeometry(.62, .064, 5, 12),
    disc: new THREE.CylinderGeometry(.55, .55, .045, 12),
    copper: new THREE.MeshStandardMaterial({ color: COPPER, roughness: .4, metalness: .72, flatShading: true }),
    iron: new THREE.MeshStandardMaterial({ color: IRON, roughness: .72, metalness: .42, flatShading: true }),
    glass: new THREE.MeshStandardMaterial({ color: 0x234d58, emissive: 0x2c8e9c, emissiveIntensity: .6, roughness: .22, metalness: .6 }),
    light: new THREE.MeshBasicMaterial({ color: CYAN }),
  };
  for (const resource of Object.values(decorationResources)) resource.userData.shared = true;
  return decorationResources;
}

/** Attach the Fold Shadow's split mirror and blade spine exactly once. */
export function decorateFoldRig(rig) {
  if (!rig) return rig;
  const parent = rig.torso || rig.back || rig.group || (rig.isObject3D ? rig : null);
  if (!parent?.add) return rig;
  const existing = parent.getObjectByName('foldMirror');
  if (existing) { rig.foldMirror = existing; return rig; }
  const r = decorationCache(), mirror = new THREE.Group();
  mirror.name = 'foldMirror';
  mirror.position.set(-.14, .20, -.49);
  mirror.rotation.set(-.22, -.16, -.35);
  parent.add(mirror);
  rig.foldMirror = mirror;
  mesh(mirror, r.ring, r.copper, 0, 0, 0);
  const disc = mesh(mirror, r.disc, r.glass, 0, 0, 0);
  disc.rotation.x = Math.PI / 2;
  // A long, asymmetric iron spine and split mirror edge alter the silhouette
  // even without color. There is no Warden bell or rounded shoulder ornament.
  const spine = mesh(mirror, r.box, r.iron, -.48, .05, -.02, .15, 1.60, .16);
  spine.rotation.z = -.12;
  mesh(mirror, r.box, r.copper, -.48, .82, -.02, .23, .12, .20);
  for (let i = 0; i < 3; i++) {
    const slash = mesh(mirror, r.box, r.light, -.25 + i * .20, .05 - i * .07, .04, .035, .72 - i * .10, .02);
    slash.rotation.z = -.36;
  }
  const blade = mesh(mirror, r.box, r.iron, .60, -.12, -.02, .13, .70, .16);
  blade.rotation.z = -.40;
  mesh(mirror, r.box, r.copper, .59, .15, -.02, .25, .09, .19);
  return rig;
}

function point(value) { return !!value && Number.isFinite(value.x) && Number.isFinite(value.z); }

/** Fixed scene pool; visuals read combat state but never own or modify it. */
export class FoldVisuals {
  constructor(game) {
    this.game = game;
    this.disposed = false;
    this.time = 0;
    this.roomUid = null;
    this.cursor = 0;
    this.root = new THREE.Group();
    this.root.name = 'foldVisuals';
    this.root.visible = false;
    this.geometries = [new THREE.BoxGeometry(1, 1, 1), new THREE.TorusGeometry(.56, .035, 4, 12)];
    this.materials = [];
    this.direction = new THREE.Vector3();
    this.beamAxis = new THREE.Vector3(0, 0, 1);
    this.images = [];
    this.beams = [];
    const material = (color, opacity) => {
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, toneMapped: false });
      this.materials.push(mat);
      return mat;
    };
    this.imageMaterials = {
      anchor: [material(CYAN, .28), material(COPPER, .70), material(CYAN, .73)],
      burst: [material(0x9ac7ce, .20), material(0xf3b277, .67), material(0xffd3a4, .66)],
    };
    const [box, ring] = this.geometries;
    for (let i = 0; i < MAX_IMAGES; i++) {
      const group = new THREE.Group();
      group.name = `foldImage${i}`;
      group.visible = false;
      this.root.add(group);
      const bodyParts = [], rimParts = [], glowParts = [], mats = this.imageMaterials.anchor;
      bodyParts.push(mesh(group, box, mats[0], 0, 1.14, 0, .65, .68, .40));
      bodyParts.push(mesh(group, box, mats[0], 0, 1.77, 0, .43, .43, .38));
      for (const side of [-1, 1]) {
        bodyParts.push(mesh(group, box, mats[0], side * .43, 1.08, 0, .18, .64, .20));
        bodyParts.push(mesh(group, box, mats[0], side * .18, .45, 0, .20, .78, .24));
      }
      const mirror = mesh(group, ring, mats[1], -.14, 1.45, -.35);
      mirror.rotation.set(-.22, -.16, -.35);
      rimParts.push(mirror);
      const spine = mesh(group, box, mats[1], -.54, 1.47, -.37, .10, 1.38, .10);
      spine.rotation.z = -.35;
      rimParts.push(spine);
      glowParts.push(mesh(group, box, mats[2], 0, 1.78, .21, .31, .055, .025));
      const crack = mesh(group, box, mats[2], -.14, 1.45, -.30, .035, .80, .025);
      crack.rotation.z = -.35;
      glowParts.push(crack);
      const floor = mesh(group, ring, mats[2], 0, .055, 0, 1.10, 1.10, 1.10);
      floor.rotation.x = -Math.PI / 2;
      glowParts.push(floor);
      // Burst glyph: two bars distinguish temporary ultimate images by shape.
      const burstMark = new THREE.Group();
      burstMark.visible = false;
      group.add(burstMark);
      for (const side of [-1, 1]) {
        const mark = mesh(burstMark, box, this.imageMaterials.burst[2], side * .74, .065, 0, .07, .025, .64);
        mark.rotation.y = side * .35;
      }
      this.images.push({ group, bodyParts, rimParts, glowParts, burstMark, kind: null });
    }
    for (let i = 0; i < BEAM_COUNT; i++) {
      const beam = mesh(this.root, box, material(CYAN, .85), 0, 0, 0);
      beam.name = `foldRay${i}`;
      beam.visible = false;
      this.beams.push({ mesh: beam, left: 0 });
    }
    game.scene?.add(this.root);
  }

  _eligible() {
    const g = this.game;
    return !this.disposed && !!g?.experiment?.fold && g.experiment.version === 2 &&
      g.experiment.scheme === 'foldshadow' && g.mode === 'run' && g.state === 'play' &&
      (g.hero || g.player?.hero)?.id === 'foldshadow' && !!g.player?.alive;
  }

  _blocked() {
    const g = this.game;
    return g.paused || (typeof g.panelOpen === 'function' ? g.panelOpen() : g.panelOpen) ||
      g.buildOpen || g._restoring || g._importing || g.revivalPending;
  }

  _clear() {
    this.root.visible = false;
    for (const image of this.images) image.group.visible = false;
    for (const beam of this.beams) { beam.left = 0; beam.mesh.visible = false; }
  }

  sync(dt = 0) {
    if (this.disposed) return;
    if (!this._eligible()) { this._clear(); this.roomUid = null; return; }
    const g = this.game, fold = g.experiment.fold;
    if (this.roomUid !== fold.roomUid) { this._clear(); this.roomUid = fold.roomUid; }
    // The pool remains frozen while UI is open; resuming restores live images
    // and the unspent lifetime of a ray, with no dependence on wall-clock time.
    if (this._blocked()) { this.root.visible = false; return; }
    this.root.visible = true;
    const elapsed = Number.isFinite(dt) && dt > 0 ? dt : 0;
    this.time += elapsed;
    const rig = g.player.rig?.group || g.player.rig;
    const yaw = rig?.rotation?.y || 0;
    let count = 0;
    if (Array.isArray(fold.images)) for (const data of fold.images) {
      if (count >= MAX_IMAGES) break;
      if (!point(data) || !(data.left > 0) || data.roomUid !== fold.roomUid ||
          !['anchor', 'burst'].includes(data.kind)) continue;
      const image = this.images[count++];
      image.group.visible = true;
      image.group.position.set(data.x, 0, data.z);
      image.group.rotation.y = yaw;
      image.group.scale.setScalar(.98 + .02 * Math.sin(this.time * 5 + count));
      image.group.userData.foldImageId = data.id;
      image.group.userData.foldKind = data.kind;
      if (image.kind !== data.kind) {
        image.kind = data.kind;
        const mats = this.imageMaterials[data.kind];
        for (const part of image.bodyParts) part.material = mats[0];
        for (const part of image.rimParts) part.material = mats[1];
        for (const part of image.glowParts) part.material = mats[2];
        image.burstMark.visible = data.kind === 'burst';
      }
    }
    for (let i = count; i < MAX_IMAGES; i++) this.images[i].group.visible = false;
    for (const beam of this.beams) {
      beam.left = Math.max(0, beam.left - elapsed);
      beam.mesh.visible = beam.left > 0;
      beam.mesh.material.opacity = .85 * beam.left / BEAM_LIFE;
    }
  }

  _beam(x1, z1, x2, z2, y, width, color) {
    const dx = x2 - x1, dz = z2 - z1, length = Math.hypot(dx, dz);
    if (!Number.isFinite(length) || length < .001) return;
    const beam = this.beams[this.cursor];
    this.cursor = (this.cursor + 1) % BEAM_COUNT;
    beam.left = BEAM_LIFE;
    beam.mesh.visible = true;
    beam.mesh.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
    beam.mesh.scale.set(width, width, length);
    this.direction.set(dx / length, 0, dz / length);
    beam.mesh.quaternion.setFromUnitVectors(this.beamAxis, this.direction);
    beam.mesh.material.color.setHex(color);
    beam.mesh.material.opacity = .85;
  }

  event(type, payload = {}) {
    if (!this._eligible() || this._blocked() || !['step', 'swap', 'shot', 'ultimate'].includes(type)) return;
    // Also clear old-room beams if an action arrives before the next sync.
    const roomUid = this.game.experiment.fold.roomUid;
    if (this.roomUid !== roomUid) { this._clear(); this.roomUid = roomUid; }
    this.root.visible = true;
    const { from, to, segments } = payload || {};
    const y = type === 'shot' ? 1.15 : type === 'swap' ? .65 : .18;
    const width = type === 'shot' ? .045 : type === 'swap' ? .11 : .07;
    const color = type === 'swap' || type === 'ultimate' ? COPPER : CYAN;
    if (point(from) && point(to)) this._beam(from.x, from.z, to.x, to.z, y, width, color);
    if (Array.isArray(segments)) for (let i = 0; i < Math.min(segments.length, BEAM_COUNT); i++) {
      const s = segments[i];
      if (point(s?.from) && point(s?.to)) this._beam(s.from.x, s.from.z, s.to.x, s.to.z, y, width, color);
    }
    if (type === 'ultimate') {
      const center = point(to) ? to : point(from) ? from : this.game.player;
      if (point(center)) for (let i = 0; i < 8; i++) {
        const angle = i * Math.PI / 4, dx = Math.cos(angle), dz = Math.sin(angle);
        this._beam(center.x + dx * .7, center.z + dz * .7,
          center.x + dx * 1.7, center.z + dz * 1.7, .09, .055, COPPER);
      }
    }
  }

  dispose() {
    if (this.disposed) return;
    this._clear();
    this.root.removeFromParent();
    for (const geometry of this.geometries) geometry.dispose();
    for (const material of this.materials) material.dispose();
    this.disposed = true;
    this.game = null;
  }
}
