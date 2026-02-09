import { seededRandom } from '../utils/hash.js';
import { generatePalette, hslToRgb, mapLuminance } from '../utils/color.js';
import { createCanvasManager } from '../canvas-manager.js';

export function create(container, seed, size, mode, opts) {
  const palette = generatePalette(seed, mode, opts);
  const { hue, sat, bgRgb } = palette;

  const rng = seededRandom(seed);
  const count = 4 + Math.floor(rng() * 3);
  const charges = Array.from({ length: count }, () => ({
    baseX: 0.2 + rng() * 0.6,
    baseY: 0.2 + rng() * 0.6,
    strength: 0.5 + rng() * 0.9,
    orbitRx: 0.06 + rng() * 0.14,
    orbitRy: 0.06 + rng() * 0.14,
    speed: 0.03 + rng() * 0.04,
    phase: rng() * Math.PI * 2,
  }));

  function drawFn(canvas, t, energy) {
    const ctx = canvas.getContext('2d');
    const res = canvas.width;
    const step = 3;
    const imageData = ctx.createImageData(res, res);
    const data = imageData.data;

    for (let py = 0; py < res; py += step) {
      for (let px = 0; px < res; px += step) {
        const nx = px / res;
        const ny = py / res;
        const dx = nx - 0.5;
        const dy = ny - 0.5;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let r, g, b, a;
        if (dist > 0.5) {
          r = g = b = a = 0;
        } else {
          let field = 0;
          for (const c of charges) {
            const cx = c.baseX + Math.sin(t * c.speed + c.phase) * c.orbitRx * energy;
            const cy = c.baseY + Math.cos(t * c.speed * 0.8 + c.phase * 1.3) * c.orbitRy * energy;
            field += c.strength / ((nx - cx) ** 2 + (ny - cy) ** 2 + 0.008);
          }

          const edgeFade = Math.min((0.5 - dist) * 10, 1);

          if (field > 5.5) {
            const intensity = Math.min((field - 5.5) / 15, 1);
            const rgb = hslToRgb(hue / 360, sat / 100, mapLuminance(0.58 + intensity * 0.30, mode));
            r = rgb[0]; g = rgb[1]; b = rgb[2];
            a = Math.min(intensity * 2, 1) * edgeFade * 255;
          } else {
            r = bgRgb[0]; g = bgRgb[1]; b = bgRgb[2];
            a = edgeFade * 255;
          }
        }

        for (let sy = 0; sy < step && py + sy < res; sy++) {
          for (let sx = 0; sx < step && px + sx < res; sx++) {
            const idx = ((py + sy) * res + (px + sx)) * 4;
            data[idx] = r; data[idx + 1] = g; data[idx + 2] = b; data[idx + 3] = a | 0;
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  return createCanvasManager(container, seed, size, drawFn, { fps: 30 });
}
