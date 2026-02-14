import { generatePalette } from '../utils/color.js';
import { seededRandom } from '../utils/hash.js';
import { subscribe } from '../utils/animationLoop.js';
import { getResolution } from '../canvas-manager.js';

const COLS = 48;
const ROWS = 48;
const N = COLS * ROWS;
const NUM_LAYERS = 8;
const RAMP_UP = 800;
const RAMP_DOWN = 1500;
const TICK_INTERVAL = 50;

function ix(x, y) {
  return ((y + ROWS) % ROWS) * COLS + ((x + COLS) % COLS);
}

function stepGrid(g) {
  const n = new Uint8Array(N);
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      let s = 0;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++)
          if (dx || dy) s += g[ix(x + dx, y + dy)];
      const i = y * COLS + x;
      n[i] = (g[i] ? (s === 2 || s === 3) : (s === 3)) ? 1 : 0;
    }
  }
  return n;
}

function hashGrid(g) {
  let h1 = 0, h2 = 0;
  for (let i = 0; i < N; i += 2) {
    h1 = ((h1 << 5) - h1 + g[i]) | 0;
    h2 = ((h2 << 5) - h2 + (g[i + 1] || 0)) | 0;
  }
  return h1 + '|' + h2;
}

function seedLayer(rng, minGen) {
  let best = null, bestLen = 0;
  for (let a = 0; a < 80; a++) {
    const g = new Uint8Array(N);
    const d = 0.28 + rng() * 0.14;
    for (let i = 0; i < N; i++) g[i] = rng() < d ? 1 : 0;

    const hist = [Uint8Array.from(g)];
    const seen = new Set();
    seen.add(hashGrid(g));
    let cur = g;

    for (let gen = 0; gen < 400; gen++) {
      cur = stepGrid(cur);
      const h = hashGrid(cur);
      if (seen.has(h)) break;
      seen.add(h);
      hist.push(Uint8Array.from(cur));
    }

    if (hist.length > bestLen) {
      bestLen = hist.length;
      best = hist;
    }
    if (bestLen >= minGen) break;
  }
  return best;
}

/** Ping-pong index: travel 10% → 90% and back. */
function ppIdx(len, tick) {
  const lo = Math.floor(len * 0.1);
  const hi = Math.max(lo + 1, Math.floor(len * 0.9));
  const span = hi - lo;
  const cyc = span * 2;
  const t = ((tick % cyc) + cyc) % cyc;
  return t < span ? lo + t : hi - (t - span);
}

export function create(container, seed, size, mode) {
  const palette = generatePalette(seed, mode);
  const bgRgb = palette.bgRgb;
  const fgRgb = palette.primaryRgb;
  const midRgb = palette.darkRgb;

  const canvas = document.createElement('canvas');
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  canvas.style.borderRadius = '50%';
  canvas.style.flexShrink = '0';
  canvas.style.display = 'block';
  container.appendChild(canvas);

  const res = getResolution(size);
  canvas.width = res;
  canvas.height = res;
  const ctx = canvas.getContext('2d');

  // Precompute layers
  const rng = seededRandom(seed);
  const layers = [];
  for (let i = 0; i < NUM_LAYERS; i++) {
    const lseed = Math.abs((seed * 31 + i * 7919 + i * i * 13) | 0) || 1;
    const lrng = seededRandom(lseed);
    const history = seedLayer(lrng, 48);
    const tick = Math.floor(rng() * history.length);
    layers.push({ history, tick });
  }

  const acc = new Float32Array(N);
  const cx = res / 2;
  const cy = res / 2;
  const maxR = res / 2;

  function draw() {
    acc.fill(0);

    for (let li = 0; li < NUM_LAYERS; li++) {
      const L = layers[li];
      const fi = ppIdx(L.history.length, L.tick);
      const grid = L.history[fi];
      for (let i = 0; i < N; i++) {
        if (grid[i]) acc[i] += 1;
      }
    }

    const img = ctx.createImageData(res, res);
    const data = img.data;
    const cellW = res / COLS;
    const cellH = res / ROWS;

    for (let py = 0; py < res; py++) {
      for (let px = 0; px < res; px++) {
        const dx = px - cx;
        const dy = py - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > maxR) {
          const off = (py * res + px) * 4;
          data[off + 3] = 0;
          continue;
        }

        const gx = Math.min(Math.floor(px / cellW), COLS - 1);
        const gy = Math.min(Math.floor(py / cellH), ROWS - 1);
        const ci = gy * COLS + gx;
        const t = acc[ci] / NUM_LAYERS;

        // Two-stop gradient: bg → mid (0-0.4), mid → fg (0.4-1)
        let r, g, b;
        if (t < 0.4) {
          const u = t / 0.4;
          r = bgRgb[0] + (midRgb[0] - bgRgb[0]) * u;
          g = bgRgb[1] + (midRgb[1] - bgRgb[1]) * u;
          b = bgRgb[2] + (midRgb[2] - bgRgb[2]) * u;
        } else {
          const u = (t - 0.4) / 0.6;
          r = midRgb[0] + (fgRgb[0] - midRgb[0]) * u;
          g = midRgb[1] + (fgRgb[1] - midRgb[1]) * u;
          b = midRgb[2] + (fgRgb[2] - midRgb[2]) * u;
        }

        let alpha = 255;
        if (dist > maxR - 1.5) {
          alpha = Math.max(0, (maxR - dist) / 1.5 * 255);
        }

        const off = (py * res + px) * 4;
        data[off] = r;
        data[off + 1] = g;
        data[off + 2] = b;
        data[off + 3] = alpha;
      }
    }

    ctx.putImageData(img, 0, 0);
  }

  let active = false;
  let energy = 0;
  let lastTs = null;
  let accumulator = 0;
  let unsub = null;

  draw();

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
        if (changed) draw();
        if (unsub) { unsub(); unsub = null; }
        return;
      }

      accumulator += dt * energy;
      if (accumulator >= TICK_INTERVAL) {
        accumulator -= TICK_INTERVAL;
        for (let i = 0; i < NUM_LAYERS; i++) {
          layers[i].tick++;
        }
        changed = true;
      }

      if (changed) draw();
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
