const shader = `
precision mediump float;

////////////////////////////////
// SETTINGS
// colors are in RGBA
// distances and fuzziness are in pixels
// (of inherent resolution)
////////////////////////////////
const vec4 COLOR_A = vec4(1, 0, 1, 1);
const vec4 COLOR_B = vec4(0, 1, 1, 1);
const int FUZZINESS = 40;

vec4 gradient(vec2 uv) {
  // vertical
  // return mix(COLOR_A, COLOR_B, uv.y);

  // horizontal
  // return mix(COLOR_A, COLOR_B, uv.x);

  // center
  return mix(COLOR_A, COLOR_B, distance(uv, vec2(0.5)) * 2.);
}
////////////////////////////////

varying vec2 vUV;

uniform sampler2D uSdf;
uniform vec2 uSdfResolution;
uniform vec2 uOutputResolution;

void main() {
  float distanceUV = texture2D(uSdf, vUV).r / uSdfResolution.x;
  float distancePx = distanceUV * uOutputResolution.x;

  float isText = smoothstep(float(FUZZINESS), 0., distancePx);

  gl_FragColor = isText * gradient(vUV);
}

`;
export default shader;