
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Home, Plus, ExternalLink, Users, Camera, Sparkles, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Homes = () => {
  const { habboAccount } = useAuth();
  const navigate = useNavigate();
  const [searchUsername, setSearchUsername] = useState('');

  const handleSearchHome = () => {
    if (searchUsername.trim()) {
      navigate(`/enhanced-home/${searchUsername.trim()}`);
    }
  };

  const recentHomes = [
    {
      id: 1,
      owner: habboAccount?.habbo_name || 'Beebop',
      title: 'Minha Home Personalizada',
      description: 'Home com widgets exclusivos e decoração única',
      imageUrl: '/assets/bghabbohub.png',
      visitors: 125,
      widgets: 8,
      isOnline: true
    },
    {
      id: 2,
      owner: habboAccount?.habbo_name || 'Beebop',
      title: 'Versão 2.0 da Home',
      description: 'Nova versão com mais funcionalidades',
      imageUrl: '/assets/bghabbohub.png',
      visitors: 89,
      widgets: 12,
      isOnline: false
    },
    {
      id: 3,
      owner: habboAccount?.habbo_name || 'Beebop',
      title: 'Estilo Moderno',
      description: 'Design clean e contemporâneo',
      imageUrl: '/assets/bghabbohub.png',
      visitors: 234,
      widgets: 6,
      isOnline: true
    }
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CollapsibleAppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
          </header>
          <main 
            className="flex-1 relative bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}
          >
            {/* Background overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-purple-900/10 to-blue-900/30"></div>
            
            <div className="relative z-10 p-8">
              <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                  <h1 className="text-5xl font-bold text-white mb-4 volter-font drop-shadow-lg">
                    🏠 Habbo Homes
                  </h1>
                  <p className="text-xl text-white/90 volter-font drop-shadow">
                    Personalize sua casa virtual e visite as homes dos seus amigos
                  </p>
                </div>

                {/* Action Cards */}
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  {/* Create/View My Home Card */}
                  <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-8 text-center">
                      <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        <Home className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-4 volter-font">
                        {habboAccount ? 'Minha Home' : 'Fazer Login'}
                      </h2>
                      <p className="text-gray-600 mb-6 volter-font">
                        {habboAccount 
                          ? 'Customize sua home pessoal com widgets, stickers e backgrounds únicos'
                          : 'Faça login para criar e personalizar sua home'
                        }
                      </p>
                      {habboAccount ? (
                        <Link to={`/enhanced-home/${habboAccount.habbo_name}`}>
                          <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-3 text-lg volter-font">
                            <Plus className="w-5 h-5 mr-2" />
                            Ver Minha Home
                          </Button>
                        </Link>
                      ) : (
                        <Link to="/login">
                          <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 text-lg volter-font">
                            Fazer Login
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>

                  {/* Search Homes Card */}
                  <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-8 text-center">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        <Search className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-4 volter-font">
                        Buscar Homes
                      </h2>
                      <p className="text-gray-600 mb-6 volter-font">
                        Digite o nome de um usuário para visitar sua Habbo Home
                      </p>
                      <div className="flex gap-2 mb-4">
                        <Input
                          placeholder="Nome do usuário..."
                          value={searchUsername}
                          onChange={(e) => setSearchUsername(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSearchHome()}
                          className="volter-font"
                        />
                        <Button
                          onClick={handleSearchHome}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white volter-font"
                        >
                          <Search className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Homes */}
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white mb-8 text-center volter-font drop-shadow-lg">
                    🏡 Homes Recentes
                  </h2>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recentHomes.map((home) => (
                      <Card key={home.id} className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black hover:shadow-xl transition-all duration-300 overflow-hidden">
                        <div className="relative">
                          <div className="w-full h-32 bg-gradient-to-br from-blue-400 to-purple-500 flex items-end justify-center p-4">
                            <div className="text-center">
                              <div className="bg-white/90 rounded-lg p-2 mb-2 inline-block">
                                <span className="text-2xl">🏠</span>
                              </div>
                              <div className="text-white text-xs volter-font">
                                Miniatura da Home
                              </div>
                            </div>
                          </div>
                          <div className="absolute top-3 right-3">
                            <Badge variant={home.isOnline ? "default" : "secondary"} className="volter-font">
                              {home.isOnline ? 'Online' : 'Offline'}
                            </Badge>
                          </div>
                        </div>
                        
                        <CardContent className="p-6">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold volter-font">
                                {home.owner[0]}
                              </span>
                            </div>
                            <span className="font-bold text-gray-800 volter-font">{home.owner}</span>
                          </div>
                          
                          <h3 className="text-xl font-bold text-gray-800 mb-2 volter-font">
                            {home.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4 volter-font">
                            {home.description}
                          </p>
                          
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span className="volter-font">{home.visitors}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Sparkles className="w-4 h-4" />
                              <span className="volter-font">{home.widgets} widgets</span>
                            </div>
                          </div>
                          
                          <Link to={`/enhanced-home/${home.owner}`}>
                            <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white volter-font">
                              <Camera className="w-4 h-4 mr-2" />
                              Visitar Home
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Tips Card */}
                <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 volter-font">
                      💡 Dicas para sua Home
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-bold text-gray-700 mb-2 volter-font">Personalização</h4>
                        <ul className="text-gray-600 space-y-1 volter-font text-sm">
                          <li>• Use widgets para mostrar informações pessoais</li>
                          <li>• Adicione stickers para decorar sua home</li>
                          <li>• Experimente diferentes backgrounds</li>
                          <li>• Organize elementos com drag & drop</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-700 mb-2 volter-font">Interação</h4>
                        <ul className="text-gray-600 space-y-1 volter-font text-sm">
                          <li>• Permita que amigos deixem recados</li>
                          <li>• Compartilhe sua home com outros usuários</li>
                          <li>• Mantenha sua home sempre atualizada</li>
                          <li>• Participe de concursos de homes</li>
                        </ul>
                      </div>
                    </div>
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

export default Homes;
