
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getUserByName as getUserByNameMultiHotel } from '@/services/habboApiMultiHotel';

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

export const useCompleteProfile = (username: string, hotel: string = 'com.br') => {
  return useQuery({
    queryKey: ['complete-profile', username, hotel],
    queryFn: async (): Promise<CompleteProfile> => {
      if (!username) throw new Error('Username is required');
      
      try {
        // Normalizar apenas espaços em branco; manter pontuação exatamente como no Habbo
        const cleanedUsername = username.trim();

        // Usar busca global multi-hotel como fonte de verdade,
        // priorizando o hotel informado (se existir)
        const preferredDomain = hotel === 'br' ? 'com.br' : hotel;
        const multiUser = await getUserByNameMultiHotel(cleanedUsername, preferredDomain);

        if (!multiUser) {
          throw new Error(`User '${cleanedUsername}' not found`);
        }

        const userData: any = multiUser;
        let hotelDomain = (multiUser as any).hotelDomain || preferredDomain;
        const hotelCode = hotelDomain === 'com.br' ? 'br' : hotelDomain;

        const uniqueId = userData.uniqueId;
        
        // Buscar dados adicionais em paralelo
        const [badgesResponse, friendsResponse, groupsResponse, roomsResponse] = await Promise.allSettled([
          fetch(`https://www.habbo.${hotelDomain}/api/public/users/${uniqueId}/badges`, {
            headers: { 'Accept': 'application/json' }
          }),
          fetch(`https://www.habbo.${hotelDomain}/api/public/users/${uniqueId}/friends`, {
            headers: { 'Accept': 'application/json' }
          }),
          fetch(`https://www.habbo.${hotelDomain}/api/public/users/${uniqueId}/groups`, {
            headers: { 'Accept': 'application/json' }
          }),
          fetch(`https://www.habbo.${hotelDomain}/api/public/users/${uniqueId}/rooms`, {
            headers: { 'Accept': 'application/json' }
          })
        ]);

        const badges = badgesResponse.status === 'fulfilled' ? await badgesResponse.value.json().catch(() => []) : [];
        let friends = friendsResponse.status === 'fulfilled' ? await friendsResponse.value.json().catch(() => []) : [];
        const groups = groupsResponse.status === 'fulfilled' ? await groupsResponse.value.json().catch(() => []) : [];
        const rooms = roomsResponse.status === 'fulfilled' ? await roomsResponse.value.json().catch(() => []) : [];

        // Garantir que friends tenha profileVisible (a API já retorna isso)
        if (friends.length > 0) {
          friends = friends.map(friend => ({
            ...friend,
            profileVisible: friend.profileVisible == null ? true : friend.profileVisible // Default para true se não especificado
          }));
        }

        return {
          uniqueId: userData.uniqueId,
          name: userData.name,
          figureString: userData.figureString,
          motto: userData.motto || '',
          online: userData.online || false,
          lastAccessTime: userData.lastAccessTime || '',
          memberSince: userData.memberSince || '',
          profileVisible: userData.profileVisible !== false,
          stats: {
            level: userData.starGemCount || userData.currentLevel || 0,
            levelPercent: userData.currentLevelCompletePercent || 0,
            experience: 0,
            starGems: userData.starGemCount || userData.currentLevel || 0,
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
            selectedBadges: userData.selectedBadges || []
          }
        };
      } catch (error: any) {
        console.error('❌ [useCompleteProfile] Erro:', error);
        throw new Error(error.message || 'Failed to fetch complete profile');
      }
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

