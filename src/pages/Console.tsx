
import React from 'react';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { TabbedConsole } from '@/components/console/TabbedConsole';
import { PageBackground } from '@/components/layout/PageBackground';
import { useAuth } from '@/hooks/useAuth';

const Console: React.FC = () => {
  const { isLoggedIn } = useAuth();

  return (
    <PageBackground>
      <SidebarProvider>
        <div className="min-h-screen flex">
          <CollapsibleAppSidebar />
          <SidebarInset className="flex-1">
            <div className="p-4 flex flex-col items-center">
              <div className="mb-6 text-center">
                <h1 className="text-3xl font-bold text-white mb-2 volter-font" 
                    style={{
                      textShadow: '2px 2px 0px black, -2px -2px 0px black, 2px -2px 0px black, -2px 2px 0px black'
                    }}>
                  Console do Habbo
                </h1>
                <p className="text-white/80 volter-font" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                  Gerencie sua experiência no HabboHub
                </p>
              </div>

              {/* Centralized single column console */}
              <TabbedConsole />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </PageBackground>
  );
};

export default Console;
