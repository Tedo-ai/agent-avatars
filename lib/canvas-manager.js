import { subscribe } from './utils/animationLoop.js';

const RAMP_UP = 800;
const RAMP_DOWN = 1500;
const NOMINAL_DT = 1000 / 60; // normalize all timing to 60fps
const DPR = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;

export function getResolution(size) {
  return Math.min(Math.max(Math.round(size * DPR), 32), 200);
}

/**
 * Vanilla JS canvas manager replacing useAnimCanvas.
 * Creates a canvas, manages energy ramp, animation loop, DPR, and circular clip.
 *
 * @param {HTMLElement} container - DOM element to append canvas to
 * @param {number} seed - Numeric seed
 * @param {number} size - CSS pixel size
 * @param {Function} drawFn - (canvas, tick, energy) => void
 * @param {object} [opts]
 * @param {number} [opts.fps=60] - Target frame rate
 * @returns {{ canvas, setActive, setSeed, destroy }}
 */
export function createCanvasManager(container, seed, size, drawFn, opts) {
  const canvas = document.createElement('canvas');
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  canvas.style.borderRadius = '50%';
  canvas.style.flexShrink = '0';
  canvas.style.display = 'block';
  container.appendChild(canvas);

  const targetFps = opts?.fps ?? 60;
  const skipEvery = targetFps < 60 ? Math.round(60 / targetFps) : 1;

  let active = false;
  let time = 0;
  let energy = 0;
  let lastTimestamp = null;
  let pendingDt = 0;
  let frameSkip = 0;
  let unsub = null;
  let currentDrawFn = drawFn;

  function initCanvas() {
    const res = getResolution(size);
    canvas.width = res;
    canvas.height = res;
    time = 0;
    energy = 0;
    lastTimestamp = null;
    pendingDt = 0;
    currentDrawFn(canvas, 0, 0);
  }

  function onFrame(timestamp) {
    const dt = lastTimestamp !== null ? timestamp - lastTimestamp : 16;
    lastTimestamp = timestamp;

    const target = active ? 1 : 0;
    if (Math.abs(energy - target) > 0.003) {
      const rate = target > energy ? dt / RAMP_UP : dt / RAMP_DOWN;
      energy = Math.max(0, Math.min(1, energy + (target > energy ? 1 : -1) * rate));
    } else {
      energy = target;
    }

    if (energy === 0 && !active) {
      currentDrawFn(canvas, time, 0);
      return 'done';
    }

    pendingDt += dt;
    frameSkip++;
    if (frameSkip < skipEvery) return;
    frameSkip = 0;

    time += pendingDt / NOMINAL_DT;
    pendingDt = 0;
    currentDrawFn(canvas, time, energy);
  }

  function startLoop() {
    if (unsub) return;
    lastTimestamp = null;
    const wrapper = (ts) => {
      const result = onFrame(ts);
      if (result === 'done' && unsub) {
        unsub();
        unsub = null;
      }
    };
    unsub = subscribe(wrapper);
  }

  function stopLoop() {
    if (unsub) {
      unsub();
      unsub = null;
    }
  }

  initCanvas();

  return {
    canvas,
    setActive(val) {
      active = val;
      if (active || energy > 0) {
        startLoop();
      } else {
        currentDrawFn(canvas, time, 0);
      }
    },
    setDrawFn(fn) {
      currentDrawFn = fn;
    },
    reinit() {
      stopLoop();
      initCanvas();
      if (active) startLoop();
    },
    destroy() {
      stopLoop();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    },
  };
}
