import { seededRandom } from '../utils/hash.js';
import { generatePalette } from '../utils/color.js';
import { subscribe } from '../utils/animationLoop.js';
import { getResolution } from '../canvas-manager.js';

const RAMP_UP = 800;
const RAMP_DOWN = 1500;
const TICK_INTERVAL = 25;

export function create(container, seed, size, mode) {
  const palette = generatePalette(seed, mode);
  const bgRgb = palette.bgRgb;
  const lighterRgb = palette.lightRgb;
  const darkerRgb = palette.darkerRgb;
  const shadeRgbs = [palette.lightRgb, palette.primaryRgb, palette.darkRgb];

  const rng = seededRandom(seed);
  const orbitCount = 3 + Math.floor(rng() * 3);
  const orbits = Array.from({ length: orbitCount }, (_, i) => ({
    rx: 12 + i * 8 + rng() * 4,
    ry: 6 + rng() * (8 + i * 3),
    tilt: rng() * 180,
    dots: 1 + Math.floor(rng() * 3),
    speed: (0.04 + rng() * 0.05) * (rng() > 0.5 ? 1 : -1),
    dotR: 1.5 + rng() * 1.5,
    shadeRgb: shadeRgbs[i % 3],
    phase: rng() * Math.PI * 2,
  }));

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
  const scale = res / 100;

  function draw(tick, energy) {
    ctx.fillStyle = `rgb(${bgRgb[0]},${bgRgb[1]},${bgRgb[2]})`;
    ctx.fillRect(0, 0, res, res);

    // Center nucleus
    const cR = (3 + Math.sin(tick * 0.06) * 0.8 * energy) * scale;
    ctx.beginPath();
    ctx.arc(50 * scale, 50 * scale, cR, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${lighterRgb[0]},${lighterRgb[1]},${lighterRgb[2]},0.85)`;
    ctx.fill();

    // Orbits
    for (let oi = 0; oi < orbits.length; oi++) {
      const orbit = orbits[oi];
      const tiltAngle = (orbit.tilt + tick * 0.3 * (oi % 2 === 0 ? 1 : -1) * energy) * Math.PI / 180;

      ctx.save();
      ctx.translate(50 * scale, 50 * scale);
      ctx.rotate(tiltAngle);

      // Orbit ellipse track
      ctx.beginPath();
      ctx.ellipse(0, 0, orbit.rx * scale, orbit.ry * scale, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${darkerRgb[0]},${darkerRgb[1]},${darkerRgb[2]},0.3)`;
      ctx.lineWidth = 0.6 * scale;
      ctx.stroke();

      // Dots on orbit
      for (let di = 0; di < orbit.dots; di++) {
        const angle = orbit.phase + (di / orbit.dots) * Math.PI * 2 + tick * orbit.speed * energy;
        const dotX = Math.cos(angle) * orbit.rx * scale;
        const dotY = Math.sin(angle) * orbit.ry * scale;

        ctx.beginPath();
        ctx.arc(dotX, dotY, orbit.dotR * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${orbit.shadeRgb[0]},${orbit.shadeRgb[1]},${orbit.shadeRgb[2]},0.9)`;
        ctx.fill();
      }

      ctx.restore();
    }

    // Clip to circle
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(res / 2, res / 2, res / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  let active = false;
  let energyVal = 0;
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
      if (Math.abs(energyVal - target) > 0.003) {
        const rate = target > energyVal ? dt / RAMP_UP : dt / RAMP_DOWN;
        energyVal = Math.max(0, Math.min(1, energyVal + (target > energyVal ? 1 : -1) * rate));
        changed = true;
      } else if (energyVal !== target) { energyVal = target; changed = true; }

      if (energyVal === 0 && !active) {
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

      if (changed) draw(tick, energyVal);
    });
  }

  return {
    canvas,
    setActive(val) {
      active = val;
      if (active || energyVal > 0) startLoop();
    },
    destroy() {
      if (unsub) { unsub(); unsub = null; }
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    },
  };
}
