import type * as THREE from 'three';

export interface GeoJsonFeature {
    type: string;
    properties: {
        adcode: number;
        name: string;
        center: THREE.Vector2;
        centroid: THREE.Vector2;
        childrenNum: number;
        level: string;
        parent: { adcode: number };
        subFeatureIndex: number;
        acroutes: THREE.Vector3;
    };
    geometry: {
        type: string;
        coordinates: [THREE.Vector2[][]];
    };
}

export interface GeoJsonCollection {
    type: string;
    features: GeoJsonFeature[];
}
