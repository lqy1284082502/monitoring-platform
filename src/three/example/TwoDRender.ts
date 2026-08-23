import { ThreeScene } from '@/three/commonClass/ThreeScene';
import * as THREE from 'three';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import Label from '@/three/commonClass/css2DRenderer/components/Label.tsx';
import ReactDOM from 'react-dom/client';
import type { Root } from 'react-dom/client';
import React from 'react';

export class TwoDRender extends ThreeScene {
    private composer: EffectComposer | null = null;
    private label: CSS2DObject | null = null;
    private readonly handleMouseClick = this.onMouseClick.bind(this);
    private labelRoot: Root | null = null;
    constructor(dom: HTMLElement) {
        super(dom);
    }
    public init() {
        this.camera.fov = 75;
        this.camera.near = 0.1;
        this.camera.far = 1000;
        this.camera.position.set(0, 0, 15);
        this.initCube();
        this.listen(this.dom, 'click', this.handleMouseClick as EventListener);
    }
    // 添加立方体
    public initCube() {
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshBasicMaterial({ color: '#00ffff' });
        const cube = new THREE.Mesh(geometry, material);
        for (let i = 0; i < 3; i++) {
            // 添加边框
            const cubesEdges = new THREE.EdgesGeometry(geometry, 1);
            const edgesMtl = new THREE.LineBasicMaterial({
                color: '#ffffff',
                linewidth: 3,
            });
            const cubesLine = new THREE.LineSegments(cubesEdges, edgesMtl);

            const newCube = cube.clone();
            newCube.name = `cube${i}`;
            newCube.position.x = (i - 1) * 3;
            newCube.add(cubesLine);
            this.scene.add(newCube);
        }
    }
    // 呼吸光
    initOutlinePass(materialObj?: THREE.Object3D<THREE.Object3DEventMap>) {
        if (!materialObj) {
            this.composer?.dispose();
            this.composer = null;
            return;
        }
        this.composer?.dispose();
        const renderScene = new RenderPass(this.scene, this.camera);
        const outlinePass = new OutlinePass(new THREE.Vector2(this.viewSize.width, this.viewSize.height), this.scene, this.camera, [materialObj]);
        // 将此通道结果渲染到屏幕
        outlinePass.renderToScreen = true;
        outlinePass.edgeGlow = 1; // 发光强度
        outlinePass.usePatternTexture = false; // 是否使用纹理图案
        outlinePass.edgeThickness = 2; // 边缘浓度
        outlinePass.edgeStrength = 6; // 边缘的强度，值越高边框范围越大
        outlinePass.pulsePeriod = 2; // 闪烁频率，值越大频率越低
        outlinePass.visibleEdgeColor.set('#ff0000'); // 呼吸显示的颜色
        outlinePass.hiddenEdgeColor.set('#ffff00'); // 不可见边缘的颜色
        // 将通道加入组合器
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(renderScene);
        this.composer.addPass(outlinePass);
    }
    // 射线拾取
    private rayCaster(event: MouseEvent, geometryList: THREE.Object3D<THREE.Object3DEventMap>[]) {
        const { width, height, left, top } = this.dom.getBoundingClientRect();
        const x = ((event.clientX - left) / width) * 2 - 1;
        const y = -((event.clientY - top) / height) * 2 + 1;
        const ray = new THREE.Raycaster();
        ray.setFromCamera(new THREE.Vector2(x, y), this.camera);
        return ray.intersectObjects(geometryList);
    }
    // 鼠标点击事件
    private onMouseClick(event: MouseEvent) {
        const intersects = this.rayCaster(event, this.scene.children as THREE.Object3D<THREE.Object3DEventMap>[]);
        if (intersects.length <= 0) return;
        let selectBoxObj: THREE.Object3D<THREE.Object3DEventMap> | undefined = void 0;
        intersects.forEach((item) => {
            if (item.object.type !== 'Mesh' || !!selectBoxObj) return;
            selectBoxObj = item.object;
        });
        if (!selectBoxObj) {
            return this.initOutlinePass();
        } else {
            this.initOutlinePass(selectBoxObj);
        }
        // 根据name从场景中移除元素
        if (this.scene.getObjectByName('label')) {
            this.scene.remove(this.scene.getObjectByName('label') as THREE.Object3D<THREE.Object3DEventMap>);
            this.labelRoot?.unmount();
        }
        const reactElement = React.createElement(Label, { name: (<any>selectBoxObj).name });
        const htmlElement = document.createElement('div');
        this.labelRoot = ReactDOM.createRoot(htmlElement);
        this.labelRoot.render(reactElement);
        this.label = new CSS2DObject(htmlElement);
        this.label.name = 'label';
        this.label.position.copy((selectBoxObj as any).position);
        this.label.position.y = 2;
        this.scene.add(this.label);
    }
    protected render() {
        if (this.composer) {
            this.composer.render();
            this.renderLabels();
            return;
        }
        super.render();
    }

    public dispose() {
        this.labelRoot?.unmount();
        this.composer?.dispose();
        super.dispose();
    }

    protected onResize() {
        this.composer?.setSize(this.viewSize.width, this.viewSize.height);
    }
}
