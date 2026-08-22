import { ThreeScene } from '@/three/commonClass/ThreeScene';
import TextureAnimator from '@/three/commonClass/utils/TextureAnimator.ts';
import * as THREE from 'three';

export class MapAnimation extends ThreeScene {
    private arrowAni: TextureAnimator | null = null;
    private clock = new THREE.Clock();
    constructor(dom: HTMLElement) {
        super(dom);
        this.loadHDRI('/textures/gainmap/spruit_sunrise_4k.jpg').then();
    }

    public init() {
        const arrowSrc = '/textures/109951164532405066.png';
        const arrowTexture = new THREE.TextureLoader().load(arrowSrc);
        this.arrowAni = new TextureAnimator(arrowTexture, 13, 1, 13, 75);
        const material2 = new THREE.SpriteMaterial({ map: arrowTexture, color: 0xffffff });
        const arrow = new THREE.Sprite(material2);
        arrow.scale.set(20, 20, 1);
        arrow.position.set(0, 0, 0);
        this.scene.add(arrow);
    }

    // 重写父类的animate方法
    public animate() {
        const delta = this.clock?.getDelta() ?? 0;
        this.arrowAni && this.arrowAni.update(delta * 1000);
        requestAnimationFrame(this.animate.bind(this));
        this.renderer.render(this.scene, this.camera);
        this.stats?.update();
    }
}
