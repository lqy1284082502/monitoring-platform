import { ThreeScene } from '@/three/commonClass/ThreeScene';
import * as THREE from 'three';
import { Group, LineLoop, MeshBasicMaterial, MeshStandardMaterial, ShaderMaterial, Vector2, Vector3 } from 'three';
import * as d3 from 'd3';
import { GeoProjection } from 'd3';
import type { GeoJsonCollection } from '@/types/geoJson';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { VignetteShader } from 'three/addons/shaders/VignetteShader.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import * as TWEEN from '@tweenjs/tween.js';
import type { Mesh } from 'three';
import { Text } from 'troika-three-text';
import vertexShader from '@/shaders/mapFilters/vertexShader.glsl?raw';
import fragmentShader from '@/shaders/mapFilters/fragmentShader.glsl?raw';
import { publicUrl } from '@/utils/publicUrl';

// 城市边界shader
import cityVertexShader from '@/shaders/cityBoundaries/vertexShader.glsl?raw';
import cityFragmentShader from '@/shaders/cityBoundaries/fragmentShader.glsl?raw';

// 后期混合shader
import mixVertexShader from '@/shaders/mixPass/vertexShader.glsl?raw';
import mixFragmentShader from '@/shaders/mixPass/fragmentShader.glsl?raw';

const BLOOM_SCENE = 1;
const MAX_PIXEL_RATIO = 1.5;
const BLOOM_RESOLUTION_SCALE = 0.5;
// Troika parses TTF, OTF, and WOFF files directly; WOFF2 is not supported.
const FLOATING_LABEL_FONT = publicUrl('fonts/geo-city-labels.woff');
const FLOATING_LABEL_HEIGHT = 18;
const FLOATING_LABEL_FLOAT_AMPLITUDE = 1.5;

interface FloatingCityLabel {
    anchor: THREE.Object3D;
    guide: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
    opacity: number;
    text: Text;
    visible: boolean;
}
/**
 * three初始场景
 * */
export class GeoJsonLoad extends ThreeScene {
    private map = new THREE.Object3D();
    private raycaster = new THREE.Raycaster();
    private mouse = new THREE.Vector2();
    private province = new Group();
    private textureLoader: THREE.TextureLoader;
    private fileLoader: THREE.FileLoader;
    // 除辉光外的后期处理
    private composer: EffectComposer | undefined;
    // 辉光后期处理
    private bloomComposer: EffectComposer | undefined;
    private fxaaPass: ShaderPass | undefined;
    // 需要添加后期的地板
    private floor: Mesh | undefined;
    // 时间对象
    private clock = new THREE.Clock();
    // 城市边界材质
    private cityMaterial: ShaderMaterial | undefined;
    // 时间
    private time = 1.0;
    // 点击border缓存对象
    private clickedBorder: LineLoop | undefined;
    private readonly handleMapClick = this.handleClick.bind(this);
    private activeFloatingLabel: FloatingCityLabel | undefined;
    private fadingFloatingLabels: FloatingCityLabel[] = [];
    constructor(dom: HTMLElement) {
        super(dom);
        this.camera.far = 1500;
        this.camera.near = 10;
        this.camera.position.set(-296, 143, 88);
        this.camera.updateProjectionMatrix();
        // 初始化加载器
        this.textureLoader = new THREE.TextureLoader().setPath(publicUrl('textures/'));
        this.fileLoader = new THREE.FileLoader().setPath(import.meta.env.BASE_URL);
    }
    /**
     * 初始化方法
     * */
    public init() {
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
        // 关闭控制拖拽
        this.controls.enablePan = false;
        // 设置控制器的最大最小旋转角度
        this.controls.maxPolarAngle = (0.9 * Math.PI) / 2;
        // 设置最大和最小缩放
        this.controls.minDistance = 100;
        this.controls.maxDistance = 500;
        // 设置控制器自动旋转
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.2;

        this.loadHDRI(publicUrl('textures/gainmap/spruit_sunrise_4k.jpg'))
            .then(() => {
                if (this.isDisposed) return;
                this.scene.background = null;
                // this.scene.environment = null;
                this.loadTheSkybox();
                this.addLight();
                this.createFloor();
                this.LoadingGeoJson();

                // shader着色器
                this.cityMaterial = new THREE.ShaderMaterial({
                    uniforms: {
                        time: { value: 0.0 },
                        len: { value: 0.05 },
                        size: { value: 0.5 },
                        color1: { value: new THREE.Color('#FFFFFF') },
                        color2: { value: new THREE.Color('#FFFF00') },
                    },
                    vertexShader: cityVertexShader,
                    fragmentShader: cityFragmentShader,
                });
            })
            .catch(() => undefined);
    }

