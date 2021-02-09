import { header, distance } from './common-frag.js';

const shader = `
precision mediump float;

////////////////////////////////
// SETTINGS
// colors are in RGB
// distances and fuzziness are in pixels
// (of inherent resolution)
////////////////////////////////
const int OUTLINE_START = 88;
const int OUTLINE_END = 98;
const int OUTLINE_FUZZINESS = 5;
const int TEXT_FUZZINESS = 2;
////////////////////////////////
${header}
void main() {
${distance}
  float isText = smoothstep(float(TEXT_FUZZINESS), 0., distancePx);

  float outlineFalloff = float(OUTLINE_FUZZINESS);
  float isOutline = smoothstep(-outlineFalloff, 0., distancePx - float(OUTLINE_START)) *
                    smoothstep(outlineFalloff, 0., distancePx - float(OUTLINE_END));

  float isBackground = (1. - isText) * (1. - isOutline);

  gl_FragColor = isText * vec4(uTextColor, 1) +
                 isOutline * vec4(uEffectColor, 1) +
                 isBackground * vec4(uBackgroundColor, uBackgroundAlpha);
}

`;
export default shader;