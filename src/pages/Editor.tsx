
import { useState, useEffect } from 'react';
import HabboHubEditor from '../components/HabboHubEditor';
import { AdSpace } from '../components/AdSpace';
import { PageHeader } from '../components/PageHeader';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';

const Editor = () => {
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
            title="Editor de Visuais"
            icon="/assets/editorvisuais.png"
            backgroundImage="/assets/1360__-3C7.png"
          />
          <AdSpace type="horizontal" className="mb-6" />
          <HabboHubEditor />
          <div className="flex justify-center gap-4 mt-6">
            <img 
              src="/assets/1686__-sQ.png" 
              alt="Decoração Habbo" 
              className="max-h-20 object-contain opacity-80"
            />
            <img 
              src="/assets/98__-2tN._-4Ni.png" 
              alt="Decoração Habbo" 
              className="max-h-20 object-contain opacity-80"
            />
          </div>
          <AdSpace type="wide" className="mt-6" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <div className="flex min-h-screen">
        <CollapsibleSidebar activeSection="editor" setActiveSection={() => {}} />
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="p-4 md:p-8">
            <PageHeader 
              title="Editor de Visuais"
              icon="/assets/editorvisuais.png"
              backgroundImage="/assets/1360__-3C7.png"
            />
            
            <AdSpace type="horizontal" className="mb-6" />
            
            <HabboHubEditor />
            
            <div className="flex justify-center gap-4 mt-6">
              <img 
                src="/assets/1686__-sQ.png" 
                alt="Decoração Habbo" 
                className="max-h-20 object-contain opacity-80"
              />
              <img 
                src="/assets/98__-2tN._-4Ni.png" 
                alt="Decoração Habbo" 
                className="max-h-20 object-contain opacity-80"
              />
            </div>
            
            <AdSpace type="wide" className="mt-6" />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Editor;
