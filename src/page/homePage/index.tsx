import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.less';
import { useState } from 'react';
import { ClassFactory } from '@/class/utilities.ts';

import { configData } from '@/conf/configData';
import { IBaseInterface } from '@/types/global';

function HomePage() {
    const navigate = useNavigate();
    // 渲染40个div并且每个div都绑定一个ref
    const divsRef = useRef<HTMLDivElement[]>([]);
    const [divs] = useState<IBaseInterface.IConfigItem[]>(configData);
    // 是否渲染
    let isRender = false;
    useEffect(() => {
        if (isRender) return;
        isRender = true;

        if (!divsRef.current?.length) return;
        const instances: ClassFactory[] = [];
        divs.forEach((item) => {
            const instance = new ClassFactory();
            instance.init(item.className, divsRef.current[item.id]);
            instances.push(instance);
        });

        return () => {
            instances.forEach((item, index) => {
                item.disposeAll();
                if (!divsRef.current[index]) return;
                divsRef.current[index].innerHTML = '';
            });
        };
    }, []);
    // 点击div
    function handleClick(item: IBaseInterface.IConfigItem) {
        // 路由跳转
        navigate(item.path);
    }
    return (
        <div className="container">
            {divs.map((item) => {
                return (
                    <div key={item.id} className="list-item" onDoubleClick={() => handleClick(item)}>
                        <div
                            ref={(el) => {
                                divsRef.current[item.id] = el as HTMLDivElement;
                            }}
                        />
                        <div>{item.name}</div>
                    </div>
                );
            })}
        </div>
    );
}

export default HomePage;
