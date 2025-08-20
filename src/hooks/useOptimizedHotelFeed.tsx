
import { optimizedFeedService } from '@/services/optimizedFeedService';
import { useUnifiedAuth } from './useUnifiedAuth';
import { useOptimizedQuery } from './useOptimizedQuery';
import { useMemo } from 'react';

export const useOptimizedHotelFeed = (options?: {
  refreshInterval?: number;
  limit?: number;
}) => {
  const { habboAccount } = useUnifiedAuth();
  
  const hotel = useMemo(() => {
    const userHotel = (habboAccount as any)?.hotel as string | undefined;
    if (!userHotel) return 'br';
    if (userHotel === 'br') return 'br';
    if (userHotel === 'com.br') return 'br';
    return 'br'; // Default para BR por enquanto
  }, [habboAccount?.hotel]);

  const refreshInterval = options?.refreshInterval || 3 * 60 * 1000; // 3 minutos (era 30s)
  const limit = options?.limit || 30; // Reduzido de 50 para 30

  const { 
    data: feedData, 
    isLoading, 
    error,
    refetch 
  } = useOptimizedQuery({
    queryKey: ['optimized-hotel-feed', hotel, limit],
    queryFn: () => optimizedFeedService.getHotelFeed(hotel, limit),
    baseRefetchInterval: refreshInterval,
    aggressiveCacheTime: 10 * 60 * 1000, // 10 minutos de cache
    enableRateLimit: true,
    rateLimitConfig: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 requests por minuto
    retry: 1, // Reduzido para 1 retry apenas
  });

  const activities = feedData?.activities || [];
  const meta = feedData?.meta;

  return {
    activities,
    meta,
    hotel,
    isLoading,
    error,
    refetch,
    isEmpty: !isLoading && activities.length === 0,
    lastUpdate: meta?.timestamp
  };
};
