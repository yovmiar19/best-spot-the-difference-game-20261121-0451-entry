// Scene painters: one function per scene, all art drawn in code with canvas 2D — no images.
// Each painter draws into a 600x480 panel. `diffs` is the set of difference ids that are
// ACTIVE on this panel (empty for the left panel, all seven for the right one), so the two
// panels always line up pixel-perfect and only the differences differ.

function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function poly(ctx, points, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function gull(ctx, x, y, s, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - 9 * s, y);
  ctx.quadraticCurveTo(x - 4 * s, y - 7 * s, x, y);
  ctx.quadraticCurveTo(x + 4 * s, y - 7 * s, x + 9 * s, y);
  ctx.stroke();
}

function drawCat(ctx, x, y, s, body, awake) {
  // Sitting cat, side view, facing right.
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(x, y, 20 * s, 15 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  circle(ctx, x + 14 * s, y - 14 * s, 11 * s, body); // head
  poly(ctx, [[x + 6 * s, y - 20 * s], [x + 10 * s, y - 30 * s], [x + 14 * s, y - 21 * s]], body); // ears
  poly(ctx, [[x + 15 * s, y - 21 * s], [x + 19 * s, y - 30 * s], [x + 23 * s, y - 20 * s]], body);
  if (awake) {
    circle(ctx, x + 17 * s, y - 16 * s, 2 * s, '#1d2b3a'); // open eye
    ctx.strokeStyle = body;
    ctx.lineWidth = 3 * s;
    ctx.beginPath();
    ctx.moveTo(x - 18 * s, y - 2 * s);
    ctx.quadraticCurveTo(x - 30 * s, y - 14 * s, x - 26 * s, y - 26 * s); // tail up
    ctx.stroke();
  } else {
    ctx.strokeStyle = '#1d2b3a';
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(x + 14 * s, y - 16 * s);
    ctx.quadraticCurveTo(x + 17 * s, y - 14 * s, x + 20 * s, y - 16 * s); // closed eye
    ctx.stroke();
    ctx.strokeStyle = body;
    ctx.lineWidth = 3 * s;
    ctx.beginPath();
    ctx.moveTo(x - 18 * s, y + 4 * s);
    ctx.quadraticCurveTo(x - 28 * s, y + 10 * s, x - 20 * s, y + 12 * s); // tail curled
    ctx.stroke();
  }
}

/** Level 1 — a little harbor at sunset: lighthouse, boats, a dock, gulls and a cat. */
function paintHarbor(ctx, w, h, diffs) {
  const has = (id) => diffs.has(id);
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#ff9d5c');
  sky.addColorStop(0.55, '#ff7d9c');
  sky.addColorStop(1, '#7a5aa8');
  rect(ctx, 0, 0, w, 300, sky);
  // Sun, plain on the left, smiling on the right.
  circle(ctx, 480, 90, 38, '#ffd97a');
  if (has('sun-face')) {
    circle(ctx, 468, 84, 4, '#7a4a12');
    circle(ctx, 492, 84, 4, '#7a4a12');
    ctx.strokeStyle = '#7a4a12';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(480, 94, 14, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }
  gull(ctx, 150, 70, 1, '#3a2b4a');
  gull(ctx, 210, 110, 0.8, '#3a2b4a');
  gull(ctx, 400, 60, 0.9, '#3a2b4a');
  if (has('extra-gull')) gull(ctx, 330, 80, 1, '#3a2b4a');

  // Sea.
  rect(ctx, 0, 300, w, h - 300, '#2e6f9e');
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 3;
  for (const [wx, wy, wl] of [[60, 340, 70], [300, 370, 90], [470, 340, 60], [140, 420, 80], [380, 430, 70]]) {
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.quadraticCurveTo(wx + wl / 2, wy - 8, wx + wl, wy);
    ctx.stroke();
  }

  // Lighthouse on the left cliff.
  rect(ctx, 40, 260, 120, 40, '#5c4a3a'); // cliff
  poly(ctx, [[40, 260], [160, 260], [150, 120], [50, 120]], '#f4ead8'); // tower
  rect(ctx, 50, 150, 100, 16, '#e5534b');
  rect(ctx, 50, 200, 100, 16, '#e5534b');
  rect(ctx, 58, 96, 84, 24, '#27435c'); // lamp room
  circle(ctx, 100, 108, 9, '#ffd97a');
  poly(ctx, [[52, 96], [148, 96], [100, 66]], '#e5534b'); // roof
  // Flag on the roof: still on the left, waving the other way on the right.
  ctx.strokeStyle = '#1d2b3a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(100, 66);
  ctx.lineTo(100, 44);
  ctx.stroke();
  poly(ctx, [[100, 44], [124, 50], [100, 57]], '#ffd97a');
  if (has('lighthouse-beam')) {
    const beam = ctx.createLinearGradient(142, 108, 300, 130);
    beam.addColorStop(0, 'rgba(255, 217, 122, 0.85)');
    beam.addColorStop(1, 'rgba(255, 217, 122, 0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(142, 96);
    ctx.lineTo(300, 70);
    ctx.lineTo(300, 150);
    ctx.lineTo(142, 120);
    ctx.closePath();
    ctx.fill();
  }

  // Little house on the right shore.
  rect(ctx, 420, 230, 110, 70, '#f2e3c6');
  poly(ctx, [[410, 230], [540, 230], [475, 190]], '#b5542e');
  rect(ctx, 465, 262, 20, 38, '#7a4a12'); // door
  rect(ctx, 432, 248, 22, 22, '#9fe8ff'); // window 1
  if (!has('house-window')) rect(ctx, 500, 248, 22, 22, '#9fe8ff'); // window 2 (missing on right)

  // Wooden dock.
  rect(ctx, 0, 330, 340, 14, '#8a6a42');
  for (let x = 0; x < 340; x += 34) rect(ctx, x, 330, 3, 14, '#5c4630');
  if (has('dock-cat')) drawCat(ctx, 150, 318, 0.9, '#3a3a3a', false);

  // Boat 1: sail blue on the left, crimson on the right.
  poly(ctx, [[180, 330], [200, 262], [200, 330]], has('sail-color') ? '#c0392b' : '#2e6f9e');
  poly(ctx, [[206, 330], [224, 288], [206, 330]], '#f4ead8');
  ctx.strokeStyle = '#1d2b3a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(200, 262);
  ctx.lineTo(200, 332);
  ctx.stroke();
  poly(ctx, [[168, 330], [238, 330], [226, 352], [180, 352]], '#7a4a12');

  // Boat 2.
  poly(ctx, [[360, 360], [380, 300], [380, 360]], '#3ddc5f');
  poly(ctx, [[386, 360], [402, 322], [386, 360]], '#f4ead8');
  ctx.beginPath();
  ctx.moveTo(380, 300);
  ctx.lineTo(380, 362);
  ctx.stroke();
  poly(ctx, [[348, 360], [414, 360], [402, 380], [360, 380]], '#5c4630');

  // Buoy: there on the left, gone on the right.
  if (!has('buoy-missing')) {
    circle(ctx, 520, 386, 12, '#ff5a4a');
    rect(ctx, 514, 368, 12, 8, '#ff5a4a');
    circle(ctx, 520, 366, 3, '#ffd97a');
  }
}

/** Level 2 — a cozy café interior: window, clock, table, a sleeping cat and plants. */
function paintCafe(ctx, w, h, diffs) {
  const has = (id) => diffs.has(id);
  rect(ctx, 0, 0, w, 360, '#f2dfc0'); // wall
  rect(ctx, 0, 360, w, h - 360, '#8a6a42'); // wooden floor
  for (let y = 380; y < h; y += 24) rect(ctx, 0, y, w, 2, '#6e5232');

  // Window with evening sky and curtains.
  rect(ctx, 60, 60, 150, 170, '#27435c');
  rect(ctx, 72, 72, 126, 146, '#2e6f9e');
  circle(ctx, 160, 120, 18, '#f4ead8');
  circle(ctx, 110, 200, 8, '#ffd97a');
  circle(ctx, 180, 170, 6, '#ffd97a');
  rect(ctx, 60, 60, 22, 170, '#c0392b');
  rect(ctx, 188, 60, 22, 170, '#c0392b');

  // Wall clock: 3:00 on the left, 5:30 on the right.
  circle(ctx, 300, 90, 36, '#f4ead8');
  ctx.strokeStyle = '#1d2b3a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(300, 90, 36, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(300, 90);
  ctx.lineTo(300, 64); // minute hand up (both)
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(300, 90);
  if (has('clock-time')) { ctx.lineTo(288, 112); } else { ctx.lineTo(326, 90); } // hour hand
  ctx.stroke();

  // Framed picture: hanging on the left, blank wall on the right.
  if (!has('picture-missing')) {
    rect(ctx, 452, 62, 88, 66, '#7a4a12');
    rect(ctx, 460, 70, 72, 50, '#9fe8ff');
    poly(ctx, [[470, 112], [492, 84], [512, 112], [524, 96], [524, 120], [470, 120]], '#3ddc5f');
    circle(ctx, 510, 84, 8, '#ffd97a');
  }

  // Hanging lamp: dark on the left, glowing warm on the right.
  ctx.strokeStyle = '#1d2b3a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(250, 0);
  ctx.lineTo(250, 44);
  ctx.stroke();
  if (has('lamp-glow')) {
    const glow = ctx.createRadialGradient(250, 66, 4, 250, 66, 60);
    glow.addColorStop(0, 'rgba(255, 217, 122, 0.7)');
    glow.addColorStop(1, 'rgba(255, 217, 122, 0)');
    circle(ctx, 250, 66, 60, glow);
  }
  poly(ctx, [[232, 44], [268, 44], [258, 70], [242, 70]], has('lamp-glow') ? '#ffd97a' : '#5c7a8a');
  circle(ctx, 250, 76, 7, has('lamp-glow') ? '#fff3c4' : '#3a4a55');

  // Shelf with jars.
  rect(ctx, 430, 200, 130, 10, '#7a4a12');
  rect(ctx, 442, 168, 26, 32, '#c98a5a');
  rect(ctx, 478, 160, 26, 40, '#7a9e5a');
  rect(ctx, 514, 172, 26, 28, '#9e7ab5');

  // Table.
  rect(ctx, 150, 330, 300, 18, '#a9804f');
  rect(ctx, 170, 348, 14, 60, '#7a5a34');
  rect(ctx, 416, 348, 14, 60, '#7a5a34');

  // Plant in a pot: terracotta on the left, teal on the right.
  ctx.strokeStyle = '#3d7a3d';
  ctx.lineWidth = 4;
  for (const [lx, ly] of [[178, 268], [192, 258], [206, 270]]) {
    ctx.beginPath();
    ctx.moveTo(192, 300);
    ctx.quadraticCurveTo(lx, ly + 20, lx, ly);
    ctx.stroke();
  }
  circle(ctx, 178, 262, 10, '#3d7a3d');
  circle(ctx, 206, 264, 10, '#3d7a3d');
  poly(ctx, [[172, 300], [212, 300], [206, 330], [178, 330]], has('pot-color') ? '#2e8b8b' : '#c96a3a');

  // Two cups on the table, plus a third on the right.
  for (const cx of [250, 300]) {
    rect(ctx, cx - 12, 306, 24, 24, '#f4ead8');
    ctx.strokeStyle = '#1d2b3a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx + 14, 318, 7, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
  }
  if (has('extra-cup')) {
    rect(ctx, 348, 306, 24, 24, '#e5534b');
    ctx.strokeStyle = '#1d2b3a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(374, 318, 7, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
  }

  // Plate with a cookie: cookie there on the left, empty plate on the right.
  circle(ctx, 400, 326, 16, '#f4ead8');
  if (!has('cookie-missing')) {
    circle(ctx, 400, 324, 9, '#a9804f');
    circle(ctx, 397, 322, 2, '#5c4630');
    circle(ctx, 403, 326, 2, '#5c4630');
  }

  // Rug and the café cat: asleep on the left, awake on the right.
  ctx.fillStyle = '#b5542e';
  ctx.beginPath();
  ctx.ellipse(440, 420, 90, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd97a';
  ctx.beginPath();
  ctx.ellipse(440, 420, 70, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  drawCat(ctx, 440, 402, 1, '#e8a34c', has('cat-awake'));
}

/** Level 3 — a night garden: pond, frog, tulips, lantern and fireflies. */
function paintGarden(ctx, w, h, diffs) {
  const has = (id) => diffs.has(id);
  const sky = ctx.createLinearGradient(0, 0, 0, 320);
  sky.addColorStop(0, '#0b1e3a');
  sky.addColorStop(1, '#27435c');
  rect(ctx, 0, 0, w, 320, sky);
  // Stars.
  for (const [sx, sy, sr] of [[80, 50, 2], [160, 90, 2.5], [240, 40, 2], [330, 70, 2.5], [420, 40, 2], [540, 130, 2], [60, 150, 2], [270, 120, 1.5], [460, 160, 2]]) {
    circle(ctx, sx, sy, sr, '#f4ead8');
  }
  // Moon: full on the left, crescent on the right.
  circle(ctx, 500, 80, 32, '#f4ead8');
  if (has('moon-phase')) circle(ctx, 514, 72, 28, '#0b1e3a');
  circle(ctx, 488, 70, 5, '#d8cbb0');
  circle(ctx, 508, 92, 4, '#d8cbb0');

  // Tree on the left.
  rect(ctx, 52, 170, 26, 150, '#5c4630');
  circle(ctx, 65, 150, 62, '#2e5a3a');
  circle(ctx, 20, 180, 40, '#3d7a3d');
  circle(ctx, 112, 180, 42, '#3d7a3d');
  // Lantern hanging from a branch: dark on the left, lit on the right.
  ctx.strokeStyle = '#1d2b3a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(300, 96);
  ctx.lineTo(300, 122);
  ctx.stroke();
  if (has('lantern-lit')) {
    const glow = ctx.createRadialGradient(300, 142, 4, 300, 142, 55);
    glow.addColorStop(0, 'rgba(255, 217, 122, 0.75)');
    glow.addColorStop(1, 'rgba(255, 217, 122, 0)');
    circle(ctx, 300, 142, 55, glow);
  }
  rect(ctx, 286, 122, 28, 40, has('lantern-lit') ? '#ffd97a' : '#5c7a8a');
  rect(ctx, 290, 116, 20, 6, '#1d2b3a');

  // Grass.
  rect(ctx, 0, 320, w, h - 320, '#2e5a3a');
  rect(ctx, 0, 320, w, 8, '#3d7a3d');
  // Stone path.
  for (const [px, py] of [[250, 350], [280, 390], [250, 430], [290, 460]]) {
    ctx.fillStyle = '#b8b0a0';
    ctx.beginPath();
    ctx.ellipse(px, py, 26, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Pond with lily pads bottom-left.
  ctx.fillStyle = '#2e6f9e';
  ctx.beginPath();
  ctx.ellipse(120, 410, 110, 46, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3d7a3d';
  ctx.beginPath();
  ctx.ellipse(80, 400, 34, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(160, 425, 30, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  // Frog: sitting on a pad on the left, gone on the right.
  if (!has('frog-missing')) {
    circle(ctx, 118, 398, 16, '#5aa844');
    circle(ctx, 108, 384, 7, '#5aa844');
    circle(ctx, 128, 384, 7, '#5aa844');
    circle(ctx, 108, 383, 2.5, '#1d2b3a');
    circle(ctx, 128, 383, 2.5, '#1d2b3a');
  }

  // Tulips: the middle one is red on the left, blue on the right.
  const tulips = [[230, 400, '#e5534b'], [300, 410, '#e5534b'], [370, 400, '#ffd97a'], [430, 412, '#e5534b']];
  for (const [tx, ty, tc] of tulips) {
    ctx.strokeStyle = '#3d7a3d';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx, ty - 34);
    ctx.stroke();
    const color = tx === 300 && has('flower-color') ? '#4f7de0' : tc;
    poly(ctx, [[tx - 10, ty - 34], [tx - 10, ty - 52], [tx, ty - 44], [tx + 10, ty - 52], [tx + 10, ty - 34]], color);
  }

  // Mushrooms: a pair on the right side, plus a third on the right panel.
  for (const [mx, my, ms] of [[480, 400, 1], [510, 415, 0.8]]) {
    rect(ctx, mx - 4 * ms, my - 16 * ms, 8 * ms, 16 * ms, '#f4ead8');
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.arc(mx, my - 16 * ms, 14 * ms, Math.PI, 0);
    ctx.fill();
    circle(ctx, mx - 6 * ms, my - 22 * ms, 2, '#f4ead8');
    circle(ctx, mx + 5 * ms, my - 26 * ms, 2, '#f4ead8');
  }
  if (has('mushroom-extra')) {
    rect(ctx, 548, 404, 7, 14, '#f4ead8');
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.arc(551, 404, 12, Math.PI, 0);
    ctx.fill();
  }

  // Fireflies: four on the left, a fifth on the right.
  for (const [fx, fy] of [[200, 200], [380, 180], [450, 240], [150, 260]]) {
    const glow = ctx.createRadialGradient(fx, fy, 1, fx, fy, 12);
    glow.addColorStop(0, 'rgba(220, 255, 120, 0.95)');
    glow.addColorStop(1, 'rgba(220, 255, 120, 0)');
    circle(ctx, fx, fy, 12, glow);
    circle(ctx, fx, fy, 3, '#dcff78');
  }
  if (has('firefly-extra')) {
    const glow = ctx.createRadialGradient(200, 150, 1, 200, 150, 12);
    glow.addColorStop(0, 'rgba(220, 255, 120, 0.95)');
    glow.addColorStop(1, 'rgba(220, 255, 120, 0)');
    circle(ctx, 200, 150, 12, glow);
    circle(ctx, 200, 150, 3, '#dcff78');
  }

  // Butterfly near the tulips: orange on the left, purple on the right.
  const wing = has('butterfly') ? '#9e7ab5' : '#ff9d5c';
  ctx.fillStyle = wing;
  ctx.beginPath();
  ctx.ellipse(338, 292, 12, 9, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(362, 292, 12, 9, 0.5, 0, Math.PI * 2);
  ctx.fill();
  rect(ctx, 348, 288, 4, 16, '#1d2b3a');
}

/** Paint one scene into a panel. `diffs` holds the active difference ids for that panel. */
export function paintScene(ctx, sceneId, w, h, diffs) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  ctx.clip();
  if (sceneId === 'harbor') paintHarbor(ctx, w, h, diffs);
  else if (sceneId === 'cafe') paintCafe(ctx, w, h, diffs);
  else paintGarden(ctx, w, h, diffs);
  ctx.restore();
}
