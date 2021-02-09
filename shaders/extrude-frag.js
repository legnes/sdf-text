import { header, distance } from './common-frag.js';

const shader = `
precision mediump float;

////////////////////////////////
// SETTINGS
// colors are in RGB
// distances and fuzziness are in pixels
// (of inherent resolution)
// direction will be normalized
////////////////////////////////
const vec2 EXTRUSION_DIRECTION = vec2(1, -4);
const int EXTRUSION_START = 8;
const int EXTRUSION_END = 70;
const int EXTRUSION_EXTRA_WIDTH = 1;
const int EXTRUSION_FUZZINESS = 10;
const int TEXT_FUZZINESS = 1;
////////////////////////////////
${header}
void main() {
${distance}
  float isText = smoothstep(float(TEXT_FUZZINESS), 0., distancePx);
  float isExtrusion = 0.;

  vec2 extrusionDirection = normalize(EXTRUSION_DIRECTION);
  float extrusionStart = float(EXTRUSION_START);
  float extrusionEnd = float(EXTRUSION_END);
  float extrusionFalloff = float(EXTRUSION_FUZZINESS);
  float extrusionTolerance = float(EXTRUSION_EXTRA_WIDTH);

  vec2 extrusionUV = vUV;
  float extrudedDistancePx = 0.;
  float extrusionSdfUV = distanceUV;
  float extrusionSdfPx = distancePx;
  for (int i = 0; i < 40; i++) {
    extrusionUV -= extrusionSdfUV * extrusionDirection;
    if (extrusionUV.x < 0. || extrusionUV.y < 0. || extrusionUV.x > 1. || extrusionUV.y > 1.) {
      break;
    }

    extrudedDistancePx += extrusionSdfPx;
    if (extrudedDistancePx > extrusionEnd) {
      break;
    }

    extrusionSdfUV = texture2D(uSdf, extrusionUV).r / uSdfResolution.x;
    extrusionSdfPx = extrusionSdfUV * uOutputResolution.x;
    if (extrusionSdfPx < extrusionTolerance) {
      if (extrudedDistancePx > extrusionStart) {
        isExtrusion = smoothstep(0., extrusionFalloff, extrudedDistancePx - extrusionStart) *
                      smoothstep(0., -extrusionFalloff, extrudedDistancePx - extrusionEnd);
      }
      break;
    }
  }
  isExtrusion *= (1. - isText);

  float isBackground = (1. - isText) * (1. - isExtrusion);

  gl_FragColor = isText * vec4(uTextColor, 1) +
                 isExtrusion * vec4(uEffectColor, 1) +
                 isBackground * vec4(uBackgroundColor, uBackgroundAlpha);
}
`;
export default shader;