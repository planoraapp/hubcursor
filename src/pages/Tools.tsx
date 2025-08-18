
import React from 'react';
import { NewAppSidebar } from '@/components/NewAppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench, Palette, Code, Database, Settings, ExternalLink } from 'lucide-react';

const Tools = () => {
  const toolCategories = [
    {
      title: 'Design & Customização',
      description: 'Ferramentas para personalizar sua experiência no Habbo',
      icon: Palette,
      color: 'from-pink-500 to-purple-500',
      tools: [
        {
          name: 'Avatar Builder',
          description: 'Crie e customize seu avatar Habbo',
          status: 'Em breve',
          external: false
        },
        {
          name: 'Room Designer',
          description: 'Planeje e decore seus quartos',
          status: 'Em desenvolvimento',
          external: false
        },
        {
          name: 'Badge Creator',
          description: 'Crie emblemas personalizados',
          status: 'Disponível',
          external: true,
          url: 'https://habbo.com/badges'
        }
      ]
    },
    {
      title: 'Análise & Estatísticas',
      description: 'Acompanhe suas estatísticas e progresso',
      icon: Database,
      color: 'from-blue-500 to-cyan-500',
      tools: [
        {
          name: 'Profile Analytics',
          description: 'Analise estatísticas do seu perfil',
          status: 'Beta',
          external: false
        },
        {
          name: 'Friends Tracker',
          description: 'Monitore atividade dos seus amigos',
          status: 'Em desenvolvimento',
          external: false
        },
        {
          name: 'Trading History',
          description: 'Histórico de suas negociações',
          status: 'Em breve',
          external: false
        }
      ]
    },
    {
      title: 'Desenvolvimento',
      description: 'Ferramentas para desenvolvedores e criadores',
      icon: Code,
      color: 'from-green-500 to-teal-500',
      tools: [
        {
          name: 'API Explorer',
          description: 'Explore a API do Habbo',
          status: 'Disponível',
          external: true,
          url: 'https://habbo.com/api'
        },
        {
          name: 'Bot Framework',
          description: 'Framework para criar bots do Habbo',
          status: 'Em desenvolvimento',
          external: false
        },
        {
          name: 'Widget SDK',
          description: 'SDK para criar widgets customizados',
          status: 'Em breve',
          external: false
        }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Disponível':
        return 'bg-green-100 text-green-800';
      case 'Beta':
        return 'bg-yellow-100 text-yellow-800';
      case 'Em desenvolvimento':
        return 'bg-blue-100 text-blue-800';
      case 'Em breve':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <SidebarProvider>
      <div 
        className="min-h-screen flex w-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}
      >
        <NewAppSidebar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto scrollbar-hide">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-white mb-4 volter-font drop-shadow-lg">
                🔧 Ferramentas HabboHub
              </h1>
              <p className="text-xl text-white/90 volter-font drop-shadow">
                Ferramentas avançadas para aprimorar sua experiência no Habbo
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black">
                <CardContent className="p-6 text-center">
                  <Wrench className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-blue-900 volter-font">12</div>
                  <div className="text-blue-700 volter-font">Ferramentas</div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black">
                <CardContent className="p-6 text-center">
                  <Settings className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-green-900 volter-font">3</div>
                  <div className="text-green-700 volter-font">Categorias</div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black">
                <CardContent className="p-6 text-center">
                  <Code className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-purple-900 volter-font">2</div>
                  <div className="text-purple-700 volter-font">Disponíveis</div>
                </CardContent>
              </Card>
            </div>

            {/* Tool Categories */}
            <div className="space-y-8">
              {toolCategories.map((category, index) => (
                <Card key={index} className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black">
                  <CardHeader className={`bg-gradient-to-r ${category.color} text-white rounded-t-lg`}>
                    <CardTitle className="flex items-center gap-3 text-2xl volter-font">
                      <category.icon className="w-8 h-8" />
                      {category.title}
                    </CardTitle>
                    <CardDescription className="text-white/90 volter-font text-lg">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {category.tools.map((tool, toolIndex) => (
                        <Card key={toolIndex} className="border-2 border-gray-200 hover:border-gray-300 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-bold text-gray-800 volter-font">{tool.name}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium volter-font ${getStatusColor(tool.status)}`}>
                                {tool.status}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-4 volter-font">
                              {tool.description}
                            </p>
                            {tool.external && tool.url ? (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white volter-font"
                                onClick={() => window.open(tool.url, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Acessar
                              </Button>
                            ) : tool.status === 'Disponível' || tool.status === 'Beta' ? (
                              <Button 
                                size="sm" 
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white volter-font"
                                disabled={tool.status !== 'Disponível'}
                              >
                                {tool.status === 'Beta' ? 'Testar (Beta)' : 'Usar Ferramenta'}
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full volter-font" 
                                disabled
                              >
                                {tool.status}
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Information Card */}
            <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black mt-8">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 volter-font">
                  🚀 Mais ferramentas em desenvolvimento
                </h3>
                <p className="text-gray-600 volter-font mb-6">
                  Nossa equipe está trabalhando constantemente para trazer novas ferramentas que vão revolucionar sua experiência no Habbo. Fique de olho nas atualizações!
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button variant="outline" className="border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white volter-font">
                    Sugerir Ferramenta
                  </Button>
                  <Button variant="outline" className="border-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white volter-font">
                    Reportar Bug
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Tools;
