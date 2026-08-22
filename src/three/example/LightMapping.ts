import * as THREE from 'three';
import { ThreeScene } from '@/three/commonClass/ThreeScene';
// import { MeshBasicNodeMaterial, vec4, color, positionLocal, mix } from 'three/nodes';
// import { nodeFrame } from 'three/addons/renderers/webgl-legacy/nodes/WebGLNodes.js';

export class LightMapping extends ThreeScene {
    constructor(dom: HTMLElement) {
        super(dom);
        this.camera.far = 10000;
        this.camera.position.set(700, 200, -500);
        this.camera.updateProjectionMatrix();
        // 设置HDR贴图
        this.loadHDRI('/textures/gainmap/spruit_sunrise_4k.jpg').then(() => {
            this.scene.background = new THREE.Color(0x000000);
        });
    }
    // 初始化函数
    public async init() {
        // LIGHTS

        const light = new THREE.DirectionalLight(0xd5deff);
        light.position.x = 300;
        light.position.y = 250;
        light.position.z = -500;
        this.scene.add(light);

        // 修改摄像机默认参数
        const loader = new THREE.ObjectLoader();
        const object = await loader.loadAsync('/models/json/lightmap/lightmap.json');
        this.scene.add(object);
        this.controls!.enableZoom = false;
        this.controls!.maxPolarAngle = (0.9 * Math.PI) / 2;
        this.controls!.autoRotate = true;
        this.controls!.autoRotateSpeed = 0.5;
    }
}
