/**
 * Deterministic hash from a string. Always returns a positive integer.
 */
export function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 1;
}

/**
 * Seeded PRNG using a linear congruential generator.
 * Returns a function that produces deterministic floats in [0, 1).
 */
export function seededRandom(seed) {
  let s = ((seed % 2147483647) + 2147483647) % 2147483647;
  if (s === 0) s = 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