    /**
     * 加载GeoJson地图
     * */
    private LoadingGeoJson() {
        // 加载地图侧边纹理
        const texture = this.textureLoader.load('bg.jpg');
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.offset.set(0, 0.1);
        texture.repeat.set(0.1, 0.1);
        // 旋转纹理 180度
        texture.rotation = Math.PI;

        this.fileLoader.load('models/map/cd.json', (data) => {
            if (this.isDisposed) return;
            if (typeof data !== 'string') return;

            // 数据格式化
            const json: GeoJsonCollection = JSON.parse(data);
            // 创建坐标系获取数据对象
            const projection = d3.geoMercator().center([104.06, 30.67]).scale(10000).translate([0, 0]);
            const features = json.features;
            // 遍历数据
            features.forEach((feature) => {
                // 只渲染双流区;
                // if (feature.properties.name !== '武侯区') return;
                const coordinates = feature.geometry.coordinates;

                if (feature.geometry.type === 'MultiPolygon') {
                    const materials = [
                        new THREE.MeshStandardMaterial({
                            color: new THREE.Color(`hsl(${233},${Math.random() * 30 + 55}%,${Math.random() * 30 + 55}%)`).getHex(),
                            metalness: 0.5,
                            roughness: 0.5,
                        }),
                        // 设置多边形偏移，防止深度冲突
                        new THREE.MeshBasicMaterial({
                            map: texture,
                            polygonOffset: true,
                            polygonOffsetFactor: 1,
                            polygonOffsetUnits: 1,
                        }),
                    ];
                    // 多个多边形
                    coordinates.forEach((polygon) => {
                        const { mesh, border } = this.drawExtrudeMesh(polygon[0], projection, materials);
                        const group = new THREE.Group();
                        mesh.userData = feature.properties;
                        // if (feature.properties.name === '都江堰市') {
                        //     mesh.layers.enable(1);
                        // }

                        // 获取模型包围盒中心点
                        const boundingBox = new THREE.Box3().setFromObject(mesh);
                        const boundingBoxCenter = new THREE.Vector3();
                        boundingBox.getCenter(boundingBoxCenter);

                        group.userData.labelAnchor = boundingBoxCenter;
                        // 城市模型
                        group.add(mesh);
                        // 城市边框
                        group.add(border);
                        group.name = feature.properties.name;

                        this.province.add(group);
                    });
                }
            });
            this.map.add(this.province);
            this.postProcessing();
            const size = 0.8;
            this.map.scale.set(size, size, size);
            this.map.rotation.x = -Math.PI / 2;
            this.scene.add(this.map);

            this.listen(window, 'click', this.handleMapClick as EventListener);
        });
    }

    /**
     * 生成挤压网格
     * */
    private drawExtrudeMesh(polygon: Vector2[], projection: GeoProjection, texture: (MeshStandardMaterial | MeshBasicMaterial)[]) {
        const shape = new THREE.Shape();
        const points: THREE.Vector3[] = [];
        polygon.forEach(([x, y], index) => {
            const p = projection([x, y]);
            if (!p) return;
            if (index === 0) {
                shape.moveTo(p[0], p[1]);
            } else {
                shape.lineTo(p[0], p[1]);
            }
            points.push(new THREE.Vector3(...p, 10.5));
        });

        const extrudeSettings = {
            depth: 10,
            bevelEnabled: false,
        };
        const borderGrid = new THREE.BufferGeometry().setFromPoints(points);
        // 创建一个CurvePath
        const curvePath: THREE.CurvePath<Vector3> = new THREE.CurvePath();
        points.forEach((point, i) => {
            if (i < points.length - 1) {
                curvePath.add(new THREE.LineCurve3(point, points[i + 1]));
            }
        });

        const mesh = new THREE.LineLoop(
            borderGrid,
            new THREE.MeshBasicMaterial({ color: '#00ff00', polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 })
        );

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

        return {
            mesh: new THREE.Mesh(geometry, texture),
            border: mesh,
        };
    }

