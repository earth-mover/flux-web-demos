import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Link } from 'react-router-dom';

const GROUPS = {
    WMS: [
        // {
        //     title: 'Global ERA5 Temperature',
        //     path: '/wms/era5-globe',
        // },
        {
            title: 'Global GFS Wind Gust',
            path: '/wms/gfs-globe',
        },
        // {
        //     title: 'HRRR CONUS Precipitation Rate',
        //     path: '/wms/hrrr-conus',
        // },
    ],
    EDR: [
        {
            title: 'GFS Point Timeseries',
            path: '/edr/gfs-point-timeseries',
        },
        {
            title: 'GFS Area Selector',
            path: '/edr/gfs-area-scatter',
        },
        // {
        //     title: 'HRRR Area Precipitation Animation',
        //     path: '/edr/hrrr-area-scatter',
        // }
    ],
};

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarHeader>
                    <h1 className="font-bold">Earthmover Flux Demos</h1>
                </SidebarHeader>
                {Object.entries(GROUPS).map(([group, items]) => {
                    return (
                        <SidebarGroup key={group}>
                            <SidebarGroupLabel>{group}</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {items.map(({ title, path }) => {
                                        return (
                                            <SidebarMenuItem key={path}>
                                                <SidebarMenuButton asChild>
                                                    <Link to={path}>
                                                        {title}
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        );
                                    })}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    );
                })}
            </SidebarContent>
        </Sidebar>
    );
}
