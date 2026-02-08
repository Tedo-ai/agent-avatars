import { seededRandom } from '../utils/hash.js';
import { generatePalette } from '../utils/color.js';
import { subscribe } from '../utils/animationLoop.js';
import { getResolution } from '../canvas-manager.js';

const GRID_SIZE = 11;
const RAMP_UP = 800;
const RAMP_DOWN = 1500;
const TICK_INTERVAL = 30;

export function create(container, seed, size, mode) {
  const palette = generatePalette(seed, mode);
  const bgRgb = palette.bgRgb;
  const primaryRgb = palette.primaryRgb;
  const darkRgb = palette.darkRgb;
  const darkerRgb = palette.darkerRgb;

  // Generate maze
  const rng = seededRandom(seed);
  const mazeGrid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(true));
  const visited = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
  const directions = [[0, -2], [0, 2], [-2, 0], [2, 0]];

  const stack = [[1, 1]];
  mazeGrid[1][1] = false;
  visited[1][1] = true;

  while (stack.length > 0) {
    const [cx, cy] = stack[stack.length - 1];
    const shuffled = directions
      .map(d => ({ d, r: rng() }))
      .sort((a, b) => a.r - b.r)
      .map(x => x.d);

    let found = false;
    for (const [ddx, ddy] of shuffled) {
      const nx = cx + ddx;
      const ny = cy + ddy;
      if (nx > 0 && nx < GRID_SIZE - 1 && ny > 0 && ny < GRID_SIZE - 1 && !visited[ny][nx]) {
        mazeGrid[cy + ddy / 2][cx + ddx / 2] = false;
        mazeGrid[ny][nx] = false;
        visited[ny][nx] = true;
        stack.push([nx, ny]);
        found = true;
        break;
      }
    }
    if (!found) stack.pop();
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
    const cellSize = res / GRID_SIZE;

    ctx.fillStyle = `rgb(${bgRgb[0]},${bgRgb[1]},${bgRgb[2]})`;
    ctx.fillRect(0, 0, res, res);

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (!mazeGrid[y][x]) continue;
        const wave = Math.sin(tick * 0.14 - (x + y) * 0.4) * energy;
        const brightness = Math.max(0.3, 0.5 + wave * 0.5);
        const fill = brightness > 0.6 ? primaryRgb : brightness > 0.4 ? darkRgb : darkerRgb;

        ctx.fillStyle = `rgba(${fill[0]},${fill[1]},${fill[2]},${brightness})`;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
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
