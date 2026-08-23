varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vViewDirection;

void main(void){
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vec3 viewPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    vViewDirection = normalize(-viewPosition);
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
