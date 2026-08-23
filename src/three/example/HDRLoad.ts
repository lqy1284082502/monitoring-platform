import * as THREE from 'three';
import { ThreeScene } from '@/three/commonClass/ThreeScene';
import { publicUrl } from '@/utils/publicUrl';

/**
 * three初始场景
 * */
export class HDRLoad extends ThreeScene {
    constructor(dom: HTMLElement) {
        super(dom);
        this.loadHDRI(publicUrl('textures/gainmap/spruit_sunrise_4k.jpg')).catch(() => undefined);
    }
    init() {
        const geometry = new THREE.TorusKnotGeometry(18, 8, 200, 40, 1, 3);
        const material = new THREE.MeshStandardMaterial({
            metalness: 1.0,
            roughness: 0.0,
        });
        const cube = new THREE.Mesh(geometry, material);
        this.scene.add(cube);
    }

    protected update() {
        this.scene.children.forEach((cube) => {
            if (!(cube instanceof THREE.Mesh)) return;
            cube.rotation.x += 0.005;
            cube.rotation.y += 0.005;
        });
    }
}
