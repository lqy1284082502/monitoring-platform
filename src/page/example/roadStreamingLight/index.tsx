import { useEffect, useRef } from 'react';
import { StreamingLight } from '@/three';

function RoadStreamingLight() {
    const divRef = useRef<HTMLDivElement>(null);
    const threeScene = useRef<StreamingLight>();
    useEffect(() => {
        if (!threeScene.current) {
            threeScene.current = new StreamingLight(divRef.current as HTMLDivElement);
            threeScene.current?.init();
        }
    });

    return <div ref={divRef} style={{ width: '100%', height: 'calc(100vh)', position: 'relative' }} />;
}

export default RoadStreamingLight;
