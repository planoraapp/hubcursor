
import React from 'react';
import { useParams } from 'react-router-dom';
import { NewAppSidebar } from '@/components/NewAppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Settings, Heart, MessageCircle, Star, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const EnhancedHome = () => {
  const { username } = useParams<{ username: string }>();
  const { habboAccount, isLoggedIn } = useAuth();
  
  const isOwnHome = isLoggedIn && habboAccount?.habbo_name === username;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <NewAppSidebar />
        <main 
          className="flex-1 relative"
          style={{ 
            backgroundImage: 'url(/assets/bghabbohub.png)',
            backgroundRepeat: 'repeat'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-purple-900/10 to-blue-900/30"></div>
          
          <div className="relative z-10 p-8">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-white volter-font drop-shadow-lg">
                      🏠 Home de {username}
                    </h1>
                    <p className="text-lg text-white/90 volter-font drop-shadow">
                      {isOwnHome ? 'Sua home pessoal' : `Visitando a home de ${username}`}
                    </p>
                  </div>
                </div>
                
                {isOwnHome && (
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white volter-font">
                    <Settings className="w-4 h-4 mr-2" />
                    Editar Home
                  </Button>
                )}
              </div>

              {/* Main Content */}
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Avatar Widget */}
                <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black">
                  <CardHeader>
                    <CardTitle className="volter-font flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Avatar
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="mb-4">
                      <img
                        src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${username}&direction=2&head_direction=3&size=l`}
                        alt={username}
                        className="w-32 h-32 mx-auto"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 volter-font mb-2">
                      {username}
                    </h3>
                    <Badge variant="secondary" className="volter-font">
                      Habbo.com.br
                    </Badge>
                  </CardContent>
                </Card>

                {/* Guestbook Widget */}
                <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black">
                  <CardHeader>
                    <CardTitle className="volter-font flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Livro de Visitas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm volter-font">HabboHub</span>
                          <Badge variant="outline" className="text-xs">Sistema</Badge>
                        </div>
                        <p className="text-sm text-gray-600 volter-font">
                          Bem-vindo à sua nova Habbo Home! 🏠✨
                        </p>
                      </div>
                    </div>
                    
                    {!isOwnHome && isLoggedIn && (
                      <div className="mt-4 pt-4 border-t">
                        <Button variant="outline" className="w-full volter-font">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Deixar Recado
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Rating Widget */}
                <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black">
                  <CardHeader>
                    <CardTitle className="volter-font flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Avaliação
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="mb-4">
                      <div className="text-3xl font-bold text-yellow-500 mb-2">
                        ⭐⭐⭐⭐⭐
                      </div>
                      <p className="text-lg font-bold text-gray-800 volter-font">
                        5.0
                      </p>
                      <p className="text-sm text-gray-600 volter-font">
                        Baseado em 1 avaliação
                      </p>
                    </div>
                    
                    {!isOwnHome && isLoggedIn && (
                      <Button variant="outline" className="w-full volter-font">
                        <Heart className="w-4 h-4 mr-2" />
                        Avaliar Home
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Tips for Home Owner */}
              {isOwnHome && (
                <Card className="mt-8 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black">
                  <CardHeader>
                    <CardTitle className="volter-font">
                      💡 Dicas para Personalizar sua Home
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-bold text-gray-700 mb-2 volter-font">Widgets Disponíveis</h4>
                        <ul className="text-gray-600 space-y-1 volter-font text-sm">
                          <li>• Widget de Avatar - Mostra seu personagem</li>
                          <li>• Livro de Visitas - Recados dos visitantes</li>
                          <li>• Sistema de Avaliação - Nota da sua home</li>
                          <li>• Widget de Música - Sua playlist favorita</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-700 mb-2 volter-font">Personalização</h4>
                        <ul className="text-gray-600 space-y-1 volter-font text-sm">
                          <li>• Altere o background da sua home</li>
                          <li>• Reorganize os widgets arrastando</li>
                          <li>• Adicione stickers decorativos</li>
                          <li>• Configure suas informações pessoais</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default EnhancedHome;
