
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { useEnhancedFlashAssetsV2 } from '@/hooks/useEnhancedFlashAssetsV2';
import { getRarityColor } from '@/lib/enhancedCategoryMapperV2';
import { SkinColorSelector } from './SkinColorSelector';
import { OfficialHabboColorPalette } from './OfficialHabboColorPalette';
import { isValidColorForCategory, getDefaultColorForCategory } from '@/utils/habboColorValidator';

interface FlashAssetsV3CompleteProps {
  selectedGender: 'M' | 'F';
  selectedHotel: string;
  onItemSelect: (item: any, colorId: string) => void;
  selectedItem: string;
  selectedColor: string;
  className?: string;
}

// 4 SEÇÕES PRINCIPAIS reorganizadas
const MAIN_SECTIONS = {
  head: {
    id: 'head',
    name: 'Cabeça',
    icon: '👤',
    categories: ['hd', 'hr', 'ha', 'ea', 'fa'] // Rosto, Cabelo, Chapéus, Óculos, Acessórios de Rosto
  },
  body: {
    id: 'body',
    name: 'Corpo e Acessórios',
    icon: '👕',
    categories: ['sk', 'ch', 'cc', 'cp', 'ca'] // Cor de Pele, Camisetas, Casacos, Estampas, Acessórios Peito
  },
  legs: {
    id: 'legs',
    name: 'Pernas e Pés',
    icon: '👖',
    categories: ['lg', 'sh', 'wa'] // Calças, Sapatos, Cintura
  },
  other: {
    id: 'other',
    name: 'Outros',
    icon: '✨',
    categories: ['fx', 'pets', 'dance'] // Efeitos especiais e não categorizados
  }
};

const CATEGORY_METADATA = {
  hd: { name: 'Rostos', icon: '😊' },
  hr: { name: 'Cabelos', icon: '💇' },
  ha: { name: 'Chapéus', icon: '🎩' },
  ea: { name: 'Óculos', icon: '👓' },
  fa: { name: 'Acessórios Rosto', icon: '🎭' },
  sk: { name: 'Cor de Pele', icon: '🤏' },
  ch: { name: 'Camisetas', icon: '👕' },
  cc: { name: 'Casacos', icon: '🧥' },
  cp: { name: 'Estampas', icon: '🎨' },
  ca: { name: 'Acessórios Peito', icon: '💍' },
  lg: { name: 'Calças', icon: '👖' },
  sh: { name: 'Sapatos', icon: '👟' },
  wa: { name: 'Cintura', icon: '🎀' },
  fx: { name: 'Efeitos', icon: '✨' },
  pets: { name: 'Pets', icon: '🐾' },
  dance: { name: 'Dança', icon: '💃' }
};

