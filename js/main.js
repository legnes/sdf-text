import { createContext, createStaticScene, createOrUpdatePipeline, updateTexture, render, resize } from './webgl-utils.js';
import { populateOptions, bindStateListener, hexToRgb } from './dom-utils.js';
import distanceTransforms from './distance-transforms.js';
import shaders from '../shaders/index.js';

const state = {
  input: {
    text: 'type\nhere!',
    font: {
      style: 'normal',
      variant: 'normal',
      weight: 'normal',
      size: 400,
      family: 'Garamond'
    },
    distanceTransform: {
      name: 'euclidean'
    },
    shader: {
      name: 'outline',
      editor: null,
      output: null
    },
    colors: {
      textColor: '#ff00ff',
      effectColor: '#00ffff',
      backgroundColor: '#000000',
      transparentBackground: true
    }
  },
  glyphs: {
    canvas: null,
    ctx: null,
  },
  webgl: {
    canvas: null,
    ctx: null,
    isWebgl2: false,
    pipeline: {},
    uniforms: [
      {
        name: 'uSdfResolution',
        values: [-1, -1]
      },
      {
        name: 'uOutputResolution',
        values: [-1, -1]
      },
      {
        name: 'uTextColor',
        values: [1, 1, 1]
      },
      {
        name: 'uEffectColor',
        values: [1, 1, 1]
      },
      {
        name: 'uBackgroundColor',
        values: [1, 1, 1]
      },
      {
        name: 'uBackgroundAlpha',
        values: [1]
      }
    ]
  },
};

const initDom = () => {
  state.glyphs.canvas = document.querySelector('#glyphsCanvas');
  state.webgl.canvas = document.querySelector('#webglCanvas');

  bindStateListener('#textInput', 'input', 'input.text', renderFull, state);
  bindStateListener('#fontStyleSelect', 'change', 'input.font.style', updateFontAndRenderFull, state);
  bindStateListener('#fontVariantSelect', 'change', 'input.font.variant', updateFontAndRenderFull, state);
  bindStateListener('#fontWeightSelect', 'change', 'input.font.weight', updateFontAndRenderFull, state);
  bindStateListener('#fontSizeInput', 'input', 'input.font.size', updateFontAndRenderFull, state);
  bindStateListener('#fontFamilySelect', 'change', 'input.font.family', updateFontAndRenderFull, state);

  populateOptions('#distanceTransformSelect', distanceTransforms, state.input.distanceTransform.name);
  bindStateListener('#distanceTransformSelect', 'change', 'input.distanceTransform.name', renderFull, state);

  bindStateListener('#textColorInput', 'input', 'input.colors.textColor', updateColorUniformsAndRenderWebgl, state);
  bindStateListener('#effectColorInput', 'input', 'input.colors.effectColor', updateColorUniformsAndRenderWebgl, state);
  bindStateListener('#backgroundColorInput', 'input', 'input.colors.backgroundColor', updateColorUniformsAndRenderWebgl, state);
  bindStateListener('#backgroundTransparencyInput', 'change', 'input.colors.transparentBackground', updateColorUniformsAndRenderWebgl, state);
  updateColorUniforms();

  document.querySelector('#sdfResolution').addEventListener('change', (evt) => {
    const resolution = parseInt(evt.target.value);
    state.glyphs.canvas.width = resolution;
    state.glyphs.canvas.height = resolution;
    // seems like we have to reset this
    state.glyphs.ctx.textAlign = 'center';
    state.glyphs.ctx.textBaseline = 'middle';
    updateFontAndRenderFull();
  });

  document.querySelector('#webglResolution').addEventListener('change', (evt) => {
    const resolution = parseInt(evt.target.value);
    state.webgl.canvas.width = resolution;
    state.webgl.canvas.height = resolution;
    resize(state.webgl.ctx);
    renderWebgl();
  });

  populateOptions('#shaderPresetSelect', shaders.frag, state.input.shader.name);
  bindStateListener('#shaderPresetSelect', 'change', 'input.shader.name', () => {
    loadShader();
    renderWebgl();
  }, state);

  state.input.shader.editor = document.querySelector('#shaderEditor');
  state.input.shader.editor.addEventListener('input', (evt) => {
    updateShader();
    renderWebgl();
  });
  state.input.shader.output = document.querySelector('#shaderOutput');

  const editorContainer = document.querySelector('#editorContainer');
  document.querySelector('#showEditorInput').addEventListener('input', (evt) => {
    editorContainer.className = evt.target.checked ? '' : 'hidden';
  });
};

const initGlyphs = () => {
  state.glyphs.ctx = state.glyphs.canvas.getContext('2d');
  state.glyphs.ctx.textAlign = 'center';
  state.glyphs.ctx.textBaseline = 'middle';
  updateFont();
};

