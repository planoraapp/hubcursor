
import React from 'react';
import { NewAppSidebar } from '@/components/NewAppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card } from '@/components/ui/card';

const HabboConsole = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <NewAppSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4 volter-font">
                🎮 Console Habbo
              </h1>
              <p className="text-lg text-gray-700 volter-font">
                Ferramenta avançada para desenvolvedores
              </p>
            </div>
            
            <Card className="p-8 text-center">
              <p className="text-gray-600 volter-font">
                Console em desenvolvimento...
              </p>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default HabboConsole;
