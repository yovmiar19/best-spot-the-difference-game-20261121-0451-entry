// Every tuning number and colour in one place. The canvas is a fixed 1280x640 logical area:
// two 600x480 picture panels side by side with a gap, plus a strip for panel labels.
// The DOM header above the canvas carries the HUD (level, found, time, score, buttons).

export const STAGE = { width: 1280, height: 640 };
export const PANEL = { width: 600, height: 480, leftX: 20, rightX: 660, y: 80 };
export const LABEL_Y = 58;

export const DIFFS_PER_LEVEL = 7;
export const HINTS_PER_LEVEL = 3;
export const WRONG_CLICK_PENALTY_SEC = 5;
export const FIND_POINTS = 100;
export const COMBO_STEP = 25;
export const LEVEL_BONUS_PER_SECOND = 10;

export const LEVELS = [
  { name: 'Harbor Sunset', time: 120, scene: 'harbor' },
  { name: 'Cozy Café', time: 105, scene: 'cafe' },
  { name: 'Night Garden', time: 90, scene: 'garden' },
];

export const PALETTE = {
  backdrop: '#0e1a26',
  frame: '#27435c',
  frameEdge: '#4d7ba3',
  labelLeft: '#ffd97a',
  labelRight: '#9fe8ff',
  foundRing: '#3ddc5f',
  foundFill: 'rgba(61, 220, 95, 0.18)',
  hintRing: '#ffd97a',
  missX: '#ff5a4a',
  panelTitle: '#f4ead8',
  panelMuted: '#cfe0ea',
  overlay: 'rgba(10, 22, 34, 0.82)',
  accent: '#ffd97a',
  good: '#3ddc5f',
  bad: '#ff5a4a',
};

export const FONT = '"Trebuchet MS", "Segoe UI", Verdana, sans-serif';

/** Where the best total score is kept between visits (this browser only). */
export const BEST_KEY = 'harbor-spot.best';
