
import { useState, useEffect } from 'react';
import { AdSpace } from '../components/AdSpace';
import { PageHeader } from '../components/PageHeader';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import HabboHubEditor from '@/components/HabboHubEditor';

const Editor = () => {
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    console.log('🎨 Editor HabboHub carregado - Sistema simplificado ativo');
    
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
            title="Editor de Visuais HabboHub"
            icon="/assets/editorvisuais.png"
            backgroundImage="/assets/1360__-3C7.png"
          />
          <AdSpace type="horizontal" className="mb-6" />
          
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 min-h-screen">
            <div className="mb-4 text-center">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                ✅ Sistema Simplificado Ativo
                <span className="bg-green-200 px-2 py-0.5 rounded text-xs">Dados Oficiais</span>
              </div>
            </div>
            <HabboHubEditor />
          </div>
          
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
    <div className="min-h-screen bg-repeat" 
         style={{ 
           backgroundImage: 'url(/assets/bghabbohub.png)'
         }}>
      <div className="flex min-h-screen">
        <CollapsibleSidebar activeSection="editor" setActiveSection={() => {}} />
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="p-4 md:p-8">
            <PageHeader 
              title="Editor de Visuais HabboHub"
              icon="/assets/editorvisuais.png"
              backgroundImage="/assets/1360__-3C7.png"
            />
            
            <AdSpace type="horizontal" className="mb-6" />
            
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-6">
              <div className="mb-6 text-center">
                <div className="inline-flex items-center gap-3 bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium shadow-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  ✅ Sistema Oficial Habbo Ativo
                  <span className="bg-green-200 px-3 py-1 rounded-full text-sm font-bold">
                    Dados Oficiais + Cache Local
                  </span>
                </div>
                <p className="text-gray-600 mt-2 text-sm">
                  Editor usando dados oficiais do Habbo com sistema de cache inteligente
                </p>
              </div>
              
              <HabboHubEditor />
            </div>
            
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
