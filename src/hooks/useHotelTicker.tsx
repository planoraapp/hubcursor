
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { habboProxyService, TickerActivity } from '@/services/habboProxyService';

interface AggregatedActivity {
  username: string;
  activities: TickerActivity[];
  lastActivityTime: string;
  activityCount: number;
}

export const useHotelTicker = (hotel: string = 'com.br') => {
  const { 
    data: rawActivities = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['hotel-ticker', hotel],
    queryFn: () => {
      console.log(`🎯 [useHotelTicker] Fetching ticker for hotel: ${hotel}`);
      return habboProxyService.getHotelTicker(hotel);
    },
    refetchInterval: 30 * 1000, // 30 seconds
    staleTime: 15 * 1000, // 15 seconds
  });

  // Aggregate activities by user within 30-minute windows
  const aggregatedActivities: AggregatedActivity[] = React.useMemo(() => {
    console.log(`🔄 [useHotelTicker] Processing ${rawActivities.length} raw activities for aggregation`);
    
    const userGroups: { [username: string]: TickerActivity[] } = {};
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;

    // Group activities by username within the last 30 minutes
    rawActivities.forEach(activity => {
      const activityTime = activity.timestamp ? 
        new Date(activity.timestamp).getTime() : 
        new Date(activity.time).getTime();
        
      if (activityTime >= thirtyMinutesAgo) {
        if (!userGroups[activity.username]) {
          userGroups[activity.username] = [];
        }
        userGroups[activity.username].push(activity);
      }
    });

    // Convert to aggregated format
    const result = Object.entries(userGroups).map(([username, activities]) => ({
      username,
      activities: activities.sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : new Date(a.time).getTime();
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : new Date(b.time).getTime();
        return timeB - timeA;
      }),
      lastActivityTime: activities[0]?.timestamp || activities[0]?.time || '',
      activityCount: activities.length,
    })).sort((a, b) => {
      const timeA = new Date(a.lastActivityTime).getTime();
      const timeB = new Date(b.lastActivityTime).getTime();
      return timeB - timeA;
    });

    console.log(`✅ [useHotelTicker] Aggregated into ${result.length} user groups`);
    return result;
  }, [rawActivities]);

  return {
    activities: rawActivities,
    aggregatedActivities,
    isLoading,
    error,
  };
};
