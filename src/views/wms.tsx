import { Map } from '@/components/map';
import * as mapbox from 'mapbox-gl';
import { useEffect, useRef } from 'react';

export default function Wms() {
    const mapRef = useRef<mapbox.Map>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mapRef.current) return;

        mapRef.current.on('load', () => {
            mapRef.current?.setFog({});
            mapRef.current?.addSource('gfs', {
                type: 'raster',
                tiles: [
                    'https://earthmover-demos.compute.earthmover.io/wms/earthmover-demos/gfs/solar/wms?version=1.3.0&service=WMS&request=GetMap&layers=gust&styles=raster/default&width=512&height=512&tile={x},{y},{z}&crs=EPSG:3857&time=2024-11-1T00:00:00Z&colorscalerange=0,40&step=1+hour',
                ],
                tileSize: 512,
            });

            mapRef.current?.addLayer({
                id: 'gfs',
                type: 'raster',
                source: 'gfs',
                paint: {
                    'raster-opacity': 0.5,
                }
            });
        });
    }, [mapRef]);

    return (
        <>
            <Map
                initialCenter={[-74.5, 40]}
                initialZoom={2}
                mapStyle="mapbox://styles/mapbox/light-v11"
                mapRef={mapRef}
                mapContainerRef={mapContainerRef}
            />
        </>
    );
}
