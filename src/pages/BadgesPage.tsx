
import React from 'react';
import { NewAppSidebar } from '@/components/NewAppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function BadgesPage() {
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
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-4 volter-font drop-shadow-lg">
                🏆 Emblemas Habbo
              </h1>
              <p className="text-lg text-white/90 volter-font drop-shadow">
                Sistema de emblemas em desenvolvimento.
              </p>
            </div>

            {/* Content Card */}
            <div 
              className="rounded-lg shadow-lg overflow-hidden"
              style={{ border: '2px solid black' }}
            >
              <div className="flex flex-col space-y-1.5 p-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                <h3 className="text-2xl font-semibold leading-none tracking-tight text-center volter-font"
                    style={{ textShadow: 'black 1px 1px 0px, black -1px -1px 0px, black 1px -1px 0px, black -1px 1px 0px' }}>
                  Emblemas Habbo
                </h3>
              </div>

              <div className="p-6 bg-white/90 backdrop-blur-sm">
                <div className="text-center py-8">
                  <div className="mb-4">
                    <img 
                      src="/assets/emblemas.png" 
                      alt="Emblemas" 
                      className="w-16 h-16 mx-auto mb-4"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2 volter-font">
                    Sistema de Emblemas
                  </h3>
                  <p className="text-gray-600 volter-font">
                    Sistema de emblemas em desenvolvimento. Em breve você poderá visualizar 
                    todos os emblemas disponíveis no Habbo Hotel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
