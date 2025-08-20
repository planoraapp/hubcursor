
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedQuery } from './useOptimizedQuery';
import { useDebounce } from './useRateLimit';
import { useCompleteProfile } from './useCompleteProfile';

export interface RealFriendActivity {
  id: string;
  habbo_name: string;
  habbo_id: string;
  hotel: string;
  activity_type: string;
  activity_description: string;
  old_data?: any;
  new_data: any;
  detected_at: string;
  created_at: string;
}

export const useRealFriendsActivities = () => {
  const { habboAccount } = useAuth();

  // Get complete profile to access friends list (synced with other components)
  const { data: completeProfile } = useCompleteProfile(
    habboAccount?.habbo_name || '',
    (habboAccount as any)?.hotel === 'br' ? 'com.br' : (habboAccount as any)?.hotel || 'br'
  );

  // Use completeProfile friends instead of fetching them separately
  const friendNames = completeProfile?.data.friends?.map(f => f.name.toLowerCase()) || [];

  console.log(`🔗 [useRealFriendsActivities] Synced with completeProfile: ${friendNames.length} friends`);
  if (friendNames.length > 0) {
    console.log(`📋 [useRealFriendsActivities] Friends sample:`, friendNames.slice(0, 5));
  }

  // Atividades dos amigos com controle otimizado
  const { 
    data: activitiesData = [], 
    isLoading,
    refetch 
  } = useOptimizedQuery({
    queryKey: ['real-friends-activities', friendNames.join(','), habboAccount?.habbo_name],
    queryFn: async (): Promise<RealFriendActivity[]> => {
      if (friendNames.length === 0) {
        console.log(`⚠️ [useRealFriendsActivities] No friends found, skipping activities fetch`);
        return [];
      }

      console.log(`🔍 [useRealFriendsActivities] Fetching activities for ${friendNames.length} friends`);

      // Enhanced query with case-insensitive matching
      const { data, error } = await supabase
        .from('friends_activities')
        .select('id, habbo_name, habbo_id, hotel, activity_type, activity_description, new_data, detected_at, created_at')
        .or(friendNames.map(name => `habbo_name.ilike.${name}`).join(','))
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('[❌ useRealFriendsActivities] Error fetching friends activities:', error);
        throw error;
      }

      console.log(`✅ [useRealFriendsActivities] Found ${data?.length || 0} activities from database`);
      
      // Additional client-side filtering for better matching
      const filteredData = (data || []).filter(activity => {
        const activityName = activity.habbo_name.toLowerCase();
        const isMatch = friendNames.some(friendName => 
          friendName === activityName || 
          friendName.includes(activityName) || 
          activityName.includes(friendName)
        );
        return isMatch;
      });

      console.log(`🎯 [useRealFriendsActivities] Filtered to ${filteredData.length} matching activities`);
      
      // Transform the data to match RealFriendActivity interface
      return filteredData.map(item => ({
        id: item.id,
        habbo_name: item.habbo_name,
        habbo_id: item.habbo_id || '',
        hotel: item.hotel || 'br',
        activity_type: item.activity_type,
        activity_description: item.activity_description,
        new_data: item.new_data,
        detected_at: item.detected_at,
        created_at: item.created_at
      }));
    },
    enabled: friendNames.length > 0,
    baseRefetchInterval: 5 * 60 * 1000, // 5 minutos
    aggressiveCacheTime: 10 * 60 * 1000, // 10 minutos de cache
    enableRateLimit: true,
    rateLimitConfig: { maxRequests: 20, windowMs: 60 * 1000 }, // 20 requests por minuto
  });

  // Activity tracker com debounce e rate limiting mais rigoroso
  const debouncedTriggerTracker = useDebounce(async () => {
    if (!habboAccount?.habbo_name) return null;

    try {
      const { data, error } = await supabase.functions.invoke('habbo-friends-activity-tracker', {
        body: { 
          username: habboAccount.habbo_name,
          hotel: (habboAccount as any)?.hotel || 'br'
        }
      });

      if (error) {
        console.error('Activity tracker error:', error);
        return null;
      }

      console.log('Activity tracker result:', data);
      return data;
    } catch (error) {
      console.error('Failed to trigger activity tracker:', error);
      return null;
    }
  }, 2000); // 2 seconds debounce

  const { data: trackerResult } = useOptimizedQuery({
    queryKey: ['trigger-activity-tracker', habboAccount?.habbo_name],
    queryFn: debouncedTriggerTracker,
    enabled: !!habboAccount?.habbo_name,
    baseRefetchInterval: 30 * 60 * 1000, // 30 minutos (era 10 minutos)
    aggressiveCacheTime: 60 * 60 * 1000, // 1 hora de cache
    enableRateLimit: true,
    rateLimitConfig: { maxRequests: 5, windowMs: 60 * 1000 }, // Apenas 5 requests por minuto
  });

  return {
    activities: activitiesData,
    isLoading,
    refetch,
    trackerResult
  };
};
