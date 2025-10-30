
import React from 'react';
import { NewAppSidebar } from '@/components/NewAppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import PuhekuplaEditor from '../components/PuhekuplaEditor/PuhekuplaEditor';

const EditorPuhekupla = () => {
  return (
    <SidebarProvider>
      <div 
        className="min-h-screen flex w-full"
        style={{ 
          backgroundImage: 'url(/assets/site/bghabbohub.png)',
          backgroundRepeat: 'repeat'
        }}
      >
        <NewAppSidebar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto scrollbar-hide">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-4 volter-font drop-shadow-lg">
                🌟 Editor Puhekupla - Nova Geração
              </h1>
            </div>
            <div className="bg-gradient-to-br from-white/90 to-purple-50/90 backdrop-blur-sm rounded-lg border-2 border-purple-200 shadow-xl p-4 md:p-6 h-full overflow-hidden">
              <PuhekuplaEditor />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default EditorPuhekupla;
