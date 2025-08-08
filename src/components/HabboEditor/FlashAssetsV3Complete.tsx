
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search, Crown } from 'lucide-react';
import { useOfficialClothingIndex } from '@/hooks/useOfficialClothingIndex';
import { EnhancedColorPickerModal } from './EnhancedColorPickerModal';
import { SkinColorBar } from './SkinColorBar';
import { AvatarPreviewWithControls } from './AvatarPreviewWithControls';

interface FlashAssetsV3CompleteProps {
  selectedGender: 'M' | 'F';
  selectedHotel: string;
  onItemSelect: (item: any, colorId: string) => void;
  selectedItem?: string;
  selectedColor?: string;
  currentFigureString?: string;
  onRestoreFigure?: (figureString: string) => void;
  className?: string;
}

const FlashAssetsV3Complete = ({
  selectedGender,
  selectedHotel,
  onItemSelect,
  selectedItem,
  selectedColor = '1',
  currentFigureString = 'hd-180-1.hr-828-45.ch-665-92.lg-700-1.sh-705-1',
  className = ''
}: FlashAssetsV3CompleteProps) => {
  const [selectedCategory, setSelectedCategory] = useState('hd');
  const [searchTerm, setSearchTerm] = useState('');
  const [colorModalOpen, setColorModalOpen] = useState(false);
  const [colorModalItem, setColorModalItem] = useState<any>(null);

  const { categories, colorPalettes, isLoading, error, totalCategories, totalItems } = useOfficialClothingIndex(selectedGender);

  const categoryList = Object.keys(categories);
  const currentCategory = categories[selectedCategory];

  // Filter items by search term
  const filteredItems = useMemo(() => {
    if (!currentCategory) return [];
    
    return currentCategory.items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.figureId.includes(searchTerm)
    );
  }, [currentCategory, searchTerm]);

  const getItemThumbnailUrl = (item: any) => {
    const hotel = selectedHotel.includes('.') 
      ? selectedHotel 
      : selectedHotel === 'com' ? 'habbo.com' : `habbo.${selectedHotel}`;
    
    // Use headonly for head-related categories
    const headOnlyCategories = ['hd', 'hr', 'ha', 'he', 'ea', 'fa'];
    const headOnly = headOnlyCategories.includes(item.category) ? '&headonly=1' : '';
    
    return `https://www.${hotel}/habbo-imaging/avatarimage?figure=${item.category}-${item.figureId}-${selectedColor}&gender=${selectedGender}&direction=2&head_direction=2&size=l${headOnly}`;
  };

  const handleItemClick = (item: any) => {
    if (item.colors.length > 1) {
      // Open color modal if item has multiple colors
      setColorModalItem(item);
      setColorModalOpen(true);
    } else {
      // Apply item with default color
      onItemSelect(item, item.colors[0] || '1');
    }
  };

  const handleColorSelect = (colorId: string) => {
    if (colorModalItem) {
      onItemSelect(colorModalItem, colorId);
    }
  };

  const handleSkinColorSelect = (colorId: string) => {
    // Create a skin color item for the handler
    const skinItem = {
      category: 'hd',
      figureId: '180',
      name: 'Cor da Pele',
      colors: [colorId],
      club: 'FREE'
    };
    onItemSelect(skinItem, colorId);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Carregando assets oficiais...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-red-500">
          <p>❌ Erro ao carregar assets</p>
          <p className="text-sm">Dados oficiais indisponíveis</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Enhanced Avatar Preview */}
      <div className="mb-4">
        <AvatarPreviewWithControls
          figureString={currentFigureString}
          selectedGender={selectedGender}
          selectedHotel={selectedHotel}
        />
      </div>

      {/* Skin Color Bar */}
      <div className="mb-4">
        <SkinColorBar
          selectedColor={selectedColor}
          onColorSelect={handleSkinColorSelect}
          selectedGender={selectedGender}
          selectedHotel={selectedHotel}
        />
      </div>

      {/* Main Content */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              🎮 Assets Oficiais Habbo
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">
                {totalCategories} categorias
              </Badge>
              <Badge variant="secondary">
                {totalItems} itens
              </Badge>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar itens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col">
            {/* Category Tabs */}
            <TabsList className="grid grid-cols-7 mb-4">
              {categoryList.slice(0, 7).map(categoryId => {
                const category = categories[categoryId];
                return (
                  <TabsTrigger key={categoryId} value={categoryId} className="text-xs">
                    {category.icon}
                  </TabsTrigger>
                );
              })}
            </TabsList>
            
            {/* Second row of tabs if needed */}
            {categoryList.length > 7 && (
              <TabsList className="grid grid-cols-6 mb-4">
                {categoryList.slice(7).map(categoryId => {
                  const category = categories[categoryId];
                  return (
                    <TabsTrigger key={categoryId} value={categoryId} className="text-xs">
                      {category.icon}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            )}

            {/* Items Grid */}
            {categoryList.map(categoryId => (
              <TabsContent key={categoryId} value={categoryId} className="flex-1">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium flex items-center gap-2">
                      {categories[categoryId].icon} {categories[categoryId].name}
                    </h3>
                    <Badge variant="outline">
                      {filteredItems.length} itens
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-8 gap-2 max-h-80 overflow-y-auto">
                    {filteredItems.map((item) => (
                      <div key={item.id} className="relative">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`w-12 h-12 p-0 relative border-2 transition-all duration-200 ${
                            selectedItem === item.figureId 
                              ? 'border-blue-500 ring-2 ring-blue-300 scale-105 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                          onClick={() => handleItemClick(item)}
                          title={`${item.name} (${item.colors.length} cores)`}
                        >
                          <img
                            src={getItemThumbnailUrl(item)}
                            alt={item.name}
                            className="w-full h-full object-contain rounded"
                            style={{ imageRendering: 'pixelated' }}
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent && !parent.querySelector('.fallback-text')) {
                                const span = document.createElement('span');
                                span.className = 'text-xs font-bold text-gray-600 fallback-text';
                                span.textContent = item.figureId;
                                parent.appendChild(span);
                              }
                            }}
                          />
                        </Button>
                        
                        {/* HC Badge */}
                        {item.club === 'HC' && (
                          <div className="absolute -bottom-1 -left-1 bg-yellow-500 text-black text-xs px-1 rounded flex items-center">
                            <Crown className="w-2 h-2 mr-0.5" />
                            HC
                          </div>
                        )}
                        
                        {/* Color indicator */}
                        {item.colors.length > 1 && (
                          <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs px-1 rounded">
                            {item.colors.length}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {filteredItems.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <p>Nenhum item encontrado</p>
                      {searchTerm && (
                        <p className="text-sm">para "{searchTerm}"</p>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Enhanced Color Picker Modal */}
      <EnhancedColorPickerModal
        isOpen={colorModalOpen}
        onClose={() => setColorModalOpen(false)}
        onColorSelect={handleColorSelect}
        item={colorModalItem}
        selectedColor={selectedColor}
        colorPalettes={colorPalettes}
      />
    </div>
  );
};

export default FlashAssetsV3Complete;
