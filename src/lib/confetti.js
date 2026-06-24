import confetti from 'canvas-confetti';

const HEART = confetti.shapeFromPath({
  path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
});

const COLORS = ['#ff69b4', '#ff1493', '#ff85a2', '#ff0066', '#ffffff', '#ffb6c1'];
const DEFAULTS = { spread: 360, ticks: 100, gravity: 0.4, decay: 0.94, startVelocity: 20, colors: COLORS };

// A celebratory burst of hearts and confetti, fired when the answer is yes.
// One big center pop, two staggered follow-ups, then a pair of side cannons.
export function fireConfetti() {
  confetti({ ...DEFAULTS, particleCount: 80, scalar: 1.2, shapes: ['circle', 'square'] });
  confetti({ ...DEFAULTS, particleCount: 40, scalar: 1.8, shapes: [HEART] });

  setTimeout(() => {
    confetti({ ...DEFAULTS, particleCount: 50, scalar: 1.0, shapes: ['circle'] });
    confetti({ ...DEFAULTS, particleCount: 25, scalar: 2.0, shapes: [HEART] });
  }, 300);

  setTimeout(() => {
    confetti({ ...DEFAULTS, particleCount: 40, scalar: 1.4, shapes: [HEART, 'circle'] });
  }, 700);

  setTimeout(() => {
    confetti({ ...DEFAULTS, particleCount: 30, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, shapes: [HEART, 'circle'] });
    confetti({ ...DEFAULTS, particleCount: 30, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, shapes: [HEART, 'circle'] });
  }, 500);
}
