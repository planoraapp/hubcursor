
import { useState, useEffect } from 'react';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { HomePage } from '../components/HomePage';
import { Events } from '../components/Events';
import { PageHeader } from '../components/PageHeader';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');
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

  const renderSection = () => {
    const path = window.location.pathname;
    if (path === '/eventos' || activeSection === 'eventos') {
      return <Events />;
    }
    return <HomePage />;
  };

  if (isMobile) {
    return (
      <MobileLayout>
        {renderSection()}
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <div className="flex min-h-screen">
        <CollapsibleSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className={`flex-1 p-4 md:p-8 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          {window.location.pathname === '/eventos' ? (
            <>
              <PageHeader 
                title="Eventos Habbo"
                icon="/assets/eventos.png"
                backgroundImage="/assets/event_bg_owner.png"
              />
              {renderSection()}
            </>
          ) : (
            <>
              <PageHeader 
                title="Habbo Hub - Home"
                icon="/assets/home.png"
                backgroundImage="/assets/1360__-3C7.png"
              />
              {renderSection()}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
