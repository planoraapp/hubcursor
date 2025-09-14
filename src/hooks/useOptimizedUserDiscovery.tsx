
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DiscoveryOptions {
  method?: 'random' | 'recent' | 'active';
  limit?: number;
  enabled?: boolean;
}

export const useOptimizedUserDiscovery = (options: DiscoveryOptions = {}) => {
  const { method = 'random', limit = 6, enabled = true } = options; // Reduced from 8 to 6 users (5-10 range)

  const query = useQuery({
    queryKey: ['user-discovery', method, limit],
    queryFn: async () => {
            try {
        const { data, error } = await supabase.functions.invoke('habbo-discover-users', {
          body: { 
            hotel: 'br', 
            method, 
            limit 
          }
        });

        if (error) {
                    throw new Error(error.message || 'Failed to discover users');
        }

        if (data.error) {
                    throw new Error(data.error);
        }

                return data.users || [];
      } catch (error: any) {
                throw error;
      }
    },
    enabled,
    staleTime: 24 * 60 * 60 * 1000, // 24 horas de cache
    gcTime: 24 * 60 * 60 * 1000, // 24 horas
    refetchOnWindowFocus: false, // Desabilita refresh automático
    refetchOnReconnect: false, // Desabilita refresh automático
    retry: 2,
  });

  return {
    users: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isEmpty: !query.isLoading && (!query.data || query.data.length === 0),
    lastUpdate: query.dataUpdatedAt ? new Date(query.dataUpdatedAt).toISOString() : undefined
  };
};
