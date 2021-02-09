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
const int DRIP_WIDTH = 8;
const int DRIP_HEIGHT = 200;
const int TEXT_FUZZINESS = 2;
////////////////////////////////

const float TWO_PI = 6.28318530718;

// https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
float rand(float n){return fract(sin(n) * 43758.5453123);}
${header}
void main() {
${distance}
  float isText = smoothstep(float(TEXT_FUZZINESS), 0., distancePx);

  // High frequeny
  float numDrips = uOutputResolution.x / float(DRIP_WIDTH);
  float binRemap = vUV.x * numDrips;
  float bin = floor(binRemap) / numDrips;
  float binPos = fract(binRemap);
  float height = pow(rand(bin), 3.);
  float ease = -pow((binPos - .5) * 2., 4.) + 1.;
  float lowFrequencyDrip = (sin(vUV.x * TWO_PI * 9.) + 1.) * 7.;
  float dripDist = float(DRIP_HEIGHT) * height * ease + lowFrequencyDrip;

  float isDrip = 0.;
  vec2 dripDirection = vec2(0, -1);
  vec2 dripUV = vUV;
  float dripDistancePx = 0.;
  float dripSdfUV = distanceUV;
  float dripSdfPx = distancePx;
  for (int i = 0; i < 40; i++) {
    dripUV -= dripSdfUV * dripDirection;
    if (dripUV.x < 0. || dripUV.y < 0. || dripUV.x > 1. || dripUV.y > 1.) {
      break;
    }

    dripDistancePx += dripSdfPx;
    if (dripDistancePx > dripDist) {
      break;
    }

    dripSdfUV = texture2D(uSdf, dripUV).r / uSdfResolution.x;
    dripSdfPx = dripSdfUV * uOutputResolution.x;
    if (dripSdfPx < 0.) {
      if (dripDistancePx > 0.) {
        isDrip = smoothstep(0., 1., dripDistancePx) *
                      smoothstep(0., -1., dripDistancePx - dripDist);
      }
      break;
    }
  }
  isDrip *= (1. - isText);

  float isBackground = (1. - isText) * (1. - isDrip);

  gl_FragColor = isText * vec4(uTextColor, 1) +
                 isDrip * vec4(uEffectColor, 1) +
                 isBackground * vec4(uBackgroundColor, uBackgroundAlpha);
}

`;
export default shader;