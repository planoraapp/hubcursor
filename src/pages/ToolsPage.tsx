
import { useState, useEffect } from 'react';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { PageHeader } from '../components/PageHeader';
import { PanelCard } from '../components/PanelCard';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';

export default function ToolsPage() {
  const [activeSection, setActiveSection] = useState('ferramentas');
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

  const tools = [
    {
      id: 'avatar-creator',
      name: 'Criador de Avatar',
      description: 'Crie e personalize seu visual Habbo',
      icon: '/assets/editorvisuais.png',
      available: true
    },
    {
      id: 'room-checker',
      name: 'Verificador de Quarto',
      description: 'Verifique informações de qualquer quarto',
      icon: '/assets/home.png',
      available: false
    },
    {
      id: 'badge-checker',
      name: 'Verificador de Emblemas',
      description: 'Consulte emblemas de qualquer usuário',
      icon: '/assets/emblemas.png',
      available: false
    }
  ];

  const renderContent = () => (
    <div className="space-y-6">
      <PanelCard title="Ferramentas Habbo">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <div key={tool.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <img src={tool.icon} alt={tool.name} className="w-8 h-8 mr-3" />
                <h3 className="font-bold text-gray-800 volter-font">{tool.name}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
              <button 
                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                  tool.available 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!tool.available}
              >
                {tool.available ? 'Usar Ferramenta' : 'Em Breve'}
              </button>
            </div>
          ))}
        </div>
      </PanelCard>
    </div>
  );

  if (isMobile) {
    return (
      <MobileLayout>
        <div className="p-4">
          <PageHeader 
            title="Ferramentas"
            icon="/assets/ferramentas.png"
            backgroundImage="/assets/1360__-3C7.png"
          />
          {renderContent()}
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
            title="Ferramentas"
            icon="/assets/ferramentas.png"
            backgroundImage="/assets/1360__-3C7.png"
          />
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
