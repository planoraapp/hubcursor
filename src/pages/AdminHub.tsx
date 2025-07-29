
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { PageHeader } from '../components/PageHeader';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { Users, MessageSquare, Shield, Activity, TrendingUp, Database } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';

interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  recentActivity: Array<{
    id: string;
    type: 'post' | 'comment' | 'user';
    description: string;
    timestamp: string;
  }>;
}

export default function AdminHub() {
  const { isLoggedIn, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('adminhub');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Handle sidebar state changes
  useEffect(() => {
    const handleSidebarStateChange = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    return () => {
      window.removeEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/connect-habbo');
      return;
    }

    if (!isAdmin()) {
      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão para acessar esta página.",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    fetchAdminStats();
  }, [isLoggedIn, isAdmin, navigate, toast]);

  const fetchAdminStats = async () => {
    setLoading(true);
    try {
      // Fetch user count
      const { count: userCount } = await supabase
        .from('habbo_accounts')
        .select('*', { count: 'exact', head: true });

      // Fetch post count
      const { count: postCount } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true });

      // Fetch comment count
      const { count: commentCount } = await supabase
        .from('forum_comments')
        .select('*', { count: 'exact', head: true });

      // Fetch recent activity
      const { data: recentPosts } = await supabase
        .from('forum_posts')
        .select('id, title, author_habbo_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: recentComments } = await supabase
        .from('forum_comments')
        .select('id, content, author_habbo_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: recentUsers } = await supabase
        .from('habbo_accounts')
        .select('id, habbo_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      // Combine and sort activity
      const activity = [
        ...(recentPosts || []).map(post => ({
          id: post.id,
          type: 'post' as const,
          description: `${post.author_habbo_name} criou o post "${post.title}"`,
          timestamp: post.created_at
        })),
        ...(recentComments || []).map(comment => ({
          id: comment.id,
          type: 'comment' as const,
          description: `${comment.author_habbo_name} comentou: "${comment.content.substring(0, 50)}..."`,
          timestamp: comment.created_at
        })),
        ...(recentUsers || []).map(user => ({
          id: user.id,
          type: 'user' as const,
          description: `${user.habbo_name} se conectou ao Habbo Hub`,
          timestamp: user.created_at
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

      setStats({
        totalUsers: userCount || 0,
        totalPosts: postCount || 0,
        totalComments: commentCount || 0,
        recentActivity: activity
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar estatísticas do admin.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'user':
        return <Users className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderContent = () => (
    <div className="space-y-6">
      {/* Admin Welcome */}
      <div className="bg-white border border-gray-900 rounded-lg shadow-md">
        <div className="bg-gradient-to-r from-red-500 to-purple-600 px-6 py-4 rounded-t-lg">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white volter-font">Painel Administrativo</h2>
              <p className="text-white/80">Bem-vindo ao centro de controle do Habbo Hub</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total de Usuários</p>
                    <p className="text-2xl font-bold text-blue-800 volter-font">{stats.totalUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-green-600 font-medium">Posts do Fórum</p>
                    <p className="text-2xl font-bold text-green-800 volter-font">{stats.totalPosts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Comentários</p>
                    <p className="text-2xl font-bold text-purple-800 volter-font">{stats.totalComments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-900 rounded-lg shadow-md">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 rounded-t-lg">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-white" />
            <h3 className="text-xl font-bold text-white volter-font">Atividade Recente</h3>
          </div>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Carregando atividades...</p>
            </div>
          ) : stats.recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma atividade recente encontrada.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Admin Actions */}
      <div className="bg-white border border-gray-900 rounded-lg shadow-md">
        <div className="bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-4 rounded-t-lg">
          <div className="flex items-center gap-3">
            <Database className="h-6 w-6 text-white" />
            <h3 className="text-xl font-bold text-white volter-font">Ações Administrativas</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => navigate('/forum')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white volter-font"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Gerenciar Fórum
            </Button>
            <Button
              onClick={fetchAdminStats}
              className="w-full bg-green-600 hover:bg-green-700 text-white volter-font"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Atualizar Estatísticas
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <MobileLayout>
        {renderContent()}
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <div className="flex min-h-screen">
        <CollapsibleSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className={`flex-1 p-4 md:p-8 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <PageHeader 
            title="Painel Admin"
            icon="/assets/Hmenu.png"
            backgroundImage="/assets/1360__-3C7.png"
          />
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 min-h-full border border-gray-900">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
