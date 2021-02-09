import { header, distance } from './common-frag.js';

const shader = `
precision mediump float;

////////////////////////////////
// SETTINGS
// colors are in RGB
// distances and fuzziness are in pixels
// (of inherent resolution)
////////////////////////////////
const int FUZZINESS = 50;
////////////////////////////////
${header}
const mat4 BAYER_4_4 = mat4(
  0.0000, 0.7500, 0.1875, 0.9375,
  0.5000, 0.2500, 0.6875, 0.4375,
  0.1250, 0.8750, 0.0625, 0.8125,
  0.6250, 0.3750, 0.5625, 0.3125
);

float dither(vec2 uv) {
  const float ditherResolution = 0.5;
  int x = int(mod(uv.x * uOutputResolution.x * ditherResolution, 4.));
  int y = int(mod(uv.y * uOutputResolution.y * ditherResolution, 4.));
  // Hacky way to get around const indexing
  for (int i = 0; i < 4; i++) {
    for (int j = 0; j < 4; j++) {
      if (i == x && j == y) {
        return BAYER_4_4[j][i];
      }
    }
  }
}

void main() {
${distance}
  float isText = (distancePx - dither(vUV) * float(FUZZINESS)) > 0. ? 0. : 1.;

  gl_FragColor = mix(vec4(uBackgroundColor, uBackgroundAlpha), vec4(uTextColor, 1), isText);
}

`;
export default shader
