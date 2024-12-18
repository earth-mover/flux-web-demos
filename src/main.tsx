import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import './index.css';
import Root from './root.tsx';
import GlobeWMS from './views/wms-globe.tsx';
import GfsPointTimeseriesEDR from './views/edr-gfs-point-timeseries.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GfsAreaScatterEDR from './views/edr-gfs-area-scatter.tsx';
//import NorthAmericaWMS from './views/wms-na.tsx';
import HrrrAreaScatterEDR from './views/edr-hrrr-area-scatter.tsx';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        children: [
            {
                index: true,
                element: <Navigate to={'wms/era5-globe'} />,
            },
            {
                path: 'wms/era5-globe',
                element: (
                    <GlobeWMS key='wms-era5' source="https://demo.compute.earthmover.io/wms/earthmover-demos/era5-2m-temp/1x721x1440/wms?version=1.3.0&service=WMS&request=GetMap&layers=2m_temperature&styles=raster/default&width=512&height=512&tile={x},{y},{z}&crs=EPSG:3857&time=2021-12-31T12:00:00Z&colorscalerange=273,310" />
                ),
            },
            {
                path: 'wms/gfs-globe',
                element: (
                    <GlobeWMS key='wms-gfs' source="https://demo.compute.earthmover.io/wms/earthmover-demos/gfs/solar/wms?version=1.3.0&service=WMS&request=GetMap&layers=gust&styles=raster/default&width=512&height=512&tile={x},{y},{z}&crs=EPSG:3857&time=2024-11-1T00:00:00Z&colorscalerange=0,40&step=1+hour" />
                ),
            },
            // {
            //     path: 'wms/hrrr-conus',
            //     element: (
            //         <NorthAmericaWMS 
            //             key='wms-hrrr' 
            //             source="https://earthmover-demos.compute.earthmover.io/wms/earthmover-demos/hrrr/solar/wms?version=1.3.0&service=WMS&request=GetMap&layers=prate&styles=raster/default&width=512&height=512&tile={x},{y},{z}&crs=EPSG:3857&time=2024-11-18T00:00:00Z&colorscalerange=0,1&step=1+hour"
            //             bounds={[-150, 20, -50, 60]} />
            //     ),
            // },
            {
                path: 'edr/gfs-point-timeseries',
                element: <GfsPointTimeseriesEDR />,
            },
            {
                path: 'edr/gfs-area-scatter',
                element: <GfsAreaScatterEDR />,
            },
            {
                path: 'edr/hrrr-area-scatter',
                element: <HrrrAreaScatterEDR />,
            }
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
