
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompleteProfile } from '@/hooks/useCompleteProfile';

interface FriendPhoto {
  id: string;
  imageUrl: string;
  date: string;
  likes: number;
  userName: string;
  userAvatar: string;
}

export const useFriendsPhotos = (currentUserName: string, hotel: string = 'br') => {
  // Get complete profile to access friends list
  const { data: completeProfile } = useCompleteProfile(
    currentUserName,
    hotel === 'br' ? 'com.br' : hotel
  );

  return useQuery({
    queryKey: ['friends-photos', currentUserName, hotel, completeProfile?.data.friends?.length],
    queryFn: async (): Promise<FriendPhoto[]> => {
      if (!currentUserName) return [];

      console.log(`[🔄 FRIENDS PHOTOS] Fetching friends photos for ${currentUserName}`);
      console.log(`[📋 FRIENDS PHOTOS] User has ${completeProfile?.data.friends?.length || 0} friends`);

      // Log some friend names for debugging
      if (completeProfile?.data.friends?.length) {
        console.log(`[👥 FRIENDS PHOTOS] Friends sample:`, 
          completeProfile.data.friends.slice(0, 5).map(f => f.name)
        );
      }

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
        
        // Sort by date descending (most recent first) and validate dates
        const validPhotos = (data as FriendPhoto[]).filter(photo => {
          const isValidDate = photo.date && !isNaN(new Date(photo.date).getTime());
          if (!isValidDate) {
            console.warn(`[⚠️ FRIENDS PHOTOS] Invalid date for photo ${photo.id}: ${photo.date}`);
          }
          return isValidDate;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        console.log(`[📅 FRIENDS PHOTOS] Sorted ${validPhotos.length} photos chronologically`);
        
        return validPhotos;
      } catch (error: any) {
        console.error('[❌ FRIENDS PHOTOS] Fetch failed:', error);
        throw error;
      }
    },
    enabled: !!currentUserName && !!completeProfile?.data.friends?.length,
    staleTime: 3 * 60 * 1000, // 3 minutes (reduced for more frequent updates)
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });
};
