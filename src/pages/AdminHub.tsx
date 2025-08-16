
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FileText, 
  Settings, 
  BarChart3, 
  Shield,
  Newspaper
} from 'lucide-react';
import { JournalManagement } from '@/components/admin/JournalManagement';

export const AdminHub = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const renderSection = () => {
    switch (activeSection) {
      case 'journal':
        return <JournalManagement />;
      case 'overview':
      default:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <p className="text-xs text-muted-foreground">+20.1% do mês passado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Artigos Pendentes</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">Aguardando moderação</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Edições Publicadas</CardTitle>
                  <Newspaper className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45</div>
                  <p className="text-xs text-muted-foreground">Journal Hub</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Interações</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8,932</div>
                  <p className="text-xs text-muted-foreground">Likes e comentários</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Bem-vindo ao Admin Hub</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Central de administração do Habbo Hub. Use o menu lateral para navegar entre as diferentes seções.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => setActiveSection('journal')}
                    className="flex items-center gap-2 h-auto p-4"
                    variant="outline"
                  >
                    <Newspaper className="w-6 h-6" />
                    <div className="text-left">
                      <div className="font-semibold">Journal Hub</div>
                      <div className="text-sm text-muted-foreground">Gerencie artigos e edições</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r border-border p-4">
          <div className="mb-6">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Admin Hub
            </h1>
          </div>
          
          <nav className="space-y-2">
            <Button
              variant={activeSection === 'overview' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveSection('overview')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Visão Geral
            </Button>
            
            <Button
              variant={activeSection === 'journal' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveSection('journal')}
            >
              <Newspaper className="w-4 h-4 mr-2" />
              Journal Hub
            </Button>
            
            <Button
              variant={activeSection === 'users' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveSection('users')}
            >
              <Users className="w-4 h-4 mr-2" />
              Usuários
            </Button>
            
            <Button
              variant={activeSection === 'settings' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveSection('settings')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {renderSection()}
        </div>
      </div>
    </div>
  );
};
