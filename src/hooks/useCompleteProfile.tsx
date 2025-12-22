
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getUserByName as getUserByNameMultiHotel, getUserById as getUserByIdMultiHotel } from '@/services/habboApiMultiHotel';

export interface CompleteProfileStats {
  level: number;
  levelPercent: number;
  experience: number;
  starGems: number;
  badgesCount: number;
  friendsCount: number;
  groupsCount: number;
  roomsCount: number;
  photosCount: number;
  habboTickerCount: number;
}

export interface CompleteProfileData {
  badges: any[];
  friends: any[];
  groups: any[];
  rooms: any[];
  photos: any[];
  selectedBadges: any[];
}

export interface CompleteProfile {
  uniqueId: string;
  name: string;
  figureString: string;
  motto: string;
  online: boolean;
  lastAccessTime: string;
  memberSince: string;
  profileVisible: boolean;
  stats: CompleteProfileStats;
  data: CompleteProfileData;
  hotelDomain?: string;
  hotelCode?: string;
}

export const useCompleteProfile = (username: string, hotel: string = 'com.br', uniqueId?: string) => {
  // Normalizar username: se for string vazia ou apenas espaços, tratar como inválido
  const normalizedUsername = username?.trim() || '';
  // Query é válida se temos username OU uniqueId
  const isValidUsername = normalizedUsername !== '' || !!uniqueId;
  
  return useQuery({
    queryKey: ['complete-profile', normalizedUsername, hotel, uniqueId],
    queryFn: async (): Promise<CompleteProfile> => {
      if (!normalizedUsername && !uniqueId) throw new Error('Username or uniqueId is required');
      
      try {
        // Se temos uniqueId, usar diretamente (mais confiável)
        let multiUser;
        const preferredDomain = hotel === 'br' ? 'com.br' : hotel;
        
        // Debug: verificar parâmetros recebidos
        console.log('[useCompleteProfile] Parâmetros:', {
          normalizedUsername,
          uniqueId,
          hotel: preferredDomain
        });
        
        // Estratégia: Tentar por username primeiro (mais confiável), depois por uniqueId
        // Isso porque a busca por username geralmente funciona melhor na API do Habbo
        
        if (normalizedUsername && normalizedUsername.toLowerCase() !== 'beebop' && normalizedUsername.trim() !== '') {
          // Prioridade 1: Buscar por username (mais confiável)
          console.log(`[useCompleteProfile] Tentando buscar por username primeiro: ${normalizedUsername}`);
          multiUser = await getUserByNameMultiHotel(normalizedUsername, preferredDomain);
          
          if (multiUser) {
            console.log(`[useCompleteProfile] ✅ Usuário encontrado por username: ${multiUser.name}`);
          }
        }
        
        // Se não encontrou por username e temos uniqueId, tentar por uniqueId
        if (!multiUser && uniqueId) {
          console.log(`[useCompleteProfile] Username não funcionou, tentando por uniqueId: ${uniqueId}`);
          multiUser = await getUserByIdMultiHotel(uniqueId);
          
          if (multiUser) {
            console.log(`[useCompleteProfile] ✅ Usuário encontrado por uniqueId: ${multiUser.name}`);
          } else {
            console.warn(`[useCompleteProfile] ⚠️ UniqueId também não funcionou: ${uniqueId}`);
          }
        }
        
        // Se ainda não encontrou e temos ambos, tentar buscar por username em todos os hotéis
        if (!multiUser && normalizedUsername && normalizedUsername.toLowerCase() !== 'beebop' && normalizedUsername.trim() !== '') {
          console.log(`[useCompleteProfile] Tentando buscar por username em todos os hotéis: ${normalizedUsername}`);
          multiUser = await getUserByNameMultiHotel(normalizedUsername); // Sem preferredDomain para tentar todos
        }

        if (!multiUser) {
          // Se temos uniqueId mas não encontramos, o problema pode ser o formato
          if (uniqueId) {
            throw new Error(`User with uniqueId '${uniqueId}' not found. The API may not accept this format.`);
          }
          const errorUsername = normalizedUsername || 'usuário';
          throw new Error(`User '${errorUsername}' not found`);
        }

        const userData: any = multiUser;
        let hotelDomain = (multiUser as any).hotelDomain || preferredDomain;
        const hotelCode = hotelDomain === 'com.br' ? 'br' : hotelDomain;

        // IMPORTANTE: Usar o uniqueId retornado pela API (não o que temos armazenado)
        // A API pode retornar um formato diferente do que temos no banco
        const resolvedUniqueId = userData.uniqueId;
        
        if (!resolvedUniqueId) {
          throw new Error('UniqueId não encontrado na resposta da API');
        }
        
        console.log(`[useCompleteProfile] Usando uniqueId da API: ${resolvedUniqueId} para buscar dados adicionais`);
        
        // Buscar dados adicionais em paralelo usando o uniqueId retornado pela API
        // Tentar primeiro o endpoint /profile que pode ter dados mais completos
        const [profileResponse, badgesResponse, friendsResponse, groupsResponse, roomsResponse] = await Promise.allSettled([
          // Tentar endpoint /profile primeiro (pode ter dados mais completos)
          fetch(`https://www.habbo.${hotelDomain}/api/public/users/${encodeURIComponent(resolvedUniqueId)}/profile`, {
            headers: { 'Accept': 'application/json', 'User-Agent': 'HabboHub/1.0' }
          }),
          fetch(`https://www.habbo.${hotelDomain}/api/public/users/${encodeURIComponent(resolvedUniqueId)}/badges`, {
            headers: { 'Accept': 'application/json', 'User-Agent': 'HabboHub/1.0' }
          }),
          fetch(`https://www.habbo.${hotelDomain}/api/public/users/${encodeURIComponent(resolvedUniqueId)}/friends`, {
            headers: { 'Accept': 'application/json', 'User-Agent': 'HabboHub/1.0' }
          }),
          fetch(`https://www.habbo.${hotelDomain}/api/public/users/${encodeURIComponent(resolvedUniqueId)}/groups`, {
            headers: { 'Accept': 'application/json', 'User-Agent': 'HabboHub/1.0' }
          }),
          fetch(`https://www.habbo.${hotelDomain}/api/public/users/${encodeURIComponent(resolvedUniqueId)}/rooms`, {
            headers: { 'Accept': 'application/json', 'User-Agent': 'HabboHub/1.0' }
          })
        ]);
        
        // Tentar extrair dados do profile se disponível
        let profileData: any = null;
        if (profileResponse.status === 'fulfilled') {
          const profileRes = profileResponse.value;
          if (profileRes && typeof profileRes === 'object' && 'ok' in profileRes && profileRes.ok) {
            try {
              profileData = await profileRes.json();
              console.log('[useCompleteProfile] ✅ Dados do /profile obtidos');
            } catch (e) {
              console.warn('[useCompleteProfile] Erro ao processar /profile:', e);
            }
          } else {
            console.log('[useCompleteProfile] Endpoint /profile não disponível ou retornou erro');
          }
        }

        // Processar respostas das APIs
        const badges = badgesResponse.status === 'fulfilled' && badgesResponse.value.ok 
          ? await badgesResponse.value.json().catch(() => []) 
          : [];
        let friends = [];
        if (friendsResponse.status === 'fulfilled' && friendsResponse.value.ok) {
          try {
            friends = await friendsResponse.value.json();
            console.log(`[useCompleteProfile] ✅ Friends obtidos: ${friends.length} amigos`);
            if (friends.length > 0) {
              console.log(`[useCompleteProfile] Primeiro amigo:`, friends[0]);
            }
          } catch (e) {
            console.error('[useCompleteProfile] Erro ao processar friends:', e);
            friends = [];
          }
        } else {
          console.warn('[useCompleteProfile] ⚠️ Resposta de friends não foi bem-sucedida:', {
            status: friendsResponse.status,
            ok: friendsResponse.status === 'fulfilled' ? friendsResponse.value.ok : 'N/A'
          });
        }
        const groups = groupsResponse.status === 'fulfilled' && groupsResponse.value.ok
          ? await groupsResponse.value.json().catch(() => []) 
          : [];
        const rooms = roomsResponse.status === 'fulfilled' && roomsResponse.value.ok
          ? await roomsResponse.value.json().catch(() => []) 
          : [];
        
        console.log(`[useCompleteProfile] Dados obtidos:`, {
          badges: badges.length,
          friends: friends.length,
          groups: groups.length,
          rooms: rooms.length,
          hasProfileData: !!profileData
        });

        // Garantir que friends tenha todos os campos necessários
        if (friends.length > 0) {
          friends = friends.map(friend => ({
            ...friend,
            name: friend.name || friend.username || 'Nome não disponível',
            uniqueId: friend.uniqueId || friend.id || '',
            motto: friend.motto || '',
            online: friend.online !== undefined ? friend.online : false,
            figureString: friend.figureString || '',
            profileVisible: friend.profileVisible == null ? true : friend.profileVisible // Default para true se não especificado
          }));
          
          console.log(`[useCompleteProfile] Friends processados:`, {
            total: friends.length,
            sample: friends[0]
          });
        } else {
          console.log('[useCompleteProfile] ⚠️ Nenhum amigo encontrado na resposta da API');
        }

        // Usar dados do /profile se disponível, senão usar dados básicos
        const finalUserData = profileData || userData;
        
        return {
          uniqueId: resolvedUniqueId,
          name: finalUserData.name || userData.name,
          figureString: finalUserData.figureString || userData.figureString,
          motto: finalUserData.motto || userData.motto || '',
          online: finalUserData.online !== undefined ? finalUserData.online : (userData.online || false),
          lastAccessTime: finalUserData.lastAccessTime || userData.lastAccessTime || '',
          memberSince: finalUserData.memberSince || userData.memberSince || '',
          profileVisible: finalUserData.profileVisible !== false && userData.profileVisible !== false,
          stats: {
            level: finalUserData.currentLevel || userData.currentLevel || userData.starGemCount || 0,
            levelPercent: finalUserData.currentLevelCompletePercent || userData.currentLevelCompletePercent || 0,
            experience: finalUserData.totalExperience || userData.totalExperience || 0,
            starGems: finalUserData.starGemCount || userData.starGemCount || 0,
            badgesCount: badges.length || 0,
            friendsCount: friends.length || 0,
            groupsCount: groups.length || 0,
            roomsCount: rooms.length || 0,
            photosCount: 0, // Será preenchido pelo useUnifiedPhotoSystem
            habboTickerCount: 0
          },
          hotelDomain,
          hotelCode,
          data: {
            badges: badges,
            friends: friends,
            groups: groups,
            rooms: rooms,
            photos: [], // Será preenchido pelo useUnifiedPhotoSystem
            selectedBadges: finalUserData.selectedBadges || userData.selectedBadges || []
          }
        };
      } catch (error: any) {
        console.error('❌ [useCompleteProfile] Erro:', error);
        throw new Error(error.message || 'Failed to fetch complete profile');
      }
    },
    enabled: isValidUsername, // Só habilitar se houver username válido ou uniqueId
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

