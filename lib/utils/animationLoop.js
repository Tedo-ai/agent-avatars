/**
 * Shared animation frame coordinator.
 * Instead of each avatar running its own requestAnimationFrame,
 * all active avatars register here and get called from a single RAF.
 */

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
  subscribers.add(callback);
  if (frameId === null) {
    frameId = requestAnimationFrame(tick);
  }
  return () => {
    subscribers.delete(callback);
    if (subscribers.size === 0 && frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  };
}
