import { seededRandom } from '../utils/hash.js';
import { generatePalette, hslToRgb } from '../utils/color.js';
import { subscribe } from '../utils/animationLoop.js';
import { getResolution } from '../canvas-manager.js';

const RAMP_UP = 800;
const RAMP_DOWN = 1500;
const TICK_INTERVAL = 22;

export function create(container, seed, size, mode) {
  const palette = generatePalette(seed, mode);
  const bgRgb = palette.bgRgb;
  const lighterRgb = palette.lightRgb; // closest to "lighter"
  const shadeRgbs = [palette.darkRgb, palette.primaryRgb, palette.lightRgb];

  const rng = seededRandom(seed);
  const ringCount = 2 + Math.floor(rng() * 2);
  const rings = Array.from({ length: ringCount }, (_, i) => {
    const wobbles = Array.from({ length: 40 }, () => rng() * 0.12 - 0.06);
    return {
      baseRadius: 7 + i * 11 + rng() * 2,
      wobbles,
      strokeWidth: 1.5 + rng() * 2.5,
      shadeRgb: shadeRgbs[i % shadeRgbs.length],
      breatheSpeed: 0.09 + rng() * 0.08,
      breatheAmp: 2 + rng() * 2.5,
      phase: rng() * Math.PI * 2,
      wobbleSpeed: 0.045 + rng() * 0.04,
    };
  });

  const canvas = document.createElement('canvas');
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  canvas.style.borderRadius = '50%';
  canvas.style.flexShrink = '0';
  canvas.style.display = 'block';
  container.appendChild(canvas);

  const res = getResolution(size);
  canvas.width = res; canvas.height = res;
  const ctx = canvas.getContext('2d');
  // SVG viewBox was 0 0 100 100, scale to res
  const scale = res / 100;

  function draw(tick, energy) {
    ctx.fillStyle = `rgb(${bgRgb[0]},${bgRgb[1]},${bgRgb[2]})`;
    ctx.fillRect(0, 0, res, res);

    // Center dot
    const centerR = (2 + Math.sin(tick * 0.07) * energy) * scale;
    ctx.beginPath();
    ctx.arc(50 * scale, 50 * scale, centerR, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${lighterRgb[0]},${lighterRgb[1]},${lighterRgb[2]},0.8)`;
    ctx.fill();

    // Rings
    for (const ring of rings) {
      const breathe = Math.sin(tick * ring.breatheSpeed + ring.phase) * ring.breatheAmp * energy;
      const opacity = 0.45 + Math.sin(tick * ring.breatheSpeed * 0.5 + ring.phase + 1) * 0.25 * energy;

      ctx.beginPath();
      for (let pi = 0; pi < ring.wobbles.length; pi++) {
        const angle = (pi / ring.wobbles.length) * Math.PI * 2;
        const wobbleShift = Math.sin(tick * ring.wobbleSpeed + pi * 0.6 + ring.phase) * 2.5 * energy;
        const r = Math.min(ring.baseRadius + breathe + ring.wobbles[pi] * ring.baseRadius + wobbleShift, 38);
        const x = (50 + Math.cos(angle) * r) * scale;
        const y = (50 + Math.sin(angle) * r) * scale;
        if (pi === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(${ring.shadeRgb[0]},${ring.shadeRgb[1]},${ring.shadeRgb[2]},${opacity})`;
      ctx.lineWidth = ring.strokeWidth * scale;
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    // Clip to circle
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(res / 2, res / 2, res / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  let active = false;
  let energy = 0;
  let tick = 0;
  let lastTs = null;
  let accumulator = 0;
  let unsub = null;

  draw(0, 0);

  function startLoop() {
    if (unsub) return;
    lastTs = null;
    accumulator = 0;
    unsub = subscribe((ts) => {
      const dt = lastTs !== null ? ts - lastTs : 16;
      lastTs = ts;

      const target = active ? 1 : 0;
      let changed = false;
      if (Math.abs(energy - target) > 0.003) {
        const rate = target > energy ? dt / RAMP_UP : dt / RAMP_DOWN;
        energy = Math.max(0, Math.min(1, energy + (target > energy ? 1 : -1) * rate));
        changed = true;
      } else if (energy !== target) { energy = target; changed = true; }

      if (energy === 0 && !active) {
        if (changed) draw(tick, 0);
        if (unsub) { unsub(); unsub = null; }
        return;
      }

      accumulator += dt;
      if (accumulator >= TICK_INTERVAL) {
        accumulator -= TICK_INTERVAL;
        tick++;
        changed = true;
      }

      if (changed) draw(tick, energy);
    });
  }

  return {
    canvas,
    setActive(val) {
      active = val;
      if (active || energy > 0) startLoop();
    },
    destroy() {
      if (unsub) { unsub(); unsub = null; }
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    },
  };
}
