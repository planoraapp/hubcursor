import React, { useState, useEffect } from 'react';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Eye, 
  Calendar,
  User,
  Database,
  Activity,
  TrendingUp,
  Clock,
  Globe,
  Shield,
  Settings,
  BarChart3,
  FileText,
  Palette
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { createHabbohubAccount } from '@/utils/createHabbohubAccount';
import { initializeAllMissingHomes } from '@/utils/initializeUserHome';

interface AdminStats {
  totalUsers: number;
  totalHomes: number;
  totalVisits: number;
  onlineUsers: number;
  newUsersToday: number;
  visitsToday: number;
}

interface FontPreview {
  name: string;
  className: string;
  description: string;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalHomes: 0,
    totalVisits: 0,
    onlineUsers: 0,
    newUsersToday: 0,
    visitsToday: 0
  });
  const [loading, setLoading] = useState(true);

  // Fontes disponíveis para preview
  const fontPreviews: FontPreview[] = [
    {
      name: 'Volter Goldfish',
      className: 'volter-font',
      description: 'Fonte principal do Habbo'
    },
    {
      name: 'Habbo Ubuntu',
      className: 'habbo-ubuntu-font',
      description: 'Fonte Ubuntu oficial do Habbo'
    },
    {
      name: 'Habbo Ubuntu Condensed',
      className: 'habbo-ubuntu-condensed-font',
      description: 'Fonte Ubuntu Condensed oficial do Habbo'
    },
    {
      name: 'Habbo Volter',
      className: 'habbo-volter-font',
      description: 'Fonte Volter oficial do Habbo'
    },
    {
      name: 'Habbo Volter 9px',
      className: 'habbo-volter-font-9px',
      description: 'Fonte Volter 9px oficial do Habbo'
    },
    {
      name: 'Habbo Volter 18px',
      className: 'habbo-volter-font-18px',
      description: 'Fonte Volter 18px oficial do Habbo'
    }
  ];

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    try {
      setLoading(true);

      // Carregar estatísticas do banco de dados
      const [
        { count: totalUsers },
        { count: totalHomes },
        { count: totalVisits },
        { count: onlineUsers }
      ] = await Promise.all([
        supabase.from('habbo_accounts').select('*', { count: 'exact', head: true }),
        supabase.from('user_home_backgrounds').select('*', { count: 'exact', head: true }),
        supabase.from('home_visits').select('*', { count: 'exact', head: true }),
        supabase.from('habbo_accounts').select('*', { count: 'exact', head: true }).eq('is_online', true)
      ]);

      // Calcular novos usuários hoje
      const today = new Date().toISOString().split('T')[0];
      const { count: newUsersToday } = await supabase
        .from('habbo_accounts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${today}T00:00:00.000Z`);

      // Calcular visitas hoje
      const { count: visitsToday } = await supabase
        .from('home_visits')
        .select('*', { count: 'exact', head: true })
        .gte('visited_at', `${today}T00:00:00.000Z`);

      setStats({
        totalUsers: totalUsers || 0,
        totalHomes: totalHomes || 0,
        totalVisits: totalVisits || 0,
        onlineUsers: onlineUsers || 0,
        newUsersToday: newUsersToday || 0,
        visitsToday: visitsToday || 0
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const createHabbohubAccountHandler = async () => {
    try {
      await createHabbohubAccount();
      alert('Conta habbohub criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar conta habbohub:', error);
      alert('Erro ao criar conta habbohub');
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CollapsibleAppSidebar />
        <SidebarInset className="flex-1">
          <main className="flex-1 p-8 bg-repeat min-h-screen" 
                style={{ 
                  backgroundImage: 'url(/assets/bghabbohub.png)',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundSize: 'cover'
                }}>
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white volter-font mb-2" 
                    style={{ textShadow: '2px 2px 0px black, -2px -2px 0px black, 2px -2px 0px black, -2px 2px 0px black' }}>
                  🛡️ Painel de Administração
                </h1>
                <p className="text-white volter-font" 
                   style={{ textShadow: '1px 1px 0px black' }}>
                  Gerencie o HabboHub e monitore as estatísticas
                </p>
              </div>

              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">📊 Visão Geral</TabsTrigger>
                  <TabsTrigger value="users">👥 Usuários</TabsTrigger>
                  <TabsTrigger value="tools">🔧 Ferramentas</TabsTrigger>
                  <TabsTrigger value="fonts">🎨 Fontes</TabsTrigger>
                </TabsList>

                {/* Visão Geral */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Estatísticas principais */}
                    <Card className="bg-white/95 backdrop-blur-sm border-2 border-black">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium volter-font">Total de Usuários</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold volter-font">{stats.totalUsers}</div>
                        <p className="text-xs text-muted-foreground volter-font">
                          +{stats.newUsersToday} hoje
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/95 backdrop-blur-sm border-2 border-black">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium volter-font">Casas Criadas</CardTitle>
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold volter-font">{stats.totalHomes}</div>
                        <p className="text-xs text-muted-foreground volter-font">
                          Casas ativas
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/95 backdrop-blur-sm border-2 border-black">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium volter-font">Total de Visitas</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold volter-font">{stats.totalVisits}</div>
                        <p className="text-xs text-muted-foreground volter-font">
                          +{stats.visitsToday} hoje
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/95 backdrop-blur-sm border-2 border-black">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium volter-font">Usuários Online</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold volter-font">{stats.onlineUsers}</div>
                        <p className="text-xs text-muted-foreground volter-font">
                          Ativos agora
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Usuários */}
                <TabsContent value="users" className="space-y-6">
                  <Card className="bg-white/95 backdrop-blur-sm border-2 border-black">
                    <CardHeader>
                      <CardTitle className="volter-font">👥 Gerenciamento de Usuários</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <h3 className="font-bold volter-font mb-2">Contas de Teste</h3>
                          <p className="text-sm text-gray-600 volter-font mb-3">
                            Criar contas de administrador para testes
                          </p>
                          <Button 
                            onClick={createHabbohubAccountHandler}
                            className="w-full volter-font"
                          >
                            🧪 Criar Conta habbohub
                          </Button>
                        </div>
                        
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <h3 className="font-bold volter-font mb-2">Estatísticas de Usuários</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="volter-font">Total:</span>
                              <Badge variant="secondary">{stats.totalUsers}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="volter-font">Online:</span>
                              <Badge variant="default">{stats.onlineUsers}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="volter-font">Novos hoje:</span>
                              <Badge variant="outline">{stats.newUsersToday}</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Ferramentas */}
                <TabsContent value="tools" className="space-y-6">
                  <Card className="bg-white/95 backdrop-blur-sm border-2 border-black">
                    <CardHeader>
                      <CardTitle className="volter-font">🔧 Ferramentas de Administração</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <h3 className="font-bold volter-font mb-2">🔄 Atualizar Estatísticas</h3>
                          <p className="text-sm text-gray-600 volter-font mb-3">
                            Recarregar dados do banco
                          </p>
                          <Button 
                            onClick={loadAdminStats}
                            disabled={loading}
                            className="w-full volter-font"
                          >
                            {loading ? 'Carregando...' : 'Atualizar'}
                          </Button>
                        </div>

                        <div className="p-4 border border-gray-200 rounded-lg">
                          <h3 className="font-bold volter-font mb-2">🏠 Inicializar Homes</h3>
                          <p className="text-sm text-gray-600 volter-font mb-3">
                            Criar homes para usuários que não têm
                          </p>
                          <Button 
                            onClick={async () => {
                              setLoading(true);
                              try {
                                await initializeAllMissingHomes();
                                toast({
                                  title: "Sucesso!",
                                  description: "Homes inicializadas com sucesso!",
                                });
                                loadAdminStats();
                              } catch (error) {
                                toast({
                                  title: "Erro",
                                  description: "Erro ao inicializar homes",
                                  variant: "destructive"
                                });
                              } finally {
                                setLoading(false);
                              }
                            }}
                            disabled={loading}
                            className="w-full volter-font"
                          >
                            {loading ? 'Inicializando...' : 'Inicializar Homes'}
                          </Button>
                        </div>

                        <div className="p-4 border border-gray-200 rounded-lg">
                          <h3 className="font-bold volter-font mb-2">📊 Relatórios</h3>
                          <p className="text-sm text-gray-600 volter-font mb-3">
                            Gerar relatórios de uso
                          </p>
                          <Button 
                            variant="outline"
                            className="w-full volter-font"
                          >
                            Gerar Relatório
                          </Button>
                        </div>

                        <div className="p-4 border border-gray-200 rounded-lg">
                          <h3 className="font-bold volter-font mb-2">⚙️ Configurações</h3>
                          <p className="text-sm text-gray-600 volter-font mb-3">
                            Configurações do sistema
                          </p>
                          <Button 
                            variant="outline"
                            className="w-full volter-font"
                          >
                            Configurar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Fontes */}
                <TabsContent value="fonts" className="space-y-6">
                  <Card className="bg-white/95 backdrop-blur-sm border-2 border-black">
                    <CardHeader>
                      <CardTitle className="volter-font">🎨 Preview das Fontes Oficiais do Habbo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {fontPreviews.map((font, index) => (
                          <div key={index} className="p-4 border border-gray-200 rounded-lg">
                            <h3 className="font-bold volter-font mb-2">{font.name}</h3>
                            <p className="text-sm text-gray-600 volter-font mb-3">{font.description}</p>
                            <div className="space-y-2">
                              <div className={`${font.className} text-lg`}>
                                The quick brown fox jumps over the lazy dog
                              </div>
                              <div className={`${font.className} text-sm`}>
                                ABCDEFGHIJKLMNOPQRSTUVWXYZ
                              </div>
                              <div className={`${font.className} text-sm`}>
                                0123456789 !@#$%^&*()
                              </div>
                              <div className={`${font.className} text-sm`}>
                                HabboHub - Portal do Habbo
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
