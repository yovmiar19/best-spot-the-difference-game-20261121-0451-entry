// Boot and the one loop: input is read every frame, the clock ticks in real time, and the
// renderer paints the two panels plus the overlay for the current screen. Screens: title,
// play, paused, level-clear and game over. The HUD lives in the DOM (index.html) and is
// updated here whenever its numbers change.
//
// ?shot=start|play|end (with &seed=N, ignored — the scenes are fixed) stages that scene
// instead of running the loop, paints it twice and sets window.__shotReady for a screenshot.
import {
  BEST_KEY,
  DIFFS_PER_LEVEL,
  FIND_POINTS,
  COMBO_STEP,
  HINTS_PER_LEVEL,
  LEVELS,
  LEVEL_BONUS_PER_SECOND,
  WRONG_CLICK_PENALTY_SEC,
} from './config.js';
import { differenceAt, DIFFERENCES } from './differences.js';
import { soundEffects } from './audio.js';
import {
  ACTION_CONFIRM,
  ACTION_HINT,
  ACTION_LEVEL_1,
  ACTION_LEVEL_2,
  ACTION_LEVEL_3,
  ACTION_MENU,
  ACTION_PAUSE,
  ACTION_RESTART,
  createInput,
} from './input.js';
import { createRenderer, SCREEN_LEVEL, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const canvas = document.getElementById('game');
const hud = {
  level: document.getElementById('hud-level'),
  scene: document.getElementById('hud-scene'),
  found: document.getElementById('hud-found'),
  time: document.getElementById('hud-time'),
  timePill: document.getElementById('hud-time-pill'),
  score: document.getElementById('hud-score'),
  combo: document.getElementById('hud-combo'),
  hints: document.getElementById('hud-hints'),
  hintBtn: document.getElementById('btn-hint'),
  pauseBtn: document.getElementById('btn-pause'),
  restartBtn: document.getElementById('btn-restart'),
  menuBtn: document.getElementById('btn-menu'),
};
const toast = document.getElementById('toast');

const renderer = createRenderer(canvas);

/** Fresh per-level state; the total score and best carry across levels. */
function freshLevel(levelIndex) {
  const level = LEVELS[levelIndex];
  return {
    level: levelIndex + 1,
    levelName: level.name,
    sceneId: level.scene,
    timeLeft: level.time,
    found: new Set(),
    hintsLeft: HINTS_PER_LEVEL,
    hint: null,
    miss: null,
    missAt: 0,
    combo: 0,
    levelBonus: 0,
    lastLevel: levelIndex >= LEVELS.length - 1,
  };
}

const state = {
  ...freshLevel(0),
  score: 0,
  totalFound: 0,
  best: readBest(),
  screen: SCREEN_TITLE,
};

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

let lastHud = '';
function updateHud() {
  const text = [
    state.level, state.levelName, state.found.size, formatTime(state.timeLeft),
    state.score, state.combo, state.hintsLeft, state.screen,
  ].join('|');
  if (text === lastHud) return;
  lastHud = text;
  hud.level.textContent = `${state.level} / ${LEVELS.length}`;
  hud.scene.textContent = state.levelName;
  hud.found.textContent = `${state.found.size} / ${DIFFS_PER_LEVEL}`;
  hud.time.textContent = formatTime(state.timeLeft);
  hud.timePill.classList.toggle('warn', state.timeLeft <= 15 && state.screen === SCREEN_PLAY);
  hud.score.textContent = String(state.score);
  hud.combo.textContent = `×${1 + state.combo}`;
  hud.hints.textContent = String(state.hintsLeft);
  hud.hintBtn.disabled = state.screen !== SCREEN_PLAY || state.hintsLeft <= 0;
  hud.pauseBtn.disabled = state.screen !== SCREEN_PLAY && state.screen !== SCREEN_PAUSED;
  hud.pauseBtn.textContent = state.screen === SCREEN_PAUSED ? '▶ Resume (P)' : '⏸ Pause (P)';
}

function showToast(message) {
  toast.textContent = message;
  toast.style.opacity = '1';
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.style.opacity = '0';
  }, 1400);
}

function startLevel(levelIndex) {
  Object.assign(state, freshLevel(levelIndex));
  state.screen = SCREEN_PLAY;
  updateHud();
}

function startGame() {
  state.score = 0;
  state.totalFound = 0;
  startLevel(0);
}

function endGame(won) {
  state.screen = SCREEN_OVER;
  if (state.score > state.best) {
    state.best = state.score;
    saveBest(state.best);
  }
  if (won) soundEffects.win();
  else soundEffects.lose();
  updateHud();
}

