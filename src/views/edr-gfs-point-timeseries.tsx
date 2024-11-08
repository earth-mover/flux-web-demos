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

    return steps.map((step, i) => ({
        time: new Date(referenceTime.getTime() + step / 1e6),
        value: values[i] - 273.15, //convert to Celsius
    }));
}

export default function GfsPointTimeseriesEDR() {
    const mapRef = useRef<mapbox.Map>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedPoint, setSelectedPoint] = useState<mapbox.LngLat | null>(
        null,
    );
    const [selectedVariable, setSelectedVariable] = useState('t2m');
    const timeseriesData = useQuery({
        queryKey: ['gfs-point-timeseries', selectedPoint, selectedVariable],
        queryFn: async () => {
            if (!selectedPoint) return [];
            console.log(selectedPoint, selectedVariable);
            return await fetchGfsPointTimeseries(
                selectedPoint,
                selectedVariable,
            );
        },
    });

    useEffect(() => {
        if (!mapRef.current) return;

        mapRef.current.on('click', (e) => {
            setSelectedPoint(e.lngLat);
            setDrawerOpen(true);
        });
    }, [mapRef.current]);

    return (
        <div className="h-full w-full">
            <Drawer open={drawerOpen}>
                <DrawerContent>
                    <DrawerHeader className="flex flex-row justify-between items-start align-middle w-full">
                        <div className="flex flex-col items-start">
                            <DrawerTitle>Air Temperature (°C)</DrawerTitle>
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
                        <div className='h-64 flex justify-center items-center'>
                            <LoadingSpinner className="m-auto" />
                        </div>
                    )}
                    {timeseriesData.data && (
                        <ChartContainer config={{}} className='h-64'>
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
                                        <ChartTooltipContent indicator="line" />
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
