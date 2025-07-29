
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { PageHeader } from '../components/PageHeader';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../integrations/supabase/client';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';

interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  adminUsers: string[];
}

export default function AdminHub() {
  const { user, habboAccount, loading } = useSupabaseAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState('admin-hub');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    adminUsers: []
  });

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

  // Check admin access and load stats
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (loading) return;

      if (!user || !habboAccount) {
        toast({
          title: "Acesso Negado",
          description: "Você precisa estar logado para acessar o painel admin.",
          variant: "destructive"
        });
        navigate('/connect-habbo');
        return;
      }

      if (!habboAccount.is_admin) {
        toast({
          title: "Acesso Negado", 
          description: "Você não tem permissões de administrador.",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      console.log('🔑 Admin access granted for:', habboAccount.habbo_name);
      loadAdminStats();
    };

    checkAdminAccess();
  }, [user, habboAccount, loading, navigate, toast]);

  const loadAdminStats = async () => {
    setIsLoadingStats(true);
    try {
      // Get total users
      const { count: usersCount, error: usersError } = await supabase
        .from('habbo_accounts')
        .select('*', { count: 'exact' });

      if (usersError) {
        console.error('Error counting users:', usersError);
      }

      // Get total posts
      const { count: postsCount, error: postsError } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact' });

      if (postsError) {
        console.error('Error counting posts:', postsError);
      }

      // Get total comments
      const { count: commentsCount, error: commentsError } = await supabase
        .from('forum_comments')
        .select('*', { count: 'exact' });

      if (commentsError) {
        console.error('Error counting comments:', commentsError);
      }

      // Get admin users
      const { data: adminData, error: adminError } = await supabase
        .from('habbo_accounts')
        .select('habbo_name')
        .eq('is_admin', true);

      if (adminError) {
        console.error('Error fetching admin users:', adminError);
      }

      setStats({
        totalUsers: usersCount || 0,
        totalPosts: postsCount || 0,
        totalComments: commentsCount || 0,
        adminUsers: adminData?.map(admin => admin.habbo_name) || []
      });

      toast({
        title: "Painel Carregado",
        description: "Estatísticas do Habbo Hub carregadas com sucesso!"
      });

    } catch (error) {
      console.error('Error loading admin stats:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar estatísticas do painel.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  const renderContent = () => {
    if (isLoadingStats) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando estatísticas...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6 border border-purple-200">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            🎉 Bem-vindo ao Painel Admin, {habboAccount?.habbo_name}!
          </h2>
          <p className="text-gray-600">
            Aqui você pode visualizar estatísticas e gerenciar o Habbo Hub.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl">👥</span>
              </div>
            </div>
          </div>

          {/* Total Posts */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Posts no Fórum</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalPosts}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">📝</span>
              </div>
            </div>
          </div>

          {/* Total Comments */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Comentários</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalComments}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-xl">💬</span>
              </div>
            </div>
          </div>

          {/* Admin Users */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Administradores</p>
                <p className="text-3xl font-bold text-red-600">{stats.adminUsers.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xl">👑</span>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Users List */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Lista de Administradores</h3>
          <div className="space-y-2">
            {stats.adminUsers.map((adminName, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-3">
                  <img
                    src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${adminName}&direction=2&head_direction=2&gesture=sml&size=s&action=std`}
                    alt={adminName}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-medium text-gray-800">{adminName}</span>
                </div>
                <span className="text-sm text-purple-600 font-medium">Admin</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/forum')}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md transition-colors"
            >
              <span>📋</span>
              <span>Gerenciar Fórum</span>
            </button>
            <button
              onClick={loadAdminStats}
              className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md transition-colors"
            >
              <span>🔄</span>
              <span>Atualizar Stats</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-md transition-colors"
            >
              <span>🏠</span>
              <span>Voltar ao Hub</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-repeat flex items-center justify-center" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-white">Verificando acesso admin...</p>
        </div>
      </div>
    );
  }

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
            title="Painel de Administração"
            icon="/assets/frank.png"
            backgroundImage="/assets/1360__-3C7.png"
          />
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 min-h-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
