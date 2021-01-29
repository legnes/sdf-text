const shader = `
precision mediump float;
 
varying vec2 vUV;

void main() {
  gl_FragColor = vec4(vUV.x, vUV.y, 0, 1);
}
`;
export default shader;