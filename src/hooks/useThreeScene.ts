import { useEffect, useRef } from 'react';

interface ThreeSceneInstance {
    init: () => void | Promise<void>;
    dispose?: () => void;
    onWindowResize?: () => void;
    useStats?: () => void;
    start?: () => void;
}

type SceneConstructor<T extends ThreeSceneInstance> = new (container: HTMLDivElement) => T;

export function useThreeScene<T extends ThreeSceneInstance>(Scene: SceneConstructor<T>, options?: { stats?: boolean }) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const scene = new Scene(container);
        void Promise.resolve(scene.init()).catch((error) => {
            if (import.meta.env.DEV) console.error('Three scene initialization failed', error);
        });
        scene.start?.();

        if (options?.stats && scene.useStats) {
            scene.useStats();
        }

        const handleResize = () => scene.onWindowResize?.();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            scene.dispose?.();
            container.replaceChildren();
        };
    }, [Scene, options?.stats]);

    return containerRef;
}
