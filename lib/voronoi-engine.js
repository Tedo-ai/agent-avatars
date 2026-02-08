import { seededRandom } from './utils/hash.js';
import { generatePalette } from './utils/color.js';
import { createCanvasManager } from './canvas-manager.js';

/**
 * Shared Voronoi renderer used by 5 voronoi avatar variants.
 * Each variant provides a drawPixel function that colors based on cell distances.
 *
 * @param {HTMLElement} container
 * @param {number} seed
 * @param {number} size
 * @param {number} pointCount
 * @param {Function} drawPixel - (minDist, secondDist, closestIdx, points, palette) => [r,g,b]
 * @param {number} [baseStep=3]
 * @returns {{ setActive, setSeed, destroy }}
 */
export function createVoronoiRenderer(container, seed, size, pointCount, drawPixel, baseStep = 3, mode) {
  let palette = generatePalette(seed, mode);
  let points = makePoints(seed, pointCount);

  function makePoints(s, count) {
    const rng = seededRandom(s);
    return Array.from({ length: count }, () => ({
      baseX: rng(),
      baseY: rng(),
      driftRx: 0.03 + rng() * 0.06,
      driftRy: 0.03 + rng() * 0.05,
      speed: 0.02 + rng() * 0.025,
      phase: rng() * Math.PI * 2,
      shade: Math.floor(rng() * 5),
    }));
  }

  function drawFn(canvas, t, energy) {
    const ctx = canvas.getContext('2d');
    const res = canvas.width;
    const step = res <= 48 ? Math.max(baseStep, 4) : baseStep;
    const imageData = ctx.createImageData(res, res);
    const data = imageData.data;

    const ap = points.map(p => ({
      x: p.baseX + Math.sin(t * p.speed + p.phase) * p.driftRx * energy,
      y: p.baseY + Math.cos(t * p.speed * 0.8 + p.phase * 1.3) * p.driftRy * energy,
      shade: p.shade,
    }));
    const apLen = ap.length;

    for (let py = 0; py < res; py += step) {
      const ny = py / res;
      const dy = ny - 0.5;
      const dySq = dy * dy;

      for (let px = 0; px < res; px += step) {
        const nx = px / res;
        const dx = nx - 0.5;
        const distSq = dx * dx + dySq;
        if (distSq > 0.25) continue;

        let minSq = Infinity;
        let minIdx = 0;
        let secSq = Infinity;
        for (let i = 0; i < apLen; i++) {
          const ddx = nx - ap[i].x;
          const ddy = ny - ap[i].y;
          const sq = ddx * ddx + ddy * ddy;
          if (sq < minSq) {
            secSq = minSq;
            minSq = sq;
            minIdx = i;
          } else if (sq < secSq) {
            secSq = sq;
          }
        }

        const minDist = Math.sqrt(minSq);
        const secDist = Math.sqrt(secSq);
        const edgeFade = Math.min((0.5 - Math.sqrt(distSq)) * 10, 1);
        const rgb = drawPixel(minDist, secDist, minIdx, ap, palette);

        const a = (edgeFade * 255) | 0;
        for (let sy = 0; sy < step && py + sy < res; sy++) {
          for (let sx = 0; sx < step && px + sx < res; sx++) {
            const idx = ((py + sy) * res + (px + sx)) * 4;
            data[idx] = rgb[0];
            data[idx + 1] = rgb[1];
            data[idx + 2] = rgb[2];
            data[idx + 3] = a;
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  const mgr = createCanvasManager(container, seed, size, drawFn, { fps: 30 });

  return {
    canvas: mgr.canvas,
    setActive(val) { mgr.setActive(val); },
    setSeed(newSeed) {
      palette = generatePalette(newSeed);
      points = makePoints(newSeed, pointCount);
      mgr.reinit();
    },
    destroy() { mgr.destroy(); },
  };
}
