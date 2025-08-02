
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HabboApiBadgeItem {
  id: string;
  code: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  rarity: string;
  source: 'habbo-api';
  scrapedAt: string;
}

interface UseHabboApiBadgesProps {
  limit?: number;
  search?: string;
  category?: string;
  forceRefresh?: boolean;
  enabled?: boolean;
}

const fetchHabboApiBadges = async ({
  limit = 5000,
  search = '',
  category = 'all',
  forceRefresh = false
}: UseHabboApiBadgesProps): Promise<{
  badges: HabboApiBadgeItem[];
  metadata: any;
}> => {
  console.log(`🔥 [HabboApiBadges] Buscando badges da HabboAPI - limit: ${limit}, search: "${search}", category: ${category}`);
  
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout na busca HabboAPI')), 20000);
    });

    const fetchPromise = supabase.functions.invoke('habbo-api-badges', {
      body: { limit, search, category, forceRefresh }
    });

    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

    if (error) {
      console.error('❌ [HabboApiBadges] Erro na função:', error);
      throw new Error(`HabboAPI Error: ${error.message}`);
    }

    if (!data || !data.badges || !Array.isArray(data.badges)) {
      console.error('❌ [HabboApiBadges] Formato inválido:', data);
      throw new Error('Dados da HabboAPI inválidos');
    }

    console.log(`✅ [HabboApiBadges] Recebidos ${data.badges.length} badges da HabboAPI`);
    console.log(`📊 [HabboApiBadges] Metadata:`, data.metadata);
    
    return {
      badges: data.badges,
      metadata: data.metadata || { hasMore: false, source: 'habbo-api' }
    };
    
  } catch (error) {
    console.error('❌ [HabboApiBadges] Erro:', error);
    throw error;
  }
};

export const useHabboApiBadges = ({
  limit = 5000,
  search = '',
  category = 'all',
  forceRefresh = false,
  enabled = true
}: UseHabboApiBadgesProps = {}) => {
  console.log(`🔧 [useHabboApiBadges] Configuração: limit: ${limit}, search: "${search}", category: ${category}, enabled: ${enabled}`);
  
  return useQuery({
    queryKey: ['habbo-api-badges', limit, search, category, forceRefresh],
    queryFn: () => fetchHabboApiBadges({ limit, search, category, forceRefresh }),
    enabled,
    staleTime: 1000 * 60 * 60 * 3, // 3 horas
    gcTime: 1000 * 60 * 60 * 6, // 6 horas
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};
