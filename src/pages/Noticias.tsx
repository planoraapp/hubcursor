
import React from 'react';
import { NewAppSidebar } from '@/components/NewAppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { NewsGrid } from '@/components/NewsGrid';

const Noticias = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-amber-50 to-orange-100">
        <NewAppSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-amber-900 mb-4 volter-font">
                📰 Notícias do HabboHub
              </h1>
              <p className="text-lg text-amber-700 volter-font">
                Fique por dentro das últimas novidades e atualizações!
              </p>
            </div>
            
            <NewsGrid />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Noticias;
