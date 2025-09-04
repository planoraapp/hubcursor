
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench } from 'lucide-react';
import AltCodesCompact from '@/components/tools/AltCodesCompact';


import TamagotchiCompact from '../components/tools/TamagotchiCompact';
import PageBanner from '@/components/ui/PageBanner';

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
          <main 
            className="flex-1 p-8 min-h-screen" 
            style={{ 
              backgroundImage: 'url(/assets/bghabbohub.png)',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundSize: 'cover'
            }}
          >
            <div className="max-w-7xl mx-auto">
              <PageBanner 
                title="🔧 Ferramentas"
                subtitle="Ferramentas úteis para a comunidade Habbo"
                backgroundImage="/assets/gcreate_4_1.png"
              />
              
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

                {/* Avatar Editor Tool Card */}
                <Card 
                  className="p-6 bg-white/90 backdrop-blur-sm border-2 border-black hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => navigate('/ferramentas/avatar-editor')}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                      <span className="text-3xl">🎨</span>
                    </div>
                    <CardTitle className="volter-font text-xl text-gray-900">Editor de Visuais</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600 volter-font mb-4">
                      Crie e personalize seu avatar Habbo com milhares de opções de roupas, acessórios e cores!
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded volter-font">Preview 3D</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded volter-font">Download PNG</span>
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded volter-font">Expressões</span>
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded volter-font">Ações</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Alt Codes Tool - Componente Compacto */}
                <AltCodesCompact />

                {/* Tamagotchi Tool - NOVO COMPONENTE */}
                <TamagotchiCompact />



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
