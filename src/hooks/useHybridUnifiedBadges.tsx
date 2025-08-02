
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HybridUnifiedBadgeItem {
  id: string;
  badge_code: string;
  badge_name: string;
  source: 'HabboWidgets' | 'HabboAssets' | 'SupabaseBucket' | 'HabboOfficial' | 'HybridFallback';
  image_url: string;
  created_at: string;
  last_validated_at: string;
  validation_count: number;
  is_active: boolean;
  category: 'official' | 'achievements' | 'fansites' | 'others';
}

interface UseHybridUnifiedBadgesProps {
  limit?: number;
  search?: string;
  category?: string;
  enabled?: boolean;
}

const fetchHybridUnifiedBadges = async ({
  limit = 1000,
  search = '',
  category = 'all'
}: UseHybridUnifiedBadgesProps): Promise<{
  badges: HybridUnifiedBadgeItem[];
  metadata: any;
}> => {
  console.log(`🎯 [HybridUnified] Fetching badges: limit=${limit}, search="${search}", category=${category}`);
  
  try {
    const { data, error } = await supabase.functions.invoke('habbo-badges-validator', {
      body: { 
        action: 'get-badges',
        limit, 
        search, 
        category 
      }
    });

    if (error) {
      console.error('❌ [HybridUnified] Supabase function error:', error);
      throw error;
    }

    if (!data || !data.badges || !Array.isArray(data.badges)) {
      console.error('❌ [HybridUnified] Invalid response format:', data);
      throw new Error('Dados inválidos do sistema híbrido');
    }

    console.log(`✅ [HybridUnified] Successfully fetched ${data.badges.length} badges`);
    console.log(`📊 [HybridUnified] Metadata:`, data.metadata);
    
    return {
      badges: data.badges,
      metadata: data.metadata || {}
    };
    
  } catch (error) {
    console.error('❌ [HybridUnified] Error:', error);
    throw error;
  }
};

const populateInitialBadges = async (): Promise<any> => {
  console.log(`🚀 [HybridUnified] Starting initial population`);
  
  try {
    const { data, error } = await supabase.functions.invoke('habbo-badges-validator', {
      body: { action: 'populate-initial' }
    });

    if (error) {
      console.error('❌ [HybridUnified] Population error:', error);
      throw error;
    }

    console.log(`✅ [HybridUnified] Population completed:`, data);
    return data;
    
  } catch (error) {
    console.error('❌ [HybridUnified] Population failed:', error);
    throw error;
  }
};

export const useHybridUnifiedBadges = ({
  limit = 1000,
  search = '',
  category = 'all',
  enabled = true
}: UseHybridUnifiedBadgesProps = {}) => {
  console.log(`🔧 [useHybridUnified] Hook: limit=${limit}, search="${search}", category=${category}, enabled=${enabled}`);
  
  return useQuery({
    queryKey: ['hybrid-unified-badges', limit, search, category],
    queryFn: () => fetchHybridUnifiedBadges({ limit, search, category }),
    enabled,
    staleTime: 1000 * 60 * 60, // 1 hora
    gcTime: 1000 * 60 * 60 * 4, // 4 horas
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export const usePopulateInitialBadges = () => {
  return useMutation({
    mutationFn: populateInitialBadges,
    onSuccess: (data) => {
      console.log('✅ [PopulateMutation] Success:', data);
    },
    onError: (error) => {
      console.error('❌ [PopulateMutation] Error:', error);
    }
  });
};
