
import { useQuery } from '@tanstack/react-query';
import { optimizedFeedService } from '@/services/optimizedFeedService';
import { useUnifiedAuth } from './useUnifiedAuth';
import { useMemo } from 'react';

export const useOptimizedOnlineUsers = (options?: {
  refreshInterval?: number;
  limit?: number;
}) => {
  const { habboAccount } = useAuth();
  
  const hotel = useMemo(() => {
    const userHotel = (habboAccount as any)?.hotel as string | undefined;
    if (!userHotel) return 'br';
    if (userHotel === 'br') return 'br';
    if (userHotel === 'com.br') return 'br';
    return 'br'; // Default para BR por enquanto
  }, [habboAccount?.hotel]);

  const refreshInterval = options?.refreshInterval || 60000; // 1 minuto
  const limit = options?.limit || 30;

  const query = useQuery({
    queryKey: ['optimized-online-users', hotel, limit],
    queryFn: () => optimizedFeedService.getOnlineUsers(hotel, limit),
    refetchInterval: refreshInterval,
    staleTime: 30 * 1000, // Considera stale após 30 segundos
    gcTime: 2 * 60 * 1000, // Keep in cache for 2 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const usersData = query.data;
  const users = usersData?.users || [];
  const meta = usersData?.meta;
  const onlineCount = users.length;

  return {
    users,
    onlineCount,
    meta,
    hotel,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isEmpty: !query.isLoading && users.length === 0,
    lastUpdate: meta?.timestamp
  };
};

