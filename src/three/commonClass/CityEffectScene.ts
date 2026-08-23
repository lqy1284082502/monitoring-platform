import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { ThreeScene } from '@/three/commonClass/ThreeScene';
import { publicUrl } from '@/utils/publicUrl';

export abstract class CityEffectScene extends ThreeScene {
    protected readonly shaders: THREE.Shader[] = [];
    private readonly groundMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color('gray'),
        side: THREE.FrontSide,
        transparent: true,
    });

    constructor(dom: HTMLElement) {
        super(dom);
        this.camera.position.set(-178.82247507543786, 74.90429441486798, -5.721143063003789);
        this.loadHDRI(publicUrl('textures/gainmap/spruit_sunrise_4k.jpg'))
            .then(() => {
                if (!this.isDisposed) this.scene.background = null;
            })
            .catch(() => undefined);
    }

    public init() {
        const plane = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), this.groundMaterial);
        plane.rotateX(-Math.PI * 0.5);
        plane.receiveShadow = true;
        this.scene.add(plane);
        this.createBuildings();
    }

    protected abstract configureShaders(buildingMaterial: THREE.MeshStandardMaterial, groundMaterial: THREE.MeshStandardMaterial): void;

    protected update() {
        this.shaders.forEach((shader) => {
            shader.uniforms.uTime.value += 0.005;
            if (shader.uniforms.uTime.value >= 1) shader.uniforms.uTime.value = 0;
        });
    }

    private createBuildings() {
        const helper = new THREE.Object3D();
        const geometries: THREE.BoxGeometry[] = [];
        for (let i = 0; i < 100; i++) {
            const height = Math.round(Math.random() * 15) + 5;
            const x = Math.round(Math.random() * 50);
            const z = Math.round(Math.random() * 50);
            helper.position.set((x % 2 ? -1 : 1) * x, height * 0.5, (z % 2 ? -1 : 1) * z);
            const geometry = new THREE.BoxGeometry(5, height, 5);
            helper.updateWorldMatrix(true, false);
            geometry.applyMatrix4(helper.matrixWorld);
            geometries.push(geometry);
        }
        const mergedGeometry = mergeGeometries(geometries, false);
        geometries.forEach((geometry) => geometry.dispose());
        if (!mergedGeometry) return;

        const texture = new THREE.TextureLoader().load(publicUrl('image/image.jpg'));
        texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
        const buildingMaterial = new THREE.MeshStandardMaterial({ map: texture, transparent: true });
        const buildings = new THREE.Mesh(mergedGeometry, buildingMaterial);
        buildings.castShadow = true;
        buildings.receiveShadow = true;
        this.scene.add(buildings);
        this.configureShaders(buildingMaterial, this.groundMaterial);
    }
}
