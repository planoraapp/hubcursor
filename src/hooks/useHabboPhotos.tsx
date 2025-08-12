import { useQuery } from '@tanstack/react-query';
import { habboProxyService } from '@/services/habboProxyService';

export const useHabboPhotos = (username?: string, hotel: string = 'com.br') => {
  const { data: habboPhotos = [], isLoading, error } = useQuery({
    queryKey: ['habbo-photos', username, hotel],
    queryFn: async () => {
      if (!username) return [] as { id: string; url: string; takenOn?: string }[];
      const photos = await habboProxyService.getUserPhotos(username, hotel);
      return photos;
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000,
  });

  return { habboPhotos, isLoading, error };
};
