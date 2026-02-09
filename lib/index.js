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
 * @param {number} [opts.hue] - Override hue (0-360). If omitted, derived from seed.
 * @returns {{ setActive, setSeed, setMode, setHue, destroy }}
 */
export function create(element, opts) {
  const style = opts.style;
  const size = opts.size ?? 48;
  let active = opts.active ?? false;
  let mode = opts.mode ?? 'light';
  let hue = opts.hue ?? null;

  const factory = renderers[style];
  if (!factory) {
    throw new Error(`Unknown avatar style "${style}". Available: ${styles.join(', ')}`);
  }

  function colorOpts() {
    return hue != null ? { hue } : undefined;
  }

  let numericSeed = typeof opts.seed === 'number' ? opts.seed : hashString(String(opts.seed));
  let instance = factory(element, numericSeed, size, mode, colorOpts());

  if (active) {
    instance.setActive(true);
  }

  function rebuild() {
    instance.destroy();
    instance = factory(element, numericSeed, size, mode, colorOpts());
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
    setHue(newHue) {
      if (newHue === hue) return;
      hue = newHue;
      rebuild();
    },
    destroy() {
      instance.destroy();
    },
  };
}
