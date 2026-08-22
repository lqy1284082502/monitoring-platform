import { useRef } from 'react';
import { CitySweep as CitySweepClass } from '@/three';
import { useMount } from 'ahooks';

function CitySweep() {
    const divRef = useRef<HTMLDivElement>(null);
    const threeScene = useRef<CitySweepClass>();

    useMount(() => {
        if (!threeScene.current) {
            threeScene.current = new CitySweepClass(divRef.current as HTMLDivElement);
            threeScene.current.init();
        }
    });
    return <div ref={divRef} style={{ width: '100%', height: 'calc(100vh)', position: 'relative' }} />;
}

export default CitySweep;
