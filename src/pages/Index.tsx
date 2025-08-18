
import React from 'react';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Card } from '@/components/ui/card';

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CollapsibleAppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
          </header>
          <main className="flex-1 p-8 bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-4 volter-font drop-shadow-lg">
                  🏠 Bem-vindo ao HabboHub
                </h1>
                <p className="text-lg text-white/90 volter-font drop-shadow">
                  Sua plataforma completa para o universo Habbo
                </p>
              </div>
              
              <Card className="p-8 text-center bg-white/90 backdrop-blur-sm border-2 border-black">
                <p className="text-gray-600 volter-font">
                  Explore todas as funcionalidades através da sidebar lateral!
                </p>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
