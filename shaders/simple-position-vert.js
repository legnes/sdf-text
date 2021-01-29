const shader = `
attribute vec2 aPosition;
varying vec2 vUV;
 
void main() {
  vec2 RESOLUTION = vec2(256.);
  vUV = aPosition + (0.5 / RESOLUTION);
  gl_Position = vec4(aPosition * 2. - 1., 0, 1);
}
`;
export default shader;