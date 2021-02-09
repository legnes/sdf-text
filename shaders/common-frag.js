export const header = `
varying vec2 vUV;

uniform sampler2D uSdf;
uniform vec2 uSdfResolution;
uniform vec2 uOutputResolution;
uniform vec3 uTextColor;
uniform vec3 uEffectColor;
uniform vec3 uBackgroundColor;
uniform float uBackgroundAlpha;
`;

export const distance = `
  float distanceUV = texture2D(uSdf, vUV).r / uSdfResolution.x;
  float distancePx = distanceUV * uOutputResolution.x;
`;