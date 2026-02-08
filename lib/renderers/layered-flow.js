import { seededRandom } from '../utils/hash.js';
import { generatePalette } from '../utils/color.js';
import { makeFlowFieldParams, getFlowAngle } from '../utils/flowField.js';
import { subscribe } from '../utils/animationLoop.js';
import { getResolution } from '../canvas-manager.js';

const RAMP_UP = 800;
const RAMP_DOWN = 1500;

export function create(container, seed, size, mode) {
  const palette = generatePalette(seed, mode);
  const fieldParams = [
    makeFlowFieldParams(seed),
    makeFlowFieldParams(seed + 4219),
    makeFlowFieldParams(seed + 8831),
  ];
  const { bgRgb } = palette;
  const layerColors = [palette.darkerRgb, palette.darkRgb, palette.primaryRgb];

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

  const sizes = [1, 1.5, 2.2], alphas = [0.4, 0.6, 0.85], counts = [50, 40, 30];
  const layers = fieldParams.map((fp, li) => {
    const rng = seededRandom(seed + 1000 + li * 3331);
    return Array.from({ length: counts[li] }, () => ({
      x: rng() * res, y: rng() * res,
      life: Math.floor(rng() * 40), maxLife: 20 + Math.floor(rng() * 35),
    }));
  });

  let globalTick = 0;
  const bgFill = `rgb(${bgRgb[0]},${bgRgb[1]},${bgRgb[2]})`;

  function drawStatic() {
    ctx.fillStyle = bgFill; ctx.fillRect(0, 0, res, res);
    fieldParams.forEach((fp, li) => {
      const tr = seededRandom(seed + 500 + li * 777), col = layerColors[li];
      for (let i = 0; i < 30; i++) {
        let tx = tr() * res, ty = tr() * res;
        ctx.beginPath(); ctx.moveTo(tx, ty);
        for (let s = 0; s < 25; s++) {
          const a = getFlowAngle(tx / res, ty / res, 0, fp, 0);
          tx += Math.cos(a) * 2; ty += Math.sin(a) * 2; ctx.lineTo(tx, ty);
        }
        ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${alphas[li] * 0.35})`;
        ctx.lineWidth = sizes[li]; ctx.stroke();
      }
    });
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
      const fadeAlpha = (0.06 + 0.08 * (1 - e)) * tScale;
      tctx.fillStyle = `rgba(${bgRgb[0]},${bgRgb[1]},${bgRgb[2]},${fadeAlpha})`;
      tctx.fillRect(0, 0, res, res);

      layers.forEach((parts, li) => {
        const fp = fieldParams[li], col = layerColors[li], sz = sizes[li], al = alphas[li];
        for (const p of parts) {
          const a = getFlowAngle(p.x / res, p.y / res, globalTick, fp, e);
          p.x += Math.cos(a) * (1.8 + li * 0.6) * Math.max(e, 0.1) * tScale;
          p.y += Math.sin(a) * (1.8 + li * 0.6) * Math.max(e, 0.1) * tScale;
          p.life++;
          const dx = p.x - res / 2, dy = p.y - res / 2, dist = Math.sqrt(dx * dx + dy * dy);
          if (p.life > p.maxLife || dist > res / 2 - 2) {
            const rr = seededRandom(seed + p.life + (p.x | 0) + globalTick + li * 100);
            p.x = rr() * res; p.y = rr() * res; p.life = 0;
          }
          if (dist < res / 2 - 2) {
            const alpha = Math.min(p.life / 4, 1) * Math.min((p.maxLife - p.life) / 4, 1) * al * Math.max(e, 0.05);
            tctx.beginPath(); tctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
            tctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${alpha})`; tctx.fill();
          }
        }
      });

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
