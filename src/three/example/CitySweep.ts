import * as THREE from 'three';
import { CityEffectScene } from '@/three/commonClass/CityEffectScene';

export class CitySweep extends CityEffectScene {
    protected configureShaders(buildingMaterial: THREE.MeshStandardMaterial, groundMaterial: THREE.MeshStandardMaterial) {
        buildingMaterial.onBeforeCompile = (shader) => this.handleCompile(shader, true);
        groundMaterial.onBeforeCompile = (shader) => this.handleCompile(shader);
    }

    private handleCompile(shader: THREE.Shader, isBuilding = false) {
        const vertexStart = `uniform float uSize;\nvarying vec2 vUv;\nvoid main() {`;
        const buildingVertex = `#include <fog_vertex>\nvUv = position.xz / uSize;`;
        const groundVertex = `#include <fog_vertex>\nvUv = vec2(-position.x, -position.y) / uSize;`;
        const fragmentStart = `varying vec2 vUv;\nuniform float uTime;\nuniform vec3 uColor;\nuniform float uSize;\nvoid main() {`;
        const fragmentEffect = `#include <dithering_fragment>\nfloat d = length(vUv);\nif (d >= uTime && d <= uTime + 0.1) {\n    gl_FragColor.rgb += mix(uColor, gl_FragColor.rgb, 1.0 - (d - uTime) * 10.0) * 0.5;\n}`;

        this.shaders.push(shader);
        shader.uniforms.uSize = { value: 50 };
        shader.uniforms.uTime = { value: 0.2 };
        shader.uniforms.uColor = { value: new THREE.Color('#00FFFF') };
        shader.vertexShader = shader.vertexShader.replace('void main() {', vertexStart);
        shader.vertexShader = shader.vertexShader.replace('#include <fog_vertex>', isBuilding ? buildingVertex : groundVertex);
        shader.fragmentShader = shader.fragmentShader.replace('void main() {', fragmentStart);
        shader.fragmentShader = shader.fragmentShader.replace('#include <dithering_fragment>', fragmentEffect);
    }
}
