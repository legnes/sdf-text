const shader = `
precision mediump float;

////////////////////////////////
// SETTINGS
// colors are in RGBA
// distances and fuzziness are in pixels
// (of inherent resolution)
////////////////////////////////
const vec4 COLOR = vec4(1, 0, 1, 1);
const int EXTRA_WIDTH = -0;
const int FUZZINESS = 2;
////////////////////////////////

varying vec2 vUV;

uniform sampler2D uSdf;
uniform vec2 uSdfResolution;
uniform vec2 uOutputResolution;

void main() {
  float distanceUV = texture2D(uSdf, vUV).r / uSdfResolution.x;
  float distancePx = distanceUV * uOutputResolution.x;

  float isText = smoothstep(float(FUZZINESS), 0., distancePx - float(EXTRA_WIDTH));

  gl_FragColor = isText * COLOR;
}

`;
export default shader;