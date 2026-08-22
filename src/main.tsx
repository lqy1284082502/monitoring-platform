import { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import zhCN from 'antd/es/locale/zh_CN';
import { ConfigProvider } from 'antd';
import { router } from '@/router';
import './index.less';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <ConfigProvider locale={zhCN}>
        <Suspense fallback={<div>加载中...</div>}>
            <RouterProvider router={router} />
        </Suspense>
    </ConfigProvider>
);
