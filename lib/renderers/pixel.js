import { seededRandom } from '../utils/hash.js';
import { generatePalette, hslToRgb } from '../utils/color.js';
import { subscribe } from '../utils/animationLoop.js';
import { getResolution } from '../canvas-manager.js';

const RAMP_UP = 800;
const RAMP_DOWN = 1500;
const TICK_INTERVAL = 45;

export function create(container, seed, size, mode) {
  const palette = generatePalette(seed, mode);
  const bgRgb = palette.bgRgb;
  const { hue, sat } = palette;

  // Build palette RGB arrays for light/primary/dark
  const lightRgb = palette.lightRgb;
  const primaryRgb = palette.primaryRgb;
  const darkRgb = palette.darkRgb;

  const gridW = 9, gridH = 9, half = 5;

  const rng = seededRandom(seed);
  const grid = Array.from({ length: gridH }, () => Array(gridW).fill(null));
  for (let y = 0; y < gridH; y++) {
    for (let x = 0; x < half; x++) {
      if (rng() > 0.38) {
        const dist = Math.abs(x - 4) + Math.abs(y - 4);
        grid[y][x] = dist < 3 ? lightRgb : dist < 5 ? primaryRgb : darkRgb;
        grid[y][gridW - 1 - x] = grid[y][x];
      }
    }
  }

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

  function draw(tick, energy) {
    const cellSize = res / 9;
    const offX = (res - gridW * cellSize) / 2;
    const offY = (res - gridH * cellSize) / 2;

    ctx.fillStyle = `rgb(${bgRgb[0]},${bgRgb[1]},${bgRgb[2]})`;
    ctx.fillRect(0, 0, res, res);

    for (let y = 0; y < gridH; y++) {
      const shift = (
        Math.sin(tick * 0.18 + y * 1.8) * cellSize * 0.7 +
        Math.sin(tick * 0.07 + y) * cellSize * 0.3
      ) * energy;

      for (let x = 0; x < gridW; x++) {
        const color = grid[y][x];
        if (!color) continue;
        const pulse = 1 - (1 - (0.75 + Math.sin(tick * 0.14 + x * 0.9 + y * 0.6) * 0.25)) * energy;
        const s = cellSize * pulse;
        const rx = offX + x * cellSize + (cellSize - s) / 2 + shift;
        const ry = offY + y * cellSize + (cellSize - s) / 2;

        ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
        // Simple rounded rect
        const r = 1;
        const w = s - 0.5, h = s - 0.5;
        ctx.beginPath();
        ctx.moveTo(rx + r, ry);
        ctx.lineTo(rx + w - r, ry);
        ctx.quadraticCurveTo(rx + w, ry, rx + w, ry + r);
        ctx.lineTo(rx + w, ry + h - r);
        ctx.quadraticCurveTo(rx + w, ry + h, rx + w - r, ry + h);
        ctx.lineTo(rx + r, ry + h);
        ctx.quadraticCurveTo(rx, ry + h, rx, ry + h - r);
        ctx.lineTo(rx, ry + r);
        ctx.quadraticCurveTo(rx, ry, rx + r, ry);
        ctx.fill();
      }
    }

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
