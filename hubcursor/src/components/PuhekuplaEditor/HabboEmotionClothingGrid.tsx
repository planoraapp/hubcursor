import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Palette } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useHabboEmotionClothing } from '@/hooks/useHabboEmotionClothing';
import { useUnifiedClothingAPI, UnifiedClothingItem } from '@/hooks/useUnifiedClothingAPI';
import { getColorById } from '@/data/habboColors';

interface HabboEmotionClothingGridProps {
  selectedCategory: string;
  selectedGender: 'M' | 'F';
  onItemSelect: (item: UnifiedClothingItem) => void;
  onColorSelect: (colorId: string, item: UnifiedClothingItem) => void;
  selectedItem?: string;
  selectedColor?: string;
}

const HabboEmotionClothingGrid: React.FC<HabboEmotionClothingGridProps> = ({
  selectedCategory,
  selectedGender,
  onItemSelect,
  onColorSelect,
  selectedItem,
  selectedColor
}) => {
  const [search, setSearch] = useState('');
  const { data: clothing, isLoading, error } = useHabboEmotionClothing(
    2000,
    selectedCategory === 'all' ? undefined : selectedCategory,
    selectedGender
  );

  const filteredClothing = React.useMemo(() => {
    if (!clothing) return [];
    return clothing.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase())
    );
  }, [clothing, search]);

  const handleItemSelect = (item: any) => {
    onItemSelect({
      id: item.id.toString(),
      name: item.name,
      category: item.category,
      gender: item.gender,
      figureId: item.code || item.id.toString(),
      colors: item.colors,
      imageUrl: item.imageUrl,
      club: item.club === 'HC' ? 'HC' : 'FREE',
      source: 'habbo-emotion' as const
    });
  };

  const handleColorSelect = (colorId: string, item: any) => {
    onColorSelect(colorId, {
      id: item.id.toString(),
      name: item.name,
      category: item.category,
      gender: item.gender,
      figureId: item.code || item.id.toString(),
      colors: item.colors,
      imageUrl: item.imageUrl,
      club: item.club === 'HC' ? 'HC' : 'FREE',
      source: 'habbo-emotion' as const
    });
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-bold text-red-600 mb-2">Erro ao Carregar Roupas</h3>
        <p className="text-gray-600 mb-4">Não foi possível carregar as roupas do HabboEmotion.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar roupas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 20 }, (_, i) => (
            <Skeleton key={i} className="aspect-square rounded" />
          ))}
        </div>
      ) : filteredClothing.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhuma roupa encontrada</h3>
          <p className="text-gray-500">Tente ajustar os termos de busca</p>
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-2">
          {filteredClothing.map((item) => (
            <div key={item.id} className="relative">
              <button
                onClick={() => handleItemSelect(item)}
                className={`aspect-square w-full rounded overflow-hidden relative ${selectedItem === item.code ? 'ring-2 ring-purple-500' : 'hover:opacity-80'}`}
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </button>
              {selectedItem === item.code && (
                <Badge className="absolute top-1 right-1 bg-purple-600 text-white text-xs">
                  Selecionado
                </Badge>
              )}
              <div className="absolute bottom-0 left-0 w-full bg-black/50 text-white text-xs p-1 flex items-center justify-between">
                <span>{item.name}</span>
                <Palette className="w-4 h-4 cursor-pointer" onClick={(e) => {
                  e.stopPropagation();
                  handleColorSelect(item.colors[0], item);
                }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HabboEmotionClothingGrid;
