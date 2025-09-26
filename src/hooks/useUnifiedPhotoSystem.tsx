
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UnifiedPhoto {
  id: string;
  photo_id: string;
  imageUrl: string;
  date: string;
  likes: number;
  timestamp?: number;
  roomName?: string;
  source: 'api';
}

interface UseUnifiedPhotoSystemOptions {
  forceRefresh?: boolean;
  cacheTime?: number; // in minutes
}

export const useUnifiedPhotoSystem = (
  username?: string, 
  hotel: string = 'br',
  options: UseUnifiedPhotoSystemOptions = {}
) => {
  const { forceRefresh = false, cacheTime = 5 } = options;

  const { 
    data: photos = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['unified-photos-api', username, hotel, forceRefresh],
    queryFn: async (): Promise<UnifiedPhoto[]> => {
      if (!username) {
                return [];
      }

            console.log('[📋 UNIFIED PHOTOS] Parameters:', {
        username: username.trim(),
        hotel,
        forceRefresh,
        cacheTime,
        timestamp: new Date().toISOString()
      });

      try {
                const { data, error } = await supabase.functions.invoke('habbo-photos-scraper', {
          body: { 
            username: username.trim(), 
            hotel: hotel,
            forceRefresh: forceRefresh
          }
        });

        if (error) {
                    throw new Error(error.message || 'Failed to fetch photos from API');
        }

        console.log('[📥 UNIFIED PHOTOS] API response:', {
          success: !error,
          dataType: typeof data,
          isArray: Array.isArray(data),
          dataLength: Array.isArray(data) ? data.length : 'Not an array',
        });

        if (data && Array.isArray(data)) {
          const unifiedPhotos: UnifiedPhoto[] = data.map(photo => ({
            id: photo.id || photo.photo_id,
            photo_id: photo.photo_id,
            imageUrl: photo.imageUrl,
            date: photo.date,
            likes: photo.likes || 0,
            timestamp: photo.timestamp,
            roomName: photo.roomName || 'Quarto do jogo',
            source: 'api' as const
          }));

                    console.log('[📊 UNIFIED PHOTOS] Final result:', {
            totalPhotos: unifiedPhotos.length,
            photosWithLikes: unifiedPhotos.filter(p => p.likes > 0).length,
            sources: { api: unifiedPhotos.length }
          });

          return unifiedPhotos;
        } else {
                    return [];
        }

      } catch (error: any) {
                console.error('[🔍 UNIFIED PHOTOS] Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack?.split('\n').slice(0, 3)
        });

        return [];
      }
    },
    enabled: !!username,
    staleTime: cacheTime * 60 * 1000, // Short cache time - data is always fresh from API
    gcTime: (cacheTime + 2) * 60 * 1000, // Keep in memory a bit longer
    retry: 2,
    retryDelay: 1000,
  });

  const refreshPhotos = async (force = false) => {
        console.log('[📋 UNIFIED PHOTOS] Refresh details:', {
      username,
      hotel,
      force,
      currentPhotoCount: photos.length,
      timestamp: new Date().toISOString()
    });
    
    return refetch();
  };

  return {
    photos,
    isLoading,
    error,
    refetch: refreshPhotos,
    photoCount: photos.length,
    // Utility methods
    getPhotosBySource: (source: 'api') => 
      photos.filter(photo => photo.source === source),
    getPhotosWithLikes: () => 
      photos.filter(photo => photo.likes > 0),
    getRecentPhotos: (limit = 6) => 
      photos.slice(0, limit)
  };
};
