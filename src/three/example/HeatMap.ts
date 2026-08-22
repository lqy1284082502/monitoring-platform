import { ThreeScene } from '@/three/commonClass/ThreeScene';
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import type * as IHeatMap from '../interface/IHeatMap';

import vertexShader from '@/shaders/heatMap/vertexShader.glsl?raw';
import fragmentShader from '@/shaders/heatMap/fragmentShader.glsl?raw';

export class HeatMap extends ThreeScene {
    constructor(dom: HTMLElement) {
        super(dom);
        this.camera.position.set(26.418983330409905, 464.0893611265324, 276.88402793055997);
    }

    public init() {
        this.createChart().then();
    }

    private initHeatMap(): Promise<{ canvas: any; option: any }> {
        return new Promise((resolve) => {
            fetch('/json/traffic.json')
                .then((res) => res.json())
                .then((data: any) => {
                    const info: IHeatMap.InfoType = {
                        max: Number.MIN_SAFE_INTEGER,
                        min: Number.MAX_SAFE_INTEGER,
                        maxlng: Number.MIN_SAFE_INTEGER,
                        minlng: Number.MAX_SAFE_INTEGER,
                        maxlat: Number.MIN_SAFE_INTEGER,
                        minlat: Number.MAX_SAFE_INTEGER,
                        data: [],
                    };
                    const projection = this.getProjection({ scale: 1000 });
                    data.features.forEach((item: any) => {
                        const pos = projection(item.geometry.coordinates);
                        if (!pos) return;
                        const newItem = { lng: pos[0], lat: pos[1], value: item.properties.avg };
                        info.max = Math.max(newItem.value, info.max);
                        info.maxlng = Math.max(newItem.lng, info.maxlng);
                        info.maxlat = Math.max(newItem.lat, info.maxlat);

                        info.min = Math.min(newItem.value, info.min);
                        info.minlng = Math.min(newItem.lng, info.minlng);
                        info.minlat = Math.min(newItem.lat, info.minlat);
                        info.data.push(newItem);
                    });
                    info.size = info.max - info.min;
                    info.sizelng = info.maxlng - info.minlng;
                    info.sizelat = info.maxlat - info.minlat;
                    const radius = 40;
                    const option = {
                        width: info.sizelng + radius * 2,
                        height: info.sizelng + radius * 2,
                        colors: {
                            0.1: '#2A85B8',
                            0.2: '#16B0A9',
                            0.3: '#29CF6F',
                            0.4: '#5CE182',
                            0.5: '#7DF675',
                            0.6: '#FFF100',
                            0.7: '#FAA53F',
                            1: '#D04343',
                        },
                        radius,
                        ...info,
                        // x, y 表示二维坐标； value表示强弱值
                    };
                    const canvas = this.createHeatmap(option);
                    resolve({ option, canvas });
                });
        });
    }

    private async createChart() {
        const { canvas: heatmapCanvas, option } = await this.initHeatMap();
        const map = new THREE.CanvasTexture(heatmapCanvas);
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        const geometry = new THREE.PlaneGeometry(option.width * 0.5, option.height * 0.5, 500, 500);
        const material = new THREE.ShaderMaterial({
            transparent: true,
            side: THREE.DoubleSide,
            uniforms: {
                map: { value: map },
                uHeight: { value: 50 },
                uOpacity: { value: 2.0 },
            },
            vertexShader,
            fragmentShader,
        });
        const plane = new THREE.Mesh(geometry, material);
        plane.rotateX(-Math.PI * 0.5);
        this.scene.add(plane);
        new TWEEN.Tween({ v: 0 })
            .to({ v: 50 }, 2000)

            .onUpdate((obj) => {
                material.uniforms.uHeight.value = obj.v;
            })
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
    }

    private createHeatmap(option: IHeatMap.IPosition) {
        const canvas = document.createElement('canvas');
        // document.body.appendChild(canvas);
        canvas.width = option.width;
        canvas.height = option.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        option.max = option.max - option.min;
        option.data.forEach((item) => {
            this.drawCircle(ctx, option, item);
        });
        const colorData = this.createColors(option);
        if (!colorData) return;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 3; i < imageData.data.length; i = i + 4) {
            let opacity = imageData.data[i];
            let offset = opacity * 4;

            //red
            imageData.data[i - 3] = colorData[offset];
            //green
            imageData.data[i - 2] = colorData[offset + 1];
            //blue
            imageData.data[i - 1] = colorData[offset + 2];
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    private drawCircle(ctx: any, option: any, item: any) {
        let { lng, lat, value } = item;
        let x = lng - option.minlng + option.radius;
        let y = lat - option.minlat + option.radius;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, option.radius);
        grad.addColorStop(0.0, 'rgba(0,0,0,1)');
        grad.addColorStop(1.0, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, option.radius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.globalAlpha = (value - option.min) / option.size;
        ctx.fill();
    }

    private createColors(option: any) {
        const canvas = document.createElement('canvas');
        // document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = 256;
        canvas.height = 1;
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        for (let k in option.colors) {
            grad.addColorStop(Number(k), option.colors[k]);
        }

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        return ctx.getImageData(0, 0, canvas.width, 1).data;
    }
}
