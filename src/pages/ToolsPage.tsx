
import React from 'react';
import { NewAppSidebar } from '@/components/NewAppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Tools } from '../components/Tools';

const ToolsPage = () => {
  return (
    <SidebarProvider>
      <div 
        className="min-h-screen flex w-full"
        style={{ 
          backgroundImage: 'url(/assets/bghabbohub.png)',
          backgroundRepeat: 'repeat'
        }}
      >
        <NewAppSidebar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto scrollbar-hide">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-4 volter-font drop-shadow-lg">
                🔧 Ferramentas
              </h1>
              <p className="text-lg text-white/90 volter-font drop-shadow">
                Conecte-se com a comunidade Habbo! Compartilhe, discuta e faça novos amigos.
              </p>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-lg border-2 border-black shadow-lg">
              <Tools />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ToolsPage;
