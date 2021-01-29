import simplePositionVert from './simple-position-vert.js';
import debugFrag from './debug-frag.js';
import rawFrag from './raw-frag.js';
import outlineFrag from './outline-frag.js';
import dropShadowFrag from './drop-shadow-frag.js';

const shaders = {
  vert: {
    simplePosition: simplePositionVert,
  },
  frag: {
    debug: debugFrag,
    raw: rawFrag,
    outline: outlineFrag,
    dropShadow: dropShadowFrag,
  },
};

export default shaders;