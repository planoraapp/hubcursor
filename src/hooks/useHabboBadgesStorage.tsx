
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HabboBadgeItem {
  id: string;
  code: string;
  name: string;
  imageUrl: string;
  category: string;
  rarity: string;
  source: 'official';
}

interface UseHabboBadgesStorageProps {
  limit?: number;
  search?: string;
  category?: string;
  enabled?: boolean;
}

const fetchHabboBadgesFromStorage = async ({
  limit = 500,
  search = '',
  category = 'all'
}: UseHabboBadgesStorageProps): Promise<HabboBadgeItem[]> => {
  console.log(`🌐 [HabboBadgesStorage] Fetching badges with limit: ${limit}, search: "${search}", category: ${category}`);
  
  try {
    const { data, error } = await supabase.functions.invoke('habbo-badges-storage', {
      body: { limit, search, category }
    });

    if (error) {
      console.error('❌ [HabboBadgesStorage] Supabase function error:', error);
      throw error;
    }

    if (!data || !data.badges || !Array.isArray(data.badges)) {
      console.error('❌ [HabboBadgesStorage] Invalid response format:', data);
      throw new Error('Invalid response format from badges storage');
    }

    console.log(`✅ [HabboBadgesStorage] Successfully fetched ${data.badges.length} badges`);
    console.log(`📊 [HabboBadgesStorage] Metadata:`, data.metadata);
    
    return data.badges;
    
  } catch (error) {
    console.error('❌ [HabboBadgesStorage] Error:', error);
    throw error;
  }
};

export const useHabboBadgesStorage = ({
  limit = 500,
  search = '',
  category = 'all',
  enabled = true
}: UseHabboBadgesStorageProps = {}) => {
  console.log(`🔧 [HabboBadgesStorage] Hook called with limit: ${limit}, search: "${search}", category: ${category}, enabled: ${enabled}`);
  
  return useQuery({
    queryKey: ['habbo-badges-storage', limit, search, category],
    queryFn: () => fetchHabboBadgesFromStorage({ limit, search, category }),
    enabled,
    staleTime: 1000 * 60 * 60 * 2, // 2 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};
