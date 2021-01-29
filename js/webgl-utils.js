import shaders from '../shaders/index.js';

// Based heavily on
// https://webglfundamentals.org/webgl/lessons/webgl-fundamentals.html

const createShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
 
  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
};

const createProgram = (gl, vertShaderSource, fragShaderSource) => {
  const vertShader = createShader(gl, gl.VERTEX_SHADER, vertShaderSource);
  const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragShaderSource);
  const program = gl.createProgram();
  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }
 
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
};

export const createScene = (gl) => {
  // extension
  gl.getExtension('OES_texture_float');
  gl.getExtension('OES_texture_float_linear');

  // program
  const program = createProgram(gl, shaders.vert.simplePosition, shaders.frag.texture);
  const positionAttributeLocation = gl.getAttribLocation(program, 'aPosition');
  const textureUniformLocation = gl.getUniformLocation(program, 'uTexture');
  gl.useProgram(program);

  // geometry: full screen quad
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = [
    0, 0,
    1, 0,
    0, 1,
    0, 1,
    1, 0,
    1, 1
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  // texture
  const texture = gl.createTexture();
  // gl.activeTexture(gl.TEXTURE0); // in case we want more textures later
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(textureUniformLocation, 0);
  
  // setup
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

export const updateTexture = (gl, textureSource) => {
  // gl.activeTexture(gl.TEXTURE0); // in case we want more textures later
  // from canvas
  // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.FLOAT, textureSource, 0);

  // webgl1 
  // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.FLOAT, textureSource, 0);

  // webgl2
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 256, 256, 0, gl.RGBA, gl.FLOAT, textureSource, 0);
};

export const render = (gl) => {
  // gl.clearColor(0, 0, 0, 0);
  // gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
};
