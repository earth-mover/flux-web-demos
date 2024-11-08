import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import { AppSidebar } from './components/app-sidebar';

export default function Root() {
    return (
        <SidebarProvider defaultOpen={false}>
            <AppSidebar />
            <main id="main" className="flex h-[100vh] w-[100vw]">
                <SidebarTrigger className="z-30 absolute text-white" />
                <Outlet />
            </main>
        </SidebarProvider>
    );
}
