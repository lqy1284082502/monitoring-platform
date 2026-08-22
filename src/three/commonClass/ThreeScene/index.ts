import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HDRJPGLoader } from '@monogrid/gainmap-js';
// import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import Stats from 'three/addons/libs/stats.module.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import * as d3 from 'd3';
import type { WebGLRendererParameters } from 'three';

interface IConfig {
    rendererConfig?: WebGLRendererParameters;
}

/**
 * three初始场景
 * */
export class ThreeScene {
    // dom
    protected dom: HTMLElement;
    // 场景
    public scene: THREE.Scene;
    // 相机
    public camera: THREE.PerspectiveCamera;
    // 渲染器
    public renderer: THREE.WebGLRenderer;
    // 2d渲染器
    protected labelRender: CSS2DRenderer;
    // 控制器
    protected controls: OrbitControls;
    // 立方体列表
    protected cubeList: THREE.Mesh[] = [];
    // HDR加载器
    protected hdrLoader: HDRJPGLoader | undefined;
    // Stats
    protected stats: Stats | undefined;
    // 视窗大小
    protected viewSize = { width: 0, height: 0 };
    // 动画帧
    protected animateFrame: number | undefined;

    constructor(dom: HTMLElement, config?: IConfig) {
        this.scene = new THREE.Scene();
        const { devicePixelRatio } = window;
        const { clientWidth, clientHeight } = dom;
        this.viewSize.width = clientWidth;
        this.viewSize.height = clientHeight;

        this.camera = new THREE.PerspectiveCamera(40, clientWidth / clientHeight, 1, 1000);
        this.camera.position.set(-150, 0, 0);
        this.renderer = new THREE.WebGLRenderer(config?.rendererConfig);
        this.renderer.setPixelRatio(devicePixelRatio);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.setSize(clientWidth, clientHeight);
        dom.appendChild(this.renderer.domElement);

        this.labelRender = new CSS2DRenderer();
        this.labelRender.setSize(clientWidth, clientHeight);
        this.labelRender.domElement.style.position = 'absolute';
        this.labelRender.domElement.style.top = '0px';
        /**
         * 这里设置pointerEvents为none，是为了让label不影响鼠标事件
         * 如果需要label响应鼠标事件，可以在具体组件外层的div上设置pointerEvents为auto
         * */
        this.labelRender.domElement.style.pointerEvents = 'none';
        dom.appendChild(this.labelRender.domElement);

        this.dom = dom;

        this.animate();

        this.camera.position.z = 5;
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    }
    public animate() {
        this.animateFrame = requestAnimationFrame(this.animate.bind(this));
        this.cubeList.forEach((cube) => {
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
        });
        this.renderer.render(this.scene, this.camera);
        this.labelRender.render(this.scene, this.camera);
        this.controls && this.controls.update();
        this.stats && this.stats.update();
    }
    /**
     * 加载HDR贴图
     * */
    public loadHDRI(url?: string): Promise<THREE.Texture> {
        const urlStr = url ? url : '/textures/gainmap/spruit_sunrise_4k.jpg';
        return new Promise((resolve, reject) => {
            this.hdrLoader = new HDRJPGLoader(this.renderer);
            const hdrJpgLoad = this.hdrLoader.load(urlStr, (texture) => {
                const hdr = texture.renderTarget.texture;
                // 重置渲染器的toneMappingExposure属性
                hdr.mapping = THREE.EquirectangularReflectionMapping;
                this.scene.background = hdr;
                this.scene.environment = hdr;
                // 释放资源
                hdrJpgLoad.dispose();
                if (hdr) resolve(hdr);
                reject('HDR贴图加载失败');
            });
        });
    }

    /**
     * 使用stats
     * */
    public useStats() {
        this.stats = new Stats();
        this.stats.dom.style.position = 'absolute';
        this.stats.dom.style.top = '0px';
        this.dom.appendChild(this.stats.dom);
    }
    /**
     * 销毁
     * */
    public dispose() {
        this.renderer.dispose();
        this.scene.clear();
    }
    /**
     * 监听窗口变化
     * */
    public onWindowResize() {
        const { innerWidth, innerHeight } = window;
        this.viewSize.width = innerWidth;
        this.viewSize.height = innerHeight;
        this.camera.aspect = innerWidth / innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(innerWidth, innerHeight);
        this.labelRender.setSize(innerWidth, innerHeight);
    }
    /**
     * 设置相机参数
     * */
    public setCameraProps(props: Partial<Common.CameraProps>) {
        Object.entries(props).forEach(([key, value]) => {
            (this.camera as any)[key] = value;
        });
    }

    /**
     * 墨卡托坐标转换为屏幕坐标
     * */
    public getProjection(config?: Partial<IGetProjection>) {
        const { center = [103.846, 35.832], scale = 1000, translate = [0, 0] } = config || {};
        return d3.geoMercator().center(center).scale(scale).translate(translate);
    }
}

interface IGetProjection {
    center: Common.LatLng;
    scale: number;
    translate: Common.LatLng;
}
