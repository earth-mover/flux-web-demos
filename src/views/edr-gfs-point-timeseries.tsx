import { LoadingSpinner } from '@/components/leading-spinner';
import { Map } from '@/components/map';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/components/ui/select';
import { SelectTrigger } from '@radix-ui/react-select';
import { useQuery } from '@tanstack/react-query';
import * as mapbox from 'mapbox-gl';
import { useEffect, useRef, useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

async function fetchGfsPointTimeseries(
    point: mapbox.LngLat,
    variable: string,
): Promise<{ time: Date; value: number }[]> {
    const url = `https://earthmover-demos.compute.earthmover.io/edr/earthmover-demos/gfs/timeseries/edr/position?coords=POINT(${point.lng}%20${point.lat})&time=2024-11-04&f=cf_covjson&parameter-name=${variable}`;

    const response = await fetch(url);
    const data = await response.json();
    const steps = data.domain.axes.step.values as number[]; // in nanoseconds
    const referenceTime = new Date(data.domain.axes.t.values[0] + 'Z');
    const values = data.ranges[variable].values as number[];

    let conversion = (value: any) => value;
    if (variable === 't2m') {
        conversion = (value) => value - 273.15; // kelvin to celsius
    } else if (variable === 'prate') {
        conversion = (value) => value * 3600; // m/s to mm/hr
    }

    return steps.map((step, i) => ({
        time: new Date(referenceTime.getTime() + step / 1e6),
        value: conversion(values[i]),
    }));
}

export default function GfsPointTimeseriesEDR() {
    const mapRef = useRef<mapbox.Map>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markerRef = useRef<mapbox.Marker | null>(null);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedPoint, setSelectedPoint] = useState<mapbox.LngLat | null>(
        null,
    );
    const [selectedVariable, setSelectedVariable] = useState('t2m');
    const timeseriesData = useQuery({
        queryKey: ['gfs-point-timeseries', selectedPoint, selectedVariable],
        queryFn: async () => {
            if (!selectedPoint) return [];
            return await fetchGfsPointTimeseries(
                selectedPoint,
                selectedVariable,
            );
        },
    });

    // Prevent drawer from blocking pointer events when open
    // https://github.com/emilkowalski/vaul/issues/497#issuecomment-2457929052
    useEffect(() => {
        if (drawerOpen) {
            // Pushing the change to the end of the call stack
            const timer = setTimeout(() => {
                document.body.style.pointerEvents = '';
            }, 0);

            return () => clearTimeout(timer);
        } else {
            document.body.style.pointerEvents = 'auto';
        }
    }, [drawerOpen]);

    useEffect(() => {
        if (!mapRef.current) return;

        mapRef.current.on('click', (e) => {
            setSelectedPoint(e.lngLat);
            setDrawerOpen(true);
        });
    }, [mapRef.current]);

    useEffect(() => {
        if (!mapRef.current || !selectedPoint) return;

        markerRef.current = new mapbox.Marker()
            .setLngLat(selectedPoint)
            .addTo(mapRef.current);

        return () => {
            markerRef.current?.remove();
        };
    }, [selectedPoint]);

    return (
        <div className="h-full w-full">
            <Drawer open={drawerOpen} modal={false}>
                <DrawerContent>
                    <DrawerHeader className="flex flex-row justify-between items-start align-middle w-full">
                        <div className="flex flex-col items-start">
                            <DrawerTitle>
                                <Select
                                    defaultValue="t2m"
                                    onValueChange={setSelectedVariable}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="t2m">
                                            Air Temperature (°C)
                                        </SelectItem>
                                        <SelectItem value="gust">
                                            Wind Gust (m/s)
                                        </SelectItem>
                                        <SelectItem value="prate">
                                            Precipitation (mm/hr)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </DrawerTitle>
                            <p>
                                Location: {selectedPoint?.lat.toFixed(2)}°,{' '}
                                {selectedPoint?.lng.toFixed(2)}°
                            </p>
                        </div>
                        <DrawerTrigger onClick={() => setDrawerOpen(false)}>
                            Done
                        </DrawerTrigger>
                    </DrawerHeader>
                    {timeseriesData.isLoading && (
                        <div className="h-96 flex justify-center items-center">
                            <LoadingSpinner className="m-auto" />
                        </div>
                    )}
                    {timeseriesData.data && (
                        <ChartContainer config={{}} className="h-96">
                            <AreaChart
                                accessibilityLayer
                                data={timeseriesData.data}
                                margin={{
                                    top: 5,
                                    left: 5,
                                    right: 0,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid />
                                <XAxis
                                    dataKey="time"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value) =>
                                        value.toLocaleDateString('en-US', {
                                            day: 'numeric',
                                            month: 'numeric',
                                        })
                                    }
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    orientation="right"
                                />
                                <Area
                                    dataKey="value"
                                    type="natural"
                                    fill="blue"
                                    fillOpacity={0.4}
                                    stroke="blue"
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent
                                            indicator="line"
                                            labelFormatter={(
                                                _value,
                                                payload,
                                            ) => {
                                                return payload[0].payload.time.toLocaleDateString(
                                                    'en-US',
                                                    {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: 'numeric',
                                                    },
                                                );
                                            }}
                                        />
                                    }
                                />
                            </AreaChart>
                        </ChartContainer>
                    )}
                </DrawerContent>
            </Drawer>
            <Map
                initialCenter={[-74.5, 40]}
                initialZoom={6}
                mapRef={mapRef}
                mapContainerRef={mapContainerRef}
            />
        </div>
    );
}
