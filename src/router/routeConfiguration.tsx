import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { demoRegistry } from '@/conf/demoRegistry';

export const routeConfiguration: RouteObject[] = [
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
        children: demoRegistry.map((item) => ({
            path: item.path,
            Component: item.Component,
        })),
    },
    {
        path: '/dev',
        Component: demoRegistry[1]!.Component,
    },
    {
        path: '*',
        Component: lazy(() => import('@/page/errorPage/404.tsx')),
    },
];
