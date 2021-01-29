const shader = `
precision mediump float;
 
varying vec2 vUV;

uniform sampler2D uSdf;
uniform vec2 uSdfResolution;
uniform vec2 uOutputResolution;

void main() {
  float distanceUV = texture2D(uSdf, vUV).r / uSdfResolution.x;
  float distancePx = distanceUV * uOutputResolution.x;
  
  float textFalloffPx = 2.;
  vec4 textColor = vec4(1, 0, 0, 1);

  vec2 extrusionDirection = normalize(vec2(-0.5, 0.5));
  float extrusionStartPx = 10.;
  float extrusionEndPx = 180.;
  float extrusionFalloffPx = 20.;
  float extrusionTolerancePx = 1.;
  vec4 extrusionColor = vec4(0, 1, 1, 1);

  float isText = smoothstep(textFalloffPx, 0., distancePx);
  float isExtrusion = 0.;

  vec2 extrusionUV = vUV;
  float extrudedDistancePx = 0.;
  float extrusionSdfUV = distanceUV;
  for (int i = 0; i < 40; i++) {
    extrusionUV -= extrusionSdfUV * extrusionDirection;
    if (extrusionUV.x < 0. || extrusionUV.y < 0. || extrusionUV.x > 1. || extrusionUV.y > 1.) {
      break;
    }

    extrudedDistancePx += extrusionSdfUV * uOutputResolution.x;
    if (extrudedDistancePx > extrusionEndPx) {
      break;
    }

    extrusionSdfUV = texture2D(uSdf, extrusionUV).r / uSdfResolution.x;
    if (extrusionSdfUV * uOutputResolution.x < extrusionTolerancePx) {
      if (extrudedDistancePx > extrusionStartPx) {
        isExtrusion = smoothstep(extrusionStartPx, extrusionStartPx + extrusionFalloffPx, extrudedDistancePx) * 
                      smoothstep(extrusionEndPx, extrusionEndPx - extrusionFalloffPx, extrudedDistancePx);
      }
      break;
    }
  }
  isExtrusion *= (1. - isText);

  gl_FragColor = isText * textColor + isExtrusion * extrusionColor;
}
`;
export default shader;