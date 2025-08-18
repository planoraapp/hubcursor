
import React from 'react';
import { NewAppSidebar } from '@/components/NewAppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Home, Users, Star, Palette, Plus } from 'lucide-react';
import { LatestHomesCards } from '@/components/LatestHomesCards';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { Link } from 'react-router-dom';

const Homes = () => {
  const { habboAccount } = useUnifiedAuth();

  const features = [
    {
      icon: <Palette className="w-8 h-8 text-blue-600" />,
      title: "Personalização Total",
      description: "Escolha cores, fundos e organize widgets do seu jeito"
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Guestbook Interativo", 
      description: "Receba mensagens dos seus amigos em sua home"
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-600" />,
      title: "Sistema de Avaliação",
      description: "Outros usuários podem avaliar sua home com estrelas"
    }
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-purple-50 to-pink-100">
        <NewAppSidebar />
        <main className="flex-1 p-8">
          <div className="container mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <Home className="w-10 h-10 text-blue-600" />
                <h1 className="text-4xl font-bold text-gray-800 volter-font">Habbo Homes</h1>
              </div>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto volter-font">
                Crie sua própria home personalizada no estilo Habbo! Decore, organize widgets e receba visitas dos seus amigos.
              </p>
              <div className="flex gap-4 justify-center">
                {habboAccount ? (
                  <Link to={`/home/${habboAccount.habbo_name}`}>
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 volter-font">
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Minha Home
                    </Button>
                  </Link>
                ) : (
                  <Link to="/login">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 volter-font">
                      Fazer Login para Criar Home
                    </Button>
                  </Link>
                )}
                <Button size="lg" variant="outline" className="volter-font">
                  Explorar Homes
                </Button>
              </div>
            </div>

            {/* Latest Homes */}
            <div className="mb-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2 volter-font">Últimas Homes Atualizadas</h2>
                <p className="text-gray-600 volter-font">Descubra as homes que foram modificadas recentemente</p>
              </div>
              <LatestHomesCards />
            </div>

            {/* How it Works Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center volter-font">Como funcionam as Homes?</CardTitle>
                <CardDescription className="text-center text-lg volter-font">
                  Descubra como criar e personalizar sua home
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-8">
                  {features.map((feature, index) => (
                    <div key={index} className="text-center space-y-4">
                      <div className="flex justify-center">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-semibold volter-font">{feature.title}</h3>
                      <p className="text-gray-600 volter-font">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 volter-font">1,247</div>
                  <div className="text-sm text-gray-600 volter-font">Homes Ativas</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 volter-font">8,532</div>
                  <div className="text-sm text-gray-600 volter-font">Mensagens no Guestbook</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-yellow-600 volter-font">4.7</div>
                  <div className="text-sm text-gray-600 volter-font">Média de Avaliações</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 volter-font">156</div>
                  <div className="text-sm text-gray-600 volter-font">Widgets Disponíveis</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Homes;
