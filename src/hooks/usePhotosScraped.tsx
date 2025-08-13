
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

export const usePhotosScraped = (username?: string) => {
  const { data: scrapedPhotos = [], isLoading, error } = useQuery({
    queryKey: ['photos-scraped', username],
    queryFn: async (): Promise<ScrapedPhoto[]> => {
      if (!username) return [];
      
      console.log('[usePhotosScraped] Fetching scraped photos for:', username);
      
      const { data, error } = await supabase.functions.invoke('habbo-photos-scraper', {
        body: { username: username.trim() }
      });

      if (error) {
        console.error('[usePhotosScraped] Error fetching photos:', error);
        throw new Error(error.message || 'Failed to fetch photos');
      }

      console.log('[usePhotosScraped] Retrieved photos:', data);
      return data || [];
    },
    enabled: !!username,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });

  return { scrapedPhotos, isLoading, error };
};
