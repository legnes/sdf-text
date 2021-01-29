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

  vec2 shadowDirection = normalize(vec2(-.8, 1.));
  float shadowDistancePx = 120.;
  float shadowFalloffPx = 30.;
  vec4 shadowColor = vec4(0, 1, 1, 1);

  float isText = smoothstep(textFalloffPx, 0., distancePx);
  float shadowTexelDistancePx = texture2D(uSdf, vUV - shadowDirection * shadowDistancePx / uOutputResolution).r / uSdfResolution.x * uOutputResolution.x;
  float isShadow = smoothstep(shadowFalloffPx, 0., shadowTexelDistancePx) * (1. - isText);

  gl_FragColor = isText * textColor + isShadow * shadowColor;
}
`;
export default shader;