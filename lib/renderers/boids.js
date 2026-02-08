import { seededRandom } from '../utils/hash.js';
import { generatePalette } from '../utils/color.js';
import { subscribe } from '../utils/animationLoop.js';
import { getResolution } from '../canvas-manager.js';

const RAMP_UP = 800;
const RAMP_DOWN = 1500;
const MAX_SPEED = 0.01;
const NEIGHBOR_DIST_SQ = 0.12 * 0.12;
const SEPARATION_DIST_SQ = 0.04 * 0.04;

export function create(container, seed, size, mode) {
  const palette = generatePalette(seed, mode);
  const { bgRgb, primaryRgb, lightRgb, darkRgb } = palette;

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

  const rng = seededRandom(seed);
  const count = 35 + Math.floor(rng() * 20);
  const boids = Array.from({ length: count }, () => {
    const angle = rng() * Math.PI * 2;
    return {
      x: 0.2 + rng() * 0.6, y: 0.2 + rng() * 0.6,
      vx: Math.cos(angle) * 0.003, vy: Math.sin(angle) * 0.003,
      shade: rng() < 0.33 ? darkRgb : rng() < 0.66 ? primaryRgb : lightRgb,
      size: 1 + rng() * 1.5,
    };
  });

  const bgFill = `rgb(${bgRgb[0]},${bgRgb[1]},${bgRgb[2]})`;

  function drawStatic() {
    ctx.fillStyle = bgFill; ctx.fillRect(0, 0, res, res);
    for (const b of boids) {
      const dx = b.x - 0.5, dy = b.y - 0.5;
      if (dx * dx + dy * dy > 0.2304) continue;
      ctx.beginPath(); ctx.arc(b.x * res, b.y * res, b.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${b.shade[0]},${b.shade[1]},${b.shade[2]},.7)`; ctx.fill();
    }
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath(); ctx.arc(res / 2, res / 2, res / 2, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  drawStatic();

  const tc = document.createElement('canvas');
  tc.width = res; tc.height = res;
  const tctx = tc.getContext('2d');
  tctx.fillStyle = bgFill; tctx.fillRect(0, 0, res, res);

  let active = false;
  let energy = 0;
  let lastTs = null;
  let unsub = null;

  function startLoop() {
    if (unsub) return;
    lastTs = null;
    unsub = subscribe((ts) => {
      const rawDt = lastTs !== null ? ts - lastTs : 16;
      lastTs = ts;
      const dt = Math.min(rawDt, 100);
      const target = active ? 1 : 0;
      if (Math.abs(energy - target) > 0.003) {
        const rate = target > energy ? dt / RAMP_UP : dt / RAMP_DOWN;
        energy = Math.max(0, Math.min(1, energy + (target > energy ? 1 : -1) * rate));
      } else { energy = target; }
      if (energy === 0 && !active) {
        drawStatic();
        if (unsub) { unsub(); unsub = null; }
        return;
      }

      const e = energy;
      const tScale = dt / (1000 / 60);
      const fadeAlpha = (0.08 + 0.15 * (1 - e)) * tScale;
      tctx.fillStyle = `rgba(${bgRgb[0]},${bgRgb[1]},${bgRgb[2]},${fadeAlpha})`;
      tctx.fillRect(0, 0, res, res);

      for (let i = 0; i < boids.length; i++) {
        const b = boids[i];
        let sepX = 0, sepY = 0, aliX = 0, aliY = 0, cohX = 0, cohY = 0, nC = 0;

        for (let j = 0; j < boids.length; j++) {
          if (i === j) continue;
          const dx = boids[j].x - b.x, dy = boids[j].y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < SEPARATION_DIST_SQ) {
            const dist = Math.sqrt(distSq);
            sepX -= dx / dist; sepY -= dy / dist;
          }
          if (distSq < NEIGHBOR_DIST_SQ) {
            aliX += boids[j].vx; aliY += boids[j].vy;
            cohX += boids[j].x; cohY += boids[j].y;
            nC++;
          }
        }

        if (nC > 0) {
          aliX /= nC; aliY /= nC;
          cohX = cohX / nC - b.x; cohY = cohY / nC - b.y;
        }

        const cx = 0.5 - b.x, cy = 0.5 - b.y;
        const cd = Math.sqrt(cx * cx + cy * cy) + 0.01;
        const cp = Math.max(0, cd - 0.3) * 0.02;

        b.vx += (sepX * 0.05 + aliX * 0.03 + cohX * 0.01 + cx / cd * cp) * e;
        b.vy += (sepY * 0.05 + aliY * 0.03 + cohY * 0.01 + cy / cd * cp) * e;

        const spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        const ms = MAX_SPEED * Math.max(e, 0.15);
        if (spd > ms) { b.vx = b.vx / spd * ms; b.vy = b.vy / spd * ms; }

        b.x += b.vx * tScale; b.y += b.vy * tScale;
        const dx2 = b.x - 0.5, dy2 = b.y - 0.5;
        if (dx2 * dx2 + dy2 * dy2 > 0.2116) {
          b.x = 0.5 - dx2 * 0.3; b.y = 0.5 - dy2 * 0.3;
        }

        tctx.beginPath(); tctx.arc(b.x * res, b.y * res, b.size, 0, Math.PI * 2);
        tctx.fillStyle = `rgba(${b.shade[0]},${b.shade[1]},${b.shade[2]},${0.5 + e * 0.4})`; tctx.fill();
      }

      ctx.clearRect(0, 0, res, res); ctx.drawImage(tc, 0, 0);
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath(); ctx.arc(res / 2, res / 2, res / 2, 0, Math.PI * 2); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
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
