# Agent Avatars

Deterministic, animated avatar identities for AI agents. Framework-agnostic vanilla JS — works everywhere: plain HTML, Svelte, React, Vue.

Each avatar is derived from a seed string (agent name, UUID, etc). Same seed always produces the same visual. Avatars animate when active and smoothly wind down when idle.

22 styles ranging from organic blobs to voronoi cells, boids flocking, flow fields, Game of Life, and more.

## Install

```bash
npm install agent-avatars
```

Or load the IIFE bundle directly:

```html
<script src="agent-avatars.iife.js"></script>
```

## Usage

```js
import { create, styles } from 'agent-avatars';

const avatar = create(document.getElementById('container'), {
  style: 'boids',        // one of 22 styles
  seed: 'agent-uuid',    // any string or number
  size: 48,              // CSS pixels (default: 48)
  active: false,         // animate on creation (default: false)
  mode: 'light',         // 'light' or 'dark' (default: 'light')
});

avatar.setActive(true);   // start animating (800ms ramp-up)
avatar.setActive(false);  // wind down (1500ms ramp-down)
avatar.setSeed('new-id'); // rebuild with new identity
avatar.setMode('dark');   // switch color mode
avatar.destroy();         // remove canvas, stop animation
```

### Available styles

```js
import { styles } from 'agent-avatars';
// => ['blob', 'spiral', 'plasma', 'interference', 'weave', 'lissajous',
//     'ripple', 'warp', 'voronoi', 'voronoi-wire', 'voronoi-gradient',
//     'voronoi-stained', 'voronoi-topo', 'boids', 'flow-field',
//     'layered-flow', 'triple-gol', 'organic-rings', 'pixel',
//     'pixel-diamond', 'maze', 'orbital']
```

### IIFE / script tag

```html
<script src="agent-avatars.iife.js"></script>
<script>
  const avatar = AgentAvatars.create(el, { style: 'spiral', seed: 'hello' });
</script>
```

## Build

```bash
npm run build
```

Produces `dist/agent-avatars.js` (ESM) and `dist/agent-avatars.iife.js` (global).

Bundle size: ~13 KB gzipped.

## How it works

All 22 avatars render to `<canvas>`. A shared `requestAnimationFrame` loop drives all active instances from a single RAF. Each avatar computes its colors deterministically from the seed via a seeded PRNG and HSL palette generation.

Energy ramp: activation smoothly ramps energy from 0 to 1 over 800ms; deactivation ramps down over 1500ms. Renderers use the energy value to control animation intensity — drift, particle speed, trail opacity, etc.

Canvas resolution is DPR-aware, capped at 200px buffer size. All avatars are clipped to a circle.

### Architecture

```
lib/
  index.js              Public API (create, styles)
  canvas-manager.js     Canvas lifecycle, energy ramp, animation loop
  voronoi-engine.js     Shared voronoi renderer (5 variants)
  registry.js           Style name -> renderer factory mapping
  utils/
    hash.js             Deterministic string hashing and seeded PRNG
    color.js            HSL/RGB conversion, palette generation, dark mode
    flowField.js        Flow field vector math
    gameOfLife.js        Game of Life simulation
    animationLoop.js    Shared requestAnimationFrame coordinator
  renderers/
    blob.js             22 renderer modules, one per style
    ...
```

## License

MIT
