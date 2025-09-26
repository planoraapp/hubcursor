
import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface DirectFriendActivity {
  username: string;
  activity: string;
  timestamp: string;
  figureString?: string;
  hotel: string;
  type?: 'look_change' | 'motto_change' | 'badge' | 'friends' | 'photos' | 'groups' | 'online';
  details?: {
    newFriends?: Array<{ name: string; avatar?: string }>;
    newBadges?: Array<{ code: string; name?: string }>;
    newGroups?: Array<{ name: string; badge?: string }>;
    newPhotos?: Array<{ url: string; roomName?: string }>;
    newMotto?: string;
    previousMotto?: string;
  };
}

interface DirectActivityResponse {
  activities: DirectFriendActivity[];
  metadata: {
    source: string;
    timestamp: string;
    count: number;
    friends_processed: number;
    error?: string;
  };
}

interface ActivitiesPage {
  activities: DirectFriendActivity[];
  nextOffset: number | null;
  hasMore: boolean;
}

export const useFriendsActivitiesDirect = () => {
  const { habboAccount } = useAuth();
  
      // Detect user's hotel
  const hotel = React.useMemo(() => {
    const userHotel = habboAccount?.hotel as string | undefined;
    if (!userHotel) return 'br';
    if (userHotel === 'br') return 'br';
    if (userHotel === 'com' || userHotel.includes('.')) return userHotel;
    return 'br';
  }, [habboAccount?.hotel]);

    const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchActivities,
    error
  } = useInfiniteQuery({
    queryKey: ['friendsActivitiesDirectAuth', hotel, habboAccount?.habbo_name, 'v4'], // ✅ Versão atualizada
    queryFn: async ({ pageParam = 0 }): Promise<ActivitiesPage> => {
                        if (!habboAccount?.habbo_name) {
                return { activities: [], nextOffset: null, hasMore: false };
      }

      try {
                // ✅ CORREÇÃO: Melhor gerenciamento de sessão
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
                    throw new Error('No valid session found');
        }

        // ✅ CORREÇÃO: Usar nova URL corrigida da Edge Function
        const { data: response, error } = await supabase.functions.invoke('habbo-friends-activities-direct', {
          body: {
            hotel,
            limit: 50,
            offset: pageParam
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

                        if (error) {
                    return {
            activities: [],
            nextOffset: null,
            hasMore: false
          };
        }

        if (!response) {
                    return {
            activities: [],
            nextOffset: null,
            hasMore: false
          };
        }

        const typedResponse = response as DirectActivityResponse;
                        // ✅ CORREÇÃO: Melhor lógica de paginação
        const activitiesReceived = typedResponse.activities.length;
        const nextOffset = activitiesReceived === 50 ? pageParam + 50 : null;
        const hasMore = nextOffset !== null;
        
                return {
          activities: typedResponse.activities,
          nextOffset,
          hasMore
        };

      } catch (functionError) {
                return {
          activities: [],
          nextOffset: null,
          hasMore: false
        };
      }
    },
    getNextPageParam: (lastPage) => {
      return lastPage?.nextOffset;
    },
    initialPageParam: 0,
    enabled: !!habboAccount?.habbo_name && !!habboAccount?.supabase_user_id,
    staleTime: 2 * 60 * 1000, // ✅ CORREÇÃO: Cache reduzido para 2 minutos (dados mais frescos)
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
            return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    refetchInterval: false,
  });

  // Flatten all pages into single array
  const activities = data?.pages.flatMap(page => page.activities) ?? [];
  
  const metadata = {
    source: activities.length > 0 ? 'authenticated_direct_api' as const : 'no_data' as const,
    timestamp: new Date().toISOString(),
    hotel: hotel,
    count: activities.length,
    friends_processed: data?.pages[0]?.activities.length || 0,
    query_enabled: !!habboAccount?.habbo_name,
    has_error: !!error,
    is_authenticated: !!habboAccount?.supabase_user_id
  };

              return {
    activities,
    isLoading,
    fetchNextPage,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    refetch: refetchActivities,
    hotel,
    metadata,
    error
  };
};
