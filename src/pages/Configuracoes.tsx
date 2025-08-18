
import React from 'react';
import { NewAppSidebar } from '@/components/NewAppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, User, Bell, Shield, Palette } from 'lucide-react';

const Configuracoes = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-slate-100">
        <NewAppSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4 volter-font">
                ⚙️ Configurações
              </h1>
              <p className="text-lg text-gray-600 volter-font">
                Personalize sua experiência no HabboHub
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 volter-font">
                    <User className="w-5 h-5 text-blue-600" />
                    Perfil
                  </CardTitle>
                  <CardDescription>Gerencie suas informações pessoais</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 volter-font">Em breve disponível!</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 volter-font">
                    <Bell className="w-5 h-5 text-green-600" />
                    Notificações
                  </CardTitle>
                  <CardDescription>Configure suas preferências de notificação</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 volter-font">Em breve disponível!</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 volter-font">
                    <Shield className="w-5 h-5 text-red-600" />
                    Privacidade
                  </CardTitle>
                  <CardDescription>Controle sua privacidade e segurança</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 volter-font">Em breve disponível!</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 volter-font">
                    <Palette className="w-5 h-5 text-purple-600" />
                    Aparência
                  </CardTitle>
                  <CardDescription>Personalize a aparência do site</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 volter-font">Em breve disponível!</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Configuracoes;
