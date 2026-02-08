import { generatePalette, hslToRgb, mapLuminance } from '../utils/color.js';
import { createVoronoiRenderer } from '../voronoi-engine.js';

export function create(container, seed, size, mode) {
  const { hue, sat } = generatePalette(seed, mode);

  function drawPixel(minDist, secondDist) {
    const lineIntensity = Math.max(0, 1 - ((secondDist - minDist) * 35));
    return hslToRgb(hue / 360, sat / 100, mapLuminance(0.82 - lineIntensity * 0.30, mode));
  }

  return createVoronoiRenderer(container, seed, size, 12, drawPixel, 3, mode);
}
