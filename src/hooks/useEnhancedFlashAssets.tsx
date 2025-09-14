
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
  parseAssetRarity
} from '@/lib/enhancedCategoryMapper';

export interface EnhancedFlashAsset {
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
  source: 'flash-assets-enhanced';
}

const fetchEnhancedFlashAssets = async (params: {
  category?: string;
  gender?: 'M' | 'F';
  search?: string;
  limit?: number;
}): Promise<EnhancedFlashAsset[]> => {
    try {
    const { data, error } = await supabase.functions.invoke('flash-assets-clothing', {
      body: { 
        limit: params.limit || 3000, 
        category: params.category || 'all', 
        search: params.search || '',
        gender: params.gender || 'M'
      }
    });

    if (error) {
            throw error;
    }

    if (!data || !data.assets || !Array.isArray(data.assets)) {
            throw new Error('Invalid response format from enhanced flash assets');
    }

            return data.assets;
    
  } catch (error) {
        throw error;
  }
};

export const useEnhancedFlashAssets = (params: {
  category?: string;
  gender?: 'M' | 'F';
  search?: string;
}) => {
  const [categoryStats, setCategoryStats] = useState<Record<string, number>>({});
  const [rarityStats, setRarityStats] = useState<Record<string, number>>({});

  const query = useQuery({
    queryKey: ['enhanced-flash-assets', params],
    queryFn: () => fetchEnhancedFlashAssets(params),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  useEffect(() => {
    if (query.data) {
      // Calcular estatísticas
      const catStats = query.data.reduce((acc, asset) => {
        acc[asset.category] = (acc[asset.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const rarStats = query.data.reduce((acc, asset) => {
        acc[asset.rarity] = (acc[asset.rarity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setCategoryStats(catStats);
      setRarityStats(rarStats);

      console.log('📊 [EnhancedFlashAssets] Estatísticas atualizadas:', {
        totalAssets: query.data.length,
        categorias: Object.keys(catStats).length,
        categoryStats: catStats,
        rarityStats: rarStats
      });
    }
  }, [query.data]);

  return {
    items: query.data || [],
    categoryStats,
    rarityStats,
    totalItems: query.data?.length || 0,
    isLoading: query.isLoading,
    error: query.error,
    isSuccess: query.isSuccess
  };
};
