
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HybridUnifiedBadgeItem {
  id: string;
  badge_code: string;
  badge_name: string;
  source: 'SupabaseStorage' | 'HabboWidgets';
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

const fetchSimplifiedBadges = async ({
  limit = 1000,
  search = '',
  category = 'all'
}: UseHybridUnifiedBadgesProps): Promise<{
  badges: HybridUnifiedBadgeItem[];
  metadata: any;
}> => {
  console.log(`🎯 [SimplifiedBadges] Fetching badges: limit=${limit}, search="${search}", category=${category}`);
  
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
      console.error('❌ [SimplifiedBadges] Supabase function error:', error);
      throw error;
    }

    if (!data || !data.success || !data.badges || !Array.isArray(data.badges)) {
      console.error('❌ [SimplifiedBadges] Invalid response format:', data);
      throw new Error('Resposta inválida do sistema simplificado');
    }

    console.log(`✅ [SimplifiedBadges] Successfully fetched ${data.badges.length} badges`);
    console.log(`📊 [SimplifiedBadges] Metadata:`, data.metadata);
    
    return {
      badges: data.badges,
      metadata: data.metadata || {}
    };
    
  } catch (error) {
    console.error('❌ [SimplifiedBadges] Error:', error);
    
    // Fallback simples apenas para demonstração
    const fallbackBadges: HybridUnifiedBadgeItem[] = [
      {
        id: 'fallback_ADM',
        badge_code: 'ADM',
        badge_name: 'Administrador',
        source: 'HabboWidgets',
        image_url: 'https://www.habbowidgets.com/images/badges/ADM.gif',
        created_at: new Date().toISOString(),
        last_validated_at: new Date().toISOString(),
        validation_count: 1,
        is_active: true,
        category: 'official'
      }
    ];
    
    return {
      badges: category === 'all' ? fallbackBadges : fallbackBadges.filter(b => b.category === category),
      metadata: {
        total: fallbackBadges.length,
        fallbackMode: true,
        error: error.message
      }
    };
  }
};

const populateInitialBadges = async (): Promise<any> => {
  console.log(`🚀 [SimplifiedBadges] Starting simplified initial population`);
  
  try {
    const { data, error } = await supabase.functions.invoke('habbo-badges-validator', {
      body: { action: 'populate-initial' }
    });

    if (error) {
      console.error('❌ [SimplifiedBadges] Population error:', error);
      throw error;
    }

    console.log(`✅ [SimplifiedBadges] Population completed:`, data);
    return data;
    
  } catch (error) {
    console.error('❌ [SimplifiedBadges] Population failed:', error);
    throw error;
  }
};

export const useHybridUnifiedBadges = ({
  limit = 1000,
  search = '',
  category = 'all',
  enabled = true
}: UseHybridUnifiedBadgesProps = {}) => {
  console.log(`🔧 [useSimplifiedBadges] Hook: limit=${limit}, search="${search}", category=${category}, enabled=${enabled}`);
  
  return useQuery({
    queryKey: ['simplified-badges', limit, search, category],
    queryFn: () => fetchSimplifiedBadges({ limit, search, category }),
    enabled,
    staleTime: 1000 * 60 * 15, // 15 minutos
    gcTime: 1000 * 60 * 60, // 1 hora
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 4000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

export const usePopulateInitialBadges = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: populateInitialBadges,
    onSuccess: (data) => {
      console.log('✅ [PopulateMutation] Success:', data);
      // Invalidar queries para recarregar dados
      queryClient.invalidateQueries({ queryKey: ['simplified-badges'] });
    },
    onError: (error) => {
      console.error('❌ [PopulateMutation] Error:', error);
    }
  });
};
