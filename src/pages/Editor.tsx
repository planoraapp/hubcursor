
import React from 'react';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import PageBanner from '@/components/ui/PageBanner';

const Editor = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CollapsibleAppSidebar />
        <SidebarInset className="flex-1">
      <div 
        className="min-h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/assets/site/bghabbohub.png)' }}
      >
        <main className="flex-1 p-4 md:p-8 overflow-y-auto scrollbar-hide">
          <div className="max-w-6xl mx-auto">
            <PageBanner 
              title="Editor de Conteúdo"
              subtitle="Ferramentas de edição em desenvolvimento"
              backgroundImage="/assets/gcreate_4_1.png"
              icon="/assets/editorvisuais.png"
            />
          </div>
        </main>
      </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Editor;
