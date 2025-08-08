
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

// Mapeamento oficial das categorias baseado nos dados reais do Habbo
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
    if (!figureData) {
      console.log('📋 [OfficialClothingIndex] No figure data available yet');
      return {};
    }

    console.log('📋 [OfficialClothingIndex] Processing figure data:', {
      availableCategories: Object.keys(figureData),
      selectedGender
    });

    const result: Record<string, CategoryData> = {};

    Object.entries(figureData).forEach(([categoryId, items]) => {
      // Filtrar apenas categorias oficiais conhecidas
      const categoryInfo = OFFICIAL_CATEGORIES[categoryId as keyof typeof OFFICIAL_CATEGORIES];
      if (!categoryInfo) {
        console.log(`⚠️ [OfficialClothingIndex] Skipping unknown category: ${categoryId}`);
        return;
      }

      // Filtrar itens por gênero
      const filteredItems = items
        .filter(item => {
          const genderMatch = item.gender === selectedGender || item.gender === 'U';
          if (!genderMatch) {
            console.log(`🚫 [OfficialClothingIndex] Filtering out ${categoryId}-${item.id} (gender: ${item.gender})`);
          }
          return genderMatch;
        })
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
        
        console.log(`✅ [OfficialClothingIndex] Category ${categoryId} (${categoryInfo.name}): ${filteredItems.length} items`);
      } else {
        console.log(`📋 [OfficialClothingIndex] Category ${categoryId} has no items for gender ${selectedGender}`);
      }
    });

    const totalCategories = Object.keys(result).length;
    const totalItems = Object.values(result).reduce((sum, cat) => sum + cat.items.length, 0);
    
    console.log('✅ [OfficialClothingIndex] Final categorized data:', {
      totalCategories,
      totalItems,
      categories: Object.keys(result),
      gender: selectedGender
    });
    
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
