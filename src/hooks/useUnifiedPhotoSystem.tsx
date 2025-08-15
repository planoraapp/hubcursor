
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
  source: 'database' | 'scraping';
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
    queryKey: ['unified-photos', username, hotel, forceRefresh],
    queryFn: async (): Promise<UnifiedPhoto[]> => {
      if (!username) {
        console.log('[🔧 UNIFIED PHOTOS] No username provided, returning empty array');
        return [];
      }

      console.log('%c[🚀 UNIFIED PHOTOS] Starting unified photo fetch', 'background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px;');
      console.log('[📋 UNIFIED PHOTOS] Parameters:', {
        username: username.trim(),
        hotel,
        forceRefresh,
        cacheTime,
        timestamp: new Date().toISOString()
      });

      try {
        // Always try the scraper edge function first - it handles caching internally
        console.log('[🌐 UNIFIED PHOTOS] Calling habbo-photos-scraper edge function...');
        
        const { data, error } = await supabase.functions.invoke('habbo-photos-scraper', {
          body: { 
            username: username.trim(), 
            hotel: hotel,
            forceRefresh: forceRefresh
          }
        });

        if (error) {
          console.error('[❌ UNIFIED PHOTOS] Edge function error:', error);
          throw new Error(error.message || 'Failed to fetch photos from scraper');
        }

        console.log('[📥 UNIFIED PHOTOS] Edge function response:', {
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
            source: 'scraping' as const
          }));

          console.log('%c[✅ UNIFIED PHOTOS] Successfully processed photos', 'background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px;');
          console.log('[📊 UNIFIED PHOTOS] Final result:', {
            totalPhotos: unifiedPhotos.length,
            photosWithLikes: unifiedPhotos.filter(p => p.likes > 0).length,
            sources: { scraping: unifiedPhotos.length }
          });

          return unifiedPhotos;
        } else {
          console.warn('[⚠️ UNIFIED PHOTOS] Unexpected data format from scraper');
          return [];
        }

      } catch (error: any) {
        console.error('%c[💥 UNIFIED PHOTOS] Fatal error in unified system', 'background: #F44336; color: white; padding: 4px 8px; border-radius: 4px;');
        console.error('[🔍 UNIFIED PHOTOS] Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack?.split('\n').slice(0, 3)
        });

        // Fallback: try to get from database directly
        console.log('[🛡️ UNIFIED PHOTOS] Attempting database fallback...');
        try {
          const { data: dbPhotos, error: dbError } = await supabase
            .from('habbo_photos')
            .select('*')
            .eq('habbo_name', username.trim())
            .eq('hotel', hotel === 'com.br' ? 'br' : hotel)
            .order('taken_date', { ascending: false });

          if (!dbError && dbPhotos && dbPhotos.length > 0) {
            console.log('[✅ UNIFIED PHOTOS] Database fallback successful');
            return dbPhotos.map(photo => ({
              id: photo.id,
              photo_id: photo.photo_id,
              imageUrl: photo.s3_url,
              date: new Date(photo.taken_date || photo.created_at).toLocaleDateString('pt-BR'),
              likes: photo.likes_count || 0,
              timestamp: photo.timestamp_taken,
              roomName: photo.room_name || 'Quarto do jogo',
              source: 'database' as const
            }));
          }
        } catch (dbError) {
          console.error('[❌ UNIFIED PHOTOS] Database fallback also failed:', dbError);
        }

        return [];
      }
    },
    enabled: !!username,
    staleTime: cacheTime * 60 * 1000, // Convert minutes to milliseconds
    gcTime: (cacheTime + 5) * 60 * 1000, // Keep in memory a bit longer
    retry: 1,
    retryDelay: 2000,
  });

  const refreshPhotos = async (force = false) => {
    console.log('%c[🔄 UNIFIED PHOTOS] Manual refresh triggered', 'background: #FF9800; color: white; padding: 4px 8px; border-radius: 4px;');
    console.log('[📋 UNIFIED PHOTOS] Refresh details:', {
      username,
      hotel,
      force,
      currentPhotoCount: photos.length,
      timestamp: new Date().toISOString()
    });
    
    if (force) {
      // Force refresh by calling the scraper with forceRefresh = true
      try {
        const { data } = await supabase.functions.invoke('habbo-photos-scraper', {
          body: { 
            username: username?.trim(), 
            hotel: hotel,
            forceRefresh: true
          }
        });
        
        // Invalidate and refetch the query
        await refetch();
        
        console.log('[✅ UNIFIED PHOTOS] Force refresh completed');
        return data;
      } catch (error) {
        console.error('[❌ UNIFIED PHOTOS] Force refresh failed:', error);
        throw error;
      }
    } else {
      return refetch();
    }
  };

  return {
    photos,
    isLoading,
    error,
    refetch: refreshPhotos,
    photoCount: photos.length,
    // Utility methods
    getPhotosBySource: (source: 'database' | 'scraping') => 
      photos.filter(photo => photo.source === source),
    getPhotosWithLikes: () => 
      photos.filter(photo => photo.likes > 0),
    getRecentPhotos: (limit = 6) => 
      photos.slice(0, limit)
  };
};
