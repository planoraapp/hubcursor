
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { useEnhancedFlashAssetsV2 } from '@/hooks/useEnhancedFlashAssetsV2';
import { getRarityColor } from '@/lib/enhancedCategoryMapperV2';
import { SkinColorSlider } from './SkinColorSlider';
import { ColorPickerModal } from './ColorPickerModal';
import { AvatarHistory } from './AvatarHistory';
import { getClothingSpriteUrl, getFallbackThumbnail } from '@/utils/clothingSpriteGenerator';

interface FlashAssetsV3CompleteProps {
  selectedGender: 'M' | 'F';
  selectedHotel: string;
  onItemSelect: (item: any, colorId: string) => void;
  selectedItem: string;
  selectedColor: string;
  currentFigureString?: string;
  onRestoreFigure?: (figureString: string) => void;
  className?: string;
}

// 4 SEÇÕES PRINCIPAIS - Sem cores inline
const MAIN_SECTIONS = {
  head: {
    id: 'head',
    name: 'Cabeça',
    icon: '👤',
    categories: ['hd', 'hr', 'ha', 'ea', 'fa']
  },
  body: {
    id: 'body',
    name: 'Corpo',
    icon: '👕',
    categories: ['ch', 'cc', 'cp', 'ca']
  },
  legs: {
    id: 'legs',
    name: 'Pernas',
    icon: '👖',
    categories: ['lg', 'sh', 'wa']
  }
};

const CATEGORY_METADATA = {
  hd: { name: 'Rostos', icon: '😊' },
  hr: { name: 'Cabelos', icon: '💇' },
  ha: { name: 'Chapéus', icon: '🎩' },
  ea: { name: 'Óculos', icon: '👓' },
  fa: { name: 'Acessórios', icon: '🎭' },
  ch: { name: 'Camisetas', icon: '👕' },
  cc: { name: 'Casacos', icon: '🧥' },
  cp: { name: 'Estampas', icon: '🎨' },
  ca: { name: 'Peito', icon: '💍' },
  lg: { name: 'Calças', icon: '👖' },
  sh: { name: 'Sapatos', icon: '👟' },
  wa: { name: 'Cintura', icon: '🎀' }
};

