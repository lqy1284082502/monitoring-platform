import { useEffect, useRef } from 'react';
import { MapAnimation as MAnimation } from '@/three';

function MapAnimation() {
    const divRef = useRef<HTMLDivElement>(null);
    const threeScene = useRef<MAnimation>();
    useEffect(() => {
        if (!threeScene.current) {
            threeScene.current = new MAnimation(divRef.current as HTMLDivElement);
            threeScene.current?.init();
        }
    });
    return <div ref={divRef} style={{ width: '100%', height: 'calc(100vh)', position: 'relative' }} />;
}

export default MapAnimation;
