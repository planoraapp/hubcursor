
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
}

export const useHabboPhotos = (username?: string, hotel: string = 'com.br') => {
  const { data: habboPhotos = [], isLoading, error } = useQuery({
    queryKey: ['habbo-photos-enhanced', username, hotel],
    queryFn: async (): Promise<EnhancedHabboPhoto[]> => {
      if (!username) return [];
      
      console.log('[useHabboPhotos] Fetching enhanced photos for:', username, hotel);
      
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

      // Extrair fotos dos dados completos do perfil
      const photos = data?.data?.photos || [];
      console.log('[useHabboPhotos] Raw photos data:', photos);

      // Mapear e enriquecer as fotos
      const enhancedPhotos: EnhancedHabboPhoto[] = photos
        .filter((photo: any) => photo && (photo.url || photo.imageUrl))
        .map((photo: any, index: number) => ({
          id: photo.id || photo.photoId || `photo-${username}-${index}`,
          url: photo.url || photo.imageUrl || '',
          previewUrl: photo.previewUrl || photo.thumbnailUrl || photo.url || photo.imageUrl,
          caption: photo.caption || photo.description || '',
          timestamp: photo.timestamp || photo.takenOn || photo.createdAt,
          roomId: photo.roomId,
          roomName: photo.roomName || 'Quarto desconhecido',
          likesCount: photo.likesCount || photo.likes || 0,
          type: photo.type || 'PHOTO'
        }));

      console.log('[useHabboPhotos] Enhanced photos:', enhancedPhotos);
      return enhancedPhotos;
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
  });

  return { habboPhotos, isLoading, error };
};
