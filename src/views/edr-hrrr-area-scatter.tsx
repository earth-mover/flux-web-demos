import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as mapbox from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';

import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { Map } from '@/components/map';
import { Slider } from '@/components/ui/slider';

const PRECIP_LAYER_ID = 'area';

function createHrrrAreaUrl(
    initTime: string,
    coords: { lng: number; lat: number }[],
    variables: string[],
) {
    return `https://demo.compute.earthmover.io/edr/earthmover-demos/hrrr/solar/edr/area?coords=POLYGON((${coords
        .map((coord) => `${(coord.lng + 360.0) % 360} ${coord.lat}`)
        .join(
            ',',
        )}))&time=${initTime}&step=1%20hours/6%20hours&f=geojson&parameter-name=${variables.join(
        ',',
    )}`;
}

export default function HrrrAreaScatterEDR() {
    const mapRef = useRef<mapbox.Map>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapDraw = useRef<MapboxDraw>(null);
    const mapPopup = useRef<mapbox.Popup>(null);

    const [areaUrl, setAreaUrl] = useState<string | null>(null);
    const [currentHourOffset, setCurrentHourOffset] = useState(1);
    const [initTime, _setInitTime] = useState('2024-11-18T00:00:00');
    const validTime = useMemo(() => {
        const date = new Date(initTime + 'Z');
        const offsetSeconds = currentHourOffset * 3600;
        return new Date(date.getTime() + offsetSeconds * 1000);
    }, [currentHourOffset, initTime]);

    const updateLayer = useCallback(
        (e: any) => {
            const feature = e.features.at(0);
            if (!feature) return;

            const coords = feature.geometry.coordinates[0].map((coord: any) => {
                return {
                    lng: coord[0],
                    lat: coord[1],
                };
            });

            // TODO: control date
            const url = createHrrrAreaUrl(initTime, coords, ['prate']);
            setAreaUrl(url);
        },
        [setAreaUrl, initTime],
    );

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

        mapRef.current.addSource(PRECIP_LAYER_ID, {
            type: 'geojson',
            data: areaUrl,
        });

        mapRef.current.addLayer({
            id: PRECIP_LAYER_ID,
            type: 'circle',
            source: PRECIP_LAYER_ID,
            paint: {
                'circle-opacity': [
                    'interpolate',
                    ['linear'],
                    ['get', 'prate'],
                    0,
                    0.0,
                    0.0001,
                    0.3,
                    0.001,
                    0.9,
                ],
                'circle-radius': 5,
                'circle-color': [
                    'interpolate',
                    ['linear'],
                    ['get', 'prate'],
                    0,
                    'purple',
                    0.0001,
                    'blue',
                    0.0005,
                    'green',
                    0.001,
                    'yellow',
                    0.002,
                    'red',
                ],
            },
        });

        mapRef.current.setFilter(PRECIP_LAYER_ID, [
            'all',
            ['<', 'step', 3610 * currentHourOffset],
            ['>', 'step', 3590 * currentHourOffset],
        ]);

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
            let prate = e.features[0].properties?.prate;
            if (prate !== undefined) prate *= 3600;
            else prate = 'N/A';

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
                                <td class='border'>Precipitation</td>
                                <td class='border'>${prate.toFixed(
                                    2,
                                )} mm/hr</td>
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
            mapRef.current?.off('mouseenter', PRECIP_LAYER_ID, showPopup);
            mapRef.current?.off('mouseleave', PRECIP_LAYER_ID, hidePopup);
            mapRef.current?.removeLayer(PRECIP_LAYER_ID);
            mapRef.current?.removeSource(PRECIP_LAYER_ID);
        };
    }, [mapRef.current, areaUrl]);

    useEffect(() => {
        if (!mapRef.current) return;

        if (!mapRef.current.isStyleLoaded()) {
            return;
        }

        mapRef.current.setFilter(PRECIP_LAYER_ID, [
            'all',
            ['<', 'step', 3610 * currentHourOffset],
            ['>', 'step', 3590 * currentHourOffset],
        ]);
    }, [currentHourOffset]);

    return (
        <>
            <Map
                initialCenter={[-122.335167, 47.608013]}
                initialZoom={8}
                mapRef={mapRef}
                mapContainerRef={mapContainerRef}
            />
            <div className="absolute bottom-12 left-72 right-72 flex flex-col bg-slate-50 p-4 rounded-md bg-opacity-80">
                <div className="flex flex-col items-center align-middle pb-4">
                    <h2 className="text-lg font-semibold">
                        Precipitation Rate
                    </h2>
                    <h4 className="text-sm">
                        {`Valid: ${validTime.toLocaleString('en-US')}`}
                    </h4>
                </div>
                <Slider
                    value={[currentHourOffset]}
                    onValueChange={(val) => setCurrentHourOffset(val[0])}
                    defaultValue={[currentHourOffset]}
                    max={6}
                    min={1}
                    step={1}
                />
            </div>
        </>
    );
}
