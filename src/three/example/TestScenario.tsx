import * as THREE from 'three';
import { ThreeScene } from '@/three/commonClass/ThreeScene';

/**
 * three初始场景
 * */
export class TestScenario extends ThreeScene {
    constructor(dom: HTMLElement) {
        super(dom);
        // this.loadHDRI('/textures/gainmap/spruit_sunrise_4k.jpg').then();
    }
    init() {
        // 生成一个正方体
        const geometry = new THREE.BoxGeometry(20, 20, 20);
        const material = new THREE.MeshStandardMaterial({
            metalness: 1.0,
            roughness: 0.0,
        });
        // 自定义顶点和片元着色器
        let vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

        let fragmentShader = `
        varying vec2 vUv;
        void main() {
            vec3 color = mix(vec3(1.0, 0.0, 0.0), vec3(0.0, 0.0, 1.0), vUv.y);
            gl_FragColor = vec4(color, 1.0);
        }
    `;
        // shaderMaterial
        const material1 = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
        });
        const materials = [material1, material1, material, material, material1, material1];
        const cube = new THREE.Mesh(geometry, materials);

        // 生成一个无限远的平面
        const planeGeometry = new THREE.PlaneGeometry(200, 200);
        // 加载纹理
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('/textures/uv_grid_opengl.jpg');
        const planeMaterial = new THREE.MeshBasicMaterial({ map: texture });

        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.receiveShadow = true;
        plane.rotation.x = -Math.PI / 2.0;
        plane.position.y = -10;
        this.scene.add(plane);

        this.scene.add(cube);
    }
}
