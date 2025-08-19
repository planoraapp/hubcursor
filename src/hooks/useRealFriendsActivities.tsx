import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

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

  // Get friends list to filter activities
  const { data: friends = [] } = useQuery({
    queryKey: ['habbo-friends-for-activities', habboAccount?.habbo_name],
    queryFn: async () => {
      if (!habboAccount?.habbo_name) return [];
      
      const hotel = (habboAccount as any)?.hotel || 'br';
      const domain = hotel === 'br' ? 'com.br' : hotel;
      
      try {
        const userResponse = await fetch(`https://www.habbo.${domain}/api/public/users?name=${habboAccount.habbo_name}`);
        if (!userResponse.ok) return [];
        
        const userProfile = await userResponse.json();
        if (!userProfile?.uniqueId) return [];

        const friendsResponse = await fetch(`https://www.habbo.${domain}/api/public/users/${userProfile.uniqueId}/friends`);
        if (!friendsResponse.ok) return [];
        
        const friendsData = await friendsResponse.json();
        return friendsData.map((f: any) => f.name.toLowerCase());
      } catch (error) {
        console.error('Error fetching friends for activities:', error);
        return [];
      }
    },
    enabled: !!habboAccount?.habbo_name,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch real friends activities from database
  const { 
    data: activitiesData = [], 
    isLoading,
    refetch 
  } = useQuery({
    queryKey: ['real-friends-activities', friends],
    queryFn: async (): Promise<RealFriendActivity[]> => {
      if (friends.length === 0) return [];

      console.log(`🔍 [useRealFriendsActivities] Fetching activities for ${friends.length} friends`);

      const { data, error } = await supabase
        .from('friends_activities')
        .select('*')
        .in('habbo_name', friends.map(f => typeof f === 'string' ? f : f.toLowerCase()))
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching friends activities:', error);
        throw error;
      }

      console.log(`✅ [useRealFriendsActivities] Found ${data.length} activities`);
      return data || [];
    },
    enabled: friends.length > 0,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });

  // Trigger activity tracker periodically
  const { data: trackerResult } = useQuery({
    queryKey: ['trigger-activity-tracker', habboAccount?.habbo_name],
    queryFn: async () => {
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
    },
    enabled: !!habboAccount?.habbo_name,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Trigger every 10 minutes
  });

  return {
    activities: activitiesData,
    isLoading,
    refetch,
    trackerResult
  };
};