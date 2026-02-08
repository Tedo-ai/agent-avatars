import { seededRandom } from '../utils/hash.js';
import { generatePalette, hslToRgb, mapLuminance } from '../utils/color.js';
import { createCanvasManager } from '../canvas-manager.js';

export function create(container, seed, size, mode) {
  const palette = generatePalette(seed, mode);
  const { hue, sat, bgRgb } = palette;

  const rng = seededRandom(seed);
  const ratios = [[1,2],[2,3],[3,4],[1,3],[3,5],[2,5],[1,4],[4,5]];
  const pick = ratios[Math.floor(rng() * ratios.length)];
  const swap = rng() > 0.5;
  const params = {
    freqX: swap ? pick[1] : pick[0],
    freqY: swap ? pick[0] : pick[1],
    phaseX: rng() * Math.PI * 2,
    phaseY: rng() * Math.PI * 2,
    decay: 0.006 + rng() * 0.006,
    drift: 0.007 + rng() * 0.008,
  };

  function drawFn(canvas, t, energy) {
    const ctx = canvas.getContext('2d');
    const res = canvas.width;
    ctx.fillStyle = `rgb(${bgRgb[0]},${bgRgb[1]},${bgRgb[2]})`;
    ctx.fillRect(0, 0, res, res);

    const cx = res / 2;
    const cy = res / 2;
    const maxR = res / 2 - 4;
    const driftAmount = t * energy * params.drift;
    const rgb1 = hslToRgb(hue / 360, sat / 100, mapLuminance(0.65, mode));
    const rgb2 = hslToRgb(hue / 360, sat / 100, mapLuminance(0.52, mode));
    const steps = 400;

    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const fraction = i / steps;
      const angle = fraction * Math.PI * 2 * 3;
      const damping = Math.exp(-fraction * params.decay * 200);
      const x = cx + Math.sin(angle * params.freqX + params.phaseX + driftAmount) * maxR * 0.8 * damping;
      const y = cy + Math.sin(angle * params.freqY + params.phaseY + driftAmount * 1.3) * maxR * 0.8 * damping;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(${rgb1[0]},${rgb1[1]},${rgb1[2]},0.7)`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const fraction = i / steps;
      const angle = fraction * Math.PI * 2 * 3;
      const damping = Math.exp(-fraction * params.decay * 200);
      const x = cx + Math.sin(angle * params.freqX + params.phaseX + driftAmount + 0.4) * maxR * 0.75 * damping;
      const y = cy + Math.sin(angle * params.freqY + params.phaseY + driftAmount * 1.3 + 0.4) * maxR * 0.75 * damping;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(${rgb2[0]},${rgb2[1]},${rgb2[2]},0.35)`;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(cx, cy, maxR + 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  return createCanvasManager(container, seed, size, drawFn, { fps: 45 });
}
