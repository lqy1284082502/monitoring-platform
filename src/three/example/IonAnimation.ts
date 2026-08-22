import { ThreeScene } from '@/three/commonClass/ThreeScene';
import * as THREE from 'three';
import { publicUrl } from '@/utils/publicUrl';
import * as TWEEN from '@tweenjs/tween.js';

export class IonAnimation extends ThreeScene {
    private positions: Float32Array = new Float32Array();
    // 点位个数
    private pointNum = 294;
    private randomPoints: THREE.BufferAttribute | THREE.InterleavedBufferAttribute | null = null;
    private counter: number = 0;
    constructor(dom: HTMLElement) {
        super(dom);
        // this.loadHDRI(import.meta.env.VITE_PUBLIC_PATH + '/textures/gainmap/spruit_sunrise_4k.jpg').then();
    }
    init() {
        const geometry = new THREE.BufferGeometry();
        this.getRandom(geometry);
        this.randomPoints = geometry.getAttribute('position');
        setInterval(() => {
            this.counter++;
            this.combineCube(geometry);
        }, 10000);
        const materials = [];
        const texture = new THREE.TextureLoader().load(publicUrl('textures/109951164579600342.png'));
        materials[0] = new THREE.PointsMaterial({
            transparent: true,
            map: texture,
            size: 7,
            // 粒子的大小是否和其与摄像机的距离有光，默认值 true
            sizeAttenuation: true,
        });
        materials[0].alphaTest = 0.5;
        const particles = new THREE.Points(geometry, materials[0]);
        particles.position.set(0, 0, 0);
        this.scene.add(particles);
    }

    private getRandom(geo: THREE.BufferGeometry) {
        const vertices = [];
        for (let i = 0; i < this.pointNum; i++) {
            const x = Math.random() * 200 - 100;
            const y = Math.random() * 200 - 100;
            const z = Math.random() * 200 - 100;
            vertices.push(x, y, z);
        }
        geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    }
    private onUpdate(geo: any, i: number, newVertice: THREE.Vector3) {
        this.positions[i * 3] = newVertice.x;
        this.positions[i * 3 + 1] = newVertice.y;
        this.positions[i * 3 + 2] = newVertice.z;
        geo.setAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3));
    }
    private combineCube(geo: any) {
        const tween = geo.tweens || [];
        const cubeGeometry = new THREE.BoxGeometry(40, 40, 40, 6, 6, 6);
        this.positions = new Float32Array(this.pointNum * 3);
        const positionAttribute = this.counter % 2 ? cubeGeometry.getAttribute('position') : this.randomPoints;
        for (let i = 0; i < this.pointNum; i++) {
            const newVertice = new THREE.Vector3(
                geo.attributes.position.array[i * 3],
                geo.attributes.position.array[i * 3 + 1],
                geo.attributes.position.array[i * 3 + 2]
            );
            const cubeVertice = new THREE.Vector3(positionAttribute?.getX(i), positionAttribute?.getY(i), positionAttribute?.getZ(i));
            if (!tween[i] && cubeVertice) {
                tween.push(new TWEEN.Tween(newVertice).easing(TWEEN.Easing.Exponential.In));
            }
            tween[i].to({ x: cubeVertice.x, y: cubeVertice.y, z: cubeVertice.z }, 3000).onUpdate(() => this.onUpdate(geo, i, newVertice));
            tween[i].start();
        }
    }
    public animate() {
        TWEEN.update();
        const time = Date.now() * 0.00005;
        for (let i = 0; i < this.scene.children.length; i++) {
            const object = this.scene.children[i];
            if (object instanceof THREE.Points) {
                object.rotation.y = time * (i < 4 ? i + 1 : -(i + 1));
            }
        }
        requestAnimationFrame(this.animate.bind(this));
        this.renderer.render(this.scene, this.camera);
    }
}
