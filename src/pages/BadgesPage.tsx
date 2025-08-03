
import { useState, useEffect } from 'react';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { PageHeader } from '../components/PageHeader';
import { PanelCard } from '../components/PanelCard';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';

export default function BadgesPage() {
  const [activeSection, setActiveSection] = useState('emblemas');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleSidebarStateChange = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    return () => {
      window.removeEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    };
  }, []);

  const renderContent = () => (
    <div className="space-y-6">
      {/* Emblemas Card - Otimizado sem borda branca */}
      <div 
        className="rounded-lg shadow-lg overflow-hidden"
        style={{ border: '2px solid black' }}
      >
        {/* Header colorido */}
        <div className="flex flex-col space-y-1.5 p-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
          <h3 className="text-2xl font-semibold leading-none tracking-tight text-center volter-font"
              style={{ textShadow: 'black 1px 1px 0px, black -1px -1px 0px, black 1px -1px 0px, black -1px 1px 0px' }}>
            Emblemas Habbo
          </h3>
        </div>

        {/* Conteúdo principal */}
        <div className="p-6 bg-white">
          <div className="text-center py-8">
            <div className="mb-4">
              <img 
                src="/assets/emblemas.png" 
                alt="Emblemas" 
                className="w-16 h-16 mx-auto mb-4"
              />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2 volter-font">
              Sistema de Emblemas
            </h3>
            <p className="text-gray-600">
              Sistema de emblemas em desenvolvimento. Em breve você poderá visualizar 
              todos os emblemas disponíveis no Habbo Hotel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <MobileLayout>
        <div className="p-4">
          <PageHeader 
            title="Emblemas Habbo"
            icon="/assets/emblemas.png"
            backgroundImage="/assets/1360__-3C7.png"
          />
          {renderContent()}
        </div>
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <div className="flex min-h-screen">
        <CollapsibleSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className={`flex-1 p-4 md:p-8 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <PageHeader 
            title="Emblemas Habbo"
            icon="/assets/emblemas.png"
            backgroundImage="/assets/1360__-3C7.png"
          />
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
