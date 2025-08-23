
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
    baseRefetchInterval: false, // Desabilita polling automático
    aggressiveCacheTime: 24 * 60 * 60 * 1000, // 24 horas de cache
    enableRateLimit: true,
    rateLimitConfig: { maxRequests: 120, windowMs: 60 * 1000 }, // 120 requests por minuto
    onDemandOnly: true, // Apenas on-demand via botão
    retry: 1,
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
