import { generatePalette, hslToRgb, mapLuminance } from '../utils/color.js';
import { createVoronoiRenderer } from '../voronoi-engine.js';

export function create(container, seed, size, mode) {
  const { hue, sat } = generatePalette(seed, mode);
  const shadeRgbs = [
    hslToRgb(hue / 360, sat / 100, mapLuminance(0.58, mode)),
    hslToRgb(hue / 360, sat / 100, mapLuminance(0.65, mode)),
    hslToRgb(hue / 360, sat / 100, mapLuminance(0.72, mode)),
    hslToRgb(hue / 360, sat / 100, mapLuminance(0.80, mode)),
    hslToRgb(hue / 360, sat / 100, mapLuminance(0.87, mode)),
  ];

  function drawPixel(minDist, secondDist, closestIdx, points) {
    const edgeFactor = Math.min((secondDist - minDist) * 12, 1);
    const rgb = shadeRgbs[points[closestIdx].shade];
    const brightness = 0.6 + edgeFactor * 0.4;
    return [(rgb[0] * brightness) | 0, (rgb[1] * brightness) | 0, (rgb[2] * brightness) | 0];
  }

  return createVoronoiRenderer(container, seed, size, 10, drawPixel, 3, mode);
}
