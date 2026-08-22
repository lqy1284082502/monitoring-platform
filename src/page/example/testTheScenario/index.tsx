/**
 * 测试场景
 * */
import { TestScenario } from '@/three';
import { useEffect, useRef } from 'react';
function TestTheScenario() {
    const divRef = useRef<HTMLDivElement>(null);
    const threeScene = useRef<TestScenario>();
    useEffect(() => {
        if (!threeScene.current) {
            threeScene.current = new TestScenario(divRef.current as HTMLDivElement);
            threeScene.current?.init();
        }
    });

    return <div ref={divRef} style={{ width: '100%', height: 'calc(100vh)', position: 'relative' }} />;
}
export default TestTheScenario;
