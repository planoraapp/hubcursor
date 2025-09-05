
import React from 'react';
import { NewAppSidebar } from '@/components/NewAppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

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
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-4 volter-font drop-shadow-lg">
                ✨ Editor de Conteúdo
              </h1>
              <p className="text-lg text-white/90 volter-font drop-shadow">
                Ferramentas de edição em desenvolvimento.
              </p>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Editor;
