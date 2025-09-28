
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
}

export const useCompleteProfile = (username: string, hotel: string = 'com.br') => {
  return useQuery({
    queryKey: ['complete-profile', username, hotel],
    queryFn: async (): Promise<CompleteProfile> => {
      if (!username) throw new Error('Username is required');
      
      try {
        // Primeiro, tentar usar a função Supabase
        const { data, error } = await supabase.functions.invoke('habbo-complete-profile', {
          body: { username: username.trim(), hotel }
        });

        if (!error && data) {
          return {
            uniqueId: data.uniqueId,
            name: data.name,
            figureString: data.figureString,
            motto: data.motto,
            online: data.online,
            lastAccessTime: data.lastAccessTime,
            memberSince: data.memberSince,
            profileVisible: data.profileVisible,
            stats: {
              level: data.stats?.level || 0,
              levelPercent: data.stats?.levelPercent || 0,
              experience: 0,
              starGems: data.stats?.level || 0,
              badgesCount: data.stats?.badgesCount || 0,
              friendsCount: data.stats?.friendsCount || 0,
              groupsCount: data.stats?.groupsCount || 0,
              roomsCount: data.stats?.roomsCount || 0,
              photosCount: data.stats?.photosCount || 0,
              habboTickerCount: 0
            },
            data: {
              badges: data.badges || [],
              friends: data.friends || [],
              groups: data.groups || [],
              rooms: data.rooms || [],
              photos: data.photos || [],
              selectedBadges: data.selectedBadges || []
            }
          };
        }

        // Fallback: usar API direta do Habbo
        console.log('🔄 [useCompleteProfile] Fallback para API direta...');
        const hotelDomain = hotel === 'br' ? 'com.br' : hotel;
        
        const userResponse = await fetch(`https://www.habbo.${hotelDomain}/api/public/users?name=${encodeURIComponent(username)}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
          },
        });

        if (!userResponse.ok) {
          throw new Error(`User '${username}' not found`);
        }

        const userData = await userResponse.json();
        const uniqueId = userData.uniqueId;

        console.log('✅ [useCompleteProfile] Dados básicos carregados:', { name: userData.name, uniqueId });

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
        const friends = friendsResponse.status === 'fulfilled' ? await friendsResponse.value.json().catch(() => []) : [];
        const groups = groupsResponse.status === 'fulfilled' ? await groupsResponse.value.json().catch(() => []) : [];
        const rooms = roomsResponse.status === 'fulfilled' ? await roomsResponse.value.json().catch(() => []) : [];

        console.log('✅ [useCompleteProfile] Dados completos carregados via API direta:', {
          badges: badges.length,
          friends: friends.length,
          groups: groups.length,
          rooms: rooms.length
        });

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
