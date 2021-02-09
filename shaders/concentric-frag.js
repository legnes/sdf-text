import { header, distance } from './common-frag.js';

const shader = `
precision mediump float;

////////////////////////////////
// SETTINGS
// colors are in RGB
// distances and fuzziness are in pixels
// (of inherent resolution)
////////////////////////////////
const int RING_PERIOD = 6;
const int RING_WIDTH = 1;
const int RING_FUZZINESS = 1;
const int TEXT_FUZZINESS = 2;
const int RINGS_START = 6;
const int RINGS_END = 8;
const int RINGS_FADE = 8;
////////////////////////////////
${header}
void main() {
${distance}
  float isText = smoothstep(float(TEXT_FUZZINESS), 0., distancePx);

  float ringPeriod = float(RING_PERIOD);
  float ringRadius = float(RING_WIDTH) / 2.;
  float ringFalloff = float(RING_FUZZINESS);
  float concentricIndexFalloff = float(RINGS_FADE);
  float concentricPosition = mod(distancePx, ringPeriod) - ringPeriod * 0.5;
  float concentricIndex = floor(distancePx / ringPeriod);
  float isConcentric = smoothstep(-ringFalloff, 0., concentricPosition + ringRadius) *
                       smoothstep(ringFalloff, 0., concentricPosition - ringRadius);
  float concentricFade = smoothstep(-concentricIndexFalloff, 0., concentricIndex - float(RINGS_START)) *
                         smoothstep(concentricIndexFalloff, 0., concentricIndex - float(RINGS_END));
  vec4 ringColor = vec4(uEffectColor, concentricFade);
  isConcentric *= (1. - isText);

  float isBackground = (1. - isText) * (1. - isConcentric);

  gl_FragColor = isText * vec4(uTextColor, 1) +
                 isConcentric * ringColor +
                 isBackground * vec4(uBackgroundColor, uBackgroundAlpha);
}

`;
export default shader;