    /**
     * 处理鼠标点击事件
     * */
    private handleClick(event: MouseEvent) {
        // 关闭控制器自动旋转

        if (this.clock.autoStart) {
            this.clock.start();
            this.controls.autoRotate = false;
        }
        // 射线
        this.mouse.x = (event.clientX / this.viewSize.width) * 2 - 1;
        this.mouse.y = -(event.clientY / this.viewSize.height) * 2 + 1;

        // 通过摄像机和鼠标位置更新射线
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // 设置射线的起点和方向
        const intersects = this.raycaster.intersectObjects(this.province.children);
        if (intersects.length) {
            this.resetAllProvince();
            const selectedObject = intersects[0].object.parent;
            if (selectedObject) {
                selectedObject.userData.clieked = true;
                new TWEEN.Tween(selectedObject.position).to({ x: 0, y: 0, z: 15 }, 500).easing(TWEEN.Easing.Quadratic.InOut).start();
                // 获取LineLoop对象
                this.clickedBorder = selectedObject.children.find((child) => child instanceof LineLoop) as LineLoop | undefined;
                if (this.clickedBorder) {
                    // 获取 LineLoop 的点
                    const vertices = this.clickedBorder.geometry.attributes.position.array;
                    // 创建一个CurvePath
                    const curvePath: THREE.CurvePath<Vector3> = new THREE.CurvePath();
                    // 将顶点数据添加到CurvePath中
                    for (let i = 0; i < vertices.length; i += 3) {
                        let point = new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
                        if (i < vertices.length - 3) {
                            let nextPoint = new THREE.Vector3(vertices[i + 3], vertices[i + 4], vertices[i + 5]);
                            curvePath.add(new THREE.LineCurve3(point, nextPoint));
                        }
                    }
                    // 使用CurvePath创建TubeGeometry
                    const tubeGeometry = new THREE.TubeGeometry(curvePath, vertices.length, 0.2, 8, false);
                    // 创建新的 Mesh
                    const tubeMesh = new THREE.Mesh(tubeGeometry, this.cityMaterial);
                    tubeMesh.userData = { type: 'tubeMesh' };

                    // 从父对象中移除 LineLoop
                    selectedObject.remove(this.clickedBorder);

                    // 将新的 Mesh 添加到父对象中
                    selectedObject.add(tubeMesh);
                    tubeMesh.layers.enable(BLOOM_SCENE);
                }
                this.showFloatingLabel(selectedObject, selectedObject.name);
            }
        } else {
            this.resetAllProvince();
        }
    }
    /**
     * 重置所有省份状态
     * */
    private resetAllProvince() {
        this.hideActiveFloatingLabel();
        this.province.children.forEach((item) => {
            if (item.userData.clieked) {
                item.userData.clieked = false;
                new TWEEN.Tween(item.position).to({ x: 0, y: 0, z: 0 }, 500).easing(TWEEN.Easing.Quadratic.InOut).start();
                // 获取TubeGeometry对象
                const tubeMesh = item.children.find((child) => child.userData.type === 'tubeMesh') as Mesh | undefined;
                if (tubeMesh && this.clickedBorder) {
                    // 从父对象中移除 TubeGeometry
                    item.remove(tubeMesh);
                    // 将 LineLoop 添加到父对象中
                    item.add(this.clickedBorder);
                    tubeMesh.geometry.dispose();
                }
            }
        });
    }
    private showFloatingLabel(selectedObject: THREE.Object3D, cityName: string) {
        this.hideActiveFloatingLabel();

        const anchor = new THREE.Object3D();
        anchor.position.copy(selectedObject.userData.labelAnchor as THREE.Vector3);
        selectedObject.add(anchor);

        const text = new Text();
        text.text = cityName;
        text.font = FLOATING_LABEL_FONT;
        text.fontSize = 7;
        text.anchorX = 'center';
        text.anchorY = 'middle';
        text.color = '#e9fbff';
        text.outlineColor = '#126cff';
        text.outlineWidth = 0.08;
        text.fillOpacity = 0;
        text.outlineOpacity = 0;
        text.renderOrder = 4;
        text.visible = false;
        text.layers.enable(BLOOM_SCENE);
        text.sync(() => {
            if (!this.isDisposed) text.visible = true;
        });

        const guideGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
        const guideMaterial = new THREE.LineBasicMaterial({
            color: '#28ddff',
            transparent: true,
            opacity: 0,
            depthWrite: false,
        });
        const guide = new THREE.Line(guideGeometry, guideMaterial);
        guide.renderOrder = 3;
        guide.layers.enable(BLOOM_SCENE);
        this.scene.add(text, guide);

        this.activeFloatingLabel = { anchor, guide, opacity: 0, text, visible: true };
    }

