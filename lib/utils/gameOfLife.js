import { seededRandom } from './hash.js';

/** Advance a Game of Life grid by one step (toroidal wrap). */
export function stepGOL(grid) {
  const h = grid.length;
  const w = grid[0].length;
  return grid.map((row, y) =>
    row.map((cell, x) => {
      let neighbors = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (!dy && !dx) continue;
          if (grid[(y + dy + h) % h][(x + dx + w) % w]) neighbors++;
        }
      }
      return cell ? (neighbors === 2 || neighbors === 3) : neighbors === 3;
    })
  );
}

/** Encode a grid state into a compact string key for cycle detection. */
function gridToKey(grid) {
  let key = '';
  let b = 0;
  let bi = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (cell) b |= (1 << bi);
      if (++bi === 8) {
        key += String.fromCharCode(b);
        b = 0;
        bi = 0;
      }
    }
  }
  if (bi > 0) key += String.fromCharCode(b);
  return key;
}

/** Count alive cells in a grid. */
function countAlive(grid) {
  let count = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (cell) count++;
    }
  }
  return count;
}

/**
 * Pre-compute a sequence of GOL frames from a seeded initial state.
 * Places known patterns (methuselahs + oscillators) then simulates until a cycle is detected.
 */
export function precomputeGOL(seed, gridSize) {
  const rng = seededRandom(seed);
  const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));

  // Methuselah-like seed patterns
  const methuselahs = [
    [[0, 1], [0, 2], [1, 0], [1, 1], [2, 1]],
    [[0, 1], [1, 3], [2, 0], [2, 1], [2, 4], [2, 5], [2, 6]],
    [[0, 0], [0, 1], [0, 2], [1, 1], [2, 0], [2, 1], [2, 2]],
    [[0, 0], [0, 1], [0, 2], [2, 1], [3, 1], [4, 1]],
    [[0, 0], [0, 1], [1, 0], [1, 2], [1, 3], [2, 1], [2, 2]],
  ];

  // Place 2 methuselah patterns
  for (let m = 0; m < 2; m++) {
    const pat = methuselahs[Math.floor(rng() * methuselahs.length)];
    const cx = 3 + Math.floor(rng() * (gridSize - 6));
    const cy = 3 + Math.floor(rng() * (gridSize - 6));
    const rot = Math.floor(rng() * 4);
    for (let [dy, dx] of pat) {
      for (let r = 0; r < rot; r++) {
        const tmp = dx;
        dx = -dy;
        dy = tmp;
      }
      grid[(cy + dy + gridSize) % gridSize][(cx + dx + gridSize) % gridSize] = true;
    }
  }

  // Place 3 oscillator patterns
  const oscillators = [
    [[0, -1], [0, 0], [0, 1]],       // blinker
    [[0, 0], [0, 1], [1, 0], [1, 1]], // block (still life)
  ];
  for (let i = 0; i < 3; i++) {
    const pat = oscillators[Math.floor(rng() * oscillators.length)];
    const ox = 2 + Math.floor(rng() * (gridSize - 4));
    const oy = 2 + Math.floor(rng() * (gridSize - 4));
    for (const [dy, dx] of pat) {
      grid[(oy + dy + gridSize) % gridSize][(ox + dx + gridSize) % gridSize] = true;
    }
  }

  // Simulate until cycle detected or 500 steps
  const allFrames = [grid];
  const seen = new Map();
  seen.set(gridToKey(grid), 0);
  let current = grid;

  for (let i = 1; i <= 500; i++) {
    current = stepGOL(current);
    const key = gridToKey(current);
    if (seen.has(key)) break;
    seen.set(key, i);
    allFrames.push(current);
  }

  // Filter out mostly-dead frames
  const goodFrames = allFrames.filter((f, i) => i === 0 || countAlive(f) > 6);
  return goodFrames.length > 10 ? goodFrames : allFrames.slice(0, Math.max(allFrames.length, 20));
}
