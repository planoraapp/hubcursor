
import { useState, useEffect } from 'react';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';
import { supabase } from '../lib/supabaseClient';

interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  onlineUsers: number;
}

export default function AdminPanelPage() {
  const [activeSection, setActiveSection] = useState('adminhub');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    onlineUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const { isAdmin, habboAccount } = useAuth();
  const isMobile = useIsMobile();

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
    const checkAdminAccess = async () => {
      setLoading(true);
      
      if (!isAdmin()) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      try {
        // Fetch statistics
        const [usersResult, postsResult, commentsResult] = await Promise.all([
          supabase.from('habbo_accounts').select('id', { count: 'exact' }),
          supabase.from('forum_posts').select('id', { count: 'exact' }),
          supabase.from('forum_comments').select('id', { count: 'exact' })
        ]);

        setStats({
          totalUsers: usersResult.count || 0,
          totalPosts: postsResult.count || 0,
          totalComments: commentsResult.count || 0,
          onlineUsers: 0 // This would require real-time tracking
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      }

      setLoading(false);
    };

    checkAdminAccess();
  }, [isAdmin, habboAccount]);

  const renderContent = () => {
    if (accessDenied) {
      return (
        <div className="bg-white border border-gray-900 rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4 volter-font">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">
            Você não tem permissões de administrador para acessar esta área.
          </p>
          <p className="text-sm text-gray-500">
            Apenas o usuário "habbohub" tem acesso ao painel administrativo.
          </p>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="bg-white border border-gray-900 rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">Carregando estatísticas...</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Welcome Message */}
        <div className="bg-white border border-gray-900 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 volter-font">
            Bem-vindo, {habboAccount?.habbo_name}!
          </h2>
          <p className="text-gray-600">
            Painel de administração do Habbo Hub. Aqui você pode monitorar as atividades do sistema.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-900 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 volter-font">{stats.totalUsers}</h3>
                <p className="text-gray-600">Usuários Registrados</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-900 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 volter-font">{stats.totalPosts}</h3>
                <p className="text-gray-600">Posts do Fórum</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-900 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 volter-font">{stats.totalComments}</h3>
                <p className="text-gray-600">Comentários</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-900 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 volter-font">{stats.onlineUsers}</h3>
                <p className="text-gray-600">Usuários Online</p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="bg-white border border-gray-900 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 volter-font">Ações Administrativas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors volter-font">
              Gerenciar Usuários
            </button>
            <button className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors volter-font">
              Moderar Fórum
            </button>
            <button className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors volter-font">
              Ver Logs do Sistema
            </button>
            <button className="p-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors volter-font">
              Configurações
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-gray-900 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 volter-font">Atividade Recente</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Sistema inicializado</span>
              <span className="text-sm text-gray-500">Agora</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Estatísticas atualizadas</span>
              <span className="text-sm text-gray-500">Há 5 minutos</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isMobile) {
    return (
      <MobileLayout>
        <div className="p-4">
          <PageHeader 
            title="Painel Administrativo"
            icon="/assets/settings.png"
            backgroundImage="/assets/1360__-3C7.png"
          />
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 min-h-full border border-gray-900">
            {renderContent()}
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <div className="flex min-h-screen">
        <CollapsibleSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className={`flex-1 p-4 md:p-8 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <PageHeader 
            title="Painel Administrativo"
            icon="/assets/settings.png"
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
