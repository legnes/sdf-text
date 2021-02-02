const shader = `
precision mediump float;

////////////////////////////////
// SETTINGS
// colors are in RGBA
// distances and fuzziness are in pixels
// (of inherent resolution)
////////////////////////////////
const vec4 TEXT_COLOR = vec4(1, 0, 1, 1);
const vec4 SHAODW_COLOR = vec4(0, 1, 1, 1);
const vec2 SHADOW_DIRECTION = vec2(-1, 2);
const int SHAODW_DISTANCE = 60;
const int SHADOW_EXTRA_WIDTH = -2;
const int SHADOW_FUZZINESS = 5;
const int TEXT_FUZZINESS = 2;
////////////////////////////////

varying vec2 vUV;

uniform sampler2D uSdf;
uniform vec2 uSdfResolution;
uniform vec2 uOutputResolution;

void main() {
  float distanceUV = texture2D(uSdf, vUV).r / uSdfResolution.x;
  float distancePx = distanceUV * uOutputResolution.x;

  vec2 shadowDirection = normalize(SHADOW_DIRECTION);
  float shadowDistance = float(SHAODW_DISTANCE);
  float shadowTolerance = float(SHADOW_EXTRA_WIDTH);
  float shadowFalloff = float(SHADOW_FUZZINESS);
  float textFalloff = float(TEXT_FUZZINESS);

  float isText = smoothstep(textFalloff, 0., distancePx);
  float shadowTexelDistancePx = texture2D(uSdf, vUV - shadowDirection * shadowDistance / uOutputResolution).r / uSdfResolution.x * uOutputResolution.x;
  float isShadow = smoothstep(shadowFalloff, 0., shadowTexelDistancePx - shadowTolerance);
  isShadow *= (1. - isText);

  gl_FragColor = isText * TEXT_COLOR + isShadow * SHAODW_COLOR;
}
`;
export default shader;