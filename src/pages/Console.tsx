
import React from 'react';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { TabbedConsole } from '@/components/console/TabbedConsole';
import { PageBackground } from '@/components/layout/PageBackground';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ExternalLink, Monitor } from 'lucide-react';

const Console: React.FC = () => {
  const { isLoggedIn } = useAuth();

  const openPopupConsole = () => {
    const popupFeatures = 'width=1200,height=800,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,location=no,status=no';
    window.open('/console-popup', 'ConsolePopup', popupFeatures);
  };

  return (
    <PageBackground>
      <SidebarProvider>
        <div className="min-h-screen flex">
          <CollapsibleAppSidebar />
          <SidebarInset className="flex-1">
            <div className="p-4 flex flex-col items-center">
              <div className="mb-6 text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <h1 className="text-3xl font-bold text-white volter-font" 
                      style={{
                        textShadow: '2px 2px 0px black, -2px -2px 0px black, 2px -2px 0px black, -2px 2px 0px black'
                      }}>
                    Console do Habbo
                  </h1>
                  
                  <Button
                    onClick={openPopupConsole}
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white volter-font"
                  >
                    <Monitor className="w-4 h-4 mr-1" />
                    Popup
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </div>
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
