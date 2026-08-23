import { ThreeScene } from '@/three/commonClass/ThreeScene';
import * as THREE from 'three';
import { publicUrl } from '@/utils/publicUrl';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export class CitySweep extends ThreeScene {
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

        material.onBeforeCompile = (shader) => this.handleCompile(shader, true);
        this.pm.onBeforeCompile = (shader) => this.handleCompile(shader);
    }

    private handleCompile(shader: THREE.Shader, isTwo = false) {
        const vertexShader1 = `uniform float uSize;
              varying vec2 vUv;
              void main() {`;
        const vertexShader2 = `#include <fog_vertex>
                      vUv=position.xz/uSize;`;
        const vertexShader3 = `#include <fog_vertex>
                        vUv=vec2(-position.x,-position.y)/uSize;`;
        const fragmentShader1 = `varying vec2 vUv;
                uniform float uTime;
                uniform vec3 uColor;
                uniform float uSize;
                void main() {`;
        const fragmentShader2 = `#include <dithering_fragment> 
            float d=length(vUv);
                  if(d >= uTime&&d<=uTime+ 0.1) {
                    gl_FragColor.rgb = gl_FragColor.rgb+mix(uColor,gl_FragColor.rgb,1.0-(d-uTime)*10.0 )*0.5  ;                    
                  }`;
        this.shaders.push(shader);
        shader.uniforms.uSize = { value: 50 };
        shader.uniforms.uTime = { value: 0.2 };
        shader.uniforms.uColor = { value: new THREE.Color('#00FFFF') };
        shader.vertexShader = shader.vertexShader.replace('void main() {', vertexShader1);
        shader.vertexShader = shader.vertexShader.replace('#include <fog_vertex>', isTwo ? vertexShader2 : vertexShader3);
        shader.fragmentShader = shader.fragmentShader.replace('void main() {', fragmentShader1);
        shader.fragmentShader = shader.fragmentShader.replace('#include <dithering_fragment>', fragmentShader2);
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
