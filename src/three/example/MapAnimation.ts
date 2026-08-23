import { ThreeScene } from '@/three/commonClass/ThreeScene';
import TextureAnimator from '@/three/commonClass/utils/TextureAnimator.ts';
import * as THREE from 'three';
import { publicUrl } from '@/utils/publicUrl';

export class MapAnimation extends ThreeScene {
    private arrowAni: TextureAnimator | null = null;
    constructor(dom: HTMLElement) {
        super(dom);
        this.loadHDRI(publicUrl('textures/gainmap/spruit_sunrise_4k.jpg')).catch(() => undefined);
    }

    public init() {
        const arrowSrc = publicUrl('textures/109951164532405066.png');
        const arrowTexture = new THREE.TextureLoader().load(arrowSrc);
        this.arrowAni = new TextureAnimator(arrowTexture, 13, 1, 13, 75);
        const material2 = new THREE.SpriteMaterial({ map: arrowTexture, color: 0xffffff });
        const arrow = new THREE.Sprite(material2);
        arrow.scale.set(20, 20, 1);
        arrow.position.set(0, 0, 0);
        this.scene.add(arrow);
    }

    protected update(delta: number) {
        this.arrowAni?.update(delta * 1000);
    }
}
