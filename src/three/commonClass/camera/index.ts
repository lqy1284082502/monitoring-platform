import * as THREE from 'three';
export class Index {
    protected instance: THREE.PerspectiveCamera;
    constructor(config?: { fov: number; aspect: number; near: number; far: number; position: THREE.Vector3 }) {
        if (config) {
            this.instance = new THREE.PerspectiveCamera(config.fov, config.aspect, config.near, config.far);
            this.instance.position.copy(config.position);
        } else {
            this.instance = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
            this.instance.position.set(-150, 0, 0);
        }
    }
    public getCamera() {
        return this.instance;
    }
}
