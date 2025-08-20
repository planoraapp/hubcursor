
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DiscoveryOptions {
  method?: 'random' | 'recent' | 'active';
  limit?: number;
  enabled?: boolean;
}

export const useOptimizedUserDiscovery = (options: DiscoveryOptions = {}) => {
  const { method = 'random', limit = 8, enabled = true } = options;

  const query = useQuery({
    queryKey: ['user-discovery', method, limit],
    queryFn: async () => {
      console.log(`🔍 [useOptimizedUserDiscovery] Discovering users via ${method}`);
      
      try {
        const { data, error } = await supabase.functions.invoke('habbo-discover-users', {
          body: { 
            hotel: 'br', 
            method, 
            limit 
          }
        });

        if (error) {
          console.error('❌ [useOptimizedUserDiscovery] Error:', error);
          throw new Error(error.message || 'Failed to discover users');
        }

        if (data.error) {
          console.error('❌ [useOptimizedUserDiscovery] API Error:', data.error);
          throw new Error(data.error);
        }

        console.log(`✅ [useOptimizedUserDiscovery] Found ${data.users?.length || 0} users`);
        
        return data.users || [];
      } catch (error: any) {
        console.error('❌ [useOptimizedUserDiscovery] Fetch failed:', error);
        throw error;
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
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
