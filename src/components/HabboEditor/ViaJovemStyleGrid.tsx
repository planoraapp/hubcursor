
import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useFlashViaJovemCategory, ViaJovemFlashItem } from '@/hooks/useFlashAssetsViaJovem';
import ViaJovemStyleThumbnail from './ViaJovemStyleThumbnail';

interface ViaJovemStyleGridProps {
  selectedCategory: string;
  selectedGender: 'M' | 'F';
  selectedHotel: string;
  onItemSelect: (item: ViaJovemFlashItem, colorId: string) => void;
  selectedItem?: string;
  selectedColor?: string;
  className?: string;
}

const ViaJovemStyleGrid = ({
  selectedCategory,
  selectedGender,
  selectedHotel,
  onItemSelect,
  selectedItem = '',
  selectedColor = '1',
  className = ''
}: ViaJovemStyleGridProps) => {
  
  const { items, isLoading, error } = useFlashViaJovemCategory(selectedCategory, selectedGender);

  // Filter and optimize items for display
  const optimizedItems = useMemo(() => {
    if (!items) return [];
    
    // Limit to reasonable number for performance (first 100 items)
    return items.slice(0, 100);
  }, [items]);

  const handleItemClick = (item: ViaJovemFlashItem) => {
    console.log('🎯 [ViaJovemGrid] Item selecionado:', item.name, item.figureId);
    onItemSelect(item, selectedColor);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
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
    <div className={`${className}`}>
      {/* Simple header with count */}
      <div className="mb-4 text-center">
        <span className="text-sm text-gray-600">
          {optimizedItems.length} itens disponíveis
        </span>
      </div>

      {/* Clean grid of thumbnails */}
      <div className="max-h-96 overflow-y-auto p-2 bg-gradient-to-br from-gray-50 to-purple-50 rounded-lg">
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 justify-items-center">
          {optimizedItems.map((item) => (
            <ViaJovemStyleThumbnail
              key={item.id}
              item={item}
              colorId={selectedColor}
              gender={selectedGender}
              hotel={selectedHotel}
              isSelected={selectedItem === item.figureId}
              onClick={() => handleItemClick(item)}
            />
          ))}
        </div>
      </div>

      {/* Minimal footer */}
      <div className="mt-3 text-center">
        <span className="text-xs text-gray-500">
          Flash Assets • {optimizedItems.filter(i => i.club === 'hc').length} HC • 
          {optimizedItems.filter(i => i.club === 'normal').length} FREE
        </span>
      </div>
    </div>
  );
};

export default ViaJovemStyleGrid;
