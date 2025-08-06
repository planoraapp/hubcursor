import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '../hooks/useAuth';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { PageHeader } from '../components/PageHeader';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';

const AdminHubPublic = () => {
  const { user, habboAccount, loading, isLoggedIn, isAdmin } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-repeat"
           style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
        <div className="text-lg volter-font text-white">Carregando...</div>
      </div>
    );
  }

  if (!isLoggedIn || !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-repeat"
           style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Você não tem permissão para acessar esta página.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isMobile) {
    return (
      <MobileLayout>
        <div className="p-4">
          <PageHeader
            title="Admin Hub"
            icon="/assets/admin.png"
          />
          <Card>
            <CardHeader>
              <CardTitle>Bem-vindo, Administrador!</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Esta é a área administrativa do Habbo Hub.</p>
            </CardContent>
          </Card>
        </div>
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <div className="flex min-h-screen">
        <CollapsibleSidebar activeSection="admin-hub-public" setActiveSection={() => {}} />
        <main className={`flex-1 p-4 md:p-8 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <PageHeader
            title="Admin Hub"
            icon="/assets/admin.png"
          />
          <Card>
            <CardHeader>
              <CardTitle>Bem-vindo, Administrador!</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Esta é a área administrativa do Habbo Hub.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default AdminHubPublic;
