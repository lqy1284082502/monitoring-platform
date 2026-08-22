import * as THREE from 'three';

export class Scene {
    protected instance: THREE.Scene;
    constructor() {
        this.instance = new THREE.Scene();
    }
    public getScene() {
        return this.instance;
    }
}
