
import { useState, useEffect } from 'react';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { HomePage } from '../components/HomePage';
import { Events } from '../components/Events';
import { PageHeader } from '../components/PageHeader';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');
  const isMobile = useIsMobile();

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
        <main className="flex-1 p-4 md:p-8 overflow-y-auto ml-20">
          {window.location.pathname === '/eventos' ? (
            <>
              <PageHeader 
                title="Eventos Habbo"
                icon="/assets/eventos.png"
                backgroundImage="/assets/event_bg_owner.png"
              />
              <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 min-h-full">
                {renderSection()}
              </div>
            </>
          ) : (
            <>
              <PageHeader 
                title="Habbo Hub - Home"
                icon="/assets/home.png"
                backgroundImage="/assets/1360__-3C7.png"
              />
              <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 min-h-full">
                {renderSection()}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