    private hideActiveFloatingLabel() {
        if (!this.activeFloatingLabel) return;
        this.activeFloatingLabel.visible = false;
        this.fadingFloatingLabels.push(this.activeFloatingLabel);
        this.activeFloatingLabel = undefined;
    }

    private updateFloatingLabel(label: FloatingCityLabel, delta: number, elapsed: number) {
        const targetOpacity = label.visible ? 1 : 0;
        const transition = 1 - Math.exp(-10 * delta);
        label.opacity = THREE.MathUtils.lerp(label.opacity, targetOpacity, transition);

        label.anchor.updateWorldMatrix(true, false);
        const anchorPosition = label.anchor.getWorldPosition(new THREE.Vector3());
        const hoverOffset = FLOATING_LABEL_HEIGHT + Math.sin(elapsed * 2.4) * FLOATING_LABEL_FLOAT_AMPLITUDE;
        label.text.position.set(anchorPosition.x, anchorPosition.y + hoverOffset, anchorPosition.z);
        label.text.quaternion.copy(this.camera.quaternion);
        label.text.fillOpacity = label.opacity;
        label.text.outlineOpacity = label.opacity;
        label.guide.material.opacity = label.opacity * 0.85;

        const positions = label.guide.geometry.attributes.position;
        positions.setXYZ(0, anchorPosition.x, anchorPosition.y, anchorPosition.z);
        positions.setXYZ(1, anchorPosition.x, anchorPosition.y + hoverOffset - 2.5, anchorPosition.z);
        positions.needsUpdate = true;
    }

    private disposeFloatingLabel(label: FloatingCityLabel) {
        label.anchor.removeFromParent();
        label.text.removeFromParent();
        label.guide.removeFromParent();
        label.text.dispose();
        label.guide.geometry.dispose();
        label.guide.material.dispose();
    }

    protected update(delta: number, elapsed: number) {
        if (this.cityMaterial) {
            this.time = this.time >= 1 ? 0 : this.time + 0.01;
            this.cityMaterial.uniforms.time.value = this.time;
        }

        TWEEN.update();

        if (this.clock.getElapsedTime() > 30) {
            this.controls.autoRotate = true;
        }

        if (this.activeFloatingLabel) {
            this.updateFloatingLabel(this.activeFloatingLabel, delta, elapsed);
        }
        this.fadingFloatingLabels = this.fadingFloatingLabels.filter((label) => {
            this.updateFloatingLabel(label, delta, elapsed);
            if (label.opacity > 0.01) return true;
            this.disposeFloatingLabel(label);
            return false;
        });
    }

    protected render() {
        if (this.bloomComposer) {
            const previousCameraMask = this.camera.layers.mask;
            const previousBackground = this.scene.background;
            try {
                this.scene.background = null;
                this.camera.layers.set(BLOOM_SCENE);
                this.bloomComposer.render();
            } finally {
                this.camera.layers.mask = previousCameraMask;
                this.scene.background = previousBackground;
            }
        }

        if (this.composer) this.composer.render();
        else super.render();
    }

    public dispose() {
        if (this.activeFloatingLabel) this.disposeFloatingLabel(this.activeFloatingLabel);
        this.fadingFloatingLabels.forEach((label) => this.disposeFloatingLabel(label));
        this.activeFloatingLabel = undefined;
        this.fadingFloatingLabels = [];
        super.dispose();
    }

    protected onResize() {
        this.composer?.setSize(this.viewSize.width, this.viewSize.height);
        this.bloomComposer?.setSize(this.viewSize.width, this.viewSize.height);
        const pixelRatio = this.renderer.getPixelRatio();
        if (this.fxaaPass) {
            this.fxaaPass.material.uniforms['resolution'].value.set(1 / (this.viewSize.width * pixelRatio), 1 / (this.viewSize.height * pixelRatio));
        }
    }

