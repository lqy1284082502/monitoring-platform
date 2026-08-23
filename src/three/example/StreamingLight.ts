import { ThreeScene } from '@/three/commonClass/ThreeScene';
import lineJson from '@/assets/json/lines.json';
import * as THREE from 'three';
import { publicUrl } from '@/utils/publicUrl';

export class StreamingLight extends ThreeScene {
    private readonly animatedTextures: Array<{ speed: number; texture: THREE.Texture }> = [];
    private readonly textureCache = new Map<string, THREE.Texture>();
    private readonly materialCache = new Map<string, THREE.MeshBasicMaterial>();
    constructor(dom: HTMLElement) {
        super(dom);
    }

    public init() {
        // 初始化相机参数
        this.camera.fov = 75;
        this.camera.near = 0.1;
        this.camera.far = 1000;

        // 设置机位
        this.camera.position.set(0, 200, 0);
        // 设置相机朝向
        this.camera.up.set(1, 0, 0);
        // 设置控制器位置
        this.controls.target.set(36.00227937911105, -0.00010823950812136411, 108.23469716608365);
        this.controls.mouseButtons = {
            LEFT: THREE.MOUSE.RIGHT, // 绑定左键操作到右键
            RIGHT: THREE.MOUSE.RIGHT, // 保持右键操作为右键
        };
        this.streamingLight();
    }

    // 流光效果
    public streamingLight() {
        const textureLoader = new THREE.TextureLoader();
        lineJson.features.forEach((item) => {
            const imgUrl = item.subway ? item.subway : 'line1';
            let texture = this.textureCache.get(imgUrl);
            let material = this.materialCache.get(imgUrl);
            if (!texture || !material) {
                texture = textureLoader.load(publicUrl(`image/line/${imgUrl}.png`));
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide, transparent: true });
                this.textureCache.set(imgUrl, texture);
                this.materialCache.set(imgUrl, material);
                this.animatedTextures.push({ speed: 0.16 + this.animatedTextures.length * 0.008, texture });
            }
            const points = item.geometry.coordinates.map((point: number[]) => {
                return new THREE.Vector3((point[1] - 23) * 300, 0, (point[0] - 113) * 300);
            });
            // 曲线
            const curve = new THREE.CatmullRomCurve3(points);
            // 曲线几何体
            const tubeGeometry = new THREE.TubeGeometry(curve, 100, 0.2, 8);
            const mesh = new THREE.Mesh(tubeGeometry, material);
            this.scene.add(mesh);
        });
    }
    protected update(delta: number) {
        this.animatedTextures.forEach(({ speed, texture }) => {
            texture.offset.x = (texture.offset.x - speed * delta) % 1;
        });
    }
}
