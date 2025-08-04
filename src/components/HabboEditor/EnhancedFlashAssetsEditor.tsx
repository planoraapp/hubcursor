
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useFlashAssetsViaJovem, ViaJovemFlashItem } from '@/hooks/useFlashAssetsViaJovem';
import { CATEGORY_SECTIONS, CATEGORY_METADATA } from '@/lib/enhancedCategoryMapper';
import FocusedClothingThumbnail from './FocusedClothingThumbnail';

interface EnhancedFlashAssetsEditorProps {
  selectedGender: 'M' | 'F';
  selectedHotel: string;
  onItemSelect: (item: ViaJovemFlashItem, colorId: string) => void;
  selectedItem?: string;
  selectedColor?: string;
  className?: string;
}

const EnhancedFlashAssetsEditor = ({
  selectedGender,
  selectedHotel,
  onItemSelect,
  selectedItem = '',
  selectedColor = '1',
  className = ''
}: EnhancedFlashAssetsEditorProps) => {
  const [selectedSection, setSelectedSection] = useState('head');
  const [selectedCategory, setSelectedCategory] = useState('hd');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentColorSelections, setCurrentColorSelections] = useState<Record<string, string>>({});

  const { items, categoryStats, isLoading, error, totalItems } = useFlashAssetsViaJovem();

  // Filtrar items por categoria, gênero e busca
  const filteredItems = items
    .filter(item => item.category === selectedCategory)
    .filter(item => item.gender === selectedGender || item.gender === 'U')
    .filter(item => 
      searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.swfName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, 100); // Limite para performance

  const handleItemClick = (item: ViaJovemFlashItem) => {
    const colorToUse = currentColorSelections[item.id] || selectedColor || '1';
    console.log('🎯 [EnhancedEditor] Item selecionado:', {
      name: item.name,
      category: item.category,
      figureId: item.figureId,
      colorId: colorToUse
    });
    onItemSelect(item, colorToUse);
  };

  const handleColorChange = (item: ViaJovemFlashItem, colorId: string) => {
    console.log('🎨 [EnhancedEditor] Cor alterada:', {
      item: item.name,
      newColor: colorId
    });
    
    setCurrentColorSelections(prev => ({
      ...prev,
      [item.id]: colorId
    }));
    
    if (selectedItem === item.figureId) {
      onItemSelect(item, colorId);
    }
  };

  // Atualizar categoria quando a seção muda
  useEffect(() => {
    const currentSection = CATEGORY_SECTIONS[selectedSection as keyof typeof CATEGORY_SECTIONS];
    if (currentSection && currentSection.categories.length > 0) {
      setSelectedCategory(currentSection.categories[0]);
    }
  }, [selectedSection]);

  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center text-red-500">
          <p className="font-medium">Erro ao carregar assets melhorados</p>
          <p className="text-sm text-gray-600 mt-1">Sistema Flash Assets indisponível</p>
        </div>
      </Card>
    );
  }

  const currentCategoryMeta = CATEGORY_METADATA[selectedCategory as keyof typeof CATEGORY_METADATA];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header com estatísticas */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg py-4">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Flash Assets Melhorados - Sistema Inteligente
            <Badge className="ml-auto bg-white/20 text-white">
              {totalItems} assets • 13 categorias
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <Badge variant="outline" className="text-xs">
              Gênero: {selectedGender === 'M' ? 'Masculino' : 'Feminino'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {filteredItems.length} itens
            </Badge>
          </div>

          {/* Estatísticas por categoria */}
          <div className="grid grid-cols-4 md:grid-cols-7 gap-2 text-xs">
            {Object.entries(categoryStats).map(([cat, count]) => {
              const meta = CATEGORY_METADATA[cat as keyof typeof CATEGORY_METADATA];
              return (
                <div key={cat} className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg">{meta?.icon || '📦'}</div>
                  <div className="font-bold">{count}</div>
                  <div className="text-gray-600">{meta?.name || cat}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tabs principais */}
      <Card>
        <CardContent className="p-4">
          <Tabs value={selectedSection} onValueChange={setSelectedSection}>
            {/* Seções principais */}
            <TabsList className="grid w-full grid-cols-4 mb-4">
              {Object.values(CATEGORY_SECTIONS).map(section => (
                <TabsTrigger 
                  key={section.id} 
                  value={section.id} 
                  className="text-xs px-3 py-2"
                >
                  <div className="text-center">
                    <div className="text-base">{section.icon}</div>
                    <div className="text-[10px] mt-1">{section.name}</div>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Conteúdo das seções */}
            {Object.values(CATEGORY_SECTIONS).map(section => (
              <TabsContent key={section.id} value={section.id} className="min-h-[400px]">
                {/* Header da seção */}
                <div className="mb-4">
                  <h3 className="font-bold text-lg text-purple-800 flex items-center gap-2">
                    <span className="text-xl">{section.icon}</span>
                    {section.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Assets categorizados com sistema inteligente
                  </p>
                </div>
                
                {/* Sub-categorias */}
                <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                  <TabsList 
                    className="grid gap-1 mb-4" 
                    style={{ gridTemplateColumns: `repeat(${section.categories.length}, 1fr)` }}
                  >
                    {section.categories.map(categoryId => {
                      const meta = CATEGORY_METADATA[categoryId as keyof typeof CATEGORY_METADATA];
                      const count = categoryStats[categoryId] || 0;
                      
                      return (
                        <TabsTrigger 
                          key={categoryId} 
                          value={categoryId} 
                          className="text-xs px-2 py-2 relative"
                          style={{ backgroundColor: meta?.color ? `${meta.color}20` : undefined }}
                        >
                          <div className="text-center">
                            <div className="text-sm">{meta?.icon || '📦'}</div>
                            <div className="text-[9px] mt-1">{meta?.name}</div>
                            <Badge variant="secondary" className="absolute -top-2 -right-2 text-[8px] px-1">
                              {count}
                            </Badge>
                          </div>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>

                  {/* Grids de assets */}
                  {section.categories.map(categoryId => (
                    <TabsContent key={categoryId} value={categoryId}>
                      <Card>
                        <CardHeader className="py-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                              <span style={{ color: currentCategoryMeta?.color }}>
                                {currentCategoryMeta?.icon}
                              </span>
                              {currentCategoryMeta?.name}
                              <Badge variant="outline">{filteredItems.length} itens</Badge>
                            </CardTitle>
                            
                            {searchTerm && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSearchTerm('')}
                              >
                                Limpar busca
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        
                        <CardContent className="p-4">
                          {isLoading ? (
                            <div className="flex items-center justify-center p-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                              <span className="ml-3 text-gray-600">Carregando assets inteligentes...</span>
                            </div>
                          ) : filteredItems.length === 0 ? (
                            <div className="text-center p-8">
                              <div className="text-gray-500 font-medium">Nenhum asset encontrado</div>
                              <div className="text-gray-400 text-sm mt-2">
                                {searchTerm ? 'Tente outro termo de busca' : `Categoria: ${selectedCategory} - Gênero: ${selectedGender}`}
                              </div>
                            </div>
                          ) : (
                            <div className="max-h-96 overflow-y-auto p-3 bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl border">
                              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3 justify-items-center">
                                {filteredItems.map((item) => {
                                  const itemColor = currentColorSelections[item.id] || selectedColor || '1';
                                  
                                  return (
                                    <FocusedClothingThumbnail
                                      key={item.id}
                                      item={item}
                                      colorId={itemColor}
                                      gender={selectedGender}
                                      isSelected={selectedItem === item.figureId}
                                      onClick={handleItemClick}
                                      onColorChange={handleColorChange}
                                      className="transform transition-all duration-200 hover:z-10"
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  ))}
                </Tabs>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Footer com informações */}
      <Card>
        <CardContent className="p-3">
          <div className="text-xs text-gray-600 flex items-center justify-between">
            <span>🚀 Sistema Melhorado: Flash Assets Inteligentes</span>
            <span>
              📊 {totalItems} total • {Object.keys(categoryStats).length} categorias • 
              90%+ precisão
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedFlashAssetsEditor;
