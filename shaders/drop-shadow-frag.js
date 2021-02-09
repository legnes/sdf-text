import { header, distance } from './common-frag.js';

const shader = `
precision mediump float;

////////////////////////////////
// SETTINGS
// colors are in RGB
// distances and fuzziness are in pixels
// (of inherent resolution)
////////////////////////////////
const vec2 SHADOW_DIRECTION = vec2(-1, 2);
const int SHAODW_DISTANCE = 60;
const int SHADOW_EXTRA_WIDTH = -2;
const int SHADOW_FUZZINESS = 5;
const int TEXT_FUZZINESS = 2;
////////////////////////////////
${header}
void main() {
${distance}
  float isText = smoothstep(float(TEXT_FUZZINESS), 0., distancePx);
  float shadowTexelDistancePx = texture2D(uSdf, vUV - normalize(SHADOW_DIRECTION) * float(SHAODW_DISTANCE) / uOutputResolution).r / uSdfResolution.x * uOutputResolution.x;
  float isShadow = smoothstep(float(SHADOW_FUZZINESS), 0., shadowTexelDistancePx - float(SHADOW_EXTRA_WIDTH));
  isShadow *= (1. - isText);

  float isBackground = (1. - isText) * (1. - isShadow);

  gl_FragColor = isText * vec4(uTextColor, 1) +
                 isShadow * vec4(uEffectColor, 1) +
                 isBackground * vec4(uBackgroundColor, uBackgroundAlpha);
}
`;
export default shader;