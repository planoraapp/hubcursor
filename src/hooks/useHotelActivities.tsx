
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from './useUnifiedAuth';
import { useMemo } from 'react';

export interface HabboActivity {
  id: string;
  habbo_name: string;
  habbo_id: string;
  hotel: string;
  activity_type: 'motto_change' | 'avatar_update' | 'new_badge' | 'new_photo' | 'new_friend' | 'status_change' | 'user_tracked';
  description: string;
  details: any;
  snapshot_id: string;
  created_at: string;
}

export interface AggregatedActivity {
  username: string;
  activities: HabboActivity[];
  lastActivityTime: string;
  activityCount: number;
}

export const useHotelActivities = () => {
  const { habboAccount } = useUnifiedAuth();
  
  const hotel = useMemo(() => {
    const userHotel = (habboAccount as any)?.hotel as string | undefined;
    if (!userHotel) return 'com.br';
    if (userHotel === 'br') return 'com.br';
    if (userHotel === 'com' || userHotel.includes('.')) return userHotel;
    return 'com.br';
  }, [habboAccount?.hotel]);

  // Fetch recent activities from our database
  const { 
    data: rawActivities = [], 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['hotel-activities', hotel],
    queryFn: async (): Promise<HabboActivity[]> => {
      console.log(`🎯 [useHotelActivities] Fetching activities for hotel: ${hotel}`);
      
      const { data, error } = await supabase
        .from('habbo_activities')
        .select('*')
        .eq('hotel', hotel)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('❌ [useHotelActivities] Error fetching activities:', error);
        throw error;
      }

      console.log(`✅ [useHotelActivities] Fetched ${data.length} activities for ${hotel}`);
      return data as HabboActivity[];
    },
    refetchInterval: 30 * 1000, // 30 seconds
    staleTime: 15 * 1000, // 15 seconds
    retry: 3,
  });

  // Aggregate activities by user
  const aggregatedActivities: AggregatedActivity[] = useMemo(() => {
    console.log(`🔄 [useHotelActivities] Processing ${rawActivities.length} activities for aggregation`);
    
    if (rawActivities.length === 0) {
      return [];
    }
    
    // Group activities by user within the last 2 hours
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    const recentActivities = rawActivities.filter(activity => {
      const activityTime = new Date(activity.created_at).getTime();
      return activityTime >= twoHoursAgo;
    });

    const userGroups: { [username: string]: HabboActivity[] } = {};
    recentActivities.forEach(activity => {
      if (!userGroups[activity.habbo_name]) {
        userGroups[activity.habbo_name] = [];
      }
      userGroups[activity.habbo_name].push(activity);
    });

    const result = Object.entries(userGroups).map(([username, activities]) => ({
      username,
      activities: activities.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
      lastActivityTime: activities[0]?.created_at || '',
      activityCount: activities.length,
    })).sort((a, b) => 
      new Date(b.lastActivityTime).getTime() - new Date(a.lastActivityTime).getTime()
    );

    console.log(`✅ [useHotelActivities] Aggregated into ${result.length} user groups`);
    return result;
  }, [rawActivities]);

  const metadata = {
    source: rawActivities.length > 0 ? 'live' as const : 'empty' as const,
    timestamp: new Date().toISOString(),
    hotel: hotel,
    count: rawActivities.length
  };

  return {
    activities: rawActivities,
    aggregatedActivities,
    isLoading,
    error,
    hotel,
    metadata,
    refetch
  };
};
