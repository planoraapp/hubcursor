
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FriendPhoto {
  id: string;
  imageUrl: string;
  date: string;
  likes: number;
  userName: string;
  userAvatar: string;
}

export const useFriendsPhotos = (currentUserName: string, hotel: string = 'br') => {
  return useQuery({
    queryKey: ['friends-photos', currentUserName, hotel],
    queryFn: async (): Promise<FriendPhoto[]> => {
      if (!currentUserName) return [];

      console.log(`[🔄 FRIENDS PHOTOS] Fetching friends photos for ${currentUserName}`);

      try {
        // Chamar edge function para buscar fotos dos amigos
        const { data, error } = await supabase.functions.invoke('habbo-friends-photos', {
          body: { username: currentUserName, hotel }
        });

        if (error) {
          console.error('[❌ FRIENDS PHOTOS] Error:', error);
          throw new Error(error.message || 'Failed to fetch friends photos');
        }

        if (data.error) {
          console.error('[❌ FRIENDS PHOTOS] API Error:', data.error);
          throw new Error(data.error);
        }

        console.log(`[✅ FRIENDS PHOTOS] Successfully fetched ${data.length} photos from friends`);
        
        return data as FriendPhoto[];
      } catch (error: any) {
        console.error('[❌ FRIENDS PHOTOS] Fetch failed:', error);
        throw error;
      }
    },
    enabled: !!currentUserName,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};
