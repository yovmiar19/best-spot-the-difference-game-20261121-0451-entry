// Tiny WebAudio sound effects: no audio files, every sound is a few oscillators.
// A find is a bright rising chime, a miss a dull buzz, a level clear a little arpeggio.

let audioCtx = null;

function context() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

/** Play one short note: sine `freq` Hz for `seconds`, fading out. */
function note(freq, startAt, seconds, volume) {
  const ctx = context();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, ctx.currentTime + startAt);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startAt + seconds);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + startAt);
  osc.stop(ctx.currentTime + startAt + seconds + 0.05);
}

export const soundEffects = {
  /** Bright two-note chime on a found difference; higher with the combo. */
  found(combo) {
    const base = 660 + Math.min(combo, 6) * 40;
    note(base, 0, 0.16, 0.25);
    note(base * 1.5, 0.09, 0.22, 0.22);
  },
  /** Dull low buzz on a wrong click. */
  miss() {
    note(160, 0, 0.18, 0.2);
    note(120, 0.02, 0.2, 0.18);
  },
  /** Soft pluck when a hint is used. */
  hint() {
    note(880, 0, 0.12, 0.18);
    note(1174, 0.07, 0.16, 0.15);
  },
  /** Rising arpeggio when a level is cleared. */
  levelClear() {
    [523, 659, 784, 1046].forEach((freq, i) => note(freq, i * 0.11, 0.22, 0.22));
  },
  /** Short fanfare when the whole hunt is won. */
  win() {
    [523, 659, 784, 1046, 1318].forEach((freq, i) => note(freq, i * 0.12, 0.3, 0.22));
  },
  /** Sad two-note fall when time runs out. */
  lose() {
    note(392, 0, 0.25, 0.2);
    note(262, 0.2, 0.4, 0.2);
  },
};
