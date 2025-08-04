
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2, Shirt, Palette } from 'lucide-react';
import { useHabboEmotionClothing, type HabboEmotionClothingItem } from '@/hooks/useHabboEmotionClothing';

interface HabboEmotionClothingGridProps {
  selectedCategory: string;
  selectedGender: 'M' | 'F';
  onItemSelect: (item: HabboEmotionClothingItem) => void;
  onColorSelect: (colorId: string, item: HabboEmotionClothingItem) => void;
  selectedItem?: string;
  selectedColor?: string;
}

export const HabboEmotionClothingGrid: React.FC<HabboEmotionClothingGridProps> = ({
  selectedCategory,
  selectedGender,
  onItemSelect,
  onColorSelect,
  selectedItem,
  selectedColor
}) => {
  const [colorPopoverOpen, setColorPopoverOpen] = useState<string | null>(null);
  const { data: clothingItems, isLoading, error } = useHabboEmotionClothing(500);

  // Filtrar itens por categoria e gênero
  const filteredItems = useMemo(() => {
    if (!clothingItems) return [];
    
    return clothingItems.filter(item => {
      const categoryMatch = item.category === selectedCategory || item.part === selectedCategory;
      const genderMatch = item.gender === selectedGender || item.gender === 'U';
      return categoryMatch && genderMatch;
    });
  }, [clothingItems, selectedCategory, selectedGender]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-purple-800 mb-2">Carregando Roupas HabboEmotion</h3>
          <p className="text-purple-600">Buscando catálogo completo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
        <Shirt className="w-12 h-12 mx-auto mb-3 text-red-500" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao Carregar HabboEmotion</h3>
        <p className="text-sm text-red-600 mb-4">
          Não foi possível conectar com a API HabboEmotion
        </p>
        <Button onClick={() => window.location.reload()} variant="outline" className="border-red-300 text-red-600">
          Recarregar Página
        </Button>
      </div>
    );
  }

  const handleItemClick = (item: HabboEmotionClothingItem) => {
    onItemSelect(item);
    
    // Se o item tem cores disponíveis, abrir popover
    if (item.colors && item.colors.length > 1) {
      setColorPopoverOpen(item.code);
    }
  };

  const handleColorClick = (colorId: string, item: HabboEmotionClothingItem) => {
    onColorSelect(colorId, item);
    setColorPopoverOpen(null);
  };

  return (
    <div className="space-y-4">
      {/* Stats Header */}
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4 border-2 border-purple-200">
        <div className="flex justify-between items-center text-sm text-purple-700">
          <span className="flex items-center gap-2">
            <Shirt className="w-4 h-4" />
            <strong>HabboEmotion - {filteredItems.length} itens</strong>
          </span>
          <span>Categoria: {selectedCategory.toUpperCase()}</span>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
        {filteredItems.map((item) => (
          <Popover 
            key={item.code}
            open={colorPopoverOpen === item.code} 
            onOpenChange={(open) => setColorPopoverOpen(open ? item.code : null)}
          >
            <PopoverTrigger asChild>
              <Card 
                className={`group cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg border-2 ${
                  selectedItem === item.code ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                }`}
                onClick={() => handleItemClick(item)}
              >
                <CardContent className="p-2">
                  <div className="relative">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-12 object-contain rounded bg-gray-50"
                      style={{ imageRendering: 'pixelated' }}
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        // Fallback para imagem genérica
                        target.src = `https://habboemotion.com/usables/clothing/${item.part}_U_${item.code}.png`;
                      }}
                    />
                    
                    {/* Indicador de cores disponíveis */}
                    {item.colors && item.colors.length > 1 && (
                      <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {item.colors.length}
                      </div>
                    )}
                    
                    {/* Badge HC */}
                    {item.club === 'HC' && (
                      <div className="absolute bottom-0 right-0 bg-yellow-500 text-white text-xs px-1 rounded-tl">
                        HC
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-1 text-center">
                    <p className="text-xs text-gray-600 truncate" title={item.name}>
                      {item.code}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </PopoverTrigger>
            
            {/* Color Popover */}
            {item.colors && item.colors.length > 1 && (
              <PopoverContent className="w-48 p-3" align="center">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Cores Disponíveis
                  </h4>
                  <div className="grid grid-cols-5 gap-1">
                    {item.colors.map((colorId) => (
                      <Button
                        key={colorId}
                        size="sm"
                        variant={selectedColor === colorId ? "default" : "outline"}
                        className="w-8 h-8 p-0 text-xs"
                        onClick={() => handleColorClick(colorId, item)}
                      >
                        {colorId}
                      </Button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            )}
          </Popover>
        ))}
      </div>

      {/* No Results */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <Shirt className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma roupa encontrada</h3>
          <p className="text-gray-500">
            Não há itens na categoria <strong>{selectedCategory}</strong> para o gênero selecionado
          </p>
        </div>
      )}
    </div>
  );
};
