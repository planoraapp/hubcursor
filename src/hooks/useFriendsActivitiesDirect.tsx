
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
  
  console.log('🔍 [HOOK START] useFriendsActivitiesDirect initiated');
  console.log('🔍 [HOOK START] habboAccount:', habboAccount);
  
  // Detect user's hotel
  const hotel = React.useMemo(() => {
    const userHotel = habboAccount?.hotel as string | undefined;
    if (!userHotel) return 'br';
    if (userHotel === 'br') return 'br';
    if (userHotel === 'com' || userHotel.includes('.')) return userHotel;
    return 'br';
  }, [habboAccount?.hotel]);

  console.log('🔍 [HOOK HOTEL] Detected hotel:', hotel);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchActivities,
    error
  } = useInfiniteQuery({
    queryKey: ['friendsActivitiesDirectAuth', hotel, habboAccount?.habbo_name, 'v3'],
    queryFn: async ({ pageParam = 0 }): Promise<ActivitiesPage> => {
      console.log('🚀 [QUERY START] Authenticated edge function query initiated');
      console.log('🚀 [QUERY PARAMS] pageParam:', pageParam);
      console.log('🚀 [QUERY PARAMS] hotel:', hotel);
      
      if (!habboAccount?.habbo_name) {
        console.log('❌ [QUERY EARLY] User not authenticated');
        return { activities: [], nextOffset: null, hasMore: false };
      }

      try {
        console.log('🔗 [EDGE CALL] Invoking habbo-friends-activities-direct with auth...');
        
        // Get current session for auth token
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('No valid session found');
        }

        const { data: response, error } = await supabase.functions.invoke('habbo-friends-activities-direct', {
          body: {
            hotel,
            limit: 50,
            offset: pageParam
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        console.log('🔗 [EDGE RESPONSE] Response received:', !!response);
        console.log('🔗 [EDGE RESPONSE] Error:', error);

        if (error) {
          console.error('❌ [EDGE ERROR] Function error:', error);
          return {
            activities: [],
            nextOffset: null,
            hasMore: false
          };
        }

        if (!response) {
          console.error('❌ [EDGE ERROR] Empty response from edge function');
          return {
            activities: [],
            nextOffset: null,
            hasMore: false
          };
        }

        const typedResponse = response as DirectActivityResponse;
        console.log(`✅ [EDGE SUCCESS] Received ${typedResponse.activities.length} activities`);
        console.log(`📊 [EDGE METADATA]`, typedResponse.metadata);

        // Improved pagination logic
        const activitiesReceived = typedResponse.activities.length;
        const nextOffset = activitiesReceived === 50 ? pageParam + 50 : null;
        const hasMore = nextOffset !== null;
        
        console.log(`📄 [PAGINATION] Current offset: ${pageParam}, next offset: ${nextOffset}, has more: ${hasMore}`);

        return {
          activities: typedResponse.activities,
          nextOffset,
          hasMore
        };

      } catch (functionError) {
        console.error('❌ [QUERY ERROR] Invocation error:', functionError);
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
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      console.log(`🔄 [RETRY] Attempt ${failureCount + 1}, error:`, error);
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

  console.log(`📊 [HOOK SUMMARY] ===== FINAL SUMMARY =====`);
  console.log(`📊 [HOOK SUMMARY] Activities loaded: ${activities.length}`);
  console.log(`📊 [HOOK SUMMARY] User authenticated: ${!!habboAccount?.supabase_user_id}`);
  console.log(`📊 [HOOK SUMMARY] Query loading: ${isLoading}`);
  console.log(`📊 [HOOK SUMMARY] Has error: ${!!error}`);
  console.log(`📊 [HOOK SUMMARY] Error details:`, error);

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
