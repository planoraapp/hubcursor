
import { useAuth } from './useAuth';
import { useOptimizedQuery } from './useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from './useDebounce';
import { useCompleteProfile } from './useCompleteProfile';

export interface RealFriendActivity {
  id: string;
  habbo_name: string;
  activity_type: string;
  activity_description: string;
  new_data?: any;
  created_at: string;
  detected_at: string;
  badgeImageUrl?: string;
  avatarPreviewUrl?: string;
}

export const useRealFriendsActivities = () => {
  const { habboAccount } = useAuth();
  
  // Get complete profile to access friends list - use same source as useFriendsPhotos
  const { data: completeProfile, isLoading: profileLoading } = useCompleteProfile(
    habboAccount?.habbo_name || '', 
    habboAccount?.hotel === 'br' ? 'com.br' : (habboAccount?.hotel || 'com.br')
  );

  // Extract friend names with proper normalization
  const friendNames = completeProfile?.data?.friends?.map(friend => {
    // Normalize friend names (remove special characters, trim)
    let name = friend.name;
    if (name.startsWith(',')) {
      name = name.substring(1);
    }
    return name.trim();
  }).filter(name => name.length > 0) || [];

  console.log(`[🔍 REAL ACTIVITIES] Friends from completeProfile (${friendNames.length}):`, friendNames);

  // Fetch friends activities with optimized query
  const baseRefetchInterval = 30 * 1000; // 30 segundos
  const aggressiveCacheTime = 2 * 60 * 1000; // 2 minutos

  const activitiesQuery = useOptimizedQuery<RealFriendActivity[]>({
    queryKey: ['friends-activities', friendNames.join(','), completeProfile?.data?.friends?.length],
    queryFn: async (): Promise<RealFriendActivity[]> => {
      if (friendNames.length === 0) {
        console.log(`[🔍 REAL ACTIVITIES] No friends to query activities for`);
        return [];
      }

      console.log(`[🔍 REAL ACTIVITIES] Querying activities for ${friendNames.length} friends:`, friendNames);

      // Extract friend names (case insensitive) - maintain original order
      const normalizedFriendNames = friendNames.map(name => name.toLowerCase().trim());
      
      console.log(`[🔍 REAL ACTIVITIES] Friend names:`, normalizedFriendNames);

      // Query activities from friends only (last 24 hours for performance)
      const { data, error } = await supabase
        .from('friends_activities')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .order('created_at', { ascending: false }) // CRITICAL: Order by timestamp, not alphabetically
        .limit(500); // Increased limit to get more activities

      if (error) {
        console.error('[❌ REAL ACTIVITIES] Database error:', error);
        throw error;
      }

      console.log(`[📊 REAL ACTIVITIES] Raw query returned ${data?.length || 0} activities`);
      
      // Debug: Log database query details
      console.log(`[🔍 REAL ACTIVITIES] Query details:`, {
        table: 'friends_activities',
        timeFilter: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        limit: 500,
        orderBy: 'created_at DESC'
      });
      
      // Debug: Log first few activities to see what we're getting
      if (data && data.length > 0) {
        console.log(`[🔍 REAL ACTIVITIES] Sample activities:`, data.slice(0, 5).map(act => ({
          name: act.habbo_name,
          type: act.activity_type,
          description: act.activity_description,
          created_at: act.created_at,
          new_data: act.new_data ? (typeof act.new_data === 'string' ? JSON.parse(act.new_data) : act.new_data) : null
        })));
        
        // Debug: Show unique user names in activities
        const uniqueUsers = [...new Set(data.map(act => act.habbo_name))];
        console.log(`[🔍 REAL ACTIVITIES] Unique users in database (${uniqueUsers.length}):`, uniqueUsers.slice(0, 20));
      }

      // Client-side filtering for accurate matching with normalization
      const filteredActivities = (data || []).filter(activity => {
        let activityName = activity.habbo_name.toLowerCase().trim();
        
        // Handle names that start with comma or special characters
        if (activityName.startsWith(',')) {
          activityName = activityName.substring(1).trim();
        }
        
        const isMatch = normalizedFriendNames.includes(activityName);
        
        if (isMatch) {
          console.log(`[✅ REAL ACTIVITIES] Matched activity from ${activity.habbo_name}`);
        }
        
        return isMatch;
      })
      // Ensure final sort by timestamp (most recent first) - CRITICAL FOR CHRONOLOGICAL ORDER
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      console.log(`[✅ REAL ACTIVITIES] Filtered to ${filteredActivities.length} activities from friends`);

      // Transform raw data to RealFriendActivity format with enriched descriptions
      const transformedActivities: RealFriendActivity[] = filteredActivities.map(activity => {
        let enrichedDescription = activity.activity_description;
        let badgeImageUrl = '';
        let avatarPreviewUrl = '';
        
        // Process new_data to extract visual information
        if (activity.new_data) {
          try {
            const newData = typeof activity.new_data === 'string' ? JSON.parse(activity.new_data) : activity.new_data;
            
            // For badge activities
            if (activity.activity_type === 'badge' && newData.badge_code) {
              badgeImageUrl = `https://images.habbo.com/c_images/album1584/${newData.badge_code}.gif`;
              enrichedDescription = `Conquistou o emblema "${newData.badge_name || newData.badge_code}"`;
              console.log(`[🏆 REAL ACTIVITIES] Badge activity for ${activity.habbo_name}:`, {
                badge_code: newData.badge_code,
                badge_name: newData.badge_name,
                imageUrl: badgeImageUrl
              });
            }
            
            // For look changes
            if (activity.activity_type === 'look_change' && newData.new_figure) {
              avatarPreviewUrl = `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${newData.new_figure}&size=s&direction=2&head_direction=3&action=std`;
              enrichedDescription = `Mudou o visual`;
              console.log(`[👕 REAL ACTIVITIES] Look change activity for ${activity.habbo_name}:`, {
                new_figure: newData.new_figure,
                avatarUrl: avatarPreviewUrl
              });
            }
            
            // For motto changes
            if (activity.activity_type === 'motto_change' && newData.new_motto) {
              enrichedDescription = `Mudou o lema para "${newData.new_motto}"`;
            }
            
          } catch (error) {
            console.log(`[useRealFriendsActivities] Could not parse new_data for activity ${activity.id}`);
          }
        }
        
        return {
          id: activity.id,
          habbo_name: activity.habbo_name,
          activity_type: activity.activity_type,
          activity_description: enrichedDescription,
          new_data: activity.new_data,
          created_at: activity.created_at,
          detected_at: activity.detected_at,
          badgeImageUrl,
          avatarPreviewUrl
        };
      });

      return transformedActivities;
    },
    enabled: !profileLoading && friendNames.length > 0,
    baseRefetchInterval,
    aggressiveCacheTime,
    enableRateLimit: true,
    rateLimitConfig: { maxRequests: 20, windowMs: 60 * 1000 }
  });

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

  const { data: trackerResult } = useOptimizedQuery({
    queryKey: ['trigger-activity-tracker', habboAccount?.habbo_name],
    queryFn: debouncedTriggerTracker,
    enabled: !!habboAccount?.habbo_name,
    baseRefetchInterval: 30 * 60 * 1000, // 30 minutes
    aggressiveCacheTime: 60 * 60 * 1000, // 1 hour
    enableRateLimit: true,
    rateLimitConfig: { maxRequests: 5, windowMs: 60 * 1000 }
  });

  return {
    activities: activitiesQuery.data || [],
    isLoading: profileLoading || activitiesQuery.isLoading,
    refetch: activitiesQuery.refetch,
    trackerResult
  };
};
