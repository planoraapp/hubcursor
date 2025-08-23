
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
        console.log(`[🎯 FRIENDS PHOTOS] No friends found for ${currentUserName}`);
        return [];
      }

      console.log(`[🎯 FRIENDS PHOTOS] Fetching photos for ${completeProfile.data.friends.length} friends of ${currentUserName}`);
      
      const { data, error } = await supabase.functions.invoke('habbo-friends-photos', {
        body: { username: currentUserName, hotel }
      });

      if (error) {
        console.error('[❌ FRIENDS PHOTOS] Error:', error);
        throw new Error(error.message || 'Failed to fetch friends photos');
      }

      if (!data || data.error) {
        console.error('[❌ FRIENDS PHOTOS] API Error:', data?.error || 'No data returned');
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

      console.log(`[📊 FRIENDS PHOTOS] Filtered to ${validPhotos.length} valid photos, ordered chronologically`);
      
      return validPhotos;
    },
    enabled: !!currentUserName && !profileLoading && !!completeProfile?.data?.friends?.length,
    staleTime: 10 * 1000, // 10 seconds - Much fresher data
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    refetchInterval: 30 * 1000, // 30 seconds auto refresh - Very frequent updates
  });
};
