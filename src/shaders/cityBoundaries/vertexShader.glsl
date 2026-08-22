uniform float time;
uniform float size;
uniform float len;
uniform vec3 color1;
uniform vec3 color2;
varying vec3 vColor;
void main() {
    vColor = color1;
    vec3 newPosition = position;
    float d = uv.x - time;

    if(abs(d) < len) {
        newPosition = newPosition + normal * size;
        vColor = color2;
    }
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}