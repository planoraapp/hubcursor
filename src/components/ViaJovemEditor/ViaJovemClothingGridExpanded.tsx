import React, { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useFlashViaJovemCategory, ViaJovemFlashItem } from '@/hooks/useFlashAssetsViaJovem';
import ViaJovemStyleThumbnail from '@/components/HabboEditor/ViaJovemStyleThumbnail';

interface ViaJovemClothingGridExpandedProps {
  selectedCategory: string;
  selectedGender: 'M' | 'F';
  selectedHotel: string;
  onItemSelect: (item: ViaJovemFlashItem, colorId: string) => void;
  selectedItem?: string;
  selectedColor?: string;
  className?: string;
}

const ViaJovemClothingGridExpanded = ({
  selectedCategory,
  selectedGender,
  selectedHotel,
  onItemSelect,
  selectedItem = '',
  selectedColor = '1',
  className = ''
}: ViaJovemClothingGridExpandedProps) => {
  const [currentColorSelections, setCurrentColorSelections] = useState<Record<string, string>>({});
  const { items, isLoading, error } = useFlashViaJovemCategory(selectedCategory, selectedGender);

  const optimizedItems = useMemo(() => {
    if (!items) return [];
    return items
      .sort((a, b) => parseInt(a.figureId) - parseInt(b.figureId))
      .slice(0, 100);
  }, [items]);

  const handleItemClick = (item: ViaJovemFlashItem) => {
    const colorToUse = currentColorSelections[item.id] || selectedColor || '1';
    onItemSelect(item, colorToUse);
  };

  const handleColorChange = (item: ViaJovemFlashItem, colorId: string) => {
    setCurrentColorSelections(prev => ({
      ...prev,
      [item.id]: colorId
    }));

    if (selectedItem === item.figureId) {
      onItemSelect(item, colorId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Carregando assets...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 font-medium">Erro ao carregar assets</div>
        <div className="text-gray-600 text-sm mt-2">Verifique sua conexão</div>
      </div>
    );
  }

  if (!optimizedItems.length) {
    return (
      <div className="text-center p-8">
        <div className="text-gray-500 font-medium">Nenhum asset encontrado</div>
        <div className="text-gray-400 text-sm mt-2">
          Categoria: {selectedCategory.toUpperCase()} - Gênero: {selectedGender}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      
      <div className="mb-4 text-center">
        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
          {optimizedItems.length} itens • {optimizedItems.filter(i => i.club === 'HC').length} HC
        </span>
      </div>

      <div className="max-h-96 overflow-y-auto p-3 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border">
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3 justify-items-center">
          {optimizedItems.map((item) => {
            const itemColor = currentColorSelections[item.id] || selectedColor || '1';
            return (
              <ViaJovemStyleThumbnail
                key={item.id}
                item={item}
                colorId={itemColor}
                gender={selectedGender}
                hotel={selectedHotel}
                isSelected={selectedItem === item.figureId}
                onClick={() => handleItemClick(item)}
                className="transform transition-all duration-200 hover:z-10"
              />
            );
          })}
        </div>
      </div>

      <div className="mt-3 text-center">
        <span className="text-xs text-gray-500">
          Clique em uma peça para aplicar • Clique novamente para escolher cores
        </span>
      </div>
    </div>
  );
};

export default ViaJovemClothingGridExpanded;
