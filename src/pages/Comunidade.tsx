
import React from 'react';
import { NewAppSidebar } from '@/components/NewAppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Heart, Star, Trophy, MessageSquare, Calendar } from 'lucide-react';

const Comunidade = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-pink-50 to-rose-100">
        <NewAppSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-rose-900 mb-4 volter-font">
                👥 Comunidade HabboHub
              </h1>
              <p className="text-lg text-rose-700 volter-font">
                Conecte-se, faça amigos e participe da nossa incrível comunidade!
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 volter-font">
                    <Users className="w-5 h-5 text-blue-600" />
                    Membros Ativos
                  </CardTitle>
                  <CardDescription>Conheça os membros mais ativos da comunidade</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900 mb-2 volter-font">2,847</div>
                  <p className="text-gray-600 volter-font">Membros registrados</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 volter-font">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    Discussões
                  </CardTitle>
                  <CardDescription>Participe das discussões mais quentes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-900 mb-2 volter-font">15,632</div>
                  <p className="text-gray-600 volter-font">Mensagens no fórum</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 volter-font">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    Eventos
                  </CardTitle>
                  <CardDescription>Eventos organizados pela comunidade</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-900 mb-2 volter-font">89</div>
                  <p className="text-gray-600 volter-font">Eventos este mês</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 volter-font">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    Competições
                  </CardTitle>
                  <CardDescription>Participe de competições e ganhe prêmios</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 volter-font">Em breve disponível!</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 volter-font">
                    <Star className="w-5 h-5 text-orange-600" />
                    Destaques
                  </CardTitle>
                  <CardDescription>Membros e conteúdos em destaque</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 volter-font">Em breve disponível!</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 volter-font">
                    <Heart className="w-5 h-5 text-red-600" />
                    Suporte
                  </CardTitle>
                  <CardDescription>Ajude outros membros da comunidade</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 volter-font">Em breve disponível!</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Comunidade;
