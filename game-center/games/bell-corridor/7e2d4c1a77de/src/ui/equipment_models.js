import * as THREE from '../../vendor/three.module.js';
import { buildGunModel } from '../art/guns.js';
import { attachGunParts } from '../game/attachments.js';

// One offscreen target on the game's existing renderer, no new WebGL contexts.
// Gun clones share cached geometry/materials. Only this target is owned here.
export class EquipmentModels {
  constructor(game) { this.game = game; this.renders = 0; this.last = []; }
  draw(container, weapons) {
    const renderer = this.game.renderer;
    if (!renderer) return;
    this.target ||= new THREE.WebGLRenderTarget(256, 128, { depthBuffer: true });
    this.target.texture.colorSpace = THREE.SRGBColorSpace;
    this.scene ||= new THREE.Scene();
    this.camera ||= new THREE.OrthographicCamera(-1, 1, .5, -.5, .01, 30);
    if (!this.scene.children.length) {
      this.scene.background = new THREE.Color('#081016');
      this.scene.add(new THREE.HemisphereLight('#dff2f8', '#5a626c', 3));
      const lamp = new THREE.DirectionalLight('#f0c86a', 3.5); lamp.position.set(-2, 4, 3); this.scene.add(lamp);
    }
    const prior = renderer.getRenderTarget(), viewport = renderer.getViewport(new THREE.Vector4()),
      scissor = renderer.getScissor(new THREE.Vector4()), test = renderer.getScissorTest(), auto = renderer.autoClear;
    this.last = [];
    try {
      renderer.autoClear = true;
      renderer.setScissorTest(false);
      for (const [i, w] of weapons.entries()) {
        const canvas = container.querySelector('[data-gun-model="' + i + '"]');
        if (!canvas) continue;
        const gun = buildGunModel(w.def.model);
        attachGunParts(gun, w.attachments);
        this.scene.add(gun);
        try {
          const bounds = new THREE.Box3().setFromObject(gun), center = bounds.getCenter(new THREE.Vector3()),
            size = bounds.getSize(new THREE.Vector3()), extent = Math.max(size.x, size.y, size.z, .5);
          this.camera.position.copy(center).add(new THREE.Vector3(extent * 2.4, extent * 1.5, extent * 1.9));
          this.camera.lookAt(center); this.camera.updateMatrixWorld();
          this.camera.left = -extent * .8; this.camera.right = extent * .8;
          this.camera.top = extent * .4; this.camera.bottom = -extent * .4; this.camera.updateProjectionMatrix();
          renderer.setRenderTarget(this.target);
          renderer.setViewport(0, 0, 256, 128);
          renderer.clear(); renderer.render(this.scene, this.camera);
          const raw = new Uint8Array(256 * 128 * 4);
          renderer.readRenderTargetPixels(this.target, 0, 0, 256, 128, raw);
          const output = canvas.getContext('2d'), data = output.createImageData(256, 128);
          for (let y = 0; y < 128; y++) data.data.set(raw.subarray((127-y)*1024, (128-y)*1024), y*1024);
          output.putImageData(data, 0, 0);
          const parts = [];
          gun.traverse(o => { if (o.name.startsWith('p_')) parts.push(o.name); });
          canvas.dataset.model = w.def.model; canvas.dataset.attachments = (w.attachments || []).join(',');
          this.last.push({ index: i, model: w.def.model, attachments: [...(w.attachments || [])], parts });
          this.renders++;
        } finally { this.scene.remove(gun); }
      }
    } finally {
      renderer.setRenderTarget(prior); renderer.setViewport(viewport); renderer.setScissor(scissor);
      renderer.setScissorTest(test); renderer.autoClear = auto;
    }
  }
  close() {
    this.target?.dispose(); this.target = null;
    this.scene?.clear(); this.scene = null; this.camera = null; this.last = [];
  }
  diagnostics() { return { contexts: 0, targets: this.target ? 1 : 0, objects: this.scene?.children.length || 0, renders: this.renders, last: this.last }; }
}
