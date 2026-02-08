import { seededRandom } from './hash.js';

/**
 * Convert HSL (0-1 range) to RGB (0-255 range).
 */
export function hslToRgb(h, s, l) {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue2rgb = (p2, q2, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p2 + (q2 - p2) * 6 * t;
    if (t < 1 / 2) return q2;
    if (t < 2 / 3) return p2 + (q2 - p2) * (2 / 3 - t) * 6;
    return p2;
  };
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

/**
 * Remap a light-mode luminance value for dark mode.
 * Inverts the luminance relationship: what was bright-on-light becomes dim-on-dark
 * and vice versa, keeping values visible against both backgrounds.
 */
export function mapLuminance(l, mode) {
  if (mode !== 'dark') return l;
  // Invert and compress: light-mode 0.40-0.95 → dark-mode 0.60-0.20
  return Math.max(0.15, Math.min(0.72, 0.88 - l * 0.78));
}

/**
 * Generate a full color palette from a numeric seed.
 * Returns HSL strings, raw hue/sat values, and RGB arrays for canvas work.
 *
 * @param {number} seed
 * @param {'light'|'dark'} [mode='light']
 */
export function generatePalette(seed, mode) {
  const rng = seededRandom(seed);
  const hue = Math.floor(rng() * 360);
  const sat = 30 + Math.floor(rng() * 25);
  const dark = mode === 'dark';

  const bgSat = Math.max(sat - 15, 8);
  const greySat = 6;

  // Luminance values flip for dark mode
  const L = dark
    ? { bg: 0.10, lighter: 0.18, light: 0.30, primary: 0.45, dark: 0.58, darker: 0.70, greyLight: 0.50, greyDark: 0.22 }
    : { bg: 0.95, lighter: 0.90, light: 0.83, primary: 0.75, dark: 0.62, darker: 0.48, greyLight: 0.82, greyDark: 0.45 };

  return {
    primary: `hsl(${hue}, ${sat}%, ${L.primary * 100}%)`,
    light: `hsl(${hue}, ${sat}%, ${L.light * 100}%)`,
    lighter: `hsl(${hue}, ${sat}%, ${L.lighter * 100}%)`,
    dark: `hsl(${hue}, ${sat}%, ${L.dark * 100}%)`,
    darker: `hsl(${hue}, ${sat}%, ${L.darker * 100}%)`,
    bg: `hsl(${hue}, ${bgSat}%, ${L.bg * 100}%)`,
    greyLight: `hsl(${hue}, ${greySat}%, ${L.greyLight * 100}%)`,
    greyDark: `hsl(${hue}, ${greySat}%, ${L.greyDark * 100}%)`,
    hue,
    sat,
    mode: dark ? 'dark' : 'light',
    primaryRgb: hslToRgb(hue / 360, sat / 100, L.primary),
    lightRgb: hslToRgb(hue / 360, sat / 100, L.light),
    darkRgb: hslToRgb(hue / 360, sat / 100, L.dark),
    darkerRgb: hslToRgb(hue / 360, sat / 100, L.darker),
    bgRgb: hslToRgb(hue / 360, bgSat / 100, L.bg),
    greyLightRgb: hslToRgb(hue / 360, greySat / 100, L.greyLight),
    greyDarkRgb: hslToRgb(hue / 360, greySat / 100, L.greyDark),
  };
}
