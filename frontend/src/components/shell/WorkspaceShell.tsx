import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function WorkspaceShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const sidebarWidth = collapsed ? 76 : 264;

  return (
    <div className="min-h-screen w-full bg-white">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)} />
      
      <div
        className="flex min-h-screen flex-col transition-[padding] duration-300 lg:pl-[var(--sidebar-w)]"
        style={{ ['--sidebar-w' as string]: `${sidebarWidth}px` }}>
        
        <TopBar onOpenMobileNav={() => setMobileOpen(true)} sidebarWidth={sidebarWidth} />
        <main className="flex-1 bg-gray-50/60" key={location.pathname}>
          <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster
        position="bottom-right"
        gap={10}
        toastOptions={{
          className:
          'rounded-xl border border-gray-200 bg-white text-sm text-gray-800 shadow-soft [&_[data-description]]:text-[13px] [&_[data-description]]:text-gray-500 [&_[data-title]]:font-medium',
          duration: 4200
        }} />
      
    </div>);

}