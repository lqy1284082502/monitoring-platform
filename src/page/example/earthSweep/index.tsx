import { useRef } from 'react';
import { EarthSweep as EarthSweepClass } from '@/three';
import { useMount } from 'ahooks';

function EarthSweep() {
    const divRef = useRef<HTMLDivElement>(null);
    const threeScene = useRef<EarthSweepClass>();

    useMount(() => {
        if (!threeScene.current) {
            threeScene.current = new EarthSweepClass(divRef.current as HTMLDivElement);
            threeScene.current.init();
        }
    });
    return <div ref={divRef} style={{ width: '100%', height: 'calc(100vh)', position: 'relative' }} />;
}

export default EarthSweep;
