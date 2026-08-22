/**
 * 工厂模式
 * */
import * as ThreeClass from '@/three';
import { configData } from '@/conf/configData';

export class ClassFactory {
    private readonly classMap: IndexType;
    private classInstance: IndexType = {};
    constructor() {
        this.classMap = configData.reduce((acc, cur) => {
            acc[cur.className] = (<any>ThreeClass)[cur.className];
            return acc;
        }, {} as IndexType);
    }
    createClass(name: string, dom: HTMLElement) {
        const ClassConstructor = this.classMap[name];
        if (!ClassConstructor) {
            throw new Error('Invalid class name');
        }
        return new ClassConstructor(dom);
    }
    init(name: string, dom: HTMLElement) {
        this.classInstance = this.createClass(name, dom);
        try {
            this.classInstance.init();
        } catch (error) {
            console.error(`${name} 初始化失败`, error);
        }
    }
    disposeAll() {
        this.classInstance.dispose();
    }
}
