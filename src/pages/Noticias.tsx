
import React from 'react';
import { NewAppSidebar } from '@/components/NewAppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowRight } from 'lucide-react';

const Noticias = () => {
  const mockNews = [
    {
      id: 1,
      title: 'Nova Atualização do HabboHub',
      summary: 'Confira as novidades e melhorias implementadas na plataforma.',
      author: 'Equipe HabboHub',
      date: '2024-01-15',
      category: 'Atualizações'
    },
    {
      id: 2,
      title: 'Sistema de Homes Aprimorado',
      summary: 'Novas funcionalidades para personalização de suas Habbo Homes.',
      author: 'Dev Team',
      date: '2024-01-10',
      category: 'Funcionalidades'
    },
    {
      id: 3,
      title: 'Evento Especial de Verão',
      summary: 'Participe do evento especial e ganhe emblemas exclusivos.',
      author: 'Moderação',
      date: '2024-01-05',
      category: 'Eventos'
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
                  📰 Notícias HabboHub
                </h1>
                <p className="text-xl text-white/90 volter-font drop-shadow">
                  Fique por dentro das últimas novidades e atualizações
                </p>
              </div>

              <div className="space-y-6">
                {mockNews.map((news) => (
                  <Card key={news.id} className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black hover:shadow-xl transition-all duration-300">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-b-2 border-black">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-2xl volter-font mb-2">
                            {news.title}
                          </CardTitle>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span className="volter-font">{news.author}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span className="volter-font">{new Date(news.date).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-white/20 text-white volter-font">
                          {news.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="text-gray-600 mb-4 volter-font text-lg">
                        {news.summary}
                      </p>
                      <div className="flex justify-end">
                        <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold volter-font">
                          Ler mais
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Noticias;
