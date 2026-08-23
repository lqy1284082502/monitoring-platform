import { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/router';
import './index.less';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <Suspense fallback={<div>加载中...</div>}>
        <RouterProvider router={router} />
    </Suspense>
);
