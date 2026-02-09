import { seededRandom } from '../utils/hash.js';
import { generatePalette } from '../utils/color.js';
import { makeFlowFieldParams, getFlowAngle } from '../utils/flowField.js';
import { subscribe } from '../utils/animationLoop.js';
import { getResolution } from '../canvas-manager.js';

const RAMP_UP = 800;
const RAMP_DOWN = 1500;
const SNAP_INTERVAL = 30; // frames between pixel-snap cleanup

export function create(container, seed, size, mode) {
  const palette = generatePalette(seed, mode);
  const fp = makeFlowFieldParams(seed);
  const { bgRgb, primaryRgb, darkRgb } = palette;

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

  const rng = seededRandom(seed + 999);
  const particles = Array.from({ length: 90 }, () => ({
    x: rng() * res, y: rng() * res,
    life: Math.floor(rng() * 50),
    maxLife: 25 + Math.floor(rng() * 40),
    shade: rng() > 0.5 ? primaryRgb : darkRgb,
  }));

  let globalTick = 0;
  let frameCount = 0;
  const bgFill = `rgb(${bgRgb[0]},${bgRgb[1]},${bgRgb[2]})`;

  function drawStatic() {
    ctx.fillStyle = bgFill; ctx.fillRect(0, 0, res, res);
    const traceRng = seededRandom(seed + 500);
    for (let i = 0; i < 60; i++) {
      let tx = traceRng() * res, ty = traceRng() * res;
      const shade = traceRng() > 0.5 ? primaryRgb : darkRgb;
      ctx.beginPath(); ctx.moveTo(tx, ty);
      for (let s = 0; s < 30; s++) {
        const a = getFlowAngle(tx / res, ty / res, 0, fp, 0);
        tx += Math.cos(a) * 2; ty += Math.sin(a) * 2; ctx.lineTo(tx, ty);
      }
      ctx.strokeStyle = `rgba(${shade[0]},${shade[1]},${shade[2]},.3)`;
      ctx.lineWidth = 1.5; ctx.stroke();
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

  // Snap near-background pixels to exact background (kills 8-bit quantization ghosts)
  function snapPixels() {
    const imageData = tctx.getImageData(0, 0, res, res);
    const d = imageData.data;
    const r0 = bgRgb[0], g0 = bgRgb[1], b0 = bgRgb[2];
    for (let i = 0; i < d.length; i += 4) {
      if (Math.abs(d[i] - r0) <= 3 && Math.abs(d[i+1] - g0) <= 3 && Math.abs(d[i+2] - b0) <= 3) {
        d[i] = r0; d[i+1] = g0; d[i+2] = b0; d[i+3] = 255;
      }
    }
    tctx.putImageData(imageData, 0, 0);
  }

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
      // If gap > 200ms the tab was backgrounded — clear stale trails, resume clean
      const wasBackground = rawDt > 200;
      const dt = wasBackground ? (1000 / 60) : Math.min(rawDt, 50);
      if (wasBackground) { tctx.fillStyle = bgFill; tctx.fillRect(0, 0, res, res); }

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

      const tScale = dt / (1000 / 60);
      globalTick += tScale;
      frameCount++;
      const e = energy;

      // Fade trail canvas
      const fadeAlpha = (0.08 + 0.08 * (1 - e)) * tScale;
      tctx.fillStyle = `rgba(${bgRgb[0]},${bgRgb[1]},${bgRgb[2]},${fadeAlpha})`;
      tctx.fillRect(0, 0, res, res);

      // Periodically snap near-bg pixels to prevent ghost buildup
      if (frameCount % SNAP_INTERVAL === 0) snapPixels();

      for (const p of particles) {
        const a = getFlowAngle(p.x / res, p.y / res, globalTick, fp, e);
        p.x += Math.cos(a) * 3 * Math.max(e, 0.1) * tScale;
        p.y += Math.sin(a) * 3 * Math.max(e, 0.1) * tScale;
        p.life++;
        const dx = p.x - res / 2, dy = p.y - res / 2;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (p.life > p.maxLife || dist > res / 2 - 2) {
          const rr = seededRandom(seed + p.life + (p.x | 0) + globalTick);
          p.x = rr() * res; p.y = rr() * res; p.life = 0;
        }
        if (dist < res / 2 - 2) {
          const alpha = Math.min(p.life / 5, 1) * Math.min((p.maxLife - p.life) / 5, 1) * Math.max(e, 0.05);
          tctx.beginPath(); tctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
          tctx.fillStyle = `rgba(${p.shade[0]},${p.shade[1]},${p.shade[2]},${alpha * 0.7})`;
          tctx.fill();
        }
      }

      ctx.clearRect(0, 0, res, res);
      ctx.drawImage(tc, 0, 0);
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
