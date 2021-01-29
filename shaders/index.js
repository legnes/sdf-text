import simplePositionVert from './simple-position-vert.js';
import debugFrag from './debug-frag.js';
import textureFrag from './texture-frag.js';

const shaders = {
  vert: {
    simplePosition: simplePositionVert,
  },
  frag: {
    debug: debugFrag,
    texture: textureFrag,
  },
};

export default shaders;