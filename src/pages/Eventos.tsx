
import React from 'react';
import { NewAppSidebar } from '@/components/NewAppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { EventsGrid } from '@/components/EventsGrid';

const Eventos = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-purple-50 to-pink-100">
        <NewAppSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-purple-900 mb-4 volter-font">
                🎉 Eventos Habbo
              </h1>
              <p className="text-lg text-purple-700 volter-font">
                Participe dos eventos mais incríveis do Habbo!
              </p>
            </div>
            
            <EventsGrid />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Eventos;
