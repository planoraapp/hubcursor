import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompleteProfile } from './useCompleteProfile';
import { FriendPhoto } from './useFriendsPhotos';

export const useOptimizedFriendsPhotos = (currentUserName: string, hotel: string = 'br') => {
  const queryClient = useQueryClient();
  
  // Get complete profile to access friends list
  const { data: completeProfile, isLoading: profileLoading } = useCompleteProfile(currentUserName, hotel === 'br' ? 'com.br' : hotel);
  
  const query = useQuery({
    queryKey: ['optimized-friends-photos', currentUserName, hotel, completeProfile?.data?.friends?.length],
    queryFn: async (): Promise<FriendPhoto[]> => {
      if (!currentUserName) {
        throw new Error('Username is required');
      }

      if (!completeProfile?.data?.friends?.length) {
        console.log(`[🎯 OPTIMIZED FRIENDS PHOTOS] No friends found for ${currentUserName}`);
        return [];
      }

      console.log(`[🎯 OPTIMIZED FRIENDS PHOTOS] Fetching photos for ${completeProfile.data.friends.length} friends of ${currentUserName}`);
      
      const { data, error } = await supabase.functions.invoke('habbo-friends-photos', {
        body: { username: currentUserName, hotel }
      });

      if (error) {
        console.error('[❌ OPTIMIZED FRIENDS PHOTOS] Error:', error);
        throw new Error(error.message || 'Failed to fetch friends photos');
      }

      if (!data || data.error) {
        console.error('[❌ OPTIMIZED FRIENDS PHOTOS] API Error:', data?.error || 'No data returned');
        return [];
      }

      console.log(`[✅ OPTIMIZED FRIENDS PHOTOS] Successfully fetched ${Array.isArray(data) ? data.length : 0} photos`);
      
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
          // Sort by timestamp (most recent first)
          const timestampA = typeof a.timestamp === 'number' ? a.timestamp : new Date(a.timestamp || a.date).getTime();
          const timestampB = typeof b.timestamp === 'number' ? b.timestamp : new Date(b.timestamp || b.date).getTime();
          
          // Primary sort: by timestamp (most recent first)
          const result = timestampB - timestampA;
          
          // Secondary sort: if timestamps are equal, sort by photo ID
          if (result === 0) {
            return (b.id || '').localeCompare(a.id || '');
          }
          
          return result;
        });

      console.log(`[📊 OPTIMIZED FRIENDS PHOTOS] Filtered to ${validPhotos.length} valid photos, ordered chronologically`);
      
      return validPhotos;
    },
    enabled: !!currentUserName && !profileLoading && !!completeProfile?.data?.friends?.length,
    staleTime: 3 * 60 * 1000, // 3 minutos apenas
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    retry: 1
  });

  // Função de refresh forçado que invalida cache
  const forceRefresh = () => {
    console.log('[🔄 OPTIMIZED FRIENDS PHOTOS] Forcing refresh, invalidating cache');
    queryClient.invalidateQueries({ 
      queryKey: ['optimized-friends-photos', currentUserName, hotel] 
    });
    return query.refetch({ cancelRefetch: true });
  };

  return {
    ...query,
    forceRefresh
  };
};