
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
            throw error;
    }

    if (!data || !data.success || !data.badges || !Array.isArray(data.badges)) {
            throw new Error('Resposta inválida do sistema simplificado');
    }

            return {
      badges: data.badges,
      metadata: data.metadata || {}
    };
    
  } catch (error) {
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
    try {
    const { data, error } = await supabase.functions.invoke('habbo-badges-validator', {
      body: { action: 'populate-initial' }
    });

    if (error) {
            throw error;
    }

        return data;
    
  } catch (error) {
        throw error;
  }
};

export const useHybridUnifiedBadges = ({
  limit = 1000,
  search = '',
  category = 'all',
  enabled = true
}: UseHybridUnifiedBadgesProps = {}) => {
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
            // Invalidar queries para recarregar dados
      queryClient.invalidateQueries({ queryKey: ['simplified-badges'] });
    },
    onError: (error) => {
          }
  });
};
