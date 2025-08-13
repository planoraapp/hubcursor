
import { useQuery } from '@tanstack/react-query';
import { optimizedFeedService } from '@/services/optimizedFeedService';
import { useUnifiedAuth } from './useUnifiedAuth';
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

  const refreshInterval = options?.refreshInterval || 30000; // 30 segundos
  const limit = options?.limit || 50;

  const { 
    data: feedData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['optimized-hotel-feed', hotel, limit],
    queryFn: () => optimizedFeedService.getHotelFeed(hotel, limit),
    refetchInterval: refreshInterval,
    staleTime: 1 * 60 * 1000, // Considera stale após 1 minuto
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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
