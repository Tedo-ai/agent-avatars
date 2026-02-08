import { generatePalette, hslToRgb, mapLuminance } from '../utils/color.js';
import { createVoronoiRenderer } from '../voronoi-engine.js';

const BASE_LUMINANCE = [0.62, 0.70, 0.80, 0.66, 0.75];

export function create(container, seed, size, mode) {
  const { hue, sat } = generatePalette(seed, mode);

  function drawPixel(minDist, _secondDist, closestIdx, points) {
    const gradient = Math.min(minDist * 8, 1);
    return hslToRgb(hue / 360, sat / 100, mapLuminance(BASE_LUMINANCE[points[closestIdx].shade] * (1 - gradient * 0.3), mode));
  }

  return createVoronoiRenderer(container, seed, size, 9, drawPixel, 3, mode);
}
