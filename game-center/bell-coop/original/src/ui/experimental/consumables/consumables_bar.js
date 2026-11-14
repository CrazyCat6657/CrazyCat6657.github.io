// ============================================================
// 四格消耗品 · 界面层（无框架、无全局监听）
// ------------------------------------------------------------
// 职责：把 getView() 的画出来，把点击翻译成**语义动作**交给宿主。
// 不监听 keydown / 不读存档 / 不决定能不能用（可用性由 view 给出）。
// ============================================================

const ICONS = {
  heal: '<path d="M12 21s-7-4.4-7-9.5A4.5 4.5 0 0 1 12 8a4.5 4.5 0 0 1 7 3.5C19 16.6 12 21 12 21Z"/>',
  rage: '<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/>',
  veil: '<path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z"/><circle cx="12" cy="12" r="2.6"/>',
  ward: '<path d="M12 3 5 6v5c0 4.4 3 8.3 7 9.5 4-1.2 7-5.1 7-9.5V6l-7-3Z"/>',
  stamina: '<path d="M12 3a3 3 0 0 0-3 3v5.2L6.4 15A2 2 0 0 0 8.2 18h7.6a2 2 0 0 0 1.8-3L15 11.2V6a3 3 0 0 0-3-3Z"/><path d="M10 6h4"/>',
  cleanse: '<path d="M12 3 4.5 10.5A6 6 0 1 0 12 20a6 6 0 0 0 0-12"/>',
};

function svgIcon(name) {
  const body = ICONS[name] || ICONS.heal;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', 'cons-icon');
  svg.innerHTML = body;
  return svg;
}

function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (v === true) node.setAttribute(k, '');
    else if (v !== false && v != null) node.setAttribute(k, v);
  }
  for (const c of children.flat()) if (c != null) node.append(c.nodeType ? c : document.createTextNode(String(c)));
  return node;
}

