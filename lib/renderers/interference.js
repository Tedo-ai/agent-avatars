import { seededRandom } from '../utils/hash.js';
import { generatePalette, hslToRgb, mapLuminance } from '../utils/color.js';
import { createCanvasManager } from '../canvas-manager.js';

export function create(container, seed, size, mode) {
  const { hue, sat } = generatePalette(seed, mode);

  const rng = seededRandom(seed);
  const count = 3 + Math.floor(rng() * 2);
  const sources = Array.from({ length: count }, () => ({
    baseX: 0.15 + rng() * 0.7,
    baseY: 0.15 + rng() * 0.7,
    freq: 10 + rng() * 18,
    orbitR: 0.08 + rng() * 0.18,
    orbitSpeed: 0.025 + rng() * 0.03,
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
        if (dist > 0.5) continue;

        let val = 0;
        for (const s of sources) {
          const cx = s.baseX + Math.cos(t * s.orbitSpeed + s.phase) * s.orbitR * energy;
          const cy = s.baseY + Math.sin(t * s.orbitSpeed * 1.3 + s.phase) * s.orbitR * energy;
          val += Math.sin(Math.sqrt((nx - cx) ** 2 + (ny - cy) ** 2) * s.freq * Math.PI * 2);
        }
        val /= sources.length;

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
