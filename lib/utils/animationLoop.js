/**
 * Shared animation frame coordinator.
 * Instead of each avatar running its own requestAnimationFrame,
 * all active avatars register here and get called from a single RAF.
 *
 * Callbacks receive (timestamp, dt, wasBackground):
 *   dt           – clamped frame delta in ms (never exceeds 50ms)
 *   wasBackground – true when the tab was backgrounded (gap > 200ms)
 */

const NOMINAL_DT = 1000 / 60;

const subscribers = new Set();
let frameId = null;

function tick(timestamp) {
  for (const sub of subscribers) {
    sub(timestamp);
  }
  if (subscribers.size > 0) {
    frameId = requestAnimationFrame(tick);
  } else {
    frameId = null;
  }
}

export function subscribe(callback) {
  let lastTs = null;
  function wrapped(timestamp) {
    const rawDt = lastTs !== null ? timestamp - lastTs : 16;
    lastTs = timestamp;
    const wasBackground = rawDt > 200;
    const dt = wasBackground ? NOMINAL_DT : Math.min(rawDt, 50);
    callback(timestamp, dt, wasBackground);
  }
  subscribers.add(wrapped);
  if (frameId === null) {
    frameId = requestAnimationFrame(tick);
  }
  return () => {
    subscribers.delete(wrapped);
    if (subscribers.size === 0 && frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  };
}
