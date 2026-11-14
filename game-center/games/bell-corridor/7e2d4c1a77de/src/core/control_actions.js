import { DEFAULT_BINDINGS, actionLabel } from './control_bindings.js';

// Legacy probes supply tiny input fakes; the real Input always owns resolution.
// The fallback is never an extra hard-coded binding alongside a user's mapping.
function legacyToken(input, token, edge) {
  if (token.startsWith('Mouse')) {
    const side = ['left', 'middle', 'right'][Number(token.slice(5))];
    return edge ? !!(input?.mousePressed?.[side] || (side === 'left' ? input?.clickL : side === 'right' ? input?.clickR : false)) : !!input?.mouse?.[side];
  }
  if (token.startsWith('Wheel')) return edge && (token === 'WheelUp' ? input?.wheel < 0 : input?.wheel > 0);
  return edge ? !!input?.hit?.(token) : !!input?.down?.(token);
}
export function actionHit(input, action) {
  if (typeof input?.actionHit === 'function') return input.actionHit(action);
  if (input?.blocked || input?.capturing) return false;
  return (DEFAULT_BINDINGS.classic[action] || []).some(token => legacyToken(input, token, true));
}
export function actionDown(input, action) {
  if (typeof input?.actionDown === 'function') return input.actionDown(action);
  if (input?.blocked || input?.capturing) return false;
  return (DEFAULT_BINDINGS.classic[action] || []).some(token => legacyToken(input, token, false));
}
export function controlLabel(input, action) { return input?.label?.(action) || actionLabel(action); }
export function editingTarget(target) { return !!target?.closest?.('input, textarea, select, [contenteditable="true"]'); }

export function handlePauseAction(game) {
  if(!game)return false;
  if(game.touch?.editMode){game.endLayoutEdit(true);return true;}
  if(game.closeTopPanel())return true;
  if(game.state==='play'){game.setPaused(!game.paused);return true;}
  if(game.state==='victory'||game.state==='dead'){game.setBuild(false);return true;}
  return false;
}

// Global actions share the same mapping as combat. Menus own fixed navigation
// and Escape; neither rebinding nor entering text can trigger these shortcuts.
export function handleControlShortcut(game, event) {
  if (!game || event.defaultPrevented || game.input?.capturing || (event.key !== 'Escape' && editingTarget(event.target))) return;
  const k = event.key;
  if (game.panelOpen() && k !== 'Escape') {
    if (game.topModal() === 'build' && !event.repeat && game.input?.matchesEvent('build', event)) {
      event.preventDefault(); game.setBuild(false);
    }
    return;
  }
  if (k === 'Escape') {
    event.preventDefault();
    if (!event.repeat) handlePauseAction(game);
    return;
  }
  if (event.repeat) return;
  const matches = action => game.input?.matchesEvent(action, event);
  if (matches('build')) {
    event.preventDefault();
    if (['play', 'victory', 'dead'].includes(game.state)) game.setBuild();
  } else if (!game.input?.blocked && matches('cycle_active')) {
    event.preventDefault(); game.cycleActive(1);
  } else if (!game.input?.blocked && matches('minimap')) {
    event.preventDefault(); game.toggleMinimapBig();
  } else if (k.toLowerCase() === 'r' && ['dead', 'victory'].includes(game.state) && !game.buildOpen) {
    event.preventDefault(); game.startNewRun();
  }
}
