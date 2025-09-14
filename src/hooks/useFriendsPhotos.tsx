
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompleteProfile } from './useCompleteProfile';

export interface FriendPhoto {
  id: string;
  imageUrl: string;
  date: string;
  likes: number;
  userName: string;
  userAvatar: string;
  timestamp?: number;
}

export const useFriendsPhotos = (currentUserName: string, hotel: string = 'br') => {
  // Get complete profile to access friends list
  const { data: completeProfile, isLoading: profileLoading } = useCompleteProfile(currentUserName, hotel === 'br' ? 'com.br' : hotel);
  
  return useQuery({
    queryKey: ['friends-photos', currentUserName, hotel, completeProfile?.data?.friends?.length],
    queryFn: async (): Promise<FriendPhoto[]> => {
      if (!currentUserName) {
        throw new Error('Username is required');
      }

      if (!completeProfile?.data?.friends?.length) {
                return [];
      }

            const { data, error } = await supabase.functions.invoke('habbo-friends-photos', {
        body: { username: currentUserName, hotel }
      });

      if (error) {
                throw new Error(error.message || 'Failed to fetch friends photos');
      }

      if (!data || data.error) {
                return [];
      }

      console.log(`[✅ FRIENDS PHOTOS] Successfully fetched ${Array.isArray(data) ? data.length : 0} photos`);
      
      // Filter and sort photos chronologically (most recent first)
      const photos = Array.isArray(data) ? data : [];
      const validPhotos = photos
        .filter(photo => photo.imageUrl && photo.userName && photo.timestamp)
        .map(photo => ({
          ...photo,
          timestamp: photo.timestamp || Date.now(),
          date: photo.timestamp ? new Date(photo.timestamp).toLocaleDateString('pt-BR') : 'Data inválida'
        }))
        .sort((a, b) => {
          // Sort by timestamp (most recent first) with better logic
          const timestampA = typeof a.timestamp === 'number' ? a.timestamp : new Date(a.timestamp || a.date).getTime();
          const timestampB = typeof b.timestamp === 'number' ? b.timestamp : new Date(b.timestamp || b.date).getTime();
          
          // Primary sort: by timestamp (most recent first)
          const result = timestampB - timestampA;
          
          // Secondary sort: if timestamps are equal, sort by photo ID (more recent IDs usually come later)
          if (result === 0) {
            return (b.id || '').localeCompare(a.id || '');
          }
          
          return result;
        });

            return validPhotos;
    },
    enabled: !!currentUserName && !profileLoading && !!completeProfile?.data?.friends?.length,
    staleTime: 5 * 60 * 1000, // Reduzido para 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
    refetchOnWindowFocus: false, // Disabled automatic refresh
    refetchOnReconnect: false, // Disabled automatic refresh
    refetchInterval: false, // Disabled automatic polling - now on-demand only
    retry: 1
  });
};
