
import React from 'react';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card } from '@/components/ui/card';

const Noticias = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
        <CollapsibleAppSidebar />
        <SidebarInset className="flex-1">
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-4 volter-font"
                    style={{
                      textShadow: '2px 2px 0px black, -2px -2px 0px black, 2px -2px 0px black, -2px 2px 0px black'
                    }}>
                  📰 Notícias do Habbo
                </h1>
                <p className="text-lg text-white/90 volter-font drop-shadow">
                  Fique por dentro de todas as novidades
                </p>
              </div>
              
              <Card className="p-8 text-center bg-white/90 backdrop-blur-sm border-2 border-black">
                <p className="text-gray-600 volter-font">
                  Notícias em desenvolvimento...
                </p>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Noticias;
