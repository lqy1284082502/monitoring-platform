import { ThreeScene } from '@/three/commonClass/ThreeScene';
import {
    BufferAttribute,
    BufferGeometry,
    Color,
    Group,
    Mesh,
    NormalBlending,
    Points,
    PointsMaterial,
    ShaderMaterial,
    SphereGeometry,
    Sprite,
    SpriteMaterial,
    Texture,
    Vector3,
} from 'three';
import erVertex from '@/shaders/earthCase1/earthMaterial/vertexShader.glsl?raw';
import erFragment from '@/shaders/earthCase1/earthMaterial/fragmentShader.glsl?raw';

import airVertex from '@/shaders/earthCase1/air/vertexShader.glsl?raw';
import airFragment from '@/shaders/earthCase1/air/fragmentShader.glsl?raw';
import { Resources } from '@/three/example/EarthCase1/Resources.ts';
import gsap from 'gsap';
import { publicUrl } from '@/utils/publicUrl';

type uniforms = {
    glowColor: { value: Color };
    scale: { type: string; value: number };
    bias: { type: string; value: number };
    power: { type: string; value: number };
    time: { type: string; value: any };
    isHover: { value: boolean };
    map: { value: Texture | null };
};
export class EarthCase1 extends ThreeScene {
    //地球半径
    private readonly R = 30;
    // 地球光环半径
    private readonly R1 = 35;
    private earthGroup: Group = new Group();
    protected uniforms: uniforms;
    protected timeValue = 0;
    protected around: BufferGeometry | undefined;
    protected resources: Resources | undefined;
    protected aroundPoints: Points | undefined;
    public earth: Mesh<SphereGeometry, ShaderMaterial> | undefined;
    private group = new Group();

    constructor(dom: HTMLDivElement) {
        super(dom);
        this.timeValue = 100;
        this.uniforms = {
            glowColor: { value: new Color(0x0cd1eb) },
            scale: { type: 'f', value: -1.0 },
            bias: { type: 'f', value: 1.0 },
            power: { type: 'f', value: 3.3 },
            time: { type: 'f', value: this.timeValue },
            isHover: { value: false },
            map: { value: null },
        };
        this.group.scale.set(0, 0, 0);
        this.loadHDRI(publicUrl('textures/gainmap/spruit_sunrise_4k.jpg'))
            .then(() => {
                if (this.isDisposed) return;
                this.scene.background = null;
            })
            .catch(() => undefined);
    }

    init() {
        this.resources = new Resources(async () => {
            if (this.isDisposed) return;
            this.createEarth();
            this.createStarts();
            this.createEarthGlow();
            this.createEarthAperture();
            this.show();
        });
        this.registerCleanup(() => this.resources?.dispose());
    }
    //创建地球
    private createEarth() {
        const earth_geometry = new SphereGeometry(this.R, 60, 30);
        const earth_border = new SphereGeometry(this.R1, 40, 40);
        const pointMaterial = new PointsMaterial({
            color: 0x81ffff, //设置颜色，默认 0xFFFFFF
            transparent: true,
            sizeAttenuation: true,
            opacity: 0.5, // 0.1
            vertexColors: false, //定义材料是否使用顶点颜色，默认false ---如果该选项设置为true，则color属性失效
            size: 0.1, //定义粒子的大小。默认为1.0
        });
        const points = new Points(earth_border, pointMaterial); //将模型添加到场景
        this.earthGroup.add(points);

        this.uniforms.map.value = this.resources!.textures.earth;
        const earth_material = new ShaderMaterial({
            // wireframe: true, // 显示模型线条
            uniforms: this.uniforms,
            vertexShader: erVertex,
            fragmentShader: erFragment,
        });
        earth_material.needsUpdate = true;
        this.earth = new Mesh(earth_geometry, earth_material);
        this.earth.name = 'earth';
        this.earthGroup.add(this.earth);
        this.group.add(this.earthGroup);
    }
    // 创建星星
    private createStarts() {
        const vertices = [];
        const colors: any[] = [];
        for (let i = 0; i < 500; i++) {
            const vertex = new Vector3();
            vertex.x = 800 * Math.random() - 300;
            vertex.y = 800 * Math.random() - 300;
            vertex.z = 800 * Math.random() - 300;
            vertices.push(vertex.x, vertex.y, vertex.z);
            colors.push(new Color(1, 1, 1));
        }
        // 星空效果
        this.around = new BufferGeometry();
        this.around.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
        this.around.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));

        const aroundMaterial = new PointsMaterial({
            size: 2,
            sizeAttenuation: true, // 尺寸衰减
            color: 0x4d76cf,
            transparent: true,
            opacity: 1,
            map: this.resources!.textures.gradient,
        });

        this.aroundPoints = new Points(this.around, aroundMaterial);
        this.aroundPoints.name = '星空';
        this.aroundPoints.scale.set(1, 1, 1);
        this.group.add(this.aroundPoints);
    }
    // 地球辉光
    public createEarthGlow() {
        // TextureLoader创建一个纹理加载器对象，可以加载图片作为纹理贴图
        const texture = this.resources!.textures.glow; // 加载纹理贴图
        // 创建精灵材质对象SpriteMaterial
        const spriteMaterial = new SpriteMaterial({
            map: texture, // 设置精灵纹理贴图
            color: 0x4390d1,
            transparent: true, //开启透明
            opacity: 0.7, // 可以通过透明度整体调节光圈
            depthWrite: false, //禁止写入深度缓冲区数据
        });
        // 创建表示地球光圈的精灵模型
        const sprite = new Sprite(spriteMaterial);
        sprite.scale.set(this.R * 3.0, this.R * 3.0, 1); //适当缩放精灵
        this.earthGroup.add(sprite);
    }
    // 创建地球大气层
    public createEarthAperture() {
        //大气层效果
        const AeroSphere = {
            uniforms: {
                coeficient: { type: 'f', value: 1.0 },
                power: { type: 'f', value: 3 },
                glowColor: { type: 'c', value: new Color(0x4390d1) },
            },
            vertexShader: airVertex,
            fragmentShader: airFragment,
        };
        //球体 辉光 大气层
        const material1 = new ShaderMaterial({
            uniforms: AeroSphere.uniforms,
            vertexShader: AeroSphere.vertexShader,
            fragmentShader: AeroSphere.fragmentShader,
            blending: NormalBlending,
            transparent: true,
            depthWrite: false,
        });
        const sphere = new SphereGeometry(this.R, 50, 50);
        const mesh = new Mesh(sphere, material1);
        this.earthGroup.add(mesh);
    }
    // 展示动画
    private show() {
        this.scene.add(this.group);
        gsap.to(this.group.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 2,
            ease: 'Quadratic',
        });
    }
    protected update() {
        if (this.earthGroup) {
            this.earthGroup.rotation.y += 0.002;
        }
        if (this.uniforms) {
            this.uniforms.time.value = this.uniforms.time.value < -this.timeValue ? this.timeValue : this.uniforms.time.value - 1;
        }
    }

    public dispose() {
        gsap.killTweensOf(this.group.scale);
        super.dispose();
    }
}
