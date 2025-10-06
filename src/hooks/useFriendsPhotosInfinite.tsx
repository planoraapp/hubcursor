import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompleteProfile } from './useCompleteProfile';
import { formatHabboTimestamp } from '@/utils/timestampUtils';

export interface FriendPhoto {
  id: string;
  photo_id: string;
  imageUrl: string;
  date: string;
  likes: number;
  userName: string;
  userAvatar: string;
  timestamp: number;
  caption?: string;
  roomName?: string;
}

interface FriendsPhotosResponse {
  photos: FriendPhoto[];
  hasMore: boolean;
  nextOffset: number;
}

interface CacheData {
  pages: FriendPhoto[][];
  nextOffset: number;
  updatedAt: number;
}

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const getCacheKey = (username: string, hotel: string): string => {
  return `friends-feed:${username}:${hotel}`;
};

const getCachedData = (username: string, hotel: string): CacheData | null => {
  try {
    const key = getCacheKey(username, hotel);
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const data: CacheData = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid
    if (now - data.updatedAt > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
};

const setCachedData = (username: string, hotel: string, data: CacheData): void => {
  try {
    const key = getCacheKey(username, hotel);
    const updatedData: CacheData = {
      ...data,
      updatedAt: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(updatedData));
  } catch (error) {
    console.error('Error writing cache:', error);
  }
};

const clearCache = (username: string, hotel: string): void => {
  try {
    const key = getCacheKey(username, hotel);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

export const useFriendsPhotosInfinite = (
  currentUserName: string, 
  hotel: string = 'br',
  enabled: boolean = true // NOVO: Parâmetro para controlar se deve carregar
) => {
  // Get complete profile to access friends list - OTIMIZADO
  const { data: completeProfile, isLoading: profileLoading } = useCompleteProfile(
    currentUserName, 
    hotel === 'br' ? 'com.br' : hotel,
    enabled // Só carrega se enabled for true
  );

  const queryResult = useInfiniteQuery({
    queryKey: ['friends-photos-infinite', currentUserName, hotel, completeProfile?.data?.friends?.length],
    queryFn: async ({ pageParam = 0 }): Promise<FriendsPhotosResponse> => {
      if (!currentUserName) {
        throw new Error('Username is required');
      }

      if (!completeProfile?.data?.friends?.length) {
        return { photos: [], hasMore: false, nextOffset: 0 };
      }

      const { data, error } = await supabase.functions.invoke('habbo-optimized-friends-photos', {
        body: { 
          username: currentUserName, 
          hotel,
          limit: 50,
          offset: pageParam
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch friends photos');
      }

      if (!data || data.error) {
        return { photos: [], hasMore: false, nextOffset: 0 };
      }// Process and format photos
      const photos: FriendPhoto[] = (data.photos || [])
        .filter(photo => photo.imageUrl && photo.userName && photo.timestamp)
        .map(photo => ({
          ...photo,
          date: formatHabboTimestamp(photo.timestamp),
          timestamp: photo.timestamp || Date.now()
        }));

      return {
        photos,
        hasMore: data.hasMore || false,
        nextOffset: data.nextOffset || 0
      };
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextOffset : undefined;
    },
    initialPageParam: 0,
    enabled: enabled && !!currentUserName && !profileLoading, // OTIMIZADO: só executa se enabled for true
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
    // Hydrate from cache on mount - OTIMIZADO
    initialData: () => {
      if (!enabled) return undefined; // Não carrega cache se não está habilitado
      
      const cached = getCachedData(currentUserName, hotel);
      if (cached && cached.pages.length > 0) {
        // Check if cached data is too old (more than 24 hours)
        const now = Date.now();
        const cacheAge = now - cached.updatedAt;
        const maxCacheAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (cacheAge > maxCacheAge) {clearCache(currentUserName, hotel);
          return undefined;
        }
        
        // Check if cached photos are too old (more than 7 days)
        const hasOldPhotos = cached.pages.some(page => 
          page.some(photo => {
            const photoAge = now - photo.timestamp;
            return photoAge > 7 * 24 * 60 * 60 * 1000; // 7 days
          })
        );
        
        if (hasOldPhotos) {clearCache(currentUserName, hotel);
          return undefined;
        }
        
        return {
          pages: cached.pages,
          pageParams: Array.from({ length: cached.pages.length }, (_, i) => i * 50)
        };
      }
      return undefined;
    }
  });

  // Update cache when new data arrives - OTIMIZADO
  React.useEffect(() => {
    if (!enabled) return; // Só atualiza cache se habilitado
    
    if (queryResult.data?.pages) {
      const cacheData: CacheData = {
        pages: queryResult.data.pages,
        nextOffset: queryResult.data.pageParams[queryResult.data.pageParams.length - 1] || 0,
        updatedAt: Date.now()
      };
      setCachedData(currentUserName, hotel, cacheData);
    }
  }, [queryResult.data, currentUserName, hotel, enabled]);

  // Flatten and deduplicate photos across all pages
  const allPhotos = React.useMemo(() => {
    if (!queryResult.data?.pages) return [];

    const seen = new Set<string>();
    const photos: FriendPhoto[] = [];

    // Process pages in order and deduplicate by photo_id
    for (const page of queryResult.data.pages) {
      for (const photo of page) {
        if (!seen.has(photo.photo_id || photo.id)) {
          seen.add(photo.photo_id || photo.id);
          photos.push(photo);
        }
      }
    }

    // Sort by timestamp descending (most recent first)
    return photos.sort((a, b) => b.timestamp - a.timestamp);
  }, [queryResult.data?.pages]);

  const clearCacheAndRefetch = React.useCallback(() => {
    clearCache(currentUserName, hotel);
    queryResult.refetch();
  }, [currentUserName, hotel, queryResult]);

  return {
    photos: allPhotos,
    isLoading: queryResult.isLoading || profileLoading,
    error: queryResult.error,
    fetchNextPage: queryResult.fetchNextPage,
    hasNextPage: queryResult.hasNextPage,
    isFetchingNextPage: queryResult.isFetchingNextPage,
    refetch: queryResult.refetch,
    clearCache: clearCacheAndRefetch
  };
};
