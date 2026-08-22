import { defineConfig, loadEnv } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';

export default ({ mode }: { mode: string }) => {
    const evn = loadEnv(mode, './environment');
    return defineConfig({
        base: '/monitoring-platform/',
        envDir: './environment',
        plugins: [
            react(),
            viteCompression({
                //生成压缩包gz
                verbose: true, // 输出压缩成功
                disable: false, // 是否禁用
                threshold: 10240, // 文件大小大于这个值时启用压缩
                algorithm: 'gzip', // 压缩算法
                ext: '.gz', // 生成的压缩包后缀
            }),
            // SVG 图标配置
            createSvgIconsPlugin({
                // 指定需要缓存的图标文件夹
                iconDirs: [path.resolve(process.cwd(), 'src/assets/svg')],
                // 指定symbolId格式
                symbolId: 'icon-[dir]-[name]',
            }),
        ],
        // 代理配置
        server: {
            host: '0.0.0.0',
            port: 3100,
            // 开启热更新
            hmr: true,
            proxy: {
                '/jeecg-boot': {
                    target: evn.VITE_API_URL,
                    changeOrigin: true,
                },
            },
        },
        resolve: {
            // 别名配置
            alias: {
                '@': path.resolve(__dirname, './src'),
                '/@/*': path.resolve(__dirname, './src'),
                '#/*': path.resolve(__dirname, './src/types'),
            },
        },
        css: {
            preprocessorOptions: {
                css: {
                    modules: {
                        localsConvention: 'dashes',
                    },
                },
                less: {
                    modifyVars: {},
                    javascriptEnabled: true,
                },
            },
        },
        build: {
            minify: 'terser',
            target: 'es2015',
            cssTarget: 'chrome80',
            reportCompressedSize: false,
            chunkSizeWarningLimit: 1500,
            terserOptions: {
                compress: {
                    keep_infinity: true,
                    drop_console: true,
                    drop_debugger: true,
                },
            },
            rollupOptions: {
                output: {
                    manualChunks(id: string) {
                        //静态资源分拆打包
                        if (id.includes('node_modules')) {
                            const name = id.toString().split('node_modules/')[1].split('/')[0].toString();
                            return 'modules/' + name;
                        }
                    },
                    chunkFileNames: 'static/js/[name]-[hash].js',
                    entryFileNames: 'static/js/[name]-[hash].js',
                    assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
                },
            },
        },
    });
};
