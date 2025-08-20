
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

      // Create normalized friend names for matching
      const normalizedFriendNames = friendNames.map(name => name.toLowerCase().trim());

      const { data, error } = await supabase
        .from('friends_activities')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .order('created_at', { ascending: false })
        .limit(200); // Get more to filter properly

      if (error) {
        console.error('[❌ REAL ACTIVITIES] Database error:', error);
        throw error;
      }

      console.log(`[📊 REAL ACTIVITIES] Raw query returned ${data?.length || 0} activities`);

      // Client-side filtering for accurate matching with normalization
      const filteredActivities = (data || []).filter(activity => {
        let activityName = activity.habbo_name.toLowerCase().trim();
        
        // Handle names that start with comma
        if (activityName.startsWith(',')) {
          activityName = activityName.substring(1).trim();
        }
        
        const isMatch = normalizedFriendNames.includes(activityName);
        
        if (isMatch) {
          console.log(`[✅ REAL ACTIVITIES] Matched activity from ${activity.habbo_name}`);
        }
        
        return isMatch;
      });

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
            }
            
            // For look changes
            if (activity.activity_type === 'look_change' && newData.new_figure) {
              avatarPreviewUrl = `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${newData.new_figure}&size=s&direction=2&head_direction=3&action=std`;
              enrichedDescription = `Mudou o visual`;
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
