import { ATTACH_MAP, SLOT_CN, attachmentCompatibility } from '../game/attachments.js';
import { attachmentPositions } from '../game/equipment_drops.js';
import { preferences } from '../game/preferences.js';
import { runeName } from '../game/spells.js';
import { EquipmentModels } from './equipment_models.js';

const safe = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
export class EquipmentView {
  constructor(hud) { this.hud = hud; this.target = 0; this.selected = null; this.status = ''; this.models = new EquipmentModels(hud.game); }
  label(id) {
    const a = ATTACH_MAP[id]; return this.hud.game.player.hero?.augment === 'spellcore' ? runeName(id, a.cn) : a.cn;
  }
  message(text) { this.status = text; this.hud._buildSig = null; if (this.hud.buildOpen) this.hud.renderBuild(); }
  query(p, index, slot = -1) {
    const w = p.weapons[index], id = this.selected?.id;
    if (!w) return { ok: false, why: '没有目标武器' };
    if (!id) return { ok: false, why: '请先选择一个备用配件' };
    const result = attachmentCompatibility(w.def, id, { installed: w.attachments, slotCount: p.attachSlots(), allowSameSlot: !!p.hero?.attachSameSlot });
    if (!result.ok) return result;
    if (slot >= 0 && attachmentPositions(w).includes(slot)) return { ok: false, why: '这个装配位已有配件，请先拆下' };
    return result;
  }
  signature() { return [this.target, this.selected, this.status]; }
  weaponsHTML(p) {
    this.target = Math.min(this.target, Math.max(0, p.weapons.length - 1));
    if (this.selected && p.spareAttachments[this.selected.index] !== this.selected.id) this.selected = null;
    this.shownPlayer = p; this.shownWeapons = p.weapons.slice();
    return p.weapons.map((w, i) => {
      const query = this.query(p, i), positions = attachmentPositions(w);
      const name = safe(w.def.cn), slots = Array.from({ length: Math.max(p.attachSlots(), ...(positions.map(v => v + 1))) }, (_, j) => {
        const id = w.attachments[positions.indexOf(j)];
        return '<div class="equipment-slot" data-equip-slot="' + j + '" data-equip-weapon="' + i + '">' +
          (id ? '<button type="button" data-detach="' + id + '" data-weapon-index="' + i + '" title="拆下这个配件；备用配件库满时会留在地面">位 ' + (j+1) + ' · ' + safe(this.label(id)) + ' ×</button>' :
            '<button type="button" data-equip-target="' + i + '" data-equip-position="' + j + '">空装配位 ' + (j+1) + '</button>') + '</div>';
      }).join('');
      return '<article class="bs-w equipment-gun ' + (i === p.weaponIndex ? 'on ' : '') + (i === this.target ? 'equipment-target ' : '') + '" data-equip-weapon="' + i + '">' +
        '<button type="button" class="equipment-choose" data-equip-target="' + i + '"><b>持有槽 ' + (i+1) + ' · ' + name + '</b><span>' + (i === p.weaponIndex ? '当前手持' : '备用枪') + (i === this.target ? ' · 装配目标' : ' · 选为目标') + '</span></button>' +
        '<canvas width="256" height="128" data-gun-model="' + i + '" aria-label="' + name + '实际3D外观与已装配件"></canvas>' +
        '<div class="equipment-slots">' + slots + '</div><p class="bs-wm">' + safe(w.def.desc) + '</p>' +
        (w.def.assetTradeoff ? '<p class="e2-cost">限制：' + safe(w.def.assetTradeoff) + '</p>' : '') +
        '<p class="equipment-reason">' + (this.selected ? safe(query.ok ? '可以装到这把枪上' : query.why) : '把备用配件拖到这把枪或空装配位') + '</p>' +
        '<div class="equipment-drop"><button class="btn small" data-equip-drop="' + i + '">' + (preferences.get().autoDetachOnReplace ? '丢枪并卸件' : '丢枪（保留装配）') + '</button><button class="btn small" data-equip-whole="' + i + '">整枪丢弃</button></div></article>';
    }).join('');
  }
  spareHTML(p) {
    const items = p.spareAttachments.map((id, i) => '<div class="bs-item equipment-spare" draggable="true" data-equip-spare="' + i + '" data-equip-id="' + id + '">' +
      '<button type="button" class="equipment-pick ' + (this.selected?.index === i ? 'selected' : '') + '" data-equip-select="' + i + '"><b>[' + (i+1) + '] ' + safe(this.label(id)) + '</b><span>' + safe(SLOT_CN[ATTACH_MAP[id].slot]) + ' · ' + safe(ATTACH_MAP[id].desc) + '</span></button>' +
      '<button class="btn small" type="button" data-drop-spare="' + i + '">丢到地面</button></div>').join('');
    const selected = this.selected ? this.label(this.selected.id) : '未选择';
    const target = p.weapons[this.target], query = this.query(p, this.target);
    return '<div class="equipment-confirm"><p>要装的配件：<b>' + safe(selected) + '</b></p><p>装到：持有槽 ' + (this.target+1) + ' · ' + safe(target?.def.cn) + '</p>' +
      '<button type="button" class="btn primary" data-equip-confirm="1" aria-disabled="' + !query.ok + '">确认安装</button>' +
      '<p class="equipment-status" role="status" aria-live="polite">' + safe(this.status || (this.selected ? query.ok ? '可以安装' : query.why : '拖放、点选或按数字键选中配件，再选枪或装配位，确认安装。')) + '</p></div>' +
      (items || '<p class="bs-empty">没有备用配件。拆下已装件后可以重装。</p>');
  }
  select(index) {
    const p = this.hud.game.player, id = p.spareAttachments[index];
    if (!id) return;
    this.selected = { id, index }; this.status = ''; this.render();
  }
  render() { this.hud._buildSig = null; this.hud.renderBuild(); }
  install(index = this.target, slot = this.targetPosition ?? -1) {
    const game = this.hud.game, p = game.player, q = this.query(p, index, slot);
    if (!q.ok) { this.message(q.why); return false; }
    if (p !== this.shownPlayer || p.weapons[index] !== this.shownWeapons[index] ||
        p.spareAttachments[this.selected.index] !== this.selected.id) { this.message('装备已变化，请重新选择'); return false; }
    this.target = index;
    const ok = game.installBuildAttachment(this.selected.id, index, slot);
    if(ok&&typeof ok.then==='function')return ok.then(r=>{if(r.ok){this.selected=null;this.targetPosition=undefined;this.render();}return r.ok;});
    if (ok) { this.selected = null; this.targetPosition = undefined; this.render(); }
    return ok;
  }
  bind(container) {
    if (this.container) return;
    this.container = container;
    this.hud.listen(container,'click', e => {
      if (!this.hud.buildOpen || this.hud.game.topModal() !== 'build') return;
      const row = e.target.closest('[data-equip-select],[data-equip-target],[data-equip-confirm],[data-drop-spare],[data-detach],[data-equip-drop],[data-equip-whole]');
      if (!row?.isConnected) return;
      const d = row.dataset;
      if (d.equipSelect !== undefined) this.select(Number(d.equipSelect));
      else if (d.equipTarget !== undefined) { this.target = Number(d.equipTarget); this.targetPosition = d.equipPosition === undefined ? -1 : Number(d.equipPosition); this.status = ''; this.render(); }
      else if (d.equipConfirm) this.install();
      else if (d.dropSpare !== undefined) this.hud.game.tryDropSpareAttachment(Number(d.dropSpare));
      else if (d.detach) this.hud.game.tryDetachAttachment(d.detach, Number(d.weaponIndex));
      else this.hud.game.dropBuildWeapon(Number(d.equipDrop ?? d.equipWhole), d.equipWhole !== undefined);
    });
    this.hud.listen(container,'dragstart', e => {
      const row = e.target.closest('[data-equip-spare]');
      if (!row || this.hud.game.topModal() !== 'build') { e.preventDefault(); return; }
      const p = this.hud.game.player, index = Number(row.dataset.equipSpare);
      this.selected = { id: p.spareAttachments[index], index };
      this.drag = { player: p, weapons: p.weapons.slice(), id: this.selected.id, index };
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', 'equipment:' + index);
      this.status = '';
    });
    this.hud.listen(container,'dragover', e => {
      const row = e.target.closest('[data-equip-weapon]');
      if (this.drag && row && this.hud.game.topModal() === 'build') { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; row.classList.add('equipment-over'); }
    });
    this.hud.listen(container,'dragleave', e => e.target.closest('[data-equip-weapon]')?.classList.remove('equipment-over'));
    this.hud.listen(container,'drop', e => {
      if (!this.drag) return;
      e.preventDefault();
      const drag = this.drag; this.drag = null;
      const row = e.target.closest('[data-equip-weapon]'), p = this.hud.game.player;
      if (this.hud.game.topModal() !== 'build' || p !== drag.player || !row || p.spareAttachments[drag.index] !== drag.id) { this.message('未放到武器或装配位，配件已保留'); return; }
      const index = Number(row.dataset.equipWeapon);
      if (p.weapons[index] !== drag.weapons[index]) { this.message('目标武器已变化，配件已保留'); return; }
      const slot = row.dataset.equipSlot === undefined ? -1 : Number(row.dataset.equipSlot);
      this.install(index, slot);
    });
    this.hud.listen(container,'dragend', () => { if (this.drag) { this.drag = null; this.message('未安装，配件已保留'); } });
  }
  keys(input) {
    for (let i = 0; i < this.hud.game.player.spareCap(); i++) if (input.pressed[String(i+1)]) this.select(i);
    if (input.pressed.ArrowLeft || input.pressed.ArrowRight) {
      const n = this.hud.game.player.weapons.length, delta = input.pressed.ArrowLeft ? -1 : 1;
      this.target = (this.target + n + delta) % n; this.targetPosition = -1; this.status = ''; this.render();
    }
    const buttons = [...this.hud.el.build.querySelectorAll('button')];
    if (input.pressed.ArrowUp || input.pressed.ArrowDown) {
      const direction = input.pressed.ArrowUp ? -1 : 1;
      const current = buttons.indexOf(document.activeElement);
      const next = buttons[(current + direction + buttons.length) % buttons.length];
      next?.focus({ preventScroll: true }); next?.scrollIntoView({ block: 'nearest' });
    }
    // Input prevents native Enter/Space for the build modal. Dispatch its focused
    // button once here; no browser click + game-loop duplicate installation.
    if (input.pressed.Enter || input.pressed.Space) {
      if (buttons.includes(document.activeElement)) document.activeElement.click();
      else this.install();
    }
  }
  close() { this.drag = null; this.models.close(); }
}
