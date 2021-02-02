const shader = `
precision mediump float;

////////////////////////////////
// SETTINGS
// colors are in RGBA
// distances and positions are in pixels
// (of inherent resolution)
////////////////////////////////
const vec4 DOT_COLOR = vec4(1, 0, 1, 1);
const int DOT_PERIOD = 8;
const int DOT_RADIUS = 4;

vec4 pattern(vec2 position) {
  float period = float(DOT_PERIOD);
  float distance = length(mod(position, 2. * period) - period);
  float isDot = smoothstep(2., 0., distance - float(DOT_RADIUS));
  return isDot * DOT_COLOR;
}
////////////////////////////////

varying vec2 vUV;

uniform sampler2D uSdf;
uniform vec2 uSdfResolution;
uniform vec2 uOutputResolution;

void main() {
  float distanceUV = texture2D(uSdf, vUV).r / uSdfResolution.x;
  float distancePx = distanceUV * uOutputResolution.x;

  float isText = smoothstep(2., 0., distancePx);

  gl_FragColor = isText * pattern(vUV * uOutputResolution);
}

`;
export default shader;