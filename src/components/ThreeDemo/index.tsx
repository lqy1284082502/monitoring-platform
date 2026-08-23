import { useThreeScene } from '@/hooks/useThreeScene';
import './index.less';

interface ThreeSceneInstance {
    init: () => void | Promise<void>;
    dispose?: () => void;
    onWindowResize?: () => void;
    useStats?: () => void;
}

interface ThreeDemoProps<T extends ThreeSceneInstance> {
    Scene: new (container: HTMLDivElement) => T;
    stats?: boolean;
}

export function ThreeDemo<T extends ThreeSceneInstance>({ Scene, stats = false }: ThreeDemoProps<T>) {
    const containerRef = useThreeScene(Scene, { stats });
    return <div ref={containerRef} className="three-demo" />;
}
