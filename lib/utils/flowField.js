import { seededRandom } from './hash.js';

/**
 * Generate flow field parameters from a seed.
 */
export function makeFlowFieldParams(seed) {
  const rng = seededRandom(seed);
  return {
    scaleX: 2 + rng() * 4,
    scaleY: 2 + rng() * 4,
    offsetX: rng() * 100,
    offsetY: rng() * 100,
    twist: 0.6 + rng() * 1.4,
    attractors: Array.from({ length: 2 + Math.floor(rng() * 2) }, () => ({
      orbitCx: 0.3 + rng() * 0.4,
      orbitCy: 0.3 + rng() * 0.4,
      orbitR: 0.1 + rng() * 0.2,
      orbitSpeed: 0.004 + rng() * 0.006,
      strength: 0.3 + rng() * 0.5,
      phase: rng() * Math.PI * 2,
    })),
  };
}

/**
 * Compute the flow angle at a given position.
 * @param {number} nx - Normalized x (0-1)
 * @param {number} ny - Normalized y (0-1)
 * @param {number} t  - Time tick
 * @param {object} fp - Flow field parameters
 * @param {number} e  - Energy level (0-1)
 */
export function getFlowAngle(nx, ny, t, fp, e) {
  let angle = Math.sin(nx * fp.scaleX + fp.offsetX)
    * Math.cos(ny * fp.scaleY + fp.offsetY)
    * Math.PI * 2 * fp.twist;

  for (const at of fp.attractors) {
    const ax = at.orbitCx + Math.cos(t * at.orbitSpeed + at.phase) * at.orbitR * e;
    const ay = at.orbitCy + Math.sin(t * at.orbitSpeed * 1.3 + at.phase) * at.orbitR * e;
    const dx = nx - ax;
    const dy = ny - ay;
    const dist = Math.sqrt(dx * dx + dy * dy) + 0.01;
    angle += Math.atan2(dy, dx) * at.strength / (dist * 8 + 0.5) * e;
  }

  return angle;
}
