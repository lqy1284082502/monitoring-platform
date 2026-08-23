import type { RouteObject } from 'react-router-dom';
import * as THREE from 'three';

declare type RouteObjectIncludesMeta = RouteObject & {
    meta?: {
        title?: string;
        icon?: string;
        keywords?: string;
    };
};

export namespace IBaseInterface {
    export interface IConfigItem {
        id: number;
        name: string;
        path: string;
        className: string;
        componentName: string;
        thumbnail: {
            path: string;
            waitMs: number;
        };
    }
    export interface IGeoJsonFeatures {
        type: string;
        properties: {
            adcode: number;
            name: string;
            center: THREE.Vector2;
            centroid: THREE.Vector2;
            childrenNum: number;
            level: string;
            parent: {
                adcode: number;
            };
            subFeatureIndex: number;
            acroutes: THREE.Vector3;
        };
        geometry: {
            type: string;
            coordinates: [THREE.Vector2[][]];
        };
    }
    // geoJson结构定义
    export interface IGeoJson {
        type: string;
        features: IGeoJsonFeatures[];
    }
}

declare global {
    // 索引类型
    interface IndexType {
        [key: string]: any;
    }
    namespace Common {
        interface CameraProps {
            fov: number;
            aspect: number;
            near: number;
            far: number;
        }
        // 经纬度数组坐标
        type LatLng = [number, number];
    }
}
