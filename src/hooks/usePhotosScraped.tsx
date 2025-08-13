
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

export const usePhotosScraped = (username?: string, hotel: string = 'br') => {
  const { data: scrapedPhotos = [], isLoading, error } = useQuery({
    queryKey: ['photos-scraped', username, hotel],
    queryFn: async (): Promise<ScrapedPhoto[]> => {
      if (!username) return [];
      
      console.log('[usePhotosScraped] Fetching photos for:', username, hotel);
      
      // First try to get from database
      const { data: dbPhotos, error: dbError } = await supabase
        .from('habbo_photos')
        .select('*')
        .eq('habbo_name', username.trim())
        .eq('hotel', hotel)
        .order('taken_date', { ascending: false });

      if (!dbError && dbPhotos && dbPhotos.length > 0) {
        console.log('[usePhotosScraped] Found photos in database:', dbPhotos.length);
        return dbPhotos.map(photo => ({
          id: photo.id,
          photo_id: photo.photo_id,
          imageUrl: photo.s3_url,
          date: new Date(photo.taken_date || photo.created_at).toLocaleDateString('pt-BR'),
          likes: photo.likes_count || 0,
          timestamp: photo.timestamp_taken,
          roomName: photo.room_name
        }));
      }

      // Fallback to edge function if no photos in database
      console.log('[usePhotosScraped] No photos in database, trying edge function...');
      const { data, error } = await supabase.functions.invoke('habbo-photos-scraper', {
        body: { username: username.trim(), hotel }
      });

      if (error) {
        console.error('[usePhotosScraped] Error fetching photos:', error);
        throw new Error(error.message || 'Failed to fetch photos');
      }

      console.log('[usePhotosScraped] Retrieved photos from edge function:', data);
      return data || [];
    },
    enabled: !!username,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });

  return { scrapedPhotos, isLoading, error };
};
