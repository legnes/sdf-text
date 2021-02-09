import { header, distance } from './common-frag.js';

const shader = `
precision mediump float;
${header}
////////////////////////////////
// SETTINGS
// colors are in RGB
// distances and positions are in pixels
// (of inherent resolution)
////////////////////////////////
const int DOT_PERIOD = 8;
const int DOT_RADIUS = 4;

vec4 pattern(vec2 position) {
  float period = float(DOT_PERIOD);
  float distance = length(mod(position, 2. * period) - period);
  float isDot = smoothstep(2., 0., distance - float(DOT_RADIUS));
  float isBackground = (1. - isDot);
  return mix(vec4(uBackgroundColor, uBackgroundAlpha), vec4(uTextColor, 1), isDot);
}
////////////////////////////////

void main() {
${distance}
  float isText = smoothstep(2., 0., distancePx);

  gl_FragColor = mix(vec4(uBackgroundColor, uBackgroundAlpha), pattern(vUV * uOutputResolution), isText);
}

`;
export default shader;