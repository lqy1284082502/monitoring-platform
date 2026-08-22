import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

export class Css2DObject {
    public dom: HTMLElement;

    constructor() {
        this.dom = document.createElement('div');
    }
}
export { CSS2DRenderer };
