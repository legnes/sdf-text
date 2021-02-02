const shader = `
precision mediump float;

////////////////////////////////
// SETTINGS
// colors are in RGBA
// distances and fuzziness are in pixels
// (of inherent resolution)
////////////////////////////////
const vec4 TEXT_COLOR = vec4(1, 0, 1, 1);
const vec4 RING_COLOR = vec4(0, 1, 1, 1);
const int RING_PERIOD = 6;
const int RING_WIDTH = 1;
const int RING_FUZZINESS = 1;
const int TEXT_FUZZINESS = 2;
const int RINGS_START = 6;
const int RINGS_END = 8;
const int RINGS_FADE = 8;
////////////////////////////////

varying vec2 vUV;

uniform sampler2D uSdf;
uniform vec2 uSdfResolution;
uniform vec2 uOutputResolution;

void main() {
  float distanceUV = texture2D(uSdf, vUV).r / uSdfResolution.x;
  float distancePx = distanceUV * uOutputResolution.x;

  float textFalloff = float(TEXT_FUZZINESS);
  float ringPeriod = float(RING_PERIOD);
  float ringRadius = float(RING_WIDTH) / 2.;
  float ringFalloff = float(RING_FUZZINESS);
  float concentricIndexStart = float(RINGS_START);
  float concentricIndexEnd = float(RINGS_END);
  float concentricIndexFalloff = float(RINGS_FADE);

  float isText = smoothstep(textFalloff, 0., distancePx);
  float concentricPosition = mod(distancePx, ringPeriod) - ringPeriod * 0.5;
  float concentricIndex = floor(distancePx / ringPeriod);
  float isConcentric = smoothstep(-ringFalloff, 0., concentricPosition + ringRadius) *
                       smoothstep(ringFalloff, 0., concentricPosition - ringRadius);
  float concentricFade = smoothstep(-concentricIndexFalloff, 0., concentricIndex - concentricIndexStart) *
                         smoothstep(concentricIndexFalloff, 0., concentricIndex - concentricIndexEnd);
  vec4 ringColor = vec4(RING_COLOR.rgb, concentricFade);
  isConcentric *= (1. - isText);

  gl_FragColor = isText * TEXT_COLOR + isConcentric * ringColor;
}

`;
export default shader;