import { useThreeScene } from '@/hooks/useThreeScene';
import './index.less';

export interface ThreeSceneInstance {
    init: () => void | Promise<void>;
    dispose?: () => void;
    onWindowResize?: () => void;
    useStats?: () => void;
}

export type SceneConstructor<T extends ThreeSceneInstance = ThreeSceneInstance> = new (container: HTMLDivElement) => T;

interface ThreeDemoProps<T extends ThreeSceneInstance> {
    Scene: SceneConstructor<T>;
    stats?: boolean;
}

export function ThreeDemo<T extends ThreeSceneInstance>({ Scene, stats = false }: ThreeDemoProps<T>) {
    const containerRef = useThreeScene(Scene, { stats });
    return <div ref={containerRef} className="three-demo" />;
}
