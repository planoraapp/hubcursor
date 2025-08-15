
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ScrapedPhoto {
  id: string;
  photo_id: string;
  imageUrl: string;
  date: string;
  likes: number;
  timestamp?: number;
  roomName?: string;
}

export const usePhotosScraped = (username?: string, hotel: string = 'br', forceRefresh: boolean = false) => {
  const { data: scrapedPhotos = [], isLoading, error, refetch } = useQuery({
    queryKey: ['photos-scraped', username, hotel, forceRefresh],
    queryFn: async (): Promise<ScrapedPhoto[]> => {
      if (!username) {
        console.log('[🔍 PHOTOS DEBUG] No username provided, returning empty array');
        return [];
      }
      
      console.log('%c[🚀 PHOTOS DEBUG] ====== STARTING PHOTO FETCH ======', 'background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px;');
      console.log('[📋 PHOTOS DEBUG] Request parameters:', {
        username: username.trim(),
        hotel,
        forceRefresh,
        timestamp: new Date().toISOString()
      });
      
      // First try to get from database (unless force refresh)
      if (!forceRefresh) {
        console.log('[🗄️ PHOTOS DEBUG] Checking database cache first...');
        const dbStartTime = performance.now();
        
        const { data: dbPhotos, error: dbError } = await supabase
          .from('habbo_photos')
          .select('*')
          .eq('habbo_name', username.trim())
          .eq('hotel', hotel === 'com.br' ? 'br' : hotel)
          .order('taken_date', { ascending: false });

        const dbEndTime = performance.now();
        console.log(`[⏱️ PHOTOS DEBUG] Database query took ${(dbEndTime - dbStartTime).toFixed(2)}ms`);
        
        if (dbError) {
          console.error('[❌ PHOTOS DEBUG] Database error:', dbError);
        } else {
          console.log('[📊 PHOTOS DEBUG] Database query result:', {
            photosFound: dbPhotos?.length || 0,
            hasPhotos: dbPhotos && dbPhotos.length > 0,
            sampleUrls: dbPhotos?.slice(0, 3).map(p => ({ url: p.s3_url, date: p.taken_date })) || []
          });
        }

        if (!dbError && dbPhotos && dbPhotos.length > 0) {
          console.log('%c[✅ PHOTOS DEBUG] Using cached photos from database', 'background: #2196F3; color: white; padding: 4px 8px; border-radius: 4px;');
          
          const mappedPhotos = dbPhotos.map(photo => ({
            id: photo.id,
            photo_id: photo.photo_id,
            imageUrl: photo.s3_url,
            date: new Date(photo.taken_date || photo.created_at).toLocaleDateString('pt-BR'),
            likes: photo.likes_count || 0,
            timestamp: photo.timestamp_taken,
            roomName: photo.room_name
          }));
          
          console.log('[📋 PHOTOS DEBUG] Returning mapped cached photos:', {
            totalPhotos: mappedPhotos.length,
            photosWithLikes: mappedPhotos.filter(p => p.likes > 0).length,
            photosWithRoomNames: mappedPhotos.filter(p => p.roomName).length
          });
          
          return mappedPhotos;
        } else {
          console.log('[🔍 PHOTOS DEBUG] No cached photos found or empty result, proceeding to scraping...');
        }
      } else {
        console.log('%c[🔄 PHOTOS DEBUG] Force refresh requested, skipping database cache', 'background: #FF9800; color: white; padding: 4px 8px; border-radius: 4px;');
      }

      // Fallback to edge function scraping
      console.log('[🌐 PHOTOS DEBUG] Calling edge function for scraping...');
      const edgeStartTime = performance.now();
      
      try {
        console.log('[📤 PHOTOS DEBUG] Edge function request payload:', {
          username: username.trim(),
          hotel: hotel,
          forceRefresh: forceRefresh,
          requestTime: new Date().toISOString()
        });
        
        const { data, error } = await supabase.functions.invoke('habbo-photos-scraper', {
          body: { 
            username: username.trim(), 
            hotel: hotel,
            forceRefresh: forceRefresh
          }
        });

        const edgeEndTime = performance.now();
        console.log(`[⏱️ PHOTOS DEBUG] Edge function took ${(edgeEndTime - edgeStartTime).toFixed(2)}ms`);

        if (error) {
          console.error('%c[❌ PHOTOS DEBUG] Edge function error', 'background: #F44336; color: white; padding: 4px 8px; border-radius: 4px;', error);
          console.error('[🔍 PHOTOS DEBUG] Error details:', {
            message: error.message,
            context: error.context || 'No context',
            name: error.name || 'Unknown error type'
          });
          throw new Error(error.message || 'Failed to fetch photos from edge function');
        }

        console.log('[📥 PHOTOS DEBUG] Edge function response:', {
          success: !error,
          dataType: typeof data,
          isArray: Array.isArray(data),
          dataLength: Array.isArray(data) ? data.length : 'Not an array',
          hasData: !!data
        });

        if (data && Array.isArray(data)) {
          console.log('%c[✅ PHOTOS DEBUG] Successfully retrieved photos from scraping', 'background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px;');
          console.log('[📊 PHOTOS DEBUG] Scraped photos analysis:', {
            totalPhotos: data.length,
            samplePhotos: data.slice(0, 3).map(p => ({
              url: p.imageUrl,
              date: p.date,
              likes: p.likes,
              roomName: p.roomName
            })),
            photosWithMetadata: data.filter(p => p.likes || p.roomName).length
          });
          
          return data;
        } else {
          console.warn('[⚠️ PHOTOS DEBUG] Edge function returned unexpected data format:', {
            data,
            type: typeof data,
            isNull: data === null,
            isUndefined: data === undefined
          });
          
          return [];
        }
      } catch (edgeError: any) {
        console.error('%c[💥 PHOTOS DEBUG] Edge function failed catastrophically', 'background: #F44336; color: white; padding: 4px 8px; border-radius: 4px;');
        console.error('[🔍 PHOTOS DEBUG] Catastrophic error details:', {
          message: edgeError.message,
          name: edgeError.name,
          stack: edgeError.stack?.split('\n').slice(0, 5),
          errorType: typeof edgeError
        });
        
        // Return empty array instead of throwing to prevent UI breaks
        console.log('[🛡️ PHOTOS DEBUG] Returning empty array to prevent UI crash');
        return [];
      }
    },
    enabled: !!username,
    staleTime: forceRefresh ? 0 : 2 * 60 * 1000, // Reduced to 2 minutes for better debugging
    gcTime: 10 * 60 * 1000, // Keep in memory for 10 minutes
    retry: 1, // Single retry to see errors faster
    retryDelay: 1500,
    onSuccess: (data) => {
      console.log('%c[🎉 PHOTOS DEBUG] Query completed successfully', 'background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px;');
      console.log('[📈 PHOTOS DEBUG] Final result summary:', {
        photosReturned: data.length,
        cacheStatus: forceRefresh ? 'bypassed' : 'checked',
        timestamp: new Date().toISOString()
      });
    },
    onError: (error) => {
      console.error('%c[💀 PHOTOS DEBUG] Query failed completely', 'background: #F44336; color: white; padding: 4px 8px; border-radius: 4px;');
      console.error('[🔍 PHOTOS DEBUG] Query error:', error);
    }
  });

  const refreshPhotos = () => {
    console.log('%c[🔄 PHOTOS DEBUG] Manual refresh triggered', 'background: #FF9800; color: white; padding: 4px 8px; border-radius: 4px;');
    console.log('[📋 PHOTOS DEBUG] Refresh details:', {
      username,
      hotel,
      currentPhotoCount: scrapedPhotos.length,
      timestamp: new Date().toISOString()
    });
    
    return refetch();
  };

  // Log current state for debugging
  console.log('[📊 PHOTOS DEBUG] Current hook state:', {
    username,
    hotel,
    isLoading,
    hasError: !!error,
    photoCount: scrapedPhotos.length,
    errorMessage: error?.message
  });

  return { 
    scrapedPhotos, 
    isLoading, 
    error,
    refreshPhotos,
    photoCount: scrapedPhotos.length 
  };
};
