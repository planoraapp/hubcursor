
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HabboEmotionClothingItem {
  id: number;
  code: string;
  part: string;
  gender: 'M' | 'F' | 'U';
  date: string;
  colors: string[];
  imageUrl: string;
  club: 'HC' | 'FREE';
  source: 'habboemotion';
}

const fetchHabboEmotionClothing = async (limit: number = 300): Promise<HabboEmotionClothingItem[]> => {
  console.log(`🌐 [HabboEmotion Hook] Fetching clothing data with limit: ${limit}`);
  
  try {
    const { data, error } = await supabase.functions.invoke('habbo-emotion-clothing', {
      body: { limit }
    });

    if (error) {
      console.error('❌ [HabboEmotion Hook] Supabase function error:', error);
      throw error;
    }

    if (!data || !data.items || !Array.isArray(data.items)) {
      console.error('❌ [HabboEmotion Hook] Invalid response format:', data);
      throw new Error('Invalid response format from HabboEmotion API');
    }

    console.log(`✅ [HabboEmotion Hook] Successfully fetched ${data.items.length} items`);
    console.log(`📊 [HabboEmotion Hook] Source: ${data.metadata?.source}`);
    
    return data.items;
    
  } catch (error) {
    console.error('❌ [HabboEmotion Hook] Error:', error);
    throw error;
  }
};

export const useHabboEmotionClothing = (limit: number = 300) => {
  return useQuery({
    queryKey: ['habbo-emotion-clothing', limit],
    queryFn: () => fetchHabboEmotionClothing(limit),
    staleTime: 1000 * 60 * 60 * 2, // 2 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};
