
import { useQuery } from '@tanstack/react-query';
import { habboFeedService, FeedActivity, FeedResponse } from '@/services/habboFeedService';
import { useUnifiedAuth } from './useUnifiedAuth';
import { useMemo, useCallback, useEffect, useRef, useState } from 'react';

export const useRealHotelFeed = (options?: { 
  onlineWithinSeconds?: number;
  mode?: 'official' | 'database' | 'hybrid';
  onlyOnline?: boolean;
}) => {
  const { habboAccount } = useAuth();
  
  const hotel = useMemo(() => {
    const userHotel = (habboAccount as any)?.hotel as string | undefined;
    if (!userHotel) return 'com.br';
    if (userHotel === 'br') return 'com.br';
    if (userHotel === 'com' || userHotel.includes('.')) return userHotel;
    return 'com.br';
  }, [habboAccount?.hotel]);
  
  const onlyOnline = options?.onlyOnline ?? false;
  const mode = options?.mode || 'hybrid';
  const baseLimit = 100;
  const onlineWithinSeconds = options?.onlineWithinSeconds || 1800;

  // DESABILITADO: Todas as edge functions foram removidas temporariamente
  const discoverOnlineUsers = useCallback(async () => {
        return Promise.resolve();
  }, []);

  // DESABILITADO: Fetch real feed data 
  const { 
    data: feedResponse, 
    isLoading, 
    isFetching,
    error,
    refetch
  } = useQuery({
    queryKey: ['real-hotel-feed', hotel, mode, onlineWithinSeconds, onlyOnline],
    queryFn: async (): Promise<FeedResponse> => {
            // COMENTADO: Edge functions não existem mais
      /*
      if (mode === 'hybrid' || mode === 'database') {
        discoverOnlineUsers().catch(() => {}); 
      }
      
      return habboFeedService.getHotelFeed(
        hotel,
        baseLimit,
        { 
          onlineWithinSeconds,
          mode,
          offsetHours: 0,
          onlyOnline,
        }
      );
      */
      
      // Retorna dados vazios para manter compatibilidade
      return {
        activities: [],
        meta: {
          source: 'database' as const,
          timestamp: new Date().toISOString(),
          count: 0,
          onlineCount: 0
        }
      };
    },
    enabled: false, // DESABILITADO
    refetchInterval: false, // Remove polling
    staleTime: Infinity,
    retry: 0,
    retryDelay: () => 0,
  });

  // Estados para compatibilidade
  const [mergedActivities] = useState<Array<FeedActivity & { key: string; isNew?: boolean }>>([]);

  const loadMoreData = useCallback(async (page: number) => {
        return {
      activities: [],
      meta: {
        source: 'database' as const,
        timestamp: new Date().toISOString(),
        count: 0,
        onlineCount: 0
      }
    };
  }, []);

  const aggregatedActivities = useMemo(() => [], []);

  const metadata = {
    source: 'database' as const,
    timestamp: new Date().toISOString(),
    count: 0,
    onlineCount: 0
  };

  const enhancedRefetch = useCallback(async () => {
        return Promise.resolve();
  }, []);

  return {
    activities: mergedActivities,
    aggregatedActivities,
    isLoading: false,
    isFetching: false,
    error: null,
    hotel,
    metadata,
    mode,
    refetch: enhancedRefetch,
    discoverOnlineUsers,
    loadMoreData
  };
};

export type { FeedActivity };

