
import { useQuery } from '@tanstack/react-query';
import { habboProxyService } from '@/services/habboProxyService';
import { HabboPhoto } from '@/types/habbo';

export const useUnifiedPhotoSystem = (username?: string, hotel: string = 'com.br', options?: { cacheTime?: number }) => {
  const { data: photos = [], isLoading, error } = useQuery({
    queryKey: ['unified-photos', username, hotel],
    queryFn: () => habboProxyService.getUserPhotos(username!, hotel),
    enabled: !!username,
    staleTime: (options?.cacheTime || 10) * 60 * 1000, // Convert minutes to milliseconds
  });

  const likePhoto = async (photoId: string) => {
    // TODO: Implement like functionality
    console.log('Liking photo:', photoId);
  };

  const openPhotoModal = (photo: HabboPhoto) => {
    // TODO: Implement photo modal
    console.log('Opening photo modal:', photo);
  };

  return {
    photos,
    isLoading,
    error,
    likePhoto,
    openPhotoModal,
  };
};
