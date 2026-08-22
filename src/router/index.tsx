import { createBrowserRouter } from 'react-router-dom';
import { routeConfiguration } from './routeConfiguration.tsx';

const router = createBrowserRouter(routeConfiguration, {
    basename: import.meta.env.BASE_URL,
});
export { router };
