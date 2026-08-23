uniform vec3 glowColor;
uniform float time;
varying vec3 vNormal;
uniform sampler2D map;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vViewDirection;

void main(void){
  vec3 textureColor = texture2D(map, vUv).rgb;
  float cyanSignal = smoothstep(0.38, 0.95, textureColor.g + textureColor.b * 0.45);
  float cloudLight = smoothstep(0.28, 0.82, dot(textureColor, vec3(0.22, 0.58, 0.20)));

  vec3 deepOcean = vec3(0.004, 0.018, 0.055);
  vec3 surface = mix(deepOcean, textureColor * vec3(0.10, 0.22, 0.42), cloudLight);
  surface += glowColor * cyanSignal * 0.72;

  vec2 gridUv = vUv * vec2(48.0, 24.0);
  vec2 gridDistance = abs(fract(gridUv - 0.5) - 0.5) / max(fwidth(gridUv), vec2(0.001));
  float grid = 1.0 - min(min(gridDistance.x, gridDistance.y), 1.0);
  surface += glowColor * grid * 0.035;

  float scanCenter = sin(time * 0.72) * 26.0;
  float scanBand = 1.0 - smoothstep(0.0, 0.72, abs(vPosition.y - scanCenter));
  float scanTail = 1.0 - smoothstep(0.0, 4.2, abs(vPosition.y - scanCenter));
  surface += glowColor * (scanBand * 0.72 + scanTail * 0.1);

  float fresnel = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewDirection)), 0.0), 2.2);
  surface += mix(glowColor, vec3(0.35, 0.45, 1.0), 0.25) * fresnel * 0.78;

  gl_FragColor = vec4(surface, 1.0);
}
