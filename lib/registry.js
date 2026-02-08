import { create as blob } from './renderers/blob.js';
import { create as tripleGol } from './renderers/triple-gol.js';
import { create as organicRings } from './renderers/organic-rings.js';
import { create as pixel } from './renderers/pixel.js';
import { create as pixelDiamond } from './renderers/pixel-diamond.js';
import { create as interference } from './renderers/interference.js';
import { create as flowField } from './renderers/flow-field.js';
import { create as layeredFlow } from './renderers/layered-flow.js';
import { create as voronoi } from './renderers/voronoi.js';
import { create as voronoiWire } from './renderers/voronoi-wire.js';
import { create as voronoiGradient } from './renderers/voronoi-gradient.js';
import { create as voronoiStained } from './renderers/voronoi-stained.js';
import { create as voronoiTopo } from './renderers/voronoi-topo.js';
import { create as spiral } from './renderers/spiral.js';
import { create as plasma } from './renderers/plasma.js';
import { create as maze } from './renderers/maze.js';
import { create as orbital } from './renderers/orbital.js';
import { create as lissajous } from './renderers/lissajous.js';
import { create as boids } from './renderers/boids.js';
import { create as ripple } from './renderers/ripple.js';
import { create as weave } from './renderers/weave.js';
import { create as warp } from './renderers/warp.js';

export const renderers = {
  'blob': blob,
  'triple-gol': tripleGol,
  'organic-rings': organicRings,
  'pixel': pixel,
  'pixel-diamond': pixelDiamond,
  'interference': interference,
  'flow-field': flowField,
  'layered-flow': layeredFlow,
  'voronoi': voronoi,
  'voronoi-wire': voronoiWire,
  'voronoi-gradient': voronoiGradient,
  'voronoi-stained': voronoiStained,
  'voronoi-topo': voronoiTopo,
  'spiral': spiral,
  'plasma': plasma,
  'maze': maze,
  'orbital': orbital,
  'lissajous': lissajous,
  'boids': boids,
  'ripple': ripple,
  'weave': weave,
  'warp': warp,
};
