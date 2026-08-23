/**
 * 资源文件
 * 把模型和图片分开进行加载
 */

interface ITextures {
    name: string;
    url: string;
}

export interface IResources {
    textures?: ITextures[];
}

import { publicUrl } from '@/utils/publicUrl';

const filePath = publicUrl('image/earth/');
const fileSuffix = ['gradient', 'redCircle', 'glow'];

const textures = fileSuffix.map((item) => ({
    name: item,
    url: filePath + item + '.png',
}));

textures.push({ name: 'earth', url: filePath + 'earth.jpg' });

const resources: IResources = { textures };

export { resources };
