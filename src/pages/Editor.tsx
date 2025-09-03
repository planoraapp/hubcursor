
import React from 'react';
import { NewAppSidebar } from '@/components/NewAppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import PageBanner from '@/components/ui/PageBanner';

const Editor = () => {
  return (
    <SidebarProvider>
      <div 
        className="min-h-screen flex w-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}
      >
        <NewAppSidebar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto scrollbar-hide">
          <div className="max-w-6xl mx-auto">
            <PageBanner 
              title="✨ Editor de Conteúdo"
              subtitle="Ferramentas de edição em desenvolvimento"
              backgroundImage="/assets/gcreate_4_1.png"
            />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Editor;
