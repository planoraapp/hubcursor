
import { useState } from 'react';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { PageHeader } from '../components/PageHeader';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';
import PuhekuplaBadgesGrid from '../components/PuhekuplaEditor/PuhekuplaBadgesGrid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Award } from 'lucide-react';
import type { PuhekuplaBadge } from '@/hooks/usePuhekuplaData';

const EmblemaPuhekupla = () => {
  const [activeSection, setActiveSection] = useState('badges');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();

  const handleItemSelect = (item: PuhekuplaBadge) => {
    console.log('Emblema selecionado:', item);
    // TODO: Implementar lógica de seleção (pode abrir modal, copiar código, etc.)
  };

  if (isMobile) {
    return (
      <MobileLayout>
        <div className="p-4 space-y-6">
          <PageHeader 
            title="Catálogo de Emblemas Puhekupla"
            icon="/assets/emblemas.png"
          />
          
          {/* Search Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar emblemas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <PuhekuplaBadgesGrid
            searchTerm={searchTerm}
            onItemSelect={handleItemSelect}
          />
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
            title="🏆 Catálogo de Emblemas Puhekupla"
            icon="/assets/emblemas.png"
          />
          
          <div className="bg-gradient-to-br from-white/90 to-yellow-50/90 backdrop-blur-sm rounded-lg border-2 border-yellow-200 shadow-xl p-4 md:p-6">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-yellow-800 flex items-center gap-2">
                  <Award className="w-6 h-6" />
                  Buscar Emblemas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar emblemas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="overflow-hidden">
              <PuhekuplaBadgesGrid
                searchTerm={searchTerm}
                onItemSelect={handleItemSelect}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmblemaPuhekupla;
