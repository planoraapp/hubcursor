
import { useState, useEffect } from 'react';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { PageHeader } from '../components/PageHeader';
import { ViaJovemEditor } from '../components/ViaJovemEditor';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';

const Editor = () => {
  const [activeSection, setActiveSection] = useState('editor');
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
          <PageHeader 
            title="Editor de Personagem"
            icon="/assets/editorvisuais.png"
          />
          <div className="bg-white rounded-lg border-2 border-black shadow-lg overflow-hidden">
            <ViaJovemEditor />
          </div>
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
            title="Editor de Personagem"
            icon="/assets/editorvisuais.png"
          />
          <div className="bg-white rounded-lg border-2 border-black shadow-lg p-4 md:p-6 h-full overflow-hidden">
            <ViaJovemEditor />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Editor;
