uniform vec3 uColor;
uniform vec2 pointNum;
uniform float iTime;
varying vec2 vUv;

float PI = acos(-1.0);
void main(){
  vec2 uv = vUv+ vec2(0.0, iTime);
  float current = abs(sin(uv.y * PI) );
  if(current < 0.996) {
    current=current*0.5;
  }
  float d = distance(fract(uv * pointNum*2.0), vec2(0.5, 0.5));

  if(d > current*0.2 ) {
    discard;
  } else {
    gl_FragColor =vec4(uColor,current);
  }
}