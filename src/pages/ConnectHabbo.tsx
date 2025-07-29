
import { useEffect } from 'react';
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

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user && habboAccount) {
      navigate('/');
    }
  }, [user, habboAccount, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-repeat flex items-center justify-center" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
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
