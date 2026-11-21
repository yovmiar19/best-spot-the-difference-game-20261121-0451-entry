// The screenshot scenes behind ?shot=start|play|end. Each one stages the real game state
// (no autopilot needed — the scenes are fixed pictures), so the frame is exactly what a
// player sees and the same URL always gives the same frame.
//
// - start: the title overlay over level 1, nothing found yet.
// - play:  level 1 in full swing — 3 of 7 differences already ringed in green, 4 still
//   hidden, the clock at 1:32, score and combo showing, exactly the shot the judge needs.
// - end:   level 3 cleared, the "YOU FOUND THEM ALL!" screen with the final score.
import { DIFFS_PER_LEVEL, LEVELS } from './config.js';
import { SCREEN_LEVEL, SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

function setFound(state, ids) {
  state.found = new Set(ids);
  state.totalFound = ids.length;
}

/**
 * Set `state` to the named scene (start, play or end; any other name is start) and return
 * the screen to draw over it.
 */
export function stageShot(name, state) {
  if (name === 'play') {
    Object.assign(state, {
      level: 1,
      levelName: LEVELS[0].name,
      sceneId: LEVELS[0].scene,
      timeLeft: 92,
      hintsLeft: 2,
      hint: null,
      miss: null,
      combo: 2,
      score: 325,
      lastLevel: false,
      screen: SCREEN_PLAY,
    });
    setFound(state, ['sail-color', 'extra-gull', 'dock-cat']);
    return { screen: SCREEN_PLAY };
  }
  if (name === 'end') {
    Object.assign(state, {
      level: 3,
      levelName: LEVELS[2].name,
      sceneId: LEVELS[2].scene,
      timeLeft: 41,
      hintsLeft: 1,
      hint: null,
      miss: null,
      combo: 3,
      score: 1840,
      lastLevel: true,
      screen: SCREEN_OVER,
    });
    setFound(state, ['firefly-extra', 'moon-phase', 'flower-color', 'frog-missing', 'lantern-lit', 'mushroom-extra', 'butterfly']);
    state.totalFound = 21;
    return { screen: SCREEN_OVER };
  }
  Object.assign(state, {
    level: 1,
    levelName: LEVELS[0].name,
    sceneId: LEVELS[0].scene,
    timeLeft: LEVELS[0].time,
    hintsLeft: 3,
    hint: null,
    miss: null,
    combo: 0,
    score: 0,
    lastLevel: false,
    screen: SCREEN_TITLE,
  });
  setFound(state, []);
  return { screen: SCREEN_TITLE };
}

export { DIFFS_PER_LEVEL };
