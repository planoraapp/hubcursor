
import { useQuery } from '@tanstack/react-query';
import { useFlashAssetsClothing } from './useFlashAssetsClothing';
import { useHabboEmotionClothing } from './useHabboEmotionClothing';
import { supabase } from '@/integrations/supabase/client';
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
  source: 'flash-assets' | 'habbo-emotion' | 'unified-api' | 'cache';
}

interface UseUnifiedClothingOptions {
  limit?: number;
  category?: string;
  search?: string;
  gender?: 'M' | 'F' | 'U';
}

export const useUnifiedClothingAPI = (options: UseUnifiedClothingOptions = {}) => {
  const { limit = 500, category = 'all', search = '', gender = 'U' } = options;

  // Primeira prioridade: Flash Assets via Supabase
  const { 
    data: flashAssets = [], 
    isLoading: flashLoading,
    error: flashError 
  } = useFlashAssetsClothing({ limit, category, search, gender });

  // Segunda prioridade: HabboEmotion
  const { 
    data: habboEmotionItems = [], 
    isLoading: emotionLoading,
    error: emotionError 
  } = useHabboEmotionClothing(limit, category, gender);

  // Terceira prioridade: API Unificada
  const { 
    data: unifiedItems = [], 
    isLoading: unifiedLoading,
    error: unifiedError 
  } = useQuery({
    queryKey: ['unified-clothing', { limit, category, gender, search }],
    queryFn: async () => {
      console.log('🌐 [UnifiedClothing] Calling habbo-unified-api edge function');
      const { data, error } = await supabase.functions.invoke('habbo-unified-api', {
        body: { 
          endpoint: 'clothing',
          action: 'search',
          params: { limit, category, gender, search }
        }
      });

      if (error) {
        console.error('❌ [UnifiedClothing] Edge function error:', error);
        throw error;
      }

      console.log(`✅ [UnifiedClothing] Edge function returned ${data?.clothing?.length || 0} items`);
      return data?.clothing || [];
    },
    enabled: flashAssets.length === 0 && habboEmotionItems.length === 0,
    staleTime: 10 * 60 * 1000,
  });

  // Processar e unificar os dados
  const unifiedData = useMemo(() => {
    console.log('🔄 [UnifiedClothing] Processing unified data:');
    console.log(`- Flash Assets: ${flashAssets.length} items`);
    console.log(`- HabboEmotion: ${habboEmotionItems.length} items`);
    console.log(`- Unified API: ${unifiedItems.length} items`);

    let result: UnifiedClothingItem[] = [];

    // Prioridade 1: Flash Assets
    if (flashAssets.length > 0) {
      result = flashAssets.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        gender: item.gender,
        figureId: item.figureId,
        colors: item.colors,
        imageUrl: item.imageUrl,
        club: item.club === 'HC' ? 'HC' : 'FREE',
        source: 'flash-assets' as const
      }));
      console.log(`✅ [UnifiedClothing] Using Flash Assets: ${result.length} items`);
      return result;
    }

    // Prioridade 2: HabboEmotion
    if (habboEmotionItems.length > 0) {
      result = habboEmotionItems.map(item => ({
        id: item.id.toString(),
        name: item.name,
        category: item.category,
        gender: item.gender,
        figureId: item.code || item.id.toString(),
        colors: item.colors,
        imageUrl: item.imageUrl,
        club: item.club === 'HC' ? 'HC' : 'FREE',
        source: 'habbo-emotion' as const
      }));
      console.log(`✅ [UnifiedClothing] Using HabboEmotion: ${result.length} items`);
      return result;
    }

    // Prioridade 3: Edge Function
    if (unifiedItems.length > 0) {
      result = unifiedItems.map((item: any) => ({
        id: item.item_id?.toString() || item.id,
        name: item.code || item.name || 'Item',
        category: item.part || item.category || 'ch',
        gender: (item.gender || 'U') as 'M' | 'F' | 'U',
        figureId: item.item_id?.toString() || item.id,
        colors: item.colors || ['1', '2', '3'],
        imageUrl: item.image_url || '',
        club: item.club === 'HC' ? 'HC' : 'FREE',
        source: 'unified-api' as const
      }));
      console.log(`✅ [UnifiedClothing] Using Unified API: ${result.length} items`);
      return result;
    }

    console.log('⚠️ [UnifiedClothing] No data from any source');
    return [];
  }, [flashAssets, habboEmotionItems, unifiedItems]);

  const isLoading = flashLoading || emotionLoading || unifiedLoading;
  const error = flashError || emotionError || unifiedError;

  return {
    data: unifiedData,
    isLoading,
    error,
    source: unifiedData.length > 0 ? unifiedData[0].source : null,
    stats: {
      flashAssets: flashAssets.length,
      habboEmotion: habboEmotionItems.length,
      unifiedApi: unifiedItems.length,
      total: unifiedData.length
    }
  };
};

// Export alias for backward compatibility
export const useUnifiedClothing = useUnifiedClothingAPI;
