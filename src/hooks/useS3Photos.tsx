
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface S3Photo {
  id: string;
  url: string;
  previewUrl: string;
  caption?: string;
  timestamp: string;
  roomName?: string;
  likesCount?: number;
  type: string;
  source: 's3_discovery';
}

export const useS3Photos = (username?: string, hotel: string = 'com.br') => {
  const { data: s3Photos = [], isLoading, error } = useQuery({
    queryKey: ['s3-photos', username, hotel],
    queryFn: async (): Promise<S3Photo[]> => {
      if (!username) return [];
      
      console.log('[useS3Photos] Fetching S3 photos for:', username, hotel);
      
      const { data, error } = await supabase.functions.invoke('habbo-complete-profile', {
        body: { username: username.trim(), hotel }
      });

      if (error) {
        console.error('[useS3Photos] Error fetching S3 photos:', error);
        throw new Error(error.message || 'Failed to fetch S3 photos');
      }

      if (data?.error) {
        console.error('[useS3Photos] API error:', data.error);
        throw new Error(data.error);
      }

      // Extract photos from complete profile response
      const photos = data?.data?.photos || [];
      console.log('[useS3Photos] Retrieved S3 photos:', photos);

      // Filter and map S3-sourced photos
      const s3Photos: S3Photo[] = photos
        .filter((photo: any) => photo && photo.url && photo.source === 's3_discovery')
        .map((photo: any) => ({
          id: photo.id,
          url: photo.url,
          previewUrl: photo.previewUrl || photo.url,
          caption: photo.caption || `Foto de ${username}`,
          timestamp: photo.timestamp,
          roomName: photo.roomName || 'Quarto do jogo',
          likesCount: photo.likesCount || 0,
          type: photo.type || 'PHOTO',
          source: 's3_discovery' as const
        }));

      console.log('[useS3Photos] Processed S3 photos:', s3Photos.length);
      return s3Photos;
    },
    enabled: !!username,
    staleTime: 10 * 60 * 1000, // 10 minutes - S3 photos don't change frequently
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });

  return { s3Photos, isLoading, error };
};