    /**
     * 生成地板
     * */
    private createFloor() {
        const planeConfig = {
            width: 1000,
            height: 1000,
        };
        const loadFloorTexture = (fileName: string) =>
            this.textureLoader.load(fileName, undefined, undefined, () => {
                console.error(`Failed to load floor texture: ${fileName}`);
            });

        // 创建蜂窝地板
        const texture = loadFloorTexture('floor-bg.png');
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        const repeatSize1 = 50;
        texture.repeat.set(repeatSize1, repeatSize1);

        // 创建蜂窝边框
        const texture1 = loadFloorTexture('floor-border.png');
        texture1.wrapS = texture1.wrapT = THREE.RepeatWrapping;
        texture1.repeat.set(repeatSize1, repeatSize1);

        // 加载网格贴图
        const texture2 = loadFloorTexture('地板线01.png');
        texture2.wrapS = texture2.wrapT = THREE.RepeatWrapping;
        texture2.repeat.set(repeatSize1, repeatSize1);

        const floorGeometry = new THREE.PlaneGeometry(planeConfig.width, planeConfig.height);
        const floorMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0.26,
            color: '#356DE1',
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(0, -3, 0);

        // 蜂窝地板
        const floor1 = floor.clone();
        floor1.material = new THREE.MeshBasicMaterial({
            map: texture1,
            transparent: true,
            opacity: 0.56,
            color: '#002A48',
        });

        // 网格地板下
        const floor2 = floor.clone();
        floor2.material = new THREE.MeshBasicMaterial({
            map: texture2,
            transparent: true,
            opacity: 1,
            color: '#4F8FFF',
        });

        // 网格地板上
        this.floor = floor2.clone();
        this.floor.position.set(0, 0, 0);
        this.scene.add(floor, floor1, floor2, this.floor);
    }
    /**
     * 加载天空盒
     * */
    private loadTheSkybox() {
        const cubeLoader = new THREE.CubeTextureLoader().setPath(publicUrl('textures/type1/'));
        const skyboxTexTures = ['posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg'];
        this.scene.background = cubeLoader.load(skyboxTexTures);
    }
    /**
     * 光源添加
     * */
    private addLight() {
        // 添加环境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(ambientLight);
    }
    /**
     * 后期处理
     * */
    private postProcessing() {
        if (!this.floor) return;
        // 第一个后期处理
        const renderPass = new RenderPass(this.scene, this.camera);
        renderPass.clearAlpha = 0;

        this.composer = this.registerDisposable(new EffectComposer(this.renderer));

        // fxaa后期处理
        const fxaaPass = new ShaderPass(FXAAShader);
        this.fxaaPass = fxaaPass;
        const pixelRatio = this.renderer.getPixelRatio();

        fxaaPass.material.uniforms['resolution'].value.x = 1 / (this.viewSize.width * pixelRatio);
        fxaaPass.material.uniforms['resolution'].value.y = 1 / (this.viewSize.height * pixelRatio);
        // 输出后期处理
        const outputPass = new OutputPass();

        // 晕影着色器
        const vignettePass = new ShaderPass(VignetteShader);
        // 色彩校正着色器
        const colorCorrectionPass = new ShaderPass({
            uniforms: {
                tDiffuse: { value: null },
                powRGB: { value: new Vector3(2, 2, 2) },
                mulRGB: { value: new Vector3(1, 1, 1) },
                addRGB: { value: new Vector3(0, 0, 0) },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
        });

        // 发光体
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(this.dom.offsetWidth, this.dom.offsetHeight), 1.5, 0.4, 0.85);
        bloomPass.threshold = 0;
        bloomPass.strength = 0.5;
        bloomPass.radius = 0.5;

        // 第二个后期处理
        this.bloomComposer = this.registerDisposable(new EffectComposer(this.renderer));
        this.bloomComposer.renderToScreen = false;
        this.bloomComposer.setPixelRatio(this.renderer.getPixelRatio() * BLOOM_RESOLUTION_SCALE);
        const bloomRenderPass = new RenderPass(this.scene, this.camera);
        bloomRenderPass.clearAlpha = 0;
        this.bloomComposer.addPass(bloomRenderPass);
        this.bloomComposer.addPass(bloomPass);

        // 混合后期shader处理
        const mixPass = new ShaderPass(
            new THREE.ShaderMaterial({
                uniforms: {
                    baseTexture: { value: null },
                    bloomTexture: { value: this.bloomComposer.renderTarget2.texture },
                },
                vertexShader: mixVertexShader,
                fragmentShader: mixFragmentShader,
                defines: {},
            }),
            'baseTexture'
        );
        mixPass.needsSwap = true;

        this.composer.addPass(renderPass);
        this.composer.addPass(fxaaPass);
        this.composer.addPass(colorCorrectionPass);
        this.composer.addPass(vignettePass);
        this.composer.addPass(mixPass);
        // outputPass必须添加到最后一样
        this.composer.addPass(outputPass);
    }
}
