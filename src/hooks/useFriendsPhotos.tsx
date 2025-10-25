
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
  caption?: string;
  roomName?: string;
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

      const { data, error } = await supabase.functions.invoke('habbo-optimized-friends-photos', {
        body: { 
          username: currentUserName, 
          hotel,
          limit: 300,
          offset: 0
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch friends photos');
      }

      if (!data || data.error) {
        return [];
      }

      // A função habbo-optimized-friends-photos retorna { photos, hasMore, nextOffset }
      const photos = Array.isArray(data) ? data : (data.photos || []);
      
      console.log(`[✅ FRIENDS PHOTOS] Successfully fetched ${photos.length} photos with limit 300`);
      const validPhotos = photos
        .filter(photo => photo.imageUrl && photo.userName && (photo.timestamp || photo.date))
        .map(photo => {
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
            ...photo,
            timestamp: finalTimestamp,
            date: formattedDate,
            caption: photo.caption || '',
            roomName: photo.roomName || ''
          };
        });

      // Sort by timestamp (most recent first) - NEW BEHAVIOR: no diversity algorithm
      const sortedPhotos = validPhotos.sort((a, b) => {
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

      return sortedPhotos;
    },
    enabled: !!currentUserName && !profileLoading && !!completeProfile?.data?.friends?.length,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false, // Disabled automatic polling - now on-demand only
    retry: 1
  });
};


