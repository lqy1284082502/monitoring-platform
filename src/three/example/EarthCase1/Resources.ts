/**
 * 资源管理和加载
 */
import { LoadingManager, Texture, TextureLoader } from 'three';
import { resources } from './Assets';
export class Resources {
    private manager: LoadingManager | undefined;
    private readonly callback: () => void;
    private textureLoader!: InstanceType<typeof TextureLoader>;
    public textures: Record<string, Texture>;
    private disposed = false;
    constructor(callback: () => void) {
        this.callback = callback; // 资源加载完成的回调
        this.textures = {}; // 贴图对象
        this.setLoadingManager();
        this.loadResources();
    }

    /**
     * 管理加载状态
     */
    private setLoadingManager() {
        this.manager = new LoadingManager();
        // 加载完成
        this.manager.onLoad = () => {
            if (!this.disposed) this.callback();
        };

        this.manager.onError = (url) => {
            console.error(`Failed to load EarthCase1 resource: ${url}`);
        };
    }

    /**
     * 加载资源
     */
    private loadResources(): void {
        this.textureLoader = new TextureLoader(this.manager);
        resources.textures?.forEach((item) => {
            this.textureLoader.load(item.url, (t) => {
                if (this.disposed) t.dispose();
                else this.textures[item.name] = t;
            });
        });
    }

    public dispose() {
        if (this.disposed) return;
        this.disposed = true;
        Object.values(this.textures).forEach((texture) => texture.dispose());
        this.textures = {};
    }
}
