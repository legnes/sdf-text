import simplePosition from './simple-position-vert.js';
import debug from './debug-frag.js';
import raw from './raw-frag.js';
import outline from './outline-frag.js';
import dropShadow from './drop-shadow-frag.js';
import extrude from './extrude-frag.js';
import concentric from './concentric-frag.js';
import simpleText from './simple-text-frag.js';
import gradient from './gradient-frag.js';
import patternMask from './pattern-mask-frag.js';

const shaders = {
  vert: {
    simplePosition,
  },
  frag: {
    // debug: debug,
    raw,
    simpleText,
    gradient,
    patternMask,
    outline,
    dropShadow,
    extrude,
    concentric,
  },
};

export default shaders;