
import { useState, useEffect } from 'react';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { PageHeader } from '../components/PageHeader';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';
import { UnifiedAvatarPreview } from '../components/HabboEditor/UnifiedAvatarPreview';
import { UnifiedCatalogGrid } from '../components/catalog/UnifiedCatalogGrid';
import { UnifiedClothingItem } from '../hooks/useUnifiedClothingAPI';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Palette, Sparkles, Zap } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../integrations/supabase/client';

const Editor = () => {
  const [activeSection, setActiveSection] = useState('editor');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [figureString, setFigureString] = useState('hd-180-2.hr-828-45.ch-665-92.lg-700-1.sh-705-1');
  const [selectedGender, setSelectedGender] = useState<'M' | 'F' | 'U'>('M');
  const [selectedHotel, setSelectedHotel] = useState('com.br');
  const [activeCategory, setActiveCategory] = useState('all');
  const isMobile = useIsMobile();
  const { toast } = useToast();

  useEffect(() => {
    const handleSidebarStateChange = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.isCollapsed);
    };
    window.addEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    return () => {
      window.removeEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    };
  }, []);

  const handleItemSelect = (item: UnifiedClothingItem) => {
    if (!item) {
      console.warn('⚠️ No item provided to handleItemSelect');
      return;
    }

    console.log('🎨 [Editor] Item selected:', item);

    try {
      // Use the first available color as default
      const colorId = Array.isArray(item.colors) && item.colors.length > 0 ? item.colors[0] : '1';
      
      // Update figure string by replacing or adding the part
      const parts = figureString.split('.');
      const newPart = `${item.part}-${item.item_id}-${colorId}`;
      const existingIndex = parts.findIndex(part => part.startsWith(`${item.part}-`));
      
      if (existingIndex !== -1) {
        parts[existingIndex] = newPart;
      } else {
        parts.push(newPart);
      }
      
      const newFigureString = parts.join('.');
      setFigureString(newFigureString);
      
      toast({
        title: "✨ Item aplicado!",
        description: `${item.name} foi aplicado ao avatar`,
      });
      
      console.log('✅ [Editor] Figure updated:', newFigureString);
    } catch (error) {
      console.error('❌ [Editor] Error applying item:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível aplicar o item",
        variant: "destructive"
      });
    }
  };

  const handleReset = () => {
    const defaultFigure = selectedGender === 'F' 
      ? 'hd-180-2.hr-595-45.ch-667-92.lg-701-1.sh-705-1'
      : 'hd-180-2.hr-828-45.ch-665-92.lg-700-1.sh-705-1';
    
    setFigureString(defaultFigure);
    toast({
      title: "🔄 Avatar resetado",
      description: "Avatar voltou ao padrão",
    });
  };

  const handleRandomize = () => {
    // Generate random figure parts
    const randomParts = [
      `hd-180-${Math.floor(Math.random() * 8) + 1}`,
      `hr-${Math.floor(Math.random() * 1000) + 100}-${Math.floor(Math.random() * 100) + 1}`,
      `ch-${Math.floor(Math.random() * 500) + 210}-${Math.floor(Math.random() * 100) + 1}`,
      `lg-${Math.floor(Math.random() * 500) + 270}-${Math.floor(Math.random() * 100) + 1}`,
      `sh-${Math.floor(Math.random() * 500) + 300}-${Math.floor(Math.random() * 100) + 1}`
    ];
    setFigureString(randomParts.join('.'));
    
    toast({
      title: "🎲 Avatar randomizado",
      description: "Avatar gerado aleatoriamente",
    });
  };

  const handlePopulateCache = async () => {
    try {
      toast({
        title: "🔄 Iniciando",
        description: "Populando cache de roupas...",
      });

      const { data, error } = await supabase.functions.invoke('populate-clothing-cache');
      
      if (error) throw error;
      
      toast({
        title: "✅ Sucesso!",
        description: `Cache populado com ${data.totalInserted} itens`,
      });
    } catch (error) {
      console.error('❌ Error populating cache:', error);
      toast({
        title: "❌ Erro",
        description: "Falha ao popular cache de roupas",
        variant: "destructive"
      });
    }
  };

  const categories = [
    { id: 'all', name: 'Todos', icon: '🎨' },
    { id: 'hr', name: 'Cabelo', icon: '💇' },
    { id: 'hd', name: 'Rosto', icon: '👤' },
    { id: 'ch', name: 'Camiseta', icon: '👕' },
    { id: 'lg', name: 'Calça', icon: '👖' },
    { id: 'sh', name: 'Sapatos', icon: '👞' },
    { id: 'ha', name: 'Chapéus', icon: '👒' },
    { id: 'ea', name: 'Óculos', icon: '👓' },
    { id: 'fa', name: 'Acessórios Rosto', icon: '🎭' },
    { id: 'cc', name: 'Casacos', icon: '🧥' },
    { id: 'ca', name: 'Acessórios', icon: '👔' },
    { id: 'wa', name: 'Cintura', icon: '🎽' }
  ];

  if (isMobile) {
    return (
      <MobileLayout>
        <div className="p-4 space-y-4">
          <PageHeader title="🎨 Editor de Avatar - HabboHub" icon="/assets/editorvisuais.png" />
          
          <UnifiedAvatarPreview
            figureString={figureString}
            selectedGender={selectedGender}
            selectedHotel={selectedHotel}
            onGenderChange={setSelectedGender}
            onHotelChange={setSelectedHotel}
            onRandomize={handleRandomize}
            onReset={handleReset}
            className="mb-4"
          />

          <Card>
            <CardHeader>
              <CardTitle>Catálogo de Roupas</CardTitle>
            </CardHeader>
            <CardContent>
              <UnifiedCatalogGrid
                onItemSelect={handleItemSelect}
                selectedCategory={activeCategory}
              />
            </CardContent>
          </Card>
        </div>
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-repeat" style={{
      backgroundImage: 'url(/assets/bghabbohub.png)'
    }}>
      <div className="flex min-h-screen">
        <CollapsibleSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className={`flex-1 p-4 md:p-8 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <PageHeader title="🎨 Editor de Avatar - HabboHub" icon="/assets/editorvisuais.png" />
          
          <div className="bg-gradient-to-br from-white/90 to-purple-50/90 backdrop-blur-sm rounded-lg border-2 border-purple-200 shadow-xl p-4 md:p-6">
            {/* Header Actions */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 volter-font">
                  Editor de Avatar
                </h1>
                <p className="text-gray-600 mt-1">
                  Crie e personalize seu avatar usando nossa base completa de roupas e acessórios
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handlePopulateCache} variant="outline" size="sm">
                  <Zap className="w-4 h-4 mr-1" />
                  Popular Cache
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Avatar Preview - Left Column */}
              <div className="lg:col-span-1">
                <UnifiedAvatarPreview
                  figureString={figureString}
                  selectedGender={selectedGender}
                  selectedHotel={selectedHotel}
                  onGenderChange={setSelectedGender}
                  onHotelChange={setSelectedHotel}
                  onRandomize={handleRandomize}
                  onReset={handleReset}
                />
              </div>

              {/* Main Editor - Right Columns */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      Catálogo de Roupas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                      <TabsList className="grid grid-cols-6 lg:grid-cols-12 mb-4">
                        {categories.map(cat => (
                          <TabsTrigger 
                            key={cat.id} 
                            value={cat.id} 
                            className="text-xs"
                            title={cat.name}
                          >
                            {cat.icon}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      
                      {categories.map(cat => (
                        <TabsContent key={cat.id} value={cat.id} className="mt-4">
                          <UnifiedCatalogGrid
                            onItemSelect={handleItemSelect}
                            selectedCategory={cat.id}
                          />
                        </TabsContent>
                      ))}
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Editor;
