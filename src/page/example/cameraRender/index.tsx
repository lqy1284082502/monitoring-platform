import { useRef } from 'react';
import { CameraRender as CameraRenderClass } from '@/three';
import { useMount } from 'ahooks';

function CameraRender() {
    const divRef = useRef<HTMLDivElement>(null);
    const threeScene = useRef<CameraRenderClass>();

    useMount(() => {
        if (threeScene.current) return;
        threeScene.current = new CameraRenderClass(divRef.current as HTMLDivElement);
        threeScene.current.init();
    });
    return <div ref={divRef} style={{ width: '100%', height: 'calc(100vh)', position: 'relative' }} />;
}

export default CameraRender;
