
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
    queryFn: () => habboProxyService.getHotelTicker(hotel),
    refetchInterval: 30 * 1000, // 30 seconds
    staleTime: 15 * 1000, // 15 seconds
  });

  // Aggregate activities by user within 30-minute windows
  const aggregatedActivities: AggregatedActivity[] = React.useMemo(() => {
    const userGroups: { [username: string]: TickerActivity[] } = {};
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;

    // Group activities by username within the last 30 minutes
    rawActivities.forEach(activity => {
      const activityTime = new Date(activity.time).getTime();
      if (activityTime >= thirtyMinutesAgo) {
        if (!userGroups[activity.username]) {
          userGroups[activity.username] = [];
        }
        userGroups[activity.username].push(activity);
      }
    });

    // Convert to aggregated format
    return Object.entries(userGroups).map(([username, activities]) => ({
      username,
      activities: activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()),
      lastActivityTime: activities[0]?.time || '',
      activityCount: activities.length,
    })).sort((a, b) => new Date(b.lastActivityTime).getTime() - new Date(a.lastActivityTime).getTime());
  }, [rawActivities]);

  return {
    activities: rawActivities,
    aggregatedActivities,
    isLoading,
    error,
  };
};
