
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HabboAssetsBadge {
  code: string;
  name: string;
  image_url: string;
  category: 'official' | 'achievements' | 'fansites' | 'others';
}

interface UseHabboAssetsBadgesProps {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

interface HabboAssetsBadgesResponse {
  badges: HabboAssetsBadge[];
  metadata: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
    source: string;
    categories: {
      all: number;
      official: number;
      achievements: number;
      fansites: number;
      others: number;
    };
  };
}

const fetchHabboAssetsBadges = async ({
  search = '',
  category = 'all',
  page = 1,
  limit = 100
}: UseHabboAssetsBadgesProps): Promise<HabboAssetsBadgesResponse> => {
  console.log(`🎯 [HabboAssetsBadges] Fetching: search="${search}", category=${category}, page=${page}, limit=${limit}`);
  
  try {
    const { data, error } = await supabase.functions.invoke('habbo-assets-badges', {
      body: { search, category, page, limit }
    });

    if (error) {
      console.error('❌ [HabboAssetsBadges] Supabase function error:', error);
      throw error;
    }

    if (!data || !data.success || !data.badges || !Array.isArray(data.badges)) {
      console.error('❌ [HabboAssetsBadges] Invalid response format:', data);
      throw new Error('Resposta inválida do HabboAssets');
    }

    console.log(`✅ [HabboAssetsBadges] Successfully fetched ${data.badges.length} badges`);
    console.log(`📊 [HabboAssetsBadges] Categories:`, data.metadata?.categories);
    
    return {
      badges: data.badges,
      metadata: data.metadata || {
        total: data.badges.length,
        page,
        limit,
        hasMore: false,
        source: 'HabboAssets',
        categories: { all: 0, official: 0, achievements: 0, fansites: 0, others: 0 }
      }
    };
    
  } catch (error) {
    console.error('❌ [HabboAssetsBadges] Error:', error);
    throw error;
  }
};

export const useHabboAssetsBadges = ({
  search = '',
  category = 'all',
  page = 1,
  limit = 100,
  enabled = true
}: UseHabboAssetsBadgesProps = {}) => {
  console.log(`🔧 [useHabboAssetsBadges] Hook: search="${search}", category=${category}, page=${page}, limit=${limit}, enabled=${enabled}`);
  
  return useQuery({
    queryKey: ['habbo-assets-badges', search, category, page, limit],
    queryFn: () => fetchHabboAssetsBadges({ search, category, page, limit }),
    enabled,
    staleTime: 1000 * 60 * 15, // 15 minutos
    gcTime: 1000 * 60 * 60, // 1 hora
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 8000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};
