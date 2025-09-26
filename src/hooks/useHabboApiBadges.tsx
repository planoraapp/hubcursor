
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
  source: string;
  scrapedAt: string;
}

interface UseHabboApiBadgesProps {
  limit?: number;
  search?: string;
  category?: string;
  forceRefresh?: boolean;
  enabled?: boolean;
}

const fetchMassiveBadges = async ({
  limit = 10000,
  search = '',
  category = 'all',
  forceRefresh = false
}: UseHabboApiBadgesProps): Promise<{
  badges: HabboApiBadgeItem[];
  metadata: any;
}> => {
    try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout na busca massiva de badges')), 30000); // 30 segundos
    });

    const fetchPromise = supabase.functions.invoke('habbo-api-badges', {
      body: { limit, search, category, forceRefresh }
    });

    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

    if (error) {
            throw new Error(`Sistema Massivo Error: ${error.message}`);
    }

    if (!data || !data.badges || !Array.isArray(data.badges)) {
            throw new Error('Dados do sistema massivo inválidos');
    }

            // Garantir que todos os badges tenham as propriedades necessárias
    const processedBadges = data.badges.map((badge: any) => ({
      id: badge.id || `badge_${badge.code}`,
      code: badge.code || 'UNKNOWN',
      name: badge.name || `Badge ${badge.code}`,
      description: badge.description || `Emblema ${badge.code}`,
      imageUrl: badge.imageUrl || `https://habboassets.com/c_images/album1584/${badge.code}.gif`,
      category: badge.category || 'others',
      rarity: badge.rarity || 'common',
      source: badge.source || 'massive-system',
      scrapedAt: badge.scrapedAt || new Date().toISOString()
    }));
    
    return {
      badges: processedBadges,
      metadata: {
        ...data.metadata,
        hasMore: false,
        source: data.metadata?.source || 'massive-collection',
        totalProcessed: processedBadges.length
      }
    };
    
  } catch (error) {
        throw error;
  }
};

export const useHabboApiBadges = ({
  limit = 10000,
  search = '',
  category = 'all',
  forceRefresh = false,
  enabled = true
}: UseHabboApiBadgesProps = {}) => {
    return useQuery({
    queryKey: ['massive-badges-system', limit, search, category, forceRefresh],
    queryFn: () => fetchMassiveBadges({ limit, search, category, forceRefresh }),
    enabled,
    staleTime: 1000 * 60 * 60 * 2, // 2 horas para dados massivos
    gcTime: 1000 * 60 * 60 * 8, // 8 horas
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 8000),
    // Configurações para dados massivos
    refetchOnWindowFocus: false, // Não refetch automaticamente
    refetchOnReconnect: false,   // Economizar recursos
    refetchInterval: false,      // Sem refresh automático
  });
};
