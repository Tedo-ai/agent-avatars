import { seededRandom } from '../utils/hash.js';
import { generatePalette, hslToRgb, mapLuminance } from '../utils/color.js';
import { createCanvasManager } from '../canvas-manager.js';

export function create(container, seed, size, mode) {
  const palette = generatePalette(seed, mode);
  const { hue, sat, bgRgb } = palette;

  const rng = seededRandom(seed);
  const params = {
    warpPoints: Array.from({ length: 4 + Math.floor(rng() * 3) }, () => ({
      x: 0.15 + rng() * 0.7,
      y: 0.15 + rng() * 0.7,
      strength: 0.3 + rng() * 0.7,
      freq: 3 + rng() * 5,
      orbitR: 0.05 + rng() * 0.12,
      orbitSpeed: 0.012 + rng() * 0.018,
      phase: rng() * Math.PI * 2,
    })),
    gridSpacing: 0.06 + rng() * 0.04,
  };

  function drawFn(canvas, t, energy) {
    const ctx = canvas.getContext('2d');
    const res = canvas.width;

    ctx.fillStyle = `rgb(${bgRgb[0]},${bgRgb[1]},${bgRgb[2]})`;
    ctx.fillRect(0, 0, res, res);

    const spacing = params.gridSpacing;
    const animatedPoints = params.warpPoints.map(w => ({
      x: w.x + Math.cos(t * w.orbitSpeed + w.phase) * w.orbitR * energy,
      y: w.y + Math.sin(t * w.orbitSpeed * 1.3 + w.phase) * w.orbitR * energy,
      strength: w.strength,
      freq: w.freq,
    }));

    for (let gx = 0; gx <= 1; gx += spacing) {
      const points = [];
      for (let gy = 0; gy <= 1.01; gy += 0.01) {
        let warpX = 0, warpY = 0;
        for (const p of animatedPoints) {
          const dx = gx - p.x;
          const dy = gy - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy) + 0.01;
          warpX += Math.sin(dist * p.freq * Math.PI * 2) * p.strength * 0.02 / dist;
          warpY += Math.cos(dist * p.freq * Math.PI * 2) * p.strength * 0.02 / dist;
        }
        points.push([(gx + warpX) * res, (gy + warpY) * res]);
      }
      ctx.beginPath();
      points.forEach((p, i) => i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]));
      const lum = mapLuminance(0.50 + gx * 0.30, mode);
      ctx.strokeStyle = `rgba(${hslToRgb(hue / 360, sat / 100, lum).join(',')},0.4)`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    for (let gy = 0; gy <= 1; gy += spacing) {
      const points = [];
      for (let gx = 0; gx <= 1.01; gx += 0.01) {
        let warpX = 0, warpY = 0;
        for (const p of animatedPoints) {
          const dx = gx - p.x;
          const dy = gy - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy) + 0.01;
          warpX += Math.sin(dist * p.freq * Math.PI * 2) * p.strength * 0.02 / dist;
          warpY += Math.cos(dist * p.freq * Math.PI * 2) * p.strength * 0.02 / dist;
        }
        points.push([(gx + warpX) * res, (gy + warpY) * res]);
      }
      ctx.beginPath();
      points.forEach((p, i) => i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]));
      const lum = mapLuminance(0.50 + gy * 0.30, mode);
      ctx.strokeStyle = `rgba(${hslToRgb(hue / 360, sat / 100, lum).join(',')},0.4)`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(res / 2, res / 2, res / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  return createCanvasManager(container, seed, size, drawFn, { fps: 30 });
}
