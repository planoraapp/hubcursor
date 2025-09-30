import { useFlashAssetsClothing } from './useFlashAssetsClothing';
import { useMemo } from 'react';

export interface UnifiedClothingItem {
  id: string;
  name: string;
  category: string;
  gender: 'M' | 'F' | 'U';
  figureId: string;
  colors: string[];
  imageUrl: string;
  club: 'HC' | 'FREE';
  source: 'flash-assets' | 'cache';
}

interface UseUnifiedClothingOptions {
  limit?: number;
  category?: string;
  search?: string;
  gender?: 'M' | 'F' | 'U';
}

export const useUnifiedClothingAPI = (options: UseUnifiedClothingOptions = {}) => {
  const { limit = 500, category = 'all', search = '', gender = 'U' } = options;

  // Usar apenas Flash Assets (fonte principal)
  const { 
    data: clothingItems = [], 
    isLoading,
    error 
  } = useFlashAssetsClothing({ limit, category, search, gender });

  // Processar dados unificados
  const unifiedData = useMemo(() => {
    return clothingItems.map((item: any) => ({
      id: item.id || item.figureId,
      name: item.name,
      category: item.category || 'unknown',
      gender: item.gender || 'U',
      figureId: item.figureId,
      colors: item.colors || [],
      imageUrl: item.imageUrl,
      club: item.club || 'FREE',
      source: 'flash-assets' as const
    }));
  }, [clothingItems]);

  return {
    data: unifiedData,
    isLoading,
    error,
    count: unifiedData.length
  };
};