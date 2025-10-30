import React from 'react';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import PageBanner from '@/components/ui/PageBanner';
import HabboFontsDemo from '@/components/HabboFontsDemo';

const HabboFontsPage: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CollapsibleAppSidebar />
        <SidebarInset>
          <main
            className="flex-1 p-4 md:p-8 overflow-y-auto scrollbar-hide min-h-screen"
            style={{
              backgroundImage: 'url(/assets/site/bghabbohub.png)',
              backgroundRepeat: 'repeat',
              backgroundSize: 'auto'
            }}
          >
            <div className="max-w-7xl mx-auto space-y-6">
              <PageBanner
                title="Fontes Oficiais do Habbo"
                subtitle="Demonstração das tipografias oficiais do Habbo Hotel"
              />

              <HabboFontsDemo />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default HabboFontsPage;
