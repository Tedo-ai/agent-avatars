import { seededRandom } from '../utils/hash.js';
import { generatePalette, hslToRgb, mapLuminance } from '../utils/color.js';
import { createCanvasManager } from '../canvas-manager.js';

export function create(container, seed, size, mode, opts) {
  const { hue, sat } = generatePalette(seed, mode, opts);

  const rng = seededRandom(seed);
  const drops = Array.from({ length: 3 + Math.floor(rng() * 3) }, () => ({
    cx: 0.2 + rng() * 0.6,
    cy: 0.2 + rng() * 0.6,
    freq: 20 + rng() * 30,
    speed: 0.03 + rng() * 0.035,
    phase: rng() * Math.PI * 2,
    strength: 0.5 + rng() * 0.5,
  }));

  function drawFn(canvas, t, energy) {
    const ctx = canvas.getContext('2d');
    const res = canvas.width;
    const step = 2;
    const imageData = ctx.createImageData(res, res);
    const data = imageData.data;

    for (let py = 0; py < res; py += step) {
      for (let px = 0; px < res; px += step) {
        const nx = px / res;
        const ny = py / res;
        const dx = nx - 0.5;
        const dy = ny - 0.5;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0.5) continue;

        let val = 0;
        for (const drop of drops) {
          const dd = Math.sqrt((nx - drop.cx) ** 2 + (ny - drop.cy) ** 2);
          const ripple = Math.sin(dd * drop.freq - t * drop.speed * energy + drop.phase);
          const falloff = Math.exp(-dd * 4);
          val += ripple * falloff * drop.strength;
        }
        val /= drops.length;

        const rgb = hslToRgb(hue / 360, sat / 100, mapLuminance(0.55 + ((val + 1) / 2) * 0.35, mode));
        const edgeFade = Math.min((0.5 - dist) * 10, 1);

        for (let sy = 0; sy < step && py + sy < res; sy++) {
          for (let sx = 0; sx < step && px + sx < res; sx++) {
            const idx = ((py + sy) * res + (px + sx)) * 4;
            data[idx] = rgb[0]; data[idx + 1] = rgb[1]; data[idx + 2] = rgb[2];
            data[idx + 3] = (edgeFade * 255) | 0;
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  return createCanvasManager(container, seed, size, drawFn, { fps: 30 });
}
