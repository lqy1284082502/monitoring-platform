import { lazy } from 'react';
import { RouteObjectIncludesMeta } from '@/types/global';
import { configData } from '@/conf/configData';

export const routeConfiguration: RouteObjectIncludesMeta[] = [
    {
        path: '/',
        children: [
            {
                index: true,
                Component: lazy(() => import('@/page/homePage')),
            },
        ],
    },
    {
        path: '/item',
        children: configData.map((item) => ({
            path: item.path,
            Component: lazy(() => import(`@/page/example/${item.componentName}/index.tsx`)),
        })),
    },
    {
        path: '/dev',
        Component: lazy(() => import('@/page/example/lightMapping')),
    },
    {
        path: '*',
        Component: lazy(() => import('@/page/errorPage/404.tsx')),
    },
];
