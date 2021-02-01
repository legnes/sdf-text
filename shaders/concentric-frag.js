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

  float concentricWidthPx = 2.;
  float concentricPaddingPx = 4.;
  float concentricFalloffPx = 1.;
  float concentricIndexMin = 10.;
  float concentricIndexMax = 14.;
  float concentricIndexFalloff = 10.;
  vec4 concentricColor = vec4(0, 1, 1, 1);

  float isText = smoothstep(textFalloffPx, 0., distancePx);
  
  float concentricPositionPx = mod(distancePx, concentricWidthPx + concentricPaddingPx);
  float concentricIndex = floor(distancePx / (concentricWidthPx + concentricPaddingPx));
  float concentricCenterPx = (concentricWidthPx + concentricPaddingPx) * 0.5;
  float isConcentric = smoothstep(concentricCenterPx - concentricWidthPx - concentricFalloffPx, concentricCenterPx, concentricPositionPx) *
                       smoothstep(concentricCenterPx + concentricWidthPx + concentricFalloffPx, concentricCenterPx, concentricPositionPx);
  float concentricIndexFade = smoothstep(concentricIndexMin - concentricIndexFalloff, concentricIndexMin, concentricIndex) * 
                         smoothstep(concentricIndexMax + concentricIndexFalloff, concentricIndexMax, concentricIndex);
  concentricColor.a = concentricIndexFade;
  isConcentric *= (1. - isText);

  gl_FragColor = isText * textColor + isConcentric * concentricColor;
}

`;
export default shader;