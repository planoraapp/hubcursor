
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
  
  // Validar username: não buscar se estiver vazio
  // IMPORTANTE: Garantir que sempre retorne um boolean
  const isValidUsername = Boolean(
    currentUserName && 
    currentUserName.trim() && 
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
      
      if (photos.length === 0) {
        return [];
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


