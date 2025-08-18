
import React from 'react';
import { NewAppSidebar } from '@/components/NewAppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card } from '@/components/ui/card';

const Tops = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-yellow-50 to-orange-100">
        <NewAppSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-yellow-900 mb-4 volter-font">
                🏆 Rankings
              </h1>
              <p className="text-lg text-yellow-700 volter-font">
                Veja os melhores jogadores do Habbo!
              </p>
            </div>
            
            <Card className="p-8 text-center">
              <p className="text-gray-600 volter-font">
                Rankings em desenvolvimento...
              </p>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Tops;
