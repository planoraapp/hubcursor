import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UseInfiniteUserSearchOptions {
  enabled?: boolean;
  limit?: number;
}

export const useInfiniteUserSearch = (options: UseInfiniteUserSearchOptions = {}) => {
  const { enabled = true, limit = 20 } = options;

  const query = useInfiniteQuery({
    queryKey: ['infinite-user-search', limit],
    queryFn: async ({ pageParam = 0 }) => {
      console.log(`🔍 [useInfiniteUserSearch] Loading page ${pageParam}`);
      
      try {
        const { data, error } = await supabase.functions.invoke('habbo-official-ticker', {
          body: { 
            hotel: 'br',
            limit,
            offset: pageParam * limit
          }
        });

        if (error) {
          console.error('❌ [useInfiniteUserSearch] Error:', error);
          throw new Error(error.message || 'Failed to fetch users');
        }

        if (data.error) {
          console.error('❌ [useInfiniteUserSearch] API Error:', data.error);
          throw new Error(data.error);
        }

        console.log(`✅ [useInfiniteUserSearch] Loaded ${data.activities?.length || 0} users for page ${pageParam}`);
        
        return {
          users: data.activities || [],
          nextPage: (data.activities?.length === limit) ? pageParam + 1 : undefined,
          hasMore: (data.activities?.length === limit)
        };
      } catch (error: any) {
        console.error('❌ [useInfiniteUserSearch] Fetch failed:', error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled,
    staleTime: 24 * 60 * 60 * 1000, // 24 horas de cache
    gcTime: 24 * 60 * 60 * 1000, // 24 horas
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 2,
    initialPageParam: 0,
  });

  // Flatten all pages into a single array
  const allUsers = query.data?.pages.flatMap(page => page.users) || [];

  return {
    users: allUsers,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    error: query.error,
    refetch: query.refetch,
    isEmpty: !query.isLoading && allUsers.length === 0,
  };
};