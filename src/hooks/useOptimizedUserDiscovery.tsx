
import { useQuery } from '@tanstack/react-query';
import { optimizedFeedService } from '@/services/optimizedFeedService';
import { useUnifiedAuth } from './useUnifiedAuth';
import { useMemo } from 'react';

export const useOptimizedUserDiscovery = (options?: {
  method?: 'random' | 'recent' | 'active';
  refreshInterval?: number;
  limit?: number;
  enabled?: boolean;
}) => {
  const { habboAccount } = useUnifiedAuth();
  
  const hotel = useMemo(() => {
    const userHotel = (habboAccount as any)?.hotel as string | undefined;
    if (!userHotel) return 'br';
    if (userHotel === 'br') return 'br';
    if (userHotel === 'com.br') return 'br';
    return 'br'; // Default para BR por enquanto
  }, [habboAccount?.hotel]);

  const method = options?.method || 'random';
  const refreshInterval = options?.refreshInterval || 120000; // 2 minutos
  const limit = options?.limit || 20;
  const enabled = options?.enabled !== false;

  const { 
    data: discoveryData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['optimized-user-discovery', hotel, method, limit],
    queryFn: () => optimizedFeedService.discoverUsers(hotel, method, limit),
    enabled,
    refetchInterval: refreshInterval,
    staleTime: 2 * 60 * 1000, // Considera stale após 2 minutos
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const users = discoveryData?.users || [];
  const meta = discoveryData?.meta;

  return {
    users,
    meta,
    method,
    hotel,
    isLoading,
    error,
    refetch,
    isEmpty: !isLoading && users.length === 0,
    lastUpdate: meta?.timestamp
  };
};
