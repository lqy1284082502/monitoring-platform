import { useRef, useEffect } from 'react';
import { HeatMap as HeatMapClass } from '@/three';

function HeatMap() {
    const divRef = useRef<HTMLDivElement>(null);
    const threeScene = useRef<HeatMapClass>();

    useEffect(() => {
        if (!threeScene.current) {
            threeScene.current = new HeatMapClass(divRef.current as HTMLDivElement);
            threeScene.current.init();
        }
    }, []);

    return <div ref={divRef} style={{ width: '100%', height: 'calc(100vh)', position: 'relative' }} />;
}

export default HeatMap;
