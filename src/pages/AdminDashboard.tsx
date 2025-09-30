import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Home, 
  Shield, 
  Activity, 
  Settings, 
  Database,
  RefreshCw,
  UserPlus,
  Globe,
  Heart,
  MessageSquare,
  Camera,
  TrendingUp,
  BarChart3,
  FileText,
  Palette,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { createHabbohubAccountDirect } from '@/utils/createHabbohubAccountDirect';
import { initializeAllMissingHomes } from '@/utils/initializeUserHome';
import { useNavigate } from 'react-router-dom';
import { AnimationGenerator } from '@/components/AnimationGenerator';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import HabboFontsDemo from '@/components/HabboFontsDemo';

interface AdminStats {
  totalUsers: number;
  totalHomes: number;
  totalBadges: number;
  activeUsers: number;
  totalLikes: number;
  totalComments: number;
  totalPhotos: number;
  visitsToday: number;
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalHomes: 0,
    totalBadges: 0,
    activeUsers: 0,
    totalLikes: 0,
    totalComments: 0,
    totalPhotos: 0,
    visitsToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAnimationGenerator, setShowAnimationGenerator] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Carregar estatísticas em paralelo
      const [
        usersResult,
        homesResult,
        badgesResult,
        likesResult,
        commentsResult,
        photosResult,
        visitsResult
      ] = await Promise.all([
        supabase.from('habbo_accounts').select('*', { count: 'exact', head: true }),
        supabase.from('user_homes').select('*', { count: 'exact', head: true }),
        supabase.from('user_badges').select('*', { count: 'exact', head: true }),
        supabase.from('home_likes').select('*', { count: 'exact', head: true }),
        supabase.from('home_comments').select('*', { count: 'exact', head: true }),
        supabase.from('home_photos').select('*', { count: 'exact', head: true }),
        supabase.from('home_visits').select('*', { count: 'exact', head: true })
          .gte('visited_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
      ]);

      const totalUsers = usersResult.count || 0;
      const totalHomes = homesResult.count || 0;
      const totalBadges = badgesResult.count || 0;
      const totalLikes = likesResult.count || 0;
      const totalComments = commentsResult.count || 0;
      const totalPhotos = photosResult.count || 0;
      const visitsToday = visitsResult.count || 0;

      // Usuários ativos (logados nas últimas 24 horas)
      const { count: activeUsers } = await supabase
        .from('habbo_accounts')
        .select('*', { count: 'exact', head: true })
        .gte('last_seen_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      setStats({
        totalUsers,
        totalHomes,
        totalBadges,
        activeUsers: activeUsers || 0,
        totalLikes,
        totalComments,
        totalPhotos,
        visitsToday: visitsToday || 0
      });
    } catch (error) {
          } finally {
      setLoading(false);
    }
  };

  const createHabbohubAccountHandler = async () => {
    try {
      const result = await createHabbohubAccountDirect();
      if (result.success) {
        alert('Conta habbohub criada com sucesso!');
        await loadStats(); // Recarregar estatísticas
      } else {
        alert(`Erro ao criar conta habbohub: ${result.message}`);
      }
    } catch (error) {
            alert('Erro ao criar conta habbohub');
    }
  };

  const refreshStats = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const initializeHomesHandler = async () => {
    try {
      await initializeAllMissingHomes();
      alert('Homes inicializadas com sucesso!');
      await loadStats();
    } catch (error) {
            alert('Erro ao inicializar homes');
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <CollapsibleAppSidebar />
          <SidebarInset>
            <div 
              className="flex items-center justify-center min-h-screen"
              style={{ 
                backgroundImage: 'url(/assets/bghabbohub.png)',
                backgroundRepeat: 'repeat',
                backgroundSize: 'auto'
              }}
            >
              <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-gray-700 volter-font">Carregando dashboard...</span>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CollapsibleAppSidebar />
        <SidebarInset>
          <main 
            className="flex-1 p-4 md:p-8 overflow-y-auto scrollbar-hide min-h-screen"
            style={{ 
              backgroundImage: 'url(/assets/bghabbohub.png)',
              backgroundRepeat: 'repeat',
              backgroundSize: 'auto'
            }}
          >
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white volter-font drop-shadow-lg">
                    🛡️ Painel Administrativo
                  </h1>
                  <p className="text-white/90 mt-2 volter-font drop-shadow">
                    Dashboard do sistema HabboHub
                  </p>
                </div>
                
                <Button
                  onClick={refreshStats}
                  disabled={refreshing}
                  variant="outline"
                  className="flex items-center gap-2 bg-white/90 backdrop-blur-sm hover:bg-white/95"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>

              {/* Estatísticas principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white/90 backdrop-blur-sm border-2 border-black shadow-xl">
                  <CardContent className="flex items-center p-6">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 volter-font">Total de Usuários</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-sm border-2 border-black shadow-xl">
                  <CardContent className="flex items-center p-6">
                    <Home className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 volter-font">Homes Criadas</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalHomes}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-sm border-2 border-black shadow-xl">
                  <CardContent className="flex items-center p-6">
                    <Activity className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 volter-font">Usuários Ativos</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-sm border-2 border-black shadow-xl">
                  <CardContent className="flex items-center p-6">
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 volter-font">Visitas Hoje</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.visitsToday}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Estatísticas de engajamento */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white/90 backdrop-blur-sm border-2 border-black shadow-xl">
                  <CardContent className="flex items-center p-6">
                    <Heart className="h-8 w-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 volter-font">Total de Likes</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalLikes}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-sm border-2 border-black shadow-xl">
                  <CardContent className="flex items-center p-6">
                    <MessageSquare className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 volter-font">Comentários</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalComments}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-sm border-2 border-black shadow-xl">
                  <CardContent className="flex items-center p-6">
                    <Camera className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 volter-font">Fotos</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalPhotos}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Fontes Oficiais do Habbo e Dados dos Usuários */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Box de Fontes */}
                <HabboFontsDemo />
                
                {/* Box de Dados dos Usuários */}
                <Card className="bg-white/90 backdrop-blur-sm border-2 border-black shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 volter-font">
                      <Users className="w-5 h-5" />
                      Dados dos Usuários
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Gráfico de Barras - Usuários por Status */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 volter-font">Usuários por Status</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 volter-font">Online</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{width: `${(stats.activeUsers / Math.max(stats.totalUsers, 1)) * 100}%`}}></div>
                            </div>
                            <span className="text-xs font-bold text-gray-800 volter-font">{stats.activeUsers}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 volter-font">Offline</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div className="bg-gray-500 h-2 rounded-full" style={{width: `${((stats.totalUsers - stats.activeUsers) / Math.max(stats.totalUsers, 1)) * 100}%`}}></div>
                            </div>
                            <span className="text-xs font-bold text-gray-800 volter-font">{stats.totalUsers - stats.activeUsers}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Gráfico de Barras - Engajamento */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 volter-font">Engajamento</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 volter-font">Likes</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div className="bg-red-500 h-2 rounded-full" style={{width: `${Math.min((stats.totalLikes / Math.max(stats.totalUsers, 1)) * 20, 100)}%`}}></div>
                            </div>
                            <span className="text-xs font-bold text-gray-800 volter-font">{stats.totalLikes}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 volter-font">Comentários</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full" style={{width: `${Math.min((stats.totalComments / Math.max(stats.totalUsers, 1)) * 20, 100)}%`}}></div>
                            </div>
                            <span className="text-xs font-bold text-gray-800 volter-font">{stats.totalComments}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 volter-font">Fotos</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div className="bg-purple-500 h-2 rounded-full" style={{width: `${Math.min((stats.totalPhotos / Math.max(stats.totalUsers, 1)) * 20, 100)}%`}}></div>
                            </div>
                            <span className="text-xs font-bold text-gray-800 volter-font">{stats.totalPhotos}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="pt-2 border-t border-gray-200">
                      <Button
                        onClick={() => navigate('/admin/accounts')}
                        variant="outline"
                        className="w-full volter-font text-xs"
                      >
                        👥 Ver Detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Ações administrativas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                <Card className="bg-white/90 backdrop-blur-sm border-2 border-black shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 volter-font">
                      <Database className="w-5 h-5" />
                      Sistema
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      onClick={() => navigate('/admin/database')}
                      variant="outline"
                      className="w-full volter-font"
                    >
                      🗄️ Banco de Dados
                    </Button>
                    <Button
                      onClick={() => navigate('/admin/settings')}
                      variant="outline"
                      className="w-full volter-font"
                    >
                      ⚙️ Configurações
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-sm border-2 border-black shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 volter-font">
                      <Zap className="w-5 h-5" />
                      Ferramentas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      onClick={() => setShowAnimationGenerator(!showAnimationGenerator)}
                      variant="outline"
                      className="w-full volter-font"
                    >
                      🎬 Gerador de Animações
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Gerador de Animações */}
              {showAnimationGenerator && (
                <div className="mt-8">
                  <Card className="bg-white/90 backdrop-blur-sm border-2 border-black shadow-xl">
                    <CardHeader>
                      <CardTitle className="volter-font">🎬 Gerador de Animações</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AnimationGenerator />
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Badge de sistema */}
              <div className="flex justify-center">
                <Badge variant="secondary" className="px-4 py-2 bg-white/90 backdrop-blur-sm border-2 border-black">
                  <Shield className="w-4 h-4 mr-2" />
                  Sistema HabboHub v2.0
                </Badge>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;