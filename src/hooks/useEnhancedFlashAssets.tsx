
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

const fetchEnhancedFlashAssets = async (limit: number = 3000): Promise<EnhancedFlashAsset[]> => {
  console.log(`🌐 [EnhancedFlashAssets] Buscando ${limit} assets com sistema inteligente`);
  
  try {
    const { data, error } = await supabase.functions.invoke('flash-assets-clothing', {
      body: { limit, category: 'all', search: '' }
    });

    if (error) {
      console.error('❌ [EnhancedFlashAssets] Supabase function error:', error);
      throw error;
    }

    if (!data || !data.assets || !Array.isArray(data.assets)) {
      console.error('❌ [EnhancedFlashAssets] Invalid response format:', data);
      throw new Error('Invalid response format from enhanced flash assets');
    }

    console.log(`✅ [EnhancedFlashAssets] Successfully fetched ${data.assets.length} enhanced assets`);
    console.log(`📊 [EnhancedFlashAssets] Metadata:`, data.metadata);
    
    return data.assets;
    
  } catch (error) {
    console.error('❌ [EnhancedFlashAssets] Error:', error);
    throw error;
  }
};

export const useEnhancedFlashAssets = (limit: number = 3000) => {
  const [categoryStats, setCategoryStats] = useState<Record<string, number>>({});
  const [rarityStats, setRarityStats] = useState<Record<string, number>>({});

  const query = useQuery({
    queryKey: ['enhanced-flash-assets', limit],
    queryFn: () => fetchEnhancedFlashAssets(limit),
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

export const useEnhancedFlashAssetsByCategory = (
  categoryId: string, 
  gender: 'M' | 'F' = 'M',
  limit: number = 100
) => {
  const { items, isLoading, error } = useEnhancedFlashAssets();
  const [filteredItems, setFilteredItems] = useState<EnhancedFlashAsset[]>([]);

  useEffect(() => {
    if (items.length > 0 && categoryId) {
      const filtered = items
        .filter(item => item.category === categoryId)
        .filter(item => item.gender === gender || item.gender === 'U')
        .slice(0, limit);
      
      setFilteredItems(filtered);
      
      console.log(`🔍 [EnhancedFlashAssetsByCategory] Filtro aplicado:`, {
        categoria: categoryId,
        genero: gender,
        totalItens: items.length,
        itensFiltrados: filtered.length,
        limit
      });
    }
  }, [items, categoryId, gender, limit]);

  return {
    items: filteredItems,
    isLoading,
    error
  };
};
