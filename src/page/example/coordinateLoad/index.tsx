import { useRef } from 'react';
import { useMount } from 'ahooks';
import { GeoJsonLoad } from '@/three';
function CoordinateLoad() {
    const divRef = useRef<HTMLDivElement>(null);
    const threeScene = useRef<GeoJsonLoad>();
    const state = useRef<HTMLDivElement>(null);

    useMount(() => {
        if (!threeScene.current) {
            threeScene.current = new GeoJsonLoad(divRef.current as HTMLDivElement);
            threeScene.current.init();
            threeScene.current.useStats();
        }

        window.addEventListener('resize', () => {
            threeScene.current?.onWindowResize();
        });
    });

    return (
        <div ref={divRef} style={{ width: '100%', height: 'calc(100vh)', position: 'relative' }}>
            <div ref={state} />
        </div>
    );
}

export default CoordinateLoad;
