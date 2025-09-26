
import React from 'react';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CollapsibleAppSidebar />
        <SidebarInset className="flex-1">
          <main className="flex-1 p-8 bg-repeat min-h-screen" style={{ 
        backgroundImage: 'url(/assets/bghabbohub.png)',
        backgroundRepeat: 'repeat'
      }}>
            <div className="max-w-2xl mx-auto mt-20">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <AlertTriangle className="w-8 h-8 text-white" />
                  <h1 className="text-4xl font-bold text-white volter-font"
                      style={{
                        textShadow: '2px 2px 0px black, -2px -2px 0px black, 2px -2px 0px black, -2px 2px 0px black'
                      }}>
                    404 - Página não encontrada
                  </h1>
                </div>
                <p className="text-lg text-white/90 volter-font drop-shadow">
                  Ops! A página que você procura não existe.
                </p>
              </div>
              
              <Card className="p-8 text-center bg-white/90 backdrop-blur-sm border-2 border-black">
                <CardHeader>
                  <CardTitle className="volter-font text-2xl text-gray-900">🏠 Perdido?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 volter-font">
                    A página que você está procurando não foi encontrada. Que tal voltar para o início?
                  </p>
                  <Link to="/">
                    <Button className="habbo-button-blue volter-font">
                      Voltar ao Início
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default NotFound;
