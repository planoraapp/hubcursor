
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
  paletteId?: string;
}

export interface CategoryData {
  id: string;
  name: string;
  icon: string;
  items: OfficialClothingItem[];
}

// Enhanced category mapping with better icons
const OFFICIAL_CATEGORIES = {
  'hd': { name: 'Rostos', icon: '😊' },
  'hr': { name: 'Cabelos', icon: '💇' },
  'ha': { name: 'Chapéus', icon: '🎩' },
  'he': { name: 'Acess. Cabelo', icon: '✨' },
  'ea': { name: 'Óculos', icon: '👓' },
  'fa': { name: 'Rosto', icon: '🎭' },
  'ch': { name: 'Camisetas', icon: '👕' },
  'cp': { name: 'Estampas', icon: '🎨' },
  'cc': { name: 'Casacos', icon: '🧥' },
  'ca': { name: 'Acessórios', icon: '💍' },
  'lg': { name: 'Calças', icon: '👖' },
  'sh': { name: 'Sapatos', icon: '👟' },
  'wa': { name: 'Cintos', icon: '🔗' }
};

export const useOfficialClothingIndex = (selectedGender: 'M' | 'F') => {
  const { data, isLoading, error } = useOfficialFigureData();

  const categorizedItems = useMemo(() => {
    if (!data?.figureParts) {
            return {};
    }

    console.log('📋 [OfficialClothingIndex] Processing figure data with gender filtering:', {
      availableCategories: Object.keys(data.figureParts),
      selectedGender,
      hasColorPalettes: Object.keys(data.colorPalettes || {}).length > 0
    });

    const result: Record<string, CategoryData> = {};

    Object.entries(data.figureParts).forEach(([categoryId, items]) => {
      const categoryInfo = OFFICIAL_CATEGORIES[categoryId as keyof typeof OFFICIAL_CATEGORIES];
      if (!categoryInfo) {
                return;
      }

      // Enhanced gender filtering with detailed logging
      const filteredItems = items
        .filter(item => {
          const genderMatch = item.gender === selectedGender || item.gender === 'U';
          if (!genderMatch) {
            console.log(`🚫 [OfficialClothingIndex] Gender filter: ${categoryId}-${item.id} (${item.gender}) excluded for ${selectedGender}`);
          }
          return genderMatch;
        })
        .map(item => ({
          id: `${categoryId}_${item.id}`,
          category: categoryId,
          figureId: item.id,
          gender: item.gender,
          club: item.club === '2' ? 'HC' as const : 'FREE' as const,
          colors: item.colors || ['1'],
          name: `${categoryInfo.name} ${item.id}`,
          paletteId: item.paletteId
        }));

      if (filteredItems.length > 0) {
        result[categoryId] = {
          id: categoryId,
          name: categoryInfo.name,
          icon: categoryInfo.icon,
          items: filteredItems
        };
        
        console.log(`✅ [OfficialClothingIndex] Category ${categoryId} (${categoryInfo.name}): ${filteredItems.length} items for ${selectedGender}`);
      } else {
              }
    });

    const totalCategories = Object.keys(result).length;
    const totalItems = Object.values(result).reduce((sum, cat) => sum + cat.items.length, 0);
    
    console.log('✅ [OfficialClothingIndex] Final categorized data with gender filtering:', {
      totalCategories,
      totalItems,
      categories: Object.keys(result),
      gender: selectedGender
    });
    
    return result;
  }, [data, selectedGender]);

  return {
    categories: categorizedItems,
    colorPalettes: data?.colorPalettes || {},
    isLoading,
    error,
    totalCategories: Object.keys(categorizedItems).length,
    totalItems: Object.values(categorizedItems).reduce((sum, cat) => sum + cat.items.length, 0)
  };
};
