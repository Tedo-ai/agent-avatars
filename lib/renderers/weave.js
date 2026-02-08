import { seededRandom } from '../utils/hash.js';
import { generatePalette, hslToRgb, mapLuminance } from '../utils/color.js';
import { createCanvasManager } from '../canvas-manager.js';

export function create(container, seed, size, mode) {
  const { hue, sat } = generatePalette(seed, mode);

  const rng = seededRandom(seed);
  const bands = Array.from({ length: 5 + Math.floor(rng() * 4) }, (_, i) => ({
    offset: rng() * Math.PI * 2,
    freq: 2 + rng() * 4,
    amp: 0.06 + rng() * 0.1,
    width: 0.03 + rng() * 0.04,
    horiz: i % 2 === 0,
    speed: 0.02 + rng() * 0.035,
    lum: 0.60 + rng() * 0.25,
  }));

  function drawFn(canvas, t, energy) {
    const ctx = canvas.getContext('2d');
    const res = canvas.width;
    const step = 2;
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

        let maxBandIdx = -1;
        let maxIntensity = 0;

        for (let bi = 0; bi < bands.length; bi++) {
          const band = bands[bi];
          const along = band.horiz ? nx : ny;
          const across = band.horiz ? ny : nx;
          const center = 0.1 + (bi / bands.length) * 0.8 +
            Math.sin(along * band.freq * Math.PI * 2 + band.offset + t * band.speed * energy) * band.amp;
          const distToBand = Math.abs(across - center);

          if (distToBand < band.width) {
            const intensity = 1 - distToBand / band.width;
            if (intensity > maxIntensity) {
              maxIntensity = intensity;
              maxBandIdx = bi;
            }
          }
        }

        let luminance = 0.50;
        if (maxBandIdx >= 0) {
          luminance = bands[maxBandIdx].lum * maxIntensity;
        }

        const rgb = hslToRgb(hue / 360, sat / 100, mapLuminance(luminance, mode));
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
