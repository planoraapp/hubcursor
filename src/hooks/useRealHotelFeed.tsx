
import { useQuery } from '@tanstack/react-query';
import { habboFeedService, FeedActivity, FeedResponse } from '@/services/habboFeedService';
import { useUnifiedAuth } from './useUnifiedAuth';
import { useMemo, useCallback, useEffect, useRef, useState } from 'react';

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
  const mode = options?.mode || 'hybrid';
  const baseLimit = 100; // Base limit for initial load
  const onlineWithinSeconds = options?.onlineWithinSeconds || 1800; // 30 minutes default

  // Function to discover and sync online users (background operation)
  const discoverOnlineUsers = useCallback(async () => {
    try {
      console.log(`🔍 [useRealHotelFeed] Discovering online users for ${hotel}`);
      await habboFeedService.discoverAndSyncOnlineUsers(hotel, 100);
      console.log(`✅ [useRealHotelFeed] Discovery completed for ${hotel}`);
    } catch (error) {
      console.warn(`⚠️ [useRealHotelFeed] Discovery failed for ${hotel}:`, error);
    }
  }, [hotel]);

  // Fetch real feed data with official community ticker integration
  const { 
    data: feedResponse, 
    isLoading, 
    isFetching,
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
    refetchInterval: mode === 'hybrid' ? 5 * 1000 : mode === 'official' ? 10 * 1000 : 60 * 1000, // 5s for hybrid
    staleTime: 15 * 1000, // 15 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // Incremental, flicker-free merge of activities
  const [mergedActivities, setMergedActivities] = useState<Array<FeedActivity & { key: string; isNew?: boolean }>>([]);
  const keysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const incoming = feedResponse?.activities || [];

    // Initial load
    if (mergedActivities.length === 0) {
      const initial = incoming.map((it) => {
        const key = `${it.username}-${it.lastUpdate}`;
        keysRef.current.add(key);
        return { ...it, key, isNew: false } as FeedActivity & { key: string; isNew?: boolean };
      });
      setMergedActivities(initial);
      return;
    }

    // Subsequent updates: prepend only new items and mark asNew
    const newItems: Array<FeedActivity & { key: string; isNew?: boolean }> = [];
    for (const it of incoming) {
      const key = `${it.username}-${it.lastUpdate}`;
      if (!keysRef.current.has(key)) {
        keysRef.current.add(key);
        newItems.push({ ...it, key, isNew: true });
      } else {
        // Optional: update existing item if description changed
      }
    }

    if (newItems.length > 0) {
      setMergedActivities((prev) => {
        const clearedPrev = prev.map((p) => ({ ...p, isNew: false }));
        const updated = [...newItems, ...clearedPrev];
        return updated.slice(0, 200);
      });
    }
  }, [feedResponse?.activities]);

  // Function to load older data with improved pagination strategy
  const loadMoreData = useCallback(async (page: number) => {
    console.log(`📈 [useRealHotelFeed] Loading more data for page ${page}`);
    
    if (page === 0) {
      // Page 0 is always live ticker for official mode
      console.log(`📈 [useRealHotelFeed] Page 0: using live ticker (${mode} mode)`);
      return habboFeedService.getHotelFeed(
        hotel,
        baseLimit,
        { 
          onlineWithinSeconds,
          mode,
          offsetHours: 0
        }
      );
    } else {
      // For page 1 and beyond, switch to hybrid mode for historical data
      console.log(`📈 [useRealHotelFeed] Page ${page}: switching to hybrid mode for historical data`);
      const offsetHours = page * 2; // 2h, 4h, 6h, etc.
      
      return habboFeedService.getHotelFeed(
        hotel,
        baseLimit,
        { 
          onlineWithinSeconds: onlineWithinSeconds + (offsetHours * 3600),
          mode: 'hybrid', // Force hybrid for historical data
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

  // activities are sorted from the edge function already; we maintain order via mergedActivities

  // Enhanced refetch that also triggers discovery for hybrid/database modes
  const enhancedRefetch = useCallback(async () => {
    console.log(`🔄 [useRealHotelFeed] Enhanced refetch triggered for ${hotel} (${mode} mode)`);
    
    if (mode === 'hybrid' || mode === 'database') {
      await discoverOnlineUsers();
    }
    
    return refetch();
  }, [discoverOnlineUsers, refetch, hotel, mode]);

  return {
    activities: mergedActivities,
    aggregatedActivities,
    isLoading,
    isFetching,
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
