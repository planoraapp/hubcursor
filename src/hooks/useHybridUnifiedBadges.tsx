
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
  console.log(`🎯 [HybridUnifiedBadges] Buscando badges: limit=${limit}, search="${search}", category=${category}`);
  
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
      console.error('❌ [HybridUnifiedBadges] Erro na função:', error);
      throw error;
    }

    if (!data || !data.success) {
      console.error('❌ [HybridUnifiedBadges] Resposta inválida:', data);
      throw new Error('Resposta inválida do sistema de badges');
    }

    console.log(`✅ [HybridUnifiedBadges] Sucesso: ${data.badges?.length || 0} badges`);
    
    return {
      badges: data.badges || [],
      metadata: data.metadata || {}
    };
    
  } catch (error) {
    console.error('❌ [HybridUnifiedBadges] Erro:', error);
    
    // Fallback simples com badges essenciais
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
      },
      {
        id: 'fallback_MOD',
        badge_code: 'MOD',
        badge_name: 'Moderador',
        source: 'HabboWidgets',
        image_url: 'https://www.habbowidgets.com/images/badges/MOD.gif',
        created_at: new Date().toISOString(),
        last_validated_at: new Date().toISOString(),
        validation_count: 1,
        is_active: true,
        category: 'official'
      },
      {
        id: 'fallback_HC1',
        badge_code: 'HC1',
        badge_name: 'Habbo Club 1',
        source: 'HabboWidgets',
        image_url: 'https://www.habbowidgets.com/images/badges/HC1.gif',
        created_at: new Date().toISOString(),
        last_validated_at: new Date().toISOString(),
        validation_count: 1,
        is_active: true,
        category: 'achievements'
      }
    ];
    
    // Aplicar filtros mesmo no fallback
    let filtered = fallbackBadges;
    
    if (category !== 'all') {
      filtered = filtered.filter(b => b.category === category);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(b => 
        b.badge_code.toLowerCase().includes(searchLower) ||
        b.badge_name.toLowerCase().includes(searchLower)
      );
    }
    
    return {
      badges: filtered,
      metadata: {
        total: filtered.length,
        fallbackMode: true,
        error: error.message
      }
    };
  }
};

const populateInitialBadges = async (): Promise<any> => {
  console.log(`🚀 [HybridUnifiedBadges] Iniciando população inicial`);
  
  try {
    const { data, error } = await supabase.functions.invoke('habbo-badges-validator', {
      body: { action: 'populate-initial' }
    });

    if (error) {
      console.error('❌ [HybridUnifiedBadges] Erro na população:', error);
      throw error;
    }

    console.log(`✅ [HybridUnifiedBadges] População completada:`, data);
    return data;
    
  } catch (error) {
    console.error('❌ [HybridUnifiedBadges] Falha na população:', error);
    throw error;
  }
};

export const useHybridUnifiedBadges = ({
  limit = 1000,
  search = '',
  category = 'all',
  enabled = true
}: UseHybridUnifiedBadgesProps = {}) => {
  console.log(`🔧 [useHybridUnifiedBadges] Hook iniciado: limit=${limit}, search="${search}", category=${category}, enabled=${enabled}`);
  
  return useQuery({
    queryKey: ['hybrid-unified-badges', limit, search, category],
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
      console.log('✅ [PopulateMutation] Sucesso:', data);
      // Invalidar queries para recarregar dados
      queryClient.invalidateQueries({ queryKey: ['hybrid-unified-badges'] });
    },
    onError: (error) => {
      console.error('❌ [PopulateMutation] Erro:', error);
    }
  });
};
