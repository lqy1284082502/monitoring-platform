import * as THREE from 'three';
import { ThreeScene } from '@/three/commonClass/ThreeScene';
import { publicUrl } from '@/utils/publicUrl';

/**
 * three初始场景
 * */
export class HDRLoad extends ThreeScene {
    constructor(dom: HTMLElement) {
        super(dom);
        this.loadHDRI(publicUrl('textures/gainmap/spruit_sunrise_4k.jpg')).then();
    }
    init() {
        const geometry = new THREE.TorusKnotGeometry(18, 8, 200, 40, 1, 3);
        const material = new THREE.MeshStandardMaterial({
            metalness: 1.0,
            roughness: 0.0,
        });
        const cube = new THREE.Mesh(geometry, material);
        this.cubeList.push(cube);
        this.scene.add(cube);
    }

    // 重写父类的animate方法
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.cubeList.forEach((cube) => {
            cube.rotation.x += 0.005;
            cube.rotation.y += 0.005;
        });
        this.renderer.render(this.scene, this.camera);
        this.stats?.update();
    }
}
