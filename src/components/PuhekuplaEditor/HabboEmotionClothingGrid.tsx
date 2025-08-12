
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, Loader2 } from 'lucide-react';
import { useUnifiedClothing, UnifiedClothingItem } from '@/hooks/useUnifiedClothingAPI';

interface ClothingGridProps {
  selectedCategory: string;
  selectedGender: 'M' | 'F';
  onItemSelect: (item: UnifiedClothingItem) => void;
  selectedItem?: string;
}

const HabboEmotionClothingGrid: React.FC<ClothingGridProps> = ({
  selectedCategory,
  selectedGender,
  onItemSelect,
  selectedItem
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showHCOnly, setShowHCOnly] = useState(false);
  
  const {
    data: clothingItems = [],
    isLoading,
    error
  } = useUnifiedClothing({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    gender: selectedGender,
    search: searchTerm || undefined,
    limit: 100
  });

  const filteredItems = clothingItems.filter(item => {
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesHC = !showHCOnly || item.club === 'HC';
    
    return matchesSearch && matchesHC;
  });

  const getClothingThumbnail = (item: UnifiedClothingItem) => {
    if (item.image_url) {
      return item.image_url;
    }
    
    // Fallback to habbo-imaging
    const baseAvatar = 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92';
    const fullFigure = `${baseAvatar}.${item.part}-${item.item_id}-1`;
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${fullFigure}&gender=${selectedGender}&direction=2&size=s`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Carregando roupas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 text-lg mb-4">❌ Erro ao carregar roupas</div>
        <p className="text-gray-600">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={`Buscar ${selectedCategory.toUpperCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          variant={showHCOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowHCOnly(!showHCOnly)}
        >
          <Filter className="w-3 h-3 mr-1" />
          HC Only
        </Button>
      </div>

      {/* Results info */}
      <div className="text-sm text-gray-600">
        {filteredItems.length} itens encontrados
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-96 overflow-y-auto">
        {filteredItems.map((item) => (
          <Card
            key={`${item.source}-${item.part}-${item.item_id}`}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
              selectedItem === item.figureId 
                ? 'ring-2 ring-blue-500 shadow-lg' 
                : 'hover:shadow-md'
            }`}
            onClick={() => onItemSelect(item)}
          >
            <CardContent className="p-2">
              <div className="aspect-square relative">
                <img
                  src={getClothingThumbnail(item)}
                  alt={item.name}
                  className="w-full h-full object-contain rounded"
                  loading="lazy"
                  style={{ imageRendering: 'pixelated' }}
                />
                
                {/* HC Badge */}
                {item.club === 'HC' && (
                  <Badge 
                    variant="secondary" 
                    className="absolute top-0 right-0 text-xs bg-yellow-500 text-black px-1 py-0"
                  >
                    HC
                  </Badge>
                )}
                
                {/* Source Badge */}
                <Badge 
                  variant="outline" 
                  className="absolute bottom-0 left-0 text-xs px-1 py-0"
                >
                  {item.source === 'database' ? 'DB' : item.source.substring(0, 2).toUpperCase()}
                </Badge>
              </div>
              
              <div className="mt-1 text-center">
                <p className="text-xs font-medium text-gray-700 truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500">
                  {item.item_id}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center p-8">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-gray-500">Nenhum item encontrado</p>
        </div>
      )}
    </div>
  );
};

export default HabboEmotionClothingGrid;
