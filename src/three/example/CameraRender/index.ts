import { ThreeScene } from '@/three/commonClass/ThreeScene';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { publicUrl } from '@/utils/publicUrl';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

export class CameraRender extends ThreeScene {
    // 部件数组
    private parts: string[] = [
        '+BODY001001',
        '+BODY092001',
        '+BODY087001',
        '+BODY085001',
        '+BODY077001',
        '+BODY013001',
        '+BODY079001',
        '+BODY050001',
        '+BODY078001',
        '+BODY033001',
        '+BODY086001',
        '+BODY067001',
        '+BODY089001',
        '+BODY055001',
        'Cube005_2001',
        '+BODY066001',
        '+BODY037001',
        '+BODY046001',
        '+BODY025001',
        '+BODY036001',
        '+BODY015001',
        '+BODY073001',
        '+BODY091001',
        '+BODY014001',
        '+BODY017001',
        '+BODY021001',
        '+BODY098001',
        '+BODY030001',
        '+BODY094001',
        'Plane006001',
        '+Circle003001',
        '+BODY093001',
        'Cube085001',
        '+BODY081001',
        '+BODY012001',
        '+Circle001001',
        '+Plane005001',
        '+BODY026001',
        '+Sphere003001',
        '+BODY080001',
        '+BODY095001',
        '+Plane008001',
        '+BODY057001',
        '+Sphere001',
        'Cube005_4001',
        '+BODY075001',
        '+BODY083001',
        '+BODY032001',
        '+BODY031001',
        '+BODY074001',
        '+BODY088001',
        'Cube046001',
        '+BODY027001',
        '+BODY016001',
        '+SideButtons001',
        '+BODY062001',
        '+BODY090001',
        '+BODY022001',
        'Text001',
        '+Sphere001001',
        '+BODY019001',
        '+BODY047001',
        '+BODY020001',
        'Cube005_1001',
        'Circle004_1001',
        'Cube085_1001',
        '+BODY061001',
        '+BODY097001',
        '+BODY035001',
        '+BODY058001',
        '+BODY018002',
        '+BODY023001',
        '+BODY096001',
        '+Circle001',
        '+BODY028001',
        '+BODY034001',
        '+BODY044001',
        '+BODY082001',
        '+Cylinder001',
        'Cube005_3001',
        '+BODY076001',
        'Rings2001',
        '+BODY054001',
        '+BODY024001',
        '+BODY002001',
        '+BODY064001',
        'Circle002',
        '+Rings1001',
        '+BODY029001',
        '+BODY018001',
        'Cube005001',
        'new',
        'Circle004001',
        'wizjer',
    ];
    constructor(dom: HTMLElement) {
        super(dom, { rendererConfig: { antialias: true } });

        // 设置渲染器抗锯齿
        // this.renderer.antialias = true;
        const hdrLoader = new RGBELoader();
        hdrLoader.load(publicUrl('textures/gainmap/metro_noord_4k.hdr'), (texture) => {
            if (this.isDisposed) {
                texture.dispose();
                return;
            }
            const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
            this.scene.environment = pmremGenerator.fromEquirectangular(texture).texture;
            texture.dispose(); // 释放纹理内存
            pmremGenerator.dispose(); // 释放生成器内存
        });
        this.camera.position.set(-106, 56, -90);
        this.setLight();
    }
    public init() {
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath(publicUrl('draco/gltf/'));
        const loader = new GLTFLoader();
        loader.setDRACOLoader(dracoLoader);
        loader.load(publicUrl('models/item/camera.glb'), (gltf) => {
            const model = gltf.scene;
            if (this.isDisposed) {
                model.traverse((child) => {
                    const mesh = child as THREE.Mesh;
                    mesh.geometry?.dispose();
                    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                    materials.filter(Boolean).forEach((material) => material.dispose());
                });
                return;
            }
            model.position.set(1, 1, 0);
            model.traverse((child) => {
                if (child.type === 'Mesh') {
                    child.visible = this.parts.includes((child as THREE.Mesh).name);
                }
            });
            // 设置方向
            model.rotation.set(0, Math.PI / 4, 0);
            const scale = 30;
            model.scale.set(scale, scale, scale);

            // 相机看向模型
            this.camera.lookAt(model.position);
            this.scene.add(model);

            // 设置自动旋转
            // this.controls.autoRotate = true;
            this.controls.autoRotateSpeed = 0.5;
        });
    }
    // 设置光源
    private setLight() {
        // 添加白色环境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(ambientLight);
        this.scene.background = new THREE.Color(0xffffff);

        // 添加平行光1
        const dirLight = new THREE.DirectionalLight(0xffffff, 3);
        dirLight.position.set(80.144, 100, 70.66);
        // 添加平行光2
        const d2 = dirLight.clone();
        d2.position.set(-79.02, 100, 75);
        // 添加平行光3
        const d3 = dirLight.clone();
        d3.position.set(-3.98, -111.87, -5.33);

        // 添加方向光的辅助工具
        // const directionalLightHelper = new THREE.DirectionalLightHelper(dirLight, 10);
        // const directionalLightHelper2 = new THREE.DirectionalLightHelper(d2, 10);
        // const directionalLightHelper3 = new THREE.DirectionalLightHelper(d3, 10);
        // this.scene.add(directionalLightHelper3);
        // this.scene.add(directionalLightHelper2);
        // this.scene.add(directionalLightHelper);
        this.scene.add(dirLight);
        this.scene.add(d2);
        this.scene.add(d3);
    }
    animate() {
        super.animate();
    }
}
