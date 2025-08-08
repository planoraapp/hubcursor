import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '../components/PageHeader';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';
import { PostsList } from '../components/forum/PostsList';
import type { ForumPost } from '../types/forum';

interface ForumCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
}

const forumCategories: ForumCategory[] = [
  { id: 1, name: 'Geral', description: 'Discussões gerais sobre o Habbo e a comunidade.', icon: '💬' },
  { id: 2, name: 'Eventos', description: 'Anúncios e discussões sobre eventos no Habbo Hub.', icon: '🎉' },
  { id: 3, name: 'Suporte', description: 'Precisa de ajuda? Tire suas dúvidas aqui.', icon: '❓' },
  { id: 4, name: 'Off-Topic', description: 'Assuntos que não se encaixam nas outras categorias.', icon: '☕' },
];

const recentTopics = [
  { title: 'Novo evento de Natal!', author: 'User123', created_at: '2023-11-20T14:30:00' },
  { title: 'Dúvidas sobre o sistema de trocas', author: 'HabboGamer', created_at: '2023-11-19T18:00:00' },
  { title: 'Compartilhe suas dicas de construção', author: 'ArquitetoHabbo', created_at: '2023-11-18T21:45:00' },
];

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const Forum = () => {
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState('forum');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        // Mock data for demonstration - using ForumPost type
        const mockPosts: ForumPost[] = [
          { 
            id: '1', 
            title: 'Bem-vindos ao novo fórum!', 
            content: 'Este é o primeiro post do nosso novo fórum da comunidade Habbo Hub. Compartilhe suas ideias e sugestões!', 
            author_supabase_user_id: 'admin-id',
            author_habbo_name: 'Admin', 
            category: 'Geral', 
            created_at: '2023-11-21T10:00:00', 
            likes: 15 
          },
          { 
            id: '2', 
            title: 'Evento: Concurso de дизayna de quartos', 
            content: 'Participe do nosso concurso de design de quartos com tema natalino e concorra a prêmios incríveis!', 
            author_supabase_user_id: 'eventos-id',
            author_habbo_name: 'EventosHabbo', 
            category: 'Eventos', 
            created_at: '2023-11-20T16:45:00', 
            likes: 8 
          },
          { 
            id: '3', 
            title: 'Dúvidas frequentes sobre o Habbo Hub', 
            content: 'Confira a lista de dúvidas frequentes e encontre respostas para as suas perguntas sobre o Habbo Hub.', 
            author_supabase_user_id: 'suporte-id',
            author_habbo_name: 'SuporteHabbo', 
            category: 'Suporte', 
            created_at: '2023-11-19T09:20:00', 
            likes: 12 
          },
        ];
        setPosts(mockPosts);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar os posts.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    const handleSidebarStateChange = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    return () => {
      window.removeEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-repeat" 
           style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderDesktop = () => (
    <div className="min-h-screen bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <div className="flex min-h-screen">
        <CollapsibleSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className={`flex-1 p-4 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="max-w-6xl mx-auto">
            <PageHeader 
              title="Fórum da Comunidade"
              icon="/icons/forum.png"
            />

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <p className="text-red-700 volter-font">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Categories Section */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 rounded-t-lg border-2 border-black border-b-0">
                    <h2 className="text-xl volter-font text-white habbo-outline-sm font-bold">
                      📋 Categorias do Fórum
                    </h2>
                  </div>
                  <Card className="rounded-t-none border-2 border-black">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {forumCategories.map((category) => (
                          <div
                            key={category.id}
                            className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
                          >
                            <div className="text-2xl mr-3">{category.icon}</div>
                            <div>
                              <h3 className="volter-font font-bold text-blue-700">{category.name}</h3>
                              <p className="text-sm text-gray-600">{category.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <PostsList posts={posts} loading={loading} />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Recent Topics */}
                <div>
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-t-lg border-2 border-black border-b-0">
                    <h3 className="text-lg volter-font text-white habbo-outline-sm font-bold">
                      🔥 Tópicos Recentes
                    </h3>
                  </div>
                  <Card className="rounded-t-none border-2 border-black">
                    <CardContent className="p-4">
                      {recentTopics.length === 0 ? (
                        <p className="text-gray-500 text-center py-4 volter-font">
                          Nenhum tópico encontrado
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {recentTopics.map((topic, index) => (
                            <div key={index} className="pb-3 border-b border-gray-200 last:border-b-0">
                              <h4 className="volter-font font-medium text-blue-700 hover:text-blue-900 cursor-pointer text-sm">
                                {topic.title}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                por {topic.author} • {formatDate(topic.created_at)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Forum Stats */}
                <Card className="border-2 border-black">
                  <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white border-b-2 border-black">
                    <CardTitle className="text-lg volter-font habbo-outline-sm">📊 Estatísticas</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="volter-font text-gray-600">Total de Posts:</span>
                        <span className="volter-font font-bold">{posts.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="volter-font text-gray-600">Posts Hoje:</span>
                        <span className="volter-font font-bold">
                          {posts.filter(post => 
                            new Date(post.created_at).toDateString() === new Date().toDateString()
                          ).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="volter-font text-gray-600">Membros Ativos:</span>
                        <span className="volter-font font-bold">127</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );

  const renderMobile = () => (
    <MobileLayout>
      <div className="p-4">
        <PageHeader 
          title="Fórum da Comunidade"
          icon="/icons/forum.png"
        />

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <p className="text-red-700 volter-font">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Categories Section */}
          <div>
            <h2 className="text-xl volter-font font-bold mb-3">📋 Categorias do Fórum</h2>
            <div className="space-y-3">
              {forumCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="text-2xl mr-3">{category.icon}</div>
                  <div>
                    <h3 className="volter-font font-bold text-blue-700">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Posts Section */}
          <div>
            <h2 className="text-xl volter-font font-bold mb-3">📰 Tópicos Recentes</h2>
            <PostsList posts={posts} loading={loading} />
          </div>

          {/* Recent Topics */}
          <div>
            <h2 className="text-lg volter-font font-bold mb-3">🔥 Tópicos Recentes</h2>
            {recentTopics.length === 0 ? (
              <p className="text-gray-500 text-center py-4 volter-font">
                Nenhum tópico encontrado
              </p>
            ) : (
              <div className="space-y-3">
                {recentTopics.map((topic, index) => (
                  <div key={index} className="pb-3 border-b border-gray-200 last:border-b-0">
                    <h4 className="volter-font font-medium text-blue-700 hover:text-blue-900 cursor-pointer text-sm">
                      {topic.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      por {topic.author} • {formatDate(topic.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Forum Stats */}
          <div>
            <h2 className="text-lg volter-font font-bold mb-3">📊 Estatísticas</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="volter-font text-gray-600">Total de Posts:</span>
                <span className="volter-font font-bold">{posts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="volter-font text-gray-600">Posts Hoje:</span>
                <span className="volter-font font-bold">
                  {posts.filter(post => 
                    new Date(post.created_at).toDateString() === new Date().toDateString()
                  ).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="volter-font text-gray-600">Membros Ativos:</span>
                <span className="volter-font font-bold">127</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );

  return isMobile ? renderMobile() : renderDesktop();
};

export default Forum;
