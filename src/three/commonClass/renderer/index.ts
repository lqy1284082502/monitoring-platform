import * as THREE from 'three';
export class Renderer {
    protected instance: THREE.WebGLRenderer;
    constructor(config?: { antialias: boolean }) {
        if (config) {
            this.instance = new THREE.WebGLRenderer({ antialias: config.antialias });
        } else {
            this.instance = new THREE.WebGLRenderer({ antialias: true });
        }
    }
    public getRenderer() {
        return this.instance;
    }
}
