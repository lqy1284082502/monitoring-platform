declare module 'troika-three-text' {
    import type { ColorRepresentation, Mesh } from 'three';

    export class Text extends Mesh {
        text: string;
        font: string;
        fontSize: number;
        anchorX: 'left' | 'center' | 'right' | number;
        anchorY: 'top' | 'top-baseline' | 'middle' | 'bottom-baseline' | 'bottom' | number;
        color: ColorRepresentation;
        outlineColor: ColorRepresentation;
        outlineWidth: number | string;
        outlineOpacity: number;
        fillOpacity: number;
        sync(callback?: () => void): void;
        dispose(): void;
    }
}
