
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { HomePage } from '../components/HomePage';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';
import { Button } from '@/components/ui/button';

const Index: React.FC = () => {
  const { isLoggedIn, loading, habboAccount } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-repeat"
           style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
        <div className="text-lg volter-font text-white">Carregando...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-repeat bg-cover flex flex-col items-center justify-center p-4"
           style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
        <div className="text-center bg-white/90 p-8 rounded-lg shadow-lg max-w-md">
          <h1 className="text-3xl font-bold text-gray-800 volter-font mb-4">
            Habbo Hub
          </h1>
          <p className="text-gray-600 mb-6 volter-font">
            Conecte sua conta Habbo para acessar todas as funcionalidades.
          </p>
          <Button
            onClick={() => navigate('/login')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white volter-font py-3"
          >
            Conectar Conta Habbo
          </Button>
        </div>
      </div>
    );
  }

  // Se estiver logado, mostrar a página principal
  const renderContent = () => <HomePage />;

  if (isMobile) {
    return (
      <MobileLayout>
        {renderContent()}
      </MobileLayout>
    );
  }

  return renderContent();
};

export default Index;
