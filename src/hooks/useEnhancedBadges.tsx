
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EnhancedBadgeItem {
  id: string;
  code: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  rarity: string;
  source: string;
  scrapedAt?: string;
}

interface UseEnhancedBadgesProps {
  limit?: number;
  search?: string;
  category?: string;
  forceRefresh?: boolean;
  enabled?: boolean;
}

const fetchEnhancedBadges = async ({
  limit = 10000,
  search = '',
  category = 'all',
  forceRefresh = false
}: UseEnhancedBadgesProps): Promise<{
  badges: EnhancedBadgeItem[];
  metadata: any;
}> => {
  console.log(`🚀 [EnhancedBadges] Fetching with limit: ${limit}, search: "${search}", category: ${category}`);
  
  try {
    const { data, error } = await supabase.functions.invoke('habbo-badges-scraper', {
      body: { limit, search, category, forceRefresh }
    });

    if (error) {
      console.error('❌ [EnhancedBadges] Supabase function error:', error);
      throw error;
    }

    if (!data || !data.badges || !Array.isArray(data.badges)) {
      console.error('❌ [EnhancedBadges] Invalid response format:', data);
      throw new Error('Invalid response format from badges scraper');
    }

    console.log(`✅ [EnhancedBadges] Successfully fetched ${data.badges.length} badges`);
    console.log(`📊 [EnhancedBadges] Metadata:`, data.metadata);
    
    return {
      badges: data.badges,
      metadata: data.metadata
    };
    
  } catch (error) {
    console.error('❌ [EnhancedBadges] Error:', error);
    throw error;
  }
};

export const useEnhancedBadges = ({
  limit = 10000,
  search = '',
  category = 'all',
  forceRefresh = false,
  enabled = true
}: UseEnhancedBadgesProps = {}) => {
  console.log(`🔧 [useEnhancedBadges] Hook called with limit: ${limit}, search: "${search}", category: ${category}`);
  
  return useQuery({
    queryKey: ['enhanced-badges', limit, search, category, forceRefresh],
    queryFn: () => fetchEnhancedBadges({ limit, search, category, forceRefresh }),
    enabled,
    staleTime: 1000 * 60 * 60 * 4, // 4 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};
