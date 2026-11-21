// Drawing only: the two picture panels, the markers on found differences, the hint ring,
// the miss flash and the title / pause / level-complete / game-over overlays. The canvas is
// a fixed 1280x640 area; the DOM header above it carries the HUD numbers and buttons.
import { FONT, LABEL_Y, PALETTE, PANEL, STAGE } from './config.js';
import { DIFFERENCES, allDifferenceIds } from './differences.js';
import { paintScene } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_LEVEL = 'level';
export const SCREEN_OVER = 'over';

function text(ctx, value, x, y, size, color, align, weight) {
  ctx.font = `${weight ? 'bold ' : ''}${size}px ${FONT}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(value, x, y);
}

function ring(ctx, x, y, r, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
}

function drawMiss(ctx, miss) {
  if (!miss) return;
  const { x, y } = miss;
  ctx.strokeStyle = PALETTE.missX;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 12);
  ctx.lineTo(x + 12, y + 12);
  ctx.moveTo(x + 12, y - 12);
  ctx.lineTo(x - 12, y + 12);
  ctx.stroke();
}

/** The green ring + number on a found difference, drawn on both panels. */
function drawFoundMarkers(ctx, sceneId, found, hint, now) {
  const list = DIFFERENCES[sceneId];
  list.forEach((diff, index) => {
    if (!found.has(diff.id)) return;
    for (const baseX of [PANEL.leftX, PANEL.rightX]) {
      const x = baseX + diff.x;
      const y = PANEL.y + diff.y;
      ctx.fillStyle = PALETTE.foundFill;
      ctx.beginPath();
      ctx.arc(x, y, diff.r, 0, Math.PI * 2);
      ctx.fill();
      ring(ctx, x, y, diff.r, PALETTE.foundRing, 4);
      text(ctx, String(index + 1), x, y + 7, 20, PALETTE.foundRing, 'center', true);
    }
  });
  if (hint) {
    // Pulsing amber ring around the hinted difference, on both panels.
    const pulse = 1 + 0.18 * Math.sin(now / 160);
    for (const baseX of [PANEL.leftX, PANEL.rightX]) {
      ring(ctx, baseX + hint.x, PANEL.y + hint.y, hint.r * pulse + 6, PALETTE.hintRing, 4);
    }
  }
}

function drawPanelFrame(ctx, x, label, color) {
  ctx.strokeStyle = PALETTE.frameEdge;
  ctx.lineWidth = 4;
  ctx.strokeRect(x - 2, PANEL.y - 2, PANEL.width + 4, PANEL.height + 4);
  text(ctx, label, x + PANEL.width / 2, LABEL_Y, 24, color, 'center', true);
}

function drawOverlay(ctx, title, lines, prompt, accent) {
  ctx.fillStyle = PALETTE.overlay;
  ctx.fillRect(0, 0, STAGE.width, STAGE.height);
  const boxW = 760;
  const boxH = 150 + lines.length * 34;
  const boxX = (STAGE.width - boxW) / 2;
  const boxY = (STAGE.height - boxH) / 2;
  ctx.fillStyle = '#27435c';
  ctx.fillRect(boxX, boxY, boxW, boxH);
  ctx.strokeStyle = PALETTE.frameEdge;
  ctx.lineWidth = 3;
  ctx.strokeRect(boxX, boxY, boxW, boxH);
  text(ctx, title, STAGE.width / 2, boxY + 64, 44, accent, 'center', true);
  lines.forEach((line, i) => text(ctx, line, STAGE.width / 2, boxY + 108 + i * 34, 21, PALETTE.panelMuted, 'center'));
  text(ctx, prompt, STAGE.width / 2, boxY + boxH - 28, 22, PALETTE.accent, 'center', true);
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const rightDiffs = new Map();

  function drawPanels(state, now) {
    const sceneId = state.sceneId;
    let all = rightDiffs.get(sceneId);
    if (!all) {
      all = allDifferenceIds(sceneId);
      rightDiffs.set(sceneId, all);
    }
    ctx.save();
    ctx.translate(PANEL.leftX, PANEL.y);
    paintScene(ctx, sceneId, PANEL.width, PANEL.height, new Set());
    ctx.restore();
    ctx.save();
    ctx.translate(PANEL.rightX, PANEL.y);
    paintScene(ctx, sceneId, PANEL.width, PANEL.height, all);
    ctx.restore();
    drawPanelFrame(ctx, PANEL.leftX, '◀  PICTURE A', PALETTE.labelLeft);
    drawPanelFrame(ctx, PANEL.rightX, 'PICTURE B  ▶', PALETTE.labelRight);
    drawFoundMarkers(ctx, sceneId, state.found, state.hint, now);
    drawMiss(ctx, state.miss);
  }

  /** Paint one frame for the given screen. `state` carries the level, found set and effects. */
  function draw(state, screen, now) {
    ctx.clearRect(0, 0, STAGE.width, STAGE.height);
    ctx.fillStyle = PALETTE.backdrop;
    ctx.fillRect(0, 0, STAGE.width, STAGE.height);
    if (screen === SCREEN_TITLE) {
      drawPanels(state, now);
      drawOverlay(
        ctx,
        'HARBOR SPOT',
        [
          'Two pictures, seven differences. Click a difference on either picture.',
          'A green ring marks every find. A wrong click costs 5 seconds.',
          'Three scenes: Harbor Sunset · Cozy Café · Night Garden.',
          `Best total score: ${state.best}`,
        ],
        'Click anywhere or press Space to start',
        PALETTE.accent,
      );
      return;
    }
    drawPanels(state, now);
    if (screen === SCREEN_PAUSED) {
      drawOverlay(ctx, 'PAUSED', ['The clock is stopped. The differences will wait.'], 'Press P or click to resume', PALETTE.accent);
    } else if (screen === SCREEN_LEVEL) {
      drawOverlay(
        ctx,
        `LEVEL ${state.level} CLEAR!`,
        [`All 7 differences found in ${state.levelName}.`, `Time bonus +${state.levelBonus} · Score ${state.score}`],
        state.lastLevel ? 'Press Space for your final score' : 'Press Space for the next scene',
        PALETTE.good,
      );
    } else if (screen === SCREEN_OVER) {
      const won = state.found.size >= DIFFERENCES[state.sceneId].length && state.level >= 3;
      drawOverlay(
        ctx,
        won ? 'YOU FOUND THEM ALL!' : 'TIME’S UP!',
        won
          ? [`Every difference in all three scenes — sharp eyes!`, `Final score ${state.score} · Best ${state.best}`]
          : [`You found ${state.totalFound} of 21 differences.`, `Final score ${state.score} · Best ${state.best}`],
        'Press Space or R to play again',
        won ? PALETTE.good : PALETTE.bad,
      );
    }
  }

  return { draw };
}
