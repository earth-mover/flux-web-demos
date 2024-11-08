import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import Root from './root.tsx';
import GfsGlobeWMS from './views/wms-gfs-globe.tsx';
import GfsPointTimeseriesEDR from './views/edr-gfs-point-timeseries.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        children: [
            {
                path: 'wms/gfs-globe',
                element: <GfsGlobeWMS />,
            },
            {
                path: 'edr/gfs-point-timeseries',
                element: <GfsPointTimeseriesEDR />,
            },
        ],
    },
]);

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    </StrictMode>,
);
