
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, LayoutDashboard, Users, Gamepad2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

const Index = () => {
  const navigate = useNavigate();
  const { habboAccount, isLoggedIn } = useUnifiedAuth();

  const features = [
    {
      title: 'Console',
      description: 'Gerencie sua conta Habbo e veja atividades',
      icon: LayoutDashboard,
      path: '/console',
      color: 'bg-blue-500'
    },
    {
      title: 'Habbo Homes',
      description: 'Personalize sua página pessoal',
      icon: Home,
      path: habboAccount ? `/home/${habboAccount.habbo_name}` : '/console',
      color: 'bg-green-500'
    },
    {
      title: 'Comunidade',
      description: 'Conecte-se com outros Habbos',
      icon: Users,
      path: '/forum',
      color: 'bg-purple-500'
    },
    {
      title: 'Eventos',
      description: 'Participe de eventos exclusivos',
      icon: Gamepad2,
      path: '/eventos',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a365d] via-[#2d3748] to-[#1a202c] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Bem-vindo ao HabboHub
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Sua plataforma completa para a experiência Habbo
          </p>
          
          {!isLoggedIn && (
            <Button 
              onClick={() => navigate('/console')} 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Fazer Login
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature) => (
            <Card 
              key={feature.title}
              className="bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 transition-colors cursor-pointer"
              onClick={() => navigate(feature.path)}
            >
              <CardHeader className="text-center">
                <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-center text-sm">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {habboAccount && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-center">
                Olá, {habboAccount.habbo_name}!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-300 mb-4">
                Acesse seu console para gerenciar sua conta ou visite sua Habbo Home.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate('/console')}>
                  Ir para Console
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/home/${habboAccount.habbo_name}`)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Minha Home
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
