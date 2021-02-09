import { header, distance } from './common-frag.js';

const shader = `
precision mediump float;
${header}
////////////////////////////////
// SETTINGS
// colors are in RGB
// distances and fuzziness are in pixels
// (of inherent resolution)
////////////////////////////////
const int FUZZINESS = 120;

vec3 gradient(vec2 uv) {
  // vertical
  // return mix(uTextColor, uEffectColor, uv.y);

  // horizontal
  // return mix(uTextColor, uEffectColor, uv.x);

  // center
  return mix(uTextColor, uEffectColor, distance(uv, vec2(0.5)) * 2.);
}
////////////////////////////////

void main() {
${distance}
  float isText = smoothstep(float(FUZZINESS), 0., distancePx);

  gl_FragColor = mix(vec4(uBackgroundColor, uBackgroundAlpha), vec4(gradient(vUV), 1), isText);
}

`;
export default shader;