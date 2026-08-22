precision mediump float;
uniform sampler2D map;
uniform float uOpacity;
varying vec2 v_texcoord;
void main (void)
{
  vec4 color= texture2D(map, v_texcoord);
  float a=color.a*uOpacity;
  gl_FragColor.rgb =color.rgb;
  gl_FragColor.a=a>1.0?1.0:a;
}