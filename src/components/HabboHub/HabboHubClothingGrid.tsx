import React, { useState, useMemo } from 'react';
import { useHabboData } from '@/hooks/useHabboData';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { RarityBadge } from './RarityBadge';
import { getItemVisualName } from '@/services/HabboData';

interface HabboHubClothingGridProps {
  activeCategory: string; // Alterado de selectedCategory para activeCategory
  selectedGender: 'M' | 'F' | 'U' | 'all';
  selectedColor: string;
  onItemSelect: (itemId: string) => void;
  selectedItem?: string;
}

export const HabboHubClothingGrid: React.FC<HabboHubClothingGridProps> = ({
  activeCategory,
  selectedGender,
  selectedColor,
  onItemSelect,
  selectedItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { selectedCategoryData, filteredSets, generateImageUrl } = useHabboData({
    selectedCategory: activeCategory,
    selectedGender,
    showClubOnly: false
  });

  const filteredItems = useMemo(() => {
    if (!selectedCategoryData) return [];

    let items = filteredSets;

    // Filter by search term (filtrar por ID)
    if (searchTerm) {
      items = items.filter(item =>
        item.id.toString().includes(searchTerm)
      );
    }

    return items;
  }, [filteredSets, searchTerm]);

  const getItemThumbnail = (item: any) => {
    // Para o grid, usar sempre 'ch' como tipo e uma cor padrão fixa (1408 - cinza claro)
    // conforme especificado para miniaturas consistentes
    const fixedColor = '1408'; // Cor padrão para grid - cinza claro
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=ch-${item.id}-${fixedColor}&size=s`;
  };

  // Se não há categoria selecionada
  if (!selectedCategoryData) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center text-white/70">
          <p>Selecione uma categoria para visualizar os itens</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={`Pesquisar itens de ${selectedCategoryData.label}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>
        <div className="text-sm text-white/70">
          {filteredItems.length} itens
        </div>
      </div>

      <div className="grid grid-cols-8 gap-2 max-h-96 overflow-y-auto">
        {filteredItems.map((item) => {
          const itemName = getItemVisualName(activeCategory, item.id);
          return (
            <button
              key={`${activeCategory}-${item.id}`}
              onClick={() => onItemSelect(item.id.toString())}
              title={itemName || `${activeCategory}-${item.id}`}
              className={`relative aspect-square bg-white/10 rounded border-2 transition-all duration-200 hover:bg-white/20 hover:scale-105 ${
                selectedItem === item.id.toString()
                  ? 'border-habbo-yellow shadow-lg scale-105'
                  : 'border-transparent'
              }`}
            >
              <img
                src={getItemThumbnail(item)}
                alt={`${selectedCategoryData.label} ${item.id}`}
                className="w-full h-full object-cover rounded"
                loading="lazy"
                onError={(e) => {
                  // Fallback para imagem de erro
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjMyIiB5PSIzMiIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSIjOUI5QkE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPkVSUk9SPC90ZXh0Pgo8L3RleHQ+Cjwvc3ZnPg==';
                }}
              />
              {/* Badge HC para itens do Habbo Club */}
              {item.club && (
                <RarityBadge rarity="CLUB" />
              )}
            </button>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center text-white/70 py-8">
          <p>Nenhum item encontrado para esta categoria</p>
        </div>
      )}
    </div>
  );
};