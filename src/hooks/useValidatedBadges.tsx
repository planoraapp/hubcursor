
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ValidatedBadgeItem {
  id: string;
  badge_code: string;
  badge_name: string;
  source: 'HabboWidgets' | 'HabboAssets' | 'SupabaseBucket';
  image_url: string;
  created_at: string;
  last_validated_at: string;
  validation_count: number;
  is_active: boolean;
}

interface UseValidatedBadgesProps {
  limit?: number;
  search?: string;
  enabled?: boolean;
}

const fetchValidatedBadges = async ({
  limit = 1000,
  search = ''
}: UseValidatedBadgesProps): Promise<{
  badges: ValidatedBadgeItem[];
  metadata: any;
}> => {
  console.log(`🎯 [ValidatedBadges] Fetching validated badges: limit=${limit}, search="${search}"`);
  
  try {
    let query = supabase
      .from('habbo_badges')
      .select('*')
      .eq('is_active', true)
      .order('validation_count', { ascending: false })
      .limit(limit);

    if (search) {
      query = query.or(`badge_code.ilike.%${search}%,badge_name.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('❌ [ValidatedBadges] Supabase error:', error);
      throw error;
    }

    console.log(`✅ [ValidatedBadges] Successfully fetched ${data?.length || 0} validated badges`);
    
    return {
      badges: data || [],
      metadata: {
        total: count || data?.length || 0,
        source: 'validated-database',
        timestamp: new Date().toISOString()
      }
    };
    
  } catch (error) {
    console.error('❌ [ValidatedBadges] Error:', error);
    throw error;
  }
};

export const useValidatedBadges = ({
  limit = 1000,
  search = '',
  enabled = true
}: UseValidatedBadgesProps = {}) => {
  console.log(`🔧 [useValidatedBadges] Hook: limit=${limit}, search="${search}", enabled=${enabled}`);
  
  return useQuery({
    queryKey: ['validated-badges', limit, search],
    queryFn: () => fetchValidatedBadges({ limit, search }),
    enabled,
    staleTime: 1000 * 60 * 30, // 30 minutos
    gcTime: 1000 * 60 * 60 * 2, // 2 horas
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
