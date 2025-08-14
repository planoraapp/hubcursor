
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
      if (!username) return [];
      
      console.log('[usePhotosScraped] ====== FETCHING PHOTOS ======');
      console.log('[usePhotosScraped] Username:', username);
      console.log('[usePhotosScraped] Hotel:', hotel);
      console.log('[usePhotosScraped] Force refresh:', forceRefresh);
      
      // First try to get from database (unless force refresh)
      const { data: dbPhotos, error: dbError } = await supabase
        .from('habbo_photos')
        .select('*')
        .eq('habbo_name', username.trim())
        .eq('hotel', hotel === 'com.br' ? 'br' : hotel) // Database uses 'br' format
        .order('taken_date', { ascending: false });

      console.log('[usePhotosScraped] Database query result:', {
        photosFound: dbPhotos?.length || 0,
        error: dbError,
        forceRefresh
      });

      if (!dbError && dbPhotos && dbPhotos.length > 0 && !forceRefresh) {
        console.log('[usePhotosScraped] Found photos in database:', dbPhotos.length);
        console.log('[usePhotosScraped] Sample photo URLs:', dbPhotos.slice(0, 3).map(p => p.s3_url));
        
        const mappedPhotos = dbPhotos.map(photo => ({
          id: photo.id,
          photo_id: photo.photo_id,
          imageUrl: photo.s3_url,
          date: new Date(photo.taken_date || photo.created_at).toLocaleDateString('pt-BR'),
          likes: photo.likes_count || 0,
          timestamp: photo.timestamp_taken,
          roomName: photo.room_name
        }));
        
        console.log('[usePhotosScraped] Returning mapped photos:', mappedPhotos.length);
        return mappedPhotos;
      }

      // Fallback to edge function if no photos in database or force refresh
      console.log('[usePhotosScraped] Calling edge function...');
      console.log('[usePhotosScraped] Edge function params:', {
        username: username.trim(),
        hotel: hotel,
        forceRefresh
      });
      
      try {
        const { data, error } = await supabase.functions.invoke('habbo-photos-scraper', {
          body: { 
            username: username.trim(), 
            hotel: hotel,
            forceRefresh: forceRefresh
          }
        });

        console.log('[usePhotosScraped] Edge function response:', {
          success: !error,
          error: error,
          photoCount: data?.length || 0,
          dataType: typeof data,
          isArray: Array.isArray(data)
        });

        if (error) {
          console.error('[usePhotosScraped] Edge function error:', error);
          throw new Error(error.message || 'Failed to fetch photos from edge function');
        }

        if (data && Array.isArray(data)) {
          console.log('[usePhotosScraped] Sample scraped URLs:', data.slice(0, 3).map(p => p.imageUrl));
          console.log('[usePhotosScraped] Retrieved photos from edge function:', data.length);
          return data;
        } else {
          console.warn('[usePhotosScraped] Edge function returned unexpected data format:', data);
          return [];
        }
      } catch (edgeError) {
        console.error('[usePhotosScraped] Edge function failed:', edgeError);
        console.error('[usePhotosScraped] Error details:', {
          message: edgeError.message,
          name: edgeError.name,
          stack: edgeError.stack?.split('\n').slice(0, 3)
        });
        
        // Return empty array instead of throwing to prevent UI breaks
        return [];
      }
    },
    enabled: !!username,
    staleTime: forceRefresh ? 0 : 5 * 60 * 1000, // 5 minutes instead of 10
    gcTime: 15 * 60 * 1000, // Keep in memory for 15 minutes
    retry: 1, // Reduce retries to see errors faster
    retryDelay: 2000,
  });

  const refreshPhotos = () => {
    console.log('[usePhotosScraped] Manual refresh triggered for:', username);
    return refetch();
  };

  return { 
    scrapedPhotos, 
    isLoading, 
    error,
    refreshPhotos,
    photoCount: scrapedPhotos.length 
  };
};
