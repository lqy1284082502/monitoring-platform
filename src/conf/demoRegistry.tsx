import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { ThreeDemo, type SceneConstructor } from '@/components/ThreeDemo';

type SceneModule = Record<string, SceneConstructor>;

export interface DemoDefinition {
    id: number;
    name: string;
    path: string;
    thumbnail: {
        path: string;
        waitMs: number;
    };
    Component: LazyExoticComponent<ComponentType>;
}

function createDemo<T extends SceneModule>(loadScene: () => Promise<T>, selectScene: (module: T) => SceneConstructor, stats = false) {
    return lazy(async () => {
        const Scene = selectScene(await loadScene());
        return {
            default: () => <ThreeDemo Scene={Scene} stats={stats} />,
        };
    });
}

export const demoRegistry: DemoDefinition[] = [
    {
        id: 0,
        name: 'HDR加载',
        path: '/item/hdr-load',
        thumbnail: { path: 'previews/hdr-load.webp', waitMs: 1800 },
        Component: createDemo(
            () => import('@/three/example/HDRLoad'),
            ({ HDRLoad }) => HDRLoad,
            true
        ),
    },
    {
        id: 1,
        name: '材质光照',
        path: '/item/light-mapping',
        thumbnail: { path: 'previews/light-mapping.webp', waitMs: 2500 },
        Component: createDemo(
            () => import('@/three/example/LightMapping'),
            ({ LightMapping }) => LightMapping
        ),
    },
    {
        id: 2,
        name: 'geoJson加载',
        path: '/item/geo-json-load',
        thumbnail: { path: 'previews/geo-json-load.webp', waitMs: 3500 },
        Component: createDemo(
            () => import('@/three/example/GeoJsonLoad'),
            ({ GeoJsonLoad }) => GeoJsonLoad,
            true
        ),
    },
    {
        id: 3,
        name: 'shader贴图',
        path: '/item/test-scenario',
        thumbnail: { path: 'previews/test-scenario.webp', waitMs: 800 },
        Component: createDemo(
            () => import('@/three/example/TestScenario'),
            ({ TestScenario }) => TestScenario
        ),
    },
    {
        id: 4,
        name: '贴图动画',
        path: '/item/map-animation',
        thumbnail: { path: 'previews/map-animation.webp', waitMs: 1800 },
        Component: createDemo(
            () => import('@/three/example/MapAnimation'),
            ({ MapAnimation }) => MapAnimation
        ),
    },
    {
        id: 5,
        name: '粒子动画',
        path: '/item/ion-animation',
        thumbnail: { path: 'previews/ion-animation.webp', waitMs: 800 },
        Component: createDemo(
            () => import('@/three/example/IonAnimation'),
            ({ IonAnimation }) => IonAnimation
        ),
    },
    {
        id: 6,
        name: '道路流光',
        path: '/item/streaming-light',
        thumbnail: { path: 'previews/streaming-light.webp', waitMs: 1500 },
        Component: createDemo(
            () => import('@/three/example/StreamingLight'),
            ({ StreamingLight }) => StreamingLight
        ),
    },
    {
        id: 7,
        name: '2D渲染',
        path: '/item/2d-render',
        thumbnail: { path: 'previews/2d-render.webp', waitMs: 800 },
        Component: createDemo(
            () => import('@/three/example/TwoDRender'),
            ({ TwoDRender }) => TwoDRender
        ),
    },
    {
        id: 8,
        name: '地球扫光',
        path: '/item/earth-sweep',
        thumbnail: { path: 'previews/earth-sweep.webp', waitMs: 1500 },
        Component: createDemo(
            () => import('@/three/example/EarthSweep'),
            ({ EarthSweep }) => EarthSweep
        ),
    },
    {
        id: 9,
        name: '3D热力图',
        path: '/item/3d-heatmap',
        thumbnail: { path: 'previews/3d-heatmap.webp', waitMs: 1800 },
        Component: createDemo(
            () => import('@/three/example/HeatMap'),
            ({ HeatMap }) => HeatMap
        ),
    },
    {
        id: 10,
        name: '城市扫光',
        path: '/item/city-sweep',
        thumbnail: { path: 'previews/city-sweep.webp', waitMs: 1500 },
        Component: createDemo(
            () => import('@/three/example/CitySweep'),
            ({ CitySweep }) => CitySweep
        ),
    },
    {
        id: 11,
        name: '城市雷达',
        path: '/item/city-radar',
        thumbnail: { path: 'previews/city-radar.webp', waitMs: 1500 },
        Component: createDemo(
            () => import('@/three/example/CityRadar'),
            ({ CityRadar }) => CityRadar
        ),
    },
    {
        id: 12,
        name: '地球案例1',
        path: '/item/earth-case1',
        thumbnail: { path: 'previews/earth-case1.webp', waitMs: 2500 },
        Component: createDemo(
            () => import('@/three/example/EarthCase1/index.ts'),
            ({ EarthCase1 }) => EarthCase1
        ),
    },
    {
        id: 13,
        name: '相机渲染',
        path: '/item/camera-render',
        thumbnail: { path: 'previews/camera-render.webp', waitMs: 3000 },
        Component: createDemo(
            () => import('@/three/example/CameraRender'),
            ({ CameraRender }) => CameraRender
        ),
    },
];
