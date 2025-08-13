
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HabboPhotoEnhanced {
  id: string;
  photo_id: string;
  habbo_name: string;
  habbo_id: string;
  hotel: string;
  s3_url: string;
  preview_url?: string;
  internal_user_id?: string;
  timestamp_taken?: number;
  caption?: string;
  room_name?: string;
  taken_date?: string;
  likes_count: number;
  photo_type: string;
  source: string;
  created_at: string;
  updated_at: string;
}

export const useHabboPhotosEnhanced = (username?: string, hotel: string = 'br') => {
  const { data: habboPhotos = [], isLoading, error } = useQuery({
    queryKey: ['habbo-photos-enhanced', username, hotel],
    queryFn: async (): Promise<HabboPhotoEnhanced[]> => {
      if (!username) return [];
      
      console.log('[useHabboPhotosEnhanced] Fetching photos from database for:', username, hotel);
      
      const { data, error } = await supabase
        .from('habbo_photos')
        .select('*')
        .eq('habbo_name', username.trim())
        .eq('hotel', hotel)
        .order('taken_date', { ascending: false });

      if (error) {
        console.error('[useHabboPhotosEnhanced] Error fetching photos:', error);
        throw new Error(error.message || 'Failed to fetch photos');
      }

      console.log(`[useHabboPhotosEnhanced] Found ${data?.length || 0} photos for ${username}`);
      
      return data || [];
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
  });

  return { habboPhotos, isLoading, error };
};
