
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
      
      // Debug: Show unique user names in activities (CORRIGIDO)
      if (data && data.length > 0) {
        const uniqueUsers = [...new Set(data.map(act => act.friend_name))];
        console.log(`[🔍 REAL ACTIVITIES] Unique users in this page (${uniqueUsers.length}):`, uniqueUsers.slice(0, 10));
      }

      // Client-side filtering for accurate matching with normalization (CORRIGIDO)
      const filteredActivities = (data || []).filter(activity => {
        let activityName = activity.friend_name.toLowerCase().trim();
        
        if (activityName.startsWith(',')) {
          activityName = activityName.substring(1).trim();
        }
        
        return normalizedFriendNames.includes(activityName);
      });

      console.log(`[✅ REAL ACTIVITIES] After filtering: ${filteredActivities.length} activities from friends`);

  // ETAPA 2: Deduplicação e Melhoria da Apresentação
  // Convert friends_activities to RealFriendActivity format
  const convertedActivities: RealFriendActivity[] = filteredActivities.map(activity => ({
    id: activity.id,
    habbo_name: activity.friend_name,
    habbo_id: activity.friend_name, // Temporary - will be enhanced later
    hotel: 'br', // Default hotel
    activity_type: activity.activity_type,
    activity_description: `${activity.friend_name} - ${activity.activity_type}`,
    created_at: activity.created_at,
    detected_at: activity.created_at,
    new_data: activity.activity_details
  }));

  // Group and deduplicate activities by user and type within a time window
  const activityGroups = new Map<string, RealFriendActivity[]>();
  
  convertedActivities.forEach((activity) => {
    // Create a key for grouping similar activities
    const timeWindow = Math.floor(new Date(activity.created_at).getTime() / (60 * 1000)); // 1 minute window
    const groupKey = `${activity.habbo_name}-${activity.activity_type}-${timeWindow}`;
    
    if (!activityGroups.has(groupKey)) {
      activityGroups.set(groupKey, []);
    }
    activityGroups.get(groupKey)!.push(activity);
  });

  // Process and enhance the activities data with deduplication
  const processedActivities: RealFriendActivity[] = [];
  
  activityGroups.forEach((activities, groupKey) => {
    // Use the most recent activity from each group
    const latestActivity = activities.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
    
    let badgeImageUrl: string | undefined;
    let avatarPreviewUrl: string | undefined;
    let enrichedDescription = latestActivity.activity_description;
    let combinedData: any = {};
    
    try {
      // Merge all new_data from grouped activities for richer information
      activities.forEach(act => {
        const newData = act.new_data ? 
          (typeof act.new_data === 'string' ? JSON.parse(act.new_data) : act.new_data) 
          : {};
        combinedData = { ...combinedData, ...newData };
      });
      
      // For badge activities - show multiple badges if earned together
      if (latestActivity.activity_type === 'badge' && combinedData.badge_code) {
        badgeImageUrl = `https://images.habbo.com/c_images/album1584/${combinedData.badge_code}.gif`;
        const badgeName = combinedData.badge_name || combinedData.badge_code;
        const badgeCount = activities.length;
        enrichedDescription = badgeCount > 1 
          ? `Conquistou ${badgeCount} emblemas (incluindo "${badgeName}")`
          : `Conquistou o emblema "${badgeName}"`;
      }
      
      // For look changes - use larger avatar for better preview
      if (latestActivity.activity_type === 'look_change' && combinedData.figureString) {
        avatarPreviewUrl = `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${combinedData.figureString}&size=m&direction=2&head_direction=3&action=std`;
        const changeCount = activities.length;
        enrichedDescription = changeCount > 1 
          ? `Fez ${changeCount} mudanças no visual`
          : `Mudou o visual`;
      }
      
      // For motto changes - show the actual motto
      if (latestActivity.activity_type === 'motto_change') {
        const newMotto = combinedData.motto || combinedData.new_motto;
        enrichedDescription = newMotto 
          ? `Mudou seu motto para: "${newMotto}"`
          : `Mudou seu motto`;
      }
      
      // For status changes (online)
      if (latestActivity.activity_type === 'status_change') {
        enrichedDescription = `Está online no hotel`;
      }
      
    } catch (parseError) {
      console.warn(`[⚠️ REAL ACTIVITIES] Error parsing new_data for activity ${latestActivity.id}:`, parseError);
    }

    processedActivities.push({
      ...latestActivity,
      activity_description: enrichedDescription,
      badgeImageUrl,
      avatarPreviewUrl,
      new_data: combinedData // Store merged data
    } as RealFriendActivity);
  });

  // Sort deduplicated activities by time
  processedActivities.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // ETAPA 3: Fix do Scroll Infinito - melhorar lógica de paginação
  const nextCursor = processedActivities.length > 0 ? processedActivities[processedActivities.length - 1].created_at : null;
  const hasMore = data && data.length === initialLimit && processedActivities.length > 0;

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
