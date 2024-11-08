import { MutableRefObject, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

export interface MapProps {
    mapRef: MutableRefObject<mapboxgl.Map | null>;
    mapContainerRef: MutableRefObject<HTMLDivElement | null>;
    initialCenter?: [number, number];
    initialZoom?: number;
    mapStyle?: string;
}

export function Map({
    initialCenter,
    initialZoom,
    mapStyle,
    mapRef,
    mapContainerRef,
}: MapProps) {
    useEffect(() => {
        mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current!,
            style: mapStyle,
            center: initialCenter ?? [-74.5, 40],
            zoom: initialZoom ?? 2,
        });

        return () => {
            mapRef.current?.remove();
        };
    }, []);

    return (
        <>
            <div
                id="map-container"
                className="absolute w-full h-full"
                ref={mapContainerRef}
            />
        </>
    );
}
