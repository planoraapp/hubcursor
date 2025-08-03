
import { useState, useEffect } from 'react';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { PageHeader } from '../components/PageHeader';
import { MarketplaceReal } from '../components/MarketplaceReal';
import { MarketplaceCharts } from '../components/MarketplaceCharts';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Mercado = () => {
  const [activeSection, setActiveSection] = useState('mercado');
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
            title="Mercado Habbo - Dados Reais"
            icon="/assets/Diamante.png"
          />
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 text-sm font-medium">
              🎯 Dados em tempo real da HabboAPI.site • Atualização automática
            </p>
          </div>
          <Tabs defaultValue="marketplace" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="marketplace">Feira Real</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            <TabsContent value="marketplace">
              <MarketplaceReal />
            </TabsContent>
            <TabsContent value="analytics">
              <MarketplaceCharts />
            </TabsContent>
          </Tabs>
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
            title="Mercado Habbo - Dados Reais da Feira"
            icon="/assets/Diamante.png"
          />
          
          {/* Indicador de dados reais */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2">
              <span className="text-green-600 font-bold">🎯 DADOS EM TEMPO REAL</span>
              <span className="text-green-800">•</span>
              <span className="text-green-700">HabboAPI.site Market History</span>
              <span className="text-green-800">•</span>
              <span className="text-green-700">Atualização automática a cada 10min</span>
            </div>
          </div>
          
          <Tabs defaultValue="marketplace" className="w-full">
            <div className="flex justify-center mb-6">
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="marketplace">🏪 Feira Real</TabsTrigger>
                <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="marketplace">
              <MarketplaceReal />
            </TabsContent>
            <TabsContent value="analytics">
              <MarketplaceCharts />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Mercado;
