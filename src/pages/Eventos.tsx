
import React from 'react';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

const Eventos = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CollapsibleAppSidebar />
        <SidebarInset className="flex-1">
          <main className="flex-1 p-8 bg-repeat min-h-screen" style={{ 
        backgroundImage: 'url(/assets/bghabbohub.png)',
        backgroundRepeat: 'repeat'
      }}>
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Calendar className="w-8 h-8 text-white" />
                  <h1 className="text-4xl font-bold text-white volter-font"
                      style={{
                        textShadow: '2px 2px 0px black, -2px -2px 0px black, 2px -2px 0px black, -2px 2px 0px black'
                      }}>
                    🎉 Eventos
                  </h1>
                </div>
                <p className="text-lg text-white/90 volter-font drop-shadow">
                  Participe dos eventos mais incríveis da comunidade
                </p>
              </div>
              
              <Card className="p-8 text-center bg-white/90 backdrop-blur-sm border-2 border-black">
                <CardHeader>
                  <CardTitle className="volter-font text-2xl text-gray-900">Aguarde novidades...</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 volter-font">
                    Sistema de eventos será lançado em breve. Fique atento aos próximos eventos da comunidade!
                  </p>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Eventos;
