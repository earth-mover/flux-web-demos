import { Map } from '@/components/map';
import * as mapbox from 'mapbox-gl';
import { useEffect, useRef } from 'react';

interface NorthAmericaWMSProps {
    source: string;
    center?: [number, number];
    bounds?: [number, number, number, number];
}

export default function NorthAmericaWMS({ source, bounds, center }: NorthAmericaWMSProps) {
    const mapRef = useRef<mapbox.Map>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mapRef.current) return;

        mapRef.current.on('load', () => {
            mapRef.current?.setFog({});
            mapRef.current?.addSource('wms', {
                type: 'raster',
                tiles: [source],
                tileSize: 512,
                bounds: bounds,
            });

            mapRef.current?.addLayer({
                id: 'wms',
                type: 'raster',
                source: 'wms',
                paint: {
                    'raster-opacity': 0.5,
                },
            });
        });
    }, [mapRef.current]);

    return (
        <>
            <Map
                initialCenter={center ?? [-74.5, 40]}
                initialZoom={4}
                // mapStyle="mapbox://styles/mapbox/light-v11"
                mapRef={mapRef}
                mapContainerRef={mapContainerRef}
            />
        </>
    );
}
