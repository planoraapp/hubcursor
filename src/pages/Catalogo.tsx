
import { useState, useEffect } from 'react';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { PageHeader } from '../components/PageHeader';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';
import { CatalogInfiniteV2 } from '../components/CatalogInfiniteV2';

export default function Catalogo() {
  const [activeSection, setActiveSection] = useState('catalogo');
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
            title="Catálogo Habbo"
            icon="/assets/Carrinho.png"
            backgroundImage="/assets/1360__-3C7.png"
          />
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 min-h-full">
            <div className="mb-4 text-center">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                🌐 API HabboFurni.com
                <span className="bg-blue-200 px-2 py-0.5 rounded text-xs">Tempo Real</span>
              </div>
            </div>
            <CatalogInfiniteV2 />
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
            title="Catálogo Habbo"
            icon="/assets/Carrinho.png"
            backgroundImage="/assets/1360__-3C7.png"
          />
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 min-h-full">
            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-3 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium shadow-sm">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                🌐 Conectado à API HabboFurni.com
                <span className="bg-blue-200 px-3 py-1 rounded-full text-sm font-bold">
                  Dados em Tempo Real
                </span>
              </div>
              <p className="text-gray-600 mt-2 text-sm">
                Móveis oficiais carregados diretamente da API HabboFurni.com com sua chave pessoal
              </p>
            </div>
            <CatalogInfiniteV2 />
          </div>
        </main>
      </div>
    </div>
  );
}
