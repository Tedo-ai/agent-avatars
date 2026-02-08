import { seededRandom } from '../utils/hash.js';
import { generatePalette, hslToRgb, mapLuminance } from '../utils/color.js';
import { createVoronoiRenderer } from '../voronoi-engine.js';

export function create(container, seed, size, mode) {
  const { hue, sat } = generatePalette(seed, mode);

  const rng = seededRandom(seed);
  const shadeHues = Array.from({ length: 5 }, () => (hue + Math.floor(rng() * 40) - 20 + 360) % 360);

  function drawPixel(minDist, secondDist, closestIdx, points) {
    const edgeDist = secondDist - minDist;
    if (edgeDist < 0.02) {
      return hslToRgb(hue / 360, sat * 0.3 / 100, mapLuminance(0.40, mode));
    }
    return hslToRgb(
      shadeHues[points[closestIdx].shade] / 360,
      sat / 100,
      mapLuminance(0.62 + (1 - Math.min(minDist * 6, 1)) * 0.25, mode)
    );
  }

  return createVoronoiRenderer(container, seed, size, 10, drawPixel, 2, mode);
}
