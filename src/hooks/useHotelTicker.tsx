
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { habboProxyService, TickerActivity, TickerResponse } from '@/services/habboProxyService';
import { useUnifiedAuth } from './useUnifiedAuth';

interface AggregatedActivity {
  username: string;
  activities: TickerActivity[];
  lastActivityTime: string;
  activityCount: number;
}

export const useHotelTicker = () => {
  const { habboAccount } = useUnifiedAuth();
  
  // Detectar hotel do usuário autenticado
  const hotel = React.useMemo(() => {
    const userHotel = (habboAccount as any)?.hotel as string | undefined;
    if (!userHotel) return 'com.br';
    if (userHotel === 'br') return 'com.br';
    if (userHotel === 'com' || userHotel.includes('.')) return userHotel;
    return 'com.br';
  }, [habboAccount?.hotel]);

  const { 
    data: tickerResponse, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['hotel-ticker', hotel],
    queryFn: () => {
      console.log(`🎯 [useHotelTicker] Fetching ticker for hotel: ${hotel} (detected from user: ${habboAccount?.habbo_name})`);
      return habboProxyService.getHotelTicker(hotel);
    },
    refetchInterval: 30 * 1000, // 30 seconds
    staleTime: 15 * 1000, // 15 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // Extract activities and metadata
  const rawActivities = tickerResponse?.activities || [];
  const metadata = tickerResponse?.meta || {
    source: 'unknown' as const,
    timestamp: new Date().toISOString(),
    hotel: hotel,
    count: 0
  };

  // Aggregate activities by user with improved time window
  const aggregatedActivities: AggregatedActivity[] = React.useMemo(() => {
    console.log(`🔄 [useHotelTicker] Processing ${rawActivities.length} raw activities for aggregation (hotel: ${hotel}, source: ${metadata.source})`);
    
    const groupByUser = (items: TickerActivity[]) => {
      const userGroups: { [username: string]: TickerActivity[] } = {};
      items.forEach(activity => {
        if (!userGroups[activity.username]) userGroups[activity.username] = [];
        userGroups[activity.username].push(activity);
      });
      return Object.entries(userGroups).map(([username, activities]) => ({
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
    };

    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    const recent = rawActivities.filter(a => {
      const t = a.timestamp ? new Date(a.timestamp).getTime() : new Date(a.time).getTime();
      return t >= twoHoursAgo;
    });

    let result = groupByUser(recent);
    
    if (result.length < 5 && rawActivities.length > 0) {
      console.warn('⚠️ [useHotelTicker] Few recent activities, using complete snapshot');
      result = groupByUser(rawActivities).slice(0, 20);
    }

    console.log(`✅ [useHotelTicker] Aggregated into ${result.length} user groups (hotel: ${hotel}, source: ${metadata.source})`);
    return result;
  }, [rawActivities, hotel, metadata.source]);

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
