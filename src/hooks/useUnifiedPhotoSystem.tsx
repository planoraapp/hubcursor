
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
  source: 'api';
}

interface UseUnifiedPhotoSystemOptions {
  forceRefresh?: boolean;
  cacheTime?: number; // in minutes
  uniqueId?: string;  // opcional: se já soubermos o uniqueId do usuário
}

export const useUnifiedPhotoSystem = (
  username?: string,
  hotel: string = 'br',
  options: UseUnifiedPhotoSystemOptions = {}
) => {
  const { forceRefresh = false, cacheTime = 5, uniqueId } = options; // Reduzido para 5 minutos

  const { 
    data: photos = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    // Incluir uniqueId na queryKey para refetch correto quando ele chegar
    queryKey: ['unified-photos-api', username, hotel, uniqueId],
    queryFn: async (): Promise<UnifiedPhoto[]> => {
      if (!username) {
                return [];
      }

      try {
        // Usar Edge Function centralizada para buscar todas as fotos do usuário
        const trimmedUsername = username.trim();
        const hotelCode = hotel === 'com.br' ? 'br' : hotel;

        const { data, error } = await supabase.functions.invoke('habbo-photos-scraper', {
          body: {
            username: trimmedUsername,
            hotel: hotelCode,
            forceRefresh,
            uniqueId: uniqueId || undefined,
          },
        });

        if (error) {
          console.error('[🔍 UNIFIED PHOTOS] Edge Function error:', {
            message: (error as any)?.message,
            name: (error as any)?.name,
            status: (error as any)?.status,
          });
          return [];
        }

        const photosData = (data || []) as UnifiedPhoto[];

        if (!Array.isArray(photosData) || photosData.length === 0) {
          return [];
        }

        // Edge function já retorna no formato esperado para UnifiedPhoto
        return photosData.map((photo) => ({
          ...photo,
          source: 'api' as const,
        }));
      } catch (error: any) {
                console.error('[🔍 UNIFIED PHOTOS] Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack?.split('\n').slice(0, 3)
        });

        return [];
      }
    },
    enabled: !!username,
    staleTime: cacheTime * 60 * 1000, // 15 minutos - muito mais tempo para evitar re-fetches
    gcTime: (cacheTime + 5) * 60 * 1000, // 20 minutos - manter em memória por mais tempo
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false, // Desabilitar refetch automático no foco da janela
    refetchOnMount: false, // Desabilitar refetch automático ao montar
  });

  const refreshPhotos = async (force = false) => {
    console.log('[📋 UNIFIED PHOTOS] Refresh details:', {
      username,
      hotel,
      force,
      currentPhotoCount: photos.length,
      timestamp: new Date().toISOString(),
    });

    return refetch();
  };

  return {
    photos,
    isLoading,
    error,
    refetch: refreshPhotos,
    photoCount: photos.length,
    // Utility methods
    getPhotosBySource: (source: 'api') =>
      photos.filter((photo) => photo.source === source),
    getPhotosWithLikes: () => photos.filter((photo) => photo.likes > 0),
    getRecentPhotos: (limit = 6) => photos.slice(0, limit),
  };
};
