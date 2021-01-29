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

  float outlineStartPx = 60.;
  float outlineEndPx = 120.;
  float outlineFalloffPx = 10.;
  vec4 outlineColor = vec4(0, 1, 1, 1);

  float isText = smoothstep(textFalloffPx, 0., distancePx);
  float isOutline = smoothstep(outlineStartPx - outlineFalloffPx, outlineStartPx, distancePx) * 
                    smoothstep(outlineEndPx + outlineFalloffPx, outlineEndPx, distancePx);

  gl_FragColor = isText * textColor + isOutline * outlineColor;
}
`;
export default shader;