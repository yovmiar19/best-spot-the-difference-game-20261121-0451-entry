// Keyboard and pointer input. One-shot presses (start, pause, hint, restart, menu, level
// select) are queued as bit flags and taken once by the loop, so a press between two frames
// is never lost and never counted twice. Canvas clicks are reported as panel coordinates:
// which panel (left/right) and the point inside it, so the game can mirror them.

import { PANEL } from './config.js';

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_HINT = 4;
export const ACTION_RESTART = 8;
export const ACTION_MENU = 16;
export const ACTION_LEVEL_1 = 32;
export const ACTION_LEVEL_2 = 64;
export const ACTION_LEVEL_3 = 128;

const CONFIRM = new Set(['Space', 'Enter']);
const PAUSE = new Set(['KeyP']);
const HINT = new Set(['KeyH']);
const RESTART = new Set(['KeyR']);
const MENU = new Set(['Escape']);

export function createInput(canvas) {
  let actions = 0;
  let click = null;

  window.addEventListener('keydown', (event) => {
    if (CONFIRM.has(event.code)) {
      if (!event.repeat) actions |= ACTION_CONFIRM;
    } else if (PAUSE.has(event.code)) {
      if (!event.repeat) actions |= ACTION_PAUSE;
    } else if (HINT.has(event.code)) {
      if (!event.repeat) actions |= ACTION_HINT;
    } else if (RESTART.has(event.code)) {
      if (!event.repeat) actions |= ACTION_RESTART;
    } else if (MENU.has(event.code)) {
      if (!event.repeat) actions |= ACTION_MENU;
    } else if (event.code === 'Digit1') {
      if (!event.repeat) actions |= ACTION_LEVEL_1;
    } else if (event.code === 'Digit2') {
      if (!event.repeat) actions |= ACTION_LEVEL_2;
    } else if (event.code === 'Digit3') {
      if (!event.repeat) actions |= ACTION_LEVEL_3;
    } else return;
    event.preventDefault();
  });

  canvas.addEventListener('pointerdown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    if (y >= PANEL.y && y <= PANEL.y + PANEL.height) {
      if (x >= PANEL.leftX && x <= PANEL.leftX + PANEL.width) {
        click = { x: x - PANEL.leftX, y: y - PANEL.y };
      } else if (x >= PANEL.rightX && x <= PANEL.rightX + PANEL.width) {
        click = { x: x - PANEL.rightX, y: y - PANEL.y };
      }
    }
    if (!click) actions |= ACTION_CONFIRM;
  });

  return {
    /** The one-shot presses since the last call, as ACTION_* flags. */
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    /** The last click inside a picture panel (panel-local coords), or null. */
    takeClick() {
      const taken = click;
      click = null;
      return taken;
    },
  };
}