const FlashAssetsV3Complete = ({
  selectedGender,
  selectedHotel,
  onItemSelect,
  selectedItem,
  selectedColor,
  currentFigureString = '',
  onRestoreFigure,
  className = ''
}: FlashAssetsV3CompleteProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('hd');
  const [selectedSection, setSelectedSection] = useState<string>('head');
  const [selectedRarity, setSelectedRarity] = useState<'all' | 'nft' | 'hc' | 'ltd' | 'rare' | 'common'>('all');
  
  // Color picker modal state
  const [colorModalOpen, setColorModalOpen] = useState(false);
  const [pendingItem, setPendingItem] = useState<any>(null);

  const { 
    items, 
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

  // Update category when section changes
  useEffect(() => {
    if (currentSection && currentSection.categories.length > 0 && !currentSection.categories.includes(selectedCategory)) {
      setSelectedCategory(currentSection.categories[0]);
    }
  }, [selectedSection, currentSection, selectedCategory]);

  const handleItemClick = (item: any) => {
    console.log('🎯 [FlashAssetsV3Complete] Item clicked for color selection:', {
      name: item.name,
      category: item.category,
      figureId: item.figureId,
      swfName: item.swfName
    });
    setPendingItem(item);
    setColorModalOpen(true);
  };

  const handleColorModalSelect = (colorId: string) => {
    if (pendingItem) {
      console.log('🎨 [FlashAssetsV3Complete] Color selected:', { item: pendingItem.name, colorId });
      onItemSelect(pendingItem, colorId);
      setPendingItem(null);
    }
  };

  const handleSkinColorSelect = (colorId: string) => {
    console.log('🤏 [FlashAssetsV3Complete] Cor de pele selecionada:', colorId);
    
    const skinItem = {
      id: `hd_skin_${colorId}_${selectedGender}`,
      name: `Tom de Pele ${colorId}`,
      category: 'hd',
      figureId: '180',
      gender: selectedGender,
      colors: [colorId],
      rarity: 'common',
      source: 'skin-color-slider',
      club: 'normal',
      swfName: `hd_180_skin_${colorId}`
    };
    
    onItemSelect(skinItem, colorId);
  };

  const handleRestoreFigure = (figureString: string) => {
    if (onRestoreFigure) {
      onRestoreFigure(figureString);
    }
  };

  const getItemImageUrl = (item: any) => {
    // Enhanced sprite URL generation with swfName priority
    const spriteUrl = getClothingSpriteUrl(
      item.category, 
      item.figureId, 
      '1', 
      selectedGender, 
      item.swfName
    );
    
    console.log('🖼️ [FlashAssetsV3Complete] Generated sprite URL:', {
      category: item.category,
      figureId: item.figureId,
      swfName: item.swfName,
      url: spriteUrl.substring(0, 80) + '...'
    });
    
    return spriteUrl;
  };

  const filteredItems = items
    .filter(item => item && item.category === selectedCategory)
    .filter(item => /^\d+$/.test(String(item.figureId)) && String(item.figureId) !== '0')
    .filter(item => !searchTerm ||
      String(item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(item.figureId || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(item => selectedRarity === 'all' || item.rarity === selectedRarity);

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
      {/* Color Picker Modal */}
      <ColorPickerModal
        isOpen={colorModalOpen}
        onClose={() => {
          setColorModalOpen(false);
          setPendingItem(null);
        }}
        onColorSelect={handleColorModalSelect}
        category={pendingItem?.category || 'ch'}
        itemName={pendingItem?.name || ''}
        selectedColor={selectedColor}
      />

      {/* Search and Filters */}
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

      {/* Skin Color Slider */}
      <div className="p-4 border-b bg-white">
        <SkinColorSlider
          selectedColor={selectedColor}
          onColorSelect={handleSkinColorSelect}
          selectedGender={selectedGender}
        />
      </div>

      {/* Avatar History */}
      {onRestoreFigure && currentFigureString && (
        <div className="p-4 border-b bg-gray-50">
          <AvatarHistory
            currentFigureString={currentFigureString}
            selectedGender={selectedGender}
            selectedHotel={selectedHotel}
            onRestoreFigure={handleRestoreFigure}
          />
        </div>
      )}

      {/* 3 Main Sections */}
      <Tabs value={selectedSection} onValueChange={setSelectedSection} className="flex-1 flex flex-col">
        <div className="p-2 border-b bg-white">
          <ScrollArea className="w-full">
            <TabsList className="grid grid-cols-3 w-full gap-1">
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

        {/* Section Content */}
        {Object.values(MAIN_SECTIONS).map((section) => (
          <TabsContent key={section.id} value={section.id} className="flex-1 p-0 m-0 flex flex-col">
            
            {/* Sub-categories */}
            <div className="p-2 border-b bg-gray-50">
              <ScrollArea className="w-full">
                <div className="flex gap-1">
                  {section.categories.map(cat => {
                    const metadata = CATEGORY_METADATA[cat as keyof typeof CATEGORY_METADATA];
                    return (
                      <Button
                        key={cat}
                        variant={selectedCategory === cat ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(cat)}
                        className="flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-[80px]"
                      >
                        <span className="text-lg">{metadata?.icon}</span>
                        <span className="text-xs">{metadata?.name}</span>
                      </Button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* Enhanced Items Grid with sprite fallback handling */}
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
                  {searchTerm && <p className="text-sm">Tente outro termo</p>}
                </div>
              ) : (
                <div className="grid grid-cols-6 gap-2">
                  {filteredItems.map((item, idx) => (
                    <div
                      key={`${String(item.swfName || item.id || item.figureId)}_${idx}`}
                      onClick={() => handleItemClick(item)}
                      className={`aspect-square rounded-lg border-2 hover:border-blue-400 cursor-pointer transition-all duration-200 p-1 flex items-center justify-center relative bg-white ${
                        selectedItem === item.figureId ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200'
                      }`}
                      title={`${item.name} - Clique para escolher cor`}
                      data-cat={item.category}
                    >
                      {/* Rarity indicator */}
                      {item.rarity !== 'common' && (
                        <div 
                          className="absolute top-0 right-0 w-3 h-3 rounded-full"
                          style={{ backgroundColor: getRarityColor(item.rarity) }}
                        />
                      )}

                      {/* Enhanced sprite loading with multiple fallbacks */}
                      <img
                        src={getItemImageUrl(item)}
                        alt={item.name}
                        className="max-w-full max-h-full object-contain"
                        style={{ imageRendering: 'pixelated' }}
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement;
                          const currentSrc = img.src;
                          
                          // Try Habbo Imaging fallback if Puhekupla fails
                          if (currentSrc.includes('puhekupla.com')) {
                            const fallback = getFallbackThumbnail(item.category, item.figureId, '1', selectedGender);
                            console.log('🔄 [Sprite] Puhekupla failed, trying Habbo Imaging:', fallback);
                            img.src = fallback;
                          } else {
                            // Final fallback: hide image and show ID
                            console.error('💥 [Sprite] All image sources failed for:', item.name);
                            img.style.display = 'none';
                            
                            // Create fallback text element
                            const parent = img.parentElement;
                            if (parent && !parent.querySelector('.fallback-text')) {
                              const fallbackDiv = document.createElement('div');
                              fallbackDiv.className = 'fallback-text text-xs font-bold text-gray-600 text-center';
                              fallbackDiv.textContent = item.figureId;
                              parent.appendChild(fallbackDiv);
                            }
                          }
                        }}
                        onLoad={() => {
                          console.log(`✅ [Sprite] Successfully loaded: ${item.name}`);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default FlashAssetsV3Complete;
