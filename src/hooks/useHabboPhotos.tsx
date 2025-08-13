
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EnhancedHabboPhoto {
  id: string;
  url: string;
  caption?: string;
  timestamp?: string;
  roomId?: string;
  roomName?: string;
  takenOn?: string;
  likesCount?: number;
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
      const enhancedPhotos: EnhancedHabboPhoto[] = photos.map((photo: any) => ({
        id: photo.id || String(Math.random()),
        url: photo.url || photo.previewUrl || '',
        caption: photo.caption || photo.description,
        timestamp: photo.timestamp || photo.takenOn,
        roomId: photo.roomId,
        roomName: photo.roomName,
        takenOn: photo.takenOn || photo.timestamp,
        likesCount: photo.likesCount || 0
      })).filter((photo: EnhancedHabboPhoto) => photo.url);

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