const initWebgl = () => {
  const context = createContext(state.webgl.canvas);
  state.webgl.ctx = context.ctx;
  state.webgl.isWebgl2 = context.isWebgl2;
  createStaticScene(state.webgl.ctx);
  loadShader();
};

const init = () => {
  initDom();
  initGlyphs();
  initWebgl();
};

const updateFont = () => {
  let { style, variant, weight, size, family } = state.input.font;
  size *= state.glyphs.canvas.width / state.webgl.canvas.width;
  state.glyphs.ctx.font = `${style} ${variant} ${weight} ${size}px ${family}`;
};

const updateFontAndRenderFull = () => {
  updateFont();
  renderFull();
};

const updateColorUniforms = () => {
  hexToRgb(state.webgl.uniforms[2].values, state.input.colors.textColor);
  hexToRgb(state.webgl.uniforms[3].values, state.input.colors.effectColor);
  hexToRgb(state.webgl.uniforms[4].values, state.input.colors.backgroundColor);
  state.webgl.uniforms[5].values[0] = state.input.colors.transparentBackground ? 0 : 1;
};

const updateColorUniformsAndRenderWebgl = () => {
  updateColorUniforms();
  renderWebgl();
};

const loadShader = () => {
  const source = shaders.frag[state.input.shader.name];
  state.input.shader.editor.value = source;
  updateShader();
};

const updateShader = () => {
  const source = state.input.shader.editor.value;
  createOrUpdatePipeline(state.webgl.ctx, source, state.webgl.pipeline);
  state.input.shader.output.innerHTML = state.webgl.pipeline.error;
};

// With inspiration from
// https://github.com/mapbox/tiny-sdf/blob/master/index.js
// http://cs.brown.edu/people/pfelzens/papers/dt-final.pdf
// https://github.com/Lisapple/8SSEDT
const Inf = 1e20;
let sdfDataOutside, sdfDataInside, texture;
const renderSdf = () => {
  const glyphsWidth = state.glyphs.canvas.width;
  const glyphsHeight = state.glyphs.canvas.height;
  const glyphsArea = glyphsWidth * glyphsHeight;

  // Lazily manage resources
  if (!sdfDataOutside || !sdfDataInside || sdfDataOutside.length < glyphsArea || sdfDataInside.length < glyphsArea) {
    sdfDataOutside = new Float32Array(glyphsArea);
    sdfDataInside = new Float32Array(glyphsArea);
  }
  if (!texture || texture.length < glyphsArea * 4) {
    texture = new Float32Array(glyphsArea * 4);
  }

  // Draw text to canvas and caputre
  const lines = state.input.text.split('\n');
  const middleLine = (lines.length - 1) / 2;
  const lineHeight = state.input.font.size * state.glyphs.canvas.height / state.webgl.canvas.height;
  state.glyphs.ctx.clearRect(0, 0, glyphsWidth, glyphsHeight);
  lines.forEach((line, idx) => {
    state.glyphs.ctx.fillText(line, glyphsWidth / 2, glyphsHeight / 2 + (idx - middleLine) * lineHeight );
  });
  const glyphImage = state.glyphs.ctx.getImageData(0, 0, glyphsWidth, glyphsHeight);

  // Generate sdf using a distance transform func to generate two unsigned distance fields
  // (one to outside of glpyh, one to inside of glyph), and then subtract to get signed distance
  for (let i = 0; i < glyphsArea; i++) {
    const glyphAlpha = glyphImage.data[i * 4 + 3];
    sdfDataOutside[i] = glyphAlpha >= 254 ? 0 : glyphAlpha < 1 ? Inf : (255 - glyphAlpha) / 255;
    sdfDataInside[i] = glyphAlpha >= 254 ? Inf : glyphAlpha < 1 ? 0 : glyphAlpha / 255;
  }
  const distanceTransform = distanceTransforms[state.input.distanceTransform.name];
  distanceTransform(sdfDataOutside, glyphsWidth, glyphsHeight);
  distanceTransform(sdfDataInside, glyphsWidth, glyphsHeight);

  // Send sdf up to webgl
  for (let i = 0; i < glyphsArea; i++) {
    const sd = sdfDataOutside[i] - sdfDataInside[i];
    texture[i * 4] = sd;
  }
  updateTexture(state.webgl.ctx, texture, glyphsWidth, glyphsHeight, state.webgl.isWebgl2);
};

const renderWebgl = () => {
  const uniforms = state.webgl.uniforms;
  uniforms[0].values[0] = state.glyphs.canvas.width;
  uniforms[0].values[1] = state.glyphs.canvas.height;
  uniforms[1].values[0] = state.webgl.canvas.width;
  uniforms[1].values[1] = state.webgl.canvas.height;

  const gl = state.webgl.ctx;
  render(gl, state.webgl.pipeline, uniforms);
};

const renderFull = () => {
  renderSdf();
  renderWebgl();
};

init();
renderFull();