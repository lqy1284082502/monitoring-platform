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
    private outlinePass: OutlinePass | null = null;
    private label: CSS2DObject | null = null;
    private readonly handleMouseClick = this.onMouseClick.bind(this);
    private labelRoot: Root | null = null;
    private readonly raycaster = new THREE.Raycaster();
    private readonly pointer = new THREE.Vector2();
    constructor(dom: HTMLElement) {
        super(dom);
    }
    public async init() {
        this.camera.fov = 75;
        this.camera.near = 0.1;
        this.camera.far = 1000;
        this.camera.position.set(0, 0, 15);
        this.camera.updateProjectionMatrix();
        await this.enableLabelRenderer();
        if (this.isDisposed) return;
        this.initCube();
        this.initLabel();
        this.listen(this.dom, 'click', this.handleMouseClick as EventListener);
    }
    // 添加立方体
    public initCube() {
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshBasicMaterial({ color: '#00ffff' });
        const cube = new THREE.Mesh(geometry, material);
        const cubesEdges = new THREE.EdgesGeometry(geometry, 1);
        const edgesMtl = new THREE.LineBasicMaterial({ color: '#ffffff', linewidth: 3 });
        for (let i = 0; i < 3; i++) {
            const cubesLine = new THREE.LineSegments(cubesEdges, edgesMtl);

            const newCube = cube.clone();
            newCube.name = `cube${i}`;
            newCube.position.x = (i - 1) * 3;
            newCube.add(cubesLine);
            this.scene.add(newCube);
        }
    }
    private initLabel() {
        const htmlElement = document.createElement('div');
        this.labelRoot = ReactDOM.createRoot(htmlElement);
        this.label = new CSS2DObject(htmlElement);
        this.label.name = 'label';
        this.label.visible = false;
        this.scene.add(this.label);
    }

    private ensureOutlinePass() {
        if (this.composer && this.outlinePass) return;
        const renderScene = new RenderPass(this.scene, this.camera);
        const outlinePass = new OutlinePass(new THREE.Vector2(this.viewSize.width, this.viewSize.height), this.scene, this.camera, []);
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
        this.outlinePass = outlinePass;
    }

    private setSelection(materialObj?: THREE.Object3D<THREE.Object3DEventMap>) {
        if (!materialObj) {
            if (this.outlinePass) this.outlinePass.selectedObjects = [];
            if (this.label) this.label.visible = false;
            return;
        }

        this.ensureOutlinePass();
        if (this.outlinePass) this.outlinePass.selectedObjects = [materialObj];
        this.labelRoot?.render(React.createElement(Label, { name: materialObj.name }));
        if (this.label) {
            this.label.position.copy(materialObj.position);
            this.label.position.y = 2;
            this.label.visible = true;
        }
    }
    // 射线拾取
    private rayCaster(event: MouseEvent, geometryList: THREE.Object3D<THREE.Object3DEventMap>[]) {
        const { width, height, left, top } = this.dom.getBoundingClientRect();
        this.pointer.set(((event.clientX - left) / width) * 2 - 1, -((event.clientY - top) / height) * 2 + 1);
        this.raycaster.setFromCamera(this.pointer, this.camera);
        return this.raycaster.intersectObjects(geometryList);
    }
    // 鼠标点击事件
    private onMouseClick(event: MouseEvent) {
        const intersects = this.rayCaster(event, this.scene.children as THREE.Object3D<THREE.Object3DEventMap>[]);
        const selectBoxObj = intersects.find((item) => item.object instanceof THREE.Mesh)?.object;
        this.setSelection(selectBoxObj);
    }
    protected render() {
        if (this.composer && this.outlinePass?.selectedObjects.length) {
            this.composer.render();
            this.renderLabels();
            return;
        }
        super.render();
    }

    public dispose() {
        this.labelRoot?.unmount();
        this.composer?.dispose();
        this.outlinePass = null;
        super.dispose();
    }

    protected onResize() {
        this.composer?.setSize(this.viewSize.width, this.viewSize.height);
    }
}
