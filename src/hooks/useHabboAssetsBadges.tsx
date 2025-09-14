
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HabboAssetsBadge {
  code: string;
  name: string;
  image_url: string;
  category: 'official' | 'achievements' | 'fansites' | 'others';
  metadata?: {
    year?: number;
    event?: string;
    rarity?: string;
    source_info?: string;
  };
}

interface UseHabboAssetsBadgesProps {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
  loadAll?: boolean;
  forceRefresh?: boolean;
}

interface HabboAssetsBadgesResponse {
  badges: HabboAssetsBadge[];
  metadata: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
    source: string;
    cached: boolean;
    categories: {
      all: number;
      official: number;
      achievements: number;
      fansites: number;
      others: number;
    };
  };
}

// Cache no cliente para evitar requests desnecessários
const clientCache = new Map<string, { data: HabboAssetsBadgesResponse; timestamp: number }>();
const CLIENT_CACHE_TTL = 15 * 60 * 1000; // 15 minutos

const fetchHabboAssetsBadges = async ({
  search = '',
  category = 'all',
  page = 1,
  limit = 100,
  loadAll = false,
  forceRefresh = false
}: UseHabboAssetsBadgesProps): Promise<HabboAssetsBadgesResponse> => {
    // Se loadAll for true, usar um limite muito alto
  const actualLimit = loadAll ? 5000 : limit;
  
  // Verificar cache do cliente (apenas se não forçar refresh)
  const cacheKey = `badges_${search}_${category}_${page}_${actualLimit}`;
  if (!forceRefresh) {
    const cached = clientCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CLIENT_CACHE_TTL) {
            return cached.data;
    }
  }
  
  try {
    const { data, error } = await supabase.functions.invoke('habbo-assets-badges', {
      body: { search, category, page, limit: actualLimit, forceRefresh }
    });

    if (error) {
            throw error;
    }

    if (!data || !data.success || !data.badges || !Array.isArray(data.badges)) {
            throw new Error('Resposta inválida do HabboAssets');
    }

                const response: HabboAssetsBadgesResponse = {
      badges: data.badges,
      metadata: data.metadata || {
        total: data.badges.length,
        page,
        limit: actualLimit,
        hasMore: false,
        source: 'HabboAssets',
        cached: false,
        categories: { all: 0, official: 0, achievements: 0, fansites: 0, others: 0 }
      }
    };
    
    // Salvar no cache do cliente
    clientCache.set(cacheKey, { data: response, timestamp: Date.now() });
    
    return response;
    
  } catch (error) {
        throw error;
  }
};

export const useHabboAssetsBadges = ({
  search = '',
  category = 'all',
  page = 1,
  limit = 100,
  enabled = true,
  loadAll = false,
  forceRefresh = false
}: UseHabboAssetsBadgesProps = {}) => {
    return useQuery({
    queryKey: ['habbo-assets-badges', search, category, page, limit, loadAll, forceRefresh],
    queryFn: () => fetchHabboAssetsBadges({ search, category, page, limit, loadAll, forceRefresh }),
    enabled,
    staleTime: forceRefresh ? 0 : (1000 * 60 * 10), // 10 minutos ou 0 se force refresh
    gcTime: 1000 * 60 * 30, // 30 minutos
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    // Configuração específica para performance
    refetchInterval: false,
    networkMode: 'online',
  });
};

// Função utilitária para limpar cache
export const clearBadgeCache = () => {
  clientCache.clear();
  };
