import { useEffect, useRef } from 'react';

interface ThreeSceneInstance {
    init: () => void | Promise<void>;
    dispose?: () => void;
    onWindowResize?: () => void;
    useStats?: () => void;
    start?: () => void;
    setPaused?: (paused: boolean) => void;
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
        scene.setPaused?.(document.hidden);
        scene.start?.();

        if (import.meta.env.DEV && options?.stats && scene.useStats) {
            scene.useStats();
        }

        let resizeFrame: number | undefined;
        const handleResize = () => {
            if (resizeFrame !== undefined) cancelAnimationFrame(resizeFrame);
            resizeFrame = requestAnimationFrame(() => {
                resizeFrame = undefined;
                scene.onWindowResize?.();
            });
        };
        const handleVisibilityChange = () => scene.setPaused?.(document.hidden);
        window.addEventListener('resize', handleResize);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (resizeFrame !== undefined) cancelAnimationFrame(resizeFrame);
            scene.dispose?.();
            container.replaceChildren();
        };
    }, [Scene, options?.stats]);

    return containerRef;
}
