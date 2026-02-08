import { seededRandom } from '../utils/hash.js';
import { generatePalette } from '../utils/color.js';
import { makeFlowFieldParams, getFlowAngle } from '../utils/flowField.js';
import { subscribe } from '../utils/animationLoop.js';
import { getResolution } from '../canvas-manager.js';

const RAMP_UP = 800;
const RAMP_DOWN = 1500;

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

  const trailCanvas = document.createElement('canvas');
  trailCanvas.width = res; trailCanvas.height = res;
  const trailCtx = trailCanvas.getContext('2d');
  trailCtx.fillStyle = bgFill; trailCtx.fillRect(0, 0, res, res);

  let active = false;
  let energy = 0;
  let lastTs = null;
  let unsub = null;

  function startLoop() {
    if (unsub) return;
    lastTs = null;
    unsub = subscribe((ts) => {
      const dt = lastTs !== null ? ts - lastTs : 16;
      lastTs = ts;

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
      const e = energy;
      trailCtx.fillStyle = `rgba(${bgRgb[0]},${bgRgb[1]},${bgRgb[2]},${0.03 + 0.04 * (1 - e)})`;
      trailCtx.fillRect(0, 0, res, res);

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
          trailCtx.beginPath(); trailCtx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
          trailCtx.fillStyle = `rgba(${p.shade[0]},${p.shade[1]},${p.shade[2]},${alpha * 0.85})`;
          trailCtx.fill();
        }
      }

      ctx.clearRect(0, 0, res, res);
      ctx.drawImage(trailCanvas, 0, 0);
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
