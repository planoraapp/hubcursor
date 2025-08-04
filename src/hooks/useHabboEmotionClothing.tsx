
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getColorById } from '@/data/habboColors';

export interface HabboEmotionClothingItem {
  id: number;
  code: string;
  part: string;
  gender: 'M' | 'F' | 'U';
  date: string;
  colors: string[];
  colorDetails?: Array<{
    id: string;
    hex: string;
    name?: string;
    isHC: boolean;
    isDefault: boolean;
  }>;
  imageUrl: string;
  club: 'HC' | 'FREE';
  source: 'habboemotion-scraping' | 'enhanced-generation' | 'error-fallback';
  name: string;
  category: string;
}

const fetchHabboEmotionClothing = async (
  limit: number = 2000, 
  category?: string, 
  gender: 'M' | 'F' | 'U' = 'U'
): Promise<HabboEmotionClothingItem[]> => {
  console.log(`🌐 [HabboEmotion] Fetching real clothing data - limit: ${limit}, category: ${category}, gender: ${gender}`);
  
  try {
    const { data, error } = await supabase.functions.invoke('habbo-emotion-clothing', {
      body: { limit, category, gender }
    });

    if (error) {
      console.error('❌ [HabboEmotion] Supabase function error:', error);
      throw error;
    }

    if (!data || !data.items || !Array.isArray(data.items)) {
      console.error('❌ [HabboEmotion] Invalid response format:', data);
      throw new Error('Invalid response format from HabboEmotion system');
    }

    console.log(`✅ [HabboEmotion] Successfully fetched ${data.items.length} real items from ${data.metadata?.source}`);
    console.log(`📊 [HabboEmotion] Metadata:`, data.metadata);
    
    // Process and enrich the items
    const enrichedItems = data.items.map((item: any) => {
      const colorDetails = item.colors?.map((colorId: string) => {
        const colorInfo = getColorById(colorId);
        return {
          id: colorId,
          hex: colorInfo?.hex || '#DDDDDD',
          name: colorInfo?.name || `Color ${colorId}`,
          isHC: colorInfo?.isHC || false,
          isDefault: colorId === (item.colors[0] || '1')
        };
      }) || [];

      return {
        id: item.id || Math.random(),
        code: item.code || '',
        part: item.part || 'ch',
        gender: item.gender || 'U',
        date: item.date || '',
        colors: Array.isArray(item.colors) ? item.colors : ['1', '2', '3'],
        colorDetails,
        imageUrl: item.imageUrl || generateFallbackImageUrl(item.code, item.part, item.id),
        club: item.club || 'FREE',
        source: item.source || 'error-fallback',
        name: item.name || item.code || `Item ${item.id}`,
        category: item.category || item.part || 'ch'
      };
    });
    
    return enrichedItems;
    
  } catch (error) {
    console.error('❌ [HabboEmotion] Error:', error);
    throw error;
  }
};

const generateFallbackImageUrl = (code: string, part: string, itemId: number): string => {
  const categoryNames: Record<string, string> = {
    'hr': 'hair',
    'ch': 'shirt', 
    'lg': 'trousers',
    'sh': 'shoes',
    'ha': 'hat',
    'ea': 'glasses',
    'cc': 'jacket',
    'ca': 'chest_accessory',
    'wa': 'belt',
    'fa': 'face_accessory',
    'cp': 'chest_print',
    'hd': 'head'
  };
  
  const categoryName = categoryNames[part] || 'shirt';
  const spriteName = code.includes('_U_') ? code : `${categoryName}_U_${code}`;
  
  return `https://files.habboemotion.com/habbo-assets/sprites/clothing/${spriteName}/h_std_${part}_${itemId}_2_0.png`;
};

export const useHabboEmotionClothing = (
  limit: number = 2000, 
  category?: string, 
  gender: 'M' | 'F' | 'U' = 'U'
) => {
  return useQuery({
    queryKey: ['habbo-emotion-clothing-real', limit, category, gender],
    queryFn: () => fetchHabboEmotionClothing(limit, category, gender),
    staleTime: 1000 * 60 * 60 * 2, // 2 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

// Hook for specific categories
export const useHabboEmotionClothingByCategory = (
  category: string,
  gender: 'M' | 'F' | 'U' = 'U',
  limit: number = 1000
) => {
  return useQuery({
    queryKey: ['habbo-emotion-clothing-category-real', category, gender, limit],
    queryFn: () => fetchHabboEmotionClothing(limit, category, gender),
    staleTime: 1000 * 60 * 60 * 1, // 1 hour
    gcTime: 1000 * 60 * 60 * 12, // 12 hours
    retry: 2,
    enabled: !!category && category !== 'all'
  });
};

// Manual synchronization function
export const triggerHabboEmotionSync = async () => {
  try {
    console.log('🔄 [HabboEmotion] Triggering real synchronization...');
    
    const { data, error } = await supabase.functions.invoke('sync-habbo-emotion-data');
    
    if (error) {
      console.error('❌ [HabboEmotion] Sync error:', error);
      throw error;
    }
    
    console.log('✅ [HabboEmotion] Sync completed:', data);
    return data;
  } catch (error) {
    console.error('❌ [HabboEmotion] Sync failed:', error);
    throw error;
  }
};
