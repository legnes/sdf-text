const shader = `
precision mediump float;
 
varying vec2 vUV;

uniform sampler2D uTexture;

void main() {
  float TEX_RES = 256.;
  float OUTPUT_RES = 1024.;
  float value = texture2D(uTexture, vUV).r * OUTPUT_RES / TEX_RES;
  // gl_FragColor = abs(value) < 1. ? vec4(0, 0, 0, 1) : (value > 1. && mod(floor(value + .5), 10.) == 0.) ? vec4(1, 0, 1, 1) : value < -5.5 ? vec4(1, 1, 1, 1) : vec4(0, 1, 1, 1);
  float outline = 0.;
  // outline += smoothstep(8., 10., value) * smoothstep(12., 10., value);
  outline += smoothstep(2., 0., value);

  float modVal = mod(value, 10.);
  float modOutline = smoothstep(3., 5., modVal) * smoothstep(7., 5., modVal);
  gl_FragColor = vec4(vec3(outline + modOutline), 1);

  // float usdf = abs(texture2D(uTexture, vUV).r);
  // gl_FragColor = vec4(vec3(mod(usdf, 10.) / 10.), 1);
}
`;
export default shader;