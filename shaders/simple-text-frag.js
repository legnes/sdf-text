import { header, distance } from './common-frag.js';

const shader = `
precision mediump float;

////////////////////////////////
// SETTINGS
// colors are in RGB
// distances and fuzziness are in pixels
// (of inherent resolution)
////////////////////////////////
const int EXTRA_WIDTH = -0;
const int FUZZINESS = 2;
////////////////////////////////
${header}
void main() {
${distance}
  float isText = smoothstep(float(FUZZINESS), 0., distancePx - float(EXTRA_WIDTH));

  gl_FragColor = mix(vec4(uBackgroundColor, uBackgroundAlpha), vec4(uTextColor, 1), isText);
}

`;
export default shader;