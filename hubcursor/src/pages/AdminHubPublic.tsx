
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NewAppSidebar } from '@/components/NewAppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '../hooks/useAuth';

const AdminHubPublic = () => {
  const { user, habboAccount, loading, isLoggedIn, isAdmin } = useAuth();

  if (loading) {
    return (
      <SidebarProvider>
        <div 
          className="min-h-screen flex w-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}
        >
          <NewAppSidebar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-lg volter-font text-white">Carregando...</div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  if (!isLoggedIn || !isAdmin()) {
    return (
      <SidebarProvider>
        <div 
          className="min-h-screen flex w-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}
        >
          <NewAppSidebar />
          <main className="flex-1 flex items-center justify-center">
            <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border-2 border-black">
              <CardHeader>
                <CardTitle className="volter-font">Acesso Negado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="volter-font">Você não tem permissão para acessar esta página.</p>
              </CardContent>
            </Card>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div 
        className="min-h-screen flex w-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}
      >
        <NewAppSidebar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto scrollbar-hide">
          <Card className="bg-white/90 backdrop-blur-sm border-2 border-black">
            <CardHeader>
              <CardTitle className="volter-font">Bem-vindo, Administrador!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="volter-font">Esta é a área administrativa do Habbo Hub.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminHubPublic;
