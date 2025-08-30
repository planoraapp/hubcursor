
import React from 'react';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { FunctionalConsole } from '@/components/console/FunctionalConsole';
import { TestConsole } from '@/components/console/TestConsole';
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
                <h1 className="text-3xl font-bold text-white mb-4 volter-font" 
                    style={{
                      textShadow: '2px 2px 0px black, -2px -2px 0px black, 2px -2px 0px black, -2px 2px 0px black'
                    }}>
                  Console do Habbo
                </h1>
                <p className="text-white/80 volter-font" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                  Gerencie sua experiência no HabboHub
                </p>
              </div>

              {/* Console funcional com dados reais do Habbo */}
              <FunctionalConsole />
              
              {/* Popup button positioned below console */}
              <div className="mt-4 flex justify-center">
                <Button
                  onClick={openPopupConsole}
                  variant="outline" 
                  size="lg"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white volter-font px-6 py-3"
                >
                  <Monitor className="w-5 h-5 mr-2" />
                  Abrir Console em Pop-up
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </PageBackground>
  );
};

export default Console;
