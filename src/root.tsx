import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import { AppSidebar } from './components/app-sidebar';

export default function Root() {
    return (
        <SidebarProvider defaultOpen={false}>
            <AppSidebar />
            <div>
                <SidebarTrigger className="z-30 absolute text-white" />
            </div>
            <main
                id="main"
                className="absolute bottom-0 top-0 left-0 right-0 flex h-[100vh] w-[100vw]"
            >
                <Outlet />
            </main>
        </SidebarProvider>
    );
}
