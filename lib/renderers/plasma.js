import { seededRandom } from '../utils/hash.js';
import { generatePalette, hslToRgb, mapLuminance } from '../utils/color.js';
import { createCanvasManager } from '../canvas-manager.js';

export function create(container, seed, size, mode) {
  const { hue, sat } = generatePalette(seed, mode);

  const rng = seededRandom(seed);
  const p = {
    scaleA: 3 + rng() * 5,
    scaleB: 4 + rng() * 6,
    scaleC: 2 + rng() * 4,
    scaleD: 3 + rng() * 5,
    speed: 0.04 + rng() * 0.05,
    offsetA: rng() * 10,
    offsetB: rng() * 10,
  };

  function drawFn(canvas, t, energy) {
    const ctx = canvas.getContext('2d');
    const res = canvas.width;
    const step = 2;
    const timeEnergy = t * energy;
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

        const val = (
          Math.sin(nx * p.scaleA + p.offsetA + timeEnergy * p.speed) +
          Math.sin(ny * p.scaleB + p.offsetB + timeEnergy * p.speed * 0.7) +
          Math.sin(nx * p.scaleC + ny * p.scaleD + timeEnergy * p.speed * 1.3) +
          Math.sin(Math.sqrt((dx * 8) ** 2 + (dy * 8) ** 2) + timeEnergy * p.speed * 0.5)
        ) / 4;

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
