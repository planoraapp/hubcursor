
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
}

export const useUnifiedPhotoSystem = (
  username?: string, 
  hotel: string = 'br',
  options: UseUnifiedPhotoSystemOptions = {}
) => {
  const { forceRefresh = false, cacheTime = 5 } = options; // Reduzido para 5 minutos

  const { 
    data: photos = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['unified-photos-api', username, hotel], // Removido forceRefresh do queryKey
    queryFn: async (): Promise<UnifiedPhoto[]> => {
      if (!username) {
                return [];
      }

            // Logs removidos para evitar flicker

      try {
                const { data, error } = await supabase.functions.invoke('habbo-photos-scraper', {
          body: { 
            username: username.trim(), 
            hotel: hotel,
            forceRefresh: forceRefresh
          }
        });

        if (error) {
                    throw new Error(error.message || 'Failed to fetch photos from API');
        }

        // Logs removidos para evitar flicker

        if (data && Array.isArray(data)) {
          const unifiedPhotos: UnifiedPhoto[] = data.map(photo => {
            // Determinar o timestamp correto
            let finalTimestamp = Date.now();
            
            if (photo.timestamp) {
              finalTimestamp = typeof photo.timestamp === 'number' ? photo.timestamp : new Date(photo.timestamp).getTime();
            } else if (photo.date) {
              // Se não há timestamp, tentar parsear a data
              const parsedDate = new Date(photo.date);
              if (!isNaN(parsedDate.getTime())) {
                finalTimestamp = parsedDate.getTime();
              }
            }
            
            // Formatar a data corretamente
            const formattedDate = new Date(finalTimestamp).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });
            
            return {
              id: photo.id || photo.photo_id,
              photo_id: photo.photo_id,
              imageUrl: photo.imageUrl,
              date: formattedDate,
              likes: photo.likes || 0,
              timestamp: finalTimestamp,
              roomName: photo.roomName || 'Quarto do jogo',
              source: 'api' as const
            };
          });

          // Logs removidos para evitar flicker

          return unifiedPhotos;
        } else {
                    return [];
        }

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
      timestamp: new Date().toISOString()
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
      photos.filter(photo => photo.source === source),
    getPhotosWithLikes: () => 
      photos.filter(photo => photo.likes > 0),
    getRecentPhotos: (limit = 6) => 
      photos.slice(0, limit)
  };
};
