
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Heart, Users, Zap, ArrowLeft } from 'lucide-react';

export const Mission: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Início
          </Link>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Target className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-900">Nossa Missão</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Conectar e fortalecer a comunidade Habbo através de tecnologia inovadora e experiências sociais significativas.
          </p>
        </div>

        {/* Mission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-500" />
                Paixão pela Comunidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                Acreditamos que o Habbo Hotel é mais do que um jogo - é um lugar onde amizades verdadeiras são formadas. 
                Nossa missão é fortalecer essas conexões através de ferramentas que aproximam os usuários.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-500" />
                Conectando Pessoas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                Desenvolvemos funcionalidades que facilitam encontrar amigos, descobrir novos usuários e 
                manter-se conectado com a comunidade Habbo de forma mais eficiente e divertida.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-500" />
                Inovação Constante
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                Estamos sempre buscando novas formas de melhorar a experiência dos usuários, 
                implementando recursos únicos como o console social, feeds de fotos e sistemas de busca avançados.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-6 h-6 text-purple-500" />
                Visão de Futuro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                Queremos ser a plataforma de referência para a comunidade Habbo, 
                oferecendo ferramentas que enriquecem a experiência social e criam novas possibilidades de interação.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values Section */}
        <Card className="max-w-4xl mx-auto bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-900">Nossos Valores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Transparência</h3>
                <p className="text-gray-600 text-sm">
                  Operamos com total transparência, respeitando a privacidade dos usuários e as diretrizes do Habbo Hotel.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Qualidade</h3>
                <p className="text-gray-600 text-sm">
                  Priorizamos a qualidade em cada funcionalidade, garantindo uma experiência confiável e estável.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Comunidade</h3>
                <p className="text-gray-600 text-sm">
                  A comunidade está no centro de tudo que fazemos, e suas necessidades guiam nosso desenvolvimento.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Faça Parte da Nossa Missão
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Junte-se a nós nesta jornada para fortalecer e conectar a comunidade Habbo. 
            Sua participação faz toda a diferença!
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/console">
              <Button size="lg">Explorar Console</Button>
            </Link>
            <Link to="/forum">
              <Button variant="outline" size="lg">Participar do Fórum</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mission;
