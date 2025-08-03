
import { useState, useEffect } from 'react';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { PageHeader } from '../components/PageHeader';
import { NewsAndEvents } from '../components/NewsAndEvents';
import { AnimatedConsole } from '../components/AnimatedConsole';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';

const Noticias = () => {
  const [activeSection, setActiveSection] = useState('noticias');
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

  if (isMobile) {
    return (
      <MobileLayout>
        <div className="p-4">
          <div className="flex items-center gap-3 mb-6">
            <AnimatedConsole isActive={true} />
            <PageHeader 
              title="Notícias & Eventos"
              icon="/assets/news.png"
            />
          </div>
          <NewsAndEvents />
        </div>
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <div className="flex min-h-screen">
        <CollapsibleSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className={`flex-1 p-4 md:p-8 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="flex items-center gap-3 mb-6">
            <AnimatedConsole isActive={true} />
            <PageHeader 
              title="Notícias & Eventos"
              icon="/assets/news.png"
            />
          </div>
          <NewsAndEvents />
        </main>
      </div>
    </div>
  );
};

export default Noticias;
