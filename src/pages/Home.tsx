
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home as HomeIcon, Users, MessageSquare, Star } from 'lucide-react';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HomeIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">HabboHub</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A plataforma definitiva para a comunidade Habbo. Conecte-se, explore e compartilhe sua paixão pelo Habbo Hotel.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Console Social
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Acesse o console social para ver fotos de amigos, buscar usuários e interagir com a comunidade.
              </p>
              <Link to="/console">
                <Button className="w-full">Acessar Console</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-600" />
                Fórum
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Participe das discussões da comunidade, compartilhe dicas e faça novos amigos.
              </p>
              <Link to="/forum">
                <Button variant="outline" className="w-full">Ver Fórum</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-600" />
                Habbo Homes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Crie e personalize sua Habbo Home, adicione widgets e receba visitantes.
              </p>
              <Button variant="outline" className="w-full" disabled>
                Em Breve
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Pronto para começar?
              </h3>
              <p className="text-gray-600 mb-6">
                Faça login com sua conta Habbo e comece a explorar todas as funcionalidades do HabboHub.
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/login">
                  <Button size="lg">Fazer Login</Button>
                </Link>
                <Link to="/mission">
                  <Button variant="outline" size="lg">Nossa Missão</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
