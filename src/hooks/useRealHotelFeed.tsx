
import { useQuery } from '@tanstack/react-query';
import { habboFeedService, FeedActivity, FeedResponse } from '@/services/habboFeedService';
import { useUnifiedAuth } from './useUnifiedAuth';
import { useMemo, useCallback } from 'react';

export const useRealHotelFeed = (options?: { 
  onlineWithinSeconds?: number;
  mode?: 'official' | 'database' | 'hybrid';
}) => {
  const { habboAccount } = useUnifiedAuth();
  
  const hotel = useMemo(() => {
    const userHotel = (habboAccount as any)?.hotel as string | undefined;
    if (!userHotel) return 'com.br';
    if (userHotel === 'br') return 'com.br';
    if (userHotel === 'com' || userHotel.includes('.')) return userHotel;
    return 'com.br';
  }, [habboAccount?.hotel]);

  // Use official mode by default for live ticker behavior
  const mode = options?.mode || 'official';
  const baseLimit = 50; // Base limit for initial load
  const onlineWithinSeconds = options?.onlineWithinSeconds || 1800; // 30 minutes default

  // Function to discover and sync online users (background operation)
  const discoverOnlineUsers = useCallback(async () => {
    try {
      console.log(`🔍 [useRealHotelFeed] Discovering online users for ${hotel}`);
      await habboFeedService.discoverAndSyncOnlineUsers(hotel, 50);
      console.log(`✅ [useRealHotelFeed] Discovery completed for ${hotel}`);
    } catch (error) {
      console.warn(`⚠️ [useRealHotelFeed] Discovery failed for ${hotel}:`, error);
    }
  }, [hotel]);

  // Fetch real feed data with official community ticker integration
  const { 
    data: feedResponse, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['real-hotel-feed', hotel, mode, onlineWithinSeconds],
    queryFn: async () => {
      console.log(`📡 [useRealHotelFeed] Fetching ${mode} feed for ${hotel}`);
      
      // Background discovery for database warming (but don't wait for it)
      if (mode === 'hybrid' || mode === 'database') {
        discoverOnlineUsers().catch(() => {}); // Silent fail
      }
      
      return habboFeedService.getHotelFeed(
        hotel,
        baseLimit,
        { 
          onlineWithinSeconds,
          mode,
          offsetHours: 0 // Start with most recent
        }
      );
    },
    refetchInterval: mode === 'official' ? 30 * 1000 : 60 * 1000, // More frequent for official
    staleTime: 15 * 1000, // 15 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // Function to load older data (for infinite scroll) - uses increased limit instead of offsetHours for official mode
  const loadMoreData = useCallback(async (page: number) => {
    console.log(`📈 [useRealHotelFeed] Loading more data for page ${page}`);
    
    if (mode === 'official') {
      // For official mode, increase the limit to get more items from the community ticker
      const newLimit = baseLimit * (page + 1); // page 0: 50, page 1: 100, page 2: 150, etc.
      console.log(`📈 [useRealHotelFeed] Official mode: requesting ${newLimit} items total`);
      
      return habboFeedService.getHotelFeed(
        hotel,
        newLimit,
        { 
          onlineWithinSeconds,
          mode,
          offsetHours: 0 // Keep at 0 for official mode
        }
      );
    } else {
      // For database/hybrid mode, use offsetHours as before
      const offsetHours = page * 2; // 0h, 2h, 4h, etc.
      console.log(`📈 [useRealHotelFeed] Database mode: using ${offsetHours}h offset`);
      
      return habboFeedService.getHotelFeed(
        hotel,
        baseLimit,
        { 
          onlineWithinSeconds: onlineWithinSeconds + (offsetHours * 3600),
          mode,
          offsetHours
        }
      );
    }
  }, [hotel, baseLimit, onlineWithinSeconds, mode]);

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
    source: 'official' as const,
    timestamp: new Date().toISOString(),
    count: 0,
    onlineCount: 0
  };

  // Activities are already sorted by lastUpdate in descending order from the Edge Function
  const activitiesSorted = useMemo(() => {
    return feedResponse?.activities || [];
  }, [feedResponse?.activities]);

  // Enhanced refetch that also triggers discovery for hybrid/database modes
  const enhancedRefetch = useCallback(async () => {
    console.log(`🔄 [useRealHotelFeed] Enhanced refetch triggered for ${hotel} (${mode} mode)`);
    
    if (mode === 'hybrid' || mode === 'database') {
      await discoverOnlineUsers();
    }
    
    return refetch();
  }, [discoverOnlineUsers, refetch, hotel, mode]);

  return {
    activities: activitiesSorted,
    aggregatedActivities,
    isLoading,
    error,
    hotel,
    metadata,
    mode,
    refetch: enhancedRefetch,
    discoverOnlineUsers,
    loadMoreData
  };
};

export type { FeedActivity };
