
import { useState } from 'react';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { PageHeader } from '../components/PageHeader';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';
import PuhekuplaFurniGrid from '../components/PuhekuplaEditor/PuhekuplaFurniGrid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Package } from 'lucide-react';
import { usePuhekuplaCategories } from '@/hooks/usePuhekuplaData';
import type { PuhekuplaFurni } from '@/hooks/usePuhekuplaData';

const FurniPuhekupla = () => {
  const [activeSection, setActiveSection] = useState('furni');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const isMobile = useIsMobile();

  const { data: categoriesData } = usePuhekuplaCategories();
  const categories = categoriesData?.result?.categories || [];

  const handleItemSelect = (item: PuhekuplaFurni) => {
    console.log('Móvel selecionado:', item);
    // TODO: Implementar lógica de seleção (pode abrir modal, copiar código, etc.)
  };

  if (isMobile) {
    return (
      <MobileLayout>
        <div className="p-4 space-y-6">
          <PageHeader 
            title="Catálogo de Móveis Puhekupla"
            icon="/assets/editorvisuais.png"
          />
          
          {/* Search and Filter Controls */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar móveis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categories
                    .filter(category => category.guid && category.guid.trim() !== '')
                    .map((category) => (
                      <SelectItem key={category.guid} value={category.slug || category.guid}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <PuhekuplaFurniGrid
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
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
            title="📦 Catálogo de Móveis Puhekupla"
            icon="/assets/editorvisuais.png"
          />
          
          <div className="bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-sm rounded-lg border-2 border-blue-200 shadow-xl p-4 md:p-6">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <Package className="w-6 h-6" />
                  Filtros de Busca
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar móveis..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Categorias</SelectItem>
                      {categories
                        .filter(category => category.guid && category.guid.trim() !== '')
                        .map((category) => (
                          <SelectItem key={category.guid} value={category.slug || category.guid}>
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="overflow-hidden">
              <PuhekuplaFurniGrid
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
                onItemSelect={handleItemSelect}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FurniPuhekupla;
