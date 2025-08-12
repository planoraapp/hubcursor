
import { useQuery } from '@tanstack/react-query';
import { habboFeedService, FeedActivity, FeedResponse } from '@/services/habboFeedService';
import { useUnifiedAuth } from './useUnifiedAuth';
import { useMemo } from 'react';

export const useRealHotelFeed = (options?: { onlineWithinSeconds?: number }) => {
  const { habboAccount } = useUnifiedAuth();
  
  const hotel = useMemo(() => {
    const userHotel = (habboAccount as any)?.hotel as string | undefined;
    if (!userHotel) return 'com.br';
    if (userHotel === 'br') return 'com.br';
    if (userHotel === 'com' || userHotel.includes('.')) return userHotel;
    return 'com.br';
  }, [habboAccount?.hotel]);

  // Calculate dynamic limit based on time window to get more data for longer periods
  const dynamicLimit = useMemo(() => {
    const baseLimit = 50;
    const timeWindowMinutes = (options?.onlineWithinSeconds || 1800) / 60;
    // Increase limit for longer time windows (more users might be included)
    return Math.min(200, Math.max(baseLimit, Math.floor(timeWindowMinutes / 30) * 25));
  }, [options?.onlineWithinSeconds]);

  // Fetch real feed data from our Edge Function
  const { 
    data: feedResponse, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['real-hotel-feed', hotel, options?.onlineWithinSeconds ?? null, dynamicLimit],
    queryFn: () => habboFeedService.getHotelFeed(
      hotel,
      dynamicLimit,
      { onlineWithinSeconds: options?.onlineWithinSeconds }
    ),
    refetchInterval: 30 * 1000, // 30 seconds
    staleTime: 15 * 1000, // 15 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // Transform activities for compatibility with existing interfaces
  const aggregatedActivities = useMemo(() => {
    if (!feedResponse?.activities) return [];

    return feedResponse.activities.map(activity => ({
      username: activity.username,
      activities: [
        {
          id: `${activity.username}-${activity.lastUpdate}`,
          habbo_name: activity.username,
          habbo_id: '',
          hotel: hotel,
          activity_type: 'mixed' as const,
          description: activity.description,
          details: {
            counts: activity.counts,
            groups: activity.groups,
            friends: activity.friends,
            badges: activity.badges,
            photos: activity.photos
          },
          snapshot_id: '',
          created_at: activity.lastUpdate
        }
      ],
      lastActivityTime: activity.lastUpdate,
      activityCount: Object.values(activity.counts).filter(v => typeof v === 'number' ? v > 0 : v).length,
    }));
  }, [feedResponse?.activities, hotel]);

  const metadata = feedResponse?.meta || {
    source: 'cached' as const,
    timestamp: new Date().toISOString(),
    count: 0,
    onlineCount: 0
  };

  // Activities are already sorted by lastUpdate in descending order from the Edge Function
  const activitiesSorted = useMemo(() => {
    return feedResponse?.activities || [];
  }, [feedResponse?.activities]);

  return {
    activities: activitiesSorted,
    aggregatedActivities,
    isLoading,
    error,
    hotel,
    metadata,
    refetch
  };
};

export type { FeedActivity };
