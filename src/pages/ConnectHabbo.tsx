
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { ConnectHabboForm } from '../components/ConnectHabboForm';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';

export default function ConnectHabbo() {
  const { user, habboAccount, loading } = useSupabaseAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user && habboAccount) {
      console.log('✅ Usuário já logado, redirecionando para home');
      navigate('/');
    }
  }, [user, habboAccount, loading, navigate]);

  // Debug timeout - se ficou muito tempo carregando, mostrar opções
  useEffect(() => {
    if (loading) {
      const debugTimeout = setTimeout(() => {
        console.log('⚠️ Loading demorou muito, mostrando opções de debug');
        setShowDebugInfo(true);
      }, 8000); // 8 segundos

      return () => clearTimeout(debugTimeout);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-repeat flex items-center justify-center" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-4">Carregando...</p>
          
          {showDebugInfo && (
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto">
              <h3 className="font-bold text-gray-800 mb-2">Problema de Carregamento</h3>
              <p className="text-sm text-gray-600 mb-4">
                O carregamento está demorando mais que o esperado. 
                Isso pode ser um problema temporário de sincronização.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Recarregar Página
                </button>
                <button
                  onClick={() => {
                    console.log('🔍 Estado atual:', { user, habboAccount, loading });
                    setShowDebugInfo(false);
                  }}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Tentar Novamente
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Debug: user={user ? 'OK' : 'null'}, habboAccount={habboAccount ? 'OK' : 'null'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const renderContent = () => (
    <div className="space-y-6">
      <ConnectHabboForm />
    </div>
  );

  if (isMobile) {
    return (
      <MobileLayout>
        {renderContent()}
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <div className="flex min-h-screen">
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <PageHeader 
            title="Conectar Habbo"
            icon="/assets/frank.png"
            backgroundImage="/assets/1360__-3C7.png"
          />
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 min-h-full">
            <div className="flex justify-center">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
