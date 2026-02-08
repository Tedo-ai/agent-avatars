import { generatePalette, hslToRgb } from '../utils/color.js';
import { precomputeGOL } from '../utils/gameOfLife.js';
import { subscribe } from '../utils/animationLoop.js';
import { getResolution } from '../canvas-manager.js';

const GRID_SIZE = 14;
const RAMP_UP = 800;
const RAMP_DOWN = 1500;
const TICK_INTERVAL = 130;

export function create(container, seed, size, mode) {
  const palette = generatePalette(seed, mode);
  const bgRgb = palette.bgRgb;
  const shadeRgbs = [palette.darkerRgb, palette.darkRgb, palette.primaryRgb];
  const shadeAlphas = [0.5, 0.7, 1];

  const frames1 = precomputeGOL(seed, GRID_SIZE);
  const frames2 = precomputeGOL(seed + 7919, GRID_SIZE);
  const frames3 = precomputeGOL(seed + 16661, GRID_SIZE);

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

  function frameIdx(frames, tickVal) {
    const period = frames.length * 2 - 2;
    if (period <= 0) return 0;
    const pos = tickVal % period;
    return pos < frames.length ? pos : period - pos;
  }

  function draw(tick, energy) {
    const cellSize = res / GRID_SIZE;
    const gap = Math.max(0.3, cellSize * 0.08);
    const rx = cellSize * 0.1;

    ctx.fillStyle = `rgb(${bgRgb[0]},${bgRgb[1]},${bgRgb[2]})`;
    ctx.fillRect(0, 0, res, res);

    const grids = [
      frames1[frameIdx(frames1, tick)],
      frames2[frameIdx(frames2, tick + 3)],
      frames3[frameIdx(frames3, tick + 7)],
    ];

    for (let li = 0; li < 3; li++) {
      const grid = grids[li];
      const rgb = shadeRgbs[li];
      const alpha = shadeAlphas[li];
      ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;

      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          if (!grid[y][x]) continue;
          const cx = x * cellSize + gap / 2;
          const cy = y * cellSize + gap / 2;
          const w = cellSize - gap;
          const h = cellSize - gap;
          // Rounded rect
          if (rx > 0) {
            ctx.beginPath();
            ctx.moveTo(cx + rx, cy);
            ctx.lineTo(cx + w - rx, cy);
            ctx.quadraticCurveTo(cx + w, cy, cx + w, cy + rx);
            ctx.lineTo(cx + w, cy + h - rx);
            ctx.quadraticCurveTo(cx + w, cy + h, cx + w - rx, cy + h);
            ctx.lineTo(cx + rx, cy + h);
            ctx.quadraticCurveTo(cx, cy + h, cx, cy + h - rx);
            ctx.lineTo(cx, cy + rx);
            ctx.quadraticCurveTo(cx, cy, cx + rx, cy);
            ctx.fill();
          } else {
            ctx.fillRect(cx, cy, w, h);
          }
        }
      }
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
      } else if (energy !== target) {
        energy = target;
        changed = true;
      }

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
