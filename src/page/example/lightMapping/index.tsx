/**
 * 光照贴图
 * */
import { LightMapping } from '@/three';
import { useEffect, useRef } from 'react';
function LightMappingPage() {
    const divRef = useRef<HTMLDivElement>(null);
    const threeScene = useRef<LightMapping>();
    useEffect(() => {
        if (!threeScene.current) {
            threeScene.current = new LightMapping(divRef.current as HTMLDivElement);
            threeScene.current?.init();
        }
    });

    return <div ref={divRef} style={{ width: '100%', height: 'calc(100vh)', position: 'relative' }} />;
}
export default LightMappingPage;
