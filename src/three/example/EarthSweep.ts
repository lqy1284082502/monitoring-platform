import { ThreeScene } from '@/three/commonClass/ThreeScene';
import * as THREE from 'three';
import { publicUrl } from '@/utils/publicUrl';
import vertexShader from '@/shaders/earthSweep/vertexShader.glsl?raw';
import fragmentShader from '@/shaders/earthSweep/fragmentShader.glsl?raw';

export class EarthSweep extends ThreeScene {
    private housingMaterial: THREE.ShaderMaterial | undefined = void 0;
    constructor(dom: HTMLElement) {
        super(dom);
        const cameraDefault = {
            fov: 75,
            near: 1,
            far: 2000,
        };
        this.setCameraProps(cameraDefault);
        this.camera.position.set(37, 0, 60);
        this.loadHDRI(publicUrl('textures/gainmap/spruit_sunrise_4k.jpg')).then(() => {
            this.scene.background = null;
        });
    }
    public init() {
        this.initEarth();
        this.initEarthShell();
    }
    // 初始化地球
    public initEarth() {
        const geometry = new THREE.SphereGeometry(16, 32, 32);
        const texture = new THREE.TextureLoader().load(publicUrl('textures/world.jpg'));
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            bumpMap: texture,
            bumpScale: 10,
        });

        const sphere = new THREE.Mesh(geometry, material);
        this.scene.add(sphere);
    }
    // 初始化地球外壳
    public initEarthShell() {
        const geometry = new THREE.SphereGeometry(18, 32, 16);
        this.housingMaterial = new THREE.ShaderMaterial({
            uniforms: {
                iTime: { value: 0.0 },
                pointNum: { value: new THREE.Vector2(32, 16) },
                uColor: { value: new THREE.Color('#FFFFFF') },
            },
            transparent: true,
            vertexShader,
            fragmentShader,
        });
        const sphere = new THREE.Mesh(geometry, this.housingMaterial);
        this.scene.add(sphere);
    }
    // 重写父类的animate方法
    public animate() {
        super.animate();
        if (this.housingMaterial) {
            if (this.housingMaterial.uniforms.iTime.value > 1) this.housingMaterial.uniforms.iTime.value = 0;
            else this.housingMaterial.uniforms.iTime.value += 0.005;
        }
    }
}
