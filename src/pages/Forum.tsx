import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Clock, User, Pin, Lock, TrendingUp, Plus } from 'lucide-react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { SidebarProvider } from '@/components/ui/sidebar';
import { NewAppSidebar } from '@/components/NewAppSidebar';

// Mock forum data - in a real app this would come from your backend
const forumCategories = [
  {
    id: 1,
    name: 'Anúncios Oficiais',
    description: 'Novidades e atualizações do HabboHub',
    icon: '📢',
    topics: 5,
    posts: 23,
    lastPost: {
      title: 'Nova atualização do Console',
      author: 'HabboHub',
      date: '2025-01-15'
    }
  },
  {
    id: 2,
    name: 'Discussão Geral',
    description: 'Converse sobre qualquer assunto relacionado ao Habbo',
    icon: '💬',
    topics: 42,
    posts: 187,
    lastPost: {
      title: 'Melhores eventos de 2025',
      author: 'Beebop',
      date: '2025-01-14'
    }
  },
  {
    id: 3,
    name: 'Suporte Técnico',
    description: 'Tire suas dúvidas e reporte problemas',
    icon: '🔧',
    topics: 18,
    posts: 95,
    lastPost: {
      title: 'Problema no carregamento de fotos',
      author: 'Usuario123',
      date: '2025-01-13'
    }
  }
];

const Forum: React.FC = () => {
  const [activeSection, setActiveSection] = useState('forum');
  const { habboAccount } = useUnifiedAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-repeat flex" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
        <NewAppSidebar />
        
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-4 volter-font" style={{
                textShadow: '2px 2px 0px black, -2px -2px 0px black, 2px -2px 0px black, -2px 2px 0px black'
              }}>
                💬 Fórum da Comunidade
              </h1>
              <p className="text-xl text-white mb-4" style={{
                textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
              }}>
                Conecte-se, discuta e compartilhe experiências
              </p>
            </div>

            {/* Forum Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-2 border-black">
                <CardContent className="p-4 text-center">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-gray-800">65</div>
                  <div className="text-sm text-gray-600">Tópicos</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-2 border-black">
                <CardContent className="p-4 text-center">
                  <User className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-gray-800">305</div>
                  <div className="text-sm text-gray-600">Posts</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-2 border-black">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold text-gray-800">24</div>
                  <div className="text-sm text-gray-600">Membros Ativos</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-2 border-black">
                <CardContent className="p-4 text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                  <div className="text-2xl font-bold text-gray-800">Hoje</div>
                  <div className="text-sm text-gray-600">Último Post</div>
                </CardContent>
              </Card>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              {forumCategories.map((category) => (
                <Card key={category.id} className="bg-white/95 backdrop-blur-sm shadow-lg border-2 border-black">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{category.icon}</div>
                        <div>
                          <CardTitle className="text-lg volter-font">{category.name}</CardTitle>
                          <p className="text-sm text-gray-600">{category.description}</p>
                        </div>
                      </div>
                      {habboAccount && (
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white volter-font">
                          <Plus className="w-4 h-4 mr-1" />
                          Novo Tópico
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex gap-6">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">{category.topics}</span>
                          <span className="text-gray-500">tópicos</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4 text-green-600" />
                          <span className="font-medium">{category.posts}</span>
                          <span className="text-gray-500">posts</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium text-gray-800">{category.lastPost.title}</div>
                        <div className="text-gray-500">
                          por <span className="font-medium">{category.lastPost.author}</span>
                          {' • '}
                          {new Date(category.lastPost.date).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Login Message */}
            {!habboAccount && (
              <Card className="mt-6 bg-yellow-50 border-2 border-yellow-300">
                <CardContent className="p-6 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
                  <h3 className="text-xl font-bold text-yellow-800 mb-2 volter-font">
                    Participe da Comunidade!
                  </h3>
                  <p className="text-yellow-700 mb-4">
                    Faça login para criar tópicos, participar de discussões e interagir com outros membros
                  </p>
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-yellow-900 font-bold volter-font">
                    Conectar Conta Habbo
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Forum Rules */}
            <Card className="mt-6 bg-blue-50 border-2 border-blue-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800 volter-font">
                  <Pin className="w-5 h-5" />
                  Regras do Fórum
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-blue-700 text-sm">
                  <p>• Seja respeitoso com todos os membros da comunidade</p>
                  <p>• Não faça spam ou publique conteúdo irrelevante</p>
                  <p>• Use categorias apropriadas para seus tópicos</p>
                  <p>• Não compartilhe informações pessoais ou sensíveis</p>
                  <p>• Siga as diretrizes gerais do HabboHub</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Forum;