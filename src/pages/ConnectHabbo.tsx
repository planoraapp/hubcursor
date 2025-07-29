
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { ConnectHabboForm } from '../components/ConnectHabboForm';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';

export default function ConnectHabbo() {
  const { user, habboAccount, loading } = useSupabaseAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [forceShowForm, setForceShowForm] = useState(false);
  const [activeSection, setActiveSection] = useState('connect-habbo');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Handle sidebar state changes
  useEffect(() => {
    const handleSidebarStateChange = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    return () => {
      window.removeEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    };
  }, []);

  // Redirect if already logged in and authenticated
  useEffect(() => {
    if (!loading && user && habboAccount) {
      console.log('✅ Usuário já logado, redirecionando para home');
      navigate('/');
    }
  }, [user, habboAccount, loading, navigate]);

  // Force show form after a reasonable wait if loading is stuck
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.log('⚠️ Loading demorou, forçando exibição do formulário');
        setForceShowForm(true);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [loading]);

  // If user is authenticated, don't show the form
  if (!loading && user && habboAccount) {
    return null; // Will redirect via useEffect
  }

  // Show loading only if we haven't forced the form to show
  if (loading && !forceShowForm) {
    return (
      <div className="min-h-screen bg-repeat flex items-center justify-center" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-4">Carregando...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => (
    <div className="space-y-6">
      {forceShowForm && (
        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-800">
            ⚠️ O carregamento demorou mais que o esperado. Você pode continuar com o processo de login.
          </p>
        </div>
      )}
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
        <CollapsibleSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className={`flex-1 p-4 md:p-8 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
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
