
import { useState, useEffect } from 'react';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { PageHeader } from '../components/PageHeader';
import { MassiveBadgesGrid } from '../components/MassiveBadgesGrid';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';

export default function Emblemas() {
  const [activeSection, setActiveSection] = useState('emblemas');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    console.log('🏆 Sistema Massivo de Emblemas Iniciado - HabboWidgets Scraper Ativo');
    
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
            title="Sistema Massivo de Emblemas"
            icon="/assets/emblemas.png"
            backgroundImage="/assets/1360__-3C7.png"
          />
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 min-h-full">
            <div className="mb-4 text-center">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                🚀 Sistema Massivo Ativo
                <span className="bg-green-200 px-2 py-0.5 rounded text-xs">10.000+ Badges</span>
              </div>
            </div>
            <MassiveBadgesGrid />
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
            title="Sistema Massivo de Emblemas HabboHub"
            icon="/assets/emblemas.png"
            backgroundImage="/assets/1360__-3C7.png"
          />
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 min-h-full">
            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-100 to-blue-100 text-green-800 px-6 py-3 rounded-xl font-medium shadow-md">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                🚀 Sistema Massivo Ativo - Scraping HabboWidgets
                <span className="bg-green-200 px-3 py-1 rounded-full text-sm font-bold">
                  10.000+ Badges Oficiais
                </span>
              </div>
              <p className="text-gray-600 mt-3 text-sm">
                Sistema robusto de scraping coletando todos os badges disponíveis do HabboWidgets
              </p>
            </div>
            <MassiveBadgesGrid />
          </div>
        </main>
      </div>
    </div>
  );
}
