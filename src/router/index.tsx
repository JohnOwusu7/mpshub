import { createBrowserRouter } from 'react-router-dom';
import BlankLayout from '../components/Layouts/BlankLayout';
import DefaultLayout from '../components/Layouts/DefaultLayout';
import ErrorBoundary from '../errorBoundry';
import { routes } from './routes';

const finalRoutes = routes.map((route) => {
    return {
        ...route,
        element: (
            <ErrorBoundary> {/* Wrap each route's element with ErrorBoundary */}
                {route.layout === 'blank' ? <BlankLayout>{route.element}</BlankLayout> : <DefaultLayout>{route.element}</DefaultLayout>}
            </ErrorBoundary>
        ),
    };
});

const router = createBrowserRouter(finalRoutes);

export default router;
