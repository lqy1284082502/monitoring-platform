import { ThreeScene } from '@/three/commonClass/ThreeScene';
import lineJson from '@/assets/json/lines.json';
import * as THREE from 'three';
import { publicUrl } from '@/utils/publicUrl';

export class StreamingLight extends ThreeScene {
    private textureArray: THREE.Texture[] = [];
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
        lineJson.features.forEach((item) => {
            const imgUrl = item.subway ? item.subway : 'line1';
            // 纹理贴图
            const texture = new THREE.TextureLoader().load(publicUrl(`image/line/${imgUrl}.png`), function (tex) {
                tex.needsUpdate = true;
                tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
                tex.repeat.set(1, 1);
            });
            // 线条材质
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.BackSide,
                transparent: true,
            });
            const points = item.geometry.coordinates.map((point: number[]) => {
                return new THREE.Vector3((point[1] - 23) * 300, 0, (point[0] - 113) * 300);
            });
            // 曲线
            const curve = new THREE.CatmullRomCurve3(points);
            // 曲线几何体
            const tubeGeometry = new THREE.TubeGeometry(curve, 100, 0.2, 20);
            const mesh = new THREE.Mesh(tubeGeometry, material);
            this.scene.add(mesh);
            this.textureArray.push(texture);
        });
    }
    protected update() {
        if (this.textureArray?.length) {
            this.textureArray.forEach((texture) => {
                texture.offset.x -= Math.random() / 200;
            });
        }
    }
}
