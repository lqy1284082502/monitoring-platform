import { useEffect, useRef } from 'react';
import { IonAnimation as CIonAnimation } from '@/three';

function ParticleAnimationParticle() {
    const divRef = useRef<HTMLDivElement>(null);
    const threeScene = useRef<CIonAnimation>();

    useEffect(() => {
        if (!threeScene.current) {
            threeScene.current = new CIonAnimation(divRef.current as HTMLDivElement);
            threeScene.current?.init();
        }
    });

    return <div ref={divRef} style={{ width: '100%', height: 'calc(100vh)', position: 'relative' }} />;
}

export default ParticleAnimationParticle;
