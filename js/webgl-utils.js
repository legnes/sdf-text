import shaders from '../shaders/index.js';

export const createContext = (canvas) => {
  let gl;
  let isWebgl2 = false;

  if (gl = canvas.getContext('webgl2')) {
    isWebgl2 = true;
  } else if (gl = canvas.getContext('webgl')) {
    if (!gl.getExtension('OES_texture_float')) {
      throw new Error('Could not find float texture support!');
    }
  } else {
    throw new Error('Could not find webgl!');
  }
  
  if (!gl.getExtension('OES_texture_float_linear')) {
    throw new Error('Could not find linear float texture filtering!');
  }

  return { ctx: gl, isWebgl2 };
}

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

const createProgram = (gl, vertShader, fragShader) => {
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

export const createPipeline = (gl, fragSource, pipeline) => {
  if (pipeline.program) {
    gl.deleteProgram(pipeline.program);
  }
  if (pipeline.fragShader) {
    gl.deleteShader(pipeline.fragShader);
  }
  pipeline.uniformLocations = null;

  const vertShader = pipeline.vertShader || createShader(gl, gl.VERTEX_SHADER, shaders.vert.simplePosition);
  const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragSource);
  const program = createProgram(gl, vertShader, fragShader);
  const positionAttributeLocation = gl.getAttribLocation(program, 'aPosition');
  const textureUniformLocation = gl.getUniformLocation(program, 'uSdf');
  
  gl.useProgram(program);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
  gl.uniform1i(textureUniformLocation, 0);

  pipeline.fragShader = fragShader;
  pipeline.program = program;
  return pipeline;
};

export const createStaticScene = (gl) => {
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

  // sdf texture
  const texture = gl.createTexture();
  // gl.activeTexture(gl.TEXTURE0); // in case we want more textures later
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // setup
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

export const updateTexture = (gl, textureSource, isWebgl2) => {
  // gl.activeTexture(gl.TEXTURE0); // in case we want more textures later

  // from canvas
  // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.FLOAT, textureSource, 0);

  // from array buffer view
  const dimension = Math.sqrt(textureSource.length / 4);
  if (isWebgl2) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, dimension, dimension, 0, gl.RGBA, gl.FLOAT, textureSource, 0);
  } else {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, dimension, dimension, 0, gl.RGBA, gl.FLOAT, textureSource, 0);
  }
};

export const render = (gl, pipeline, uniforms) => {
  // TODO: add safety/checking?
  const uniformLocations = pipeline.uniformLocations || uniforms.map((uniform) => gl.getUniformLocation(pipeline.program, uniform.name));
  pipeline.uniformLocations = uniformLocations;
  uniforms.forEach((uniform, idx) => {
    gl[`uniform${uniform.values.length}f`](uniformLocations[idx], ...uniform.values);
  });

  // gl.clearColor(0, 0, 0, 0);
  // gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
};
