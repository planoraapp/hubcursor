
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface HotelPhoto {
  id: string;
  imageUrl: string;
  date: string;
  likes: number;
  userName: string;
  userAvatar: string;
}

export const useHotelPhotoFeed = (currentUserName: string, hotel: string = 'br') => {
  return useQuery({
    queryKey: ['hotel-photo-feed', currentUserName, hotel],
    queryFn: async (): Promise<HotelPhoto[]> => {
            try {
        // Call edge function to get mixed feed (friends + random users)
        const { data, error } = await supabase.functions.invoke('habbo-hotel-feed', {
          body: { username: currentUserName, hotel }
        });

        if (error) {
                    throw new Error(error.message || 'Failed to fetch hotel feed');
        }

        if (data.error) {
                    throw new Error(data.error);
        }

                return data as HotelPhoto[];
      } catch (error: any) {
                throw error;
      }
    },
    enabled: !!currentUserName,
    staleTime: 2 * 60 * 1000, // 2 minutes for fresher data
    gcTime: 5 * 60 * 1000, // 5 minutes  
    retry: 3,
    refetchInterval: 60 * 1000, // Auto-refresh every minute
  });
};
