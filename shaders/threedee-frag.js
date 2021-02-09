import { header, distance } from './common-frag.js';

const shader = `
precision mediump float;

////////////////////////////////
// SETTINGS
// colors are in RGB
// distances and fuzziness are in pixels
// (of inherent resolution)
////////////////////////////////
const int EXTRA_WIDTH = 2;
const vec3 LIGHT_DIR = vec3(-1, -1, -.2);
const int SHININESS = 80;
////////////////////////////////
${header}
void main() {
${distance}
  float sdfToOutput = uOutputResolution.x / uSdfResolution.x;
  float distanceNorthPx = texture2D(uSdf, vUV + vec2(0., 1. / uSdfResolution.y)).r * sdfToOutput;
  float distanceEastPx = texture2D(uSdf, vUV + vec2(1. / uSdfResolution.x, 0.)).r * sdfToOutput;

  float width = float(EXTRA_WIDTH);
  float centerHeight = min(width, distancePx);
  vec3 vecNorth = vec3(0., sdfToOutput, min(width, distanceNorthPx) - centerHeight);
  vec3 vecEast = vec3(sdfToOutput, 0., min(width, distanceEastPx) - centerHeight);
  vec3 normal = normalize(cross(vecEast, vecNorth));

  // half lambert
  // https://developer.valvesoftware.com/wiki/Half_Lambert
  float lambert = dot(normalize(LIGHT_DIR), normal);
  float diffuse = lambert * 0.5 + 0.5;
  diffuse *= diffuse;
  vec3 diffuseColor = diffuse * uTextColor;

  // blinn phong
  // https://en.wikipedia.org/wiki/Blinn%E2%80%93Phong_reflection_model
  vec3 camPos = vec3(.5 * uSdfResolution, 300);
  vec3 fragPos = vec3(vUV * uSdfResolution, 0);
  vec3 viewDirection = normalize(camPos - fragPos);
  vec3 halfAngle = normalize(normalize(LIGHT_DIR) + normalize(viewDirection));
  float specular = max(dot(halfAngle, normal), 0.0);
  specular = pow(specular, float(SHININESS));
  vec3 specularColor = specular * uEffectColor;

  float isText = smoothstep(0., -2., distancePx - width);
  gl_FragColor = mix(vec4(uBackgroundColor, uBackgroundAlpha),
                     vec4(diffuseColor + specularColor, 1),
                     isText);
}

`;
export default shader;