const shader = `
precision mediump float;

// SETTINGS
// colors are in RGBA
// distances and fuzziness are in pixels
// (of inherent resolution)
const vec4 TEXT_COLOR = vec4(1, 0, 1, 1);
const vec4 OUTLINE_COLOR = vec4(0, 1, 1, 1);
const int OUTLINE_START = 60;
const int OUTLINE_END = 70;
const int OUTLINE_FUZZINESS = 5;
const int TEXT_FUZZINESS = 2;

varying vec2 vUV;

uniform sampler2D uSdf;
uniform vec2 uSdfResolution;
uniform vec2 uOutputResolution;

void main() {
  float distanceUV = texture2D(uSdf, vUV).r / uSdfResolution.x;
  float distancePx = distanceUV * uOutputResolution.x;

  float outlineStart = float(OUTLINE_START);
  float outlineEnd = float(OUTLINE_END);
  float textFalloff = float(TEXT_FUZZINESS);
  float outlineFalloff = float(OUTLINE_FUZZINESS);

  float isText = smoothstep(textFalloff, 0., distancePx);
  float isOutline = smoothstep(-outlineFalloff, 0., distancePx - outlineStart) *
                    smoothstep(outlineFalloff, 0., distancePx - outlineEnd);

  gl_FragColor = isText * TEXT_COLOR + isOutline * OUTLINE_COLOR;
}

`;
export default shader;