import { useRef } from 'react';
import { useMount } from 'ahooks';
import { HDRLoad } from '@/three';
function CameraManagement() {
    const divRef = useRef<HTMLDivElement>(null);
    const threeScene = useRef<HDRLoad>();
    const state = useRef<HTMLDivElement>(null);

    useMount(() => {
        if (!threeScene.current) {
            threeScene.current = new HDRLoad(divRef.current as HTMLDivElement);
            threeScene.current.init();
            threeScene.current.useStats();
        }
    });

    return (
        <div ref={divRef} style={{ width: '100%', height: 'calc(100vh)', position: 'relative' }}>
            <div ref={state} />
        </div>
    );
}

export default CameraManagement;
