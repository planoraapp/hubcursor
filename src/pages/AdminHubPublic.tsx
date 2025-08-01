
import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Users, Database, Activity, Lock } from 'lucide-react';
import { AdSpace } from '@/components/AdSpace';
import { PageHeader } from '@/components/PageHeader';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileLayout from '@/layouts/MobileLayout';
import { CollapsibleSidebar } from '@/components/CollapsibleSidebar';

const AdminHubPublic = () => {
  const isMobile = useIsMobile();
  const { user, habboAccount, loading } = useSupabaseAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    onlineUsers: 0,
    totalPosts: 0,
    adminActions: 0
  });

  const isAdmin = habboAccount?.is_admin || false;
  const isLoggedIn = !!user;

  useEffect(() => {
    // Simulate loading some basic public stats
    setStats({
      totalUsers: 1247,
      onlineUsers: 89,
      totalPosts: 3456,
      adminActions: isAdmin ? 127 : 0
    });
  }, [isAdmin]);

  const PublicStatsSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usuários Totais</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <p className="text-xs text-muted-foreground">
            Membros registrados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usuários Online</CardTitle>
          <Activity className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.onlineUsers}</div>
          <p className="text-xs text-muted-foreground">
            Conectados agora
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Posts no Fórum</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPosts}</div>
          <p className="text-xs text-muted-foreground">
            Discussões ativas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sistema</CardTitle>
          <Shield className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">Online</div>
          <p className="text-xs text-muted-foreground">
            Status operacional
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const AdminSection = () => {
    if (!isLoggedIn) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Área Administrativa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Para acessar funcionalidades administrativas, você precisa estar logado.
            </p>
            <Button variant="outline" onClick={() => window.location.href = '/connect-habbo'}>
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (!isAdmin) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Acesso Restrito
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline">Usuário: {habboAccount?.habbo_name}</Badge>
              <Badge variant="secondary">Nível: Membro</Badge>
            </div>
            <p className="text-muted-foreground">
              Esta área é restrita a administradores do sistema.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Painel Administrativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-green-600">Admin: {habboAccount?.habbo_name}</Badge>
              <Badge variant="outline">Ações: {stats.adminActions}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start">
                <Users className="w-4 h-4 mr-2" />
                Gerenciar Usuários
              </Button>
              <Button variant="outline" className="justify-start">
                <Database className="w-4 h-4 mr-2" />
                Logs do Sistema
              </Button>
              <Button variant="outline" className="justify-start">
                <Activity className="w-4 h-4 mr-2" />
                Monitoramento
              </Button>
              <Button variant="outline" className="justify-start">
                <Shield className="w-4 h-4 mr-2" />
                Configurações
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isMobile) {
    return (
      <MobileLayout>
        <div className="p-4">
          <PageHeader 
            title="Admin Hub"
            icon="/assets/ferramentas.png"
            backgroundImage="/assets/1360__-3C7.png"
          />
          <AdSpace type="horizontal" className="mb-6" />
          
          <PublicStatsSection />
          <AdminSection />
          
          <AdSpace type="wide" className="mt-6" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-repeat bg-cover" 
         style={{ 
           backgroundImage: 'url(/assets/bghabbohub.png)',
           margin: 0,
           padding: 0,
           width: '100vw',
           height: '100vh'
         }}>
      <div className="flex min-h-screen">
        <CollapsibleSidebar activeSection="admin" setActiveSection={() => {}} />
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="p-4 md:p-8">
            <PageHeader 
              title="Admin Hub"
              icon="/assets/ferramentas.png"
              backgroundImage="/assets/1360__-3C7.png"
            />
            
            <AdSpace type="horizontal" className="mb-6" />
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Carregando...</p>
              </div>
            ) : (
              <>
                <PublicStatsSection />
                <AdminSection />
              </>
            )}
            
            <AdSpace type="wide" className="mt-6" />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminHubPublic;
