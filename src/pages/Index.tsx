
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { HomePage } from '../components/HomePage';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

const Index: React.FC = () => {
  const { isLoggedIn, loading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  // Mobile layout
  if (isMobile) {
    return (
      <MobileLayout>
        <div className="p-4">
          {!isLoggedIn && (
            <div className="text-center bg-white/90 p-6 rounded-lg shadow-lg mb-4">
              <h2 className="text-xl font-bold text-gray-800 volter-font mb-3">
                Bem-vindo ao Habbo Hub
              </h2>
              <p className="text-gray-600 mb-4 volter-font">
                Conecte sua conta Habbo para acessar recursos pessoais.
              </p>
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white volter-font"
              >
                Conectar Conta Habbo
              </Button>
            </div>
          )}
          <HomePage />
        </div>
      </MobileLayout>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <div className="flex min-h-screen">
        <CollapsibleSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className={`flex-1 p-4 md:p-8 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          {!isLoggedIn && (
            <div className="text-center bg-white/90 p-8 rounded-lg shadow-lg mb-8 max-w-md mx-auto">
              <h1 className="text-3xl font-bold text-gray-800 volter-font mb-4">
                Habbo Hub
              </h1>
              <p className="text-gray-600 mb-6 volter-font">
                Conecte sua conta Habbo para acessar recursos pessoais como perfil, comentários e posts.
              </p>
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white volter-font py-3"
              >
                Conectar Conta Habbo
              </Button>
            </div>
          )}
          <HomePage />
        </main>
      </div>
    </div>
  );
};

export default Index;
