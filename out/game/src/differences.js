// The seven differences of each level: where they are in panel coordinates (600x480),
// how big a click may be, and the short label shown when one is found. Coordinates must
// match the spots the scene painters change in scenes.js.

export const DIFFERENCES = {
  harbor: [
    { id: 'sail-color', x: 200, y: 300, r: 36, label: 'Boat sail changed colour!' },
    { id: 'lighthouse-beam', x: 170, y: 108, r: 42, label: 'Lighthouse beam switched on!' },
    { id: 'extra-gull', x: 330, y: 80, r: 24, label: 'An extra gull in the sky!' },
    { id: 'buoy-missing', x: 520, y: 382, r: 24, label: 'The buoy vanished!' },
    { id: 'dock-cat', x: 150, y: 312, r: 26, label: 'A cat appeared on the dock!' },
    { id: 'sun-face', x: 480, y: 90, r: 32, label: 'The sun is smiling!' },
    { id: 'house-window', x: 511, y: 259, r: 22, label: 'A house window is missing!' },
  ],
  cafe: [
    { id: 'cat-awake', x: 440, y: 396, r: 32, label: 'The cat woke up!' },
    { id: 'pot-color', x: 192, y: 312, r: 24, label: 'The plant pot changed colour!' },
    { id: 'extra-cup', x: 360, y: 318, r: 22, label: 'An extra cup on the table!' },
    { id: 'clock-time', x: 300, y: 90, r: 36, label: 'The clock shows a different time!' },
    { id: 'picture-missing', x: 496, y: 95, r: 34, label: 'The picture is gone!' },
    { id: 'lamp-glow', x: 250, y: 62, r: 30, label: 'The lamp is glowing!' },
    { id: 'cookie-missing', x: 400, y: 324, r: 20, label: 'The cookie was eaten!' },
  ],
  garden: [
    { id: 'firefly-extra', x: 200, y: 150, r: 20, label: 'An extra firefly!' },
    { id: 'moon-phase', x: 500, y: 80, r: 34, label: 'The moon changed phase!' },
    { id: 'flower-color', x: 300, y: 392, r: 26, label: 'A tulip changed colour!' },
    { id: 'frog-missing', x: 118, y: 394, r: 28, label: 'The frog hopped away!' },
    { id: 'lantern-lit', x: 300, y: 142, r: 30, label: 'The lantern is lit!' },
    { id: 'mushroom-extra', x: 551, y: 404, r: 22, label: 'An extra mushroom!' },
    { id: 'butterfly', x: 350, y: 294, r: 26, label: 'The butterfly changed colour!' },
  ],
};

/** All difference ids of a scene, as a Set — the right panel paints with all of them on. */
export function allDifferenceIds(sceneId) {
  return new Set(DIFFERENCES[sceneId].map((d) => d.id));
}

/** The still-unfound difference within `radius` of a panel point, or null. */
export function differenceAt(sceneId, found, x, y) {
  for (const diff of DIFFERENCES[sceneId]) {
    if (found.has(diff.id)) continue;
    const dx = x - diff.x;
    const dy = y - diff.y;
    if (dx * dx + dy * dy <= diff.r * diff.r) return diff;
  }
  return null;
}
