const shader = `
precision mediump float;

////////////////////////////////
// SETTINGS
// colors are in RGBA
// distances and fuzziness are in pixels
// (of inherent resolution)
// direction will be normalized
////////////////////////////////
const vec4 TEXT_COLOR = vec4(1, 0, 1, 1);
const vec4 EXTRUSION_COLOR = vec4(0, 1, 1, 1);
const vec2 EXTRUSION_DIRECTION = vec2(1, -4);
const int EXTRUSION_START = 8;
const int EXTRUSION_END = 70;
const int EXTRUSION_EXTRA_WIDTH = 1;
const int EXTRUSION_FUZZINESS = 10;
const int TEXT_FUZZINESS = 1;
////////////////////////////////

varying vec2 vUV;

uniform sampler2D uSdf;
uniform vec2 uSdfResolution;
uniform vec2 uOutputResolution;

void main() {
  float distanceUV = texture2D(uSdf, vUV).r / uSdfResolution.x;
  float distancePx = distanceUV * uOutputResolution.x;

  vec2 extrusionDirection = normalize(EXTRUSION_DIRECTION);
  float extrusionStart = float(EXTRUSION_START);
  float extrusionEnd = float(EXTRUSION_END);
  float extrusionFalloff = float(EXTRUSION_FUZZINESS);
  float textFalloff = float(TEXT_FUZZINESS);
  float extrusionTolerance = float(EXTRUSION_EXTRA_WIDTH);

  float isText = smoothstep(textFalloff, 0., distancePx);
  float isExtrusion = 0.;

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

  gl_FragColor = isText * TEXT_COLOR + isExtrusion * EXTRUSION_COLOR;
}
`;
export default shader;