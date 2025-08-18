
import React from 'react';
import { NewAppSidebar } from '@/components/NewAppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench, Image, Code, Palette, Download, Upload } from 'lucide-react';

const Tools = () => {
  const tools = [
    {
      id: 1,
      name: 'Gerador de Avatar',
      description: 'Crie avatars personalizados com diferentes roupas e cores',
      icon: <Image className="w-8 h-8" />,
      color: 'from-blue-500 to-cyan-500',
      available: true
    },
    {
      id: 2,
      name: 'Editor de Códigos',
      description: 'Visualize e edite códigos figure do Habbo',
      icon: <Code className="w-8 h-8" />,
      color: 'from-green-500 to-emerald-500',
      available: true
    },
    {
      id: 3,
      name: 'Paleta de Cores',
      description: 'Explore todas as cores disponíveis no Habbo',
      icon: <Palette className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-500',
      available: true
    },
    {
      id: 4,
      name: 'Exportador de Homes',
      description: 'Exporte sua Habbo Home como imagem',
      icon: <Download className="w-8 h-8" />,
      color: 'from-orange-500 to-red-500',
      available: false
    },
    {
      id: 5,
      name: 'Importador de Layouts',
      description: 'Importe layouts de homes de outros usuários',
      icon: <Upload className="w-8 h-8" />,
      color: 'from-teal-500 to-green-500',
      available: false
    },
    {
      id: 6,
      name: 'Construtor de Emblemas',
      description: 'Visualize combinações de emblemas',
      icon: <Wrench className="w-8 h-8" />,
      color: 'from-indigo-500 to-purple-500',
      available: false
    }
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <NewAppSidebar />
        <main 
          className="flex-1 relative bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-purple-900/10 to-blue-900/30"></div>
          
          <div className="relative z-10 p-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-white mb-4 volter-font drop-shadow-lg">
                  🔧 Ferramentas
                </h1>
                <p className="text-xl text-white/90 volter-font drop-shadow">
                  Utilitários e ferramentas para aprimorar sua experiência no Habbo
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool) => (
                  <Card key={tool.id} className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black hover:shadow-xl transition-all duration-300">
                    <CardHeader className={`bg-gradient-to-r ${tool.color} text-white border-b-2 border-black`}>
                      <div className="flex items-center gap-3">
                        {tool.icon}
                        <CardTitle className="text-xl volter-font">
                          {tool.name}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="text-gray-600 mb-6 volter-font">
                        {tool.description}
                      </p>
                      
                      <Button 
                        className={`w-full volter-font ${
                          tool.available 
                            ? `bg-gradient-to-r ${tool.color} hover:opacity-90 text-white` 
                            : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        }`}
                        disabled={!tool.available}
                      >
                        {tool.available ? 'Usar Ferramenta' : 'Em Breve'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="mt-12 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 volter-font">
                    🚀 Mais Ferramentas em Desenvolvimento
                  </h3>
                  <p className="text-gray-600 mb-6 volter-font">
                    Estamos constantemente trabalhando em novas ferramentas para melhorar sua experiência. 
                    Sugestões são sempre bem-vindas!
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-gray-700 mb-2 volter-font">Em Desenvolvimento</h4>
                      <ul className="text-gray-600 space-y-1 volter-font text-sm text-left">
                        <li>• Calculadora de cores avançada</li>
                        <li>• Gerador de QR codes para homes</li>
                        <li>• Comparador de avatars</li>
                        <li>• Estatísticas detalhadas</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-700 mb-2 volter-font">Planejadas</h4>
                      <ul className="text-gray-600 space-y-1 volter-font text-sm text-left">
                        <li>• Editor de badges personalizado</li>
                        <li>• Simulador de quartos</li>
                        <li>• Conversor de imagens</li>
                        <li>• API para desenvolvedores</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Tools;
