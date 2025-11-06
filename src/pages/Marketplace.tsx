
import React from 'react';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card } from '@/components/ui/card';

const Marketplace = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CollapsibleAppSidebar />
        <SidebarInset className="flex-1 bg-gradient-to-br from-green-50 to-emerald-100">
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-green-900 mb-4 volter-font">
                🛒 Marketplace
              </h1>
              <p className="text-lg text-green-700 volter-font">
                Compre e venda itens com outros jogadores
              </p>
            </div>
            
            <Card className="p-8 text-center">
              <p className="text-gray-600 volter-font">
                Marketplace em desenvolvimento...
              </p>
            </Card>
          </div>
        </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Marketplace;