export function createConsumablesBar({ mount, onAction } = {}) {
  if (!mount) throw new Error('createConsumablesBar: 需要 mount 容器');

  let selected = 0;
  let lastView = null;
  let feedbackTimer = null;
  let prompt = null; // { offer, resolve }
  const slotNodes = [];

  const root = el('div', { class: 'cons-root' });
  const effects = el('div', { class: 'cons-effects', 'aria-live': 'polite' });
  const toast = el('div', { class: 'cons-toast', role: 'status', 'aria-live': 'polite' });
  const bar = el('div', { class: 'cons-bar', role: 'toolbar', 'aria-label': '消耗品四格' });
  const detail = el('div', { class: 'cons-detail', role: 'tooltip' });
  const modalRoot = el('div', { class: 'cons-modal-root' });

  root.append(effects, detail, bar, toast, modalRoot);
  mount.append(root);

  function emit(action) {
    if (typeof onAction === 'function') onAction(action);
  }

  function renderDetail(view) {
    const slot = view.slots[selected];
    if (!slot || slot.empty) {
      detail.textContent = '空格：拾取消耗品后会自动放入';
      detail.dataset.empty = '1';
      return;
    }
    detail.dataset.empty = '0';
    detail.replaceChildren(...[
      el('b', { text: `${slot.name} ×${slot.count}` }),
      el('span', { class: 'cons-detail-short', text: slot.short }),
      el('span', { class: 'cons-detail-detail', text: slot.detail }),
      slot.usable ? null : el('span', { class: 'cons-detail-warn', text: `不可用：${slot.disabledText}` }),
    ].filter(Boolean));
  }

  function renderEffects(view) {
    const chips = [];
    for (const eff of view.effects) {
      chips.push(el('span', { class: `cons-chip cons-chip-${eff.effectId}` },
        el('i', { class: 'cons-chip-bar', style: `width:${Math.round(eff.ratio * 100)}%` }),
        el('b', { text: eff.name }),
        el('span', { text: `${eff.remaining.toFixed(1)}s` }),
      ));
    }
    if (view.armor.points > 0) {
      chips.push(el('span', { class: 'cons-chip cons-chip-ward' },
        el('b', { text: '临甲' }),
        el('span', { text: `${view.armor.points}/${view.armor.max} · ${view.armor.remaining.toFixed(1)}s` }),
      ));
    }
    effects.replaceChildren(...chips);
  }

  function renderBar(view) {
    // Preserve button identity across click/click/dblclick and host refreshes.
    // Replacing a clicked node prevents the browser from recognizing a double click.
    for (const slot of view.slots) {
      const isSel = slot.index === selected;
      let btn = slotNodes[slot.index];
      if (!btn) {
        btn = el('button', {
          type: 'button',
          onclick: () => { selected = slot.index; renderBar(lastView); renderDetail(lastView); emit({ type: 'select', slot: slot.index }); },
          ondblclick: () => { if (lastView?.slots[slot.index]?.usable) emit({ type: 'use', slot: slot.index }); },
        });
        slotNodes[slot.index] = btn;
        bar.append(btn);
      }
      btn.className = `cons-slot${isSel ? ' sel' : ''}${slot.empty ? ' empty' : ''}${slot.usable ? '' : ' disabled'}`;
      btn.setAttribute('aria-label', slot.empty ? `第 ${slot.index + 1} 格：空` : `第 ${slot.index + 1} 格：${slot.name} ×${slot.count}${slot.usable ? '' : '，' + slot.disabledText}`);
      btn.setAttribute('aria-pressed', isSel ? 'true' : 'false');
      // Keep unusable slots selectable so their refusal reason remains inspectable.
      btn.setAttribute('aria-disabled', slot.usable ? 'false' : 'true');
      const signature = JSON.stringify([slot.key, slot.empty, slot.count, slot.icon, slot.tone]);
      if (btn.dataset.content === signature) continue;
      btn.dataset.content = signature;
      btn.replaceChildren();
      btn.append(el('span', { class: 'cons-key', text: slot.key }));
      if (!slot.empty) {
        const iconWrap = el('span', { class: 'cons-icon-wrap' }, svgIcon(slot.icon));
        iconWrap.style.setProperty('--tone', slot.tone || '#5fe0ff');
        btn.append(iconWrap);
        btn.append(el('span', { class: 'cons-count', text: `×${slot.count}` }));
      } else {
        btn.append(el('span', { class: 'cons-empty-mark', text: '·' }));
      }
    }
    while (slotNodes.length > view.slots.length) slotNodes.pop().remove();
  }

  function render(view) {
    if (!view) return;
    lastView = view;
    if (selected >= view.slotCount) selected = 0;
    renderEffects(view);
    renderBar(view);
    renderDetail(view);
    const active = view.effects.length || view.armor.points > 0;
    root.dataset.active = active ? '1' : '0';
  }

  function showFeedback(fb) {
    if (!fb || !fb.text) return;
    toast.textContent = fb.text;
    toast.dataset.kind = fb.kind || 'neutral';
    toast.dataset.show = '1';
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => { toast.dataset.show = '0'; }, 2200);
  }

  // 满栏选择：不自动决定、不静默丢弃。
  function showFullPrompt(offer, resolve) {
    prompt = { offer, resolve };
    const { incoming, slots } = offer;
    let chosenSlot = -1;

    const list = el('div', { class: 'cons-prompt-slots' });
    for (const s of slots) {
      const b = el('button', {
        type: 'button',
        class: 'cons-prompt-slot',
        onclick: () => { chosenSlot = s.index; [...list.children].forEach((c, i) => c.classList.toggle('sel', i === s.index)); confirmBtn.disabled = false; },
      },
        el('span', { class: 'cons-key', text: String(s.index + 1) }),
        el('span', { text: `${s.name} ×${s.count}` }),
      );
      list.append(b);
    }

    const confirmBtn = el('button', {
      type: 'button', class: 'btn primary', disabled: true,
      onclick: () => {
        if (chosenSlot < 0) return;
        close({ choice: 'replace', slot: chosenSlot });
      },
    }, '用新物品替换选中格');

    const useBtn = el('button', {
      type: 'button', class: 'btn',
      onclick: () => close({ choice: 'useNow' }),
    }, '立即使用 1 个');

    const dropBtn = el('button', {
      type: 'button', class: 'btn',
      onclick: () => close({ choice: 'discard' }),
    }, '放弃新物品');

    const cancelBtn = el('button', {
      type: 'button', class: 'btn ghost',
      onclick: () => close(null),
    }, '取消（稍后决定）');

    function close(choice) {
      modalRoot.replaceChildren();
      modalRoot.dataset.open = '0';
      const cb = prompt && prompt.resolve;
      prompt = null;
      if (typeof cb === 'function') cb(choice);
    }

    const panel = el('div', { class: 'cons-prompt', role: 'dialog', 'aria-modal': 'true', 'aria-label': '背包已满' },
      el('h3', { text: '背包已满' }),
      el('p', { class: 'cons-prompt-line' },
        '新物品：', el('b', { text: `${incoming.name} ×${incoming.count}` }),
        '。选择一个格子替换，旧物品会掉回地面；也可以立即使用或放弃。',
      ),
      list,
      el('div', { class: 'cons-prompt-actions' }, confirmBtn, useBtn, dropBtn, cancelBtn),
    );
    modalRoot.replaceChildren(el('div', { class: 'cons-prompt-backdrop' }), panel);
    modalRoot.dataset.open = '1';
  }

  function hideFullPrompt() {
    if (!prompt) return;
    const cb = prompt.resolve;
    prompt = null;
    modalRoot.replaceChildren();
    modalRoot.dataset.open = '0';
    if (typeof cb === 'function') cb(null);
  }

  function destroy() {
    clearTimeout(feedbackTimer);
    root.remove();
  }

  return { render, showFeedback, showFullPrompt, hideFullPrompt, destroy, get selected() { return selected; } };
}
