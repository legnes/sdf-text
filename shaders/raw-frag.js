const shader = `
precision mediump float;
 
varying vec2 vUV;

uniform sampler2D uSdf;
uniform vec2 uSdfResolution;
uniform vec2 uOutputResolution;

void main() {
  float distanceUV = texture2D(uSdf, vUV).r / uSdfResolution.x;
  float distanceNormalized = distanceUV * 0.5 + 0.5;
  gl_FragColor = vec4(vec3(distanceNormalized), 1);
}
`;
export default shader;