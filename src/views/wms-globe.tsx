import { Map } from '@/components/map';
import * as mapbox from 'mapbox-gl';
import { useEffect, useRef } from 'react';

interface GlobeWMSProps {
    source: string;
}

export default function GlobeWMS({ source }: GlobeWMSProps) {
    const mapRef = useRef<mapbox.Map>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mapRef.current) return;

        mapRef.current.on('load', () => {
            mapRef.current?.setFog({});
            mapRef.current?.addSource('gfs', {
                type: 'raster',
                tiles: [source],
                tileSize: 512,
            });

            mapRef.current?.addLayer({
                id: 'gfs',
                type: 'raster',
                source: 'gfs',
                paint: {
                    'raster-opacity': 0.5,
                },
            });
        });
    }, [mapRef.current]);

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
