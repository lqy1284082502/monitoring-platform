import { useRef } from 'react';
import { EarthCase1 as EarthCase1Class } from '@/three';
import { useMount } from 'ahooks';

function EarthCase1() {
    const divRef = useRef<HTMLDivElement>(null);
    const threeScene = useRef<EarthCase1Class>();

    useMount(() => {
        if (!threeScene.current) {
            threeScene.current = new EarthCase1Class(divRef.current as HTMLDivElement);
            threeScene.current.init();
        }
    });
    return <div ref={divRef} style={{ width: '100%', height: 'calc(100vh)', position: 'relative' }} />;
}

export default EarthCase1;
