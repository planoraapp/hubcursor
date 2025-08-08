
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Home, Users, Star, Palette } from 'lucide-react';
import { LatestHomesCards } from '@/components/LatestHomesCards';

const Homes = () => {
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
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Home className="w-10 h-10 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-800">Habbo Homes</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Crie sua própria home personalizada no estilo Habbo! Decore, organize widgets e receba visitas dos seus amigos.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            Criar Minha Home
          </Button>
          <Button size="lg" variant="outline">
            Explorar Homes
          </Button>
        </div>
      </div>

      {/* Latest Homes - moved here between buttons and features */}
      <LatestHomesCards />

      {/* How it Works Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Como funcionam as Homes?</CardTitle>
          <CardDescription className="text-center text-lg">
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
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">1,247</div>
            <div className="text-sm text-gray-600">Homes Ativas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">8,532</div>
            <div className="text-sm text-gray-600">Mensagens no Guestbook</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600">4.7</div>
            <div className="text-sm text-gray-600">Média de Avaliações</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">156</div>
            <div className="text-sm text-gray-600">Widgets Disponíveis</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Homes;
