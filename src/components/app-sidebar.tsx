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
        {
            title: 'Global GFS View',
            path: '/wms/gfs-globe',
        },
    ],
    EDR: [
        {
            title: 'GFS Point Timeseries',
            path: '/edr/gfs-point-timeseries',
        },
    ],
};

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarHeader>
                    <h1 className="font-bold">Earthmover Endpoints</h1>
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
