import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useCompleteProfile } from './useCompleteProfile';
import { supabase } from '@/integrations/supabase/client';

export interface DirectFriendActivity {
  username: string;
  activity: string;
  timestamp: string;
  figureString?: string;
  hotel: string;
}

interface DirectActivityResponse {
  activities: DirectFriendActivity[];
  metadata: {
    source: string;
    timestamp: string;
    count: number;
    friends_processed: number;
  };
}

interface ActivitiesPage {
  activities: DirectFriendActivity[];
  nextOffset: number | null;
  hasMore: boolean;
}

export const useFriendsActivitiesDirect = () => {
  const { habboAccount } = useAuth();
  
  // Detectar hotel do usuário autenticado
  const hotel = React.useMemo(() => {
    const userHotel = habboAccount?.hotel as string | undefined;
    if (!userHotel) return 'com.br';
    if (userHotel === 'br') return 'com.br';
    if (userHotel === 'com' || userHotel.includes('.')) return userHotel;
    return 'com.br';
  }, [habboAccount?.hotel]);

  // Get complete profile to access friends list
  const { data: completeProfile, isLoading: profileLoading } = useCompleteProfile(
    habboAccount?.habbo_name || '', 
    hotel
  );

  // Extract friend names with proper normalization
  const friends = React.useMemo(() => {
    if (!completeProfile?.data?.friends) return [];
    
    return completeProfile.data.friends
      .map(friend => {
        let name = friend.name;
        if (name.startsWith(',')) {
          name = name.substring(1);
        }
        return name.trim();
      })
      .filter(name => name.length > 0);
  }, [completeProfile?.data?.friends]);

  console.log(`[🔍 DIRECT ACTIVITIES] Friends from completeProfile (${friends.length}):`, friends.slice(0, 5));

  // Infinite query for paginated activities
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchActivities
  } = useInfiniteQuery({
    queryKey: ['friendsActivitiesDirect', hotel, friends.join(','), friends.length],
    queryFn: async ({ pageParam = 0 }): Promise<ActivitiesPage> => {
      if (friends.length === 0) {
        console.log('[❌ DIRECT ACTIVITIES] No friends to query activities for');
        return { activities: [], nextOffset: null, hasMore: false };
      }

      console.log(`[🚀 DIRECT ACTIVITIES] Fetching page with offset: ${pageParam}`);
      console.log(`[🚀 DIRECT ACTIVITIES] Querying activities for ${friends.length} friends (hotel: ${hotel})`);

      const { data: response, error } = await supabase.functions.invoke('habbo-friends-activities-direct', {
        body: {
          friends,
          hotel,
          limit: 50,
          offset: pageParam
        }
      });

      if (error) {
        console.error('[❌ DIRECT ACTIVITIES] Function error:', error);
        throw error;
      }

      const typedResponse = response as DirectActivityResponse;
      console.log(`[✅ DIRECT ACTIVITIES] Received ${typedResponse.activities.length} activities`);

      const nextOffset = typedResponse.activities.length === 50 ? pageParam + 50 : null;
      const hasMore = nextOffset !== null && nextOffset < friends.length;

      return {
        activities: typedResponse.activities,
        nextOffset,
        hasMore
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    initialPageParam: 0,
    enabled: !profileLoading && friends.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchInterval: 60 * 1000, // Auto-refresh every minute
  });

  // Flatten all pages into single array
  const activities = data?.pages.flatMap(page => page.activities) ?? [];
  const metadata = data?.pages[0]?.activities.length ? {
    source: 'direct_api' as const,
    timestamp: new Date().toISOString(),
    hotel: hotel,
    count: activities.length,
    friends_processed: friends.length
  } : {
    source: 'mock' as const,
    timestamp: new Date().toISOString(),
    hotel: hotel,
    count: 0,
    friends_processed: 0
  };

  console.log(`[📊 DIRECT ACTIVITIES] Total activities loaded: ${activities.length}`);

  return {
    activities,
    isLoading: profileLoading || isLoading,
    fetchNextPage,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    refetch: refetchActivities,
    hotel,
    metadata,
    friends
  };
};