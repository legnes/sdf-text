const shader = `
precision mediump float;

attribute vec2 aPosition;

varying vec2 vUV;

uniform vec2 uSdfResolution;
 
void main() {
  vUV = aPosition + (0.5 / uSdfResolution);
  gl_Position = vec4(aPosition * 2. - 1., 0, 1);
}
`;
export default shader;