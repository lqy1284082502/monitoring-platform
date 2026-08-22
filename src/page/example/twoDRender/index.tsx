import { useEffect, useRef } from 'react';
import { TwoDRender as TwoDRenderClass } from '@/three';

function TwoDRender() {
    const divRef = useRef<HTMLDivElement>(null);
    const threeScene = useRef<TwoDRenderClass>();
    useEffect(() => {
        if (!threeScene.current) {
            threeScene.current = new TwoDRenderClass(divRef.current as HTMLDivElement);
            threeScene.current?.init();
        }
    });
    return <div ref={divRef} style={{ width: '100%', height: 'calc(100vh)', position: 'relative' }} />;
}

export default TwoDRender;
