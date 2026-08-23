import { ThreeScene } from '@/three/commonClass/ThreeScene';
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { publicUrl } from '@/utils/publicUrl';

export class CityRadar extends ThreeScene {
    private geometries: THREE.BoxGeometry[] = [];
    private shaders: THREE.Shader[] = [];
    private readonly pm: THREE.MeshStandardMaterial;
    constructor(dom: HTMLElement) {
        super(dom);
        this.pm = new THREE.MeshStandardMaterial({
            color: new THREE.Color('gray'),
            side: THREE.FrontSide,
            transparent: true,
        });
        this.camera.position.set(-178.82247507543786, 74.90429441486798, -5.721143063003789);
        this.loadHDRI(publicUrl('textures/gainmap/spruit_sunrise_4k.jpg')).then(() => {
            if (this.isDisposed) return;
            this.scene.background = null;
        }).catch(() => undefined);
    }
    init() {
        const pg = new THREE.PlaneGeometry(100, 100);

        const plane = new THREE.Mesh(pg, this.pm);
        plane.rotateX(-Math.PI * 0.5);
        plane.receiveShadow = true;
        this.scene.add(plane);
        this.createBuilding();
    }

    // 随机生成建筑
    private createBuilding() {
        const helper = new THREE.Object3D();
        for (let i = 0; i < 100; i++) {
            const h = Math.round(Math.random() * 15) + 5;
            const x = Math.round(Math.random() * 50);
            const y = Math.round(Math.random() * 50);
            helper.position.set((x % 2 ? -1 : 1) * x, h * 0.5, (y % 2 ? -1 : 1) * y);
            const geometry = new THREE.BoxGeometry(5, h, 5);
            helper.updateWorldMatrix(true, false);
            geometry.applyMatrix4(helper.matrixWorld);
            this.geometries.push(geometry);
        }
        const mergedGeometry = mergeGeometries(this.geometries, false);
        const texture = new THREE.TextureLoader().load(publicUrl('image/image.jpg'));
        texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
        const material = new THREE.MeshStandardMaterial({ map: texture, transparent: true });
        const cube = new THREE.Mesh(mergedGeometry, material);
        cube.castShadow = true;
        cube.receiveShadow = true;
        this.scene.add(cube);

        const vertexShader1 = `uniform float uSize;
              varying vec2 vUv;
              void main() {`;
        const vertexShader2 = `#include <fog_vertex>
                      vUv=position.xz/uSize;`;
        const vertexShader3 = `#include <fog_vertex>
                        vUv=vec2(position.x,-position.y)/uSize;`;
        const fragmentShader1 = `varying vec2 vUv;
                uniform float uTime;
                uniform vec3 uColor;
                uniform float uSize;
                mat2 rotate2d(float angle)
{
    return mat2(cos(angle), - sin(angle),
                sin(angle), cos(angle));
}
float vertical_line(in vec2 uv)
{
    if (uv.y > 0.0 && length(uv) < 1.0)
    {
        float theta = mod(180.0 * atan(uv.y, uv.x)/3.14, 360.0);
        float gradient = clamp(1.0-theta/90.0,0.0,1.0);
        return 0.5 * gradient;
    }
    return 0.0;
}
                void main() {`;
        const fragmentShader2 = `#include <dithering_fragment> 
            mat2 rotation_matrix = rotate2d(- uTime*PI*2.0);             
            gl_FragColor.rgb= mix( gl_FragColor.rgb, uColor, vertical_line(rotation_matrix * vUv) );                                       
                   `;
        material.onBeforeCompile = (shader) => {
            this.shaders.push(shader);
            shader.uniforms.uSize = { value: 50 };
            shader.uniforms.uTime = { value: 0.2 };
            shader.uniforms.uColor = { value: new THREE.Color('#00FFFF') };
            shader.vertexShader = shader.vertexShader.replace('void main() {', vertexShader1);
            shader.vertexShader = shader.vertexShader.replace('#include <fog_vertex>', vertexShader2);
            shader.fragmentShader = shader.fragmentShader.replace('void main() {', fragmentShader1);
            shader.fragmentShader = shader.fragmentShader.replace('#include <dithering_fragment>', fragmentShader2);
        };
        this.pm.onBeforeCompile = (shader) => {
            this.shaders.push(shader);
            shader.uniforms.uSize = { value: 50 };
            shader.uniforms.uTime = { value: 0.2 };
            shader.uniforms.uColor = { value: new THREE.Color('#00FFFF') };
            shader.vertexShader = shader.vertexShader.replace('void main() {', vertexShader1);
            shader.vertexShader = shader.vertexShader.replace('#include <fog_vertex>', vertexShader3);
            shader.fragmentShader = shader.fragmentShader.replace('void main() {', fragmentShader1);
            shader.fragmentShader = shader.fragmentShader.replace('#include <dithering_fragment>', fragmentShader2);
        };
    }

    animate() {
        super.animate();
        if (this.shaders?.length) {
            this.shaders.forEach((shader) => {
                shader.uniforms.uTime.value += 0.005;
                if (shader.uniforms.uTime.value >= 1) {
                    shader.uniforms.uTime.value = 0;
                }
            });
        }
    }
}
