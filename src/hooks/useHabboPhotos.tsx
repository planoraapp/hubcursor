
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EnhancedHabboPhoto {
  id: string;
  url: string;
  previewUrl?: string;
  caption?: string;
  timestamp?: string;
  roomId?: string;
  roomName?: string;
  likesCount?: number;
  type?: string;
  source?: 's3_discovery' | 'api' | 'fallback';
}

export const useHabboPhotos = (username?: string, hotel: string = 'com.br') => {
  const { data: habboPhotos = [], isLoading, error } = useQuery({
    queryKey: ['habbo-photos-s3', username, hotel],
    queryFn: async (): Promise<EnhancedHabboPhoto[]> => {
      if (!username) return [];
      
      console.log('[useHabboPhotos] Fetching photos with S3 discovery for:', username, hotel);
      
      const { data, error } = await supabase.functions.invoke('habbo-complete-profile', {
        body: { username: username.trim(), hotel }
      });

      if (error) {
        console.error('[useHabboPhotos] Error fetching photos:', error);
        throw new Error(error.message || 'Failed to fetch photos');
      }

      if (data?.error) {
        console.error('[useHabboPhotos] API error:', data.error);
        throw new Error(data.error);
      }

      // Extract photos from complete profile response
      const photos = data?.data?.photos || [];
      console.log('[useHabboPhotos] Raw photos data:', photos);

      // Map and enhance photos
      const enhancedPhotos: EnhancedHabboPhoto[] = photos
        .filter((photo: any) => photo && (photo.url || photo.imageUrl))
        .map((photo: any, index: number) => ({
          id: photo.id || `photo-${username}-${index}`,
          url: photo.url || photo.imageUrl || '',
          previewUrl: photo.previewUrl || photo.thumbnailUrl || photo.url || photo.imageUrl,
          caption: photo.caption || photo.description || `Foto de ${username}`,
          timestamp: photo.timestamp || photo.takenOn || photo.createdAt,
          roomId: photo.roomId,
          roomName: photo.roomName || 'Quarto desconhecido',
          likesCount: photo.likesCount || photo.likes || 0,
          type: photo.type || 'PHOTO',
          source: photo.source || 'api'
        }))
        .sort((a, b) => {
          // Sort by timestamp, newest first
          const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return timeB - timeA;
        });

      console.log('[useHabboPhotos] Enhanced photos:', enhancedPhotos.length);
      return enhancedPhotos;
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
  });

  return { habboPhotos, isLoading, error };
};
