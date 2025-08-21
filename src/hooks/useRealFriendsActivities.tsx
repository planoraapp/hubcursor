
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from './useDebounce';
import { useCompleteProfile } from './useCompleteProfile';

export interface RealFriendActivity {
  id: string;
  habbo_name: string;
  habbo_id: string;
  hotel: string;
  activity_type: string;
  activity_description: string;
  created_at: string;
  detected_at: string;
  old_data?: any;
  new_data: any;
  badgeImageUrl?: string;
  avatarPreviewUrl?: string;
}

interface ActivitiesPage {
  activities: RealFriendActivity[];
  nextCursor: string | null;
  hasMore: boolean;
}

export const useRealFriendsActivities = (initialLimit = 100) => {
  const { habboAccount } = useAuth();
  
  // Get complete profile to access friends list
  const { data: completeProfile, isLoading: profileLoading } = useCompleteProfile(
    habboAccount?.habbo_name || '', 
    habboAccount?.hotel === 'br' ? 'com.br' : (habboAccount?.hotel || 'com.br')
  );

  // Extract friend names with proper normalization
  const friendNames = completeProfile?.data?.friends?.map(friend => {
    let name = friend.name;
    if (name.startsWith(',')) {
      name = name.substring(1);
    }
    return name.trim();
  }).filter(name => name.length > 0) || [];

  console.log(`[🔍 REAL ACTIVITIES] Friends from completeProfile (${friendNames.length}):`, friendNames);

  // Infinite query for paginated activities
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchActivities
  } = useInfiniteQuery({
    queryKey: ['realFriendsActivities', friendNames.join(','), completeProfile?.data?.friends?.length],
    queryFn: async ({ pageParam }): Promise<ActivitiesPage> => {
      if (friendNames.length === 0) {
        console.log('[❌ REAL ACTIVITIES] No friends to query activities for');
        return { activities: [], nextCursor: null, hasMore: false };
      }

      console.log(`[🔍 REAL ACTIVITIES] Fetching page with cursor: ${pageParam || 'initial'}`);
      console.log(`[🔍 REAL ACTIVITIES] Querying activities for ${friendNames.length} friends`);
      
      // Create a case-insensitive set of friend names with normalization
      const normalizedFriendNames = friendNames.map(name => name.toLowerCase().trim());

      // Build query with cursor-based pagination
      let query = supabase
        .from('friends_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(initialLimit);

      // Apply cursor pagination if we have a cursor
      if (pageParam) {
        query = query.lt('created_at', pageParam);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[❌ REAL ACTIVITIES] Database error:', error);
        throw error;
      }

      console.log(`[📊 REAL ACTIVITIES] Raw query returned ${data?.length || 0} activities`);
      
      // Debug: Show unique user names in activities
      if (data && data.length > 0) {
        const uniqueUsers = [...new Set(data.map(act => act.habbo_name))];
        console.log(`[🔍 REAL ACTIVITIES] Unique users in this page (${uniqueUsers.length}):`, uniqueUsers.slice(0, 10));
      }

      // Client-side filtering for accurate matching with normalization
      const filteredActivities = (data || []).filter(activity => {
        let activityName = activity.habbo_name.toLowerCase().trim();
        
        if (activityName.startsWith(',')) {
          activityName = activityName.substring(1).trim();
        }
        
        return normalizedFriendNames.includes(activityName);
      });

      console.log(`[✅ REAL ACTIVITIES] After filtering: ${filteredActivities.length} activities from friends`);

      // Process and enhance the activities data
      const processedActivities: RealFriendActivity[] = filteredActivities.map((activity) => {
        let badgeImageUrl: string | undefined;
        let avatarPreviewUrl: string | undefined;
        let enrichedDescription = activity.activity_description;
        
        try {
          // Parse new_data if it's a string
          const newData = activity.new_data ? 
            (typeof activity.new_data === 'string' ? JSON.parse(activity.new_data) : activity.new_data) 
            : {};
            
          // For badge activities
          if (activity.activity_type === 'badge' && newData.badge_code) {
            badgeImageUrl = `https://images.habbo.com/c_images/album1584/${newData.badge_code}.gif`;
            enrichedDescription = `Conquistou o emblema "${newData.badge_name || newData.badge_code}"`;
          }
          
          // For look changes
          if (activity.activity_type === 'look_change' && newData.figureString) {
            avatarPreviewUrl = `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${newData.figureString}&size=s&direction=2&head_direction=3&action=std`;
            enrichedDescription = `Mudou o visual`;
          }
          
          // For motto changes
          if (activity.activity_type === 'motto_change') {
            enrichedDescription = activity.activity_description || `Mudou seu motto`;
          }
          
          // For status changes (online)
          if (activity.activity_type === 'status_change') {
            enrichedDescription = activity.activity_description || `Está online agora`;
          }
          
        } catch (parseError) {
          console.warn(`[⚠️ REAL ACTIVITIES] Error parsing new_data for activity ${activity.id}:`, parseError);
        }

        return {
          ...activity,
          activity_description: enrichedDescription,
          badgeImageUrl,
          avatarPreviewUrl
        } as RealFriendActivity;
      });

      // Determine next cursor and if there are more pages
      const nextCursor = data && data.length === initialLimit ? data[data.length - 1].created_at : null;
      const hasMore = data && data.length === initialLimit;

      console.log(`[🎯 REAL ACTIVITIES] Page processed: ${processedActivities.length} activities, hasMore: ${hasMore}`);
      
      return { 
        activities: processedActivities, 
        nextCursor, 
        hasMore 
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    enabled: !profileLoading && friendNames.length > 0,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchInterval: 60 * 1000, // 1 minute
  });

  // Flatten all pages into single array
  const activities = data?.pages.flatMap(page => page.activities) ?? [];

  // Activity tracker invocation with debounce
  const debouncedTriggerTracker = useDebounce(() => {
    if (!habboAccount?.habbo_name) return null;
    
    return supabase.functions.invoke('habbo-friends-activity-tracker', {
      body: { 
        username: habboAccount.habbo_name,
        hotel: habboAccount?.hotel || 'br'
      }
    });
  }, 2000);

  const trackerResult = null; // Simplified for now

  return {
    activities,
    isLoading: profileLoading || isLoading,
    fetchNextPage,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    refetch: refetchActivities,
    trackerResult
  };
};
