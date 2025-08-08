
import { useMemo } from 'react';
import { useOfficialFigureData } from './useFigureDataOfficial';

export interface OfficialClothingItem {
  id: string;
  category: string;
  figureId: string;
  gender: 'M' | 'F' | 'U';
  club: 'FREE' | 'HC';
  colors: string[];
  name: string;
}

export interface CategoryData {
  id: string;
  name: string;
  icon: string;
  items: OfficialClothingItem[];
}

// Mapeamento oficial das categorias baseado nos exemplos
const OFFICIAL_CATEGORIES = {
  'hd': { name: 'Rostos', icon: '👤' },
  'hr': { name: 'Cabelos', icon: '💇' },
  'ha': { name: 'Chapéus', icon: '🎩' },
  'he': { name: 'Acessórios Cabelo', icon: '✨' },
  'ea': { name: 'Óculos', icon: '👓' },
  'fa': { name: 'Rosto', icon: '😊' },
  'ch': { name: 'Camisetas', icon: '👕' },
  'cp': { name: 'Estampas', icon: '🎨' },
  'cc': { name: 'Casacos', icon: '🧥' },
  'ca': { name: 'Acessórios', icon: '💍' },
  'lg': { name: 'Calças', icon: '👖' },
  'sh': { name: 'Sapatos', icon: '👟' },
  'wa': { name: 'Cintos', icon: '🔗' }
};

export const useOfficialClothingIndex = (selectedGender: 'M' | 'F') => {
  const { data: figureData, isLoading, error } = useOfficialFigureData();

  const categorizedItems = useMemo(() => {
    if (!figureData) return {};

    const result: Record<string, CategoryData> = {};

    Object.entries(figureData).forEach(([categoryId, items]) => {
      // Filtrar apenas categorias oficiais conhecidas
      const categoryInfo = OFFICIAL_CATEGORIES[categoryId as keyof typeof OFFICIAL_CATEGORIES];
      if (!categoryInfo) return;

      // Filtrar itens por gênero
      const filteredItems = items
        .filter(item => item.gender === selectedGender || item.gender === 'U')
        .map(item => ({
          id: `${categoryId}_${item.id}`,
          category: categoryId,
          figureId: item.id,
          gender: item.gender,
          club: item.club === '1' ? 'HC' as const : 'FREE' as const,
          colors: item.colors || ['1'],
          name: `${categoryInfo.name} ${item.id}`
        }));

      if (filteredItems.length > 0) {
        result[categoryId] = {
          id: categoryId,
          name: categoryInfo.name,
          icon: categoryInfo.icon,
          items: filteredItems
        };
      }
    });

    console.log('✅ [OfficialClothingIndex] Categorias organizadas:', Object.keys(result));
    return result;
  }, [figureData, selectedGender]);

  return {
    categories: categorizedItems,
    isLoading,
    error,
    totalCategories: Object.keys(categorizedItems).length,
    totalItems: Object.values(categorizedItems).reduce((sum, cat) => sum + cat.items.length, 0)
  };
};
