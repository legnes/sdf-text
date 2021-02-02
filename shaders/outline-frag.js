const shader = `
precision mediump float;

////////////////////////////////
// SETTINGS
// colors are in RGBA
// distances and fuzziness are in pixels
// (of inherent resolution)
////////////////////////////////
const vec4 BACKGROUND_COLOR = vec4(1, 1, 1, 0);
const vec4 TEXT_COLOR = vec4(1, 0, 1, 1);
const vec4 OUTLINE_COLOR = vec4(0, 1, 1, 1);
const int OUTLINE_START = 88;
const int OUTLINE_END = 98;
const int OUTLINE_FUZZINESS = 5;
const int TEXT_FUZZINESS = 2;
////////////////////////////////

varying vec2 vUV;

uniform sampler2D uSdf;
uniform vec2 uSdfResolution;
uniform vec2 uOutputResolution;

void main() {
  float distanceUV = texture2D(uSdf, vUV).r / uSdfResolution.x;
  float distancePx = distanceUV * uOutputResolution.x;

  float isText = smoothstep(float(TEXT_FUZZINESS), 0., distancePx);

  float outlineFalloff = float(OUTLINE_FUZZINESS);
  float isOutline = smoothstep(-outlineFalloff, 0., distancePx - float(OUTLINE_START)) *
                    smoothstep(outlineFalloff, 0., distancePx - float(OUTLINE_END));

  float isBackground = (1. - isText) * (1. - isOutline);

  gl_FragColor = isText * TEXT_COLOR +
                 isOutline * OUTLINE_COLOR +
                 isBackground * BACKGROUND_COLOR;
}

`;
export default shader;