const FlashAssetsV3Complete = ({
  selectedGender,
  selectedHotel,
  onItemSelect,
  selectedItem,
  selectedColor,
  className = ''
}: FlashAssetsV3CompleteProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('hd');
  const [selectedSection, setSelectedSection] = useState<string>('head');
  const [selectedRarity, setSelectedRarity] = useState<'all' | 'nft' | 'hc' | 'ltd' | 'rare' | 'common'>('all');
  const [currentColor, setCurrentColor] = useState<string>('1');

  const { 
    items, 
    categoryStats, 
    rarityStats,
    isLoading, 
    error, 
    totalItems
  } = useEnhancedFlashAssetsV2({
    category: selectedCategory,
    gender: selectedGender,
    search: searchTerm,
    rarity: selectedRarity === 'all' ? undefined : selectedRarity
  });

  const currentSection = MAIN_SECTIONS[selectedSection as keyof typeof MAIN_SECTIONS];

  // Atualizar categoria quando mudar seção
  useEffect(() => {
    if (currentSection && currentSection.categories.length > 0 && !currentSection.categories.includes(selectedCategory)) {
      setSelectedCategory(currentSection.categories[0]);
    }
  }, [selectedSection, currentSection, selectedCategory]);

  // Validar cor quando mudar categoria
  useEffect(() => {
    if (!isValidColorForCategory(currentColor, selectedCategory)) {
      const defaultColor = getDefaultColorForCategory(selectedCategory);
      setCurrentColor(defaultColor);
    }
  }, [selectedCategory, currentColor]);

  const handleItemClick = (item: any) => {
    console.log('🎯 [FlashAssetsV3Complete] Item selecionado:', item);
    
    const validColor = isValidColorForCategory(currentColor, item.category) 
      ? currentColor 
      : getDefaultColorForCategory(item.category);
    
    onItemSelect(item, validColor);
  };

  const handleColorSelect = (colorId: string) => {
    console.log('🎨 [FlashAssetsV3Complete] Cor selecionada:', { category: selectedCategory, colorId });
    setCurrentColor(colorId);
  };

  const handleSkinColorSelect = (colorId: string) => {
    console.log('🤏 [FlashAssetsV3Complete] Cor de pele selecionada:', colorId);
    const skinItem = {
      id: `sk_${colorId}_${selectedGender}`,
      name: `Pele Cor ${colorId}`,
      category: 'sk',
      figureId: '180',
      gender: selectedGender,
      colors: [colorId],
      rarity: 'common',
      source: 'skin-color-selector'
    };
    onItemSelect(skinItem, colorId);
  };

  const getItemImageUrl = (item: any) => {
    if (item.thumbnailUrl) return item.thumbnailUrl;
    if (item.imageUrl) return item.imageUrl;
    
    return `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/flash-assets/${item.swfName || item.id}.png`;
  };

  const filteredItems = items.filter(item => 
    !searchTerm || 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.figureId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.swfName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRarityChange = (value: string) => {
    setSelectedRarity(value as 'all' | 'nft' | 'hc' | 'ltd' | 'rare' | 'common');
  };

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center p-8`}>
        <div className="text-center">
          <p className="text-red-600 mb-4">❌ Erro ao carregar assets: {error.message}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} flex flex-col h-full`}>
      {/* Controles de Busca e Filtros */}
      <div className="p-4 border-b bg-gray-50 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar itens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 items-center">
          <Select value={selectedRarity} onValueChange={handleRarityChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Raridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">🌟 Todas</SelectItem>
              <SelectItem value="nft">⭐ NFT</SelectItem>
              <SelectItem value="ltd">👑 Limitados</SelectItem>
              <SelectItem value="hc">⚡ HC Premium</SelectItem>
              <SelectItem value="rare">💎 Raros</SelectItem>
              <SelectItem value="common">📦 Comuns</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedRarity('all');
            }}
          >
            <Filter className="w-4 h-4 mr-1" />
            Limpar
          </Button>
        </div>
      </div>

      {/* 4 SEÇÕES PRINCIPAIS */}
      <Tabs value={selectedSection} onValueChange={setSelectedSection} className="flex-1 flex flex-col">
        <div className="p-2 border-b bg-white">
          <ScrollArea className="w-full">
            <TabsList className="grid grid-cols-4 w-full gap-1">
              {Object.values(MAIN_SECTIONS).map((section) => (
                <TabsTrigger 
                  key={section.id} 
                  value={section.id} 
                  className="flex flex-col items-center gap-1 p-3"
                >
                  <span className="text-xl">{section.icon}</span>
                  <span className="text-xs font-medium">{section.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
        </div>

        {/* Conteúdo das SEÇÕES */}
        {Object.values(MAIN_SECTIONS).map((section) => (
          <TabsContent key={section.id} value={section.id} className="flex-1 p-0 m-0 flex flex-col">
            
            {/* ESPECIAL: Seção de Cor de Pele */}
            {section.id === 'body' && selectedCategory === 'sk' ? (
              <div className="flex-1 p-4">
                <SkinColorSelector
                  selectedColor={currentColor}
                  onColorSelect={handleSkinColorSelect}
                  selectedGender={selectedGender}
                  className="max-w-md mx-auto"
                />
              </div>
            ) : (
              <>
                {/* Sub-categorias */}
                <div className="p-2 border-b bg-gray-50">
                  <ScrollArea className="w-full">
                    <div className="flex gap-1">
                      {section.categories.map(cat => {
                        const metadata = CATEGORY_METADATA[cat as keyof typeof CATEGORY_METADATA];
                        const isSpecialSkin = cat === 'sk';
                        return (
                          <Button
                            key={cat}
                            variant={selectedCategory === cat ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedCategory(cat)}
                            className={`flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-[80px] ${
                              isSpecialSkin ? 'border-orange-200 bg-orange-50 hover:bg-orange-100' : ''
                            }`}
                          >
                            <span className="text-lg">{metadata?.icon}</span>
                            <span className="text-xs">{metadata?.name}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>

                {/* Seletor de Cores por Categoria */}
                <div className="p-2 border-b bg-white">
                  <OfficialHabboColorPalette
                    selectedCategory={selectedCategory}
                    selectedColor={currentColor}
                    onColorSelect={handleColorSelect}
                    showPaletteInfo={false}
                  />
                </div>

                {/* Grid de Assets - SEM LEGENDAS, thumbnails focadas */}
                <ScrollArea className="flex-1 p-4">
                  {isLoading ? (
                    <div className="grid grid-cols-6 gap-2">
                      {[...Array(18)].map((_, i) => (
                        <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : filteredItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">{section.icon}</div>
                      <p>Nenhum item encontrado</p>
                      {searchTerm && <p className="text-sm">Tente buscar por outro termo</p>}
                    </div>
                  ) : (
                    <div className="grid grid-cols-6 gap-2">
                      {filteredItems.map(item => (
                        <div
                          key={item.id}
                          onClick={() => handleItemClick(item)}
                          className={`aspect-square rounded-lg border-2 hover:border-blue-400 cursor-pointer transition-all duration-200 p-1 flex items-center justify-center relative ${
                            selectedItem === item.figureId ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200'
                          }`}
                        >
                          {/* Indicador de raridade compacto */}
                          {item.rarity !== 'common' && (
                            <div 
                              className="absolute top-0 right-0 w-3 h-3 rounded-full"
                              style={{ backgroundColor: getRarityColor(item.rarity) }}
                            />
                          )}

                          {/* Imagem do item - SEM legendas */}
                          <img
                            src={getItemImageUrl(item)}
                            alt={item.name}
                            className="max-w-full max-h-full object-contain pixelated"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.style.display = 'none';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default FlashAssetsV3Complete;
