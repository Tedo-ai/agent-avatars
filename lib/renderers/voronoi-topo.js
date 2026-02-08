import { generatePalette, hslToRgb, mapLuminance } from '../utils/color.js';
import { createVoronoiRenderer } from '../voronoi-engine.js';

export function create(container, seed, size, mode) {
  const { hue, sat } = generatePalette(seed, mode);

  function drawPixel(minDist, _secondDist, closestIdx, points) {
    const ring = Math.sin(minDist * 40 * Math.PI * 2);
    const ringLight = Math.max(0, ring) ** 3;
    return hslToRgb(hue / 360, sat / 100, mapLuminance(0.55 + ringLight * 0.30 + points[closestIdx].shade * 0.03, mode));
  }

  return createVoronoiRenderer(container, seed, size, 8, drawPixel, 3, mode);
}
