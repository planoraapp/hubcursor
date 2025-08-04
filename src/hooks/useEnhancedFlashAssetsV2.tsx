import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  parseAssetCategory, 
  parseAssetGender, 
  parseAssetFigureId,
  generateCategoryColors,
  generateIsolatedThumbnail,
  formatAssetName,
  parseAssetRarity,
  getRarityStats,
  CATEGORY_METADATA,
  CATEGORY_SECTIONS
} from '@/lib/enhancedCategoryMapperV2';

export interface EnhancedFlashAssetV2 {
  id: string;
  name: string;
  category: string;
  gender: 'M' | 'F' | 'U';
  figureId: string;
  colors: string[];
  thumbnailUrl: string;
  club: 'hc' | 'normal';
  rarity: 'nft' | 'hc' | 'ltd' | 'rare' | 'common';
  swfName: string;
  source: 'flash-assets-enhanced-v2';
}

interface FetchParams {
  category?: string;
  gender?: 'M' | 'F';
  search?: string;
  rarity?: 'nft' | 'hc' | 'ltd' | 'rare' | 'common';
  limit?: number;
}

const fetchEnhancedFlashAssetsV2 = async (params: FetchParams): Promise<EnhancedFlashAssetV2[]> => {
  console.log('🌐 [EnhancedFlashAssetsV2] Buscando assets com sistema COMPLETO', params);
  
  try {
    const { data, error } = await supabase.functions.invoke('flash-assets-clothing', {
      body: { 
        limit: params.limit || 3000, 
        category: params.category || 'all', 
        search: params.search || '',
        gender: params.gender || 'M',
        rarity: params.rarity || 'all'
      }
    });

    if (error) {
      console.error('❌ [EnhancedFlashAssetsV2] Supabase function error:', error);
      throw error;
    }

    if (!data || !data.assets || !Array.isArray(data.assets)) {
      console.error('❌ [EnhancedFlashAssetsV2] Invalid response format:', data);
      throw new Error('Invalid response format from enhanced flash assets V2');
    }

    console.log(`✅ [EnhancedFlashAssetsV2] Successfully fetched ${data.assets.length} enhanced assets`);
    console.log(`📊 [EnhancedFlashAssetsV2] Metadata:`, data.metadata);
    
    return data.assets;
    
  } catch (error) {
    console.error('❌ [EnhancedFlashAssetsV2] Error:', error);
    throw error;
  }
};

interface UseEnhancedFlashAssetsV2Params {
  category?: string;
  gender?: 'M' | 'F';
  search?: string;
  rarity?: 'nft' | 'hc' | 'ltd' | 'rare' | 'common';
}

export const useEnhancedFlashAssetsV2 = (params: UseEnhancedFlashAssetsV2Params) => {
  const [categoryStats, setCategoryStats] = useState<Record<string, number>>({});
  const [rarityStats, setRarityStats] = useState<Record<string, number>>({});
  const [sectionStats, setSectionStats] = useState<Record<string, number>>({});

  const query = useQuery({
    queryKey: ['enhanced-flash-assets-v2', params],
    queryFn: () => fetchEnhancedFlashAssetsV2(params),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  useEffect(() => {
    if (query.data) {
      // Calcular estatísticas COMPLETAS
      const catStats = query.data.reduce((acc, asset) => {
        acc[asset.category] = (acc[asset.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const rarStats = getRarityStats(query.data);
      
      // Calcular estatísticas por seção
      const secStats = Object.entries(CATEGORY_SECTIONS).reduce((acc, [sectionId, section]) => {
        acc[sectionId] = section.categories.reduce((sum, cat) => sum + (catStats[cat] || 0), 0);
        return acc;
      }, {} as Record<string, number>);

      setCategoryStats(catStats);
      setRarityStats(rarStats);
      setSectionStats(secStats);

      console.log('📊 [EnhancedFlashAssetsV2] Estatísticas COMPLETAS:', {
        totalAssets: query.data.length,
        categorias: Object.keys(catStats).length,
        categoryStats: catStats,
        rarityStats: rarStats,
        sectionStats: secStats,
        novasCategorias: ['fx', 'pets', 'dance'].filter(cat => catStats[cat] > 0)
      });
    }
  }, [query.data]);

  return {
    items: query.data || [],
    categoryStats,
    rarityStats,
    sectionStats,
    totalItems: query.data?.length || 0,
    isLoading: query.isLoading,
    error: query.error,
    isSuccess: query.isSuccess,
    // Métodos auxiliares
    getCategoryMetadata: (category: string) => CATEGORY_METADATA[category as keyof typeof CATEGORY_METADATA],
    getSectionMetadata: (sectionId: string) => CATEGORY_SECTIONS[sectionId as keyof typeof CATEGORY_SECTIONS],
    getAllSections: () => CATEGORY_SECTIONS
  };
};

// Hook específico por categoria
export const useEnhancedFlashCategoryV2 = (categoryId: string, gender: 'M' | 'F') => {
  return useEnhancedFlashAssetsV2({
    category: categoryId,
    gender,
  });
};

// Hook específico por seção
export const useEnhancedFlashSectionV2 = (sectionId: string, gender: 'M' | 'F') => {
  const section = CATEGORY_SECTIONS[sectionId as keyof typeof CATEGORY_SECTIONS];
  const [allItems, setAllItems] = useState<EnhancedFlashAssetV2[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!section) return;
    
    const fetchSectionData = async () => {
      setIsLoading(true);
      const promises = section.categories.map(category => 
        fetchEnhancedFlashAssetsV2({ category, gender })
      );
      
      const results = await Promise.all(promises);
      const combined = results.flat();
      setAllItems(combined);
      setIsLoading(false);
    };
    
    fetchSectionData();
  }, [sectionId, gender]);
  
  return {
    items: allItems,
    isLoading,
    section
  };
};
