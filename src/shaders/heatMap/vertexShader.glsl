uniform sampler2D map;
uniform float uHeight;
varying vec2 v_texcoord;
void main(void)
{
    v_texcoord = uv;
    float h=texture2D(map, v_texcoord).a*uHeight;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position.x,position.y,h, 1.0 );
}