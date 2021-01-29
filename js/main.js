import { createScene, updateTexture, render } from './webgl-utils.js';

// https://github.com/mapbox/tiny-sdf/blob/master/index.js
// http://cs.brown.edu/people/pfelzens/papers/dt-final.pdf
// https://github.com/Lisapple/8SSEDT

// PLAN
// [ ] Text area
// [ ] Font inputs
// [ ] Editable shaders
// [ ] More shader variables
// [ ] Different shader styles
// [X] Dynamic resolution (bypass sdf canvas)
// [ ] Quality slider (text canvas resolution)


const Inf = 1e20;

const state = {
  text: '',
  glyphs: {
    canvas: null,
    ctx: null,
  },
  sdf: {
    canvas: null,
    ctx: null,
  },
  webgl: {
    canvas: null,
    ctx: null,
  }
};

const initDom = () => {
  document.querySelector('input').addEventListener('input', (evt) => update(evt.target.value));
  state.glyphs.canvas = document.querySelector('#glyphsCanvas');
  state.sdf.canvas = document.querySelector('#sdfCanvas');
  state.webgl.canvas = document.querySelector('#webglCanvas');
};

const initGlyphs = () => {
  // TODO: add inputs for font styles
  state.glyphs.ctx = state.glyphs.canvas.getContext('2d');
  // state.glyphs.ctx.font = 'bold 100px Arial';
  state.glyphs.ctx.font = '30px Arial';
  state.glyphs.ctx.textAlign = 'center';
};

const initSdf = () => {
  state.sdf.ctx = state.sdf.canvas.getContext('2d');
};

const initWebgl = () => {
  const gl = state.webgl.canvas.getContext('webgl2');
  if (!gl) throw new Error('WebGL not found!');
  state.webgl.ctx = gl;
  createScene(gl);
}

const init = () => {
  initDom();
  initGlyphs();
  initSdf();
  initWebgl();
};

const update = (value) => {
  state.text = value;

  const glyphsWidth = state.glyphs.canvas.width;
  const glyphsHeight = state.glyphs.canvas.height;
  const glyphsArea = glyphsWidth * glyphsHeight;

  state.glyphs.ctx.clearRect(0, 0, glyphsWidth, glyphsHeight);
  state.glyphs.ctx.fillText(value, glyphsWidth / 2, glyphsHeight / 2);

  const glyphImage = state.glyphs.ctx.getImageData(0, 0, glyphsWidth, glyphsHeight);
  
  // Generate sdf
  const sdfDataOutside = new Float32Array(glyphsArea);
  const sdfDataInside = new Float32Array(glyphsArea);
  for (let i = 0; i < sdfDataOutside.length; i++) {
    const glyphAlpha = glyphImage.data[i * 4 + 3];
    sdfDataOutside[i] = glyphAlpha >= 254 ? 0 : glyphAlpha < 1 ? Inf : (255 - glyphAlpha) / 255;
    sdfDataInside[i] = glyphAlpha >= 254 ? Inf : glyphAlpha < 1 ? 0 : glyphAlpha / 255;
  }
  edt(sdfDataOutside, glyphsWidth, glyphsHeight);
  edt(sdfDataInside, glyphsWidth, glyphsHeight);

  // copy sdf --> canvas
  const radius = glyphsWidth / 2;
  const sdfImage = state.sdf.ctx.createImageData(glyphsWidth, glyphsHeight);
  const arrayBufferView = new Float32Array(glyphsArea * 4);
  for (let i = 0; i < glyphsArea; i++) {
    const sd = Math.sqrt(sdfDataOutside[i]) - Math.sqrt(sdfDataInside[i]);
    for (let j = 0; j < 3; j++) {
      sdfImage.data[i * 4 + j] = (sd / radius * .5 + .5) * 255;
    }
    sdfImage.data[i * 4 + 3] = 255;
    arrayBufferView[i * 4] = sd;
  }
  state.sdf.ctx.putImageData(sdfImage, 0, 0);

  const gl = state.webgl.ctx;
  updateTexture(gl, arrayBufferView);
  render(gl);
};

const edt = (data, width, height) => {
  for (let y = 0; y < height; y++) {
    edt1d(data, y * width, 1, width);
  }
  for (let x = 0; x < width; x++) {
    edt1d(data, x, width, height);
  }
};

const edt1d = (data, offset, stride, length) => {
  // copy row/col
  const f = [];
  for (let q = 0; q < length; q++) {
    f[q] = data[offset + q * stride];
  }

  // begin alg
  let k = 0;
  const v = [0];
  const z = [-Infinity, Infinity];

  for (let q = 1; q < length; q++) {
    let s;
    do {
      const r = v[k];
      s = (f[q] - f[r] + q * q - r * r) / (q - r) / 2;
    } while (s <= z[k] && --k > -1)

    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = Infinity;
  }

  k = 0;
  for (let q = 0; q < length; q++) {
    while (z[k + 1] < q) {
      k++;
    }
    data[offset + q * stride] = (q - v[k]) * (q - v[k]) + f[v[k]];
  }
};

init();