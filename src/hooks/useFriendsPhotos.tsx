
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
          limit: 50, // Limite inicial de 50 fotos
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
      
      console.log(`[✅ FRIENDS PHOTOS] Successfully fetched ${photos.length} photos (limit 50)`);
      if (photos.length > 0) {
        const first3 = photos.slice(0, 3);
        console.log(`[📸 FRIENDS PHOTOS] First 3 photos from backend:`, first3.map((p, i) => ({
          index: i,
          user: p.userName,
          date: p.date,
          timestamp: p.timestamp,
          timestampDate: p.timestamp ? new Date(p.timestamp).toLocaleString('pt-BR') : 'no timestamp',
          hoursAgo: p.timestamp ? Math.floor((Date.now() - p.timestamp) / (1000 * 60 * 60)) : 'N/A',
          url: p.imageUrl?.substring(0, 80) || 'no url'
        })));
        
        // Verificar a foto mais recente
        const mostRecentPhoto = photos[0];
        const currentDate = new Date();
        const photoDate = mostRecentPhoto.timestamp ? new Date(mostRecentPhoto.timestamp) : new Date();
        const daysDiff = Math.floor((currentDate.getTime() - photoDate.getTime()) / (1000 * 60 * 60 * 24));
        console.log(`[📊 FRIENDS PHOTOS] Most recent photo: ${mostRecentPhoto.userName} - ${mostRecentPhoto.date} (há ${daysDiff} dias)`);
        
        // Ver se as fotos estão ordenadas corretamente
        const timestamps = photos.slice(0, 10).map(p => p.timestamp).filter(Boolean);
        if (timestamps.length > 1) {
          const isDescending = timestamps.every((ts, idx) => idx === 0 || timestamps[idx - 1] >= ts);
          const now = Date.now();
          const hoursAgoList = timestamps.map(ts => Math.floor((now - ts) / (1000 * 60 * 60)));
          console.log(`[📊 FRIENDS PHOTOS] First 10 photos timestamps:`, timestamps.map(ts => new Date(ts).toLocaleString('pt-BR')));
          console.log(`[📊 FRIENDS PHOTOS] Hours ago for first 10:`, hoursAgoList);
          console.log(`[📊 FRIENDS PHOTOS] Are timestamps descending (recent first)? ${isDescending}`);
        }
      }
      // Processar todas as fotos SEM FILTRO DE DATA
      const validPhotos = photos
        .filter(photo => {
          // Validar apenas dados obrigatórios
          const isValid = photo.imageUrl && photo.userName && (photo.timestamp || photo.date);
          return isValid;
        })
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

      // Log das fotos após ordenação
      console.log(`[📊 FRIENDS PHOTOS] Total fetched: ${photos.length}, Showing: ${sortedPhotos.length}`);
      
      if (sortedPhotos.length > 0) {
        const mostRecent = sortedPhotos[0];
        const ageInHours = Math.floor((Date.now() - mostRecent.timestamp) / (1000 * 60 * 60));
        console.log(`[📊 FRIENDS PHOTOS] Most recent: ${mostRecent.userName} - há ${ageInHours}h`);
      }

      return sortedPhotos;
    },
    enabled: !!currentUserName && !profileLoading && !!completeProfile?.data?.friends?.length,
    staleTime: 5 * 60 * 1000, // Cache local por 5 minutos - bem otimizado
    gcTime: 30 * 60 * 1000, // Mantém no cache por 30 minutos
    refetchOnWindowFocus: false, // Não atualiza ao focar
    refetchOnReconnect: false, // Não atualiza ao reconectar
    refetchOnMount: false, // SEMPRE usa cache ao abrir a aba (rápido!)
    retry: 1
  });
};


