uniform vec3 glowColor;
uniform float coeficient;
uniform float power;

varying vec3 vVertexNormal;
varying vec3 vVertexWorldPosition;

void main(){
	vec3 worldCameraToVertex = vVertexWorldPosition - cameraPosition;
	vec3 viewCameraToVertex = normalize((viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz);
	float rim = pow(clamp(coeficient + dot(vVertexNormal, viewCameraToVertex), 0.0, 1.0), power);
	float halo = pow(rim, 0.55);
	gl_FragColor = vec4(glowColor * (0.72 + halo * 0.55), rim * 0.72);
}
