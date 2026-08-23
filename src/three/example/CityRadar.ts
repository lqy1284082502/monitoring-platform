import * as THREE from 'three';
import { CityEffectScene } from '@/three/commonClass/CityEffectScene';

export class CityRadar extends CityEffectScene {
    protected configureShaders(buildingMaterial: THREE.MeshStandardMaterial, groundMaterial: THREE.MeshStandardMaterial) {
        const vertexStart = `uniform float uSize;\nvarying vec2 vUv;\nvoid main() {`;
        const buildingVertex = `#include <fog_vertex>\nvUv = position.xz / uSize;`;
        const groundVertex = `#include <fog_vertex>\nvUv = vec2(position.x, -position.y) / uSize;`;
        const fragmentStart = `varying vec2 vUv;\nuniform float uTime;\nuniform vec3 uColor;\nuniform float uSize;\nmat2 rotate2d(float angle) {\n    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));\n}\nfloat vertical_line(in vec2 uv) {\n    if (uv.y > 0.0 && length(uv) < 1.0) {\n        float theta = mod(180.0 * atan(uv.y, uv.x) / 3.14, 360.0);\n        float gradient = clamp(1.0 - theta / 90.0, 0.0, 1.0);\n        return 0.5 * gradient;\n    }\n    return 0.0;\n}\nvoid main() {`;
        const fragmentEffect = `#include <dithering_fragment>\nmat2 rotation_matrix = rotate2d(-uTime * PI * 2.0);\ngl_FragColor.rgb = mix(gl_FragColor.rgb, uColor, vertical_line(rotation_matrix * vUv));`;

        const configure = (shader: THREE.Shader, vertexEffect: string) => {
            this.shaders.push(shader);
            shader.uniforms.uSize = { value: 50 };
            shader.uniforms.uTime = { value: 0.2 };
            shader.uniforms.uColor = { value: new THREE.Color('#00FFFF') };
            shader.vertexShader = shader.vertexShader.replace('void main() {', vertexStart);
            shader.vertexShader = shader.vertexShader.replace('#include <fog_vertex>', vertexEffect);
            shader.fragmentShader = shader.fragmentShader.replace('void main() {', fragmentStart);
            shader.fragmentShader = shader.fragmentShader.replace('#include <dithering_fragment>', fragmentEffect);
        };

        buildingMaterial.onBeforeCompile = (shader) => configure(shader, buildingVertex);
        groundMaterial.onBeforeCompile = (shader) => configure(shader, groundVertex);
    }
}
