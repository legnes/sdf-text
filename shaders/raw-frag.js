import { header, distance } from './common-frag.js';

const shader = `
precision mediump float;
${header}
void main() {
  float distanceUV = texture2D(uSdf, vUV).r / uSdfResolution.x;
  float distanceNormalized = distanceUV * 0.5 + 0.5;
  gl_FragColor = vec4(vec3(distanceNormalized), 1);
}
`;
export default shader;