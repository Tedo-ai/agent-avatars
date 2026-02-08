import { hashString } from './utils/hash.js';
import { renderers } from './registry.js';

export const styles = Object.keys(renderers);

/**
 * Create an avatar instance.
 *
 * @param {HTMLElement} element - Container element to render into
 * @param {object} opts
 * @param {string} opts.style - kebab-case style name (e.g. 'boids', 'spiral')
 * @param {string|number} opts.seed - String (hashed internally) or number
 * @param {number} [opts.size=48] - CSS pixel size
 * @param {boolean} [opts.active=false] - Initial active/animate state
 * @param {'light'|'dark'} [opts.mode='light'] - Color mode
 * @returns {{ setActive, setSeed, setMode, destroy }}
 */
export function create(element, opts) {
  const style = opts.style;
  const size = opts.size ?? 48;
  let active = opts.active ?? false;
  let mode = opts.mode ?? 'light';

  const factory = renderers[style];
  if (!factory) {
    throw new Error(`Unknown avatar style "${style}". Available: ${styles.join(', ')}`);
  }

  let numericSeed = typeof opts.seed === 'number' ? opts.seed : hashString(String(opts.seed));
  let instance = factory(element, numericSeed, size, mode);

  if (active) {
    instance.setActive(true);
  }

  function rebuild() {
    instance.destroy();
    instance = factory(element, numericSeed, size, mode);
    if (active) instance.setActive(true);
  }

  return {
    setActive(val) {
      active = val;
      instance.setActive(val);
    },
    setSeed(newSeed) {
      const newNumeric = typeof newSeed === 'number' ? newSeed : hashString(String(newSeed));
      if (newNumeric === numericSeed) return;
      numericSeed = newNumeric;
      rebuild();
    },
    setMode(newMode) {
      if (newMode === mode) return;
      mode = newMode;
      rebuild();
    },
    destroy() {
      instance.destroy();
    },
  };
}
