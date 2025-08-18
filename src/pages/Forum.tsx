
import React from 'react';
import { NewAppSidebar } from '@/components/NewAppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, Pin, Clock, Eye, MessageCircle } from 'lucide-react';

const Forum = () => {
  const forumCategories = [
    {
      id: 1,
      title: "Discussões Gerais",
      description: "Converse sobre qualquer assunto relacionado ao Habbo",
      topics: 1247,
      posts: 15623,
      lastPost: "há 2 minutos",
      color: "bg-blue-100 text-blue-800"
    },
    {
      id: 2,
      title: "Suporte e Ajuda",
      description: "Precisa de ajuda? Nossa comunidade está aqui!",
      topics: 532,
      posts: 3421,
      lastPost: "há 15 minutos",
      color: "bg-green-100 text-green-800"
    },
    {
      id: 3,
      title: "Trading e Mercado",
      description: "Compre, venda e negocie itens com outros usuários",
      topics: 2156,
      posts: 8934,
      lastPost: "há 5 minutos",
      color: "bg-yellow-100 text-yellow-800"
    },
    {
      id: 4,
      title: "Eventos e Competições",
      description: "Fique por dentro dos eventos da comunidade",
      topics: 89,
      posts: 657,
      lastPost: "há 1 hora",
      color: "bg-purple-100 text-purple-800"
    }
  ];

  const featuredTopics = [
    {
      title: "🎉 Evento de Natal 2024 - Participe!",
      author: "EventTeam",
      replies: 156,
      views: 2341,
      lastReply: "há 3 minutos",
      isPinned: true
    },
    {
      title: "💰 Guia Completo de Trading para Iniciantes",
      author: "TradeMaster",
      replies: 89,
      views: 1567,
      lastReply: "há 12 minutos",
      isPinned: false
    },
    {
      title: "🏠 Compartilhe sua Home mais incrível!",
      author: "HomeDesigner",
      replies: 234,
      views: 3421,
      lastReply: "há 8 minutos",
      isPinned: false
    }
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-gray-100">
        <NewAppSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4 volter-font">
                💬 Fórum HabboHub
              </h1>
              <p className="text-lg text-gray-600 volter-font">
                Conecte-se com a comunidade Habbo! Compartilhe, discuta e faça novos amigos.
              </p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-900 volter-font">4,024</div>
                  <div className="text-sm text-blue-700 volter-font">Tópicos</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <MessageCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-900 volter-font">28,635</div>
                  <div className="text-sm text-green-700 volter-font">Posts</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-900 volter-font">1,847</div>
                  <div className="text-sm text-purple-700 volter-font">Membros</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Eye className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-900 volter-font">156</div>
                  <div className="text-sm text-orange-700 volter-font">Online Agora</div>
                </CardContent>
              </Card>
            </div>

            {/* Featured Topics */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 volter-font">
                  <Pin className="w-5 h-5 text-yellow-600" />
                  Tópicos em Destaque
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {featuredTopics.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {topic.isPinned && <Pin className="w-4 h-4 text-yellow-600" />}
                          <h4 className="font-medium text-gray-800 volter-font">{topic.title}</h4>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 volter-font">
                          <span>por {topic.author}</span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {topic.replies}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {topic.views}
                          </span>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500 volter-font">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {topic.lastReply}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Forum Categories */}
            <div className="grid gap-6">
              {forumCategories.map((category) => (
                <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 volter-font">
                          <MessageSquare className="w-5 h-5" />
                          {category.title}
                        </CardTitle>
                        <CardDescription className="mt-1 volter-font">
                          {category.description}
                        </CardDescription>
                      </div>
                      <Badge className={category.color + " volter-font"}>
                        {category.topics} tópicos
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-4 volter-font">
                        <span>{category.posts} posts</span>
                        <span>Último post: {category.lastPost}</span>
                      </div>
                      <Button variant="outline" size="sm" className="volter-font">
                        Ver Tópicos
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Coming Soon Notice */}
            <Card className="mt-8 bg-blue-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-bold text-blue-800 mb-2 volter-font">
                  🚧 Fórum em Desenvolvimento
                </h3>
                <p className="text-blue-700 volter-font">
                  O sistema completo de fórum está sendo desenvolvido. Em breve você poderá criar tópicos, responder mensagens e interagir com toda a comunidade!
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Forum;
