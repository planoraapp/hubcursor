
import React from 'react';
import { useParams } from 'react-router-dom';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { habboAccount } = useUnifiedAuth();
  
  const displayName = username || habboAccount?.habbo_name || 'Usuário';

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CollapsibleAppSidebar />
        <SidebarInset className="flex-1">
          <main className="flex-1 p-8 min-h-screen" style={{ 
            backgroundImage: 'url(/assets/bghabbohub.png)',
            backgroundRepeat: 'repeat'
          }}>
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <User className="w-8 h-8 text-white" />
                  <h1 className="text-4xl font-bold text-white volter-font"
                      style={{
                        textShadow: '2px 2px 0px black, -2px -2px 0px black, 2px -2px 0px black, -2px 2px 0px black'
                      }}>
                    👤 Perfil de {displayName}
                  </h1>
                </div>
                <p className="text-lg text-white/90 volter-font drop-shadow">
                  Visualizando informações do perfil
                </p>
              </div>
              
              <Card className="p-8 text-center bg-white/90 backdrop-blur-sm border-2 border-black">
                <CardHeader>
                  <CardTitle className="volter-font text-2xl text-gray-900">Perfil em desenvolvimento...</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 volter-font">
                    Sistema de perfis em desenvolvimento. Em breve você poderá ver informações detalhadas dos usuários!
                  </p>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Profile;
