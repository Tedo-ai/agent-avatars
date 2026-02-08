import { seededRandom } from '../utils/hash.js';
import { generatePalette, hslToRgb, mapLuminance } from '../utils/color.js';
import { createCanvasManager } from '../canvas-manager.js';

export function create(container, seed, size, mode) {
  const palette = generatePalette(seed, mode);
  const { hue, sat, bgRgb } = palette;

  const rng = seededRandom(seed);
  const params = {
    arms: 2 + Math.floor(rng() * 4),
    tightness: 0.08 + rng() * 0.12,
    dotSize: 1.2 + rng() * 1.5,
    rotSpeed: 0.016 + rng() * 0.02,
    armCurve: 0.5 + rng() * 1.5,
    dir: rng() > 0.5 ? 1 : -1,
  };

  function drawFn(canvas, t, energy) {
    const ctx = canvas.getContext('2d');
    const res = canvas.width;
    ctx.fillStyle = `rgb(${bgRgb[0]},${bgRgb[1]},${bgRgb[2]})`;
    ctx.fillRect(0, 0, res, res);

    const cx = res / 2;
    const cy = res / 2;
    const maxR = res / 2 - 2;
    const rotation = t * params.rotSpeed * params.dir * energy;

    for (let arm = 0; arm < params.arms; arm++) {
      const armOffset = (arm / params.arms) * Math.PI * 2;
      for (let i = 0; i < 120; i++) {
        const fraction = i / 120;
        const r = fraction * maxR;
        const angle = armOffset + fraction * params.armCurve * Math.PI * 2 * params.tightness * 10 + rotation;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;

        if (Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) > maxR) continue;

        const rgb = hslToRgb(hue / 360, sat / 100, mapLuminance(0.55 + fraction * 0.30, mode));
        ctx.beginPath();
        ctx.arc(x, y, params.dotSize * (1 - fraction * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${(1 - fraction) * 0.9})`;
        ctx.fill();
      }
    }

    const coreRgb = hslToRgb(hue / 360, sat / 100, mapLuminance(0.92, mode));
    ctx.beginPath();
    ctx.arc(cx, cy, 3 + Math.sin(t * 0.05) * energy, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${coreRgb[0]},${coreRgb[1]},${coreRgb[2]},.9)`;
    ctx.fill();

    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(cx, cy, maxR + 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  return createCanvasManager(container, seed, size, drawFn, { fps: 45 });
}
