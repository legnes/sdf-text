import { header, distance } from './common-frag.js';

const shader = `
precision mediump float;

////////////////////////////////
// SETTINGS
// colors are in RGB
// period, width, and fuzziness are in pixels
// (of inherent resolution)
////////////////////////////////
const int PERIOD = 26;
const int EXTRA_WIDTH = 6;
const int FUZZINESS = 2;
////////////////////////////////

const float TWO_PI = 6.28318530718;
${header}
void main() {
${distance}
  float extraWidth = (sin(vUV.y * TWO_PI * uOutputResolution.y / float(PERIOD)) + 1.) * float(EXTRA_WIDTH);
  float isText = smoothstep(float(FUZZINESS), 0., distancePx - extraWidth);

  gl_FragColor = mix(vec4(uBackgroundColor, uBackgroundAlpha), vec4(uTextColor, 1), isText);
}

`;
export default shader;