
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FriendPhoto {
  id: string;
  imageUrl: string;
  date: string;
  likes: number;
  userName: string;
  userUniqueId?: string; // uniqueId do usuário que postou a foto
  userAvatar: string;
  timestamp?: number;
  caption?: string;
  roomName?: string;
  roomId?: string | number; // ID do quarto quando disponível
}

export const useFriendsPhotos = (currentUserName: string, hotel: string = 'br', uniqueId?: string) => {
  // Normalizar hotel: 'ptbr' -> 'br' (o backend espera 'br')
  const normalizedHotel = hotel === 'ptbr' ? 'br' : hotel;
  
  // Validar username: não buscar se estiver vazio ou for "Beebop"
  // IMPORTANTE: Garantir que sempre retorne um boolean
  const isValidUsername = Boolean(
    currentUserName && 
    currentUserName.trim() && 
    currentUserName.toLowerCase() !== 'beebop' &&
    currentUserName.toLowerCase() !== ''
  );
  
  // REMOVIDO: Não precisamos buscar completeProfile aqui
  // A Edge Function 'habbo-optimized-friends-photos' já busca o perfil do usuário
  // e a lista de amigos internamente, então não precisamos dessa dependência
  // Isso evita problemas de carregamento e dependências circulares
  
  return useQuery({
    queryKey: ['friends-photos', currentUserName, normalizedHotel, uniqueId],
    queryFn: async (): Promise<FriendPhoto[]> => {
      if (!isValidUsername) {
        throw new Error('Username is required and must be valid');
      }

      console.log(`[useFriendsPhotos] Buscando fotos para: ${currentUserName} (hotel: ${normalizedHotel})`);

      const { data, error } = await supabase.functions.invoke('habbo-optimized-friends-photos', {
        body: { 
          username: currentUserName, 
          hotel: normalizedHotel,
          limit: 300, // Aumentar limite para buscar mais fotos (a Edge Function processa todos os amigos)
          offset: 0
        }
      });

      if (error) {
        console.error('[useFriendsPhotos] Erro na Edge Function:', error);
        throw new Error(error.message || 'Failed to fetch friends photos');
      }

      if (!data || data.error) {
        console.warn('[useFriendsPhotos] Nenhuma foto retornada:', data?.error || 'Sem dados');
        return [];
      }

      // A função habbo-optimized-friends-photos retorna { photos, hasMore, nextOffset }
      const photos = Array.isArray(data) ? data : (data.photos || []);
      
      console.log(`[✅ FRIENDS PHOTOS] Successfully fetched ${photos.length} photos`);
      
      // Debug: verificar se userUniqueId está presente nas fotos
      if (photos.length > 0) {
        const firstPhoto = photos[0];
        console.log('[useFriendsPhotos] Primeira foto (amostra):', {
          userName: firstPhoto.userName,
          userUniqueId: firstPhoto.userUniqueId,
          hasUserUniqueId: 'userUniqueId' in firstPhoto,
          allKeys: Object.keys(firstPhoto)
        });
      }
      
      if (photos.length === 0) {
        console.warn('[useFriendsPhotos] Nenhuma foto encontrada para os amigos');
        return [];
      }
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
      // Processar todas as fotos
      const validPhotos = photos
        .filter(photo => {
          // Validar apenas dados obrigatórios
          const isValid = photo.imageUrl && photo.userName && (photo.timestamp || photo.date);
          if (!isValid) {
            console.warn('[useFriendsPhotos] Foto inválida ignorada:', photo);
          }
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
          
          // Debug: verificar se userUniqueId está presente
          if (photo.userName === 'Beebop' || photo.userName?.toLowerCase() === 'beebop') {
            console.log('[useFriendsPhotos] Foto do Beebop:', {
              userName: photo.userName,
              userUniqueId: photo.userUniqueId,
              hasUserUniqueId: 'userUniqueId' in photo,
              photoKeys: Object.keys(photo)
            });
          }
          
          return {
            ...photo, // Preservar todos os campos, incluindo userUniqueId
            timestamp: finalTimestamp,
            date: formattedDate,
            caption: photo.caption || '',
            roomName: photo.roomName || '',
            roomId: photo.roomId ? String(photo.roomId) : undefined // Garantir que seja string
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
    // CORRIGIDO: Habilitar apenas se tiver username válido
    // Não depende mais de completeProfile - a Edge Function busca tudo internamente
    enabled: isValidUsername,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    gcTime: 30 * 60 * 1000, // Mantém no cache por 30 minutos
    refetchOnWindowFocus: false, // Não atualiza ao focar
    refetchOnReconnect: false, // Não atualiza ao reconectar
    refetchOnMount: true, // CORRIGIDO: Buscar ao montar para garantir dados atualizados
    retry: 2 // Aumentar retries para melhor confiabilidade
  });
};


