
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { NewAppSidebar } from '@/components/NewAppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ProfileChecker } from '../components/ProfileChecker';

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();

  return (
    <SidebarProvider>
      <div 
        className="min-h-screen flex w-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}
      >
        <NewAppSidebar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto scrollbar-hide">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-4 volter-font drop-shadow-lg">
                Perfil de {username}
              </h1>
              <p className="text-lg text-white/90 volter-font drop-shadow">
                Visualizando informações públicas do usuário Habbo.
              </p>
            </div>
            
            <ProfileChecker />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Profile;
