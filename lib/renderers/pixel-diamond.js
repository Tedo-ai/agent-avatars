import { seededRandom } from '../utils/hash.js';
import { generatePalette } from '../utils/color.js';
import { subscribe } from '../utils/animationLoop.js';
import { getResolution } from '../canvas-manager.js';

const RAMP_UP = 800;
const RAMP_DOWN = 1500;
const TICK_INTERVAL = 35;

export function create(container, seed, size, mode) {
  const palette = generatePalette(seed, mode);
  const bgRgb = palette.bgRgb;
  const lighterRgb = palette.lightRgb;  // closest to "lighter"
  const primaryRgb = palette.primaryRgb;
  const darkRgb = palette.darkRgb;

  const gridSize = 7, half = 4;

  const rng = seededRandom(seed);
  const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < half; x++) {
      const manhattanDist = Math.abs(x - 3) + Math.abs(y - 3);
      if (manhattanDist > 4) continue;
      if (rng() > 0.35) {
        grid[y][x] = manhattanDist < 2 ? lighterRgb : manhattanDist < 4 ? primaryRgb : darkRgb;
        grid[y][gridSize - 1 - x] = grid[y][x];
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
    const cellSize = res / gridSize;

    ctx.fillStyle = `rgb(${bgRgb[0]},${bgRgb[1]},${bgRgb[2]})`;
    ctx.fillRect(0, 0, res, res);

    ctx.save();
    ctx.translate(res / 2, res / 2);
    ctx.rotate(Math.PI / 4);
    ctx.translate(-res / 2, -res / 2);

    for (let y = 0; y < gridSize; y++) {
      const shift = Math.sin(tick * 0.16 + y * 1.5) * cellSize * 0.55 * energy;
      for (let x = 0; x < gridSize; x++) {
        const color = grid[y][x];
        if (!color) continue;
        const pulse = 1 - (1 - (0.7 + Math.sin(tick * 0.12 + x + y * 0.8) * 0.3)) * energy;
        const r = cellSize * pulse * 0.42;
        const cx = x * cellSize + cellSize / 2 + shift;
        const cy = y * cellSize + cellSize / 2;

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
        ctx.fill();
      }
    }

    ctx.restore();

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
