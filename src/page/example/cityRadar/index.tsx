import { useRef } from 'react';
import { CityRadar as CityRadarClass } from '@/three';
import { useMount } from 'ahooks';

function CityRadar() {
    const divRef = useRef<HTMLDivElement>(null);
    const threeScene = useRef<CityRadarClass>();

    useMount(() => {
        if (!threeScene.current) {
            threeScene.current = new CityRadarClass(divRef.current as HTMLDivElement);
            threeScene.current.init();
        }
    });
    return <div ref={divRef} style={{ width: '100%', height: 'calc(100vh)', position: 'relative' }} />;
}

export default CityRadar;
