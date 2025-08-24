
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench } from 'lucide-react';

const Tools = () => {
  const navigate = useNavigate();

  const handleHanditemToolClick = () => {
    navigate('/ferramentas/handitems');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CollapsibleAppSidebar />
        <SidebarInset className="flex-1">
          <main className="flex-1 p-8 bg-repeat min-h-screen" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Wrench className="w-8 h-8 text-white" />
                  <h1 className="text-4xl font-bold text-white volter-font"
                      style={{
                        textShadow: '2px 2px 0px black, -2px -2px 0px black, 2px -2px 0px black, -2px 2px 0px black'
                      }}>
                    🔧 Ferramentas
                  </h1>
                </div>
                <p className="text-lg text-white/90 volter-font drop-shadow">
                  Ferramentas úteis para a comunidade Habbo
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Handitem Tool Card */}
                <Card 
                  className="p-6 bg-white/90 backdrop-blur-sm border-2 border-black hover:shadow-lg transition-all cursor-pointer group"
                  onClick={handleHanditemToolClick}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                      <span className="text-3xl">🤲</span>
                    </div>
                    <CardTitle className="volter-font text-xl text-gray-900">Catálogo de Handitems</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600 volter-font mb-4">
                      Explore todos os itens de mão que os mobis entregam no hotel! Busque, filtre e copie IDs facilmente.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded volter-font">Busca Avançada</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded volter-font">Preview Avatar</span>
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded volter-font">Copy ID</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Future Tools Placeholder */}
                <Card className="p-6 bg-white/60 backdrop-blur-sm border-2 border-dashed border-gray-300">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">🔧</span>
                    </div>
                    <CardTitle className="volter-font text-xl text-gray-500">Em Breve</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-400 volter-font">
                      Mais ferramentas úteis para a comunidade Habbo em desenvolvimento...
                    </p>
                  </CardContent>
                </Card>

                <Card className="p-6 bg-white/60 backdrop-blur-sm border-2 border-dashed border-gray-300">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">⚡</span>
                    </div>
                    <CardTitle className="volter-font text-xl text-gray-500">Próximamente</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-400 volter-font">
                      Aguarde novidades e funcionalidades incríveis!
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Tools;
