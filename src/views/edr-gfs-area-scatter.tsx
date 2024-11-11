import { useCallback, useEffect, useRef, useState } from 'react';
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
        )}))&time=2024-11-04T12:00:00&step=1+hour&f=geojson&parameter-name=${variables.join(
        ',',
    )}`;
}

export default function GfsAreaScatterEDR() {
    const mapRef = useRef<mapbox.Map>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapDraw = useRef<MapboxDraw>(null);
    const mapPopup = useRef<mapbox.Popup>(null);

    const [areaUrl, setAreaUrl] = useState<string | null>(null);

    const updateLayer = useCallback((e: any) => {
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
        setAreaUrl(url);
    }, [setAreaUrl]);

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

        mapRef.current.on('draw.create', updateLayer);
        mapRef.current.on('draw.update', updateLayer);
        mapRef.current.on('draw.delete', () => setAreaUrl(null));

        // @ts-ignore
        mapPopup.current = new mapbox.Popup({
            closeButton: false,
            closeOnClick: false,
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

        const showPopup = (e: mapbox.MapMouseEvent) => {
            if (
                !mapRef.current ||
                !mapPopup.current ||
                !e.features ||
                e.features.length === 0
            )
                return;

            // Change the cursor style as a UI indicator.
            mapRef.current.getCanvas().style.cursor = 'pointer';

            // Copy coordinates array and values
            // @ts-ignore
            const coordinates = e.features[0].geometry.coordinates.slice();
            let temp = e.features[0].properties?.t2m;
            if (temp) temp -= 273.15;
            else temp = 'N/A';
            let prate = e.features[0].properties?.prate;
            if (prate !== undefined) prate *= 3600;
            else prate = 'N/A';
            const gust = e.features[0].properties?.gust ?? 'N/A';

            const description = `
                <div>
                    <strong>${coordinates[0].toFixed(
                        3,
                    )}°, ${coordinates[1].toFixed(3)}°</strong>
                    <table class='table-auto border-collapse border border-spacing-4'>
                        <thead class='border'>
                            <tr>
                                <th class='border'>Variable</th>
                                <th class='border'>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class='border'>Temperature</td>
                                <td class='border'>${temp.toFixed(1)}°C</td>
                            </tr>
                            <tr>
                                <td class='border'>Precipitation</td>
                                <td class='border'>${prate.toFixed(2)} mm/hr</td>
                            </tr>
                            <tr>
                                <td class='border'>Wind Gust</td>
                                <td class='border'>${gust.toFixed(1)} m/s</td>
                            </tr>
                        </tbody>
                    </table>
                </div>`;

            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            if (
                ['mercator', 'equirectangular'].includes(
                    mapRef.current.getProjection().name,
                )
            ) {
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] +=
                        e.lngLat.lng > coordinates[0] ? 360 : -360;
                }
            }

            // Populate the popup and set its coordinates
            // based on the feature found.
            mapPopup.current
                .setLngLat(coordinates)
                .setHTML(description)
                .addTo(mapRef.current);
        };

        mapRef.current.on('mouseenter', 'area', showPopup);

        const hidePopup = () => {
            mapPopup.current?.remove();

            if (!mapRef.current) return;

            mapRef.current.getCanvas().style.cursor = '';
        };

        mapRef.current.on('mouseleave', 'area', hidePopup);

        return () => {
            mapRef.current?.off('mouseenter', 'area', showPopup);
            mapRef.current?.off('mouseleave', 'area', hidePopup);
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
