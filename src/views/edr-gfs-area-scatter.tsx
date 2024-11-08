import { useEffect, useRef, useState } from 'react';
import * as mapbox from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';

import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { Map } from '@/components/map';

function createGfsAreaUrl(
    coords: { lng: number; lat: number }[],
    variables: string[],
) {
    return `https://earthmover-demos.compute.earthmover.io/edr/earthmover-demos/gfs/timeseries/edr/area?coords=POLYGON((${coords
        .map((coord) => `${(coord.lng + 360.0) % 360} ${coord.lat}`)
        .join(
            ',',
        )}))&time=2024-11-04T00:00:00Z&step=1+hour&f=geojson&parameter-name=${variables.join(
        ',',
    )}`;
}

export default function GfsAreaScatterEDR() {
    const mapRef = useRef<mapbox.Map>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapDraw = useRef<MapboxDraw>(null);

    const [areaUrl, setAreaUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!mapRef.current) return;

        mapRef.current.on('load', () => {
            // @ts-ignore
            mapDraw.current = new MapboxDraw({
                displayControlsDefault: false,
                controls: {
                    polygon: true,
                    trash: true,
                },
            });

            mapRef.current?.addControl(mapDraw.current, 'top-right');
        });

        mapRef.current.on('draw.create', (e: any) => {
            const feature = e.features.at(0);
            if (!feature) return;
            const coords = feature.geometry.coordinates[0].map((coord: any) => {
                return {
                    lng: coord[0],
                    lat: coord[1],
                };
            });

            // TODO: control date
            const url = createGfsAreaUrl(coords, ['t2m', 'prate', 'gust']);
            console.log(url);
            setAreaUrl(url);
        });
    }, [mapRef.current]);

    useEffect(() => {
        if (!mapRef.current || !areaUrl) return;

        mapRef.current.addSource('area', {
            type: 'geojson',
            data: areaUrl,
        });

        mapRef.current.addLayer({
            id: 'area',
            type: 'circle',
            source: 'area',
            paint: {
                'circle-color': 'red',
                'circle-radius': 5,
            },
        });

        return () => {
            mapRef.current?.removeLayer('area');
            mapRef.current?.removeSource('area');
        };
    }, [mapRef.current, areaUrl]);

    return (
        <>
            <Map
                initialCenter={[-74.5, 40]}
                initialZoom={6}
                mapRef={mapRef}
                mapContainerRef={mapContainerRef}
            />
        </>
    );
}
