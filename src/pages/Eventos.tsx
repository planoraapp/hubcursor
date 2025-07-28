
import { useState } from 'react';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { Events } from '../components/Events';
import { PageHeader } from '../components/PageHeader';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';

const Eventos = () => {
  const [activeSection, setActiveSection] = useState('eventos');
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileLayout>
        <Events />
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <div className="flex min-h-screen">
        <CollapsibleSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto ml-20">
          <PageHeader 
            title="Eventos Habbo"
            icon="/assets/eventos.png"
            backgroundImage="/assets/event_bg_owner.png"
          />
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 min-h-full">
            <Events />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Eventos;
