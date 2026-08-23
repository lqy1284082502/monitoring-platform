import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HDRJPGLoader } from '@monogrid/gainmap-js';
import Stats from 'three/addons/libs/stats.module.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import type { WebGLRendererParameters } from 'three';
import { publicUrl } from '@/utils/publicUrl';

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
    // HDR加载器
    protected hdrLoader: HDRJPGLoader | undefined;
    // Stats
    protected stats: Stats | undefined;
    // 视窗大小
    protected viewSize = { width: 0, height: 0 };
    private animateFrame: number | undefined;
    protected isDisposed = false;
    protected isPaused = false;
    private readonly lifecycleClock = new THREE.Clock();
    private readonly cleanupTasks: Array<() => void> = [];
    private readonly animationLoop = this.tick.bind(this);

    constructor(dom: HTMLElement, config?: IConfig) {
        this.scene = new THREE.Scene();
        const { devicePixelRatio } = window;
        const { clientWidth, clientHeight } = dom;
        this.viewSize.width = clientWidth;
        this.viewSize.height = clientHeight;

        this.camera = new THREE.PerspectiveCamera(40, clientWidth / clientHeight, 1, 1000);
        this.camera.position.set(-150, 0, 0);
        this.renderer = new THREE.WebGLRenderer({
            powerPreference: 'high-performance',
            ...config?.rendererConfig,
        });
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

        this.camera.position.z = 5;
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    }

    public init(): void | Promise<void> {}

    public start() {
        if (this.isDisposed || this.isPaused || this.animateFrame !== undefined) return;
        this.lifecycleClock.start();
        this.tick();
    }

    public setPaused(paused: boolean) {
        if (this.isDisposed || this.isPaused === paused) return;
        this.isPaused = paused;
        if (paused) {
            if (this.animateFrame !== undefined) cancelAnimationFrame(this.animateFrame);
            this.animateFrame = undefined;
            this.lifecycleClock.stop();
            return;
        }
        this.start();
    }

    private tick() {
        if (this.isDisposed || this.isPaused) {
            this.animateFrame = undefined;
            return;
        }
        const delta = this.lifecycleClock.getDelta();
        this.update(delta, this.lifecycleClock.elapsedTime);
        this.controls.update();
        this.render();
        this.stats?.update();
        this.animateFrame = requestAnimationFrame(this.animationLoop);
    }

    protected update(delta: number, elapsed: number) {
        void delta;
        void elapsed;
    }

    protected render() {
        this.renderer.render(this.scene, this.camera);
        this.renderLabels();
    }

    protected renderLabels() {
        this.labelRender.render(this.scene, this.camera);
    }

    protected registerCleanup(cleanup: () => void) {
        if (this.isDisposed) cleanup();
        else this.cleanupTasks.push(cleanup);
    }

    protected registerDisposable<T extends { dispose: () => void }>(resource: T): T {
        this.registerCleanup(() => resource.dispose());
        return resource;
    }

    protected listen(target: EventTarget, type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean) {
        target.addEventListener(type, listener, options);
        this.registerCleanup(() => target.removeEventListener(type, listener, options));
    }
    /**
     * 加载HDR贴图
     * */
    public loadHDRI(url?: string): Promise<THREE.Texture> {
        const urlStr = url ? url : publicUrl('textures/gainmap/spruit_sunrise_4k.jpg');
        return new Promise((resolve, reject) => {
            this.hdrLoader = new HDRJPGLoader(this.renderer);
            const hdrJpgLoad = this.hdrLoader.load(urlStr, (texture) => {
                const hdr = texture.renderTarget.texture;
                // 重置渲染器的toneMappingExposure属性
                hdr.mapping = THREE.EquirectangularReflectionMapping;
                // 释放资源
                hdrJpgLoad.dispose();
                if (!hdr) {
                    reject(new Error('HDR texture failed to load'));
                    return;
                }
                if (this.isDisposed) hdr.dispose();
                else {
                    this.scene.background = hdr;
                    this.scene.environment = hdr;
                }
                resolve(hdr);
            });
        });
    }

    /**
     * 使用stats
     * */
    public useStats() {
        if (this.stats) return;
        this.stats = new Stats();
        this.stats.dom.style.position = 'absolute';
        this.stats.dom.style.top = '0px';
        this.dom.appendChild(this.stats.dom);
    }
    /**
     * 销毁
     * */
    public dispose() {
        if (this.isDisposed) return;
        this.isDisposed = true;
        if (this.animateFrame !== undefined) {
            cancelAnimationFrame(this.animateFrame);
            this.animateFrame = undefined;
        }
        this.lifecycleClock.stop();
        for (const cleanup of this.cleanupTasks.splice(0).reverse()) {
            cleanup();
        }
        this.controls?.dispose();
        const textures = new Set<THREE.Texture>();
        [this.scene.background, this.scene.environment].forEach((texture) => {
            if (texture instanceof THREE.Texture) textures.add(texture);
        });
        this.scene.traverse((object) => {
            const mesh = object as THREE.Mesh;
            mesh.geometry?.dispose();
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            materials.filter(Boolean).forEach((material) => {
                Object.values(material).forEach((value) => {
                    if (value instanceof THREE.Texture) textures.add(value);
                });
                material.dispose();
            });
        });
        textures.forEach((texture) => texture.dispose());
        this.stats?.dom.remove();
        this.labelRender.domElement.remove();
        this.renderer.domElement.remove();
        this.renderer.dispose();
        this.scene.clear();
    }
    /**
     * 监听窗口变化
     * */
    public onWindowResize() {
        const { clientWidth, clientHeight } = this.dom;
        this.viewSize.width = clientWidth;
        this.viewSize.height = clientHeight;
        this.camera.aspect = clientWidth / clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(clientWidth, clientHeight);
        this.labelRender.setSize(clientWidth, clientHeight);
        this.onResize();
    }

    protected onResize() {}
    /**
     * 设置相机参数
     * */
    public setCameraProps(props: Partial<Pick<THREE.PerspectiveCamera, 'fov' | 'aspect' | 'near' | 'far'>>) {
        Object.assign(this.camera, props);
        this.camera.updateProjectionMatrix();
    }
}