function levelClear() {
  state.levelBonus = Math.round(state.timeLeft) * LEVEL_BONUS_PER_SECOND;
  state.score += state.levelBonus;
  state.screen = SCREEN_LEVEL;
  soundEffects.levelClear();
  updateHud();
}

function useHint() {
  if (state.screen !== SCREEN_PLAY || state.hintsLeft <= 0) return;
  const remaining = DIFFERENCES[state.sceneId].filter((d) => !state.found.has(d.id));
  if (remaining.length === 0) return;
  state.hintsLeft -= 1;
  state.hint = remaining[Math.floor(Math.random() * remaining.length)];
  state.combo = 0;
  soundEffects.hint();
  window.clearTimeout(useHint.timer);
  useHint.timer = window.setTimeout(() => {
    state.hint = null;
  }, 2600);
  updateHud();
}

function handleClick(point, now) {
  if (state.screen !== SCREEN_PLAY) return;
  const diff = differenceAt(state.sceneId, state.found, point.x, point.y);
  if (diff) {
    state.found.add(diff.id);
    state.totalFound += 1;
    state.combo += 1;
    state.score += FIND_POINTS + (state.combo - 1) * COMBO_STEP;
    state.hint = null;
    state.miss = null;
    soundEffects.found(state.combo);
    showToast(diff.label);
    if (state.found.size >= DIFFS_PER_LEVEL) levelClear();
  } else {
    state.miss = point;
    state.missAt = now;
    state.combo = 0;
    state.timeLeft = Math.max(0, state.timeLeft - WRONG_CLICK_PENALTY_SEC);
    soundEffects.miss();
    showToast(`Not there! −${WRONG_CLICK_PENALTY_SEC} seconds`);
    if (state.timeLeft <= 0) endGame(false);
  }
  updateHud();
}

function runShot(name) {
  const staged = stageShot(name, state);
  let painted = 0;
  function paint() {
    renderer.draw(state, staged.screen, performance.now());
    updateHud();
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let last = performance.now();

  function handleActions(now) {
    const actions = input.takeActions();
    if (actions & ACTION_MENU) {
      if (state.screen !== SCREEN_TITLE) {
        state.screen = SCREEN_TITLE;
        updateHud();
      }
    } else if (actions & ACTION_RESTART) {
      startGame();
    } else if (actions & ACTION_LEVEL_1) {
      startLevel(0);
    } else if (actions & ACTION_LEVEL_2) {
      startLevel(1);
    } else if (actions & ACTION_LEVEL_3) {
      startLevel(2);
    } else if (actions & ACTION_HINT) {
      useHint();
    } else if (actions & ACTION_PAUSE) {
      if (state.screen === SCREEN_PLAY) {
        state.screen = SCREEN_PAUSED;
        updateHud();
      } else if (state.screen === SCREEN_PAUSED) {
        state.screen = SCREEN_PLAY;
        updateHud();
      }
    } else if (actions & ACTION_CONFIRM) {
      if (state.screen === SCREEN_TITLE) startGame();
      else if (state.screen === SCREEN_PAUSED) {
        state.screen = SCREEN_PLAY;
        updateHud();
      } else if (state.screen === SCREEN_LEVEL) {
        if (state.lastLevel) endGame(true);
        else startLevel(state.level);
      } else if (state.screen === SCREEN_OVER) startGame();
    }
    const click = input.takeClick();
    if (click) handleClick(click, now);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.25);
    last = now;
    handleActions(now);
    if (state.screen === SCREEN_PLAY) {
      state.timeLeft -= dt;
      if (state.miss && now - state.missAt > 700) state.miss = null;
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        endGame(false);
      }
      updateHud();
    }
    renderer.draw(state, state.screen, now);
  }

  hud.hintBtn.addEventListener('click', useHint);
  hud.pauseBtn.addEventListener('click', () => {
    if (state.screen === SCREEN_PLAY) {
      state.screen = SCREEN_PAUSED;
      updateHud();
    } else if (state.screen === SCREEN_PAUSED) {
      state.screen = SCREEN_PLAY;
      updateHud();
    }
  });
  hud.restartBtn.addEventListener('click', startGame);
  hud.menuBtn.addEventListener('click', () => {
    state.screen = SCREEN_TITLE;
    updateHud();
  });

  // Leaving the tab pauses a running game rather than letting the clock run unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.screen === SCREEN_PLAY) {
      state.screen = SCREEN_PAUSED;
      updateHud();
    }
  });

  updateHud();
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
